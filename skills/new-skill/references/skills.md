# Skill mechanics: authoring

Verified facts about how the loader, the listing, and the lifecycle behave, for the moment a skill is being written. The judgment lives in SKILL.md; this file is the part you look up. Canonical reference on conflict: `code.claude.com/docs/en/skills`.

## Listing and triggering

- At session start the model sees only **names and descriptions**. Combined `description` + `when_to_use` is capped at **1,536 chars per skill**; the aggregate listing budget is ~1% of the context window (≈8K chars on a 200K session), dropping the least-used descriptions first. A fleet of near-cap descriptions can overflow the budget by itself.
- `when_to_use` renders concatenated after the description with a `-` separator, so bullet lists arrive as run-on artifacts. Keep it one compact line.
- Cross-tool: the open agentskills.io spec caps `description` at 1,024 chars and **ignores `when_to_use`**, so Cursor and Codex see only the description. The spec, cross-tool consumers, and `scripts/preship-check` all require an explicit `name:`.
- Cheap diagnostic: ask a fresh session "when would you use the `<skill>` skill?" It quotes the description back, and the gap tells you what to add.
- Add a *negative* trigger only when the skill demonstrably over-fires.

## Kinds

The kind constrains the form; it doesn't decide worth (that's additive-vs-transformative).

| Kind | Purpose | Frontmatter that matters | Body shape |
| :--- | :--- | :--- | :--- |
| **Workflow** | Run a procedure (`/release`, `/commit`) | `disable-model-invocation: true`, scoped `allowed-tools` | imperative numbered steps |
| **Knowledge** | Apply conventions when relevant | model-invocable | declarative facts/rules |
| **Guarded action** | Side-effecting action, strict tool scope | `disable-model-invocation` + narrow `allowed-tools` | one-shot recipe |
| **Forked research** | Investigate without polluting the thread | `context: fork`, `agent: Explore`; add `background: false` when synthesis needs the result in-thread | task prompt for a subagent |
| **Research orchestrator** | Parallel forks over a corpus, bounded synthesis | `disable-model-invocation: true`; wait for background forks (or set `background: false`) before synthesizing | dispatch contract + synthesis |
| **Path-scoped knowledge** | Conventions for some files only | `paths:` | declarative, narrow |
| **Toolkit** | Bundle scripts/examples the agent calls into | `scripts/` + `examples/` carry the value | thin orientation |
| **Dispatcher** | Triage + shape across related jobs | often `paths:`-scoped | dispatch table + per-job sections |

## Frontmatter

**Unrecognized fields are silently ignored**, and so are recognized fields nested under unknown parents (`metadata: trigger:` is dead bytes, no warning). If a setting seems to have no effect, check the field name and its parent first.

| Field | Worth setting |
| :--- | :--- |
| `name` | Always (spec-required for portability; directory-name inference is Claude-Code-only) |
| `description` | Always: the only thing the model uses to decide invocation |
| `when_to_use` | Rarely earns its place: a good description already covers its semantic neighborhood, so the field usually duplicates it. Cross-tool consumers drop it, so portable skills keep triggers in `description` (open-spec cap 1,024 chars) |
| `argument-hint` / `arguments` | Skills that take args; `arguments: [a, b]` enables `$a`/`$b` named substitution |
| `disable-model-invocation: true` | Workflow and guarded-action kinds. Side effect: the skill can't be preloaded into subagents via `skills:` |
| `user-invocable: false` | Background knowledge that isn't a meaningful command; hides from the `/` menu, model can still load it |
| `allowed-tools` | Guarded actions, with the *narrowest* patterns (`Bash(git add *)`, not `Bash`). **Grants while active; does not restrict** (restriction is `permissions.deny`). Takes effect only after workspace trust |
| `model` / `effort` | Only when genuinely off-default on *this* harness; prefer leaving unset so Codex/Cursor/Claude each use their own default. A pinned model ID from another provider is ignored or fails elsewhere. Override lasts the rest of the turn where supported |
| `context: fork` + `agent` | Forked research. The body becomes the subagent's *prompt*, so a body with no actionable task returns empty. `Explore` for read-only, `general-purpose` when it needs Edit/Write. As of v2.1.218 forks **run in the background by default**; set `background: false` when the parent must wait for the result before continuing |
| `hooks` | A deterministic guarantee alive only while the skill runs (e.g. a read-only `db-reader` blocking write SQL). Torn down when the skill finishes |
| `paths` | Path-scoped knowledge; manual `/<name>` invocation works regardless, so it's pure win when scope is genuinely narrow |
| `compatibility` | Open-spec; runtime requirements surfaced at discovery ("Tailwind v4 + shadcn on Base UI"). Cheaper than a body preamble |
| `license` | Only for skills distributed outside a plugin manifest |

