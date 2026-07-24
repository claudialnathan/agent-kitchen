---
name: ingest
description: |
  Reads content the owner hands over and works out where it belongs in the harness: which existing primitive it improves, whether it warrants a new one, or that nothing does. Scoped to the primitives forge designs (skills, hooks, path-scoped rules, CLAUDE.md and AGENTS.md entries, workflow scripts, subagents, MCP), read for what they mean for how those behave rather than summarized. Sources a request is built on, or one author's body of work being distilled, are read whole in the main thread whatever the count; a large pile of side references may fan out to one subagent per source that returns quoted excerpts. Surveys whatever harness exists around it, a skills repo or a codebase's .claude or nothing, instead of assuming a shape, then surfaces the placement for the owner to confirm and packages it as a forge-ready brief. Use when handing over reading, links, or someone's public writing to turn into a harness improvement.
disable-model-invocation: true
---

<!-- Earned against: Opus 4.8, 2026-07-22, v2.1.217; history: CHANGELOG.md -->

## What it does

The owner hands over reading — an article, a paper, a doc, links, pasted text, or one person's body of public work — and `/ingest` works out **where that content belongs in the harness**: which existing primitive it should improve, whether it warrants a new one, or that nothing here is worth building.

Scope is the primitives the forge designs and nothing wider: skills, hooks, path-scoped rules, CLAUDE.md / AGENTS.md entries, workflow scripts, subagents, MCP. Content that isn't aimed at one of these isn't `/ingest`'s job; that is ordinary research, and the model's priors or a plain read answer it.

## The attention this redirects

From "what the model already knows about topic X" to "what *these specific sources* say, what they add that priors didn't, and which primitive in *this* harness they change." The deliverable is not a summary of the reading. It is a **placement**: a target primitive (existing or new, or none), the concrete change, and the cited excerpts that ground it, surfaced for the owner to confirm before an artifact-design pass.

## Read the spec whole; fan out only a large pile

Two kinds of source, and role decides how each is read. Count never overrides role.

- **Spec material is read whole, in the main thread, however many there are.** The sources a request is built on: "inspired by this", "do what they do", "make a skill from this person's writing", or one author's body of work being distilled into taste. The isolation machinery is *not* applied to these. What the artifact must transplant — the judgment, the voice, the call at the fork — lives in the connective tissue that excerpting drops, so a taste skill built from eight quotes of its own spec is a skeleton. Six articles by one author you are distilling are six spec sources, and you read all six whole. The token cost is the price of the material the artifact is made of.
- **Supplementary references are read in the main thread by default, and *may* fan out when the pile is large.** Trailing "might also be useful" links, semi-relevant context. A handful (roughly under four to go fetch) you just read. Once the pile is large enough to crowd the main thread, dispatch one subagent per source under the quote-only contract below, and only excerpts return. The fan-out is a tool you reach for to spare context, not a step you owe.

If the tier is genuinely ambiguous — a pile with no clear center — ask which sources the work is built on. A one-line answer beats a guessed tier in either direction: a fanned-out spec loses its judgment, an inlined pile floods the thread.

## Essence over shape

Distill what the material *says, intends, and means*, never its structure, format, or voice. Read the meaning twice: against context primitives (what does this imply for how skills, hooks, rules, CLAUDE.md, and agent context actually behave?) and against the owner's standing harness and intent. A source can be anything — an article, a paper, someone else's skill. A skill used as a source is excerpted like any document; its ideas are reworked into the owner's artifacts, never cross-wired as a dependency, and the artifact forge builds from them stands alone — it never invokes another skill or assumes one is installed.

## How it works

### Phase 1: Survey the surrounding harness

Before deciding where content belongs, find out what is here to improve — and assume nothing about the shape. `/ingest` runs in at least three:

- **A skills repo** (the common case): many candidate primitives to target.
- **An arbitrary codebase**: a `.claude/` tree that may hold some skills, hooks, rules, or a CLAUDE.md, or may hold none.
- **Standalone, with no predetermined location**: the owner wants a primitive produced from the reading and there is nowhere it already lives.

Glob for the primitives that exist (`**/.claude/skills/**`, a `skills/` tree, `**/.claude/hooks/**`, `**/.claude/rules/**`, `CLAUDE.md`, `AGENTS.md`) and read the descriptions of the few the content plausibly touches. If nothing exists, that is not a failure — it means the placement will be "a new primitive." Do not write the placement against the repo you expected; write it against the harness that is actually there.

