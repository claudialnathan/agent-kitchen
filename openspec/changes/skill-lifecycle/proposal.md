## Why

The kitchen's meta layer is not being used by the person it exists for. Three observations from the owner, each decisive on its own:

- **`forge` gets avoided over token cost.** Invoking it renders 181 lines, and the mechanics it routes to add ~126 more. Reworking a skill costs several thousand tokens before any work happens, so the owner works around it.
- **`harvest` gets skipped because its name does not say when it applies.** Nothing in "harvest" tells a reader it means mining session transcripts for corrections.
- **Nothing maps to what the owner is actually trying to do.** The four recurring situations are: make a new skill from supplied reading, rework a skill that is not working, work new material into an existing skill, and test a skill against a real prompt and iterate from feedback. None of these is the name of anything.

The current names are metaphors organised around the *repo's* model of itself. A usable fleet is organised around the situation the user is in.

Three independent sources agree, and all were available when the current shape was chosen:

- **The owner's own installed fleet is verb-named**: `find-skills`, `write-agent-skill`, `improve-react`, `code-review`, `commit-push`, `state-bump`, `ship-agent-skills`. Every one predicts its use from its name.
- **OpenAI's `.system/` skills split by job**: `skill-creator`, `plugin-creator`, `skill-installer`. Three verbs, three jobs, no unified artifact-creator.
- **`forge/references/skills.md` states the rule the kitchen breaks**: *"Lead a task skill's name with its verb… a `/` menu reader should predict from the name alone whether invoking it does something or loads conventions."* `forge` is a noun.

The 2026-06-12 consolidation of five surface-shaped forges does **not** argue against this. That split failed because the triage ladder had to be duplicated into all five, since "is this a hook or a rule?" cannot be answered from inside `hook-forge`. Splitting by user-facing situation does not reproduce that: the surface question lives at one entry point, and no resulting skill needs another's ladder.

## What Changes

The meta layer is re-cut around the situations. `forge` and `harvest` are retired; their content is redistributed.

| Skill | The situation | Replaces |
| :--- | :--- | :--- |
| `new-skill` | "Make a skill about X, here's my reading" | forge's design stance, triage, and authoring mechanics |
| `improve-skill` | "This isn't working" / "work this material in" | forge's repair ladder and harvest's transcript mining |
| `grill-skill` | "Use this skill, here's my prompt, let's iterate" | nothing — new capability |
| `ingest` | "I read this, is there anything here for me?" | unchanged |
| `harness-audit` | "Is my setup sane?" | unchanged |

- **`new-skill` owns the surface question.** It asks whether the behaviour wants a skill at all, and when the answer is a hook, a path-scoped rule, or an always-on entry, it builds that rather than pointing at a skill that does not exist.
- **`improve-skill` has two doors**: evidence the skill underperformed, which it can find by mining transcripts, or new material to work in. Both are reasons to change a skill whose destination is already known.
- **`grill-skill` is the loop, and it is separate because the work is different.** In a test the skill demonstrably fired — the output is in hand — so the diagnostic questions `improve-skill` exists to answer (did it trigger, is it on the right surface, is another artifact stealing it) are already settled. What remains is reading feedback on one example and deciding what it means for the skill in general.
- **`ingest` keeps its job.** The discriminator against `improve-skill` is whether the destination is known: material headed for a named skill is an improvement, material with no home yet is a placement question.
- **Each body stays a router.** Per-mode detail loads on demand, so the owner pays for the door she came in through.

## Capabilities

### New Capabilities
- `new-skill`: Create a skill from stated intent plus supplied and self-sourced material, including the judgment that it should not be a skill.
- `improve-skill`: Change an existing skill, entered from underperformance evidence or from new material.
- `grill-skill`: Run a skill against a real prompt, collect owner feedback on that output, and translate it into a change that generalises beyond the example.
- `harness-surfaces`: Handle hooks, path-scoped rules, and always-on entries when the surface question resolves away from a skill.

## Impact

- Retires `skills/forge/` and `skills/harvest/`; creates `skills/new-skill/`, `skills/improve-skill/`, `skills/grill-skill/`; leaves `ingest` and `harness-audit`. Five skills, up from four.
- **Token cost is a primary objective.** Each body targets well under forge's 181 lines, with detail behind references. The owner's stated reason for avoidance has to actually go away or this change has failed.
- **The count went up and that is the point.** The kitchen's instinct is to resist fleet growth, and the standing description budget is real. It is spent deliberately here: five names that each predict their use beat four that do not, when the failure being fixed is that the owner cannot tell what applies.
- **Deliberate duplication between `improve-skill` and `grill-skill`.** Both can change a skill, so both carry the change rules — delta over rewrite, revert over layering, preservation set — at roughly fifteen lines each. Handing off between them would be cross-skill invocation, which is forbidden and breaks on absence. Single-sourced duplication is the strongest option the stands-alone rule permits.
- **Reference ownership is a task, not an assumption.** `skills.md` serves authoring and diagnosis; `hooks.md` and `always-on.md` serve only the surface question. Split by concern with deliberate small duplication, decided in `design.md`.
- **Every dependent change is renamed by this one.** `fleet-ledger`, `artifact-contracts`, and `authoring-tooling` all name the old fleet.
- **Non-goals:** no change to `ingest`'s or `harness-audit`'s job; no automated skill generation; no eval corpus; no separate skill for the non-skill surfaces.
