This is a workshop for designing Claude Code/Agent skills and harness extensions. Not a product. Skills here are the single source of truth, split into two plugins under one `claudia` marketplace: `cook/` holds the meta layer (the skills that design and audit the other artifacts), and `serve/` holds the applied stack-specific skills. Claude Code in other repos installs them as `cook@claudia` and `serve@claudia`; `bin/sync-cross-tool` links them flat into Cursor and Codex (and this repo's `.claude/skills/`) on this machine. The delivery mechanism may change; the single-source-of-truth intent will not. Skills are written to be portable across the tools that use the same SKILL.md format (Claude Code, Cursor, Codex); the `cook/` skills are gated to Claude via `harness-targets: [claude]`.

This file holds intent and durable traps about how the harness reads this place. It does not depict the current state of the repo. The filesystem does that, and CLAUDE.md restating it would only go stale. If a statement here contradicts what you see in the code, the code is authoritative; flag the drift before relying on the rule.

## New artifacts are feedback for the forge

The user comes here to design new skills, rules, and hooks. Every one of those is also evidence about the forge. When a session creates a new artifact, after delivery ask:

- What was friction during the design? Did the forge anticipate it, or did you have to improvise?
- Was anything missing from the forge's triage, stance, or references?
- Did any anti-pattern bite that the forge doesn't currently warn about?
- Did the artifact's shape suggest something the forge should learn?

Propose updates to the forge based on what surfaced, as part of finishing the work. An artifact that revealed a gap is more valuable as a forge improvement than as a one-off.

## Model-version pinning and provenance

Skills, hooks, rules, and CLAUDE.md entries are earned against a specific model. Both the failure and the model move. The discipline:

- Each non-trivial artifact carries a **one-line** pin: `<!-- Earned against: <model>, <YYYY-MM-DD>, <CC version> -->`. The pin is a trigger, not a history — models, dates, version, nothing else. `bin/preship-check` warns when a pin outgrows one line.
- Everything else — why the artifact exists, sunset triggers, re-test verdicts, eval results — lives in **CHANGELOG.md** (committed, newest-first, keyed by date and model state). Reference skills by name and section, not line numbers.
- On each major model release, re-test the failures that earned the artifacts; log verdicts (KEPT / revised / deleted) in CHANGELOG.md. Delete the ones whose failures no longer reproduce; rewrite the ones whose failures have shifted. A model can also be **withdrawn**, not just superseded — a pin to an unreachable model is a dead trigger; re-pin those artifacts to the period's durable default and record the withdrawal in CHANGELOG.md.
- **Artifacts never reference the conversation that produced them** — no session narration, no addressing the reader, no quoting requests. Write provenance as neutral fact in the changelog. This repo is public; the same rule saltintesta's antipatterns teach for prose applies to comments: the artifact is not the conversation.
- **And the artifact is not the bibliography.** Skill bodies are standing instructions to the agent: no person attributions, quote collections, further-reading lists, or advice addressed to a human reader. State the fact or rule plainly; provenance lives in the skill's README `src:url` links and CHANGELOG.md. Canonical doc URLs the agent can verify against mid-task are the exception — they direct action.

Without the pin, audits have no trigger; without the changelog, pins bloat into histories squatting in comments.

## Trajectory and governance

The work here is small and evidence-driven: a meta layer and applied skills, added when discipline accumulates.

Two gates before adding a new meta or applied skill:

1. **Triage gap is real.** There is a class of artifact the forge doesn't cover, or discipline that gets retyped in a stack.
2. **First worked example is in hand.** Never ship an empty meta-skill or stack-tagged skill.

Auditing existing skills against current harness affordances is exempt from gate 2. Any candidate-moves inventory in `guides/` is not a backlog to drain.

## Authoring footgun: skill loader trigger sequences

The skill loader scans file contents for dynamic-context-injection markers regardless of markdown context. Two byte sequences will be intercepted as shell commands and break loading: a triple-backtick followed immediately by an exclamation mark, and an exclamation mark followed immediately by a backtick. Code fences, inline-code spans, and block quotes do not protect against the scan.

This applies to any file inside a skill directory, not just `SKILL.md`. The full discussion (how to document the syntax without rendering it, the grep that catches it) is in the `forge` skill.

`bin/preship-check` mechanizes these gates; a committed PreToolUse hook runs it on every `git commit` and blocks on failure, so there is no need to run it manually before committing.

## Publishing footgun: keep the plugins versionless (commit-SHA versioning)

The `cook` and `serve` plugins carry **no `version` field** — not in `.claude-plugin/plugin.json`, not in the `.claude-plugin/marketplace.json` entries. That puts Claude Code in commit-SHA versioning: every pushed commit is a new version, so a marketplace install picks up skill changes on the next `/plugin update` with no manual step. **Do not add a `version` field.** **Why:** the `claudia` marketplace is a git-URL source whose per-install cache is keyed by the resolved version; the moment a `version` string exists it pins that cache, `/plugin update` reports "already at the latest version," and pushed changes silently never reach other repos (a frozen `0.1.0` hid `quality-audit` for weeks). `bin/preship-check` fails if a `version` field reappears. Propagation after a change is just commit → push → `/plugin marketplace update claudia` → `/plugin update`. <!-- Earned against: Claude Code v2.1.165, 2026-06-08 (docs: plugins-reference — commit-SHA vs explicit-version); re-verify if the plugin cache/marketplace model changes. -->

## Naming collisions with personal scope

When a skill name in this repo collides with one at `~/.claude/skills/<name>/`, the personal one wins silently. Anthropic ships `skill-creator` in personal scope; the kitchen's meta-skill is named `forge` partly to stay clear of it. Pick names that won't collide.

## Dates

Use absolute YYYY-MM-DD in skills, references, and memory. Relative phrases ("last month", "recently") rot fast. For artifacts tied to Claude Code behavior — STATE.md, model-pinned skills/hooks/rules — also record the Claude Code version from `code.claude.com/docs/en/changelog`, e.g. `2026-05-14, v2.1.141`. The version scopes which features and fixes were live when the artifact was earned.
