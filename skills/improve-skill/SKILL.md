---
name: improve-skill
description: |
  Change an existing coding-agent harness artifact. Use when a skill misses, over-fires, never triggers, or steers badly, when an article or doc should be worked into one that already exists, or when the artifact may no longer be needed at all. Deleting it is a normal outcome.
---

# improve-skill

Something already exists and something about it is wrong or incomplete. Whoever built it already answered the surface question, so don't ask it again here. Three things matter: is the guidance right, does it reach the agent at all, and what must not break while you fix it.

**This file is a router. Budget: 90 lines.** Neither door's procedure belongs in it. If the router goes over 90 lines, move a door's content to a reference — the budget doesn't move.

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

A wording patch laid over missing context or the wrong surface makes the failure quieter instead of fixing it. Reject it for exactly that reason. When the layer is position, change the surface and leave the wording alone. When the layer is composition, redraw ownership and update both ledger rows rather than adding disambiguating prose to either.

Two cases where wording genuinely is the layer. The first: **a rule the model read and still violated.** When the same correction recurs in sessions where the artifact was demonstrably loaded, the deficit is salience, not triggering, so more triggers change nothing. Move the trigger from concept to shape — name the exact wrong artifacts the model produces (the parallel component beside the source it should have edited, the bracket value already on the scale) and lead with the highest-recurrence shape.

The second: **it fired, it was followed, and the output was wrong in kind** — a report where the work was wanted, process narration, or values the agent settled differently every run. That is form. Check the body for derivations the author could have settled, rules un-ruled by the next clause, a mode router or phase sequence gating the work, and an output contract taking a large share of the lines. The repair states the values, pairs every prohibition with its replacement, and returns control flow to the agent.

Mechanics for why something fails to trigger, dies at compaction, or fires without steering: [references/diagnosis.md](references/diagnosis.md).

## How the change is made

- **Delta by default.** A localised edit that leaves the surrounding content intact. Rewriting whole requires a named reason recorded in the changelog entry; a whole rewrite proposed for a defect confined to one section gets reduced to a delta.
- **Respect the preservation set.** A change that fixes the current failure while degrading something in it is a trade-off to state, not an edit to apply silently. The owner decides.
- **A change that does not hold is reverted, not layered.** When the same failure reappears after a fix meant to address it, the prior version stands and a different repair is attempted from there. Never stack a second change on one already judged not to have worked.
- **Whether a fix held is a judgment you make with the owner**, so say it that way. If there hasn't been enough use to tell yet, the answer is unknown — report it as unknown, not as success.
- **Anything added traces to a source.** Supplied reading, a live canonical doc, the owner's stated intent, or a verified truth of the repo the artifact runs in. A revision never extends a source's stance past where the source takes it, and never adds conduct doctrine of its own — what counts as verified, what honesty requires, what "truth" means in the domain — unless a source or the owner states it. Write condition-shaped ("when X, do Y, because Z"); a belief declaration or aphorism reads as universal and gets cited where its conditions don't hold. Not licence to hedge: be as opinionated as the sources and the owner are.
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
