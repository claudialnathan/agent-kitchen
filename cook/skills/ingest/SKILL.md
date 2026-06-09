---
name: ingest
description: |
  Reads URLs / articles / docs in parallel subagents (one per source), produces a brief of quoted excerpts with citations, then hands off to the right meta-forge (skill-forge, rule-forge, hook-forge, claude-md-forge). The brief is the artifact — not a kitchen sink, not a paraphrase — and the source material never enters the main thread directly. Quoted excerpts do.
when_to_use: |
  User has reading material (URLs, papers, blog posts, internal docs, pasted content) and wants the next meta-forge step to be grounded in those sources, not in Claude's training-data priors. Trigger phrases include "here are some URLs, design a skill for X", "ground the next forge in these sources", "I have reading on Y, help me build the rule", "study these before we design", "ingest these articles", "I want a skill on X, here's the reading", "train for X with these sources". Skip when Claude's training already covers the topic well and adding sources is just redundant.
disable-model-invocation: true
harness-targets: [claude]
---

<!-- Earned against: Opus 4.7 (claude-opus-4-7), 2026-05-22. Architectural — re-evaluate when grounding-in-sources stops needing explicit scaffolding. Re-tested 2026-05-29 (Opus 4.8): KEPT. A skill-withheld agent reproduced the architecture (one reader per source, verbatim quotes, conflict synthesis) — but only under heavy prompting; the scaffold still buys reliability, the quote contract, and the forge handoff. The bar above is not yet met. 2026-06-08 (Opus 4.8, v2.1.165): added two refinements earned from a self-run on two pasted articles + a URL — (1) a pasted-source-already-in-context branch (extract inline; dispatch a subagent only for what must be fetched), and (2) a check-for-existing-brief step before writing, after the run nearly duplicated a same-day brief on adjacent material. -->

## The attention this skill redirects

From "what Claude already knows about topic X" to "what *these specific sources* say about X, where they agree, where they disagree, and what they collectively point at that wasn't in training data."

Without this redirection, the next forge step runs against priors and silently produces a generic artifact. With it, the brief carries citations, dates, and an explicit rough edge — and the forge designs against current reality.

**The brief is the handoff artifact, not the kitchen sink.** Source material is read in subagents and never enters the main thread except as excerpted quotes. The synthesis is bounded.

## How it works (three phases)

### Phase 1 — Per-source subagents

For each source the user supplies (URLs, file paths, pasted text), spawn one general-purpose `Agent` with the contract in the **Per-source agent prompt template** section below. Discipline:

- **Single source per agent.** No agent reads more than one URL/document. If the user provides 6 sources, dispatch 6 agents in parallel via a single message with multiple Agent tool calls.
- **Source already pasted in full? Extract inline, don't re-dispatch.** If the user pasted a source's complete text into the conversation, the subagent's isolation benefit is already spent — the material is in the main thread, and re-dispatching it only re-transmits the same tokens for no isolation gain. Extract its excerpts inline under the same quote-only contract (verbatim, ≤ 100 words, tagged, relevance-bounded). Still dispatch a subagent for every source you'd have to *go fetch* — URLs, file paths, anything not already in-context. The subagent buys isolation for material you don't yet hold, not ceremony for material you do.
- **Output is quoted excerpts, not paraphrase.** Each agent returns: source URL + retrieval date + 3–8 verbatim quoted passages directly relevant to the target topic, each ≤ 100 words, each tagged with the section/heading it came from. No summary in prose. Quotes only.
- **Bound the agent to the topic.** The dispatch prompt names the target topic, and the agent extracts only what is relevant to it. Tangents are excluded.
- **Stale-source handling.** If a URL 404s, redirects to a different topic, or paywalls the content, the agent reports the failure mode rather than fabricating content. The brief records the failure under **Sources unavailable**.

If the user hasn't said which sources are which type (web vs. local file vs. pasted text), assume URL by default and ask before dispatching only if the source string is ambiguous.

### Phase 2 — Synthesis in the main thread

When the per-source agents return, hold their excerpts in the main thread and assemble a brief with this structure:

1. **Topic** — one line stating what the user is designing for.
2. **Sources consulted** — for each source: URL or path, retrieval date, status (ok / 404 / paywalled / redirected / other). Failures included, not omitted.
3. **Points of agreement** — claims that ≥ 2 sources support, each with the citing excerpts inlined as quotes (not paraphrased).
4. **Points of contention** — claims sources disagree on, both sides quoted.
5. **The rough edge** — 2–4 sentences on what these sources collectively reveal that you wouldn't know from training priors. This section is load-bearing. If you cannot fill it, the sources may not have added anything, and the brief should say so explicitly rather than padding.
6. **Open questions** — claims no source addressed that the next forge will still need to make.

Bound the brief: **agreement + contention together stay under ~2,000 tokens.** If you're approaching that, cut weaker quotes; don't expand the brief.

