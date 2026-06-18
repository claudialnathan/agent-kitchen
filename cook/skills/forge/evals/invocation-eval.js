#!/usr/bin/env node
// forge-invocation-eval — LIVE trigger ground truth.
//
// <!-- Earned against: Opus 4.8, 2026-06-18, v2.1.177 — history: CHANGELOG.md -->
//
// Installs the REAL skill in a throwaway project, drives an actual `claude -p` session per
// query, and reports whether the model invoked the skill ON ITS OWN — the genuine trigger
// decision, not a guess about it. This is the ground-truth counterpart to evals/trigger-eval.js
// (a text-only proxy: a judge reasons about the listing). Use the proxy for cheap relative A/B;
// use this when a real fire/no-fire verdict has to be trusted.
//
// HOW IT DIFFERS FROM skill-creator's run_eval.py (the prior art this realizes):
//   - It loads the ACTUAL SKILL.md (real name + description, optionally a swapped description),
//     not a synthesized command-file stub — so the artifact under test is the one that ships.
//   - It detects the candidate by exact `input.skill`, so a *different* skill firing in the same
//     session reads as a non-fire for the candidate (real competing-listing realism, on by design).
//
// RUN IT WITH node — NOT the Workflow tool. It shells out to the `claude` CLI and writes temp
// files; the Workflow sandbox has neither subprocess nor filesystem. (depth-eval.js and
// trigger-eval.js are the opposite — those ARE Workflow scripts.)
//
//   node cook/skills/forge/evals/invocation-eval.js                 # default: saltintesta, real model
//   node .../invocation-eval.js --skill serve/skills/flavored-md    # any skill dir (must hold SKILL.md)
//   node .../invocation-eval.js --skill <dir> --description alt.txt  # A/B a rewritten description, live
//   node .../invocation-eval.js --reps 3 --concurrency 4 --model claude-opus-4-8 --json
//   node .../invocation-eval.js --dry-run                           # print the plan + cost shape, spawn nothing
//
// VALIDITY CAVEATS (earned against Opus 4.8, 2026-06-18, Claude Code v2.1.177 — re-test on the next major model release):
// 1. REAL ENVIRONMENT, not a clean room. The candidate competes against the cwd's project skills,
//    your user-scope (~/.claude/skills) skills, and enabled plugins — auth is tied to the real
//    config dir, so a separate isolated config would not be logged in. This is realism, not noise
//    (it answers "does it fire in MY setup"), but it is not reproducible across machines. Run from a
//    minimal repo for the least competition; the printed init line names the competing listing.
// 2. MODEL MATTERS. Small models under-invoke skills (Haiku 4.5 declined a strongly-matching query in
//    testing); the default is your configured model — the one you actually ship against. Pass --model
//    to pin one. A no-fire on a weak model is a model fact, not a description fact.
// 3. SKILLS UNDER-TRIGGER ON TRIVIAL PROMPTS by design — Claude handles one-step asks itself. Queries
//    must be substantial and realistically worded, or recall reads low for reasons the listing can't fix.
// 4. COST IS REAL — each query x rep is a live turn (most expensive of the three harnesses). A FIRE is
//    killed the instant the Skill call is seen (before the skill body even loads), so positives are cheap;
//    a NO-FIRE runs until the turn ends (the model answers inline), so it costs a full short answer. The
//    --timeout caps the worst case. Opt-in only.

const { spawn } = require('child_process')
const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')

// ---- args -------------------------------------------------------------------
const argv = process.argv.slice(2)
const opt = (flag, def) => { const i = argv.indexOf(flag); return i >= 0 && argv[i + 1] ? argv[i + 1] : def }
const has = (flag) => argv.includes(flag)

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..') // evals/ -> forge/ -> skills/ -> cook/ -> root
const skillArg = opt('--skill', path.join('serve', 'skills', 'saltintesta'))
const SKILL_DIR = path.isAbsolute(skillArg) ? skillArg : path.resolve(REPO_ROOT, skillArg)
const DESC_FILE = opt('--description', null)
const REPS = Math.max(1, parseInt(opt('--reps', '3'), 10) || 3)
const CONCURRENCY = Math.max(1, parseInt(opt('--concurrency', '4'), 10) || 4)
const TIMEOUT_MS = (Math.max(5, parseInt(opt('--timeout', '90'), 10) || 90)) * 1000
const MODEL = opt('--model', null) // null => the CLI's configured default model
const THRESHOLD = parseFloat(opt('--threshold', '0.5')) || 0.5
const AS_JSON = has('--json')
const DRY_RUN = has('--dry-run')

