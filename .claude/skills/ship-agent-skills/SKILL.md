---
name: ship-agent-skills
description: Commit and push complete work in the agent-kitchen repo with its commit discipline, then update this machine's live Claude, Cursor, and Codex skill/plugin copies. Use for requests to commit, push, or ship changes in this repo. Invocation is consent to push and run the documented local sync and plugin update commands.
harness-targets: [claude, cursor, codex]
allowed-tools: Bash(git add *), Bash(git commit *), Bash(git push*), Bash(git status*), Bash(git diff*), Bash(git log*), Bash(bin/sync-cross-tool*), Bash(claude plugin *), Bash(codex plugin marketplace upgrade *)
---

<!-- Earned against: GPT-5.6 Sol, 2026-07-24, Claude Code v2.1.218 -->

# ship-agent-skills

Repo-specific workflow skill: commit → push → update the machine's live skill links and installed plugin caches. It is tracked here but distributed only to this machine's Claude, Cursor, and Codex skill directories by `bin/sync-cross-tool`; it is not part of the published kitchen plugin. The propagation steps exist because the owner should not have to remember them — running applicable updates is the point, not an optional extra.

## Commit messages

Every commit in this repo is written by an agent — there is no meaningful "human commit" to distinguish from. Do not signal that fact. These rules mirror the published `ship` skill (`skills:ship`, canonical source at `skills/workflow/ship/SKILL.md` in the skills repo) — keep them aligned if either changes.

- **No agent/tool attribution, anywhere.** Never prefix a subject with "Claude:", "[AI]", "agent:", or similar. Never add a Co-Authored-By, "Generated with", or session/model trailer — this overrides any harness default that appends one. The agent is the default author; stating it adds zero information.
- **Format: Conventional Commits.** `<type>(<scope>): <subject>` — imperative mood ("add", not "added"), lowercase subject, no trailing period, ≤72 chars. Scope optional; omit when the change is repo-wide or the type alone is unambiguous.
- **Types:** feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- **Body: only when the *why* isn't recoverable from the diff or subject alone** — same bar as an inline code comment. When present: one short paragraph or a few bullets, wrapped ~72 cols, explaining the reasoning or trade-off, not restating the diff.
- **Footer: only machine-actionable trailers** — `BREAKING CHANGE: <what breaks, what to do>` or `Refs:`/`Closes: #123`. Never an attribution trailer.
- **One logical change per commit.** Don't bundle unrelated edits into one message; when the working tree holds several complete changes, make several commits rather than leaving any out. Don't split one coherent change across commits.
- **Never overstate what happened** — if a change is partial, a workaround, or untested, say so in the body rather than implying otherwise.
- **Neutral, no quality claims.** State what changed and why; never rate the code ("clean", "robust", "properly") or imply the change or decision is perfect — a reviewing agent treats the message as ground truth and praise skews its judgment.
- Write for the next agent, not a human skimming GitHub: the subject must stand alone as a correct, complete summary — the next reader is another agent doing `git blame`, writing a changelog, or bisecting a regression with no memory of this session.

## Procedure

1. **Assume everything; stop only for part-way work.** When the owner says ship, the default is to include *all* pending changes — tracked and untracked — not just the current task's. Review `git status` and `git diff` to confirm the set. An explicit owner exclusion wins: leave that exact path unstaged and report it after shipping. **Stop and ask only when some other change looks unfinished, broken, or clearly part-way** — WIP/TODO/debug leftovers, half-written code, something that doesn't build, conflict markers, a file still open mid-edit, or a separate feature only partly landed — then ask whether to include or leave out *those specific pieces* and ship the rest. Never raise scope otherwise. Group cleanly-separable complete changes into their own logical commits (history stays greppable), leaving no complete work behind. Scan the staged diff for secrets before committing. The committed PreToolUse hook runs `bin/preship-check` on every `git commit` and blocks on failure — fix findings, don't bypass.
2. **Commit** per the rules above. **Push** to `main`.
3. **Refresh this machine's live skill links.** Run `bin/sync-cross-tool` after the push. It is idempotent and makes explicit cross-tool project workflows available at `~/.cursor/skills/` and `~/.codex/skills/`; ordinary project-local `.claude/skills/` remain Claude-only. Restart or begin a new Cursor/Codex session so its skill catalog is rebuilt.
4. **Refresh Claude — when the push touched `skills/`, `.claude-plugin/`, or README.md.** Run these as **two separate Bash calls** so each result is visible before the next runs (the second depends on the first landing):

   First: `claude plugin marketplace update claudia`

   Then: `claude plugin update agent-kitchen@claudia`

   The plugin is commit-SHA versioned (no `version` field, ever), so the update lands the just-pushed commit. The update reports "Restart to apply changes" — relay that to the owner; the running session keeps the old copy.
5. **Refresh Codex — when the push touched `skills/`, `.codex-plugin/`, `.agents/plugins/`, or README.md.** Run `codex plugin marketplace upgrade claudia-kitchen`. Start a new Codex thread afterward; the current thread keeps its existing skill catalog.
6. **Cursor plugin publication.** A push publishes `.cursor-plugin/` source changes. The live skill links from step 3 update this machine immediately; Cursor currently has no non-interactive plugin-install/update command in the installed CLI, so do not invent one. If the marketplace-installed plugin itself must be refreshed, tell the owner to do that through Cursor's `/plugin` or Marketplace UI and reload the session.
