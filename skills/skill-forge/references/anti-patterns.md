# Anti-patterns: bad skills with the surface they should have used

A non-exhaustive list of skill-shaped things that aren't actually skills. Each one shows the bad SKILL.md, why it doesn't work, and what surface fits the goal instead.

## 1. The hook-shaped skill

```yaml
---
name: never-leak-secrets
description: ALWAYS check all edits for secrets before committing. NEVER allow API keys to be committed.
---

CRITICAL: Before any commit, search the staged changes for:
- AWS keys, GitHub tokens, generic high-entropy strings
- The strings "password", "secret", "api_key" assigned to literals

If found, REFUSE to commit and explain why.
```

**Why it's broken:** The skill is asking the *model* to enforce a rule. The model interprets the rule and may comply or not. A user (or a bad prompt injection) can talk Claude out of it.

**What fits:** A `PreToolUse` hook on `Bash(git commit *)` that scans the staged diff for secrets and exits with code 2 to block. Settings:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit *)",
        "hooks": [{"type": "command", "command": "~/.claude/hooks/scan-secrets.sh"}]
      }
    ]
  }
}
```

A skill *can* sit alongside this hook to teach Claude what kinds of secrets to look for, what to do when one is found, etc. — that's advisory. The hook is the guarantee.

## 2. The CLAUDE.md-shaped skill

```yaml
---
name: project-conventions
description: Conventions for this project.
---

We use:
- pnpm, not npm
- TypeScript strict mode
- Vitest for tests
- Tailwind for styling
```

**Why it's broken:** Five lines of facts. They should be loaded every session — but the skill body only loads when invoked. Claude may not invoke it for general work, missing the conventions.

**What fits:** Put it in `CLAUDE.md`. Loads every session, costs the same tokens, applies always.

The exception: if the conventions are *long* (an actual style guide, an API reference) and only need to apply when working on certain code, then `.claude/rules/<name>.md` with `paths:` is the move. Don't put 200 lines of style guide in CLAUDE.md.

## 3. The MCP-shaped skill

```yaml
---
name: query-database
description: Query the production database for user data.
---

To find users, run a SELECT query against the users table. The schema is:
- id (UUID)
- email (text)
- created_at (timestamp)

Query example: SELECT * FROM users WHERE email = '...' LIMIT 1.
```

**Why it's broken:** Claude has no way to actually run SQL. The skill is fiction. Even if Claude tries, it'll reach for `Bash(psql ...)` with no credentials, or just hallucinate a result.

**What fits:** Connect a Postgres MCP server (or similar). The skill *can* layer on top — teach Claude the schema, common joins, naming patterns — but the connection has to exist first.

```yaml
---
name: query-conventions
description: Conventions for querying the production database safely. Use when running ad-hoc queries via the postgres MCP tools. Always use read-only credentials, prefer `LIMIT 100`, never query during peak hours.
---

When using the postgres MCP server's query tool:
- Always include LIMIT unless aggregating.
- The `users` table is large (50M rows); always filter on indexed columns: id, email, org_id.
- For event data, prefer the `events_summary` materialized view over raw `events`.
- ...
```

## 4. The greedy description

```yaml
---
description: A general-purpose code helper. Use this skill whenever the user is working with code, asking questions about code, writing code, or thinking about code-related topics.
---
```

**Why it's broken:** "Whenever the user is working with code" describes most prompts. The skill triggers on prompts that don't need it, eating description budget and pushing other skills' descriptions into truncation territory.

**What fits:** Specificity. "Generates JSDoc comments for TypeScript files. Use when adding doc comments, documenting a file, or improving type-level documentation. Doesn't add inline comments inside function bodies."

The general principle: a description that names *what's distinctive* about the skill outperforms one that names a category the skill belongs to.

## 5. The body that re-introduces itself

```yaml
---
name: deploy
disable-model-invocation: true
---

# Deploy skill

