## ADDED Requirements

### Requirement: The name predicts the use
The skill MUST be named and described so a reader of the slash menu can tell, from the name alone, that it creates a new skill. Its description MUST state the situation it serves rather than the machinery it contains.

#### Scenario: Owner scanning the menu
- **WHEN** the owner looks for how to start a new skill
- **THEN** `new-skill` is identifiable without reading any description

### Requirement: Supplied material is read whole; more is sought
When the owner supplies reference material, the skill MUST read the material the request is built on in full rather than excerpting it, because the judgment an artifact transplants lives in connective tissue that excerpting removes.

The skill MUST also seek additional sources of its own when the domain has current practice the supplied material does not cover, and MUST say which sources it added.

#### Scenario: Owner supplies several articles as the basis
- **WHEN** the request is built on supplied reading
- **THEN** each supplied source is read whole, and any sources found independently are named separately from the supplied ones

#### Scenario: Large pile of trailing references
- **WHEN** supplied material includes a long tail of secondary links beyond what the request is built on
- **THEN** those may be read under a quote-only contract that returns excerpts, while the primary material is still read whole

#### Scenario: Domain has moved since training
- **WHEN** the skill's subject involves fast-moving or version-specific practice
- **THEN** current sources are fetched and cited at the time of writing rather than recalled

### Requirement: The objective is established before drafting
The skill MUST NOT draft until it can state, in the owner's terms, what output the skill exists to produce, concretely enough that a stranger could judge an output against it.

When the request arrives without one, the skill MUST ask rather than infer. Questions MUST NOT be rationed.

#### Scenario: Request arrives without a gradeable objective
- **WHEN** the owner asks for a skill about a topic with no stated outcome
- **THEN** questions are asked until the objective can be stated back, and no draft is produced first

#### Scenario: Model's default already meets the objective
- **WHEN** the stated objective is something the model already does well where the skill would deploy
- **THEN** that is said plainly, and the owner decides whether to build anyway

### Requirement: The surface question is answered here
Before building, the skill MUST establish whether the behaviour wants a skill at all. When it wants a hook, a path-scoped rule, an always-on entry, a permission rule, or nothing, the skill MUST name the redirect in one line, confirm it, and then handle that surface itself.

The skill MUST NOT redirect the owner to another skill, because it is the only entry point for this question.

#### Scenario: Behaviour needs a guarantee
- **WHEN** the behaviour must hold every time and cannot be talked out of
- **THEN** the redirect to a hook is named and confirmed, and the hook is built here

#### Scenario: Behaviour is a narrow file convention
- **WHEN** the behaviour applies only to files matching a path pattern
- **THEN** the redirect to a path-scoped rule is named and confirmed, and the rule is built here

#### Scenario: Nothing should be built
- **WHEN** the situation is rare, one-off, or already handled
- **THEN** that is said and the work stops, which is a valid outcome and not a failure

### Requirement: The body stays a router
SKILL.md MUST hold the situation, the objective-setting, the surface question, and the drafting stance. Per-surface mechanics MUST live in references loaded on demand.

#### Scenario: Building an ordinary skill
- **WHEN** the surface question resolves to a skill
- **THEN** no hook or always-on reference is loaded

### Requirement: Completion writes the record
Finishing MUST write the artifact's ledger row and a CHANGELOG entry. The artifact itself MUST carry no provenance, no session narration, and no reference to the conversation that produced it.

#### Scenario: Skill completed
- **WHEN** a new skill is finished
- **THEN** its ledger row and changelog entry exist, and its body contains no account of how it came to be
