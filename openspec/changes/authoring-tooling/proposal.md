## Why

The kitchen learned in July that doctrine requiring a human to remember it does not survive. An `evals/probes.md` fixture file was mandated for every expertise skill on 2026-07-05; by 2026-07-27 the fleet carried one, then none, and the whole practice was retired with the verdict that *a requirement at zero adoption three weeks in is not a standard*.

The preceding changes each add something an author must remember: write a ledger row, ask the boundary question, paste the right contract version. Left as prose in a skill body, they have the probes.md failure profile exactly. The counter-example is already in this repo — the loader-trigger footgun is doctrine that never lapses, because `bin/preship-check` fails the commit and a committed hook runs it automatically.

Separately, the gate has two holes that matter more now. **Cross-skill invocation has been forbidden since 2026-07-23 and is enforced nowhere.** The gate checks for dangling `agent-kitchen:` references, but nothing catches a body instructing "first run `/X`" where `/X` exists — which is the actual failure mode, since it breaks silently the moment the target is absent, disabled, or set to `disable-model-invocation`. It is also what killed `debrief`: its central step invoked four forges that no longer existed.

Third, the description question is unresolved. Anthropic's skill-creator instructs authors to make descriptions *"a little bit pushy"* against undertriggering; kitchen doctrine pulls toward lean, non-enumerated descriptions at 600–900 characters. Both are reasoned and they conflict. The kitchen already has `evals/trigger-eval.js` and `evals/invocation-eval.js`, so this is the one question that can be settled by measurement rather than argument — and Anthropic's optimiser adds a technique worth taking: split the query set, optimise on one half, and select the winner on the held-out half so the description does not overfit to the queries used to tune it.

## What Changes

- **`bin/new-artifact`**: a scaffolder that emits the skill skeleton, the ledger row, and the chosen contract text at their correct versions. Authors get the discipline by default instead of by memory.
- **Two new gate checks** in `bin/preship-check`: cross-skill invocation prose, and the ledger parity check specified in `fleet-ledger`.
- **A held-out split added to the description harness**, so a description is selected on queries it was not tuned against.
- **One measurement run** on the kitchen's own descriptions to settle the pushy-versus-lean question with evidence. Gated on explicit approval, run sequentially, under the standing cost discipline.

## Capabilities

### New Capabilities
- `artifact-scaffold`: A generator that emits a new artifact's skeleton, ledger row, and contract text so the surrounding discipline is applied by default rather than remembered.

### Modified Capabilities
- `authoring-gate`: `bin/preship-check` gains cross-skill invocation detection as a failing check.
- `description-measurement`: The existing trigger harness gains a train/held-out split and selects on the held-out half.

## Impact

- Touches `bin/new-artifact` (new), `bin/preship-check`, and the trigger harness wherever `skill-lifecycle` relocates it.
- **The cross-skill check will produce false positives and that shapes its severity.** A body may legitimately mention a skill name in a see-also pointer, which the stands-alone rule permits. The check therefore warns rather than fails, matching how the gate already treats its other advisory checks. Over-blocking trains the author to disable the gate, which costs the guarantee and the trust in it.
- **Cost discipline applies to the measurement.** The 2026-07-08 incident drained a plan when headless runs were fanned out in parallel; `no-parallel-claude.sh` blocks that shape and stays in force. The run is sequential, concurrency-capped, and stops on the first session-limit error.
- **A scaffolder can encode staleness.** Its templates carry contract text and frontmatter conventions that will move. The mitigation is that it reads the canonical contracts file at generation time rather than embedding copies.
- **Non-goals:** no static token accounting; no eval corpus or run schema; no automatic description rewriting; no gate check on ledger row *content*, only its existence; no measurement of anything other than description triggering, because that is the only question here that is mechanically decidable.