This is the deploy skill. It deploys the application. When the user invokes this skill, you should help them deploy.

If the user asks to deploy, deploy the application by:
1. ...
```

**Why it's broken:** The first three sentences add nothing. The skill is already invoked; Claude already knows what it does. Every line is a recurring token cost on every turn.

**What fits:** Drop the preamble. Start with the steps. The frontmatter says what the skill is; the body says what to do.

```yaml
---
name: deploy
disable-model-invocation: true
allowed-tools: Bash(npm run *) Bash(aws *)
---

1. Run `npm run test:e2e`. Stop and report failures.
2. Run `npm run build`.
3. Sync the build output to s3://prod-bucket/ via `aws s3 sync ...`.
4. Invalidate CloudFront via `aws cloudfront create-invalidation ...`.
5. Verify the homepage returns 200 with `curl -I https://prod.example.com`.
```

## 6. The workflow without `disable-model-invocation`

```yaml
---
name: ship-it
description: Builds, tests, and deploys to production. Use when the user is ready to ship.
allowed-tools: Bash(npm run *) Bash(aws *)
---

# Ship to production
1. ...
2. ...
3. Push to production.
```

**Why it's broken:** Claude can decide to "ship it" because the code looks ready, the tests are passing, and the user said "this looks good." That's not consent to deploy.

**What fits:** Add `disable-model-invocation: true`. Production deploys are user-triggered; nothing about the conversation should count as authorization.

## 7. The under-pre-approved guarded action

```yaml
---
name: post-update
disable-model-invocation: true
allowed-tools: Bash
---

Post a status update to Slack via the slack CLI: `slack-cli send #engineering "$ARGUMENTS"`
```

**Why it's broken:** `allowed-tools: Bash` pre-approves *every* Bash command while the skill is active. The whole point of the guard was to scope what the skill can do; this gives away the scope.

**What fits:** Either narrow `allowed-tools` to the specific command (`Bash(slack-cli send *)`), or use the MCP server tool directly (`mcp__slack__slack_send_message`). A guarded action's safety comes from the narrowness of `allowed-tools` — generic patterns defeat it.

## 8. Inline reference docs

```yaml
---
name: api-spec
description: Our API endpoints reference.
---

# API Reference

## /v2/users
- GET /v2/users — list users
- POST /v2/users — create
- GET /v2/users/:id — fetch
- PUT /v2/users/:id — update
- DELETE /v2/users/:id — delete
- ... (1,200 more lines of endpoint docs)
```

**Why it's broken:** All 1,200 lines enter the conversation when the skill is invoked, then sit there for the rest of the session. Most invocations don't need most endpoints. The body is loaded into recurring context for every turn.

**What fits:** A short SKILL.md with pointers to sibling files:

```yaml
---
name: api-spec
description: Our API endpoint reference. Use when implementing or modifying an endpoint, generating a client, or answering questions about a specific endpoint.
---

API conventions and endpoint reference for our v2 API.

For specific endpoint domains, read the relevant file:
- Users: see `users.md`
- Orders: see `orders.md`
- Inventory: see `inventory.md`
- Auth: see `auth.md`

Conventions all endpoints follow:
- Versioned at /v2/.
- Cursor-based pagination via `?cursor=...&limit=...`.
- Errors return `{"error": {"code", "message", "details"}}`.
- Idempotency-Key supported on mutating endpoints.
```

Now Claude reads `users.md` only when it's working with user endpoints, not for every invocation.

## 9. The skill that should be a subagent

```yaml
---
name: explore-codebase
description: Walks the codebase and reports findings.
---

When invoked, walk the codebase looking for files related to $ARGUMENTS. Read all matching files. Report what you find.
```

**Why it's broken:** Claude reads dozens of files into the *main thread* while exploring. The verbose tool output now lives in your context for the rest of the session, even though you don't need it after the summary.

**What fits:** Add `context: fork` and `agent: Explore`. The exploration runs in a subagent's separate context. Only the summary returns. Same skill, much cleaner main thread.

```yaml
---
name: explore-codebase
description: Walks the codebase and returns a focused summary. Use when investigating an unfamiliar area or tracing how a feature is implemented.
context: fork
agent: Explore
---

