---
name: claude-md-forge
description: |
  Designs CLAUDE.md and the files around it (CLAUDE.local.md, AGENTS.md, .claude/rules/). The discipline: CLAUDE.md holds intent and what the agent can't infer from the code, not enforcement and not current state. Three jobs: bootstrap a new file, audit a bloated existing one, tune a single new entry. Different from /init (generic scaffold) and claude-md-improver (0–100 quality grade). This skill triages each line to the surface where it does work, then writes only what's left.
when_to_use: |
  Triggers:
  - "set up CLAUDE.md", "create CLAUDE.md", "bootstrap CLAUDE.md", "init project for claude"
  - "review my CLAUDE.md", "audit my CLAUDE.md", "rewrite CLAUDE.md", "CLAUDE.md is too long", "split CLAUDE.md"
  - "audit AGENTS.md", "tune AGENTS.md", "AGENTS.md is primary", "AGENTS.md is too long"
  - "add this to CLAUDE.md", "promote to CLAUDE.md", "update CLAUDE.md from this session"
  - "should this be in CLAUDE.md", "where do project conventions go"
  - "CLAUDE.md vs auto-memory", "CLAUDE.md vs rule", "CLAUDE.md vs AGENTS.md"
  - "/init output is generic", "AGENTS.md and CLAUDE.md", "CLAUDE.md import"
  - "skill-forge said put this in CLAUDE.md"
  - "rule-forge said also update CLAUDE.md"
paths:
  - "**/CLAUDE.md"
  - "**/CLAUDE.local.md"
  - "**/AGENTS.md"
  - "**/.claude/CLAUDE.md"
  - "**/.claude/rules/**"
harness-targets: [claude]
---

# claude-md-forge

CLAUDE.md is loaded in full every turn. The discipline that justifies the cost: hold only what the agent cannot or should not infer from the code, and write nothing that depicts current state.

The code says what the code is. The lockfile names the package manager, the lint config holds the style rules, the directory tree shows the layout. A CLAUDE.md that restates any of it costs context every turn and goes stale on the next commit.

What is left to write is what survives a refactor: intent, spirit, durable harness traps, pointers to where the rest of the discipline lives. Enforcement belongs in hooks. Narrow conventions belong in path-scoped rules at `.claude/rules/<name>.md`. Procedures belong in skills. Personal preferences belong in auto-memory or `CLAUDE.local.md`.

Most CLAUDE.mds shrink by half on real audit. The reflex is to add; the discipline is to cut.

Three jobs share the same triage and writing discipline.

1. **Bootstrap.** No CLAUDE.md exists, or just the `/init` stub.
2. **Audit.** CLAUDE.md exists and is bloated, stale, or wrong-surface. The most common job.
3. **Tune.** A recent session surfaced one durable thing worth landing somewhere.

## Step 0 — Verify, then filter

**Verify the facts first.** Every CLAUDE.md entry rests on claims about how this place works ("artifacts get installed via X", "the meta-forges are gated by Y", "the test runner lives at Z"). Intent voice does not protect against fact errors; a sentence shaped as orientation can hide a wrong mechanism inside it. Before writing or retaining an entry, identify each fact-claim and verify it against the source:

- Filesystem layout (`ls`, directory walk).
- `package.json`, lockfile, `.tool-versions`, `Makefile`.
- `.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json` (plugin packaging).
- `.claude/settings.json` and `.claude/settings.local.json` (hooks, permissions, overrides).
- Skill frontmatter and the body of each `SKILL.md` (the skill *is* the spec).
- Scripts in `bin/` (the script *is* the mechanism).
- `CLAUDE.local.md` for install / troubleshoot playbooks the user already wrote.

If you cannot verify a claim from the source, ask the user or read more code. Do not infer. A CLAUDE.md sentence built on an unverified mechanism is wrong recurring context, and the framing caveat ("if the code contradicts the rule, trust the code") catches it only after the agent has acted on the error.

**Then filter the candidate.** Three filters; a single no means the content belongs elsewhere.

**Will this still be true after the next refactor?** If a rename, package swap, framework upgrade, or directory reorganization could falsify the content, the content depicts current state. Cut. The code already says it. The exception is rare: explicit user request, or a fact the agent genuinely cannot infer from looking. Flag it when you reach for it.

