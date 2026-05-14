This is a workshop for designing Claude Code/Agent skills and harness extensions. Not a product. Skills here are the single source of truth: Claude Code in other repos installs them as a plugin from this repo, and `bin/sync-cross-tool` links them into Cursor and Codex on this machine. The delivery mechanism may change; the single-source-of-truth intent will not. Skills are written to be portable across the tools that use the same SKILL.md format (Claude Code, Cursor, Codex); the meta-forges, which design other artifacts, are gated to Claude via `harness-targets: [claude]`.

This file holds intent and durable traps about how the harness reads this place. It does not depict the current state of the repo. The filesystem does that, and CLAUDE.md restating it would only go stale. If a statement here contradicts what you see in the code, the code is authoritative; flag the drift before relying on the rule.

## New artifacts are feedback for the forges

The user comes here to design new skills, rules, and hooks. Every one of those is also evidence about the relevant forge. When a session creates a new artifact, after delivery ask:

- What was friction during the design? Did the forge anticipate this kind, or did you have to improvise?
- Was anything missing from the forge's triage, kinds, frontmatter guidance, or worked examples?
- Did any anti-pattern bite that the forge doesn't currently warn about?
- Did the artifact's shape suggest a kind, example, or section the forge should learn?

Propose updates to the relevant forge based on what surfaced, as part of finishing the work. An artifact that revealed a gap is more valuable as a forge improvement than as a one-off.

## Model-version pinning

Skills, hooks, rules, and CLAUDE.md entries are earned against a specific model. Both the failure and the model move. The discipline:

- Each non-trivial artifact records the model version it was earned against, in the artifact's `Why` line or as a stripped HTML comment (`<!-- Earned against: Sonnet 4.4, 2026-03-15 -->`). HTML comments cost zero context tokens.
- On each major model release, re-test the failures that earned the artifacts. Delete the ones whose failures no longer reproduce; rewrite the ones whose failures have shifted.

Without the pin, audits have no trigger; obsolete scaffolding accumulates instead.

## Trajectory and governance

The work here is small and evidence-driven: meta-forges and applied skills, added when discipline accumulates. Bigger trajectories (public-template repo, large hyper-specific-skill catalogue) are off the table.

Two gates before adding a new forge or applied skill:

1. **Triage gap is real.** There is a class of artifact the existing forges don't cover, or discipline that gets retyped in a stack.
2. **First worked example is in hand.** Never ship an empty forge or stack-tagged skill.

Auditing existing forges against current harness affordances is exempt from gate 2. Any candidate-moves inventory in `guides/` is not a backlog to drain.

## Authoring footgun: skill loader trigger sequences

The skill loader scans file contents for dynamic-context-injection markers regardless of markdown context. Two byte sequences will be intercepted as shell commands and break loading: a triple-backtick followed immediately by an exclamation mark, and an exclamation mark followed immediately by a backtick. Code fences, inline-code spans, and block quotes do not protect against the scan.

This applies to any file inside a skill directory, not just `SKILL.md`. The full discussion (how to document the syntax without rendering it, the grep that catches it) is in `skill-forge`.

Run the preship check (`bin/preship-check`) before commits.

## Naming collisions with personal scope

When a skill name in this repo collides with one at `~/.claude/skills/<name>/`, the personal one wins silently. Anthropic ships `skill-creator` in personal scope, which is why the project meta-skill is `skill-forge` (same for `hook-forge`, `rule-forge`). Pick names that won't collide.

## Dates

Use absolute YYYY-MM-DD in skills, references, and memory. Relative phrases ("last month", "recently") rot fast.
