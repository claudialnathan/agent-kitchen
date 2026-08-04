## Context

The meta layer is organised around the repo's model of itself rather than around the situations its user is in, and the measurable consequence is non-use. This document records the decomposition, the reference-ownership problem it creates, and the constraints that keep any one skill from becoming the thing they replaced.

## Goals / Non-Goals

**Goals:**
- A menu where the name predicts the use, so choosing costs no thought.
- Invocation cost low enough that reworking a skill is not something to avoid.
- The test-and-generalise loop, which nothing currently covers.
- Names that each predict their use, even at the cost of a larger fleet.

**Non-Goals:**
- Re-splitting by surface. That is the 2026-06-12 failure.
- Preserving `forge` or `harvest` as names.
- Reducing skill count. Clarity is the objective; count is incidental.

## Decisions

### SL1 — Split by situation, not by surface or by artifact type

**Choice:** `new-skill`, `improve-skill`, `grill-skill`, `ingest`, `harness-audit`.

**Why the surface split stays rejected:** the triage ladder is cross-surface. "Is this a hook or a rule?" cannot be answered from inside a hook-only skill, so a per-surface split forces the ladder into every skill (observed 2026-06-12, five copies, ~5,300 lines) or forces cross-invocation (forbidden 2026-07-23).

**Why the situation split does not reproduce it:** the surface question belongs to exactly one moment — deciding what to build — so it lives in `new-skill` alone. `improve-skill` never asks it, because the surface is already chosen by the time something exists to improve.

**Evidence that named the axis:** the owner's four recurring situations, and the fact that three separate naming conventions already in the owner's environment — her installed fleet, OpenAI's `.system/` skills, and the kitchen's own stated naming rule — are all verb-and-job shaped.

### SL2 — Testing splits out; improving keeps two doors

**Choice:** `improve-skill` (evidence of underperformance, or new material) and `grill-skill` (run against a prompt, iterate on feedback) are separate skills.

**Why the split, having first argued against it:** the overlap is much smaller than it appears. In a test loop the skill demonstrably fired — its output is in hand — so the diagnostic questions `improve-skill` exists to answer are already settled before the loop starts:

| Question | `improve-skill` | `grill-skill` |
| :--- | :--- | :--- |
| Did it trigger at all? | open | answered, yes |
| Is it on the right surface? | open | answered, yes |
| Is another artifact stealing it? | open | answered, no |
| Is the guidance itself wrong? | maybe | the only question |

The layer ladder is therefore `improve-skill`'s alone, and it is the bulk of what looked shared. What genuinely overlaps is the change rules — delta over rewrite, revert over layering, preservation set — at roughly fifteen lines. That is duplication territory, the same call as SL5.

**Why the material door stays with `improve-skill` rather than moving to `ingest`:** "work this article into my writing skill" is a skill being improved, with material as the input rather than a transcript. Moving it to `ingest` would turn a placement skill into an editing skill. The discriminator between them is whether the destination is known.

**The constraint that keeps `improve-skill` honest:** SKILL.md is a router. Neither door's procedure sits in it. **If the router outgrows its budget, a door's content moves to a reference — the budget does not move.**

**Rejected:** one `improve-skill` with three doors, which was the previous design in this document. Rejected on the owner's judgment that it concentrated too much in one place, which the overlap analysis above then supported.

**Rejected:** separate skills per input to `improve-skill` (one for evidence, one for material). Both doors need the same diagnosis, the same layer ladder, and the same change rules; splitting them would duplicate all three rather than fifteen lines.

### SL2a — `grill-skill` can change the skill itself

**Choice:** when the loop finds a change worth making, `grill-skill` makes it. It does not hand off to `improve-skill`.

**Why:** handing off would be cross-skill invocation, forbidden since 2026-07-23 and broken the moment the target is absent, disabled, or set to `disable-model-invocation`. The loop would stall mid-iteration with the owner holding feedback and nothing to do with it.

**Consequence, accepted:** `grill-skill` carries its own copy of the change rules. Fifteen lines, single canonical source recorded in the ledger's contracts column.

### SL3 — Diagnosis before edit, wherever a skill changes

**Choice:** every path that edits a skill answers the same three questions first — what the skill promised, what actually happened, and what currently works that must not regress. This holds in both of `improve-skill`'s doors and in `grill-skill`'s loop.

