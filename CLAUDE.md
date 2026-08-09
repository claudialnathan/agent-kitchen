@AGENTS.md

## Claude Code

The rules above are the whole of this repo's intent and apply here unchanged. What follows is Claude-only.

When a skill name in this repo collides with one at `~/.claude/skills/<name>/`, flag it and ask the user how to proceed. Personal scope wins silently, so a session can be steered by the wrong copy without anything reporting the shadowing.
