---
name: forge
description: |
  Designs Claude Code harness artifacts. One triage ladder picks the right surface (skill, hook, path-scoped rule, CLAUDE.md or AGENTS.md entry, workflow script, subagent, MCP); the stance holds the bar every artifact must clear (a named failure or an authoritative source, plus a nameable attention shift); per-surface mechanics live in references. Use for creating, reviewing, or refactoring any of these, for distilling articles or docs into one, for skills that under- or over-trigger, hooks that don't fire or fire too often, bloated CLAUDE.mds, and for deciding which surface a behavior belongs on.
when_to_use: |
  Any work on a skill, hook, rule, CLAUDE.md, AGENTS.md, or workflow orchestration script. Creating, reviewing, debugging triggering or firing semantics, packaging a /command or plugin, or choosing between surfaces.
paths:
  - "**/.claude/skills/**"
  - "**/.claude/hooks/**"
  - "**/.claude/rules/**"
  - "**/.claude/agents/**"
  - "**/.claude/workflows/**"
  - "**/.claude/settings.json"
  - "**/.claude/settings.local.json"
  - "**/CLAUDE.md"
  - "**/CLAUDE.local.md"
  - "**/AGENTS.md"
harness-targets: [claude]
---

# forge

<!-- Earned against: Fable 5, 2026-06-12, v2.1.170 — history: CHANGELOG.md -->

A harness artifact is a standing claim on every future session's attention. Before any mechanics, it clears three bars:

1. **It is earned.** Either a failure you observed (the agent did the wrong thing, or the same correction landed three times), or an authoritative source worth operationalizing before the failure happens (a spec, a researched methodology, hard-won domain knowledge — not a hot take you just read). If neither, stop: the cheapest artifact is the one not written.
2. **It shifts attention, nameably.** What should the agent attend to that it doesn't — or stop attending to? From what, to what, in one sentence. If you can name the basis but not the shift, you have material, not yet a design. Sit with it longer.
3. **It beats the model's default.** A frontier model's unaided output is competent across most domains; content restating that competence is dead weight at recurring cost. The artifact earns its place only with the delta: the non-obvious move, the trade-off an expert weighs, the trap, the verified current specific. Verify as an action, not an intention — for any version-specific or fast-moving fact, fetch the canonical doc and cite it; recall ships deprecated specifics in a confident tone.

The test that decides worth is **additive vs transformative**. An artifact that lists steps saves typing and changes nothing foreground; one that pushes mechanics into the background and elevates the real question (*should we ship?*, *is this diff coherent?*) changes what is thinkable. Both can ship — but the additive one must be cheap (hidden from the listing via `disable-model-invocation`, narrowly scoped), because what it keeps in context is not a way of seeing.

Every non-trivial artifact carries a one-line pin — `<!-- Earned against: <model>, <YYYY-MM-DD>, <CC version> -->` — and its rationale, sunset trigger, and re-test verdicts go to CHANGELOG.md, never into the artifact. Artifacts never reference the conversation that produced them.

## Triage — pick the surface

Run the ladder in order; first match wins. A refined harness trends toward *fewer* artifacts, each doing what only it can.

| The behavior is... | Surface |
| :--- | :--- |
| A guarantee that must hold every time ("never edit `.env`", "lint after every edit") | **Hook** — fires deterministically; a skill is interpreted and can be talked out of. [references/hooks.md](references/hooks.md) |
| Just "this tool can't be used here", no logic needed | `permissions.deny` in settings — don't write a hook for it |
| Reaching a system the harness can't see (database, tracker, private API) | **MCP server** — a skill can teach using it well; it can't replace the connection |
| A side investigation that would flood the main context | **Subagent**, or a skill with `context: fork` that runs as one |
| A fact every session should hold ("we use pnpm") | **CLAUDE.md** — [references/always-on.md](references/always-on.md) |
| A convention that only matters for some files | **Path-scoped rule** — or a path-scoped *skill* if it must also be manually invocable. [references/always-on.md](references/always-on.md) |
| Deterministic orchestration of many agents — large fan-out, classify-then-route, branching, or a run that must reproduce | **Workflow script** — see Workflows below. A *single* delegated task that itself splits (reviewer → a verifier per finding) may only need a **nested subagent** |
| None of the above, reusable across sessions | **Skill** — [references/skills.md](references/skills.md) |

