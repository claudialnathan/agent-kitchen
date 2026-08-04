## ADDED Requirements

### Requirement: The gate detects cross-skill invocation prose
`bin/preship-check` MUST flag an artifact body that instructs invoking another skill or assumes one is installed. Detection MUST cover slash-command invocations presented as steps, including harness built-ins, which are as fragile as third-party skills because they can be disabled wholesale.

The check MUST warn rather than fail. A see-also pointer naming another skill is permitted by the stands-alone rule, so a failing check would produce false positives, and a gate that blocks on legitimate content trains the author to bypass it.

#### Scenario: Body instructs running another skill
- **WHEN** a body contains an instruction to run a slash command as a step in its procedure
- **THEN** the gate warns, naming the file and the reference

#### Scenario: Optional see-also pointer
- **WHEN** a body names another skill under a see-also heading as an optional pointer
- **THEN** the check may still warn, and the author judges it, because distinguishing a pointer from a dependency is not mechanically decidable

#### Scenario: Clean body
- **WHEN** no body names a slash command outside a see-also context
- **THEN** the check passes silently, consistent with the rest of the gate

### Requirement: Advisory checks stay advisory
A check that cannot distinguish a violation from legitimate content MUST NOT fail the commit. The gate's failing checks MUST remain those with mechanically decidable predicates.

#### Scenario: Heuristic check proposed as a blocker
- **WHEN** a check relies on judgment to separate valid from invalid content
- **THEN** it is added as a warning, and the reasoning is recorded

### Requirement: Blocking patterns are tested against benign neighbours
Any new detection pattern MUST be tested against text that resembles a violation but is not, before shipping. Shell and prose text is not tokens, and a substring-blind pattern produces false positives that are discovered in production.

#### Scenario: Pattern tested before shipping
- **WHEN** a new detection pattern is added
- **THEN** it is run against both violating and closely-resembling benign fixtures, and both results are recorded
