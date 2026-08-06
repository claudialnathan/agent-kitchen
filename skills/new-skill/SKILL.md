---
name: new-skill
description: |
  Build a new coding-agent harness artifact: a skill, a hook, a permission rule, a path-scoped rule, a CLAUDE.md or AGENTS.md entry, a subagent, an MCP connection, or a workflow script. Use when making a skill about a subject, turning an article or a standing preference into one, or working out which surface a behavior belongs on. Deciding to build nothing is a normal outcome.
---

# new-skill

An artifact carries intent the model can't work out on its own. Judge it by the work it makes an agent produce, measured first against the best practitioner in the field and then against what the owner actually wanted, because expert-grade in the wrong direction is still wrong. Surface, triggering and token cost are plumbing: they put the expertise in front of the agent at the right moment, and they never stand in for it.

## Start here: what arrived?

| What the owner handed over | Go to |
| :--- | :--- |
| "Make a skill about X", with reading | **Objective**, then **Standard**. The reading is the spec, so read it whole. |
| An article, a doc, or someone's writing to turn into a skill | **Objective**, then **Standard**. Same: read it whole, in this thread. |
| A standing preference, or a correction they keep repeating | **Is anything worth building?** first. Often the answer is a memory or a changelog line. |
| "Should this be a hook or a rule?" | **Pick the surface** directly. That is the only place the question gets asked. |
| A one-off gotcha, or something already handled | **Is anything worth building?** Stopping is a normal answer, not a failure. |

Don't load the shared snapshots by default. Read the plugin-root `STATE.md` when the surface depends on a current harness capability, and `MODELS.md` when model or effort choice changes how you'd write the artifact. Resolve both from this skill's own directory, not the caller's. They orient you; verify anything decision-bearing against a live source.

## Objective

First question, before surface or cost: **what output does this artifact exist to produce?** Say it concretely enough that a stranger could grade an output with it. "Layouts as elegant, responsive and accessible as the page allows, in as few lines as it permits" grades something. "Helps with layouts" doesn't.

It has to come from the owner before it comes from any source. The model gets better every release on its own; what the owner wants, it can only get from them. So a request with no gradeable objective gets questions before drafts, as many as the gaps need. What should the output achieve? What would the owner reject that a competent default would accept? What did a recent output miss? Never ration the questions, because one you don't ask becomes a guess baked into the artifact. Push back on the first assumption offered — there is usually a better objective behind it.

Don't draft until you can say the objective back in the owner's own words. If the model already does this well, in the context where the work actually happens rather than a clean session, say so plainly. The owner decides whether to build anyway.

**Four things to hold before drafting.** Each one is stated in the request, safely inferable from the request or the repo, or asked about. Ask about every one you don't have; `AskUserQuestion` puts them to the owner directly.

1. **Who fires it.** Always-on, user-invoked, model-invoked off a class of request, or both. This answers triage and frontmatter at once. Content the agent needs before anything triggers belongs always-on, not in a skill. User-only means `disable-model-invocation: true`. Anything model-invocable makes the trigger below load-bearing. Live mapping: `code.claude.com/docs/en/skills`, "Control who invokes a skill".
2. **What fires it.** The idea or phrase, in the owner's own words, that should make the model reach for it. The description has to match requests as they will really arrive, and the owner is the one who will type them.
3. **What it needs before it can work.** Every input the work depends on, and where each lives at run time: the invocation's arguments, the repo, a connection, the model's own knowledge. Anything that might be missing becomes a check in the body — verify it or ask, never improvise it, because an artifact that guesses at context it should have been handed produces confident work about the wrong thing. If an input only exists in the owner's head, asking for it is part of the procedure.
4. **What excellent looks like.** The objective, stated so the work can be tested against it.

## Standard

An objective isn't a standard yet. Next: **what does world-class output look like here, and what has to be in front of the agent to reach it?** If you can't describe an exemplary output — the non-obvious moves, the trade-offs an expert weighs, the traps between game-changing and merely competent — you aren't ready to write the artifact. Go read the current state of the practice, fetch the primary sources, find or write an exemplar.

- **Read supplied material the way the owner handed it over.** Whatever the request is built on ("inspired by this", "do what they do", "a skill from this person's writing") gets read whole, in this thread. It is the spec, and judgment doesn't survive excerpting. A trailing list of side references can fan out to one reader per source under a quote-only contract.
- **Go find your own sources too.** What the owner gave you is a starting point, not a boundary. Where the field has current practice the material doesn't cover, go get it, and say which sources you added.
- **Verify when you decide, not from memory.** Check every design decision against a freshly fetched source: the live canonical doc, the primary source. Repo docs, snapshots and already-loaded context are perishable inputs, never the baseline. For anything fast-moving or version-specific, fetch it and cite it. Recall ships deprecated details in a confident voice.

