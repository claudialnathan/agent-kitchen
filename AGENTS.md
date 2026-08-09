This is a place where harness-related tools for AI agents are created and evaluated. Every fact, rule, idea or opinion is perishable. Nothing in this repo holds higher authority than new information or insights realized today.

Nothing here is strict. Every rule in this file and in the kitchen's skills is a rebuttable default: a rule keeps hard force only while grounded in significant, recent, verifiable evidence — a dated incident, a live canonical doc, real measurements from roughly the last two months — and everything else bends to the current session's judgment. Questions to the owner are never rationed; when intent is unclear, ask rather than guess. Fluidity, growth, adaptability, and room for failure outrank consistency with the repo's past self: an experiment that fails and is deleted is the system working, and no standing rule may be cited as authority against trying something new.

This file holds intent and durable traps about how the harness reads this place. It does not depict the current state of the repo. The filesystem does that, and this file restating it would only go stale. If a statement here contradicts what you see in the code, the code is authoritative; flag the drift before relying on the rule. The same holds for judgment: if a kitchen rule and your judgment disagree mid-task, say the disagreement out loud before complying. And decisions are verified against freshly retrieved genuine sources at the time of deciding. The repo's own docs and already-loaded context are perishable inputs, never the verification baseline.

The whole kitchen is human-in-the-loop, and verification informs — it never overrules. When fresh evidence or the model's own judgment pushes against what the owner asked for, or against an edit the owner made to an artifact, the model never assumes it wins. It states its stance with the evidence, then asks: forgo the original intent on that piece per the recommendation, keep it exactly as intended ("away with your opinion" is a complete answer), hear the owner's reasoning, or something else (in Claude Code, `AskUserQuestion` with those options). The owner holds domain expertise unique to them and their work — evidence of a kind no retrieved source carries — and the goal is never a generically good harness. It is a harness perfect for this owner and what they wanted to achieve.

## What the kitchen optimizes for

