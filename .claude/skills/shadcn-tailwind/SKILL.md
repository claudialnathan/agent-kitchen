---
name: shadcn-tailwind
description: Stack-wide UI discipline for shadcn (4.x on Base UI) + Tailwind v4 projects. Encodes the recurring drift modes (raw colors instead of semantic tokens, arbitrary spacing values, `asChild` from Radix-era code, `dark:` backfills, undeclared font weights) and the discovery pattern (read `globals.css` for project-specific `@theme` tokens before writing classNames). Auto-loads when editing UI files; complements `figma-to-tailwind-tokens` which covers the deep design-translation workflow.
when_to_use: |
  Auto-loads on UI files via `paths`. Also trigger on:
  - "review my UI"
  - "audit my tailwind"
  - "check shadcn"
  - "use shadcn best practices"
  - "is this on Base UI or Radix"
  - "tailwind v4 conventions"
  - "why isn't font-medium working"
  - "should this be a token"
  - "asChild vs render"
paths:
  - "**/*.{tsx,jsx,mdx}"
  - "**/globals.css"
  - "**/app.css"
  - "**/tailwind.css"
  - "**/components.json"
  - "**/components/**/*.{ts,tsx}"
---

# shadcn (latest) + Tailwind v4 discipline

You're working on UI in a project that likely uses the modern shadcn + Tailwind stack: shadcn 4.x components on Base UI, Tailwind v4 with `@theme` tokens declared in CSS. This rule encodes the recurring failure modes on this stack and the discipline that prevents them. Follow it while writing UI; don't wait to be reminded.

## Read the project's tokens first

The design system lives in an `@theme` block inside `globals.css` (sometimes `app.css` or `tailwind.css`). It declares CSS variables that Tailwind exposes as utility classes. **Open it once at the start of UI work in a project, before writing classNames.** The list of tokens varies per project; the file is the source of truth.

What to look for:
- **Custom font-weight scale** under `--font-weight-*`. Projects often use non-standard numeric values (e.g. 350/450/550/650 instead of 300/400/500/700), and may or may not declare `--font-weight-medium`. **Don't assume** `font-medium` exists — verify.
- **Semantic colors beyond shadcn defaults**: things like `--color-link`, `--color-foreground-subtle`, `--color-main-background`, role-specific status colors. These all become `bg-link`, `text-foreground-subtle`, etc.
- **Custom text sizes** like `--text-caption` (with paired `--text-caption--line-height`) → `text-caption`.
- **Custom radii** beyond the shadcn `xs/sm/md/lg/xl` defaults — projects sometimes go up to `2xl/3xl/4xl`.
- **`@theme inline`** vs plain `@theme` — `inline` uses the variable's *value* in the utility, so chained `var()` references resolve correctly. Don't change the inline-vs-not without understanding the implication.

## Default to existing tokens. Don't extend silently.

When the user gives a casual UI prompt — "make it look like X", a Figma reference, a copy-paste — assume the values they describe should map to existing tokens. **Lazy design language usually means "use what we already have."** Only add new entries to `globals.css` when the user explicitly says "new token" or "add a color", or when no existing token plausibly fits and you've checked.

If unsure whether a value matches an existing token, propose the mapping ("I think this is `text-caption` with `text-foreground-subtle`") rather than reaching for `text-[13px] text-[#6b7280]`.

## Color discipline

- **Semantic over raw.** Use shadcn's semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, `bg-accent`, `text-accent-foreground`) plus the project's custom semantic tokens. Reach for raw palettes (`bg-red-500`, `text-zinc-900`, `bg-emerald-50`) only when no semantic equivalent exists — and then propose adding one.
- **Don't pair light/dark overrides** like `bg-white dark:bg-gray-950` when a semantic token already adapts. `bg-card` and `bg-background` already swap correctly under `.dark`.
- **`dark:` variant is for genuinely-different dark values**, not for backfilling a missing semantic token. If you find yourself writing `dark:bg-X` to compensate, stop and reach for the right semantic token instead.

## Spacing and arbitrary values

