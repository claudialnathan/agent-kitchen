---
name: hook-forge
description: |
  Designs hooks for Claude Code by classifying which lifecycle event fits the rule, choosing the right handler type, and getting the exit-code and JSON-output semantics correct. Hooks fire deterministically on lifecycle events (PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart, etc.); skills express requests that the model interprets. The single most-common authoring mistake is writing a skill for something that should be a hook, or vice versa. Use when the user wants to write, debug, or refactor a hook; when skill-forge's triage redirected to "this should be a hook"; when something must happen the same way every time without the model deciding; when a hook fires unexpectedly or doesn't fire at all.
when_to_use: |
  Triggers:
  - "write a hook"
  - "design a hook"
  - "make this happen every time"
  - "block this command"
  - "lint after every edit"
  - "inject context on prompt submit"
  - "validate before tool runs"
  - "this should be deterministic"
  - "skill-forge said make a hook"
  - "my hook isn't firing"
  - "my hook fires too often"
  - "PreToolUse vs PostToolUse"
  - "exit code 2 vs 1"
  - "permissionDecision"
  - "hook handler types"
  - "command vs HTTP vs MCP tool hook"
  - "block secrets from being committed"
  - "auto-name session"
  - "where do hooks live"
  - "hooks in skill frontmatter"
paths:
  - "**/.claude/settings.json"
  - "**/.claude/settings.local.json"
  - "**/.claude/skills/**/SKILL.md"
  - "**/.claude/agents/**/*.md"
  - "**/.claude/hooks/**"
harness-targets: [claude]
---

# hook-forge

A hook removes a concern from Claude's reach. The harness enforces the rule before the model interprets, decides, or attends to it. This is the strongest form of attention redirection in the toolkit: a skill redirects, a hook eliminates. The same rule shaped as a skill is interpretation the model can talk itself out of; shaped as a hook, it fires every time without the model in the loop.

The skill / hook confusion is the canonical authoring mistake. Get the shape wrong and you produce either toothless rules (a skill where a hook was needed) or surprise blocks (a hook where guidance would have done).

Three questions hold throughout any hook design:

1. **Event.** Which lifecycle moment is this rule about? PreToolUse and PostToolUse cover the bulk; UserPromptSubmit, SessionStart, Stop, and the file/cwd events cover specific cases. Different events fire at different times with different blocking semantics. The wrong event is the most common cause of "my hook didn't fire."

2. **Determinism mode.** Hard guarantee (block, exit 2 or `decision: "block"`) or soft signal (run a check, return information Claude reads)? Hard guarantees use exit code 2 or `decision: "block"`; soft signals return `additionalContext` or systemMessage. The wrong mode produces toothless rules or surprise blocks.

3. **Handler shape.** Five types: `command` (subprocess), `http` (POST to endpoint), `mcp_tool` (call connected MCP server tool), `prompt` (LLM yes/no), `agent` (subagent). Most hooks should be `command`. Reach for `prompt` or `agent` only when LLM judgment is genuinely required; they are slower and more expensive than a deterministic check.

## Step 0 — Name the failure, name the attention removed

Two questions before any of the three above.

**What failure did you observe?** Hooks are the canonical Ratchet surface: the agent did the wrong thing, you write a hook so it can't do it again.

- "Claude wrote to `.env` twice in one week despite CLAUDE.md saying not to."
- "PRs landed without lint output ever running on the diff."
- "A subagent ran a destructive `rm -rf` we didn't authorize."

If you cannot name a specific incident or repeated correction, stop. CLAUDE.md or a path-scoped rule is cheaper for things that *might* go wrong. A hook is the response to what already went wrong.

