---
name: rule-forge
description: |
  Designs path-scoped rules at `.claude/rules/<name>.md` for project conventions that should auto-load only when working with files in a specific area. Rules are simpler than skills (no manual invocation, no kinds, no body-shape choices) — the whole design space is "what paths, what body content, vs CLAUDE.md and vs path-scoped skill." Use when designing or refactoring `.claude/rules/`, when CLAUDE.md is growing past ~200 lines and pieces of it are file-specific, when skill-forge's triage redirected to "this should be a path-scoped rule," or when conventions are repeating across files in a directory.
when_to_use: |
  Triggers:
  - "write a rule"
  - "design a rule"
  - "this should be a rule"
  - "claude.md is getting too long"
  - "claude.md split"
  - "split rules out of claude.md"
  - "scope this rule to a directory"
  - "path-scoped rule"
  - "skill-forge said make a rule"
  - "rule vs claude.md"
  - "rule vs path-scoped skill"
  - "where do project conventions go"
  - ".claude/rules/"
paths:
  - "**/.claude/rules/**"
  - "**/CLAUDE.md"
  - "**/CLAUDE.local.md"
harness-targets: [claude]
---

# rule-forge

Designs path-scoped rules — the simplest extension surface in Claude Code. A rule is a markdown file at `.claude/rules/<name>.md` with a `paths:` glob in its frontmatter and declarative content in the body. When Claude works with files matching the glob, the rule loads. When it doesn't, the rule sleeps.

Rules are the right surface when **all four** of these hold:

1. The content is *facts about a slice of the codebase*, not a procedure or workflow.
2. The slice is identifiable by file paths (a directory, a glob, a file pattern).
3. The facts apply automatically without needing manual invocation.
4. The content would bloat CLAUDE.md if put there but isn't substantial enough to deserve a skill.

If any of those is false, rules aren't the right surface.

## Step 1 — Triage

Four nearby surfaces to check first, plus a scope question.

### Project scope vs personal scope

Rules can live in two places, and the right scope is part of the design:

- **Project scope** (`.claude/rules/<name>.md`) — committed to the repo, applies to anyone working on this project. Use when the convention is project-specific (this repo's API style, this repo's migration discipline).
- **Personal scope** (`~/.claude/rules/<name>.md`) — applies to every project on your machine. Use when the convention is *stack-specific* and you use that stack across most of your projects (e.g. "I always use shadcn + Tailwind v4" or "my Python style"). User-level rules load before project rules, giving project rules higher priority on conflict.

A rule belongs in personal scope when: the convention follows you across repos, it's tied to a stack/tool you reuse, and project-specific facts can be discovered at runtime (read `globals.css`, read `package.json`) rather than baked in.

### Rule vs CLAUDE.md

CLAUDE.md is *always* in context. Rules are *only* in context when matching files are open. The split:

- **CLAUDE.md** — facts that apply to the whole project all the time. Build commands, project-wide conventions, "we use pnpm not npm." Keep under ~200 lines; over that, parts of it should be rules.
- **Rules** — facts that apply only when working with specific files. Per-directory conventions, framework-specific patterns inside a slice of the repo.

If you're tempted to add to CLAUDE.md "for the API directory we do X" — that's a rule, not a CLAUDE.md fact.

For designing the CLAUDE.md side itself (or splitting an over-long one), hand off to `claude-md-forge` — its audit job triages CLAUDE.md content across all six surfaces and produces the matching rule files in lockstep.

### Rule vs path-scoped skill

Both use `paths:` globs to scope auto-loading. The difference is invocation:

- **Rule** (`.claude/rules/<name>.md`) — auto-loads when paths match. *Cannot* be manually invoked. The rule is invisible to the `/skills` menu.
- **Path-scoped skill** (`.claude/skills/<name>/SKILL.md` with `paths:`) — auto-loads when paths match, *and* can be invoked with `/<name>`. Appears in the `/skills` menu.

