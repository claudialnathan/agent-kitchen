## Why

Some discipline is not artifact-specific. Confirm before acting, and lead with the verdict, are true for every artifact that audits or proposes. Today each artifact discovers them independently and writes its own version.

The kitchen has three variants of one confirm-before-acting contract: `harness-audit` (read-only Steps 1–5, apply on go-ahead at Step 6, with an Operating Contract section), `ingest` (Phase 4 surface-then-confirm), and `new-skill` (announce the redirect, confirm, carry through). Three artifacts, one idea, three wordings, no shared source.

**The handoff-brief contract lost its evidence in the re-cut, on 2026-07-31.** The nine-field shape appeared verbatim in three skills when this was written. `skill-lifecycle` then dropped it from `new-skill` deliberately — the router whose whole objective is invocation cost could not justify thirteen lines for a seam, and cross-skill invocation is forbidden anyway — and `harvest`, its other carrier, was retired. Only `ingest` still holds it, as its own presentation format. One carrier is not independent reinvention, which is this change's own bar for canonising anything. Either the third contract comes out, or it needs a reason that is not duplication. Decide before implementing.

The sibling repo shows where this ends. Its overhaul had to retype one mode ladder into five skills and one report shape into three planning documents, and its own audit flagged the duplication it was creating: `TE004 warn: 182-word output contract repeated in 3 skills`.

The obvious fix — a shared reference every artifact points at — is forbidden. Artifacts stand alone: a skill never assumes another skill or file is installed. So the contract cannot be referenced at runtime.

## What Changes

- `new-skill` holds **canonical text** for each shared contract, in a reference file, with a version marker, because that is where artifacts are authored.
- Artifacts **carry a pasted copy**, not a pointer. Duplication in the fleet is acceptable when it is mechanical and single-sourced; it is unacceptable when each copy was independently invented.
- The **ledger records which contract version each artifact carries**, so changing a contract becomes a grep over one column rather than a re-reading of every body.
- Contracts are canonised only where independent reinvention proves them. Two hold; the third is in question per the note above:
  - **Authority** — findings (read-only) → plan → approved-apply → re-audit; an explicit build request skips the audit pause; an ambiguous verb never authorises edits.
  - **Report** — verdict first; at most five ranked decision groups; total count preserved when the list is capped; evidence status per finding; exactly one closing action; state restated across turns.
  - **Handoff brief** — the nine-field shape that carries work from evidence-gathering into a design pass. Now single-carrier; see the note in Why.
- Contracts are **adopted per artifact, never retrofitted wholesale**. An artifact adopts one when it is next edited for another reason.

## Capabilities

### New Capabilities
- `artifact-contracts`: Canonical, versioned text for cross-artifact discipline, held in `new-skill` and pasted into artifacts at authoring time rather than referenced at runtime.

### Modified Capabilities
- `fleet-ledger`: The contracts column becomes populated and load-bearing — it is what makes a contract change a bounded sweep.

## Impact

- Touches a new reference file under `skills/new-skill/`, its SKILL.md (one pointer into it), and the ledger's contracts column. No artifact body is rewritten by this change; adoption is incremental.
- **The duplication is deliberate and it has a real cost.** Pasted copies can still drift, because pasting is a one-time act. The mitigation is the ledger column plus a version marker in the pasted text, which turns drift from invisible into greppable. This is weaker than a single source of truth and it is the strongest option the stands-alone rule permits. Naming that trade-off is part of the change.
- **Risk of contract inflation.** A canonical-contracts file invites additions. The bar for a fourth contract is the same evidence that earned these three: independent reinvention in two or more artifacts. Reasoning that a contract *would* be useful is not evidence.
- **Non-goals:** no runtime contract loading; no shared reference file that artifacts point at; no retrofit pass across the existing five skills; no contract for anything invented once.
