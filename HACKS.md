```
HACKS, FYIs & NICE-TO-KNOWS █
CLAUDE CODE v2.1.207 + CLAUDE AGENT PLATFORM

UPDATED: 2026-07-13
SOURCE REPO: anthropics/claude-code/blob/main/CHANGELOG.md
STATUS: DRAFT
```

<br>


| <samp>#</samp>                                  | <samp>SECTION</samp>                    | <samp><a href="#13-the-wheel">WHEEL</a> PHASE</samp> |
| :----------------------------------- | :--------------------------- | :------------------------------------- |
| [01](#01-standouts)                  | STANDOUTS                    | `—`                                    |
| [02](#02-memory-and-context)         | MEMORY AND CONTEXT           | `configure` ·`maintain`                |
| [03](#03-skills-plugins-mcp)         | SKILLS, PLUGINS, MCP         | `configure`                            |
| [04](#04-cli-env-settings-keys)      | CLI, ENV, SETTINGS, KEYS     | `configure` · `plan`                   |
| [05](#05-hooks)                      | HOOKS                        | `configure` · `verify`                 |
| [06](#06-prompt-caching)             | PROMPT CACHING               | `plan`                                 |
| [07](#07-orchestration)              | ORCHESTRATION                | `implement` · `verify`                 |
| [08](#08-sessions-remote-deep-links) | SESSIONS, REMOTE, DEEP LINKS | `implement` · `ship`                   |
| [09](#09-platform-and-agent-sdk)     | PLATFORM AND AGENT SDK       | `beyond the CLI`                       |
| [10](#10-the-anthropic-playbook)     | THE ANTHROPIC PLAYBOOK       | `plan` · `review`                      |
| [11](#11-stale-advice)               | STALE ADVICE                 | `maintain`                             |
| [12](#12-easter-eggs)                | EASTER EGGS                  | `—`                                    |
| [13](#13-the-wheel)            | THE WHEEL              | `⓪ → ⑥ → ⓪`                            |

---

<br>

<h2 id="01-standouts"><samp>01 STANDOUTS</samp></h2>

A couple lesser-known or new features I like.

<table>
<tr><th><samp>FEATURE</samp></th><th><samp>INVOKE</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td>dreams</td><td><code>POST /v1/dreams</code></td><td>Offline job rebuilds a memory store from itself + ≤100 transcripts: dupes merged, contradictions resolved, insights surfaced. Curates rotting long-term memory; escape hatch for the 2,000-memory per-store cap. → <a href="#09-platform-and-agent-sdk">#09</a></td></tr>
<tr><td>channels<sup>NEW</sup> <kbd><samp>v2.1.80+</samp></kbd></td><td><code>claude --channels plugin:&lt;name&gt;@&lt;mkt&gt;</code></td><td>Pushes outside events (CI fail, Telegram, <code>curl</code>) <em>into</em> your live session over stdio, files + context already loaded. → <a href="#08-sessions-remote-deep-links">#08</a></td></tr>
<tr><td>deep links<sup>NEW</sup> <kbd><samp>v2.1.91+</samp></kbd></td><td><code>claude-cli://open?repo=…&q=…</code></td><td>One click opens Claude in a new terminal, right repo, prompt pre-typed. <code>mailto:</code> for agent sessions. → <a href="#08-sessions-remote-deep-links">#08</a></td></tr>
<tr><td>remote control</td><td><code>claude remote-control · /rc</code></td><td>Drive your local session from your phone; full tooling, outbound HTTPS only. → <a href="#08-sessions-remote-deep-links">#08</a></td></tr>
</table>

---

<br>

<h2 id="02-memory-and-context"><samp>02 MEMORY AND CONTEXT</samp></h2>

<table>
<tr><th><samp>FEATURE</samp></th><th><samp>IDENTIFIER</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td>auto-memory<sup>NEW</sup> <kbd><samp>v2.1.59+</samp></kbd></td><td><code>~/.claude /projects/ &lt;project&gt;/ memory/MEMORY.md</code></td><td>Claude's own cross-session notes (build cmds, debugging insights, your corrections). Loaded at start: first 200 lines / 25 KB of <code>MEMORY.md</code>, topic files on demand. Machine-local, keyed to git repo root, so all worktrees + subdirs share one dir.</td></tr>
<tr><td>CLAUDE.md import</td><td><code>@path/to/file</code> (max depth 4)</td><td>Expands at launch. <code>@~/.claude/notes.md</code> shares personal instructions across worktrees a gitignored <code>CLAUDE.local.md</code> can't reach.</td></tr>
<tr><td>zero-cost notes</td><td><code>&lt;!-- comment --&gt;</code> in CLAUDE.md</td><td>Stripped before injection; maintainer notes at zero context cost, visible only in-file.</td></tr>
<tr><td>monorepo noise filter</td><td><code>claudeMdExcludes</code></td><td>Glob/path list skips noisy ancestor CLAUDE.md files; put in <code>.claude/settings.local.json</code> to keep it machine-local.</td></tr>
<tr><td>context tools</td><td><code>/context</code> · <code>Esc Esc</code> · "Summarize up to here"</td><td><code>/context</code> = your real split (docs' pictures use fake numbers). <code>Esc Esc</code> on an empty prompt rewinds. "Summarize up to here" is a scalpel where <code>/compact</code> is a hammer.</td></tr>
</table>

<br>

**What survives `/compact`:**

<table>
<tr><th><samp>LAYER</samp></th><th><samp>FATE</samp></th></tr>
<tr><td>System prompt, CLAUDE.md, auto-memory, MCP defs, unscoped rules</td><td>Reloaded fresh (cache-hit if unchanged)</td></tr>
<tr><td>Invoked skill <strong>bodies</strong></td><td>Truncated: most-recent invocation of each only, 5 K tokens each / 25 K total, cut from the <em>end</em> (put key instructions at the top of <code>SKILL.md</code>)</td></tr>
<tr><td>Skill <strong>descriptions</strong>, path-scoped rules, nested CLAUDE.md</td><td>Dropped until a matching file is read again</td></tr>
</table>

- Auto-memory + a tight CLAUDE.md is a division of labour: say "tests need Redis / build is X / I prefer Y" once and auto-memory persists it per-repo, machine-locally. CLAUDE.md is for team-shared intent the code can't tell you; auto-memory is for your accumulated corrections.
- <code>@AGENTS.md</code> import + <code>/init</code> reading <code>.cursorrules</code>/<code>.windsurfrules</code>/<code>.devin/rules/</code> = one canonical source feeds Claude, Cursor, Windsurf, Devin. (Windows: use the import, not a symlink.)

<sub><a href="https://code.claude.com/docs/en/memory">src: code.claude.com/docs/en/memory</a> · <kbd>/context-window</kbd> <kbd>/claude-directory</kbd></sub>

---

<br>

<h2 id="03-skills-plugins-mcp"><samp>03 SKILLS, PLUGINS, MCP</samp></h2>

<table>
<tr><th><samp>FEATURE</samp></th><th><samp>IDENTIFIER</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td>hidden skill</td><td><code>disable-model-invocation: true</code></td><td>Skill stays <em>entirely</em> out of context (not even its description) until you <code>/name</code> it. Put on side-effecting workflows (commit, deploy) for zero standing cost.</td></tr>
<tr><td>tiny-context skill</td><td><code>context: fork</code> + <code>agent: Explore</code></td><td>Runs a skill in an isolated subagent that skips CLAUDE.md and git status.</td></tr>
<tr><td>tool search</td><td>default on Sonnet 4+ / Opus 4+</td><td>Defers all MCP tool schemas by default. The "too many MCP servers blow my context" caution is largely obsolete unless you force <code>alwaysLoad</code> or <code>ENABLE_TOOL_SEARCH=false</code>.</td></tr>
<tr><td>nested <code>.claude/</code><sup>NEW</sup> <kbd><samp>v2.1.178</samp></kbd></td><td>nearest dir wins</td><td>A skill in a nested <code>.claude/skills/</code> loads when you work on files beneath it (<code>&lt;dir&gt;:&lt;name&gt;</code> on a clash); the agent/workflow/output-style in the <em>closest</em> <code>.claude/</code> wins a name collision. Monorepo subprojects carry their own harness.</td></tr>
<tr><td>inline MCP data</td><td><code>@server:resource</code> (<code>@github:issue://123</code>) · <code>/mcp__server__prompt</code></td><td>Pull live MCP data inline like an <code>@file</code>; surface server prompts as slash commands.</td></tr>
<tr><td>plugin CLI + state</td><td><code>bin/</code> at plugin root · <code>${CLAUDE_PLUGIN_DATA}</code></td><td><code>bin/</code> joins the Bash <code>PATH</code> while enabled (ship a CLI your skills call by name). <code>${CLAUDE_PLUGIN_DATA}</code> is the persistent state dir that survives updates (install venvs / <code>node_modules</code> there once).</td></tr>
<tr><td>commit-SHA versioning</td><td>omit <code>version</code> from <code>plugin.json</code> + marketplace entry</td><td>Git commit SHA becomes the version, so every push is an update. Setting a <code>version</code> pins the install cache; <code>/plugin update</code> reports "already at the latest version" until you bump it.</td></tr>
<tr><td>plugin option scoping<sup>NEW</sup> <kbd><samp>v2.1.207</samp></kbd></td><td><code>pluginConfigs</code></td><td>Plugin option values now resolve from user settings, <code>--settings</code>, and managed settings only — a project-level <code>.claude/settings.json</code> entry is silently ignored. Don't ship a plugin option default that depends on a repo-committed override.</td></tr>
</table>

> [!NOTE]
> Prefer CLI tools (<code>gh</code> / <code>aws</code> / <code>gcloud</code>) over MCP servers when you can: a CLI adds zero per-tool listing context; an MCP server adds tool names (unless deferred). For occasional external calls, the shell is the context-cheapest path.

<sub><a href="https://code.claude.com/docs/en/skills">src: code.claude.com/docs/en/skills</a> · <kbd>/plugins-reference</kbd> <kbd>/mcp</kbd> <kbd>/tools-reference</kbd></sub>

---

<br>

<h2 id="04-cli-env-settings-keys"><samp>04 CLI, ENV, SETTINGS, KEYS</samp></h2>

Full lists live in `docs/en/cli-reference`, `/settings`, `/env-vars`, `/hooks`. This is the hacky subset.

**CLI flags & subcommands**

<table>
<tr><th><samp>FLAG / COMMAND</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td><code>--worktree &lt;name&gt;</code> / <code>-w</code></td><td>Isolated git worktree in one command; pass <code>#1234</code> or a PR URL to branch a fresh checkout <em>from that PR</em>.</td></tr>
<tr><td><code>--bg --exec 'pytest -x'</code></td><td>Fire-and-forget a shell job as an attachable background row (no model invoked).</td></tr>
<tr><td><code>--bare</code> (sets <code>CLAUDE_CODE_SIMPLE</code>)</td><td>Skip all auto-discovery (hooks/skills/plugins/MCP/memory/CLAUDE.md): faster, deterministic scripted starts.</td></tr>
<tr><td><code>--safe-mode</code><sup>NEW</sup> <kbd><samp>v2.1.169</samp></kbd></td><td>Start with all customizations <em>disabled</em> (CLAUDE.md, skills, hooks, plugins, MCP): the clean-room for "is this my config or stock behavior?".</td></tr>
<tr><td><code>--exclude-dynamic-system-prompt-sections</code></td><td>Move per-machine bits (cwd, env, paths) out of the system prompt so the cache reuses across machines.</td></tr>
<tr><td><code>--from-pr &lt;n&gt;</code> / <code>--fork-session</code></td><td>Resume the session that built a PR / branch a conversation without mutating the original.</td></tr>
<tr><td><code>--max-budget-usd 5.00</code></td><td>Hard dollar ceiling for unattended <code>-p</code> runs.</td></tr>
<tr><td><code>--json-schema</code></td><td>Schema-validated output in the <code>structured_output</code> field (<code>-p</code> mode).</td></tr>
<tr><td><code>--agents '{"reviewer":{…,"prompt":"…"}}'</code></td><td>Define a subagent inline as JSON, no file to author.</td></tr>
<tr><td><code>--strict-mcp-config</code></td><td>Use <em>only</em> <code>--mcp-config</code> servers: hermetic, reproducible MCP set.</td></tr>
<tr><td><code>--plugin-url &lt;https-zip&gt;</code></td><td>Load a plugin from a hosted CI artifact for one session, no install.</td></tr>
<tr><td><code>claude mcp serve</code></td><td>Run <strong>Claude Code itself as an MCP server</strong>, exposing its tools to other clients.</td></tr>
<tr><td><code>claude project purge [path]</code></td><td>Wipe one project's local footprint (transcripts, memory, tasks); <code>--dry-run</code>, <code>--all</code>.</td></tr>
<tr><td><code>claude setup-token</code></td><td>Long-lived OAuth token for CI/scripts (Claude subscription).</td></tr>
<tr><td><code>claude mcp login &lt;name&gt;</code> / <code>logout</code><sup>NEW</sup> <kbd><samp>v2.1.186</samp></kbd></td><td>Authenticate an MCP server from the CLI without the <code>/mcp</code> menu; <code>--no-browser</code> completes OAuth over SSH via paste-the-URL.</td></tr>
<tr><td><code>/config key=value</code><sup>NEW</sup> <kbd><samp>v2.1.181</samp></kbd></td><td>Set <em>any</em> setting from the prompt (<code>/config thinking=false</code>) — scriptable in <code>-p</code> and Remote Control, no settings.json edit. <code>/config --help</code> lists the keys.</td></tr>
<tr><td><code>/doctor</code> (= <code>/checkup</code>)<sup>NEW</sup> <kbd><samp>v2.1.205+</samp></kbd></td><td>Went from diagnostics-only to a full checkup that <em>fixes</em> issues too (v2.1.205); now proposes trimming checked-in <code>CLAUDE.md</code> content Claude could already derive from the codebase (v2.1.206) and flags an externally managed launcher script the auto-updater can't safely overwrite (v2.1.207).</td></tr>
<tr><td colspan="2" align="center"><kbd><h4>Environment variables</h4></kbd></td></tr>
<tr><th><samp>VAR</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td><code>CLAUDE_CODE_EFFORT_LEVEL</code></td><td>The <strong>only</strong> way to make <code>max</code> effort persist across sessions (the setting rejects <code>max</code>).</td></tr>
<tr><td><code>BASH_DEFAULT_TIMEOUT_MS</code></td><td>Long bash commands <strong>auto-background</strong> past this instead of being killed.</td></tr>
<tr><td><code>CLAUDE_AUTOCOMPACT_PCT_OVERRIDE</code></td><td>Trigger auto-compaction earlier than the ~95% default (e.g. <code>50</code>).</td></tr>
<tr><td><code>CLAUDE_CODE_AUTO_COMPACT_WINDOW</code></td><td>Absolute-token auto-compact threshold for 1M-window sessions (Sonnet 5 default ~967K) — the token-count companion to the percent override above.</td></tr>
<tr><td><code>CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY</code></td><td>Crank parallel read-only tools/subagents above the default <code>10</code>.</td></tr>
<tr><td><code>CLAUDE_CODE_ATTRIBUTION_HEADER=0</code></td><td>Drop the attribution block for a smaller, more cacheable system prompt.</td></tr>
<tr><td><code>CLAUDE_CODE_TASK_LIST_ID=my-project</code></td><td>Share one task list across sessions on the same project.</td></tr>
<tr><td><code>CLAUDE_CODE_HIDE_CWD=1</code></td><td>Hide the working dir in the startup logo (clean screenshares).</td></tr>
<tr><td><code>CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1</code></td><td>One switch: autoupdater + feedback + error-reporting + telemetry off.</td></tr>
<tr><td><code>MAX_THINKING_TOKENS=0</code></td><td>Disable extended thinking regardless of effort (big cost lever on simple tasks). No-op on Fable 5: thinking can't be turned off there.</td></tr>
<tr><td><code>ENABLE_TOOL_SEARCH=auto:5</code></td><td>Threshold-load only MCP tools fitting in 5% of context; defer the rest.</td></tr>
<tr><td><code>CLAUDE_CODE_RETRY_WATCHDOG</code><sup>NEW</sup> <kbd><samp>v2.1.199</samp></kbd></td><td>Raises the default retry count for non-capacity transient errors to 300 and <em>lifts</em> the former cap of 15 on <code>CLAUDE_CODE_MAX_RETRIES</code>: the supported lever for unattended sessions that must not give up.</td></tr>
<tr><td><code>CLAUDE_ENABLE_STREAM_WATCHDOG=0</code><sup>NEW</sup> <kbd><samp>v2.1.196</samp></kbd></td><td>Opt out of the idle-stream watchdog, now on by default for <em>all</em> providers — it aborts and retries a response stream that emits no events for 5 min.</td></tr>
<tr><td colspan="2" align="center"><kbd><h4>settings.json keys</h4></kbd></td></tr>
<tr><th><samp>KEY</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td><code>skillOverrides</code></td><td>Set a skill to <code>"name-only"</code> (keep listed, drop description budget) or <code>"off"</code>, without editing its file; great for noisy third-party skills.</td></tr>
<tr><td><code>maxSkillDescriptionChars</code> / <code>skillListingBudgetFraction</code><sup>NEW</sup> <kbd><samp>v2.1.105+</samp></kbd></td><td>Tune the 1,536-char per-skill cap / the 1%-of-context listing budget.</td></tr>
<tr><td><code>autoMode.hard_deny</code></td><td>Prose-rule blocklist that overrides auto-approval: a policy-grade backstop.</td></tr>
<tr><td><code>worktree.baseRef</code></td><td><code>"fresh"</code> (from <code>origin/HEAD</code>) vs <code>"head"</code> (carry unpushed work) for worktree creation.</td></tr>
<tr><td><code>includeGitInstructions: false</code></td><td>Drop built-in git workflow text for a smaller system prompt, better cache.</td></tr>
<tr><td><code>disableDeepLinkRegistration: "disable"</code></td><td>Stop <code>claude-cli://</code> from registering (security lever).</td></tr>
<tr><td><code>requiredMinimumVersion</code> / <code>…Maximum…</code></td><td>(Managed) refuse to start outside a version band: pin a fleet.</td></tr>
<tr><td><code>availableModels</code> + <code>enforceAvailableModels</code><sup>NEW</sup> <kbd><samp>v2.1.175</samp></kbd></td><td>(Managed) allowlist which models a fleet may use; <code>enforceAvailableModels</code> extends the allowlist to the resolved <em>Default</em> model and stops user/project settings widening it; <code>ANTHROPIC_DEFAULT_*_MODEL</code> and <code>/fast</code> can't bypass it (v2.1.177). The model analog of the version-band pin above.</td></tr>
<tr><td><code>fallbackModel</code><sup>NEW</sup> <kbd><samp>v2.1.166</samp></kbd></td><td>Up to three fallbacks tried in order when the primary is overloaded/unavailable; the settings form of <code>--fallback-model</code>.</td></tr>
<tr><td><code>disableBundledSkills</code><sup>NEW</sup> <kbd><samp>v2.1.169</samp></kbd></td><td>Hide <em>all</em> bundled skills, workflows, and built-in slash commands from the model in one key: reclaim their description budget.</td></tr>
<tr><td><code>Tool(param:value)</code> perm rules<sup>NEW</sup> <kbd><samp>v2.1.178</samp></kbd></td><td>Permission rules match a tool call's <em>input params</em> (with <code>*</code>): e.g. <code>Agent(model:opus)</code> blocks Opus subagents — param-level <code>deny</code>/<code>allow</code> without a <code>PreToolUse</code> hook.</td></tr>
<tr><td><code>sandbox.credentials</code><sup>NEW</sup> <kbd><samp>v2.1.187</samp></kbd></td><td>Block sandboxed commands from reading credential files and secret env vars — defense-in-depth for untrusted shell.</td></tr>
<tr><td><code>respondToBashCommands: false</code><sup>NEW</sup> <kbd><samp>v2.1.186</samp></kbd></td><td>Revert the new default where a <code>!</code> bash run makes Claude react to the output; keeps <code>!</code> output as context only.</td></tr>
<tr><td colspan="2" align="center"><kbd><h4>Interactive shortcuts & TUI</h4></kbd></td></tr>
<tr><th><samp>KEYS</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td><code>Esc Esc</code></td><td>Empty prompt → rewind menu; with text → clear draft (saved to history, <code>↑</code> recalls).</td></tr>
<tr><td><code>Ctrl+X Ctrl+K</code></td><td>Kill <strong>all</strong> background subagents (twice within 3 s to confirm).</td></tr>
<tr><td><code>Ctrl+O</code></td><td>Toggle transcript; expands collapsed MCP calls ("Called slack 3 times").</td></tr>
<tr><td><code>Ctrl+B</code></td><td>Background a running bash command/agent mid-run without killing it.</td></tr>
<tr><td><code>Ctrl+R</code> then <code>Ctrl+S</code></td><td>Reverse history search; <code>Ctrl+S</code> cycles scope session → project → <strong>all projects</strong>.</td></tr>
<tr><td><code>Ctrl+G</code></td><td>Open prompt or a plan in <code>$EDITOR</code> before proceeding.</td></tr>
<tr><td><code>Option+T</code> / <code>Alt+T</code><sup>NEW</sup> <kbd><samp>v2.1.132</samp></kbd></td><td>Toggle extended thinking per-prompt (macOS no-config since v2.1.132).</td></tr>
<tr><td><code>/tui fullscreen</code></td><td>Alt-screen renderer; fixes "scroll jumps to top while Claude works" in VS Code/tmux.</td></tr>
<tr><td><code>/focus</code> · <code>/btw</code></td><td>Quieter transcript view · ask a side question that <strong>never enters history</strong>.</td></tr>
</table>

> [!NOTE]
> **Fable 5 + Mythos 5 restored 2026-07-01** — a 19-day US export-control suspension (from 2026-06-12) was lifted 2026-06-30; both are back globally (API/AWS/Foundry), rollout throttled to ≤50% of weekly usage limits through 2026-07-12, then usage credits. Neither the suspension nor the restoration hit the CC changelog: model availability moves independently of it, so check it out of band on every bump.

Fable 5 (<code>/model fable</code>,<sup>NEW</sup> <kbd><samp>v2.1.170</samp></kbd>) reroutes classifier-flagged requests (cybersecurity/biology) to Opus mid-session — and can trip on <em>workspace context</em> alone (CLAUDE.md, git status, directory names) before you type anything. <code>claude --safe-mode</code> isolates whether your config is the trigger; <code>/config</code> → "switch models when a message is flagged" off = pause-and-ask instead of silent switch.

<code>/model best</code> resolves to Fable 5 where the org has access, else latest Opus — safe to write into shared settings for mixed-access teams.

<sub><a href="https://code.claude.com/docs/en/cli-reference">src: code.claude.com/docs/en/cli-reference</a> · <kbd>/env-vars</kbd> <kbd>/settings</kbd> <kbd>/interactive-mode</kbd> <kbd>/fullscreen</kbd> <kbd>/model-config</kbd></sub>

---

<br>

<h2 id="05-hooks"><samp>05 HOOKS</samp></h2>

The events and fields nobody reads down to.

<table>
<tr><th><samp>HOOK / FIELD</samp></th><th><samp>FUNCTION</samp></th></tr>
<tr><td><code>PermissionDenied</code> + <code>{retry: true}</code></td><td>Auto-mode denied a call: tell the model to try a different approach (a self-healing loop).</td></tr>
<tr><td><code>MessageDisplay</code> → <code>displayContent</code></td><td>Rewrite what the <strong>user sees</strong> (redact secrets, localise) while Claude's context keeps the original.</td></tr>
<tr><td><code>CwdChanged</code> + <code>CLAUDE_ENV_FILE</code></td><td>The direnv/nix bridge: write <code>export …</code> lines and Claude runs them before every Bash call (env otherwise doesn't persist).</td></tr>
<tr><td><code>terminalSequence</code><sup>NEW</sup> <kbd><samp>v2.1.141+</samp></kbd></td><td>Native desktop notifications/titles/bells from a hook (OSC 9/99/777), no controlling terminal needed.</td></tr>
<tr><td><code>"type": "prompt"</code> / <code>"type": "agent"</code></td><td>LLM hooks: judgment gating ("are all tasks done?") or a subagent that runs the tests before allowing a stop.</td></tr>
<tr><td><code>"type": "mcp_tool"</code></td><td>Route hook logic through an already-connected MCP tool (e.g. a security scanner), no subprocess.</td></tr>
<tr><td><code>"args": [...]</code> (exec form)</td><td>Spawns the command without a shell: the fix for quoting hell and "command not found."</td></tr>
<tr><td><code>InstructionsLoaded</code></td><td>Logs which CLAUDE.md/rule loaded, when, and why: the debugger for "why didn't my path-scoped rule fire?"</td></tr>
</table>

<br>

> [!WARNING]  
> Only exit code <code>2</code> blocks. A hook that exits <code>1</code> does <strong>not</strong> block the action (stderr shows, turn continues). A <code>PreToolUse</code> <code>deny</code> beats <code>bypassPermissions</code>/<code>--dangerously-skip-permissions</code>: the way to enforce un-bypassable org policy.

> [!WARNING]
> <code>${user_config.*}</code> is now rejected in shell-form hook, monitor, and MCP <code>headersHelper</code> commands<sup>NEW</sup> <kbd><samp>v2.1.207</samp></kbd> — a shell-injection fix. Use the exec <code>args</code> form or <code>$CLAUDE_PLUGIN_OPTION_&lt;KEY&gt;</code> in hooks; monitors and <code>headersHelper</code> read the option's value inside the script instead.

<sub><a href="https://code.claude.com/docs/en/hooks">src: code.claude.com/docs/en/hooks</a></sub>

---

<h2 id="06-prompt-caching"><samp>06 PROMPT CACHING</samp></h2>

The cache matches on the request **prefix**, exactly, so a change anywhere early recomputes everything after it. Claude Code orders content least-changing-first: `System prompt → Project context → Conversation`.

<table>
<tr><th><code>INVALIDATES</code></th><th><code>KEEPS</code></th></tr>
<tr><td>Switch <strong>model</strong> (each has its own cache)</td><td>Edit files in your repo</td></tr>
<tr><td>Change <strong>effort</strong> level</td><td>Edit CLAUDE.md mid-session (also doesn't apply till restart)</td></tr>
<tr><td>Turn on <strong>fast mode</strong> (first time)</td><td>Change <strong>output style</strong> (also doesn't apply till <code>/clear</code>)</td></tr>
<tr><td>Connect/disconnect MCP <strong>if tools load into the prefix</strong></td><td>Change permission mode</td></tr>
<tr><td>Enable/disable a plugin that ships an <strong>MCP server</strong></td><td>Invoke <strong>skills &amp; commands</strong> (appended as messages)</td></tr>
<tr><td>Deny an <strong>entire tool</strong> (<code>Bash</code>, not <code>Bash(rm *)</code>)</td><td><code>/recap</code> (appends, unlike <code>/compact</code>)</td></tr>
<tr><td><code>/compact</code> · upgrade Claude Code · resume after upgrade</td><td><code>/rewind</code> (truncates back to a cached prefix)</td></tr>
</table>

Pick model and effort at the top of a session; save <code>/compact</code> for natural task breaks. Every mid-task model/effort/fast-mode flip is a full uncached turn. Prefer <code>/rewind</code> (reuses a warm prefix) over <code>/compact</code> (builds a new one) to abandon a bad path.

<code>/cd &lt;path&gt;</code><sup>NEW</sup> <kbd><samp>v2.1.169</samp></kbd> moves the session to another working directory <em>without</em> breaking the prompt cache — beats restarting in the right repo.

On a Claude subscription the 1-hour cache TTL is automatic (no <code>ENABLE_PROMPT_CACHING_1H</code>; that's the API-key/Bedrock/Vertex lever). Watch <code>cache_read_input_tokens</code> vs <code>cache_creation_input_tokens</code>: high read-ratio means caching works; persistently high <em>creation</em> means something keeps changing your prefix.

<sub><a href="https://code.claude.com/docs/en/prompt-caching">src: code.claude.com/docs/en/prompt-caching</a></sub>

---

<h2 id="07-orchestration"><samp>07 ORCHESTRATION</samp></h2>

<table>
<tr><th><code>FEATURE</code></th><th><code>INVOKE</code></th><th><code>FUNCTION</code></th></tr>
<tr><td>forked subagents<sup>NEW</sup> <kbd><samp>v2.1.161+ default-on</samp></kbd></td><td><code>/fork &lt;directive&gt;</code> · <code>CLAUDE_CODE_FORK_SUBAGENT=1</code></td><td>Inherits the <em>entire</em> conversation (zero re-explaining) and shares the parent's prompt cache, so cheaper than a fresh subagent for same-context work. Open a running fork's transcript and steer it mid-flight.</td></tr>
<tr><td>nested subagents<sup>NEW</sup> <kbd><samp>v2.1.172+</samp></kbd></td><td><code>Agent</code> in a subagent's <code>tools</code> (default)</td><td>A subagent spawns its <em>own</em> subagents: a delegated task that itself fans out (reviewer → a verifier per finding) keeps the sub-fan-out off your main thread, only the top summary returns. Both chains cap at depth 5 now (fixed, not configurable): a <em>background</em> subagent loses the <code>Agent</code> tool there, and foreground chains hit the same limit (v2.1.181) on top of self-limiting by each blocking its parent. Omit <code>Agent</code> from a subagent's <code>tools</code> to block it; a fork still can't spawn a fork.</td></tr>
<tr><td><code>/goal</code><sup>NEW</sup> <kbd><samp>v2.1.139+</samp></kbd></td><td><code>/goal &lt;condition&gt;</code></td><td>A small fast model re-checks your condition every turn and keeps Claude working until it holds, no per-turn prompting. Judges <em>only the transcript</em>, so write conditions the output can prove: <code>"npm test exits 0 and git status clean, or stop after 20 turns"</code>.</td></tr>
<tr><td>agent view</td><td><code>claude agents</code> · <code>--json</code></td><td><code>←</code> on an empty prompt backgrounds + jumps here; <code>Ctrl+T</code> pins (survives idle, restarts onto new binaries); <code>s:blocked</code> filters "what needs me"; <code>--json</code> emits an inventory with a <code>waitingFor</code> field.</td></tr>
<tr><td>respawn</td><td><code>claude respawn --all</code></td><td>Rolls every background session onto an updated Claude Code binary at once.</td></tr>
</table>

- For human sign-off <em>between</em> stages, skip one big workflow or an agent team: workflows forbid mid-run input (only permission prompts pause), and in-process teammates don't survive <code>/resume</code>. Chain separate steps, or use agent view's per-session peek/reply.
- Two "agents" surfaces, easy to confuse: <code>claude agents</code> (background sessions) ≠ agent <em>teams</em> (<code>CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1</code>, ~7× tokens). The <code>/agents</code> wizard was <strong>removed</strong> (v2.1.198) — create/manage subagents by asking Claude or editing <code>.claude/agents/</code>. Dynamic workflows (<code>ultracode</code>) are the heaviest fan-out; see <a href="./STATE.md">STATE.md</a>. The workflow JS API isn't in the public docs, so don't assume function names.

<sub><a href="https://code.claude.com/docs/en/sub-agents">src: code.claude.com/docs/en/sub-agents</a> · <kbd>/goal</kbd> <kbd>/agent-view</kbd> <kbd>/workflows</kbd></sub>

---

<h2 id="08-sessions-remote-deep-links"><samp>08 SESSIONS, REMOTE, DEEP LINKS</samp></h2>

<table>
<tr><th><code>FEATURE</code></th><th><code>INVOKE</code></th><th><code>FUNCTION</code></th></tr>
<tr><td>channels<sup>NEW</sup> <kbd><samp>v2.1.80+</samp></kbd></td><td><code>claude --channels plugin:&lt;name&gt;@&lt;mkt&gt;</code></td><td>Inverse of an MCP server: pushes events into your live session over stdio. Per-session opt-in (being in <code>.mcp.json</code> isn't enough). Two-way <code>reply</code> tool + permission relay (<code>claude/channel/permission</code>) to approve <code>Bash</code>/<code>Write</code>/<code>Edit</code> from your phone.</td></tr>
<tr><td>iMessage self-chat</td><td>iMessage channel reads <code>~/Library/Messages/chat.db</code></td><td>Text yourself for a zero-config phone→Claude bridge (needs Full Disk Access, no bot token).</td></tr>
<tr><td>remote control<sup>NEW</sup> <kbd><samp>v2.1.51+</samp></kbd></td><td><code>claude remote-control</code> · <code>/rc</code> · <code>--spawn worktree</code></td><td>Local session, phone UI via QR; filesystem + MCP + <code>@</code>-autocomplete intact. <code>/rc</code> hands an in-progress convo over without restarting. <code>--spawn worktree</code> = parallel edits per connection. Outbound HTTPS only. Pro/Max/Team/Enterprise, preview.</td></tr>
<tr><td>deep links<sup>NEW</sup> <kbd><samp>v2.1.91+</samp></kbd></td><td><code>claude-cli://open?…</code> · <code>vscode://anthropic.claude-code/open</code></td><td>Auto-registered on first run, no install. Opens a terminal (or an IDE tab) in the right repo, prompt pre-typed. Fire via <code>open</code> (macOS) / <code>xdg-open</code> (Linux) / <code>Start-Process</code> (PowerShell).</td></tr>
</table>

<br>

**Deep-link params:**

<table>
<tr><th><code>PARAM</code></th><th><code>FUNCTION</code></th></tr>
<tr><td><code>q</code></td><td>URL-encoded prompt, max 5,000 chars (<code>%0A</code> = newline). Inert until you press Enter; a "Prompt from an external link" warning stays visible.</td></tr>
<tr><td><code>repo</code></td><td><code>owner/name</code> → the local clone you last ran <code>claude</code> in (shareable across a team cloning to different paths).</td></tr>
<tr><td><code>cwd</code></td><td>Absolute dir; wins over <code>repo</code> if both are passed.</td></tr>
</table>

- Channels: gate senders on <code>message.from.id</code>, not <code>message.chat.id</code> — in a group chat, anyone in an allowlisted room could otherwise inject into your session.
- Remote Control won't connect? You're probably on an inference-only token; it needs a full <code>claude auth login</code>, not <code>setup-token</code>.
- GitHub strips <code>claude-cli://</code> links (renders the label only) — put the URL in a code block so people can copy it.
- Channels + the permission relay beats <code>--dangerously-skip-permissions</code> for unattended runs: a long-running agent that still asks before risky calls, except the ask lands on your phone and the first verdict (terminal or remote) wins.
- Deep link + Skill is the runbook pattern: store the long prompt as a <code>/skill</code> and let <code>q</code> just name it. Short URLs, and you dodge the 5,000-char limit.

<sub><a href="https://code.claude.com/docs/en/channels">src: code.claude.com/docs/en/channels</a> · <kbd>/channels-reference</kbd> <kbd>/remote-control</kbd> <kbd>/deep-links</kbd></sub>

---

<h2 id="09-platform-and-agent-sdk"><samp>09 PLATFORM AND AGENT SDK</samp></h2>

<table>
<tr><th><code>FEATURE</code></th><th><code>IDENTIFIER</code></th><th><code>FUNCTION</code></th></tr>
<tr><td>dreams</td><td><code>POST /v1/dreams</code></td><td>Async: reads a memory store + ≤100 transcripts → writes a <em>new</em> curated store (input never touched; review &amp; swap). Cleans rotting long-term memory; escape hatch for the 2,000-memory per-store cap (dream it down, switch, archive). Flow: <code>POST</code> (inputs + <code>model</code> + optional <code>instructions</code>) → poll <code>pending → running → completed | failed | canceled</code> (minutes to tens of minutes) → read <code>outputs[]</code> for the rebuilt <code>memory_store_id</code>.</td></tr>
<tr><td>memory tool</td><td><code>memory_20250818</code></td><td>Claude runs file ops (view/create/str_replace/insert/delete/rename) on a <code>/memories</code> dir <em>your</em> infra stores; JIT-retrieval, ZDR-eligible. An auto-injected line tells it to check memory first and checkpoint "because context may reset at any moment".</td></tr>
<tr><td>context editing</td><td><code>clear_tool_uses_20250919</code></td><td>Clears stale tool results to placeholders. <code>clear_at_least</code> fires only when it frees ≥N tokens; <code>exclude_tools</code> shields critical results.</td></tr>
<tr><td>compaction</td><td><code>compact_20260112</code></td><td>Server-side auto-summarisation; the recommended long-run strategy over manual editing.</td></tr>
</table>

**Dreams knobs & limits:**

<table>
<tr><th><code>KNOB</code></th><th><code>VALUE</code></th></tr>
<tr><td>beta headers (stacked)</td><td><code>managed-agents-2026-04-01</code> + <code>dreaming-2026-04-21</code></td></tr>
<tr><td>models (preview)</td><td><code>claude-opus-4-8</code>, <code>claude-opus-4-7</code>, <code>claude-sonnet-4-6</code></td></tr>
<tr><td>caps</td><td>100 sessions/dream · <code>instructions</code> ≤ 4,096 chars</td></tr>
<tr><td>status</td><td>Research preview (request access); billed at standard token rates</td></tr>
</table>

- The three context levers only pay off <em>together</em>: compaction summarises in place, context editing drops the oldest tool results, the memory tool persists facts across the summary boundary so nothing load-bearing is lost. Every clear/edit is a prompt-cache decision (the guards <code>clear_at_least</code>, <code>defer_loading</code> mutate only when token savings beat a cache rebuild).
- Dreams <code>instructions</code> is a synthesis <em>steer</em> ("focus on architecture decisions, preserve user prefs"), not a line editor — imperative "change X to Y" does nothing; use the Memory Stores API for targeted edits. While <code>running</code>, stream the dream's own <code>session_id</code> to watch what it reads and writes live.
- Compaction footgun: with tools defined, the model may call a tool instead of writing the summary — add "respond with text only, do not call any tools" to <code>instructions</code>.

<sub><a href="https://platform.claude.com/docs/en/managed-agents/dreams">src: platform.claude.com/docs/en/managed-agents/dreams</a> · <kbd>/memory</kbd> <kbd>/agents-and-tools/tool-use/memory-tool</kbd> <kbd>/build-with-claude/context-editing</kbd> <kbd>/compaction</kbd></sub>

---

<h2 id="10-the-anthropic-playbook"><samp>10 THE ANTHROPIC PLAYBOOK</samp></h2>

Power-moves Anthropic's team documents, not folklore.

<table>
<tr><th><code>PRACTICE</code></th><th><code>SOURCE</code></th></tr>
<tr><td><code>ultrathink</code> is the recognised thinking-budget keyword today. The ladder (<code>think</code> &lt; <code>think hard</code> &lt; <code>think harder</code> &lt; <code>ultrathink</code>, more budget each step) is from the original best-practices post; only <code>ultrathink</code> parses as a keyword now. Separate from <code>ultracode</code> (= <code>xhigh</code> effort + dynamic workflows).</td><td>best-practices post · model-config docs</td></tr>
<tr><td>Explore → plan → code → commit. Read the relevant files <em>before</em> writing code; separating research and planning from coding "avoids solving the wrong problem."</td><td>best-practices</td></tr>
<tr><td>Press <code>#</code> to fold an instruction into CLAUDE.md, and after correcting Claude, ask it to update CLAUDE.md so it won't repeat the mistake. They also run CLAUDE.md through the prompt improver and add <code>IMPORTANT</code>/<code>YOU MUST</code>.</td><td>Boris Cherny / team</td></tr>
<tr><td>One Claude writes, a second (fresh context) reviews — unbiased toward code it just wrote. Run 3–5 sessions at once, one per task, most started in Plan mode (<code>Shift+Tab</code> twice).</td><td>Boris Cherny / team</td></tr>
<tr><td>Guardrails in hooks, not prompts. "Never edit <code>.env</code>" in CLAUDE.md is a request; a <code>PreToolUse</code> hook is enforcement. Keep CLAUDE.md under ~200 lines; move reference to skills or <code>.claude/rules/</code>.</td><td>best-practices / team</td></tr>
</table>

<sub><a href="https://code.claude.com/docs/en/best-practices">src: code.claude.com/docs/en/best-practices</a> (orig. <a href="https://anthropic.com/engineering/claude-code-best-practices">anthropic.com/engineering/claude-code-best-practices</a>) · <kbd>/features-overview</kbd></sub>

---

<h2 id="11-stale-advice"><samp>11 STALE ADVICE</samp></h2>

Renamed, removed, don't-use.

<table>
<tr><th><code>YOU'LL STILL SEE…</code></th><th><code>REALITY</code></th></tr>
<tr><td>the bare word <code>workflow</code> triggers a run</td><td>renamed <code>ultracode</code> (v2.1.160); the bare word no longer fires. Natural-language "run a workflow" works either way.</td></tr>
<tr><td><code>/output-style</code></td><td>removed v2.1.91; use <code>/config</code> → Output style, or set <code>"outputStyle"</code> in settings.</td></tr>
<tr><td><code>/vim</code></td><td>removed v2.1.92; <code>/config</code> → Editor mode.</td></tr>
<tr><td><code>/pr-comments</code> · <code>/extra-usage</code></td><td>gone (just ask to view PR comments) · renamed <code>/usage-credits</code>.</td></tr>
<tr><td><code>think</code> / <code>think hard</code> as keywords</td><td>only <code>ultrathink</code> is parsed now (the ladder lives in the original best-practices post).</td></tr>
<tr><td><code>TodoWrite</code></td><td>replaced by <code>TaskCreate</code>/<code>TaskGet</code>/<code>TaskList</code><sup>NEW</sup> <kbd><samp>v2.1.142+</samp></kbd>; <code>CLAUDE_CODE_ENABLE_TASKS=0</code> reverts.</td></tr>
<tr><td>the <code>/agents</code> wizard (Running tab + Library)</td><td>removed v2.1.198; create/manage subagents by asking Claude or editing <code>.claude/agents/</code>. <code>claude agents</code> (the CLI session list) is unrelated and still current.</td></tr>
<tr><td>Windsurf in <code>/ide</code></td><td>rebranded Devin Desktop.</td></tr>
</table>

---

<h2 id="12-easter-eggs"><samp>12 EASTER EGGS</samp></h2>

<table>
<tr><th><code>COMMAND</code></th><th><code>FUNCTION</code></th></tr>
<tr><td><code>/radio</code></td><td>lo-fi station</td></tr>
<tr><td><code>/stickers</code> · <code>/color [color]</code></td><td>stickers · recolour the UI</td></tr>
<tr><td><code>/heapdump</code></td><td>memory snapshot to <code>~/Desktop</code></td></tr>
<tr><td><code>/powerup</code></td><td>animated feature lessons</td></tr>
<tr><td><code>/insights</code></td><td>your own usage report</td></tr>
</table>

Record a demo GIF straight from a prompt with the Chrome integration.

---

<h2 id="13-the-wheel"><samp>13 THE WHEEL</samp></h2>

Where everything above sits on one working loop. Phases ⓪–⑥, then the
feedback arrow makes it a circle: what each lap teaches you becomes the next
lap's configuration.

<pre><code style="white-space: pre-wrap !important;">
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
</code></pre>


---


```
EVERY FLAG, FIELD, AND VERSION ABOVE: COPIED FROM A DOC, NOT RECALLED.
RE-CHECKED: 2026-07-13 · AGAINST: v2.1.207 · AUTHORITATIVE: docs changelog
ON DRIFT: FIX IT HERE, RE-PIN THE DATE.
```