Use the rule when the content is purely passive ("here are the conventions, apply them"). Use the path-scoped skill when there's genuine value in being able to invoke it explicitly (`/api-conventions` to pull the full reference into context even when not editing API files).

### Rule vs hook

Rules and hooks are completely different surfaces despite both being "things that fire automatically." Rules add *context*; hooks run *checks* with the ability to block. If you want Claude to know X when working on Y files, that's a rule. If you want to *prevent* edits to Y files unless condition Z, that's a hook.

### Rule vs nothing

The cheapest answer. If the convention is something Claude already infers from the code, don't write a rule. Repeat the same correction three times before encoding.

## Step 2 — Write the rule

Frontmatter is just `paths:`. That's the entire design surface for the file.

```yaml
---
paths:
  - "src/api/**/*.ts"
  - "tests/api/**/*.ts"
---

# API conventions

[the actual conventions]
```

**Path glob discipline:**
- Use `**` for recursive matching, `*` for single-segment.
- Be specific enough that the rule doesn't load when irrelevant. `src/**` is too broad if the convention only applies to API code; use `src/api/**`.
- Multiple paths are an array; the rule loads when *any* path matches a file Claude is touching.
- Test the globs against your file structure before shipping. A glob that never matches means the rule never loads, silently.

**Body discipline:**
- Declarative, not procedural. Bullets of facts, not steps. *Behavioral defaults* count as declarative ("default to existing tokens, don't extend silently") — they're statements about how to act in this slice, not workflows.
- Concrete examples over abstract rules.
- Short. A rule's whole reason for existing is "small enough not to belong in CLAUDE.md." If you're at 100+ lines, ask whether this should be a path-scoped skill (with bundled reference files) instead.
- Apply the CLAUDE.md test to every line: would removing it change Claude's behavior? If not, cut.

**Portability discipline (personal-scope rules):**
- Don't hardcode project-specific facts (token tables, file paths unique to one repo). They'll be wrong in the next project.
- Tell Claude *how to discover* project specifics — e.g. "read `globals.css` for the project's `@theme` block before writing UI." The rule encodes the discovery pattern; the project files are the source of truth.
- Include an "if assumptions don't hold" escape clause so the rule doesn't misfire in projects that aren't on the assumed stack.

## Worked examples

### `src/api/**` conventions

`.claude/rules/api-conventions.md`:

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "tests/api/**/*.ts"
---

# API conventions

## URL shape
- Versioned: `/v2/<resource>` (kebab-case for multi-word resources).
- Resources are plural nouns; subresources nest under the parent.

## Response envelope
- Success: `{ data, meta }`.
- Error: `{ error: { code, message, details } }`.
- Pagination is cursor-based, never offset-based.

## Status codes
- 400 for input validation, with `details.fields[]` per-field.
- 401 for missing/invalid auth, code `auth/unauthorized`.
- 403 for authenticated-but-forbidden, code `auth/forbidden`.
- 422 for semantic-rule violations.
```

When Claude opens any file in `src/api/` or `tests/api/`, this loads. When working in `src/components/`, it doesn't.

### Migration directory

`.claude/rules/migrations.md`:

```markdown
---
paths:
  - "supabase/migrations/**"
  - "migrations/**"
---

# Migration discipline

- Migrations are append-only. Never edit a committed migration; write a new one that supersedes.
- Use `IF EXISTS` / `IF NOT EXISTS` everywhere; migrations must be idempotent.
- Every schema-changing migration includes a comment block at the top with the rationale and the rollback strategy.
- Test by running `pnpm migrations:check` before committing.
- Naming: `YYYYMMDDHHMMSS_<verb>_<object>.sql`, e.g. `20260507120000_add_user_avatars.sql`.
```

### Tests directory

`.claude/rules/tests.md`:

```markdown
---
paths:
  - "tests/**"
  - "**/*.{test,spec}.{ts,tsx}"
  - "playwright.config.ts"
  - "vitest.config.mts"
---

# Test discipline

