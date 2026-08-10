## Why

Artifact design is artifact-scoped end to end. It asks whether one artifact is earned, aimed at a gradeable objective, and on the right surface. It never asks what else in the fleet already owns the ground. Nothing anywhere records what an artifact deliberately refuses.

The cost of that absence is paid whenever a fleet is reorganised. The sibling repo's 2026-07-28 overhaul needed a ~26KB disposition ledger — one row per concern, four skills, keep/move/split/reframe/delete — purely to recover boundaries that were never written down. Its own token audit flagged the same disease from the other side: a 182-word output contract had been retyped into three skills. The kitchen has a mild case too: three of its own skills each grew a different confirm-before-acting contract, independently.

A second gap was named in this repo on 2026-07-27, when `debrief` was deleted: with live convergence as the sole deletion signal, a record holding only convergence findings can only ever argue for removal. An artifact that has been quietly working for months reads identically to one that stopped mattering.

Both are the same missing thing — a place where the fleet exists as an object rather than as a directory listing.

## What Changes

- Each repo that holds a fleet carries a **ledger**: one row per artifact recording what it owns, what it deliberately does **not** own, which shared contracts it carries, when it was born, its most recent recorded win, and its sunset trigger.
- **Forge reads the ledger before drafting** and **writes the row at inception**, as the closing step of a build.
- **Forge's triage gains a boundary question** before the surface ladder: which existing artifact does this overlap, and where is the line? Answering it edits the ledger row on both sides of the boundary.
- **`scripts/preship-check` gains a ledger-row presence check** so the record cannot silently fall behind the filesystem.
- The kitchen's own four skills get the first ledger. Whether the sibling repo adopts one is the owner's call and is out of scope here.

## Capabilities

### New Capabilities
- `fleet-ledger`: A single per-repo record of artifact territory — owns, does not own, contracts carried, born, last win, sunset trigger — written at inception and read before drafting.

### Modified Capabilities
- `artifact-triage`: The surface-selection ladder in `new-skill` gains a boundary question that runs before the ladder and produces a ledger edit.
- `authoring-gate`: `scripts/preship-check` gains ledger-row presence as a failing check.

## Impact

- Touches `skills/new-skill/SKILL.md` (boundary question, closing step), `skills/improve-skill/SKILL.md` (read-first), a new ledger file at the repo root, and `scripts/preship-check`.
- **Tension with CLAUDE.md's "never current state" rule, resolved deliberately.** A ledger is current state, which normally belongs to the filesystem. The exemption holds for exactly three columns the filesystem cannot answer: what an artifact *refuses* (nowhere in any description), which contract *version* it carries, and whether it recently *worked*. The columns that duplicate the filesystem (what it does, where it lives) are not in the ledger. Any row is verified before it is trusted, like any pointer.
- **Rot risk, accepted with a mitigation.** A ledger is a fleet-wide mirror and will drift if nothing enforces it. The preship check is the mitigation; without it this proposal reintroduces the probes.md failure mode, so the check is not optional scope.
- **Non-goals:** no per-artifact cost baseline (that is measurement machinery, deliberately not built); no ownership hierarchy or invocation graph; no automated overlap detection; no ledger for the sibling repo from this change.
