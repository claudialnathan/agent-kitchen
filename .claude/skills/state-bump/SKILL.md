---
name: state-bump
description: |
  Refresh STATE.md against the live Claude Code changelog. Edits the "Last updated:" / "Version:" header on line 3, then adds, edits, or retires body entries so the snapshot matches what's at code.claude.com/docs/en/changelog. Preserves the document's existing voice (terse, factual, "what changes how you build, configure, and ship"), its section structure, and the dateline convention, which means header fields only and no inline "last reviewed against vX.Y.Z" reintroduced elsewhere. On every substantive bump, also re-pin and amend HACKS.md, check CLAUDE.md for staleness, and sweep the kitchen's skills/ artifacts against the new state (Steps 5–7).
when_to_use: |
  Triggers: "update STATE.md", "bump STATE.md", "refresh STATE.md", "STATE.md is stale", "STATE.md against latest Claude Code", "what's new in Claude Code since vX", "rev STATE for vX.Y.Z", "changelog dropped, update STATE.md".
  Scoped only to this repo's STATE.md, which is a curated snapshot of Claude Code plus the coding-agent landscape. Not a general changelog summarizer.
---

<!-- Earned against: Opus 4.7 (claude-opus-4-7), 2026-05-24. Re-tested 2026-05-29 (Opus 4.8): KEPT, slim held. The generic filter instinct is now largely native (a skill-withheld trial filtered 4 of 16 changelog entries and used a header-only dateline), but the repo-specific section map + dateline convention aren't inferable, which is the load-bearing part. Did not cut teaching content: n=2, skill is 5 days old. -->
<!-- Scope expanded 2026-06-10 (Fable 5 bump, user directive): HACKS.md companion bump, CLAUDE.md staleness check, and the kitchen skills sweep are standing steps on every substantive bump, not offers. -->

## The attention this skill redirects

From "summarize the changelog into STATE.md" to "filter the changelog through STATE.md's own filter, then preserve voice, structure, and the dateline convention."

The default failure is bulk paste, which drops every new entry into a fresh "What's new" section, breaks cadence, and reintroduces inline datelines that the header already subsumes. STATE.md states its filter on line 5: _what changes how you build, configure, and ship_. Most changelog entries don't pass it.

Two jobs share this skill. Steps 0–5 are the **publication bump**. STATE.md and HACKS.md are audience-facing snapshots with their own readers; keeping them true is editorial work. Steps 6–7 are the **kitchen sweep**, the part that serves the kitchen. Don't mistake effort on the first for progress on the second.

## Step 0: Pin the version delta

Read line 3 of STATE.md to learn the currently-pinned version and date. Then if the latest content has not already been pasted into the prompt, fetch `https://code.claude.com/docs/en/changelog` to read the live page. Identify:

- The latest released version (top of changelog).
- Every version between the pinned and latest, exclusive of the pin and inclusive of the new ones.

If the pinned version equals the latest, ask whether the user wants a date-only bump (re-verification without new content) or to hold off.

**Model availability is out of band.** The changelog tracks versions and features, not whether a model is currently servable, so a suspension or recall (Fable 5, 2026-06-12) never appears in it. On every bump, separately sanity-check that the models STATE.md and HACKS.md present as live are still available (status page / release notes / news) and reflect any suspension; nothing in the changelog will prompt it.

## Step 1: Triage each entry against STATE.md's own filter

For each new changelog entry, three questions:

1. **Does it change how someone builds, configures, or ships against Claude Code?** Bug fixes, perf-only changes, and internal refactors usually fail. New surfaces, new defaults, removed features, and renamed commands usually pass.
2. **Does it survive a quarter?** Research-preview flags often flip and experimental env vars get renamed. If the entry is likely to move within weeks, the line belongs under _In flux as of …_, not in a stable section.
3. **Does it contradict something already in STATE.md?** With renames, flipped defaults, and retired features, the existing line is now wrong and must be **edited in place**, not appended around.

