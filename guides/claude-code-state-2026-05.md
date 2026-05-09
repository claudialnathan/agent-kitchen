# The state of the Claude Code harness — May 2026

A snapshot of what's true about Claude Code right now, written for future sessions in this repo. Not a tutorial — a notebook of observations from reading the docs end-to-end and the last five weeks of release notes (v2.1.83 through v2.1.119), filtered to what actually changes how you build skills and harness behavior.

If you've been away for a few months, read this first; the surface has shifted faster than the mental models.

## The six surfaces, and how they coexist

There are six places to put behavior, and they don't substitute for each other:

1. **CLAUDE.md** — facts loaded every session, in full, always-on.
2. **`.claude/rules/*.md`** with `paths:` — facts scoped to file globs; loaded when matching files are opened.
3. **Skills** (`.claude/skills/<name>/SKILL.md`) — knowledge or workflows; description always loaded, body when invoked.
4. **Subagents** (`.claude/agents/<name>.md`) — isolated context for side tasks.
5. **Hooks** (settings.json or skill frontmatter) — deterministic actions on lifecycle events.
6. **MCP servers** — connections to external systems.

**Plugins** are the packaging layer for everything except CLAUDE.md and rules.

The key shift from earlier in 2025: **custom slash commands have been merged into skills**. A file at `.claude/commands/foo.md` and a skill at `.claude/skills/foo/SKILL.md` both create `/foo`. Skills are the canonical surface; commands files keep working but aren't the recommended path.

> Cross-reference: FLUE (`flueframework.com`) frames the agent stack as four layers — Model / Harness / Sandbox / Filesystem. This guide uses the six-surface taxonomy above instead because it's scoped to authoring inside Claude Code (the surfaces *are* what you author against); FLUE's framing is more useful when designing runtime-deployed autonomous agents.

## The cost model nobody tells you about up front

Every visible skill consumes description budget *every turn*. Once invoked, the skill body lives in conversation context for the rest of the session. This is the most-misunderstood thing about skills.

Hard numbers:

