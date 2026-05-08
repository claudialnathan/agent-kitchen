# Hook events reference

Every hook event Claude Code fires, with what triggers it, the matcher field, the input fields it receives, whether it can block, and the output schema. Synthesized from the canonical docs at `https://code.claude.com/docs/en/hooks`. Trust the canonical page on conflict.

## Cadence

Events fire at three rhythms:

- **Once per session:** `SessionStart`, `SessionEnd`.
- **Once per turn:** `UserPromptSubmit`, `Stop`, `StopFailure`, `UserPromptExpansion`.
- **On every tool call:** `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`.

Plus async events (observability, can't block): `FileChanged`, `ConfigChange`, `CwdChanged`, `InstructionsLoaded`, `Notification`, `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult`, `TeammateIdle`.

## Tool-call events

### PreToolUse

- **When:** Before tool execution, after parameters created.
- **Matcher:** Tool name (`Bash`, `Edit`, `mcp__...`, etc.).
- **Can block:** Yes.
- **Input:** `tool_name`, `tool_input`, `tool_use_id`, plus common fields.
- **Output for blocking:** Exit 2 with stderr, OR JSON `hookSpecificOutput` with:
  - `permissionDecision`: `"allow" | "deny" | "ask" | "defer"`
  - `permissionDecisionReason`: shown to user
  - `updatedInput`: modify tool params before execution
  - `additionalContext`: text added to Claude's context

The richest event. Use `permissionDecision` JSON output for control beyond block/allow — `defer` lets you flag the tool call for later resumption (with `--resume`), useful in `-p` automation.

### PostToolUse

- **When:** After tool succeeds.
- **Matcher:** Tool name.
- **Can block:** No (tool already ran).
- **Input:** `tool_name`, `tool_input`, `tool_use_id`, `tool_result`, plus common fields.
- **Output:** Stdout fed to Claude on next turn. JSON `decision: "block"` keeps Claude going (force more work) instead of stopping.

The most useful event for "do this every time after X." Lint, format, test, log, notify.

### PostToolUseFailure

- **When:** Tool execution fails.
- **Matcher:** Tool name.
- **Can block:** No (tool already failed).
- **Input:** `tool_name`, `tool_input`, `error`.
- **Output:** Same as PostToolUse.

For retry / fallback / paging logic specific to tool failures.

### PermissionRequest

- **When:** Permission dialog about to be shown to user.
- **Matcher:** Tool name.
- **Can block:** Yes (denies the permission).
- **Input:** `tool_name`, `tool_input`, `permission_suggestions`.
- **Output:** JSON `hookSpecificOutput.decision` with `behavior: "allow" | "deny"`, optional `updatedInput`, `updatedPermissions`, `message`.

For automating permission decisions based on context (e.g., auto-deny `Bash(rm *)` when in a non-trash directory).

### PermissionDenied

- **When:** Tool denied by auto-mode classifier.
- **Matcher:** Tool name.
- **Can block:** No (denial already occurred).
- **Input:** `tool_name`, `tool_input`, `reason`.
- **Output:** JSON `decision: { retry: true }` tells the model it may retry the denied tool with a different approach.

## Turn-level events

### UserPromptSubmit

- **When:** User submits a prompt, before Claude processes.
- **Matcher:** Not supported (always fires).
- **Can block:** Yes.
- **Input:** `prompt`.
- **Output:** Exit 2 to block, or JSON with:
  - `decision: "block"` + `reason`
  - `hookSpecificOutput.additionalContext`: text appended to the prompt (Claude reads)
  - `hookSpecificOutput.sessionTitle`: auto-name the session

The best place to inject project state into every prompt (git status, current branch, time, etc.). If the hook script's stdout is JSON, the output is structured; if it's plain text and exit code is 0, the text is treated as `additionalContext` for some events.

### UserPromptExpansion

- **When:** A slash command's body is being expanded.
- **Matcher:** Command name.
- **Can block:** Yes.

For preprocessing custom-command expansions.

### Stop

- **When:** Claude finishes responding.
- **Matcher:** Not supported.
- **Can block:** Yes (forces Claude to keep going).
- **Input:** Common fields only.
- **Output:** Exit 2 or `decision: "block"` + `reason` to keep going.

For "don't stop until X is verified" rules. Use sparingly — it can create infinite loops if the hook always blocks.

### StopFailure

- **When:** Stop event triggered by an error (rate limit, auth, etc.).
- **Matcher:** Failure reason (`rate_limit`, `authentication_failed`, `billing_error`, `server_error`, etc.).
- **Can block:** No.

For paging / alerting on specific failure modes.

### SubagentStart / SubagentStop

- **When:** A subagent begins / completes execution.
- **Matcher:** Agent type name.
- **Can block:** SubagentStart yes, SubagentStop yes.
- **Input:** `agent_type`, `agent_id`, `prompt` (start only).

For per-subagent setup/teardown (e.g., spin up a test DB before a `db-tester` subagent).

## Session events

### SessionStart

- **When:** New session, or `--resume` / `--continue` / `/resume`.
- **Matcher:** `startup`, `resume`, `clear`, `compact`.
- **Can block:** No (async).
- **Input:** `source`, `model`, optional `agent_type`.
- **Output:** Plain stdout added as context. Set environment variables by writing to `$CLAUDE_ENV_FILE`.

The right place for: setting env vars, displaying a banner, loading project-specific context that CLAUDE.md doesn't cover.

### SessionEnd

- **When:** Session terminates.
- **Matcher:** `clear`, `resume`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other`.
- **Can block:** No.
- **Input:** `reason`.

For cleanup, telemetry, log shipping.

## Filesystem / config events

### FileChanged

- **When:** Watched file changes on disk.
- **Matcher:** Literal filenames (`.env|.envrc`) — does not follow standard matcher rules.
- **Can block:** No.
- **Input:** `file_path`, `change_type` (`created`, `modified`, `deleted`).

Reactive workflows: rebuild types when schema changes, reload env when `.envrc` updates.

### CwdChanged

- **When:** Working directory changes.
- **Matcher:** Not supported.
- **Can block:** No.
- **Input:** `new_cwd`, `old_cwd`.

Direnv-style workflows: re-evaluate environment on cd.

### ConfigChange

- **When:** A config file (settings, skills, agents) changes during session.
- **Matcher:** `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills`.
- **Can block:** Yes.

Validation gate when settings change.

### InstructionsLoaded

- **When:** A `CLAUDE.md` or `.claude/rules/*.md` is loaded into context.
- **Matcher:** Load reason (`session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`).
- **Can block:** No.
- **Input:** `file_path`, `memory_type`, `load_reason`, optional `globs`, `trigger_file_path`, `parent_file_path`.

Audit / observability of what context is being loaded.

## Compaction events

### PreCompact

- **When:** Before context compaction.
- **Matcher:** `manual`, `auto`.
- **Can block:** Yes.

Use to defer compaction or veto an auto-compact at a bad moment.

### PostCompact

- **When:** After compaction completes.
- **Matcher:** Same.
- **Can block:** No.

For logging the compaction or restoring context that was dropped.

## Notifications and elicitations

### Notification

- **When:** A notification is shown to the user.
- **Matcher:** `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`, etc.
- **Can block:** No.

For desktop notifications, log shipping, paging.

### Elicitation / ElicitationResult

- **When:** An MCP server requests user input / after the user responds.
- **Matcher:** MCP server name.
- **Can block:** Yes.

Pre/post hooks around MCP server input requests.

## Common input fields

Every hook receives:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/directory",
  "permission_mode": "default | plan | acceptEdits | auto | dontAsk | bypassPermissions",
  "hook_event_name": "EventName"
}
```

Plus event-specific fields documented per-event above.

## Quick lookup: "I want to..."

| Goal | Event | Handler | Block via |
| :--- | :--- | :--- | :--- |
| Block a command before it runs | `PreToolUse` | command | exit 2, or JSON `permissionDecision: "deny"` |
| Lint after every edit | `PostToolUse` | command | (no block; tool ran) |
| Inject context into the prompt | `UserPromptSubmit` | command | (return `additionalContext` in JSON) |
| Block the prompt entirely | `UserPromptSubmit` | command | exit 2, or `decision: "block"` |
| Set env on session start | `SessionStart` | command | (write to `$CLAUDE_ENV_FILE`) |
| Auto-name session | `UserPromptSubmit` | command | (return `hookSpecificOutput.sessionTitle`) |
| Block secrets in commits | `PreToolUse` matcher `Bash(git commit *)` | command | exit 2 |
| Auto-confirm specific permissions | `PermissionRequest` | command | JSON `hookSpecificOutput.decision.behavior` |
| React to file change | `FileChanged` | command | (no block; observability only) |
| Force more work after Claude stops | `Stop` | command | exit 2 (use sparingly) |
| Validate via external service | any | `http` | per-handler |
| Validate via MCP server | any | `mcp_tool` | per-handler |
| Validate via LLM judgment | any | `prompt` | per-handler |
