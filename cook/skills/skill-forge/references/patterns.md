# Patterns: when to reach for which feature

The harness has a lot of features. Most skills only need one or two. This page is about choosing — what each feature is good at, where it shines, and where it actively hurts.

## Dynamic context injection (inline and fenced forms)

> **Authoring footgun.** Throughout this section, injection examples use the placeholder form `[INJECT: <command>]` instead of the literal syntax. The skill loader scans every skill file for the literal injection triggers (an exclamation mark immediately followed by a backtick, and three backticks immediately followed by an exclamation mark) and tries to execute whatever follows them as a real shell command. A meta-skill that renders the literal forms breaks at load time. See the "Authoring footgun" section in `SKILL.md` for the full explanation. When you copy these examples into a real (non-meta) skill of your own, replace each `[INJECT: ...]` with the actual literal injection syntax (look up the rendered form in the canonical skills doc).

**What it does:** Runs a shell command before the skill body is sent to Claude. The command's stdout replaces the placeholder. Claude sees data, not the command.

**Where it shines:**
- Inlining live state every invocation: `[INJECT: git status --short]`, `[INJECT: gh pr view --comments]`, `[INJECT: cat package.json | jq .scripts]`.
- Avoiding a "first, run X to find out Y" tool-call round-trip when Y is small and useful for almost every invocation.
- Pulling in environment context Claude couldn't otherwise infer: `[INJECT: uname -a]`, `[INJECT: node --version]`.

**Where it hurts:**
- Large outputs. The injected text becomes part of the recurring skill content. `[INJECT: git log --all]` could be 10,000 lines and now lives in your context for the rest of the session.
- Slow commands. Injection is synchronous before Claude sees anything. A 30s command means a 30s wait before the response starts.
- Stale-by-design data. Injection happens once at invocation; the data freezes. If you need fresh data on every turn, this isn't the mechanism — write a script the skill calls each time, or use the Monitor tool.
- Commands with side effects. Injection runs unconditionally on invocation. Don't put `[INJECT: git push]` in a skill.

**Disabling per policy:** `disableSkillShellExecution: true` in settings replaces every injection placeholder with `[shell command execution disabled by policy]`. Bundled and managed skills are exempt. Useful in managed environments to prevent untrusted skills from running shell on load.

## `context: fork` and `agent`

**What it does:** Runs the skill in a subagent with isolated context. The skill body becomes the subagent's *prompt*. Only the subagent's summary returns to the main conversation.

**Where it shines:**
- Investigation skills: research, audit, explore, summarize. The verbose work stays in the subagent.
- Read-heavy skills where you want Haiku-speed Explore: `agent: Explore` is fast and cheap for codebase walking.
- Skills that need to range across many files. Without forking, those reads land in the main thread.

**Where it hurts:**
- Skills that need conversation history. The subagent starts fresh. If you're in the middle of a complex implementation and want a skill to "fix the thing we just discussed," `context: fork` loses that context.
- Skills with no actionable task. If the body is "guidelines for using X," the subagent has nothing to do.
- Workflows. Don't fork a deploy. Workflows want main-thread execution because the user wants to see what happened.

**Picking the agent:**
- `Explore` — read-only codebase work, fast (Haiku). Default for `/research`, `/audit`, `/find`.
- `Plan` — for plan-mode-style analysis. Used by `/plan` and similar.
- `general-purpose` — when the work needs Edit/Write. Slower; use only when read-only won't do.
- A custom agent — when you need specific tool restrictions, persistent memory (`memory: project`), or a focused system prompt the subagent should run with. Define it in `.claude/agents/<name>.md` and reference it here.

## `paths:` glob

**What it does:** The skill auto-loads only when Claude is working with files matching the glob.

**Where it shines:**
- Path-scoped knowledge: forms conventions for `src/components/forms/**`, API conventions for `src/api/**`.
- Reducing description budget pressure: a path-scoped skill doesn't compete for budget when you're not in scope.

**Where it hurts:**
- Knowledge that's broadly applicable. Path-scoping a general code-style skill means it doesn't fire when the user asks "review this PR" without an open file.
- Skills you also want to invoke manually. `paths:` controls auto-loading; manual `/<name>` invocation still works regardless.

**Pattern:** combine with `disable-model-invocation: true` if you only want manual invocation, or leave it at default if you want both auto-load (when in scope) and manual.

## `allowed-tools`

**What it does:** Pre-approves the listed tools while the skill is active. Claude doesn't prompt for them.

