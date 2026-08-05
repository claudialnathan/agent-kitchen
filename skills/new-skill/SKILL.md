---
name: new-skill
description: |
  Creates a coding-agent harness artifact from stated intent plus supplied reading. Establishes the gradeable objective first, in the owner's terms, then picks the surface the behavior belongs on and builds it: a skill, a hook, a permission rule, a path-scoped rule, an always-on CLAUDE.md or AGENTS.md entry, a subagent, an MCP connection, or a workflow script. Material the request is built on is read whole, current sources are sought independently, and fast-moving claims are verified live at the time of writing rather than recalled. Use for making a skill about a subject, operationalizing an article or doc into one, turning a standing preference into an instruction the agent holds, or settling which surface a behavior wants. Concluding that nothing should be built is one of its outcomes.
---

# new-skill

Don't load the shared snapshots by default. When surface choice turns on a current harness capability, read the plugin-root `STATE.md`; when model or effort choice changes how an artifact should be authored, read the plugin-root `MODELS.md`. Resolve both from this skill's source, not the caller's working directory. They are orientation only — verify decision-bearing claims live, and proceed normally if either is absent.

A harness artifact transmits intent the model cannot infer. Its only measure is the work it makes an agent produce, judged at the output against the best practitioner alive in the domain and, above that, against what this owner wanted, because expert-grade in the wrong direction is still wrong. Surface, triggering, and token cost are plumbing that gets the expertise in front of the agent at the right moment. A flawlessly packaged artifact encoding mediocre expertise is worthless; a rough one encoding genuine expertise is valuable. Optimize in that order.

This file is a working draft, not the authority. The output is. When another approach produces better work, absorb it and cut the rule it beat.

## Start with the objective

The first question is never *what surface?* or *what will this cost?* It is **what output does this artifact exist to produce?** Name the outcome the work is graded against, concretely enough that a stranger could judge an output with it: "layouts as elegant, responsive, and accessible as the page allows, in as few lines as it permits" grades, "helps with layouts" doesn't. The objective is the spec — the body serves it, and anything that grades the artifact grades against it.

It comes from the owner before it comes from any source, because the model improves every release without the owner's help while what the owner wants it can only get from them. A request that arrives without a gradeable objective gets questions before drafts, as many as the gaps demand: what should the output achieve, what would the owner reject that a competent default would accept, what did a recent output miss. Questions are never rationed, because an unasked question becomes a guess baked into the artifact. Challenge the first assumption offered; when an assumption breaks there is usually a better objective behind it.

Don't draft until you can state the objective back in the owner's terms. If the model's default already meets it — in the context where the work actually happens, not a clean session — say so plainly. The owner decides whether to build anyway.

## Four design facts, held before drafting

Each is explicit in the request, verifiably inferable (an inference defensible to the owner from the request, the repo, or the ladder below, not a guess), or asked. Ask about every fact you don't hold; in Claude Code, `AskUserQuestion` puts the unresolved ones to the owner directly.

1. **Who fires it.** Always-on, user-invoked, model-invoked off a class of user input, or the default both. The answer is triage and frontmatter in one: content needed before anything triggers belongs on an always-on surface, not in a skill; user-only means `disable-model-invocation: true`; anything model-invocable makes fact 2 load-bearing (live mapping: `code.claude.com/docs/en/skills`, "Control who invokes a skill").
2. **What fires it.** The concept, phrase, or idea in the user's input that should make the model reach for it, captured in the owner's words, because the description must anchor to requests as they will actually arrive and the owner is the one who will type them.
3. **What it needs before working.** Every input the work depends on, and where each verifiably lives at run time: the invocation's arguments, the repo, a connection, the model's own baseline. Anything that can be absent becomes an entry check in the body — verify or ask, never improvise the missing piece — because an artifact that guesses at context it was supposed to be handed produces confident work about the wrong thing. An input that lives only in the owner's head makes asking for it part of the procedure, not a failure of it.
4. **What excellent looks like.** The objective above, stated so the work can be tested against it.

Together they are the artifact's shape: the task and its trigger understood (1–2), the context secured before work starts (3), and the work aimed at a describable outcome (4).

## Acquire the standard before writing

An objective is not yet a standard. Next: **what does world-class output against it look like, and what must go in front of the agent to reach it?** If you can't describe exemplary output — the non-obvious moves, the trade-offs an expert weighs, the traps between game-changing and merely competent — you are not yet qualified to write the artifact. Read the current state of the practice, fetch primary sources, find or write an exemplar. Expertise you don't hold cannot be transplanted.

