# Interplay: composing with the rest of the harness

`claude-md-forge` doesn't replace the existing CLAUDE.md tooling. It triages, restructures, and writes reason-first content — the parts that the existing tools don't cover. Other operations remain better served by their existing tool.

This page lays out how each existing tool composes with the forge.

## `/init` (built-in)

**What it does:** Generates a starting CLAUDE.md by analyzing the codebase. Adds `package.json` commands, directory map, conventions discovered. Set `CLAUDE_CODE_NEW_INIT=1` for the multi-phase interactive flow that asks which artifacts (CLAUDE.md, skills, hooks) to set up and uses a subagent to explore before writing.

**When to use directly:** anytime you'd otherwise be writing the discovery boilerplate by hand. The output is generic, but it's a substrate worth starting from.

**How the forge composes:** the bootstrap job *runs `/init` first* (or assumes it ran), then post-processes the output: triages each fact through the six surfaces, moves path-scoped content to rules, cuts obvious-from-code restatements, adds reasons for non-obvious rules, offers the Karpathy anti-default menu.

**Practical recipe:** in a fresh repo, suggest `CLAUDE_CODE_NEW_INIT=1 claude` for the interactive flow, then run `/claude-md-forge` to refine the output.

## `claude-md-management:claude-md-improver` (Anthropic plugin)

**What it does:** scores CLAUDE.md against a 0–100 rubric across six criteria (commands, architecture, non-obvious patterns, conciseness, currency, actionability). Outputs a quality report, then proposes targeted *additions* with diffs and approval.

**When to use directly:** when the question is purely "does my CLAUDE.md cover the basics?" — quality grading, finding missing standard sections, additive touch-ups against current codebase state.

**How the forge composes:** the forge does *restructuring*; the improver does *grading and additive completion*. They're complementary. Recommended pattern:
1. Run `claude-md-management:claude-md-improver` to find what's missing or stale.
2. Run `claude-md-forge` (audit job) to triage the file structurally — what should move, what's miscategorized, what needs Why.
3. Apply both sets of changes.

The forge's audit job cites the improver in its output ("the improver flagged missing testing conventions; this triage suggests they go in `.claude/rules/tests.md` rather than CLAUDE.md, here's why").

**Don't replace the improver** — its rubric is well-tuned for objective scoring, and there's no reason to re-implement that.

## `/revise-claude-md` (same plugin)

**What it does:** single-pass session capture. Reflects on what was missing, finds CLAUDE.md files, drafts additions, shows changes, applies with approval.

**When to use directly:** quick session captures where the user wants everything in CLAUDE.md without surface-level triage. Lighter weight, fewer turns.

**How the forge composes:** the forge's tune job is the surface-aware version. Use `/revise-claude-md` for low-stakes captures; use the forge's tune job when:
- The candidate might be path-scoped (rule territory).
- The candidate might be enforcement (hook territory).
- The candidate might already be in auto-memory.
- The user wants the content reason-first.
- The session has multiple candidates worth differentiating.

The forge's tune job is allowed to call out to `/revise-claude-md` for the simple case after triage confirms "yes, plain CLAUDE.md addition, no triage needed."

## The `#` shortcut (built-in)

**What it does:** during a session, type `#` to have Claude auto-incorporate something into CLAUDE.md inline — fast capture, no triage, immediate edit.

**When to use directly:** trivial captures the user is sure about. "Add a note that we use pnpm." `#` and done.

**How the forge composes:** the forge's tune job is the structured equivalent. The forge can suggest `#`-worthy moments during a longer session ("this would be a `#`-able fact: 'always run --runInBand'") — the user can accept the suggestion via `#` without invoking the full forge flow.

## Auto-memory

**What it does:** Already running. Per-project at `~/.claude/projects/<project>/memory/`. Claude writes its own learnings, feedback, project notes, references. The first 200 lines of `MEMORY.md` (or 25KB) load every session.

**When to use directly:** auto-memory writes itself. Users interact with it via `/memory` to browse and edit, and via the CLAUDE.md instructions about when to save what (`user`, `feedback`, `project`, `reference` types).

**How the forge composes:** auto-memory is **per-user** and **machine-local**; CLAUDE.md is **team-shared** and **committed**. The forge:
- During audit, reads `MEMORY.md` to spot duplicates with CLAUDE.md (one source of truth).
- During tune, recommends auto-memory over CLAUDE.md when the candidate is per-user.
- Recommends *promoting* stable auto-memory entries to CLAUDE.md when they're broadly team-applicable (the user has had to retype the correction three times, or it's the same correction across multiple of their projects).

