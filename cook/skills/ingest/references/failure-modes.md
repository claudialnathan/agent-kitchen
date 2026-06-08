# Context-engineering failure modes — and how `/ingest` defends against them

Primary-source catalog of failure modes documented for "load external sources, then act" workflows. Each entry: the failure, the source, the specific defense `/ingest` encodes.

This is on-demand depth. `SKILL.md` references it; you only load it when investigating a defense or considering a deliberate skip.

## Context poisoning

A hallucination enters context once and gets cited repeatedly downstream, compounding into the final artifact. Once a fabricated claim is in working memory, subsequent reasoning steps treat it as evidence.

**Sources:**
- Drew Breunig's failure-mode taxonomy: https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html
- Anthropic on context engineering: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

**`/ingest`'s defense:** per-source agents return verbatim quotes only — no paraphrase. Multiple independent agents working in parallel surface a single poisoned source as visible disagreement in the contention section of the brief, rather than silent averaging into the synthesis.

## Context distraction

Past ~100k tokens, models begin repeating context history rather than synthesizing novel plans. Documented in Google DeepMind's Gemini agent research.

**`/ingest`'s defense:** the source material itself never enters the main thread. The brief is bounded to ~2,000 tokens of synthesis. The forge step then runs in a context well under saturation.

## Context confusion

Irrelevant material in context still gets attended to and degrades output. Documented by the Berkeley Function-Calling Leaderboard team.

**`/ingest`'s defense:** per-source agents are bound to the target topic at dispatch time. They return excerpts only for content directly relevant to the topic; tangents stay outside the main thread.

## Context clash

When sources contradict each other, models commit early to one interpretation and stay committed, ignoring the conflict. Microsoft + Salesforce measured a **39% average performance drop** on contradictory sources versus consistent ones.

**`/ingest`'s defense:** the brief surfaces points of agreement and contention as separate sections. Conflicts are made visible and quoted on both sides, not averaged or hidden.

## Lost in the middle

U-shaped attention: middle-of-context evidence is under-weighted relative to start and end.

**Source:** Liu et al., "Lost in the Middle" — https://arxiv.org/pdf/2510.10276

**`/ingest`'s defense:** each source is read by its own subagent in a fresh, short context. There is no "middle" of a 100k-token pile to lose information in.

## Context rot

Accuracy degrades with token count due to training-distribution mismatch (Anthropic's term in their context-engineering post).

**`/ingest`'s defense:** same as context distraction — bounded brief, bounded forge-step context, source material never inlined.

## Citation hallucination

Models misattribute claims to fabricated sources even when correct sources are present in context.

**Source:** FACTUM — https://arxiv.org/pdf/2601.05866

**`/ingest`'s defense:** every claim in the brief inlines the verbatim quote and the source URL. Bare paraphrase without a quoted excerpt is rejected at synthesis time.

## Surface skim

Models skim long documents rather than reading carefully, especially when there are many sources. Anthropic's documented counter is to force the model to extract relevant quotes into a scratchpad before producing the downstream artifact.

**Source:** Anthropic, "Prompting long context" — https://www.anthropic.com/news/prompting-long-context

**`/ingest`'s defense:** the Phase 1 contract *is* a quote-extraction scratchpad. No subagent produces a summary; only quotes. The scratchpad pattern is moved from optional best-practice to architecturally enforced.

## Surface skim disguised as completeness

Even with quotes, the synthesis can become so comprehensive that it covers everything and reveals nothing. The downstream forge ends up no more grounded than if no sources had been consulted — just longer.

**`/ingest`'s defense:** the brief includes a mandatory **rough edge** section — 2–4 sentences on what these sources collectively add that Claude's training priors didn't. If you cannot fill the rough-edge section, the sources didn't add anything, and the brief should say so rather than padding.

## Related precedents (not failure modes — design analogues)

The literature has named pieces of what `/ingest` does, but no published architecture explicitly targets corpus → reusable agent-skill-file as the output artifact. The closest precedents:

- **OpenAI Deep Research** — Triage → Clarifier → **Instruction Builder** → Research Agent. The Instruction Builder converts an enriched user request into a precise research brief before the research agent runs. https://developers.openai.com/cookbook/examples/deep_research_api/introduction_to_deep_research_api_agents
- **Gemini Deep Research** — plan → search → read → iterate → output, with ~80 queries / ~250k input tokens typical and optional human approval of the plan. https://ai.google.dev/gemini-api/docs/deep-research
- **Anthropic's context engineering** — just-in-time retrieval (keep identifiers, hydrate on demand) + progressive disclosure (incremental context build-up). https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Instruction Induction** (Honovich et al., 2022) — corpus → natural-language task description. https://arxiv.org/pdf/2205.10782
- **Context Distillation** (Snell et al., 2022) — internalize an instruction-conditioned behavior so the instruction can be dropped. Done by fine-tuning, but the corpus → reusable instruction direction matches. https://arxiv.org/pdf/2209.15189
- **Self-Instruct** (Wang et al., 2022) — bootstrapping instructions from seed examples. https://arxiv.org/pdf/2212.10560

## Sources cited in `/ingest`'s design

- Anthropic, "Effective context engineering for AI agents" — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, "Prompting long context" — https://www.anthropic.com/news/prompting-long-context
- Drew Breunig, "How contexts fail and how to fix them" — https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html
- OpenAI Deep Research developer cookbook — https://developers.openai.com/cookbook/examples/deep_research_api/introduction_to_deep_research_api_agents
- Gemini Deep Research API docs — https://ai.google.dev/gemini-api/docs/deep-research
- Liu et al., "Lost in the Middle" — https://arxiv.org/pdf/2510.10276
- Honovich et al., "Instruction Induction" — https://arxiv.org/pdf/2205.10782
- Snell et al., "Context Distillation" — https://arxiv.org/pdf/2209.15189
- Wang et al., "Self-Instruct" — https://arxiv.org/pdf/2212.10560
- FACTUM (citation hallucination) — https://arxiv.org/pdf/2601.05866
