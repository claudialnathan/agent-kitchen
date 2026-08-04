---
name: grill-skill
description: |
  Runs an existing coding-agent harness artifact against a real prompt, collects the owner's reaction to that output, and turns it into a change that generalises past the example. Each round produces the actual output rather than a description of what the artifact would do, and the prompt is used exactly as the owner wrote it. Before any change is applied, the class of requests it affects is named along with one case outside the test example it should improve, because an artifact tuned until it satisfies the prompts it was tuned on is the documented way to make one worse. Approved outputs become a preservation set that later rounds are checked against. Use to try an artifact on something real and iterate from feedback, especially for voice, taste, and judgment work where the owner is the only judge.
disable-model-invocation: true
---

# grill-skill

The artifact runs, the owner reacts, and the reaction becomes a change to the artifact rather than a change to the output. The loop is worth its cost for taste and voice work, where nothing external can judge and the owner is the standard.

## Entry

Two inputs: an existing artifact, and a prompt to run it against. No evidence of a prior failure is needed, because testing is how the owner finds out whether there is one.

**If only the artifact is named, ask for a prompt.** Don't invent a representative task. An invented prompt tests what the model imagines the owner wants, which is the one thing this loop exists to stop guessing at.

Diagnosis of triggering, surface, and ownership does not belong here. The artifact fired, its output is in hand, and those questions are already answered. The only subject is whether the guidance is right.

## The round

1. **Run it for real.** Produce the output the artifact would actually produce for that prompt, in full. Describing what it would do, summarising its behavior, or evaluating it in the abstract all skip the only evidence this loop generates. If the artifact uses `context: fork`, forks run in the background by default — wait for completion (or know it sets `background: false`) before treating the round's output as in hand.
2. **Use the prompt as written.** A cleaned-up or idealised version tests something the owner will never type. If it is underspecified in the way real prompts are, that is part of what is being tested — handle it as given.
3. **Take the reaction as evidence about the artifact, never as a spec for the output.** When the owner says a passage is wrong, the work is finding what in the artifact produced it. Editing the passage to satisfy the objection and calling the artifact improved is the failure this whole loop is arranged against.
4. **When the owner approves something, find what produced it.** Name the instruction responsible and add it to the preservation set, so a later change doesn't quietly undo the thing that was working. Approval is evidence too, and it is the only kind that argues for keeping anything.

## Name the class before changing anything

The hard gate. Before applying any change, state two things:

- **which class of requests the change affects**, and
- **one case outside this test example that it should improve.**

If neither can be stated, the feedback was about this example. Say so and change nothing, rather than manufacturing a change to have something to show. A skill carrying one run's calibration is the documented failure mode: distilled from a single successful run, it dropped its own task from 80% to 20%.

The same objection raised on a second, different prompt is itself the generalisation evidence. Recurrence across examples is the cheapest proof the class is real.

## Making the change

The change is made here. It is never handed to another skill to apply — a pointer to something that may be absent, disabled, or not model-invocable would strand the loop mid-iteration with the owner holding feedback and nothing to do with it.

- **Delta by default.** A localised edit leaving the surroundings intact. A change that would rewrite most of the artifact requires a named reason, recorded.
- **No rigid absolutes, no enumerated case lists, nothing that only fits the tested example.** An enumerated list reads as exhaustive and makes unlisted cases look out of scope. Where an issue survives two attempted general fixes, try a different framing or metaphor instead of adding a narrower rule — the third attempt at a prohibition is a sign the diagnosis is wrong, not that the rule needs sharpening.
- **A change that does not hold is reverted, not layered.** If the next round shows the same problem, the prior version stands and a different repair is tried from there.
- **Check the preservation set every round.** A change that fixes the current objection while degrading something approved earlier is a trade-off to state, not an edit to apply. The owner decides.

## Rerunning

After a change, rerun. At minimum on the same prompt; where the owner can supply one, also on a prompt the change was not tuned against, because that is the only place the generalisation gets tested at all. Nothing here verifies it — the name-the-class gate is a discipline, not a check, and the honest framing is judgment made with the owner rather than a result.

The loop continues until the owner says she is satisfied, until feedback stops producing changes, or until it is making no progress. It does not declare its own completion. When two rounds produce nothing the owner considers an improvement, report that rather than continuing to iterate.

## Finishing

CHANGELOG.md records what was learned: the generalisations found, the changes applied, and anything tried and reverted. The artifact itself carries no trace of the session — not the prompts used, not the feedback, not the fact that it was tested.

When the loop ends with no change because the artifact already does its job, **record that as a win against its ledger row.** Evidence that something still earns its place is otherwise never captured, and without it every later sweep can reason only toward deletion.

Machine scope is never written: anything under `~/.claude/`, user or enterprise settings, global plugins. If the artifact being grilled lives there, run the loop read-only, report the change with the exact edit described, and let the owner apply it.