**What attention does this hook remove?** A hook does not just enforce; it eliminates a concern from Claude's reach. Naming what's eliminated keeps the hook from over-fitting to one incident. Block on `.env` writes: removes "should I write to .env?" from the decision tree, freeing attention for the actual work. Lint after every edit: removes "did I leave style debt?" from Claude's responsibility, freeing attention for substance. Inject git status on prompt submit: removes "where am I?" discovery calls from the opening of every session. If you cannot articulate the attention shift, suspect the hook is solving a one-off in a way that does not generalize; a different surface may fit better.

If the failure is one the current model has stopped making, don't write the hook. Record the model version this hook is earned against (see the repo's `Model-version pinning` convention) so the sunset audit has a trigger.

## Step 1 — Should this be a hook?

If you got here from skill-forge, you already triaged. If not, run a brief reverse-triage to confirm a hook *is* the right surface:

- **Skill** is right when the model interpreting the rule produces the right behavior most of the time. Soft preferences, conventions, "use this approach when...". Hooks make this rigid.
- **Hook** is right when the rule must hold every time, regardless of what the model decides. Hard policy, secrets-protection, post-edit verification, post-prompt context injection.
- **Settings (`permissions.deny`)** is right when the rule is just "this tool can't be used here" — no logic needed. Don't write a hook for what a deny rule expresses cleanly.
- **CLAUDE.md** is right when the rule is a fact Claude should hold every session. Hooks can't replace context.

If you're sure a hook is the answer, continue. If reverse-triage moved the work to a different surface than the user asked for, apply the *announce → confirm → carry through* gate from `skill-forge` — name the redirect in one line and get a go-ahead before invoking the companion forge.

## Step 2 — Pick the event

The full event reference is in [references/events.md](references/events.md). The decision shortcuts:

| Want to... | Event |
| :--- | :--- |
| Block / modify a tool call before it runs | `PreToolUse` |
| Run a script after a tool succeeds (lint, log, notify) | `PostToolUse` |
| Run a script after a tool fails (log, retry, ping) | `PostToolUseFailure` |
| Inject context into the user's prompt | `UserPromptSubmit` |
| Block the user's prompt entirely | `UserPromptSubmit` (return `decision: "block"`) |
| Run on session start (env setup, permissions, banners) | `SessionStart` |
| Run on session end (cleanup, logging) | `SessionEnd` |
| Stop Claude finishing (force more work) | `Stop` (return `decision: "block"`) |
| React to a subagent starting / finishing | `SubagentStart` / `SubagentStop` |
| React to a file changing on disk | `FileChanged` |
| React to working directory change | `CwdChanged` |
| Approve / deny / modify a permission decision | `PermissionRequest` |
| Block context compaction | `PreCompact` (return `decision: "block"` or exit 2) |
| Customize after compaction | `PostCompact` |

A handful of events are async (observability-only) and can't block: `SessionStart`, `SessionEnd`, `PostToolUse`, `PostToolUseFailure`, `PermissionDenied`, `CwdChanged`, `FileChanged`, `InstructionsLoaded`, `PostCompact`. The rest can.

## Step 3 — Pick the matcher

Matchers filter when the hook fires. Most events match on tool name; some match on event-specific values.

| Matcher value | Behaviour | Example |
| :--- | :--- | :--- |
| `"*"`, `""`, omitted | Matches all | Fires on every occurrence |
| Letters/digits/`_`/`\|` only | Exact match or `\|`-separated list | `"Bash"`, `"Edit\|Write"` |
| Other characters | JavaScript regex | `"^Notebook"`, `"mcp__memory__.*"` |

**Tool-event matchers** (`PreToolUse`, `PostToolUse`, etc.) match on tool name. `Bash`, `Edit`, `Write`, `WebFetch`, `Agent`, `Skill`, etc. MCP tools follow `mcp__<server>__<tool>`.

**Event-specific matchers:**
- `SessionStart`: `startup`, `resume`, `clear`, `compact`.
- `SessionEnd`: `clear`, `resume`, `logout`, `prompt_input_exit`, etc.
- `Notification`: `permission_prompt`, `idle_prompt`, `auth_success`, etc.
- `SubagentStart` / `SubagentStop`: agent type names.
- `FileChanged`: literal filenames (e.g., `.env|.envrc`) — does not follow standard matcher rules.
- `PreCompact` / `PostCompact`: `manual` or `auto`.

