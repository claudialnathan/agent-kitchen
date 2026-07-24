---
name: model-bump
description: Refresh MODELS.md against current model releases, pricing, availability, and task-specific benchmark results.
disable-model-invocation: true
---

<!-- Earned against: GPT-5.6 Sol, 2026-07-24, Claude Code v2.1.218 -->

# Refresh MODELS.md

Update this repository's `MODELS.md` as a routing guide for agents building and evaluating skills and primitives. This is a manual publication workflow. Do not turn it into a universal model leaderboard.

## 1. Read the current contract

Read:

- `CLAUDE.md`
- `MODELS.md`
- the newest relevant `CHANGELOG.md` entry

Note the current verification date, routes, model configurations, benchmark versions, source URLs, temporary prices, preview labels, and known source inconsistencies.

If `MODELS.md` does not exist, stop and report that this command expects the established document rather than inventing a new structure.

## 2. Fetch current sources

Retrieve live pages; do not update from memory or search snippets alone.

Primary benchmark set:

- `https://arena.ai/leaderboard/agent`
- `https://arena.ai/leaderboard/code/webdev`
- `https://arena.ai/leaderboard/text`
- `https://arena.ai/leaderboard/text/creative-writing`
- `https://arena.ai/leaderboard/search`
- `https://www.reactbench.com/`
- `https://www.reactbench.com/blog`
- `https://www.tbench.ai/leaderboard/terminal-bench/2.1`
- `https://www.swebench.com/verified.html`
- `https://artificialanalysis.ai/methodology/intelligence-benchmarking`
- the latest Artificial Analysis model/coding-agent leaderboard or release analysis

Fetch provider documentation for every model that may enter, leave, or materially change the guide. Verify:

- exact provider and model/API ID;
- current general, preview, suspended, withdrawn, or deprecated availability;
- context and output limits;
- input, cached-input, output, long-context, batch, and tool pricing where relevant;
- reasoning effort and tool support;
- dated price transitions.

Use the current Claude Code changelog and `claude --version` only to refresh this skill's one-line earning pin if the command itself is materially re-earned. Ordinary data bumps do not move the pin.

## 3. Normalize before comparing

Keep these as separate fields:

```yaml
provider:
model:
model_version:
agent:
harness:
harness_version:
tools:
reasoning_effort:
benchmark_version:
evaluation_date:
sample_size:
confidence_interval:
price_basis:
```

Never write a harnessed score as a raw-model score. Never compare a subscription product, an agent, and an API model as if they were equivalent.

Prefer API list price in USD per 1 million input/output tokens in the model table. Prefer benchmark cost per task or rollout when judging real workflow economics. Flag host-dependent open-model pricing.

## 4. Rebuild the routing judgment

Review each route independently:

- overall fallback;
- production frontend;
- visual UI exploration;
- new React work;
- React repair and debugging;
- repo engineering and agent orchestration;
- backend and terminal work;
- writing and idea distillation;
- internet research;
- output-token-efficient frontier work;
- fast inexpensive loops;
- open-weight or self-hosted work.

Change a recommendation only when the evidence changes the work an agent should do. A newly released model is not automatically table-worthy. Keep a model when it leads, offers a meaningful cost/capability trade-off, or exposes a decision-relevant failure shape.

Do not compute one synthetic score. When signals conflict, preserve the split:

- output-token efficiency is not API list price or dollar cost per task;
- WebDev preference is not production React correctness.
- Write React is not Fix React.
- human writing preference is not factual correctness.
- Search Arena is not obscure-answer retrieval or citation completeness.
- a provider benchmark is not independent evidence.

Use `High`, `Medium`, or `Low` confidence only as a compact statement of evidence quality. Explain the basis in the row; do not invent a numeric confidence score.

## 5. Update the focused tables

Refresh:

1. Recommended routing.
2. Current model and cost snapshot.
3. ReactBench overall, Write React, Fix React, and rollout cost.
4. Agent Arena leaders with uncertainty and session counts.
5. Terminal-Bench configurations with agent, model, effort, date, and accuracy.
6. WebDev, Text, Creative Writing, and Search leaders.
7. Source register and retrieval date.

Preserve benchmark version, snapshot date, preliminary status, confidence interval, and sample size wherever the source provides them.

Keep an explicit “best output-token-efficient frontier work” route. Record output tokens per task when a source exposes them, and keep it distinct from the fast/inexpensive route: the lowest dollar-cost capable model may generate more tokens, retry more often, or deliver less intelligence.

If one source exposes contradictory labels or values, state the inconsistency and identify exactly which visible figure the table records. Do not reconcile it by guesswork.

## 6. Check skill and primitive implications

Re-read the evaluation-routing table. Update it only if a benchmark's scope or limitation changed.

For a major model or harness release, report which kitchen artifacts now have a re-test trigger. Do not run paid probe suites unless the owner asked for those runs. A release triggers evaluation; it does not prove convergence or justify deletion.

## 7. Write and verify

Edit `MODELS.md` in place. Preserve its terse, factual voice and existing section structure unless a changed decision no longer fits it.

Then:

- verify every retained URL resolves;
- check that prices state their basis and transition dates;
- check that every benchmark score names its configuration;
- check tables render cleanly;
- run `git diff --check`;
- run `bin/preship-check`;
- inspect the final diff without touching unrelated working-tree changes.

Add a newest-first `CHANGELOG.md` entry only when the guide or this command changes materially. A date-only refresh with no decision change needs no changelog entry.

Report:

- routes that changed;
- material model, price, availability, or benchmark changes;
- source conflicts or missing data;
- local evals or paid re-tests left pending.
