---
name: ingest
description: |
  Work out where handed-over reading belongs in a coding-agent harness: which existing primitive it improves, whether it warrants a new one, or that nothing does. Use when given articles, links, papers or someone's public writing without a named destination. Material for an artifact the owner already names is an edit to that artifact, not a placement question.
disable-model-invocation: true
---

The owner hands over reading — an article, a paper, a doc, links, pasted text, someone's body of public work — and this works out **where it belongs in the harness**: which existing primitive it should improve, whether it warrants a new one, or that nothing here is worth building.

What it redirects: from "what the model already knows about topic X" to "what *these* sources say, what they add that priors didn't, and which primitive in *this* harness they change." The deliverable isn't a summary. It's a **placement** — a target primitive (existing, new, or none), the concrete change, and the cited excerpts behind it, put to the owner to confirm.

## Start here: is this the job?

| What arrived | Do this |
| :--- | :--- |
| Reading aimed at a harness primitive, destination not named | Continue below. This is the job. |
| Reading for an artifact the owner already named | Not a placement question. It's an edit to that artifact, so say so. |
| A topic the model's priors answer, with no harness angle | Ordinary research. Read it and answer; don't run this. |
| One source, and the next step is obvious | Read it whole inline and go. Skip the placement file. |

Scope is harness primitives and nothing wider: skills, hooks, path-scoped rules, CLAUDE.md and AGENTS.md entries, workflow scripts, subagents, MCP. The strongest signals this is the right call: the topic is newer than the training cutoff, the owner wants reading *reflected* rather than summarized, the material is internal or someone's writing the model can't have seen, or two sources disagree and both belong in the placement.

## Then: how does each source get read?

Role decides. Count never overrides role.

| The source is | Read it |
| :--- | :--- |
| What the request is built on: "inspired by this", "do what they do", one author's work being distilled | **Whole, in this thread**, however many there are |
| A trailing "might also be useful" link, small pile (under about four to fetch) | Whole, in this thread |
| A trailing pile big enough to crowd the thread | One subagent per source, under the fan-out contract below |
| Already pasted in full | Excerpt it inline. A subagent buys nothing once the text is here |

Spec material never goes to subagents. What the artifact has to carry over — the judgment, the voice, the call at the fork — lives in the connective tissue excerpting throws away, so a taste skill built from eight quotes of its own spec is a skeleton. Six articles by one author being distilled are six spec sources, and you read all six whole. That token cost is the price of the material.

If the tier is genuinely unclear, a pile with no obvious centre, ask which sources the work is built on. A one-line answer beats guessing either way: a fanned-out spec loses its judgment, an inlined pile floods the thread.

## Essence over shape

Distill what the material *says, intends, and means*, never its structure, format, or voice. Read the meaning twice: against context primitives (what does this imply for how skills, hooks, rules, CLAUDE.md, and agent context actually behave?) and against the owner's standing harness and intent.

**Capture the settled values, not only the argument.** A source's durable contribution is usually the conventions it has already fixed: the numbers, curves, thresholds, class names, code fragments, and defaults an agent would otherwise re-derive differently every run. Excerpt those verbatim beside the reasoning that justifies them, and name which parameter varies by project so the artifact adapts them instead of copying them literally. Where the source carries a runnable demo, a video, or a live example, note what it shows that the prose does not, because a procedure's real detail often lives only there. A source can be anything — an article, a paper, someone else's skill. A skill used as a source is excerpted like any document; its ideas are reworked into the owner's artifacts, never cross-wired as a dependency, and whatever is built from them stands alone — it never invokes another skill or assumes one is installed.

## How it works

### Phase 1: Survey the surrounding harness

Before deciding where content belongs, find out what is here to improve — and assume nothing about the shape. `/ingest` runs in at least three:

- **A skills repo** (the common case): many candidate primitives to target.
- **An arbitrary codebase**: a `.claude/` tree that may hold some skills, hooks, rules, or a CLAUDE.md, or may hold none.
- **Standalone, with no predetermined location**: the owner wants a primitive produced from the reading and there is nowhere it already lives.

Glob for the primitives that exist (`**/.claude/skills/**`, a `skills/` tree, `**/.claude/hooks/**`, `**/.claude/rules/**`, `CLAUDE.md`, `AGENTS.md`) and read the descriptions of the few the content plausibly touches. If nothing exists, that is not a failure — it means the placement will be "a new primitive." Do not write the placement against the repo you expected; write it against the harness that is actually there.

