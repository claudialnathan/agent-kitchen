## ADDED Requirements

### Requirement: A repo holding a fleet carries one ledger
A repository that publishes more than one harness artifact MUST carry a single ledger file recording every artifact it publishes. The ledger MUST live at the repository root and MUST be committed, because its purpose is to survive the session that wrote it.

#### Scenario: Ledger present for a multi-artifact repo
- **WHEN** a repository publishes two or more artifacts
- **THEN** a ledger file exists at its root with one row per published artifact

#### Scenario: Single-artifact repo needs no ledger
- **WHEN** a repository publishes exactly one artifact
- **THEN** no ledger is required, and its absence is not a finding

### Requirement: The ledger records only what the filesystem cannot answer
Each row MUST carry these fields and no more: the artifact name, what it **owns**, what it deliberately **does not own**, which shared contracts it carries and at what version, the date it was **born**, its most recent recorded **win**, and its **sunset trigger**.

The ledger MUST NOT restate what an artifact does, where its files live, its description, or its dependencies. Those are derivable from the filesystem, and copying them creates a mirror that is wrong on the next commit.

#### Scenario: Refusal recorded where nothing else records it
- **WHEN** an artifact is scoped to exclude a neighbouring concern
- **THEN** the exclusion appears in its `does not own` field, naming the concern and the artifact that owns it instead

#### Scenario: Derivable content rejected
- **WHEN** a row would restate an artifact's description, file layout, or trigger phrases
- **THEN** that content is omitted, because the filesystem already answers it

### Requirement: A win is recorded when it is observed
When the owner indicates an artifact produced good work, the observation MUST be recorded in that artifact's `last win` field with an absolute date and one line naming what it did. A win MUST NOT be inferred from an artifact merely having been invoked.

#### Scenario: Owner names a good outcome
- **WHEN** the owner says an artifact's output was right
- **THEN** the artifact's `last win` field is updated with the date and a one-line description of the outcome

#### Scenario: Sweep reads both directions
- **WHEN** a fleet-wide re-read runs after a new working model ships
- **THEN** each verdict weighs the artifact's recorded wins alongside any convergence finding, so the sweep can argue for keeping as well as for deleting

### Requirement: The ledger is a perishable input, not authority
A ledger row MUST be verified against the artifact before it is relied on for a decision. When a row and the artifact disagree, the artifact is authoritative and the row is stale and MUST be corrected.

#### Scenario: Row contradicts the artifact
- **WHEN** a row claims an artifact does not own a concern that its body demonstrably covers
- **THEN** the artifact wins, the drift is flagged, and the row is corrected before the decision proceeds

### Requirement: Deleting an artifact clears its row and its refusals
When an artifact is deleted, its row MUST be removed, and every other row naming it in a `does not own` field MUST be updated, because a refusal pointing at a deleted owner routes the concern nowhere.

#### Scenario: Orphaned refusal after deletion
- **WHEN** an artifact is deleted while a sibling's `does not own` field names it as the owner of a concern
- **THEN** the sibling's row is updated to name the new owner or to absorb the concern
