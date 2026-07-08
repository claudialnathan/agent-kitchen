---
name: harness-audit
description: |
  Audits a Claude Code setup end-to-end: what loads every session, what it costs, and whether the harness's own claims hold. Inventories the standing surfaces (CLAUDE.md chain, personal/project/plugin skills, MCP instruction blocks, agent rosters, hooks, settings at every scope), quantifies their per-session token cost, runs four checks — self-consistency, duplication across scopes, enforcement parity, scope discipline — and reads the CLAUDE.md chain as intent (code outranks the doc; no restated stack, deps, or layout). Output is a quantified triage that stays in-repo: findings at machine scope (anything under ~/.claude, user or enterprise settings, global plugins) are reported for the owner to action, never edited. Use to review, slim, or sanity-check a whole Claude Code setup — including 'why is my context so big' or 'what loads every session' — after major harness changes (a new plugin fleet, a new machine, a model release) or when sessions feel slow from turn one; for a single artifact, the relevant forge owns the audit.
---

<!-- Earned against: Opus 4.8, 2026-06-10, v2.1.170 — history: CHANGELOG.md -->

## The attention this skill redirects

From "read the config files and comment" to "measure what every session pays before any work starts, then check the harness's claims against its own behavior."

The default failure is a vibes review: opening CLAUDE.md, calling it well-written, and missing that the setup burns five figures of tokens per session on descriptions, instructions, and rosters nobody chose deliberately. The second failure is trusting the harness's documentation of itself — files that say "this is not loaded" while being loaded, checklists that say "always run X" with nothing enforcing X.

## Step 1 — Inventory the standing surfaces

List everything that enters context at session start, with its scope and owner:

- **Instruction files**: CLAUDE.md chain (enterprise → user `~/.claude/CLAUDE.md` → project → CLAUDE.local.md), auto-memory `MEMORY.md`.
- **Skills**: personal (`~/.claude/skills/`), project (`.claude/skills/`), and plugin-delivered (`enabledPlugins` across all settings files). Every visible skill's `description` + `when_to_use` loads every turn.
- **MCP servers**: `.mcp.json` (minus `disabledMcpjsonServers`, plus `enabledMcpjsonServers` allowlists), plugin-shipped servers, claude.ai connectors. Tool *schemas* defer behind tool search, but server *instruction blocks* load in full.
- **Agent roster**: every plugin-shipped subagent type adds its description to the Agent tool's listing.
- **Hooks and settings**: all levels (managed → user → project → local). Note which hooks exist and what they enforce, and any managed model/version policy (`availableModels` + `enforceAvailableModels`, `requiredMinimumVersion`).

The session you are in is a specimen: the listings injected into your own context are the ground truth of what loads.

## Step 2 — Quantify before judging

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

- Instruction files: `wc -l` on every always-loaded file. The repo's own cost model applies (CLAUDE.md sweet spot under 200 lines; loaded local files count too).
- Ask the user to run `/context` for the authoritative split — your estimates bound it, the command confirms it.

## Step 3 — The four checks

1. **Self-consistency.** Diff what the harness's documentation claims against what the harness does. Classic finds: a loaded file that says it is not loaded; a dateline pinned to a version several releases back; a "this is enforced" line with no enforcement.
2. **Duplication across scopes.** The same artifact listed twice pays twice: a project symlink and a user-scope plugin copy of the same skill; two plugins shipping the same command under different names; a personal skill shadowing a project one (personal wins silently).
3. **Enforcement parity.** Every "always", "never", and "run X before Y" sentence in the instruction files should map to a hook, a CI gate, a permission rule (`permissions.deny`, now matching tool parameters too — `Agent(model:opus)`, v2.1.178), a managed setting (a "we standardize on model X" line is enforced only by `availableModels`/`enforceAvailableModels`, not prose), or a conscious decision to stay manual. A promise with no mechanism is a request, not a guarantee.
4. **Scope discipline.** Each artifact should live at the narrowest scope that serves it. Personal-scope skills used in one domain belong in a toggleable plugin or a project; product plugins needed in some repos should be per-project `enabledPlugins` entries, not global; a fleet of client-work skills in `~/.claude/skills/` taxes every repo on the machine.

