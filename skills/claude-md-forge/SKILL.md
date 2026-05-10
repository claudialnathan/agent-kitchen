---
name: claude-md-forge
description: |
  Designs CLAUDE.md and adjacent project-instruction files (CLAUDE.local.md, AGENTS.md, .claude/rules/) for Claude Code. Triages content across the six harness surfaces — CLAUDE.md, path-scoped rules, auto-memory, skills, hooks, settings — so each piece of project knowledge lives where it earns its keep. Three jobs: bootstrap (new repo or thin /init output), audit (existing CLAUDE.md is bloated, stale, or wrong-surface), tune (recent-session learnings need to land somewhere correct). Different from /init (generic scaffold) and claude-md-improver plugin (additive 0–100 quality grading) — this skill restructures by surface and writes rules with reasons, applying the harness's auto-memory Why/How-to-apply discipline plus Anthropic's May 2026 "Teaching Claude Why" finding.
when_to_use: |
  Triggers:
  - "set up CLAUDE.md", "create CLAUDE.md", "bootstrap CLAUDE.md", "init project for claude"
  - "review my CLAUDE.md", "audit my CLAUDE.md", "rewrite CLAUDE.md", "CLAUDE.md is too long", "split CLAUDE.md"
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

Designs CLAUDE.md (and the files that surround it: `CLAUDE.local.md`, `AGENTS.md`, `.claude/rules/`) so each piece of project knowledge lives on the surface that earns its keep. The default failure mode in 2026 is *piling onto CLAUDE.md*: the file grows past 200 lines, half of it duplicates auto-memory, a third should be path-scoped rules, and the rules that remain are stated without reasons — so the model treats them as soft suggestions and you re-explain them next session.

This skill does **two** things:

1. **Triage** — interrogate whether a fact belongs in CLAUDE.md *at all*, and if not which surface fits.
2. **Shape** — write the entry (or restructure the file) so it survives compaction with its meaning intact.

Three jobs share the triage and shape; the body opens with a quick dispatch.

If you only learn one thing here: **CLAUDE.md is loaded in full every turn. Every line is a recurring token cost. The minute a rule's *why* could be guessed wrong, it needs to be stated.**

## Step 0 — What failure did you observe?

Every CLAUDE.md entry, every rule, every promotion from auto-memory should answer one question: *what mistake does this prevent?* The May 2026 *Teaching Claude Why* finding made this measurable — rules earned by failure, with their reason stated, beat unreasoned rules by ~7× on misalignment. The same logic applies upstream: rules earned by *speculation* underperform rules earned by *observation*.

Before any triage, name the failure:

- A specific incident (the agent did X; we had to revert).
- A repeated correction (you've said the same thing three or more times).
- A class of failure visible in code review on this codebase.

If you can't name one, the entry is speculative. The cheapest place for a "we might want X" rule is *not yet anywhere*. Wait for the failure.

If the failure is one the current model has stopped making, this entry is obsolete on arrival. Don't write it. Record the model version this entry is earned against (see the repo's `Model-version pinning` convention) so the audit job has a deletion trigger.

## Quick dispatch — which job is this?

The user's phrasing plus the repo state usually settles it in one read.

| Signal | Job |
| :--- | :--- |
| No CLAUDE.md, or only the literal `/init` template | **Bootstrap** |
| CLAUDE.md exists; user says "review", "audit", "rewrite", "is too long", or it's >200 lines / feels generic | **Audit** |
| CLAUDE.md exists; user wants to add a single specific learning from this session | **Tune** |
| AGENTS.md exists, CLAUDE.md doesn't (or vice-versa) and user wants alignment | **Bootstrap** (with the import pattern) |
| User asks "should this go in CLAUDE.md?" — single fact, ambiguous | Run the **six-surface triage** below; the answer often isn't CLAUDE.md |

If signals conflict, ask once. Don't loop on it.

## The six-surface triage

Before writing anything to CLAUDE.md — every job uses this. The first match wins.

| Surface | Use when | Don't use when |
| :--- | :--- | :--- |
| **Hook** (`.claude/settings.json`, frontmatter) | The rule must hold every time, deterministically. "Block writes to .env." "Lint after every edit." | The rule is a soft preference. Hooks make this rigid. |
| **MCP server** | Claude needs an external system the harness can't see (DB, Notion, Slack). | The work is local. |
| **Subagent / `context: fork`** | Side task floods main context (test runs, scraping, deep exploration). | The work is core to the main thread. |
| **CLAUDE.md** | Short, broadly applicable facts true *everywhere* in the repo. Build commands. Project-wide conventions. Anti-defaults you keep re-explaining. | The fact is path-scoped, ephemeral, or one-off. |
| **`.claude/rules/<name>.md`** with `paths:` | Facts apply only when working in a slice (`src/api/**`, `migrations/**`). | The fact applies project-wide → CLAUDE.md. |
| **Auto-memory** (`~/.claude/projects/<project>/memory/`) | Per-user learnings, feedback, project context Claude itself observes. Already running unattended. | Team-shared rules. Auto-memory is per-user; CLAUDE.md is committed. |
| **Settings** (`permissions.deny`, `claudeMdExcludes`, `autoMemoryEnabled`) | Configuration, not behavior. Block tools. Hide noisy ancestor CLAUDE.md files in monorepos. | The rule needs Claude's interpretation. |

