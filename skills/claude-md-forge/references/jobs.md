# Three jobs in depth

The dispatch table in SKILL.md picks the job from one signal. This page is the long form for each — when to enter it, the steps, the decision points, and a worked example.

## Bootstrap

When CLAUDE.md is absent or is just the bare `/init` stub. The user is starting fresh, or `/init` produced something generic that needs structure.

### Triggers

- "Set up CLAUDE.md for this project."
- "I just cloned this repo and want claude to be useful immediately."
- "`/init` gave me a list of facts; can you make it not generic?"
- "Bootstrap CLAUDE.md from this codebase."

### Steps

1. **Run `/init` first if no CLAUDE.md exists.** Don't reinvent the discovery work. Recommend `CLAUDE_CODE_NEW_INIT=1` to the user if they're up for the multi-phase interactive flow — it produces better starting material because it asks which artifacts (CLAUDE.md, skills, hooks) to set up and explores the codebase via a subagent before writing.

2. **Read what `/init` wrote (if it ran)** plus any sibling files: `package.json`, `pyproject.toml`, `README.md`, `tsconfig.json`, top-level directory listing, existing `AGENTS.md`, existing `.claude/rules/`. This is the substrate.

3. **Detect AGENTS.md.** Three cases:
   - **AGENTS.md exists, no CLAUDE.md or thin one:** treat AGENTS.md as the source of truth. Write CLAUDE.md as `@AGENTS.md` followed by a short Claude-only addendum (skills behavior, plan-mode preferences, anti-defaults specific to Claude Code).
   - **CLAUDE.md exists, no AGENTS.md, repo shared with Codex:** ask once whether to scaffold AGENTS.md as primary. If yes, move shared content there and leave CLAUDE.md as `@AGENTS.md` + addendum.
   - **CLAUDE.md exists, no AGENTS.md, Claude-only repo:** ignore AGENTS.md, just CLAUDE.md.

4. **Triage the substrate through the six surfaces.** For each candidate fact:
   - Is this path-scoped? → propose `.claude/rules/<name>.md` (defer to rule-forge for the rule design).
   - Is this an enforcement rule? → flag as a hook candidate; defer to hook-forge.
   - Is this an obvious-from-code fact? → cut.
   - Is this a procedure with steps? → flag as a skill candidate; defer to skill-forge. CLAUDE.md gets a pointer.
   - Is this a per-user preference? → `~/.claude/CLAUDE.md` or auto-memory, not the project's CLAUDE.md.
   - Otherwise: project-wide fact, CLAUDE.md.

5. **Write reason-first** for non-obvious entries. See the *Reason-first content shape* section in SKILL.md.

6. **Offer the Karpathy anti-default menu.** These are 2026-era LLM failure modes the user can opt-in to encode:
   - "Push back on wrong assumptions; don't run with them silently."
   - "Surface tradeoffs explicitly when they exist; don't pick silently."
   - "Three similar lines is better than a premature abstraction. Don't refactor a bug fix."
   - "Clean up dead code as you change adjacent code."
   - "If you can't test the UI in a browser, say so explicitly rather than claiming success."
   - "Don't add error handling for cases that can't happen."
   - "Treat rules here as user intent at time of writing — if current code contradicts a rule (a documented command that fails, a path that's gone, a convention the codebase has moved away from), flag before relying on it." (CLAUDE.md hygiene item — combats silent staleness without paying for a SessionStart hook.)
   Show the menu; let the user pick the ones that match their experience. Don't auto-include — boilerplate doesn't earn its tokens.

7. **Size check.** Aim under 200 lines. If you're already over, the bootstrap is doing too much — split path-scoped content to rules.

8. **Cross-link.** If you've spawned `.claude/rules/<name>.md` files, mention them once in CLAUDE.md ("framework conventions: `.claude/rules/api.md`"). Don't restate the rule's content.

### Worked example

User: "Set up CLAUDE.md for this Next.js + Supabase + shadcn project I just inherited. There's no CLAUDE.md, no AGENTS.md."

Steps in action:

1. Run `/init`. It produces a 60-line stub with build commands, a directory tree, and "Use TypeScript" / "We use Tailwind".
2. Read the substrate. `package.json` confirms Next.js 16, Supabase client, shadcn/Tailwind v4. There's a `tests/` directory, a `supabase/migrations/` directory, and a `src/api/` directory.
3. No AGENTS.md. Ask: "This repo doesn't have AGENTS.md. Will you also use Codex on it? (If yes, I'll scaffold AGENTS.md as primary; if no, just CLAUDE.md.)" User: "Just Claude."
4. Triage:
   - "We use TypeScript" → cut (`package.json` says so).
   - "Tests live in `tests/`" → keep, single line.
   - Build commands → keep.
   - "API endpoints under `src/api/` use cursor pagination, not offset" → propose `.claude/rules/api.md` (path-scoped, doesn't apply to UI work). Defer rule body to rule-forge.
   - "Migrations are append-only; never edit a committed migration" → propose `.claude/rules/migrations.md` (path-scoped to `supabase/migrations/**`). Rule-forge.
   - "shadcn (latest) on Tailwind v4" → keep in CLAUDE.md as a one-liner pointer to the existing personal-scope `shadcn-tailwind` rule.
   - "Lint before commit" → flag as hook candidate; defer to hook-forge.
5. Write reason-first for non-obvious entries (e.g., "We don't use server actions for form submission; React Query mutations only. **Why:** server actions don't support the optimistic-update flow we built.")
6. Offer Karpathy menu. User picks "push back on wrong assumptions" and "don't refactor in a bug fix."
7. Final CLAUDE.md is ~80 lines. Two new rules, one hook flagged for follow-up. Done.

### Edge case: monorepo bootstrap

In a monorepo, you'll usually have multiple CLAUDE.md candidates (root + per-package). The default is:
- **Root CLAUDE.md:** what every package needs (build orchestration, package list, cross-package conventions, shared lint config).
- **Per-package `packages/*/CLAUDE.md`:** package-specific facts that only matter when Claude is editing inside that package. These auto-load when nested CLAUDE.md is in scope.
- **Or `.claude/rules/<package>.md` with `paths: ["packages/<name>/**"]`:** if the per-package facts are short, a rule may be more appropriate than a nested CLAUDE.md. Rules are more visible in `/skills`-adjacent tooling and easier to grep.

Recommend `claudeMdExcludes` if there are ancestor CLAUDE.md files from other teams polluting context.

---

## Audit

When CLAUDE.md exists, the user wants a structural review, the file is over 200 lines, or feels generic/stale.

### Triggers

- "Audit my CLAUDE.md."
- "CLAUDE.md is too long."
- "My CLAUDE.md is outdated; can you fix it?"
- "Should we split this CLAUDE.md?"
- "Review CLAUDE.md."

### Steps

1. **Read everything in scope:**
   - All `CLAUDE.md` files (root + nested in subdirectories).
   - `CLAUDE.local.md` if present.
   - `AGENTS.md` if present.
   - `.claude/rules/*.md` (recursively).
   - Auto-memory `~/.claude/projects/<project>/memory/MEMORY.md` (the first 200 lines that load each session).
   - `.claude/settings.json` and `.claude/settings.local.json` if relevant (especially `claudeMdExcludes` and `autoMemoryEnabled`).

2. **Score per-line, not per-file.** For each entry, decide one of:
   - **Keep** — broadly applicable, reasoned, not duplicated.
   - **Move to rule** — path-scoped (which paths?).
   - **Move to skill** — procedural, multi-step, or large knowledge body.
   - **Move to hook** — enforcement, not interpretation.
   - **Move to settings** — configuration.
   - **Move to auto-memory / personal CLAUDE.md** — per-user, not team-shared.
   - **Delete** — already obvious from code, one-off, stale, restated elsewhere.
   - **Add Why** — non-obvious rule missing reason; ask user for the reason or infer from context.

3. **Output a triage table** before any edits. Two columns: the entry (or short paraphrase if long), the verdict. A third column for short justification. Get user approval to proceed.

4. **Apply the rewrite.**
   - Edit CLAUDE.md down to the *keep* and *add-Why* set.
   - For each *move to rule*: hand off to rule-forge to design the rule, then write the file. Add a one-line pointer in CLAUDE.md if the rule isn't auto-discoverable enough on its own.
   - For each *move to skill / hook*: open a follow-up note (or a new task) for the user; don't try to design these mid-audit. Add pointers in CLAUDE.md when the skill/hook ships.
   - For each *delete*: just remove.
   - For each *move to auto-memory*: ask user to confirm; if yes, add to the auto-memory directory's relevant file (or just delete and let auto-memory pick it up next time the user re-explains).

5. **Re-check size and reasoning.** Final CLAUDE.md under 200 lines (or the user has accepted bigger, which is sometimes valid). Every non-obvious rule has a Why or has been explicitly tagged as obvious-enough-to-skip-Why.

6. **Update AGENTS.md if relevant.** If the audit produced a clean separation of "Claude-only" content from "shared with Codex" content, this is the moment to introduce the `@AGENTS.md` import pattern (or update an existing one).

7. **Cross-link.** If new rules were created, the rule files need to be linked from CLAUDE.md only when the rule's `paths:` aren't enough on their own (most aren't — rules auto-load when paths match, so a CLAUDE.md pointer is redundant unless the user wants a discoverability surface).

### Worked example

User: "My CLAUDE.md is 320 lines, half of it is API conventions, and Claude keeps re-suggesting patterns we explicitly don't use."

Steps in action:

1. Read CLAUDE.md (320 lines), `.claude/rules/` (empty), `MEMORY.md` (notices `feedback_api_pagination.md` says "user prefers cursor pagination — corrected three times").
2. Score:
   - 80 lines on API conventions → move all to `.claude/rules/api.md` with `paths: ["src/api/**/*.ts"]`. Hand off to rule-forge.
   - 30 lines of "we use TypeScript", "the frontend is React", etc. → delete (obvious from code).
   - 12 lines on a deploy procedure → move to a skill candidate (`/deploy`); don't design here, flag for skill-forge.
   - "ALWAYS run typecheck before commit" → move to a `PreToolUse` hook (or a CI check); flag for hook-forge.
   - "Cursor pagination, not offset" already in CLAUDE.md but missing Why; auto-memory's `feedback_api_pagination.md` has the why. Promote: write into the new `.claude/rules/api.md` reason-first. The auto-memory entry can stay as a personal record.
   - The remaining 80 lines (build commands, directory map, anti-defaults) → keep, mostly already reasoned.
3. Output triage table; user approves.
4. Apply: write `.claude/rules/api.md` (rule-forge designs it), trim CLAUDE.md to ~90 lines, flag two follow-ups.
5. Final size: 88 lines. Every non-obvious rule has a Why.

### Edge case: monorepo audit

Read all CLAUDE.md files in the worktree (root + nested). Three patterns to look for:
- **Duplication across packages:** content that's restated in 4 of 6 packages should move to root CLAUDE.md.
- **Ancestor pollution:** when working in `packages/api/`, the parent monorepo's CLAUDE.md may include irrelevant facts. Recommend `claudeMdExcludes` in `.claude/settings.local.json` for the user-specific case, or refactor the root CLAUDE.md to not include those facts in the first place.
- **`AGENTS.md` mismatch:** if some packages have AGENTS.md and others don't, that's organizational inconsistency. Surface it; let the user decide.

---

## Tune

When the recent session surfaced something useful and the user wants to encode it. Distinct from auto-memory (which captures Claude's own learnings unattended) — tune is the *user-driven, surface-aware promotion moment*.

### Triggers

- "We discovered X this session; should that go in CLAUDE.md?"
- "Add this to CLAUDE.md."
- "Promote this to project memory."
- "Update CLAUDE.md from this session."

### Steps

1. **Identify the candidate.** Usually the user names it directly. If they don't, scan the recent conversation for: corrections you made multiple times, settings/commands they had to teach you, debugging discoveries that took multiple turns to find, conventions that emerged in the diff but aren't documented.

2. **Pre-cull.** Skip:
   - One-off fixes that won't recur.
   - Things obvious from the code now that the change has shipped.
   - Things already captured in auto-memory and not yet stable across sessions.
   - Things that duplicate an existing CLAUDE.md entry or rule.
   - Per-machine / per-user preferences (those go in `~/.claude/CLAUDE.md`, `CLAUDE.local.md`, or auto-memory).

3. **Triage through the six surfaces.** For each candidate that survives the cull:
   - Path-scoped? → `.claude/rules/<name>.md`. Defer to rule-forge.
   - Enforcement? → hook. Defer to hook-forge.
   - Procedure? → skill. Defer to skill-forge.
   - Per-user preference? → `~/.claude/CLAUDE.md` or auto-memory.
   - Project-wide, broadly applicable, every-session-relevant? → CLAUDE.md.

4. **Write the entry reason-first.** Show the diff. Get explicit approval before applying.

5. **Redirect if not CLAUDE.md.** "This is path-scoped to `tests/integration/`; want to add it to `.claude/rules/integration-tests.md` instead?" Don't sneak path-scoped content into CLAUDE.md just because the user said "add to CLAUDE.md" — the user often doesn't know the rules surface exists.

6. **Re-check size.** After adding, is CLAUDE.md still under 200 lines? If not, propose splitting *something* (often the new entry can stay; an older bloated section can move).

### Worked example

User: "We just discovered that the test runner needs `--runInBand` for the integration suite to pass. Should that go in CLAUDE.md?"

Steps in action:

1. Candidate identified.
2. Pre-cull: not a one-off (will recur every test run), not obvious from the code (the failure mode is non-obvious without the discovery), not already captured.
3. Triage: path-scoped to `tests/integration/**`. Not all-tests, so not project-wide.
4. Redirect: "This is integration-test-specific; not all tests need `--runInBand`. I'd put this in `.claude/rules/integration-tests.md` with `paths: [\"tests/integration/**\"]` rather than CLAUDE.md. Want me to set that up?"
5. User confirms; defer to rule-forge for the rule design. The skill returns the user to rule-forge with the candidate.

### When the existing `/revise-claude-md` is enough

If the user wants to dump a session's learnings into CLAUDE.md without the surface triage — for instance, they're happy with everything going into CLAUDE.md and trust the size to stay reasonable — `/revise-claude-md` is lighter weight. The forge's tune job exists for the cases where the triage matters: ambiguous scope, possible hook content, possible duplication with auto-memory.
