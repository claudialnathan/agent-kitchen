# Anti-patterns: bad CLAUDE.md content

Each pattern here has a name, an example of how it usually appears, the failure mode it produces, and the surface it should have used. The five highlighted in SKILL.md are the most common; the rest catch corner cases.

---

## 1. The hook-shaped rule

**Looks like:**
```
- ALWAYS run lint before committing.
- NEVER edit `.env` files.
- Always run typecheck after refactors.
```

**Failure mode:** the model is being asked to enforce a hard constraint, but CLAUDE.md is interpreted, not enforced. Sometimes Claude follows it; sometimes it doesn't. Worse, when it doesn't, there's no signal — the work proceeds, the constraint silently broken.

**Should be:** a hook. `PreToolUse` to block, `PostToolUse` to verify. The hook runs deterministically; the model's interpretation doesn't matter.

CLAUDE.md *can* describe the hook for visibility ("This project has a pre-commit hook that runs lint and typecheck. If it blocks, the lint output is in stderr.") — but the rule itself lives in `.claude/settings.json`. Defer to hook-forge.

---

## 2. The MCP-shaped instruction

**Looks like:**
```
- Query the analytics database for user counts before answering data questions.
- Check Sentry for recent errors when debugging.
- Look up the issue in Linear before starting work.
```

**Failure mode:** if the database / Sentry / Linear isn't connected via MCP, the rule is fiction. Claude can't reach the system and either fakes it or stalls. Even when it *is* connected, CLAUDE.md is the wrong place to teach Claude how to query — that's per-system domain knowledge that wants to live in a skill.

**Should be:** the MCP server connected first; optionally a skill that teaches Claude how to use the connection well (schema, common joins, naming conventions). CLAUDE.md gets a one-line pointer to the skill if it's broadly relevant.

---

## 3. The restated-obvious info

**Looks like:**
```
- This is a TypeScript project.
- The frontend is React.
- We use Tailwind for styling.
- The package manager is pnpm. (in a repo where pnpm-lock.yaml exists)
```

**Failure mode:** every line is a recurring token cost, and Claude already infers all of this from `package.json`, file extensions, and lockfiles in the first read.

**Should be:** cut. CLAUDE.md is for things Claude can't guess. The pnpm one is borderline — *which* package manager you use is sometimes worth restating because Claude defaults to npm when the tooling is mixed; that's the kind of judgment call where a Why earns the line ("Use pnpm. **Why:** mixed npm/pnpm in our other repos has caused lockfile drift; the pnpm-lock.yaml is authoritative here.").

---

## 4. The missing-Why on edge-case rules

**Looks like:**
```
- Use cursor pagination, not offset.
- Don't use server actions for form submission.
- Tests must run sequentially.
- Don't use `revalidateTag` from Server Components.
```

**Failure mode:** the rule is correct but doesn't survive edge cases. When an unusual case arises — a one-off offset query because cursor doesn't fit, a server action for a non-form submit — the model has nothing to anchor on and either applies the rule rigidly when it shouldn't, or breaks it without realizing the reason still holds.

**Should be:** the rule plus its reason. Anthropic's May 2026 *Teaching Claude Why* finding showed reasoning + rule beats rule alone (in their training case, by ~7×). The principle generalizes; the harness's auto-memory format already requires Why for `feedback` and `project` entries.

```
- Use cursor pagination, not offset. **Why:** offset pagination becomes pathological at scale (we hit a 4-second query at 100K rows). **How to apply:** all listing endpoints. For one-off scripts where dataset is small and offset is convenient, that's fine.
```

---

## 5. The path-narrow rule

**Looks like:**
```
- API endpoints under `src/api/` follow this error format: `{error: {code, message, details}}`.
- Components in `packages/ui/` use Atomic Design (atoms / molecules / organisms).
- Migrations in `supabase/migrations/` are append-only.
```

**Failure mode:** every line burns context for everyone editing UI code, even though the rule only applies to API code. With three or four such rules, half of CLAUDE.md is irrelevant to half the work.

**Should be:** `.claude/rules/<name>.md` with a `paths:` glob. The rule auto-loads only when matching files are open. Defer to rule-forge for the actual design.

```
.claude/rules/api.md:
---
paths: ["src/api/**/*.ts", "tests/api/**/*.ts"]
---
# API conventions
- Error format: `{error: {code, message, details}}`. ...
```

---

## 6. The skill-shaped procedure