The auto-memory boundary catches people. **Auto-memory holds Claude's own learnings (per-user, machine-local). CLAUDE.md holds user-authored, team-shared instructions (committed).** When an auto-memory entry stabilizes into a broadly-useful fact, *promote* it to CLAUDE.md or a rule — that's a tune-job decision.

Deeper version of this section, with edge cases and how to recognize misplaced content, in [references/triage.md](references/triage.md).

## Job 1 — Bootstrap

When CLAUDE.md is absent or is just the `/init` stub.

### Steps

1. **Run `/init` first** if no CLAUDE.md exists. Set `CLAUDE_CODE_NEW_INIT=1` for the multi-phase interactive flow if the user hasn't already. The stub is your starting material — don't reinvent the discovery work.
2. **Detect AGENTS.md.** If `AGENTS.md` already exists in the repo, treat it as the source of truth and have CLAUDE.md import it: a one-line `@AGENTS.md` at the top, with a Claude-only addendum below for anything Claude-specific (skills behavior, plan-mode preferences, etc.). If no AGENTS.md and the user works with Codex too, ask once whether to scaffold AGENTS.md as primary instead.
3. **Triage the `/init` output through the six surfaces.** Move path-scoped content to `.claude/rules/<name>.md` (defer to rule-forge for design). Move enforcement-shaped lines ("never edit X") to a hook (defer to hook-forge). Cut content that duplicates what's obvious from the code.
4. **Write reason-first.** Every non-obvious rule gets a Why in the same line; obvious conventions (build commands, "we use pnpm") don't. See the *Reason-first* section below.
5. **Offer the anti-default menu.** Karpathy-era 2026 LLM failure modes — wrong assumptions run silently, no pushback, premature abstraction, no cleanup, claiming success without testing. These aren't universal; offer them as opt-in additions tailored to the project, not boilerplate.
6. **Size check.** Aim under 200 lines. If you're already over, the bootstrap is doing too much — split into rules.

