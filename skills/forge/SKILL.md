---
name: forge
description: |
  Designs coding-agent harness artifacts. One triage ladder picks the right surface (skill, hook, path-scoped rule, CLAUDE.md or AGENTS.md entry, workflow script, subagent, MCP); the stance holds the bar every artifact must clear (a gradeable objective, a gap between the model's default and what the owner wants, and a nameable attention shift; the gap is a new idea or source worth operationalizing, a miscommunication to prevent, or an observed failure); per-surface mechanics live in references. Use for creating, reviewing, or refactoring any of these, for distilling articles or docs into one, for skills that under- or over-trigger, hooks that don't fire or fire too often, bloated CLAUDE.mds, and for deciding which surface a behavior belongs on. Triggers on any work on a skill, hook, rule, CLAUDE.md, AGENTS.md, or workflow orchestration script, including debugging triggering or firing semantics and packaging a /command or plugin.
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
---

# forge

<!-- Earned against: Opus 4.8, 2026-06-19, v2.1.177; history: CHANGELOG.md -->

A skill transplants expertise. Its only measure is the work it makes the agent produce. That work is judged at the output, against the standard of the best practitioner alive in the domain — and, above that, against what this owner wanted it to achieve, because expert-grade in the wrong direction is still wrong. The bar is never generically good; it is exactly right for this owner. Everything else in this file (surfaces, triggering, token cost, lifecycle) is plumbing that gets that expertise in front of the agent at the right moment. A flawlessly-packaged artifact encoding mediocre expertise is worthless; a roughly-packaged one encoding genuine expertise is valuable. Optimize in that order, always.

So the first question is never *what surface?* or *what will this cost?* It is **what output does this artifact exist to produce?** Every artifact carries an objective: a sentence or two naming the outcome its work is graded against, concrete enough that a stranger could judge an output with it ("layouts as elegant, responsive, and accessible as the page allows, in as few lines as it permits" grades; "helps with layouts" doesn't). The objective is the spec: the body serves it, the eval grades against it, the probes derive their pass criteria from it. And it comes from the owner before it comes from any source, because the model improves every release without the owner's help, while what the owner wants it can only get from them. A request that arrives without a gradeable objective gets questions before drafts — as many as the gaps demand (what should the output achieve, what would the owner reject that a competent default would accept, what did a recent output miss); the owner would rather answer questions than receive an artifact built on guesses. Challenge the first assumption offered; when an assumption breaks there is usually a better objective behind it. Don't draft until you can state the objective back in the owner's terms and believe the artifact can beat the unaided model at it; if the model's default already meets the stated objective, say so — the owner decides whether building anyway is worth it as an experiment.

The objective is the heaviest of **four design facts no artifact is drafted without**. Each is either explicit in the request, verifiably inferable (an inference you could defend to the owner, drawn from the request, the repo, or the triage ladder — not a guess), or asked. Ask about every fact you don't hold — in Claude Code, `AskUserQuestion` puts the unresolved ones to the owner directly — and never ration the questions: an unasked question becomes a guess baked into the artifact.

1. **Who fires it.** Always-on, user-invoked, model-invoked off a class of user input, or the default both. The answer is triage and frontmatter in one: content needed before anything triggers belongs on an always-on surface (CLAUDE.md, a rule), not in a skill; user-only means `disable-model-invocation: true`; anything model-invocable makes fact 2 load-bearing (live mapping: `code.claude.com/docs/en/skills`, "Control who invokes a skill").
2. **What fires it.** The concept, phrase, or idea in the user's input that should make the model reach for it — captured in the owner's words, because the description must anchor to requests as they will actually arrive, and the owner is the one who will type them.
3. **What it needs before working.** Every input the work depends on, and where each verifiably lives at run time: the invocation's arguments, the repo, a connection, the model's own baseline. Anything that can be absent becomes an entry check in the body — verify or ask, never improvise the missing piece — because a skill that guesses at context it was supposed to be handed produces confident work about the wrong thing. An input that lives only in the owner's head makes asking for it part of the skill's procedure, not a failure of it.
4. **What excellent looks like.** The gradeable objective: the outcome and output the owner actually hopes for, stated so the work can be tested against it.

Together they are the artifact's shape: the task and its trigger understood (1–2), the context secured before work starts (3), and the exploration and work aimed at a describable, testable outcome (4).

An objective is not yet a standard. Next: **what does world-class output against it look like, and what must go in front of the agent to reach it?** If you can't describe exemplary output (the non-obvious moves, the trade-offs an expert weighs, the traps between game-changing and merely competent), you are not yet qualified to write the artifact. Acquire the standard first: read the current state of the practice, fetch primary sources, find or write an exemplar. Weight supplied sources the way the owner handed them: material the request is built on ("inspired by", "do what they do", "a skill from this person's writing") is read whole in the main thread, because it is the spec and judgment doesn't survive excerpting; a trailing reference list fans out through `/ingest` and returns as quotes. Expertise you don't hold cannot be transplanted. And verify at decision time: every design decision is checked against freshly retrieved sources (the live canonical doc, the primary source), not against repo docs, STATE.md, or context already loaded, which are perishable inputs, never the baseline. Verification informs; it never overrules. When a fresh source or your own judgment contradicts the owner's stated intent — or an edit the owner made to an artifact — state the stance, cite the evidence, and ask: follow the recommendation, keep the original intent unchanged, or another path of the owner's choosing. The owner's domain expertise is evidence too, of a kind no source carries, and they may dismiss the pushback outright.

**Forge is a working draft, not the authority. The output is.** When another approach produces better work, it is right and forge is wrong; absorb what beats it and cut the rule it beat.

An artifact earns its existence on three bars, heaviest first:

1. **It beats the model's default.** Restating the model's own competence is dead weight at recurring cost. The delta has only a few durable sources (the owner's taste and intent made operational, local truths of a repo or team, verified post-cutoff currency, failures actually observed), and it must be verified as an action, not an intention: for anything fast-moving or version-specific, fetch the canonical source and cite it; recall ships deprecated specifics in a confident tone. An artifact drawing on none of these is competing with the model's training data and will be absorbed within a release or two; write it expecting to delete it.
2. **It is earned.** A gap between the model's default and what the owner wants: a raw idea or source worth operationalizing, a miscommunication worth preventing (the `harvest` skill mines transcripts for exactly these), or a failure actually observed. The everyday means are the idea and the miscommunication. If none, say so; building anyway is an experiment — name it as one and log it so its result teaches something either way.
3. **It shifts attention, nameably.** What should the agent attend to that it doesn't, or stop attending to? From what, to what, in one sentence. Name it, or you have material, not yet a design.

Aim transformative, not additive, because the test is about the work, not the token bill. An additive artifact lists steps and the agent still attends to mechanics; a transformative one pushes mechanics into the background and elevates the real question (*should we ship?*, *is this trustworthy?*, *is this even the right problem?*). Cost discipline (lean bodies, tight descriptions, the right surface) is how you afford the expertise, never what you trade it for.

Every non-trivial artifact carries a one-line pin, `<!-- Earned against: <model>, <YYYY-MM-DD>, <CC version> -->`, recording the earning event only; rationale, verdicts, and revisions go to CHANGELOG.md, and the artifact never references the conversation that produced it (full discipline: the kitchen's CLAUDE.md).

**Scope: build in-repo, never reach into machine scope.** Machine-scope surfaces (anything under `~/.claude/`, user or enterprise `settings.json`, global plugins and user-scope hooks) are read for context but never written, staged, or offered for apply, even during an audit and even when the fix is one obvious line. Report it; the owner acts. A hard boundary, not a default to weigh.

## Triage: pick the surface

Run the ladder in order; first match wins. Each surface does what only it can.

| The behavior is... | Surface |
| :--- | :--- |
| A guarantee that must hold every time ("never edit `.env`", "lint after every edit") | **Hook**: fires deterministically; a skill is interpreted and can be talked out of. [references/hooks.md](references/hooks.md) |
| Just "this tool (or this tool-call shape) can't be used here", no logic needed | `permissions.deny` in settings: matches command content *and* parameters (`Bash(rm *)`, `Agent(model:opus)`), so a block that looks conditional often needs no hook |
| Reaching a system the harness can't see (database, tracker, private API) | **MCP server**: a skill can teach using it well; it can't replace the connection |
| A side investigation that would flood the main context | **Subagent**, or a skill with `context: fork` that runs as one |
| A fact every session should hold ("we use pnpm") | **CLAUDE.md**: [references/always-on.md](references/always-on.md) |
| A convention that only matters for some files | **Path-scoped rule**, or a path-scoped *skill* if it must also be manually invocable. [references/always-on.md](references/always-on.md) |
| Deterministic orchestration of many agents: large fan-out, classify-then-route, branching, or a run that must reproduce | **Workflow script**: see Workflows below. A *single* delegated task that itself splits (reviewer → a verifier per finding) may only need a **nested subagent** — but only where the deployment has opted into nesting (see Workflows below) |
| None of the above, reusable across sessions | **Skill**: [references/skills.md](references/skills.md) |

Three orthogonal notes:

- **Effectiveness picks the surface; fewer-artifacts is a result, not a criterion.** Content the agent needs *before anything triggers* (a standing presumption, orientation, intent) belongs always-on (CLAUDE.md or a rule) even in a lean harness; an on-demand surface only works when something fires the demand. Don't let the slimming trend argue a fact out of CLAUDE.md when that is the effective home (live confirmation: `code.claude.com/docs/en/skills` says skills hold procedures and CLAUDE.md holds facts every session should carry).
- ***When* it fires is not *where* it lives.** Work that runs on a schedule or fires on an event with no human in the session is a Routine (`/schedule`) running the artifact; an artifact can't schedule itself.
- **Surfaces combine.** A skill can bundle a hook scoped to its own lifetime (frontmatter `hooks:`), giving guidance and guarantee in one artifact. An MCP connection plus a skill that teaches its good use is another common pair.

When triage moves the work somewhere other than what was asked for, name the redirect in one line and confirm before building ("this looks like a rule, not a skill, because X. Proceed?"). Announce, confirm, carry through; never silently switch.

## Skills

The two failure modes are a bad subject (restates the model's defaults) and bad anatomy (never triggers, fires wrong, dies at compaction). Subject first; anatomy in its service.

- **Don't reinvent.** Search the ecosystem before drafting (`npx skills find <query>`, skills.sh, the `find-skills` skill if present), read the strongest candidate, and judge it yourself, because install counts are a prior, not a verdict.
- **Distill, don't transcribe.** SKILL.md is the table of contents; `references/<topic>.md` are the chapters opened on demand. Keep what is specific to this source and this codebase (above all the expert's *judgment*: the call at the fork, the trap sidestepped), rather than procedure a competent generalist already follows.
- **A skill stands alone.** It never instructs invoking another skill and never assumes one is installed — not a third-party skill, not a harness built-in (`/loop`, `/batch`). Encode the behavior inline ("repeat until nothing is pending", not "drive it with `/loop`") so the guidance holds in any harness. At most a soft, optional, one-directional "see also" pointer that costs nothing when absent; coupling two skills so each leans on the other — including wiring a back-reference into a neighbor while ingesting a source — breaks both the moment one is missing. Mechanics: [references/skills.md](references/skills.md).
- **Craft.** Match freedom to fragility (prose for judgment-laden work, exact steps only for fragile procedures). Explain the why, because the model generalizes from a reason where it can't from a bare MUST. Worked examples convey altitude but cost real tokens and induce overfitting, so use the fewest that carry it, and make those complete: an example that only runs because a load-bearing line was cut teaches the omission. One default with an escape hatch, one term per concept; cut any line the model would do without.
- **Encode the discovery, not the facts.** When truth exists at runtime (a config, a schema, a vendor CLI's info command, an llms.txt), teach the skill to read it first instead of freezing today's values ("read `globals.css` for the theme before writing classNames"). Frozen vendor facts rot worst: they invert from stale to actively wrong (a grep for a renamed package silently concludes the stack is absent). Where a bare vendor fact must appear anyway, it is a re-test liability the probe file should cover.
- **The description is the only trigger surface.** Describe the class of requests, then anchor it. Matching is semantic, and an enumerated phrase list reads as exhaustive, making the unlisted case look out of scope. Frame it by the agnostic domain the skill serves, not the harness it runs in (`coding-agent harness artifacts`, not `Claude Code harness artifacts`): the description is the one surface every cross-tool consumer reads, so a tool-named frame reads as out-of-scope in every tool but the one it names. Job + scope + strongest distinct triggers lands at 600–900 chars; the 1,536-char cap is a truncation guard, not a target.
- **The body is recurring cost.** Standing instructions, not one-time steps; once invoked it stays in context unread-from-disk until compaction.
- **A rule the model read and still violated needs its trigger moved from concept to shape.** When the same correction recurs in sessions where the skill was demonstrably loaded, the deficit is wording and salience, not triggering, so more triggers change nothing. Name the exact wrong artifacts the model produces (the parallel component beside the source it should have edited, the bracket value already on the scale), and lead with the highest-recurrence shape.
- **The verdict is the output against the objective at an expert bar, not whether it fired.** Establish the exemplar first: what a senior practitioner's output on a real task in this domain looks like. Run the task in a fresh session *without* the skill (that gap is the spec), then *with* it, reading the transcript, not just the result ("didn't trigger" and "triggered but didn't steer" look identical from outside). Triggering and anatomy are pass/fail hygiene; depth is the grade. Calibrate the bar to the skill's kind: expertise grades against the domain's best practitioner; *taste* (a voice, an aesthetic) grades against its owner, where a generic judge panel is a category error. Eval harnesses and probe mechanics: [references/skills.md](references/skills.md).

Mechanics (listing budgets, frontmatter fields, compaction rules, kinds, naming collisions, YAML traps): [references/skills.md](references/skills.md).

## Hooks

A skill redirects attention; a hook removes the concern from the model's reach entirely. The strongest surface, with the narrowest fit.

- **Incidents are the strongest evidence.** A hook answers what already went wrong most convincingly; a worry usually wants CLAUDE.md or a warn-level hook first. A default to weigh, not a gate.
- **Strictness is earned by precision, not importance.** Block / warn / log is a spectrum, and after the skill/hook confusion, over-blocking is the most common design mistake: a blocking hook with false positives trains the user to disable it, which costs the guarantee *and* their trust in the hooks layer. Most hooks that feel like blocks want to warn.
- **Exit 2 blocks; nothing else does**, not even exit 1. Stderr on exit 2 is fed to the model: write it to teach (the why, and the alternative), not to deny. A flat "rejected" gets retried or argued with; a reasoned block gets compliance.
- **Success silent, failure verbose.** A hook that prints on every pass pollutes every downstream turn.
- **Hooks gate tool inputs, not returned prose.** `SubagentStop` carries no result text and `PostToolUse` truncates large results, so don't reach for a hook to police what a fork returned; enforce that in the dispatch contract instead.

Events, matchers, handler types, exit and JSON semantics, placement: [references/hooks.md](references/hooks.md).

## CLAUDE.md and rules

The always-on surfaces: every line is paid for every turn (CLAUDE.md) or whenever the glob matches (rules).

- **Never current state.** The code says what the code is; restating it pays tokens to go stale on the next commit. What survives a refactor: intent, spirit, durable harness traps, pointers, framing caveats.
- **Verify every fact-claim against its source** (filesystem, configs, scripts, settings) before writing or keeping it. Intent voice does not protect against a wrong mechanism inside it.
- **Short files are read; long ones are skimmed.** Compliance dilutes as rules and examples accumulate, and "be careful" adverbs add little. Reasoned rules beat bare directives, so give the Why where the rule isn't its own reason.
- **A rule is earned by recurrence** — corrections repeating on the same convention in the same slice — and verified against the slice. If the files don't already follow the convention, the rule is wishful and will contradict the code. Write condition-shaped bullets, not principles ("when X genuinely needs Y, do Z" beats "Y before Z"); phrase capability-agnostically; add a respect-the-framework preamble where the rule overlaps an opinionated framework's territory.

Filters, the goes-elsewhere table, voice and the Why pattern, AGENTS.md-primary mode, glob discipline: [references/always-on.md](references/always-on.md).

## Workflows

The Workflow tool's own in-session description is the authoritative, current contract for the API *and* the orchestration patterns (pipeline vs parallel, schemas, budget scaling, adversarial verification), so author from it, not from memory. What it doesn't cover:

- **The surface line.** A handful of parallel reads synthesized once is a prose-dispatched skill (`/ingest`); a *single* delegated task that itself fans out (a reviewer spawning a verifier per finding) is a **nested subagent**, where only the top summary returns; reach for the workflow runtime when the corpus is large, control flow branches, or the run must reproduce. **Nested spawning now needs its own opt-in too** (reversed at v2.1.217: off by default, on only when the deployment sets `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`), and that's a session/settings-level env var, not something the subagent definition itself can turn on. Don't design an artifact around nested subagents spawning without confirming the runtime has opted in, or it silently errors on the `Agent` call instead of fanning out.
- **Packaging.** The documented reuse path is `.claude/workflows/<name>.js` as a `/command`. Shipping workflow files inside a skill folder is blog-asserted only, which makes it usable knowingly, not something to depend on.
- **Opt-in.** Workflows cost real tokens and the runtime requires explicit user opt-in. Design the script; don't fire it unasked.

## Authoring footgun: the loader trigger sequences

The skill loader pre-processes every file in a skill directory at load time, scanning for two literal byte sequences and replacing them with command output while **ignoring markdown context** (inline code, fences, and block quotes offer no protection):

- an exclamation mark immediately followed by a backtick;
- three backticks immediately followed by an exclamation mark.

If either appears anywhere in the tree, the loader runs what follows as a shell command; an off-allowlist or malformed command fails the whole skill to load. Any file that must *describe* injection (a tutorial, this file) does it in words, uses an `[INJECT: <command>]` placeholder in example bodies, and points at `https://code.claude.com/docs/en/skills` for a rendered example. After writing, grep the tree (patterns backslash-escaped so this file stays load-safe):

```bash
grep -rn -e '!\`' -e '\`\`\`!' .claude/skills/<your-skill>/
```

Zero matches means it will load.

## Ship, then let it die well

- `bin/preship-check` gates every commit here via the committed PreToolUse hook.
- Pin the artifact; log rationale and sunset trigger in CHANGELOG.md. A stack-keyed sunset trigger includes vendor default flips, package renames, and idiom changes, not just version majors, because a stack can break a skill without ever incrementing one.
- **The primary deletion signal is live convergence.** The moment a skill's guidance and the model's bare instinct agree in real work, log the skill as a deletion candidate in CHANGELOG.md, because production friction is the honest eval; a staged probe measures behavior-under-examination.
- **Ship the death test anyway.** Expertise and taste skills carry `evals/probes.md` (the earning gap as runnable fixtures) as the fallback and the confirmation: a live-nominated candidate is confirmed for deletion by *all* probes passing unaided, and the model-release replay remains the scheduled sweep for what live use hasn't surfaced. Absorption is not monotonic across model lines, so probes are never retired while the skill lives. Record verdicts (KEPT / revised / deleted) in CHANGELOG.md, and record the keeps, or every audit can only argue for removal. Process and workflow skills are exempt because their value is the owner wanting the procedure, which a release can't absorb. Mechanics: [references/skills.md](references/skills.md).
- Artifacts are experiments with lifecycles: trying one, learning from it, and deleting it are all the system working.

## See also

- [references/skills.md](references/skills.md): skill mechanics (listing, frontmatter, lifecycle, kinds, naming, eval).
- [references/hooks.md](references/hooks.md): hook mechanics (events, matchers, handlers, exit codes, placement).
- [references/always-on.md](references/always-on.md): CLAUDE.md, AGENTS.md, and rule mechanics.
- Canonical docs (trust over this skill when details move): `code.claude.com/docs/en/skills`, `/docs/en/hooks`, `/docs/en/memory`, `/docs/en/workflows`.
