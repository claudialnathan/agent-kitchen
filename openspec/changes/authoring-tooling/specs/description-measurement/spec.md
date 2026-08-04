## ADDED Requirements

### Requirement: Descriptions are selected on held-out queries
The trigger harness MUST split its query set into a tuning half and a held-out half, and MUST select the winning description by its held-out score. Selecting on the tuning score rewards a description that memorised its own queries.

The split MUST preserve the ratio of should-fire to should-not-fire queries in both halves, so neither half is dominated by one class.

#### Scenario: Candidate wins on tuning, loses on held-out
- **WHEN** a candidate description scores higher on the tuning half and lower on the held-out half
- **THEN** it is not selected, and both scores are reported

#### Scenario: Split preserves class balance
- **WHEN** a query set is divided
- **THEN** both halves contain should-fire and should-not-fire queries in roughly the source ratio

### Requirement: Query sets test the boundary, not the centre
Query sets MUST be built from realistic requests with concrete detail, and the should-not-fire half MUST consist of near-misses that share vocabulary or concepts with the artifact. Obviously-irrelevant negatives MUST NOT count toward the set, because they test nothing.

#### Scenario: Near-miss negative
- **WHEN** a should-not-fire query is written
- **THEN** it is a request a naive keyword match would plausibly trigger on but which genuinely needs something else

#### Scenario: Trivially irrelevant negative rejected
- **WHEN** a should-not-fire query shares nothing with the artifact's domain
- **THEN** it is replaced, because it cannot discriminate between descriptions

### Requirement: A live run outranks the text proxy
When a text-proxy score and a live invocation run disagree, the live run MUST be treated as the verdict. The proxy can score full recall while the real model, handed a matching prompt, simply does the task inline without invoking anything.

#### Scenario: Proxy and live run disagree
- **WHEN** the proxy scores a description as discriminating and the live run shows it never fires
- **THEN** the live result is the verdict and the proxy score is reported as a proxy

### Requirement: Runs that shell out to the CLI are sequential and bounded
Any measurement invoking the CLI MUST run sequentially with concurrency capped at two, MUST stop on the first session-limit error, and MUST NOT fan a query set out in parallel. Each headless turn spends real tokens against the same session limit as the interactive session.

#### Scenario: Session limit hit mid-run
- **WHEN** a run encounters a session-limit error
- **THEN** it stops immediately and reports partial results rather than retrying

#### Scenario: Parallel fan-out attempted
- **WHEN** a run would dispatch queries concurrently beyond the cap
- **THEN** it is refused

### Requirement: A measurement run requires prior approval with a stated cost
Before any run that spends tokens, the scope, query count, artifacts under test, and expected cost MUST be stated and approved. A measurement being cheap MUST NOT be assumed.

#### Scenario: Run proposed
- **WHEN** a description measurement is proposed
- **THEN** the artifacts, query count, and expected spend are stated and approval is obtained before the first invocation

### Requirement: An inconclusive result is reported as inconclusive
When measurement cannot separate two descriptions beyond run-to-run variation, the result MUST be reported as inconclusive. It MUST NOT be resolved by preference presented as evidence.

#### Scenario: Difference within noise
- **WHEN** two descriptions score within ordinary variation of each other
- **THEN** the result is inconclusive, and the choice is made on other grounds and recorded as such