**Does the model need to interpret this, or to follow it deterministically?** Rules that must hold every time (no edits to `.env`, lint after every change, secrets blocked at commit) need an enforcer. Hooks fire deterministically; the model interprets. If the rule cannot soften, it belongs in a hook.

**Does this apply across the whole repo, or only in part of it?** Path-narrow conventions belong in `.claude/rules/<name>.md` with `paths:` frontmatter. A migrations rule loaded while editing a button costs context for nothing.

Three yeses (refactor-stable, interpretation-not-enforcement, repo-wide) means the content is a CLAUDE.md candidate. A single no means it belongs elsewhere. Most candidates fail one filter. Many fail all three.

If the failure the rule prevents is one the current model has stopped making, the rule is obsolete on arrival. Don't write it. Each non-trivial entry records the model it was earned against (see the repo's `Model-version pinning` convention) so the next audit has a deletion trigger.

## What CLAUDE.md actually holds

After the filters, the residue is small. Five kinds of content:

**Intent.** What this place is for, in a paragraph. Why it exists. What it is not. ("A workshop for designing Claude Code skills. Not a product. Artifacts here get copied into other repos when wanted.") Survives any refactor because it is about the project, not the code.

**Spirit.** Dispositions that frame how to relate to the work here, where the disposition matters and the agent would not infer it. ("Treat every new artifact as feedback for the forge that produced it. Propose forge improvements as part of finishing the work.") Specific enough to act on; not enforceable.

**Durable harness traps.** Failures about how the harness reads the repo, not about the code. The skill-loader scanning for shell-injection markers regardless of markdown context is an example: the loader behavior is constant, the warning survives any refactor. These are rare and worth their tokens.

**Pointers.** Where the rest of the discipline lives, named once. "Skills here apply to all three tools by default; the meta-forges are gated to Claude." A pointer is cheaper than the thing it points at and lasts longer.

**Framing caveats.** How to read what is here. The most useful caveat is the one that protects against drift: "Treat this file as intent. If a rule contradicts what you observe in the code, the code is authoritative." This single line buys the rest of the file resilience.

Deeper notes on the boundary cases, with examples of content that looks like one of the five but is not, are in [references/triage.md](references/triage.md).

## What it does not hold, and where it goes instead

| Candidate content | Goes to |
| :--- | :--- |
| File layout (`src/`, `tests/`, `bin/`) | Filesystem. Cut. |
| Dependency choices (pnpm, Vitest, Postgres) | `package.json`, lockfile, `.tool-versions`. Cut. |
| Lint or formatter conventions | Lint config, `.editorconfig`. Cut. |
| Build and test commands | `package.json` scripts, `Makefile`. The agent finds them. Cut. |
| "Always do X" enforcement | Hook (PreToolUse or PostToolUse). |
| "Never do Y" prohibition | Hook with exit code 2, or `permissions.deny` in settings. |
| Path-narrow conventions (`src/api/**`) | `.claude/rules/<name>.md` with `paths:`. |
| Procedure with steps (release, deploy, post-mortem) | Skill. |
| Personal preferences (your formatting tastes) | `~/.claude/CLAUDE.md` or auto-memory. |
| Personal project notes (sandbox URLs, scratch) | `CLAUDE.local.md` (gitignored). |
| Claude's own learnings about you | Auto-memory at `~/.claude/projects/<project>/memory/`. |
| External system schemas (DB, Notion) | MCP server. |

The auto-memory boundary catches people. Auto-memory is per-user, machine-local, captured by Claude. CLAUDE.md is committed, team-shared, authored by humans. They are not interchangeable. When an auto-memory entry stabilizes into a fact useful to anyone working in the repo, promote it. That is a tune-job moment.

