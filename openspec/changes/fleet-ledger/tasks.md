# Tasks: fleet-ledger

> Depends on `skill-lifecycle` for the fleet it records. Foundation for `artifact-contracts` and `authoring-tooling`.
> Nothing here spends model tokens.

## 1. Decide the shape

- [ ] 1.1 Owner picks the ledger filename and location (candidates: `FLEET.md` at repo root; a section in an existing root doc). Record the choice in CHANGELOG.md
- [ ] 1.2 Confirm the six fields — owns, does not own, contracts, born, last win, sunset trigger — and reject any seventh that the filesystem already answers
- [ ] 1.3 Confirm whether the ledger is a table or one block per artifact. Table reads faster at four artifacts; blocks survive longer `does not own` fields

## 2. Write the kitchen's own ledger

- [ ] 2.1 Draft rows for `new-skill`, `improve-skill`, `grill-skill`, `ingest`, `harness-audit` from their bodies
- [ ] 2.2 Fill each `does not own` field by reading the five bodies against each other. Three boundaries need deciding, not just recording: `improve-skill` versus `harness-audit` on artifact-body quality against setup quality; `improve-skill` versus `ingest` on material with a known destination against material without one; and `improve-skill` versus `grill-skill` on diagnosed evidence against live feedback
- [ ] 2.3 Backfill `born` from CHANGELOG.md and leave `last win` empty for any artifact with no recorded win
- [ ] 2.4 Record the contracts column as empty for now; `artifact-contracts` populates it

## 3. Teach the lifecycle skills to use it

- [ ] 3.1 Add the boundary question to `new-skill`, before the surface ladder, with the both-sides ledger edit as its output
- [ ] 3.2 Add the ledger row as a closing step in `new-skill`, beside the CHANGELOG entry
- [ ] 3.3 Add the read-the-ledger-first instruction to `new-skill`, `improve-skill`, and `grill-skill`, kept conditional like the MODELS.md / STATE.md guidance so it costs nothing when no ledger exists
- [ ] 3.4 Verify no description needs to change; the boundary question is body behavior, not a new trigger

## 4. Gate it

- [ ] 4.1 Add the parity check to `scripts/preship-check`, failing in both directions
- [ ] 4.2 Verify against a deliberately broken tree: an artifact with no row, and a row with no artifact
- [ ] 4.3 Confirm the check is silent on a clean pass, matching the rest of the gate
- [ ] 4.4 Run `scripts/preship-check` on the real tree and confirm exit 0

## 5. Record

- [ ] 5.1 CHANGELOG.md entry: the gap (boundary archaeology, the deletion-only asymmetry named 2026-07-27), the decision, the rot risk and the gate that mitigates it
- [ ] 5.2 Note in the entry that the sibling repo adopting a ledger is a separate owner decision, not applied from here