// ---- default subject: saltintesta, the SAME query set trigger-eval.js uses ------------------
// Sharing the query set lets you read the live verdict here directly against the proxy's verdict there.
const DEFAULT_QUERIES = [
  { q: `write a blog post about why we moved off Kubernetes`, should: true },
  { q: `draft a short essay on the value of boredom`, should: true },
  { q: `write something on our Q2 hiring philosophy for the company newsletter`, should: true },
  { q: `write the opening for my conference talk on observability`, should: true },
  { q: `tighten this writing, it's far too wordy: "In order to be able to..."`, should: true },
  { q: `this draft reads like it was written by an AI — make it less AI-sounding`, should: true },
  { q: `rewrite the intro paragraph of our README so it reads less like marketing fluff`, should: true },
  { q: `edit this ADR's summary section to be clearer and more concise`, should: true },
  { q: `write a Python function to strip whitespace from these strings`, should: false },
  { q: `write a commit message for this diff`, should: false },
  { q: `summarize this 40-page PDF into bullet points`, should: false },
  { q: `fix the grammar and typos in this sentence`, should: false },
]

const QUERIES = (() => {
  const f = opt('--queries', null)
  if (!f) return DEFAULT_QUERIES
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  return Array.isArray(j) ? j : j.queries
})()

// ---- read the skill name (and validate the dir) -----------------------------
function readSkill(dir) {
  const md = path.join(dir, 'SKILL.md')
  if (!fs.existsSync(md)) { console.error(`No SKILL.md at ${dir}`); process.exit(1) }
  const text = fs.readFileSync(md, 'utf8')
  const fm = text.match(/^---\n([\s\S]*?)\n---/)
  const nameLine = fm && fm[1].match(/^name:\s*(.+)$/m)
  const name = nameLine ? nameLine[1].trim() : path.basename(dir)
  return { name, text, md }
}
const SKILL = readSkill(SKILL_DIR)

// ---- build a throwaway project that holds ONLY the candidate ----------------
// Optionally swap the description (live A/B of a rewrite) without touching the source.
function makeTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-inv-'))
  const dest = path.join(root, '.claude', 'skills', SKILL.name)
  fs.cpSync(SKILL_DIR, dest, { recursive: true })
  if (DESC_FILE) {
    const newDesc = fs.readFileSync(path.isAbsolute(DESC_FILE) ? DESC_FILE : path.resolve(REPO_ROOT, DESC_FILE), 'utf8').trim()
    const md = path.join(dest, 'SKILL.md')
    const swapped = fs.readFileSync(md, 'utf8').replace(/^(description:\s*)(.*)$/m, `description: ${JSON.stringify(newDesc)}`)
    fs.writeFileSync(md, swapped)
  }
  return root
}

// ---- one live query: did the candidate fire? --------------------------------
// Detection = an `assistant` tool_use of the Skill tool whose input.skill is the candidate (exact —
// a different skill firing is a non-fire for us), or a Read of the candidate's own file. We stop the
// instant the decision is observable: a matching Skill call (fired) or the first prose answer (declined).
function runOne(query, addDir) {
  return new Promise((resolve) => {
    const env = { ...process.env }; delete env.CLAUDECODE
    const cmd = ['-p', query, '--add-dir', addDir, '--output-format', 'stream-json', '--verbose']
    if (MODEL) cmd.push('--model', MODEL)
    const child = spawn('claude', cmd, { cwd: process.cwd(), env, stdio: ['ignore', 'pipe', 'ignore'] })
    let done = false
    const finish = (fired) => { if (done) return; done = true; clearTimeout(timer); try { child.kill('SIGKILL') } catch (_e) {} ; resolve(fired) }
    const timer = setTimeout(() => finish(false), TIMEOUT_MS)
    const rl = readline.createInterface({ input: child.stdout })
    rl.on('line', (line) => {
      line = line.trim(); if (!line) return
      let ev; try { ev = JSON.parse(line) } catch (_e) { return }
      if (ev.type === 'assistant') {
        const msg = ev.message || {}
        for (const c of (msg.content || [])) {
          if (c.type !== 'tool_use') continue
          if (c.name === 'Skill' && String((c.input && c.input.skill) || '').includes(SKILL.name)) return finish(true)
          if (c.name === 'Read' && String((c.input && c.input.file_path) || '').includes(`/skills/${SKILL.name}/`)) return finish(true)
        }
        // The model prefaces tool calls with text, so prose is NOT a decline. Only a finished
        // turn (end_turn) with no skill load is — that bounds a no-fire to its final message.
        if (msg.stop_reason === 'end_turn') return finish(false)
      } else if (ev.type === 'result') {
        finish(false)
      }
    })
    child.on('close', () => finish(false))
    child.on('error', () => finish(false))
  })
}

