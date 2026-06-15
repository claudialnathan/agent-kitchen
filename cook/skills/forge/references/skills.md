# Skill mechanics

Verified facts about how the loader, the listing, and the lifecycle actually behave. The judgment lives in SKILL.md; this file is the part you look up. Canonical reference on conflict: `code.claude.com/docs/en/skills`.

## Listing and triggering

- At session start the model sees only **names and descriptions**. Combined `description` + `when_to_use` is capped at **1,536 chars per skill**; the aggregate listing budget is ~1% of the context window (≈8K chars on a 200K session), dropping the least-used descriptions first. A fleet of near-cap descriptions can overflow the budget by itself.
- `when_to_use` renders concatenated after the description with a `-` separator — bullet lists arrive as run-on artifacts. Keep it one compact line.
- Cross-tool: the open agentskills.io spec caps `description` at 1,024 chars and **ignores `when_to_use`** — Cursor and Codex see only the description. The spec, cross-tool consumers, and `bin/preship-check` all require an explicit `name:`.
- Cheap diagnostic: ask a fresh session "when would you use the `<skill>` skill?" — it quotes the description back, and the gap tells you what to add.
- Add a *negative* trigger only when the skill demonstrably over-fires.

## Kinds

The kind constrains the form; it doesn't decide worth (that's additive-vs-transformative).

| Kind | Purpose | Frontmatter that matters | Body shape |
| :--- | :--- | :--- | :--- |
| **Workflow** | Run a procedure (`/release`, `/commit`) | `disable-model-invocation: true`, scoped `allowed-tools` | imperative numbered steps |
| **Knowledge** | Apply conventions when relevant | model-invocable | declarative facts/rules |
| **Guarded action** | Side-effecting action, strict tool scope | `disable-model-invocation` + narrow `allowed-tools` | one-shot recipe |
| **Forked research** | Investigate without polluting the thread | `context: fork`, `agent: Explore` | task prompt for a subagent |
| **Research orchestrator** | Parallel forks over a corpus, bounded synthesis (`/ingest`) | `disable-model-invocation: true` | dispatch contract + synthesis |
| **Path-scoped knowledge** | Conventions for some files only | `paths:` | declarative, narrow |
| **Toolkit** | Bundle scripts/examples Claude calls into | `scripts/` + `examples/` carry the value | thin orientation |
| **Dispatcher** | Triage + shape across related jobs | often `paths:`-scoped | dispatch table + per-job sections |

## Frontmatter

**Unrecognized fields are silently ignored** — and so are recognized fields nested under unknown parents (`metadata: trigger:` is dead bytes, no warning). If a setting seems to have no effect, check the field name and its parent first.

| Field | Worth setting |
| :--- | :--- |
| `name` | Always (spec-required for portability; directory-name inference is Claude-Code-only) |
| `description` | Always — the only thing the model uses to decide invocation |
| `when_to_use` | Only for trigger surface that doesn't fit the description |
| `argument-hint` / `arguments` | Skills that take args; `arguments: [a, b]` enables `$a`/`$b` named substitution |
| `disable-model-invocation: true` | Workflow and guarded-action kinds. Side effect: the skill can't be preloaded into subagents via `skills:` |
| `user-invocable: false` | Background knowledge that isn't a meaningful command; hides from the `/` menu, model can still load it |
| `allowed-tools` | Guarded actions, with the *narrowest* patterns (`Bash(git add *)`, not `Bash`). **Grants while active; does not restrict** — restriction is `permissions.deny`. Takes effect only after workspace trust |
| `model` / `effort` | Only when genuinely off-default; model override lasts the rest of the turn |
| `context: fork` + `agent` | Forked research. The body becomes the subagent's *prompt* — a body with no actionable task returns empty. `Explore` for read-only, `general-purpose` when it needs Edit/Write |
| `hooks` | A deterministic guarantee alive only while the skill runs (e.g. a read-only `db-reader` blocking write SQL). Torn down when the skill finishes |
| `paths` | Path-scoped knowledge; manual `/<name>` invocation works regardless, so it's pure win when scope is genuinely narrow |
| `compatibility` | Open-spec; runtime requirements surfaced at discovery ("Tailwind v4 + shadcn on Base UI"). Cheaper than a body preamble |
| `license` | Only for skills distributed outside a plugin manifest |

**Traps:**