- **Per-skill description cap**: 1,536 characters (`description` + `when_to_use` combined).
- **Total skill listing budget**: scales at 1% of context window, fallback 8,000 chars; `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var raises it.
- **Compaction budget**: most recent invocation of each skill re-attached, **first 5,000 tokens kept**, **shared 25,000-token cap** across re-attached skills, filled most-recent-first.
- **CLAUDE.md sweet spot**: under 200 lines per file; over 500 lines causes Claude to ignore parts.
- **MEMORY.md (auto-memory)**: first 200 lines or 25KB loaded at session start.

Practical consequences for a skill builder:
- Visible skills you don't auto-want should be `disable-model-invocation: true` (zero description cost, still user-invocable).
- Knowledge skills with broad applicability should be path-scoped (`paths:` glob) so they don't load when out of scope.
- Reference docs > 150 lines belong in sibling files, not inline.

## What's distinctive about May 2026 (vs. last quarter)

Features that changed how skills get built, in rough order of impact:

### Custom commands merged into skills (continuing from earlier)
- `.claude/commands/foo.md` and `.claude/skills/foo/SKILL.md` both create `/foo`.
- Skills add: optional sibling files, frontmatter for invocation control, auto-load by Claude when relevant.
- Skill takes precedence if both exist with the same name.

### Auto mode (research preview, w13)
- Permission-mode `auto`: a classifier reviews tool calls, blocks risky ones, lets routine work proceed without prompts.
- Available as `--permission-mode auto` or via `/permissions`.
- New hook: `PermissionDenied` fires on classifier denials; `retry: true` lets the model try a different approach.
- Available for Max subscribers on Opus 4.7 without the `--enable-auto-mode` flag.

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

### `/ultrareview` and `/ultraplan` (w15-w17)
- Multi-agent cloud-based code review and planning.
- `/ultrareview` runs parallel reviewers + adversarial critique; returns verified findings.
- `/ultraplan` drafts a plan in a cloud session; review in browser; execute remotely or pull back to CLI.

### Opus 4.7 + xhigh effort (w16)
- New default on Max and Team Premium.
- Five effort levels on 4.7: `low`, `medium`, `high`, `xhigh` (recommended default for most coding/agentic work), `max`.
- Adaptive reasoning is always on for 4.7 (no fixed-budget mode).
- `/effort` opens an interactive slider when called without args.
- 1M context window included for Max/Team/Enterprise on Opus.

### Hooks gained `mcp_tool` type (w17)
- Hook handler can call an already-connected MCP server tool directly, no subprocess.
- Useful for validation that needs to check external state.

### Plugin executables on PATH (w14)
- `bin/` at plugin root: executables there are added to Bash tool's PATH while plugin is enabled.
- Bare commands work without absolute paths.

### `disableSkillShellExecution` setting (w14)
- Blocks `!`<cmd>`` injection in non-bundled, non-managed skills.
- Useful in managed environments to prevent untrusted skills running shell on load.

### Other small but useful

- **Custom themes** (`/theme`, ~/.claude/themes/, plugin themes; w17).
- **`/team-onboarding`** — generates a teammate ramp-up guide from your usage history (w15).
- **`/loop` self-paces** when no interval is given (w15); `/proactive` is an alias.
- **`/btw <question>`** — side question without polluting conversation context.
- **`/fewer-permission-prompts`** — scans transcripts for common allowable Bash/MCP calls, builds an allowlist (w16).
- **Native binaries** replacing JavaScript on macOS/Linux (w16, v2.1.113); same install command.
- **`PreCompact` hooks can block compaction** (exit 2 or `decision: "block"`) (w16).
- **`UserPromptSubmit` hooks can set session title** via `hookSpecificOutput.sessionTitle` (w15).
- **`defer` permission decision** in `PreToolUse` hooks — `-p` sessions pause at the tool call and exit with `deferred_tool_use` payload, resumable with `--resume` (w14).
- **Vim visual mode** (v/V) in the prompt input (w17).
- **Computer use** in CLI (research preview) — Claude can drive native apps and verify changes via GUI (w14).

## Skill design principles I converged on this session

Sharp summaries; full reasoning in `.claude/skills/skill-forge/references/`.

- **Triage before templating.** Most "skill" requests should be a hook, MCP, CLAUDE.md entry, or path-scoped rule. The 2026 features-overview page makes this explicit; reach for skills only when the other surfaces don't fit.
- **Pick a skill kind before drafting.** Workflow / knowledge / guarded-action / forked-research / path-scoped-knowledge each want different bodies and frontmatter.
- **Name the move: additive or transformative.** Within any kind, ask what attention the skill frees up and what it redirects toward. A skill that lists steps is additive (saves typing); a skill that elevates the substantive question (*should we ship?* not *how do we ship?*) is transformative (changes what's foreground). Both are valid; transformative skills carry their recurring context cost better because what's recurring is reframing, not facts.
- **Description is the trigger; body is the standing instruction.** Vague descriptions silently under-trigger. Procedural bodies (one-time steps) waste recurring tokens. Write the description for the user's natural phrasing; write the body as standing instructions that apply across the whole task.
- **Skills don't trigger on simple prompts.** Claude only consults skills when it can't easily handle the task itself. A "/read-pdf" skill never triggers on "show me this PDF" no matter how good the description.
- **Hooks for guarantees, skills for guidance.** "Never edit .env" is a hook. "When editing .env, prefer adding new keys to changing existing ones" is a skill.
- **`context: fork` for any skill whose job is to investigate and summarize.** The verbose work stays in the subagent.
- **Bundle scripts when the work is deterministic.** Scripts are free in context; bodies are recurring cost.
- **Pre-approve narrowly.** `allowed-tools: Bash` defeats the safety; `allowed-tools: Bash(git commit *)` does the actual work.

## Constraints worth designing around

- **Skills are write-once-run-forever artifacts**. Without maintenance, they drift. Treat skills like code; review them when infrastructure changes.
- **Description budget pressure is real once you have ~10+ skills**. Use `skillOverrides` in settings to set low-priority skills to `name-only`. Use `disable-model-invocation: true` for workflows.
- **Compaction can drop skills** if you've invoked many. Re-invoke load-bearing ones after `/compact` triggers.
- **Skills don't re-read** after invocation. Edits to SKILL.md don't show up in the same session unless you re-invoke.
- **Personal scope (`~/.claude/skills/`) overrides project scope (`.claude/skills/`)** for same-named skills. Plugin namespacing avoids this; renaming or `skillOverrides: "off"` are the workarounds.
- **`.claude/skills/` *is* loaded from `--add-dir` directories** (exception to general `--add-dir` rules). Other config (`.claude/agents/`, `.claude/rules/`) is not.

## Notable bundled skills/commands (don't reinvent)

These exist in stock Claude Code; building parallel skills competes for description budget:

- **`/simplify`** (skill) — three-agent parallel review of recently changed code; aggregates findings; applies fixes.
- **`/batch <instruction>`** (skill) — decomposes large changes into 5–30 units; spawns one background agent per unit in isolated worktrees; opens PRs.
- **`/debug`** (skill) — captures debug logs from current point forward; analyzes issues.
- **`/loop`** (skill) — recurring or self-paced prompt execution.
- **`/claude-api`** (skill) — Claude API reference + migration helper for Anthropic SDK code.
- **`/fewer-permission-prompts`** (skill) — transcript-driven allowlist generator.
- **`/init`** — generates starter CLAUDE.md from codebase analysis. `CLAUDE_CODE_NEW_INIT=1` enables interactive multi-phase flow that also walks through skills, hooks, memory.
- **`/skills`** — list/manage skills with the cycling visibility states.
- **`/agents`** — manage subagents (Running tab + Library).
- **`/team-onboarding`** — package your local Claude Code setup as a teammate ramp-up guide.
- **`/recap`** — one-line session summary on demand.
- **`/usage`** (= `/cost` = `/stats`) — usage breakdown showing what's driving limits.
- **`/btw`** — side question without polluting context.
- **`/fork`** / **`/branch`** — branch the conversation (or spawn a forked subagent if `CLAUDE_CODE_FORK_SUBAGENT=1`).
- **`/rewind`** (= `/checkpoint` = `/undo`) — restore prior conversation/code state.

The full list is at `https://code.claude.com/docs/en/commands` — worth re-checking on each visit.

