# Working model guide

Last verified: 2026-07-24

<!-- Earned against: GPT-5.6 Sol, 2026-07-24, Claude Code v2.1.218 -->

A routing reference for choosing models while building, testing, and retiring agent skills and primitives. It is not a universal leaderboard. Model, provider, agent harness, tools, and reasoning effort are separate variables; a result belongs to the full configuration that produced it.

API prices below are USD per 1 million input/output tokens. They exclude cached-token rates, batch discounts, long-context multipliers, reasoning-token differences, and tool-call charges. Benchmark cost per rollout is more useful than list price when it is available.

## Recommended routing

| Work | First pick | Strong alternative | Why | Confidence |
| --- | --- | --- | --- | --- |
| Best overall fallback | **Claude Fable 5, high** | GPT-5.6 Sol, xhigh | Fable is #1 in Agent Arena, Text Arena, and Creative Writing, and #2 in Arena WebDev. Sol is #2 in Agent Arena, #3 in Arena WebDev, and leads the Artificial Analysis Coding Agent Index in the Codex harness. | High |
| Production frontend across design + code | **GPT-5.6 Sol, xhigh/max** | Fable 5, xhigh | Sol is near the top of visual WebDev preference and ReactBench, and is the strongest React fixer. Fable is stronger at greenfield React writing and subjective product work, but much weaker at React repair and much more expensive per ReactBench rollout. | High |
| Visual UI exploration and prototypes | **Kimi K3** | Fable 5 | Kimi is #1 in Arena WebDev blind preference. Treat the output as a visual direction, not production React: Kimi is well below the ReactBench leaders. | Medium |
| New React feature work | **Fable 5, xhigh** | GPT-5.6 Terra, max | Fable leads ReactBench Write React; Terra is close at a fraction of the rollout cost and has a much better Fix React result. | High |
| React audits, refactors, and debugging | **GPT-5.6 Sol, max** | GPT-5.6 Terra, max | Sol leads ReactBench Fix React. Terra is second and is the better high-volume default. | High |
| Long-horizon repo engineering and agent orchestration | **Fable 5, high/xhigh** | GPT-5.6 Sol, xhigh | Fable leads Agent Arena and Terminal-Bench 2.1 in Claude Code. Sol is close in Agent Arena and leads Artificial Analysis's coding-agent composite in Codex. | High |
| Backend, shell, and infrastructure | **Fable 5 in Claude Code** | Grok 4.5 in Cursor; GPT-5.6 Terra in Codex | Terminal-Bench 2.1 ranks those harnessed configurations #1, #4, and #6 respectively. Grok is the cost-oriented alternative; never detach these scores from their harnesses. | Medium |
| Writing, idea generation, and distillation | **Fable 5** | Opus 4.8 for a cheaper Claude fallback | Fable leads both overall Text Arena and Creative Writing. Human preference is not factual correctness, so verify claims separately. | High |
| Internet research and source discovery | **Opus 4.6 + search for discovery; Fable 5 for synthesis** | GPT-5.5 + search | Search Arena currently ranks Opus 4.6 search #1, GPT-5.5 search #2, and Fable 5 #3. Use BrowseComp and a local source-quality eval for obscure, evidence-heavy research; Search Arena measures preference, not complete retrieval correctness. | Medium |
| Fast, inexpensive loops | **GPT-5.6 Luna** | Gemini 3.6 Flash | Luna is $1/$6 per MTok and reaches 43.9% on ReactBench at max. Gemini is strongly tooled and multimodal at $1.50/$7.50, but has not yet been published on ReactBench v1. | Medium |
| Open-weight or self-hosted work | **GLM 5.2** | Kimi K3 after weights ship | GLM 5.2 is MIT-licensed, has 1M context, and ranks #4 in Arena WebDev. Kimi says K3 weights will release on 2026-07-27; until that actually happens, do not route self-hosted work to it. | Medium |

If one model must cover this owner's full mix of coding, design, ideas, writing, and distillation, use **Fable 5**. If frontend and React correctness carry more weight than writing, or cost matters, use **GPT-5.6 Sol**. That is a routing judgment from the evidence below, not a claim that either model is universally best.

## Current model and cost snapshot

