# Frontmatter and substitutions

Every frontmatter field, when it's worth setting, when it's noise, and the substitution variables you can use in the body. Synthesized from the current docs (May 2026); always defer to the live skills page if you see drift.

## Unrecognized fields are silently ignored

Read this before debugging anything else. The loader reads only the fields catalogued below. Two failure modes look like working configuration but do nothing:

1. **Top-level keys not on the list.** A field named `trigger:` at top level, for example, is dead bytes. The skill still loads. There is no warning.
2. **Recognized field names nested under unknown parents.** Putting `trigger:` or `paths:` or `when_to_use:` under a `metadata:` block, an `extra:` block, or any other unrecognized parent has the same effect. The nested key never reaches the loader.

Real failure: a skill shipped with `metadata: trigger: ...` and a top-level `description:`. Description appeared in the listing; the trigger phrases never did. Nothing flagged it.

If a frontmatter setting seems to have no effect, check the field name (and its parent, if any) against the catalogue below before assuming the loader is broken or the cache is stale.

## Field reference

### `name`
- **Type:** string (lowercase, digits, hyphens; max 64 chars)
- **Default:** the directory name
- **Worth setting:** almost always. Even when it matches the directory name, setting `name:` explicitly makes the SKILL.md file readable on its own (a reader doesn't have to look at the surrounding directory to know what the skill is called) and makes the skill's identity less coupled to its filesystem location. The directory-name default is fine for prototypes; ship-quality skills should set `name:` explicitly.

### `description`
- **Type:** string
- **Default:** first paragraph of the body if omitted
- **Worth setting:** always. This is the *only* thing the model uses to decide whether to invoke. The combined `description` + `when_to_use` is truncated at **1,536 chars** in the skill listing.
- **Anti-pattern:** generic descriptions ("a skill that helps with code"). They lose against any specific competing skill.

### `when_to_use`
- **Type:** string (often multi-line)
- **Default:** none
- **Worth setting:** any time the skill has more than one or two distinct trigger phrasings. The combined `description` + `when_to_use` budget is the same 1,536 chars, but splitting still helps in three ways: (1) the description (the *what*) stays scannable, (2) the trigger phrases get their own field that grows without making the lead sentence longer, (3) Claude's pattern-matching against the listed triggers reads more discretely than scanning a single dense paragraph. If you find yourself appending "Triggers on phrasings like '...', '...', '...'" to the end of `description`, lift those into `when_to_use` instead.
- **Pattern:** one-paragraph or bullet list of trigger phrases lifted from real conversations. Use folded block scalar (`|`) for multi-line if you want preserved newlines.

**Concrete contrast:**

```yaml
# Before (everything in description):
description: Decision framework for testing in Next.js 16+ projects. Covers ... and the dev-vs-prod Playwright variant split. Use when designing a test setup, debugging cache/test races, deciding which layer a test belongs in. Triggers on phrasings like "tests are flaky", "tests don't see the new data", "vitest vs playwright", "where should I test this", "set up testing for Next 16", "is this test in the right layer", "cache components and tests don't agree".

# After (split):
description: Decision framework for testing in Next.js 16+ projects with Cache Components. Covers the Vitest/Playwright pyramid, the cache invalidation matrix, and the dev-vs-prod Playwright variant split.
when_to_use: |
  - "tests are flaky"
  - "tests don't see the new data"
  - "vitest vs playwright"
  - "where should I test this"
  - "set up testing for Next 16"
  - "is this test in the right layer"
  - "cache components and tests don't agree"
```

Both forms cost the same against the 1,536-char budget. The second is easier to read and easier to extend.

### `argument-hint`
- **Type:** string
- **Default:** none
- **Worth setting:** any skill that takes arguments. Shown during `/` autocomplete. Examples: `[issue-number]`, `<file>`, `<from> <to>`.
- **Note:** this is a UI hint only; doesn't affect parsing.

### `arguments`
- **Type:** YAML list or space-separated string
- **Default:** none
- **Worth setting:** when the skill takes 2+ positional arguments and using named substitution (`$component`, `$from`, `$to`) makes the body more readable than `$0`/`$1`/`$2`.
- **Example:**
  ```yaml
  arguments: [component, from, to]
  ```
  Then in the body: `Migrate $component from $from to $to.`

### `disable-model-invocation`
- **Type:** boolean
- **Default:** `false`
- **Worth setting `true` for:** all **workflow** and **guarded action** kinds. Anything with side effects. Anything you want to control the timing of (`/commit`, `/deploy`, `/post-update`).
- **Side effect:** also prevents the skill from being preloaded into subagents via the `skills:` field.
- **Anti-pattern:** setting `true` on a knowledge skill — Claude will never auto-pull it in, defeating the purpose.

### `user-invocable`
- **Type:** boolean
- **Default:** `true`
- **Worth setting `false` for:** background knowledge that isn't a meaningful command. Hides the skill from the `/` menu but Claude can still load it when relevant.
- **Pattern:** `legacy-payments-context`, `our-internal-domain-vocab` — things you'd never type but Claude should know.
- **Note:** does not block programmatic invocation via the Skill tool. Use `disable-model-invocation: true` for that.

### `allowed-tools`
- **Type:** YAML list or space-separated string
- **Default:** none (every tool prompts as usual)
- **Worth setting for:** **workflow** and **guarded action** kinds, with the *narrowest* tool patterns that work.
- **Best practice:** `Bash(git add *) Bash(git commit *)` over `Bash`. Specific MCP tool patterns over `mcp__server__*` over the whole server.
- **Critical:** this *grants* permission while the skill is active; it does *not* restrict tools. To restrict, use deny rules in settings, not `allowed-tools`.
- **Project skills note:** `allowed-tools` only takes effect after the workspace trust dialog is accepted. Review project skills before trusting a repo.

### `model`
- **Type:** model alias (`sonnet`, `opus`, `haiku`), full model ID (`claude-opus-4-7`), or `inherit`
- **Default:** inherits from session
- **Worth setting:** when the skill genuinely needs a different model — heavy reasoning skill on a Sonnet session, or a quick-summary skill that benefits from Haiku speed.
- **Note:** the override applies for the rest of the current turn; the session model resumes on the next prompt.

### `effort`
- **Type:** `low` | `medium` | `high` | `xhigh` | `max` (model-dependent)
- **Default:** inherits from session
- **Worth setting:** for skills that need deeper reasoning (e.g., a refactor planner) or shallower (e.g., a fast summarizer). The current Opus 4.7 default is `xhigh`; raising to `max` is rarely worth it and can over-think.
- **Pro tip:** include the keyword `ultrathink` anywhere in the skill body to request deeper reasoning on that turn without changing the effort setting.

### `context`
- **Type:** `fork`
- **Default:** unset (inline)
- **Worth setting:** for **forked research** kind — when the skill's whole job is to investigate and summarize.
- **Critical:** the skill body becomes the prompt the subagent runs. If your body is "guidelines for using X" with no actionable task, the subagent has nothing to do and will return empty.

### `agent`
- **Type:** subagent name — built-in (`Explore`, `Plan`, `general-purpose`) or custom (anything from `.claude/agents/`)
- **Default:** `general-purpose` when `context: fork` is set
- **Worth setting with `context: fork`:**
  - `Explore` for read-only codebase investigation (fast, Haiku-backed).
  - `Plan` for plan-mode-style analysis.
  - `general-purpose` when the subagent needs Edit/Write.
  - A custom agent when you have specific tool restrictions or persistent memory needs.

### `hooks`
- **Type:** map of hook events to handler arrays
- **Default:** none
- **Worth setting:** when the skill needs a hard guardrail while active — e.g., a `db-reader` skill that should never see write SQL. Hooks here only fire while the skill is active and clean up when it finishes.
- **Pattern:**
  ```yaml
  hooks:
    PreToolUse:
      - matcher: "Bash"
        hooks:
          - type: command
            command: "${CLAUDE_SKILL_DIR}/scripts/check-readonly.sh"
  ```

### `paths`
- **Type:** YAML list or comma-separated string of glob patterns
- **Default:** none
- **Worth setting for:** **path-scoped knowledge** — knowledge that only matters when working with certain files. Auto-loads only when matching files are open. Underused. Any framework-specific or library-specific knowledge skill (testing setup, ORM patterns, deploy conventions, etc.) is a candidate, because the description doesn't need to compete for budget on prompts that aren't touching matching files. Manual invocation via `/<name>` works regardless of `paths:`, so adding it is pure win when the scope is genuinely narrow.
- **Pattern:**
  ```yaml
  paths:
    - "src/api/**/*.ts"
    - "tests/api/**/*.ts"
  ```
- **Test-stack example** — for a knowledge skill about Next.js + Playwright + Vitest testing, you'd scope it to test files and config:
  ```yaml
  paths:
    - "**/*.{test,spec}.{ts,tsx,js,jsx}"
    - "**/playwright*.config.{ts,js}"
    - "vitest.config.{ts,js}"
    - "tests/**"
    - "e2e/**"
  ```
  Now the description loads when the user is editing a test or test config, not on every prompt.

### `shell`
- **Type:** `bash` | `powershell`
- **Default:** `bash`
- **Worth setting:** only on Windows when you want inline-injection blocks (the bang-backtick form) to run via PowerShell. Requires `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`.

### `compatibility` (open-spec field)
- **Type:** string (max 500 chars)
- **Default:** none
- **Worth setting for:** any skill with non-trivial runtime requirements — a stack assumption, a system package, network access, a specific framework version. Open-spec consumers (Cursor, Codex, `skills-ref validate`) surface this in the listing; Claude Code ignores it gracefully. The field is in the agentskills.io spec but Claude-Code-specific catalogues regularly skip it, which means cross-tool installers see a generic skill with no signal that it assumes Next.js 16+ (or Tailwind v4, or whatever).
- **Examples:** `compatibility: Tailwind v4 + shadcn 4.x on Base UI`, `compatibility: Next.js 16+ App Router with Cache Components, Vitest, Playwright, Supabase`, `compatibility: Requires git, gh CLI, and read access to the project's GitHub repo`.
- **Anti-pattern:** writing the requirements in the body preamble instead. Body is recurring context cost; `compatibility:` is read once at discovery and free thereafter.

### `license` (open-spec field)
- **Type:** string (license name or reference to a bundled file)
- **Default:** none (the marketplace plugin manifest may carry it)
- **Worth setting for:** skills distributed via direct symlink (e.g., the cross-tool publish to `~/.cursor/skills/` and `~/.codex/skills/`) where there is no plugin manifest to inherit a license from. For skills only shipped via the plugin, the manifest license is enough.
- **Spec recommendation:** keep it short — the SPDX name (`Apache-2.0`, `MIT`) or a reference to a bundled file (`LICENSE.txt`).

## Substitutions in the body

These run *before* the body enters context.

### Argument substitutions
- `$ARGUMENTS` — full string after the slash command (or the user's text when Claude invokes).
- `$ARGUMENTS[N]` — single argument by 0-based index. Shell-style quoting: `/foo "hello world" bar` makes `$ARGUMENTS[0]` = `hello world`, `$ARGUMENTS[1]` = `bar`.
- `$N` — shorthand for `$ARGUMENTS[N]`. `$0`, `$1`, `$2`.
- `$<name>` — when `arguments:` is declared, names map to positions in order.
- If `$ARGUMENTS` (or any substitution) is *not* present in the body and the user passed arguments, Claude Code appends `ARGUMENTS: <input>` so they're not lost.

### Environment substitutions
- `${CLAUDE_SESSION_ID}` — current session ID. Useful for log files, session-scoped output paths.
- `${CLAUDE_EFFORT}` — current effort level (`low`/`medium`/`high`/`xhigh`/`max`). Rare; useful when the skill should adapt.
- `${CLAUDE_SKILL_DIR}` — directory containing this `SKILL.md`. **Use this whenever you reference bundled scripts** so they resolve correctly at user, project, or plugin scope.

### Dynamic shell injection
- **Inline form** — an exclamation mark immediately followed by a backtick-wrapped command. Runs at injection time; output replaces the placeholder. The command's stdout becomes part of the prompt. (The literal form is described in words rather than rendered because including it in this file would be parsed as a real injection by the skill loader.)
- **Fenced form** for multi-line scripts — open a fence with three backticks immediately followed by an exclamation mark, write the commands one per line, close with a normal three-backtick fence. (Same reason for the words-only rendering.)
- This is *preprocessing*, not a tool call. Claude sees the data, not the command.
- Disabled per-policy via `"disableSkillShellExecution": true` in settings — useful in managed environments. Bundled and managed skills are exempt.

> **Authoring note:** the skill loader pre-processes every file in the skill directory looking for two trigger sequences: an exclamation mark immediately followed by a backtick (the inline injection opener), and three backticks immediately followed by an exclamation mark (the fenced injection opener). The scan does not respect markdown context — inline code spans, headers, and nested code fences all get scanned. If either sequence appears in the file's source bytes, the loader will try to execute whatever follows it as a shell command, the permission check will fail, and the skill will fail to load. When documenting these features in a meta-skill, always describe the syntax in words; never render it. See the canonical example at `https://code.claude.com/docs/en/skills` under "Inject dynamic context."

## Order of fields

There's no enforced order, but a readable convention:

```yaml
---
name: skill-name                    # only if differs from dir
description: ...                    # always
when_to_use: ...                    # only if you need extra trigger phrases
argument-hint: <args>               # only if takes args
arguments: [a, b]                   # only if 2+ named args

disable-model-invocation: true      # invocation control
user-invocable: false

context: fork                       # execution
agent: Explore
model: sonnet                       # only if non-default
effort: xhigh                       # only if non-default
allowed-tools: Bash(...) ...

paths:                              # activation scoping
  - "..."

hooks:                              # last; takes most space
  PreToolUse:
    - ...
---
```

## Common slip-ups

- Setting both `disable-model-invocation: true` and `paths:` — `paths:` controls auto-loading by Claude, but you've disabled auto-invocation. Pick one.
- Using `tools:` instead of `allowed-tools:` — that's the subagent field, not the skill field. They look similar; they aren't.
- `allowed-tools: Bash` on a workflow that runs four specific commands — pre-approves everything, defeating the safety.
- Setting `model` to a model your account doesn't have access to — silent fallback may surprise you.
- Heavy `when_to_use` blocks that push past the 1,536-char cap — the tail gets truncated, taking the trigger phrases with it.
- Unescaped quotes inside an unquoted scalar `description:` — embedded `"..."` that aren't matched-and-balanced break strict YAML parsers. Symptoms: skill fails to load on some machines but not others, or the description gets parsed truncated. Fix: wrap the whole description in single quotes (and escape internal single quotes by doubling), or use a folded block scalar (`>`) so the whole multi-line value is treated as one string.
- **Colon-space (`: `) inside an unquoted scalar `description:`** — same failure mode, same fix. YAML 1.2 reserves `: ` as the key/value separator and forbids it inside plain scalars. A description like `... discovery pattern: read globals.css ...` parses fine in Claude Code's lenient loader but blows up under PyYAML and other strict parsers, which means it'll fail validation in any cross-tool publish path. Single-quote the description, or use `>` block scalar. Real failure mode: `shadcn-tailwind` shipped with this and survived locally because `bin/preship-check` is line-oriented; strict-YAML consumers (Cursor, Codex, `skills-ref validate`) would have rejected it.
- Skipping `name:` and relying on the directory-name default — works, but the SKILL.md is harder to read on its own and the skill's identity is coupled to where it lives. Set `name:` explicitly for ship-quality skills.
- Leaving trigger phrases at the end of a long `description:` instead of moving them into `when_to_use:` — same character cost, worse readability and pattern-matching.
