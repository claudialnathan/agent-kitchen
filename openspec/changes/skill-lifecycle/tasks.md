# Tasks: skill-lifecycle

> Foundation. `fleet-ledger`, `artifact-contracts`, and `authoring-tooling` all name the old fleet and are updated in Phase 5.
> Only Phase 6 spends model tokens, and it is gated.

## 1. Fix the names first

- [x] 1.1 Confirm `new-skill` and `improve-skill` as final. Checked at every scope on 2026-07-31: no exact collision in `~/.claude/skills/`, any installed marketplace, or any plugin cache. Two near-collisions recorded and accepted — `improve` (personal scope, read-only codebase audit, prefix-matches in the menu only) and `skill-creator` (official plugin, whose description claims create, edit, and eval, so it competes for model-invoked routing against all three; already true of `forge`, so not a regression)
- [x] 1.1a Confirm `grill-skill`. Chosen over `test-skill`, which collided with the installed software-testing cluster (`test`, `test-driven-development`, `webapp-testing`, `tdd`) and parsed ambiguously as "a testing skill". `mattpocock-skills:grilling` triggers on "any 'grill' trigger phrases", which would steal model-invoked routing; resolved by keeping the name and setting `disable-model-invocation: true`, since the skill needs a named artifact plus a prompt and is therefore always invoked deliberately
- [x] 1.2 Write both descriptions against the situation, not the machinery. All three land in the 600–900 target: `new-skill` 798, `improve-skill` 789, `grill-skill` 810. Domain stated agnostically ("coding-agent harness artifact") so they read in scope on Codex
- [x] 1.3 Confirm `ingest`'s description still reads as distinct. Narrowed explicitly: it now opens on "when its destination is not yet known" and closes with the discriminator stated from both sides — material handed over for a named artifact is an edit to that artifact, not a placement question

## 2. Build new-skill

- [x] 2.1 Draft SKILL.md as a router: the situation, objective-setting before drafting, the surface question, the drafting stance. **Missed the target.** 116 lines / 19.1 KB against forge's 181 / 28.7 KB — a 34% cut, not the intended half. Cutting further meant cutting stance, which is the product; the overage is recorded rather than hidden
- [x] 2.2 Carry over forge's earning bar, the four design facts, and the read-material-whole rule
- [x] 2.3 Carry over the surface ladder, and the three non-artifact outcomes that sit before it
- [x] 2.4 Move `hooks.md` and `always-on.md` in as references. Not unchanged after all: each gained the judgment section that used to sit in forge's router, because the spec requires that building an ordinary skill not pay for hook or always-on judgment. Removed 20 lines from the router
- [x] 2.5 Split `skills.md`: authoring content (listing, kinds, frontmatter, body, naming, bundled assets, stands-alone, authoring anti-patterns) comes here
- [x] 2.6 Add the seek-your-own-sources requirement as an obligation, with added sources named separately from supplied ones
- [ ] 2.7 Record its ledger row — blocked on `fleet-ledger` 1.1 (filename and location undecided)

## 3. Build improve-skill

- [x] 3.1 Draft SKILL.md as a router: two doors, the shared diagnosis discipline, the layer ladder, delta and revert rules. 80 lines / 8.3 KB. Budget recorded in the body as 90 lines, with the rule that a door moves out rather than the budget moving
- [x] 3.2 Write the evidence-mode reference: harvest's extraction script, reader contract, privacy scope, and dedup step moved intact. The dedup outcomes were rewritten for the new fleet — "not encoded anywhere" now hands the finding back as a new-artifact question rather than packaging a brief
- [x] 3.3 Write the material-mode reference: distilling supplied material without cross-wiring it to the source. Added the contradiction case, which is a decision for the owner rather than an edit
- [x] 3.4 Split `skills.md`: diagnosis content comes here, reorganised into why-it-never-fires, why-it-fired-and-didn't-steer, and an anti-pattern table keyed by the complaint rather than by the defect
- [x] 3.5 Duplicate the listing and triggering overlap into both. `new-skill` holds the canonical copy; `improve-skill`'s is angled at diagnosis (budget overflow as a cause of silence)
- [x] 3.6 Move `scripts/extract-user-turns.sh` from harvest
- [ ] 3.7 Record its ledger row — blocked on `fleet-ledger` 1.1

## 3A. Build grill-skill