### Phase 2: Read the material

Read per the rule above: spec whole in the main thread; a large supplementary pile fanned out. While reading, hold two questions — what does world-class output in this domain look like (the forge's question), and which surveyed primitive does this bear on? Those two answers are what Phase 3 turns into a placement.

### Phase 3: Place it

From what the sources say and the surveyed context, decide the target and ground it in cited excerpts:

- **Improve an existing primitive** — name it, name the concrete change, quote the excerpt that argues for it.
- **Warrant a new one** — name the surface (run forge's triage: recurring procedure → skill; path-scoped convention → rule; hard guarantee → hook; session-floor fact → CLAUDE.md).
- **Nothing warranted** — say so and stop. A non-failure is a valid outcome.

Ground every claim in a verbatim excerpt with its source; bare paraphrase is not evidence. Keep what the sources support distinct from what you inferred for the owner's stack — an inference dressed as a source citation is the same failure as a paraphrase passed off as a quote. Where two or more sources bear on the same claim, note agreement and contention with both sides quoted. Fill **the rough edge**: two to four sentences on what these sources collectively add beyond training priors. If you cannot fill it, they did not add anything, and the honest placement is "nothing here."

Keep the placement small — the synthesis that reaches a later artifact-design pass stays well under a couple of thousand tokens. Cut weak excerpts; raise the relevance bar rather than expand.

Write the placement to `.claude/ingest/<slug>.md` when the material should outlive the session, or the run was large enough that the excerpts will not survive compaction. For a quick single-source run, inline is enough. Glance at what is already in `.claude/ingest/` first, and update or cross-link an overlapping prior placement rather than writing a near-duplicate.

### Phase 4: Confirm, then package the brief

Surface the placement to the owner. When more than one target is plausible, or improve-existing versus new-primitive is a live choice, put it as a question (`AskUserQuestion`); when it is clear, state it and let them redirect. The choice of where the content lands is the owner's, never made silently.

On confirmation, package the placement in the shared handoff shape:

- **Objective / expected output**
- **Evidence of the gap** — grounded excerpts, citations, and the rough edge
- **Invocation mode / actor**
- **Proposed trigger**
- **Required context**
- **Allowed actions / side effects**
- **Human decision points**
- **Proposed surface**
- **Unknowns / contention**

Omit a field or mark it unknown rather than guessing. The brief is sufficient input for a later artifact-design pass whether or not another kitchen skill is installed; when `/forge` is present, it can consume the same shape without translation.

## The fan-out contract

When you do fan out a large supplementary pile, one subagent per source, and the discipline is what keeps it honest:

- **Single source per agent.** No agent reads more than one URL or document; dispatch them in parallel in a single message.
- **Already pasted in full? Extract inline, don't re-dispatch.** If a source's complete text is already in the conversation, the subagent's isolation benefit is spent; excerpt it inline under the same quote-only contract. Dispatch subagents only for material you would have to go fetch: URLs, file paths, anything not already in context.
- **Quotes, not paraphrase.** Each agent returns the source, the retrieval date, and 3–8 verbatim passages (≤ 100 words each), each tagged with the section it came from. A subagent that returns "the source argues that X" has paraphrased; reject it and re-dispatch with the contract repeated.
- **Bound to the target.** The dispatch names the target topic, and the agent extracts only what is relevant to it.
- **Stale sources are facts, not failures.** A 404, paywall, or redirect is reported and recorded, never fabricated around and never silently swapped for an alternative.

Per-source agent prompt template. Substitute `{{topic}}` and `{{source}}` at dispatch time; do not paraphrase the contract, because its specificity is the defense.

> Read the single source at `{{source}}` and extract 3–8 quoted passages directly relevant to: `{{topic}}`.
>
> **Output format:**
> - **Source**: full URL or file path
> - **Retrieved**: today's date (YYYY-MM-DD)
> - **Status**: ok / 404 / paywalled / redirected / other (if redirected, note destination)
> - **Excerpts**: bulleted list. Each bullet: a verbatim quote (≤ 100 words) followed by the section or heading it appeared under, in parentheses. No paraphrase. No interpretation.
>
> **Constraints:**
> - Quote-only. No summaries, no prose synthesis, no preamble or closing commentary. Return only the formatted output above.
> - If the source is irrelevant to the topic, return the Source / Retrieved / Status lines and the single line `out of scope`, with no excerpts and no explanation.
> - If the source contradicts itself internally, capture both sides as separate excerpts and flag the conflict.
> - Cap output under 800 tokens.

## Freshness and the critical lens

- **Supplied sources outrank the standing harness.** When the owner hands material over, presume the existing primitives (the owner's own first, and anything else installed) are stale relative to it. A local skill disagreeing with a source is evidence about the skill, not against the source.
- **Keep the canonical mechanism; don't blend versions.** When sources describe different versions of one pattern, carry the newest canonical form and present any stack-specific adaptation as optional on top of it, not blended into it. Never let an adaptation swap a source's mechanism for a look-alike: a renamed selector or a visually-identical substitute can invert the behavior, so verify the adaptation does what the original did, not merely that it resembles it.
- **No source is taken at face value, and the lens is not local.** The critical read comes from freshly retrieved knowledge of how the agent and its harness currently work, not from repo context: STATE.md, existing skills, and already-loaded context are perishable inputs. When a claim concerns current harness behavior, fetch the canonical doc at that moment (`code.claude.com/docs/en/skills` and its siblings; `code.claude.com/docs/llms.txt` indexes them) and judge against what it says today.
- **Disagreement is a question, not a verdict.** Push back on a source, or on the owner's framing, only with freshly retrieved evidence, cited in the placement. State the stance, cite it, and ask whether the owner wants to follow it, keep their original framing, or take another path. The owner may dismiss it outright, and their domain expertise is evidence no source outranks by default.

## Anti-patterns

- **The excerpted spec.** Running the source the request is built on through the quote-only contract, then designing from its excerpts. What the owner pointed at (the voice, the judgment, the call at the fork) is exactly what the contract strips, and the result is a skeleton of its own spec. "Inspired by" and "do what they do" mean read it whole, whatever the count.
- **Count over role.** Fanning out six articles because six is more than four, when all six are the spec. Count is a permission to isolate a large *reference* pile; it never sends spec material to subagents.
- **Assuming the repo's shape.** Writing the placement against the skills repo you expected instead of the harness that is actually present. Survey first; "no primitives, no location" is a real and common shape, and its placement is "a new one."
- **Silent placement.** Choosing improve-existing versus new-primitive without surfacing it. That choice is the owner's; put it as a question when it is live, state it when it is clear.
- **The kitchen-sink placement.** Four thousand tokens of synthesis "to be thorough" defeats the point. The placement is the small artifact that reaches the forge. Cut weak quotes; raise the relevance bar.
- **The empty rough edge.** If what the sources "add" reads as a restatement of what priors already hold, they added nothing. Say so and stop; don't manufacture a target for a non-gap.
- **The paraphrase smuggle.** A subagent that returns "the source argues that X" instead of a verbatim quote has done paraphrase, and synthesis will treat it as authoritative. Reject the output and re-dispatch with the contract.

## When to reach for `/ingest`, and when to skip

Reach for it when the content is meant to become a harness improvement and at least one holds:

- The topic is newer than the training cutoff (recent release, new spec, fresh paper).
- The owner has reading they want *reflected*, not just topical questions answered.
- The owner has internal docs, or someone's public writing, the model can't have seen.
- Sources disagree and both sides should be cited into the placement.

Skip when:

- The content isn't aimed at a harness primitive. That's research, not `/ingest`.
- The topic is well-covered in training and the owner is asking from priors anyway.
- It's one source and the next step is immediate: read it whole inline and go. The fan-out machinery has no leverage, and a written placement only earns its writing if the material must survive to a later session.

## See also

- [references/failure-modes.md](references/failure-modes.md): the context-engineering failure modes the fan-out path defends against, with primary-source citations.
- `/forge`: an optional consumer of the forge-ready brief; its triage ladder picks the surface and builds it.
- [examples/ingest-fanout.workflow.mjs](examples/ingest-fanout.workflow.mjs): the large-pile fan-out as a deterministic JS workflow (real concurrency, schema-enforced quote-only output, resumable). A template authored against the runtime, not yet run end-to-end.
