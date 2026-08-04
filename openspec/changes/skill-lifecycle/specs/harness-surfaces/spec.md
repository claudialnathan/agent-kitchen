## ADDED Requirements

### Requirement: The surface question has exactly one home
The judgment of which surface a behaviour belongs on MUST live in `new-skill` and nowhere else. No other skill MUST carry a copy of the ladder, because duplicating it across surface-shaped skills is the failure that consolidated five forges into one in 2026-06-12.

#### Scenario: Behaviour arrives without a chosen surface
- **WHEN** the owner describes something she wants the agent to do differently
- **THEN** the surface is chosen in `new-skill`, whatever the answer turns out to be

#### Scenario: Improving an existing artifact
- **WHEN** an artifact already exists and is being changed
- **THEN** the surface question is not asked, because it was answered when the artifact was made

### Requirement: Non-skill surfaces are built, not delegated
When the surface question resolves to a hook, a path-scoped rule, an always-on entry, or a permission rule, `new-skill` MUST build it. It MUST NOT tell the owner to use a different skill, because no such skill exists and a pointer to an absent target is worse than no pointer.

#### Scenario: Answer is a hook
- **WHEN** the behaviour must hold every time and cannot be reasoned away
- **THEN** the hook is built here, with its event, matcher, and exit semantics

#### Scenario: Answer is a path-scoped rule
- **WHEN** the convention applies only to files matching a pattern
- **THEN** the rule is built here, with its globs tested against the actual file structure

#### Scenario: Answer is an always-on entry
- **WHEN** the content must be present before anything triggers
- **THEN** it is written into the always-on surface, filtered against what that surface is for

### Requirement: Mechanics for non-skill surfaces load only when reached
Hook and always-on mechanics MUST live in references loaded only when the surface question resolves that way. Building an ordinary skill MUST NOT pay for them.

#### Scenario: Surface resolves to a skill
- **WHEN** the answer is a skill
- **THEN** no hook or always-on reference is loaded

### Requirement: Strictness is matched to precision
A hook that blocks MUST be justified by a predicate precise enough to avoid false positives. Where a predicate cannot be made precise, the hook MUST warn rather than block.

Over-blocking trains the owner to disable the hook, which costs both the guarantee and her trust in the mechanism.

#### Scenario: Predicate is exact
- **WHEN** the condition can be decided mechanically without judgment
- **THEN** blocking is available

#### Scenario: Predicate needs judgment
- **WHEN** distinguishing a violation from legitimate content requires interpretation
- **THEN** the hook warns instead of blocking

#### Scenario: Pattern tested against benign neighbours
- **WHEN** a blocking pattern is written
- **THEN** it is tested against text that resembles a violation but is not, before shipping

### Requirement: Machine scope is never written
No surface outside the current repository MUST be created, edited, or staged, whatever the answer to the surface question. Findings about machine-level configuration are reported for the owner to act on.

#### Scenario: The right fix is a user-scope setting
- **WHEN** the behaviour would best be handled by a machine-scope hook or setting
- **THEN** that is reported with the exact change described, and any project-scoped alternative is offered instead
