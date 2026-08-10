## ADDED Requirements

### Requirement: The scaffolder emits skeleton, ledger row, and contract text together
`scripts/new-artifact` MUST create a new artifact's directory and SKILL.md skeleton, append its ledger row, and insert the text of any contracts the author selects. Emitting the skeleton alone MUST NOT be an option, because the surrounding discipline is the reason the tool exists.

#### Scenario: New skill scaffolded
- **WHEN** the scaffolder is run for a new skill
- **THEN** the directory, a SKILL.md with valid frontmatter, and a ledger row are created together

#### Scenario: Contract selected at generation
- **WHEN** the author selects the authority contract
- **THEN** its current canonical text is inserted into the body and its version is recorded in the ledger row

### Requirement: Contract text is read at generation, never embedded in the tool
The scaffolder MUST read contract text from the canonical contracts reference when it runs. It MUST NOT carry its own copies, because a tool holding stale copies of the contracts is a worse failure than no tool.

#### Scenario: Contract revised after the tool was written
- **WHEN** a contract's canonical text changes and the scaffolder is then run
- **THEN** the new text and the new version marker are what get inserted

#### Scenario: Contracts reference missing
- **WHEN** the canonical contracts file cannot be found
- **THEN** the scaffolder reports it and creates no partial artifact

### Requirement: The scaffolder leaves the objective and gap unanswered
The generated skeleton MUST contain placeholders for the objective, the gap, and the sunset trigger rather than plausible defaults. A tool that fills these in produces artifacts that read as designed when nobody decided anything.

#### Scenario: Objective placeholder present
- **WHEN** an artifact is scaffolded
- **THEN** its objective is an explicit unfilled placeholder, not generated prose

#### Scenario: Unfilled placeholder reaches the gate
- **WHEN** a scaffolded artifact still carries placeholders at commit time
- **THEN** the gate fails, because a placeholder shipping into the fleet is worse than an absent section

### Requirement: The scaffolder output passes the gate immediately
An artifact created by the scaffolder and then filled in MUST pass `scripts/preship-check` without structural fixes: valid frontmatter, a description within budget, no orphan or dangling references, a ledger row, and no loader-trigger byte sequences.

#### Scenario: Filled scaffold committed
- **WHEN** a scaffolded artifact has its placeholders filled and nothing else changed
- **THEN** `scripts/preship-check` exits zero
