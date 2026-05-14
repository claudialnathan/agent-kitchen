# The state of Claude Code and the coding-agent landscape — May 2026

A snapshot of what's true about Claude Code and the broader coding-agent ecosystem right now. Not a tutorial — a factual reference for builders working against these surfaces. Filtered to what changes how you build, configure, and ship.

If you've been away for a few months, read this first; the surface has shifted faster than the mental models. Last reviewed against Claude Code v2.1.141 and the docs at `code.claude.com/docs` as of mid-May 2026.

## The six surfaces of Claude Code, and how they coexist

There are six places to put behavior, and they don't substitute for each other:

1. **CLAUDE.md** — facts loaded every session, in full, always-on.
2. **`.claude/rules/*.md`** with `paths:` frontmatter — facts scoped to file globs; loaded when matching files are opened.
3. **Skills** (`.claude/skills/<name>/SKILL.md`) — knowledge or workflows; description always loaded, body when invoked.
4. **Subagents** (`.claude/agents/<name>.md`) — isolated context for side tasks.
5. **Hooks** (in settings.json or skill frontmatter) — deterministic actions on lifecycle events.
6. **MCP servers** — connections to external systems.

**Plugins** are the packaging layer for everything except CLAUDE.md and rules.

The key shift from earlier in 2025: **custom slash commands have been merged into skills**. A file at `.claude/commands/foo.md` and a skill at `.claude/skills/foo/SKILL.md` both create `/foo`. Skills are the canonical surface; commands files keep working but aren't the recommended path.

Cross-reference: FLUE (`flueframework.com`) frames the agent stack as four layers — Model / Harness / Sandbox / Filesystem. The six-surface taxonomy above is scoped to authoring inside Claude Code (the surfaces *are* what you author against); FLUE's framing is more useful when designing runtime-deployed autonomous agents.

## The cost model nobody tells you about up front

Every visible skill consumes description budget *every turn*. Once invoked, the skill body lives in conversation context for the rest of the session. This is the most-misunderstood thing about skills.

Hard numbers:

