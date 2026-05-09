# The seven skill kinds

Different kinds of skills want different bodies. This is the catalog of structural archetypes — pick the kind first, then write to its template, not the other way around.

The kinds are:

1. **Workflow** — runs a multi-step procedure with side effects.
2. **Knowledge** — adds reference material Claude applies when relevant.
3. **Guarded action** — single-action skill with strict tool scope (subset of Workflow, but worth calling out).
4. **Forked research** — investigation that returns a summary, runs in a subagent.
5. **Path-scoped knowledge** — knowledge but only when working in certain files.
6. **Toolkit** — thin body that points at bundled scripts and examples Claude calls into.
7. **Dispatcher** — 2+ related jobs unified by triage, with a quick-dispatch table at the top of the body.

## 1. Workflow

A workflow skill captures a procedure you keep typing into chat: deploy, release, commit-with-checklist, generate-from-template, run-the-thing.

**Frontmatter pattern:**

```yaml
---
description: <action verb> <object>. Use when <natural phrasing> ...
disable-model-invocation: true
allowed-tools: <narrow list>
---
```

**Body shape:**

- Brief context (one paragraph at most).
- Numbered, imperative steps.
- Branching for the most common edge cases ("if the diff is empty, stop").
- Optional: dynamic context injection at the top to inline live state. Examples in this file use a `[INJECT: <command>]` placeholder rather than the literal injection syntax — see the authoring-footgun section in `SKILL.md` for why.

**Why `disable-model-invocation: true`:** Workflows have side effects. You don't want Claude inferring "the user probably wants me to deploy now." The user types `/deploy`; that is the trigger.

**Why `allowed-tools` is narrow:** A workflow that says `Bash` blanket-approves anything, defeating the purpose of pre-approval. Approve the four or five commands the workflow actually runs.

**Example: `/release-patch`**

```yaml
---
description: Cuts a patch release. Bumps the patch version, generates the changelog from commits since the last tag, commits the bump, tags it, and pushes. Use when the user says "ship a patch", "release a patch", "cut a release", or asks to bump the version with no breaking changes.
disable-model-invocation: true
allowed-tools: Bash(git tag *) Bash(git push *) Bash(git log *) Bash(npm version patch) Bash(npm pkg get *)
---

## Current state
- Last tag: [INJECT: git describe --tags --abbrev=0]
- Commits since: [INJECT: git log $(git describe --tags --abbrev=0)..HEAD --oneline]

## Steps
1. Run `npm version patch` to bump the version.
2. Generate a CHANGELOG.md entry for the new version, listing the commits above grouped by type (feat/fix/chore).
3. Commit with message `chore: release v<new-version>`.
4. Tag the commit with `v<new-version>`.
5. Push the commit and the tag.
6. Show the user the new tag.

If there are no commits since the last tag, stop and report that there's nothing to release.
```

## 2. Knowledge

A knowledge skill is reference material Claude applies in context. Conventions, patterns, style guides, domain glossaries.

**Frontmatter pattern:**

```yaml
---
description: <what knowledge> + <when relevant>. Use when ...
---
```

**Body shape:**

- Declarative, not procedural. Bullets of facts, not steps.
- Concrete examples over abstract rules.
- "When you do X, do Y" framing where the *do X* part actually matches what Claude is being asked to do.

**Why no `disable-model-invocation`:** Knowledge skills are most valuable when Claude pulls them in automatically while working. Manual invocation defeats half their purpose.

**Why no `allowed-tools`:** Knowledge skills don't run; they inform.

**Example: `/our-api-conventions`** (or simply auto-triggers when relevant)

