# cookbooks/claude

A workshop for designing Claude Code skills and harness extensions. Not a product — artifacts here get copied or symlinked into other repos when wanted. Skills are written to be portable across repos with the same stack.

## Layout

This repo is a single-plugin Claude Code marketplace. Layout mirrors `claudialnathan/priors`.

- `.claude-plugin/{marketplace,plugin}.json` — marketplace + plugin manifests.
- `skills/<name>/` — the skills. Each stands alone. Source of truth for all three tools (Claude / Cursor / Codex).
- `.claude/skills/` — symlink → `../skills`, so project-scope discovery still works inside this repo while authoring.
- `commands/`, `hooks/`, `agents/` — plugin commands/hooks/subagents (populated as needed).
- `bin/sync-cross-tool` — idempotent symlink syncer into `~/.cursor/skills/` and `~/.codex/skills/`.
- `bin/preship-check` — runs the validation gates from this file (loader-trigger greps, frontmatter required fields, frontmatter size, reference orphans/dangling). Run before commits.
- `FYI.md` — install/update/troubleshoot playbook. Not loaded into context; read when setting up the publish flow or debugging propagation.
- `guides/` — companion notes that don't load into context: README tour, harness-state snapshots, private design notes.

## The skills

Four meta-skills (about the harness itself) and three applied skills:

- **`skill-forge/`** — designs *other* skills. Triages requests to the right surface (CLAUDE.md, path-scoped rule, hook, MCP server, subagent, or skill), then drafts the skill when that's the answer.
- **`hook-forge/`** — designs hooks. Picks the event, the determinism mode, and the handler shape.
- **`rule-forge/`** — designs path-scoped rules at `.claude/rules/<name>.md`.
- **`claude-md-forge/`** — designs CLAUDE.md (and AGENTS.md, CLAUDE.local.md, .claude/rules/ alongside it). Three jobs: bootstrap (new repo or thin `/init` output), audit (existing CLAUDE.md is bloated/stale/wrong-surface), tune (recent learnings need the right surface). Reason-first content shape.
- **`cache-aware-testing/`** — applied skill for testing Next.js 16 Cache Components apps on a Vitest + Playwright + Supabase + shadcn stack.
- **`shadcn-tailwind/`** — applied skill encoding shadcn (4.x on Base UI) + Tailwind v4 discipline. Auto-loads on UI files via `paths:`.
- **`design-engineer/`** — applied skill, single source of truth for design-engineering discipline on shadcn (Base UI) + Tailwind v4 + Next.js + Vercel. The stance (slow down, fluid before fixed, layout primitive before custom layout, container query before viewport breakpoint, frequency-aware motion), reflex stack (Every Layout primitives, smolcss, modern-CSS), proactive polish (concentric radii, tabular numbers, text-wrap balance, scale-on-press, focus-visible rings) added unprompted, and Motion + Base UI integration. Composes with `emil-design-eng` (defers for animation craft) and `web-design-guidelines` (defers for Vercel checklist). Auto-loads on UI files via `paths:`. Six bundled references: layout, fluid, motion-base-ui, polish, taste, checklist.

The meta-skills compose: skill-forge triages and, when the right answer is a hook, a rule, or non-trivial CLAUDE.md design, hands off to hook-forge, rule-forge, or claude-md-forge to *actually* produce the artifact. "Make a skill" doesn't always end with a skill.

## Publishing across tools

Skills here flow to three places:

1. **Claude Code in this repo (project scope)** — live via the `.claude/skills` → `../skills` symlink. No action needed while authoring.
2. **Claude Code in other repos (user/global scope)** — via the marketplace plugin. Install once: `/plugin marketplace add /Users/claudianathan/repos/cookbooks/harness` (local), then `/plugin install claudia@harness`. Refresh with `/plugin marketplace update harness`.
3. **Cursor and Codex** — via symlinks at `~/.cursor/skills/<name>` and `~/.codex/skills/<name>`. Run `bin/sync-cross-tool` after adding/removing a skill (idempotent; supports `--dry-run`).

Per-skill targeting via optional `harness-targets:` frontmatter. Absent → all three tools. Set to `[claude]` for Claude-Code-specific skills (the three meta-skills are tagged this way; applied skills are unset = published everywhere). Other tools ignore unknown frontmatter, so the field is non-invasive.

## New artifacts are feedback for the forges

The user comes to this repo specifically to design new skills, rules, and hooks. Every one of those is also evidence about the relevant forge. When a session here creates a new artifact, after delivery ask:

- What was friction during the design? Did the forge anticipate this kind, or did you have to improvise?
- Was anything missing from the forge's triage, kinds, frontmatter guidance, or worked examples?
- Did any anti-pattern bite that the forge doesn't currently warn about?
- Did the artifact's shape suggest a kind/example/section the forge should learn?

Propose updates to skill-forge / hook-forge / rule-forge based on what surfaced — not as a separate ask the user has to remember, but as part of finishing the work. The forges sharpen with use; an artifact that revealed a gap is more valuable as a forge improvement than as a one-off.

## Model-version pinning

Skills, hooks, rules, and CLAUDE.md entries are earned against a specific model. Both the failure and the model move. The discipline that keeps the forge tree honest:

- Each non-trivial artifact records the model version it was earned against, in the artifact's `Why` line or as a stripped HTML comment (e.g., `<!-- Earned against: Sonnet 4.4, 2026-03-15 -->`). HTML comments cost zero context tokens.
- On each major model release, re-test the failures that earned the artifacts. Delete the ones whose failures no longer reproduce; rewrite the ones whose failures have shifted.
- This is the deletion side of the Ratchet — failures earn rules, capable models retire them. The forges have `When … stops earning its keep` sections that reference this convention.

Without the pin, the audit has no trigger and obsolete scaffolding accumulates. Harnesses don't shrink, they move; the move only happens if the audit happens.

## Trajectory and governance

Current trajectory: workshop-scale, evidence-driven growth into more meta-forges and more applied skills (B + C in `guides/trajectory-2026-05-08.md`). ECC-scale catalogues and public-template repositioning are off the table. Two governance gates before adding a new forge or applied skill: (1) **triage gap is real** — there's a class of artifact the existing forges don't cover, or discipline that gets retyped in a stack; (2) **first worked example is in hand** — never ship an empty forge or stack-tagged skill. Tier 1 maintenance touch-ups (auditing existing forges against current harness affordances) are exempt from gate 2. The candidate-moves inventory in the trajectory doc is not a backlog to drain.

## Authoring footgun: skill loader trigger sequences

The skill loader scans skill file contents for **dynamic-context injection markers** before rendering. It matches on literal bytes, regardless of markdown context. Two sequences will be intercepted as shell commands and break the skill at load time:

1. **Triple-backtick followed by an exclamation mark** (the fenced injection opener).
2. **Single backtick followed by an exclamation mark, inline** (the inline injection form).

Both fire even when wrapped in code fences, double-backtick spans, or block quotes. **Never write either sequence verbatim in a skill file.** This has caused two real failures already.

When you need to *document* the injection syntax (e.g., inside skill-forge), use prose ("triple-backtick then exclamation mark") or a placeholder like `[INJECT: <command>]`. Don't render the raw bytes.

Pre-ship greps (run from repo root). The byte order matters — triggers are *backticks-then-bang* (fenced) and *bang-then-backtick* (inline), not the reverse:

```bash
# fenced trigger: three backticks immediately followed by an exclamation mark
grep -rln $'\x60\x60\x60!' skills/
# inline trigger: an exclamation mark immediately followed by a backtick
grep -rln $'!\x60' skills/
```

Both should return nothing. If they don't, fix before committing or copying.

## Validation before shipping a skill

1. **Frontmatter parses.** `name:`, `description:`, `when_to_use:` all present.
2. **`description:` + `when_to_use:` combined under 1,536 chars.** That's the discovery budget; over-budget skills are silently truncated.
3. **`paths:` globs match real files.** A glob that never matches means the skill never auto-loads. Test with `find . -path '<glob>'`.
4. **Body terse.** ~5K compaction budget per loaded skill; 25K shared across all loaded skills. Padding bloats every session that triggers it.
5. **No loader trigger sequences** (run the greps above).
6. **References are referenced.** Files in `references/` should be pointed to from SKILL.md — orphans are dead weight.

## Naming: avoid collisions with personal scope

Personal skills at `~/.claude/skills/<name>/` shadow project skills with the same name. Anthropic ships `skill-creator` in personal scope, which is why the project meta-skill is called `skill-forge` — same for `hook-forge`, `rule-forge`. Names here must differ from anything in personal scope or the personal one wins silently.

## guides/

- `README_skillforge.md` — public-facing tour of the skill-forge family. Update when the family changes shape.
- `claude-code-state-2026-05.md` — snapshot of harness facts as of May 2026. Frozen in time; trust the canonical docs at `https://code.claude.com/docs/en/` on details that move.
- `skill-forge-design-notes.md` — workshop notes, less-settled decisions, things to revisit. Private.
- `trajectory-2026-05-08.md` — option space, recommended direction, candidate-moves inventory. Snapshot; replace when superseded.
- `baseline-bakein-2026-05-09.md` — copyable starter pack for `globals.css` on shadcn 4.x + Tailwind v4 + Next.js. Triages Baseline / modern-CSS features as bake / `@utility` / skip with dated browser-support notes. Refresh by 2026-11.

## Dates

Use absolute YYYY-MM-DD in skills, references, and memory. Relative phrases ("last month", "recently") rot fast and the snapshots here are explicitly dated for that reason.

## What lives where

- **A skill** — procedure, workflow, kind-specific judgment. Loads when triggered by description match or path match.
- **A path-scoped rule** — facts about a slice of the codebase. Loads when matching files are open.
- **CLAUDE.md (this file)** — facts about the whole repo, all the time. Keep under ~200 lines.
- **`guides/`** — design thinking, snapshots, public docs. Not loaded into context.
- **Auto-memory** — user preferences, project context, feedback. Persists across sessions.

If you're tempted to add to this file "for the X skill we do Y" — that's content for skill X itself, not CLAUDE.md.

## Treat this file as intent, not current truth

Rules here reflect what was true at time of writing. If you see them contradicted by current code — commands that fail, paths that are gone, conventions the codebase has moved away from — flag the contradiction before relying on the rule. The audit job in `claude-md-forge` is the fix path; don't silently work around drift.
