# Working model guide

Last verified: 2026-08-04

Read when: the task involves model choice, routing economics, reasoning-effort tradeoffs, or a model release changing what an artifact is earned against. Skip for work that doesn't pick or price a model.

A routing reference for choosing models while building, testing, and retiring agent skills and primitives. It is not a universal leaderboard. Model, provider, agent harness, tools, and reasoning effort are separate variables; a result belongs to the full configuration that produced it.

API prices below are USD per 1 million input/output tokens. They exclude cached-token rates, batch discounts, long-context multipliers, reasoning-token differences, and tool-call charges. Benchmark cost per rollout is more useful than list price when it is available.

## How the kitchen uses this guide

This file is a conditional reference, not context every skill should load. Kitchen skills open it only when model choice, effort, evaluation cost, or model-release convergence can change the decision:

| Skill | Read `MODELS.md` when |
| --- | --- |
| `new-skill` | choosing the model/effort that should author, earn, or re-test an artifact |
| `improve-skill` | judging whether a model release absorbed the gap, or whether a correction cluster is model-specific |
| `harness-audit` | auditing model policy, routing cost, or whether a model release may have absorbed an artifact |
| `ingest` | supplied material makes a claim about model capability, economics, or model-dependent artifact design |

The skills point here from their own source directory and otherwise leave the file unopened. The guide orients a decision; current provider docs, benchmark pages, and local evals still verify it.

## Availability and entitlement preflight

The public winner is not the usable winner when the user cannot select it, has no access to its harness, or would pay twice to reach it. Before applying the routing table, build a transient picture of the user's actual options:

| Check | Establish it from |
| --- | --- |
| Installed harnesses | `command -v`, the installed app/CLI version, and the current repository's enabled plugins or integrations |
| Models actually selectable | The harness's native model picker or model-list command, not the models its marketing page says it supports |
| Authentication and plan access | A non-secret account/status command when it exposes the tier; otherwise ask the user which subscription, API, enterprise, or pay-as-you-go access they have |
| Real marginal cost | Included subscription usage and remaining quota, API billing, overage policy, tool charges, retry rate, and whether a separate provider account would be required |
| Policy constraints | Enterprise allowlists, regional availability, preview opt-ins, data-handling restrictions, and model fallbacks |

Do not inspect credential files, print account identifiers, or infer a paid plan from an installed CLI. Installation, login, entitlement, and a visible model are four different facts. Keep personal plan and billing details in the session unless the owner explicitly asks to persist them.

Apply the table only after filtering it through that availability picture:

1. Prefer the strongest task-specific route already included in a paid plan when it clears the task's quality bar and its quota is acceptable.
2. Otherwise choose the best accessible model by task-level cost, not nominal token price.
3. If the ideal model is unavailable, name it separately from the best **available** recommendation and use the strongest accessible alternative.
4. Ask rather than guess when plan tier, remaining quota, API budget, or willingness to add another paid provider changes the answer.

Subscription usage is not economically free, but its marginal cost for the next task may be lower than opening an API bill elsewhere. Conversely, a bundled plan with tight weekly limits may make a cheaper API model the better high-volume route.

## Recommended routing

