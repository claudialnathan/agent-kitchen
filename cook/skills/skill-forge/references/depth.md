# Expert-grade depth: making the subject true, not just well-written

`content-craft.md` is the *how* — writing the subject so it does work. This is the *what* — making sure the subject is genuinely expert-grade before you polish it. A flawlessly-crafted skill built on competent-level substance is a competent skill with good packaging; the packaging adds no expertise.

## The floor is competence; the skill is the delta above it

A frontier model's default output sits around **competent** across an enormous range — it knows the standard answers, the common patterns, the textbook advice. That sets the bar a skill has to clear. Encoding competent-level content is **additive / dead-weight**, because the model is already there (this is the additive-vs-transformative test from SKILL.md, seen from the depth axis). A skill earns top-tier status only by carrying the **expertise delta** — the proficient-to-expert knowledge that *isn't* in the default:

- the non-obvious moves a novice wouldn't guess;
- the trade-offs and "it depends" an expert actually weighs;
- the domain-specific failure modes and traps;
- the current, verified specifics — not stale or half-remembered recall.

If you can't name a delta, the skill is restating the floor. Don't build it — or go acquire the depth first.

## The six-point discipline

**1. Name the expertise delta — the gate.** Before writing, answer in one line: *what does a real expert in this domain know that the model's default gets shallow or wrong?* That sentence is the skill's reason to exist, and usually its sharpest description hook. No nameable delta → it's the floor → stop.

**2. Source and verify — as an action, not an intention.** Domain facts decay, and models misremember fast-moving specifics *confidently*. For any version-specific fact (an API signature, a flag, a current default), **actually fetch the current canonical doc while authoring and cite it** (WebFetch, or context7 for libraries) — do not write it from memory. "Verify" as a value you hold doesn't fire; verification is a step you take, and skipping it ships deprecated specifics in authoritative tone. For domain claims generally, ground them in an authoritative source rather than generic priors. This is `claude-md-forge`'s "verify the facts first," strengthened — and earned: an A/B depth-eval of this very forge caught a generated skill shipping a deprecated `revalidateTag` form straight from recall, beating the baseline on craft but losing on the one axis the domain was about. A confident-but-wrong expert skill is worse than none; the error is laundered through authoritative tone.

**3. Cite honestly — fetching the fact and faking the attribution are different failures.** The same depth-eval surfaced the inverse of point 2. A generated skill that grounded its hardest facts correctly (the value-for-money clauses, the current rule date) *also* dressed unsourced claims in citation clothing: an invented *"[Authority]'s guidance is blunt: [quoted sentence]"* that appears in no source, and a documented-sounding "the panel scores a rating scale and moderates to a mark" mechanism the guidance never states (it actually says scores may not be disclosed at all). So when you attribute a claim to a named authority — *"the docs say,"* *"per X,"* or anything in quotation marks — the attributed wording must be verbatim-traceable to that source. Mark a paraphrase as a paraphrase, and common practice as practice (*"panels commonly score against a rubric,"* not *"the rules require a rubric"*). A fabricated citation is worse than an uncited claim: it borrows authority it never earned and survives review precisely because it reads as sourced. Verifying a generated skill's claims against the sources — not just trusting that it fetched them — is itself part of the eval.

**4. Acquire it if it isn't in the room.** If neither you nor the model holds the depth, the forge's job is to *route to getting it*, not to dress competence up as expertise:
- fetch and read the canonical / authoritative sources, then structure them (`distillation.md`);
- run parallel reading with `/ground`, or a `/deep-research` pass, over a corpus;
- pull a human domain expert into the loop, or a specialized subagent / skill that already holds the domain;
- if the depth genuinely can't be obtained, **narrow the skill to the slice you can author expertly** and say what it does not cover. A narrow expert skill beats a broad competent one.

**5. Encode judgment and failure-modes, not just rules.** The least-substitutable, highest-value expert content is the taste: when to break the rule, the trade-off being navigated, the trap that looks fine and isn't. Rules are the floor — they're what the docs already say. Judgment is the delta.

**6. The expert's-eye test.** Read the finished subject as the domain's harshest expert: would they learn nothing (you encoded the floor) or recognize hard-won knowledge (you encoded the delta)? This is also exactly what an expertise eval scores — the rubric for *grading* "expert-grade" and the discipline for *authoring* it are one checklist.

## Worked contrast — "optimize a slow Postgres query"

The packaging is identical; the substance is not.

```md
COMPETENT (the floor — the model produces this unprompted):
- Add an index on the columns in the WHERE clause.
- Avoid SELECT *.
- Use EXPLAIN to see the query plan.
- Add LIMIT if you only need some rows.
```

```md
EXPERT (the delta — what the competent default misses):
- Run EXPLAIN (ANALYZE, BUFFERS), not bare EXPLAIN. The gap between estimated
  and actual rows is where bad plans hide; a 1000x miss means stale statistics —
  ANALYZE the table, or raise the column's statistics target.
- For `WHERE a = ? AND b > ? ORDER BY c`, composite index column order is a
  trade-off, not a given: (a, c) avoids the sort but filters b as a non-index
  predicate; (a, b) uses the range scan but forces a sort on c. Equality column
  first either way. Pick by which cost dominates in ANALYZE.
- The planner ignores a perfectly good index when selectivity is low (seq-scan
  of 40% of the table is genuinely cheaper) or when a function wraps the column —
  `WHERE lower(email) = ?` won't touch a plain index on email; it needs an
  expression index on `lower(email)`.
- A partial index `WHERE status = 'active'` often beats a full index on a huge
  cold table; a covering index (INCLUDE the selected columns) turns an index
  scan into an index-only scan, skipping the heap fetch.
- Before any of this: is it the query, or N+1 from the app layer? One slow query
  and a thousand fast ones look identical in an aggregate dashboard.
```

The competent version is what the model writes on its own — so a skill that ships it is dead weight. The expert version carries the delta: the diagnostic ordering, the column-order *trade-off* (not a false one-size rule), the planner's actual decision criteria, the real traps (function-wrapped columns, stale stats, low selectivity), and the judgment to rule out N+1 first. *That* is worth recurring context. It also reads as judgment-with-reasons, so depth and craft reinforce — but notice the craft did not *manufacture* the substance. The substance came from domain knowledge; craft only shaped it.

## Where depth meets the rest of the forge

- **Step 0, Origin B** ("authoritative expertise worth operationalizing") is the *intent*; this page is the *method* for making sure that expertise is real, current, and above the floor.
- **`distillation.md`** is how you structure depth that arrives as a written source; this page is the more general bar — depth can come from experience or research, not just one document.
- **Additive-vs-transformative** is this same gate from the *attention* angle; the **expertise delta** is it from the *depth* angle. A top-tier skill clears both.
- **`reuse.md`** uses this rubric to judge candidates: an existing skill's *quality* is largely whether it encodes a real expertise delta or merely restates the floor with good packaging.
