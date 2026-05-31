# Reuse first: don't build what already exists

The cheapest skill is the one you don't write. Before drafting, check whether a good-enough skill already exists to use or fork. This is the depth behind "Before you build — does a good one already exist?" in SKILL.md.

This gate is the forge's own discipline, not yet Anthropic doctrine: official guidance has an evaluation-first gate (is the *problem* real?) but no reuse-first gate (has someone already *solved* it?). The closest official spirit is the open-standard premise — build a skill once, reuse it across tools — and the example repos framed as fork-and-customize starting points.

## Search the ecosystem

In order of effort:

1. **If the `find-skills` skill is available, use it.** It runs the discovery for you: understand the need, check the `skills.sh` leaderboard, search, and present candidates with install counts and source.
2. **Otherwise, search directly.** `npx skills find <query>` against the open skills ecosystem (the Skills CLI is a package manager for it); browse `skills.sh`; or search GitHub for `SKILL.md` in the domain.
3. **Check what's already installed** in this environment — a bundled-plugin skill or a stock Claude Code skill may already cover it, and reaching for a parallel build just competes for description budget.

**`find-skills` is not bundled with this forge.** By the reliable-availability rule in SKILL.md, don't assume it's present — degrade to step 2. If you cite find-skills in guidance to a user who may not have it, say so.

## Assess the candidate yourself

Install count and stars are a **prior, not a verdict.** A large fraction of published skills silently under-trigger or do nothing once loaded, and a popular skill can still be generic for your case. Read the strongest candidate's SKILL.md and judge two axes:

**Quality** — is this a skill that does real work?
- Is the description specific and full of real trigger phrases, or vague ("helps with documents")?
- Is the body in standing-instruction voice, or a one-time procedure that wastes recurring tokens?
- Does it redirect attention (transformative) or just restate what the model already does (additive — see SKILL.md)?
- Does it carry the craft (reasons not bare directives, one default, concrete examples — see `content-craft.md`)?

**Coverage** — does it fit _your_ case?
- Does it cover your whole task, or one slice of it?
- Is it scoped to a different stack, framework, or convention than yours?
- Does its description over-promise relative to its body (a common defect — a broad description over a narrow body)?

Quick signals of a low-quality candidate: a description under ~20 words, no trigger phrases, no worked examples in the body, no sense of what it's *not* for.

## The three outcomes

| Outcome | When | What you do |
| :--- | :--- | :--- |
| **Use as-is** | Good quality, covers the case | Install it, point the user at it, stop. No new artifact. |
| **Fork and tune** | Right bones, wrong fit (generic, mis-scoped, stale, or partial) | Copy it; sharpen the description to the real triggers; cut what doesn't apply; add the missing coverage; re-pin and re-test as if it were yours. |
| **Build new** | Nothing fits, or candidates are low-quality and not worth forking | Proceed to the rest of the forge. |

**Fork-and-tune is usually the highest-value outcome, and the one search tools won't propose** — `find-skills` offers install-it / use-general-capability / make-your-own, but not "take this decent skill and make it yours." When a candidate has the right shape but the wrong specifics, forking captures the author's structural work and spends your effort only on the fit. Treat the fork as a new artifact: it gets its own Step 0 (the failure or source it's now earned against), its own model-pin, and its own sunset trigger.

## After reuse, before building: relate

If you build (new or forked), the "Before you build" section of SKILL.md continues: decide how the result sits alongside adjacent skills — **sharpen** (cite a reliably-present neighbor), **absorb** (copy in what you can't depend on), or **dispatch** (route to several). The reliable-availability heuristic there is the same lens as this page's warning about find-skills: a cross-reference is only as good as the chance the referenced skill is actually in the session.