- [x] 3A.1 Draft SKILL.md: entry, the run, reading feedback, the name-the-class gate, the rerun. 59 lines / 6.2 KB, the smallest body in the fleet
- [x] 3A.2 Carry the change rules across from `improve-skill`: delta by default, revert over layering, preservation set. `improve-skill` holds the canonical copy
- [x] 3A.3 Write the name-the-class gate as a hard step, with both halves required — the class of requests, and one case outside the test example
- [x] 3A.4 Add the preservation behaviour for approved outputs: the instruction responsible is named and protected, not just noted
- [x] 3A.5 Add the fresh-prompt rule
- [x] 3A.6 Load no mechanics reference. Held — `grill-skill` ships with no `references/` directory at all
- [ ] 3A.7 Record its ledger row — blocked on `fleet-ledger` 1.1

## 4. Retire forge and harvest

- [x] 4.1 Every section of both bodies has a destination. Deliberate deletions, with reasons: harvest's attention-redirect section and see-also (the standalone discovery sweep is retired per SL6); the nine-field handoff brief in both bodies (owner decision 2026-07-31 — `ingest` keeps it as its own format, the routers carry no consumption block); forge's `find-skills` mention (a cross-skill reference). One thing was cut and then restored: the `MODELS.md` / `STATE.md` orientation pointer, dropped as redundant against verify-live doctrine, put back in compressed form once it became clear both snapshots' routing tables would otherwise be orphaned
- [x] 4.2 Delete `skills/forge/` and `skills/harvest/`
- [x] 4.3 Deleted 2026-07-31: `publish-readiness-2026-07-08.md`, `saltintesta-owner-grade-2026-07-08.md` (never completed, every owner column pending), and `depth-eval.js` (run once 2026-05-31, never re-baselined after the June consolidation, superseded by `grill-skill` at a fraction of the cost)
- [x] 4.4 Move `evals/trigger-eval.js` and `invocation-eval.js` to `improve-skill`, its only remaining consumer. Both now require the subject as an argument rather than defaulting into the dead `serve/` tree, and their internal `forge-*` identifiers were renamed
- [x] 4.5 Drop the two `skills/forge/evals/*` patterns from `.gitignore`

## 5. Update everything that names the old fleet

- [x] 5.1 `.claude-plugin/plugin.json` and `marketplace.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json` and `marketplace.json`. `.cursor-plugin/` was missing from this task and enumerated both retired skills in its `skills` array. `.agents/plugins/marketplace.json` names no skills, so it needed nothing
- [x] 5.2 `scripts/preship-check` — two stale comments, one naming the 2026-06-12-retired `skill-forge`. `scripts/sync-cross-tool` hardcodes no skill names
- [x] 5.3 `CLAUDE.md` — the process-skills exemption list, the feedback section (now "feedback for the meta layer"), the footgun pointer, and the machine-scope rule (now "the meta layer", not "the forge family")
- [x] 5.4 `README.md` (loop diagram redrawn around the new fleet, surface table rewritten, install comment), `CHANGELOG.md` header, `MODELS.md` and `STATE.md` routing tables. `.claude/settings.local.json` names no skills. Also re-cut the three `.claude/skills/` symlinks
- [x] 5.5 The three sibling OpenSpec changes and `openspec/config.yaml`. `artifact-contracts` needed more than a rename: its third contract, the handoff brief, is down to one carrier now that the routers don't take it, which fails that change's own independent-reinvention bar. Flagged in its proposal as a decision to settle before implementing
- [x] 5.6 `ingest`'s `/forge` see-also removed; its body, `references/failure-modes.md`, and the workflow example no longer name it. `harness-audit`'s five "the forge's job" boundary statements rephrased as the job rather than the skill
- [x] 5.7 `scripts/preship-check` passes clean; loader-trigger grep returns zero matches over the whole tree

## 6. Use it once, on something real — gated

- [ ] 6.1 **Owner approval required.** This exercises the new skills on real work and may spend tokens
- [ ] 6.2 Run `grill-skill` against one of the owner's writing or taste skills, using a prompt she actually wants output for. It is the only skill here with no predecessor, so it is the most likely to be wrong on first contact
- [ ] 6.3 Note every point where the written procedure did not match what the work needed, and revise as a delta
- [x] 6.4 Confirm the token cost of an ordinary `improve-skill` invocation against the forge baseline. Reworking a skill used to render 44.6 KB before any work started (`forge` 28.7 + `references/skills.md` 15.9). An evidence-door rework now renders 14.0 KB (router 8.3 + `evidence.md` 5.7), or 22.3 KB when the mechanics reference is also needed. A 3.2× cut in the common case, 2× worst case. The objective is met

## 7. Record

- [x] 7.1 CHANGELOG.md entry
- [x] 7.2 Record each router's line budget: `new-skill` 116 (target ~90, missed), `improve-skill` 80 (budget 90, stated in the body), `grill-skill` 59
- [x] 7.3 Record the overlap analysis that justified splitting `grill-skill` out
