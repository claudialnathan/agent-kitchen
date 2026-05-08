---
name: skill-forge
description: Designs a skill for Claude Code by triaging whether a skill is even the right tool, classifying which kind of skill fits, and shaping the SKILL.md to current harness affordances. Use when the user wants to create, design, or refactor a skill, asks "should this be a skill?", says they want to capture a workflow they keep retyping, or is building anything in `.claude/skills/`. Also use when reviewing an existing skill that under-triggers, over-triggers, or feels generic.
when_to_use: |
  Triggers: "make a skill for X", "turn this into a skill", "I keep typing the same thing", "this should be reusable", "design a /command for Y", "review my skill", "why isn't my skill triggering", "convert my CLAUDE.md section into a skill", "build a skill that does Z".
  Adjacent intents that should also pull this skill in: deciding between a skill and a hook, deciding between a skill and a subagent, packaging a personal workflow, building a plugin (since plugins bundle skills).
---

# skill-forge

Designs skills that fit the harness instead of fighting it. The default failure mode of skill creation in 2026 is *templating without taste*: a SKILL.md that looks like every other SKILL.md, under-triggers because the description is vague, over-triggers because the description is greedy, or bloats the conversation because reference content was inlined where it should have been bundled. This skill exists to push back on that.

It does **two** things in order:

1. **Triage** — interrogate whether a skill is the right extension at all, and if so which kind.
2. **Shape** — write the SKILL.md to the kind, using the harness features that actually matter for it.

If you only learn one thing here: **a skill is content that lives in recurring context with a 1,536-character description budget per skill and a 5,000-token compaction budget**. Most skill design choices follow from that.

## Step 1 — Triage: should this be a skill?

Before opening a `SKILL.md`, ask which extension surface fits. Skills are flexible but not free — every visible skill consumes description budget every turn, and every invocation pins content into context for the rest of the session. If another surface fits better, use it instead.

Run through this triage ladder. The first match wins.

1. **Is the action a hard guarantee, not a request?** ("never edit `.env`", "lint after every Edit", "block secrets from being read"). → That's a **hook**, not a skill. Hooks fire deterministically; skills are interpreted by the model.

2. **Does Claude need access to a system the harness can't see?** (a database, an issue tracker, a private API). → That's an **MCP server**, not a skill. Skills can teach Claude *how to use* an MCP server well; they can't replace the connection.

3. **Is the work a side task that would flood the main context with output?** (running tests, scraping logs, exploring an unfamiliar module). → That's a **subagent**, not a skill — or a skill with `context: fork` that runs *as* a subagent.

4. **Is the rule a fact Claude should hold every session?** ("we use pnpm not npm", "tests live in `tests/`", "the API base path is `/v2`"). → That's a **CLAUDE.md** entry. Reserve CLAUDE.md for short, broadly-applicable facts; keep it under ~200 lines.

5. **Does the rule only apply when working in certain files?** ("API endpoints under `src/api/` follow these conventions"). → That's a **path-scoped rule** in `.claude/rules/something.md` with `paths:` frontmatter. Only loads when Claude touches matching files.

6. **None of the above, and it's a procedure or body of knowledge that's reusable across sessions.** → Now it's a skill.

If you've gotten here, continue to Step 2. If not, **carry through to the redirected surface — don't just announce that it should be one**. Specifically:

- **Hook** → if `hook-forge` is installed, invoke it (`/hook-forge`) and design the hook there. Otherwise, walk the user through the hook configuration inline: which event, which matcher, which handler type, what the script returns. The triage isn't done until the actual `.claude/settings.json` (or skill/agent frontmatter `hooks:` block) is drafted.
- **MCP** → propose the `claude mcp add` command for a known server, or design the inline `.mcp.json` entry. If domain-specific guidance is needed (schema, query patterns), that's a *companion* skill the user can build after the connection exists.
- **CLAUDE.md** → propose the actual lines to add (or suggest a path-scoped rule file at `.claude/rules/<name>.md` if the content is more than a few lines and only applies to some files).
- **Path-scoped rule** → draft the `.claude/rules/<name>.md` with `paths:` frontmatter and the rule body.
- **Subagent** → propose the `.claude/agents/<name>.md` with frontmatter (tools, model, permissionMode) and the system prompt body.
- **Nothing** → say so and stop. The cheapest answer is often "do this in the moment, don't encode it."

