## MODIFIED Requirements

### Requirement: The ledger records only what the filesystem cannot answer
Each row MUST carry these fields and no more: the artifact name, what it **owns**, what it deliberately **does not own**, which shared contracts it carries **and at what version**, the date it was **born**, its most recent recorded **win**, and its **sunset trigger**.

The ledger MUST NOT restate what an artifact does, where its files live, its description, or its dependencies. Those are derivable from the filesystem, and copying them creates a mirror that is wrong on the next commit.

The contracts field MUST name each carried contract with its version marker, because that column is the only mechanism by which a contract change resolves to a bounded set of artifacts.

#### Scenario: Refusal recorded where nothing else records it
- **WHEN** an artifact is scoped to exclude a neighbouring concern
- **THEN** the exclusion appears in its `does not own` field, naming the concern and the artifact that owns it instead

#### Scenario: Derivable content rejected
- **WHEN** a row would restate an artifact's description, file layout, or trigger phrases
- **THEN** that content is omitted, because the filesystem already answers it

#### Scenario: Contract version recorded on adoption
- **WHEN** an artifact adopts a shared contract
- **THEN** its row's contracts field names that contract and the version of the text it pasted
