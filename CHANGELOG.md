# Changelog

Provenance ledger for the skills in `cook/` and `serve/` and the repo machinery around them: what changed, why, and the model/harness state it was earned against. Artifacts carry only a one-line pin (`<!-- Earned against: <model>, <date>, <version> -->`); the narrative, sunset triggers, and re-test verdicts live here. Newest first. Reference skills by name and section — not line numbers, which rot.

## 2026-06-10 — Fable 5 (`claude-fable-5`), Claude Code v2.1.170

- **Convention: one-line pins.** Inline `Earned against` comments reduced to a single line across all skills; their history migrated to this file. `bin/preship-check` warns when a pin outgrows one line. Artifacts never narrate the sessions that produced them.
- **All cook/serve frontmatter descriptions rewritten** for listing effectiveness: job + scope + strongest triggers in `description`; `when_to_use` as one compact line (bullet lists render as run-on text in the skill listing). Model-visible total 12,007 → 9,556 chars; no distinct trigger keyword dropped; duplication and body-restatement removed.
- **skill-forge** — "Description first" gains rule 5: the 1,536-char cap is a truncation guard, not a target (job + scope + triggers lands at 600–900 chars); a fleet of near-cap descriptions overflows the shared ~1%-of-context listing budget, evicting least-used descriptions — the silent under-triggering the padding was meant to prevent. Never restate body discipline in a description; for `paths:` skills the body auto-loads when the rules apply. Earned from this fleet's own drift (two skills within 35 chars of truncation).
- **speed-daemon** — gained `paths:` globs; its `when_to_use` claimed auto-load on reactive UI files but no globs existed.
- **saltintesta / flavored-md** — the words-vs-form routing boundary is now stated on both sides, not only flavored-md's.
- **harness-audit (cook) — new.** Audits a Claude Code setup end-to-end: inventory the standing surfaces → quantify per-session token cost → four checks (self-consistency, duplication across scopes, enforcement parity, scope discipline) → quantified triage. First worked example: this repo's own setup, which surfaced ~4,600 tokens/session of personal-skill descriptions, the kitchen's 12 skills double-listed (project symlinks + user-scope plugins), a loaded file describing itself as not loaded, and an "always run preship" claim with no enforcement. Sunset: on the next major model release, re-test whether a skill-withheld session inventories scopes, quantifies cost, and checks claims-vs-behavior unaided; if so, delete.
- **Repo machinery** — `.claude/hooks/preship-gate.sh` + committed `.claude/settings.json`: PreToolUse hook blocks `git commit` when `bin/preship-check` fails. `CLAUDE.local.md` slimmed to session-relevant facts; install/troubleshooting playbooks moved to the unloaded `FYI.md`. `bin/preship-check` gains an advisory description-length warning (>1,100 chars, skipping `disable-model-invocation` skills) and the pin-length warning.
- **STATE.md → v2.1.170** — Fable 5 section (opt-in via `/model fable`, `best` alias, effort default `high`, thinking not disableable, classifier fallback to Opus incl. workspace-context triggers, 1M always-on via API, pricing/rollout); In-flux entry for the time-boxed subscription window. **HACKS.md re-pinned to v2.1.170** — Fable classifier-fallback gotcha, `/model best`, `--safe-mode`, `fallbackModel`, `disableBundledSkills`, `/cd`, and the `MAX_THINKING_TOKENS=0` Fable exception.
- **Re-test ledger opened.** The Fable 5 release triggers re-tests of every pre-2026-06-09 pin: speed-daemon (rebuild mutation shapes fresh; delete if optimistic-by-default), workflow-forge (do laziness/drift still justify the surface? worked example never ran end-to-end), flavored-md (GFM form-choice and traps unaided?), quality-audit (stack-aware multi-lens audit unaided?), ingest (does quote-grounding still need scaffolding?), and the 2026-05-30 forge craft passes. Status: **pending**.

## 2026-06-09 — Opus 4.8, v2.1.165

- **flavored-md (serve) — new** (renamed from `github-flavored-md` the same day; subject unchanged). GFM form-matching: table / alert / collapsible details / task list / footnote / mermaid chosen by the content's job; GitHub-specific traps verified against the GFM spec and GitHub docs at authoring, not recall (exact alert syntax; color swatches render only in issues/PRs, not repo files; auto-generated heading anchors break on emoji/punctuation). Reviewed against an external markdown-skills repo for overlap — out of scope, no changes. Sunset: re-test form-choice and traps on the next major model release; delete if handled unaided.
- **saltintesta** — antipattern recorded: the artifact is not the conversation. Files written mid-conversation absorb conversational residue (rebuttals, reader-addressed justifications); earned from a reference doc that had absorbed exactly that.

## 2026-06-08 — Opus 4.8, v2.1.165