Read [references/triage.md](references/triage.md) for the longer form, including how to combine surfaces (e.g., MCP + skill, hook + skill).

## Step 2 — Classify: which kind of skill?

Skills are not one shape. The six kinds below have different goals and different SKILL.md structures. Pick one before drafting.

| Kind | Purpose | Default invocation | Default `context` | Body shape |
| :--- | :--- | :--- | :--- | :--- |
| **Workflow** | Run a multi-step procedure (`/release`, `/commit`, `/deploy`) | `disable-model-invocation: true` (you trigger) | inline | imperative numbered steps |
| **Knowledge** | Apply conventions/standards/patterns when relevant | model-invocable (Claude picks it up) | inline | declarative facts/rules |
| **Guarded action** | Side-effect-having action with strict tool scope (`/post-to-slack`) | `disable-model-invocation: true` + `allowed-tools` | inline | one-shot recipe |
| **Forked research** | Investigate something without polluting the main thread | model-invocable, `context: fork`, `agent: Explore` | forked | task prompt for a subagent |
| **Path-scoped knowledge** | Conventions that only matter for some files | model-invocable + `paths:` glob | inline | declarative, narrow scope |
| **Toolkit** | Bundle scripts and examples Claude calls into for repeatable infrastructure (browser automation, file processing, report generation) | model-invocable; bundled `scripts/` and `examples/` carry the value | inline | thin orientation pointing at the artifacts |

Different kinds need different things. A workflow skill needs imperative steps and pre-approved tools. A knowledge skill needs concrete conventions and almost no procedural text. A forked-research skill needs a clear task statement and an agent type — not your usual list of bullets.

Within any kind, ask one more question before drafting: **what attention does this skill free up, and what should that attention go to instead?** A workflow skill that lists five deploy steps shortens typing but Claude is still attending to mechanics. A workflow skill that pushes mechanics into the background and elevates the substantive question (*should we ship?*, *is this diff coherent?*) is doing more work per token. The first kind is **additive** — it adds knowledge or shortcuts. The second is **transformative** — it shifts what's foreground. Both are valid; transformative ones tend to carry their recurring context cost better because what they put in context is *reframing*, not just facts.

If you can't articulate what attention this skill frees up and where it redirects it, the skill is probably additive. That's fine, but it sets a higher bar: the skill needs to save enough work to justify the recurring tokens, because it isn't earning its keep through reframing.

Read [references/skill-kinds.md](references/skill-kinds.md) for a worked example of each kind, including which frontmatter fields matter and which are noise. The additive-vs-transformative distinction is covered there in more depth.

## Step 3 — Draft the SKILL.md

Once you've classified, draft. The order matters.

### 3a. Write the description first

The description is the *only* thing the model sees when deciding whether to invoke. Skills with vague descriptions silently under-trigger — Claude consults skills only when it needs help, and a generic description loses against a specific one.

Three rules:

1. **Lead with the use case, not the noun.** "Designs a skill that fits the harness…" beats "A skill creator."
2. **Include the trigger phrases users actually say.** Lift wording from the conversation that prompted you to make the skill. Casual phrasings, abbreviations, related-but-not-identical asks.
3. **Cap the combined `description` + `when_to_use` at 1,536 characters.** Anything past that is silently truncated in the skill listing. The first ~200 chars do most of the matching work.

Anti-patterns and fixes are in [references/triggering.md](references/triggering.md). When in doubt, write three candidate descriptions and ask "which of these would I match against my actual prompt?".

### 3b. Pick the frontmatter that earns its keep

Don't carpet-bomb frontmatter. Each field exists for a reason; setting it without that reason adds noise and obscures intent.

