# skill-forge

A skill that helps you build skills. Lives at `.claude/skills/skill-forge/` in this repo and is invoked as `/skill-forge`.

This README explains the thinking behind it and how the parts fit together. It's for a human reader (you, me-next-time, anyone else looking at the repo) who wants to understand the artifact without reading all 1,500+ lines of it. For decisions I'm less sure about and what I'd reconsider, see `skill-forge-design-notes.md` next door — that's the private workshop notes; this is the public tour.

## What problem this solves

The default failure mode of skill creation in 2026 is *templating without taste*. Anthropic ships a skill-creator skill that's heavy on eval loops and benchmarks; community skill-writers ship boilerplate-shaped SKILL.md files that look interchangeable. Both are reasonable starting points, but they share an assumption: that the hard part of building a skill is the *templating* — getting the YAML right, structuring the body, writing the description. The result is skills that under-trigger because their descriptions are vague, over-trigger because their descriptions are greedy, or sit unused because they don't actually change Claude's behavior.

The harder part — and what skill-forge tries to push on — is the *triage*: deciding whether a skill is the right tool at all, what kind of skill fits the job, and whether the skill is doing real cognitive work or just re-encoding things Claude would have done unprompted.

## The core thesis

Two claims, in order.

**1. Most "I want a skill for X" requests should not be skills.** Claude Code in 2026 has six surfaces for extending behavior: CLAUDE.md, path-scoped rules, skills, subagents, hooks, and MCP servers (with plugins as the packaging layer). Each does one thing well. A skill that's trying to enforce a hard rule wants to be a hook. A skill that needs to query a system Claude can't see wants an MCP server. A skill that's a single fact wants CLAUDE.md. Reaching for a skill when another surface fits better is the most common authoring mistake — and it doesn't show up in failed eval runs, because the skill *appears* to work; it just costs recurring context to do something a hook could do for free.

**2. Even when a skill *is* the right surface, the skill can be additive or transformative — and the difference matters more than the structural template.** This was the late-session reframe. An additive skill adds knowledge or shortcuts: Claude after the skill knows more, or types less. A transformative skill *redirects what Claude is attending to*: mechanics get pushed into the background, a higher-order question gets pulled into the foreground. The metaphor that prompted this distinction (Claudia's, in conversation): a kid with a calculator after years of counting on paper isn't just doing arithmetic faster — their working set has changed. The arithmetic they used to *do* is now arithmetic they *invoke*. Their attention is freed for the math the arithmetic was supposed to serve.

A `/deploy` skill that lists five commands is additive. A `/deploy` skill that pushes the mechanics into the background and elevates *should we ship?* into the foreground is transformative. Both can ship. The transformative one carries its recurring context cost better, because what it puts in context is reframing — not facts that already happened on turn one.

These two claims drive every choice in the skill: triage before drafting, classify before writing, ask "what attention is this freeing up" before declaring done.

## How to read the skill

The skill has nine files. Reading order depends on what you're doing.

**You want to build a skill from scratch:**
1. `SKILL.md` (start to finish). Five steps: triage → classify → draft → iterate → check. Two complete worked examples. A closing checklist.
2. `references/skill-kinds.md` for the structural template of whichever kind you picked.
3. `references/frontmatter.md` to verify the fields you chose actually do what you think they do.

**You want to debug a skill that under-triggers, over-triggers, or feels off:**
1. `references/triggering.md` — how Claude actually consults skills, why descriptions fail, the budget caps and how they bite.
2. `references/anti-patterns.md` — 15 concrete bad-skill examples with the surface or fix that should have been used instead.

**You want to understand the harness deeply enough to make better calls:**
1. `references/triage.md` — the longer form of "should this be a skill at all," including the six-surface comparison and how to combine surfaces.
2. `references/lifecycle.md` — the loading model, the compaction budget, the drift signals.
3. `references/patterns.md` — when to reach for dynamic injection, `context: fork`, paths-scoping, allowed-tools, frontmatter hooks, bundled scripts.

**You want to iterate after building:**
1. `references/iteration.md` — vibe-iterate vs eval-iterate, when to use which, what to do when iteration stalls.

The structure is shallow on purpose. SKILL.md is the spine; references are dense topical files you reach for when SKILL.md hands you off. Nothing has to be loaded if it isn't needed for the task at hand.

## The five-step spine (in SKILL.md)

| Step | Question | Output |
| :--- | :--- | :--- |
| 1. Triage | Should this even be a skill? | Either continue to step 2, or use a different surface and stop. |
| 2. Classify | Which of the five kinds? | A kind label that determines the body shape. Plus: additive or transformative? |
| 3. Draft | Description, frontmatter, body | A SKILL.md ready to test. |
| 4. Test | Does it trigger? Does the body steer? | Two real prompts run in fresh sessions; transcript-level reading. |
| 5. Anti-patterns | Did I write a hook-shaped, CLAUDE.md-shaped, or MCP-shaped skill by accident? | Either ship, or rebuild on the right surface. |

Step 1 is the most important and the most often skipped. Step 2's additive/transformative question is where the reframe from the calculator conversation lives. Step 4 is intentionally light — the existing eval-loop skill (Anthropic's `~/.claude/skills/skill-creator/`) is right when the skill produces objectively verifiable outputs; for most skills, two real prompts and a transcript read beat a benchmark.

## The six kinds