- **Per-skill description cap**: 1,536 characters (`description` + `when_to_use` combined).
- **Total skill listing budget**: scales at 1% of context window, fallback 8,000 chars; `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var raises it.
- **Compaction budget**: most recent invocation of each skill re-attached, **first 5,000 tokens kept**, **shared 25,000-token cap** across re-attached skills, filled most-recent-first.
- **CLAUDE.md sweet spot**: under 200 lines per file; over 500 lines causes Claude to ignore parts.
- **MEMORY.md (auto-memory)**: first 200 lines or 25KB loaded at session start.

Practical consequences:

- Visible skills that shouldn't auto-trigger should be `disable-model-invocation: true` (zero description cost, still user-invocable).
- Knowledge skills with broad applicability should be path-scoped (`paths:` glob) so they don't load when out of scope.
- Reference docs > 150 lines belong in sibling files, not inline.

## What's distinctive about May 2026 (vs. last quarter)

Features that changed how skills get built, in rough order of impact:

### Custom commands merged into skills

- `.claude/commands/foo.md` and `.claude/skills/foo/SKILL.md` both create `/foo`.
- Skills add: optional sibling files, frontmatter for invocation control, auto-load by Claude when relevant.
- Skill takes precedence if both exist with the same name.

### Auto mode (research preview)

- Permission-mode `auto`: a classifier reviews tool calls, blocks risky ones, lets routine work proceed without prompts.
- Available as `--permission-mode auto` or via `/permissions`.
- New hook: `PermissionDenied` fires on classifier denials; `retry: true` lets the model try a different approach.
- Available without `--enable-auto-mode` (the flag was removed).
- `settings.autoMode.hard_deny` defines classifier rules that block unconditionally regardless of user intent or allow exceptions — useful as a policy-grade backstop.

### Forked subagents (`/fork`, w17)

- `CLAUDE_CODE_FORK_SUBAGENT=1` enables fork mode.
- A fork inherits the *full conversation history* (unlike a normal subagent which starts fresh). Same system prompt, tools, model, prompt cache.
- `/fork <directive>` spawns one. Useful for try-this-and-keep-going workflows.

### Monitor tool (w15, v2.1.98)

- Background watcher that streams output lines back as conversation messages.
- Tail logs, poll CI, watch files. Replaces `Bash` + `sleep` loops.
- Plugins can declare monitors that auto-arm at session start.
- Not on Bedrock/Vertex/Foundry.

### Routines (w16, web)

- Templated cloud agents fired by schedule, GitHub event, or API call.
- Run on Claude Code on the web; no local machine needed.
- `/schedule` from CLI scaffolds them; web UI for full management.

### `/ultrareview` and `/ultraplan`

- Multi-agent cloud-based code review and planning.
- `/ultrareview` runs parallel reviewers + adversarial critique; returns verified findings.
- `/ultraplan` drafts a plan in a cloud session; review in browser; execute remotely or pull back to CLI.
- `claude ultrareview [target]` runs the review non-interactively from CI or scripts (`--json` for raw output; exits 0 on completion, 1 on failure).

### Opus 4.7 + xhigh effort (w16)

- New default on Max and Team Premium.
- Five effort levels on 4.7: `low`, `medium`, `high`, `xhigh` (recommended default for most coding/agentic work), `max`.
- Adaptive reasoning is always on for 4.7 (no fixed-budget mode).
- `/effort` opens an interactive slider when called without args.
- 1M context window included for Max/Team/Enterprise on Opus.

### Agent view (`claude agents`, research preview)

- `claude agents` opens a unified list of every Claude Code session — running, blocked on you, or done.
- New top-level CLI surface for managing parallel/background work, agent teams, and previously-backgrounded sessions.
- `claude agents --cwd <path>` scopes the list to a directory.

### `/goal` command

- Set a completion condition; Claude keeps working across turns until it's met.
- Works in interactive, `-p`, and Remote Control modes.
- Live overlay panel shows elapsed time, turns, and tokens consumed.

### Hook system additions

The hook surface has accumulated several useful fields:

- **`mcp_tool` handler type** — hook handler can call an already-connected MCP server tool directly, no subprocess. Useful for validation that needs external state.
- **`args: string[]` exec form** — spawns the command directly without a shell, so path placeholders never need quoting.
- **`continueOnBlock` for PostToolUse** — feeds the hook's rejection reason back to Claude and continues the turn instead of aborting.
- **`terminalSequence` in hook output** — emit desktop notifications, window titles, and bells without a controlling terminal.
- **Effort context** — hooks receive `effort.level` in their JSON input and `$CLAUDE_EFFORT` in their environment; Bash commands also get `$CLAUDE_EFFORT`.
- **MCP servers receive `CLAUDE_PROJECT_DIR`** in their environment, matching hooks. Plugin configs can reference `${CLAUDE_PROJECT_DIR}` in commands.

### Plugin executables on PATH (w14)

- `bin/` at plugin root: executables there are added to Bash tool's PATH while the plugin is enabled.
- Bare commands work without absolute paths.

### `disableSkillShellExecution` setting (w14)

- Blocks shell injection markers in non-bundled, non-managed skills.
- Useful in managed environments to prevent untrusted skills from running shell on load.

### Other small but useful

- **`/recap`** — one-line session summary on demand; also auto-fires when returning to a session after a long idle gap.
- **`/scroll-speed`** — tune mouse wheel scroll speed with a live preview.
- **`claude project purge [path]`** — delete all Claude Code state for a project (transcripts, tasks, file history, config entry); supports `--dry-run` and `--all`.
- **`--plugin-url <url>`** — fetch a plugin `.zip` archive from a URL for the current session.
- **`worktree.baseRef` setting** (`fresh` | `head`) — choose whether worktree-creation tools (`--worktree`, `EnterWorktree`, agent isolation) branch from `origin/<default>` or local `HEAD`.
- **`alwaysLoad` MCP server config option** — when `true`, all tools from that server skip tool-search deferral and stay always-available.
- **MCP elicitation** — MCP servers can request structured input mid-task via an interactive dialog (form fields or browser URL); intercepted via the `Elicitation` and `ElicitationResult` hooks.
- **PostToolUse `updatedToolOutput`** — hooks can replace tool output for all tools (previously MCP-only).
- **Skills can reference `${CLAUDE_EFFORT}`** in their content; `${CLAUDE_SKILL_DIR}` and `${CLAUDE_SESSION_ID}` also available.
- **PowerShell tool** on Windows (preview) — opt-in via `CLAUDE_CODE_USE_POWERSHELL_TOOL`; permissions match Bash semantics.
- **Custom themes** (`/theme`, `~/.claude/themes/`, plugin themes).
- **`/team-onboarding`** — generates a teammate ramp-up guide from local usage history.
- **`/loop` self-paces** when no interval is given; `/proactive` is an alias.
- **`/btw <question>`** — side question without polluting conversation context.
- **`/fewer-permission-prompts`** — scans transcripts for common allowable Bash/MCP calls, builds an allowlist.
- **Native binaries** replacing JavaScript on macOS/Linux (v2.1.113); same install command.
- **`PreCompact` hooks can block compaction** (exit 2 or `decision: "block"`).
- **`UserPromptSubmit` hooks can set session title** via `hookSpecificOutput.sessionTitle`.
- **`defer` permission decision** in `PreToolUse` hooks — `-p` sessions pause at the tool call and exit with `deferred_tool_use` payload, resumable with `--resume`.
- **Vim visual mode** (v/V) in the prompt input.
- **Computer use** in CLI (research preview) — Claude can drive native apps and verify changes via GUI.

## Constraints worth designing around

- **Skills are write-once-run-forever artifacts.** Without maintenance, they drift. Treat skills like code; review them when infrastructure changes.
- **Description budget pressure is real once a setup has ~10+ skills.** Use `skillOverrides` in settings to set low-priority skills to `name-only`. Use `disable-model-invocation: true` for workflows.
- **Compaction can drop skills** if many were invoked. Re-invoke load-bearing ones after `/compact` triggers.
- **Skills don't re-read** after invocation. Edits to SKILL.md don't show up in the same session unless the skill is re-invoked.
- **Personal scope (`~/.claude/skills/`) overrides project scope (`.claude/skills/`)** for same-named skills. Plugin namespacing avoids this; renaming or `skillOverrides: "off"` are the workarounds.
- **`.claude/skills/` *is* loaded from `--add-dir` directories** (exception to general `--add-dir` rules). Other config (`.claude/agents/`, `.claude/rules/`) is not.
- **Skills don't trigger on simple prompts.** Claude only consults skills when it can't easily handle the task itself. A `/read-pdf` skill never triggers on "show me this PDF" regardless of description quality.
- **Description is the trigger; body is the standing instruction.** Vague descriptions silently under-trigger. Procedural bodies (one-time steps) waste recurring tokens.
- **Hooks for guarantees, skills for guidance.** A hook enforces "never edit .env." A skill suggests "when editing .env, prefer adding new keys to changing existing ones."

## Notable bundled skills/commands (don't reinvent)

These exist in stock Claude Code; building parallel skills competes for description budget:

- **`/simplify`** (skill) — three-agent parallel review of recently changed code; aggregates findings; applies fixes.
- **`/batch <instruction>`** (skill) — decomposes large changes into 5–30 units; spawns one background agent per unit in isolated worktrees; opens PRs.
- **`/debug`** (skill) — captures debug logs from current point forward; analyzes issues.
- **`/loop`** (skill) — recurring or self-paced prompt execution.
- **`/claude-api`** (skill) — Claude API reference + migration helper for Anthropic SDK code.
- **`/fewer-permission-prompts`** (skill) — transcript-driven allowlist generator.
- **`/init`** — generates starter CLAUDE.md from codebase analysis. `CLAUDE_CODE_NEW_INIT=1` enables an interactive multi-phase flow that also walks through skills, hooks, memory.
- **`/skills`** — list/manage skills with cycling visibility states.
- **`/agents`** — manage subagents (Running tab + Library).
- **`claude agents`** (CLI) — unified session list across running, blocked, and done sessions.
- **`/goal`** (skill) — set a completion condition; Claude keeps working across turns until met.
- **`/team-onboarding`** — package a local Claude Code setup as a teammate ramp-up guide.
- **`/recap`** — one-line session summary on demand.
- **`/usage`** (= `/cost` = `/stats`) — usage breakdown showing what's driving limits.
- **`/btw`** — side question without polluting context.
- **`/fork`** / **`/branch`** — branch the conversation (or spawn a forked subagent if `CLAUDE_CODE_FORK_SUBAGENT=1`).
- **`/rewind`** (= `/checkpoint` = `/undo`) — restore prior conversation/code state.

The full list is at `https://code.claude.com/docs/en/commands` — worth re-checking on each visit.

