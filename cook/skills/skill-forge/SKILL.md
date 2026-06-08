---
name: skill-forge
description: |
  Triages a skill request — confirms a skill is the right surface, checks whether a good one already exists to reuse or fork, classifies the kind, then writes the SKILL.md so its subject is genuinely good and its anatomy fits the harness. Use when the user wants to create, design, distill, or refactor a skill, asks "should this be a skill?" or "is there already one?", wants to capture a workflow they keep retyping, or is reviewing a skill that under-triggers, over-triggers, or feels generic.
when_to_use: |
  Triggers: "make a skill for X", "turn this into a skill", "distill this article/paper/doc into a skill", "I keep typing the same thing", "this should be reusable", "is there already a skill for this?", "reuse or fork an existing skill?", "design a /command for Y", "review my skill", "why isn't my skill triggering", "convert my CLAUDE.md section into a skill".
  Adjacent intents: deciding between a skill and a hook / subagent / rule, packaging a personal workflow, building a plugin (plugins bundle skills), operationalizing source material you've collated.
harness-targets: [claude]
---

# skill-forge

<!-- Earned against: authored 2026-05-14 (Opus 4.7 era). Re-architected 2026-05-30/31 (Opus 4.8, Claude Code v2.1.156) around two pillars — subject-craft co-equal to harness-anatomy — after user feedback that the forge over-taught anatomy. Pillar 1 carries both an expert-grade depth gate (the what — name the delta over the model's competent default, source/verify, acquire if missing) and the craft canon (the how, sourced to Anthropic's skill best-practices and skill-creator). A 2026-05-31 A/B depth-eval (blind judge panel, 3 technical domains, in evals/) showed the guidance lifts craft (+0.89) and anatomy (+0.44) more than depth (+0.33), and caught two regressions since fixed: a soft "verify" that shipped a deprecated API from recall (now an explicit fetch-and-cite step), and over-imitation of this forge's own [claude] frontmatter onto a portable skill. A 2026-05-31 source-verification of the eval's model-weak (procurement) skill confirmed the depth gate yields correct expert facts (CPR value-for-money clauses, current rule date) but leaks citation-shaped fabrication — an invented quote attributed to a named authority — which earned depth.md point 3 ("cite honestly"). 2026-05-31 dogfood of the local /debrief skill surfaced two refinements since added: a keep-signal counterpart to the sunset audit (record positive evidence against the pin, not only deletion triggers), and a proportional/cost-gated verification tier in "Test and iterate" (read-back → fresh probe → confirm-before-firing the ~1M-token A/B eval). Worked-example failures predate this revision; re-test on the next major model release. 2026-06-06 (Opus 4.8, Claude Code v2.1.165): corrected the frontmatter `name` guidance from "usually omit" to "include it" — directory-name inference is Claude-Code-only, but the open spec, cross-tool consumers, and this repo's preship-check require the field; surfaced when the portable quality-audit skill failed the required-frontmatter gate. 2026-06-08 (Opus 4.8, v2.1.165): added the scheduling/Routines orthogonal note to triage — the six surfaces answer *where* behaviour lives, not *when* it fires; a scheduled or event-triggered job (a 7am briefing, an inbound-email trigger) is a Routine (`/schedule`) running a skill, not a self-scheduling skill. Earned from ingesting practitioner workflow writing that framed everything as triggered 'workflows'. -->

A good skill is two things at once, and most skills fail the first one.

1. **Its subject is good** — in two senses. It is **expert-grade** (it encodes what a domain expert knows and the model's competent default doesn't), and it is **written with craft** (so that knowledge does real work in context, redirecting what the agent attends to). A skill that distills hard-won expertise earns its keep; one that restates what the model already does is dead weight, however well-formed.
2. **Its anatomy is right.** It triggers when it should, loads only what's needed, and survives compaction. A perfectly-distilled skill with a vague description never loads, and an invisible skill helps no one — the most common real-world failure mode is mechanical, not editorial.

Both pillars matter; **neither substitutes for the other**. This forge is organized to put the subject first — because the question "is this skill actually good?" is the one most easily skipped — and then to get the anatomy right in service of it.

The heart of Pillar 1 is one distinction. A skill listing five deploy steps shortens typing; the agent is still attending to mechanics. A skill saying _the question here is whether to ship; the mechanics are X but they aren't the work_ changes what is foreground. The first is **additive** (facts or shortcuts); the second is **transformative** (a redirection of attention). Both are valid, but if you cannot say in one sentence what attention this skill redirects — _from_ what, _to_ what — you do not have the design yet.

The work goes in order: **earn it** (Step 0) → **don't reinvent it** (reuse) → **confirm a skill is the right surface** (triage) → **Pillar 1: make the subject good** → **Pillar 2: make the anatomy right** → test, check, ship.

