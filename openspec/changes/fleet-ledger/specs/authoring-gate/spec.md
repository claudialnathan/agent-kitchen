## ADDED Requirements

### Requirement: The gate enforces ledger and filesystem parity
`scripts/preship-check` MUST fail when a published artifact has no ledger row, and MUST fail when a ledger row names an artifact that no longer exists on disk. Parity MUST be checked in both directions, because a stale row reads as coverage while routing nowhere.

The check MUST be a hard failure rather than a warning. A ledger nothing enforces is the probes.md failure mode, where a mandated artifact reached zero adoption within three weeks.

#### Scenario: Artifact shipped without a row
- **WHEN** a skill directory exists under the published skills path with no matching ledger row
- **THEN** the gate exits non-zero naming the artifact and the missing row

#### Scenario: Row survives its artifact
- **WHEN** a ledger row names an artifact with no directory on disk
- **THEN** the gate exits non-zero naming the orphaned row

#### Scenario: Fleet and ledger agree
- **WHEN** every published artifact has exactly one row and every row has an artifact
- **THEN** the check passes silently

### Requirement: The gate does not judge row content
The check MUST verify only that a row exists and points at a real artifact. It MUST NOT assess whether `owns`, `does not own`, or `sunset trigger` are well-written, because that is authoring judgment and a gate that enforces it produces filler.

#### Scenario: Thin but present row
- **WHEN** a row exists with a terse `owns` field and an empty `last win`
- **THEN** the check passes, because content quality is not the gate's remit