**Confirm before handing off.** If the user asked for *this* fact to land in CLAUDE.md and triage moves it elsewhere (rule, hook, skill, auto-memory), apply the *announce → confirm → carry through* gate from `skill-forge`. Name the redirect in one line and wait for the go-ahead before invoking the companion forge. (Bulk audits don't need a confirm per filtered line; surface the pattern in the audit summary instead.)

## Quick dispatch — which job is this?

| Signal | Job |
| :--- | :--- |
| No CLAUDE.md, or only the `/init` template | **Bootstrap** |
| CLAUDE.md exists; user says "review", "audit", "rewrite", "too long"; or file is >200 lines / feels generic | **Audit** |
| CLAUDE.md exists; user wants one specific learning landed | **Tune** |
| AGENTS.md exists, CLAUDE.md doesn't (or vice-versa); user wants alignment | **Bootstrap** with the import pattern |
| AGENTS.md is the primary instruction file; user wants to audit or tune it | Run the matching job in **AGENTS.md mode** below |
| "Should this go in CLAUDE.md?" with one fact, ambiguous | Step 0 filters, then the table above |

If signals conflict, ask once.

## Job 1 — Bootstrap

There is no CLAUDE.md, or just the `/init` stub.

1. Run `/init` if no CLAUDE.md exists. Set `CLAUDE_CODE_NEW_INIT=1` for the multi-phase flow. The stub is starting material; don't reinvent the discovery.
2. If `AGENTS.md` already exists with substantive content, treat it as the source of truth. CLAUDE.md becomes `@AGENTS.md` at the top with a Claude-only addendum below (skills, hooks, plan-mode preferences). If no AGENTS.md and the user works with Codex too, ask once whether to scaffold AGENTS.md as primary.
3. Run every line of the `/init` output through Step 0. Most of it depicts current state and gets cut. Path-scoped content moves to `.claude/rules/<name>.md` (defer to rule-forge for design). Enforcement-shaped lines move to hooks (defer to hook-forge).
4. Write what is left in the voice of intent. See "Voice and shape" below.
5. Aim under 200 lines. If you are already over, the cut step missed.

Worked example in [references/jobs.md](references/jobs.md#bootstrap).

## Job 2 — Audit

CLAUDE.md exists and is bloated, stale, or wrong-surface. The most common job. Most CLAUDE.mds grew additively without a triage step and have absorbed content that belongs elsewhere.

1. Read everything in scope. All `CLAUDE.md` files (root and nested), `CLAUDE.local.md`, `AGENTS.md`, `.claude/rules/*.md`, and the auto-memory `MEMORY.md` index. Also read the things existing entries make claims about: `.claude-plugin/`, `bin/`, `package.json`, `.claude/settings*`, skill frontmatter. Stale fact-claims in retained entries are a common audit finding; you cannot spot them without the source side-by-side.
2. Score per-entry through Step 0, including the verification step. Four verdicts per line: **keep** (facts verified, passes all three filters), **move** (to path-rule, hook, skill, settings, or auto-memory), **cut** (depicts current state, or duplicated, or one-off, or obsolete, or contains an unverifiable fact-claim), **rewrite** (right surface, wrong shape or voice, or right intent with a wrong mechanism inside).
3. Show the table before editing anything. Two columns: entry, verdict. Get approval.
4. Apply the rewrite. Spin up `.claude/rules/<name>.md` files for path-scoped content (rule-forge handles their design). Note hooks the user should write (hook-forge handles those). Note auto-memory duplication so the user can drop or promote.
5. Cross-link, don't duplicate. When a rule file is spun up, mention it from CLAUDE.md as a pointer ("API conventions: see `.claude/rules/api.md`"), not as a restatement.
6. Re-check size. Under 200 lines. Most successful audits cut more than they move.
7. Sunset by model version. For each retained entry, ask whether the failure it prevents still happens. If not, cut.

If the user wants a numeric quality grade (commands documented? architecture present?) invoke `claude-md-management:claude-md-improver` instead — its rubric is the right tool for that purpose. The forge restructures by surface; the improver scores. They coexist.

Worked example in [references/jobs.md](references/jobs.md#audit).

## Job 3 — Tune

A recent session surfaced a durable insight. The user wants it encoded. The bar is high; most session insights do not pass Step 0.

1. Pick one candidate at a time. From the conversation, the diff, the user's pointer, or auto-memory's most recent entries.
2. Run Step 0. If it fails any filter, propose the right surface and stop.
3. If it passes, draft the entry in the voice of intent. Show the diff. Get approval.

For lightweight session capture without surface triage, the `/revise-claude-md` command is lighter. Use this skill's tune job when the candidate matters enough to do the triage right.

Worked example in [references/jobs.md](references/jobs.md#tune).

## When AGENTS.md is primary

Some repos use AGENTS.md as the agent-agnostic instruction file so Claude Code, Cursor, Codex, and other tools read the same source. CLAUDE.md, when present, is a thin Claude-only addendum.

Recognition signals:
- `AGENTS.md` exists at repo root with substantive content (not just `@CLAUDE.md`).
- Repo ships to multiple agents (Codex or Cursor referenced in docs, scripts, or commit history).
- CLAUDE.md is absent, very thin, or opens with `@AGENTS.md`.

The three jobs adapt:

**Bootstrap.** Scaffold AGENTS.md first using the spec's sections (dev environment, testing, PR instructions) plus project-specific surfaces. Create CLAUDE.md only if there is Claude-specific content to host. Lead with `@AGENTS.md` and keep the addendum to facts other tools would not act on (skill triggers, hook config, plan-mode behavior).

**Audit.** Run Step 0 on AGENTS.md content with one twist: tool-specific content does not belong in AGENTS.md either. Claude skill references, Cursor `.cursorrules` mentions, Codex-specific commands move to the matching tool-specific file. Capability-agnostic phrasing matters more here because multiple tools read it. "Match the codebase's enforced style" survives across tools; "Run `claude --debug`" does not.

**Tune.** Ask first: agent-agnostic or Claude-specific? Build commands, conventions, test discipline, PR rules go to AGENTS.md. Skill triggers, hook configuration, plan-mode preferences go to the CLAUDE.md addendum.

## Voice and shape

CLAUDE.md is read by an agent on arrival. Two consequences for how it should be written.

**Intent voice, not rulebook voice.** "We treat new artifacts as feedback for the forges" reads differently from "ALWAYS propose forge improvements." The first frames a disposition; the second performs enforcement the file cannot deliver. Imperative verbs are fine when they describe a behavior the model is welcome to interpret. Capital-letter ALWAYS / NEVER almost always means the content wants to be a hook.

**Reason inline where the reason matters.** Some retained entries do need a *why*: the rule conflicts with the model's defaults, depends on a constraint outside the file, or has an edge case where it applies differently. Anthropic's May 2026 *Teaching Claude Why* finding showed rules-with-reasons outperform unreasoned rules by ~7× on misalignment. Use the Why when it adds something the rule alone cannot say. Skip it when the rule is its own reason.

Use Why:
```
- Integration tests must hit a real database, not mocks. **Why:** prior incident where mock/prod divergence masked a broken migration. **How to apply:** any test under `tests/integration/`; for unit tests under `tests/unit/`, mocks are fine.
```

Skip Why:
```
- Treat this file as intent. If a rule contradicts what you observe in the code, the code is authoritative.
```

The audit job flags rules-without-why and asks per-rule: obvious convention or missing reason?

## Quantitative ceilings

Empirical findings from Osmani's May 2026 study, distilled:

- **Past 14 rules, compliance drops sharply** (76% → 52%). Hold to 14 top-level rules or fewer. Past the ceiling, content gets pattern-matched as "rules exist" without being read. The 200-line and 14-rule ceilings are two cuts of the same finding.
- **Examples cost ~3× as much context as rules** and induce overfitting. The model anchors on the example's specifics rather than the underlying principle. Prefer rules-as-statements. Use one concrete example only when prose cannot name the edge case.
- **Identity prompts and adverb noise underperform.** "Be careful," "think hard," "act like a senior engineer" — compliance hovers around 30%. The gap is between thinking and doing; adverbs do not close it. Replace with concrete imperatives ("state assumptions explicitly", "stop when confused and name what's unclear").
- **Capability-agnostic phrasing.** Rules tied to specific tools break silently when the tool is not there. "Match the codebase's enforced style" survives a missing eslint; "Always run eslint" fails silently.

A 200-line CLAUDE.md with 18 rules, three examples per rule, and "be careful" openers does roughly nothing. A 90-line CLAUDE.md with 12 reasoned, capability-agnostic rules does real work. A 40-line CLAUDE.md with five often does more, because what is there is read.

## Anti-patterns

The full catalog with the surface each should have used is in [references/anti-patterns.md](references/anti-patterns.md). The five most common:

1. **Current-state depiction.** Layouts, dependencies, framework versions, build commands. All visible in the code. CLAUDE.md restating them goes stale on the next commit and pays recurring tokens to mislead.
2. **Hook-shaped rules.** "ALWAYS lint before commit." "NEVER commit secrets." The model is asked to enforce; it cannot reliably. Convert to `PostToolUse` for advisory, `PreToolUse` for blocking.
3. **MCP-shaped instructions.** "Query the database for X." The database is not connected. Connect the MCP server first; the skill or rule can teach how to query well after.
4. **Path-narrow content.** "API endpoints under `src/api/` use this error format." Burns context for everyone editing UI. Move to `.claude/rules/api.md` with `paths:`.
5. **Missing-Why rules.** "Use cursor pagination." When? Why? The model cannot apply the rule outside the case it knows. Add the reason in line, or move to a path-scoped rule with the edge cases.

## Closing filters

Before saving:

- [ ] Every fact-claim in every retained entry verified against the source (filesystem, `package.json`, `.claude-plugin/`, `bin/`, settings, skill frontmatter). Intent voice does not protect against fact errors.
- [ ] Every retained entry passes Step 0 (refactor-stable, interpretation-not-enforcement, repo-wide).
- [ ] Under 200 lines and 14 top-level rules, or the user has explicitly accepted otherwise.
- [ ] No current-state depiction. No hook-shaped rules. No MCP-shaped instructions. No restated-obvious info.
- [ ] AGENTS.md handled: if it exists, CLAUDE.md imports via `@AGENTS.md` and the addendum is Claude-only.
- [ ] Path-scoped content moved to `.claude/rules/<name>.md` (rule-forge handed-off if non-trivial).
- [ ] No auto-memory duplication. Stable per-user notes promoted, ephemeral ones left.
- [ ] Voice is intent, not rulebook. ALWAYS / NEVER / "be careful" replaced or cut.
- [ ] Pre-ship: `bin/preship-check` clean.
- [ ] Sanity-tested: open a fresh session, see whether CLAUDE.md reads as the on-ramp the user wanted.

## When to cut an entry

CLAUDE.md content goes stale on two timelines. The model improves and the rule's failure stops reproducing. The codebase changes and the rule depicts something that no longer exists.

1. On each major model release, re-test the failures that earned each retained rule. If a `Why` cites an incident the current model no longer reproduces, cut.
2. Watch for entries quietly contradicting the code as it evolves. CLAUDE.md is rarely re-read by humans during normal work, so it drifts silently. The audit job is the corrective; the framing-caveat ("the code is authoritative") is the safety net while drift accumulates.
3. Generic anti-default boilerplate that was never tied to a project failure: cut on first audit.
4. Path-narrow rules that crept in: relocate.

The trajectory of a healthy CLAUDE.md is shorter, not longer.

## When this skill does not apply

- The user wants a numeric quality grade. Invoke `claude-md-management:claude-md-improver` — its rubric is the right tool.
- The user wants quick session capture without triage. The existing `/revise-claude-md` is lighter.
- The work is designing a `.claude/rules/<name>.md` file from scratch — that is rule-forge.
- The work is designing a hook or skill that CLAUDE.md should mention — go to hook-forge or skill-forge first; mention from CLAUDE.md after.
- The repo is not a Claude Code project. CLAUDE.md is Claude-Code-specific.

## See also

- [references/triage.md](references/triage.md) — surfaces in depth, the auto-memory boundary, edge cases.
- [references/jobs.md](references/jobs.md) — bootstrap / audit / tune in long form, worked examples.
- [references/anti-patterns.md](references/anti-patterns.md) — bad CLAUDE.md content with the surface each should have used.
- [references/interplay.md](references/interplay.md) — composing with `/init`, the `claude-md-management` plugin, auto-memory, AGENTS.md imports, `claudeMdExcludes`.
- `https://code.claude.com/docs/en/memory` — canonical reference for CLAUDE.md loading order, `claudeMdExcludes`, `--add-dir` behavior, AGENTS.md compatibility, and auto-memory mechanics. Trust this page over training data when details have moved.
