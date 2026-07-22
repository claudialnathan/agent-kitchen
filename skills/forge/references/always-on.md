# CLAUDE.md, AGENTS.md, and path-scoped rules

The always-on surfaces. CLAUDE.md is loaded in full every turn; a rule loads whenever a matching file is touched. Canonical reference: `code.claude.com/docs/en/memory` (loading order, `claudeMdExcludes`, AGENTS.md compatibility, path-rule semantics).

## CLAUDE.md

**Verify first.** Every entry rests on fact-claims about how the place works. Before writing or retaining one, check each claim against its source: the filesystem, `package.json` and lockfiles, `.claude-plugin/*`, `.claude/settings*`, skill frontmatter, scripts in `bin/`. A sentence shaped as orientation can hide a wrong mechanism, and the "code is authoritative" caveat only catches it after the agent has acted on the error.

**Then filter.** Three questions; a single no means the content belongs elsewhere:

1. **Still true after the next refactor?** If a rename or package swap falsifies it, it depicts current state, and the code already says it. Cut.
2. **Interpreted, or enforced?** A rule that cannot soften ("never edit `.env`") needs a hook, not prose.
3. **Whole repo, or a slice?** Path-narrow conventions go to `.claude/rules/<name>.md`.

**What's left is small.** Five kinds: *intent* (what this place is for, in a paragraph), *spirit* (dispositions the agent wouldn't infer), *durable harness traps* (failures about how the harness reads the repo, rare and worth their tokens), *pointers* (where the rest of the discipline lives, named once), and *framing caveats* ("if a rule contradicts the code, the code is authoritative", one line that buys the file resilience).

**Orientation is a job, not a leak.** The most useful thing a CLAUDE.md does for a cold agent is orient it: the shape of the system, where the load-bearing pieces live, which non-obvious surfaces exist (the `bin/` script that compiles-and-runs in one step, the config flag to flip for production, the memory limit that only bites on large files). That is the *pointers* kind read at full width, covering not just "where the discipline lives" but "where the code's expensive-to-discover structure lives." A repo with no map makes every session re-derive the same layout. "Never current state" suppresses the *mirror*, not the *map*; read alone it wrongly deletes orientation, which is why the operative test below matters more than the slogan.

**Point, don't mirror.** Map what is expensive to discover; name the location, never copy the value. The asymmetry is what makes one earn and the other rot:

- **Pointer**: "routing is hard-coded in `handle_request`"; "the tunable constants live at the top of `app.bas`"; "page content in `web/pages/`." Survives the *common* edit (changing a constant's value, adding a page); rots only on a rename, which is rare and a one-word fix. Saves a search every session.
- **Mirror**: "`MAX_CLIENTS = 8`", "16 pages", the dependency list, the directory tree. Copies a value whose canonical home is elsewhere; wrong on the *common* edit and now actively misleading, at recurring token cost for zero discovery saved.

The dividing test is discovery cost, not "is it about the code": architecture, cross-cutting flows, why-it's-shaped-this-way, and non-obvious locations are cheap to state and dear to find, so map them as pointers. Anything a `grep`, `ls`, or manifest answers in one shot is a mirror. Point at it or leave it to the code.

**Where the rest goes:**

| Candidate | Goes to |
| :--- | :--- |
| File layout, dependencies, discoverable build/test/lint commands (`npm test`) | The code/configs already say it. Cut, but a `bin/` script whose composed behavior its name doesn't reveal is a pointer, keep that |
| "Always X" / "Never Y" enforcement | Hook, or `permissions.deny` |
| Path-narrow conventions | `.claude/rules/<name>.md` with `paths:` |
| Procedures with steps | Skill |
| Personal preferences / scratch | `~/.claude/CLAUDE.md`, auto-memory, or `CLAUDE.local.md` (gitignored) |
| External system schemas; how to use a connected tool | The MCP server documents its own use, so don't restate it |

The CLAUDE.md ↔ local-notes boundary is **functional, not topical**: a behavioral precondition the agent must satisfy during normal work belongs in CLAUDE.md even when it's "publish-flow" (the agent never opens the playbook mid-task); the playbook detail (commands, diagnostics) stays in the unloaded file. Tell: *would an agent doing ordinary work step on this if it weren't in context?*

**Voice.** Intent, not rulebook. "We treat new artifacts as feedback for the forge" frames a disposition; "ALWAYS propose improvements" performs enforcement the file can't deliver, and all-caps usually means the content wants to be a hook. Where a rule isn't its own reason, give the Why inline (rules-with-reasons markedly outperform unreasoned rules):

```
- Integration tests hit a real database, not mocks. **Why:** a mock/prod divergence masked a broken migration. **How to apply:** tests/integration/; mocks fine in tests/unit/.
```

**Short files are read; long ones are skimmed.** Compliance dilutes as rules accumulate; worked examples are expensive and induce overfitting (reach for one when prose can't name the edge case); identity prompts and adverbs ("be careful", "act senior") deliver little, so prefer concrete imperatives. A short file of reasoned rules often outperforms a long one because what's there is read — size is judgment, not a threshold. Phrase capability-agnostically: "match the codebase's enforced style" survives a missing eslint; "always run eslint" fails silently.

**The three jobs**, sharing the same triage:

- **Bootstrap**: run `/init`, then run every line of its output through the filters (most depicts current state and gets cut); write what's left in intent voice.
- **Audit**: the common job. Read everything in scope (all CLAUDE.mds, local file, AGENTS.md, rules, auto-memory index, plus the sources entries make claims about). Verdict per line: keep / move / cut / rewrite. Show the table before editing. Most CLAUDE.mds shrink by half.
- **Tune**: land one durable session insight. Recurrence or concrete cost is the strongest evidence; a one-off still earns its line when the owner says it matters.

**When AGENTS.md is primary** (multi-tool repos): AGENTS.md holds the agent-agnostic content; CLAUDE.md opens with `@AGENTS.md` plus a Claude-only addendum (skill triggers, hook config, plan-mode preferences). The `@AGENTS.md` import loads mechanically at session start; a prose "read AGENTS.md first" instruction is the weaker bridge because it depends on the model choosing to act on it. Tool-specific content doesn't belong in AGENTS.md either.

**In a repo with a doc fleet** (subsystem docs an agent consults, routed from AGENTS.md), three structures earn tokens a single-doc repo's wouldn't:

- **The routing table is the owner's map.** A table of *task class → governing doc → required skill* encodes a local truth the model can't infer: which doc owns which work. The rows earn their place; the mandatory-preflight procedure wrapped around them does not, because the model won't reliably run a preflight. In Claude Code, duplicate the highest-value rows down into mechanical surfaces (path-scoped rules, skill descriptions, hooks) so Claude never depends on preflight compliance; the table stays as the portable fallback for agents that lack those mechanisms.
- **Greppable doc headers make routing two-level.** Open each system doc with a short header — `Purpose / Read when / Key constraints / Relevant paths / Last verified`. The routing table narrows the search to a doc; the header lets the agent confirm the full doc applies before paying to read it. `Last verified` is the pin discipline in another form.
- **Doc updates ride the change that earns them, and only that change.** Update a doc when a change alters the *documented system* — architecture, a public interface, an established convention, a setup/test/deploy procedure — not for an implementation detail the doc never described. The first keeps the fleet trustworthy; the second is churn that trains agents to distrust it.

**Escalation.** Recurrence is a signal to capture, not to re-correct: a mistake seen twice becomes an automated check (a hook) or a router/doc improvement, never a third correction typed into chat, which vanishes with the session. And a rule that keeps getting missed *despite* being in CLAUDE.md and within the ceilings doesn't want more emphasis. Anthropic's documented answer is a dynamic workflow spawning one verifier agent per rule, each judging the work against its single rule in a fresh context. That's a workflow artifact, not a CLAUDE.md edit.

## Path-scoped rules

`.claude/rules/<name>.md`, frontmatter is just `paths:`. Outside the glob the rule sleeps (no description budget, no body cost), which makes it the cheapest extension surface *when the scope is genuinely narrow*.

A rule is right when all four hold: the content is facts about a slice (not a procedure); the slice is identifiable by paths; it applies without manual invocation; it would bloat CLAUDE.md but doesn't deserve a skill. The evidence: **recurring corrections** on the same convention, and the convention **verified against the slice**. Open three or four matching files; if they don't already follow it, the rule is wishful and the agent will mirror whichever it last read.

- **Rule vs path-scoped skill:** identical auto-loading; the skill is also invocable (`/<name>`) and can bundle references. Pure passive conventions → rule; "pull the full reference in on demand" → skill.
- **Rule vs hook:** rules add context; hooks run checks that can block. "Know X when editing Y" → rule. "Prevent Z" → hook.
- **Scope:** project (`.claude/rules/`) for this repo's conventions; personal (`~/.claude/rules/`) for stack-wide discipline you reuse across repos. There, don't hardcode project facts; encode the *discovery* ("read `globals.css` for the `@theme` block first") and an escape clause for projects off the assumed stack.

**Globs:** `**` recurses, `*` is single-segment, so `src/api/*.ts` misses subdirectories. Multiple paths are OR. Test against the file structure before shipping; a never-matching glob fails silently.

**Body:** declarative bullets, concrete examples, under ~100 lines (at 100+ it's probably a skill). Two voice moves matter more for rules than any other surface, because path-scoped conventions sit closest to framework territory:

- **Condition-shaped, not principle-shaped.** "Fluid before fixed" reads as universal enforcement and gets cited where its conditions don't hold. Restate as judgment naming *when* the pattern earns its keep.
- **Respect the host framework.** Where a rule overlaps an opinionated framework (Tailwind, shadcn, Next.js), add a one-line preamble: apply within the framework's conventions, configure overrides at its token layer, and skip a rule rather than fight a framework default.

Useful pattern: the rule as elevator pitch with a pointer to the deeper skill ("for the full testing decision framework, see `cache-aware-testing`; this rule is the summary").

**Delete** when: the model release re-test shows the correction is no longer needed; the slice moved (re-glob or retire); or the convention moved (fix the code and keep, update, or delete). A rule contradicting the code is recurring wrong context.

**Slip-ups:** rules that load but don't steer (body too vague or restates defaults; read a transcript); rules duplicating CLAUDE.md; rules depicting current state ("we use Vitest" is in `package.json`); conventions still in flux (conversation corrections are cheaper than maintaining a wrong rule).
