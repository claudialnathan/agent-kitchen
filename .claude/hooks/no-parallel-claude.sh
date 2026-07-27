#!/bin/bash
# PreToolUse gate: refuse agent-typed parallel / headless `claude` fan-out.
#
# On 2026-07-08 a hand-written parallel wave of headless `claude -p` calls drained a
# Max plan's session quota, then blindly relaunched on reset. Nested `claude -p`
# turns bill against the same account session limit as the interactive session,
# so parallel fan-out is a token bomb, not a speedup. The eval harnesses under
# skills/forge/evals/ drive the CLI one query at a time for this reason.
#
# This makes "don't fan out headless claude" a guarantee, not a request (hooks for
# guarantees, skills for guidance). Exit 2 blocks and feeds stderr back to Claude.
# The hook only sees agent-typed Bash, so a harness that spawns `claude` from a
# child process is never intercepted — this gates hand-rolled shell fan-out.
#
# Deliberate human override for a single command:  ALLOW_PARALLEL_CLAUDE=1 <command>

set -uo pipefail
[ "${ALLOW_PARALLEL_CLAUDE:-0}" = "1" ] && exit 0

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -n "$CMD" ] || exit 0

block() {
  {
    echo "BLOCKED: parallel/headless \`claude\` fan-out — the pattern that drained the plan on 2026-07-08."
    echo "Reason: $1"
    echo
    echo "Nested \`claude -p\` turns bill against the same session limit as this session."
    echo "Run them one at a time instead: sequential, concurrency 1, stopping on the"
    echo "first session-limit error rather than relaunching on reset."
    echo
    echo "A human can override one command with ALLOW_PARALLEL_CLAUDE=1."
  } >&2
  exit 2
}

# 1. xargs parallel fan-out at concurrency >= 2
if echo "$CMD" | grep -Eq 'xargs[^|;&]*-P[[:space:]]*([2-9]|[1-9][0-9]+)'; then
  block "xargs -P with concurrency >= 2"
fi

# 2. GNU parallel
if echo "$CMD" | grep -Eq '(^|[[:space:];&|()])parallel[[:space:]]'; then
  block "GNU parallel invocation"
fi

# No-token management subcommands (plugin/mcp/agents/config/doctor) are not
# fan-out; neutralize them so rules 3-4 only see token-billing invocations.
SCAN=$(echo "$CMD" | sed -E 's/claude[[:space:]]+(plugin|mcp|agents|config|doctor)([[:space:]]|$)/claude-admin\2/g')

# `claude` invoked as a command word (not the .claude dir or a claude-* path segment)
if echo "$SCAN" | grep -Eq '(^|[[:space:];&|()]|env[[:space:]][^|;&]*)claude[[:space:]]'; then
  # 3. a claude command combined with any fan-out primitive; a single `&`
  # backgrounds (fan-out), `&&` merely chains — don't match the latter
  if echo "$SCAN" | grep -Eq '(xargs|(^|[[:space:]])for[[:space:]]|(^|[[:space:]])while[[:space:]]|(^|[^&])&[[:space:]]*$|(^|[^&])&[[:space:]]+claude)'; then
    block "a \`claude\` command combined with a loop / background / xargs fan-out"
  fi
  # 4. more than one claude command word in a single line (hand-rolled batch)
  n=$(echo "$SCAN" | grep -Eo '(^|[[:space:];&|()])claude[[:space:]]' | wc -l | tr -d ' ')
  if [ "${n:-0}" -ge 2 ]; then
    block "multiple \`claude\` commands in one Bash call"
  fi
fi

exit 0
