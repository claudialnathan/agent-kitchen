## `agent-kitchen`

This is where I workshop my personal skills, hooks, rules and other harness-related files. I access them via a Claude Code marketplace (`claudia`) that publishes two plugins — `cook` for the meta-forges, `serve` for the applied skills — so I have a single source of truth and updates cascade wherever they're used.

The harness has six places to put behavior (CLAUDE.md, path-scoped rules, skills, subagents, hooks, MCP servers), and they each have different costs and reach. Skills are the most expensive: every visible skill spends description-token budget on every turn, and once invoked, the body sits in context for the rest of the session. Most things that feel like they want to be a skill should be a hook (which only fires on the matching event), a rule (which only loads when matching files are open), or a CLAUDE.md entry. The interesting design question is which of the six.

Four of the skills here, the meta-forges, are about that question.

- `skill-forge` decides whether the right answer is a skill at all, and shapes the SKILL.md if so.
- `hook-forge` does the same for hooks.
- `rule-forge` for path-scoped rules.
- `claude-md-forge` for CLAUDE.md (audit, bootstrap, or absorb session learnings).

They compose. "Make me a skill that lints my Python" comes into `skill-forge`, which decides the right answer is a hook, and hands the work to `hook-forge`. You can ask any of them and they'll route.

The other skills here are stack-specific discipline I keep needing:

- `cache-aware-testing`: Next.js 16 Cache Components apps on Vitest + Playwright + Supabase + shadcn.
- `shadcn-tailwind`: shadcn 4 on Base UI with Tailwind v4.
- `design-engineer`: design polish on the same stack.
- `saltintesta`: writing prose meant to be read with attention.

### If you wandered in

The applied skills are narrow. They'll only help if your stack overlaps with mine.

The meta-forges encode which behavior belongs in which surface. That's the thing I had to learn the hard way about Claude Code. Read them as opinions, not templates. They'll be more useful that way.

Every skill stands alone in its own directory with a `SKILL.md`. Drop the directory in `.claude/skills/`, `~/.cursor/skills/`, or `~/.codex/skills/` and it works. SKILL.md is a cross-tool format now. For Claude Code, `/plugin marketplace add` this repo and then install the two plugins it publishes: `/plugin install cook@claudia` (meta-forges) and `/plugin install serve@claudia` (applied skills).

### Layout

```
cook/skills/<name>/    meta-forges (cook plugin source)
serve/skills/<name>/   applied skills (serve plugin source)
.claude-plugin/        marketplace manifest (claudia: cook + serve)
rules/<name>.md        path-scoped rules
.claude/               local symlinks for project-scope discovery
bin/sync-cross-tool    syncs skills flat into ~/.cursor/skills, ~/.codex/skills, .claude/skills
bin/preship-check      validation gates
guides/                local design notes (gitignored)
STATE.md               living reference for Claude Code and coding agents
CLAUDE.md              how this repo wants to be worked on
```