- `name` — usually omit; the directory name is fine.
- `description` — always.
- `when_to_use` — only if you have trigger phrases that don't fit naturally in `description`.
- `disable-model-invocation: true` — set for **workflow** and **guarded action** kinds. Side effects shouldn't fire because Claude thinks the code "looks ready."
- `user-invocable: false` — set for **knowledge** that isn't a meaningful command (`legacy-system-context`, `our-payments-domain`).
- `allowed-tools` — set for **guarded action** to pre-approve the narrow tool set you actually need (`Bash(gh pr comment *)`, not `Bash`).
- `context: fork` + `agent` — set for **forked research**. Pick `Explore` for read-only codebase work, `Plan` for plan-mode-style analysis, `general-purpose` for implementation.
- `paths:` — set for **path-scoped knowledge** so the skill only auto-loads when relevant files are open.
- `model` / `effort` — only if the skill genuinely needs more or less than the session default. Don't over-spec.
- `arguments:` (named args) — only if you have 2+ positional arguments and named substitution makes the body readable. For one arg, `$ARGUMENTS` is cleaner.
- `hooks:` — for skills that need a deterministic guardrail (`PreToolUse` validation) while active.

The full reference, including substitutions (`$ARGUMENTS`, `$N`, `$name`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`), lives in [references/frontmatter.md](references/frontmatter.md).

### 3c. Write the body for the lifecycle, not for one turn

Once a skill is invoked, **its content stays in the conversation as a single message until the session ends or compaction drops it**. Claude does not re-read the file. This is the single most-misunderstood fact about skills.

Implications:

- Write **standing instructions** ("when running tests, prefer single-file runs"), not one-time steps ("first check if Node is installed"). The latter waste tokens after the first response.
- If the body is mostly procedure ("do step 1, then step 2, then step 3"), you're writing additive content. If the body says "here's what to attend to throughout this work, and the mechanics are X" — you're writing transformative content. The transformative kind holds up better as recurring context because the reader-Claude-on-turn-8 is still being told *what to keep in foreground*, not stepped through a recipe whose first half already ran.
- **Every line is a recurring cost.** Apply the CLAUDE.md test: if removing this line wouldn't change behavior, delete it. Skills over ~500 lines start hurting more than they help.
- **Reference docs go in sibling files**, not inline. `reference.md`, `examples/`, `scripts/` all exist for this. Mention them by filename in SKILL.md so Claude knows when to load them: "for the full schema list, see `reference.md`."
- **Compaction carries skills forward with a budget**: the most recent invocation of each skill is re-attached, keeping the first 5,000 tokens. The shared budget across re-attached skills is 25,000 tokens. If a skill is huge or you've invoked many others after it, it can be dropped entirely. Re-invoke it after compaction if you need the full content back.
- **If a skill seems to "stop working" after the first turn, it usually didn't.** The content is still in context; the model just chose another path. Strengthen the description and the imperative tone, or use a hook for things that must happen.

More on the lifecycle (loading order, compaction, drift signals) in [references/lifecycle.md](references/lifecycle.md).

### 3d. Use the harness features that actually fit this skill

The 2026 features I see most often missed when they would help:

- **Dynamic context injection** — an inline form (an exclamation mark immediately followed by a backtick-wrapped shell command) and a fenced form (a code-fence opener of three backticks immediately followed by an exclamation mark). Runs *before* Claude sees the skill body, replacing the placeholder with command output. Use it to inline live state (git diff, gh pr view, current branch, env). The model receives data, not instructions to fetch data — it doesn't have to spend a tool call. Only fits when the data is small, deterministic, and useful for almost every invocation. **Literal syntax not rendered here** — see the meta-skill authoring section below for why.
- **`context: fork` + `agent: Explore`** for any skill whose job is to *investigate* and *summarize*. The investigation tokens never enter your main thread.
- **`paths:` glob** for knowledge that's narrowly scoped to part of a repo. Loads only when those files are open.
- **`allowed-tools`** for workflow skills that touch the same 3–5 commands every run. Skip the per-use approval prompt without granting blanket access.
- **`${CLAUDE_SKILL_DIR}`** for referencing bundled scripts. Resolves correctly whether the skill lives at user, project, or plugin scope.
- **Frontmatter `hooks:`** for skills that need a hard rule while active (e.g., a `db-reader` skill that must never see `INSERT`/`UPDATE`).

Read [references/patterns.md](references/patterns.md) for the patterns each one fits and the patterns each one ruins.

### 3e. Bundle scripts when you'd write the same code three times

If your skill walks Claude through generating an HTML report, the first three users will write three slightly different generators. Bundle the script once and tell the skill to call it: `python3 ${CLAUDE_SKILL_DIR}/scripts/report.py "$ARGUMENTS"`. This is the single highest-leverage thing you can do for a skill that does deterministic output. Scripts are *executed*, never *loaded into context* — so they're free.

Don't bundle scripts when the work is genuinely judgment-laden (review, refactor, code generation). Scripts ossify; skills bend.

## Step 4 — Test discipline

The existing skill-creator skill (`~/.claude/skills/skill-creator/`) has a heavy eval loop with an HTML viewer, baselines, and benchmarks. **Use it when the skill has objectively verifiable outputs** — file transforms, deterministic generators, fixed-format reports. For those, the eval loop catches regressions you wouldn't otherwise see.

**For most skills, that workflow is overkill.** Workflow skills, knowledge skills, and forked-research skills usually need:

1. Two or three real prompts that match the description (not synthetic ones).
2. Run them in fresh sessions; observe whether Claude invokes the skill.
3. Read the actual transcript, not just the final output, to see if the skill is steering or being ignored.
4. Iterate the description and the body. Discard, don't pile up.

If after two iterations the model still ignores the skill, the issue is almost always either (a) the description doesn't match the user's natural phrasing, or (b) the task is too simple for Claude to bother consulting a skill. Skills get consulted when Claude needs help — "read this PDF" won't trigger a PDF skill no matter how good the description, because Claude can do it directly.

Detail in [references/iteration.md](references/iteration.md).

## Step 5 — Check against anti-patterns before shipping

Read [references/anti-patterns.md](references/anti-patterns.md) before committing the skill. The most common ones in May 2026:

- **The hook-shaped skill** — a skill that says "ALWAYS lint after edit" or "NEVER commit secrets". The model is being asked to enforce, which it can't reliably do. Convert to a `PostToolUse` hook.
- **The CLAUDE.md-shaped skill** — five lines of conventions that should have stayed in CLAUDE.md.
- **The MCP-shaped skill** — instructions to "query the database for X" without the database being connected. Connect the MCP server first; skill teaches *how to query well*.
- **The greedy description** — "Use this skill for any code-related task." Description budget gets eaten by this skill, others get truncated.
- **The body that re-introduces itself every turn** — "If the user asks you to deploy, do X." Just write "Deploy: X." It's already in context.
- **The workflow without `disable-model-invocation`** — Claude decides to deploy because the code "looks ready."
- **The under-pre-approved guarded action** — `allowed-tools: Bash` instead of the four specific commands; defeats the point.
- **Inline reference docs** — 1,200 lines of API tables in SKILL.md instead of `reference.md`.

## Working examples

Two short ones to ground the patterns. Each one corresponds to a kind from Step 2.

### Workflow kind — `/commit-staged`

```yaml
---
description: Stages, lints, and commits the current diff with a message inferred from the changes. Use when the user says "commit this", "ship it", "make a commit", or asks for a quick commit on a clean diff. Skip when the diff is large enough to warrant review.
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git add *) Bash(git commit *) Bash(npm run lint:fix)
---