Two constraints recur. The combined `description` + `when_to_use` for one skill is capped at **1,536 characters** in the listing; the aggregate listing budget across all skills scales at ~1% of the context window, dropping the least-used descriptions first. An invoked skill body lives in recurring context with a **5,000-token compaction budget**. Most anatomy choices follow from these.

## Step 0 — Earn the skill

Before anything, name why this skill should exist. There are two legitimate origins. Both earn a skill; both get a model-pin and a sunset trigger.

**Origin A — an observed failure.** A real moment where the agent did the wrong thing, or a correction you've made three or more times in this codebase. Not "we might want X"; not "best practice says Y". This is the strongest basis, because the failure _is_ the eval and the attention it was missing _is_ the design.

**Origin B — authoritative expertise worth operationalizing.** You've read or collated something with real authority — a spec, a researched methodology, hard-won domain knowledge — and want it in the agent's reach before the failure happens. This is legitimate; it's how most knowledge skills are born, and Pillar 1 below supports it — the depth gate for making sure the expertise is real and current, the distillation craft for structuring it. The bar that keeps it honest: the source must be **authoritative, not merely interesting**. Operationalizing a battle-tested methodology earns its keep; encoding a hot take you just read is speculative interest — the most expensive kind of skill, paying recurring rent until something forces its removal.

**Name the attention.** Whichever origin: what should the agent be attending to that it isn't — or attending to that it shouldn't? The skill's job is to make the right attention easier, not to script the right answer. If you can name the basis but not the attention shift, you have material, not yet a design. Sit with it longer.