- `paths:` on a **plugin** skill does not gate listing (always listed; `paths:` only adds auto-load). On a **project-local** skill it gates listing — the skill looks *missing* until a matching file is read. A project skill that must stay invocable should omit `paths:`. (2026-06-06, v2.1.165)
- Strict-YAML failures that pass Claude Code's lenient loader: a colon-space (`: `) or unbalanced quotes inside an unquoted `description:` scalar breaks PyYAML-class parsers (Cursor, Codex, `skills-ref validate`). Quote the value or use a block scalar.
- `tools:` is the subagent field; the skill field is `allowed-tools:`. They look alike and aren't.
- A subagent whose `tools` include `Agent` (the default when `tools` is omitted) can spawn its own subagents; omit `Agent` or set `disallowedTools: [Agent]` to keep it leaf-only. Foreground chains self-limit (each blocks its parent); background nesting caps at depth 5. A fork still can't spawn a fork, but other types it spawns count toward that cap. (2026-06-15, v2.1.172)
- Setting both `disable-model-invocation: true` and `paths:` — auto-loading is disabled by the former; pick one.
- Don't copy frontmatter from the skill you're reading: `harness-targets: [claude]` on this forge gates it to Claude Code, and a portable stack skill shouldn't carry it.

**Substitutions** (run before the body enters context): `$ARGUMENTS`, `$ARGUMENTS[N]` / `$N`, `$<name>` (with `arguments:` declared), `${CLAUDE_SKILL_DIR}` (always use for bundled scripts), `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`. If no substitution is present and the user passed arguments, they're appended as `ARGUMENTS: <input>`.

**Dynamic injection** inlines live command output at invocation time (the literal syntax is never rendered here — see the footgun section in SKILL.md). It is preprocessing, not a tool call; the output is captured once, so compaction re-attaches stale data — re-invoke for fresh state. Disabled per-policy via `disableSkillShellExecution`.

## Lifecycle

- Invocation renders the body **once** into the conversation; the file is never re-read. Editing a skill mid-session does nothing until you re-invoke it.
- **Compaction** re-attaches the most recent invocation of each skill: first **5,000 tokens** per skill, shared **25,000-token cap**, filled most-recently-invoked first — older invocations drop entirely. A load-bearing skill that got dropped: just re-invoke it.
- Project-root CLAUDE.md *is* re-read from disk after compaction; skills are not. Nested CLAUDE.mds reload on next file-read in their directory.
- Live change detection: description edits take effect in-session; a *new* top-level skills directory needs a restart.
- **Subagents differ:** the `skills:` field on an agent definition preloads the *full body* into its system prompt; subagents don't inherit the parent conversation's skills. A `context: fork` skill is different again — its body becomes the fork's prompt.
- Write the body as **standing instructions** ("when running tests, prefer single-file runs"), not one-time steps ("first check Node is installed") — turn-8 Claude should still be steered, not stepped through a spent recipe. Bodies past ~500 lines hurt more than they help; push reference material to sibling files.

## Naming and placement

- `skills/<name>/SKILL.md` — flat, one level deep, no grouping dirs. Directory name becomes the slash command (lowercase, hyphens, ≤64 chars).
- Name the *scope*, not the search keyword; keywords pull triggers from the description without misrepresenting scope.
- Precedence: enterprise > personal (`~/.claude/skills/`) > project > plugins. A project skill with the same name as a personal one **loses silently** — rename, disable the personal one in `skillOverrides`, or scope through a plugin.

## Bundled assets

- `scripts/` are *executed, not loaded* — free and deterministic. Bundle one when you'd write the same code three times; don't bundle judgment-laden work (scripts ossify; skills bend).
- `references/` stay **one level deep** — a reference pointing at another reference gets partially read (`head`) and loses information silently. Give any reference over ~100 lines a table of contents.
- A skill-scoped hook (frontmatter `hooks:`) carries the skill's own enforcement for its lifetime — see [hooks.md](hooks.md).

## Anti-patterns

- **Encoded answer** — imperative steps that save typing and change nothing foreground.
- **Silent failure** — invoked, in context, not steering. Only a transcript read catches it.
- **Greedy description** — "for any code-related task"; eats the shared budget, truncates others.
- **Wrong-surface** — "ALWAYS lint after edit" (hook), five lines of conventions (CLAUDE.md), "query the database" with no connection (MCP).
- **Article-as-speculation** — encoding the interesting-but-unproven; the most expensive kind of skill, paying rent until something forces removal.
- **Conversation residue** — the artifact is not the conversation. No session narration, no addressing the reader, no quoting requests.

## Eval

The loop is eval-first: run the task in a fresh session **without** the skill and document exactly what goes wrong — that gap is the spec. Write the minimal instruction that closes it; re-test on two or three *real* prompts (the wording you'd actually type), and read the transcript for the steered-vs-triggered distinction. Reserve the blind A/B panel (`evals/depth-eval.js`, ~0.3–1.1M tokens per domain) for high-stakes rewrites — blind, because a model scores its own output higher when it judges unblinded.
