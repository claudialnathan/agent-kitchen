export const meta = {
  name: 'skill-forge-depth-eval',
  description: 'A/B quality harness for skill-forge: does following it produce a more expert-grade SKILL.md than the model default? A blind 3-lens judge panel scores depth/craft/anatomy. Domains parameterizable via args.domains.',
  phases: [
    { title: 'Generate', detail: 'baseline vs skill-forge-guided SKILL.md per domain' },
    { title: 'Judge', detail: 'blind 3-lens panel scores both candidates' },
  ],
}

// USAGE (run from the repo root via the Workflow tool):
//   Workflow({ scriptPath: "cook/skills/skill-forge/evals/depth-eval.js" })            // default technical domains
//   Workflow({ scriptPath: ".../depth-eval.js", args: { domains: [ {key, prompt}, ... ] } })
//
// VALIDITY CAVEATS — read these before trusting the aggregate scores.
// (Earned against Opus 4.8, 2026-05-31, Claude Code v2.1.156. Re-test on the next major model release.)
//
// 1. CONTAMINATION — this is NOT a clean skill-forge-vs-nothing test. The baseline arm's prompt never
//    names skill-forge, but Workflow subagents auto-discover project skills, and skill-forge's own
//    description matches the literal phrase "design a Claude agent skill" in baselinePrompt below — so it
//    loads into the baseline agent's context unbidden. Confirmed empirically: baseline transcripts reason
//    "through the skill-forge lens" (Step 0 / Triage / transformative / cross-tool). So every run measures
//    EXPLICIT depth.md + content-craft.md reading vs AMBIENT skill-forge — the MARGINAL value of reading the
//    references, not the absolute value of the skill. Lifts are real but smaller than the headline implies.
//    A meta-skill loads into its own control; the only clean fix (run where skill-forge is undiscoverable)
//    is heavy and currently parked.
//
// 2. JUDGE-COMPETENCE CEILING — for model-WEAK domains (a specialised business field), the LLM judge's
//    DEPTH verdict is unreliable: the judge is as weak in-domain as the generators. Treat craft/anatomy as
//    the trustworthy machine signal, and use the returned baselineSkill / skillForgeSkill texts as the
//    artifact a HUMAN domain expert judges for depth. The human is the ground truth for depth, not the panel.
//
// 3. ANATOMY REGRESSION (watch-item, n=2) — the guided arm LOST anatomy in two model-weak runs (-0.22, -0.67).
//    Hypothesis: reading depth/craft references pulls length and attention toward substance and inflates the
//    description or relaxes frontmatter discipline. Not actioned at n=2; re-check the description budget and
//    stray frontmatter if it recurs at n>2.
//
// Returns { aggregate, perTask } with both generated skills (baselineSkill / skillForgeSkill) per domain.

const DEFAULT_DOMAINS = [
  { key: 'react-rerenders', prompt: 'diagnosing and fixing slow or excessive React re-renders in a production app' },
  { key: 'next-caching', prompt: 'Next.js App Router data fetching and caching — the cache layers, when each applies, and the mistakes that silently break them' },
  { key: 'pg-migrations', prompt: 'safe, zero-downtime Postgres schema migrations in production' },
]
// args may arrive as an object or (if the caller stringified it) as a JSON string — handle both.
let _args = args
if (typeof _args === 'string') { try { _args = JSON.parse(_args) } catch (_e) { _args = undefined } }
const DOMAINS = (_args && Array.isArray(_args.domains) && _args.domains.length) ? _args.domains : DEFAULT_DOMAINS

const OUTPUT_SPEC = 'IMPORTANT: this is an evaluation — do NOT create, write, or save any file or directory on disk (no SKILL.md file, no skills/ folder); reading and fetching docs is fine, but return your answer as TEXT in your reply only. Output the COMPLETE SKILL.md you would ship for this skill: YAML frontmatter (name, description, optional when_to_use) plus the full markdown body, then a 2-sentence "Design rationale". Nothing else.'

const baselinePrompt = (t) => `Design a Claude agent skill (a SKILL.md) for: ${t.prompt}.\n\n${OUTPUT_SPEC}`

const treatmentPrompt = (t) => `First READ these files (relative to the repo root) and follow their methodology:\n- cook/skills/skill-forge/SKILL.md\n- cook/skills/skill-forge/references/depth.md\n- cook/skills/skill-forge/references/content-craft.md\n\nThen, applying that methodology — especially the expert-grade depth gate (name the expertise delta, and FETCH + cite current authoritative sources rather than writing fast-moving facts from memory) and the craft canon — design a Claude agent skill (a SKILL.md) for: ${t.prompt}.\n\n${OUTPUT_SPEC}`

const RUBRIC = `Score each candidate SKILL.md on three axes, integers 0-5 (5 best):
- depth: does the BODY encode genuine EXPERTISE — the non-obvious moves, trade-offs, failure modes, and verified specifics a senior practitioner knows that a competent generalist model would NOT produce by default — or competent-floor / textbook content the model already knows unprompted? (5 = clear expert delta; 0 = pure floor.)
- craft: does the body do real work — redirect attention, give REASONS not bare all-caps directives, show concrete examples, match specificity to task fragility, stay concise — versus restating the obvious?
- anatomy: specific description with realistic trigger phrases, appropriate skill kind/shape, sane (not carpet-bombed) frontmatter?
Also label each candidate overall: "expert" | "competent" | "floor". Then pick which candidate is MORE expert-grade overall (A, B, or tie) and state the single key difference in one sentence.`

