# Triage: which surface fits this fact?

CLAUDE.md is the most-tempting place for any rule, because it's always loaded. That's also why it bloats. This page is the long form of the six-surface table in SKILL.md. Use it when "should this be in CLAUDE.md?" is the actual question.

## The six surfaces

| Surface | What it gives you | Loaded when | Cost |
| :--- | :--- | :--- | :--- |
| **CLAUDE.md** | Always-on facts and conventions | Every session, in full | Recurring tokens, every turn |
| **`.claude/rules/<name>.md`** with `paths:` | Path-scoped facts | When matching files are touched | Recurring while in scope |
| **Auto-memory** (`~/.claude/projects/<project>/memory/MEMORY.md`) | Claude's own learnings, per-user | First 200 lines / 25KB at session start | One file in context |
| **Skill** | Knowledge or workflow, on demand | Description always; body when invoked | Description budget per session, body once invoked |
| **Hook** | Deterministic action on a lifecycle event | Event fires (PreToolUse, etc.) | Zero unless it returns output |
| **Settings** (`permissions.deny`, `claudeMdExcludes`, `autoMemory*`, etc.) | Configuration — rules the harness enforces, not Claude | Per their semantics | Negligible |

Skills and hooks are *not* substitutable with CLAUDE.md. CLAUDE.md is context; skills and hooks are behavior. A rule about "do this every time" almost never lives in CLAUDE.md alone — that's hook territory, with CLAUDE.md *describing* the hook for visibility.

## CLAUDE.md

**Belongs there:** facts that apply to the whole repo, every session, that Claude can't easily infer from the code, and that don't have edge cases requiring per-file scoping.

- Build commands and quick-start.
- Project-wide conventions ("we use pnpm not npm").
- Architecture map (one or two paragraphs, no more).
- Anti-defaults you keep re-explaining ("don't add error handling for impossible cases", "don't refactor adjacent code in a bug fix").
- Pointers to skills and rules that exist elsewhere (so Claude finds them).

**Does not belong there:**
- Per-directory facts (→ rule).
- Procedural workflows (→ skill).
- Enforcement that must hold every time (→ hook).
- Per-user preferences (→ `~/.claude/CLAUDE.md` or auto-memory).
- Information already obvious from the code or `package.json`.
- One-off fixes from past incidents that don't recur.
- Verbose explanations — every line is a recurring token cost.

**Size discipline:** target under 200 lines. The Anthropic docs use this number. When you're over, prefer splitting to a path-scoped rule before deleting content the user actually relies on.

**The `@import` escape valve:** CLAUDE.md can `@AGENTS.md` or `@docs/something.md` to keep the visible file short. Imports still expand into context at launch — they organize, they don't reduce cost. Use for shared content (AGENTS.md), not for hiding bloat.

## `.claude/rules/<name>.md` with `paths:`

**Belongs there:** facts that apply only when working in a slice of the repo, identifiable by glob.

- API endpoint conventions in `src/api/**`.
- Migration discipline in `supabase/migrations/**`.
- React patterns in `packages/ui/**`.
- Test conventions in `tests/**` or `**/*.test.ts`.

**Does not belong there:**
- Project-wide facts → CLAUDE.md.
- Procedural steps → skill.
- Enforcement → hook.

**Defer to rule-forge** for the actual rule design — globs, body shape, project-vs-personal scope, all of it. The forge here writes the *pointer* in CLAUDE.md ("API conventions: see `.claude/rules/api.md`") if a pointer is even needed; rules auto-load when their paths match, so often no pointer is needed at all.

## Auto-memory (`~/.claude/projects/<project>/memory/MEMORY.md`)

**Belongs there:** Claude's own observations, learnings from corrections, and per-user context — but it's already running unattended and writes itself. The forge isn't *generating* auto-memory entries; it's deciding when an existing one should be *promoted* to CLAUDE.md or a rule, and when something the user wants to capture is better left to auto-memory than written into CLAUDE.md.

The boundary that catches people:

| | CLAUDE.md | Auto-memory |
| :--- | :--- | :--- |
| **Who writes** | You | Claude |
| **Scope** | Team-shared (committed) | Per-user (machine-local) |
| **Loaded when** | Every session | First 200 lines of MEMORY.md every session; topic files on demand |
| **Stable?** | Yes — committed, reviewed | Less stable — Claude updates, removes, supersedes |
| **For** | Things every contributor needs | Things *you* keep correcting Claude on |

