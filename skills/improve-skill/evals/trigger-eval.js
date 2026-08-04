export const meta = {
  name: 'skill-trigger-eval',
  description: 'Trigger-accuracy harness for a skill listing: over a labeled query set, a judge decides invoke-or-not per query, repeated for a trigger rate. Compares listing variants — description alone vs description + when_to_use — to quantify what cross-tool consumers lose when they drop when_to_use. Query sets parameterizable via args.skills.',
  phases: [
    { title: 'Decide', detail: 'judge invoke-or-not per query × variant × rep' },
  ],
}

// USAGE (run from the repo root via the Workflow tool):
//   Workflow({ scriptPath: ".../trigger-eval.js", args: { skills: [ ... ] } })   // descOnly vs descPlusWtu
//   Workflow({ scriptPath: ".../trigger-eval.js", args: { skills: [ {name, description, when_to_use, queries: [{q, should, wtuOnly}]} ], reps: 3 } })
//
// WHAT IT MEASURES — the discriminating power of a skill's LISTING text (name + description [+ when_to_use]):
//   does it fire on the queries it should, and stay quiet on the near-misses it should not?
//   The default run compares two variants of the SAME skill:
//     - descOnly    = what the open agentskills.io spec exposes (Cursor, Codex, Gemini CLI, OpenCode, ... see only this)
//     - descPlusWtu = what Claude Code exposes (description + when_to_use, joined by " - ")
//   Recall on the `wtuOnly` should-trigger queries IS the cross-tool portability loss for a portable (applied) skill:
//   if descPlusWtu catches them and descOnly misses them, the when_to_use is load-bearing and must fold into description.
//
// VALIDITY CAVEATS (verified 2026-06-17 against Claude Code v2.1.179 — re-check when the CLI changes):
// 1. PROXY, not a live invocation. The judge reasons about the listing entry and one query; it does not run a real
//    session with the skill installed. `evals/invocation-eval.js` is the live ground truth for that (drives a real
//    `claude -p` and watches whether the skill fires). This scores the DESCRIPTION's discriminating power — the thing
//    you actually edit — one step removed from a live trigger; prefer it for cheap relative A/B, the live run for a
//    verdict that must hold (the proxy can read full recall where the real model just handles the prompt inline).
// 2. SINGLE-SKILL binary. The judge sees one candidate, not the full competing listing, so inter-skill competition
//    (two skills fighting for one query) is out of scope; add distractor entries to the prompt to test that later.
// 3. Judge family == generator family. Treat large variant gaps as signal and hairline gaps as noise; reps smooth
//    variance but cannot remove a blind spot the judge shares with the model under test.
//
// Returns { reps, perSkill: [{ name, variants, portabilityLoss, perQuery }] }.

let _args = args
if (typeof _args === 'string') { try { _args = JSON.parse(_args) } catch (_e) { _args = undefined } }

// The subject is always supplied. A built-in default would freeze one skill's frontmatter at the date
// it was copied, and it rots into a measurement of a listing nobody ships any more.
//
// args.skills: [{
//   name, description, when_to_use?,
//   queries: [
//     { q: 'a prompt the listing should fire on',            should: true  },
//     { q: 'a prompt only when_to_use covers',               should: true, wtuOnly: true },
//     { q: 'a near-miss that shares words but needs something else', should: false },
//   ],
// }]
//
// Mark a query wtuOnly when only `when_to_use` covers it: that is what sizes the cross-tool loss,
// since the open spec drops the field and descOnly should miss exactly those.
if (!_args || !Array.isArray(_args.skills) || !_args.skills.length) {
  throw new Error('trigger-eval: args.skills is required — [{ name, description, when_to_use?, queries: [{ q, should, wtuOnly? }] }]')
}
const SKILLS = _args.skills
const REPS = (_args && Number.isInteger(_args.reps) && _args.reps > 0) ? _args.reps : 3

const VARIANTS = [
  { key: 'descOnly', listing: (s) => `name: ${s.name}\ndescription: ${s.description}` },
  { key: 'descPlusWtu', listing: (s) => `name: ${s.name}\ndescription: ${s.description}${s.when_to_use ? ' - ' + s.when_to_use : ''}` },
]

