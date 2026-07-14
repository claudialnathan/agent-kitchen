#!/bin/bash
# Extract substantive user turns from a Claude Code session transcript (.jsonl).
# Reduces a multi-MB transcript to the few KB of what the user actually said —
# the raw material for correction mining. Filters command noise, tool results,
# system reminders, and subagent sidechains.
#
# Usage: extract-user-turns.sh <transcript.jsonl> [min-chars]
set -euo pipefail
F="${1:?usage: extract-user-turns.sh <transcript.jsonl> [min-chars]}"
MIN="${2:-40}"

jq -r '
  select(.type=="user" and .isSidechain != true)
  | (.timestamp // "") as $ts
  | .message.content
  | if type=="array" then (.[] | select(.type=="text") | .text)
    elif type=="string" then .
    else empty end
  | select(length > 0)
  | if $ts == "" then . else "[\($ts)] \(.)" end
' "$F" 2>/dev/null \
| grep -v '<local-command-caveat>' \
| grep -v '<command-name>' \
| grep -v '<command-message>' \
| grep -v '<command-args>' \
| grep -v '<local-command-stdout>' \
| grep -v '<system-reminder>' \
| grep -v '<task-notification>' \
| grep -v '</task-notification>' \
| grep -v 'Base directory for this skill:' \
| grep -v 'The user named this session' \
| awk -v min="$MIN" 'length($0) > min'
# Known limitation: a skill invocation injects its whole body as user-turn text;
# only the marker line is filterable here. Readers carry the skip instruction.
