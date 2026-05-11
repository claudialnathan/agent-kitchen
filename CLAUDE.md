# cookbooks/claude

A workshop for designing Claude Code skills and harness extensions. Not a product — artifacts here get copied or symlinked into other repos when wanted. Skills are written to be portable across repos with the same stack.

## Layout

This repo is a single-plugin Claude Code marketplace. Layout mirrors `claudialnathan/priors`.

- `.claude-plugin/{marketplace,plugin}.json` — marketplace + plugin manifests.
- `skills/<name>/` — the skills. Each stands alone. Source of truth for all three tools (Claude / Cursor / Codex).
- `rules/<name>.md` — path-scoped rules produced by `rule-forge`. Source of truth; Claude-only surface. Empty until the first rule lands.
- `.claude/skills/` → `../skills` and `.claude/rules/` → `../rules` — symlinks so project-scope discovery works inside this repo while authoring.
- `.claude/hooks/` — project-scoped hooks active while authoring (currently `protect-skills.sh`).
- `hooks/`, `agents/` — plugin hooks/subagents distributed via the marketplace plugin. Empty until populated.
- `bin/sync-cross-tool` — idempotent symlink syncer into `~/.cursor/skills/` and `~/.codex/skills/`.
- `bin/preship-check` — validation gates (loader-trigger greps, frontmatter required fields, frontmatter size, reference orphans/dangling). Run before commits.
- `guides/` — companion notes, gitignored and local-only. Design thinking, snapshots, public-template drafts. Not loaded into context, not shipped with the plugin.

## The skills

Meta-skills (about the harness itself), each gated to Claude only via `harness-targets: [claude]`:

- **`skill-forge/`** — designs *other* skills. Triages requests to the right surface (CLAUDE.md, path-scoped rule, hook, MCP server, subagent, or skill), then drafts the skill when that's the answer.
- **`hook-forge/`** — designs hooks. Picks the event, the determinism mode, and the handler shape.
- **`rule-forge/`** — designs path-scoped rules at `.claude/rules/<name>.md`.
- **`claude-md-forge/`** — designs CLAUDE.md (and AGENTS.md, CLAUDE.local.md, .claude/rules/ alongside it). Three jobs: bootstrap, audit, tune. Reason-first content shape.

Applied skills (stack-specific or task-specific discipline), distributed to all three tools:

- **`cache-aware-testing/`** — testing Next.js 16 Cache Components apps on a Vitest + Playwright + Supabase + shadcn stack.
- **`shadcn-tailwind/`** — shadcn (4.x on Base UI) + Tailwind v4 discipline. Auto-loads on UI files via `paths:`.
- **`design-engineer/`** — design-engineering discipline for shadcn (Base UI) + Tailwind v4 + Next.js + Vercel. Stance, reflex stack, proactive polish (concentric radii, tabular numbers, text-wrap balance, scale-on-press, focus-visible rings), Motion + Base UI integration. Composes with `emil-design-eng` (defers for animation craft) and `web-design-guidelines` (defers for Vercel checklist). Auto-loads on UI files via `paths:`.
- **`saltintesta/`** — writing tone for prose meant to be read with attention. Built on Paul Graham's "Write Simply."

The meta-skills compose: skill-forge triages and, when the right answer is a hook, a rule, or non-trivial CLAUDE.md design, hands off to hook-forge, rule-forge, or claude-md-forge to *actually* produce the artifact. "Make a skill" doesn't always end with a skill.

## Publishing across tools

Skills here flow to three places:

1. **Claude Code in this repo (project scope)** — live via the `.claude/skills` → `../skills` symlink. No action needed while authoring.
2. **Claude Code in other repos (user/global scope)** — via the marketplace plugin. Install once: `/plugin marketplace add /Users/claudianathan/repos/cookbooks/harness` (local), then `/plugin install claudia@harness`. Refresh with `/plugin marketplace update harness`.
3. **Cursor and Codex** — via symlinks at `~/.cursor/skills/<name>` and `~/.codex/skills/<name>`. Run `bin/sync-cross-tool` after adding/removing a skill (idempotent; supports `--dry-run`).

Per-skill targeting via optional `harness-targets:` frontmatter. Absent → all three tools. Set to `[claude]` for Claude-Code-specific skills (the meta-forges are tagged this way; applied skills are unset = published everywhere). Other tools ignore unknown frontmatter, so the field is non-invasive.

## New artifacts are feedback for the forges

The user comes to this repo specifically to design new skills, rules, and hooks. Every one of those is also evidence about the relevant forge. When a session here creates a new artifact, after delivery ask:

- What was friction during the design? Did the forge anticipate this kind, or did you have to improvise?
- Was anything missing from the forge's triage, kinds, frontmatter guidance, or worked examples?
- Did any anti-pattern bite that the forge doesn't currently warn about?
- Did the artifact's shape suggest a kind/example/section the forge should learn?

Propose updates to skill-forge / hook-forge / rule-forge / claude-md-forge based on what surfaced — not as a separate ask the user has to remember, but as part of finishing the work. The forges sharpen with use; an artifact that revealed a gap is more valuable as a forge improvement than as a one-off.

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

Run `bin/preship-check` before commits — it greps for both trigger sequences and validates frontmatter required fields, frontmatter size, and reference orphans/dangling.

## Naming: avoid collisions with personal scope

Personal skills at `~/.claude/skills/<name>/` shadow project skills with the same name. Anthropic ships `skill-creator` in personal scope, which is why the project meta-skill is called `skill-forge` — same for `hook-forge`, `rule-forge`. Names here must differ from anything in personal scope or the personal one wins silently.

## Dates

Use absolute YYYY-MM-DD in skills, references, and memory. Relative phrases ("last month", "recently") rot fast and the snapshots in `guides/` are explicitly dated for that reason.

## What lives where

- **A skill** — procedure, workflow, kind-specific judgment. Loads when triggered by description match or path match.
- **A path-scoped rule** — facts about a slice of the codebase. Loads when matching files are open.
- **CLAUDE.md (this file)** — facts about the whole repo, all the time. Keep under ~200 lines.
- **`CLAUDE.local.md`** — gitignored personal project notes (install/troubleshoot playbook, scratch). Auto-loaded alongside CLAUDE.md.
- **`guides/`** — design thinking, snapshots, public-template drafts. Gitignored, local-only, not loaded into context.
- **Auto-memory** — user preferences, project context, feedback. Persists across sessions.

If you're tempted to add to this file "for the X skill we do Y" — that's content for skill X itself, not CLAUDE.md.

## Treat this file as intent, not current truth

Rules here reflect what was true at time of writing. If you see them contradicted by current code — commands that fail, paths that are gone, conventions the codebase has moved away from — flag the contradiction before relying on the rule. The audit job in `claude-md-forge` is the fix path; don't silently work around drift.
