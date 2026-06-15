# The state of Claude Code and the coding-agent landscape

Last updated: 15 June 2026 | Version: v2.1.176

A snapshot of what's true about Claude Code and the broader coding-agent ecosystem right now. Not a tutorial — a factual reference for builders working against these surfaces. Filtered to what changes how you build, configure, and ship.

If you've been away for a few months, read this first; the surface has shifted faster than the mental models. For verification against current docs, see the **URLs to keep handy** section below — `code.claude.com/docs/en/changelog` is authoritative for per-version changes.

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

Cross-reference: FLUE (`flueframework.com`) frames the agent stack as four layers — Model / Harness / Sandbox / Filesystem. The six-surface taxonomy above is scoped to authoring inside Claude Code (the surfaces _are_ what you author against); FLUE's framing is more useful when designing runtime-deployed autonomous agents.

## The cost model nobody tells you about up front

Every visible skill consumes description budget _every turn_. Once invoked, the skill body lives in conversation context for the rest of the session. This is the most-misunderstood thing about skills.

Hard numbers:

- **Per-skill description cap**: 1,536 characters (`description` + `when_to_use` combined).
- **Total skill listing budget**: scales at 1% of context window, fallback 8,000 chars; `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var raises it.
- **Compaction budget**: most recent invocation of each skill re-attached, **first 5,000 tokens kept**, **shared 25,000-token cap** across re-attached skills, filled most-recent-first.
- **CLAUDE.md sweet spot**: under 200 lines per file; over 500 lines causes Claude to ignore parts.
- **MEMORY.md (auto-memory)**: first 200 lines or 25KB loaded at session start.

Practical consequences:

- Visible skills that shouldn't auto-trigger should be `disable-model-invocation: true` (zero description cost, still user-invocable).
- Bundled skills you don't use still cost description budget every turn; `disableBundledSkills` (setting or env var, v2.1.169) hides all of them from the model at once.
- Knowledge skills with broad applicability should be path-scoped (`paths:` glob) so they don't load when out of scope.
- Reference docs > 150 lines belong in sibling files, not inline.

## What's distinctive about June 2026 (vs. last quarter)

Features that changed how skills get built, in rough order of impact:

### Fable 5 (Mythos-class, v2.1.170)

- **`claude-fable-5`** — the first Mythos-class model released for general use; the most capable model in Claude Code, built for tasks larger than a single sitting. Requires v2.1.170+.
- **Not the default on any plan.** Opt in with `/model fable` (persists via user settings). New aliases: `fable`, and `best` (Fable 5 where the org has access, otherwise latest Opus).
- Effort levels `low`–`max`, default `high`. Adaptive reasoning is always on; thinking cannot be disabled — `Option+T`, `alwaysThinkingEnabled`, and `MAX_THINKING_TOKENS=0` have no effect.
- **Classifier fallback**: requests flagged for cybersecurity or biology re-run on the default Opus model, and the session stays there until `/model fable`. Can trigger on the first request from workspace context alone (CLAUDE.md, git status, directory names); `claude --safe-mode` isolates whether customizations are the trigger, and a `/config` toggle pauses to ask instead of switching. `-p` and SDK runs get a refusal instead. Offensive-security, CTF, and biology work reroutes frequently by design.
- 1M context window always on via the Anthropic API; the model ID is `claude-fable-5` (a `[1m]` suffix is redundant and stripped automatically). Not available under zero data retention.
- API pricing $10/$50 per Mtok in/out. Included on Pro/Max/Team/Enterprise subscriptions June 9–22, 2026; usage credits after.
- Prompting shifts: describe outcomes rather than steps, hand it ambiguous problems, size up tasks you'd normally split; verification reminders are usually unnecessary.
- New levers: `ANTHROPIC_DEFAULT_FABLE_MODEL` (alias target; also what enables fallback on Bedrock/Vertex/Foundry), `DISABLE_PROMPT_CACHING_FABLE`.
- **Mythos 5** is the same model without cybersecurity safeguards, restricted to vetted partners — not a Claude Code surface.

### Dynamic workflows (`/workflows`, v2.1.154)

- Ask Claude to create a workflow and it orchestrates work across tens to hundreds of agents in the background — for tasks too large for one context (large migrations, audits, broad sweeps).
- `/workflows` shows your runs.
- Type `ultracode` in a prompt to fire one off — renamed from the bare word `workflow`, which no longer triggers a run (asking in your own words still does). The keyword highlights violet in the input; a `/config` setting disables it.
- `/effort ultracode` makes workflows the default — Claude authors and runs one for every substantive task, not just on the keyword. Offered only where the model supports `xhigh`.
- The heaviest fan-out option, alongside agent teams and `/batch`; the model decomposes and pipelines the work itself.
- **It's an authorable artifact, not just a prompt.** A workflow is a JavaScript orchestration script (`agent()` / `parallel()` / `pipeline()` / `phase()`); the runtime runs it in the background while agents work in fresh contexts. Sandbox: no filesystem, no `Date.now()`/`Math.random()` in the script; ~16 concurrent agents, 1,000 per run. Save a run as a reusable `/command` in `.claude/workflows/<name>.js` (input via the global `args`).
- **Why the surface exists:** it replaces the model's plan-and-execute-in-one-drifting-context default with deterministic control flow — countering *agentic laziness* (declaring a 50-item task done at 35), *self-preferential bias* (preferring its own results when it self-grades — hence adversarial verification in a separate agent), and *goal drift* after compaction.

### Custom commands merged into skills

- `.claude/commands/foo.md` and `.claude/skills/foo/SKILL.md` both create `/foo`.
- Skills add: optional sibling files, frontmatter for invocation control, auto-load by Claude when relevant.
- Skill takes precedence if both exist with the same name.

### Auto mode (research preview)

- Permission-mode `auto`: a classifier reviews tool calls, blocks risky ones, lets routine work proceed without prompts.
- Available as `--permission-mode auto` or via `/permissions`.
- On Bedrock, Vertex, and Foundry (Opus 4.7 and 4.8), it's opt-in via `CLAUDE_CODE_ENABLE_AUTO_MODE=1`.
- New hook: `PermissionDenied` fires on classifier denials; `retry: true` lets the model try a different approach.
- No longer gated: the `--enable-auto-mode` flag was removed, and the first-use opt-in consent prompt is gone too (v2.1.152).
- `settings.autoMode.hard_deny` defines classifier rules that block unconditionally regardless of user intent or allow exceptions — useful as a policy-grade backstop.

### Forked subagents (`/fork`, w17)

- `CLAUDE_CODE_FORK_SUBAGENT=1` enables fork mode.
- A fork inherits the _full conversation history_ (unlike a normal subagent which starts fresh). Same system prompt, tools, model, prompt cache.
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

### Opus 4.8 (now default, v2.1.154)

- Opus 4.8 (`claude-opus-4-8`) is the current default Opus; it defaults to **high** effort, with `/effort xhigh` reserved for the hardest tasks.
- Effort levels: `low`, `medium`, `high`, `xhigh`, `max`. `/effort` opens an interactive slider when called without args (slider labels are now "Faster"/"Smarter").
- The **lean system prompt** is now the default for Opus 4.8 and newer; Haiku, Sonnet, and Opus 4.7-and-earlier keep the full prompt. Smaller standing prompt, more room for your context.
- 1M context window included for Max/Team/Enterprise on Opus.
- Fast mode on Opus 4.8 runs at 2× the standard rate for ~2.5× the speed. `CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE` is deprecated (removed 2026-06-01); for fast mode on 4.6, switch with `/model claude-opus-4-6[1m]` then `/fast on`.
- Opus 4.7 (`claude-opus-4-7`) is still selectable via `/model`; it introduced the effort-level scale and always-on adaptive reasoning.

### Agent view (`claude agents`, research preview)

- `claude agents` opens a unified list of every Claude Code session — running, blocked on you, or done.
- New top-level CLI surface for managing parallel/background work, agent teams, and previously-backgrounded sessions.
- `claude agents --cwd <path>` scopes the list to a directory; `claude agents --json` (v2.1.145) emits live sessions as JSON for scripting (status bars, tmux-resurrect, session pickers).
- **Pinned sessions** (`Ctrl+T` inside `claude agents`, v2.1.147) stay alive when idle, restart in place to apply Claude Code updates, and are shed under memory pressure only after non-pinned sessions.
- `claude agents` accepts `--add-dir`, `--settings`, `--mcp-config`, `--plugin-dir`, `--permission-mode`, `--model`, `--effort`, and `--dangerously-skip-permissions` (v2.1.147) to configure dispatched background sessions. Sessions launched from the view now honor `permissions.defaultMode` instead of being forced into auto mode.
- `/bg` and `←`-detach preserve session flags (`--mcp-config`, `--settings`, `--add-dir`, `--plugin-dir`, `--strict-mcp-config`, `--fallback-model`, `--allow-dangerously-skip-permissions`) across retire→wake (v2.1.147), so backgrounded workers keep their MCP servers and permission posture.

### `/goal` command

- Set a completion condition; Claude keeps working across turns until it's met.
- Works in interactive, `-p`, and Remote Control modes.
- Live overlay panel shows elapsed time, turns, and tokens consumed.

### Hook system additions

The hook surface has accumulated several useful fields:

- **`mcp_tool` handler type** — hook handler can call an already-connected MCP server tool directly, no subprocess. Useful for validation that needs external state.
- **`args: string[]` exec form** — spawns the command directly without a shell, so path placeholders never need quoting.
- **`continueOnBlock` for PostToolUse** — feeds the hook's rejection reason back to Claude and continues the turn instead of aborting.
- **`additionalContext` from `Stop` / `SubagentStop`** — these hooks can return `hookSpecificOutput.additionalContext` to hand Claude feedback and keep the turn going, instead of registering as a hook error.
- **`terminalSequence` in hook output** — emit desktop notifications, window titles, and bells without a controlling terminal.
- **`MessageDisplay` hook event** — transform or hide assistant message text as it's displayed (v2.1.152).
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
- **`--safe-mode`** (v2.1.169) — start with customizations (skills, hooks, plugins, settings) disabled, for troubleshooting; the clean-room for telling whether a problem is your config or stock behavior.
- **`/cd <path>`** (v2.1.169) — move the session to a new working directory without breaking the prompt cache.
- **`worktree.baseRef` setting** (`fresh` | `head`) — choose whether worktree-creation tools (`--worktree`, `EnterWorktree`, agent isolation) branch from `origin/<default>` or local `HEAD`.
- **`alwaysLoad` MCP server config option** — when `true`, all tools from that server skip tool-search deferral and stay always-available.
- **MCP elicitation** — MCP servers can request structured input mid-task via an interactive dialog (form fields or browser URL); intercepted via the `Elicitation` and `ElicitationResult` hooks.
- **PostToolUse `updatedToolOutput`** — hooks can replace tool output for all tools (previously MCP-only).
- **Skills can reference `${CLAUDE_EFFORT}`** in their content; `${CLAUDE_SKILL_DIR}` and `${CLAUDE_SESSION_ID}` also available.
- **PowerShell tool** on Windows — opt-in preview via `CLAUDE_CODE_USE_POWERSHELL_TOOL`; permissions match Bash semantics. Default-enabled for Bedrock, Vertex, and Foundry users on Windows since v2.1.147 (opt out with `CLAUDE_CODE_USE_POWERSHELL_TOOL=0`).
- **Custom themes** (`/theme`, `~/.claude/themes/`, plugin themes).
- **`/team-onboarding`** — generates a teammate ramp-up guide from local usage history.
- **`allowAllClaudeAiMcps`** managed setting (v2.1.149, enterprise) — loads claude.ai cloud MCP connectors alongside `managed-mcp.json` instead of requiring per-server allowlisting.
- **GFM task list rendering** — markdown output renders `- [ ] todo` / `- [x] done` as checkboxes (v2.1.149).
- **`/loop` self-paces** when no interval is given; `/proactive` is an alias.
- **`/btw <question>`** — side question without polluting conversation context.
- **`/fewer-permission-prompts`** — scans transcripts for common allowable Bash/MCP calls, builds an allowlist.
- **Native binaries** replacing JavaScript on macOS/Linux (v2.1.113); same install command.
- **`PreCompact` hooks can block compaction** (exit 2 or `decision: "block"`).
- **`UserPromptSubmit` hooks can set session title** via `hookSpecificOutput.sessionTitle`.
- **`defer` permission decision** in `PreToolUse` hooks — `-p` sessions pause at the tool call and exit with `deferred_tool_use` payload, resumable with `--resume`.
- **Vim visual mode** (v/V) in the prompt input.
- **Computer use** in CLI (research preview) — Claude can drive native apps and verify changes via GUI.
- **`disallowed-tools` frontmatter** (skills and slash commands) — removes named tools from the model while the skill is active; the inverse of `allowed-tools` (v2.1.152).
- **`/reload-skills`** — re-scans skill directories without a restart; `SessionStart` hooks can return `reloadSkills: true` to surface skills they install mid-session.
- **Plugin `defaultEnabled: false`** — a plugin can ship disabled by default (set in `plugin.json` or the marketplace entry); enable with `/plugin` or `claude plugin enable`. Dependencies of enabled plugins still auto-enable.
- **`claude agents` shell sessions** — `! <command>` (or `claude --bg --exec '<command>'`) runs a shell command as an attachable, detachable background session.
- **Plugins auto-load from `.claude/skills/`** — drop a plugin there and it loads with no marketplace; `claude plugin init <name>` scaffolds one, and `/plugin list` (`--enabled` / `--disabled`) shows what's installed.
- **`acceptEdits` guards code-execution writes** — it now prompts before writing files that can run code on open: shell startup files (`.zshenv`, `.zlogin`), `~/.config/git/`, and build configs (`.npmrc`, `.yarnrc*`, `bunfig.toml`, `.bazelrc`, `.pre-commit-config.yaml`, `.devcontainer/`).
- **`requiredMinimumVersion` / `requiredMaximumVersion`** managed settings — Claude Code refuses to start outside the allowed version range and points to an approved build.
- **`fallbackModel` setting** (v2.1.166) — up to three fallback models, tried in order when the primary is unavailable; the settings-file form of the `--fallback-model` flag.
- **Nested subagents** (v2.1.172) — a subagent can now spawn its own subagents, so a delegated task that splits into parallel subtasks (a reviewer dispatching a verifier per finding) keeps that fan-out off the main thread; only the top-level summary returns. Foreground chains self-limit (each blocks its parent); a background subagent stops receiving the `Agent` tool at depth 5 (fixed, not configurable). A lighter-weight alternative to a workflow script when the orchestration is a single delegated task, not a standing pipeline.
- **`availableModels` allowlist + `enforceAvailableModels`** (managed settings; `enforceAvailableModels` added v2.1.175) — restrict which models a deployment may use; with `enforceAvailableModels` on, the allowlist also constrains the resolved Default model (a Default that would resolve to a blocked model falls back to the first allowed one) and user/project settings can't widen a managed list. The model-governance analog to `requiredMinimumVersion`.

## Constraints worth designing around

- **Skills are write-once-run-forever artifacts.** Without maintenance, they drift. Treat skills like code; review them when infrastructure changes.
- **Description budget pressure is real once a setup has ~10+ skills.** Use `skillOverrides` in settings to set low-priority skills to `name-only`. Use `disable-model-invocation: true` for workflows.
- **Compaction can drop skills** if many were invoked. Re-invoke load-bearing ones after `/compact` triggers.
- **Skills don't re-read** after invocation. Edits to SKILL.md don't show up in the same session unless the skill is re-invoked.
- **Personal scope (`~/.claude/skills/`) overrides project scope (`.claude/skills/`)** for same-named skills. Plugin namespacing avoids this; renaming or `skillOverrides: "off"` are the workarounds.
- **`.claude/skills/` _is_ loaded from `--add-dir` directories** (exception to general `--add-dir` rules). Other config (`.claude/agents/`, `.claude/rules/`) is not.
- **Skills don't trigger on simple prompts.** Claude only consults skills when it can't easily handle the task itself. A `/read-pdf` skill never triggers on "show me this PDF" regardless of description quality.
- **Description is the trigger; body is the standing instruction.** Vague descriptions silently under-trigger. Procedural bodies (one-time steps) waste recurring tokens.
- **Hooks for guarantees, skills for guidance.** A hook enforces "never edit .env." A skill suggests "when editing .env, prefer adding new keys to changing existing ones."

## Notable bundled skills/commands (don't reinvent)

These exist in stock Claude Code; building parallel skills competes for description budget:

- **`/code-review`** (skill) — reports correctness bugs in the current diff at the requested effort level (e.g. `/code-review high`); `--comment` posts findings as inline GitHub PR comments, `--fix` applies them to the working tree.
- **`/simplify`** (skill) — cleanup-only review of the diff (reuse, simplification, efficiency, altitude) that applies its fixes; a quality pass, not bug-hunting — use `/code-review` for bugs.
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
- **`/usage`** (= `/cost` = `/stats`) — usage breakdown showing what's driving limits. As of v2.1.149, splits the per-category breakdown across skills, subagents, plugins, and per-MCP-server cost.
- **`/btw`** — side question without polluting context.
- **`/fork`** / **`/branch`** — branch the conversation (or spawn a forked subagent if `CLAUDE_CODE_FORK_SUBAGENT=1`).
- **`/rewind`** (= `/checkpoint` = `/undo`) — restore prior conversation/code state.

The full list is at `https://code.claude.com/docs/en/commands` — worth re-checking on each visit.

