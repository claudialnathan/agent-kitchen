---
name: workflow-forge
description: |
  Designs dynamic workflows for Claude Code: JavaScript orchestration scripts that fan subagents out with deterministic control flow (the Workflow runtime: `agent()`, `parallel()`, `pipeline()`, `phase()`). Covers when a workflow beats a plain skill, a single subagent, or inline dispatch; the patterns (classify-and-act, fan-out-and-synthesize, adversarial verification); the pipeline-vs-parallel decision; budget scaling; and how to save or package one. Use when a task needs many coordinated agents or per-item verification, or when Claude goes lazy / drifts on a big multi-part task.
when_to_use: |
  Any work on a dynamic workflow: designing, writing, or reviewing an orchestration script, deciding between a workflow, a skill, and a single subagent, or pipeline vs parallel. Also any task that wants many coordinated subagents or per-item verification, when Claude goes lazy or drifts on a big multi-part task, and skill-forge redirects.
paths:
  - "**/.claude/workflows/**"
  - "**/*.workflow.{js,mjs}"
harness-targets: [claude]
---

# workflow-forge

<!-- Earned against: Opus 4.8, 2026-06-08, v2.1.165 (workflows in research preview) — history: CHANGELOG.md -->

A dynamic workflow removes the *plan* from the model's drifting context and makes it code. The default harness plans and executes in the same window: across a long multi-part task that window degrades, and three failure modes surface. A workflow answers them not with a better prompt but with **deterministic control flow you author** — the loop, the fan-out, the verification are JavaScript; the agents only do the work, each in a fresh context.

This is the heaviest extension surface in the toolkit. A skill redirects attention; a hook eliminates a concern; a workflow **restructures the whole job** into orchestrated pieces. Earn it. Most tasks that *feel* like they want a workflow want a single subagent or a prose-dispatched skill instead.

> **Workflows are opt-in and cost real tokens.** The runtime won't author one unless the user asked for multi-agent orchestration (the `ultracode` keyword, "use a workflow", a saved `/workflow`, or a skill that calls the Workflow tool) — or the session is in `/effort ultracode`, the standing mode that makes authoring-and-running a workflow the default for every substantive task (offered only where the model supports `xhigh`). It can spawn dozens of agents. This forge designs workflows; it does not silently run them. Outside that mode, if the user hasn't opted in, design and hand back the script, or estimate the cost and ask.

## The three failure modes a workflow exists to fix

These are the *why*. If none of them is biting, you probably don't need a workflow. (Sourced to Anthropic's "A harness for every task" post.)

- **Agentic laziness** — Claude stops before a complex multi-part task is finished and declares done after partial progress ("addressed 35 of the 50 items"). A workflow that fans out *one agent per item* can't quit at 35; the loop covers all 50.
- **Self-preferential bias** — Claude prefers its own results when asked to verify or judge them against a rubric. A workflow puts verification in a *separate* spawned agent (adversarial verification), so the judge isn't the author.
- **Goal drift** — fidelity to the original objective decays across many turns, especially after compaction. A workflow pins the objective in the script and in each agent's fresh prompt; there's no long context to drift in.

Name which one you're fighting before designing. The pattern you reach for follows from it.

## Step 1 — Is a workflow even the right surface?

Run the ladder; the first match wins. The surfaces get heavier top to bottom — stop at the lightest one that holds.

1. **One bounded investigation that returns a summary?** → a **subagent**, or a skill with `context: fork`. No orchestration; one fork. (That's `skill-forge`'s Forked-research kind.)
2. **A fixed procedure the *model* runs, with side effects?** → a **Workflow-kind skill** (`/release`, `/commit`) — `disable-model-invocation`, imperative steps. The model executes; nothing is fanned out.
3. **A handful of parallel reads you synthesize once, run by hand?** → a **Research-orchestrator skill** (`/ingest`) — prose dispatch, fine when N is small, the run is one-shot, and you don't need per-item verification or reproducibility.
4. **Many coordinated agents, per-item verification, classification-then-routing, or a run that must be deterministic and resumable?** → a **dynamic workflow**. This is the only surface that buys real concurrency, structural per-item checks, and resume.