// ---- pooled runner ----------------------------------------------------------
async function pool(jobs, n, worker) {
  const out = new Array(jobs.length)
  let i = 0
  const runners = Array.from({ length: Math.min(n, jobs.length) }, async () => {
    while (i < jobs.length) { const idx = i++; out[idx] = await worker(jobs[idx], idx) }
  })
  await Promise.all(runners)
  return out
}

// ---- main -------------------------------------------------------------------
;(async () => {
  const jobs = []
  for (let qi = 0; qi < QUERIES.length; qi++) for (let r = 0; r < REPS; r++) jobs.push({ qi, r })
  const plan = `invocation-eval: skill="${SKILL.name}" · ${QUERIES.length} queries × ${REPS} reps = ${jobs.length} live \`claude -p\` runs · model=${MODEL || '(configured default)'} · concurrency=${CONCURRENCY}`
  console.error(plan)
  if (DRY_RUN) {
    console.error('--dry-run: spawning nothing. Each run is a real, billed turn; small models under-fire (caveat 2).')
    for (const q of QUERIES) console.error(`  [${q.should ? 'should-fire ' : 'should-stay '}] ${q.q}`)
    process.exit(0)
  }

  const addDir = makeTempProject()
  let fires
  try {
    fires = await pool(jobs, CONCURRENCY, (job) => runOne(QUERIES[job.qi].q, addDir))
  } finally {
    try { fs.rmSync(addDir, { recursive: true, force: true }) } catch (_e) {}
  }

  // aggregate per query
  const rate = QUERIES.map((_, qi) => {
    const mine = jobs.map((j, k) => (j.qi === qi ? fires[k] : null)).filter((x) => x !== null)
    return mine.length ? mine.filter(Boolean).length / mine.length : 0
  })
  const fired = (qi) => rate[qi] >= THRESHOLD
  const perQuery = QUERIES.map((q, qi) => ({ q: q.q, should: q.should, rate: +rate[qi].toFixed(2), fired: fired(qi), pass: q.should ? fired(qi) : !fired(qi) }))

  const shouldIdx = QUERIES.map((q, i) => [q, i]).filter(([q]) => q.should).map(([, i]) => i)
  const negIdx = QUERIES.map((q, i) => [q, i]).filter(([q]) => !q.should).map(([, i]) => i)
  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
  const summary = {
    skill: SKILL.name,
    model: MODEL || '(configured default)',
    reps: REPS,
    recall: +mean(shouldIdx.map((i) => (fired(i) ? 1 : 0))).toFixed(2),
    specificity: +mean(negIdx.map((i) => (!fired(i) ? 1 : 0))).toFixed(2),
    accuracy: +mean(perQuery.map((r) => (r.pass ? 1 : 0))).toFixed(2),
  }

  if (AS_JSON) { console.log(JSON.stringify({ summary, perQuery }, null, 2)); return }
  console.log(`\n  skill=${summary.skill}  model=${summary.model}  reps=${summary.reps}`)
  console.log(`  recall(should-fire)=${summary.recall}  specificity(should-stay)=${summary.specificity}  accuracy=${summary.accuracy}\n`)
  for (const r of perQuery) {
    const tag = r.pass ? 'PASS' : 'FAIL'
    console.log(`  [${tag}] fire-rate=${r.rate} want=${r.should ? 'fire' : 'stay'}  ${r.q.slice(0, 72)}`)
  }
})()