**Why:** removing diagnosis costs 29.07% in the SkillRevise ablation, the largest single component measured; removing the preservation constraint costs a further 12.79%. Preservation is the part nobody writes, and it is what stops a fix breaking two things that worked.

**Shape:** three prose answers. No schema, no fixture, no file. A schema here is how this becomes probes.md.

### SL4 — The test loop's product is a generalisation, not a patch

**Choice:** the loop's output is a change to the skill that would improve outputs the owner has not shown it. Feedback on the example is evidence, never the specification.

**Why:** this is the documented failure mode. MUSE-Autoskill measured a skill distilled from one successful run carrying that run's calibration and dropping the task from 80% to 20%. Anthropic's skill-creator states the same rule from the authoring side: a skill that works only for the examples it was tuned on is useless.

**Mechanism:** before applying, state what class of request the change affects and name one case outside the test example it should improve. If neither can be stated, the feedback was about the example and the skill should not change.

**Honest limit:** nothing verifies the generalisation. It is judgment made with the owner, stated as such rather than dressed as a result.

### SL5 — Reference ownership: split by concern, duplicate the small overlap

**Problem:** `forge/references/skills.md` (126 lines) serves both authoring and diagnosis. `hooks.md` (130) and `always-on.md` (88) serve only the surface question. Two skills cannot share a reference file — a path into a sibling skill breaks the moment that sibling is absent, which is the stands-alone rule's whole point.

**Choice:**

| Content | Owner |
| :--- | :--- |
| Frontmatter fields, kinds, naming, placement, bundled assets | `new-skill` |
| Hook events and exit codes; CLAUDE.md and rule mechanics | `new-skill` (surface question) |
| Why a skill fails to trigger, compaction, silent failure, anti-patterns | `improve-skill` |
| Listing budget and triggering semantics | `new-skill` + `improve-skill`, duplicated |
| Change rules: delta, revert, preservation set | `improve-skill` + `grill-skill`, duplicated |

`grill-skill` needs none of the mechanics references. It never asks a mechanical question — the skill fired, and the only subject is whether its guidance is right.

**Why duplicate the overlaps:** each is roughly fifteen lines, both owners genuinely need them, and the alternative is a cross-skill file path that breaks on absence. Deliberate small duplication with a single canonical source beats a fragile pointer.

**Rejected:** a shared `references/` at plugin root. Both skills do ship in one plugin, so the path would resolve today, but it makes each skill non-portable the moment one is installed alone, and portability is the reason the stands-alone rule exists.

### SL6 — `harvest`'s mining becomes a capability, not a skill

**Choice:** transcript mining becomes how `improve-skill` finds evidence when the owner says something is not working but cannot cite the moment. The standalone "sweep my sessions for what to build" job is retired.

**Why:** the owner's reported usage is that she rarely reaches for it and cannot tell when it applies. A discovery sweep nobody runs produces nothing; the same mining reached for at the moment of a known problem produces the evidence that moment needs.

**What is lost, stated plainly:** proactive discovery. Gaps will now surface when the owner notices them rather than when a sweep finds them. This is accepted because the sweep was not being run.

**Preserved:** the extraction script, the reader contract, the privacy scope rules, and the dedup-against-the-standing-harness step all move into `improve-skill`'s evidence reference intact.

## Risks / Trade-offs

- **[`improve-skill` becomes the new forge]** → two doors instead of three after the split, plus the router-budget rule in SL2. Watch its line count as the leading indicator.
- **[Five skills is where a menu starts needing a shape]** → the verb-noun convention is what carries it. A sixth skill that breaks the convention costs more than its content is worth.
- **[Owner bounces between `grill-skill` and `improve-skill`]** → SL2a lets the loop make its own changes, so a test session never needs the other skill mid-flight. If bouncing happens anyway, that is evidence the boundary is drawn wrong.
- **[Retiring two skill names breaks anything referencing them]** → `fleet-ledger`, `artifact-contracts`, and `authoring-tooling` all name them and are updated in this change's Phase 5. The kitchen's own CLAUDE.md, README, and CHANGELOG index also name them.
- **[Overlap duplication drifts]** → fifteen lines in two files, single canonical source recorded in the ledger's contracts column.
- **[Losing proactive gap discovery]** → accepted per SL6; revisit if the owner finds herself wishing for the sweep.
- **[The test loop overfits anyway]** → SL4's name-a-case-outside-the-example rule is the only guard, and it is a discipline rather than a check. Stated as a limit rather than solved.