Two orthogonal notes:

- ***When* it fires is not *where* it lives.** Work that runs on a schedule or fires on an event with no human in the session is a Routine (`/schedule`) running the artifact; an artifact can't schedule itself.
- **Surfaces combine.** A skill can bundle a hook scoped to its own lifetime (frontmatter `hooks:`) — guidance and guarantee in one artifact. An MCP connection plus a skill that teaches its good use is another common pair.

When triage moves the work somewhere other than what was asked for, name the redirect in one line and confirm before building ("this looks like a rule, not a skill, because X — proceed?"). Announce, confirm, carry through; never silently switch.

## Skills

The two failure modes are a bad subject (restates the model's defaults) and bad anatomy (never triggers, fires wrong, dies at compaction). Subject first; anatomy in its service.

- **Don't reinvent.** Search the ecosystem before drafting (`npx skills find <query>`, skills.sh, or the `find-skills` skill if present), then read the strongest candidate and judge it yourself — install counts are a prior, not a verdict. Use as-is, fork and sharpen, or build new, deliberately.
- **Distill, don't transcribe.** From a source, SKILL.md is the table of contents and `references/<topic>.md` the chapters opened on demand. Cut what the model already knows; keep what is specific to this source and this codebase.
- **Blast radius of one skill.** Ingesting material into a skill never adds content or back-references to a neighboring skill. A skill does its job alone; at most it carries a soft, optional, one-directional pointer ("if `x` is available, use it alongside this"). Coupling two skills so each leans on the other breaks both the moment one is missing.
- **Craft.** Match freedom to fragility (prose for judgment-laden work, exact steps only for fragile procedures). Explain the why — the model generalizes from a reason where it can't from a bare MUST. One worked example conveys altitude more cheaply than a paragraph, and costs ~3× a rule, so use *one*. One default with an escape hatch, one term per concept, and cut any line the model would do without — the context window is a public good.
- **The description is the only trigger surface.** Describe the class of requests, then anchor it — matching is semantic, and an enumerated phrase list reads as exhaustive, so the unlisted case looks out of scope. Job + scope + strongest distinct triggers lands at 600–900 chars; the 1,536-char cap is a truncation guard, not a target.
- **The body is recurring cost.** Standing instructions, not one-time steps; once invoked it stays in context unread-from-disk until compaction.
- **Test against the failure that earned it.** Run the task in a fresh session *without* the skill; the gap is the spec. Then with it — and read the transcript, not just the output: "didn't trigger" and "triggered but didn't steer" look identical from outside. Scale verification to stakes; a blind eval panel (see `evals/depth-eval.js`) is for high-stakes rewrites only, and costs real tokens — confirm before firing.

Mechanics — listing budgets, frontmatter fields, compaction rules, kinds, naming collisions, YAML traps: [references/skills.md](references/skills.md).

## Hooks

A skill redirects attention; a hook removes the concern from the model's reach entirely. The strongest surface, with the narrowest fit.

- **Earned by an incident, not a worry.** "Might go wrong" is CLAUDE.md territory; a hook answers what already went wrong.
- **Strictness is earned by precision, not importance.** Block / warn / log is a spectrum, and after the skill/hook confusion, over-blocking is the most common design mistake: a blocking hook with false positives trains the user to disable it, which costs the guarantee *and* their trust in the hooks layer. Most hooks that feel like blocks want to warn.
- **Exit 2 blocks; nothing else does** — not exit 1. Stderr on exit 2 is fed to the model: write it to teach (the why, and the alternative), not to deny. A flat "rejected" gets retried or argued with; a reasoned block gets compliance.
- **Success silent, failure verbose.** A hook that prints on every pass pollutes every downstream turn.
- **Hooks gate tool inputs, not returned prose.** `SubagentStop` carries no result text and `PostToolUse` truncates large results — don't reach for a hook to police what a fork returned; enforce that in the dispatch contract instead.

Events, matchers, handler types, exit and JSON semantics, placement: [references/hooks.md](references/hooks.md).

## CLAUDE.md and rules

The always-on surfaces: every line is paid for every turn (CLAUDE.md) or whenever the glob matches (rules).

- **Never current state.** The code says what the code is; restating it pays tokens to go stale on the next commit. What survives a refactor: intent, spirit, durable harness traps, pointers, framing caveats.
- **Verify every fact-claim against its source** (filesystem, configs, scripts, settings) before writing or keeping it. Intent voice does not protect against a wrong mechanism inside it.
- **The ceilings are empirical.** Past ~14 top-level rules, compliance drops sharply; examples cost ~3× a rule and induce overfitting; "be careful" adverbs do roughly nothing. Reasoned rules beat bare directives by a wide margin — give the Why where the rule isn't its own reason.
- **A rule is earned by three corrections** on the same convention in the same slice, and verified against the slice — if the files don't already follow the convention, the rule is wishful and will contradict the code. Write condition-shaped bullets, not principles ("when X genuinely needs Y, do Z" beats "Y before Z"); phrase capability-agnostically; add a respect-the-framework preamble where the rule overlaps an opinionated framework's territory.

Filters, the goes-elsewhere table, voice and the Why pattern, AGENTS.md-primary mode, glob discipline: [references/always-on.md](references/always-on.md).

## Workflows

The Workflow tool's own in-session description is the authoritative, current contract for the API *and* the orchestration patterns (pipeline vs parallel, schemas, budget scaling, adversarial verification) — author from it, not from memory. What it doesn't cover:

- **The surface line.** A handful of parallel reads synthesized once is a prose-dispatched skill (`/ingest`); a *single* delegated task that itself fans out — a reviewer spawning a verifier per finding — is a **nested subagent**, where only the top summary returns and there's no runtime opt-in; reach for the workflow runtime when the corpus is large, control flow branches, or the run must reproduce.
- **Packaging.** The documented reuse path is `.claude/workflows/<name>.js` as a `/command`. Shipping workflow files inside a skill folder is blog-asserted only — usable knowingly, not something to depend on.
- **Opt-in.** Workflows cost real tokens and the runtime requires explicit user opt-in. Design the script; don't fire it unasked.

## Authoring footgun — the loader trigger sequences

The skill loader pre-processes every file in a skill directory at load time, scanning for two literal byte sequences and replacing them with command output — **ignoring markdown context** (inline code, fences, and block quotes offer no protection):

- an exclamation mark immediately followed by a backtick;
- three backticks immediately followed by an exclamation mark.

If either appears anywhere in the tree, the loader runs what follows as a shell command; an off-allowlist or malformed command fails the whole skill to load. Any file that must *describe* injection (a tutorial, this file) does it in words, uses an `[INJECT: <command>]` placeholder in example bodies, and points at `https://code.claude.com/docs/en/skills` for a rendered example. After writing, grep the tree (patterns backslash-escaped so this file stays load-safe):

```bash
grep -rn -e '!\`' -e '\`\`\`!' .claude/skills/<your-skill>/
```

Zero matches means it will load.

## Ship, then let it die well

- `bin/preship-check` before commit (the kitchen's PreToolUse gate runs it on `git commit` anyway).
- Pin the artifact; log rationale and sunset trigger in CHANGELOG.md.
- **On each major model release, re-test the failure that earned each artifact.** No longer reproduces → delete; shifted → rewrite against the new failure rather than layering on the old. And record the keeps: when a skill-withheld trial reproduces the failure, that's a dated KEPT in the changelog — without positive evidence, every audit can only ever argue for removal.
- The trajectory of a refined harness is fewer artifacts, not more.

## See also

- [references/skills.md](references/skills.md) — skill mechanics: listing, frontmatter, lifecycle, kinds, naming, eval.
- [references/hooks.md](references/hooks.md) — hook mechanics: events, matchers, handlers, exit codes, placement.
- [references/always-on.md](references/always-on.md) — CLAUDE.md, AGENTS.md, and rule mechanics.
- Canonical docs (trust over this skill when details move): `code.claude.com/docs/en/skills`, `/docs/en/hooks`, `/docs/en/memory`, `/docs/en/workflows`.