The most common mismatch: writing a `PreToolUse` hook with matcher `"Edit"` expecting it to fire on `Edit|Write|MultiEdit`. Use `"Edit|Write|MultiEdit"` or the regex `"^(Edit|Write|MultiEdit)$"`.

## Step 4 — Pick the handler type

Five handler types. Pick by what the check needs to do.

| Handler | When to use | When NOT to use |
| :--- | :--- | :--- |
| `command` | The check is a deterministic script (validate input, run a linter, scan a path). 90% of hooks. | When you genuinely need LLM judgment. |
| `http` | The check should be done by an external service (corp policy server, audit log, webhook). | When `command` would do — adds network latency and an extra failure mode. |
| `mcp_tool` | An already-connected MCP server has a tool that does exactly the check (e.g., a security scanner exposed via MCP). | When the MCP server isn't already needed for the main session — adds setup friction. |
| `prompt` | The check requires LLM judgment but a yes/no answer is enough (e.g., "does this commit message match conventional commits?"). | When deterministic logic would do — slow, costs tokens. |
| `agent` | The check requires multi-step reasoning with tool access (e.g., "spawn a verifier that reads the test diff and confirms coverage"). | Almost always. Most "I need an agent" cases are actually `prompt` cases or `command` cases. |

The full handler reference with JSON shapes is in [references/handlers.md](references/handlers.md).

## Step 5 — Get the exit-code semantics right

This is the single most-misunderstood area of hook authoring. The default assumption (exit 1 = block) is wrong.

| Exit code | Behaviour |
| :--- | :--- |
| **0** | Success. Stdout parsed for JSON output (used in some events). For most events, stdout is shown in the debug log only. |
| **2** | **Blocking error.** Stdout ignored; stderr fed to Claude. For `PreToolUse`, blocks the tool. For `UserPromptSubmit`, blocks the prompt. For `Stop`, prevents Claude from stopping. |
| **Other** (1, 3, ...) | Non-blocking error. First line of stderr in transcript; full stderr in debug log. **Does not block.** |

**Rule of thumb:** if you want to block, exit `2`. Anything else (including `1`) does not block. This catches a lot of authors who write `if (bad) { exit 1 }` and wonder why the bad thing keeps happening.

**Success silent, failures verbose.** Hooks should be invisible when they pass and loud when they fail. A `command` PostToolUse hook that prints "lint clean" on every edit is noise that pollutes the next turn's context for every reader downstream. Print nothing on success; print the actionable error on failure. The exit-code semantics encode this: exit 0 with empty stdout costs nothing, exit 2 with stderr is the loud failure path Claude reads and reacts to. If the hook is doing observability, log to a file rather than stdout; only the agent-actionable part belongs in the harness loop.

For events that can use JSON output for richer control (`PreToolUse` `permissionDecision`, `UserPromptSubmit` `decision`, `Stop` `decision`), see [references/handlers.md](references/handlers.md).

## Step 6 — Where does the hook live?

Two locations, with different scoping:

| Location | Scope | When |
| :--- | :--- | :--- |
| `~/.claude/settings.json` | All projects (your machine) | Personal hooks: lint formatters, Slack notifications, etc. |
| `.claude/settings.json` | This project (shared) | Team-wide policy: secret scanning, lint enforcement |
| `.claude/settings.local.json` | This project (you only) | Personal project-specific hooks not for the team |
| Plugin `hooks/hooks.json` | Where plugin is enabled | Distributable hook bundles |
| Skill frontmatter `hooks:` | Only while that skill is active | Skill-scoped guardrails (e.g., `db-reader` skill that should never see `INSERT`) |
| Agent frontmatter `hooks:` | Only while that subagent is active | Subagent-scoped guardrails |