- Use accessible locators (`getByRole`, `getByLabel`) over `data-testid`.
- Wait for signal, not time: `await expect(...).toBeVisible()`, never `waitForTimeout`.
- Vitest is for sync logic; async Server Components and Server Actions go in Playwright.
- Test files mirror the source structure: `src/lib/foo.ts` → `tests/unit/lib/foo.spec.ts`.
- For the deeper testing decision framework (cache invalidation, dev/CI variants, Supabase patterns), see the `cache-aware-testing` skill. This rule is the elevator pitch.
```

(That last bullet is a useful pattern: the rule is the *summary* that lives in context when relevant, with a pointer to the deeper skill for the detailed framework.)

### Cross-project stack discipline (personal scope)

`~/.claude/rules/shadcn-tailwind.md`:

```markdown
---
paths:
  - "**/*.{tsx,jsx,mdx}"
  - "**/globals.css"
  - "**/components.json"
  - "**/components/**/*.{ts,tsx}"
---

# shadcn (latest) + Tailwind v4 discipline

You're working on UI in a project that likely uses the modern shadcn + Tailwind stack...

## Read the project's tokens first

The design system lives in an `@theme` block inside `globals.css`. Open it once at the start of UI work; the file is the source of truth. Don't memorize project-specific tokens — discover them.

## Default to existing tokens. Don't extend silently.

When the user gives a casual UI prompt, assume the values they describe map to existing tokens. Lazy design language usually means "use what we already have." Only add new tokens when the user explicitly says so.

## When implementing from a design

This rule is the always-on baseline. For design-translation tasks (Figma frames, mockups), the `figma-to-tailwind-tokens` skill has the deep workflow.

[...remaining body covers: color discipline, spacing math, Base UI vs Radix, data-* state attributes, self-check, escape clause...]
```

The shape worth noticing: lives in **personal scope** (loads across every project on this machine), uses a **discovery instruction** (read `globals.css`) instead of hardcoded token tables (which would rot per-project), and **defers to a description-triggered skill** for the heavier specific-task workflow. The combination — always-on rule + deeper skill on demand — is the right pattern for stack-wide discipline.

## Common slip-ups

- **Globs that don't match.** `src/api/*.ts` (no `**`) only matches files directly in `src/api/`, not subdirectories. Test by listing matches: `find . -path "<glob>"`.
- **Rules that grow into mini-skills.** A 200-line rule is probably a skill that wants to be invocable. Move it to `.claude/skills/<name>/` with `paths:` and the same body.
- **Rules that duplicate CLAUDE.md.** If CLAUDE.md already says "we use Tailwind v4," don't put it in a rule too. The fact lives in one place.
- **Rules that should be hooks.** "Never edit `.env`" is a hook (`PreToolUse` with exit 2), not a rule. Rules add context; hooks enforce.
- **Conventions that change frequently.** Rules are written into the repo; if the conventions are still in flux, conversation-level corrections are cheaper than maintaining a rule that's wrong.

## Closing checklist

- [ ] Confirmed this should be a rule, not CLAUDE.md / a path-scoped skill / a hook / nothing.
- [ ] `paths:` glob is narrow enough to scope correctly and broad enough to cover the actual files.
- [ ] Tested the glob against the file structure (or at least listed matches).
- [ ] Body is declarative, concrete, under ~100 lines.
- [ ] No duplication with CLAUDE.md or another rule.
- [ ] No procedural steps (those want a skill); no enforcement (that wants a hook).

## When this skill doesn't apply

- The content needs manual invocation (`/<name>`). Use a path-scoped skill instead.
- The content is enforcement, not context. Use a hook.
- The content applies project-wide. Use CLAUDE.md.
- The content is a workflow with steps. Use a workflow skill.

## Methodology note

Rules are documented at `https://code.claude.com/docs/en/memory#path-specific-rules`. Path glob semantics, the loading model (only when Claude reads a matching file), and how rules interact with CLAUDE.md are all there. Trust the canonical page; this skill is the design discipline, not the API reference.
