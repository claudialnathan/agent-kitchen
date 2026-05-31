# Content craft: making the subject good

Anatomy decides whether a skill loads. Craft decides whether it does anything once it is in context. This is the depth behind Pillar 1's "Write with craft" in SKILL.md.

Most of the moves below are Anthropic's own guidance, cited so you can re-verify them when the canon shifts. Verify against: `https://code.claude.com/docs/en/skills`, Anthropic's "skill authoring best practices" (docs.claude.com / platform.claude.com), and the bundled `skill-creator` skill. Where a move is this forge's own framing rather than Anthropic's, it says so.

The seven moves are independent; a skill applies the ones its content needs. The two that do the most work are the first two.

## 1. Match freedom to fragility (degrees of freedom)

The single most useful content-craft framework, and the one the forge historically omitted. **Match the specificity of the instruction to how fragile and variable the task is.** Anthropic's image is a robot on a path:

- **High freedom — prose, general direction.** Open field, no hazards. The task has many valid approaches and is context-dependent, so over-specifying makes the skill brittle and wrong outside the cases you imagined. _Example: code review, architectural judgment, writing._ Give principles and what to attend to, not steps.
- **Medium freedom — pseudocode or parameterized scripts.** A preferred pattern exists; some variation is fine. _Example: a scaffold with a few knobs._
- **Low freedom — exact scripts, few or no parameters.** Narrow bridge with cliffs on both sides: fragile, error-prone, consistency-critical. _Example: a destructive database migration, a release with irreversible steps._ "Run exactly this. Do not improvise." Here a rigid directive is correct.

The failure in both directions:

- **Over-specified high-freedom task** → a five-step checklist for code review that the model follows literally and stops, missing everything the checklist didn't anticipate. (This is also how an *additive* skill is born — see move-test below.)
- **Under-specified low-freedom task** → "migrate the data carefully" for an operation that needed the exact command, so the model improvises and breaks idempotency.

This axis is **orthogonal to additive-vs-transformative**: freedom is about the task's _fragility_, attention-redirection is about what the skill puts in _foreground_. A skill can be high-freedom and transformative (good code review), or low-freedom and additive (a deterministic deploy script). Carry both lenses.

## 2. Explain the why, not just the rule

Anthropic flags all-caps `MUST` / `ALWAYS` / `NEVER` as a **yellow flag**. Today's models have enough theory of mind to act on a reason and generalize it to cases the rule never named; a bare directive only covers the case you wrote. Reserve hard directives for the genuinely fragile, low-freedom case (move 1) where there is exactly one right action and deviation is the failure.

```md
WEAK:  ALWAYS use constructor injection.
STRONG: Prefer constructor injection — it makes dependencies visible in the
        signature and keeps the object valid the moment it exists. Setter or
        field injection hides them and allows half-constructed objects, so
        reach for it only when a framework forces it.
```

The strong version transfers: faced with an unfamiliar DI situation, the model reasons from the principle. The weak version goes silent the moment reality differs from the example. This is the reader-facing twin of SKILL.md's "state the reason" (which is the _author's_ discipline — give every section a why). Anthropic repeats this one more than any other content principle; claude-md-forge cites the same finding (reasoned rules outperforming unreasoned ones by a wide margin on misalignment).

## 3. Show, don't tell

One worked input → output pair conveys desired style and altitude faster than a paragraph describing them. Lift the example from real work, not a synthetic case.

```md
TELL:  Write commit messages in conventional-commit format with a clear subject.
SHOW:  feat(auth): add refresh-token rotation
       fix(api): return 409 not 500 on duplicate idempotency key
       chore(deps): bump vitest to 3.2
```

The caveat that keeps this from bloating the skill: use **one**. Examples cost several times what a rule costs in tokens, and the model overfits to their specifics — three examples of the same shape teach "match this shape" more than they teach the principle. If prose can name the rule cleanly, prefer the rule; use the example only where the rule can't capture the edge.

## 4. Assume Claude is already smart

The context window is a public good — your skill shares it with the system prompt, the history, every other skill's metadata, and the request. The default assumption is that the model already knows the general background; the skill exists for what it _can't_ know (your codebase, your conventions, your hard-won specifics).

Anthropic's canonical contrast: a 50-token `pdfplumber` snippet that assumes the model knows what a PDF is, versus a 150-token paragraph that explains PDFs first. The first is correct. Three questions to ask of every paragraph:

- Does the model really need this explanation?
- Can I assume the model already knows this?
- Does this paragraph justify its token cost?

If a line would be true in any codebase, it is probably the model's job, not the skill's. Cut it.

## 5. One default with an escape hatch

Don't enumerate options ("use pypdf, or pdfplumber, or PyMuPDF, or…"). Name the one you want and the single condition under which to deviate. Choice surfaced without a recommendation is a token cost that buys nothing and invites the model to dither or pick inconsistently across runs.

```md
WEAK:  You can use Zod, Yup, Valibot, or io-ts for validation.
STRONG: Validate with Zod. If the schema must run in a sub-1KB bundle, use
        Valibot instead; otherwise Zod everywhere for consistency.
```

## 6. One term per concept

Pick one word for each thing and hold it for the whole skill. "Endpoint" or "route" — not both. "Field" or "property" or "attribute" — one. Synonyms read to the model as distinctions, so it spends effort hunting for a difference that isn't there, and its output drifts between your terms. Consistency is free and compounds.

## 7. No time-sensitive content

"Before August 2025, use the old client" rots the moment the date passes, and worse, it reads as currently-relevant. Put superseded guidance in a clearly-labelled collapsed "Old patterns" section (so the model knows it's history), or cut it. The same applies to "recently", "the new API", "as of this writing" — name the durable behavior, not the moment. (This mirrors CLAUDE.md's refactor-stable filter: content that a calendar can falsify depicts a moment, not a rule.)

## The move test: is the body doing real work?

After applying the moves, run the additive-vs-transformative test from SKILL.md on the result. If the body reads as a checklist the model would have produced unprompted, the craft moves dressed up an additive skill — which is fine only if it's genuinely just a typing shortcut (ship it cheap: `disable-model-invocation: true`, narrow `allowed-tools`). If the body redirects what the model foregrounds — names the question, not just the steps — the craft is paying for reframing, which is what survives compaction and earns the recurring cost. The worked `/review-our-code` good-vs-weak pair in SKILL.md is moves 1, 2, and 3 applied together.