| Provider | Model / API ID | Best evidenced use | API price in/out | Context | Important qualification |
| --- | --- | --- | ---: | ---: | --- |
| Anthropic | Claude Fable 5 / `claude-fable-5` | Overall agentic work, long-horizon coding, writing, greenfield React | $10 / $50 | 1M | Highest capability and cost here. Some safety-classified requests fall back to Opus 4.8. |
| OpenAI | GPT-5.6 Sol / `gpt-5.6-sol` | Production frontend, React repair, coding agents, design judgment | $5 / $30 | 1.05M | Best results use high reasoning and the Codex harness; raw API results may differ. |
| OpenAI | GPT-5.6 Terra / `gpt-5.6-terra` | High-volume React and balanced engineering | $2.50 / $15 | 1.05M | ReactBench's practical price/performance choice. Artificial Analysis says Luna or Sol dominates Terra on its broader intelligence/cost frontier. |
| OpenAI | GPT-5.6 Luna / `gpt-5.6-luna` | Cheap loops, triage, drafts, surprisingly capable React work at max | $1 / $6 | 1.05M | Max effort changes both capability and real cost; do not infer max-effort economics from list price alone. |
| Moonshot AI | Kimi K3 / `kimi-k3` | Visual frontend preference, long-context knowledge work | $3 / $15* | 1M | Arena WebDev result is preliminary. Kimi's own pricing page currently renders no numeric table in static retrieval; price shown is Arena's listing. |
| SpaceXAI | Grok 4.5 / `grok-4.5` | Cost-efficient React, terminal work, agentic software engineering | $2 / $6 | 500K | Requests beyond 200K use higher-context pricing. |
| Z.ai | GLM 5.2 | Open-weight long-horizon coding and UI generation | $1.40 / $4.40* | 1M | MIT model; API price shown is Arena's SiliconFlow listing and varies by host. |
| Anthropic | Claude Opus 4.8 / `claude-opus-4-8` | Complex agentic work when Fable cost or safeguards are unsuitable | $5 / $25 | 1M | Strong agent and WebDev signal, but poor ReactBench Fix React result for its cost. |
| Anthropic | Claude Sonnet 5 / `claude-sonnet-5` | Fast general agents and knowledge work | $2 / $10† | 1M | Introductory price ends 2026-08-31; standard price becomes $3/$15. ReactBench trails the cheaper OpenAI and Grok options. |
| Google | Gemini 3.6 Flash / `gemini-3.6-flash` | Fast multimodal agents, search grounding, rapid coding loops | $1.50 / $7.50 | 1.05M | Released 2026-07-21; WebDev rank is preliminary and ReactBench v1 has not evaluated it. |

\* Arena-listed API price rather than a stable provider-wide list price.
† Introductory price through 2026-08-31.

## React: use the split, not the headline

ReactBench v1 uses 51 realistic tasks, five trials per configuration, hidden behavioral tests, and a pinned deterministic React Doctor verifier. Write React tests feature implementation without new React defects; Fix React tests whether a model can discover and repair defects while preserving behavior.

| Model / effort | Overall | Write React | Fix React | Mean cost at overall effort |
| --- | ---: | ---: | ---: | ---: |
| GPT-5.6 Terra, max | **53.3%** | 64.4% | 40.8% | $1.76 |
| GPT-5.6 Sol, max | 52.5% | 57.8% at high | **50.8%** | $3.62 |
| Fable 5, xhigh | 47.5% | **65.9%** | 26.7% | $10.45 |
| GPT-5.6 Luna, max | 43.9% | 54.1% | 32.5% | $0.99 |
| Grok 4.5, high | 40.4% | 48.1% at medium | 35.8% | $0.62 |
| Opus 4.8, max | 36.5% | 50.4% | 20.8% | $7.30 |
| Kimi K3 | 32.9% | 45.2% | 19.2% | $2.32 |
| GLM 5.2, xhigh | 32.5% | 47.4% | 24.2% at low | $2.90 |
| Sonnet 5, max | 30.6% | 42.2% at xhigh | 18.3% | $5.98 |

The live ReactBench page currently mixes its visible leaderboard figures with different aggregate figures in the narrative. This table records the visible leaderboard and task-split values retrieved on 2026-07-24. Do not silently combine them with another ReactBench metric.