| Work | First pick | Strong alternative | Why | Confidence |
| --- | --- | --- | --- | --- |
| Best overall fallback | **Claude Opus 5, high** when Fable is credit/quota-gated; **Fable 5, high** when already entitled with headroom | GPT-5.6 Sol, xhigh | Opus 5 is #1 in Agent Arena (High) and Arena WebDev (max) at half Fable's list price. Fable still leads Text Arena and Creative Writing and remains the ceiling when the plan includes it. Sol is #5 Agent Arena / #6 WebDev and leads Artificial Analysis's Coding Agent Index jointly with Opus 5 (Codex). | High |
| Best output-token-efficient frontier work | **GPT-5.6 Sol, max** | GPT-5.6 Luna when dollar cost matters more | Artificial Analysis places Sol on the Intelligence-vs-output-tokens Pareto frontier at about 15K output tokens per Intelligence Index task. Luna is far cheaper per task, but is not the output-token frontier at comparable intelligence. | High |
| Production frontend across design + code | **GPT-5.6 Sol, xhigh/max** | Opus 5, max; Fable 5, xhigh | Sol remains near the top of visual WebDev preference and ReactBench, and is the strongest React fixer. Opus 5 Max closes much of the Claude ReactBench gap (49% overall). Fable is still strong at greenfield React writing and subjective product work, but weaker at React repair and more expensive per rollout. | High |
| Visual UI exploration and prototypes | **Kimi K3** | Opus 5, max | Kimi remains near the top of Arena WebDev blind preference (Opus 5 max now #1). Treat the output as a visual direction, not production React: Kimi trails ReactBench leaders. | Medium |
| New React feature work | **Fable 5, xhigh** | GPT-5.6 Terra, max; Opus 5, max | Fable still leads ReactBench Write React in the last published split; Terra is close at a fraction of the rollout cost. Opus 5 Max is the best Claude overall ReactBench score so far (49%). | High |
| React audits, refactors, and debugging | **GPT-5.6 Sol, max** | GPT-5.6 Terra, max | Sol leads ReactBench Fix React. Terra is second and is the better high-volume default. Opus 5 improved Claude Fix React vs 4.8 but does not displace Sol. | High |
| Long-horizon repo engineering and agent orchestration | **Opus 5, high** (or Fable 5 when entitled) | GPT-5.6 Sol, xhigh | Opus 5 leads Agent Arena High and joins Sol atop Artificial Analysis's Coding Agent Index. Fable remains close and is still the Terminal-Bench 2.1 Claude Code leader in published runs. | High |
| Backend, shell, and infrastructure | **Fable 5 in Claude Code** | Grok 4.5 in Cursor; GPT-5.6 Terra in Codex; Opus 5 when Fable is gated | Terminal-Bench 2.1 still ranks Fable+Claude Code #1 among published configs; Opus 5 Terminal-Bench rows may lag publication. Never detach these scores from their harnesses. | Medium |
| Writing, idea generation, and distillation | **Fable 5** | Opus 5 for a cheaper Claude fallback | Fable leads both overall Text Arena and Creative Writing. Opus 5 is mid-pack on preference boards despite stronger agent/coding scores — preference ≠ capability. Verify claims separately. | High |
| Internet research and source discovery | **Opus 4.6 + search for discovery; Fable 5 for synthesis** | GPT-5.5 + search; Opus 5 for synthesis when Fable is gated | Search Arena still ranks Opus 4.6 search highly; preference boards are not complete retrieval correctness. Use BrowseComp and a local source-quality eval for obscure, evidence-heavy research. | Medium |
| Fast, inexpensive loops | **GPT-5.6 Luna** | Gemini 3.6 Flash | Luna is $1/$6 per MTok and reaches 43.9% on ReactBench at max. Gemini is strongly tooled and multimodal at $1.50/$7.50, but has not yet been published on ReactBench v1. | Medium |
| Open-weight or self-hosted work | **GLM 5.2** | Kimi K3 after weights ship | GLM 5.2 is MIT-licensed, has 1M context, and ranks near the top of Arena WebDev. Confirm Kimi K3 weight release before routing self-hosted work to it. | Medium |

If one model must cover this owner's full mix of coding, design, ideas, writing, and distillation, use **Fable 5** when it is already entitled with usable headroom; otherwise use **Opus 5** as the Claude daily driver and reserve Fable for writing/taste ceiling work. If frontend and React correctness carry more weight than writing, or cost matters, use **GPT-5.6 Sol** when Codex/API access exposes it. That is a public-evidence routing judgment; the availability preflight determines the recommendation the user can act on now.

## Choose the lowest capable model

“Token-efficient” and “cheap” are different routes. Output-token efficiency asks how much generated reasoning a successful task consumes; dollar efficiency also includes input/output prices, cache behavior, tool calls, and retry rate. A low list price can lose after a failed run, while a frontier model can be token-efficient and still cost more per token.

For skill and primitive work, start with the lowest model and effort that is likely to pass a representative local eval, then escalate on an observed failure:

- use Luna or another low-cost capable model for mechanical extraction, formatting, inventory, and well-specified edits;
- use Sol or Opus 5 for artifact authoring or review that needs non-obvious engineering judgment (Sol especially for frontend/React);
- use the strongest task-specific route when earning or re-testing the judgment an artifact exists to add. The baseline model should be the model the artifact is meant to steer, not an artificially weak opponent.

Record the chosen model, harness, effort, task cost, and output tokens when available. The “best token-efficient model” is therefore a maintained route in this guide, not a fact frozen inside every skill.

## Current model and cost snapshot

| Provider | Model / API ID | Best evidenced use | API price in/out | Context | Important qualification |
| --- | --- | --- | ---: | ---: | --- |
| Anthropic | Claude Opus 5 / `claude-opus-5` | Default Claude Opus: agentic coding, orchestration, Max/Pro Opus seat | $5 / $25 | 1M | Launched 2026-07-24. Fast mode $10/$50 (~2.5×). Thinking on by default. AA Intelligence max ~61; Agent Arena High #1 and WebDev max #1 in early-August snapshots. Cyber refusals can fall back to Opus 4.8. |
| Anthropic | Claude Fable 5 / `claude-fable-5` | Writing/taste ceiling, long-horizon when entitled | $10 / $50 | 1M | Still leads Text Arena and Creative Writing. Plan: in-plan on Max/premium seats (≤50% weekly); usage credits on Pro/standard since 2026-07-20. Some safety-classified requests fall back. |
| OpenAI | GPT-5.6 Sol / `gpt-5.6-sol` | Production frontend, React repair, coding agents, design judgment | $5 / $30 | 1.05M | Best results use high reasoning and the Codex harness; raw API results may differ. Joint Coding Agent Index leader with Opus 5. |
| OpenAI | GPT-5.6 Terra / `gpt-5.6-terra` | High-volume React and balanced engineering | $2.50 / $15 | 1.05M | ReactBench's practical price/performance choice. Artificial Analysis says Luna or Sol dominates Terra on its broader intelligence/cost frontier. |
| OpenAI | GPT-5.6 Luna / `gpt-5.6-luna` | Cheap loops, triage, drafts, surprisingly capable React work at max | $1 / $6 | 1.05M | Max effort changes both capability and real cost; do not infer max-effort economics from list price alone. |
| Moonshot AI | Kimi K3 / `kimi-k3` | Visual frontend preference, long-context knowledge work | $3 / $15* | 1M | Arena WebDev result can shift with new Claude/OpenAI rows; treat as preference, not React correctness. Kimi's own pricing page may omit a numeric table in static retrieval; price shown is Arena's listing. |
| SpaceXAI | Grok 4.5 / `grok-4.5` | Cost-efficient React, terminal work, agentic software engineering | $2 / $6 | 500K | Requests beyond 200K use higher-context pricing. |
| Z.ai | GLM 5.2 | Open-weight long-horizon coding and UI generation | $1.40 / $4.40* | 1M | MIT model; API price shown is Arena's SiliconFlow listing and varies by host. |
| Anthropic | Claude Opus 4.8 / `claude-opus-4-8` | Classifier fallback / still-selectable prior Opus | $5 / $25 | 1M | Superseded as default Opus by Opus 5. Remains the cyber-classifier fallback target in Claude Code. Weaker Agent Arena / ReactBench than Opus 5 at the same list price. |
| Anthropic | Claude Sonnet 5 / `claude-sonnet-5` | Fast general agents and knowledge work; Pro-tier default | $2 / $10† | 1M | Introductory price ends 2026-08-31; standard price becomes $3/$15. ReactBench trails the cheaper OpenAI and Grok options. |
| Google | Gemini 3.6 Flash / `gemini-3.6-flash` | Fast multimodal agents, search grounding, rapid coding loops | $1.50 / $7.50 | 1.05M | Released 2026-07-21; WebDev rank is preliminary and ReactBench v1 has not evaluated it. |

\* Arena-listed API price rather than a stable provider-wide list price.
† Introductory price through 2026-08-31.

## React: use the split, not the headline

ReactBench v1 uses 51 realistic tasks, five trials per configuration, hidden behavioral tests, and a pinned deterministic React Doctor verifier. Write React tests feature implementation without new React defects; Fix React tests whether a model can discover and repair defects while preserving behavior.

| Model / effort | Overall | Write React | Fix React | Mean cost at overall effort |
| --- | ---: | ---: | ---: | ---: |
| GPT-5.6 Terra, max | **53.3%** | 64.4% | 40.8% | $1.76 |
| GPT-5.6 Sol, max | 52.5% | 57.8% at high | **50.8%** | $3.62 |
| Opus 5, max | 49.0% | — | — | $6.47 |
| Fable 5, xhigh | 47.5% | **65.9%** | 26.7% | $10.45 |
| GPT-5.6 Luna, max | 43.9% | 54.1% | 32.5% | $0.99 |
| Grok 4.5, high | 40.4% | 48.1% at medium | 35.8% | $0.62 |
| Opus 4.8, max | 36.5% | 50.4% | 20.8% | $7.30 |
| Kimi K3 | 32.9% | 45.2% | 19.2% | $2.32 |
| GLM 5.2, xhigh | 32.5% | 47.4% | 24.2% at low | $2.90 |
| Sonnet 5, max | 30.6% | 42.2% at xhigh | 18.3% | $5.98 |

The live ReactBench page currently mixes its visible leaderboard figures with different aggregate figures in the narrative. Rows through Sonnet 5 record the visible leaderboard and task-split values first retrieved on 2026-07-24; the Opus 5 Max overall/cost row was added 2026-08-04 from the live board (Write/Fix split not separately confirmed that day — do not invent the split). Do not silently combine them with another ReactBench metric.

What this changes:

- A model can be excellent at **writing** React and weak at **finding defects** in React. Fable 5 is the clearest example.
- Visual WebDev preference is not React correctness. Kimi K3 is #1 in Arena WebDev but seventh in this ReactBench snapshot.
- List price is not task cost. Reasoning volume and harness behavior dominate expensive rollouts.
- ReactBench evaluates agents, not isolated models. Its own limitations name harness effects and missing visual correctness.

For React/Next.js/Astro skills, keep a local eval covering framework APIs, server/client boundaries, accessibility, design-system compliance, visual fidelity, and repository conventions. ReactBench cannot certify those.

## Agentic, terminal, frontend, writing, and search signals

### Agent Arena

Snapshot dated 2026-08-03; session totals move daily. Net improvement is Arena's composite of task completion, tool reliability, steerability, bash recovery, and tool hallucination.

| Rank | Model / effort | Net improvement | Sessions |
| ---: | --- | ---: | ---: |
| 1 | Claude Opus 5, high | 12.10% ± 1.40% | 19,135 |
| 2 | Claude Fable 5, high | 11.69% ± 2.37% | — |
| 3 | Claude Opus 5, max | 11.50% ± 1.66% | — |
| 5 | GPT-5.6 Sol, xhigh | 10.09% ± — | — |
| 6 | Claude Opus 4.8, thinking | 9.21% ± — | — |

Treat overlapping intervals as uncertainty, not a podium with false precision. Re-check the live board before citing exact session counts for ranks 2+.

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

Snapshot dated 2026-08-01 (WebDev) / 2026-08-04 (Text/CW retrieval).

| Surface | Leading evidence | What it supports | What it does not establish |
| --- | --- | --- | --- |
| Arena WebDev | Opus 5 max #1; Kimi K3 near top; Opus 5 high and Fable still in the top tier; GPT-5.6 Sol xhigh in Codex close behind | Visual and interaction preference for generated frontend work | Accessibility, maintainability, production architecture, or React correctness |
| Text Arena overall | Fable 5 #1; Opus 5 mid-pack despite stronger agent/coding boards | Broad subjective response quality across open-ended text tasks | Factual correctness on a particular domain |
| Creative Writing | Fable 5 #1 | Voice, ideation, and preferred prose | Owner-specific taste without a local blind comparison |
| Search Arena | Opus 4.6 search still a leading preference signal; Fable and GPT search variants nearby | Preference for integrated-search answers | Obscure-answer retrieval, citation completeness, or source judgment |

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

Retrieved 2026-08-04 unless a source carries its own snapshot date.

- [Artificial Analysis Intelligence Index methodology](https://artificialanalysis.ai/methodology/intelligence-benchmarking) — v4.1 composition, weights, harness, cost, and limitations.
- [Artificial Analysis: GPT-5.6 benchmarks](https://artificialanalysis.ai/articles/gpt-5-6-has-landed) — current intelligence/cost frontier and Coding Agent Index.
- [Arena Agent](https://arena.ai/leaderboard/agent) — real-world tool orchestration, snapshot 2026-08-03.
- [Arena WebDev](https://arena.ai/leaderboard/code/webdev) — blind frontend preference, snapshot 2026-08-01.
- [Arena Text](https://arena.ai/leaderboard/text) and [Creative Writing](https://arena.ai/leaderboard/text/creative-writing) — human preference, retrieved 2026-08-04.
- [Arena Search](https://arena.ai/leaderboard/search) — integrated web-search preference.
- [ReactBench v1](https://www.reactbench.com/) and [methodology/results](https://www.reactbench.com/blog) — React Write/Fix tasks, five-trial pass@1, rollout cost, and limitations.
- [Terminal-Bench 2.1](https://www.tbench.ai/leaderboard/terminal-bench/2.1) — verified terminal-agent results.
- [SWE-bench Verified](https://www.swebench.com/verified.html) — 500 human-validated repository issues and the bash-only model comparison contract.
- [BrowseComp](https://openai.com/index/browsecomp/) — difficult, verifiable web-retrieval benchmark.
- [OpenAI GPT-5.6 release and pricing](https://openai.com/index/gpt-5-6/) and [model catalog](https://developers.openai.com/api/docs/models).
- [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview), [Opus 5 release](https://www.anthropic.com/news/claude-opus-5), [what's new in Opus 5](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5), [Fable 5 release](https://www.anthropic.com/news/claude-fable-5-mythos-5), and [Sonnet 5 release](https://www.anthropic.com/news/claude-sonnet-5).
- [Kimi K3 guide](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart) and [pricing page](https://platform.kimi.ai/docs/pricing/chat-k3).
- [Grok 4.5 model docs](https://docs.x.ai/developers/models/grok-4.5).
- [GLM 5.2 model card](https://huggingface.co/zai-org/GLM-5.2).
- [Gemini 3.6 Flash model docs](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash) and [pricing](https://ai.google.dev/gemini-api/docs/pricing).
