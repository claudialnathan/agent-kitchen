# Harness cookbook — trajectory and option space (2026-05-08)

Snapshot of where this repo could go, written after a research pass on `agent-harness-construction` (skills.sh / affaan-m), FLUE (Fred Schott / withastro), and the fortnight 2026-04-24 → 2026-05-08 in agentic-AI tooling. Companion to `claude-code-state-2026-05.md` and `skill-forge-design-notes.md`. Private design notes; not loaded into context.

## Why this exists

The agentic-AI / coding-harness space went through a busy fortnight. Two specific external comparators: affaan-m's `everything-claude-code` (ECC: 188 skills, 48 agents, 14 MCP servers, dashboard, AgentShield) and Fred Schott's FLUE framework (TypeScript "headless Claude Code," sandbox-tiered, markdown-first logic). The wider window also delivered: SKILL.md became a cross-tool open standard read natively by Claude Code / Codex / Cursor / Gemini CLI / Junie / Kiro / Goose / GitHub Copilot; Cursor 3.0 (2026-04-02) made worktree-based parallel agents table-stakes; the skill description cap rose to 1,536 chars with a 1%-of-context discovery budget and "truncation cuts the back" semantics; plugin tooling matured (`alwaysLoad` MCP, `claude plugin prune`, Monitor tool, auto-pacing `/loop`, per-marketplace auto-update toggle, dep auto-resolve, post-compaction backup-path in statusline, PostToolUse `updatedToolOutput` for all tools, `CLAUDE_CODE_FORK_SUBAGENT` in non-interactive mode); `obra/superpowers` (94k stars, 2026-01-15 marketplace launch) crystallized "meta-skills" as a category around TDD-first / plan-driven / subagent-dispatched idioms; four-quadrant memory (working / episodic / semantic / personal) became canonical; and Anthropic's 2026-04-04 policy shift cut Pro/Max users off from third-party agent frameworks.

This repo is deliberately minimal: 3 meta-forges (skill-forge, hook-forge, rule-forge), 2 applied skills (cache-aware-testing, shadcn-tailwind), cross-tool sync via symlinks, marketplace plugin shape (`claudia` v0.1.0). The intent is room to grow toward more meta-forges and more applied skills, **iteratively** — each addition driven by an actual session, not pre-built. Not ECC scale. Not a public template. This doc is the option-space assessment + recommended trajectory + inventory of candidate moves to grab from over time.

## Where the repo stands today

- `skills/skill-forge/` — designs other skills. 5-step methodology, 6-kind taxonomy, additive-vs-transformative as the central concept. Bundled `references/`.
- `skills/hook-forge/` — designs hooks. 5 events, 4 handler types, exit-code semantics.
- `skills/rule-forge/` — designs path-scoped rules.
- `skills/cache-aware-testing/` — applied skill (Next.js 16 + Cache Components + Supabase + shadcn + Vitest + Playwright).
- `skills/shadcn-tailwind/` — applied skill (shadcn 4.x on Base UI + Tailwind v4 discipline; auto-loads on UI files via `paths:`).
- `.claude-plugin/{marketplace,plugin}.json` — plugin manifests.
- `bin/sync-cross-tool` — idempotent two-pass symlink syncer to `~/.cursor/skills/` and `~/.codex/skills/`, respecting `harness-targets:` frontmatter, supports `--dry-run`.
- `guides/{README_skillforge,claude-code-state-2026-05,skill-forge-design-notes}.md` — public tour, May 2026 snapshot, private design notes.
- `.claude/{commands,hooks,agents}/` — empty, populated as needed.
- `NOTES.md` — scratch list (currently: `skill improver`).

## Option space

### A — Stay focused on forges (status quo)
Sharpen the 3 forges; add nothing structurally new.
- **Cost**: ~zero. Pure maintenance against shifting harness affordances.
- **Yields**: tight, defensible identity; no scope drift.
- **Precludes**: nothing on principle, but the cookbook doesn't grow around new surfaces (memory, subagents, parallelism) the fortnight surfaced.

### B — Branch into more meta-tools
Apply the forge pattern to harness surfaces that have crystallized: `memory-forge`, `subagent-forge`, possibly `mcp-forge` or `plugin-forge`. (See also: `NOTES.md`'s "skill improver" — likely already covered by skill-forge's "review existing skill" mode, but worth re-triaging when a session surfaces it.)
- **Cost**: each new forge is a real design effort. Each needs a triage gap, a worked example, and anti-patterns drawn from real use.
- **Yields**: composable meta-tools that produce more artifacts than they cost. Aligned with CLAUDE.md's "forges sharpen with use" loop.
- **Precludes**: nothing structural; meta-tools compose with everything else.

