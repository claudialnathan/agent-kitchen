# Triage: which extension surface fits?

Skills are flexible, but flexibility makes it tempting to build a skill for things that should live elsewhere. This page is the longer form of Step 1 in SKILL.md. Use it when the answer isn't obvious.

## The six extension surfaces

Claude Code in 2026 has six places to put behavior. They aren't substitutable; each one solves a different problem.

| Surface | What it gives you | Loaded when | Cost |
| :--- | :--- | :--- | :--- |
| **CLAUDE.md** | Always-on facts and conventions | Every session, in full | Recurring tokens, every turn |
| **`.claude/rules/*.md` with `paths:`** | Path-scoped facts | When matching files are touched | Recurring while in scope |
| **Skill** | Knowledge or workflow, on demand | Description always; body when invoked | Description budget per session, body once invoked |
| **Subagent** | Isolated context for a side task | When delegated to | Separate context window |
| **Hook** | Deterministic action on a lifecycle event | Event fires (PreToolUse, PostToolUse, etc.) | Zero unless it returns output |
| **MCP server** | Connection to an external system | Tool names at startup, schemas on demand | Low (with tool search), per-call when used |
| **Plugin** | Bundle that distributes any of the above | Per its components | Same as components |

Plugins aren't really a seventh choice — they're the *packaging* layer for the rest. Choose your surface first, then decide if it belongs in a plugin.

## The triage ladder

Walk these in order. Stop at the first match.

### 1. Is the rule a hard guarantee or a request?

> "Block writes to `.env`" or "lint after every Edit" or "never push to main."

These are guarantees. The model is being asked to *not do* or *always do* something. Skills express requests; the model interprets and may not comply. Hooks fire deterministically.

→ **Use a hook.** PreToolUse to block, PostToolUse to verify, UserPromptSubmit to inject context, etc. Hooks can be a shell command, HTTP endpoint, MCP tool, prompt, or subagent.

A skill *can* declare a hook in its `hooks:` frontmatter for skill-scoped rules (e.g., a `db-reader` skill that should never see write SQL while active). But the hook is doing the enforcement; the skill just narrows the scope.

### 2. Does the work require an external system the harness can't see?

> Querying your database, opening a Notion page, posting to Slack, checking Sentry, controlling a browser.

The skill can't reach the system on its own. It needs a connection.

→ **Connect an MCP server.** Then optionally add a skill that teaches Claude *how to use that MCP server effectively* — your schema, common queries, formatting rules. The skill's value is the domain knowledge layered on top of the connection.

Don't write a skill that says "use the database to find users." If the database isn't connected, the skill is fiction. Connect first.

### 3. Would the work flood the main context with output?

> Running an entire test suite, scraping logs, exploring a 1,000-file module, scanning dependencies for vulnerabilities.

This work generates verbose intermediate state that Claude doesn't need to keep referring to. Holding it in the main context starves later turns.

→ **Use a subagent.** Two ways:
- A standalone subagent definition in `.claude/agents/<name>.md` that Claude delegates to.
- A skill with `context: fork` and `agent: Explore` (or another agent) — the skill content becomes the prompt the subagent runs, and only its summary returns.

Use the subagent definition when the work is invoked many ways. Use the forked skill when the *task* is the same but the inputs vary (e.g., `/audit-deps`, `/research-X`).

### 4. Is the rule a fact Claude should hold every session?

> "We use pnpm not npm." "Tests live in `tests/`." "Run `npm run typecheck` before committing." "API base path is `/v2`."

These are short, broadly-applicable, true-everywhere-in-this-repo facts.

→ **Put it in `CLAUDE.md`.** Keep CLAUDE.md under ~200 lines; if it grows past that, split path-scoped pieces into `.claude/rules/*.md` with `paths:` frontmatter, or move reference material to a skill.

If you find yourself adding a fact that Claude already infers from the code (e.g., "we use TypeScript"), don't. CLAUDE.md exists for things Claude can't guess.

### 5. Does the rule only apply to certain files?

> "API endpoints under `src/api/` use this error format." "React components in `packages/ui/` follow Atomic Design."

These are facts but they only matter when working on a slice of the codebase. Putting them in CLAUDE.md wastes context for everyone else.

→ **Use `.claude/rules/<name>.md` with `paths:` frontmatter.**

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Conventions
- All endpoints return `{data, meta, errors}`.
- Auth errors use status 401 with `code: "auth/unauthorized"`.
```

The rule loads only when Claude touches matching files. This is path-scoped knowledge — it's *not* a skill. Don't reach for skills for this; rules are the right tool.

### 6. None of the above?

If the work is a procedure or body of knowledge that's reusable across sessions, isn't a hard guarantee, doesn't need an external system, doesn't require isolation from the main thread, doesn't fit in CLAUDE.md, and isn't path-scoped — **now it's a skill**. Continue to Step 2 in SKILL.md to classify which kind.

## Combining surfaces

Many real setups combine surfaces. Some pairings worth knowing:

- **MCP + Skill** — MCP connects to your database; the skill teaches Claude your schema, common joins, naming conventions. The skill is *useless* without the MCP server, but the MCP server is *less useful* without the skill.
- **Hook + Skill** — A skill walks Claude through a release. A hook enforces "never push without tests passing" while the release skill is active. The skill bends; the hook holds the line.
- **Skill + Subagent (`context: fork`)** — A skill's whole job is to investigate. The skill content becomes the task the subagent runs; main-thread context stays clean.
- **Skill that preloads skills into a subagent** (`skills:` field on a subagent definition) — A custom subagent loads the relevant knowledge skills as part of its system prompt at startup. Different from `context: fork`; here the subagent is the persistent thing and the skills are reference material it carries.
- **CLAUDE.md + Skill** — CLAUDE.md says "follow our API conventions." A `/api` skill contains the full convention reference. Always-on hint + on-demand depth.
- **Plugin = the package** — once any of the above is reusable across repos, package it as a plugin. Plugin skills get namespaced (`<plugin>:<skill>`) so they can't collide.

## When *nothing* is the right answer

The most under-used "surface" is the one that's free: not creating anything. Some prompts the user is sure they want a skill for are better handled by:

- Just asking Claude in the moment (the work is one-off).
- A two-line `CLAUDE.md` addition (the lesson is a fact, not a procedure).
- A better prompt template the user keeps in a snippets app (the variation is too prompt-specific to encode).

If you can't articulate when this skill should fire and what it should produce, it shouldn't exist yet. Watch for the same prompt three times before encoding.