**Traps:**

- `paths:` on a **plugin** skill does not gate listing (always listed; `paths:` only adds auto-load). On a **project-local** skill it gates listing, so the skill looks *missing* until a matching file is read. A project skill that must stay invocable should omit `paths:`. (2026-06-06, v2.1.165)
- Strict-YAML failures that pass Claude Code's lenient loader: a colon-space (`: `) or unbalanced quotes inside an unquoted `description:` scalar breaks PyYAML-class parsers (Cursor, Codex, `skills-ref validate`). Quote the value or use a block scalar.
- `tools:` is the subagent field; the skill field is `allowed-tools:`. They look alike and aren't.
- Nested spawning (a subagent whose `tools` include `Agent` spawning its own subagents) defaults to **depth 3** as of v2.1.219 (was briefly off-by-default at v2.1.217). Set `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` to disable nesting. Prefer nesting over a workflow when the orchestration is one delegated split, not a standing pipeline. Omit `Agent` or set `disallowedTools: [Agent]` when leaf-only must be explicit. A fork still can't spawn a fork. Two session-wide caps also apply: 20 subagents running concurrently (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`, exempt under workflows/`ultracode`) and 200 WebSearch calls. The per-session *total* was removed in v2.1.224, so a long-running session no longer refuses new agents and a skill needn't budget against a lifetime count. (2026-08-09, v2.1.226)
- Setting both `disable-model-invocation: true` and `paths:` (auto-loading is disabled by the former; pick one).
- Don't copy frontmatter from the skill you're reading: a harness-authoring skill's `paths:` globs match harness files, not a stack skill's source, so copy the field idea and not the values.

**Substitutions** (run before the body enters context): `$ARGUMENTS`, `$ARGUMENTS[N]` / `$N`, `$<name>` (with `arguments:` declared), `${CLAUDE_SKILL_DIR}` (always use for bundled scripts), `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`. If no substitution is present and the user passed arguments, they're appended as `ARGUMENTS: <input>`.

**Dynamic injection** inlines live command output at invocation time (the literal syntax is never rendered here; see the footgun section in SKILL.md). It is preprocessing, not a tool call; the output is captured once, so compaction re-attaches stale data. Re-invoke for fresh state. Disabled per-policy via `disableSkillShellExecution`.

## Writing the body

- Invocation renders the body **once** into the conversation; the file is never re-read. Editing a skill mid-session does nothing until you re-invoke it.
- Write **standing instructions** ("when running tests, prefer single-file runs"), not one-time steps ("first check Node is installed"), because the turn-8 agent should still be steered rather than stepped through a spent recipe. Long bodies dilute their own steering; push reference material to sibling files.
- **Task-skill bodies read in four movements:** the task named; the context gate — each input the work depends on (arguments, files, config, connections, facts only the user holds) verified present before acting, with a question rather than a guess when one is missing, and expected args declared via `argument-hint`/`arguments` so the gap surfaces at invocation; the work; the output checked against the skill's objective before delivery. Knowledge kinds are declarative and carry no gate.
- **Subagents differ:** the `skills:` field on an agent definition preloads the *full body* into its system prompt, and subagents don't inherit the parent conversation's skills. A `context: fork` skill is different again, because its body becomes the fork's prompt.

## Naming and placement