Verifying informs the decision; it never overrules the owner. When a fresh source or your own judgment contradicts what they asked for, or an edit they made, say where you stand, show the evidence, and ask: follow the recommendation, keep the original, hear their reasoning, or something else. Their domain expertise is a kind of evidence no source carries, and they can dismiss the pushback outright.

## What earns an artifact

Three bars, heaviest first.

1. **It beats the model's default.** The baseline is the model as it actually runs: same harness, same repo, same surrounding context, minus the artifact. Never a clean session. Restating what the model already knows is dead weight, but only when nothing in context pulls against it. A codebase below the owner's bar, or a misleading doc, reads to the model as the accepted standard and holds its behavior below what it knows. There an artifact earns its place as a counterweight, and what it adds is the owner's authority to deviate from what the surroundings normalize rather than a fact the model was missing. The lasting sources of delta are few: the owner's taste and intent made operational, local truths of a repo or team, verified post-cutoff facts, failures actually seen. An artifact resting on none of them is competing with training data and will be absorbed in a release or two, so write it expecting to delete it.
2. **It's earned.** There is a real gap between what the model does and what the owner wants: an idea or source worth operationalizing, a miscommunication worth heading off, or a failure you actually saw. The everyday ones are the idea and the miscommunication. If none holds, say so. Building anyway is an experiment, so call it one and log it.
3. **It shifts attention, and you can name the shift.** What should the agent notice that it currently doesn't, or stop noticing? From what, to what, in one sentence. If you can't say it, you have material rather than a design.

One test separates the two kinds of artifact: after reading it, is the agent still thinking about mechanics, or about the real question — *should we ship this? is it trustworthy? is this even the right problem?* An artifact that lists steps leaves attention on the mechanics. Spend tokens to afford the expertise; don't trade the expertise away to save them.

## Is anything worth building?

Three answers end the work here. Naming one is doing the job, not dodging it.

- **A preference about how the agent should work, with nowhere to live** → a feedback memory, with the reason recorded. A correction that can't point at a concrete moment is a preference, so route it here instead of growing an artifact around it.
- **A decision or gotcha worth a trail but not a standing instruction** → the changelog or worklog the repo already keeps.
- **Too rare, one-off, or already handled** → say so and stop. This is common and correct. A single non-dangerous miss is usually a do-it-in-the-moment, and the cheapest harness is the one that never grew a surface for it.

## Pick the surface

The only place the surface question is asked, so answer it here whatever the answer turns out to be. Run the ladder in order; first match wins. Each surface does something only it can.

| The behavior is... | Surface |
| :--- | :--- |
| A guarantee that must hold every time ("never edit `.env`", "lint after every edit") | **Hook**: fires deterministically; a skill is interpreted and can be talked out of. [references/hooks.md](references/hooks.md) |
| Just "this tool, or this tool-call shape, can't be used here", no logic needed | `permissions.deny` in settings: matches command content *and* parameters (`Bash(rm *)`, `Edit(*.env)`), so a block that looks conditional often needs no hook |
| Reaching a system the harness can't see (database, tracker, private API) | **MCP server**: an artifact can teach using it well; it can't replace the connection |
| A side investigation that would flood the main context | **Subagent**, or a skill with `context: fork` that runs as one (forks background by default; set `background: false` when the parent must wait) |
| A fact every session should hold ("we use pnpm") | **CLAUDE.md**: [references/always-on.md](references/always-on.md) |
| A convention that only matters for some files | **Path-scoped rule**, or a path-scoped *skill* if it must also be manually invocable. [references/always-on.md](references/always-on.md) |
| Deterministic orchestration of many agents: large fan-out, classify-then-route, branching, or a run that must reproduce | **Workflow script**: author from the Workflow tool's own in-session description, which is the current contract for both the API and the patterns. The documented reuse path is `.claude/workflows/<name>.js` exposed as a `/command`. Claude-orchestrated dynamic workflows default to medium size (aim &lt;15 agents); set `workflowSizeGuideline` (or `/config`) higher or unrestricted for larger dynamic runs, while hand-authored scripts size themselves. Workflows cost real tokens and need explicit opt-in, so design the script and don't fire it unasked |
| None of the above, reusable across sessions | **Skill**: [references/skills.md](references/skills.md) |

Three notes that cut across the ladder:

- **Effectiveness picks the surface. Fewer artifacts is a result, not a criterion.** Content the agent needs *before anything triggers* — a standing presumption, orientation, intent — belongs always-on even in a lean harness, because an on-demand surface only works when something fires the demand. Don't let a slimming trend argue a fact out of CLAUDE.md when that is where it works.
- ***When* it fires is not *where* it lives.** Work that runs on a schedule, or on an event with no human in the session, is a Routine (`/schedule`) running the artifact. An artifact can't schedule itself.
- **Surfaces combine.** A skill can bundle a hook scoped to its own lifetime (frontmatter `hooks:`), which gives guidance and guarantee in one artifact. An MCP connection plus a skill that teaches its good use is another common pair.

When triage lands somewhere other than what was asked for, name the redirect in one line and confirm before building ("this looks like a rule, not a skill, because X. Proceed?"), then build that surface here. Announce, confirm, build. Never switch silently, and never hand the owner off to a skill that might not exist.

**Build in-repo. Never reach into machine scope.** Anything under `~/.claude/`, user or enterprise `settings.json`, global plugins and user-scope hooks gets read for context but never written, staged, or offered for apply, even when the fix is one obvious line. Report it, describe the exact change, and let the owner act. Where a project-scoped counterweight exists, offer that instead. This is a hard boundary, not a default to weigh.

## Building a skill

Three ways it fails: a bad subject (it restates what the model already does), bad anatomy (it never triggers, fires at the wrong time, or dies at compaction), and bad form (it triggers, the agent reads it, and it steers toward narrating the work instead of doing it). Subject first, anatomy in its service, form in every line.

- **Don't reinvent.** Search the ecosystem before drafting (`npx skills find <query>`, skills.sh), read the strongest candidate, and judge it yourself. Install counts are a prior, not a verdict.
- **Distill, don't transcribe.** SKILL.md is the table of contents; `references/<topic>.md` are chapters opened on demand. Keep what's specific to this source and this codebase, and above all keep the expert's *judgment* — the call at the fork, the trap sidestepped — rather than procedure a competent generalist already follows.
- **It stands alone.** An artifact never tells the agent to invoke another skill and never assumes one is installed, not a third-party skill and not a harness built-in (`/loop`, `/batch`). Write the behavior in ("repeat until nothing is pending", not "drive it with `/loop`") so the guidance holds in any harness. At most a soft, optional, one-directional see-also that costs nothing when the target is absent.
- **Match freedom to fragility.** Prose for judgment-laden work, exact steps only for fragile procedures. Worked examples carry altitude but cost real tokens and invite overfitting, so use the fewest that do the job and make those complete — an example that only runs because a load-bearing line was cut teaches the omission. One default with an escape hatch, one term per concept, and cut any line the model would follow anyway.
- **Claim only what a source holds.** Every statement traces to supplied reading, a live canonical doc, the owner's stated intent, or a verified truth of the repo it runs in. Don't push a source's stance further than the source pushes it. The authoring session is not the source of truth for anything the artifact asserts: it runs in far more sessions than it was written in, and what one drafting session saw goes stale first. A belief the session holds that no source backs goes to the owner in conversation, not into the body.
- **Encode the discovery, not the facts.** Where the truth exists at run time — a config, a schema, a vendor CLI's info command, an llms.txt — teach the artifact to read it instead of freezing today's values ("read `globals.css` for the theme before writing classNames"). Frozen vendor facts rot worst because they don't just go stale, they invert: a grep for a renamed package silently concludes the stack is absent. Where a bare vendor fact has to appear anyway, name it in the changelog as a re-test liability.
- **The description is a routing signature, not a summary.** Lead with the verb and what the artifact does, then `Use when …` with the strongest distinct triggers. Around 250–350 chars does it. Internal procedure — how it reads material, what it verifies, what order it works in — belongs in the body, not here. Matching is semantic, so an enumerated phrase list reads as exhaustive and makes the unlisted case look out of scope. Name the field the artifact serves, not the harness it runs in (`coding-agent harness artifacts`, not `Claude Code harness artifacts`), because every cross-tool consumer reads this one field. Cross-tool cap is 1,024 chars (Cursor and Codex read the description and nothing else); Claude Code's 1,536 combined cap is a truncation guard, not a target.
- **The body is recurring cost.** Write standing instructions, not one-time steps: once invoked it stays in context, never re-read from disk, until compaction.
- **Progressive disclosure applies to judgment too, not just mechanics.** The instinct is judgment in the body and lookups in references, and it's wrong wherever the judgment depends on a branch not yet taken. How strict a hook should be only matters once the answer is a hook, so it belongs beside the hook mechanics, not in the router. Ask what fraction of invocations need a passage before letting it into the body.

