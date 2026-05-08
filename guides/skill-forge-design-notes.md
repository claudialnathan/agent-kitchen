# skill-forge — design notes

Notes for future-me coming back to update or rebuild `.claude/skills/skill-forge/`. Captures decisions that aren't in the skill itself.

## Why "skill-forge", not "skill-creator"

The repo this lives in (`cookbooks/claude`) is for skill-building experiments. Anthropic ships a personal skill-creator at `~/.claude/skills/skill-creator/` (485 lines, eval-loop-heavy). Personal skills override project-scoped skills with the same name, so naming this `skill-creator` would have shadowed itself.

`skill-forge` was picked to:
- Avoid the precedence collision.
- Connote *deliberate crafting* rather than *templating*. The framing matters: this skill exists to push back on generic-skill-templates as the primary failure mode of skill creation.
- Read fine as `/skill-forge`.

If you'd rather use a different name, rename the directory and the `name:` field if set. The `description` is the only thing that needs updating beyond renaming.

## What's different from the existing skill-creator skills

There are two existing skill-creator-shaped things in `~/.claude/skills/`:

1. **`skill-creator/`** (485 lines, Anthropic's). Heavy on the eval/iterate workflow with browser viewer, baselines, benchmarks. Aimed at general skill creation with empirical iteration.
2. **`write-agent-skill/`** (117 lines). Simple template-driven approach.

Both are templating-first. The thesis here is different: **the harder problem in 2026 is triage**, not templating. Most skill ideas should be hooks, MCP servers, CLAUDE.md edits, or path-scoped rules. The skill-forge skill leads with triage, then classifies kind, then shapes to harness affordances.

It also intentionally doesn't force the eval loop. The eval loop is right for skills with objectively verifiable outputs — file transforms, deterministic generators. For workflow, knowledge, and forked-research skills, vibe-iteration is faster and just as good. The skill points at `~/.claude/skills/skill-creator/` for cases where eval is warranted.

## A late-session refinement: additive vs transformative

After the first pass shipped, Claudia pushed on the framing — said the budgets-and-surfaces angle was the surface, not the substance. The substance is closer to: **how does a skill act like giving a kid a calculator after years of counting on paper?**

The reframe is practical, not philosophical. A skill becomes calculator-shaped when it doesn't just add knowledge or shorten work, but *redirects what Claude is attending to*. A `/deploy` skill that lists five commands shortens typing but Claude is still attending to mechanics. A `/deploy` skill that pushes mechanics into the background and elevates *should we ship?* into the foreground is doing more work per token, because what's recurring in context is reframing, not facts.

The post-first-pass changes:
- **SKILL.md Step 2** — added the additive vs transformative question after the kinds table. "What attention does this skill free up, and what should that attention go to instead?"
- **SKILL.md Step 3c** — added a paragraph in the body-writing section: procedural bodies are additive (decay after first use); standing-instruction bodies that name what to attend to throughout are transformative (hold up across a long conversation).
- **SKILL.md closing checklist** — added "Named the move" item: I can say in one sentence what attention this skill frees up and what it redirects toward.
- **`references/skill-kinds.md`** — added an "Additive vs transformative" section after the five kinds, with three concrete tests (what-becomes-thinkable, turn-8, skill-as-frame) and a contrasting table.
- **`references/anti-patterns.md`** — added a 14th anti-pattern: "The additive skill that should have been transformative," with a generic /code-review skill as the bad example and a codebase-specific reframing as the fix.

Why this is the right surgical insertion: the existing skill was triage-first ("which surface fits?") and kind-classifying ("which structural archetype?"), but didn't have a question that distinguished a skill that earns its recurring context cost from one that doesn't. The additive/transformative question lives between classification and drafting, exactly where it changes how the body gets written.

Why this is *not* a wholesale rewrite: the calculator framing isn't a different theory of skill design; it's the question that should have been there from the start, in plain operational form. Every other piece of skill-forge — triage ladder, kinds table, frontmatter reference, lifecycle facts, anti-patterns catalog — still does its job. Inserting one question at the right point sharpens the whole thing without restructuring it.

Things I deliberately did not change:
- The five-kinds taxonomy. The additive/transformative dimension is *orthogonal* to kind. A workflow can be additive or transformative; same for knowledge, guarded action, etc.
- The anti-patterns catalog wasn't reordered; the new entry was inserted as #13 and the previous #13 became #14 (the "outdated skill" one).
- The references are still seven topical files plus the original anti-patterns. No new file added; the calculator framing is woven in where it belongs rather than promoted to its own page.

If this framing turns out to be load-bearing across many real skills built with skill-forge, it might earn its own reference page later. Right now it's threaded through the existing structure, which feels right for a refinement rather than a redirection.

## What's in the skill, in priority order

The SKILL.md (~250 lines after the refinement above) is the entry point and stays under the 500-line recommendation. References do the heavy lifting.

1. **`SKILL.md`** — the 5-step process: triage → classify → draft → iterate → check anti-patterns. Two complete worked examples (workflow and forked-research). Closing checklist.
2. **`references/triage.md`** — the longer triage ladder, including how to combine surfaces.
3. **`references/skill-kinds.md`** — five archetypes with frontmatter pattern + body shape + worked example each. Most concrete reference.
4. **`references/frontmatter.md`** — every field with worth-setting and anti-pattern notes; full substitution reference.
5. **`references/triggering.md`** — how Claude consults skills, why descriptions fail, how to write ones that match.
6. **`references/lifecycle.md`** — load order, compaction budgets, drift signals, re-invocation.
7. **`references/patterns.md`** — when to reach for dynamic injection, `context: fork`, `paths`, `allowed-tools`, frontmatter hooks, scripts, Monitor.
8. **`references/anti-patterns.md`** — 14 concrete bad-skill examples with the surface that fits each goal. Longest reference (~390 lines) because the examples are load-bearing.
9. **`references/iteration.md`** — vibe-iterate vs eval-iterate, when to use which, what to do when iteration stalls.

## Decisions I'm less sure about

Things I'd reconsider on a future revision.

### "Five kinds" might be six or four

I split workflow and guarded action because their bodies are structurally different (multi-step vs single-recipe), but the frontmatter patterns are similar. Could be one kind with a "single-step variant" callout. The split helps people not pad single-action skills with imaginary steps; the cost is one more thing to learn.

Path-scoped knowledge could fold into knowledge with a "use `paths:` if scoped" note. I split it because the activation pattern matters for how to write the description (you don't need to mention scope if `paths:` already enforces it). Could go either way.

### The triage ladder is opinionated

The ordering (hook → MCP → subagent → CLAUDE.md → rule → skill) reflects what I think people most often get wrong (skills that should be hooks, skills that pretend to query systems they can't reach). A team with different failure modes would order differently.

### I didn't include an eval-loop runbook

The `~/.claude/skills/skill-creator/` skill has its own runbook with parallel subagents, HTML viewers, etc. I point to it in `iteration.md` but don't duplicate. Risk: if that personal skill is removed or changed, the pointer goes stale. Mitigation: re-check on each visit (the personal skill is shipped by Anthropic, so likely persists).

### No bundled scripts

This skill itself doesn't need any. A future revision could bundle a small `scripts/scaffold.py` that scaffolds a skill directory from a kind name, but it would be templating — exactly the failure mode the skill argues against. Better to have the user copy-paste from the worked examples in `skill-kinds.md`.

## What I tested before shipping

Honestly, not much yet. This was written end-to-end during one session. The next move should be:

1. Pick a skill I want to build — e.g., something for this repo. Actually use `/skill-forge` to build it.
2. See where the triage ladder lands me and whether it lands accurately.
3. See whether the worked examples in `skill-kinds.md` are close enough to my actual skill that copy-pasting and modifying gets me 80% there.
4. Notice what I had to invent that wasn't in any reference. Add it.

Specifically I haven't tested:
- Whether the description triggers reliably (`when_to_use` lists a lot of phrasings; some may be over-eager).
- Whether the body is long enough to be useful but short enough not to drown the recurring context cost.
- Whether the references are reached for in the right cases.

If after building 2–3 real skills with it the descriptions miss or the references go unused, prune.

## What I'd add given more time

Optional, by priority:

1. **A `/skill-forge --new <name>`-style skill that scaffolds a directory** — could be done with `$ARGUMENTS` and a body that walks Claude through creating the directory and the SKILL.md. Resist the urge to bundle a script for this; the variation per-skill is the point.
2. **A "convert this CLAUDE.md section into a skill" path** — common request; the conversion has its own pitfalls (over-procedural, under-triggered).
3. **A "audit my existing skills" path** — runs through the anti-patterns list against existing skills in `~/.claude/skills/` and `.claude/skills/`, flags ones likely to under-trigger or over-trigger.
4. **A small library of patterns specific to this repo** — once we have 3–4 real skills built, the local patterns will surface.

## What this implies for the repo

If `cookbooks/claude` is the place where skills get developed and refined, the structure that emerges:

```
cookbooks/claude/
├── .claude/
│   └── skills/
│       ├── skill-forge/        # the meta-skill (this one)
│       └── <other-skills>/     # skills built using skill-forge
├── guides/
│   ├── claude-code-state-2026-05.md   # the harness snapshot (sibling)
│   └── skill-forge-design-notes.md    # this file
├── commands/                   # legacy single-file commands, if any
└── CLAUDE.md                   # repo-level conventions (still TBD)
```

Things worth adding next:
- A `CLAUDE.md` at the repo root pointing at this guide and the skill-forge skill.
- A `/skills` audit run to see what already exists at user/personal scope and could be promoted into project scope.
- A short `README.md` explaining the repo's purpose for any future collaborator (or future me).