Tailwind v4's spacing scale is driven by `--spacing` (default `0.25rem`). Utilities like `min-h-15`, `w-23`, `gap-6`, `px-4` resolve to `N × --spacing`. So `min-h-15 = 3.75rem`, `w-23 = 5.75rem`, `gap-6 = 1.5rem`.

**If you find yourself typing an arbitrary value like `[3.75rem]` or `[20px]`, divide by `--spacing` (default 0.25rem) and try the named utility first.** `min-h-[3.75rem]` should be `min-h-15`. The Tailwind LSP will flag this; Claude often misses it because the multiplication isn't obvious.

Arbitrary values are legitimate for: `calc()` expressions, values not on the scale, or one-off pixel-perfect designer requirements. They are **not** legitimate just because the named utility didn't come to mind first.

## shadcn 4.x is on Base UI, not Radix

Modern shadcn (4.x+) ships components built on Base UI (`@base-ui-components/react` or `@base-ui/react`), not Radix Primitives. Verify by checking `package.json` — if you see `@base-ui/react` (or similar) and `shadcn: ^4`, the project is on the Base UI stack. The most common training-data slip:

- **Use `render={<child />}`, not `asChild`.** `asChild` is the Radix pattern; Base UI uses a render prop. Components copied from Radix-era examples will type-check (because the prop name is similar) but may warn at runtime or silently misbehave.
- **Component sources live where `components.json` configures** (typically `src/components/ui/`). Import from there, not from `@base-ui/react` directly — the shadcn-installed copy is the project's customizable surface.
- **Customizing means editing `src/components/ui/<name>.tsx`**, not wrapping it. shadcn's whole model is "the code is yours."

## `data-*` attributes for state, not className

Base UI components expose state via `data-*` attributes (`data-state="open"`, `data-disabled`, `data-pending`). Style state-dependent variants with attribute selectors in className: `data-[state=open]:bg-accent`, `data-[disabled]:opacity-50`. These are also what Playwright tests should target — not `data-testid` paste-ins.

## Before considering UI work done

A short self-check, run mentally before saying "done":

- [ ] No raw color palette classes (`bg-red-500`, `text-zinc-700`) — replaced with semantic tokens or a justified extension to `globals.css`.
- [ ] Font-weight classes match what's declared in the project's `@theme` block. If using `font-medium`, verified `--font-weight-medium` exists.
- [ ] No `asChild` in components built on Base UI (use `render` prop).
- [ ] Arbitrary values (`[Nrem]`, `[Npx]`, `[#hex]`) are intentional, not first-reach. Tried the named utility first.
- [ ] No `dark:` overrides backfilling a missing semantic token.
- [ ] State variants use `data-[state=...]` selectors against Base UI's state attributes.

## When implementing from a design

This skill is the always-on baseline. When the task is specifically *"implement this design"* — Figma frame, mockup, design-token spec — invoke the `figma-to-tailwind-tokens` skill (or it'll fire automatically when you mention Figma). That skill has the deeper workflow: building the theme allowlist, property-by-property mapping, the "ask before snapping a near-miss" discipline. Treat this skill as the discipline that applies regardless; treat `figma-to-tailwind-tokens` as the procedure for design-translation tasks.

## When the stack assumptions don't hold

If the project is on Tailwind v3 (`tailwind.config.js` instead of CSS-first `@theme`) or shadcn 3.x (`@radix-ui/*` in deps, `asChild` in `src/components/ui/*`), the discipline still mostly applies but the syntax differs:
- v3: token system is in `tailwind.config.js`'s `theme.extend`, not `@theme`. Same "use the named utility" rule.
- shadcn 3.x: `asChild` is correct on Radix primitives; don't switch to `render`.

Trust what's in the project. Verify by checking `package.json` (`tailwindcss` major version, `@radix-ui` vs `@base-ui` presence) when in doubt. This skill was written for the modern stack; if neither check fits, this skill probably isn't relevant and you can disregard.

## References

- Tailwind v4 theme: https://tailwindcss.com/docs/theme
- shadcn docs: https://ui.shadcn.com/docs
- Base UI: https://base-ui.com