**Where it shines:**
- Workflow skills that run the same 3–5 commands every time. Pre-approving avoids the per-step approval friction.
- Guarded actions where the tool scope *is* the safety mechanism.

**Where it hurts:**
- When set too broadly. `allowed-tools: Bash` pre-approves *everything*, defeating the safety. `allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)` does the work without surrendering control.
- When set on knowledge skills. They don't run tools; the field is meaningless.

**Best practice:** specify the narrowest patterns that actually work. Use `Bash(git commit -m *)` over `Bash(git commit *)` if you only want commits with messages. Use `mcp__slack__slack_send_message` for the specific MCP tool, not `mcp__slack__*` for the whole server.

**Trust dialog interaction:** for project skills checked into `.claude/skills/`, `allowed-tools` only takes effect after the workspace trust dialog is accepted. Review project skills before trusting an unfamiliar repo — a skill could pre-approve `Bash` blanket.

## Frontmatter `hooks:`

**What it does:** Attaches lifecycle hooks (PreToolUse, PostToolUse, Stop) that fire only while the skill is active.

**Where it shines:**
- Skills that need a hard guardrail to do their job — e.g., a `db-reader` skill that should never see `INSERT`/`UPDATE`/`DELETE` SQL while active. Hook validates each Bash command and exits with code 2 to block.
- Skills with deterministic post-conditions — e.g., a `commit-staged` skill that should always run lint, regardless of whether the model "felt like it."

**Where it hurts:**
- When the rule should hold session-wide, not just during this skill. Put it in `.claude/settings.json` instead.
- When the body is the right place. `hooks:` is for *enforcement*; the body is for *guidance*. If the rule is advisory, write it in the body.

**Plugin caveat:** plugin subagents don't support the `hooks:`, `mcpServers:`, or `permissionMode:` fields. If you're packaging a skill into a plugin and it relies on these, document the limitation.

## Bundled scripts (`${CLAUDE_SKILL_DIR}/scripts/...`)

**What it does:** A script bundled with the skill, called from the body. The script runs; its output is the result Claude sees or the file Claude opens.

**Where it shines:**
- Deterministic operations: HTML report generation, fixed-format converters, repeatable transforms.
- Operations that would be re-derived by the model on every invocation. Bundling once saves tokens on every use.
- Operations that need to run identically across users — same Python, same logic, same output format.

**Where it hurts:**
- Judgment-heavy work. Code review, refactoring, summarization — these benefit from model interpretation, not a fixed script.
- Operations that vary by project. A script that assumes `npm` won't work for `pnpm` users; either branch in the script or leave it to the model.

**Reference pattern:** `python3 ${CLAUDE_SKILL_DIR}/scripts/visualize.py "$ARGUMENTS"`. The `${CLAUDE_SKILL_DIR}` substitution resolves correctly whether the skill lives at user, project, or plugin scope.

**Free in context:** scripts aren't loaded into Claude's context — they're executed. Bundle generously when the work is deterministic.

## Defer-points (composing with other skills)

**What it is:** When a skill's domain overlaps another skill's authoritative territory, the cleanest move is a named defer rather than a duplicate. The SKILL.md body cites the other skill explicitly; the user (and the model) know what's owned vs deferred.

**Where it shines:**
- Single-source-of-truth skills (see kind 2a in `skill-kinds.md`) that own a domain but have to coexist with adjacent canonical skills.
- Stack-specific applied skills that should compose with stack-agnostic philosophy skills (e.g., a `design-engineer` skill that defers to a generic animation-philosophy skill for the *what to animate and how* layer).
- Skills that update on different cadences. Defer to the other skill so updates flow through automatically; duplication rots.

**The pattern, in body prose:**

```markdown
## Composing with always-loaded skills

This skill is the single source of truth for X — except where two other skills are canonical:

- `<other-skill-1>` owns <sub-domain>. **This skill defers there** when <trigger condition>.
- `<other-skill-2>` owns <sub-domain>. **This skill defers there** when <trigger condition>.

This skill also composes with `<co-located-skill>` (same auto-load surface) — that one owns <narrow concern>; cross-reference, don't duplicate.
```

