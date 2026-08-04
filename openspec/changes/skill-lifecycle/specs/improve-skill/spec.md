## ADDED Requirements

### Requirement: One job, two doors
The skill MUST accept two entries and route to the matching door without asking the owner to classify her own situation: the skill is underperforming, or there is new material to work into it.

The door MUST be inferred from what the owner supplies. A complaint implies the first, supplied material the second.

#### Scenario: Owner reports it is not working
- **WHEN** the owner says a skill did not do its job
- **THEN** the evidence door runs, with no menu of options presented first

#### Scenario: Owner supplies material for a named skill
- **WHEN** the owner hands over an article to work into a skill she names
- **THEN** the material door runs

#### Scenario: Owner wants to try it against a prompt
- **WHEN** the request is to run the skill on a prompt and iterate on the result
- **THEN** that is named as testing work rather than handled here, because the diagnostic questions this skill answers are already settled once output exists

#### Scenario: Material has no destination
- **WHEN** the owner supplies material without naming which skill it belongs to
- **THEN** that is named as a placement question rather than handled here

### Requirement: The router carries no door procedure
SKILL.md MUST hold the two doors, the diagnosis discipline common to both, the layer ladder, and the change rules. Each door's procedure MUST live in a reference loaded only when that door runs.

When the router exceeds its size budget, a door's content MUST move to a reference rather than the budget being raised. The skill exists because its predecessor was avoided over invocation cost.

#### Scenario: Material door runs
- **WHEN** the owner supplies material to work in
- **THEN** the evidence-mining reference is not loaded

#### Scenario: Router outgrows its budget
- **WHEN** SKILL.md passes its stated line budget
- **THEN** a door's content is moved out, and the budget is unchanged

### Requirement: Diagnosis precedes any edit, in both doors
Before proposing a change, the skill MUST record what the skill promised for this class of work, what actually happened, and what it currently does well that MUST NOT regress.

The preservation set MUST be written explicitly. Silently breaking working behaviour while fixing one failure is the dominant regression mode and is invisible without it.

Diagnosis MUST be prose. It MUST NOT require a schema, a fixture, or a file of its own.

#### Scenario: All three recorded
- **WHEN** either door reaches the point of proposing a change
- **THEN** promise, failure, and preservation set are stated first

#### Scenario: Preservation set missing
- **WHEN** a change is proposed without one
- **THEN** it is not applied until the preservation set is written

#### Scenario: The skill is not the cause
- **WHEN** diagnosis finds the failure came from something other than the skill
- **THEN** no change is made and the real cause is reported

#### Scenario: Material adds nothing the skill lacks
- **WHEN** supplied material restates what the skill already encodes
- **THEN** that is said and no change is made, rather than the material being worked in for its own sake

### Requirement: The evidence door can find its own evidence
When the owner reports underperformance without citing a specific moment, the skill MUST be able to mine recent session transcripts for the corrections that show it, using a reduction step rather than reading raw transcripts into context.

Scope MUST default to the current project's recent sessions. A different project, a time window, or a cross-project sweep MUST require the owner to name it.

Transcripts MUST be treated as private working history: corrections may be quoted, but tool output, file contents, and anything credential-shaped MUST NOT be.

#### Scenario: Owner cannot cite the moment
- **WHEN** the owner says a skill keeps missing but cannot point to when
- **THEN** recent sessions in the current project are mined for corrections in that skill's territory

#### Scenario: Correction predates the skill
- **WHEN** the corrections found are all dated before the skill existed
- **THEN** that is reported as the system working, and no change is proposed on that evidence

#### Scenario: Cross-project sweep not requested
- **WHEN** mining would reach other repositories' transcripts
- **THEN** it does not, unless the owner named that scope

### Requirement: The material door reworks rather than appends
Material MUST be distilled into the skill's own voice and structure, keeping the judgment it carries and discarding its shape. The skill MUST NOT gain a section that reads as a summary of the source, and MUST NOT be wired to depend on the source or on any skill the source came from.

#### Scenario: Article worked into a skill
- **WHEN** material is integrated
- **THEN** the skill reads as one voice, with the material's judgment absorbed rather than quoted

#### Scenario: Material is another skill
- **WHEN** the supplied material is someone else's skill
- **THEN** its ideas are reworked into this one, and no dependency or cross-reference is created

### Requirement: Repair happens at the located layer
The skill MUST locate the failure through information flow, position, boundaries, composition, then wording, and MUST stop at the first failed layer. Wording MUST be revised only when every preceding layer holds.

A wording change that compensates for missing context or a wrong surface MUST be rejected, because it makes the failure quieter rather than fixed.

#### Scenario: Failure is positional
- **WHEN** a skill never fires because it sits on the wrong surface
- **THEN** the surface is changed and the wording is left alone

#### Scenario: Failure is compositional
- **WHEN** another artifact is taking its trigger or duplicating its ownership
- **THEN** ownership is redrawn and both ledger rows updated, rather than disambiguating prose being added

#### Scenario: Wording is genuinely the layer
- **WHEN** context, surface, boundaries, and ownership hold and the instruction is still misread
- **THEN** wording is revised, naming the specific wrong output shape it should call out

### Requirement: Changes are deltas by default
A change MUST be a localised edit leaving surrounding content intact. Rewriting a skill whole MUST require a named reason recorded in the changelog entry.

#### Scenario: One instruction is the defect
- **WHEN** the diagnosed defect is confined to one section
- **THEN** that section is edited and the rest is untouched

#### Scenario: Rewrite proposed for a local defect
- **WHEN** a whole rewrite is proposed for a defect in one section
- **THEN** it is reduced to a delta

### Requirement: A change that does not hold is reverted, not layered
When a change fails to address the diagnosed failure, the prior version MUST stand. A further change MUST NOT be layered on one already judged not to have worked.

Whether it held is judgment made with the owner. The skill MUST NOT claim a verdict it cannot establish.

#### Scenario: Failure recurs after the fix
- **WHEN** the same failure appears again after a change meant to fix it
- **THEN** that change is reverted before a different repair is attempted

#### Scenario: Too early to tell
- **WHEN** not enough use has happened to judge
- **THEN** the state is reported as unknown rather than as success

### Requirement: Deletion is a valid outcome
Diagnosis MUST be able to conclude that a skill no longer earns its place, most importantly when its guidance and the model's unaided instinct have converged. When it does, the outcome is deletion with a recorded verdict, not a repair.

#### Scenario: Convergence found
- **WHEN** the model now does unaided what the skill instructs
- **THEN** the skill is deleted, its ledger row removed, and the verdict recorded

#### Scenario: Gap still reproduces
- **WHEN** the gap still holds and only the instruction is wrong
- **THEN** the skill is repaired rather than deleted
