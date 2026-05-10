# agent-kitchen

A small workshop of Claude Code skills, packaged as a marketplace plugin. The applied skills also work in Cursor and Codex.

Four meta-skills (skills that help you build other Claude Code artifacts) and three applied skills.

## Skills

**Meta — for designing Claude Code artifacts**

- `skill-forge` — designs skills. Triages first (skill / hook / rule / CLAUDE.md / MCP / subagent), then drafts.
- `hook-forge` — designs hooks. Picks the lifecycle event, determinism mode, and exit-code semantics.
- `rule-forge` — designs path-scoped rules at `.claude/rules/<name>.md`.
- `claude-md-forge` — designs CLAUDE.md (and AGENTS.md, CLAUDE.local.md, `.claude/rules/`). Bootstrap, audit, or tune.

**Applied — for getting work done**

- `cache-aware-testing` — testing decisions for Next.js 16 Cache Components + Vitest + Playwright + Supabase + shadcn.
- `shadcn-tailwind` — shadcn (Base UI) + Tailwind v4 conventions. Auto-loads on UI files.
- `design-engineer` — design-engineering discipline for shadcn + Tailwind v4 + Next.js + Vercel. Auto-loads on UI files.

## Install (Claude Code)

In a Claude Code session:

```
/plugin marketplace add claudialnathan/agent-kitchen
/plugin install claudia@harness
```

Pull updates later with `/plugin marketplace update harness`.

## Install (Cursor / Codex)

Cursor and Codex read skills from `~/.cursor/skills/<name>/SKILL.md` and `~/.codex/skills/<name>/SKILL.md` natively. Clone and symlink:

```bash
git clone https://github.com/claudialnathan/agent-kitchen.git
cd agent-kitchen
bin/sync-cross-tool          # idempotent; --dry-run to preview
```

The four meta-skills are tagged `harness-targets: [claude]` and skipped for Cursor/Codex. Applied skills publish to all three.

## Layout

- `skills/<name>/` — each skill stands alone. `SKILL.md` is the entry point; `references/` carries the dense bits.
- `.claude-plugin/{marketplace,plugin}.json` — plugin manifests.
- `bin/preship-check` — frontmatter, description-budget, and loader-trigger validation. Run before commits.
- `bin/sync-cross-tool` — symlink syncer for Cursor and Codex.
- `guides/` — design notes, harness snapshots, baseline references. Not loaded into context.
- `CLAUDE.md` — project instructions, conventions, the loader-trigger footgun, and validation gates.
- `FYI.md` — install/update/troubleshoot playbook.

## Adding your own skill

1. Drop a directory under `skills/<name>/` with a `SKILL.md`.
2. `bin/preship-check` — catches missing frontmatter, oversized descriptions, and the byte sequences that silently break skill loading.
3. `bin/sync-cross-tool` — symlinks into Cursor and Codex.
4. From any Claude Code session: `/plugin marketplace update harness`.

Conventions and naming rules (especially: avoid colliding with personal-scope skills like `skill-creator`) are in `CLAUDE.md`.

## License

MIT.
