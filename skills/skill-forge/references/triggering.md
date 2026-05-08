# How skills get consulted

Most "broken" skills aren't broken — their descriptions don't match how users actually phrase the request, or the budget cap silently truncated the part that would have matched. This file is about that surface.

## What Claude actually sees

At session start, Claude is given a list of available skills. For each one, it sees the **name** and a **description string** (description + when_to_use, concatenated). The full body does not load. Claude uses these strings to decide whether a given user prompt warrants invoking the skill.

Two facts shape everything that follows:

1. **The combined `description` + `when_to_use` text per skill is capped at 1,536 characters.** Anything past that is truncated *in the listing*, regardless of how much disk space the skill takes.
2. **The total skill listing budget scales at 1% of the context window**, with a fallback of 8,000 characters when that's smaller. If you have many skills, descriptions get shortened to fit. The `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var raises the limit. Setting low-priority skills to `"name-only"` in `skillOverrides` saves budget for the ones that matter.

So the design problem is: **make the first ~200 chars of the description match the user's likely phrasing**, and don't waste characters past that on flourishes.

## Why skills under-trigger

The single biggest cause: vague descriptions. "A skill for code reviews" doesn't lose to a great competitor; it loses to *no skill at all*. Claude only reaches for a skill when it thinks the skill will help. A vague description signals "this might or might not be relevant," and Claude moves on.

Common failure modes:

- **Naming the skill, not its trigger.** "Code Review Helper" tells Claude what the skill *is*; it doesn't tell Claude when to use it.
- **Describing the implementation.** "Uses ESLint and tsc to check code." The user doesn't say "use ESLint"; they say "is this code OK?"
- **Single-phrasing.** Real users vary: "ship it", "deploy", "push to prod", "release". A description that only matches one phrasing under-triggers on the others.
- **Burying the trigger past the cap.** A 2,000-char description with the actual triggers in the last paragraph — they're truncated.
- **Generic openings.** "Use this skill for any task involving …" — competes badly because every task involves *something*.

## Why skills over-trigger

Less common but worth naming. A description that's too generic also fires on prompts it shouldn't:

- **Greedy keywords.** "Use when the user mentions code." Almost every prompt mentions code in some form.
- **Describing the absence of constraint.** "For all your testing needs." Pulls in every testing-adjacent prompt.
- **Negative framing without specifics.** "When you're not sure whether to write tests." That's most of the time for some users.

The fix for both directions is the same: **be specific about what the skill is for *and* what it's not for**. "Use when the user asks for a deploy or release. Skip when the question is about CI status."

## What good descriptions look like

Components, in order of importance:

1. **First clause: what the skill does, framed as the value to the user.** "Cuts a patch release," not "A skill for releases."
2. **Second clause: when to use it, with specific trigger phrases.** "Use when the user says 'ship a patch', 'release a patch', 'cut a release', or asks to bump the version with no breaking changes."
3. **Optional: when not to use it.** "Skip when the changes include breaking API changes — use `/release-major` instead."
4. **Optional: scope bounds.** "Operates only on the current branch." "Returns only a summary, never full output."

A useful exercise: write three competing descriptions for the same skill, then ask "if a user said *<my actual prompt>*, which of these matches best?". The answer should be obvious. If two are close, the descriptions aren't differentiated enough.

## How `disable-model-invocation` interacts

| Frontmatter | Description in listing? | Auto-invokes? | User-invokes? |
| :--- | :--- | :--- | :--- |
| (default) | Yes | Yes | Yes |
| `disable-model-invocation: true` | **No** | No | Yes |
| `user-invocable: false` | Yes | Yes | No |

When `disable-model-invocation: true`, the description doesn't load into Claude's context at all. The skill is invisible to Claude. This means:

- It costs zero description budget (good for budget pressure).
- Claude will never reach for it, no matter how good the description (intended for workflows you trigger).
- You should still write a clear description — it appears in the `/skills` menu and `/help`.

For knowledge skills you want Claude to find, `disable-model-invocation: false` (the default) is required. For workflows with side effects, `true` is almost always right.

## Skills don't trigger on simple prompts

Counterintuitive but important: **Claude only consults skills when it can't easily handle the task itself**. Simple, one-step queries like "read this file" or "what does this function do?" rarely trigger a skill, even when the description matches perfectly. Skills get pulled in for complex, multi-step, or specialized work.

Practical implications:

- **Don't write a skill that's a shortcut for something Claude already does directly.** A "/read-pdf" skill won't trigger unless the user asks for *more* than reading.
- **When testing, use prompts that are realistically ambiguous.** "How should I structure this API?" might trigger your conventions skill; "show me the file" won't, even if the file is an API.
- **Skills with rich, specific instructions tend to trigger more reliably than skills that are essentially restatements of basic capabilities.** The skill needs to offer a value Claude can't easily reproduce.

## Description-budget triage

If you have 40 skills, the description budget is going to bite. Three levers:

1. **Set low-value skills to `"name-only"` in `skillOverrides`** (in `.claude/settings.local.json`). They appear in the `/` menu but their descriptions don't load.
2. **Set workflows to `disable-model-invocation: true`.** Their descriptions don't load and they cost zero budget. You still invoke them by typing `/`.
3. **Raise `SLASH_COMMAND_TOOL_CHAR_BUDGET`.** Last resort; usually tightening descriptions is healthier.

The `/skills` menu lets you cycle through states with `Space`: `on` → `name-only` → `user-invocable-only` → `off`. Press `Enter` to save to `settings.local.json`.

## Testing your description

Two tests, each takes 30 seconds:

1. **The "if I were the user" test.** Read your description aloud. Imagine your most natural phrasing of the request the skill should match. Does the description contain words from that phrasing? If not, the description is wrong, even if it's accurate.
2. **The "competing skill" test.** Imagine three other skills that vaguely match the same area. Would your description still win? If not, narrow it. Specific descriptions beat generic ones; generic descriptions lose to no-skill (Claude just handles the prompt directly).

If you're using the eval-loop optimizer in `~/.claude/skills/skill-creator/` (`scripts/run_loop.py`), the same principles apply: it generates trigger queries and iterates the description against them. Good queries are realistic and concrete; abstract ones produce abstract descriptions.

## Quick before-and-after

**Bad:** "Generates code documentation."

**Better:** "Generates JSDoc comments for the functions in a TypeScript file. Use when the user asks to add doc comments, document a file, or improve type-level documentation. Inspects exports and types; doesn't add inline comments inside function bodies."

The difference: the second tells Claude both what triggers it (asks to add doc comments, document a file, improve type-level documentation) and what it doesn't do (inline comments inside function bodies). The first triggers on nothing reliably and competes badly with any specific competitor.