```yaml
---
description: Conventions for our REST API endpoints — URL shape, response envelope, error codes, pagination, idempotency. Use when implementing or modifying an endpoint, reviewing an API change, or generating a client SDK.
---

# API Conventions

## URL shape
- Versioned: `/v2/<resource>` (kebab-case for multi-word resources: `/v2/team-members`).
- Resources are plural nouns; subresources nest: `/v2/teams/{id}/members`.
- Actions on a resource use POST to a sub-path, not new verbs in the URL: POST `/v2/orders/{id}/cancel`, not POST `/v2/cancel-order`.

## Response envelope
- Success: `{"data": ..., "meta": {...}}`.
- Error: `{"error": {"code": "<machine-code>", "message": "<human-message>", "details": {}}}`.
- Pagination meta: `{"total": N, "cursor": "..."}` — cursor-based, not offset-based.

## Status codes
- 400 for validation errors with `details.fields[]` describing each.
- 401 for missing/invalid auth; `code: "auth/unauthorized"`.
- 403 for authenticated-but-not-authorized; `code: "auth/forbidden"`.
- 404 for missing resources; do not 404 to mask 403.
- 409 for state conflicts (e.g., already-canceled order).
- 422 for semantic validation failures (request was well-formed but rejected by business rules).

## Idempotency
- Mutating endpoints accept `Idempotency-Key` header; reuse returns the original response.
- Read endpoints are idempotent by definition; do not require the header.

## Examples
- Creating a team member:
  - `POST /v2/teams/abc/members` with `{"user_id": "...", "role": "editor"}`.
  - Response: `201` with `{"data": {"id": "...", "team_id": "abc", "user_id": "...", "role": "editor"}}`.
```

### 2a. Knowledge — single-source-of-truth variant

Some knowledge skills aren't lookup material; they're meant to be *the* place a domain lives. The user wants one handle to reach for, not three skills to compose mentally. Frequent cases: a stack-specific design-engineering skill, an internal-platform conventions skill, a product domain glossary that owns the lingo.

The shape that works:

- **SKILL.md is compact** (~200–300 lines). It carries the stance, the hard rules, and the reflex moves — the always-on layer. Fits in the 5K compaction budget without strain.
- **`references/<topic>.md` carries the depth.** One file per axis (e.g., layout, motion, polish, taste, checklist). Loaded only when pointed at by SKILL.md, so depth is free-of-budget unless opened.
- **Defer-points are explicit and named.** Where another canonical skill owns a sub-domain, the SoT skill cites it ("for X, invoke `that-skill`") instead of duplicating. The SoT promise is "single handle for the domain"; it doesn't have to mean "single body for everything inside." See the defer-point pattern in `references/patterns.md`.
- **`paths:` auto-load** so the skill surfaces wherever the work lives. SoT only matters if it triggers reliably; description-only triggering is too easy to miss.
- **Reference map at the bottom of SKILL.md** is the navigation aid. Each reference gets one line — what it covers and when to open it.

Three constraints to enforce:

1. **No reference orphans.** Every file in `references/` is pointed at from SKILL.md (`bin/preship-check` enforces this).
2. **No defer overlap.** If you defer to another skill for a sub-domain, don't *also* duplicate that sub-domain in your own references. Pick one home.
3. **The SoT promise is to the user, not the model.** Claude sees the description, not the user's mental model. Make the description say it explicitly: "Single source of truth for X on stack Y."

Worked example: `design-engineer` in this harness. SKILL.md is the disposition + master rules + reflex stack (~206 lines). References cover layout / fluid / motion-base-ui / polish / taste / checklist (~1,724 lines combined, opened on demand). Animation craft defers to `emil-design-eng`; Vercel review checklist defers to `web-design-guidelines`; token discipline cross-references `shadcn-tailwind` (which auto-loads on the same files). Each defer-point is named in the body — the user (and the model) know what's owned vs deferred.

When *not* to use this variant: the domain is a thin slice (one rule set, no axes) — a flat knowledge skill is simpler. The references would each be 30 lines — just put them in SKILL.md. There isn't real composition with other skills (it's not deferring; it's just one big knowledge skill — write it as one).

## 3. Guarded action

A guarded action is a special case of workflow: a single-step action with side effects, where the safety comes from `allowed-tools`. Posting to Slack, sending an email, opening a PR comment.

**Frontmatter pattern:**

