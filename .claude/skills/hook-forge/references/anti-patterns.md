# Hook anti-patterns

Concrete failure shapes from real-world hook authoring, with the fix for each.

## 1. Exit 1 expecting it to block

```bash
#!/bin/bash
INPUT=$(cat)
if dangerous_check "$INPUT"; then
  echo "blocked" >&2
  exit 1
fi
```

**Why it's broken:** Exit 1 is treated as a non-blocking error. The action proceeds. Stderr ends up in the debug log; Claude doesn't see it.

**Fix:** Use `exit 2`. Only exit 2 blocks. This is the single most common hook mistake.

## 2. Matcher that misses tools

```json
{
  "matcher": "Edit",
  "hooks": [...]
}
```

**Why it's broken:** Matches only the `Edit` tool. Doesn't fire on `Write`, `MultiEdit`, or `NotebookEdit` — all of which can also modify files.

**Fix:** `"Edit|Write|MultiEdit"` or, for all file-edit tools, `"Edit|Write|MultiEdit|NotebookEdit"`. When in doubt, write the regex: `"^(Edit|Write|MultiEdit|NotebookEdit)$"`.

## 3. PostToolUse used for blocking

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash(rm -rf *)",
        "hooks": [{ "type": "command", "command": "..." }]
      }
    ]
  }
}
```

**Why it's broken:** PostToolUse fires *after* the tool runs. The `rm -rf` already happened. Exit 2 from PostToolUse can't undo the damage.

**Fix:** Use `PreToolUse` for blocking. PostToolUse is for after-the-fact reactions: lint, log, notify, format.

## 4. Hook that does too much

```bash
#!/bin/bash
# 250 lines of bash with branching, parsing, multiple checks...
```

**Why it's broken:** Hooks that have grown into mini-applications are hard to test, hard to debug, and hide their logic from the team. The hook config gives no signal about what's actually being enforced.

**Fix:** Extract the logic to a real script (Python, Node, Go, whatever fits) and have the hook call it. Keep the hook config thin and declarative. Pass the JSON through; let the script do the work.

## 5. Hook with side effects in PreToolUse

```bash
#!/bin/bash
# PreToolUse hook for Edit
INPUT=$(cat)
PATH_=$(echo "$INPUT" | jq -r '.tool_input.file_path')

# "Help" Claude by formatting the file before it edits
prettier --write "$PATH_" >&2
exit 0
```

**Why it's broken:** PreToolUse should *check*, not *do*. The "helpful" formatting now races with whatever Claude's about to write — Claude might overwrite the formatted file, the formatter might be wrong about what to format, the side effect happens silently.

**Fix:** Either let Claude run prettier as a real Bash call, or run the formatter in a `PostToolUse` hook (after the edit, deterministic, visible).

## 6. Verbose PostToolUse output that floods context

```bash
#!/bin/bash
# PostToolUse on Edit|Write
pnpm lint  # outputs 800 lines of "checking foo.ts... ok"
```

**Why it's broken:** Stdout from PostToolUse is fed back to Claude on the next turn. 800 lines of "ok" for every edit is recurring context cost that adds up fast.

**Fix:** Suppress passes; surface only failures. `pnpm lint --quiet` or pipe through grep for errors. Better: run lint in `--fix` mode and only print the diff if changes were made.

## 7. MCP-tool handler when command would do

```json
{
  "type": "mcp_tool",
  "server": "secrets-scanner",
  "tool": "scan",
  "input": { "content": "${tool_input.content}" }
}
```

**Why it's broken:** Adds a connection dependency. If the MCP server fails to connect, the hook silently doesn't fire (or fires with a degraded response). The check itself is a regex; an MCP server is overkill.

**Fix:** `command` handler with a small `scan-secrets.sh` that does the regex. Faster, fewer moving parts, easier to debug.

## 8. Permission rule reinvented as a hook

```bash
#!/bin/bash
# PreToolUse on Bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
if [[ "$COMMAND" == "git push --force"* ]]; then
  echo "no force pushing" >&2
  exit 2
