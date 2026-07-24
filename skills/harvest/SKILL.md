---
name: harvest
description: |
  Mines coding-agent session transcripts for the corrections that earn artifacts, the intake stage of the kitchen's loop. Extracts what the user actually said across recent sessions (via a bundled script that reduces multi-MB transcripts to user turns), dispatches readers to classify corrections, redirects, reported behavioral deltas, and repeated failures, dedups against the standing harness, and packages surviving candidates as forge-ready briefs with evidence counts. Use on a cadence (end of a heavy week, after a project push), when a correction feels familiar, or before claiming a harness has no gaps; skip when recent sessions were light or single-topic.
disable-model-invocation: true
---

<!-- Earned against: Fable 5 (claude-fable-5), 2026-07-05, v2.1.201; history: CHANGELOG.md -->

# harvest

## The attention this skill redirects

From "wait until a gap annoys the owner into naming it" to "the corrections are already on disk; read them." Every session transcript records what the user had to say twice, what they rejected, what they redirected, which is the exact evidence the forge's earned-bar demands. Without this skill that evidence surfaces only when a human happens to remember it. With it, intake is a query.

## Where the material lives

`~/.claude/projects/<dashed-path-slug>/<session-uuid>.jsonl`: one directory per project, one file per session, commonly 0.5–3.5 MB each. Never read one serially: `scripts/extract-user-turns.sh <file>` reduces it to timestamped user turns with command noise, tool results, and subagent sidechains stripped. That output is the unit of analysis.

**Scope contract.** Default scope is the *current* project's most recent ~10 sessions. A different project, a time window, or a cross-project sweep happens only when the user names it. Never sweep the machine unasked, because transcripts from other repos are the user's private working history, in scope only by explicit invitation.

**Privacy.** Transcripts can contain secrets, credentials, and client material. Quote corrections; never quote tool outputs, file contents, or anything credential-shaped. A reader that can't make its point without pasting sensitive context reports the pattern and the session ID instead.

## Phase 1: Extract and read

1. List candidate transcripts (`ls -t` the project dir; skip the live session's own file).
2. Run the extraction script per transcript. Small batches can be read in the main thread; for anything more, dispatch one reader agent per transcript (parallel, single message) with this contract:

> Run `${CLAUDE_SKILL_DIR}/scripts/extract-user-turns.sh <path>` and read the output. Return, verbatim and nothing else:
> - **Corrections**: user messages that correct, reject, redirect, or re-explain something the agent did. Quote each (≤ 60 words) with its timestamp.
> - **Repeats**: anything the user had to say more than once, in this or plainly-similar wording.
> - **Failure smells**: user messages reacting to the same error class twice (reverts, "again", "still broken", re-pasted errors).
> - **Reported behavioral deltas**: user messages saying they rewrote, reverted, replaced, or bypassed the agent's work, even when they do not frame it as feedback.
> Cap: ~12 items, favoring the strongest; note in one line if more remained. No paraphrase, no interpretation, no advice. Skill-invocation boilerplate ("Base directory for this skill: …" and the instruction text after it) is the harness speaking, not the user, so skip it. If the transcript is all task-dispatch with no corrections, return "no corrections" and stop.

The extractor intentionally removes tool outputs, assistant-authored file contents, and system reminders. It therefore cannot prove a *silent* behavioral delta such as a user rewriting an agent-authored field without saying so. Never infer one from missing context or reopen raw file contents to manufacture the signal; report only deltas present in the reduced user turns until a privacy-preserving detector exists.

## Phase 2: Cluster and dedup against the standing harness

Group the returned quotes by theme. Then, before anything becomes a candidate, check each cluster against what already exists in CLAUDE.md (all loaded scopes), the auto-memory index, the skill listing, and hooks:

- **Not encoded anywhere** → candidate for a new artifact.
- **Already encoded but the correction recurs after the artifact existed** → a *compliance* finding: the artifact isn't steering. That routes to the forge as a fix-the-artifact job (wrong altitude, buried instruction, dead trigger), not a new-artifact job. Date comparison matters, because a correction that predates the artifact that encodes it is the system working, not failing.

Only for a cluster that survives this dedup and appears model- or harness-dependent, consult the plugin-root shared snapshot from this skill's source: `MODELS.md` for model-specific failure or convergence, `STATE.md` for a capability the harness may already provide. Do not open either for ordinary clusters, and verify any decision-bearing current claim live.

Evidence weight, per the forge: recurrence across sessions, or one failure with real cost (reverted work, shipped defect, user frustration stated in so many words), weighs heaviest. A single correction still surfaces when it looks load-bearing — the owner decides at the table, not the reader.

## Phase 3: Forge-ready briefs

Present a table: cluster, verbatim exemplar quote, evidence count (sessions + dates), already-encoded-where (or "nowhere"), proposed surface from the forge's triage ladder (skill / hook / rule / CLAUDE.md entry / fix-existing). The user picks. Package each survivor in the shared handoff shape:

- **Objective / expected output**
- **Evidence of the gap** — exemplar quotes, session count, and dates
- **Invocation mode / actor**
- **Proposed trigger**
- **Required context**
- **Allowed actions / side effects**
- **Human decision points**
- **Proposed surface**
- **Unknowns / contention**

Omit a field or mark it unknown rather than guessing. The brief is sufficient input for a later artifact-design pass whether or not another kitchen skill is installed. The quotes remain the spec: the unaided baseline already ran, in production, in those sessions.

## Anti-patterns

- **Manufacturing artifacts from noise.** Most corrections that appear once, in one session, about one file, are conversation, not artifacts. Surface them with their evidence count; the owner calls it.
- **Harvesting the already-harvested.** Skipping Phase 2's dedup produces duplicate skills and CLAUDE.md bloat; the standing harness is the first thing to read, not the last.
- **Pasting transcript bulk into the main thread.** The script plus reader contract exists to keep multi-MB files out of context. If raw transcript is flowing into the conversation, the architecture has been skipped.
- **Treating task phrasing as correction.** "Now do X" is dispatch. A correction pushes *against* something the agent did or was about to do. Readers that can't tell the difference return dispatch noise, so tighten the contract rather than lowering the bar.
- **Inventing a silent correction.** The reduced transcript can expose a delta the user reports, not infer a rewrite or revert from tool and file content it deliberately cannot see.
- **Cross-project harvest by default.** Other repos' transcripts are in scope only when named.

## See also

- `/forge`: an optional consumer of the forge-ready brief; its earned-bar and triage ladder govern what candidates become.
- `/ingest`: the same fan-out-and-synthesize architecture pointed at external sources instead of session history.