```yaml
---
description: <single action> + <strict trigger>. Use when ...
disable-model-invocation: true
allowed-tools: <very narrow>
---
```

**Body shape:**

- One paragraph: what the action does, what it doesn't do.
- One short recipe: the exact command, with substitutions.
- Maybe one safety rail at the end ("never do X").

**Why split this from Workflow:** Guarded actions don't have multiple steps. The body is short. Treating them as workflows leads to padded SKILL.md files with imaginary "steps."

**Example: `/post-update`**

```yaml
---
description: Posts a one-line status update to the team's #engineering Slack channel. Use only when the user explicitly asks to post an update to Slack — never as a side effect of finishing other work. Pass the message as an argument.
disable-model-invocation: true
allowed-tools: mcp__slack__slack_send_message
---

Post a single message to channel `C019ABCXYZ` (#engineering).

Message body: $ARGUMENTS

Do not add prefixes, emojis, or formatting unless they are in the user's message. Do not summarize prior work into the post.
```

## 4. Forked research

A forked-research skill investigates something and returns a summary. The investigation itself runs in a subagent's context, so verbose tool output never enters the main thread.

**Frontmatter pattern:**

```yaml
---
description: <investigates X> + <triggers>. Returns only a summary.
context: fork
agent: Explore  # or Plan, or general-purpose, or a custom agent name
allowed-tools: <whatever the agent needs>
---
```

**Body shape:**

- A *task prompt* for the subagent, not a list of instructions for the user.
- Clear scope: what's in scope, what's not.
- A clear stopping condition.
- Output format: what the summary should look like.

**Why `agent: Explore`:** Read-only investigation gets faster, cheaper, and tighter on Haiku-backed Explore. Use `Plan` for plan-mode-style analysis; `general-purpose` only when the work needs Edit/Write.

**Why a stopping condition matters:** Subagents that don't know when to stop will exhaust their context window. Tell them.

**Example: `/grep-secret`**

```yaml
---
description: Hunts the codebase for accidentally-committed secrets, API keys, and credentials. Use when the user asks for a secret scan, suspects something was leaked, or before publishing a repo. Returns only matches with file:line and a confidence rating.
context: fork
agent: Explore
allowed-tools: Bash(rg *) Bash(git log *)
---

Search the working tree and git history for likely-secret patterns:

- AWS access keys: `AKIA[0-9A-Z]{16}`
- GitHub PATs: `ghp_[A-Za-z0-9]{36}` and `github_pat_[A-Za-z0-9_]{82}`
- Generic high-entropy strings of 32+ chars assigned to variables named *secret*, *token*, *api_key*, *password*, *credential*.
- Private keys: `-----BEGIN [A-Z ]+ PRIVATE KEY-----`.

In addition: review .env, .env.*, secrets/, config/, and any .yaml/.yml under deploy/ or k8s/.

Stop after scanning the working tree and the last 200 commits. Do not exhaustively walk all history.

Report:
- Confirmed matches (high confidence): `<file>:<line>` with the pattern matched.
- Likely false positives (medium confidence): same format, marked.
- Files reviewed but clean: aggregate count only.

Do not print the matched secret value. Print the file path and the variable name.
```

## 5. Path-scoped knowledge

This is technically a knowledge skill, but the activation pattern matters enough to call out.

**Frontmatter pattern:**

```yaml
---
description: <knowledge> + <where it applies>. Use when working with files in <area>.
paths:
  - <glob>
---
```

**Body shape:** Same as a knowledge skill — declarative, concrete examples.

**Why `paths:` over a `.claude/rules/` file:** Skills can be invoked manually with `/<name>` and surfaced in the `/skills` menu; rules can't. Use the rules file for things that should always load when in scope; use a path-scoped skill when there's also value in being able to invoke it explicitly (`/our-api-conventions`).

**Example: `/forms-conventions`**

