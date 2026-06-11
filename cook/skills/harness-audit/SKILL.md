---
name: harness-audit
description: |
  Audits a Claude Code setup end-to-end: what loads every session, what it costs, and whether the harness's own claims hold. Inventories the standing surfaces (CLAUDE.md chain, personal/project/plugin skills, MCP instruction blocks, agent rosters, hooks, settings at every scope), quantifies their per-session token cost, then runs four checks: self-consistency, duplication across scopes, enforcement parity, and scope discipline. Output is a quantified triage (applied / recommended / held), not a vibes review.
when_to_use: |
  Any request to review, slim, or sanity-check a Claude Code setup as a whole, including "why is my context so big" and "what loads every session". Run after major harness changes (a new plugin fleet, a new machine, a model release) or when sessions feel slow or expensive from turn one. For a single artifact, the relevant forge owns the audit.
harness-targets: [claude]
---

<!-- Earned against: Fable 5 (claude-fable-5), 2026-06-10, v2.1.170 — history: CHANGELOG.md -->

## The attention this skill redirects

From "read the config files and comment" to "measure what every session pays before any work starts, then check the harness's claims against its own behavior."

The default failure is a vibes review: opening CLAUDE.md, calling it well-written, and missing that the setup burns five figures of tokens per session on descriptions, instructions, and rosters nobody chose deliberately. The second failure is trusting the harness's documentation of itself — files that say "this is not loaded" while being loaded, checklists that say "always run X" with nothing enforcing X.

## Step 1 — Inventory the standing surfaces

List everything that enters context at session start, with its scope and owner:

- **Instruction files**: CLAUDE.md chain (enterprise → user `~/.claude/CLAUDE.md` → project → CLAUDE.local.md), auto-memory `MEMORY.md`.
- **Skills**: personal (`~/.claude/skills/`), project (`.claude/skills/`), and plugin-delivered (`enabledPlugins` across all settings files). Every visible skill's `description` + `when_to_use` loads every turn.
- **MCP servers**: `.mcp.json` (minus `disabledMcpjsonServers`, plus `enabledMcpjsonServers` allowlists), plugin-shipped servers, claude.ai connectors. Tool *schemas* defer behind tool search, but server *instruction blocks* load in full.
- **Agent roster**: every plugin-shipped subagent type adds its description to the Agent tool's listing.
- **Hooks and settings**: all levels (managed → user → project → local). Note which hooks exist and what they enforce.

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
3. **Enforcement parity.** Every "always", "never", and "run X before Y" sentence in the instruction files should map to a hook, a CI gate, or a conscious decision to stay manual. A promise with no mechanism is a request, not a guarantee.
4. **Scope discipline.** Each artifact should live at the narrowest scope that serves it. Personal-scope skills used in one domain belong in a toggleable plugin or a project; product plugins needed in some repos should be per-project `enabledPlugins` entries, not global; a fleet of client-work skills in `~/.claude/skills/` taxes every repo on the machine.

## Step 4 — Triage and apply

Three buckets, every finding quantified:

- **Applied** — scoped to the current repo, reversible, with the reversal noted where the change lives. Content moves (splitting a loaded file), project-local settings.
- **Recommended** — cross-scope or behavior-config changes the user must authorize: hooks, settings files, plugin enable/disable, anything touching other repos. Present exact file contents ready to apply. Auto mode's classifier denies harness self-modification without explicit user intent — surface the change and ask; do not route around a denial.
- **Held** — findings that fail the bar: would not change what the user or agent actually does.

## Anti-patterns

- **Vibes without counts.** "Your CLAUDE.md looks clean" is not an audit.
- **Equating more skills with more capability.** Past the description budget, each addition taxes every turn of every session; the marginal skill must out-earn its standing cost.
- **Bulk-disabling without a reversal note.** Every disable gets a one-line "flip this back by..." where the change lives.
- **Auditing only the visible skill list.** MCP instruction blocks and agent rosters are quieter and often bigger.
- **Drifting into content review.** Whether a skill's guidance is good is the forges' job; this skill audits the setup the artifacts live in.