Record the model version this skill is earned against (the repo's `Model-version pinning` convention) and define the sunset trigger now: on the next major model release, re-test — does the failure still reproduce, or has the model absorbed the expertise? If absorbed, delete. Origin-B skills that turned out to encode mere interest are the first to go.

## Before you build — does a good one already exist?

The cheapest skill is the one you don't write. Before drafting, look outward.

**Reuse-first.** Search the ecosystem: if the `find-skills` skill is available, use it; otherwise check `skills.sh`, run `npx skills find <query>`, or search manually. Then **read the strongest candidate and judge it yourself** — install count and stars are a prior, not a verdict (a large fraction of published skills silently under-trigger). Assess two axes:

- **Quality** — is the description specific, the body in standing-instruction voice, the craft real? Or is it a generic restatement that loads and does nothing?
- **Coverage** — does it cover your actual case, or only a slice of it?

Three outcomes:

- **Use as-is** — it's good and covers the case. Install it, point the user at it, stop. You've avoided a recurring-context artifact entirely.
- **Fork and tune** — the bones are right but it's generic, mis-scoped, or stale for this user/codebase. Copy it, sharpen the description to the real triggers, cut what doesn't apply, add what's missing. This is usually the highest-value outcome, and the one ecosystem search tools won't propose for you.
- **Build new** — nothing fits, or the candidates are low-quality and not worth forking.

`find-skills` is not bundled with this forge, so by the reliable-availability rule below the gate degrades to manual search where it's absent. The quality/coverage rubric and the fork mechanics are in [references/reuse.md](references/reuse.md).

**If you're building: how does it sit alongside what exists?** Even when you build new, an adjacent skill may already cover part of the territory. Getting the relationship wrong creates silent duplication (two skills competing for description budget) or silent dependence (cross-references to skills not present in the sessions this one loads in).

_Reliable-availability heuristic_ — whether you can defer to another skill depends on whether it's actually in the session:

- **Bundled in the same plugin** as your new skill, or a **stock Claude Code skill** → reliable; cross-references load.
- **Personal scope** (`~/.claude/skills/`), **local-script symlinks**, or an **optional plugin in another marketplace** → present only sometimes. Cross-references silently degrade where it's absent.

_Three relationships_ — pick one, or a deliberate mix:

| Relationship | When it fits | Failure mode if wrong |
| :--- | :--- | :--- |
| **Sharpen** — narrow your scope; cite the rest by name | The adjacent skill is reliably present; the boundary is clean | Cross-refs degrade where the adjacent skill is absent |
| **Absorb** — copy the high-leverage ideas in so you're self-sufficient | It isn't reliably present; budget allows the duplication | Body bloat; future drift between source and your copy |
| **Dispatch** — be the entrypoint that routes to several others (the Dispatcher kind) | 3+ reliably-present skills where the routing _is_ the recurring work | Routes to skills that vanish; a list of dead pointers |

Mixing is fine — most skills sharpen on some axes, absorb on others. The call is reversible: re-audit when a personal skill becomes a bundled plugin, an upstream skill is rewritten, or a dependency is removed. Longer form in [references/triage.md](references/triage.md).

## Triage — is a skill even the right surface?

The harness has six surfaces, each redirecting attention at a different level. A refined harness trends toward _fewer_ artifacts, each doing what only it does. Run the ladder; the first match wins.

1. **Hard guarantee, not a request?** ("never edit `.env`", "lint after every Edit", "block secrets"). → **Hook**. Hooks fire deterministically; skills are interpreted and can be talked out of.
2. **Needs a system the harness can't see?** (a database, an issue tracker, a private API). → **MCP server**. A skill can teach _how_ to use it well; it can't replace the connection.
3. **A side task that would flood the main context?** (running tests, scraping logs, exploring an unfamiliar module). → **Subagent** — or a skill with `context: fork` that runs _as_ one.
4. **A fact Claude should hold every session?** ("we use pnpm", "API base path is `/v2`"). → **CLAUDE.md**. For non-trivial CLAUDE.md design, hand off to `claude-md-forge`.
5. **A rule that only applies in certain files?** → **Path-scoped rule** in `.claude/rules/<name>.md` with `paths:`. For its design, hand off to `rule-forge`.
6. **None of the above, reusable across sessions?** → Now it's a skill. Continue to Pillar 1.

> **Orthogonal axis — *when* it runs, not *where* it lives.** The six rungs answer where behaviour belongs; none answers when it fires. If the work should run on a schedule or fire on an event with **no human in the session** (a 7am briefing, an inbound-email trigger), that timing isn't a skill property — it's a **Routine** (`/schedule`; cloud-fired by cron, GitHub event, or API). Design the recurring *job* with the right surface above (often a skill, when it recurs); wire the *trigger* as a Routine that runs it. A skill can't schedule itself.

> **Surface the redirect before executing it.** When triage moves the work elsewhere than the user asked, name the redirect in one line and confirm before invoking the companion forge — e.g. "This looks like a path-scoped rule, not a skill, because [reason]. Hand off to `/rule-forge`?". Wait for the go-ahead; re-triage if the user pushes back with new context. The shape is _announce → confirm → carry through_ — never announce-and-leave, never silently switch.

> **Companion forges** (`hook-forge`, `rule-forge`, `claude-md-forge`) are bundled with skill-forge in the `cook` plugin. If the user has skill-forge alone, suggest installing the rest and use the inline fallback in the meantime — don't block on the install. Per-surface fallbacks and how to combine surfaces (MCP + skill, hook + skill) are in [references/triage.md](references/triage.md).

---

## Pillar 1 — make the subject good

This is the half the forge used to skip; anatomy (Pillar 2) is in service of it. "Good" has two parts, in order: **depth** (is the substance expert-grade — the _what_?) and **craft** (is it written to do work — the _how_?). Craft cannot manufacture depth — a flawless render of competent-level substance is still a competent skill.

### Classify the kind

Skills are not one shape. The eight kinds have different goals and SKILL.md structures. Pick one before drafting.

| Kind | Purpose | Default invocation | `context` | Body shape |
| :--- | :--- | :--- | :--- | :--- |
| **Workflow** | Run a multi-step procedure (`/release`, `/commit`) | `disable-model-invocation: true` | inline | imperative numbered steps |
| **Knowledge** | Apply conventions/standards when relevant | model-invocable | inline | declarative facts/rules |
| **Guarded action** | Side-effecting action with strict tool scope | `disable-model-invocation` + `allowed-tools` | inline | one-shot recipe |
| **Forked research** | Investigate without polluting the main thread | model-invocable, `context: fork`, `agent: Explore` | forked | task prompt for a subagent |
| **Research orchestrator** | Parallel forks over a corpus, then bounded synthesis (`/ingest`) | `disable-model-invocation: true` | inline; spawns forks | dispatch contract + bounded synthesis |
| **Path-scoped knowledge** | Conventions that only matter for some files | model-invocable + `paths:` | inline | declarative, narrow scope |
| **Toolkit** | Bundle scripts/examples Claude calls into | model-invocable; `scripts/`+`examples/` carry the value | inline | thin orientation pointing at artifacts |
| **Dispatcher** | Triage + shape across 2+ related jobs (`skill-forge`, `hook-forge`) | model-invocable; often `paths:`-scoped | inline | quick-dispatch table + shared triage + per-job sections |

The kind constrains the form; it does not decide whether the skill is worth its cost — that's the additive-vs-transformative test below. A worked example of each kind, with the frontmatter that matters and the noise to drop, is in [references/skill-kinds.md](references/skill-kinds.md).

> **Not a skill kind: the dynamic workflow.** When the orchestration is large or fragile enough to want _deterministic_ control flow — fan out over many items, classify-then-route, verify each result with a separate agent — that's a **dynamic workflow** (a JavaScript orchestration script run by the Workflow runtime), not a skill. The **Research orchestrator** kind above (`/ingest`) is the hand-rolled, prose-dispatched version of the same fan-out-and-synthesize shape; reach for a JS workflow when you need the determinism, scale, or per-item verification a prose dispatch can't guarantee. A skill can _package_ a workflow as a template. For when to cross that line and how to design the script, hand off to `workflow-forge`.

### Make it expert-grade — the depth gate

A frontier model's default output sits around _competent_ across most domains, so encoding competent-level content is dead weight — the model is already there. A skill earns top-tier status only by carrying the **expertise delta**: the proficient-to-expert knowledge that isn't in the default — the non-obvious moves, the trade-offs an expert weighs, the domain traps, the verified current specifics. Five-point discipline; depth in [references/depth.md](references/depth.md):

1. **Name the delta** — _what does a real expert know here that the model's default gets shallow or wrong?_ Can't name it → it's the floor → don't build, or go acquire the depth first.
2. **Source and verify — as an action, not an intention.** For any version-specific or fast-moving fact (an API signature, a flag, a current default), _fetch the current canonical doc and cite it_ (WebFetch, or context7 for libraries); do not write it from memory — recall ships deprecated specifics in confident tone. For domain claims generally, ground them in an authoritative source, not generic priors. This is `claude-md-forge`'s "verify first," strengthened: "verify" as a value you hold doesn't fire — make it a step you take.
3. **Acquire it if it's not in the room** — read the canonical sources, `/ingest` or `/deep-research` a corpus, pull in a human expert or a domain subagent; or narrow the skill to the slice you _can_ author expertly. Don't dress competence up as expertise.
4. **Encode judgment and failure-modes, not just rules** — the taste (when to break the rule, the trade-off, the trap) is the least-substitutable delta; rules alone are what the docs already say. Anthropic names this the highest-signal content in a skill: give the failure-modes a _named home_ — a **Gotchas** / pitfalls section built from the points the model actually trips on — not scattered asides the reader skims past.
5. **The expert's-eye test** — would the domain's harshest expert learn anything, or recognize the floor? (This is also exactly what an expertise eval would score — the authoring rubric and the grading rubric are one checklist.)

Depth is the _what_; craft below is the _how_. Get the substance before you polish it.

### Distill from source material

When the skill starts from something you've read or collated (Origin B) — a spec, a paper, a methodology, an internal doc — the job is **distillation, not transcription**. Structure it like an onboarding guide for a new teammate: SKILL.md is the table of contents (the load-bearing core), `references/<topic>.md` are the chapters (opened on demand), `assets/` is the appendix.

- **Cut what the model already knows.** The conciseness move below is the cut rule. Keep only what is specific to this source and this codebase; the source's general background is the model's job, not the skill's.
- **Split references by domain**, so a task pulls only the chapter it needs (a finance question shouldn't load the sales schema).
- **Keep references one level deep.** A reference that points to another reference gets partially read (the model `head`s the file), so depth-behind-depth loses information silently.
- **Give any reference over ~100 lines a table of contents** at the top, so a partial read still sees the whole scope.

The full ingest → extract → structure pass, with a worked example, is in [references/distillation.md](references/distillation.md). This is the legitimate form of the article-derived skill from Step 0: you are operationalizing expertise, not encoding a passing interest.

### Write with craft

The kind sets the form; craft decides whether the content does real work once it's in context. Seven moves — depth and worked good-vs-weak pairs in [references/content-craft.md](references/content-craft.md):

- **Match freedom to fragility.** High-freedom prose for judgment-laden, context-dependent work (code review); low-freedom exact scripts for fragile, consistency-critical work (a destructive migration). Over-specifying a high-freedom task makes the skill brittle; under-specifying a low-freedom one invites the error. This is Anthropic's central skill-craft framework, and it's orthogonal to additive-vs-transformative (fragility vs attention).
- **Explain the why, not just the rule.** All-caps MUST/ALWAYS/NEVER is a yellow flag: the model has theory of mind and generalizes from a reason where it can't from a bare directive. Reserve hard directives for the genuinely fragile, low-freedom case. (This is the reader-facing twin of "state the reason" below.)
- **Show, don't tell.** One worked input→output pair conveys style and altitude more cheaply than a paragraph describing them. Use _one_ — examples cost several times a rule in tokens and the model overfits to their specifics.
- **Assume Claude is already smart.** The context window is a public good. Cut any line the model would do without it. The test: "does this paragraph justify its tokens, or am I explaining what a PDF is?"
- **One default with an escape hatch.** Don't offer five libraries or approaches; name the one you want and the condition to deviate. Choice paralysis is a token cost with no payoff.
- **One term per concept.** Pick "endpoint" or "route" and hold it. Synonyms make the model hunt for a distinction that isn't there.
- **No time-sensitive content.** "Before August, use the old API" rots. Put superseded guidance in a collapsed "Old patterns" section, or cut it.

### State the reason — every section earns its keep

Inside any kind, every section, frontmatter field, and reference doc gets a one-line _why_. If you cannot state it, you do not have the call yet. Pat phrases ("for clarity", "to be thorough", "best practice") are tells that you cited a reason instead of having one — stop, look at examples, try again. The highest-leverage application is **naming the move at the skill level**: what attention does this skill free, and toward what does it redirect? Make it visible — in the `description`, the opening paragraph, or a closing summary. This discipline applies inside every meta-forge in this plugin and in any artifact they produce.

### Additive vs transformative — the test that decides worth

Apply this to the kind you picked. A workflow that lists five deploy steps is **additive** — the agent still attends to mechanics. A workflow that pushes mechanics into the background and elevates the substantive question (_should we ship?_, _is this diff coherent?_) is **transformative**. Three quick tests:

1. **What becomes thinkable?** After the skill loads, what is easier to think about that wasn't? "Nothing, it just runs faster" → additive.
2. **The turn-8 test.** Read the body on turn 8, after the initial work is done. Does it still steer thinking, or is it a checklist whose contents already happened? Transformative bodies keep working; additive ones decay.
3. **Skill-as-frame.** Asked what the skill _does for the work_, is your one sentence about mechanics ("it commits things") or attention ("it lets the user think about whether the diff is coherent instead of remembering to lint")?

Both columns can ship. Transformative skills earn their recurring cost more readily, because what they keep in context is _a way of seeing_, not facts already executed. If the honest answer is "it just shortens work," that's fine — but then the bar is higher: it must save enough work to justify the recurring tokens, and it should be cheap (`disable-model-invocation: true`, narrow `allowed-tools`) so it isn't also eating description budget. Deeper contrasts in [references/skill-kinds.md](references/skill-kinds.md#within-any-kind-additive-vs-transformative).

---

## Pillar 2 — make the anatomy right

A good subject that never loads, fires wrong, or breaks the loader does nothing. These choices are in service of Pillar 1.

### Description first

The description is the _only_ thing the model sees when deciding whether to invoke. Vague descriptions silently under-trigger — Claude consults a skill only when it expects help, and a generic description loses to a specific one (and to no skill at all). Four rules:

1. **Lead with the use case, not the noun.** "Cuts a patch release…" beats "A release skill."
2. **Include the trigger phrases users actually say** — lift wording from the conversation that prompted the skill; casual phrasings, abbreviations, near-misses. Add a _negative_ trigger when the skill over-fires ("…do NOT use for simple data exploration — use `/x` instead").
3. **The first ~200 chars do most of the matching.** Combined `description` + `when_to_use` is capped at 1,536 chars per skill; past that is truncated in the listing.
4. **Cross-tool skills lean harder on `description` alone.** The open agentskills.io spec caps `description` at 1,024 chars and ignores `when_to_use` — Cursor and Codex see only the description. If `harness-targets:` is unset (the cross-tool default), keep enough trigger surface in the description itself.

Cheap diagnostic: ask a fresh session "when would you use the `<skill>` skill?" — it quotes the description back, and the gap tells you what to add. Anti-patterns, the over/under-trigger fixes, and the train/validation split for tuning at scale are in [references/triggering.md](references/triggering.md) and [references/iteration.md](references/iteration.md).

### Frontmatter that earns its keep

Each field exists for a reason; set it without one and it's noise. `description` always. `when_to_use` only for trigger phrases that don't fit `description`. `disable-model-invocation: true` for **workflow** and **guarded action**. `allowed-tools` (scoped to the actual commands) for **guarded action**. `context: fork` + `agent` for **forked research**. `paths:` for **path-scoped knowledge**. `model`/`effort` only when the skill genuinely needs off-default. **Include `name`** (matching the directory): Claude Code alone can infer it from the folder, but the open Agent Skills spec, cross-tool consumers (Cursor/Codex), and this repo's `preship-check` all require it — so a portable skill must carry it, and being explicit costs nothing where it's only redundant. **Don't inherit this forge's own frontmatter:** `harness-targets: [claude]` gates the meta-forges to Claude Code — a portable stack skill (most skills) shouldn't carry it, and copying it from the skill you're reading silently Claude-locks something meant to run everywhere. Set fields from the skill's needs, not by imitation.

**Unrecognized fields are silently ignored.** Nesting recognized fields under unknown parents (e.g. `metadata: trigger:` instead of top-level `when_to_use:`) produces dead bytes that load with no warning. If a setting seems to have no effect, verify the field name first. Full reference and substitutions (`$ARGUMENTS`, `${CLAUDE_SKILL_DIR}`, etc.) in [references/frontmatter.md](references/frontmatter.md).

### Write the body for the lifecycle

Once invoked, **the body stays in the conversation as one message until the session ends or compaction drops it**. Claude does not re-read the file.

- Write **standing instructions** ("when running tests, prefer single-file runs"), not one-time steps ("first check if Node is installed") — the latter waste tokens after the first turn. This is also why the transformative voice survives compaction: turn-8-Claude is still told _what to keep foreground_, not stepped through a spent recipe.
- **Every line is recurring cost.** If removing a line wouldn't change behavior, delete it. Skills over ~500 lines start hurting more than they help; reference docs go in sibling files.
- **Compaction re-attaches** the most recent invocation of each skill, keeping its first 5,000 tokens, under a shared 25,000-token cap. A huge skill, or one invoked long ago, can be dropped — re-invoke it if you need it back.
- **Teammate context** _(verify against `code.claude.com/docs/en/agent-teams`)_: a spawned agent-team teammate loads project CLAUDE.md, MCP, and skills, but **not** the lead's conversation history. A skill that assumes conversational scaffolding won't have it in a teammate — another reason to write self-contained standing instructions.

Load order, drift signals, and re-invocation in [references/lifecycle.md](references/lifecycle.md).

### Harness features that fit, and the script test

Reach for these only where they fit (all are Claude Code extensions, ignored by open-spec consumers — see the portability note in [references/patterns.md](references/patterns.md)):

- **Dynamic context injection** to inline live state (git diff, branch, env) so the model gets data, not a tool call to fetch it — only when the data is small, deterministic, and useful for almost every invocation. (Literal syntax is not shown here; see the footgun section.)
- **`context: fork` + `agent: Explore`** for any skill whose job is to investigate and summarize — the investigation tokens never enter the main thread.
- **`paths:`** for knowledge scoped to part of a repo; **`allowed-tools`** for the 3–5 commands a workflow runs every time; **`compatibility:`** (open-spec) to declare runtime requirements in the listing.
- **Bundle a script when you'd write the same code three times.** Scripts are _executed, not loaded_, so they're free and deterministic. Don't bundle judgment-laden work (review, refactor) — scripts ossify; skills bend.
- **Bundle a session-scoped hook** (`hooks:` in frontmatter) when the skill needs a _deterministic guarantee_ live only while it runs — a `db-reader` that must never issue `INSERT`, a migration skill that blocks writes outside `migrations/`. The hook fires only while the skill is active and is torn down after, so it dissolves the "hook _or_ skill" either/or: a skill can carry its own enforcement. Boundary: a skill-scoped hook gates tool _inputs_ (PreToolUse on the matched tool), not a subagent's _output prose_ — `SubagentStop` carries no result text and `PostToolUse` truncates large results, so don't reach for one to police what a fork _returned_. Design it with `hook-forge`.

### Authoring footgun: skills can't show injection syntax literally

The skill loader pre-processes every file in the skill tree at load time, scanning for two literal byte sequences and replacing them with command output — **ignoring markdown context** (inline code, fences, headers offer no protection):

- an exclamation mark immediately followed by a backtick;
- three backticks immediately followed by an exclamation mark.

If either appears anywhere, the loader runs what follows as a shell command; an off-allowlist or malformed command fails the whole skill to load. Any meta-skill that _describes_ injection (a tutorial, an anti-pattern catalog, this file) must therefore: describe the syntax in words; use a `[INJECT: <command>]` placeholder in example bodies (a reader copying into a non-meta skill substitutes the real syntax); and point at `https://code.claude.com/docs/en/skills` for a rendered example. After writing, grep the tree (patterns backslash-escaped so the grep file itself stays load-safe):

```bash
grep -rn -e '!\`' -e '\`\`\`!' .claude/skills/<your-skill>/
```

Zero matches means it will load. This applies to _any_ file in a skill directory, not just SKILL.md.

---

## Test and iterate

Earn the test the way you earned the skill — against the failure. The Anthropic-recommended loop is **eval-first**: run the task in a fresh session **without** the skill and document exactly what it gets wrong; that gap is the spec. Then write the minimal instruction that closes it, and re-test.

For most skills (workflow, knowledge, forked research), that's vibe-iteration: two or three _real_ prompts (the wording you'd actually type, not synthetic ones), run fresh, and **read the transcript, not just the output**. Two failures look identical from outside — the skill didn't trigger, and the skill triggered but didn't reframe the reasoning. The second is the silent-failure anti-pattern; the description matched but the body didn't do Pillar 1's work. For skills with objectively gradable outputs (file transforms, deterministic generators), the heavier eval loop in `~/.claude/skills/skill-creator/` is worth it; for prose and plans it's overkill. Detail, plus the train/validation split for description-tuning, in [references/iteration.md](references/iteration.md).

**Scale the check to the stakes, and gate it on cost.** Most changes need only a read-back (does the edited body now catch the original failure?) or a single fresh-session probe. Reserve a full blind A/B panel — like this forge's own `evals/depth-eval.js` — for a high-stakes rewrite where depth or craft is the open question: it runs ~0.3–1.1M tokens per domain, so confirm with the user before firing and pin one domain rather than fanning out. (A _blind_ panel is the structural answer to **self-preferential bias** — a model scores its own output higher when it judges unblinded; the same reason `workflow-forge` puts verification in separate adversarial agents rather than self-review.) The failure mode is at both ends — skipping verification silently, and reflexively reaching for the expensive tier when a read-back would settle it.

## Check against anti-patterns

Read [references/anti-patterns.md](references/anti-patterns.md) before committing. The common ones:

- **Encoded-answer** — imperative steps that just list what to do; saves typing, changes nothing foreground. (The positive version of this fix is the additive-vs-transformative test in Pillar 1.)
- **Article-derived-as-speculation** — encoding something you read before it's earned. Origin B in Step 0 legitimizes _authoritative_ sources; this anti-pattern is the _interesting-but-unproven_ case.
- **Silent-failure** — invoked, in context, not steering. Read the transcript.
- **Hook/CLAUDE.md/MCP-shaped** — "ALWAYS lint after edit" (hook), five lines of conventions (CLAUDE.md), "query the database" with no connection (MCP).
- **Greedy description** — "for any code-related task"; eats budget, truncates others.
- **Directive-that-fights-the-framework** — principle-shaped bullets ("X before Y") that override a host framework's defaults. The fix (condition-shaped bullets + a respect-the-framework preamble) now lives primarily in `rule-forge`, where path-scoped conventions overlap framework territory most.

## Worked examples

Three: two showing _anatomy_ (why the frontmatter is shaped the way it is), one showing _body craft_ (why the prose does real work).

### Workflow kind — `/commit-staged` (anatomy)

_Earned against:_ three March 2026 sessions where Claude committed without running lint, leaving formatter churn for review.

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
2. Stage all changes with `git add -A`.
3. Generate a one-line conventional-commit message from the diff above.
4. Commit. Show the resulting `git log -1 --oneline`.

If the diff is empty, say so and stop. If lint touches files outside the original diff, surface that before committing.
```

Why this shape: workflow ⇒ `disable-model-invocation`; side effects ⇒ tightly-scoped `allowed-tools`; live state via injection so Claude sees it without a tool call; standing instructions at the bottom. Each `[INJECT: ...]` marks where a real skill uses the literal inline-injection syntax (placeholder used because this file is itself a skill — see the footgun section).

### Forked research kind — `/audit-deps` (anatomy)

_Earned against:_ unscoped `npm audit` flooding the main thread with ~3,000 tokens of transitive noise before any analysis.

```yaml
---
description: Audits direct dependencies for known advisories and abandonment signals. Use for dependency-security, supply-chain-risk, or npm/pnpm-audit questions. Returns only a summary, never the full audit log.
context: fork
agent: Explore
allowed-tools: Bash(npm audit *) Bash(pnpm audit *) Bash(git log *) Bash(cat package.json)
---

Audit the direct dependencies in `package.json`. Report: high/critical advisories grouped by package with a one-line fix; packages whose latest release is >18 months old; single-maintainer packages with high download counts. Use the lockfile for installed versions; only direct dependencies are in scope. Stop at a one-page summary — do not walk transitive trees.
```

Why this shape: investigation ⇒ `context: fork`; read-only ⇒ `agent: Explore`; the verbose audit never enters the main thread.

### Knowledge kind — `/review-our-code` (body craft)

The frontmatter is unremarkable; the lesson is the **body**. Same skill, two bodies — the first is additive and over-directive, the second transformative and reasoned:

```md
WEAK (additive, all-caps, generic):
When reviewing code, you MUST:
1. ALWAYS check for bugs.
2. ALWAYS check style and naming.
3. NEVER approve without checking tests.
```

```md
STRONG (transformative, reasoned, codebase-specific):
Default Claude review catches the obvious. This skill redirects attention to what *we* keep getting wrong — lead with these, demote the generic pass:

1. **Silent error-swallowing.** Bare `catch (e) {}` in async paths. We have a logger; an empty catch is always a flag. *Why:* three prod incidents traced to swallowed errors last quarter.
2. **Non-idempotent retries.** `withRetry` on GET is fine; on POST/PATCH it needs an idempotency key. Flag any POST/PATCH wrapped in retry without one.
3. **Mocked-DB tests.** Tests that mock the DB layer pass while migrations break. Push toward `tests/fixtures/`.

After those, a normal pass (correctness, naming, missing tests). If the four-pattern check alone would take more than a few minutes, suggest `/code-review` and stop.
```

Why the strong version works: it **matches freedom to fragility** (judgment-laden review → prose, not rigid steps), **explains the why** (the model generalizes from the incident, not a MUST), **shows the specific pattern** rather than naming a category, and is **transformative** — it changes what the reviewer foregrounds instead of restating what Claude already does. The weak version triggers, runs, and changes nothing.

## Naming and placement

Project skills live in `.claude/skills/<name>/SKILL.md`; the directory name becomes the slash command (lowercase, hyphens, ≤64 chars). Name the _scope_, not the search keyword — a skill covering reads, writes, and auth shouldn't be named `optimistic-mutations` (the write-only keyword); put search keywords in the description, where they pull triggers without misrepresenting scope. Prefer a gerund or action name (`processing-pdfs`, `commit-staged`) over a vague noun. Precedence: enterprise > personal (`~/.claude/skills/`) > project > plugins. A project skill named the same as a personal one loses silently; rename, set the personal one `"off"` in `skillOverrides`, or scope through a plugin.

## Closing checklist

- [ ] **Step 0:** origin named (observed failure _or_ authoritative source — not mere interest); attention shift named; model-pin + sunset trigger recorded.
- [ ] **Reuse checked:** searched the ecosystem; assessed the best candidate's quality and coverage; chose use-as-is / fork / build-new deliberately.
- [ ] **Triaged:** confirmed this is a skill, not a hook/MCP/CLAUDE.md/subagent/rule. Any cross-referenced skill is reliably present, or its ideas were absorbed.
- [ ] **Subject (Pillar 1):** kind classified; **expert-grade depth** — the expertise delta over the model's competent default is named, sourced, and verified, not just the floor; if from a source, distilled (not transcribed); craft applied (freedom matched to fragility, why explained, one default, consistent terms); the attention shift is _visible_ in the artifact, not implicit.
- [ ] **Anatomy (Pillar 2):** description specific + real trigger phrases, under budget; body in standing-instruction voice; side effects ⇒ `disable-model-invocation` + scoped `allowed-tools`; investigation ⇒ `context: fork`; every frontmatter field on the recognized list (no `metadata:` nesting).
- [ ] Reference docs over ~150 lines in sibling files, one level deep.
- [ ] Grepped the tree for the two trigger byte-sequences; zero matches.
- [ ] YAML parses; body read straight through for dropped sentences and broken backticks.
- [ ] Sanity-tested in a fresh session on two natural prompts — invoked **and** steered, per the silent-failure test.

## When this skill stops earning its keep

The harness does not learn; the human does, by editing CLAUDE.md, skills, rules, and memory. A skill is a snapshot of how the human-plus-codebase-plus-model system currently understands a kind of work, and snapshots go stale on two axes:

1. **The model moves.** On each major release (or quarterly), re-run the failure that earned the skill. If the model now gets it right unaided, delete — the skill is occupying budget for a non-problem. If the failure shifted, rewrite against the new one rather than layering on the old.
2. **The human's framing moves.** The attention shift you encoded was almost-right and the real fix was adjacent; or the work changed and the skill solves a problem that no longer exists. Notice it; rewrite or delete.

The audit has a positive half. The re-test is also where an artifact **earns a stay**: when a session sees the skill doing real work — the guarded failure reproduced unaided in a skill-withheld trial, or a result came out right _because_ the skill was loaded — record that as a dated KEEP against the model-pin, not only in your head. Positive evidence is the counterweight the deletion audit needs; without it, every audit can only ever argue for removal. A win attributed to an artifact is data about that artifact — capture it where the next audit will see it. _(Why: the trajectory below biases toward cutting; a delete-only record makes that bias unfalsifiable.)_

The total trajectory of a refined harness is _fewer_ artifacts, not more.

## See also

- [references/reuse.md](references/reuse.md) — search the ecosystem, assess quality/coverage, the use/fork/build decision.
- [references/triage.md](references/triage.md) — the six surfaces in depth, with how to combine them.
- [references/skill-kinds.md](references/skill-kinds.md) — full template for each of the eight kinds; additive-vs-transformative in depth.
- [references/depth.md](references/depth.md) — making the subject expert-grade: name the delta over the model's default, source-and-verify, acquire if missing, the expert's-eye test.
- [references/distillation.md](references/distillation.md) — turning collated source material into a skill without bloating it.
- [references/content-craft.md](references/content-craft.md) — degrees of freedom, explain-the-why, show-don't-tell, conciseness, with worked pairs.
- [references/triggering.md](references/triggering.md) — why descriptions fail and how to write ones that match.
- [references/frontmatter.md](references/frontmatter.md) — every field, every substitution, when each helps.
- [references/lifecycle.md](references/lifecycle.md) — load order, compaction budgets, drift signals.
- [references/patterns.md](references/patterns.md) — dynamic injection, fork, paths, allowed-tools, script bundling.
- [references/anti-patterns.md](references/anti-patterns.md) — concrete bad skills with the surface they should have used.
- [references/iteration.md](references/iteration.md) — eval-first, vibe-iteration, the description-tuning optimizer.
