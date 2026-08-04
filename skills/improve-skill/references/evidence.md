# The evidence door

The owner says something is not working. Sometimes she can point at the moment; often she can't, and the evidence is already on disk in the session transcripts. This file covers both, plus the dedup step that decides whether the finding is a new artifact's job or this one's.

## When the moment is cited

Take it as the primary evidence and go straight to diagnosis. One failure with real cost — reverted work, a shipped defect, frustration stated in so many words — outweighs a pattern assembled from weak signals. Ask for the transcript or the output if it is still reachable; read the transcript rather than only the result, because "didn't trigger" and "triggered but didn't steer" are indistinguishable from the output alone.

## When the moment is not cited: mine the transcripts

Transcripts live at `~/.claude/projects/<dashed-path-slug>/<session-uuid>.jsonl`, one directory per project, one file per session, commonly 0.5–3.5 MB each.

**Never read one serially.** `${CLAUDE_SKILL_DIR}/scripts/extract-user-turns.sh <file>` reduces a transcript to timestamped user turns with command noise, tool results, and subagent sidechains stripped. That output is the unit of analysis. If raw transcript is flowing into the conversation, the architecture has been skipped.

**Scope contract.** Default scope is the *current* project's most recent ~10 sessions. A different project, a time window, or a cross-project sweep happens only when the owner names it. Never sweep the machine unasked: transcripts from other repos are her private working history, in scope only by explicit invitation.

**Privacy.** Transcripts can contain secrets, credentials, and client material. Quote corrections; never quote tool outputs, file contents, or anything credential-shaped. A reader that can't make its point without pasting sensitive context reports the pattern and the session ID instead.

### Extract and read

1. List candidate transcripts (`ls -t` the project dir; skip the live session's own file).
2. Run the extraction script per transcript. A small batch can be read in the main thread; for anything more, dispatch one reader per transcript, in parallel in a single message, **and wait for every reader to return before clustering** (background subagents complete asynchronously), with this contract:

> Run `${CLAUDE_SKILL_DIR}/scripts/extract-user-turns.sh <path>` and read the output. Return, verbatim and nothing else:
> - **Corrections**: user messages that correct, reject, redirect, or re-explain something the agent did. Quote each (≤ 60 words) with its timestamp.
> - **Repeats**: anything the user had to say more than once, in this or plainly-similar wording.
> - **Failure smells**: user messages reacting to the same error class twice (reverts, "again", "still broken", re-pasted errors).
> - **Reported behavioral deltas**: user messages saying they rewrote, reverted, replaced, or bypassed the agent's work, even when they do not frame it as feedback.
> Cap: ~12 items, favoring the strongest; note in one line if more remained. No paraphrase, no interpretation, no advice. Skill-invocation boilerplate ("Base directory for this skill: …" and the instruction text after it) is the harness speaking, not the user, so skip it. If the transcript is all task-dispatch with no corrections, return "no corrections" and stop.

The extractor intentionally removes tool outputs, assistant-authored file contents, and system reminders. It therefore cannot prove a *silent* behavioral delta such as the owner rewriting an agent-authored field without saying so. Never infer one from missing context, and never reopen raw file contents to manufacture the signal; report only deltas present in the reduced user turns.

### Cluster, then dedup against the standing harness

Group the returned quotes by theme. Before any cluster becomes a finding, check it against what already exists: CLAUDE.md at all loaded scopes, the auto-memory index, the skill listing, and hooks.

- **Already encoded, and the correction recurs after the artifact existed** → this is the target case. It is a compliance finding: the artifact isn't steering. Take it into the layer ladder as a fix-the-artifact job — wrong altitude, buried instruction, dead trigger — not a new-artifact job.
- **Already encoded, and every correction predates the artifact** → the system working, not failing. Report that and propose no change on that evidence. Date comparison is the whole discriminator here.
- **Not encoded anywhere** → this is not an improvement to a known artifact. It is a new-artifact question, which means the surface has not been chosen yet. Hand the finding back with its evidence and say so.

Evidence weight: recurrence across sessions, or one failure with real cost, weighs heaviest. A single correction still surfaces when it looks load-bearing — the owner decides at the table, not the reader.

## Anti-patterns

- **Manufacturing a change from noise.** Most corrections that appear once, in one session, about one file, are conversation. Surface them with their evidence count and let the owner call it.
- **Skipping the dedup.** It is what separates "the artifact isn't steering" from "nothing covers this", and those take opposite actions.
- **Treating task phrasing as correction.** "Now do X" is dispatch. A correction pushes *against* something the agent did or was about to do. A reader returning dispatch noise needs a tighter contract, not a lower bar.
- **Inventing a silent correction.** The reduced transcript can expose a delta the owner reports, not infer a rewrite or revert from tool and file content it deliberately cannot see.
- **Cross-project mining by default.** Other repos' transcripts are in scope only when named.
