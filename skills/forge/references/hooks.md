# Hook mechanics

Events, matchers, handlers, exit semantics, placement. The judgment (strictness, what deserves a hook) lives in SKILL.md. The hook surface evolves — new events, richer schemas — so on anything load-bearing, cross-check `code.claude.com/docs/en/hooks` and trust it over this file.

## Events

Cadence: once per session (`SessionStart`, `SessionEnd`); once per turn (`UserPromptSubmit`, `Stop`, `StopFailure`); every tool call (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`).

| Want to... | Event | Blocks? |
| :--- | :--- | :--- |
| Block / modify a tool call before it runs | `PreToolUse` | yes |
| Run after a tool succeeds (lint, log, notify) | `PostToolUse` | no (already ran) |
| Run after a tool fails (retry, page) | `PostToolUseFailure` | no |
| Inject context into every prompt | `UserPromptSubmit` | yes (or just add context) |
| Run on session start (env, banner) | `SessionStart` | no |
| Stop Claude finishing (force more work) | `Stop` | yes — use sparingly, loops |
| Automate a permission decision | `PermissionRequest` | yes |
| React to a subagent starting/finishing | `SubagentStart` / `SubagentStop` | start yes / stop yes (nudge) |
| React to a file changing on disk | `FileChanged` | no |
| Veto or react to compaction | `PreCompact` / `PostCompact` | pre yes / post no |
| Transform displayed assistant text | `MessageDisplay` | no (display-only) |

Async, observability-only (can't block): `SessionStart`, `SessionEnd`, `PostToolUse`, `PostToolUseFailure`, `PermissionDenied`, `FileChanged`, `ConfigChange`, `CwdChanged`, `InstructionsLoaded`, `Notification`, `MessageDisplay`, `PostCompact`, plus the task/worktree/teammate events.

Event-specific output worth knowing:

- **PreToolUse** — the richest: JSON `hookSpecificOutput` with `permissionDecision: "allow" | "deny" | "ask" | "defer"`, `permissionDecisionReason`, `updatedInput` (modify params before execution), `additionalContext`. `defer` flags the call for later resumption in `-p` automation.
- **UserPromptSubmit** — `additionalContext` (appended to the prompt), `sessionTitle` (auto-name the session), `decision: "block"` + `reason`.
- **Stop / SubagentStop** — `additionalContext` hands Claude feedback and continues, the non-blocking nudge; exit 2 / `decision: "block"` forces more work.
- **SessionStart** — stdout becomes context; write env vars to `$CLAUDE_ENV_FILE`; return `reloadSkills: true` after installing skills mid-session.
- **PermissionDenied** — `decision: { retry: true }` lets the model retry with a different approach.

Common input on every hook: `session_id`, `transcript_path`, `cwd`, `permission_mode`, `effort.level` (also exported as `$CLAUDE_EFFORT` — gate expensive checks on it), `hook_event_name`, plus event-specific fields.

## Matchers

| Matcher value | Behavior |
| :--- | :--- |
| `"*"`, `""`, omitted | matches all |
| Letters/digits/`_`/`-`/`\|` only | exact match or `\|`-list: `"Edit\|Write"`. Hyphens joined the exact-match set in **v2.1.195** — `code-reviewer` / `mcp__brave-search` now match only that literal, not as a substring (pre-v2.1.195 they were unanchored regex) |
| Anything else | JavaScript regex (unanchored): `"^Notebook"`, `"mcp__memory__.*"` |

- Tool events match on tool name; MCP tools follow `mcp__<server>__<tool>`.
- **Wildcard a hyphenated MCP server explicitly:** `mcp__brave-search__.*` matches every tool from `brave-search`; since v2.1.195 a bare `mcp__brave-search` exact-matches only a tool of that literal name, so the `__.*` form is the version-safe way to catch the whole server.
- Event-specific matchers: `SessionStart` (`startup`/`resume`/`clear`/`compact`), `SessionEnd` (`clear`/`logout`/...), `Notification` (`permission_prompt`/...), `SubagentStart`/`Stop` (agent type), `PreCompact`/`PostCompact` (`manual`/`auto`), `StopFailure` (`rate_limit`/`authentication_failed`/...). `FileChanged` matches **literal filenames** (`.env|.envrc`) — not standard matcher rules.
- The classic miss: `"Edit"` does not match `Write`. Use `"Edit|Write|MultiEdit"`.

## Exit codes

| Exit | Behavior |
| :--- | :--- |
| **0** | Success. Stdout parsed for JSON output (event-dependent); otherwise debug-log only |
| **2** | **Blocking error.** Stderr is fed to Claude. Blocks the tool (PreToolUse), the prompt (UserPromptSubmit), or the stop (Stop) |
| other | Non-blocking error. **Does not block** — including exit 1 |

The single most-misunderstood fact: `if (bad) exit 1` does not block. Block with 2.

## Handlers

| Handler | Use when | Avoid when |
| :--- | :--- | :--- |
| `command` | Deterministic check (validate, lint, scan). ~90% of hooks | LLM judgment genuinely needed |
| `http` | Policy lives in an external service | `command` would do — adds latency + a failure mode. Non-2xx = non-blocking; use `allowedEnvVars` for header secrets |
| `mcp_tool` | A connected server has exactly the check; `${tool_input.field}` substitution in `input` | The server isn't otherwise needed |
| `prompt` | LLM yes/no is enough (cost: tokens + 1–3s per fire — fine per-turn, dubious per-tool-call) | A regex would do |
| `agent` | Multi-step verification with tool access, low-frequency events | Almost always — most "agent" cases are `prompt` or `command` |

Common handler fields: `if` (permission-rule filter like `"Bash(git *)"`), `timeout` (defaults 600s command/http/mcp, 30s prompt, 60s agent), `statusMessage`, `once` (skill-frontmatter only). On `command`, an `args` array spawns the executable directly with no shell — prefer it when paths could contain spaces.

`command` discipline: read JSON from stdin (`INPUT=$(cat)`), extract with `jq -r '.tool_input.file_path // empty'`, exit 2 + stderr to block, exit 0 silent to pass. Keep it fast — hooks fire synchronously; sub-100ms is the target for per-tool-call hooks. Path vars: `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_SKILL_DIR}` (frontmatter hooks).

Universal JSON output (subsets per event): `continue`, `stopReason`, `suppressOutput`, `systemMessage`, `decision`, `reason`, `hookSpecificOutput { additionalContext, permissionDecision, permissionDecisionReason, updatedInput, sessionTitle }`.

## Placement — choose by lifetime

| Location | Scope |
| :--- | :--- |
| `~/.claude/settings.json` | you, all projects |
| `.claude/settings.json` | this project, committed (team policy) |
| `.claude/settings.local.json` | this project, you only |
| plugin `hooks/hooks.json` | wherever the plugin is enabled |
| skill frontmatter `hooks:` | only while that skill is active |
| agent frontmatter `hooks:` | only while that subagent is active |

A frontmatter hook is auto-scoped to its artifact's lifetime — no need for the script to gate itself. This dissolves the hook-or-skill either/or: a skill can carry its own enforcement.

## Worked example — block writes to .env

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

```bash
#!/bin/bash
INPUT=$(cat)
P=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [[ "$P" =~ \.env(\..+)?$ ]]; then
  echo "Refusing to edit .env files: writes here bypass the team's secret scanning. Add the key to .env.example and document it instead." >&2
  exit 2