| Kind | When to use | What its body looks like |
| :--- | :--- | :--- |
| **Workflow** | Multi-step procedure with side effects (`/deploy`, `/release`) | Imperative numbered steps, narrow `allowed-tools`, `disable-model-invocation: true` |
| **Knowledge** | Reference material applied during related work (API conventions, code style) | Declarative facts, no procedure, model-invocable |
| **Guarded action** | Single-step action with side effects (`/post-update`) | One short recipe, very narrow `allowed-tools` |
| **Forked research** | Investigation that returns a summary | Task prompt for a subagent, `context: fork`, `agent: Explore` (or other) |
| **Path-scoped knowledge** | Conventions for a slice of the codebase | Declarative knowledge with a `paths:` glob |
| **Toolkit** | Bundle scripts/examples Claude calls into for repeatable infrastructure (browser automation, file processing, report generation) | Thin orientation body; bundled `scripts/` and `examples/` carry the value. Anthropic's `webapp-testing` is the canonical example |

Picking the kind first means you don't pad single-action skills with imaginary steps, you don't write declarative content as a procedure, and you don't put `allowed-tools` on a knowledge skill that doesn't run anything. The kinds aren't enforced; they're a vocabulary for thinking about shape. The sixth (toolkit) was added after seeing webapp-testing — a real example that didn't fit the original five cleanly.

## What's distinctive about this skill

A few things worth pulling out, since they're not in the existing skill-creator skills:

- **The triage ladder.** Step 1 is a six-question ladder that walks you through the other surfaces before letting you commit to a skill. Most skill ideas don't survive it. That's the point.
- **The additive/transformative dimension.** Orthogonal to kind. Asks the calculator question for every skill you're about to ship: what attention does this free up, and what should that attention go to instead? If you can't answer, the skill is probably additive — fine, but it sets a higher bar for whether the recurring context cost is worth it.
- **The harness-aware frontmatter reference.** Each field is annotated with *worth setting / not worth setting / anti-pattern*. Defaults stay defaults; nothing gets carpet-bombed.
- **The lifecycle facts.** Skills enter the conversation as a single message and stay there. Compaction carries them with a 5,000-token-per-skill cap and a 25,000-token shared cap. Skills don't re-read after invocation. These facts dictate why bodies should be standing instructions, not procedural recipes.
- **Anti-pattern #15: the meta-skill loader footgun.** A real bug I shipped in the first version of this skill. The loader scans every skill file's bytes for two literal trigger sequences (a bang adjacent to a backtick; three backticks adjacent to a bang) and tries to execute whatever follows them. This breaks any skill that *talks about* dynamic injection unless you describe the syntax in words and use placeholders for examples. The anti-pattern entry encodes the lesson, including a load-safe grep command for verifying before shipping.

## What this skill is not

- **Not a templating engine.** It won't scaffold a directory for you. The skill argues against templating; bundling a scaffolder would undercut the argument. Copy-paste from the worked examples in `references/skill-kinds.md` and modify.
- **Not a replacement for the eval loop.** When your skill produces structured outputs you can grade, the eval loop in `~/.claude/skills/skill-creator/` is right. This skill points at that one in `references/iteration.md` rather than duplicating it.
- **Not opinionated about your codebase's domain.** It's opinionated about *skill shape*, which is harness-level. The codebase-specific stuff goes in CLAUDE.md or in the skills you build with this one.
- **Not finished.** It hasn't been used in anger to build many skills yet. The triage ladder, the kinds taxonomy, the worked examples — all could be wrong in ways that only show up after building 2–3 real skills with it. See `skill-forge-design-notes.md` for what to test next.

## Naming and precedence

The skill is called `skill-forge`, not `skill-creator`. Why: Anthropic ships a `skill-creator` skill at `~/.claude/skills/skill-creator/`, and personal scope overrides project scope, so a project skill of that name would be silently shadowed. The name `skill-forge` also carries the philosophy — *deliberate crafting* over *templating* — which is what the skill is arguing for in the first place.

If you'd rather use a different name, rename the directory and update the `name:` field if it's set in frontmatter. The slash command follows the directory name.

If you also want to disable the personal `skill-creator` so this one is the default in the `/skills` menu when working in this repo, set its visibility to `"off"` in `.claude/settings.local.json`:

```json
{
  "skillOverrides": {
    "skill-creator": "off"
  }
}
```

Or leave both available and use them for different purposes (skill-forge for triage and design, the eval loop for benchmarking finished skills). They compose more than they conflict.

## Where the harness sits in the bigger picture

The honest version, learned in the same session this skill was built: Claude doesn't really *learn* across sessions. Each session starts fresh. What learns is the human + codebase + harness system, with Claude as the executor. The harness is the part that lets each fresh Claude start from where the human has refined to. Skills, hooks, MCP servers, CLAUDE.md — they're scaffolding the human builds for the human's benefit. Claude is the part that gets to use them in the moment.

That's a less mystical answer than "Claude is getting smarter," but it's the operationally useful one. It also tells you what skill-forge is *for*: not to make Claude smarter, but to make the human's harness-design work cheaper. Better triage, fewer regrettable artifacts, less drift over time. The kid gets a calculator. What the kid actually does with it is up to the kid.

## See also

- `claude-code-state-2026-05.md` — snapshot of the harness this skill targets, including the cost model, recent features, and bundled commands.
- `skill-forge-design-notes.md` — the private workshop notes: decisions I'm less sure about, what I'd reconsider, what to test next.
- `https://code.claude.com/docs/en/skills` — canonical skills doc; check it on each visit since the surface moves fast.
- `https://code.claude.com/docs/en/features-overview` — the Anthropic-recommended mental model for choosing surfaces; the spine of skill-forge's triage ladder.