### C — Grow the applied-skills layer
Stack-specific discipline skills added as real projects demand: data layer, observability, deploy patterns, LLM SDK ergonomics, etc.
- **Cost**: each applied skill needs a real testing context. Speculative skills decay fast.
- **Yields**: the cookbook becomes the working environment, not just the forges. Real artifacts feed the forges.
- **Precludes**: drift toward ECC scale if unchecked. Mitigation: governance gate that requires a session to have triggered the addition, not a checklist to fill.

### D — Reposition as Personal AI OS template
Public README tour, opinionated CLAUDE.md, pre-approved permissions, statusline, hooks. Installable starter.
- **Cost**: high. Public framing implies maintenance commitment, issue triage, breaking-change discipline.
- **Yields**: community traction; possible upstream contribution.
- **Precludes**: the workshop nature.
- **Status**: explicitly off the table.

## Recommended trajectory: B + C, evidence-driven, paced iteratively

Stay in the workshop framing. Treat both new meta-forges and new applied skills as **evidence-driven additions** — add when an actual session triggers the need, not pre-emptively. Two governance gates before adding either:

1. **Triage gap is real.** For a meta-forge: is there a class of artifact you keep designing that the existing forges don't triage? For an applied skill: is there discipline you keep retyping in a stack?
2. **First worked example is in hand.** Never ship an empty forge or a stack-tagged skill without one concrete example you've already built.

The 3-forge spine stays indefinitely; the additive-vs-transformative distinction stays the central concept. Cross-tool sync via symlinks stays as-is — `harness-targets` frontmatter's purpose has shifted from "control symlink behavior" to "document author intent" since SKILL.md is now native cross-tool. Each artifact session ends with: did this reveal a forge gap?

## Candidate moves (inventory to grab from, not a backlog to drain)

### Tier 1 — Universal quick wins (cheap; no triggering session needed; verify before changing)

1. **Audit skill-forge against the new discovery-budget rules and update gaps.**
   - Files: `skills/skill-forge/SKILL.md` + `references/triggering.md` + `references/frontmatter.md`.
   - Verify: does skill-forge already say (a) 1,536-char combined `description` + `when_to_use` cap, (b) 1%-of-context discovery budget with 8,000-char fallback, (c) front-load triggers in sentence one, (d) truncation cuts the back? Update only the gaps.

2. **Lift ECC's observation contract into skill-forge as a convention.**
   - File: `skills/skill-forge/references/patterns.md` (or wherever conventions live).
   - Pattern: skills that wrap a procedure and return to a caller emit `status / summary / next_actions / artifacts`. Use case: composition.

3. **Refresh `guides/claude-code-state-2026-05.md` for the fortnight's plugin/hook additions.**
   - Add: `alwaysLoad` MCP, `claude plugin prune`, Monitor tool, auto-pacing `/loop`, marketplace auto-update toggle, post-compaction backup-path in statusline, PostToolUse `updatedToolOutput` for all tools, `CLAUDE_CODE_FORK_SUBAGENT` in non-interactive mode, dep auto-resolve, `disable-model-invocation: true` skills working via `/skill`.

4. **Update CLAUDE.md note on `harness-targets:` defaults.**
   - File: `CLAUDE.md`.
   - Note: SKILL.md is now native in Codex / Cursor / Gemini / Junie / Kiro / Goose / Copilot. Default-absent (all-tool reach) is the right default. Tag `[claude]` only when the surface is Claude-specific (statusline, output styles, agent SDK, fork-subagent envvars).

### Tier 2 — Meta-forge candidates (B; add when a session triggers the need)

5. **`memory-forge`** — designs entries against the four-quadrant memory model (working / episodic / semantic / personal). Triage: should this go in CLAUDE.md / a path-scoped rule / auto-memory / a project-shared MEMORY.md? Trigger: a session where there's a real memory-design moment beyond "save this fact." First worked example in hand before SKILL.md.

6. **`subagent-forge` or `worktree-pattern` skill** — design subagent dispatch and worktree-parallel workflows. Cursor 3.0 made worktree primitives mainstream; Claude Code's `CLAUDE_CODE_FORK_SUBAGENT` works in non-interactive mode now. Triage in-session: meta-forge (designs subagent specs / worktree patterns) vs. applied skill (one specific concrete pattern).

7. **`plugin-forge` or `mcp-forge`** — only if shipping plugins / MCP servers regularly. A single plugin maintained doesn't justify a forge. Lower priority than 5 and 6.

### Tier 3 — Hooks the cookbook itself wants