Do not load shared snapshots during a routine survey. If the supplied material makes a model-dependent claim, consult the plugin-root `MODELS.md`; if placement turns on a current harness capability or primitive boundary, consult `STATE.md`. Resolve them from this skill's source, use them as a local map only, and verify current claims from live canonical sources.

### Phase 2: Read the material

Read per the rule above: spec whole in the main thread; a large supplementary pile fanned out. While reading, hold two questions — what does world-class output in this domain look like, and which surveyed primitive does this bear on? Those two answers are what Phase 3 turns into a placement.

### Phase 3: Place it

From what the sources say and the surveyed context, decide the target and ground it in cited excerpts:

- **Improve an existing primitive** — name it, name the concrete change, quote the excerpt that argues for it.
- **Warrant a new one** — name the surface: recurring procedure → skill; path-scoped convention → rule; hard guarantee → hook; session-floor fact → CLAUDE.md.
- **Nothing warranted** — say so and stop. A non-failure is a valid outcome.

Ground every claim in a verbatim excerpt with its source; bare paraphrase is not evidence. Keep what the sources support distinct from what you inferred for the owner's stack — an inference dressed as a source citation is the same failure as a paraphrase passed off as a quote. Where two or more sources bear on the same claim, note agreement and contention with both sides quoted. Fill **the rough edge**: two to four sentences on what these sources collectively add beyond training priors. If you cannot fill it, they did not add anything, and the honest placement is "nothing here."

Keep the placement small — the synthesis that reaches a later artifact-design pass stays well under a couple of thousand tokens. Cut weak excerpts; raise the relevance bar rather than expand.

Write the placement to `.claude/ingest/<slug>.md` when the material should outlive the session, or the run was large enough that the excerpts will not survive compaction. For a quick single-source run, inline is enough. Glance at what is already in `.claude/ingest/` first, and update or cross-link an overlapping prior placement rather than writing a near-duplicate.

### Phase 4: Confirm, then package the placement

Surface the placement to the owner. When more than one target is plausible, or improve-existing versus new-primitive is a live choice, put it as a question (`AskUserQuestion`); when it is clear, state it and let them redirect. The choice of where the content lands is the owner's, never made silently.

On confirmation, package the placement in this shape:

- **Objective / expected output**
- **Evidence of the gap** — grounded excerpts, citations, and the rough edge
- **Invocation mode / actor**
- **Proposed trigger**
- **Required context**
- **Allowed actions / side effects**
- **Human decision points**
- **Proposed surface**
- **Unknowns / contention**

Omit a field or mark it unknown rather than guessing. The placement is sufficient input for a later artifact-design pass whether or not any other skill is installed, which is the point of writing it down.

## The fan-out contract

When you do fan out a large supplementary pile, one subagent per source, and the discipline is what keeps it honest:

- **Single source per agent.** No agent reads more than one URL or document; dispatch them in parallel in a single message.
- **Already pasted in full? Extract inline, don't re-dispatch.** If a source's complete text is already in the conversation, the subagent's isolation benefit is spent; excerpt it inline under the same quote-only contract. Dispatch subagents only for material you would have to go fetch: URLs, file paths, anything not already in context.
- **Leaf readers only.** Nested spawn defaults to depth 3 on Claude Code (v2.1.219), so a reader can re-fan and break quote-only / fresh-short-context. Tell each reader not to spawn further agents, or run the fan-out under `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`.
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
> - Do not spawn further agents or tools beyond reading this one source.
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
- **The kitchen-sink placement.** Four thousand tokens of synthesis "to be thorough" defeats the point. The placement is the small artifact that reaches the design step. Cut weak quotes; raise the relevance bar.
- **The empty rough edge.** If what the sources "add" reads as a restatement of what priors already hold, they added nothing. Say so and stop; don't manufacture a target for a non-gap.
- **The paraphrase smuggle.** A subagent that returns "the source argues that X" instead of a verbatim quote has done paraphrase, and synthesis will treat it as authoritative. Reject the output and re-dispatch with the contract.

## See also

- [references/failure-modes.md](references/failure-modes.md): the context-engineering failure modes the fan-out path defends against, with primary-source citations.
- [examples/ingest-fanout.workflow.mjs](examples/ingest-fanout.workflow.mjs): the large-pile fan-out as a deterministic JS workflow (real concurrency, schema-enforced quote-only output, resumable). A template authored against the runtime, not yet run end-to-end.