What this changes:

- A model can be excellent at **writing** React and weak at **finding defects** in React. Fable 5 is the clearest example.
- Visual WebDev preference is not React correctness. Kimi K3 is #1 in Arena WebDev but seventh in this ReactBench snapshot.
- List price is not task cost. Reasoning volume and harness behavior dominate expensive rollouts.
- ReactBench evaluates agents, not isolated models. Its own limitations name harness effects and missing visual correctness.

For React/Next.js/Astro skills, keep a local eval covering framework APIs, server/client boundaries, accessibility, design-system compliance, visual fidelity, and repository conventions. ReactBench cannot certify those.

## Agentic, terminal, frontend, writing, and search signals

### Agent Arena

Snapshot dated 2026-07-21; 1,242,857 sessions. Net improvement is Arena's composite of task completion, tool reliability, steerability, bash recovery, and tool hallucination.

| Rank | Model / effort | Net improvement | Sessions |
| ---: | --- | ---: | ---: |
| 1 | Claude Fable 5, high | 12.72% ± 2.00% | 23,549 |
| 2 | GPT-5.6 Sol, xhigh | 10.12% ± 1.69% | 15,991 |
| 3 | Claude Opus 4.8, thinking | 9.75% ± 1.39% | 34,147 |
| 4 | Kimi K3 | 9.71% ± 1.52% | 11,490 |
| 5 | Claude Sonnet 5, high | 8.66% ± 1.89% | 24,359 |

Treat overlapping intervals as uncertainty, not a podium with false precision.

### Terminal-Bench 2.1

Terminal-Bench reports model + agent + effort. The team runs and verifies submissions.

| Rank | Agent + model + effort | Accuracy | Evaluation date |
| ---: | --- | ---: | --- |
| 1 | Claude Code + Fable 5, xhigh | 83.8% ± 1.2% | 2026-06-07 |
| 4 | Cursor CLI + Grok 4.5, high | 79.3% ± 1.5% | 2026-07-09 |
| 5 | Claude Code + Opus 4.8, high | 78.9% ± 1.3% | 2026-07-09 |
| 6 | Codex + GPT-5.6 Terra, max | 78.4% ± 1.3% | 2026-07-11 |
| 9 | Codex + GPT-5.6 Luna, max | 75.7% ± 1.3% | 2026-07-11 |
| 10 | Claude Code + Sonnet 5, high | 74.6% ± 1.6% | 2026-07-09 |

Rank gaps include configurations not shown here. Never rewrite these as raw-model scores.

### Human-preference arenas

Snapshot dated 2026-07-21.

| Surface | Leading evidence | What it supports | What it does not establish |
| --- | --- | --- | --- |
| Arena WebDev | Kimi K3 #1; Fable 5 #2; GPT-5.6 Sol xhigh in Codex #3; GLM 5.2 max #4 | Visual and interaction preference for generated frontend work | Accessibility, maintainability, production architecture, or React correctness |
| Text Arena overall | Fable 5 #1 | Broad subjective response quality across open-ended text tasks | Factual correctness on a particular domain |
| Creative Writing | Fable 5 #1 | Voice, ideation, and preferred prose | Owner-specific taste without a local blind comparison |
| Search Arena | Opus 4.6 search #1; GPT-5.5 search #2; Fable 5 #3 | Preference for integrated-search answers | Obscure-answer retrieval, citation completeness, or source judgment |

## How to evaluate a skill or primitive

Public benchmarks choose candidates. A stable local eval decides whether an artifact earns its context cost.

| Artifact or task | Public signals to consult | Local evaluation must add |
| --- | --- | --- |
| UI/design skill | Arena WebDev; local visual model comparison | Screenshot fidelity, responsive behavior, accessibility, design-system reuse, and owner preference |
| React/Next/Astro skill | ReactBench; SWE-bench Verified; coding-agent index | Current framework APIs, repository conventions, visual fidelity, server/client correctness, and upgrade behavior |
| Agent workflow, hook, or subagent primitive | Agent Arena; Terminal-Bench; Artificial Analysis agent/coding categories | Tool contract, recovery from actual failures, token/context cost, permission behavior, and the live harness version |
| Backend/terminal skill | Terminal-Bench; SWE-bench Verified | The repository's services, test contracts, database semantics, deployment environment, and failure recovery |
| Research skill | Search Arena; BrowseComp | Primary-source selection, recency judgment, event date vs publication date, citation correctness, Reddit/X usefulness, and hallucinated-source rate |
| Writing/taste skill | Text Arena category + style control | Blind owner preference on the actual genre and a bare-model comparison |