```yaml
---
description: Form-handling conventions for the React app — validation library, error display patterns, accessibility requirements. Use when editing any form component.
paths:
  - "src/components/**/Form*.tsx"
  - "src/components/forms/**/*.tsx"
  - "src/hooks/use*Form*.ts"
---

## Validation
- Use `react-hook-form` with `zod` resolver. No other libraries.
- Schemas live next to the form component as `<Form>.schema.ts`.

## Error display
- Inline errors below each field, in `<ErrorText>` (red, sm, role="alert").
- Submit-time errors above the submit button, in `<FormBanner variant="error">`.
- Never use `alert()` or toasts for validation errors.

## Accessibility
- Every input has an associated `<Label>`. No bare `<input>`.
- Error messages set `aria-describedby` on the input.
- Submit button shows a spinner via `<Button loading>`, never disables without a visible reason.
```

## 6. Toolkit

A toolkit skill bundles scripts and/or examples that Claude calls into. The body's job is not to encode procedure or knowledge; it's to teach Claude *how to invoke the toolkit and when*. The recurring context cost is small (the body is thin) but the bundled artifacts can be substantial — they execute, they don't load.

Anthropic's own `webapp-testing` skill is the canonical example: a `scripts/with_server.py` for managing server lifecycle plus an `examples/` directory of reference Playwright scripts. The body is ~80 lines of orientation; the value is in the scripts.

**Frontmatter pattern:**

```yaml
---
name: <name>
description: Toolkit for <doing X> using <tool/library>. Use when <natural triggers>.
when_to_use: |
  - "<trigger phrase>"
  - "<trigger phrase>"
---
```

Usually no `disable-model-invocation` (you want Claude to auto-pull the toolkit when relevant), no `allowed-tools` (or narrow if the bundled scripts are deterministic enough to pre-approve), no `paths:` (toolkits are usually generic).

**Body shape:**

- One paragraph orienting the reader: what the toolkit does, when to reach for it.
- A decision tree or flow: which script to call for which situation.
- Crisp invocation examples (always with `--help` first, so Claude doesn't ingest the script source).
- Optionally a "common pitfalls" section pointing at non-obvious failure modes.
- A reference list of bundled scripts and what each one does in one line.

**The black-box-script discipline:** the whole point of bundling is that scripts execute without loading into context. Tell Claude: *"DO NOT read the source until you try running the script first and find that a customized solution is absolutely necessary. These scripts can be very large and thus pollute your context window."* (Phrasing from webapp-testing — worth borrowing verbatim.) This discipline is what makes the toolkit kind cheap; without it, Claude will read the script source, which defeats the bundling.

**Example skeleton: `/screenshot-flow`**

```yaml
---
name: screenshot-flow
description: Toolkit for capturing labeled screenshot sequences of a user flow through a local web app. Use when the user asks for screenshots of a workflow, wants to document a UI flow, or needs visual reference for a bug report.
when_to_use: |
  - "screenshot the X flow"
  - "capture the steps for Y"
  - "document this UI"
  - "I need pictures of the onboarding flow"
---

# Screenshot Flow Toolkit

Captures a labeled sequence of screenshots through a user flow in a local web app. Output is a directory of numbered PNGs plus an `index.html` that displays them inline.

## Scripts

- `scripts/capture.py` — Drives Playwright through a JSON-described flow and writes PNGs. Run `python scripts/capture.py --help` for usage.
- `scripts/render-index.py` — Generates the inline gallery HTML from a capture directory.

## Decision flow

```
User asks for flow screenshots → Is the server already running?
    ├─ Yes → python scripts/capture.py --flow <flow.json> --out <dir>
    └─ No → Use webapp-testing's with_server.py to wrap the capture invocation
```

## Pitfalls

- Always wait for `networkidle` before each screenshot. The capture script does this by default, but a `--no-wait` flag exists for fully static pages — don't use it on dynamic ones.
- The capture script writes screenshots in numeric order with leading zeros (`01.png`, `02.png`). If you reorder steps, re-run the whole flow rather than renaming files.

## When this toolkit doesn't apply

- The flow needs auth that isn't pre-set in storage state. Use webapp-testing for the auth dance, then this for the captured flow.
- The user wants a video, not still images. Different toolkit.
```

**Why this is its own kind:** the body doesn't fit the workflow shape (no procedure with side effects), the knowledge shape (the value isn't reference content), or any of the other three. The structural pattern — thin body, scripts carry the value, "don't read the source unless you have to" — is distinct enough to deserve a name.

