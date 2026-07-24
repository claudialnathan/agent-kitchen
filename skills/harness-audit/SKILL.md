---
name: harness-audit
description: |
  Audits a coding-agent harness end-to-end: what loads every session, what it costs, whether the harness's own claims hold, and whether its parts work when assembled. Inventories the standing surfaces (CLAUDE.md chain, personal/project/plugin skills, MCP instruction blocks, agent rosters, hooks, settings at every scope), quantifies their per-session token cost, runs setup checks (self-consistency, duplication across scopes, enforcement parity, scope discipline, and a provisional routing-effectiveness check for doc-fleet repos), and after substantial harness changes can run a representative composition probe through the complete installed system. Output is a quantified triage that stays in-repo: findings at machine scope (anything under ~/.claude, user or enterprise settings, global plugins) are reported for the owner to action, never edited. Use to review, slim, or sanity-check a whole coding-agent harness after major harness changes or when sessions feel slow or behave incoherently from turn one; for a single artifact, the relevant forge owns the audit.
---

<!-- Earned against: Opus 4.8, 2026-06-10, v2.1.170; history: CHANGELOG.md -->

## The attention this skill redirects

From "read the config files and comment" to "measure what every session pays before any work starts, then check the harness's claims against its own behavior."

The default failure is a vibes review: opening CLAUDE.md, calling it well-written, and missing that the setup burns five figures of tokens per session on descriptions, instructions, and rosters nobody chose deliberately. The second failure is trusting the harness's documentation of itself: files that say "this is not loaded" while being loaded, checklists that say "always run X" with nothing enforcing X.

The third failure is this skill's own trap: treating cost as the verdict. Tokens are what's easy to count; what a surface lets the owner produce is what decides, and an audit that only counts always lands on cut, because the cheapest harness is the empty one. A surface the owner reaches for is already earning its cost, and that she uses it is the evidence it clears the bar, not a number to override. Report what each surface costs so the owner spends deliberately; never strip toward zero.

## Step 1: Inventory the standing surfaces

List everything that enters context at session start, with its scope and owner:

- **Instruction files**: CLAUDE.md chain (enterprise → user `~/.claude/CLAUDE.md` → project → CLAUDE.local.md), auto-memory `MEMORY.md`.
- **Skills**: personal (`~/.claude/skills/`), project (`.claude/skills/`), and plugin-delivered (`enabledPlugins` across all settings files). Every visible skill's `description` + `when_to_use` loads every turn.
- **MCP servers**: `.mcp.json` (minus `disabledMcpjsonServers`, plus `enabledMcpjsonServers` allowlists), plugin-shipped servers, claude.ai connectors. Tool *schemas* defer behind tool search, but server *instruction blocks* load in full.
- **Agent roster**: every plugin-shipped subagent type adds its description to the Agent tool's listing.
- **Hooks and settings**: all levels (managed → user → project → local). Note which hooks exist and what they enforce, and any managed model/version policy (`availableModels` + `enforceAvailableModels`, `requiredMinimumVersion`).

The session you are in is a specimen: the listings injected into your own context are the ground truth of what loads.

## Step 2: Quantify before judging

Numbers first; opinions after. The unit that matters is tokens-per-session-forever, and prefix size also costs prompt-cache build time on every cache miss.

- Skill descriptions: sum frontmatter `description` + `when_to_use` chars across each scope, divide by ~4 for tokens. One pass:

```bash
python3 - <<'EOF'
import os, re
root = os.path.expanduser('~/.claude/skills')   # repeat for project + plugin cache dirs
total = 0
for name in sorted(os.listdir(root)):
    p = os.path.join(root, name, 'SKILL.md')
    if not os.path.isfile(p): continue
    m = re.match(r'^---\n(.*?)\n---', open(p, encoding='utf-8', errors='replace').read(), re.S)
    fm = m.group(1) if m else ''
    total += sum(len(v) for _, v in re.findall(r'^(description|when_to_use):(.*?)(?=^\w|\Z)', fm, re.S | re.M))
print(total, 'chars ~', total // 4, 'tokens/session')
EOF
```

- Instruction files: `wc -l` on every always-loaded file. The repo's own cost model applies (shorter is better-read; loaded local files count too).
- Ask the user to run `/context` for the authoritative split. Your estimates bound it; the command confirms it.

## Step 3: The setup checks