**Choose by lifetime:**
- Always-on for the project → `.claude/settings.json` (committed) or `.claude/settings.local.json` (uncommitted).
- Always-on for you across projects → `~/.claude/settings.json`.
- Active only when a specific skill or subagent is running → frontmatter on that skill/agent.

A hook in skill frontmatter is *automatically scoped to that skill's lifetime*; the script doesn't need gates that check whether to run.

## Step 7 — Verify against the harness, then test

Two passes. Most hook bugs come from misremembered semantics, not buggy scripts.

**Verify assumptions against the canonical docs.** Before testing, cross-check `https://code.claude.com/docs/en/hooks` for the specific event you're using:

- Does this event support blocking, or is it observability-only?
- What exit codes and JSON output does the event actually accept?
- What matcher rules apply (tool-name match? event-specific values? regex semantics?)?
- Has the event's input or output schema changed since you last used it?

The hook surface evolves: new events get added, schemas get richer, exit-code semantics for new events ship as they land. Trust the canonical page over memory and over this skill.

**Test in a fresh session.** Three checks before you ship:

1. **Does it fire?** Trigger the event manually (run the matched tool, submit a prompt, etc.) and check the debug log (`claude --debug`). If the hook didn't fire, the matcher is probably wrong.
2. **Does it block or not-block correctly?** For blocking hooks, deliberately violate the rule and confirm the action is blocked. For non-blocking, confirm the action proceeds and the side effect happens.
3. **Does it return useful information?** Stderr on exit 2 is fed to Claude. Write it as a message Claude reads, not a one-word rejection. "Blocked: command tries to write to .env. Use the .env.example template instead." beats "rejected."

## Worked examples

### `command` PreToolUse: block writes to .env

*Earned against:* repeated incidents where Claude attempted to edit `.env` directly to add a debug variable, despite CLAUDE.md saying not to. CLAUDE.md is interpreted; a hook makes the rule deterministic.

`.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/no-env-writes.sh" }
        ]
      }
    ]
  }
}
```

`.claude/hooks/no-env-writes.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
PATH_=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [[ "$PATH_" =~ \.env(\..+)?$ ]]; then
  echo "Refusing to edit .env files. Use .env.example or document the var in CLAUDE.md." >&2
  exit 2
fi
exit 0
```

Why this shape: deterministic check ⇒ `command` handler. Hard guarantee ⇒ exit 2. Stderr is the message Claude reads. The matcher catches all three file-edit tools.

### `command` PostToolUse: lint after every edit

*Earned against:* PRs landing with lint errors because the agent assumed style was clean and skipped the local check. The hook closes the verification loop after every edit so the agent sees the error in-session, not in CI.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/lint-changed.sh" }
        ]
      }
    ]
  }
}
```

The script runs `pnpm lint --fix` on the path that was edited. Returns 0 always (PostToolUse can't block; the tool already ran). Stdout contains the lint output, which Claude reads on the next turn.

### `command` UserPromptSubmit: inject git status

*Earned against:* sessions opening with no awareness of uncommitted state, leading to "wait, where am I?" tool calls before any real work. The hook makes the cheap context free and avoids the discovery round-trip.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/inject-git-state.sh" }
        ]
      }
    ]
  }
}
```

The script returns a JSON object with `hookSpecificOutput.additionalContext` containing the current branch and `git status --short`. Claude sees the user's prompt with the git context already attached.

### Skill-scoped frontmatter hook: read-only db-reader

*Earned against:* a `db-reader` skill being invoked in a session where the agent issued an `UPDATE` because the prompt mentioned "fix this row" and the skill's read-only intent wasn't enforced. CLAUDE.md instruction is interpretation; the frontmatter hook is enforcement scoped to the skill's lifetime.

```yaml
---
name: db-reader
description: ...
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "${CLAUDE_SKILL_DIR}/scripts/check-readonly-sql.sh"
---
```