Explore the codebase to find files and code related to: $ARGUMENTS.

Use Glob to identify candidate files, Grep to find specific patterns, Read for content.

Stop when you have enough for a 1-page summary. Report:
- Files most relevant, grouped by role.
- Key entry points and how they connect.
- Notable patterns or quirks.
- Open questions worth asking the user.

Cite specific file:line references.
```

## 10. Two skills that should be one (or one that should be two)

A pair to watch for:

**Pattern A** — same domain, two redundant skills:
- `/check-types` — runs tsc, summarizes errors.
- `/find-types` — runs tsc, summarizes errors, with a slightly different prompt.

These compete for description budget and confuse Claude about which to pick.

**Pattern B** — one skill doing two unrelated jobs:
- `/api-helper` — answers questions about the API *and* generates new endpoint scaffolding *and* runs the dev server.

This skill's description is doing triple duty and triggers on none of the three reliably.

**Fix for A:** merge into one. Pick the better description.

**Fix for B:** split into three: `/api-conventions` (knowledge, auto-invoked), `/scaffold-endpoint` (workflow, manual), `/dev` (workflow, manual). Each has a clear, narrow trigger.

## 11. The "for completeness" frontmatter

```yaml
---
name: my-skill
description: ...
when_to_use: ...
disable-model-invocation: false
user-invocable: true
allowed-tools:
model: inherit
effort: high
context:
agent:
paths:
hooks:
shell: bash
---
```

**Why it's broken:** Most of these are defaults. They add visual noise without changing behavior. Worse, they invite changes-without-thought ("oh, let me set effort to max").

**What fits:** Frontmatter is opt-in. Set the fields the skill actually needs; omit the rest. Defaults are defaults for a reason.

## 12. The skill that documents what Claude already knows

```yaml
---
name: typescript-tips
description: Tips for writing TypeScript.
---

# TypeScript Tips

- Use `interface` for object shapes
- Use `type` for unions and primitives
- Avoid `any`; use `unknown` and narrow.
- ...
```

**Why it's broken:** Claude already knows this. Loading 50 lines of generic TypeScript advice every session pushes more useful skills out of the budget and adds noise.

**What fits:** Don't write it. CLAUDE.md and skills are for things *specific to this project* — your conventions, your domain, your unusual choices. Don't recapitulate the language docs.

If your project has *unusual* TypeScript rules ("we use `type` for everything, never `interface`"), put *those* in CLAUDE.md. The unusual ones are the ones worth saying.

## 13. The additive skill that should have been transformative

```yaml
---
name: code-review
description: Reviews code changes.
---

When asked to review code:
1. Read the changed files.
2. Look for bugs, style issues, missing tests.
3. Report findings with file:line references.
```

**Why it's broken:** The body lists what Claude already does when asked to review code. The skill's value-add is zero — Claude was going to do this anyway. The skill is purely additive (saves the user from typing "review this code"), and what's added is the most-generic version of the work. This kind of skill triggers, runs, and doesn't change Claude's behavior in any noticeable way.

**What fits:** Either delete the skill (Claude can review code without it), or make it transformative — name what's distinctive about how *this codebase* should be reviewed, what failure modes have actually shown up, what gets missed without explicit framing.

```yaml
---
name: code-review
description: Reviews code changes against the patterns most often missed in this codebase: silent error swallowing in async paths, misuse of the cache invalidation hook, over-eager retries on non-idempotent endpoints, and tests that mock the database layer instead of using the test fixtures. Use when reviewing a PR or recent changes.
---

The default Claude review catches obvious issues. This skill exists to redirect attention to what *we* keep getting wrong.

**Foreground these four patterns first:**