1. **Self-consistency.** Diff what the harness's documentation claims against what the harness does. Classic finds: a loaded file that says it is not loaded; a dateline pinned to a version several releases back; a "this is enforced" line with no enforcement; a skill or command body that invokes or assumes another skill (`/X`) — fragile by construction (the target can be absent, disabled via `disableBundledSkills`, or set to `disable-model-invocation`) and a dead cross-reference that reads as working capability when `/X` is not in the inventory at all. This flags the *presence* of the reference, not the quality of the body — authoring skills to stand alone is the forge's remit.
2. **Duplication across scopes.** The same artifact listed twice pays twice: a project symlink and a user-scope plugin copy of the same skill; two plugins shipping the same command under different names; a personal skill shadowing a project one (personal wins silently).
3. **Enforcement parity.** Every "always", "never", and "run X before Y" sentence in the instruction files should map to a hook, a CI gate, a permission rule (`permissions.deny`, now matching tool parameters too, e.g. `Agent(model:opus)`, v2.1.178), a managed setting (a "we standardize on model X" line is enforced only by `availableModels`/`enforceAvailableModels`, not prose), or a conscious decision to stay manual. A promise with no mechanism is a request, not a guarantee. Parity starts one step earlier: a guardrail has to be a fact of the repo before its mechanism matters. `git status` and `git diff` every instruction file and hook in the chain, because a guardrail that exists only in the working tree (`git log -S"<its key phrase>"` returns nothing) is one checkout away from not existing and has reached no teammate, other machine, or plugin install. The classic find: a prior session writes the fix for an incident into CLAUDE.md and never commits it, so the audit reads standing policy where git holds nothing. And tier what stays prose-only: an order the model demonstrably read and still skipped (the owner had to re-issue it in session) has already failed *as prose*, because prose is re-weighed against everything else in context every session; it leads the hook/gate candidates rather than settling as a conscious stay-manual.
4. **Scope discipline.** Each artifact should live at the narrowest scope that serves it. Personal-scope skills used in one domain belong in a toggleable plugin or a project; product plugins needed in some repos should be per-project `enabledPlugins` entries, not global; a fleet of client-work skills in `~/.claude/skills/` taxes every repo on the machine.
5. **Routing effectiveness** *(provisional — not yet validated on a real doc-fleet repo; see CHANGELOG)*. Applies only where the repo runs a doc fleet: subsystem docs routed from an AGENTS.md table or equivalent. Skip it for single-doc repos. The question is whether the routing actually reaches the agent rather than living as good intentions:
   - **Dead rows.** Every routing-table row points to a doc that still exists. A row naming a moved or deleted doc routes nowhere, and is worse than an absent row because it reads as coverage.
   - **Two-level routing.** Each system doc opens with a greppable header (`Purpose / Read when / Key constraints / Relevant paths / Last verified`) so an agent can confirm the doc applies before paying to read it. A fleet routed only by a top-level table forces whole-doc reads just to check relevance.
   - **Mechanical backing.** The highest-value rows are duplicated down into mechanical surfaces (path-scoped rules, skill descriptions, hooks). A routing table whose only enforcement is a prose "read the router first" instruction is a request, not a guarantee — the same failure as enforcement parity one level up, because the model won't reliably run a preflight.
   - **Staleness.** Each doc's `Last verified` sits within a sane window; a fleet of confidently-worded but months-stale docs is the doc-fleet form of the frozen-fact trap.

## Step 4: Probe the assembled behavior when the harness changed

After a substantial harness change, or when individually sound artifacts produce incoherent sessions, test the system as installed. This is conditional because a fresh live run costs tokens: reuse a recent representative transcript already in the audit's scope when it exercises the changed seams; otherwise state the proposed job, tools, token cost, mutation boundary, and external side effects, then get the owner's approval before launching one or two fresh sessions.

Choose one or two high-traffic jobs that cross more than one surface — for example an instruction file plus a skill plus a tool or hook — and state the expected output and required human boundary before running them. Default to replay, a read-only job, a finished real job, or a disposable copy. A composition probe never mutates active work, another repo, machine scope, or an external system without explicit approval for those exact side effects; when no safe representative probe exists, report composition as unverified. Use the complete installed harness, not an isolated artifact fixture. Inspect the trace and result together:

- Which instructions and context were loaded or supplied, and which artifacts and tools were invoked?
- Did two surfaces compete, duplicate ownership, or issue contradictory guidance?
- Was intent or state lost between a trigger, a tool call, and the next surface?
- Did the system pause, ask, or stop at the intended human decision point?
- Was the final work better against the job's objective, not merely compliant with each component?

Report the observable composition path and the first seam that failed. A transcript cannot prove which loaded instruction causally changed hidden reasoning; leave that unknown unless a controlled comparison establishes it. An artifact passing alone does not clear this check; the unit of quality is the installed system's behavior. Keep this at the interaction boundary: reviewing the expertise inside one skill body still belongs to that artifact's forge.

## The CLAUDE.md chain, read as intent

CLAUDE.md is the always-on spine, the most-paid surface and the one that rots fastest, because it sits next to the code it describes. Give each file in the chain a closer read than the cost pass, against the job it alone can do: transmit what the code can't tell you. Flag, in the file:

- **No code-authority clause.** The file should state that when it and the code disagree, the code wins, and that a contradiction means *this file is stale, flag it*, not that the agent should obey the doc. This is the single highest-leverage line a CLAUDE.md can carry: without it, every sentence that has quietly gone stale is still read as current instruction.
- **Restated current state.** Any line restating stack, dependencies, scripts, file layout, or "we use X" where X already lives in a manifest or the source pays tokens to go stale on the next commit. What survives a refactor is intent, spirit, durable traps, and pointers. Grep the file's version numbers and dependency names against the actual manifests; each match is a line the code already owns and the doc should drop.
- **Frozen facts that should be discovered.** A value that lives at runtime (a token file, a config, a schema, a vendored doc set) belongs behind a read-first instruction ("read `globals.css` for the theme before writing classNames"; "read the docs in `node_modules/…` before coding"), not pasted as today's snapshot. The discovery survives every project the snapshot dies in.
- **Bare directives.** A rule the model can't generalize from ("Y before Z", no reason, no condition) underperforms a condition-shaped, reasoned one ("when X genuinely needs Y, do Z, because …"). The model generalizes from a why where it can't from a bare MUST.
- **Unverified mechanisms.** An intent voice does not protect a wrong mechanism inside it: check each concrete claim (a path, a script name, a flag) against the filesystem it names.
- **Bloat.** Compliance dilutes as rules and examples accumulate. Count them and report the counts; size is judgment for the owner, not a threshold to enforce.

Finding and quantifying these gaps is this skill's job; authoring the fixes (voice, the Why pattern, the goes-elsewhere table) is the forge's `CLAUDE.md and rules` remit.

## Step 5: Triage

Forge writes only inside the current repository. Everything at **machine scope** is **inventory-and-report only**: anything under `~/.claude/` (personal skills, user `CLAUDE.md`/`settings.json`, `skillOverrides`, user-scope hooks), enterprise or managed settings, global `enabledPlugins`, and anything that changes another repo. Never edit it, never stage an edit, never ask "shall I apply this?"; the audit's job at machine scope ends at the observation the owner acts on herself. This holds even when the finding is obviously correct and the fix is one line, because the owner owns her machine. It is a hard boundary, not a default to weigh.

A cost is not yet a verdict. Before any finding recommends removing or disabling a capability (a skill, plugin, MCP server, or hook), weigh whether the owner uses it; a used surface is reported at its cost, never cut, and a disable becomes a recommendation only where she confirms she does not reach for it. Removing a capability is never **Applied**, whatever its scope: an unrequested disable is the harm the audit exists to prevent, not a saving it delivers.

Every finding is quantified and lands in one bucket:

- **Applied** is for what is current-repo, reversible, and capability-preserving: content moves (splitting a loaded file), reorganizing project-local settings in *this* repo's `.claude/`. Never a disable or a deletion. Apply directly; note the reversal where the change lives.
- **Proposed** is for current-repo behavior-config the auto-mode classifier gates: this repo's hooks, `settings.local.json`, project-scope plugin toggles. Present exact file contents, ask, apply on an explicit yes. The classifier denies harness self-modification without explicit intent, so surface the change and ask; never route around a denial.
- **Reported** is for every machine-scope and cross-repo finding. State the exact edit the owner can make herself (file, change, token saving) and stop. No staged file, no apply prompt, no question that reads as an offer to apply.
- **Held** is for what fails the bar: would not change what the user or agent actually does.

## Anti-patterns

- **Vibes without counts.** "Your CLAUDE.md looks clean" is not an audit.
- **Recommending a cut you never use-tested.** Flagging a skill, plugin, or server for removal on token cost alone, without weighing whether the owner reaches for it. The description budget is real and the *unchosen* marginal artifact taxes every turn, but a used one out-earns its cost by being used; report its cost, do not charge it as waste.
- **Bulk-disabling without a reversal note.** Every disable gets a one-line "flip this back by..." where the change lives.
- **Auditing only the visible skill list.** MCP instruction blocks and agent rosters are quieter and often bigger.
- **Declaring composition from isolated passes.** Individually valid skills, hooks, and rules can still compete or lose context when assembled. Trace at least one representative cross-surface job after a substantial change before calling the system coherent.
- **Drifting into skill-body content review.** Whether a *skill's* guidance is expert-grade is the forge's job; this skill audits the setup (including the always-on CLAUDE.md chain that frames it), not the quality of individual artifact bodies.
- **Offering to apply machine-scope fixes.** The tell is a question like "which of these should I prepare exact changes for?" aimed at `~/.claude/`, user settings, or global plugins. Report them; do not stage or offer them.
