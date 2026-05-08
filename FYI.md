# FYI

What to verify after install, after edits, and what's intentionally not tested. Most of this is one-off — run the **first-time install** section once, then come back to **after editing** when you change a skill.

## First-time install (Claude Code)

In any Claude Code session:

```
/plugin marketplace add /Users/claudianathan/repos/cookbooks/harness
/plugin install claudia@harness
```

Verify it took:

```
/plugin list
```

You should see `claudia@harness` (or whatever Claude Code's listing format is) marked installed. The marketplace itself should appear under `harness`.

## First-time install (Cursor + Codex)

Already done by `bin/sync-cross-tool`. Confirm with:

```bash
for tool in cursor codex; do
  for s in cache-aware-testing shadcn-tailwind; do
    printf '%-8s %s -> %s\n' "$tool" "$s" "$(readlink ~/.${tool}/skills/$s)"
  done
done
```

All four lines should resolve to a path under this repo's `skills/`.

## Smoke test: discovery from a different repo

This is the test that proves the *globalisation* worked:

1. `cd ~/repos/<some-other-repo>` (any repo that isn't this one).
2. Start Claude Code there.
3. Ask something that should trigger a meta-skill (e.g., "help me design a skill"). `skill-forge` should activate.
4. In Cursor inside that same other repo, ask something that should trigger `cache-aware-testing` (e.g., "where should I test this Server Component"). It should load.
5. In Codex (`codex` CLI), same triggers.

If a skill doesn't activate where it should, the most common causes are: not installed (Claude Code), symlink missing (Cursor/Codex), or description doesn't actually match the trigger phrase. Check `~/.cursor/skills/<name>` exists and `cat skills/<name>/SKILL.md | head -5` matches what you're saying.

## After editing a skill — propagation checklist

Channels that update **instantly**, no command:
- Cursor (this Mac) — symlink-backed
- Codex (this Mac) — symlink-backed
- Claude Code in *this* repo — `.claude/skills` symlink

Channels that need a command:
- Claude Code in *other* repos: run `/plugin marketplace update harness` from any Claude session.

Sanity check after an edit:

```bash
# This file is what Cursor and Codex will read — the same file you just edited.
# (If diff is empty, the symlink chain is intact.)
diff skills/cache-aware-testing/SKILL.md ~/.cursor/skills/cache-aware-testing/SKILL.md
diff skills/cache-aware-testing/SKILL.md ~/.codex/skills/cache-aware-testing/SKILL.md
```

## Open empirical question: working tree or HEAD?

We don't yet know whether `/plugin marketplace update harness` on a **local-path** marketplace reads:

- **(a)** the working tree (no commit needed — uncommitted edits propagate), or
- **(b)** `HEAD` (must commit first — uncommitted edits are ignored).

To find out, do this once:

1. Open `skills/cache-aware-testing/SKILL.md`. Add a marker comment after the closing `---`, e.g. `<!-- update test 1 -->`. **Don't commit.**
2. In another repo, start Claude Code. Run `/plugin marketplace update harness`.
3. Read the cached plugin file:
   ```bash
   grep -l 'update test 1' ~/.claude/plugins/marketplaces/harness/skills/cache-aware-testing/SKILL.md
   ```
4. **If it prints a path → working-tree (a). No commit needed.** If empty → `HEAD` only (b). Commit first.

Once known, write the answer here:

> **Answer**: _(record after first test)_

After that, you know the rule for the rest of time. Same goes for any other unverified Claude-Code-mechanism question — capture the answer here so you don't have to re-learn it.

## Adding a new skill end-to-end

```bash
mkdir -p skills/<new>/
$EDITOR skills/<new>/SKILL.md            # write frontmatter + body
bin/sync-cross-tool --dry-run            # preview symlink changes
bin/sync-cross-tool                      # apply
```

Then in any Claude session: `/plugin marketplace update harness` to push to other repos. Verify with the discovery smoke test above.

## Removing or renaming a skill

```bash
rm -rf skills/<old>                       # or: git mv skills/<old> skills/<new>
bin/sync-cross-tool                       # cleans orphan symlinks in ~/.cursor/skills, ~/.codex/skills
```

Then `/plugin marketplace update harness` for Claude in other repos.

## Automatable hygiene checks

Run before committing or sharing:

```bash
# Loader-trigger sequences that break skill loading. Both should print nothing.
grep -rln $'\x60\x60\x60!' skills/
grep -rln $'!\x60' skills/

# Every SKILL.md has a name + description.
for d in skills/*/; do
  md="$d/SKILL.md"
  awk '/^name:/{n=1} /^description:/{de=1} END{exit !(n && de)}' "$md" \
    || echo "MISSING required frontmatter: $md"
done

# Frontmatter size (rough — discovery budget for description + when_to_use is ~1536 chars).
for d in skills/*/; do
  md="$d/SKILL.md"
  fm_bytes=$(awk 'BEGIN{c=0} /^---$/{c++; next} c==1{print} c==2{exit}' "$md" | wc -c | tr -d ' ')
  printf '%-30s %5s bytes\n' "$(basename "$d")" "$fm_bytes"
done
```

## What's intentionally not tested

- **Cursor/Codex auto-discovery itself.** They both read `~/.<tool>/skills/<name>/SKILL.md` natively; trusting that to work the same as Claude Code (same SKILL.md format, same frontmatter conventions) is part of the design.
- **`bin/sync-cross-tool` against an existing non-symlink at the target path.** The script refuses to overwrite. If you ever see `! refusing to overwrite non-symlink`, investigate manually — there's a real skill of the same name authored elsewhere that should not be clobbered.
- **Plugin namespace collisions.** Plugin install scopes the skill name (`claudia@harness`), so this should be a non-issue.

## When to update CLAUDE.md vs FYI.md vs the skill itself

- **CLAUDE.md**: facts that apply to *every* session in this repo (layout, naming rules, repo-wide conventions).
- **FYI.md**: things you only need to know when installing, updating, or troubleshooting the publish flow. Not loaded into Claude's context. Notes-to-self.
- **The skill itself**: anything specific to that skill's workflow.

If you find yourself adding install/update notes to CLAUDE.md, redirect them here.