- **workflow-forge (cook) — new.** Designs dynamic-workflow orchestration scripts. Two facts carry different confidence: the Workflow runtime API (`agent`/`parallel`/`pipeline`/`phase`, concurrency caps, no filesystem) is documented at code.claude.com/docs/en/workflows; packaging a workflow inside a skill is blog-asserted only — the documented reuse path is `.claude/workflows/` as a `/command`. The worked example was authored against the runtime but not run end-to-end. Sunset: when workflows leave research preview or on the next major model release, re-verify the API, confirm or demote the skill-packaging path, and re-test whether the model still goes lazy / drifts on big multi-part tasks unaided — that failure justifies the surface.
- **claude-md-forge** — functional CLAUDE.md↔FYI boundary: a behavioral precondition the agent acts on during normal work belongs in CLAUDE.md even when it is publish-flow; only playbook detail stays out. MCP anti-pattern sharpened: a connected tool documents its own use (server instructions + per-tool descriptions), so CLAUDE.md should not restate tool usage.
- **ingest** — pasted-source branch (material already in context is extracted inline; subagents only for what must be fetched); check-for-existing-brief step before writing, after a run nearly duplicated a same-day brief.
- **skill-forge** — triage note: scheduling is orthogonal to surface choice. A scheduled or event-fired job is a Routine (`/schedule`) running a skill, not a self-scheduling skill.
- **Repo** — plugins switched to commit-SHA versioning: `version` fields removed from both `plugin.json`s and the marketplace entries; `bin/preship-check` enforces their absence. A pinned version string had frozen the install cache and silently blocked propagation for weeks.

## 2026-06-06 — Opus 4.8, v2.1.165

- **quality-audit (serve) — new.** Stack-aware, read-only quality-audit dispatcher: detect the stack from package.json → run real verification (lint, typecheck, build) → route dimensional lenses → one P0/P1/P2 report. Resilient to absent routed skills (fallback checklists in `references/dimensions.md`). Sunset: re-test on the next major model release whether the model runs a stack-aware multi-lens audit unaided; the routing + honesty + triage spine is expected to outlive the dimension fallbacks.
- **skill-forge** — frontmatter `name` guidance corrected from "usually omit" to "include it": directory-name inference is Claude-Code-only; the open spec, cross-tool consumers, and `bin/preship-check` all require the field.

## 2026-05-31 — Opus 4.8, v2.1.156

- **skill-forge** — A/B depth-eval across three domains with a blind judge panel (artifacts in `evals/`): the guidance lifts craft +0.89, anatomy +0.44, depth +0.33. Two regressions found and fixed: verification became an explicit fetch-and-cite step after a recall-based "verify" shipped a deprecated API; portability guidance added against copying this forge's own Claude-gated frontmatter onto portable skills. Source-verification of the model-weak eval domain added "cite honestly" to the depth gate — correct expert facts can still carry citation-shaped fabrication. Also added: a keep-signal counterpart to the sunset audit, and proportional cost-gated verification tiers.

## 2026-05-30 — Opus 4.8, v2.1.156

- **Cross-forge craft audit.** skill-forge re-architected around two co-equal pillars (expert subject + harness anatomy) after review found it over-taught anatomy. hook-forge gained the strictness spectrum (block / warn / log), false-positive fatigue, and "the block message teaches". rule-forge gained "write judgment, not directive — respect the framework" and explain-the-why. claude-md-forge judged the strongest on content-craft; left essentially as-is.

## 2026-05-29 — Opus 4.8 release re-tests

- **speed-daemon — KEPT.** Two of three skill-withheld mutation trials (inline-edit, delete) reproduced the spinner-gated default; only the toggle came back optimistic; the auth leg reproduced the gated render. The toggle is the easy case — small-n re-tests on it alone would mis-delete.
- **ingest — KEPT.** A skill-withheld agent reproduced the architecture (one reader per source, verbatim quotes, conflict synthesis) only under heavy prompting; the scaffold still buys reliability and the quote contract.
- **claude-md-forge `references/anti-patterns.md` — KEPT.** Blind verbatim cross-project import softened (a skill-withheld trial substituted stack lines and dropped non-transferable ones) but ALWAYS/NEVER and current-state lines persisted, so the file still earns rent. n=1.

## 2026-05-22 — Opus 4.7

- **speed-daemon (serve) — new.** Article-derived (a published Linear performance breakdown). Proxy failure: the React training-data default of spinner-gated mutations and fetch-blocked first paints. Sunset: on each major model release, rebuild several mutation shapes plus an auth-gated page in fresh sessions; delete when optimistic-by-default arrives unaided.
- **ingest (cook) — new.** One reader subagent per source; a brief of verbatim quoted excerpts with citations; handoff to the right meta-forge. Architectural — re-evaluate when grounding-in-sources stops needing explicit scaffolding.

## 2026-05-14 — Opus 4.7

- **skill-forge, hook-forge, rule-forge, claude-md-forge (cook) — authored.** The four meta-forges.
