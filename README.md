`AGENT-KITCHEN`

agent-kitchen is a second-order harness: a kitchen for the things that configure coding agents (skills, hooks, rules, CLAUDE.md, workflows). It runs as dotfiles for the agent.

The kitchen is built on the idea that:

- A frontier model in 2026 is very competent at most things, but its default in any domain is the competent average version of the thing.
  The artifacts here are commitments that drag the model off that median in a chosen direction.
- Every artifact competes with two forces: the unaided frontier model, which absorbs
  generic craft with each release, and the owner's time, which every artifact charges rent on.
- So durable value comes from what the model cannot have: the owner's taste and intent
  made operational, local truths of a repo or team, verified facts from after the training cutoff, and failures actually observed in sessions.
- Everything else gets absorbed, so deletion is the expected end of every artifact here, not a failure of one.

─────────────────────

`THE SKILLS`

The kitchen can operate as a set of skills used as needed, or as a loop:
`harvest` and `ingest` feed `forge`; probes and live use check the artifacts;
`harness-audit` removes what doesn't earn its place; sessions feed the next harvest.

```
        ┌──── leaner harness → sessions ────┐
        ▼                                   │
┌───────────────┐   ┌───────────────┐       │
│ harvest       │   │ ingest        │       │
│ session       │   │ source        │       │
│ corrections   │   │ briefs        │       │
└───────┬───────┘   └───────┬───────┘       │
        └─────────┬─────────┘               │
                  ▼                         │
          ┌───────────────┐                 │
          │ forge         │                 │
          │ design        │                 │
          │ artifacts     │                 │
          └───────┬───────┘                 │
                  ▼                         │
          ┌───────────────┐                 │
          │ harness-audit │                 │
          │ measure &     │                 │
          │ prune         │─────────────────┘
          └───────────────┘
```

| Surface                 | Role                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `forge`                 | One triage ladder routes a behavior to the right surface (skill, hook, path-scoped rule, `CLAUDE.md`/`AGENTS.md`, workflow, subagent, MCP). The stance comes first: it encourages the owner to name and refine the outcome the artifact is graded against, then grades the artifact by the work it makes the agent produce rather than by its own shape. |
| `harness-audit`         | Inventories everything loaded at session start, counts the per-session token cost, and runs four checks: self-consistency, duplication across scopes, enforcement parity, scope discipline. Built to remove things rather than add.                                                                                                                      |
| `harvest`               | Mines session transcripts for the corrections the user had to make twice, dedups them against the standing harness, and hands survivors to the forge as earned-intent evidence. The without-the-skill baseline already ran, in production, in those sessions.                                                                                            |
| `ingest`                | Turns the sources an owner hands over into an artifact, weighing each by how it was handed over: material a request is built on is read whole, and the rest fans out to one reader subagent per source, grounded in verbatim quotes.                                                                                                                     |
| `state.md` + `hacks.md` | Verified snapshot of Claude Code's surfaces and lesser-known features, re-checked against the live changelog on each release.                                                                                                                                                                                                                            |
| `changelog.md`          | Provenance ledger: why each artifact exists, what it was re-tested against, and the keep/revise/delete verdicts. The artifacts themselves carry only a one-line model pin.                                                                                                                                                                               |

─────────────────────

`INSTALL`

### Claude Code

The Claude plugins are served through the `claudia` marketplace, whose catalog is hosted in this repo:

```bash
/plugin marketplace add claudialnathan/agent-kitchen
/plugin install agent-kitchen@claudia   # the kitchen: forge, harness-audit, harvest, ingest
```

Commit-SHA versioning (no version field), so a pushed commit reaches other repos on the
next `/plugin marketplace update claudia` → `/plugin update`.

### Codex

The kitchen is also a native Codex plugin, published as its own Git marketplace so a pushed commit to this repo can refresh independently:

```bash
codex plugin marketplace add claudialnathan/agent-kitchen
codex plugin add agent-kitchen@claudia-kitchen
```

Pull later revisions and refresh the installed plugin cache with:

```bash
codex plugin marketplace upgrade claudia-kitchen
```

Start a new Codex thread after installing or upgrading so its skill catalog is rebuilt. The applied `skills` plugin is published independently from `claudialnathan/skills`.

### Cursor (and other agentskills.io tools)

The skills follow the open [agentskills.io](https://agentskills.io) spec, so any spec-compatible agent reads them directly — there is no marketplace step. Cursor loads whatever sits in `~/.cursor/skills/` (global) or a repo's `.cursor/rules/`; symlink or copy the skill folders from `skills/` there, then reload. Spec consumers read only the `description` field (they ignore `when_to_use`), which is why the triggers live in the description.