Write the brief to `.claude/ingest/<topic-slug>.md` so the user can read, edit, and reference it independently of the session. If `.claude/ingest/` doesn't exist, create it. **First glance at what's already in `.claude/ingest/`:** if a prior brief covers overlapping sources or topic, update or cross-link it rather than silently writing a near-duplicate — two briefs on the same material fragment the handoff and bury which one the forge should read.

### Phase 3 — Confirm, then hand off to the right forge

Display the brief to the user. State your recommended next forge in one sentence with the reason. **Wait for the user to confirm or redirect before invoking the next skill.** The brief is artifact-agnostic; the right next step depends on the rough edge, not on the user's original phrasing.

Run skill-forge's triage ladder against the brief:

- **Recurring procedure or body of knowledge across sessions** → `/skill-forge`
- **Path-scoped convention that only applies to certain files** → `/rule-forge`
- **Hard guarantee the model can't reliably enforce** → `/hook-forge`
- **Session-floor fact every Claude session should hold** → `/claude-md-forge`
- **No clear rough edge; Claude's priors already cover this adequately** → say so and stop. Don't manufacture an artifact for a non-failure.

When the user confirms, invoke the chosen forge and pass the brief path as input. The forge then runs its own design pipeline against the grounded synthesis instead of against priors.

## Per-source agent prompt template

When dispatching Phase 1 agents, use this template. Substitute `{{topic}}` and `{{source}}` at dispatch time; do not paraphrase the contract — its specificity is the defense.

> Read the single source at `{{source}}` and extract 3–8 quoted passages directly relevant to: `{{topic}}`.
>
> **Output format:**
> - **Source**: full URL or file path
> - **Retrieved**: today's date (YYYY-MM-DD)
> - **Status**: ok / 404 / paywalled / redirected / other (if redirected, note destination)
> - **Excerpts**: bulleted list. Each bullet: a verbatim quote (≤ 100 words) followed by the section or heading it appeared under, in parentheses. No paraphrase. No interpretation.
>
> **Constraints:**
> - Quote-only. No summaries, no prose synthesis, no preamble or closing commentary — return only the formatted output above.
> - If the source is irrelevant to the topic, return the Source / Retrieved / Status lines and the single line `out of scope` — no excerpts and no explanation of why. Don't pad, and don't write a scope note.
> - If the source contradicts itself internally, capture both sides as separate excerpts and flag the conflict.
> - Cap output under 800 tokens.

## Failure modes this skill defends against

The shape of `/ingest` is a direct response to documented context-engineering failure modes from the AI research literature. See [references/failure-modes.md](references/failure-modes.md) for the catalog with primary-source citations.

The defense map at a glance:

- **Context poisoning** → quote-only output keeps fabricated text out; parallel agents surface a poisoned source as visible disagreement, not silent averaging.
- **Surface skim** → the Phase 1 contract *is* Anthropic's quote-extraction scratchpad pattern.
- **Citation hallucination** → every claim in the brief inlines the quote + URL; bare paraphrase is rejected.
- **Lost in the middle** → each source is read in its own short, fresh context; there is no middle of a 100k-token pile.
- **Context clash** → agreement and contention surfaced as separate sections.
- **Context distraction** → source material never enters the main thread; only ≤ 2,000 tokens of synthesis do.
- **Surface skim disguised as completeness** → the mandatory rough-edge section forces an explicit answer to "what did these sources add that priors didn't?" If you can't fill it, they didn't.

If you find yourself wanting to skip any of these defenses for a particular run, that's a signal the topic doesn't need `/ingest` — Claude's priors are probably enough.

## Anti-patterns

- **The kitchen-sink brief.** If Phase 2 produces 4,000 tokens of synthesis "to be thorough", you've defeated the point. The brief is the *small* artifact that survives into the forge. Cut weaker quotes; raise the relevance bar.
- **The single-agent firehose.** Dispatching one agent to "read all the URLs and synthesize" undoes the parallel-subagent architecture. Each source gets its own agent. No exceptions.
- **The paraphrase smuggle.** A subagent that returns "the source argues that X" instead of a verbatim quote has done paraphrase, and Phase 2 will treat it as authoritative. Reject paraphrase output and re-dispatch with the contract repeated.
- **The handoff that assumes skill.** Phase 3 isn't always a skill. Run the triage. If the brief points at a hook or a rule, route there.
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
- There's only one source — read it inline; the parallel-subagent architecture has no leverage.
- The user wants a quick answer, not a designed artifact. `/ingest` is part of the forge pipeline; it costs time and tokens.

## See also

- [references/failure-modes.md](references/failure-modes.md) — context-engineering failure modes catalog with primary-source citations.
- `/skill-forge` — the most common Phase 3 handoff target.
- `/rule-forge`, `/hook-forge`, `/claude-md-forge` — alternate Phase 3 handoff targets when the rough edge points elsewhere.
- `workflow-forge` — the same fan-out-and-synthesize expressed as a deterministic JS workflow (real concurrency, schema-enforced quote-only output, resumable), for when the corpus is large or the run must reproduce. See its `examples/ingest-fanout.workflow.mjs`.