## URLs to keep handy

- `https://code.claude.com/docs/llms.txt` — full URL index of all docs (stable entry point).
- `https://code.claude.com/docs/en/skills` — the canonical reference; check for new frontmatter fields.
- `https://code.claude.com/docs/en/sub-agents` — subagent spec, fork mode, agent teams interaction.
- `https://code.claude.com/docs/en/hooks` — every event, every matcher, every input field.
- `https://code.claude.com/docs/en/features-overview` — the meta-mental-model, including "build your setup over time" and the surface comparison tabs.
- `https://code.claude.com/docs/en/whats-new/index` — weekly digests; w13 onward.
- `https://code.claude.com/docs/en/changelog` — full per-version changes.
- `https://code.claude.com/docs/en/commands` — bundled commands and bundled skills list.

## Open questions worth verifying on next visit

Things that were research previews or in flux as of v2.1.119:

- **Forked subagents** are still gated behind `CLAUDE_CODE_FORK_SUBAGENT=1` and require v2.1.117+. Likely to become default eventually.
- **Auto mode** is in research preview. Default thresholds and classifier behavior may change.
- **Agent teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) are experimental. Listed limitations include no in-process teammate session resumption, lagging task status, no nested teams.
- **Computer use** in CLI is research preview. Expect rough edges.
- **Routines** are web-only at the moment; CLI integration is via `/schedule`.
- **`/ultrareview`** and **`/ultraplan`** are research previews; pricing and free-tier inclusion may change.
- **The native binary migration** (w16) means npm now pulls platform-specific binaries via optional deps. Could affect CI installs in unusual environments.