**Where it hurts:**
- **Implicit defer.** "For motion craft, see Emil." With no skill name, the model doesn't know there's a separate skill to invoke. Always name it: "invoke `emil-design-eng`" or "see the `emil-design-eng` skill."
- **Defer where you should cross-reference.** If both skills auto-load on the same files (`paths:` overlap), they're already composing — write a short cross-reference line, not a full defer-point block. Reserve full defer-points for skills that don't auto-trigger together.
- **Defer-as-excuse for thinness.** A skill that defers most of its content and keeps only a triage layer is a dispatcher, not an SoT skill. If that's the actual shape, use the **Dispatcher** kind (kind 7).

**Three relationships, three prose shapes:**

| Relationship | Other skill auto-loads? | Right shape |
| :-- | :-- | :-- |
| Co-located authority (same `paths:`) | Yes | One-line cross-reference: "for token discipline, see `shadcn-tailwind`." |
| Adjacent canonical authority | No | Full defer-point block: "for animation craft, invoke `emil-design-eng`." |
| Optional companion | Sometimes | Mention once with the conditional: "if `<companion>` is installed, …" |

Worked example: `design-engineer` defers to `emil-design-eng` for animation philosophy (full block — different paths, must invoke), defers to `web-design-guidelines` for Vercel-specific review (full block — different trigger), and cross-references `shadcn-tailwind` (one line — same `paths:`, already composing).

## When to combine

Combinations that work well:

- **`context: fork` + `agent: Explore` + `allowed-tools: Bash(rg *) Bash(git log *)`** — a fast, scoped read-only investigator. The whole thing runs in a subagent on Haiku, never bothers the main thread.
- **`disable-model-invocation: true` + `allowed-tools: <narrow>` + dynamic injection** — a workflow skill with live state that pre-approves only the commands it runs.
- **`paths:` + knowledge body** — auto-loads in-scope, doesn't compete for description budget out-of-scope.
- **Bundled script + dynamic injection of script output** — `[INJECT: python3 ${CLAUDE_SKILL_DIR}/scripts/check.py]`. The script runs at invocation, its output enters context. Useful when the script's job is to produce status data Claude needs to reason over.

Combinations that fight:

- **`disable-model-invocation: true` + `paths:`** — `paths:` does nothing because Claude can't auto-load anyway. Pick one.
- **`context: fork` + extensive `allowed-tools` for the main thread** — the main thread's tools don't matter; the agent's tools do. Use the agent's permission mode and tool list, not blanket `allowed-tools`.
- **Bundled script + body that re-derives the script's logic** — pick: the script does the work, or the model does. Splitting causes drift.

## Named instruction patterns (from agentskills.io)

The harness features above are mostly Claude-Code-specific. The instruction *shapes* in this section are from the open agentskills.io best-practices guide and apply to any skill body — Claude Code or open-spec. They're worth naming because each one fits a recognizable failure mode the body alone wouldn't fix.

### Gotchas section

**What it is:** A short, named list of environment-specific facts that defy reasonable assumptions — concrete corrections to mistakes the agent will otherwise make. Not general advice ("handle errors carefully"). Concrete hostile facts ("the `users` table uses soft deletes — `WHERE deleted_at IS NULL` or you'll see deactivated accounts").

**Where it shines:** Whenever the skill encodes knowledge about a system whose surface contradicts itself. Mismatched IDs across services. Endpoints whose names suggest behaviour they don't have. Schemas whose foreign keys go to non-obvious tables. The discipline: when an agent makes a mistake you have to correct, add the correction to the gotchas section. That's the most direct iterative improvement available.

**Where it hurts:** When promoted to general advice. "Handle errors gracefully" isn't a gotcha; it's a platitude. Gotchas are fact-shaped.

**Pattern (from agentskills.io):**

```markdown
## Gotchas

- The `users` table uses soft deletes. Queries must include
  `WHERE deleted_at IS NULL` or results will include deactivated accounts.
- The user ID is `user_id` in the database, `uid` in the auth service,
  and `accountId` in the billing API. All three refer to the same value.
- The `/health` endpoint returns 200 as long as the web server is running,
  even when the database connection is down. Use `/ready` for full health.
```

Keep gotchas in `SKILL.md` itself, not behind a `references/` link — the agent has to see them *before* hitting the situation, and a "load this if X" instruction can miss the trigger.

This skill's "Authoring footgun" section is itself a gotchas section. Worked example: a single hostile fact described concretely, with the operational rule and a verification step.

### Templates for output format

**What it is:** A literal markdown skeleton the agent fills in, instead of prose describing the desired structure. Models pattern-match against concrete shapes more reliably than they match against descriptions of shapes.

**Where it shines:** Reports, analyses, reviews — anything where a consistent layout is part of the value. A template gives the model a frame; the work is filling sections, not deciding sections.

