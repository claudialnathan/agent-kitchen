# Tasks: artifact-contracts

> Depends on `fleet-ledger` — the contracts column is what makes a contract change a bounded sweep.
> Nothing here spends model tokens.

## 1. Reconcile the existing wordings

- [ ] 1.1 Read the three confirm-before-acting variants side by side: `harness-audit` Operating Contract plus Steps 5–6, `ingest` Phase 4, and the announce-confirm-carry-through line inherited into `new-skill`. Extract what they agree on and what they only differ on by accident
- [ ] 1.2 Read the copies of the nine-field handoff brief inherited into `new-skill` and `improve-skill`, plus the one in `ingest`. Confirm they are identical, and record any drift found — drift already present is the evidence that this change is needed
- [ ] 1.3 Read `harness-audit`'s report shape (Step 5) against the report discipline the sibling repo arrived at independently. Reconcile into one wording

## 2. Write the canonical reference

- [ ] 2.1 Create the contracts reference under `skills/new-skill/references/`, since that is where artifacts are authored. Give it a table of contents if it passes ~100 lines
- [ ] 2.2 Write the authority contract with its version marker
- [ ] 2.3 Write the report contract with its version marker
- [ ] 2.4 Write the handoff brief with its version marker, taken from whichever existing copy is most current
- [ ] 2.5 Add the earned-by-reinvention bar at the top of the file, so a future session does not add a speculative fourth contract
- [ ] 2.6 Add one pointer from `skills/new-skill/SKILL.md` into the reference, and confirm `bin/preship-check`'s orphan-reference check passes

## 3. Wire the ledger

- [ ] 3.1 Populate the contracts column for the five kitchen artifacts with what each currently carries, at the version canonised in Phase 2. `improve-skill` and `grill-skill` both carry the change rules, so record which holds the canonical copy
- [ ] 3.2 Record in the ledger where an artifact carries a variant wording rather than the canonical text, so the next edit reconciles it

## 4. Verify the stands-alone rule survives

- [ ] 4.1 Confirm no artifact body gained a pointer to the contracts reference. Artifacts carry text; `new-skill` carries the source
- [ ] 4.2 Confirm the reference is one level deep from SKILL.md, per the references-one-level-deep rule
- [ ] 4.3 Run the loader-trigger grep over the new file and `bin/preship-check` over the tree

## 5. Record

- [ ] 5.1 CHANGELOG.md entry: the three-variant evidence, why a runtime-shared reference is forbidden, and the accepted trade-off that pasted copies can still drift with the ledger column as the only mitigation