- `skills/<name>/SKILL.md`: flat, one level deep, no grouping dirs. Directory name becomes the slash command (lowercase, hyphens, ≤64 chars).
- Name the *scope*, not the search keyword; keywords pull triggers from the description without misrepresenting scope.
- Lead a task skill's name with its verb (`review-…`, `find-…`) and a knowledge skill's with its domain (`shadcn-tailwind`): a `/` menu reader should predict from the name alone whether invoking it *does* something or *loads* conventions. The name signals, frontmatter enforces; a verb-named skill that is really ambient knowledge, or the reverse, misleads the human and the dispatching model alike.
- Precedence: enterprise > personal (`~/.claude/skills/`) > project > plugins. A project skill with the same name as a personal one **loses silently**, so rename, disable the personal one in `skillOverrides`, or scope through a plugin.
- Check the name against every installed scope before committing to it. A near-collision costs more than an exact one: an installed skill whose description claims the same trigger phrases will take model-invoked routing even when the names differ, and the fix is either a different name or `disable-model-invocation: true` so invocation is always explicit.

## Bundled assets

- `scripts/` are *executed, not loaded*, which makes them free and deterministic. Bundle one when you'd write the same code three times; don't bundle judgment-laden work (scripts ossify; skills bend).
- `references/` stay **one level deep**, because a reference pointing at another reference gets partially read (`head`) and loses information silently. Give any reference over ~100 lines a table of contents.
- A skill-scoped hook (frontmatter `hooks:`) carries the skill's own enforcement for its lifetime; see [hooks.md](hooks.md).

## Anti-patterns

- **Encoded answer**: imperative steps that save typing and change nothing foreground.
- **Greedy description**: "for any code-related task"; eats the shared listing budget and truncates others.
- **Wrong-surface**: "ALWAYS lint after edit" (hook), five lines of conventions (CLAUDE.md), "query the database" with no connection (MCP).
- **Cross-skill dependency**: a body that says "first run `/X`", or that only works if `/X` is installed. It breaks silently the moment `/X` is absent, disabled, or off-menu.
- **Article-as-speculation**: encoding the interesting-but-unproven; the most expensive kind of skill, paying rent until something forces removal.
- **Conversation residue**: the artifact is not the conversation. No session narration, no addressing the reader, no quoting requests.
- **Prose state machine**: a mode router, a phase sequence, or a findings → plan → apply → re-audit lifecycle written into the body. The agent already owns control flow, so the router charges every invocation to gate the work behind a classification step.
- **Report contract**: column specs, an evidence-status taxonomy, and a pre-ship checklist restating the body. Past a certain share of the body, the artifact is describing its output instead of producing it.
- **Derivation assignment**: "infer the local conventions from two or three nearby examples" where the author could have named the values once. Re-derivation is what the artifact was supposed to remove.
- **Bidirectional hedge**: each rule un-ruled by the next clause ("not automatically wrong… not automatically right"). Net instruction is zero at full token cost.

## A skill stands alone

An authored skill never instructs the agent to invoke another skill, and never assumes another skill is installed — not a third-party skill, and not a harness built-in (`/loop`, `/batch`, `/code-review`) either. When a skill needs a behavior another skill happens to package, it encodes the behavior itself — "repeat until nothing is pending", not "drive it with `/loop`" — so the guidance holds in any harness, with whatever set of skills is present, or none. The only cross-skill reference that survives is an optional, one-directional see-also pointer that costs nothing when the target is absent; a "first run `/X`" step is a dependency wearing a pointer's clothes, and it breaks the moment `/X` isn't there.

The mechanics are the reasons the dependency is fragile, not a licence to build one:

- **A skill invocation is prompt injection.** The rendered SKILL.md enters the conversation as one message and stays for the session (compaction re-attaches the most recent invocation, first 5,000 tokens per skill under a 25,000-token shared cap), so a chained invocation silently inflates standing context for the rest of the session.
- **Model-invocability is per-skill configuration, not a stable guarantee.** The model can invoke any skill lacking `disable-model-invocation: true` through the Skill tool, so a target that sets it fails the chain *silently*; bundled built-ins can be switched off wholesale via `disableBundledSkills`; `user-invocable: false` changes only the `/` menu, not Skill-tool access; and which skills are model-invocable varies by environment. A body that names `/X` bets on all of that holding, every session, forever.

So: encode the intent and the behavior, never the neighbor. A procedure that is genuinely idempotent-until-drained *says* so and lets the agent, or a loop it is already inside, carry it, rather than reaching for a named driver skill the guidance cannot guarantee is there.

Canonical source on conflict: `code.claude.com/docs/en/skills`.