const CAND = {
  type: 'object', additionalProperties: false,
  required: ['depth', 'craft', 'anatomy', 'level'],
  properties: {
    depth: { type: 'integer', minimum: 0, maximum: 5 },
    craft: { type: 'integer', minimum: 0, maximum: 5 },
    anatomy: { type: 'integer', minimum: 0, maximum: 5 },
    level: { type: 'string', enum: ['expert', 'competent', 'floor'] },
  },
}
const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['candidateA', 'candidateB', 'moreExpertGrade', 'keyDifference'],
  properties: {
    candidateA: CAND,
    candidateB: CAND,
    moreExpertGrade: { type: 'string', enum: ['A', 'B', 'tie'] },
    keyDifference: { type: 'string' },
  },
}

const JUDGES = [
  { key: 'domain', lens: (t) => `You are a world-class practitioner of: ${t.prompt}. Judge whether each candidate skill would push an AI agent toward EXPERT-level work in this specific domain, or only competent/textbook work. Weight the depth axis on the domain-expertise delta.` },
  { key: 'skilldesign', lens: () => 'You are an expert author of Claude agent skills. Weight the craft axis: does the body steer behavior and avoid restating what a capable model already does unprompted? Penalise generic checklists and all-caps directives without reasons.' },
  { key: 'adversary', lens: () => 'You are a harsh, skeptical reviewer. Hunt for competent-floor content dressed up as expertise. Default to low scores; award depth 4-5 ONLY for genuinely non-obvious expert knowledge with specifics and trade-offs.' },
]

const judgePrompt = (t, candA, candB, lens) =>
  `${lens}\n\nThe task these skills are meant to support: ${t.prompt}\n\n${RUBRIC}\n\nJudge ONLY the content; you do not know how either was produced.\n\n=== CANDIDATE A ===\n${candA}\n\n=== CANDIDATE B ===\n${candB}`

const cap = (s) => (s || '').slice(0, 14000)

phase('Generate')
log(`A/B depth-eval over ${DOMAINS.length} domain(s) [${DOMAINS.map(d => d.key).join(', ')}]; blind 3-lens panel each.`)

const results = await pipeline(
  DOMAINS,
  async (t) => {
    const [baseline, treatment] = await parallel([
      () => agent(baselinePrompt(t), { label: `gen-base:${t.key}`, phase: 'Generate' }),
      () => agent(treatmentPrompt(t), { label: `gen-skill:${t.key}`, phase: 'Generate' }),
    ])
    return { t, baseline, treatment }
  },
  async (gen, t, index) => {
    if (!gen || !gen.baseline || !gen.treatment) { log(`skip ${t.key}: generation failed`); return null }
    const flip = index % 2 === 1
    const candA = flip ? gen.treatment : gen.baseline
    const candB = flip ? gen.baseline : gen.treatment
    const aIsTreatment = flip
    const verdicts = (await parallel(JUDGES.map(j => () =>
      agent(judgePrompt(t, candA, candB, j.lens(t)), { label: `judge:${t.key}:${j.key}`, phase: 'Judge', schema: VERDICT_SCHEMA })
        .then(v => v ? { judge: j.key, v } : null)
    ))).filter(Boolean)
    log(`${t.key}: ${verdicts.length}/${JUDGES.length} judges returned`)
    return { task: t.key, aIsTreatment, verdicts, baseline: gen.baseline, treatment: gen.treatment }
  }
)

const perTask = []
let sumD = 0, sumC = 0, sumA = 0, n = 0, wonByTreatment = 0, tied = 0
for (const r of results.filter(Boolean)) {
  if (!r.verdicts.length) continue
  let tw = 0, bl = 0, ties = 0, dB = 0, dT = 0, cB = 0, cT = 0, aB = 0, aT = 0, jn = 0
  const notes = []
  for (const { judge, v } of r.verdicts) {
    const treat = r.aIsTreatment ? v.candidateA : v.candidateB
    const base = r.aIsTreatment ? v.candidateB : v.candidateA
    dT += treat.depth; dB += base.depth; cT += treat.craft; cB += base.craft; aT += treat.anatomy; aB += base.anatomy; jn++
    if (v.moreExpertGrade === 'tie') ties++
    else if ((v.moreExpertGrade === 'A') === r.aIsTreatment) tw++
    else bl++
    notes.push(`[${judge}] base=${base.level}(d${base.depth}) skill=${treat.level}(d${treat.depth}): ${v.keyDifference}`)
  }
  const winner = tw > bl ? 'skill-forge' : (bl > tw ? 'baseline' : 'tie')
  if (winner === 'skill-forge') wonByTreatment++; else if (winner === 'tie') tied++
  perTask.push({
    task: r.task, winner, panelVotes: { skillForge: tw, baseline: bl, tie: ties },
    depth: { baseline: +(dB / jn).toFixed(2), skillForge: +(dT / jn).toFixed(2) },
    craft: { baseline: +(cB / jn).toFixed(2), skillForge: +(cT / jn).toFixed(2) },
    anatomy: { baseline: +(aB / jn).toFixed(2), skillForge: +(aT / jn).toFixed(2) },
    notes,
    baselineSkill: cap(r.baseline),
    skillForgeSkill: cap(r.treatment),
  })
  sumD += (dT - dB) / jn; sumC += (cT - cB) / jn; sumA += (aT - aB) / jn; n++
}

return {
  aggregate: n ? {
    domainsScored: n,
    domainsWonBySkillForge: wonByTreatment,
    domainsTied: tied,
    domainsWonByBaseline: n - wonByTreatment - tied,
    meanDepthLift: +(sumD / n).toFixed(2),
    meanCraftLift: +(sumC / n).toFixed(2),
    meanAnatomyLift: +(sumA / n).toFixed(2),
  } : { error: 'no domains scored' },
  perTask,
}