The promotion path: don't pre-emptively promote; let auto-memory hold the entry until it stabilizes. Once it's stable and team-relevant, promote to CLAUDE.md (or `.claude/rules/<name>.md` if path-scoped) and remove from auto-memory.

## AGENTS.md (cross-agent file format)

**What it is:** A growing convention for shared agent instructions across multiple coding agents (Claude Code, Codex, others). Claude Code reads `CLAUDE.md`, not `AGENTS.md`, but supports `@AGENTS.md` import syntax to bring it in. `/init` reads `AGENTS.md` (and `.cursorrules`, etc.) when generating.

**Patterns:**

**Pattern A — repos shared with Codex/other agents (most common today for cross-tool teams):**
```
AGENTS.md          # source of truth, shared across agents
CLAUDE.md          # one-line: @AGENTS.md, then a short Claude-only addendum
```

**Pattern B — Claude-only repos:**
```
CLAUDE.md          # everything here
```

**Pattern C — symlink (Unix only):**
```
ln -s AGENTS.md CLAUDE.md
```
Use when there's nothing Claude-specific to add. Doesn't work on Windows without dev mode.

**The forge's bootstrap job** detects which pattern fits:
- Existing AGENTS.md → propose Pattern A.
- No AGENTS.md, repo shared with Codex → ask whether to scaffold AGENTS.md as primary (Pattern A) or just CLAUDE.md (Pattern B).
- No AGENTS.md, Claude-only → Pattern B.

**The forge's audit job** detects mismatches:
- Both files exist with overlapping content → propose consolidating into AGENTS.md with `@AGENTS.md` import.
- Drift between them → flag and let user decide which is canonical.

**The forge does not modify Cursor's `.cursorrules` or Windsurf rules** — those are out of scope. AGENTS.md is the cross-agent convergence point.

## `claudeMdExcludes` (settings)

**What it is:** a settings field in `.claude/settings.local.json` (or any settings layer) that takes glob patterns. Matching CLAUDE.md files are skipped. Useful in monorepos where ancestor CLAUDE.md from other teams pollutes context.

**Example:**
```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

**The forge surfaces it** when:
- Auditing a project where the parent CLAUDE.md contains irrelevant content (suggest excluding rather than refactoring the parent).
- Bootstrapping a new package inside an existing monorepo where the root CLAUDE.md is bloated (excluding ancestor noise lets the new CLAUDE.md focus on package-local facts).

Note that managed-policy CLAUDE.md cannot be excluded.

## skill-forge / rule-forge / hook-forge handoffs

The forges compose. A CLAUDE.md design session frequently produces:

- **Path-scoped content** → handoff to rule-forge to design `.claude/rules/<name>.md`.
- **Enforcement** → handoff to hook-forge to design the hook in `.claude/settings.json` or skill frontmatter.
- **Multi-step procedure** → handoff to skill-forge to design `.claude/skills/<name>/SKILL.md`.

The forge here doesn't try to design those artifacts itself — same way skill-forge defers to hook-forge for hooks. The handoff is explicit: "this is a path-scoped rule; let me hand to rule-forge to design `.claude/rules/api.md` with the right `paths:` glob."

The reverse handoff happens too: skill-forge or rule-forge may produce a CLAUDE.md addition (a one-line pointer to the new skill or rule) and hand back to claude-md-forge to write it reason-first.

## A typical multi-tool flow

User says: "Set up CLAUDE.md for this project; my last one was bloated."

1. **claude-md-forge** picks bootstrap (no CLAUDE.md exists).
2. Recommends `CLAUDE_CODE_NEW_INIT=1` and runs `/init`.
3. Reads the stub, the codebase, package.json, AGENTS.md.
4. Triages each fact:
   - "API uses cursor pagination" → handoff to **rule-forge** to design `.claude/rules/api.md`.
   - "Lint before commit" → handoff to **hook-forge** to design a `PreToolUse` hook.
   - "Deploy procedure" → handoff to **skill-forge** to design a `/deploy` skill.
   - Build commands, project-wide conventions, anti-defaults → CLAUDE.md.
5. Writes CLAUDE.md reason-first, with Karpathy menu offered.
6. Final state: ~80-line CLAUDE.md, two new rules, one hook flagged for follow-up, a `/deploy` skill drafted but not yet shipped.

The user got a properly-distributed knowledge graph in one session, instead of a 320-line CLAUDE.md that the audit job would have to clean up six months later.