fi
```

**Why it's broken:** This is what `permissions.deny` is for. A hook that's just "block this exact pattern" duplicates settings logic and runs a subprocess on every Bash command.

**Fix:** Add to settings:
```json
{
  "permissions": {
    "deny": ["Bash(git push --force*)", "Bash(git push -f *)"]
  }
}
```

Use hooks for checks that need *logic* (file inspection, parsing, dynamic conditions). Use deny rules for static patterns.

## 9. Stop hook that creates a loop

```bash
#!/bin/bash
# Stop hook
echo "Tests didn't pass yet" >&2
exit 2
```

**Why it's broken:** Always blocks. Claude tries to keep going, can't satisfy the (unspecified) condition, hits the Stop hook again, blocks again. Loop.

**Fix:** Stop hooks should check a real condition and only block when it's *not* met:
```bash
#!/bin/bash
if ! pnpm test --silent >/dev/null 2>&1; then
  echo "Tests are failing — fix or explicitly skip before stopping." >&2
  exit 2
fi
exit 0
```

Even then: Stop hooks are easy to get wrong. Most "force more work" cases are better handled by the user noticing and prompting again.

## 10. Hook that ingests its own large script source

```bash
# A skill or rule that says "to verify this, read scripts/verify.py and use it"
# scripts/verify.py is 800 lines.
```

**Why it's broken:** The skill telling Claude to *read* the script defeats the bundling. The script's whole point is to execute without loading into context.

**Fix:** "Run `python scripts/verify.py --help` first; do not read the source unless customization is genuinely needed." Same discipline as toolkit-kind skills (see skill-forge `references/skill-kinds.md` section on Toolkit).

## 11. Treating a soft preference as a hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "prompt",
          "prompt": "Does this command match our project's coding style? Block if not."
        }]
      }
    ]
  }
}
```

**Why it's broken:** Style is a soft preference. Hooking it means Claude can't try-and-iterate on the right phrasing — the LLM judgment in the hook will be inconsistent, and a hard block on style guesses will frustrate the user.

**Fix:** Convention belongs in CLAUDE.md or a knowledge skill. Hooks are for hard rules.

## 12. Hook firing on async events that can't block

```json
{
  "hooks": {
    "FileChanged": [
      {
        "matcher": ".env",
        "hooks": [{
          "type": "command",
          "command": "echo 'env changed, blocking' >&2; exit 2"
        }]
      }
    ]
  }
}
```

**Why it's broken:** `FileChanged` is async; it's observability only. Exit 2 doesn't block anything because there's nothing to block — the file already changed.

**Fix:** If you want to react to env changes, use the FileChanged hook for the *reaction* (reload env, notify Claude). If you want to *prevent* env edits, use a `PreToolUse` hook on `Edit|Write|MultiEdit` that checks the path.

## 13. Hook that doesn't read its input

```bash
#!/bin/bash
echo "blocked" >&2
exit 2
```

**Why it's broken:** Blocks every fire of the matched event, regardless of context. Indistinguishable from a permission deny rule, except slower and less expressive.

**Fix:** Read stdin (`INPUT=$(cat)`), parse the relevant fields with `jq`, make a context-aware decision. If the decision genuinely doesn't depend on input, use a deny rule instead.

## 14. Hook with no error message

```bash
#!/bin/bash
INPUT=$(cat)
if dangerous_check "$INPUT"; then
  exit 2
fi
```

**Why it's broken:** Exit 2 with no stderr leaves Claude with no information about why the action was blocked. Claude can't redirect; the user gets a confusing failure.

**Fix:** Always write a useful message to stderr before `exit 2`. Address it to Claude (which is reading it): "Blocked: this command would write outside the project directory. Use `git checkout` from inside the repo instead." Not "rejected" or "no."
