---
name: ingest
description: |
  Grounds the next forge step in supplied reading, weighing sources the way the owner handed them. Material the request is built on (inspired-by, do-what-they-do, this person's articles, "the primary resources") is read whole in the main thread; supplementary references fan out to parallel subagents (one per source) that return quoted excerpts. Both land in a bounded brief with citations that hands off to the forge skill with the right surface in mind. Use when you have reading material (URLs, papers, blog posts, internal docs, pasted content) and want the next forge step grounded in those sources rather than training-data priors; skip when training already covers the topic well.
disable-model-invocation: true
---

<!-- Earned against: Opus 4.7, 2026-05-22; history: CHANGELOG.md -->

## The attention this skill redirects

From "what Claude already knows about topic X" to "what *these specific sources* say about X, where they agree, where they disagree, and what they collectively point at that wasn't in training data."

Without this redirection, the next forge step runs against priors and silently produces a generic artifact. With it, the brief carries citations, dates, and an explicit rough edge, and the forge designs against current reality.

**The brief is the handoff artifact, not the kitchen sink.** Supplementary material is read in subagents and enters the main thread only as excerpted quotes; primary material is read whole, and the brief distills it rather than duplicating it. The synthesis is bounded.

**Essence over shape.** Distill what the material *says, intends, and means*, never its structure, format, or voice. Meaning is read twice: against AI context primitives (what does this imply for how skills, hooks, rules, CLAUDE.md, and agent context actually behave?) and against what is known of the owner's harness and intent. A source can be anything: an article, a paper, someone else's skill. A skill used as a source is excerpted like any document; its ideas are reworked into the owner's artifacts, never cross-wired as a dependency.

## Weigh sources as the owner handed them

Not every source is a footnote. When the owner says they were inspired by a piece, want to do what it does, or want a skill made from someone's public writing, that source is the spec, and it gets read accordingly.

- **Primary: the material the request is built on.** Signals: "inspired by", "I want to do the same as", "make a skill from their articles", "here are the primary resources", or a request that simply stands on one to three sources. Read these whole, in the main thread, before designing anything. The isolation machinery is not applied to them: what the artifact must transplant (the judgment, the voice, the call at the fork) lives in the connective tissue that excerpting drops, and an artifact built from eight quotes of its own spec is a skeleton. The token cost is the price of the material the artifact is made of.
- **Supplementary: everything offered as context.** References marked semi-relevant, trailing link lists, "might also be useful" material. These fan out one subagent per source under the quote-only contract; only excerpts enter the main thread.
- **Unmarked sources take their tier from the request's shape.** A few sources offered as the basis are primary. A pile with a clear center: read the center whole, fan out the rest. Genuinely ambiguous, ask which sources the work is built on; a one-line answer beats a guessed tier in either direction (a fanned-out spec loses its judgment, an inlined pile floods the thread).

## How it works

### Phase 1: Primary sources, read whole

Fetch and read each primary source in the main thread, in full. While reading, hold the forge's question (what does world-class output in this domain look like?) and mark what carries it: the judgment calls, the trade-offs, the moves a competent generalist wouldn't make. Those are what the next forge step distills. The fresh-retrieval lens still applies: a primary source is weighted, not exempt; its claims about fast-moving mechanisms are checked against the live canonical doc like anyone else's.

### Phase 2: Supplementary sources, one subagent each

For each supplementary source (URLs, file paths, pasted text), spawn one general-purpose `Agent` with the contract in the **Per-source agent prompt template** section below. Discipline:

- **Single source per agent.** No agent reads more than one URL/document. If six supplementary sources are in play, dispatch 6 agents in parallel via a single message with multiple Agent tool calls.
- **Source already pasted in full? Extract inline, don't re-dispatch.** If the user pasted a source's complete text into the conversation, the subagent's isolation benefit is already spent, because the material is in the main thread and re-dispatching it only re-transmits the same tokens for no isolation gain. Extract its excerpts inline under the same quote-only contract (verbatim, ≤ 100 words, tagged, relevance-bounded). Still dispatch a subagent for every supplementary source you'd have to *go fetch*: URLs, file paths, anything not already in-context. The subagent buys isolation for material you don't yet hold, not ceremony for material you do.
- **Output is quoted excerpts, not paraphrase.** Each agent returns: source URL + retrieval date + 3–8 verbatim quoted passages directly relevant to the target topic, each ≤ 100 words, each tagged with the section/heading it came from. No summary in prose. Quotes only.
- **Bound the agent to the topic.** The dispatch prompt names the target topic, and the agent extracts only what is relevant to it. Tangents are excluded.
- **Stale-source handling.** If a URL 404s, redirects to a different topic, or paywalls the content, the agent reports the failure mode rather than fabricating content. The brief records the failure under **Sources unavailable**.

If the user hasn't said which sources are which type (web vs. local file vs. pasted text), assume URL by default and ask before dispatching only if the source string is ambiguous.

### Phase 3: Synthesis in the main thread

When the per-source agents return, hold their excerpts beside the primary material already read and assemble a brief with this structure:

1. **Topic**: one line stating what the user is designing for.
2. **Sources consulted**: URL or path, retrieval date, tier (primary / supplementary), and status (ok / 404 / paywalled / redirected / other) for each source. Failures included, not omitted.
3. **Points of agreement**: claims that ≥ 2 sources support, each with the citing excerpts inlined as quotes (not paraphrased).
4. **Points of contention**: claims sources disagree on, both sides quoted.
5. **The rough edge**: 2–4 sentences on what these sources collectively reveal that you wouldn't know from training priors. This section is load-bearing. If you cannot fill it, the sources may not have added anything, and the brief should say so explicitly rather than padding.
6. **What it means**: the essence read against context primitives and the owner's standing harness, covering what the material is saying and intending (not its shape), which standing artifacts it makes stale, and the change it argues for.
7. **Open questions**: claims no source addressed that the next forge will still need to make.

Primary sources enter the brief as distilled essence plus load-bearing pointers (the sections and judgment calls the next step must keep), not as bulk: the material itself is already in-thread, but the brief is what survives compaction and reaches a later session. Supplementary sources appear only as their quotes.

Bound the brief: **agreement + contention together stay under ~2,000 tokens.** If you're approaching that, cut weaker quotes; don't expand the brief.

Write the brief to `.claude/ingest/<topic-slug>.md` so the user can read, edit, and reference it independently of the session. If `.claude/ingest/` doesn't exist, create it. **First glance at what's already in `.claude/ingest/`:** if a prior brief covers overlapping sources or topic, update or cross-link it rather than silently writing a near-duplicate, because two briefs on the same material fragment the handoff and bury which one the forge should read.

### Phase 4: Confirm, then hand off to the right forge

Display the brief to the user. State your recommended next forge in one sentence with the reason. **Wait for the user to confirm or redirect before invoking the next skill.** The brief is artifact-agnostic; the right next step depends on the rough edge, not on the user's original phrasing.

Run the forge's triage ladder against the brief:

- **Recurring procedure or body of knowledge across sessions** → a skill
- **Path-scoped convention that only applies to certain files** → a rule
- **Hard guarantee the model can't reliably enforce** → a hook
- **Session-floor fact every Claude session should hold** → a CLAUDE.md entry
- **No clear rough edge; Claude's priors already cover this adequately** → say so and stop. Don't manufacture an artifact for a non-failure.

When the user confirms, invoke `/forge` and pass the brief path plus the recommended surface. The forge then runs its design pipeline against the grounded synthesis instead of against priors.

## Freshness and the critical lens

- **Supplied sources outrank the standing harness.** When the owner hands material over, presume the existing skills (the owner's own first, and anything else installed) are stale relative to it. The brief challenges standing artifacts with the new material; a local skill disagreeing with a source is evidence about the skill, not against the source.
- **No source is taken at face value, but the lens is not local.** The critical read comes from freshly retrieved knowledge of how Claude and Claude Code currently work, not from repo context: STATE.md, existing skills, and already-loaded session context are perishable inputs, never the baseline. When a claim concerns current harness behavior, fetch the canonical doc at that moment (`code.claude.com/docs/en/skills` and its siblings; `code.claude.com/docs/llms.txt` indexes them) and judge against what it says today.
- **Disagreement is always allowed, and earned the same way.** Push back on a source (or on the owner's framing) only with freshly retrieved evidence, cited in the brief. "The repo says otherwise" is not a rebuttal; a live canonical doc or primary source is.

## Per-source agent prompt template

When dispatching Phase 2 agents, use this template. Substitute `{{topic}}` and `{{source}}` at dispatch time; do not paraphrase the contract, because its specificity is the defense.

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
> - If the source is irrelevant to the topic, return the Source / Retrieved / Status lines and the single line `out of scope`, with no excerpts and no explanation of why. Don't pad, and don't write a scope note.
> - If the source contradicts itself internally, capture both sides as separate excerpts and flag the conflict.
> - Cap output under 800 tokens.

## Failure modes this skill defends against

The shape of `/ingest` is a direct response to documented context-engineering failure modes from the AI research literature. See [references/failure-modes.md](references/failure-modes.md) for the catalog with primary-source citations.

The defense map at a glance:

- **Context poisoning** → quote-only output keeps fabricated text out; parallel agents surface a poisoned source as visible disagreement, not silent averaging.
- **Surface skim** → the Phase 2 contract *is* Anthropic's quote-extraction scratchpad pattern.
- **Citation hallucination** → every claim in the brief inlines the quote + URL; bare paraphrase is rejected.
- **Lost in the middle** → each source is read in its own short, fresh context; there is no middle of a 100k-token pile.
- **Context clash** → agreement and contention surfaced as separate sections.
- **Context distraction** → supplementary material never enters the main thread; only ≤ 2,000 tokens of synthesis do. Primary sources are the deliberate exception: few, owner-vouched, and load-bearing enough that fidelity beats isolation.
- **Surface skim disguised as completeness** → the mandatory rough-edge section forces an explicit answer to "what did these sources add that priors didn't?" If you can't fill it, they didn't.

If you find yourself wanting to skip any of these defenses for *supplementary* material, that's a signal the topic doesn't need `/ingest` and Claude's priors are probably enough.

## Anti-patterns

- **The kitchen-sink brief.** If Phase 3 produces 4,000 tokens of synthesis "to be thorough", you've defeated the point. The brief is the *small* artifact that survives into the forge. Cut weaker quotes; raise the relevance bar.
- **The excerpted spec.** Running the source the request is built on through the quote-only contract, then designing from its excerpts. What the owner pointed at (the voice, the judgment, the call at the fork) is exactly what the contract strips, and the artifact that results is a skeleton of its own spec. "Inspired by" and "do what they do" mean read it whole.
- **Tier inflation.** Fifteen links are not fifteen specs. Primary is earned by the request's shape, not claimed by volume; a pile without a center is a supplementary corpus with at most a primary or two at its heart.
- **The single-agent firehose.** Dispatching one agent to "read all the URLs and synthesize" undoes the parallel-subagent architecture. Each supplementary source gets its own agent; the isolation is the point.
- **The paraphrase smuggle.** A subagent that returns "the source argues that X" instead of a verbatim quote has done paraphrase, and Phase 3 will treat it as authoritative. Reject paraphrase output and re-dispatch with the contract repeated.
- **The handoff that assumes skill.** Phase 4 isn't always a skill. Run the triage. If the brief points at a hook or a rule, route there.
- **The pile of stale URLs.** Sources that 404 or redirect are facts of the brief, not failures of `/ingest`. Record them. Don't substitute alternatives without surfacing the swap to the user.
- **The empty rough edge.** If the rough-edge section reads as bullet-pointed restatement of the agreement section, the sources didn't actually add anything beyond priors. Say so and skip the forge step.

## When to skip `/ingest` entirely

Reach for `/ingest` when at least one of:

- The topic is newer than training cutoff (recent release, new spec, fresh paper).
- The topic is contested and sources disagree, and you want both sides cited.
- The user has reading they want reflected, not just topical questions answered.
- The user has internal docs / blog posts Claude can't have seen.

Skip when:

- The topic is well-covered in training data and the user is asking from priors anyway.
- The sources are a primary or two and nothing else, and the next step is immediate: read them whole inline; the fan-out machinery has no leverage, and the brief only earns its writing if the material must survive to a later session.
- The user wants a quick answer, not a designed artifact. `/ingest` is part of the forge pipeline; it costs time and tokens.

## See also

- [references/failure-modes.md](references/failure-modes.md): context-engineering failure modes catalog with primary-source citations.
- `/forge`: the Phase 4 handoff target; its triage ladder picks the surface.
- [examples/ingest-fanout.workflow.mjs](examples/ingest-fanout.workflow.mjs): this skill's fan-out expressed as a deterministic JS workflow (real concurrency, schema-enforced quote-only output, resumable), for when the corpus is large or the run must reproduce. Authored against the runtime, not yet run end-to-end; treat as a template.
