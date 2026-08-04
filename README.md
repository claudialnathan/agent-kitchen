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

Each skill is named for the situation it serves, so the menu can be read without
reading any description. An artifact gets built, tested against real prompts,
improved as evidence arrives, and eventually deleted; `harness-audit` checks the
standing cost and assembled behavior of whatever is installed at any point.

```
   ┌──── leaner harness → sessions ────────────────┐
   ▼                                               │
┌───────────────┐   ┌───────────────┐              │
│ ingest        │   │ new-skill     │              │
│ where does    │──▶│ build it, or  │              │
│ this belong?  │   │ pick another  │              │
└───────────────┘   │ surface       │              │
                    └───────┬───────┘              │
                            ▼                      │
                    ┌───────────────┐              │
                    │ grill-skill   │              │
        ┌──────────▶│ run it on a   │              │
        │           │ real prompt   │              │
        │           └───────┬───────┘              │
        │                   ▼                      │
        │           ┌───────────────┐              │
        └───────────│ improve-skill │              │
                    │ fix it, feed  │              │
                    │ it, or delete │              │
                    └───────┬───────┘              │
                            ▼                      │
                    ┌───────────────┐              │
                    │ harness-audit │              │
                    │ measure &     │──────────────┘
                    │ prune         │
                    └───────────────┘
```

| Surface                 | Role                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new-skill`             | "Make a skill about X, here's my reading." Sets the gradeable objective first, then runs the one triage ladder that routes a behavior to the right surface (skill, hook, permission rule, path-scoped rule, `CLAUDE.md`/`AGENTS.md`, subagent, MCP, workflow) and builds whichever it lands on. Grades the artifact by the work it makes the agent produce rather than by its own shape. |
| `improve-skill`         | "This isn't working" or "work this material in." Diagnoses before editing and repairs at the located layer, so a wording patch never covers for a wrong surface. Mines session transcripts for the corrections that show a failure the owner can't pin to a moment. Deleting a converged artifact is one of its outcomes.                                |
| `grill-skill`           | "Use this skill, here's my prompt, let's iterate." Produces the real output, takes the reaction as evidence about the artifact rather than about the output, and requires a named class of requests before any change is applied.                                                                                                                        |
| `ingest`                | Places owner-supplied sources into the existing harness (or concludes nothing is warranted), reading spec material whole and grounding supplementary evidence in verbatim quotes.                                                                                                                                                                       |
| `harness-audit`         | Inventories everything loaded at session start, counts the per-session token cost, checks setup consistency and scope, and after substantial changes traces a representative job through the complete installed harness.                                                                                                                              |
| `state.md` + `hacks.md` | Verified snapshot of Claude Code's surfaces and lesser-known features, re-checked against the live changelog on each release.                                                                                                                                                                                                                            |
| `models.md`             | Task-routed model, harness, benchmark, and cost guide for choosing and re-testing the agents that build these artifacts; refreshed with the project-local `/model-bump` skill.                                                                                                                                                                            |
| `changelog.md`          | Provenance ledger: why each artifact exists, what it was re-tested against, and the keep/revise/delete verdicts. The artifacts carry none of it themselves.                                                                                                                                                                                              |

─────────────────────

`INSTALL`

### Claude Code

The Claude plugins are served through the `claudia` marketplace, whose catalog is hosted in this repo:

```bash
/plugin marketplace add claudialnathan/agent-kitchen
/plugin install agent-kitchen@claudia   # new-skill, improve-skill, grill-skill, ingest, harness-audit
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