1. **Silent error swallowing.** Look for `catch` blocks that don't rethrow or log. We have a logger; bare `catch (e) {}` should always be a flag. Check async paths especially.
2. **Cache invalidation hook misuse.** `useCacheInvalidation` must be called with a stable key, not a closure-captured value that changes per render. We hit this every quarter.
3. **Non-idempotent retries.** `withRetry` is fine on GET; on POST/PATCH it requires an idempotency key. Flag any POST/PATCH wrapped in retry without the key.
4. **Mocked-database tests.** Tests that mock the DB layer pass and the migrations break. Push toward fixtures (`tests/fixtures/`) over mocks for anything that touches schema.

**After those, do general review:** correctness, naming, missing tests, security. But the four above are what we miss; lead with them.

If a PR is large enough that the four-pattern check alone would take more than a few minutes, suggest the user run `/ultrareview` instead and stop.
```

**The shift:** the first version *adds* a generic review checklist. The second version *redirects* attention to the four things this codebase actually gets wrong, with the generic review demoted to background. The recurring context cost of the second version is paying for reframing, not for facts Claude could have produced on its own.

The general principle: when a skill catches you writing things Claude would have done unprompted, ask whether the skill is supposed to be there at all, or whether it's supposed to be doing something more specific that the generic version drowns out.

## 14. The skill that becomes outdated and stays

```yaml
---
name: deploy
description: ...
---

1. Run the test suite
2. SSH to bastion.example.com
3. Pull the latest image with docker
4. Restart the service via systemd
5. ...
```

But the team migrated to Kubernetes six months ago, and `bastion.example.com` was deleted. The skill is now actively wrong — Claude follows the steps and fails.

**Why it's broken:** Skills are write-once-run-forever artifacts. Without maintenance, they drift. A wrong skill is worse than no skill, because Claude trusts it.

**What fits:** Treat skills like code. Review them when infrastructure changes, prune them when they're outdated, version them with the codebase. If a skill hasn't been used in three months, that's a signal to either delete it or update it.

## 15. The meta-skill that documents injection literally

The other anti-patterns in this file are design mistakes. This one is different: a *syntactic* mistake that prevents the skill from loading at all. It's a real failure mode I shipped before catching, and it deserves a place here because every future meta-skill (a skill that documents skill features) will hit it.

**The setup.** You're writing a skill *about* skills — a tutorial, a reference, an authoring guide, an anti-pattern catalog like this one — and you want to show how the dynamic injection feature works. So you draft something where the body literally renders the inline-injection syntax (a bang character immediately followed by a backtick-wrapped shell command, repeated as bullets like "Status: …" and "Diff: …"), and the prose mentions the bang adjacent to a backticked code span when describing what the trigger looks like.

The bad example is described in words rather than rendered here, because rendering it would break this very file. That's the whole point.

**Why it's broken:** The skill loader pre-processes every file in the skill directory at load time, scanning for two literal byte sequences:

1. An exclamation mark immediately followed by a backtick.
2. Three backticks immediately followed by an exclamation mark.

Wherever it finds either sequence, it tries to execute whatever comes next as a real shell command. The scan does not respect markdown context — it ignores inline code spans, headers, even nested code fences. A meta-skill drafted as described above would contain the literal triggers in several places (the description of the syntax, every example bullet, and the fenced-form description). The loader would attempt to run each command after a trigger; the permission check would fail; if any command isn't on the allowlist, the entire skill fails to load. Worse, when descriptions reference the literal placeholder text *<command>* inside a backtick-wrapped span after a bang, the loader hands that string to the shell, which produces parse errors like *parse error near '>'* because *<* is a redirect operator.

The user's symptom is `Error: Shell command permission check failed for pattern …` or `Shell command failed for pattern … parse error near …`, with the offending pattern being the next several lines of the meta-skill's prose surfaced back as if they were a single command.

**What fits:** Describe the syntax in words, not symbols. Use placeholder patterns for example skill bodies. Concretely, a fixed version of the same meta-skill would:

- Describe the inline form as "an exclamation mark immediately followed by a backtick-wrapped shell command" rather than rendering the literal syntax.
- Use a `[INJECT: <command>]` placeholder in any example skill body. A reader copying that example into their own non-meta skill replaces each `[INJECT: ...]` with the actual literal injection syntax.
- Describe the fenced form as "a code-fence opener of three backticks immediately followed by an exclamation mark, with commands one per line, closed by a normal three-backtick fence" rather than rendering an opener.
- Avoid putting an exclamation mark immediately adjacent to a backtick *anywhere* in the file — including inside inline code spans like a backticked-bang. The bytes matter; the markdown context doesn't protect.

The two operational rules:

1. Never write an exclamation mark immediately adjacent to a backtick anywhere in any skill file. Use the words "exclamation mark" or "bang" when describing the trigger.
2. Never write three backticks immediately followed by an exclamation mark. Use prose to describe the fenced opener.

After saving, grep the skill tree to verify. The grep command's patterns use backslash escapes inside single quotes so the source bytes never reintroduce the trigger:

```bash
grep -rn -e '!\`' -e '\`\`\`!' .claude/skills/<your-skill>/
```

Inside the single quotes, each `\` separates the bang from the backtick (and the backticks from each other) in the source bytes. The shell and grep both treat `\` before a non-special character as the literal next character, so the regex matches are equivalent to a bare bang-then-backtick pattern in the *target* file, while the *source* file containing this grep stays load-safe. Zero matches means the skill will load.

**Generalization:** any feature whose syntax involves the parser scanning for literal byte sequences (rather than tokens) creates this risk for a meta-skill that describes it. Right now the only such feature is dynamic injection, but the pattern of *describe-in-prose, render-via-placeholder, grep-before-shipping* generalizes. If a future Claude Code feature adds another byte-pattern trigger, the same disciplines apply.

## 16. The audit-shaped what should be continuous

```yaml
---
name: tailwind-token-audit
description: Audit a file, directory, or diff for Tailwind/design-system violations. Use when the user says "audit tokens", "check styling", "review against the design system", or after writing UI code that may have drifted.
---

