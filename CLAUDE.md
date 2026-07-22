This is a place where harness-related tools for AI agents are created and evaluated. Every fact, rule, idea or opinion is perishable. Nothing in this repo holds higher authority than new information or insights realized today.

Nothing here is strict. Every rule in this file and in the kitchen's skills is a rebuttable default: a rule keeps hard force only while grounded in significant, recent, verifiable evidence — a dated incident, a live canonical doc, real measurements from roughly the last two months — and everything else bends to the current session's judgment. Questions to the owner are never rationed; when intent is unclear, ask rather than guess. Fluidity, growth, adaptability, and room for failure outrank consistency with the repo's past self: an experiment that fails and is deleted is the system working, and no standing rule may be cited as authority against trying something new.

This file holds intent and durable traps about how the harness reads this place. It does not depict the current state of the repo. The filesystem does that, and CLAUDE.md restating it would only go stale. If a statement here contradicts what you see in the code, the code is authoritative; flag the drift before relying on the rule. The same holds for judgment: if a kitchen rule and your judgment disagree mid-task, say the disagreement out loud before complying. And decisions are verified against freshly retrieved genuine sources at the time of deciding. The repo's own docs and already-loaded context are perishable inputs, never the verification baseline.

## What the kitchen optimizes for

The kitchen's artifacts compete with two forces only: the unaided frontier model, which improves every release and absorbs generic craft, and the owner's time. An artifact is how the owner transmits intent the model can't infer. It might be a raw idea or something read worth operationalizing, an output that missed what was meant and got refined, a post-cutoff fact the model lacks, or a task the model got wrong. Failure is one means, not the main one; a new idea and a corrected miscommunication are the everyday means. Durable value comes from what the model cannot have: the owner's taste and intent made operational, local truths of a repo or team, verified post-cutoff currency. The standing claim the kitchen holds its output to: **each expertise or taste skill it produces (kept in the separate `skills` repo, github.com/claudialnathan/skills) earns its place only by beating the unaided current model on the gap that created it.** The primary evidence is live use: the moment a skill's guidance and bare instinct converge in real work, log it as a deletion candidate in CHANGELOG.md. The skill's runnable probe (`evals/probes.md`) is the fallback and the confirmation. It is demoted in primacy but never deleted, because a staged probe measures behavior-under-examination while unprobed belief is worse than probed belief. Deletion is the expected end of every such artifact, not a failure of one. Process skills (changelog and quality-audit in the skills repo; the kitchen's own forge, harvest, ingest, harness-audit) are exempt because their value is the owner wanting the procedure, which no release absorbs, so they carry no probe and no deletion rule. Publication upkeep (STATE.md, HACKS.md) serves those documents' own readers; it is real work, but not the kitchen's product.

## New artifacts are feedback for the forge

The user comes here to design new harness-related tools. Every one of those is also evidence about the forge. When a session creates a new artifact, after delivery ask:

- **Was the output actually excellent?** Judge an artifact by the work it makes an agent produce (would the best practitioner in its domain call that work expert-grade?) and judge it by that *first*. The artifact's own properties (token cost, trigger precision, provenance hygiene) are hygiene; they never stand in for the quality of the output. A flawlessly-shaped skill that yields competent-floor work has failed. The trap, learned the hard way: scoring an artifact on what's easy to measure while the output goes ungraded, and the output is the only thing that matters.
- What was friction during the design? Did the forge anticipate it, or did you have to improvise?
- Was anything missing from the forge's triage, stance, or references?
- Did any anti-pattern bite that the forge doesn't currently warn about?
- Did the artifact's shape suggest something the forge should learn?

Propose updates to the forge based on what surfaced, as part of finishing the work. An artifact that revealed a gap is more valuable as a forge improvement than as a one-off.

Do not propose updates simply because it says to try so here. Use your judgement, critical thinking and creativity, and decide if it's really worthwhile mentioning.

## Model-version pinning and provenance

Skills, hooks, rules, CLAUDE.md entries, etcetera, are earned against a specific model. Both the gap and the model move. The discipline:

- Each non-trivial artifact carries a **one-line** pin: `<!-- Earned against: <model>, <YYYY-MM-DD>, <CC version> -->`. The pin is a trigger, not a history; it records the earning event only. `re-tested`/`revised` clauses read like pin material because they too are models and dates; they are history, and they go to CHANGELOG.md. `bin/preship-check` warns when a pin outgrows one line or gains a second event.
- Everything else lives in **CHANGELOG.md** (committed, newest-first, keyed by date and model state): why the artifact exists, sunset triggers, re-test verdicts, eval results. Reference skills by name and section, not line numbers.
- The **primary deletion signal is live convergence**: when, mid-task, an artifact's guidance and the model's bare instinct agree, log the artifact as a deletion candidate in CHANGELOG.md. On each major model release (or newly adopted working model), replay each artifact's `evals/probes.md` (prose reconstruction for artifacts that predate their probe file). This replay is the scheduled sweep for what live use hasn't surfaced, and the confirmation before any candidate is actually deleted. Log verdicts (KEPT / revised / deleted) in CHANGELOG.md. Delete the ones whose gap no longer reproduces; rewrite the ones whose gap has shifted. A model can also be **withdrawn**, not just superseded. A pin to an unreachable model is a dead trigger, so re-pin those artifacts to the period's durable default and record the withdrawal in CHANGELOG.md.
- **Artifacts do not reference the conversation that produced them.** That means no session narration, no addressing the reader, no quoting requests. Write provenance as neutral fact in the changelog. References to these may dilute and steer you toward context that is stale.
- **And the artifact is not the bibliography.** Skill bodies are standing instructions to the agent. This sort of provenance lives in the skill's own README `src:url` links and CHANGELOG.md. Canonical doc URLs the agent can verify against mid-task are the exception because they direct action.

Without the pin, audits have no trigger; without the changelog, pins bloat into histories squatting in comments.

## Trajectory and governance

The work here is small and evidence-driven: the meta layer (this repo) plus the applied skills it produces (the `skills` repo), added when discipline accumulates.

Two defaults before adding a new meta or applied skill, each bendable with a named reason logged in CHANGELOG.md:

1. **Triage gap is real.** There is a class of artifact the forge doesn't cover, or discipline that gets retyped in a stack.
2. **A first worked example is in hand.** Shipping without one is an experiment: mark the artifact provisional and validate it in live use.

## Authoring footgun: skill loader trigger sequences

The skill loader executes two literal byte sequences as shell commands in any file inside a skill directory. Markdown context (fences, inline code, quotes) offers no protection, and a hit breaks the whole skill's loading. The sequences, how to document them safely, and the self-check grep are in the `forge` skill. `bin/preship-check` catches both; a committed PreToolUse hook runs it on every `git commit` and blocks on failure, so there is no need to run it manually before committing.

## Publishing footgun: keep the plugins versionless (commit-SHA versioning)

No `version` field anywhere, not in either plugin's `.claude-plugin/plugin.json` and not in the `claudia` marketplace entries. Commit-SHA versioning is what makes a pushed commit propagate on the next `/plugin update`; a `version` string pins the per-install cache and pushed changes silently stop reaching other repos (a frozen `0.1.0` hid `quality-audit` for weeks). `bin/preship-check` fails if one reappears. Propagation and recovery playbooks: the machine-local session notes.

## Other general rules

When a skill name in this repo collides with one at `~/.claude/skills/<name>/`, flag it and ask the user how to proceed.

The forge family (forge, harness-audit, harvest, ingest) never writes, stages, or offers to apply machine-scope config (anything under `~/.claude/`, user or enterprise settings, global plugins), even during an audit and even when the fix is one obvious line. Machine-scope findings are reported for the owner to action; the family's write scope is the current repo. A hard boundary, not a default to weigh. (The skills carry this rule themselves so it travels when the plugin is installed elsewhere; this line governs kitchen sessions and any future family skill.)

## Dates

Use absolute YYYY-MM-DD in skills, references, and memory. Relative phrases ("last month", "recently") rot fast. For artifacts tied to Claude Code behavior (STATE.md, model-pinned skills, hooks, and rules), also record the Claude Code version from `code.claude.com/docs/en/changelog`, e.g. `2026-05-14, v2.1.141`. The version scopes which features and fixes were live when the artifact was earned.