## The CLAUDE.md chain, read as intent

CLAUDE.md is the always-on spine — the most-paid surface and the one that rots fastest, because it sits next to the code it describes. Give each file in the chain a closer read than the cost pass, against the job it alone can do: transmit what the code can't tell you. Flag, in the file:

- **No code-authority clause.** The file should state that when it and the code disagree, the code wins — and that a contradiction means *this file is stale, flag it*, not that the agent should obey the doc. This is the single highest-leverage line a CLAUDE.md can carry: without it, every sentence that has quietly gone stale is still read as current instruction.
- **Restated current state.** Stack, dependencies, scripts, file layout, "we use X" where X already lives in a manifest or the source — every such line pays tokens to go stale on the next commit. What survives a refactor is intent, spirit, durable traps, and pointers. Grep the file's version numbers and dependency names against the actual manifests; each match is a line the code already owns and the doc should drop.
- **Frozen facts that should be discovered.** A value that lives at runtime — a token file, a config, a schema, a vendored doc set — belongs behind a read-first instruction ("read `globals.css` for the theme before writing classNames"; "read the docs in `node_modules/…` before coding"), not pasted as today's snapshot. The discovery survives every project the snapshot dies in.
- **Bare directives.** A rule the model can't generalize from — "Y before Z", no reason, no condition — underperforms a condition-shaped, reasoned one ("when X genuinely needs Y, do Z, because …"). The model generalizes from a why where it can't from a bare MUST.
- **Unverified mechanisms.** An intent voice does not protect a wrong mechanism inside it: check each concrete claim — a path, a script name, a flag — against the filesystem it names.
- **Over the ceilings.** Past ~14 top-level rules compliance drops sharply; worked examples cost ~3× a rule and induce overfitting. Count them; a file over the line buys less compliance than it thinks.

Finding and quantifying these gaps is this skill's job; authoring the fixes — voice, the Why pattern, the goes-elsewhere table — is the forge's `CLAUDE.md and rules` remit.

## Step 4 — Triage

Forge writes only inside the current repository. Everything at **machine scope** — anything under `~/.claude/` (personal skills, user `CLAUDE.md`/`settings.json`, `skillOverrides`, user-scope hooks), enterprise or managed settings, global `enabledPlugins`, and anything that changes another repo — is **inventory-and-report only**. Never edit it, never stage an edit, never ask "shall I apply this?"; the audit's job at machine scope ends at the observation the owner acts on herself. This holds even when the finding is obviously correct and the fix is one line — the owner owns her machine. It is a hard boundary, not a default to weigh.

Every finding is quantified and lands in one bucket:

- **Applied** — current-repo and reversible: content moves (splitting a loaded file), project-local settings in *this* repo's `.claude/`. Apply directly; note the reversal where the change lives.
- **Proposed** — current-repo behavior-config the auto-mode classifier gates: this repo's hooks, `settings.local.json`, project-scope plugin toggles. Present exact file contents, ask, apply on an explicit yes. The classifier denies harness self-modification without explicit intent — surface the change and ask; never route around a denial.
- **Reported** — every machine-scope and cross-repo finding. State the exact edit the owner can make herself (file, change, token saving) and stop. No staged file, no apply prompt, no question that reads as an offer to apply.
- **Held** — fails the bar: would not change what the user or agent actually does.

## Anti-patterns

- **Vibes without counts.** "Your CLAUDE.md looks clean" is not an audit.
- **Equating more skills with more capability.** Past the description budget, each addition taxes every turn of every session; the marginal skill must out-earn its standing cost.
- **Bulk-disabling without a reversal note.** Every disable gets a one-line "flip this back by..." where the change lives.
- **Auditing only the visible skill list.** MCP instruction blocks and agent rosters are quieter and often bigger.
- **Drifting into skill-body content review.** Whether a *skill's* guidance is expert-grade is the forge's job; this skill audits the setup — including the always-on CLAUDE.md chain that frames it — not the quality of individual artifact bodies.
- **Offering to apply machine-scope fixes.** The tell is a question like "which of these should I prepare exact changes for?" aimed at `~/.claude/`, user settings, or global plugins. Report them; do not stage or offer them.
