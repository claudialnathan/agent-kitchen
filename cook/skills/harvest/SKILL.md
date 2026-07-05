---
name: harvest
description: |
  Mines Claude Code session transcripts for the corrections that earn artifacts — the intake stage of the kitchen's loop. Extracts what the user actually said across recent sessions (via a bundled script that reduces multi-MB transcripts to user turns), dispatches readers to classify corrections, redirects, and repeated failures, dedups against the standing harness, and hands surviving candidates to the forge with evidence counts. Use on a cadence (end of a heavy week, after a project push), when a correction feels familiar, or before claiming a harness has no gaps; skip when recent sessions were light or single-topic.
disable-model-invocation: true
---

<!-- Earned against: Fable 5 (claude-fable-5), 2026-07-05, v2.1.201 — history: CHANGELOG.md -->

# harvest

## The attention this skill redirects

From "wait until a failure annoys the owner into naming it" to "the corrections are already on disk; read them." Every session transcript records what the user had to say twice, what they rejected, what they redirected — the exact evidence the forge's earned-bar demands. Without this skill that evidence surfaces only when a human happens to remember it. With it, intake is a query.

## Where the material lives

`~/.claude/projects/<dashed-path-slug>/<session-uuid>.jsonl` — one directory per project, one file per session, commonly 0.5–3.5 MB each. Never read one serially: `scripts/extract-user-turns.sh <file>` reduces it to timestamped user turns with command noise, tool results, and subagent sidechains stripped. That output is the unit of analysis.

**Scope contract.** Default scope is the *current* project's most recent ~10 sessions. A different project, a time window, or a cross-project sweep happens only when the user names it. Never sweep the machine unasked — transcripts from other repos are the user's private working history, in scope only by explicit invitation.

**Privacy.** Transcripts can contain secrets, credentials, and client material. Quote corrections; never quote tool outputs, file contents, or anything credential-shaped. A reader that can't make its point without pasting sensitive context reports the pattern and the session ID instead.

## Phase 1 — Extract and read

1. List candidate transcripts (`ls -t` the project dir; skip the live session's own file).
2. Run the extraction script per transcript. Small batches can be read in the main thread; for anything more, dispatch one reader agent per transcript (parallel, single message) with this contract:

> Run `${CLAUDE_SKILL_DIR}/scripts/extract-user-turns.sh <path>` and read the output. Return, verbatim and nothing else:
> - **Corrections** — user messages that correct, reject, redirect, or re-explain something the agent did. Quote each (≤ 60 words) with its timestamp.
> - **Repeats** — anything the user had to say more than once, in this or plainly-similar wording.
> - **Failure smells** — user messages reacting to the same error class twice (reverts, "again", "still broken", re-pasted errors).
> Cap: 12 items. No paraphrase, no interpretation, no advice. Skill-invocation boilerplate ("Base directory for this skill: …" and the instruction text after it) is the harness speaking, not the user — skip it. If the transcript is all task-dispatch with no corrections, return "no corrections" and stop.

## Phase 2 — Cluster and dedup against the standing harness

Group the returned quotes by theme. Then, before anything becomes a candidate, check each cluster against what already exists — CLAUDE.md (all loaded scopes), the auto-memory index, the skill listing, hooks:

- **Not encoded anywhere** → candidate for a new artifact.
- **Already encoded but the correction recurs after the artifact existed** → a *compliance* finding: the artifact isn't steering. That routes to the forge as a fix-the-artifact job (wrong altitude, buried instruction, dead trigger), not a new-artifact job. Date comparison matters — a correction that predates the artifact that encodes it is the system working, not failing.

Evidence bar, per the forge: the same correction in **two or more sessions**, or one failure with real cost (reverted work, shipped defect, user frustration stated in so many words). One-off phrasing preferences don't clear it.

## Phase 3 — Candidates to the forge

Present a table: cluster, verbatim exemplar quote, evidence count (sessions + dates), already-encoded-where (or "nowhere"), proposed surface from the forge's triage ladder (skill / hook / rule / CLAUDE.md entry / fix-existing). The user picks; hand each survivor to `/forge` with its quotes as the earned-failure evidence. The quotes are the spec — the forge's without-the-skill baseline already ran, in production, in those sessions.

## Anti-patterns

- **Manufacturing artifacts from noise.** A correction that appears once, in one session, about one file, is conversation — not an artifact. Report it only if it cost something.
- **Harvesting the already-harvested.** Skipping Phase 2's dedup produces duplicate skills and CLAUDE.md bloat; the standing harness is the first thing to read, not the last.
- **Pasting transcript bulk into the main thread.** The script plus reader contract exists to keep multi-MB files out of context. If raw transcript is flowing into the conversation, the architecture has been skipped.
- **Treating task phrasing as correction.** "Now do X" is dispatch. A correction pushes *against* something the agent did or was about to do. Readers that can't tell the difference return dispatch noise — tighten the contract, don't lower the bar.
- **Cross-project harvest by default.** Other repos' transcripts are in scope only when named.

## See also

- `/forge` — the handoff target; its earned-bar and triage ladder govern what candidates become.
- `/ingest` — the same fan-out-and-synthesize architecture pointed at external sources instead of session history.