**Where it hurts:** When the output is genuinely free-form (a code refactor, a one-shot answer). A template there imposes ceremony that doesn't earn its keep.

**Pattern:**

````markdown
## Report structure

Use this template, adapting sections as needed:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```
````

For long templates, or templates needed only in some cases, store them in `assets/` (open-spec directory) and reference from `SKILL.md` so they only load when relevant.

### Validation loops

**What it is:** Do-the-work → run-a-validator → fix-issues → re-validate. The validator can be a script, a reference document the agent checks against, or a self-check prompt. The pattern's job is to keep the agent from declaring done while the work is still wrong.

**Where it shines:** Output that's verifiable but easy to get wrong on the first pass — generated code, structured data, content that has to satisfy a schema. The validator catches what the agent missed.

**Where it hurts:** Output where there's no objective check. Don't fake a validation loop with "make sure the writing is good" — that's not a validator.

**Pattern:**

```markdown
## Editing workflow

1. Make your edits.
2. Run validation: `python scripts/validate.py output/`
3. If validation fails:
   - Review the error message.
   - Fix the issues.
   - Run validation again.
4. Only proceed when validation passes.
```

The validator can also be a reference document — instruct the agent to check the work against `references/checklist.md` before finalizing. Either form works; the operative discipline is *don't move on until validation passes*.

### Plan-validate-execute

**What it is:** For batch or destructive operations, force the agent to draft an intermediate plan in a structured format, validate the plan against a source of truth, and only then execute. Errors caught at the plan stage are free; errors caught at execution time aren't.

**Where it shines:** Form filling, batch updates, schema migrations, anything where the unit of work is "for each item, do X." Validation at plan time catches naming mismatches, missing required fields, type incompatibilities — before any side effects fire.

**Where it hurts:** One-shot operations where the planning overhead exceeds the work itself.

**Pattern (from agentskills.io's PDF-form example, generalized):**

```markdown
## Workflow

1. Extract the source-of-truth shape: `python scripts/analyze.py input` → `truth.json`
   (lists every required field, type, and constraint)
2. Create `plan.json` mapping each field to its intended value.
3. Validate: `python scripts/validate.py truth.json plan.json`
   (checks that every field name exists in the truth, types are compatible,
   required fields aren't missing)
4. If validation fails, revise `plan.json` and re-validate.
5. Execute: `python scripts/execute.py input plan.json output`
```

Step 3 is the load-bearing part. The validator's error messages should give the agent enough to self-correct: `Field 'signature_date' not found — available fields: customer_name, order_total, signature_date_signed`. Vague errors waste a turn.

### Match specificity to fragility (calibration discipline)

**What it is:** Not every part of a skill needs the same level of prescriptiveness. Match the specificity to how fragile the underlying task is.

- **Give the agent freedom** when multiple approaches are valid and the task tolerates variation. Explain *why* rather than dictating *how*. A code-review skill can list what to look for without prescribing the order or the exact tools.
- **Be prescriptive** when operations are fragile, consistency matters, or a specific sequence must be followed. Database migrations get exact commands. "Run this exactly: `python scripts/migrate.py --verify --backup`. Do not modify."

Most skills mix both. Calibrate each section independently — it's fine for one section to be loose-and-explanatory and the next to be exact-and-imperative.

**Anti-pattern:** A "menu of options" where five tools could work. Pick a default; mention alternatives briefly. `Use pdfplumber. For scanned documents, fall back to pdf2image with pytesseract.` beats `You can use pypdf, pdfplumber, PyMuPDF, or pdf2image — choose the one that fits your needs.`

## When to use the Monitor tool inside a skill

Monitor (added v2.1.98) runs a command in the background and streams each output line back to Claude as it arrives. From inside a skill, you can ask Claude to spawn a monitor — a useful shape for `/loop`-style watchers and `/babysit-ci`-style poll loops.

Where it fits a skill:
- The skill's job is to react to events as they happen — log lines, file changes, status pings.
- The skill is autonomous enough to keep working until told to stop.

Where it doesn't:
- Synchronous skills where the user is waiting for a response. Monitor is for sustained background watching.
- Skills that need a quick one-shot status check. A regular `Bash` call is simpler.

Monitor uses Bash permission rules, so `allowed-tools: Bash(...)` patterns apply. Note: Monitor isn't available on Bedrock, Vertex AI, or Foundry, and is disabled when `DISABLE_TELEMETRY` or `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` is set.