The kitchen's artifacts compete with two forces only: the unaided frontier model, which improves every release and absorbs generic craft, and the owner's time. An artifact is how the owner transmits intent the model can't infer. It might be a raw idea or something read worth operationalizing, an output that missed what was meant and got refined, a post-cutoff fact the model lacks, or a task the model got wrong. Failure is one means, not the main one; a new idea and a corrected miscommunication are the everyday means. Durable value comes from what the model cannot have: the owner's taste and intent made operational, local truths of a repo or team, verified post-cutoff currency. The standing claim the kitchen holds its output to: **each expertise or taste skill it produces (kept in the separate `skills` repo, github.com/claudialnathan/skills) earns its place only by beating the current model on the gap that created it — the model as it actually runs where the gap lives, same harness, same repo, same steering context, minus the artifact.** A session is never unaided: whatever surrounds the model steers it, and existing work below the owner's bar reads to it as the accepted standard. So an artifact can earn its keep purely as a counterweight — restating what a clean model "knows" is dead weight only when nothing in context pulls against it — and any check that strips the steering away measures knowledge, not the deployed behavior the gap lives in. The evidence is live use: the moment a skill's guidance and bare instinct converge in real work, it has stopped earning, so log it and delete it. Deletion is the expected end of every such artifact, not a failure of one. Process skills (changelog and quality-audit in the skills repo; the kitchen's own new-skill, improve-skill, grill-skill, ingest, harness-audit) are exempt because their value is the owner wanting the procedure, which no release absorbs, so no deletion rule applies to them. Publication upkeep (STATE.md, HACKS.md) serves those documents' own readers; it is real work, but not the kitchen's product.

## What an artifact may claim, and in what voice

An artifact is authored in one session and then run by agents in many, for far longer than that session lasted. What a single authoring session observed is thin evidence and it is the first thing to go stale, so the session is not the source of truth for anything the artifact asserts. The session's role is to set up the guidance, structure, and process that let an agent produce gold-standard output in the area the owner named.

Every claim in an artifact traces to something the owner can point at: supplied reading, a live canonical doc, the owner's stated intent, or a verified truth of the repo it runs in. Where none of those holds a claim, it stays out. That includes positions the sources don't take: don't push a source's stance further than the source pushes it, and don't invent conduct doctrine for the agent — what counts as verified, what honesty requires, what "truth" means in the domain — unless a source or the owner states it. Most tasks an artifact steers are not moral or principled ones. They are jobs that need doing extremely well.

Prefer condition-shaped guidance to principle-shaped. "When X, do Y, because Z" applies where its conditions hold; "Y, not A and not B" reads as universal and gets cited where the conditions don't. Belief declarations, mission statements, and aphorisms fail the same way, and they change what the agent optimizes for, because an agent handed a principle starts defending the principle.

None of this is licence to hedge. An artifact should be as specific, as opinionated, and as directive about procedure as its sources and the owner are. A limp artifact that commits to nothing fails for the same reason as a preachy one: the session substituted its own judgment for the material's. What to avoid is manufactured conviction, and the tell is copywriting — the two-part reframe, the quotable line, the principle nobody supplied. When a session does believe something no source holds, it says so to the owner in the session rather than writing it into the artifact.

This file and the meta layer's skills are the register an authoring session copies, so write them the way the artifacts should read. Plain English, in sentences with someone doing something — the owner has to be able to read these, and a passage she can't parse has failed however correct it is. State values instead of asking for them to be derived, pair every prohibition with its replacement, and attach the reason to the action. `new-skill` carries the full form rule and a lookup of the ways a line fails.

## New artifacts are feedback for the meta layer

The user comes here to design new harness-related tools. Every one of those is also evidence about the meta layer that built it. When a session creates a new artifact, after delivery ask:

- **Was the output actually excellent?** Judge an artifact by the work it makes an agent produce (would the best practitioner in its domain call that work expert-grade?) and judge it by that *first*. The artifact's own properties (token cost, trigger precision, provenance hygiene) are hygiene; they never stand in for the quality of the output. A flawlessly-shaped skill that yields competent-floor work has failed.
- What was friction during the design? Did the skill that ran anticipate it, or did you have to improvise?
- Was anything missing from its triage, stance, or references?
- Did any anti-pattern bite that it doesn't currently warn about?
- Did the artifact's shape suggest something it should learn?

Propose updates based on what surfaced, as part of finishing the work. An artifact that revealed a gap is more valuable as an improvement to the skill that built it than as a one-off.

Do not propose updates simply because it says to try so here. Use your judgement, critical thinking and creativity, and decide if it's really worthwhile mentioning.

## Provenance and deletion

Artifacts are earned against a model, and both the gap and the model move. The discipline lives in one place:

- **CHANGELOG.md is the ledger** (committed, newest-first, keyed by date and model state): why the artifact exists, what shifted, keep/revise/delete verdicts, and whatever an author learned from testing a draft before shipping it. Reference skills by name and section, not line numbers.
- **Live convergence is the deletion signal, and it is sufficient on its own.** When, mid-task, an artifact's guidance and the model's bare instinct agree, the artifact has stopped earning: log it and delete it. No staged confirmation run stands between the observation and the deletion.
- **A new working model triggers a sweep of the whole fleet.** It is small enough that selection needs no key: re-read each artifact against the new model's behavior, delete the ones whose gap no longer reproduces, rewrite the ones whose gap has shifted, and record every verdict — including the keeps, or a sweep can only ever argue for removal. A model being **withdrawn** is as much a trigger as one being superseded.
- **Artifacts do not reference the conversation that produced them.** That means no session narration, no addressing the reader, no quoting requests. Write provenance as neutral fact in the changelog. References to these may dilute and steer you toward context that is stale.
- **And the artifact is not the bibliography.** Skill bodies are standing instructions to the agent. This sort of provenance lives in the skill's own README `src:url` links and CHANGELOG.md. Canonical doc URLs the agent can verify against mid-task are the exception because they direct action.

**Retired 2026-07-27: earning probes and model pinning.** The kitchen used to require an `Earned against: <model>, <date>, <version>` marker on every artifact, a shipped `evals/probes.md` of runnable fixtures per expertise or taste skill, a run-twice A/B as the shipping verdict, and a probe replay as the confirmation before any deletion. All of it is gone:

- These artifacts now run across several harnesses (Claude Code, Codex, Cursor) on models that change fast and silently. A marker naming one model and one harness version rots the week it is written, and it implies a guarantee that no longer holds for any reader. The template made this worse than neutral: because it hardcoded a Claude Code version, sessions on other harnesses filled that field in anyway, producing pins that paired a GPT model with a Claude Code release number.
- Shipped probe fixtures sat inside public skill directories, drifted from the skill they were written for, and cost more upkeep than they returned in a single-owner repo. Mandated 2026-07-05; by 2026-07-27 the fleet carried one, then none.
- The valuable part was never the protocol. It was the bar, and the bar stays: a gradeable objective, a real gap between the model's deployed default and what the owner wants, and a nameable attention shift. Testing a draft before shipping it remains good practice — as authoring judgment, with notes to CHANGELOG.md, never as a directory of fixtures or a comment inside the artifact.

Note for anyone sweeping for the retired language: `harness-audit`'s **composition probe** is a live cross-surface check on the assembled harness. It is unrelated to earning probes and stays.

## Trajectory and governance

The work here is small and evidence-driven: the meta layer (this repo) plus the applied skills it produces (the `skills` repo), added when discipline accumulates.

Two defaults before adding a new meta or applied skill, each bendable with a named reason logged in CHANGELOG.md:

1. **Triage gap is real.** There is a class of artifact the meta layer doesn't cover, or discipline that gets retyped in a stack.
2. **A first worked example is in hand.** Shipping without one is an experiment: mark the artifact provisional and validate it in live use.

## Authoring footgun: skill loader trigger sequences

The skill loader executes two literal byte sequences as shell commands in any file inside a skill directory. Markdown context (fences, inline code, quotes) offers no protection, and a hit breaks the whole skill's loading. The sequences, how to document them safely, and the self-check grep are in the `new-skill` skill. `bin/preship-check` catches both; in Claude Code a committed PreToolUse hook runs it on every `git commit` and blocks on failure, so there is no need to run it manually before committing. On harnesses without that hook, run `bin/preship-check` yourself before committing.

## Publishing footgun: Claude stays versionless; Codex does not

No `version` field belongs in either plugin's `.claude-plugin/plugin.json` or the Claude `claudia` marketplace entries. Commit-SHA versioning is what makes a pushed commit propagate on the next `/plugin update`; a version string there pins Claude's per-install cache and pushed changes silently stop reaching other repos (a frozen `0.1.0` hid `quality-audit` for weeks). `bin/preship-check` fails if one reappears.

Codex is a separate contract: `.codex-plugin/plugin.json` carries the strict-semver version its manifest validator requires, and `.agents/plugins/marketplace.json` publishes this repo as the `claudia-kitchen` Git marketplace. A pushed commit propagates in two steps, and both are required: `codex plugin marketplace upgrade claudia-kitchen` refreshes the Git marketplace snapshot, then `codex plugin add agent-kitchen@claudia-kitchen` rewrites the installed plugin cache from it. Upgrading the marketplace alone leaves Codex serving the previous revision — the installed cache is keyed by the manifest version, but `plugin add` re-populates that directory, so no version bump is needed. Do not copy the Codex version into the Claude manifests, and do not remove it from the Codex manifest.

## The reference documents

Four long documents sit at the repo root. Each opens with a header block naming its purpose, when to read it, and when it was last verified, so an agent can decide whether to read further without paying for the whole file. Read the header first and the body only when it applies.

| Document | Read it when |
| :--- | :--- |
| `STATE.md` | An installed Claude Code capability, limit, or cross-tool convention is in question. |
| `HACKS.md` | Looking up a specific lesser-known Claude Code surface or flag. |
| `MODELS.md` | The task involves model policy, routing economics, or model-release convergence. |
| `CHANGELOG.md` | Tracing why an artifact exists, what it was re-tested against, or a keep/revise/delete verdict. |

## Other general rules

The meta layer (new-skill, improve-skill, grill-skill, ingest, harness-audit) never writes, stages, or offers to apply machine-scope config (anything under the harness's own user directory, such as `~/.claude/` or `~/.codex/`, plus user or enterprise settings and global plugins), even during an audit and even when the fix is one obvious line. Machine-scope findings are reported for the owner to action; their write scope is the current repo. A hard boundary, not a default to weigh. (The skills carry this rule themselves so it travels when the plugin is installed elsewhere; this line governs kitchen sessions and any future meta-layer skill.)

## Dates

Use absolute YYYY-MM-DD in skills, references, and memory. Relative phrases ("last month", "recently") rot fast. For documents whose whole job is to snapshot Claude Code behavior (STATE.md, HACKS.md), also record the Claude Code version from `code.claude.com/docs/en/changelog`, e.g. `2026-05-14, v2.1.141`. The version scopes which features and fixes were live when the artifact was earned.