Most entries don't pass (1). Accept that. STATE.md is filtered, not exhaustive, because the changelog is already the exhaustive source.

## Step 2: Place each surviving entry

The document has a stable section layout. Don't invent new top-level sections.

- New surface or first-party feature → the dated "What's distinctive about [month] [year]" section, as a new subsection if structurally significant, or a one-liner under _Other small but useful_ otherwise.
- New hook field, settings key, env var, or bundled command → one-liner under _Other small but useful_ inside the dated section.
- New constraint, budget number, or footgun → _The cost model nobody tells you about up front_ or _Constraints worth designing around_, depending on abstraction level.
- Research preview / experimental → _In flux as of [date]_.
- Cross-tool / ecosystem change (MCP, AGENTS.md, Agent Skills standard) → _Cross-tool conventions_ or _The broader coding-agent landscape_.
- Renamed / removed → edit the existing line in place; don't add "previously known as" unless the old name still circulates heavily.
- Bundled skill or command added/renamed → _Notable bundled skills/commands (don't reinvent)_.

The table maps by _kind_; treat it as a default, not a rule. When an entry speaks more directly to a concern a section already owns, place it there instead. For example, a settings key that's really a description-budget lever belongs in _The cost model nobody tells you about up front_'s practical-consequences list, not under _Other small but useful_ just because it's a setting.

If a surviving entry has no natural home, that's a signal that either the entry doesn't actually pass triage, or the section structure has drifted from the surface. Ask before adding a new section.

## Step 3: Apply the dateline convention

Line 3 is the single source of truth for "when was this last reviewed":

```
Last updated: D Month YYYY | Version: vX.Y.Z
```

Date format is `D Month YYYY` (e.g. `21 May 2026`). Not ISO. Not month-only. Version is the latest in the changelog with a `v` prefix.

**Don't** reintroduce inline datelines elsewhere. Earlier revisions of STATE.md had "Last reviewed against vX.Y.Z" in the intro and a footer dateline; both were retired when the header became canonical (see the auto-memory `feedback_state_md_dateline`). Inline `v2.1.X` tied to a substantive claim ("requires v2.1.117+") is fine; "as of v2.1.146 this is true" is not, because that's a meta-dateline pretending to be content.

The month/year in "What's distinctive about [month] [year]" is a section title, not a dateline. Update it when bumping into a new month, not on every version bump.

## Step 4: Match the voice before writing

Read three nearby entries before adding a new one. The cadence is:

- Terse. Sentences land on a verb or a noun, not on hedging.
- Factual, not promotional. "Auto mode" describes; it doesn't sell. No "exciting", no "powerful", no exclamation marks.
- Consequence-implied. Each entry should imply something for the reader's setup.
- Bullet phrasing matched to neighbors. Noun-first or verb-first, not mixed inside a list.
- Backticks for command names, env vars, file paths, settings keys. Bold for surface names on first introduction in a section.

## Step 5: Bump HACKS.md alongside (standing)

HACKS.md is the "did you know" layer. Same repo, different filter: obscure, powerful, just-shipped. Famous basics stay in STATE.md. On every substantive bump:

- **Re-pin both datelines**: line 3 (`Claude Code vX.Y.Z … verified YYYY-MM-DD`) and the footer ("re-checked YYYY-MM-DD against vX.Y.Z"). HACKS.md may be pinned several versions behind STATE.md, so its delta starts at *its* pin, not STATE.md's.
- **Amend rows the release contradicts** before adding anything. A new model or flag often carves an exception into an existing row (e.g. Fable 5 made `MAX_THINKING_TOKENS=0` a no-op on one model). Edit the row in place.
- **Add only hack-worthy entries**, as table rows or single ⚠️/💡 lines in the existing sections. It's a scannable table/glossary, so no prose paragraphs (see auto-memory `hacks-md-form`).

## Step 6: Check CLAUDE.md for staleness (standing)

Scan the repo CLAUDE.md against the new state: any rule, footgun, or pin the release contradicts? CLAUDE.md holds intent, not current state, so most bumps find nothing, but a contradicted line must be flagged to the user, not silently relied on. A major *model* release additionally activates its model-version-pinning section: every `Earned against:` pin in the repo becomes a re-test candidate. Where a kitchen artifact carries `evals/probes.md`, the re-test is a replay of that file, so inventory the probe files alongside the pins and offer the runs (real tokens, opt-in). The applied skills' replay is owned by the skills repo: hand off to its `/retest` skill (`.claude/skills/retest/` in the sibling `skills` checkout) rather than reconstructing the procedure here; if that repo isn't checked out, flag the pending re-test instead of improvising one.

## Step 7: Sweep the kitchen's skills/ artifacts (standing)

A bump catalogues new harness capabilities, which is the trigger to check whether any forge or applied skill now contradicts STATE.md, is missing a lever it should name, or could improve. Run this pass on every substantive bump (skip on a date-only bump):

- **Scope to harness-coupled artifacts only**: the kitchen's `skills/` (forge, harness-audit, harvest, ingest, all of which design against Claude Code surfaces). The applied skills live in the separate `skills` repo; if it's checked out, sweep its harness-coupled skills there too. **Exclude** stack/writing skills (UI, design, prose): a Claude Code changelog can't make "use oklch not hex" stale.
- **Use the freshly-bumped STATE.md as "current truth."** Fan out one read-only agent per artifact; each reports drift in four buckets (stale/contradicted, missing-lever, harness-absorbed procedure, improve) with `file:line` and a concrete change. Conservative bar: a finding must change what an author *does*, not merely "could mention." Harness-absorbed procedure: the artifact hand-scripts orchestration the harness now provides natively (worktree isolation, background subagents, workflow scripts, monitors, loop-drivable idempotent steps). Model releases absorb craft; harness releases absorb procedure.
- **Carry every Step 1 contradiction into the sweep.** A fact edited in-place in STATE/HACKS for contradiction (Step 1, q3) often appears *verbatim* in a forge reference. The per-artifact agents work from a curated fact list, so if that fact is omitted from an agent's prompt, the agent will confidently pass the stale line as correct (a false negative). Before fanning out, grep each corrected phrasing across `skills/`, and seed every sweep prompt with all of Step 1's contradictions. (Earned 2026-06-25: the foreground-subagent depth-5 cap was stale in STATE, HACKS, *and* `skills/forge/references/skills.md`; the skills.md agent missed it because its fact list omitted the cap.)
- **Verify against canonical docs before editing.** STATE.md is a filtered summary, not the API spec, so an agent inferring "the forge omits field X" from it has a lead, not a confirmed fix; confirm field/event-level claims against `code.claude.com/docs/en/{hooks,skills,…}` first. (Earned 2026-06-09: a hook-forge pass over-flagged "missing" fields off the summary alone.)
- **Present findings; don't bulk-apply.** Forges are deliberate artifacts. Triage into clear-fix / reasonable-add / hold-for-verification and let the user choose.

## Anti-patterns

- **Bulk-pasting the changelog.** If a section grows by more than ~5 bullets in one bump, you've stopped filtering.
- **Adding a "What's new in vX.Y.Z" section.** STATE.md is organized by surface, not by version. Per-version diffs belong in the changelog.
- **Pinning versions inline as a dateline.** Header does that. See Step 3.
- **Skipping triage.** "It's in the changelog so it goes in STATE.md" is the failure this skill exists to prevent.
- **Bumping the header without reviewing the body.** A header bump asserts the body matches the version. If the body still names retired commands or stale defaults, the new header is lying.

## When the user asks for a date-only bump

If the user says "just bump the date" without a substantive review, surface these two options:

1. Bump header only, with a flagged note that the body hasn't been re-verified (commit message, not in the file).
2. Run the full triage in this session.

Don't silently bump without flagging the assertion the header is now making.