**When NOT to use the toolkit kind:** when the work is genuinely reasoning-heavy (judgment calls, design decisions, code review). Toolkits ossify; they're for deterministic infrastructure. If your scripts are doing things a model could do better with judgment, you're in the wrong kind — that's knowledge or workflow.

## 7. Dispatcher

A dispatcher skill bundles 2+ related jobs under one roof, sharing the triage logic and dispatching to the right job from observable signals. The harness's own forges — `skill-forge`, `hook-forge`, `rule-forge`, `claude-md-forge` — are dispatchers. Anything that asks "is this a creation, audit, or update task?" before doing the work fits this shape.

**Frontmatter pattern:**

```yaml
---
description: <triages X kind of work across N jobs>. <N> jobs: <job-1>, <job-2>, <job-3>. <Differentiator vs adjacent surfaces and existing tools.>
when_to_use: |
  Triggers: <phrasings for each job>
paths:
  - <glob for the artifact type the dispatcher works on>
---
```

`paths:` is common because dispatchers usually have a natural artifact scope (a SKILL.md, a hook config, a CLAUDE.md). Auto-loading when those files are open is high-precision.

**Body shape:**

- **Quick-dispatch table at the top** — one screen, observable signals to the job. The user's natural-language phrasing plus 1–2 repo signals (a file exists, a file is over N lines, a directory is non-empty) should pick the job in a glance.
- **Shared triage section** that all jobs use — the cross-cutting decision logic.
- **Per-job sections** with the steps for that job, deferred-references for depth.
- **Closing checklist** that applies across jobs.

**Why this is its own kind:** the body's first job is *picking which job*. That's a structural difference from a single workflow (one set of steps), a knowledge skill (passive reference), or a toolkit (thin pointer to scripts). Forcing a dispatcher into the workflow kind produces a long preamble before the user sees anything actionable; forcing it into knowledge loses the per-job procedural depth.

**Why one skill, not N:** description budget. Each visible skill consumes its share of the 1,536-character cap per session. Three discrete skills (`bootstrap-X`, `audit-X`, `tune-X`) cost three description-budget hits and split the user's discovery surface. One dispatcher costs one and is easier to find.

**Body discipline:** if the dispatch table needs paragraphs of reasoning, you've got two skills, not one. Dispatch should be readable in a glance. The N jobs should genuinely share triage — not just topic.

**Defer to other forges:** dispatchers often *produce* artifacts whose own design has a forge. When the artifact is a hook, hand off to `hook-forge`. When it's a path-scoped rule, hand off to `rule-forge`. When it's a skill, hand off to `skill-forge`. The dispatcher does triage and shape; the artifact-specific forge does the artifact's own design.

**Example: `/claude-md-forge`** (sketch — see the actual skill for the full body)

```yaml
---
name: claude-md-forge
description: Designs CLAUDE.md and adjacent project-instruction files. Three jobs: bootstrap (new repo or thin /init output), audit (existing CLAUDE.md is bloated, stale, or wrong-surface), tune (recent-session learnings need to land somewhere correct). Different from /init (generic scaffold) and claude-md-improver plugin (additive grading) — restructures by surface and writes rules with reasons.
when_to_use: |
  Triggers: "set up CLAUDE.md", "audit my CLAUDE.md", "add this to CLAUDE.md", ...
paths:
  - "**/CLAUDE.md"
  - "**/AGENTS.md"
  - "**/.claude/rules/**"
harness-targets: [claude]
---

## Quick dispatch — which job is this?

| Signal | Job |
| :--- | :--- |
| No CLAUDE.md, or only the literal `/init` template | Bootstrap |
| CLAUDE.md exists, >200 lines, or feels generic | Audit |
| CLAUDE.md exists, recent session surfaced X | Tune |

## The shared triage [six surfaces table — every job uses this]

## Job 1 — Bootstrap [steps]

## Job 2 — Audit [steps]

## Job 3 — Tune [steps]
```

