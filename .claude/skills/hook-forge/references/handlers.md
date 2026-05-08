# Handler types

Five hook handler types. The choice is mostly about *what the check needs to do* and *where the logic lives*. 90% of hooks should be `command`. Reach further only when there's a genuine reason.

## Common fields

Every handler entry has these:

| Field | Required | Description |
| :--- | :--- | :--- |
| `type` | Yes | `"command" \| "http" \| "mcp_tool" \| "prompt" \| "agent"` |
| `if` | No | Permission rule for tool events: `"Bash(git *)"`, `"Edit(*.ts)"` |
| `timeout` | No | Seconds before canceling. Defaults: 600 (command), 30 (prompt), 60 (agent) |
| `statusMessage` | No | Custom spinner message |
| `once` | No | Run once per session then remove (skill frontmatter only) |

## 1. `command` — subprocess

The default. A shell script is invoked; receives JSON on stdin; returns exit code + optional stdout/stderr.

```json
{
  "type": "command",
  "command": "/path/to/script.sh",
  "async": false,
  "asyncRewake": false,
  "shell": "bash"
}
```

**Use when:**
- The check is deterministic (validate input, run linter, scan a path).
- You can write a small script.
- You want fast iteration (edit script, no service to redeploy).

**Don't use when:**
- The check requires LLM judgment (use `prompt`).
- The script would be 200+ lines with branching logic (extract to a real binary or service).

**Script discipline:**
- Read JSON from stdin: `INPUT=$(cat)`.
- Extract fields: `jq -r '.tool_input.file_path // empty' <<<"$INPUT"`.
- Exit 2 to block; exit 0 for pass; anything else is non-blocking error.
- Stderr on exit 2 is the message Claude reads — write it as feedback, not as a one-word error.
- Keep it fast: every hook fires synchronously and adds latency. Sub-100ms is the target for hooks that fire on every tool call.

**Path conventions:**
- `${CLAUDE_PROJECT_DIR}` for project-root-relative paths.
- `${CLAUDE_PLUGIN_ROOT}` for paths inside a plugin.
- `${CLAUDE_SKILL_DIR}` for paths inside the skill (frontmatter hooks only).

**Skeleton:**

```bash
#!/bin/bash
set -euo pipefail
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  echo "Refusing rm -rf. Use a more specific path or move to /tmp first." >&2
  exit 2
fi

exit 0
```

## 2. `http` — POST to an endpoint

Sends the hook input as a POST body to a URL. The response controls behavior.

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/pre-tool-use",
  "headers": {
    "Authorization": "Bearer $MY_TOKEN"
  },
  "allowedEnvVars": ["MY_TOKEN"]
}
```

**Use when:**
- Policy lives in an external service (corp policy server, audit log).
- Multiple machines need to share the policy.
- The check writes to an audit log as a side effect.

**Don't use when:**
- A `command` handler would do (avoids network latency and an extra failure mode).
- The endpoint isn't on a low-latency path (a hook firing on every tool call can't tolerate a 500ms HTTPS round-trip).

**Response semantics:**
- Non-2xx responses are non-blocking errors (logged, not blocking).
- 2xx with JSON body returns control fields the same as command-handler stdout.
- Body shape mirrors the command-handler JSON output (`decision`, `hookSpecificOutput`, etc.).

**Security:**
- Use `allowedEnvVars` to whitelist environment variables sent in headers. Never put secrets in header values literally.

## 3. `mcp_tool` — call a connected MCP server tool

Calls a tool on an MCP server that's already connected to the session. Tool output becomes the hook output.

```json
{
  "type": "mcp_tool",
  "server": "my_server",
  "tool": "security_scan",
  "input": { "file_path": "${tool_input.file_path}" }
}
```

**Use when:**
- An MCP server you already use exposes the exact check you need.
- The check benefits from being colocated with other MCP tooling (auth, logging, observability).

**Don't use when:**
- The MCP server isn't otherwise needed for the session — adds setup friction.
- You'd be writing the MCP server just for this hook (use `command` instead and skip the connection).

**Variable substitution:** `${tool_input.field}` references fields from the hook input. The harness substitutes before calling the MCP tool.

## 4. `prompt` — LLM yes/no judgment

Sends the hook input to a Claude model with a prompt; the response is interpreted as approve/deny.

```json
{
  "type": "prompt",
  "prompt": "Does the following commit message follow conventional-commit format? Respond yes or no, then a one-sentence reason.\n\nMessage: $ARGUMENTS",
  "model": "haiku"
}
```

**Use when:**
- The check requires *judgment* a deterministic script can't capture.
- A simple yes/no answer is enough.
- The cost (tokens, latency) is acceptable for the firing cadence.

**Don't use when:**
- A regex / lint rule / parser would do.
- The judgment requires reading multiple files or running tools (use `agent`).
- The hook fires on every tool call (per-tool-call LLM judgment is expensive and slow).

**Cost note:** every fire costs tokens and ~1-3 seconds. Acceptable for `UserPromptSubmit` (once per turn), questionable for `PreToolUse` (once per tool call).

## 5. `agent` — spawn a subagent

Spawns a subagent with tool access to perform a multi-step verification.

```json
{
  "type": "agent",
  "prompt": "Verify the test diff at $TOOL_INPUT.file_path covers the changes in HEAD. Read the diff, read the tests, return verdict + reasoning."
}
```

**Use when:**
- The check needs multi-step reasoning with tool access (read files, run commands, synthesize).
- The expense (tokens, time) is justified by the cost of a missed bug.
- It's a low-frequency event (Stop, SessionEnd, manual hooks).

**Don't use when:**
- Almost any other case. This is the most expensive handler. Most hooks misclassified as needing an agent are actually `prompt` or `command` cases.

## Decision shortcut

```
What does the check need?
├─ A regex / file inspection / subprocess → command
├─ A call to an external service                → http
├─ A tool exposed by an MCP server you have      → mcp_tool
├─ LLM yes/no judgment, simple                   → prompt
└─ Multi-step LLM reasoning with tool access     → agent (rare)
```

## JSON output schema (universal)

Every handler can return a JSON object with these fields. Different events use different subsets.

```json
{
  "continue": true,
  "stopReason": "Build failed",
  "suppressOutput": false,
  "systemMessage": "Warning message",
  "decision": "block",
  "reason": "Explanation",
  "hookSpecificOutput": {
    "hookEventName": "EventName",
    "additionalContext": "Context for Claude",
    "permissionDecision": "allow | deny | ask | defer",
    "permissionDecisionReason": "Reason",
    "updatedInput": { "modified": "values" },
    "sessionTitle": "Auto-named session"
  }
}
```

Which fields apply to which events is documented in [events.md](events.md). The full canonical schema is at `https://code.claude.com/docs/en/hooks` — that page is updated as new fields are added.

## Anti-patterns

- **`agent` handler when `prompt` would do.** Most "I need a verifier subagent" cases are actually "I need yes/no judgment." Try `prompt` first.
- **`http` handler with a remote service when local `command` would do.** Adds 50–500ms latency per hook fire and an extra failure mode (network).
- **Long inline `command` strings.** Anything beyond a 1-line check should be a script file. Inline gets unreadable fast.
- **No timeout on `prompt` or `agent`.** Defaults are 30s and 60s, but slow hooks are still bad UX. Set explicit timeouts when you know the work should be fast.
- **Returning verbose stdout from PostToolUse hooks.** That output enters context every turn the matcher fires. Keep it terse; surface only failures or notable events.