const DECISION = {
  type: 'object', additionalProperties: false,
  required: ['wouldInvoke', 'confidence', 'reason'],
  properties: {
    wouldInvoke: { type: 'boolean' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    reason: { type: 'string' },
  },
}

const judgePrompt = (s, v, q) =>
  `You are an AI coding agent at the start of a session, deciding which skill (if any) to load for the user's message. You see only each skill's listing entry — its name and description. You load a skill when the user's message is genuinely the kind of work that skill is for AND substantial enough to benefit from its guidance; you handle trivial one-step requests directly and load nothing. A keyword match is not enough — if the message really needs a different tool, do not load this one. Other tools and skills exist to cover what this one does not.

THE SKILL'S LISTING ENTRY:
${v.listing(s)}

THE USER'S MESSAGE:
"${q}"

Would you load THIS skill for THIS message? Judge only from the listing entry above; return your decision, a 0-1 confidence, and a one-sentence reason.`

phase('Decide')
log(`trigger-eval: ${SKILLS.length} skill(s), ${VARIANTS.length} variants, ${REPS} reps each. ${SKILLS.map(s => `${s.name}(${s.queries.length}q)`).join(', ')}`)

const jobs = []
for (const s of SKILLS)
  for (const v of VARIANTS)
    for (let qi = 0; qi < s.queries.length; qi++)
      for (let r = 0; r < REPS; r++)
        jobs.push({ skill: s.name, variant: v.key, qi, rep: r, s, v })

const decided = (await parallel(jobs.map(j => () =>
  agent(judgePrompt(j.s, j.v, j.s.queries[j.qi].q), { label: `${j.skill}:${j.variant}:q${j.qi}:r${j.rep}`, phase: 'Decide', schema: DECISION })
    .then(d => (d ? { skill: j.skill, variant: j.variant, qi: j.qi, d } : null))
))).filter(Boolean)

// index: skill -> variant -> qi -> [decisions]
const idx = {}
for (const x of decided) {
  ((idx[x.skill] ||= {})[x.variant] ||= {})[x.qi] ||= []
  idx[x.skill][x.variant][x.qi].push(x.d)
}

const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
const r2 = (x) => +x.toFixed(2)

const perSkill = SKILLS.map((s) => {
  // fireRate[variant][qi] = fraction of reps that said wouldInvoke
  const fireRate = {}
  for (const v of VARIANTS) {
    fireRate[v.key] = s.queries.map((_, qi) => {
      const ds = (idx[s.name]?.[v.key]?.[qi]) || []
      return ds.length ? mean(ds.map(d => d.wouldInvoke ? 1 : 0)) : null
    })
  }
  const fired = (rate) => rate != null && rate >= 0.5  // majority of reps

  const variants = {}
  for (const v of VARIANTS) {
    const rate = fireRate[v.key]
    const idxsShould = s.queries.map((q, i) => [q, i]).filter(([q]) => q.should).map(([, i]) => i)
    const idxsWtu = s.queries.map((q, i) => [q, i]).filter(([q]) => q.should && q.wtuOnly).map(([, i]) => i)
    const idxsBoth = s.queries.map((q, i) => [q, i]).filter(([q]) => q.should && !q.wtuOnly).map(([, i]) => i)
    const idxsNeg = s.queries.map((q, i) => [q, i]).filter(([q]) => !q.should).map(([, i]) => i)
    const correct = s.queries.filter((q, i) => q.should ? fired(rate[i]) : !fired(rate[i])).length
    variants[v.key] = {
      recallAll: r2(mean(idxsShould.map(i => fired(rate[i]) ? 1 : 0))),
      recallDescCovered: r2(mean(idxsBoth.map(i => fired(rate[i]) ? 1 : 0))),
      recallWtuOnly: r2(mean(idxsWtu.map(i => fired(rate[i]) ? 1 : 0))),
      specificity: r2(mean(idxsNeg.map(i => !fired(rate[i]) ? 1 : 0))),
      accuracy: r2(correct / s.queries.length),
    }
  }

  const lift = r2(variants.descPlusWtu.recallWtuOnly - variants.descOnly.recallWtuOnly)
  const portabilityLoss = {
    recallWtuOnly_descOnly: variants.descOnly.recallWtuOnly,
    recallWtuOnly_descPlusWtu: variants.descPlusWtu.recallWtuOnly,
    lift,
    verdict: lift >= 0.25
      ? 'when_to_use is load-bearing — Cursor/Codex (descOnly) drop triggers the field uniquely carries; fold into description'
      : (variants.descOnly.recallWtuOnly >= 0.75
        ? 'description already covers these triggers — fold optional, no measured cross-tool loss'
        : 'inconclusive — both variants weak on wtuOnly queries; the description needs work regardless of the field'),
  }

  const perQuery = s.queries.map((q, i) => ({
    q: q.q,
    should: q.should,
    wtuOnly: !!q.wtuOnly,
    descOnly: fireRate.descOnly[i],
    descPlusWtu: fireRate.descPlusWtu[i],
  }))

  return { name: s.name, variants, portabilityLoss, perQuery }
})

for (const r of perSkill) log(`${r.name}: wtuOnly recall descOnly=${r.portabilityLoss.recallWtuOnly_descOnly} vs descPlusWtu=${r.portabilityLoss.recallWtuOnly_descPlusWtu} (lift ${r.portabilityLoss.lift})`)

return { reps: REPS, perSkill }