## Current state
- Status: [INJECT: git status --short]
- Diff: [INJECT: git diff --stat]

## Steps
1. Run `npm run lint:fix` and re-stage anything it changed.
2. Stage all unstaged changes with `git add -A`.
3. Generate a one-line commit message in conventional-commit format from the diff above.
4. Commit. Show the user the resulting `git log -1 --oneline`.

If the diff is empty, say so and stop. If lint fixes touch files outside the original diff, surface that to the user before committing.
```

Why this shape: workflow ⇒ `disable-model-invocation`. Side effects ⇒ tightly-scoped `allowed-tools`. Live state via dynamic injection so Claude sees it without a tool call. Standing instructions ("if the diff is empty…") at the bottom. Note: each `[INJECT: ...]` placeholder above is where the real skill would use the literal inline-injection syntax; the placeholder is used here because this very file is itself a skill, and writing the literal would trip the loader (see the authoring footgun section).

### Forked research kind — `/audit-deps`

```yaml
---
description: Audits the project's direct dependencies for known security advisories and abandoned-project signals. Use when the user asks about dependency security, supply chain risk, npm/pnpm audit, or wants to know which packages need attention. Returns only a summary, never the full audit log.
context: fork
agent: Explore
allowed-tools: Bash(npm audit *) Bash(pnpm audit *) Bash(git log *) Bash(cat package.json)
---