**Looks like:**
```
## Deploy procedure
1. Run `pnpm test`
2. Run `pnpm build`
3. Bump version with `pnpm version patch`
4. Push tag with `git push --follow-tags`
5. Run `pnpm deploy:prod`
6. Verify with `curl https://api.example.com/health`
7. ...
```

**Failure mode:** every line of the procedure is in context every turn, even when not deploying. CLAUDE.md is meant for facts, not workflows.

**Should be:** a skill with `disable-model-invocation: true` (you trigger it explicitly). Defer to skill-forge. CLAUDE.md gets a one-liner: "Deploy procedure: see `/deploy` skill."

---

## 7. The auto-memory-duplicate

**Looks like:** CLAUDE.md repeats facts that are already in `~/.claude/projects/<project>/memory/MEMORY.md`. For instance, the user has corrected Claude three times on a preference; auto-memory has captured it; then the user adds it to CLAUDE.md too.

**Failure mode:** redundant context, and worse, divergent context. When the user updates one and not the other, the model has to reconcile.

**Should be:** one source of truth. If the rule is broadly applicable to the team, promote to CLAUDE.md and remove from auto-memory. If it's per-user, leave in auto-memory. Don't keep it in both.

---

## 8. The personal preference in team CLAUDE.md

**Looks like:**
```
- I prefer succinct explanations.
- Don't summarize at the end of responses.
- Use the `bun` command instead of `node`. (when only this user has bun installed)
```

**Failure mode:** the project's CLAUDE.md is committed; everyone gets it. Personal preferences shouldn't be team-shared.

**Should be:** `~/.claude/CLAUDE.md` (personal across-projects), `CLAUDE.local.md` (personal in this project, gitignored), or auto-memory's per-user feedback.

---

## 9. The Karpathy-anti-default boilerplate

**Looks like:** a CLAUDE.md that opens with five lines lifted verbatim from a 2026 social-media post or template — "push back on assumptions", "surface tradeoffs", "no premature abstraction" — without tailoring to the project.

**Failure mode:** the content is *good*, but generic boilerplate doesn't earn its tokens. The model treats it as background noise. The same five lines in 30 different CLAUDE.md files become invisible.

**Should be:** when a project genuinely has these issues — i.e., the user has corrected Claude on these defaults specifically in this codebase — encode them with concrete examples ("don't refactor adjacent code in a bug fix; the last time we did, we had to revert because of a hidden coupling in `pricing.ts`"). Concrete and project-specific earns the tokens; abstract doesn't.

---

## 10. The historical note

**Looks like:**
```
- We used to use Redux but migrated to Zustand in March.
- Authentication was previously handled by Auth0; we now use Supabase auth.
- The old API at `/api/v1/` is deprecated; use `/v2/`.
```

**Failure mode:** historical context is useful for humans onboarding; it's noise for Claude, who only cares about the current state.

**Should be:** if `/v1` is *still in the code*, it's a current-state fact ("the codebase still has `/v1/` endpoints; don't add new ones, route new work to `/v2/`"). If it's truly historical and gone, cut it. If you want it documented for humans, use a HTML comment (`<!-- We migrated from Redux to Zustand in March 2026 -->`) — block-level HTML comments are stripped before context injection, so they cost zero tokens.

---

## 11. The TODO-never-completed

**Looks like:**
```
- TODO: document the deploy procedure
- TODO: add testing patterns
- TODO: explain the auth flow
```

**Failure mode:** the model can't do anything useful with a TODO; it's promising future content. CLAUDE.md isn't a Trello board.

**Should be:** either complete the entry, or cut it. If the work is genuinely planned, track it elsewhere (issue tracker, project doc).

---

## 12. The verbose explanation

**Looks like:**
```
The authentication system uses JWT tokens. JWT (JSON Web Tokens) are an open standard
(RFC 7519) that defines a compact, self-contained way for securely transmitting
information between parties as a JSON object. In our implementation, we use the HS256
algorithm with a 32-byte secret stored in `AUTH_SECRET`. Tokens have a 15-minute TTL
and are refreshed via the refresh token endpoint at `/auth/refresh`...
```

**Failure mode:** every word is a recurring cost. Most of this is generic JWT background that Claude already knows.

**Should be:** what's project-specific, in one or two lines.

```
- Auth: JWT (HS256, 15-min TTL), `AUTH_SECRET` env var, refresh at `/auth/refresh`.
```

---

## 13. The contradiction

**Looks like:** two CLAUDE.md files (root + nested) or a CLAUDE.md plus a `.claude/rules/` rule that say different things about the same topic.

**Failure mode:** Claude picks one arbitrarily, sometimes the wrong one for the context.

**Should be:** consolidate. The audit job's job is finding these.

---

## 14. The setting-disguised-as-instruction

**Looks like:**
```
- Don't read `.git/`.
- Don't write to `node_modules/`.
- Block the `bash rm -rf` command.
```

**Failure mode:** these are settings rules, not behavioral guidance. Claude *can* still issue these commands; CLAUDE.md just hopes it won't.

**Should be:** `permissions.deny` in settings. The harness blocks the call deterministically; nothing reaches the model's interpretation step.

---

## 15. The noise-phrasing rule

**Looks like:**
```
- Always think hard before writing code.
- Be careful with refactors.
- Really focus on the test coverage.
- Act like a senior engineer.
- Take your time.
```

**Failure mode:** identity prompts and adverb-laden imperatives don't translate to behavior. Osmani's May 2026 study found compliance with these around 30% — they read as filler. The model already thinks it's senior; the gap is between thinking and doing, and "be careful" doesn't close that gap.

**Should be:** concrete imperatives that name the action, testable enough that you could check whether the agent followed them.

```
- Don't refactor what isn't broken; touch only what the task requires.
- Every test must encode the *why* of the behavior, not just that the function returned something.
- State assumptions explicitly; ask before guessing.
- Stop when confused; name what's unclear.
```

The rule passes when you could write a checklist item that catches a violation. "Senior engineer" isn't a checklist item; "state assumptions explicitly" is.

---

## Quick reference: pattern → surface

| Pattern | Should be |
| :--- | :--- |
| ALWAYS / NEVER | Hook |
| Query DB / external service | MCP + skill |
| Already obvious from code | Cut |
| Edge-case rule without why | Add Why or move to rule with examples |
| Path-narrow rule | Path-scoped rule |
| Multi-step procedure | Skill |
| Duplicates auto-memory | One source of truth |
| Personal preference | `~/.claude/CLAUDE.md` / auto-memory |
| Generic boilerplate | Cut or tailor |
| Historical | HTML comment or cut |
| TODO | Complete or cut |
| Verbose | Compress |
| Contradicts another CLAUDE.md or rule | Consolidate |
| Setting in disguise | `permissions.deny` |
| Identity prompt / adverb noise | Concrete imperative |
