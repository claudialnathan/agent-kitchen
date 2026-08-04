---
name: improve-skill
description: |
  Changes an existing coding-agent harness artifact, entered from either of two situations: evidence that it is underperforming, or new material to work into it. Diagnoses before editing, locating the failure by information flow, position, boundaries, composition, and only then wording, so a wording patch never compensates for a wrong surface. Where the owner knows something is not working but cannot cite the moment, it mines recent session transcripts for the corrections that show it. Changes are localised deltas that name what must not regress. Use when a skill misses, over-fires, never triggers, or steers badly, when an article or doc should be worked into one that already exists, and when the honest outcome is deleting it because the model now does unaided what it instructs.
---

# improve-skill

Something already exists and something about it is wrong or incomplete. The surface question was answered when it was built, so it is not asked again here. The subject is whether the guidance is right, whether it reaches the agent at all, and what must not break while it is fixed.

**This file is a router. Budget: 90 lines.** Neither door's procedure belongs in it. If the router passes 90 lines, a door's content moves to a reference; the budget does not move. The predecessor this replaces was avoided over invocation cost, which is the failure being fixed.

## Two doors, inferred rather than asked

Read which one applies from what the owner supplied. Don't present a menu.

| What arrives | Door | Load |
| :--- | :--- | :--- |
| A complaint: it missed, over-fired, never fires, steers badly | **Evidence** | [references/evidence.md](references/evidence.md) |
| Material: an article, a doc, someone's writing, another skill, for a named artifact | **Material** | [references/material.md](references/material.md) |

Two entries belong elsewhere, and naming that is the correct answer rather than a refusal:

- **A skill plus a prompt, to run and iterate on.** That is testing. The diagnostic questions below are already settled once output exists, so they are the wrong work. Say so.
- **Material with no named destination.** That is a placement question, not an edit to a known artifact. Say so.

## Diagnose before editing, in both doors

Three answers, in prose. No schema, no fixture, no file of their own — a schema here is how this becomes a mandated fixture practice, and those die at zero adoption.

1. **What did it promise for this class of work?** The objective it was built against, in the owner's terms.
2. **What actually happened?** The concrete output or absence, not a characterisation of it.
3. **What does it currently do well that must not regress?** Write this one explicitly, every time. Silently breaking working behavior while fixing one failure is the dominant regression mode, and it is invisible without a preservation set on the page.

Two conclusions end the work here. If diagnosis finds the failure came from something other than the artifact, report the real cause and change nothing. If supplied material only restates what the artifact already encodes, say that and change nothing, rather than working it in for its own sake.

## Repair at the located layer

Locate the failure in this order and **stop at the first layer that failed**. Wording is revised only when every layer above it holds.

1. **Information flow:** did it receive the context and state the decision the work actually required?
2. **Position:** is it on the right surface, visible to the right actor, triggered at the right moment?
3. **Boundaries:** are preconditions, permissions, side effects, and human decision points explicit?
4. **Composition:** is another artifact duplicating its ownership, contradicting it, or stealing its trigger?
5. **Wording:** only now, revise the prose.

A wording patch that compensates for missing context or the wrong surface makes the failure quieter, not fixed, and it must be rejected on those grounds. When the layer is position, change the surface and leave the wording alone. When the layer is composition, redraw ownership and update both ledger rows rather than adding disambiguating prose to either.

The one case where wording genuinely is the layer: **a rule the model read and still violated.** When the same correction recurs in sessions where the artifact was demonstrably loaded, the deficit is salience, not triggering, so more triggers change nothing. Move the trigger from concept to shape — name the exact wrong artifacts the model produces (the parallel component beside the source it should have edited, the bracket value already on the scale) and lead with the highest-recurrence shape.

Mechanics for why something fails to trigger, dies at compaction, or fires without steering: [references/diagnosis.md](references/diagnosis.md).

## How the change is made

- **Delta by default.** A localised edit that leaves the surrounding content intact. Rewriting whole requires a named reason recorded in the changelog entry; a whole rewrite proposed for a defect confined to one section gets reduced to a delta.
- **Respect the preservation set.** A change that fixes the current failure while degrading something in it is a trade-off to state, not an edit to apply silently. The owner decides.
- **A change that does not hold is reverted, not layered.** When the same failure reappears after a fix meant to address it, the prior version stands and a different repair is attempted from there. Never stack a second change on one already judged not to have worked.
- **Whether it held is judgment made with the owner**, and it is stated as that. When not enough use has happened to tell, the state is unknown, which is reported as unknown rather than as success.
- **Don't add rigid absolutes or enumerated case lists.** An enumerated list reads as exhaustive and makes the unlisted case look out of scope. Where an issue resists a general fix, try a different framing rather than a narrower rule.

## Deletion is a valid outcome

Diagnosis can conclude that the artifact no longer earns its place, and the most important form of that is **live convergence**: mid-task, its guidance and the model's bare instinct agree. That observation is sufficient on its own — no staged confirmation run stands between it and the deletion. When it holds, delete the artifact, remove its ledger row, and record the verdict.

Where the question is whether a model release absorbed the gap, or whether the harness now solves it natively, the plugin-root `STATE.md` and `MODELS.md` orient it — resolved from this skill's source, not the caller's working directory, opened for nothing else, and never treated as proof of current behavior. Prefer `STATE.md` for "what is default on this harness today"; treat `MODELS.md` as routing/benchmark guidance that can lag a release. Never pin a specific model ID into the artifact under repair — leave model choice to the session. Absorption is not monotonic across model lines, so a deletion is a judgment about today's model rather than a permanent finding. Process and workflow artifacts are exempt, because their value is the owner wanting the procedure and no release absorbs that. Where the gap still reproduces and only the instruction is wrong, repair rather than delete.

Record the inverse too. **A win is the only evidence that argues for keeping.** When testing or ordinary use shows the artifact still doing its job, log that against its ledger row; without it, every sweep can reason only toward removal, and the artifact quietly working for months looks identical to the one that stopped mattering.

## Scope

Machine scope is never written: anything under `~/.claude/`, user or enterprise `settings.json`, global plugins, user-scope hooks. Read for context, never edited, staged, or offered for apply, even when the fix is one obvious line. Report it with the exact change described and offer a project-scoped counterweight where one exists; the owner acts. A hard boundary, not a default to weigh.

Provenance goes to CHANGELOG.md — the diagnosis, the layer, the change, the verdict. The artifact itself carries no session narration, no quoted requests, and no stamp naming the model or harness version it was changed against.

## See also

- [references/evidence.md](references/evidence.md): finding the evidence, including mining recent transcripts when the owner cannot cite the moment.
- [references/material.md](references/material.md): working supplied material into an artifact that already exists.
- [references/diagnosis.md](references/diagnosis.md): triggering, listing, compaction, and silent-failure mechanics, plus the optional description and invocation harnesses.
- Canonical docs, trusted over this file when details move: `code.claude.com/docs/en/skills`, `/docs/en/hooks`, `/docs/en/memory`.