fi
exit 0
```

Deterministic check ⇒ `command`; hard guarantee ⇒ exit 2; stderr written as teaching, not denial; matcher covers all three edit tools. A skill-scoped variant works the same with the config in skill frontmatter `hooks:` and `${CLAUDE_SKILL_DIR}` paths — see Placement.

## Failure modes

- Exit 1 expected to block (doesn't — use 2).
- `"Edit"` matcher missing `Write`/`MultiEdit`.
- PostToolUse used for blocking (tool already ran; use PreToolUse).
- Verbose stdout on every fire — context pollution; surface only failures.
- Side effects in PreToolUse (it should *check*; side effects go in PostToolUse or a real tool call).
- A 200-line inline script — extract to a file, keep the config thin.
- Over-blocking (cry-wolf): strictness mismatched to false-positive rate; the user disables the hook and the guarantee is gone.
- Substring-blind command regexes — shell text is not tokens: `&&` contains `& ` (an ordinary chain matches a backgrounding pattern), a no-token subcommand (`claude plugin`) contains the guarded command word, and quoted strings or heredocs match like live syntax. Before shipping a blocking pattern, run it against the benign neighbors of every hostile case: chained vs backgrounded, subcommand vs flag, fixture text that merely quotes the pattern.

## Debugging

Trigger the event manually and watch `claude --debug` (didn't fire → matcher is wrong). Deliberately violate the rule to confirm the block. To prove a hook (vs. stock behavior) causes a symptom, restart with `claude --safe-mode` — everything custom disabled — and bisect from there. Dead hooks are a permanent per-session tax: on each major model release, re-run the failure without the hook and delete if the model stopped making it.