**Promotion rule of thumb:** if the same auto-memory entry shows up across multiple of your projects, or you've validated the same correction three times, it's a candidate for CLAUDE.md (project-shared) or `~/.claude/CLAUDE.md` (cross-project user scope). Don't pre-emptively promote; wait for stability.

**The reverse case** — content the user wants to *put into CLAUDE.md* that's actually personal. "I prefer to see test output in summary form, not verbose." That's `~/.claude/CLAUDE.md`, not the project's CLAUDE.md.

## Skill

**Belongs there:** procedures and bodies of knowledge that load on demand. Conventions, workflows, multi-step recipes, framework-specific deep-dives.

**Doesn't belong there (vs CLAUDE.md):** standing facts that apply every session, every turn. CLAUDE.md is cheaper for those — skills load only when invoked or when their description matches.

**Doesn't belong there (vs hook):** rules that must hold every time. Skills are interpreted by the model; hooks fire deterministically.

**Defer to skill-forge.** This page only cares about whether to *replace* a CLAUDE.md entry with a skill ("we have a deploy procedure, here are the 7 steps" is a skill, not a CLAUDE.md section). The forge there handles the design.

CLAUDE.md *should* mention skills that exist for the project, so Claude knows about them: "Release procedure: see `/release` skill." That's a one-line pointer in CLAUDE.md, with the actual content in the skill.

## Hook

**Belongs there:** deterministic, every-time enforcement. Block edits to `.env`. Lint after every Edit. Inject context on prompt submit. Block secrets from being read.

**Tell from CLAUDE.md by:** the rule's failure mode. If the model interpreting the rule produces the right behavior most of the time, CLAUDE.md is fine. If the rule must hold every time regardless of what the model decides, it's a hook. CLAUDE.md is context, not enforcement.

**Defer to hook-forge.** The forge here might mention a hook in CLAUDE.md ("This project has a pre-commit hook that runs typecheck. If it blocks, the typecheck output is in stderr.") — for *visibility*, not enforcement. The hook itself does the enforcing.

## Settings (`permissions.deny`, `claudeMdExcludes`, etc.)

**Belongs there:** configuration that the harness reads, not behavior the model interprets.

- `permissions.deny: ["Bash(rm -rf *)"]` — block tools.
- `claudeMdExcludes: ["**/monorepo/CLAUDE.md"]` — skip ancestor CLAUDE.md files.
- `autoMemoryEnabled: false` — disable auto-memory.
- `autoMemoryDirectory: "~/my-custom-memory-dir"` — relocate auto-memory.
- `disableSkillShellExecution: true` — disable dynamic context injection.

These are not CLAUDE.md content. Sometimes a CLAUDE.md will *describe* a settings choice ("we run with `claudeMdExcludes` skipping the mobile team's CLAUDE.md — see `.claude/settings.local.json`"); that's fine and useful, but the rule itself lives in settings.

## Spotting misplaced content

When auditing an existing CLAUDE.md, these phrases are tells:

| Phrase pattern | Should usually be |
| :--- | :--- |
| "ALWAYS X" / "NEVER Y" | Hook |
| "When working in `path/`, do X" | Path-scoped rule |
| "When deploying, do step 1, step 2, step 3..." | Skill |
| "Query the DB for X" / "Post to Slack X" | MCP server (+ optionally a skill) |
| "I prefer X" / "My preferred Y" (singular "I") | `~/.claude/CLAUDE.md` or auto-memory |
| "We use TypeScript" (when `package.json` says so) | Cut — already obvious |
| "This used to be X but we changed it" | Cut — historical, not current |

## Promotion paths

Surfaces are not write-once. Movement happens in both directions:

- **Auto-memory → CLAUDE.md:** stabilized correction, applies to whole team.
- **Auto-memory → rule:** stabilized correction, only applies to a slice of files.
- **CLAUDE.md → rule:** rule was project-wide-ish but really only applies to a subdirectory; pulling it out shrinks CLAUDE.md.
- **CLAUDE.md → skill:** rule was actually a procedure pretending to be a fact.
- **CLAUDE.md → hook:** rule was actually enforcement, and the model wasn't reliably enforcing it.
- **Rule → CLAUDE.md:** rule was repeated across enough rules that it's actually project-wide; consolidate up.
- **Skill → rule:** skill was always-relevant in some files; demoting to a rule drops the description-budget cost when not editing those files.

The audit job's whole job is recognizing which way each entry should move, and proposing the migration.