8. **`loader-trigger-guard` pre-commit hook.** Greps for the two byte sequences from CLAUDE.md (triple-backtick + bang; bang + backtick) across `skills/`. Already named as a future hook in CLAUDE.md. Designed via hook-forge → exercises hook-forge's pre-commit kind.

9. **`pre-ship validation` hook or slash command.** Front-runs the existing CLAUDE.md "Validation before shipping a skill" checklist (frontmatter parses, 1,536-char budget, `paths:` globs match real files, body terse, loader greps clean, references referenced).

### Tier 4 — Applied skills (C; only when the working stack needs them)

10. **Stack-specific skills as real projects demand**: drizzle-zod patterns, Server Actions discipline, observability/Honeycomb, Claude API / Anthropic SDK ergonomics, Tailwind v4 design-token discovery (could fold into shadcn-tailwind rather than spawning a new skill). Same governance gate: real session triggered it, worked example in hand.

### Tier 5 — Vocabulary borrows (background drip into existing skills/guides)

11. **FLUE's four-layer model** (Model / Harness / Sandbox / Filesystem) — useful framing in `guides/claude-code-state-2026-05.md` and as a triage axis in skill-forge (where does this artifact live in the stack?).
12. **FLUE's `task()` vs `skill()` vs `session()` distinction** — `task` as one-shot child distinct from `skill` (reusable workflow) and `session` (stateful conversation). Worth naming in skill-forge to disambiguate.
13. **`obra/superpowers` idioms** — TDD-first, plan-driven, subagent-dispatched. Name as skill kinds or examples in skill-forge where relevant; differentiation is real (this repo is meta + minimal vs. superpowers' fourteen specific opinionated workflows).

## What to explicitly avoid

- **ECC-scale catalogues.** 188 skills + dashboard + AgentShield is a different identity. The cookbook's leverage is meta-tools + minimal-applied; replicating ECC's surface area would erase the differentiation.
- **Speculative artifacts.** No forge or applied skill ships without a real session driving it. Forges sharpen with use; un-used forges stagnate.
- **Public-template repositioning** (option D).
- **Replicating `obra/superpowers`.** Same category, different shape — borrow vocabulary, don't copy surface area.
- **Heavyweight infrastructure.** No CI dashboard, no test orchestration, no plugin telemetry. Grep-level pre-ship validation is correct for this scale.
- **Backwards-compat hacks for harness updates.** Each forge update is a clean rewrite, not a "supports both" branch.

## Critical files when iterating

- `CLAUDE.md` — keep under ~200 lines; only repo-wide facts.
- `skills/skill-forge/SKILL.md` + `references/*.md` — the spine; most iteration lives here.
- `skills/hook-forge/SKILL.md` + `references/*.md` — second-most active.
- `skills/rule-forge/SKILL.md` — rare iteration; rules are simple by design.
- `bin/sync-cross-tool` — touch only when frontmatter targeting semantics change.
- `guides/claude-code-state-2026-05.md` — refresh when affordances move; rename/replace when the gap is wide enough that the snapshot becomes misleading.
- `guides/README_skillforge.md` — update when the forge family changes shape.

## Existing utilities to reuse, not duplicate

- **CLAUDE.md "Validation before shipping a skill" checklist** — the canonical pre-ship gate. Codify as the move-9 hook rather than re-implementing in script form.
- **CLAUDE.md "New artifacts are feedback for the forges" loop** — invoke after every artifact session.
- **`bin/sync-cross-tool`** — already idempotent and dry-run-capable. Don't re-implement.
- **`harness-targets:` frontmatter convention** — keep; its meaning has shifted from mechanics to intent, but the field stays.
- **CLAUDE.md loader-trigger greps** — the canonical pre-ship byte-sequence checks. Encapsulate as the move-8 hook.

## Verification (how progress shows up)

- Each iteration produces a concrete artifact (skill, hook, rule, or guide update).
- Each iteration also produces a forge update (per the CLAUDE.md feedback loop).
- CLAUDE.md stays under ~200 lines.
- Both pre-ship loader-trigger greps return nothing.
- `bin/sync-cross-tool --dry-run` is clean after each cross-tool change.
- `find . -path '<paths-glob>'` returns matches for any skill that uses `paths:`.
- Revisited when major harness updates land — fortnight cadence in this window suggests at least quarterly check-ins on this assessment.

## How this gets executed

Iteratively, in collaboration. Each session: bring a need; triage to a surface; if the answer is "a new forge" or "a new applied skill" and the governance gates are met, design it through the existing forges; ship the artifact; sharpen the forge that produced it. The candidate-moves list above is an inventory to grab from when context arises, not a backlog to drain. Tier 1 quick wins are the only items that don't require a triggering session — those can be picked up any time a "small tightening" pass is wanted.