## The broader coding-agent landscape

Claude Code is one tool in a category that's converged on a recognizable shape: a CLI or IDE-resident agent that reads/writes files, runs shell, and calls tools through MCP. The major players, neutrally:

| Tool | Surface | Distinguishing trait |
|------|---------|----------------------|
| **Claude Code** | CLI + IDE extensions + web | Anthropic's first-party agent; hooks, skills, plugins, 1M context |
| **Cursor** | Dedicated IDE (VS Code fork) | Inline-edit UX; multi-model |
| **OpenAI Codex CLI** | CLI + cloud Codex | OpenAI's first-party agent; ChatGPT integration |
| **Aider** | CLI | Open source; git-native commit-per-edit; BYOM |
| **Cline** | VS Code extension | Open source; BYOM |
| **Continue** | IDE extension (VS Code/JetBrains) | Open source; BYOM; configurable assistant |
| **Windsurf** | Dedicated IDE | Owned by Cognition; ships SWE-1.5 agent model |
| **GitHub Copilot** | IDE extension + Copilot Workspace | Microsoft/GitHub; broad enterprise distribution |
| **Devin** | Cloud platform | Autonomous background engineer; long-running tasks |
| **Gemini CLI / Jules** | CLI / cloud | Google's first-party agents |

BYOM = bring-your-own-model. The list is not exhaustive; new entrants appear monthly.

