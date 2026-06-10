```
HACKS, FYIs & NICE-TO-KNOWS █
CLAUDE CODE v2.1.170 + CLAUDE AGENT PLATFORM

VERIFIED: 2026-06-10        SOURCE: code.claude.com/docs        STATUS: CURRENT
```

The obscure, powerful, and just-shipped corners of Claude Code and the Claude
Agent Platform — the "did you know" layer. The famous basics (`/init`, "what's
a skill") live in [STATE.md](./STATE.md), the full-surface reference; this is
the clever subset, in tables you can scan.

**Markers:** `mono` = paste-ready identifier · 🔥 = standout · 💡 = synthesised tip (inference from a cited fact) · 🆕 = recent (version inline) · ⚠️ = gotcha

| § | section | phase on [the wheel](#13-the-full-circle) |
|:--|:--|:--|
| [01](#01-standouts) | STANDOUTS | — |
| [02](#02-memory-and-context) | MEMORY AND CONTEXT | ⓪ configure · ⑥ maintain |
| [03](#03-skills-plugins-mcp) | SKILLS, PLUGINS, MCP | ⓪ configure |
| [04](#04-cli-env-settings-keys) | CLI, ENV, SETTINGS, KEYS | ⓪ configure · ① plan |
| [05](#05-hooks) | HOOKS | ⓪ configure · ③ verify |
| [06](#06-prompt-caching) | PROMPT CACHING | ① plan |
| [07](#07-orchestration) | ORCHESTRATION | ② implement · ③ verify |
| [08](#08-sessions-remote-deep-links) | SESSIONS, REMOTE, DEEP LINKS | ② implement · ⑤ ship |
| [09](#09-platform-and-agent-sdk) | PLATFORM AND AGENT SDK | beyond the CLI |
| [10](#10-the-anthropic-playbook) | THE ANTHROPIC PLAYBOOK | ① plan · ④ review |
| [11](#11-stale-advice) | STALE ADVICE | ⑥ maintain |
| [12](#12-easter-eggs) | EASTER EGGS | — |
| [13](#13-the-full-circle) | THE FULL CIRCLE | ⓪ → ⑥ → ⓪ |

---

## 01 STANDOUTS

Five top-tier — lesser-known or new — features.

| Feature | Invoke | What it gets you |
|:--|:--|:--|
| **Dreams** | `POST /v1/dreams` | Offline job rebuilds a memory store from itself + ≤100 transcripts: dupes merged, contradictions resolved, insights surfaced. Curates rotting long-term memory; escape hatch for the 2,000-store cap. → [§09](#09-platform-and-agent-sdk) |
| **Channels** `🆕 v2.1.80+` | `claude --channels plugin:<name>@<mkt>` | Pushes outside events (CI fail, Telegram, `curl`) *into* your live session over stdio, files + context already loaded. → [§08](#08-sessions-remote-deep-links) |
| **Deep links** `🆕 v2.1.91+` | `claude-cli://open?repo=…&q=…` | One click opens Claude in a new terminal, right repo, prompt pre-typed. `mailto:` for agent sessions. → [§08](#08-sessions-remote-deep-links) |
| **Remote Control** `🆕 v2.1.51+` | `claude remote-control` · `/rc` | Drive your *local* session from your phone; full tooling, outbound HTTPS only. → [§08](#08-sessions-remote-deep-links) |
| **Long-running stack** | memory + context-editing + compaction | The three platform levers that let an agent outlive one context window. → [§09](#09-platform-and-agent-sdk) |

---

## 02 MEMORY AND CONTEXT

| Mechanic | Identifier | What it gets you |
|:--|:--|:--|
| 🔥 **Auto-memory** `🆕 v2.1.59+` | `~/.claude/projects/<project>/memory/MEMORY.md` | Claude's own cross-session notes (build cmds, debugging insights, your corrections). Loaded at start: first 200 lines / 25 KB of `MEMORY.md`, topic files on demand. Machine-local, keyed to git repo root, so all worktrees + subdirs share one dir. |
| **CLAUDE.md import** | `@path/to/file` (max depth 4) | Expands at launch. `@~/.claude/notes.md` shares personal instructions across worktrees a gitignored `CLAUDE.local.md` can't reach. |
| **Zero-cost notes** | `<!-- comment -->` in CLAUDE.md | Stripped before injection; maintainer notes at zero context cost, visible only in-file. |
| **Monorepo noise filter** | `claudeMdExcludes` | Glob/path list skips noisy ancestor CLAUDE.md files; put in `.claude/settings.local.json` to keep it machine-local. |
| **Context tools** | `/context` · `Esc Esc` · "Summarize up to here" | `/context` = your real split (docs' pictures use fake numbers). `Esc Esc` on an empty prompt rewinds. "Summarize up to here" is a scalpel where `/compact` is a hammer. |

**What survives `/compact`:**

| Layer | Fate |
|:--|:--|
| System prompt, CLAUDE.md, auto-memory, MCP defs, unscoped rules | Reloaded fresh (cache-hit if unchanged) |
| Invoked skill **bodies** | Truncated: most-recent invocation of each only, 5 K tokens each / 25 K total, cut from the *end* (put key instructions at the top of `SKILL.md`) |
| Skill **descriptions**, path-scoped rules, nested CLAUDE.md | Dropped until a matching file is read again |

- 💡 Auto-memory + a tight CLAUDE.md is a division of labour: say "tests need Redis / build is X / I prefer Y" once and auto-memory persists it per-repo, machine-locally. CLAUDE.md is for team-shared intent the code can't tell you; auto-memory is for your accumulated corrections.
- 💡 `@AGENTS.md` import + `/init` reading `.cursorrules`/`.windsurfrules`/`.devin/rules/` = one canonical source feeds Claude, Cursor, Windsurf, Devin. (Windows: use the import, not a symlink.)

<sub>src: code.claude.com/docs/en/memory · /context-window · /claude-directory</sub>

---

## 03 SKILLS, PLUGINS, MCP

| Lever | Identifier | What it gets you |
|:--|:--|:--|
| **Hidden skill** | `disable-model-invocation: true` | Skill stays *entirely* out of context (not even its description) until you `/name` it. Put on side-effecting workflows (commit, deploy) for zero standing cost. |
| **Tiny-context skill** | `context: fork` + `agent: Explore` | Runs a skill in an isolated subagent that skips CLAUDE.md and git status. |
| 🔥 **Tool search** | default on Sonnet 4+ / Opus 4+ | Defers all MCP tool schemas by default. The "too many MCP servers blow my context" caution is largely obsolete unless you force `alwaysLoad` or `ENABLE_TOOL_SEARCH=false`. |
| **Inline MCP data** | `@server:resource` (`@github:issue://123`) · `/mcp__server__prompt` | Pull live MCP data inline like an `@file`; surface server prompts as slash commands. |
| **Plugin CLI + state** | `bin/` at plugin root · `${CLAUDE_PLUGIN_DATA}` | `bin/` joins the Bash `PATH` while enabled (ship a CLI your skills call by name). `${CLAUDE_PLUGIN_DATA}` is the persistent state dir that survives updates (install venvs / `node_modules` there once). |
| 🔥 **Commit-SHA versioning** | omit `version` from `plugin.json` + marketplace entry | Git commit SHA becomes the version, so every push is an update. ⚠️ Setting a `version` pins the install cache; `/plugin update` reports "already at the latest version" until you bump it. |

- 💡 Prefer CLI tools (`gh` / `aws` / `gcloud`) over MCP servers when you can: a CLI adds zero per-tool listing context; an MCP server adds tool names (unless deferred). For occasional external calls, the shell is the context-cheapest path.

<sub>src: code.claude.com/docs/en/skills · /plugins-reference · /mcp · /tools-reference</sub>

---

## 04 CLI, ENV, SETTINGS, KEYS

Full lists live in `docs/en/cli-reference`, `/settings`, `/env-vars`, `/hooks`. This is the hacky subset.

**CLI flags & subcommands**

| Flag / command | Why it's here |
|:--|:--|
| `--worktree <name>` / `-w` | Isolated git worktree in one command; pass `#1234` or a PR URL to branch a fresh checkout *from that PR*. |
| `--bg --exec 'pytest -x'` | Fire-and-forget a shell job as an attachable background row (no model invoked). |
| `--bare` (sets `CLAUDE_CODE_SIMPLE`) | Skip all auto-discovery (hooks/skills/plugins/MCP/memory/CLAUDE.md): faster, deterministic scripted starts. |
| `--safe-mode` `🆕 v2.1.169` | Start with all customizations *disabled* (CLAUDE.md, skills, hooks, plugins, MCP): the clean-room for "is this my config or stock behavior?". |
| `--exclude-dynamic-system-prompt-sections` | Move per-machine bits (cwd, env, paths) out of the system prompt so the cache reuses across machines. |
| `--from-pr <n>` / `--fork-session` | Resume the session that built a PR / branch a conversation without mutating the original. |
| `--max-budget-usd 5.00` | Hard dollar ceiling for unattended `-p` runs. |
| `--json-schema` | Schema-validated output in the `structured_output` field (`-p` mode). |
| `--agents '{"reviewer":{…,"prompt":"…"}}'` | Define a subagent inline as JSON, no file to author. |
| `--strict-mcp-config` | Use *only* `--mcp-config` servers: hermetic, reproducible MCP set. |
| `--plugin-url <https-zip>` | Load a plugin from a hosted CI artifact for one session, no install. |
| `claude mcp serve` | 🔥 Run **Claude Code itself as an MCP server**, exposing its tools to other clients. |
| `claude project purge [path]` | Wipe one project's local footprint (transcripts, memory, tasks); `--dry-run`, `--all`. |
| `claude setup-token` | Long-lived OAuth token for CI/scripts (Claude subscription). |

**Environment variables**

| Var | Effect |
|:--|:--|
| `CLAUDE_CODE_EFFORT_LEVEL` | The **only** way to make `max` effort persist across sessions (the setting rejects `max`). |
| `BASH_DEFAULT_TIMEOUT_MS` | Long bash commands **auto-background** past this instead of being killed. |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Trigger auto-compaction earlier than the ~95% default (e.g. `50`). |
| `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` | Crank parallel read-only tools/subagents above the default `10`. |
| `CLAUDE_CODE_ATTRIBUTION_HEADER=0` | Drop the attribution block for a smaller, more cacheable system prompt. |
| `CLAUDE_CODE_TASK_LIST_ID=my-project` | Share one task list across sessions on the same project. |
| `CLAUDE_CODE_HIDE_CWD=1` | Hide the working dir in the startup logo (clean screenshares). |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` | One switch: autoupdater + feedback + error-reporting + telemetry off. |
| `MAX_THINKING_TOKENS=0` | Disable extended thinking regardless of effort (big cost lever on simple tasks). ⚠️ No-op on Fable 5: thinking can't be turned off there. |
| `ENABLE_TOOL_SEARCH=auto:5` | Threshold-load only MCP tools fitting in 5% of context; defer the rest. |

**settings.json keys**

| Key | Effect |
|:--|:--|
| `skillOverrides` | Set a skill to `"name-only"` (keep listed, drop description budget) or `"off"`, without editing its file; great for noisy third-party skills. |
| `maxSkillDescriptionChars` / `skillListingBudgetFraction` | Tune the 1,536-char per-skill cap / the 1%-of-context listing budget `🆕 v2.1.105+`. |
| `autoMode.hard_deny` | Prose-rule blocklist that overrides auto-approval: a policy-grade backstop. |
| `worktree.baseRef` | `"fresh"` (from `origin/HEAD`) vs `"head"` (carry unpushed work) for worktree creation. |
| `includeGitInstructions: false` | Drop built-in git workflow text for a smaller system prompt, better cache. |
| `disableDeepLinkRegistration: "disable"` | Stop `claude-cli://` from registering (security lever). |
| `requiredMinimumVersion` / `…Maximum…` | (Managed) refuse to start outside a version band: pin a fleet. |
| `fallbackModel` `🆕 v2.1.166` | Up to three fallbacks tried in order when the primary is overloaded/unavailable; the settings form of `--fallback-model`. |
| `disableBundledSkills` `🆕 v2.1.169` | Hide *all* bundled skills, workflows, and built-in slash commands from the model in one key: reclaim their description budget. |

**Interactive shortcuts & TUI**

| Keys | Action |
|:--|:--|
| `Esc` `Esc` | Empty prompt → rewind menu; with text → clear draft (saved to history, `↑` recalls). |
| `Ctrl+X Ctrl+K` | Kill **all** background subagents (twice within 3 s to confirm). |
| `Ctrl+O` | Toggle transcript; expands collapsed MCP calls ("Called slack 3 times"). |
| `Ctrl+B` | Background a running bash command/agent mid-run without killing it. |
| `Ctrl+R` then `Ctrl+S` | Reverse history search; `Ctrl+S` cycles scope session → project → **all projects**. |
| `Ctrl+G` | Open prompt or a plan in `$EDITOR` before proceeding. |
| `Option+T` / `Alt+T` | Toggle extended thinking per-prompt (`🆕` macOS no-config since v2.1.132). |
| `/tui fullscreen` | Alt-screen renderer; fixes "scroll jumps to top while Claude works" in VS Code/tmux. |
| `/focus` · `/btw` | Quieter transcript view · ask a side question that **never enters history**. |

- ⚠️ Fable 5 (`/model fable`, `🆕 v2.1.170`) reroutes classifier-flagged requests (cybersecurity/biology) to Opus mid-session — and can trip on *workspace context* alone (CLAUDE.md, git status, directory names) before you type anything. `claude --safe-mode` isolates whether your config is the trigger; `/config` → "switch models when a message is flagged" off = pause-and-ask instead of silent switch.
- 💡 `/model best` resolves to Fable 5 where the org has access, else latest Opus — safe to write into shared settings for mixed-access teams.

<sub>src: code.claude.com/docs/en/cli-reference · /env-vars · /settings · /interactive-mode · /fullscreen · /model-config</sub>

---

## 05 HOOKS

The events and fields nobody reads down to.

| Hook / field | What it buys you |
|:--|:--|
| `PermissionDenied` + `{retry: true}` | Auto-mode denied a call: tell the model to try a different approach (a self-healing loop). |
| `MessageDisplay` → `displayContent` | Rewrite what the **user sees** (redact secrets, localise) while Claude's context keeps the original. |
| `CwdChanged` + `CLAUDE_ENV_FILE` | The direnv/nix bridge: write `export …` lines and Claude runs them before every Bash call (env otherwise doesn't persist). |
| `terminalSequence` `🆕 v2.1.141+` | Native desktop notifications/titles/bells from a hook (OSC 9/99/777), no controlling terminal needed. |
| `"type": "prompt"` / `"type": "agent"` | LLM hooks: judgment gating ("are all tasks done?") or a subagent that runs the tests before allowing a stop. |
| `"type": "mcp_tool"` | Route hook logic through an already-connected MCP tool (e.g. a security scanner), no subprocess. |
| `"args": [...]` (exec form) | Spawns the command without a shell: the fix for quoting hell and "command not found." |
| `InstructionsLoaded` | Logs which CLAUDE.md/rule loaded, when, and why: the debugger for "why didn't my path-scoped rule fire?" |

- ⚠️ Only exit code `2` blocks. A hook that exits `1` does **not** block the action (stderr shows, turn continues). A `PreToolUse` `deny` beats `bypassPermissions`/`--dangerously-skip-permissions`: the way to enforce un-bypassable org policy.

<sub>src: code.claude.com/docs/en/hooks · /hooks-guide</sub>

---

## 06 PROMPT CACHING

The cache matches on the request **prefix**, exactly, so a change anywhere early recomputes everything after it. Claude Code orders content least-changing-first: `System prompt → Project context → Conversation`.

| 🔴 Invalidates the cache (slow, costly next turn) | 🟢 Keeps the cache |
|:--|:--|
| Switch **model** (each has its own cache) | Edit files in your repo |
| Change **effort** level | Edit CLAUDE.md mid-session (also doesn't apply till restart) |
| Turn on **fast mode** (first time) | Change **output style** (also doesn't apply till `/clear`) |
| Connect/disconnect MCP **if tools load into the prefix** | Change **permission mode** |
| Enable/disable a plugin that ships an **MCP server** | Invoke **skills & commands** (appended as messages) |
| Deny an **entire tool** (`Bash`, not `Bash(rm *)`) | `/recap` (appends, unlike `/compact`) |
| `/compact` · upgrade Claude Code · resume after upgrade | `/rewind` (truncates back to a cached prefix) |

- 💡 Pick model and effort at the top of a session; save `/compact` for natural task breaks. Every mid-task model/effort/fast-mode flip is a full uncached turn. Prefer `/rewind` (reuses a warm prefix) over `/compact` (builds a new one) to abandon a bad path.
- 💡 `/cd <path>` `🆕 v2.1.169` moves the session to another working directory *without* breaking the prompt cache — beats restarting in the right repo.
- 💡 On a Claude subscription the 1-hour cache TTL is automatic (no `ENABLE_PROMPT_CACHING_1H`; that's the API-key/Bedrock/Vertex lever). Watch `cache_read_input_tokens` vs `cache_creation_input_tokens`: high read-ratio means caching works; persistently high *creation* means something keeps changing your prefix.

<sub>src: code.claude.com/docs/en/prompt-caching</sub>

---

## 07 ORCHESTRATION

| Feature | Invoke | What it gets you |
|:--|:--|:--|
| 🔥 **Forked subagents** `🆕 default-on v2.1.161` | `/fork <directive>` · `CLAUDE_CODE_FORK_SUBAGENT=1` | Inherits the *entire* conversation (zero re-explaining) and shares the parent's prompt cache, so cheaper than a fresh subagent for same-context work. Open a running fork's transcript and steer it mid-flight. |
| 🔥 **`/goal`** `🆕 v2.1.139+` | `/goal <condition>` | A small fast model re-checks your condition every turn and keeps Claude working until it holds, no per-turn prompting. ⚠️ Judges *only the transcript*, so write conditions the output can prove: `"npm test exits 0 and git status clean, or stop after 20 turns"`. |
| **Agent view** | `claude agents` · `--json` | `←` on an empty prompt backgrounds + jumps here; `Ctrl+T` pins (survives idle, restarts onto new binaries); `s:blocked` filters "what needs me"; `--json` emits an inventory with a `waitingFor` field. |
| **Respawn** | `claude respawn --all` | Rolls every background session onto an updated Claude Code binary at once. |

- 💡 For human sign-off *between* stages, skip one big workflow or an agent team: workflows forbid mid-run input (only permission prompts pause), and in-process teammates don't survive `/resume`. Chain separate steps, or use agent view's per-session peek/reply.
- ⚠️ Three "agents" surfaces, easy to confuse: `claude agents` (background sessions) ≠ `/agents` (subagent Library) ≠ agent *teams* (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, ~7× tokens). Dynamic workflows (`ultracode`) are the heaviest fan-out; see [STATE.md](./STATE.md). The workflow JS API isn't in the public docs, so don't assume function names.

<sub>src: code.claude.com/docs/en/sub-agents · /goal · /agent-view · /workflows</sub>

---

## 08 SESSIONS, REMOTE, DEEP LINKS

| Feature | Invoke | What it gets you |
|:--|:--|:--|
| **Channels** `🆕 v2.1.80+` | `claude --channels plugin:<name>@<mkt>` | Inverse of an MCP server: pushes events into your live session over stdio. Per-session opt-in (being in `.mcp.json` isn't enough). Two-way `reply` tool + permission relay (`claude/channel/permission`) to approve `Bash`/`Write`/`Edit` from your phone. |
| 🔥 **iMessage self-chat** | iMessage channel reads `~/Library/Messages/chat.db` | Text yourself for a zero-config phone→Claude bridge (needs Full Disk Access, no bot token). |
| **Remote Control** `🆕 v2.1.51+` | `claude remote-control` · `/rc` · `--spawn worktree` | Local session, phone UI via QR; filesystem + MCP + `@`-autocomplete intact. `/rc` hands an in-progress convo over without restarting. `--spawn worktree` = parallel edits per connection. Outbound HTTPS only. Pro/Max/Team/Enterprise, preview. |
| **Deep links** `🆕 v2.1.91+` | `claude-cli://open?…` · `vscode://anthropic.claude-code/open` | Auto-registered on first run, no install. Opens a terminal (or an IDE tab) in the right repo, prompt pre-typed. Fire via `open` (macOS) / `xdg-open` (Linux) / `Start-Process` (PowerShell). |

**Deep-link params:**

| Param | Behaviour |
|:--|:--|
| `q` | URL-encoded prompt, max 5,000 chars (`%0A` = newline). ⚠️ Inert until you press Enter; a "Prompt from an external link" warning stays visible. |
| `repo` | `owner/name` → the local clone you last ran `claude` in (shareable across a team cloning to different paths). |
| `cwd` | Absolute dir; wins over `repo` if both are passed. |

- ⚠️ Channels: gate senders on `message.from.id`, not `message.chat.id` — in a group chat, anyone in an allowlisted room could otherwise inject into your session.
- ⚠️ Remote Control won't connect? You're probably on an inference-only token; it needs a full `claude auth login`, not `setup-token`.
- ⚠️ GitHub strips `claude-cli://` links (renders the label only) — put the URL in a code block so people can copy it.
- 💡 Channels + the permission relay beats `--dangerously-skip-permissions` for unattended runs: a long-running agent that still asks before risky calls, except the ask lands on your phone and the first verdict (terminal or remote) wins.
- 💡 Deep link + Skill is the runbook pattern: store the long prompt as a `/skill` and let `q` just name it. Short URLs, and you dodge the 5,000-char limit.

<sub>src: code.claude.com/docs/en/channels · /channels-reference · /remote-control · /deep-links</sub>

---

## 09 PLATFORM AND AGENT SDK

| Feature | Identifier | What it gets you |
|:--|:--|:--|
| **Dreams** | `POST /v1/dreams` | Async: reads a memory store + ≤100 transcripts → writes a *new* curated store (input never touched; review & swap). Cleans rotting long-term memory; escape hatch for the 2,000-store cap (dream it down, switch, archive). Flow: `POST` (inputs + `model` + optional `instructions`) → poll `pending → running → completed \| failed \| canceled` (minutes to tens of minutes) → read `outputs[]` for the rebuilt `memory_store_id`. |
| **Memory tool** | `memory_20250818` | Claude runs file ops (view/create/str_replace/insert/delete/rename) on a `/memories` dir *your* infra stores; JIT-retrieval, ZDR-eligible. An auto-injected line tells it to check memory first and checkpoint "because context may reset at any moment". |
| **Context editing** | `clear_tool_uses_20250919` | Clears stale tool results to placeholders. `clear_at_least` fires only when it frees ≥N tokens; `exclude_tools` shields critical results. |
| **Compaction** | `compact_20260112` | Server-side auto-summarisation; the recommended long-run strategy over manual editing. |

**Dreams knobs & limits:**

| Knob | Value |
|:--|:--|
| Beta headers (stacked) | `managed-agents-2026-04-01` + `dreaming-2026-04-21` |
| Models (preview) | `claude-opus-4-8`, `claude-opus-4-7`, `claude-sonnet-4-6` |
| Caps | 100 sessions/dream · `instructions` ≤ 4,096 chars |
| Status | Research preview (request access); billed at standard token rates |

- 💡 The three context levers only pay off *together*: compaction summarises in place, context editing drops the oldest tool results, the memory tool persists facts across the summary boundary so nothing load-bearing is lost. Every clear/edit is a prompt-cache decision (the guards `clear_at_least`, `defer_loading` mutate only when token savings beat a cache rebuild).
- 💡 Dreams `instructions` is a synthesis *steer* ("focus on architecture decisions, preserve user prefs"), not a line editor — imperative "change X to Y" does nothing; use the Memory Stores API for targeted edits. While `running`, stream the dream's own `session_id` to watch what it reads and writes live.
- ⚠️ Compaction footgun: with tools defined, the model may call a tool instead of writing the summary — add "respond with text only, do not call any tools" to `instructions`.

<sub>src: platform.claude.com/docs/en/managed-agents/dreams · /memory · /agents-and-tools/tool-use/memory-tool · /build-with-claude/context-editing · /compaction</sub>

---

## 10 THE ANTHROPIC PLAYBOOK

Power-moves Anthropic's team documents, not folklore.

| Practice | Source |
|:--|:--|
| **`ultrathink`** is the recognised thinking-budget keyword today. The ladder (`think` < `think hard` < `think harder` < `ultrathink`, more budget each step) is from the original best-practices post; only `ultrathink` parses as a keyword now. Separate from `ultracode` (= `xhigh` effort + dynamic workflows). | best-practices post · model-config docs |
| **Explore → plan → code → commit.** Read the relevant files *before* writing code; separating research and planning from coding "avoids solving the wrong problem." | best-practices |
| **Press `#` to fold an instruction into CLAUDE.md**, and after correcting Claude, ask it to update CLAUDE.md so it won't repeat the mistake. They also run CLAUDE.md through the prompt improver and add `IMPORTANT`/`YOU MUST`. | Boris Cherny / team |
| **One Claude writes, a second (fresh context) reviews** — unbiased toward code it just wrote. Run 3–5 sessions at once, one per task, most started in Plan mode (`Shift+Tab` twice). | Boris Cherny / team |
| **Guardrails in hooks, not prompts.** "Never edit `.env`" in CLAUDE.md is a request; a `PreToolUse` hook is enforcement. Keep CLAUDE.md under ~200 lines; move reference to skills or `.claude/rules/`. | best-practices / team |

<sub>src: code.claude.com/docs/en/best-practices (orig. anthropic.com/engineering/claude-code-best-practices) · /features-overview</sub>

---

## 11 STALE ADVICE

Renamed, removed, don't-use.

| You'll still see… | Reality |
|:--|:--|
| the bare word `workflow` triggers a run | renamed **`ultracode`** (v2.1.160); the bare word no longer fires. Natural-language "run a workflow" works either way. |
| `/output-style` | removed v2.1.91; use `/config` → Output style, or set `"outputStyle"` in settings. |
| `/vim` | removed v2.1.92; `/config` → Editor mode. |
| `/pr-comments` · `/extra-usage` | gone (just ask to view PR comments) · renamed `/usage-credits`. |
| `think` / `think hard` as keywords | only **`ultrathink`** is parsed now (the ladder lives in the original best-practices post). |
| `TodoWrite` | replaced by `TaskCreate`/`TaskGet`/`TaskList` `🆕 v2.1.142+`; `CLAUDE_CODE_ENABLE_TASKS=0` reverts. |
| **Windsurf** in `/ide` | rebranded **Devin Desktop**. |

---

## 12 EASTER EGGS

| Command | Does |
|:--|:--|
| `/radio` | lo-fi station |
| `/stickers` · `/color [color]` | stickers · recolour the UI |
| `/heapdump` | memory snapshot to `~/Desktop` |
| `/powerup` | animated feature lessons |
| `/insights` | your own usage report |

Record a demo GIF straight from a prompt with the Chrome integration.

---

## 13 THE FULL CIRCLE

Where everything above sits on one working loop. Phases ⓪–⑥, then the
feedback arrow makes it a circle: what each lap teaches you becomes the next
lap's configuration.

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ⓪ CONFIGURE                "set the table before cooking"  §02 §03 §04 §05 │
├────────────────────────────────────────────────────────────────────────────┤
│  six surfaces .... CLAUDE.md · rules (paths:) · skills · subagents         │
│                    · hooks · MCP servers      (plugins = the packaging)    │
│  bootstrap ....... /init  (CLAUDE_CODE_NEW_INIT=1 = guided multi-phase)    │
│  cross-tool ...... AGENTS.md · SKILL.md standard · .mcp.json               │
│  context diet .... disableBundledSkills · skillOverrides: name-only        │
│                    · disable-model-invocation · paths: scoping             │
│  clean room ...... claude --safe-mode  ("my config, or stock behavior?")   │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ ① PLAN                                     "decide what to build"  §06 §10 │
├────────────────────────────────────────────────────────────────────────────┤
│  plan mode ....... Shift+Tab ×2 · ultrathink for the gnarly parts          │
│  cloud plan ...... /ultraplan  (draft in cloud → review → pull back)       │
│  persistent goal . /goal <condition the transcript can prove>              │
│  dials ........... /model best · /effort low→max (ultracode = workflows)   │
│  cache rule ...... pick model + effort NOW — every mid-task flip           │
│                    recomputes the whole prefix (§06)                       │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ ② IMPLEMENT                                         "do the work"  §07 §08 │
├────────────────────────────────────────────────────────────────────────────┤
│  same context .... /fork  (full history + warm cache, steerable)           │
│  isolation ....... --worktree <name> · worktree.baseRef fresh|head         │
│  parallelism ..... claude agents (Ctrl+T pins) · /bg · /batch              │
│  heavy fan-out ... ultracode dynamic workflows · agent teams (~7× tokens)  │
│  from anywhere ... channels (events flow in) · remote control (you drive)  │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ ③ VERIFY                                 "does it actually work?"  §05 §07 │
├────────────────────────────────────────────────────────────────────────────┤
│  provable done ... /goal "npm test exits 0 and git status clean"           │
│  enforced done ... Stop hook ("type": "agent") runs the tests before       │
│                    Claude may stop — exit 2 is the only code that blocks   │
│  structured out .. --json-schema  (machine-checkable -p output)            │
└─────────────────────────────────────┬──────────────────────────────────────┘
   fail → back to ②                   ▼ pass
┌────────────────────────────────────────────────────────────────────────────┐
│ ④ REVIEW                                        "second pair of eyes"  §10 │
├────────────────────────────────────────────────────────────────────────────┤
│  bug hunt ........ /code-review [effort]  (--comment posts · --fix edits)  │
│  cleanup only .... /simplify  (reuse / altitude — NOT bug-hunting)         │
│  multi-agent ..... /ultrareview  (parallel reviewers + adversarial pass)   │
│  fresh eyes ...... a second Claude, fresh context, reviews the first's     │
│                    work — unbiased toward code it just wrote               │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ ⑤ SHIP                                                 "out the door"  §08 │
├────────────────────────────────────────────────────────────────────────────┤
│  git ............. commit / push / PR  (only when asked)                   │
│  CI .............. claude -p + setup-token · claude ultrareview --json     │
│                    · --max-budget-usd caps unattended runs                 │
│  scheduled ....... Routines (web) · /schedule scaffolds them from CLI      │
│  runbooks ........ deep link + skill: claude-cli://open?repo=…&q=/name     │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ ⑥ MAINTAIN                             "keep it from rotting"  §02 §09 §11 │
├────────────────────────────────────────────────────────────────────────────┤
│  fold corrections  press # → CLAUDE.md · auto-memory accrues per repo      │
│  prune ........... /fewer-permission-prompts · claude project purge        │
│  fleet care ...... claude respawn --all · /insights usage report           │
│  memory hygiene .. dreams rebuilds a rotting memory store (§09)            │
│  drift control ... pin artifacts to the model they were earned against;    │
│                    re-test on each major release; delete what no longer    │
│                    reproduces                                              │
└─────────────────────────────────────────────────────────────────────┬──────┘
                                                                      │
   ⓪ CONFIGURE ◀── feedback: corrections, memories, new skills & hooks ┘
   become next session's configuration — the loop closes
```

---

```
EVERY FLAG, FIELD, AND VERSION ABOVE: COPIED FROM A DOC, NOT RECALLED.
RE-CHECKED: 2026-06-10 · AGAINST: v2.1.170 · AUTHORITATIVE: docs changelog
ON DRIFT: FIX IT HERE, RE-PIN THE DATE.
```
