# Claude Code hacks — commands, flags, env vars & tricks

A skimmable list of the commands, little additions, and "hacks" Claude Code ships. Every entry below is **current** — verified 2026-06-06 against **v2.1.165**, cross-checking the live commands reference (`code.claude.com/docs/en/commands`) against the changelog and removing anything since renamed or dropped (see [Retired](#retired--renamed--dont-use) at the bottom).

> Not exhaustive on purpose — the niche env vars and every launch flag live in `docs/en/settings`, `docs/en/cli-reference`, and `docs/en/hooks`. This is the useful/hacky subset. Ask me to refresh it when a changelog drops.

---

## Slash commands

**Setup & config**
- `/init` — generate a starter `CLAUDE.md` (set `CLAUDE_CODE_NEW_INIT=1` for an interactive flow through skills/hooks/memory).
- `/memory` — edit `CLAUDE.md` files; toggle and view auto-memory.
- `/config` (`/settings`) — settings UI: theme, model, output style.
- `/permissions` (`/allowed-tools`) — manage allow/ask/deny rules and review auto-mode denials.
- `/mcp` — manage MCP servers and OAuth.
- `/agents` — manage subagents.
- `/hooks` — view hook configs.
- `/model` — switch model (and adjust effort with ←/→); `s` = this-session-only.
- `/effort [low|medium|high|xhigh|max|ultracode|auto]` — set reasoning effort; no arg opens a slider.
- `/fast [on|off]` — toggle fast mode.
- `/sandbox` — toggle sandbox mode.
- `/statusline`, `/keybindings`, `/theme`, `/terminal-setup`, `/tui [fullscreen]` — terminal/UI config.
- `/status`, `/doctor` — health & connectivity (`/doctor` → press `f` to auto-fix).

**During a task**
- `/plan [description]` — enter plan mode (optionally with the task).
- `/context [all]` — visualize where the context window is going.
- `/compact [instructions]` — summarize the conversation to reclaim context.
- `/clear` (`/reset`, `/new`) — fresh context, keep project memory.
- `/btw <question>` — quick side question that doesn't bloat history.
- `/diff` — interactive diff viewer (git diff + per-turn diffs).
- `/rewind` (`/checkpoint`, `/undo`) — roll code/conversation back to a checkpoint.
- `/add-dir <path>` — add a working directory mid-session.

**Parallel & background work**
- `/tasks` (`/bashes`) — view everything running in the background.
- `/background [prompt]` (`/bg`) — detach the session to keep running; monitor with `claude agents`.
- `/batch <instruction>` — decompose a big change into 5–30 units, one background subagent + PR each (skill).
- `/fork <directive>` — spawn a forked subagent that inherits the full conversation (needs `CLAUDE_CODE_FORK_SUBAGENT=1`).
- `/branch [name]` — branch the conversation to try a different direction.
- `/stop` — stop the current background session.
- `/goal [condition]` — keep working across turns until a condition is met.
- `/workflows` — watch/pause/resume/save dynamic-workflow runs.
- `/loop [interval] [prompt]` (`/proactive`) — repeat a prompt; no prompt runs `.claude/loop.md` or an autonomous maintenance check (skill).

**Shipping & review**
- `/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [target]` — review the diff for bugs; `--fix` applies, `--comment` posts PR comments, `ultra` runs a cloud review (skill).
- `/simplify [target]` — cleanup-only review (reuse/simplify/efficiency/altitude) that applies fixes; no bug-hunting (skill).
- `/review [PR]`, `/security-review` — deeper read-only passes.
- `/ultrareview [PR]` — deep multi-agent cloud review (prefer `/code-review ultra`; this is now an alias).
- `/ultraplan <prompt>` — draft a plan in the cloud, review in browser, execute remotely or pull back.
- `/verify`, `/run`, `/run-skill-generator` — build/launch/drive your app to confirm a change works (skills).

**Sessions, web & remote**
- `/resume [session]` (`/continue`) — resume by id/name; background sessions show marked `bg`.
- `/rename [name]` — rename the session (auto-generates if blank).
- `/export [file]`, `/copy [N]` — export/copy conversation or the Nth-latest response.
- `/recap` — one-line summary of the current session.
- `/teleport` (`/tp`), `/remote-control` (`/rc`), `/remote-env` — move between web and terminal; drive this session from another device.
- `/desktop` (`/app`), `/mobile` (`/ios`, `/android`) — continue on desktop/mobile apps.
- `/schedule [description]` (`/routines`) — create cloud routines on a cron/event trigger.
- `/autofix-pr [prompt]` — cloud session that watches your PR and pushes fixes when CI fails.
- `/web-setup`, `/install-github-app`, `/install-slack-app`, `/chrome` — integrations.

**Meta, help & plugins**
- `/help`, `/release-notes`, `/feedback` (`/bug`, `/share`).
- `/skills` — list skills; press `t` to sort by token cost, `Space` to hide a skill.
- `/reload-skills`, `/reload-plugins [--force]` — re-scan disk without restarting.
- `/plugin [list|install|enable|disable]` — manage plugins.
- `/insights`, `/powerup`, `/team-onboarding` — usage report / interactive lessons / teammate ramp-up guide.
- `/usage` (`/cost`, `/stats`) — cost & limits, broken down by skill/subagent/plugin/MCP.
- `/usage-credits` — keep working past a limit (was `/extra-usage`).
- `/login`, `/logout`, `/upgrade`, `/privacy-settings`, `/passes`, `/exit` (`/quit`).

**Fun / niche** *(no `/dreams` command exists — these are the playful ones)*
- `/radio` — Claude FM lo-fi radio in your browser.
- `/stickers` — order Claude Code stickers.
- `/color [color]` — set prompt-bar color; no arg = random.
- `/heapdump` — write a heap snapshot to `~/Desktop` for memory diagnosis.
- `/deep-research <question>` — fan-out web research with a cited report (workflow).
- `/claude-api [migrate]` — load Claude API reference / migrate model versions (skill).
- `/fewer-permission-prompts` — build a permission allowlist from your transcripts (skill).
- `/voice [hold|tap|off]` — voice dictation.

## CLI commands & flags

Full list at `docs/en/cli-reference`. The hacky/common ones:

- `claude -p "<prompt>"` — headless/print mode (scriptable); `--output-format text|json|stream-json`.
- `claude -c` / `--continue`, `claude --resume` — pick up a prior session.
- `claude agents` — unified list of all sessions (running/blocked/done); `--json`, `--cwd <path>`.
- `claude --bg --exec '<cmd>'` — run a shell command as an attachable background session.
- `claude --worktree` (`+ --tmux`) — start in a fresh git worktree.
- `claude update` — update in place; `claude doctor` — diagnose install.
- `claude plugin <init|install|enable|disable|prune|marketplace>` — manage plugins; `init <name>` scaffolds one in `.claude/skills`.
- `claude project purge [path]` — delete all Claude Code state for a project (`--dry-run`, `--all`).
- `claude ultrareview [target]` — non-interactive cloud review for CI (`--json`).
- Launch flags: `--model`, `--effort`, `--permission-mode <auto|acceptEdits|plan|bypassPermissions>`, `--dangerously-skip-permissions`, `--add-dir`, `--mcp-config`, `--settings`, `--plugin-dir`, `--plugin-url <url>`, `--strict-mcp-config`, `--fallback-model`, `--agent <name>`, `--debug`.

## Environment variables

**Provider & model**
- `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL` — auth / custom gateway.
- `CLAUDE_CODE_USE_BEDROCK=1`, `CLAUDE_CODE_USE_VERTEX=1`, `CLAUDE_CODE_USE_MANTLE=1` — third-party providers.
- `ANTHROPIC_DEFAULT_OPUS_MODEL` / `ANTHROPIC_DEFAULT_SONNET_MODEL` / `ANTHROPIC_SMALL_FAST_MODEL` — pin model IDs.
- `CLAUDE_CODE_SUBAGENT_MODEL` — model used for subagents.

**Feature toggles**
- `CLAUDE_CODE_ENABLE_AUTO_MODE=1` — opt into auto mode on Bedrock/Vertex/Foundry.
- `CLAUDE_CODE_FORK_SUBAGENT=1` — enable `/fork`.
- `CLAUDE_CODE_NEW_INIT=1` — interactive `/init`.
- `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` — PowerShell tool on Windows.
- `ENABLE_TOOL_SEARCH` — opt into tool-search deferral (off by default on Vertex).
- `ENABLE_PROMPT_CACHING_1H` — 1-hour prompt-cache TTL.
- `USE_BUILTIN_RIPGREP=0` — opt out of the bundled ripgrep.
- `CLAUDE_CODE_SIMPLE=1` — strip skills, session memory, custom agents, and CLAUDE.md token counting for a minimal context.
- `CLAUDE_CODE_ENABLE_AWAY_SUMMARY=0` — opt out of the auto session recap.

**Shell & process**
- `BASH_DEFAULT_TIMEOUT_MS` — when a bash command exceeds it, it's auto-backgrounded (not killed).
- `BASH_NO_LOGIN`, `CLAUDE_CODE_SHELL`, `CLAUDE_CODE_SHELL_PREFIX` — shell behavior.
- `CLAUDE_CODE_TMPDIR` — relocate Claude's temp dir.
- `MCP_TIMEOUT` / `MCP_TOOL_TIMEOUT` — MCP connection / tool timeouts.

**Quiet / disable**
- `DISABLE_TELEMETRY=1`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` — suppress telemetry/usage metrics.
- `DISABLE_AUTOUPDATER=1`, `DISABLE_COMPACT=1`, `CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1`, `DISABLE_INTERLEAVED_THINKING=1`.
- `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1`, `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1`.

**Security & telemetry**
- `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` — PID-namespace subprocess isolation on Linux; `CLAUDE_CODE_SCRIPT_CAPS` caps per-session script runs.
- `OTEL_*` family — OpenTelemetry export (`OTEL_LOG_TOOL_DETAILS`, `OTEL_RESOURCE_ATTRIBUTES`, `OTEL_METRICS_EXPORTER`, etc.).
- `SLASH_COMMAND_TOOL_CHAR_BUDGET` — raise the skill-listing description budget.

## settings.json keys worth knowing

- `autoMode.hard_deny` — classifier rules that block unconditionally (policy backstop).
- `worktree.baseRef` (`fresh` | `head`) — branch worktrees from `origin/<default>` or local HEAD.
- `skillOverrides` — set a skill to `name-only` or `off` to save description budget.
- `disableSkillShellExecution` — block shell-injection markers in untrusted skills.
- `requiredMinimumVersion` / `requiredMaximumVersion` — managed: refuse to start outside a version range.
- `viewMode` — default focus/standard view.
- `permissions.defaultMode` — default permission mode for new sessions.
- `alwaysLoad` (per MCP server) — skip tool-search deferral; keep all tools available.

## Hook goodies

- Handler types: `command`, HTTP, and `mcp_tool` (call a connected MCP tool directly, no subprocess).
- `args: string[]` exec form — runs the command without a shell, so path placeholders never need quoting.
- `continueOnBlock` (PostToolUse) — feed the rejection back to Claude and continue instead of aborting.
- `additionalContext` (Stop / SubagentStop) — hand Claude feedback and keep the turn going.
- `terminalSequence` in output — desktop notifications, window titles, bells with no controlling terminal.
- `MessageDisplay` event — transform or hide assistant text as it's shown.
- `defer` permission decision (PreToolUse) — `-p` sessions pause and exit resumable.
- `UserPromptSubmit` → `sessionTitle` — set the session title from a hook.
- `PreCompact` can block compaction (exit 2 / `decision: block`).
- `SessionStart` → `reloadSkills: true` — surface skills a hook installs mid-session.
- Hooks receive `effort.level` (and `$CLAUDE_EFFORT`); MCP servers and hooks get `CLAUDE_PROJECT_DIR`.

## Neat tricks

- Prefix a line with `! ` to run a shell command as a background session (e.g. `! npm test`).
- Type `ultracode` in a prompt to fire a one-off dynamic workflow; `/effort ultracode` makes workflows the default.
- `/copy` then press `w` — write the response to a file instead of the clipboard (handy over SSH).
- `Ctrl+T` inside `claude agents` — pin a session so it survives idle and updates.
- Long bash commands auto-background at `BASH_DEFAULT_TIMEOUT_MS` instead of dying.
- Skills can interpolate `${CLAUDE_EFFORT}`, `${CLAUDE_SKILL_DIR}`, and `${CLAUDE_SESSION_ID}`.
- A plugin's `bin/` is added to PATH while the plugin is enabled — bare commands just work.
- Plugins auto-load from `.claude/skills/` with no marketplace; `claude plugin init <name>` scaffolds one.
- GFM checkboxes render in output: `- [ ]` and `- [x]` show as real checkboxes.
- `disallowed-tools` frontmatter (skills/commands) removes named tools while the skill is active.
- Vim editing lives under `/config` → Editor mode (the old `/vim` command is gone).

## Retired / renamed — don't use

- `workflow` trigger keyword → now **`ultracode`** (v2.1.160); the bare word no longer fires.
- `CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE` → removed / no-op (v2.1.160); use `/model claude-opus-4-6[1m]` then `/fast on`.
- `--enable-auto-mode` flag → gone; auto mode needs no opt-in consent.
- `/pr-comments` → removed v2.1.91 (just ask Claude to view PR comments).
- `/vim` → removed v2.1.92 (use `/config` → Editor mode).
- `/extra-usage` → `/usage-credits` (old name still works).
- `/simplify` was briefly merged into `/code-review`, now separate again (cleanup-only).
- **Windsurf** → **Devin Desktop** in `/ide` and `/terminal-setup` (editor rebrand).
- keybinding `modelPicker:setAsDefault` → `modelPicker:thisSessionOnly` (action `d` → `s`).
- `/effort` slider labels "Speed/Intelligence" → "Faster/Smarter".
- Native macOS/Linux builds: `Glob`/`Grep` tools replaced by embedded `bfs`/`ugrep` via the Bash tool.
