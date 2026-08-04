## ADDED Requirements

### Requirement: Contracts are held canonically in one place
The skill that authors new artifacts MUST hold the canonical text of every shared contract in a single reference file. Each contract MUST carry a version marker that changes when its text changes.

#### Scenario: Author needs the authority contract
- **WHEN** an artifact being built needs the audit-then-apply authority boundary
- **THEN** its text is taken from the canonical reference rather than rewritten from memory

#### Scenario: Contract text is edited
- **WHEN** a contract's canonical wording changes
- **THEN** its version marker is incremented in the same edit

### Requirement: Artifacts carry a copy, never a pointer
An artifact MUST embed the contract text it follows. It MUST NOT instruct the reader to consult another skill or an external file for that text, because an artifact stands alone and any pointer breaks when the target is absent.

The embedded copy MUST carry the contract's version marker so drift is detectable by search.

#### Scenario: Artifact adopts a contract
- **WHEN** an artifact adopts the report contract
- **THEN** the contract's text appears in that artifact's body, carrying its version marker, with no reference to where it came from

#### Scenario: Pointer rejected
- **WHEN** a draft says to follow the authority contract as defined elsewhere
- **THEN** that line is replaced with the contract text itself, because the target may not be installed

### Requirement: The ledger records carried versions
Each artifact's ledger row MUST record which contracts it carries and at which version. A contract change MUST be resolvable to the exact set of artifacts needing an update by reading that column.

#### Scenario: Contract revised, fleet swept
- **WHEN** the report contract moves from one version to the next
- **THEN** the ledger's contracts column names every artifact still carrying the old version, and each is updated or explicitly exempted

#### Scenario: Artifact carries no contract
- **WHEN** an artifact follows none of the shared contracts
- **THEN** its contracts column is empty, which is a valid state and not a finding

### Requirement: A new contract is earned by independent reinvention
A contract MAY be canonised only when two or more existing artifacts have independently arrived at the same discipline. Anticipated usefulness MUST NOT earn one, because a canonical-contracts file otherwise accumulates content nothing uses.

#### Scenario: Third artifact reinvents a boundary
- **WHEN** a third artifact is found to have written its own version of an existing discipline
- **THEN** that discipline qualifies for canonisation and the three wordings are reconciled into one

#### Scenario: Speculative contract rejected
- **WHEN** a contract is proposed because future artifacts would likely want it
- **THEN** it is not canonised, and the reasoning is recorded rather than the contract

### Requirement: Adoption is incremental, never a retrofit pass
Canonising a contract MUST NOT trigger a sweep that rewrites existing artifacts to adopt it. An artifact adopts a contract when it is next edited for an independent reason.

#### Scenario: Contract canonised while artifacts differ
- **WHEN** three artifacts carry three wordings of a newly canonised contract
- **THEN** they are left as they are, and each is reconciled at its next substantive edit

### Requirement: The authority contract
The canonical authority contract MUST specify: an audit or review request produces read-only findings; a plan request produces a read-only plan; only an explicit apply, or named approved findings, authorises edits; an explicit build or create request proceeds directly without an artificial audit pause; every implementation path ends with a focused re-check; and an ambiguous verb never authorises edits on its own.

#### Scenario: Ambiguous request
- **WHEN** a request uses a verb that could mean either review or fix
- **THEN** the artifact produces findings and stops, rather than editing

#### Scenario: Explicit build request
- **WHEN** a request explicitly asks to build or create something
- **THEN** the work proceeds without first producing an audit the requester did not ask for

### Requirement: The report contract
The canonical report contract MUST specify: the first line is the single highest-value item stated as an action rather than a summary; findings are ranked and capped at five with the remainder under a separate heading; the total count is preserved whenever the visible list is capped; each finding carries its evidence status; the report ends with exactly one action; and state is restated on later turns rather than assumed remembered.

#### Scenario: More than five findings
- **WHEN** an audit produces twelve findings
- **THEN** five are ranked and shown, the remaining seven sit under a later heading, and the total of twelve is stated

#### Scenario: Nothing to change
- **WHEN** an audit finds the current state proportionate
- **THEN** the report says so and requests no approval, because there is no action to approve

### Requirement: The handoff brief
The canonical handoff brief MUST carry these fields: objective and expected output; evidence of the gap; invocation mode and actor; proposed trigger; required context; allowed actions and side effects; human decision points; proposed surface; unknowns and contention. A field with no grounded answer MUST be omitted or marked unknown rather than guessed.

#### Scenario: Brief crosses from evidence-gathering to design
- **WHEN** a candidate passes from transcript mining or source reading into a design pass
- **THEN** it arrives in the nine-field shape, with unresolved fields marked unknown

#### Scenario: Field cannot be grounded
- **WHEN** the required context for a candidate is genuinely unknown
- **THEN** the field is marked unknown, and resolving it becomes a question rather than an assumption