- **Weight supplied material the way the owner handed it.** What the request is built on ("inspired by", "do what they do", "a skill from this person's writing") is read whole in the main thread, because it is the spec and judgment does not survive excerpting. A trailing reference list may fan out to one reader per source under a quote-only contract.
- **Seek sources of your own.** Supplied reading is a starting point, not the boundary. Where the domain has current practice the material doesn't cover, go find it, and name which sources you added separately from the ones you were given.
- **Verify at decision time.** Every design decision is checked against freshly retrieved sources — the live canonical doc, the primary source — not against repo docs, snapshots, or context already loaded, which are perishable inputs and never the baseline. For anything fast-moving or version-specific, fetch and cite; recall ships deprecated specifics in a confident tone.

Verification informs; it never overrules. When a fresh source or your own judgment contradicts the owner's stated intent, or an edit the owner made, state the stance with the evidence and ask: follow the recommendation, keep the original intent, hear the reasoning, or another path. The owner's domain expertise is evidence of a kind no source carries, and they may dismiss the pushback outright.

## What earns an artifact

Three bars, heaviest first.

1. **It beats the model's default.** The baseline is the model in situ: same harness, same repo, same steering context, minus the artifact. Never a clean session. Restating the model's own competence is dead weight at recurring cost *only when nothing in context pulls against it* — a codebase below the owner's bar or a misleading doc reads to the model as the accepted standard and holds deployed behavior under what it knows, and there an artifact earns as a counterweight, its delta being the owner's authority to deviate from what the surroundings normalize rather than any fact the model lacks. The durable sources of delta are few: the owner's taste and intent made operational, local truths of a repo or team, verified post-cutoff currency, failures actually observed. An artifact drawing on none of them is competing with training data and will be absorbed within a release or two; write it expecting to delete it.
2. **It is earned.** A gap between the model's default and what the owner wants: a raw idea or source worth operationalizing, a miscommunication worth preventing, or a failure actually observed. The everyday means are the idea and the miscommunication. If none holds, say so — building anyway is an experiment, so name it as one and log it, and its result teaches something either way.
3. **It shifts attention, nameably.** What should the agent attend to that it doesn't, or stop attending to? From what, to what, in one sentence. Name it, or you have material rather than a design.

Aim transformative, not additive, because the test is about the work and not the token bill. An additive artifact lists steps and the agent still attends to mechanics; a transformative one pushes mechanics into the background and elevates the real question (*should we ship?*, *is this trustworthy?*, *is this even the right problem?*). Cost discipline is how you afford the expertise, never what you trade it for.

## Does this want an artifact at all?

Three outcomes end the work before the ladder starts, and naming them is part of the job rather than a failure to do it.

- **A preference about how the agent should work, with no artifact home** → a feedback memory, with the why recorded. A correction that can't point to a concrete moment is a preference; route it here rather than growing an artifact around it.
- **A decision or gotcha worth a project trail but not a standing instruction** → the changelog or worklog the repo already keeps.
- **Too rare, one-off, or already handled** → say so and stop. This is a common and correct result: a single non-dangerous miss is usually a do-it-in-the-moment, and the cheapest harness is the one that didn't grow a surface for it.

## Triage: pick the surface

This is the only place the surface question is asked, so it is answered here whatever the answer turns out to be. Run the ladder in order; first match wins. Each surface does what only it can.