# Tailwind token audit

[detailed token tables, regex patterns for raw colors, dark: overrides, arbitrary values, font-medium]

## Workflow

1. Resolve the target (path or git diff).
2. Read the SSOT (globals.css).
3. Scan each file for violations.
4. Group output by file with suggested fixes.
5. Don't auto-apply; let the user pick.
```

**Why it's broken:** This is *knowledge* — what tokens look like, what counts as drift, how to map a violation to a fix. It's wrapped as an after-the-fact audit ("run me, scan a diff, report violations"). But the user's actual problem isn't "I want to audit periodically" — it's "Claude keeps writing the violations I have to audit." The audit framing puts the discipline behind a manual trigger that has to be invoked, often from memory, after damage is done. Meanwhile Claude writes the next file with the same drift because the knowledge wasn't in context when it mattered.

The recurring tell: the user finds themselves typing "use shadcn best practices" or "audit tokens" repeatedly. They've encoded the knowledge but the skill's trigger model doesn't put it in context at the moment Claude needs it.

**What fits:** A path-scoped rule (or path-scoped skill) that auto-loads when Claude is touching files where the discipline applies. The same content, but loaded by virtue of being in a `.tsx` or `globals.css` file, not by the user remembering to invoke an audit. The rule encodes the same knowledge — semantic over raw, named utility over arbitrary value, default to existing tokens — and applies it while writing, not after.

If a batch-audit workflow is genuinely useful (scanning a directory pre-commit, checking a PR diff), keep it as a separate command-shaped skill that calls a script. But the discipline itself belongs in path-scoped context, not in a workflow.

**Generalization:** Whenever you see a skill whose name starts with "audit" or "check" or "review-against," ask whether the knowledge inside it should be auto-loaded for the files it audits. If yes, the audit is the wrong shape; the rule (or path-scoped skill) is. If only the *workflow* is what's worth invoking — "scan this entire repo and produce a report" — keep the audit shape but extract the knowledge into a rule the audit can also reference.

## 17. The directive skill that fights the framework

```md
## The stance

