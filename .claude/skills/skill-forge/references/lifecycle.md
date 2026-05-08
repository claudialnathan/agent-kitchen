# Lifecycle: load, persist, compact

The single most-misunderstood thing about skills: once invoked, **the rendered SKILL.md content enters the conversation as a single message and stays there for the rest of the session**. Claude does not re-read the file. Everything else in this page follows from that.

## Loading order

1. **Session start.** Claude is given the *names and descriptions* of all available skills (subject to the 1,536-char-per-skill and overall budget caps). Skill bodies are not loaded.
2. **Invocation.** When a skill triggers — either you type `/<name>` or Claude decides to use it — the skill's body is rendered. Dynamic substitutions run (inline shell injection, `${CLAUDE_SKILL_DIR}`, `$ARGUMENTS`, etc.). The fully-rendered text enters the conversation as a single message.
3. **Persistence.** That message stays in context. Subsequent turns can refer to its content; Claude doesn't re-read the file.
4. **Compaction.** If the session gets long enough to compact, skills are *re-attached* with budget rules described below.

## Why "stays in context" matters for how you write

The body is a recurring cost. Every line that doesn't change behavior is wasted budget on every subsequent turn. Apply two tests:

1. **The deletion test.** Remove the line. Run the skill. Did Claude behave worse? If not, leave it deleted.
2. **The standing-instruction test.** Read every line as if Claude is reading it on turn 8 of a long conversation. If the line says "first, check that node is installed," it's a one-time procedural step that's now noise. Rewrite as "node is required; the build command is `npm run build`."

A 50-line skill is fine. A 500-line skill is the upper bound the docs recommend before splitting. A 1,200-line skill is almost always carrying reference material that should be in a sibling file — `reference.md`, `examples/`, `scripts/`.

## Compaction rules

Compaction happens automatically near context-window saturation (auto-compact triggers around 95% by default; `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` lowers it). When compaction runs:

- The conversation is summarized.
- The **most recent invocation** of each skill is re-attached after the summary.
- For each re-attached skill, the **first 5,000 tokens** are kept.
- All re-attached skills share a **combined budget of 25,000 tokens**.
- The budget fills starting from the most recently invoked skill, so older invocations may be dropped entirely if you've used many.

Practical consequence: if you've invoked 10 skills in a long session, only some will survive compaction. The most recently invoked are most likely to make it through.

If a skill is huge (over 5,000 tokens) and load-bearing, **re-invoke it after compaction** to restore the full content. Just typing `/<name>` brings the rendered body back in fresh.

## "It stopped working after the first response"

A common confusion: the user invokes a skill, gets a great response, asks a follow-up, and feels Claude is now ignoring the skill. The body is still in context — Claude just chose a different path on the follow-up.

Three responses, in order:

1. **Strengthen the description.** If the skill is one Claude could re-pull-in for the follow-up, a sharper description helps it weigh the skill against alternatives.
2. **Strengthen the body.** Write standing instructions that apply across the whole task, not just the first invocation. "Throughout this conversation, when generating SQL, use `:` parameters."
3. **Switch to a hook.** If you need *guarantee* — the action must happen the same way every time — that's not a skill problem. A `PostToolUse` hook on `Edit|Write` is the right shape.

## What compaction does to inline injection blocks

Dynamic injection runs *once*, when the skill is first invoked. The output is captured in the rendered body that enters context. **Compaction re-attaches the rendered body, not the placeholder** — so the data Claude sees after compaction is whatever was current at the original invocation.

If you need the data refreshed (e.g., a status check that changes), re-invoke the skill so the commands run again with fresh state.

## CLAUDE.md vs skills under compaction

These behave differently:

- **Project-root CLAUDE.md** is re-read from disk after compaction; the file's current content is re-injected. Edits during the session are reflected.
- **Nested CLAUDE.md** (in subdirectories) is *not* automatically re-injected; it reloads when Claude next reads a file in that directory.
- **Skills** are re-attached with the budget rules above, using the rendered body from the *most recent invocation*. The current file isn't re-read.

If you're authoring a skill and editing the file mid-session, **re-invoke after the edit** to get the new content into the conversation.

## Live change detection

Claude Code watches skill directories for changes. Adding, editing, or removing a skill in `~/.claude/skills/`, `.claude/skills/`, or a `.claude/skills/` inside an `--add-dir` directory takes effect *for descriptions* in the current session without restart. The body of an in-flight invocation is what was loaded at invocation time; subsequent invocations get the new content.

Creating a *new* top-level skills directory that didn't exist at session start requires a restart so Claude Code can begin watching it.

## Subagents handle skills differently

In subagents, skills don't follow the on-demand loading rule. The `skills:` field on a subagent definition **preloads the full content** of each listed skill into the subagent's system prompt at startup. Subagents do not inherit skills from the parent conversation; if you want a subagent to know your API conventions, list them in the subagent's `skills:` field.

`disable-model-invocation: true` skills cannot be preloaded; preloading draws from the same set Claude can invoke.

A skill with `context: fork` is a different mechanism: the skill body becomes the subagent's *prompt*, not its system prompt.

## Drift signals

Things to watch that suggest the lifecycle is biting you:

- **The skill description shows up in `/skills` but Claude never picks it.** Description budget is full; check `/skills` for which descriptions are getting truncated. Move low-value skills to `name-only`.
- **Claude follows the skill on turn 1, drifts by turn 5.** Body is too procedural ("first do X"). Rewrite as standing instructions.
- **Skill seems to disappear after a long conversation.** Compaction dropped it. Re-invoke.
- **Skill uses dynamic injection (an inline `gh pr view` block, for instance) but the data is stale.** It captured at first invocation. Re-invoke for fresh data, or move the data fetch into a script the skill calls each turn.
- **Skill works but the user keeps typing the same correction.** The skill is missing the correction. Add it to the body — that's *exactly* what skills are for.

## When `/clear` is the right move

If a skill seems to be polluting context with stale information from earlier turns, `/clear` resets the conversation while keeping CLAUDE.md and project state. Then re-invoke the skill — fresh content, no drift. This is often faster than trying to debug why a skill seems "off" mid-conversation.
