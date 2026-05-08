#!/bin/bash
# Pre-tool-use guard for .claude/skills/ artifacts.
#
# Skills are *authored* in the harness workshop at:
#   /Users/claudianathan/repos/cookbooks/harness
# and *consumed* (read-only) in every other repo. When a session running in any
# other working directory tries to Edit/Write/MultiEdit a file under any
# `.claude/skills/` tree, surface a permission prompt — the user must approve
# explicitly, otherwise the edit is blocked.
#
# To switch to a hard block instead of an "ask" prompt, change the
# permissionDecision value to "deny".

set -euo pipefail

HARNESS_ROOT="/Users/claudianathan/repos/cookbooks/harness"

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Not a skill file? allow silently.
if [[ "$FILE_PATH" != *".claude/skills/"* ]]; then
  exit 0
fi

# In the harness workshop? allow silently — this is where skills are authored.
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-}"
if [[ "$PROJECT_DIR" == "$HARNESS_ROOT" ]]; then
  exit 0
fi

# Anywhere else: require explicit permission.
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Skill files are authored in the harness workshop ($HARNESS_ROOT). This session is in $PROJECT_DIR and is about to edit $FILE_PATH. Approve only if this is an intentional one-off; otherwise edit the canonical version in the harness and re-copy."
  }
}
EOF
exit 0
