## ADDED Requirements

### Requirement: Triage asks the boundary question before the surface ladder
Before running the surface ladder, the creating skill MUST establish which existing artifacts overlap the proposed one and where the line between them falls. The check MUST read the ledger first, and MUST fall back to reading artifact descriptions when no ledger exists.

The boundary question MUST run before the ladder rather than after it, because a boundary discovered after a surface is chosen produces an artifact that has to be re-scoped.

#### Scenario: Overlap found with an existing artifact
- **WHEN** a proposed artifact covers ground an existing artifact already claims
- **THEN** the boundary is stated in one line before drafting begins, and both sides of it are confirmed with the owner

#### Scenario: No overlap in the fleet
- **WHEN** nothing in the fleet claims adjacent ground
- **THEN** the boundary question resolves in one line and triage proceeds to the ladder

#### Scenario: Overlap is total
- **WHEN** an existing artifact already owns the whole concern
- **THEN** the outcome is a revision to that artifact rather than a new one, and this is named as the redirect before any drafting

### Requirement: A settled boundary writes both rows
Resolving a boundary MUST edit the ledger on both sides: the new artifact's `owns` field, and the neighbouring artifact's `does not own` field naming the concern and its new owner. Writing only one side leaves the boundary recoverable from one direction only, which is the condition that made the disposition ledger necessary.

#### Scenario: Boundary drawn between two artifacts
- **WHEN** a concern is assigned to a new artifact and removed from an existing one
- **THEN** the new row records the concern under `owns` and the existing row records it under `does not own` with the new owner named

### Requirement: Inception writes the row
Completing a build MUST write the artifact's ledger row as its closing step, alongside the CHANGELOG entry. An artifact that ships without a row is unfinished.

#### Scenario: Artifact built and shipped
- **WHEN** a new artifact is completed
- **THEN** its ledger row exists with owns, does not own, contracts, born date, and sunset trigger populated, and `last win` empty

#### Scenario: Sunset trigger unknown at inception
- **WHEN** no specific sunset trigger can be named for a new artifact
- **THEN** the field records the general trigger (live convergence with the model's bare instinct) rather than being left blank