Worked example and the long-form steps for monorepos are in [references/jobs.md](references/jobs.md#bootstrap).

## Job 2 — Audit

When CLAUDE.md exists and the user wants a structural review (or the file is over 200 lines, or feels generic, or stale).

### Steps

1. **Read everything in scope.** All `CLAUDE.md` files (root + nested), `CLAUDE.local.md`, `AGENTS.md`, `.claude/rules/*.md`, and the auto-memory `MEMORY.md` index at `~/.claude/projects/<project>/memory/MEMORY.md`. You're looking for redundancy, contradiction, and misplaced content.
2. **Score per-line, not per-file.** For each entry, decide: keep / move to rule / move to skill / move to hook / move to settings / move to auto-memory / delete (already obvious from code, or one-off, or stale).
3. **Output a triage table** before editing anything. Two columns: the entry, the verdict. Get user approval before rewriting.
4. **Apply the rewrite.** Keep CLAUDE.md focused on always-on, broadly applicable, reasoned facts. Spin up `.claude/rules/<name>.md` files for path-scoped content (rule-forge handles their design). Open issues for hooks the user should write (hook-forge handles those). Note auto-memory duplication explicitly so the user can decide whether to drop or promote.
5. **Re-check size and reasoning.** Under 200 lines. Every non-obvious entry has a Why.
6. **Cross-link.** If the audit produces new rules, mention them at the relevant section of CLAUDE.md ("framework conventions: see `.claude/rules/api.md`"). Don't duplicate content.
7. **Sunset by model version.** For each entry, ask: *if I pull this rule, does the failure it prevents still happen on the current model?* If not, delete. The trigger for this audit is each major model release — rules earned against an older model often outlive their failure mode. Harnesses don't shrink, they move; the audit is the move.

If the user only wants quality grading (commands present? architecture documented?), invoke `claude-md-management:claude-md-improver` instead — its 0–100 rubric is well-tuned for that single purpose. The forge restructures by surface; the improver scores and touches up. They coexist.

Worked example with a real bloated CLAUDE.md and the resulting splits is in [references/jobs.md](references/jobs.md#audit).

## Job 3 — Tune

When the recent session surfaced something useful and the user wants to encode it. Distinct from auto-memory, which captures Claude's own learnings unattended — tune is the user-driven *promotion* moment.

### Steps

1. **Identify candidates.** From the recent conversation, the diff, the user's pointer, or auto-memory's most recent entries. One candidate at a time.
2. **Triage each through the six surfaces.** "We discovered the test runner needs `--runInBand`" → is this all tests, or just the integration suite? If just `tests/integration/**`, it's a rule, not CLAUDE.md. If all tests, and worth re-saying every session, CLAUDE.md.
3. **Pre-cull.** Skip one-off fixes, things obvious from the code now, things already in auto-memory and not stable enough to promote, things that duplicate an existing rule.
4. **Write the entry reason-first.** Show the diff. Get approval.
5. **If the right surface isn't CLAUDE.md, redirect.** "This is path-scoped to `tests/integration/`; want to add it to `.claude/rules/integration-tests.md` instead?" Defer to rule-forge.

For quick capture without surface triage, the existing `/revise-claude-md` command is fine — it's the lighter-weight tool. Use this skill's tune job when the candidate matters enough to do the triage right.

Worked example in [references/jobs.md](references/jobs.md#tune).

## Reason-first content shape

Anthropic's May 2026 *Teaching Claude Why* finding showed that training on rules + deliberation reduced misalignment by ~7× over training on aligned demonstrations alone. The result is about training; the principle generalizes. A rule the model can re-derive from a stated reason survives edge cases that bare rules don't.

The harness's auto-memory format already requires this for `feedback` and `project` entries: lead with the rule, then `**Why:**`, then `**How to apply:**` if there's an edge-case kicker. Bring the same discipline to CLAUDE.md content where the reason isn't obvious.

**Use the format when** the rule could conflict with the model's defaults, depends on a constraint outside the file, or has an edge case where it kicks in differently. **Skip it when** the rule is just a convention reflected in the code itself.

Use Why:
```
- Integration tests must hit a real database, not mocks. **Why:** prior incident where mock/prod divergence masked a broken migration. **How to apply:** any test under `tests/integration/`; for unit tests under `tests/unit/`, mocks are fine.
```

Skip Why:
```
- Use pnpm, not npm.
- Run `pnpm typecheck` before committing.
- Source lives in `src/`, tests in `tests/`.
```

The audit job flags rules-without-why and asks per-rule: obvious convention or missing reason?

## Quantitative ceilings

Empirical findings from Osmani's May 2026 study on CLAUDE.md compliance, distilled into operating limits:

- **Past 14 rules, compliance drops sharply** (76% → 52% in the study). Stay at or under 14 top-level rules. If the file has more, split by surface: path-scoped rules to `.claude/rules/`, workflows to skills, hard guarantees to hooks. The 200-line ceiling and the 14-rule ceiling are different cuts of the same finding — past either, content gets pattern-matched as "rules exist" without being read.
- **Examples cost ~3× as much context as rules** and induce overfitting (the model anchors on the example's specifics rather than the underlying principle). Prefer rules-as-statements over rules-as-examples. Use a single concrete example only when the rule's edge cases can't be named in prose.
- **Identity prompts and adverb noise underperform.** "Be careful," "think hard," "really focus," "act like a senior engineer" — compliance hovers around 30%. The model already thinks it's senior; the gap is between thinking and doing, and adverbs don't close it. Replace with concrete imperatives ("state assumptions explicitly", "stop when confused, name what's unclear").
- **Capability-agnostic phrasing.** Rules that depend on tooling that may not exist break silently when it isn't there. "Match the codebase's enforced style" survives a missing eslint; "Always run eslint" fails silently. Phrase around behaviors and outcomes, not specific tools — let the agent discover the local capability and adapt.

These compound. A 200-line CLAUDE.md with 18 rules, three examples per rule, and "be careful" openers is doing roughly nothing. A 90-line CLAUDE.md with 12 reasoned, capability-agnostic rules is doing real work.

## 2026 harness affordances most often missed

| Affordance | Use for |
| :--- | :--- |
| `@AGENTS.md` import in CLAUDE.md | Repos shared with Codex/other agents — single source of truth, Claude-specific addendum below. |
| `claudeMdExcludes` in `.claude/settings.local.json` | Monorepos where ancestor CLAUDE.md from other teams pollutes context. Pattern-glob-based skip list. |
| `~/.claude/CLAUDE.md` (user scope) | Personal preferences across all projects (formatting tastes, language preferences). Not for project-specific facts. |
| `CLAUDE.local.md` (gitignored personal project notes) | Per-machine sandbox URLs, your test data paths. Add to `.gitignore`. |
| `<!-- maintainer notes -->` HTML comments | Notes for human maintainers. Stripped before context injection — costs zero tokens. |
| `#` shortcut during a session | Inline auto-incorporate — for trivial captures. The forge's tune job is the structured version. |
| `CLAUDE_CODE_NEW_INIT=1` for `/init` | Multi-phase interactive flow that asks which artifacts to set up (CLAUDE.md, skills, hooks). Better starting material than the bare command. |
| Auto-memory at `~/.claude/projects/<project>/memory/` | Already running. CLAUDE.md is committed/team-shared; auto-memory is per-user. Don't duplicate; promote when stable. |

## Anti-patterns: top five

The full catalog with the surface each should have used is in [references/anti-patterns.md](references/anti-patterns.md). The five most common in audits:

1. **Hook-shaped rules.** "ALWAYS lint before commit." The model is being asked to enforce; it can't reliably. → Convert to a `PostToolUse` hook (or `PreToolUse` for blocking).
2. **MCP-shaped instructions.** "Query the database for user counts before answering." The database isn't connected. → Connect the MCP server first; the rule can teach how to query it well after.
3. **Restated-obvious info.** "We use TypeScript. The frontend is React." The package.json says so. → Cut. CLAUDE.md is for things Claude can't guess.
4. **Missing why on edge-case rules.** "Use cursor pagination." Why? When? Now the model can't apply the rule when an unusual case arises. → Add the reason in line, or move to a path-scoped rule with examples.
5. **Path-narrow content.** "API endpoints under `src/api/` use this error format." Burns context for everyone editing UI code. → Move to `.claude/rules/api.md` with `paths: ["src/api/**/*.ts"]`.

## Closing checklist

Before saving the rewrite or commit:

- [ ] Triaged: every entry confirmed to belong on the surface it's on (CLAUDE.md vs rule vs auto-memory vs skill vs hook vs settings).
- [ ] CLAUDE.md is under 200 lines (target) or the user has explicitly accepted bigger and split where possible.
- [ ] Every non-obvious rule has a stated Why; obvious conventions don't have noise added.
- [ ] AGENTS.md handled: if it exists, CLAUDE.md imports it via `@AGENTS.md` and the addendum is Claude-only.
- [ ] No hook-shaped rules, MCP-shaped instructions, or restated-obvious info.
- [ ] Path-scoped content moved to `.claude/rules/<name>.md` (rule-forge handed-off if non-trivial).
- [ ] No duplication with auto-memory; stable per-user notes promoted, ephemeral ones left where they are.
- [ ] Pre-ship: `bin/preship-check` clean; loader-trigger greps return zero matches.
- [ ] Sanity-tested: open a fresh session, see whether CLAUDE.md still reads as the on-ramp the user wanted.

## When CLAUDE.md content stops earning its keep

CLAUDE.md is loaded every turn. Every line that doesn't earn its tokens is paying rent on context that other content needs. The deletion side of the Ratchet:

1. On each major model release, re-test the failures that earned each rule. If a rule's `Why` cites an incident the current model can no longer reproduce, pull the rule.
2. Rules whose failures have shifted: rewrite against the new failure rather than layering on top.
3. Generic boilerplate that was never tied to a project failure: cut on first audit. The Karpathy-anti-default boilerplate pattern is the most common offender.
4. Path-narrow rules that crept in: relocate to `.claude/rules/<name>.md` rather than letting them tax everyone else's context.

The audit job is the structured form of this. Run it on each major model release at minimum.

## When this skill doesn't apply

- The user wants a numeric quality score (commands present? architecture documented?). Invoke `claude-md-management:claude-md-improver` directly — its rubric is the right tool.
- The user wants quick session capture without triage. The existing `/revise-claude-md` command is lighter; use that.
- The work is designing a `.claude/rules/<name>.md` file from scratch — that's rule-forge.
- The work is designing a hook or skill that CLAUDE.md should mention — go to hook-forge or skill-forge first; mention from CLAUDE.md after.
- The repo isn't a Claude Code project. CLAUDE.md is Claude-Code-specific.

## Methodology note

The canonical reference is `https://code.claude.com/docs/en/memory`. CLAUDE.md loading order, comments stripping, `claudeMdExcludes`, `--add-dir` behavior, AGENTS.md compatibility, and auto-memory mechanics all live there. Trust the canonical page over training data when details have moved.

## See also

- [references/triage.md](references/triage.md) — the six surfaces in depth, the auto-memory boundary, edge cases.
- [references/jobs.md](references/jobs.md) — bootstrap / audit / tune in long form, with worked examples and monorepo edge cases.
- [references/anti-patterns.md](references/anti-patterns.md) — bad CLAUDE.md content with the surface each should have used.
- [references/interplay.md](references/interplay.md) — composing with `/init`, the `claude-md-management` plugin, auto-memory, the `#` shortcut, AGENTS.md imports, `claudeMdExcludes`.
- `https://code.claude.com/docs/en/memory` — canonical reference.