### The form of a guidance line

Each line says what conditions it applies under, what to do, and why, in the same line. A reason attached to an action carries to cases you never listed. An action with no reason only covers the cases you did list, and a reason with no action covers nothing.

| Write this | Not this |
| :--- | :--- |
| `ease-out` for anything entering or exiting; `ease-in` delays the moment the user is watching | Easing should suit what the element is doing |
| Entrances start at `scale(0.95)` + `opacity: 0`, never `scale(0)` | Avoid aggressive entrance transforms |
| UI transitions stay under 300ms; 180ms reads as more responsive than 400ms | Keep duration proportionate to the interaction |

The examples are motion because the contrast fits on one line. The form is the same in any field.

Six ways a line fails:

| Failure | What it looks like | Fix |
| :--- | :--- | :--- |
| Derivation handed back | "Derive the local grammar from two or three nearby examples" | State the value. Where it genuinely lives at run time, name the file to read |
| Prohibition with no replacement | "Never use `transition: all`" | Add the instead: "name the exact properties" |
| Hedged both ways | "A fade isn't automatically wrong; a morph isn't automatically right" | Name the conditions and commit inside them |
| Principle where a condition belongs | "Y comes from A, not from B" | "When X, do Y, because Z" |
| Control flow taken off the agent | A mode router, a phase sequence, a findings → plan → apply → re-audit lifecycle | Say what good output is and what disqualifies it |
| Conduct doctrine you invented | An evidence-status taxonomy, "do not claim X without Y", "do not manufacture Z", a clause about being honest | Cut it, unless a source or the owner says it |

Not being able to name a rule's conditions usually means the standard isn't acquired yet. Belief declarations, mission statements and aphorisms fail the same way a bare principle does, and they change what the agent optimizes for, because an agent handed a principle starts defending the principle instead of doing the job well.

None of this is licence to hedge. Be as specific and opinionated as the sources and the owner are. A body that commits to nothing fails the same way a preachy one does: the session substituted its own judgment for the material's.

Mechanics — listing budget, frontmatter fields and traps, kinds, naming and precedence, bundled assets: [references/skills.md](references/skills.md).

## Authoring footgun: the loader trigger sequences

The loader pre-processes every file in a skill directory, scanning for two literal byte sequences and running what follows as a shell command, and it **ignores markdown context** — inline code, fences and block quotes offer no protection. An off-allowlist or malformed command stops the whole skill loading. The sequences: an exclamation mark immediately followed by a backtick, and three backticks immediately followed by an exclamation mark. A file that has to *describe* injection does it in words and uses an `[INJECT: <command>]` placeholder in example bodies. After writing, grep the tree with both patterns backslash-escaped, so the grepping file stays load-safe itself; zero matches means it will load. `bin/preship-check` catches both and gates every commit here.

## Ship, and expect to delete it

- Write the artifact's ledger row and a CHANGELOG.md entry: the rationale, the sunset trigger, and any verdict. A stack-keyed sunset trigger covers vendor default flips, package renames and idiom changes, not just version majors, because a stack can break an artifact without incrementing one.
- **Provenance lives in the changelog, never in the artifact.** No session narration, no addressing the reader, no quoting requests, and no stamp naming the model or harness version it was written against. That marker rots the week it's written and reads as a guarantee to anyone running a different model.
- **Live convergence is the deletion signal, and it's enough on its own.** The moment an artifact's guidance and the model's bare instinct agree in real work, it has stopped earning its place: log it and delete it. A new working model triggers the same read across the fleet, and every verdict gets recorded, including the keeps, or a sweep can only ever argue for removal. Absorption isn't monotonic across model lines, so a deletion is a judgment about today's model rather than a permanent finding. Process and workflow artifacts are exempt, because their value is the owner wanting the procedure and no release absorbs that.
- **A win is the only evidence that argues for keeping.** "That was done well" names an artifact still earning its place, so record which one caused it. Without that, an artifact quietly working for months looks identical to one that stopped mattering.

## See also

- [references/skills.md](references/skills.md): skill mechanics (listing, frontmatter, kinds, naming, bundled assets).
- [references/hooks.md](references/hooks.md): hook mechanics (events, matchers, handlers, exit codes, placement).
- [references/always-on.md](references/always-on.md): CLAUDE.md, AGENTS.md, and rule mechanics.
- Canonical docs, trusted over this file when details move: `code.claude.com/docs/en/skills`, `/docs/en/hooks`, `/docs/en/memory`.
