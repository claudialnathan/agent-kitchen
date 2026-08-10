# Diagnosis mechanics

What to check when an artifact isn't behaving, ordered by the layer ladder in SKILL.md. Canonical reference on conflict: `code.claude.com/docs/en/skills`.

## Listing and triggering

- At session start the model sees only **names and descriptions**. Combined `description` + `when_to_use` is capped at **1,536 chars per skill**; the aggregate listing budget is ~1% of the context window (≈8K chars as the fallback illustration on a 200K session; larger windows scale the budget), dropping the least-used descriptions first. **A fleet of near-cap descriptions can overflow the budget by itself**, which makes "it never fires" a symptom of a neighbour's greed rather than its own wording.
- `when_to_use` renders concatenated after the description with a `-` separator, so bullet lists arrive as run-on artifacts. Cross-tool consumers ignore the field entirely: the open agentskills.io spec caps `description` at 1,024 chars and drops `when_to_use`, so a skill triggering in Claude Code and not in Cursor or Codex has usually put its triggers in the wrong field.
- Cheap diagnostic, before changing anything: ask a fresh session "when would you use the `<skill>` skill?" It quotes the description back, and the gap between that answer and the real job is the defect.
- Add a *negative* trigger only when the skill demonstrably over-fires. A negative added on suspicion suppresses cases that were working.

## Why it never fires

Work down this list before touching the description, because most of it isn't the description.

- **Precedence collision.** enterprise > personal (`~/.claude/skills/`) > project > plugins. A project skill with the same name as a personal one **loses silently**. Fix by renaming, disabling the personal one in `skillOverrides`, or scoping through a plugin.
- **A neighbour claims the trigger.** An installed skill whose description covers the same phrases takes model-invoked routing even when the names differ. This is the composition layer, and the fix is redrawing ownership — or `disable-model-invocation: true` on the one that should only ever be invoked deliberately — not adding disambiguating prose to both.
- **`paths:` gating.** On a **project-local** skill, `paths:` gates listing, so the skill looks *missing* until a matching file is read. On a **plugin** skill it does not gate listing (always listed; `paths:` only adds auto-load). A project skill that must stay invocable should omit `paths:`. (2026-06-06, v2.1.165)
- **`disable-model-invocation: true`** is set and the expectation was model invocation. It also blocks preloading into subagents via `skills:`.
- **Frontmatter that silently did nothing.** Unrecognized fields are ignored without warning, and so are recognized fields nested under an unknown parent (`metadata: trigger:` is dead bytes). If a setting seems to have no effect, check the field name and its parent first. `tools:` is the subagent field; the skill field is `allowed-tools:`.
- **Strict-YAML failure that Claude Code's lenient loader accepted.** A colon-space (`: `) or unbalanced quotes inside an unquoted `description:` scalar breaks PyYAML-class parsers, so the skill loads in Claude Code and is invisible in Cursor, Codex, and `skills-ref validate`. Quote the value or use a block scalar.
- **The loader trigger sequences.** An exclamation mark immediately followed by a backtick, or three backticks immediately followed by an exclamation mark, anywhere in the skill directory, makes the loader run what follows as a shell command; a malformed or off-allowlist command fails the *whole skill* to load. Markdown context offers no protection. Grep the tree with both patterns backslash-escaped. `scripts/preship-check` catches both.

## Why it fired and didn't steer

The harder failure, and the one only a transcript read catches: invoked, in context, not steering.

- **Compaction dropped it.** Compaction re-attaches the most recent invocation of each skill: first **5,000 tokens** per skill, shared **25,000-token cap**, filled most-recently-invoked first, and older invocations drop entirely. A load-bearing skill that vanished mid-session just needs re-invoking. Project-root CLAUDE.md *is* re-read from disk after compaction; skills are not.
- **The body was edited mid-session.** Invocation renders the body once; the file is never re-read. Editing a skill and expecting the running session to change is a false negative, not a defect.
- **The instruction was buried.** Long bodies dilute their own steering. A rule sitting under a heading the model had no reason to attend to is a salience defect, and it is the one wording change that is genuinely warranted: name the exact wrong output shape, and lead with the highest-recurrence one.
- **It's a one-time step, not a standing instruction.** A body written as a recipe ("first check Node is installed") stops steering by turn eight. Standing instructions ("when running tests, prefer single-file runs") keep working.
- **The context gate was missing.** Task skills that don't verify their inputs produce confident work about the wrong thing, which reads as bad guidance rather than as a missing precondition.
- **Subagent scope.** Subagents don't inherit the parent conversation's skills; the `skills:` field on an agent definition preloads the *full body* into its system prompt. A `context: fork` skill is different again: its body becomes the fork's prompt, so a body with no actionable task returns empty. Forks also **run in the background by default** (v2.1.218): "fired but parent kept going / result arrived late" is often async completion, not empty-prompt or compaction. Set `background: false` when the fork must block. Nested spawn defaults to **depth 3** (v2.1.219); unexpected fan-out from a leaf agent is nesting, not a wording defect — set `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` or omit/`disallow` `Agent` for leaf-only.
- **Stale dynamic injection.** Injected command output is captured once at invocation, so compaction re-attaches stale data. Re-invoke for fresh state.

## Anti-patterns, as failure signatures

Each of these presents as a different complaint than its cause.

| Signature | Actual defect |
| :--- | :--- |
| "It tells me things I already know" | **Encoded answer**: imperative steps that save typing and change nothing foreground |
| "Other skills stopped firing" | **Greedy description** eating the shared listing budget |
| "It works but I have to remember to invoke it" | **Wrong surface**: the content wanted a hook, an always-on entry, or a path-scoped rule |
| "It broke and I can't see why" | **Cross-skill dependency**: a body naming `/X` fails silently when `/X` is absent, disabled, or off-menu |
| "It's confidently wrong about the stack" | **Frozen vendor facts**: they invert from stale to actively wrong, and a grep for a renamed package concludes the stack is absent |
| "It only helps on the cases it was written for" | **Overfitting to its examples**, usually from tuning against a small set of prompts |

## Optional harnesses

Two exist, both opt-in, both spending real tokens; confirm before firing either. Neither is a shipping gate — testing a draft is authoring judgment, and its notes go to CHANGELOG.md, never to a fixture directory or a comment inside the artifact.

| Harness | Question | Notes |
| :--- | :--- | :--- |
| `evals/trigger-eval.js` | Does the description discriminate? | Cheap text proxy: a judge scores discriminating power over a labeled query set (should-fire vs near-miss). Can A/B `description` against `description + when_to_use` to size cross-tool loss. Requires `--skills` |
| `evals/invocation-eval.js` | Does the model actually invoke it? | Live ground truth: installs the real skill and drives one `claude -p` per query. Run with `node`, not a workflow runtime, because it shells out to the CLI. Requires `--skill` and `--queries` |

Prefer the live run when a verdict must hold: the proxy can score full recall while the real model, handed a matching prompt, just does the task inline, and only the live run sees that.

**Cost discipline for anything that shells out to the CLI (2026-07-08 incident).** Each headless `claude -p` turn spends real tokens against the *same* session limit as the interactive session. A parallel batch drained a Max plan in one wave, then drained the reset limit in under a minute on relaunch. Run sequentially, cap concurrency at 2, stop on the first session-limit error, and never fan a whole query set out with `xargs -P`.

Whether the body steers toward expert work is judged on the output itself, against the owner's objective, and never by a judge panel. Calibrate the bar to the kind: expertise grades against the domain's best practitioner; *taste* — a voice, an aesthetic — grades against its owner, where a generic panel is a category error.