Record every local result with this minimum schema:

```yaml
evaluation:
  task:
  category:
  evaluation_date: YYYY-MM-DD
  source_or_fixture:
  model_provider:
  model_id:
  model_version:
  agent:
  harness_version:
  tools:
  reasoning_effort:
  attempts:
  score:
  cost_usd:
  latency:
  confidence_interval:
  owner_verdict:
  notes:
```

For a skill deletion test, run the same tasks with and without the skill on the same model/harness/effort. Prefer blinded output comparison where possible. A new model release is a re-test trigger, not evidence that the skill is obsolete.

## Source and update policy

Source order:

1. Provider model docs for availability, model IDs, context, capabilities, and list price.
2. Independent or benchmark-team leaderboards for comparative performance.
3. Vendor-reported evaluations only as supporting context, never the sole basis for cross-provider ranking.
4. Local, task-specific evals for the final routing decision.

Every update must:

- use an absolute `YYYY-MM-DD` verification date;
- separate provider, model, agent, harness, tools, and reasoning effort;
- preserve confidence intervals, preliminary labels, sample sizes, and benchmark versions;
- verify withdrawn, suspended, preview, or price-changing models separately from leaderboard state;
- edit or retire contradicted guidance rather than layering new claims around it;
- keep task-specific routes and resist producing one synthetic universal score;
- flag source inconsistencies instead of silently choosing whichever number looks cleaner.

Run `/model-bump` from this repository to refresh the guide.

## Sources

Retrieved 2026-07-24 unless a source carries its own snapshot date.

- [Artificial Analysis Intelligence Index methodology](https://artificialanalysis.ai/methodology/intelligence-benchmarking) — v4.1 composition, weights, harness, cost, and limitations.
- [Artificial Analysis: GPT-5.6 benchmarks](https://artificialanalysis.ai/articles/gpt-5-6-has-landed) — current intelligence/cost frontier and Coding Agent Index.
- [Arena Agent](https://arena.ai/leaderboard/agent) — real-world tool orchestration, snapshot 2026-07-21.
- [Arena WebDev](https://arena.ai/leaderboard/code/webdev) — blind frontend preference, snapshot 2026-07-21.
- [Arena Text](https://arena.ai/leaderboard/text) and [Creative Writing](https://arena.ai/leaderboard/text/creative-writing) — human preference, snapshot 2026-07-21.
- [Arena Search](https://arena.ai/leaderboard/search) — integrated web-search preference, snapshot 2026-07-21.
- [ReactBench v1](https://www.reactbench.com/) and [methodology/results](https://www.reactbench.com/blog) — React Write/Fix tasks, five-trial pass@1, rollout cost, and limitations.
- [Terminal-Bench 2.1](https://www.tbench.ai/leaderboard/terminal-bench/2.1) — verified terminal-agent results.
- [SWE-bench Verified](https://www.swebench.com/verified.html) — 500 human-validated repository issues and the bash-only model comparison contract.
- [BrowseComp](https://openai.com/index/browsecomp/) — difficult, verifiable web-retrieval benchmark.
- [OpenAI GPT-5.6 release and pricing](https://openai.com/index/gpt-5-6/) and [model catalog](https://developers.openai.com/api/docs/models).
- [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview), [Fable 5 release](https://www.anthropic.com/news/claude-fable-5-mythos-5), and [Sonnet 5 release](https://www.anthropic.com/news/claude-sonnet-5).
- [Kimi K3 guide](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart) and [pricing page](https://platform.kimi.ai/docs/pricing/chat-k3).
- [Grok 4.5 model docs](https://docs.x.ai/developers/models/grok-4.5).
- [GLM 5.2 model card](https://huggingface.co/zai-org/GLM-5.2).
- [Gemini 3.6 Flash model docs](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash) and [pricing](https://ai.google.dev/gemini-api/docs/pricing).