1. **Fluid before fixed.** Reach for `clamp()`, `min()`, `max()` before breakpoint cliffs. A type ramp, a section padding, a max-width — fluid by default.
2. **Layout primitive before custom layout.** Stack, Cluster, Sidebar, Switcher. Most layouts are one of these eight. Reach for the primitive before composing flex/grid by hand.
3. **Container query before viewport breakpoint.** Reusable components own their responsiveness via `container-type: inline-size`.
```

**Why it's broken:** Two related issues, same root cause.

The first is *voice*. Principle-shaped bullets ("X before Y") read as universal enforcement. The reader-Claude applies them whether or not the conditions for X-being-better-than-Y are present. "Fluid before fixed" gets cited when a button's padding doesn't need to be fluid; "container query before viewport breakpoint" gets cited on a page-level shell where the viewport is the relevant context. The bullet shape encodes a directive, not a judgment.

The second is *framework awareness*. When a skill encodes discipline that lives alongside a framework with its own conventions (Tailwind, shadcn, Next.js, Rails, Django), principle-shaped bullets quietly override framework defaults. A "fluid before fixed" rule applied to a Tailwind v4 codebase that hasn't configured a fluid ramp at `@theme` results in inline `text-[clamp(...)]` arbitrary utilities — a direct token-system bypass. The skill's discipline beats the framework's recommended pattern, and the codebase drifts.

The recurring tell: the user reads the skill back and says "but only when…" or "this would override how Tailwind is configured to work" or "I don't want this applied to every component." That's the bullets reading as universal when they should be conditional, and the discipline reading as override when it should be framework-respecting.

**What fits:** Two writing-voice changes that compound.

First, **condition-shaped bullets**. Same content, restated as judgment:

```md
1. **Fluid where it earns it, configured at the token layer.** When type or section padding genuinely should scale across viewports, configure the ramp at `@theme`. Don't sprinkle `text-[clamp(...)]` inline. Component-internal padding and uniform spacing usually don't need fluid.
2. **Reach for a named layout primitive when the simple form breaks.** If `flex flex-col gap-N` already works, don't refactor it. Reach for the primitive when responsiveness needs content-driven thresholds or you're rebuilding the same flex/grid math by hand.
3. **Container query when the component lives in slots of varying widths.** A card in both a sidebar and a hero is a real candidate; a page-level shell is not. Don't reach for `@container` because it's modern.
```

The bullets now read as judgment rather than enforcement — they tell the reader *when* the pattern earns its keep, not just that it does.

Second, **a stack-respect preamble** that names the relationship between the skill's discipline and the framework's defaults explicitly. Something like:

> Apply these principles within the host framework's conventions — don't fight them. Configure overrides at the token layer (Tailwind's `@theme`, the framework's equivalent), not as inline arbitrary utilities. Reach for the framework's own utilities first ([Tailwind's `transition-*` / `animate-*`](https://tailwindcss.com/docs/animation), shadcn's `tw-animate-css`, Base UI's `[data-starting-style]`) before pulling in additional libraries. When a principle below would require fighting a framework default, configure the framework — or skip the principle.

Without that preamble, the reader-Claude has no signal that the skill's discipline lives downstream of the framework's choices.

**Generalization:** Any skill that encodes discipline alongside an opinionated framework needs both moves. Condition-shaped bullets so the discipline reads as judgment per case; an explicit "respect the framework" preamble so framework-native patterns are the first reach. Principle-shaped bullets work fine for skills that *aren't* stack-aware (a workflow skill, a guarded action) — the failure mode is specific to knowledge skills and path-scoped knowledge skills that overlap with framework territory.