| The behavior is... | Surface |
| :--- | :--- |
| A guarantee that must hold every time ("never edit `.env`", "lint after every edit") | **Hook**: fires deterministically; a skill is interpreted and can be talked out of. [references/hooks.md](references/hooks.md) |
| Just "this tool, or this tool-call shape, can't be used here", no logic needed | `permissions.deny` in settings: matches command content *and* parameters (`Bash(rm *)`, `Edit(*.env)`), so a block that looks conditional often needs no hook |
| Reaching a system the harness can't see (database, tracker, private API) | **MCP server**: an artifact can teach using it well; it can't replace the connection |
| A side investigation that would flood the main context | **Subagent**, or a skill with `context: fork` that runs as one (forks background by default; set `background: false` when the parent must wait) |
| A fact every session should hold ("we use pnpm") | **CLAUDE.md**: [references/always-on.md](references/always-on.md) |
| A convention that only matters for some files | **Path-scoped rule**, or a path-scoped *skill* if it must also be manually invocable. [references/always-on.md](references/always-on.md) |
| Deterministic orchestration of many agents: large fan-out, classify-then-route, branching, or a run that must reproduce | **Workflow script**: author from the Workflow tool's own in-session description, which is the current contract for both the API and the patterns. The documented reuse path is `.claude/workflows/<name>.js` exposed as a `/command`. Claude-orchestrated dynamic workflows default to medium size (aim &lt;15 agents); set `workflowSizeGuideline` (or `/config`) higher/unrestricted for larger dynamic runs — hand-authored scripts size themselves. Workflows cost real tokens and need explicit opt-in, so design the script and don't fire it unasked |
| None of the above, reusable across sessions | **Skill**: [references/skills.md](references/skills.md) |

Three orthogonal notes:

- **Effectiveness picks the surface; fewer-artifacts is a result, not a criterion.** Content the agent needs *before anything triggers* — a standing presumption, orientation, intent — belongs always-on even in a lean harness, because an on-demand surface only works when something fires the demand. Don't let a slimming trend argue a fact out of CLAUDE.md when that is the effective home.
- ***When* it fires is not *where* it lives.** Work that runs on a schedule or fires on an event with no human in the session is a Routine (`/schedule`) running the artifact; an artifact can't schedule itself.
- **Surfaces combine.** A skill can bundle a hook scoped to its own lifetime (frontmatter `hooks:`), giving guidance and guarantee in one artifact. An MCP connection plus a skill that teaches its good use is another common pair.

When triage moves the work somewhere other than what was asked for, name the redirect in one line and confirm before building ("this looks like a rule, not a skill, because X. Proceed?"), then carry it through and build that surface here. Announce, confirm, build; never silently switch, and never hand the owner off to a skill that may not exist.

**Scope: build in-repo, never reach into machine scope.** Anything under `~/.claude/`, user or enterprise `settings.json`, global plugins and user-scope hooks is read for context but never written, staged, or offered for apply, even when the fix is one obvious line. Report it and describe the exact change; the owner acts. Where a project-scoped counterweight exists, offer that instead. A hard boundary, not a default to weigh.

## Building a skill