The line between 3 and 4 is the one people get wrong. Cross it when the corpus is large, each item needs its own verified result, the control flow has branches, or the run has to reproduce. Below that line, a prose dispatch is cheaper and simpler — don't reach for the runtime to fan out five URLs.

> **Surface the redirect before executing it.** If the work is really a subagent or a skill and the user asked for a "workflow" (or vice versa), name the redirect in one line and confirm before invoking the companion forge — the *announce → confirm → carry through* gate `skill-forge` defines. Never silently switch surfaces.

## Step 2 — Pick the pattern

Three load-bearing shapes (Anthropic's named patterns), composable:

- **Classify-and-act** — a classifier agent decides the task type, then the script routes to different agents/branches. Use when one entry point handles several kinds of request.
- **Fan-out-and-synthesize** — split into many independent units, run an agent per unit, combine the results. The workhorse. The worked example is this shape.
- **Adversarial verification** — for each spawned agent, run a *separate* agent to verify its output against a rubric. The structural answer to self-preferential bias. For findings that can fail in more than one way, give each verifier a distinct lens (correctness, security, reproducibility) rather than N identical re-checkers.

Two more worth knowing: **loop-until-dry** (keep spawning finders until K rounds return nothing new — for unknown-size discovery the naive `count < N` misses) and **budget-scaled depth** (size the fleet to the user's token target; see `budget` below).

## Step 3 — pipeline vs parallel (the core craft call)

Both run agents concurrently; the difference is the barrier, and it dominates wall-clock.

- **`pipeline(items, stage1, stage2, …)` is the default.** Each item flows through all stages independently — item A can be in stage 3 while item B is still in stage 1. No barrier. Wall-clock ≈ the slowest single chain, not the sum of slowest-per-stage.
- **`parallel(thunks)` is a barrier** — it awaits *all* thunks before returning. Reach for it *only* when a stage genuinely needs every prior result at once: dedup/merge across the full set, an early-exit on total count, or a synthesis that references "all the findings."

The smell test: if you wrote `const a = await parallel(...)`, then a plain `transform(a)` (flatten/map/filter, no cross-item dependency), then another `parallel(...)`, that middle transform didn't need the barrier — fold it into a `pipeline` stage. When in doubt, pipeline.

The worked example *does* use a barrier, correctly: its synthesis needs every reader's excerpts at once (agreement = claims ≥ 2 sources support). That's the rare case the barrier is the point. Most aren't.

## Step 4 — Write the script

The runtime is documented at `https://code.claude.com/docs/en/workflows`, and the in-session **Workflow tool description is the authoritative API contract** — read it before authoring; this forge teaches the judgment, not the full signature list. The essentials that shape design:

- **`meta` is a pure literal first** — `{ name, description, phases }`, no variables or interpolation. Phase titles match `phase()` calls.
- **`agent(prompt, opts)`** returns the agent's text, or — with `opts.schema` (a JSON Schema) — a validated object. **Use the schema to make a contract structural** (see below). `opts`: `label`, `phase`, `schema`, `model`, `agentType` (e.g. `'Explore'` for read-only), `isolation: 'worktree'` (only when agents mutate files in parallel — expensive).
- **`phase()`, `log()`** drive the progress display; set `opts.phase` explicitly inside `parallel`/`pipeline` so concurrent agents land in the right group.
- **`budget`** — `{ total, spent(), remaining() }` reflects the user's token target; scale fleets or loops off it (`while (budget.total && budget.remaining() > 50_000)`), and guard loops on `budget.total` or they run to the 1000-agent cap.
- **Limits and sandbox:** ~16 concurrent agents (excess queues), 1000 per run; **no filesystem, no `Date.now()`/`Math.random()`/`new Date()`** (they break resume — pass timestamps via `args`, vary by index for randomness). Durable side effects (writing files, opening PRs) happen in the agents or back in the main thread, not the script.

**Structure as contract.** A schema beats a prose instruction: a reader *told* "quotes only" can still paraphrase; a reader whose only output field is `excerpts[].quote` tagged with a `section` *cannot* smuggle a summary, and the runtime makes it retry on mismatch. This is the workflow form's real advantage over a prose-dispatched skill — see the example.

## Worked example — `/ingest` as a workflow

[examples/ingest-fanout.workflow.mjs](examples/ingest-fanout.workflow.mjs) is the Research-orchestrator skill `cook/skills/ingest/` re-expressed as a dynamic workflow: a `parallel` fan-out of one `Explore` reader per source (schema-enforced quote-only output), then a single synthesis agent behind the one justified barrier. Read the comments — they mark *why* the barrier is correct, why the schema replaces the prose contract, and why the brief is returned for the main thread to write (the script can't touch the filesystem).

It is the Gate-2 worked example for this forge: authored against the runtime, **not yet run** (running needs the opt-in). Treat it as a template, not a verbatim script — the blog's own guidance for workflows shared through skills.

## Saving and packaging a workflow

- **Documented path:** save a run as a reusable `/command` — it lands in `.claude/workflows/<name>.js` (or `~/.claude/workflows/`) and reads input from the global `args`. This is the canonical, supported reuse mechanism.
- **Blog-asserted path (caveat):** the "harness for every task" post says you can put workflow `.js` files *in a skill folder* and reference them from `SKILL.md`, prompting Claude to treat them "as a template instead of a script that needs to be run verbatim." This is **not** in canonical docs — no file-layout is specified. Use it knowingly; prefer the `.claude/workflows/` path for anything you depend on, and don't encode the skill-packaging layout as settled until the docs catch up.

## Anti-patterns

- **Workflow for a one-shot task.** If there's no fan-out, no per-item verification, and no branching, you wrote a heavyweight subagent. Use a fork.
- **Barrier by reflex.** `parallel` between stages that don't share cross-item context wastes the fast items' wall-clock. Default to `pipeline`.
- **Self-review inside the workflow.** Having the authoring agent grade its own output reintroduces self-preferential bias — the very thing the surface exists to remove. Verify in a separate agent.
- **Silent caps.** Bounding coverage (top-N, no-retry, sampling) without `log()`-ing what was dropped reads as "covered everything." Announce the cut.
- **Filesystem or `Date.now()` in the script.** No fs access; time/random throw and break resume. Side effects go in agents or the main thread.
- **Running it unasked.** The runtime is opt-in and token-hungry. Design the script; don't fire it without the user's go-ahead.
- **Treating the preview API as stable.** It's a research preview — verify the API against the docs/tool contract each time, don't author from memory.

## When this skill doesn't apply

- The job is one investigation → subagent / `context: fork` (skill-forge's Forked-research kind).
- The job is a fixed procedure the model runs → Workflow-kind skill (skill-forge).
- The orchestration is a few parallel reads, one-shot → Research-orchestrator skill (`/ingest`); don't pay the runtime's overhead.
- The guarantee must be deterministic and pre-model → a hook (hook-forge), not a workflow.

## See also

- [examples/ingest-fanout.workflow.mjs](examples/ingest-fanout.workflow.mjs) — the worked example, heavily commented.
- `https://code.claude.com/docs/en/workflows` — canonical reference (research preview; trust it over this skill when details move).
- the in-session **Workflow tool description** — the authoritative API contract for `agent`/`parallel`/`pipeline`/`phase`/`budget`.
- `skill-forge` — the Research-orchestrator and Workflow kinds, and the line between a prose dispatch and a JS workflow.
- `hook-forge`, `rule-forge`, `claude-md-forge` — the companion forges; verifier-per-rule workflows are how rule-forge/claude-md-forge escalate a rule the model keeps missing.