## The broader coding-agent landscape

Claude Code is one tool in a category that's converged on a recognizable shape: a CLI or IDE-resident agent that reads/writes files, runs shell, and calls tools through MCP. The major players, neutrally:

| Tool                   | Surface                           | Distinguishing trait                                              |
| ---------------------- | --------------------------------- | ----------------------------------------------------------------- |
| **Claude Code**        | CLI + IDE extensions + web        | Anthropic's first-party agent; hooks, skills, plugins, 1M context |
| **Cursor**             | Dedicated IDE (VS Code fork)      | Inline-edit UX; multi-model                                       |
| **OpenAI Codex CLI**   | CLI + cloud Codex                 | OpenAI's first-party agent; ChatGPT integration                   |
| **Aider**              | CLI                               | Open source; git-native commit-per-edit; BYOM                     |
| **Cline**              | VS Code extension                 | Open source; BYOM                                                 |
| **Continue**           | IDE extension (VS Code/JetBrains) | Open source; BYOM; configurable assistant                         |
| **Devin Desktop**      | Dedicated IDE (was Windsurf)      | Cognition's IDE, rebranded from Windsurf; ships SWE-1.5 agent model |
| **GitHub Copilot**     | IDE extension + Copilot Workspace | Microsoft/GitHub; broad enterprise distribution                   |
| **Devin**              | Cloud platform                    | Autonomous background engineer; long-running tasks                |
| **Gemini CLI / Jules** | CLI / cloud                       | Google's first-party agents                                       |

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

## In flux as of early June 2026

Things that were research previews or moving fast at the time of writing:

- **Fable 5 subscription access** is time-boxed: included at no extra cost on Pro/Max/Team/Enterprise June 9–22, 2026, then usage credits with a phased restoration planned. Classifier-fallback thresholds (triggering in <5% of sessions on average) may also move.
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

_Treat dated content as a snapshot; verify against current docs before relying on details. PRs and corrections welcome._
