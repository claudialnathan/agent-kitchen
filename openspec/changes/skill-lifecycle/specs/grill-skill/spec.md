## ADDED Requirements

### Requirement: The skill is entered with a skill and a prompt
The skill MUST be entered by naming an existing skill and supplying a prompt to run it against. It MUST NOT require evidence of a prior failure, because testing is how the owner finds out whether there is one.

When only a skill is named with no prompt, the skill MUST ask for one rather than inventing a representative task, because an invented prompt tests what the model imagines the owner wants.

#### Scenario: Skill and prompt supplied
- **WHEN** the owner names a writing skill and gives a prompt to try
- **THEN** the loop starts immediately, with no diagnosis of a failure that has not happened yet

#### Scenario: No prompt supplied
- **WHEN** the owner names a skill and asks to test it
- **THEN** a prompt is requested rather than generated

### Requirement: The loop runs the skill for real
Each round MUST produce the actual output the skill would produce for that prompt. It MUST NOT describe what the skill would do, summarise its behaviour, or evaluate it in the abstract.

The prompt MUST be used as the owner wrote it. A cleaned-up or idealised version tests something she will never type.

#### Scenario: Output produced
- **WHEN** a round runs
- **THEN** the skill is applied to the prompt and the resulting output is produced in full

#### Scenario: Prompt is vague
- **WHEN** the supplied prompt is underspecified in the way real prompts often are
- **THEN** it is used as given, because handling underspecified input is part of what is being tested

### Requirement: Feedback on the example is evidence, never the specification
When the owner reacts to an output, the loop MUST treat that reaction as evidence about the skill rather than as an instruction to patch this output. It MUST NOT edit the output to satisfy the feedback and call the skill improved.

#### Scenario: Owner objects to something in the output
- **WHEN** the owner says a passage is wrong
- **THEN** the work is to find what in the skill produced it, not to rewrite that passage

#### Scenario: Owner approves an output
- **WHEN** the owner says the output is right
- **THEN** what in the skill produced that is identified and added to the preservation set, so a later change does not undo it

### Requirement: A change must be stated as a class before it is applied
Before applying any change, the loop MUST state which class of request the change affects, and MUST name at least one case outside the test example that the change should improve.

When neither can be stated, the feedback was about this example and the skill MUST NOT change.

This is the loop's central discipline. A skill tuned until it satisfies the examples it was tuned on is the documented failure mode: a skill carrying one run's calibration measured an 80% to 20% drop on its own task.

#### Scenario: Feedback generalises
- **WHEN** an objection reflects something the skill would get wrong across a class of prompts
- **THEN** the class is named, a second case outside the example is named, and the change is applied

#### Scenario: Feedback is about this example only
- **WHEN** an objection is specific to this prompt's subject matter and implies nothing general
- **THEN** no skill change is made, and that is said rather than a change being manufactured

#### Scenario: Same objection recurs across examples
- **WHEN** the owner raises the same objection on a second, different prompt
- **THEN** the recurrence is itself the generalisation evidence and the change is applied

### Requirement: The loop changes the skill itself
When a change is warranted, the loop MUST make it. It MUST NOT direct the owner to another skill to apply it, because a pointer to a skill that may be absent, disabled, or not model-invocable would strand the loop mid-iteration.

Changes MUST follow the same rules that govern any skill edit: a localised delta by default with a whole rewrite requiring a named reason; the preservation set respected; and a change that does not hold reverted rather than layered on.

#### Scenario: Change warranted mid-loop
- **WHEN** feedback generalises and a change is agreed
- **THEN** the skill is edited here and the loop continues

#### Scenario: Change did not help
- **WHEN** the next round shows the same problem after a change
- **THEN** that change is reverted before a different one is tried

#### Scenario: Whole rewrite proposed
- **WHEN** a change would rewrite most of the skill
- **THEN** it requires a named reason, recorded, rather than proceeding as an ordinary edit

### Requirement: Changes are constrained to what the feedback supports
A change MUST NOT add rigid absolutes, enumerated case lists, or instructions that only fit the tested example. Where a stubborn issue resists a general fix, the loop MUST try a different framing rather than adding a narrower rule.

#### Scenario: Stubborn issue after repeated attempts
- **WHEN** the same problem survives two attempted general fixes
- **THEN** a different framing or metaphor is tried, rather than a specific prohibition being added

#### Scenario: Change would enumerate cases
- **WHEN** a proposed change lists the specific situations seen in testing
- **THEN** it is reframed as the underlying judgment, because an enumerated list reads as exhaustive and makes unlisted cases look out of scope

### Requirement: The loop repeats until the owner stops it
The loop MUST continue — run, feedback, change, rerun — until the owner says she is satisfied, until feedback stops producing changes, or until it is making no progress. The loop MUST NOT declare completion on its own.

Each round MUST rerun at minimum on the same prompt, and SHOULD introduce a fresh prompt once a change has been applied, so the change is judged on something it was not tuned against.

#### Scenario: Change applied
- **WHEN** a change is applied from feedback
- **THEN** the skill is rerun, and a prompt the change was not tuned on is included where the owner can supply one

#### Scenario: No progress
- **WHEN** two rounds produce no change the owner considers an improvement
- **THEN** that is reported, rather than continuing to iterate

### Requirement: Regression is checked against what already worked
Each round MUST check that outputs the owner previously approved still hold. A change that fixes the current objection while breaking a previously approved quality MUST be reported as a trade-off, not applied silently.

#### Scenario: Earlier approved quality lost
- **WHEN** a change fixes the current objection but degrades something the owner approved earlier
- **THEN** the trade-off is stated and the owner decides

### Requirement: The loop leaves a record and no residue
Completing MUST record in the changelog what was learned and what changed. The skill itself MUST NOT reference the test session, the prompts used, or the owner's feedback.

#### Scenario: Loop concludes
- **WHEN** the owner is satisfied
- **THEN** the changelog records the generalisations found, and the skill body contains no trace of the conversation

#### Scenario: Loop concludes with no change
- **WHEN** testing shows the skill already does its job
- **THEN** that is recorded as a win against the skill's ledger row, because evidence a skill still earns its place is otherwise never captured