## Cross-tool conventions

Three standards are doing the real work of letting one repo serve multiple agents:

### AGENTS.md

Plain Markdown at repo root that tells any AI coding agent how to work on the project (commands, conventions, things to avoid). Released by OpenAI in August 2025; co-developed across the ecosystem.

- **Native support (early 2026):** Claude Code, OpenAI Codex CLI, Cursor, Aider, Devin, GitHub Copilot, Gemini CLI, Windsurf, Amazon Q, Jules, VS Code.
- **Relation to CLAUDE.md:** AGENTS.md is the cross-tool format; CLAUDE.md is Claude-Code-specific. Many repos keep both or symlink one to the other. Coexistence is the de facto pattern.
- **Governance:** Donated to the **Agentic AI Foundation (AAIF)** — a Linux Foundation directed fund formed December 9, 2025. De facto industry convention, not an ISO/IETF standard.
- **Spec & adoption:** `agents.md` (60,000+ open-source projects as of early 2026).

### MCP (Model Context Protocol)

The cross-vendor protocol for connecting LLMs to tools, resources, and prompts. Current spec dated **2025-11-25**.

- **Vendor support:** Anthropic, OpenAI, Google, Microsoft, AWS — every major LLM vendor.
- **Client support:** Claude Code, Cursor, Codex CLI, Windsurf, Continue, Cline, Goose, others.
- **Governance:** Donated by Anthropic to AAIF on December 9, 2025.
- **Recent additions:** **MCP Apps** (formerly mcp-ui, formalized as SEP-1865, early 2026) — standardizes interactive UI delivery (React dashboards, forms) from MCP servers. Streamable HTTP transport is mainstream for remote MCP servers. 2026 roadmap priorities are enterprise concerns: auth/SSO, audit, gateway behavior, registry/discovery.

