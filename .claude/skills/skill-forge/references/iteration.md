# Iteration: vibe-test or eval-loop?

Two different ways to iterate on a skill. They suit different kinds of skills, and using the wrong one wastes time.

## Vibe-iterate

For skills with subjective or context-dependent outputs — most workflow, knowledge, and forked-research skills — the right loop is:

1. Write a draft.
2. Pick **two real prompts** that match the description (not synthetic ones).
3. Run each in a fresh session and see if Claude invokes the skill.
4. If invoked: read the *transcript*, not just the final output. Notice where Claude is steering off, where the skill is being ignored, where the body is wasting tokens on things Claude already does.
5. If not invoked: the description is the problem 90% of the time.
6. Edit the skill (often: tighten the description, trim the body, add a missing standing instruction). Discard, don't pile up.
7. Repeat until two prompts in a row produce work you'd ship.

What "real prompts" means: the wording you'd actually type, not a clean test case. Casual phrasings, abbreviations, related-but-not-identical asks. If you only test on prompts that mention the skill by name, you're not testing whether the description triggers.

What to look for in the transcript:
- Did Claude invoke the skill, or do the work directly without it?
- Did Claude follow the body's instructions, or pick its own path?
- Did Claude get bogged down on a step that should be trivially handled?
- Did Claude waste time re-deriving something the skill should have given it?

If after two iterations the skill still doesn't work, the issue is usually one of:
- The task is too simple for Claude to bother consulting a skill (Claude only consults skills when it can't easily handle the prompt).
- The description doesn't match natural phrasing.
- The skill is trying to do something a different surface (hook, MCP, subagent) would do better — go back to triage.

## Eval-iterate

For skills with *objectively verifiable* outputs — file transforms, deterministic generators, fixed-format reports — there's a heavier loop worth using. Anthropic ships a skill-creator skill at `~/.claude/skills/skill-creator/` that automates it.

The shape:
- Write 5–10 test cases as `(prompt, expected_output_shape)` pairs.
- Run each prompt with the skill and without (baseline).
- Define **assertions** that check the output programmatically (file exists, JSON validates, contains certain keys, line count in range).
- Aggregate results into a benchmark (pass rate, time, token cost) and review side-by-side.
- Iterate the skill, re-run, compare across iterations.

When this is worth the overhead:
- The skill produces structured outputs you can grade with code.
- You're going to use the skill a lot and small drift matters.
- You're competing skill versions and want a defensible "this is better."
- You're building skills for distribution (a plugin, a public marketplace) and need consistency.

When it's overkill:
- The skill produces prose, plans, recommendations.
- You'll use the skill occasionally and "good enough" is good enough.
- You're still figuring out what the skill should be.

To use the eval loop, invoke `~/.claude/skills/skill-creator/` (if available) with the skill path. It walks the workflow: spawning runs in parallel subagents, capturing timing, grading, opening an HTML viewer, reading feedback, iterating. See its SKILL.md for details. There's also a description optimizer (`scripts/run_loop.py`) that mutates the description against a trigger eval set and converges on better triggering.

## A middle path

Sometimes the right move is a single sanity test:
- For a workflow skill: run it once on a real example. Did it do the job? Done.
- For a knowledge skill: ask a question the skill should answer in a fresh session. Did Claude pull it in? Was the answer better than without it?

If the answer is yes and the skill feels right, ship it. Iteration is a tool, not an obligation. The cheapest way to make a skill better is often to *use* it for a week and let real usage surface the gaps.

## What to do when iteration stalls

Symptoms:
- Each iteration changes the description but the trigger rate stays flat.
- Each iteration tweaks the body but Claude still does the work the way it would without the skill.
- The skill seems to be helping on test prompts but not in real use.

Likely causes:
- **The skill is the wrong surface.** Re-run triage. A `/review` skill that doesn't change behavior probably wants to be a `PostToolUse` hook running a linter, or a subagent that does the review separately, or both.
- **The task is below the skill threshold.** Claude doesn't reach for skills on simple prompts. If your test prompts are too easy, the skill won't fire even with a perfect description. Pick harder, more open-ended prompts.
- **The skill description matches but the body is forgettable.** Claude invokes, reads, and moves on without integrating. Strengthen the body's standing-instruction voice. "When implementing X, always Y."
- **The skill is contradicting CLAUDE.md or another skill.** Conflicting instructions cause Claude to pick arbitrarily. Audit for contradictions.

When stuck, write the diff out loud: "the skill says X; without the skill Claude does Y; the difference I want is Z." If you can't articulate Z, the skill isn't well-defined yet.

## A note on overfitting

The same trap as ML: optimize on too few prompts and you build a skill that works for those prompts and nothing else. The skill-creator eval loop addresses this by holding out a test set; for vibe-iteration, the rule is *don't iterate on a prompt you've already passed*. After a prompt works, retire it from rotation; pick a new one for the next iteration. Otherwise the skill ossifies around the prompts you keep using.