The hook only fires while the `db-reader` skill is active. The script blocks `INSERT|UPDATE|DELETE|DROP|...` queries with exit 2.

## Common failure modes

The full anti-pattern catalog is in [references/anti-patterns.md](references/anti-patterns.md). The most common in practice:

- **Exit 1 expected to block.** Doesn't. Use exit 2.
- **Matcher misses a tool.** `"Edit"` doesn't match `Write`. Use `"Edit|Write|MultiEdit"`.
- **PostToolUse used for blocking.** Tool already ran; can't undo. Use PreToolUse.
- **Hook tries to do too much.** A 200-line bash script in a hook is a smell — extract to a real script, call it from the hook, keep the hook config thin.
- **Hook output that pollutes context.** PostToolUse stdout is fed back to Claude. Verbose lint output on every edit floods the conversation. Suppress noise; surface only failures.
- **Hook with side effects in PreToolUse.** PreToolUse should *check*, not *do*. If your hook mutates state, you've reinvented Claude's tools poorly. Use PostToolUse for side effects, or just let Claude run the side effect as a real tool call.
- **MCP-tool handler when command would do.** Adds connection dependency and complexity for no benefit. Use `command` unless the check genuinely lives in an external system.

## Closing checklist

Before saving:

- [ ] Confirmed this should be a hook, not a skill / settings deny rule / CLAUDE.md fact.
- [ ] Picked the right event (timing, blocking semantics).
- [ ] Matcher actually covers the tool/event names you mean (test with the regex if uncertain).
- [ ] Handler type fits the work (most should be `command`).
- [ ] Exit 2 if blocking, 0 if pass; nothing else means anything to Claude Code.
- [ ] Stderr (on block) reads as a message to Claude, not as a one-word rejection.
- [ ] Hook lives at the right scope (project vs personal vs skill-frontmatter).
- [ ] If `command` handler: script reads JSON from stdin, returns useful exit code, doesn't ingest its own source into context.
- [ ] Sanity-tested: the rule fires when expected, doesn't fire when not, blocks correctly, surfaces the right message.

## When to delete a hook

Hooks accumulate. A hook earned against a specific model failure may be redundant once the model improves, but unlike skills hooks fire every session: dead hooks are a permanent tax. The deletion side of the Ratchet:

1. On each major model release, pick a hook and re-run the failure scenario without it. Does the agent still make the mistake?
2. If no, delete the hook. The harness no longer needs to enforce what the model now gets right.
3. If yes but the failure has shifted, rewrite rather than layering more hooks on top of the old one.

Watch for the second kind of staleness too: hooks that target conventions that have moved (a matcher tied to a tool nobody uses anymore, a script that checks a path the project no longer has). The hook still fires every turn; the failure it was preventing no longer exists. Periodic audit is the cost of keeping the harness honest.

## When this skill doesn't apply

- The rule is a soft preference / convention. Use a skill or CLAUDE.md.
- The rule is just "block this tool everywhere." Use `permissions.deny` in settings.
- The work is multi-step reasoning that needs LLM judgment for each step. Use a subagent.
- The "hook" is really a long-running background watcher. Use the Monitor tool from a skill body.

## Methodology note

When stuck, fetch the canonical hook docs at `https://code.claude.com/docs/en/hooks` directly. The hook surface evolves — events get added (the `mcp_tool` handler type is recent; `defer` permission decisions in PreToolUse are recent), JSON output schemas get richer, exit-code semantics for new events get documented as they ship. Trust the canonical pages over training data.

## See also

- [references/events.md](references/events.md) — every event with input/output schema and blocking behavior.
- [references/handlers.md](references/handlers.md) — the five handler types in depth, with JSON shapes.
- [references/anti-patterns.md](references/anti-patterns.md) — common bad hooks with what they should be.
- `https://code.claude.com/docs/en/hooks` — canonical reference, always more current than this skill.