Audit direct dependencies in `package.json` and produce a short report with:
- Advisories at high or critical severity, grouped by package, with a one-line action recommendation.
- Packages whose latest release on npm is older than 18 months.
- Packages with fewer than 3 maintainers or a single-maintainer pattern, where the package has high download counts (supply-chain concern).

Use the lockfile to resolve actual installed versions. Read package.json to identify direct vs transitive dependencies; only direct dependencies are in scope. Cite specific versions and links to advisories where relevant.

Stop when you have enough for a 1-page summary; do not exhaustively walk transitive trees.
```

Why this shape: investigation ⇒ `context: fork`. Read-only ⇒ `agent: Explore`. Result is a summary, so the verbose audit output never enters the main thread.

## Naming and placement

Project skills go in `.claude/skills/<name>/SKILL.md`. The directory name becomes the slash command. Use lowercase letters, numbers, and hyphens; max 64 chars. The skill name is the user's mental handle for the skill — make it short and obvious (`/commit-staged`, not `/staged-changes-commit-with-lint`).

Precedence: enterprise > personal (`~/.claude/skills/`) > project (`.claude/skills/`) > plugins (namespaced as `<plugin>:<skill>`). If you create a project skill with the same name as a personal skill, the personal one wins. To avoid this, either rename, override visibility via `skillOverrides` in `.claude/settings.local.json` (set the personal one to `"off"`), or scope through a plugin.

## Authoring footgun: skills can't show injection syntax literally

This is a real failure mode I shipped before catching it. The skill loader pre-processes every skill file at load time, scanning for the dynamic-injection trigger sequences and replacing them with the actual command output. The scan **does not respect markdown context** — it ignores inline code spans, ignores nested code fences, ignores headers. If the literal byte sequence appears anywhere in the file, the loader will try to run whatever follows it as a shell command. If that command isn't on the allowlist, or contains placeholder syntax like `<command>`, the entire skill fails to load with a `Shell command permission check failed` or `parse error` message.

The two trigger sequences (described in words because writing them literally would break this very file):
- An exclamation mark immediately followed by a backtick.
- Three backticks immediately followed by an exclamation mark.

If you're writing a skill that needs to *describe* the injection feature — a meta-skill, a tutorial, an anti-pattern catalog, even just a frontmatter cheat sheet — you cannot show the literal syntax anywhere in the file. The skill loader will eat it.

What to do instead:

1. **Describe the syntax in words, not symbols.** Write "an exclamation mark immediately followed by a backtick-wrapped shell command" rather than rendering the bang-and-backtick adjacent in your source. The bytes matter, even inside what look like protective code spans.
2. **Use a placeholder pattern in worked-example skill bodies** so a reader can see the structural shape without the literal trigger. The convention used in this skill is `[INJECT: <command>]`. A reader copying an example into their own (non-meta) skill replaces each `[INJECT: ...]` with the actual literal injection syntax.
3. **Point to canonical docs for a rendered example.** `https://code.claude.com/docs/en/skills` under "Inject dynamic context" shows the live syntax safely.