### Agent Skills (open standard)

Announced by Anthropic on **December 18, 2025**: SKILL.md (YAML frontmatter + Markdown body), directory layout, progressive disclosure — published as an open standard.

- **Reported support:** 16+ tools including Claude Code, Cursor, Codex CLI, Gemini CLI, Junie, Copilot, VS Code, OpenHands, OpenCode, Amp, Goose, Firebender, Letta.
- **Reality check:** Adoption depth varies. "Supports SKILL.md" ranges from a native loader (Claude Code) to "you can drop one in your repo and tell the agent to read it." Skills authored against the Claude Code feature set (hooks, `allowed-tools`, `disable-model-invocation`) won't necessarily port verbatim.

### The five-layer config picture, in practice

A repo configured for multi-agent use typically has:

1. **Always-on instructions** — CLAUDE.md, AGENTS.md, `.cursorrules`, or equivalent.
2. **On-demand skills** — `skills/<name>/SKILL.md` (or `.claude/skills/`, `~/.cursor/skills/`, `~/.codex/skills/`).
3. **MCP servers** — declared in tool-specific config (`.mcp.json`, `~/.cursor/mcp.json`, etc.).
4. **Editor-specific rules** — `.claude/rules/`, `.cursorrules`, others. Not yet cross-tool.
5. **Repo conventions** — AGENTS.md, plus per-tool overrides where they exist.

## URLs to keep handy

Claude Code:

- `https://code.claude.com/docs/llms.txt` — full URL index of all docs (stable entry point).
- `https://code.claude.com/docs/en/skills` — canonical skills reference; check for new frontmatter fields.
- `https://code.claude.com/docs/en/sub-agents` — subagent spec, fork mode, agent teams.
- `https://code.claude.com/docs/en/hooks` — every event, every matcher, every input field.
- `https://code.claude.com/docs/en/features-overview` — meta-mental-model; "build your setup over time" and surface comparison tabs.
- `https://code.claude.com/docs/en/whats-new/index` — weekly digests.
- `https://code.claude.com/docs/en/changelog` — full per-version changes.
- `https://code.claude.com/docs/en/commands` — bundled commands and skills.

Cross-tool standards:

- `https://agents.md` — AGENTS.md spec and adoption list.
- `https://modelcontextprotocol.io/specification/2025-11-25` — MCP spec.
- `https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/` — MCP 2026 roadmap.
- `https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills` — Agent Skills standard announcement.
- `https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation` — AAIF formation.

## In flux as of mid-May 2026

Things that were research previews or moving fast at the time of writing:

- **Agent view (`claude agents`)** is research preview. Surface and command shape may shift.
- **Forked subagents** remain gated behind `CLAUDE_CODE_FORK_SUBAGENT=1` (v2.1.117+); now work in SDK and `-p` modes as well as interactive. Likely to become default eventually.
- **Auto mode** is in research preview. Default thresholds and classifier behavior may change. `hard_deny` rules are stable.
- **Agent teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) are experimental. Listed limitations: no in-process teammate session resumption, lagging task status, no nested teams.
- **Computer use** in CLI is research preview. Expect rough edges.
- **Routines** are web-only at the moment; CLI integration is via `/schedule`.
- **`/ultrareview` and `/ultraplan`** are research previews; pricing and free-tier inclusion may change. `claude ultrareview` non-interactive form is available for CI.
- **PowerShell tool** on Windows is an opt-in preview (`CLAUDE_CODE_USE_POWERSHELL_TOOL`).
- **The native binary migration** means npm now pulls platform-specific binaries via optional deps. Could affect CI installs in unusual environments.
- **Agent Skills cross-tool support** is announced broadly but unevenly implemented. A skill authored against Claude Code's full feature set won't always work the same elsewhere.
- **MCP enterprise features** (auth/SSO, audit, gateway, registry) are the 2026 roadmap focus — expect movement throughout the year.

---

*Last reviewed: 2026-05-14. Treat dated content as a snapshot; verify against current docs before relying on details. PRs and corrections welcome.*
