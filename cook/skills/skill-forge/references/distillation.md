# Distilling source material into a skill

The common Origin-B path: you've read or collected something with real authority — a spec, a paper, a methodology, an internal doc, a long thread where you worked something out — and you want it in the agent's reach. The job is **distillation, not transcription**. A skill is not a place to park a document; it is a place to put the part of a document that changes what the agent does.

This is the depth behind Pillar 1's "Distill from source material" in SKILL.md.

## The onboarding-guide model

Anthropic's governing metaphor: a skill is organized like the onboarding guide you'd write for a capable new teammate — someone who already knows the field, just not _your_ specifics. That maps directly onto progressive disclosure:

- **SKILL.md = the table of contents + the load-bearing core.** What the teammate needs in their head on day one. The stance, the few rules that actually bite, the map of where the rest lives. Always loaded once invoked, so it pays rent every turn — keep it tight.
- **`references/<topic>.md` = the chapters.** Depth they consult when they hit a specific task. Loaded on demand, free until opened.
- **`assets/` = the appendix.** Templates, schemas, fixtures, fonts — things used in output, not read for understanding.

If you would not put it in the first-day briefing for someone who already knows the domain, it is a chapter, not the core.

## The cut rule: what to drop

Distillation is mostly subtraction. The source was written for humans who needed the background; the model already has the background. Cut:

- **Anything the model already knows.** The source's introduction, its definitions of standard terms, its motivation section. Keep what is specific to _this source's method_ and _your codebase_.
- **Justification the reader doesn't need to act.** Keep the _why_ where it changes how the rule generalizes (content-craft move 2); cut the why that's just the source persuading you it's correct.
- **Anything a calendar can falsify** (content-craft move 7). Version-specific notes, "new in v3" framing.
- **Redundant phrasings of the same point.** The source may circle a point three times for emphasis; state it once.

The test for each retained sentence is content-craft move 4: _does this justify its tokens, or am I transcribing?_

## The keep rule: what survives

What's left after the cut is the part with leverage:

- **The method's non-obvious moves** — the steps a capable practitioner wouldn't guess, the order that matters, the trap the source warns about.
- **The decision criteria** — when this approach applies versus when it doesn't (this is also your over-trigger defense in the description).
- **The concrete shapes** — one worked input→output example (content-craft move 3), the exact schema, the canonical snippet.
- **The attention shift** — stated explicitly. What was the source teaching you to _foreground_ that you weren't before? That sentence is the spine of the skill (Pillar 1).

## Structuring the references

Once you know what survives, split it the way the work splits:

- **By domain, so a task pulls only its chapter.** Anthropic's BigQuery example splits `reference/finance.md`, `sales.md`, `product.md` so a sales question never loads the finance schema. Split when content is mutually exclusive or rarely used together.
- **One level deep.** SKILL.md → `chapter.md` is fine; SKILL.md → `chapter.md` → `subchapter.md` is not. The model partially reads nested files (it `head`s them), so depth-behind-depth silently loses information. Flatten.
- **Table of contents on any reference over ~100 lines**, at the top, so a partial read still sees the whole scope.
- **Name files by content** (`form-validation-rules.md`, not `doc2.md`); the filename is a load-or-skip signal for the model.

## Keep the provenance outside the skill

The skill holds the distilled discipline, not the citation trail. Record where the material came from — the source URL, the paper, the thread — in the commit message, a worklog entry, or a design doc, not in the SKILL.md body (where it would pay recurring rent for zero behavioral effect). A future author who needs to re-check the source against a new model can find it there.

## Worked pass: article → skill

A short ingest → extract → structure pass, the way it actually goes:

1. **Ingest.** Read the source. As you read, note every place you think "the agent wouldn't do this by default." Those notes — not the source's section headings — are the raw material.
2. **Extract the attention shift.** From the notes, write one sentence: _before this, the agent attends to X; after, to Y._ If you can't, the source may be interesting but not yet operational — that's the speculative-interest case Step 0 gates against. Stop and reconsider whether to build.
3. **Triage the notes by freedom** (content-craft move 1). Judgment-laden points → prose in SKILL.md. Fragile, must-be-exact points → a script or a low-freedom recipe. Deep reference material → a chapter file.
4. **Draft SKILL.md as the day-one briefing** — the attention shift up top, the few rules that bite, the map to the chapters. Apply the craft moves.
5. **Cut against move 4** — read it back assuming a smart reader; delete anything that's transcription.
6. **Test eval-first** (see `iteration.md`): run the task in a fresh session without the skill, confirm the gap the skill is meant to close is real, then check the skill closes it.

The output is usually a **Knowledge** or **Toolkit** kind (see `skill-kinds.md`), occasionally a **Dispatcher** if the source covers several related jobs. It is rarely a Workflow — a read methodology is a way of seeing, not a procedure with side effects.
