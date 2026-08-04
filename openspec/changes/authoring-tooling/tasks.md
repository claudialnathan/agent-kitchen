# Tasks: authoring-tooling

> Phases 1–2 depend on `fleet-ledger` and `artifact-contracts` existing. Phase 3 is independent and can run first.
> Phase 4 spends real tokens and is gated.

## 1. Close the gate's cross-skill hole

- [ ] 1.1 Write violating and benign fixtures first: a body with an invocation step, a body with a see-also pointer, a body mentioning a slash command inside a quoted example. The benign cases are the point
- [ ] 1.2 Add the detection to `bin/preship-check` as a **warning**, not a failure
- [ ] 1.3 Run it against the four skills. Any see-also pointers surviving the re-cut should warn, which confirms the check sees real references
- [ ] 1.4 Confirm zero output on a body with no references, matching the gate's success-silent convention

## 2. Build the scaffolder

- [ ] 2.1 `bin/new-artifact <name>`: creates the directory, SKILL.md skeleton with valid frontmatter, and `agents/openai.yaml` to match the existing four skills
- [ ] 2.2 Read contract text from the canonical reference at generation time. Do not embed copies in the script
- [ ] 2.3 Emit explicit placeholders for objective, gap, and sunset trigger, and make an unfilled placeholder a gate failure
- [ ] 2.4 Append the ledger row with born date and selected contract versions
- [ ] 2.5 Verify a scaffold-then-fill cycle passes `bin/preship-check` with no structural fixes
- [ ] 2.6 Decide whether the scaffolder handles non-skill surfaces (hooks, rules) or skills only. Skills-only is the honest v1 if the other surfaces have no repeated shape yet

## 3. Add the held-out split to the trigger harness

- [ ] 3.1 Add a class-stratified split to the trigger harness at wherever `skill-lifecycle` task 4.4 relocated it, defaulting to a held-out fraction rather than off
- [ ] 3.2 Report tuning and held-out scores separately; select on held-out
- [ ] 3.3 Update the harness's caveat header to say what the split does and why selecting on tuning score overfits
- [ ] 3.4 Confirm the sequential and concurrency-capped behaviour still holds, and that `no-parallel-claude.sh` is not bypassed

## 4. Settle the pushy-versus-lean question — gated

- [ ] 4.1 **Owner approval required.** State artifacts under test, query count, and expected spend before the first invocation
- [ ] 4.2 Write a query set for one kitchen skill: should-fire queries at varied phrasing, and near-miss negatives that share vocabulary. Reject any negative that is trivially irrelevant
- [ ] 4.3 Owner reviews the query set before any run. A bad query set produces a confidently wrong description
- [ ] 4.4 Run the current description against a pushier variant, sequentially, stopping on the first session-limit error
- [ ] 4.5 Prefer the live invocation harness for the verdict where budget allows; the text proxy can score full recall while the real model does the task inline instead of invoking
- [ ] 4.6 Report the result, including inconclusive as a real outcome. Do not resolve a tie by preference dressed as evidence

## 5. Record

- [ ] 5.1 CHANGELOG.md entry: the probes.md precedent as the reason the discipline is tooled rather than written down, the cross-skill hole and why the new check warns instead of failing, and the description verdict with its evidence or its inconclusiveness
- [ ] 5.2 If the measurement is inconclusive, record that too and leave doctrine unchanged. An inconclusive result is a finding, not a failed task
