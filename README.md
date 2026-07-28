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
`harvest` and `ingest` feed `forge` through one brief contract; live use decides
which artifacts keep earning; `harness-audit` checks both standing cost and
assembled behavior; sessions feed the next harvest.

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
| `harness-audit`         | Inventories everything loaded at session start, counts the per-session token cost, checks setup consistency and scope, and after substantial changes traces a representative job through the complete installed harness.                                                                                                                              |
| `harvest`               | Mines session transcripts for corrections, repeated failures, and reported rewrites or reverts; dedups them against the standing harness; and packages survivors as forge-ready briefs. The unaided baseline already ran, in production, in those sessions.                                                                                              |
| `ingest`                | Places owner-supplied sources into the existing harness (or concludes nothing is warranted), reading spec material whole and grounding supplementary evidence in verbatim quotes, then emits the same forge-ready brief.                                                                                                                               |
| `state.md` + `hacks.md` | Verified snapshot of Claude Code's surfaces and lesser-known features, re-checked against the live changelog on each release.                                                                                                                                                                                                                            |
| `models.md`             | Task-routed model, harness, benchmark, and cost guide for choosing and re-testing the agents that build these artifacts; refreshed with the project-local `/model-bump` skill.                                                                                                                                                                            |
| `changelog.md`          | Provenance ledger: why each artifact exists, what it was re-tested against, and the keep/revise/delete verdicts. The artifacts carry none of it themselves.                                                                                                                                                                                              |

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

Pull later revisions with both steps — `marketplace upgrade` refreshes the Git snapshot, `plugin add` rewrites the installed plugin cache from it:

```bash
codex plugin marketplace upgrade claudia-kitchen
codex plugin add agent-kitchen@claudia-kitchen
```

Upgrading the marketplace alone leaves the installed plugin serving the previous revision. Start a new Codex thread after installing or upgrading so its skill catalog is rebuilt. The applied `skills` plugin is published independently from `claudialnathan/skills`.

### Cursor

The kitchen carries a native Cursor plugin package under `.cursor-plugin/`, including a marketplace catalog for `agent-kitchen` and the separate applied `skills` repo. Install it through Cursor's `/plugin` or Marketplace UI; that is the only path for published kitchen skills on Cursor.

`bin/sync-cross-tool` covers what the plugin does not: project-local workflows that opt in with `harness-targets:`, such as `ship-agent-skills`, which is tracked here but never bundled into the published plugin.

```bash
bin/sync-cross-tool
```

It links those into `~/.cursor/skills/` and `~/.agents/skills/` (the location current Codex scans; `~/.codex/skills/` is legacy and no longer read). Reload Cursor or start a new agent session after syncing.

### Other agentskills.io tools

The skills follow the open [agentskills.io](https://agentskills.io) spec, so other spec-compatible agents can read the folders under `skills/` directly. Spec consumers read only the `description` field (they ignore `when_to_use`), which is why the triggers live in the description.