The two failure modes are a bad subject (restates the model's defaults) and bad anatomy (never triggers, fires wrong, dies at compaction). Subject first, anatomy in its service.

- **Don't reinvent.** Search the ecosystem before drafting (`npx skills find <query>`, skills.sh), read the strongest candidate, and judge it yourself, because install counts are a prior and not a verdict.
- **Distill, don't transcribe.** SKILL.md is the table of contents; `references/<topic>.md` are the chapters opened on demand. Keep what is specific to this source and this codebase, above all the expert's *judgment* — the call at the fork, the trap sidestepped — rather than procedure a competent generalist already follows.
- **It stands alone.** An artifact never instructs invoking another skill and never assumes one is installed, not a third-party skill and not a harness built-in (`/loop`, `/batch`). Encode the behavior inline ("repeat until nothing is pending", not "drive it with `/loop`") so the guidance holds in any harness. At most a soft, optional, one-directional see-also that costs nothing when absent.
- **Craft.** Match freedom to fragility: prose for judgment-laden work, exact steps only for fragile procedures. Explain the why, because the model generalizes from a reason where it can't from a bare MUST. Worked examples convey altitude but cost real tokens and induce overfitting, so use the fewest that carry it and make those complete — an example that only runs because a load-bearing line was cut teaches the omission. One default with an escape hatch, one term per concept; cut any line the model would do without.
- **Claim only what a source holds.** Every statement in the body traces to supplied reading, a live canonical doc, the owner's stated intent, or a verified truth of the repo it runs in. Don't push a source's stance further than the source pushes it, and don't write conduct doctrine for the agent — what counts as verified, what honesty requires, what "truth" means in the domain — unless a source or the owner states it. The authoring session is not the source of truth for anything the artifact asserts: it runs in far more sessions than it was written in, and what one drafting session observed goes stale first. A belief the session holds that no source backs goes to the owner in conversation, not into the body.
- **Condition-shaped, not principle-shaped.** "When X, do Y, because Z" applies where its conditions hold; "Y comes from A, not from B" reads as universal and gets cited where they don't. Belief declarations, mission statements, and aphorisms fail that way, and they change what the agent optimizes for, because an agent handed a principle starts defending the principle instead of doing the job well. Not licence to hedge: be as specific, opinionated, and directive about procedure as the sources and the owner are. A body that commits to nothing fails for the same reason a preachy one does, by substituting the session's judgment for the material's.
- **Encode the discovery, not the facts.** Where truth exists at runtime (a config, a schema, a vendor CLI's info command, an llms.txt), teach the artifact to read it first instead of freezing today's values ("read `globals.css` for the theme before writing classNames"). Frozen vendor facts rot worst, because they invert from stale to actively wrong: a grep for a renamed package silently concludes the stack is absent. Where a bare vendor fact must appear anyway, name it in the changelog as a re-test liability.
- **The description is the only trigger surface.** Describe the class of requests, then anchor it. Matching is semantic, and an enumerated phrase list reads as exhaustive, making the unlisted case look out of scope. Frame it by the agnostic domain the artifact serves, not the harness it runs in (`coding-agent harness artifacts`, not `Claude Code harness artifacts`), because the description is the one surface every cross-tool consumer reads and a tool-named frame reads as out-of-scope in every tool but the one it names. Job plus scope plus the strongest distinct triggers lands at 600–900 chars; the 1,536-char cap is a truncation guard, not a target.
- **The body is recurring cost.** Standing instructions, not one-time steps: once invoked it stays in context, unread from disk, until compaction.
- **Progressive disclosure applies to judgment, not only to mechanics.** The instinct is judgment in the body, lookups in references, and it is wrong wherever the judgment is conditional on a branch not yet taken: reasoning about how strict a hook should be matters only once the answer is a hook, so it belongs beside the hook mechanics rather than in the router. Ask what fraction of invocations need a passage before letting it into the body.

Mechanics — listing budget, frontmatter fields and traps, kinds, naming and precedence, bundled assets: [references/skills.md](references/skills.md).

## Authoring footgun: the loader trigger sequences

The loader pre-processes every file in a skill directory, scanning for two literal byte sequences and running what follows as a shell command, while **ignoring markdown context** — inline code, fences, and block quotes offer no protection. An off-allowlist or malformed command fails the whole skill to load. The sequences: an exclamation mark immediately followed by a backtick, and three backticks immediately followed by an exclamation mark. A file that must *describe* injection does it in words and uses an `[INJECT: <command>]` placeholder in example bodies. After writing, grep the tree with both patterns backslash-escaped, so the grepping file stays load-safe itself; zero matches means it will load. `bin/preship-check` catches both and gates every commit here.

## Ship, and expect to delete it

- Write the artifact's ledger row and a CHANGELOG.md entry: the rationale, the sunset trigger, and any verdict. A stack-keyed sunset trigger includes vendor default flips, package renames, and idiom changes, not just version majors, because a stack can break an artifact without ever incrementing one.
- **Provenance lives in the changelog, never inside the artifact.** No session narration, no addressing the reader, no quoting requests, and no stamp naming the model or harness version it was written against — that marker rots the week it's written and reads as a guarantee to anyone running a different model.
- **The deletion signal is live convergence, and it is enough on its own.** The moment an artifact's guidance and the model's bare instinct agree in real work, it has stopped earning: log it and delete it. A new working model triggers the same read across the fleet, and every verdict gets recorded, including the keeps, or a sweep can only ever argue for removal. Absorption is not monotonic across model lines, so a deletion is a judgment about today's model rather than a permanent finding. Process and workflow artifacts are exempt: their value is the owner wanting the procedure, which no release absorbs.
- **A win is evidence, and it is the only kind that argues for keeping.** "That was done well" names an artifact still earning its place, so record which one caused it. Without that, the artifact quietly working for months looks identical to the one that stopped mattering.
- Artifacts are experiments with lifecycles. Trying one, learning from it, and deleting it are all the system working.

## See also

- [references/skills.md](references/skills.md): skill mechanics (listing, frontmatter, kinds, naming, bundled assets).
- [references/hooks.md](references/hooks.md): hook mechanics (events, matchers, handlers, exit codes, placement).
- [references/always-on.md](references/always-on.md): CLAUDE.md, AGENTS.md, and rule mechanics.
- Canonical docs, trusted over this file when details move: `code.claude.com/docs/en/skills`, `/docs/en/hooks`, `/docs/en/memory`.