The point: the body opens with the dispatch table, then a shared triage every job uses, then per-job sections.

**When NOT to use the dispatcher kind:**

- The jobs share nothing beyond topic. Two unrelated workflows in one skill confuse the description and weaken triggering. Make them separate skills.
- There's actually only one job, just multiple trigger phrasings. That's a knowledge or workflow skill with a generous `when_to_use` block — not a dispatcher.
- The "jobs" are sequential phases of one workflow. That's still one workflow skill, just with longer steps.

**Examples in the wild:** `skill-forge` (triage / classify / shape), `hook-forge` (event / determinism / handler triage + design), `rule-forge` (triage four nearby surfaces / write the rule), `claude-md-forge` (bootstrap / audit / tune).

## Picking when the kind is ambiguous

A skill that *both* answers questions about an area *and* runs a workflow in that area is two skills, not one. Split them. Otherwise the description has to do double duty and triggers poorly for either purpose. Two narrow skills beat one greedy skill.

## Within any kind: additive vs transformative

Within each kind, two flavors of skill exist, and the distinction matters more than the kind itself for whether the skill earns its recurring context cost.

**Additive skills** add knowledge or shortcuts. Claude after the skill knows more, or types less, or has a few commands pre-approved. The unit of cognition is unchanged — Claude is still thinking about the same things, just with more facts available.

**Transformative skills** shift what's foreground vs background. Claude after the skill is attending to a different layer of the work. The mechanics get pushed down; a higher-order question gets pulled up.

Concrete contrasts:

| Additive | Transformative |
| :--- | :--- |
| `/deploy` lists 5 commands | `/deploy` says "the work here is deciding whether to ship; mechanics are X. Things to verify before deciding: a, b, c." |
| `/api-conventions` lists URL patterns and status codes | `/api-conventions` frames "every endpoint has to answer four questions: what does it own, how is it idempotent, how does it fail, how is it discovered." |
| `/audit-deps` lists vulnerability patterns to grep for | `/audit-deps` frames "supply chain risk has three dimensions — known advisories, abandonment, single-maintainer concentration — and the report should triage by which dimension dominates." |

Both columns are valid. Both can ship. The right-hand column tends to age better and survive compaction better because what's recurring in context is *a way of seeing*, not a checklist that's already been worked through. A user reading the right-column skill in a fresh session knows what *kind of attention* to apply; a user reading the left-column skill in a fresh session knows what to do mechanically and may stop there.

Three quick tests:

1. **The "what becomes thinkable" test.** After this skill is invoked, what becomes easier to think about that wasn't before? If the answer is "nothing — Claude just runs faster," the skill is additive. If the answer is "Claude can now ask whether-to-ship questions instead of how-to-ship questions," it's transformative.
2. **The "turn 8" test.** Imagine reading the skill body on turn 8 of a long conversation, after the initial work is done. Does it still steer thinking? Or has it become a checklist whose contents already happened? Additive bodies decay; transformative bodies keep working.
3. **The "skill-as-frame" test.** If a colleague asked you what this skill *does for the work*, could you answer in one sentence? If your sentence is about mechanics ("it commits things"), it's additive. If your sentence is about attention ("it lets the user think about whether the diff is coherent instead of remembering to run lint"), it's transformative.

When you suspect a skill is purely additive and that's the right call (e.g., you genuinely just want a typing shortcut), ship it — with `disable-model-invocation: true` and narrow `allowed-tools` so the description doesn't compete for budget and the recurring cost stays cheap. Additive skills carry their weight when they're cheap and explicit.

When the skill is doing real cognitive work, push for transformative framing. The body that elevates the question is doing more per token than the body that lists steps.