After writing or editing a skill that touches this area, grep the skill tree before saving. The patterns must use backslash escapes so the grep command itself doesn't reintroduce the trigger:

```bash
grep -rn -e '!\`' -e '\`\`\`!' .claude/skills/<your-skill>/
```

Inside the single quotes, each `\` separates the bang from the backtick (and the backticks from each other) in the source bytes, so this grep file itself stays load-safe. The shell and grep both treat `\` before a non-special character as the literal next character, so the actual regex matches are equivalent to a bare bang-then-backtick pattern.

Zero matches means the skill will load. Any match is a bug — convert to prose or a placeholder before shipping.

This applies to *any file inside a skill directory*, not just `SKILL.md`. The loader processes the whole tree.

## Closing checklist

Before saving, walk this list:

- [ ] Triaged: confirmed this should be a skill, not a hook/MCP/CLAUDE.md/subagent/path-rule.
- [ ] Classified: one of the five kinds; frontmatter matches the kind.
- [ ] Named the move: I can say in one sentence what attention this skill frees up and what it redirects toward. If the answer is "nothing, it just shortens work," I've decided that shortening is worth the recurring context cost.
- [ ] `name:` set explicitly (don't rely on the directory-name default — the file is more readable and the skill's identity less filesystem-coupled when `name:` is in the frontmatter).
- [ ] `description` is the *what*; trigger phrases live in `when_to_use` as a separate field. Splitting keeps the description scannable and lets the trigger list grow without bloating the lead sentence.
- [ ] If this skill is about a specific framework, library, or test stack, `paths:` is set so the description doesn't load when out-of-scope. Knowledge skills tied to a slice of the codebase are the most common case.
- [ ] Description is specific, includes natural trigger phrases, fits in the 1,536-char budget (combined `description` + `when_to_use`).
- [ ] Body is in standing-instruction voice, not one-time procedure voice.
- [ ] Reference docs over ~150 lines moved to sibling files.
- [ ] Side effects ⇒ `disable-model-invocation: true` and `allowed-tools` scoped to actual commands.
- [ ] Investigation work ⇒ `context: fork` with the right agent.
- [ ] Anti-patterns checked: no hook-shaped, CLAUDE.md-shaped, or MCP-shaped instructions.
- [ ] Grepped the skill tree for the two trigger sequences (bang-then-backtick and three-backticks-then-bang); zero matches. (See the authoring-footgun section.)
- [ ] Pre-ship proofread: parsed the YAML through a parser (or `yq`/`yamllint`) to catch unescaped quotes; read the body straight through looking for typos, broken backticks, and sentences that get cut off mid-thought. Models drop sentences sometimes and the loss isn't obvious without reading. Especially watch numbered lists where the next bullet's number can mask a truncated previous bullet.
- [ ] Scope check: the body actually delivers what the description promises. If the description says the skill covers a stack (Next.js + Vercel + shadcn + Supabase) and the body is only Next.js, either narrow the description or expand the body. Overpromising in the description is worse than admitting a narrower scope.
- [ ] Sanity-tested in a fresh session against two natural-language prompts.

## See also

- [references/triage.md](references/triage.md) — extension surface decision tree, with how to combine surfaces.
- [references/skill-kinds.md](references/skill-kinds.md) — full template for each of the five kinds.
- [references/frontmatter.md](references/frontmatter.md) — every frontmatter field, every substitution, when each one helps.
- [references/triggering.md](references/triggering.md) — how Claude consults skills, why descriptions fail, how to write ones that match.
- [references/lifecycle.md](references/lifecycle.md) — load order, compaction budgets, drift signals, re-invocation.
- [references/patterns.md](references/patterns.md) — dynamic injection, context: fork, paths, allowed-tools, frontmatter hooks, script bundling.
- [references/anti-patterns.md](references/anti-patterns.md) — concrete bad skills with the surface they should have used.
- [references/iteration.md](references/iteration.md) — when to vibe-iterate, when to run the eval loop from `~/.claude/skills/skill-creator/`.
