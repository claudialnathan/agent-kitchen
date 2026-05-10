# Baseline / modern-CSS bake-in for shadcn 4.x + Tailwind v4 + Next.js + Vercel

**Dated**: 2026-05-09. Browser-support shifts every six months — refresh by 2026-11.

A copyable starter pack for `globals.css`. Drop into the base of any project on this stack. Triage based on what actually composes with the existing primitives, not what's "new and cool."

## Layout of a typical `globals.css` after these additions

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

/* Animatable @property declarations (must come before @theme uses them) */
@property --gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
/* Add more @property entries as you actually animate them */

@theme inline {
  /* shadcn token mappings — color/radius/etc., per shadcn 4.x docs */
}

/* View Transitions opt-in */
@view-transition {
  navigation: auto;
}

@layer base {
  :root {
    /* browser support only 65% */
    interpolate-size: allow-keywords;

    /* Token-aware scrollbars, no layout shift on overflow */
    scrollbar-gutter: stable;
    scrollbar-color: var(--color-muted-foreground) transparent;

    /* Type / a11y reflexes */
    /* v4 also exposes `scheme-light-dark`/`scheme-*` utilities; we set once globally */
    color-scheme: light dark;
    /* v4 also exposes `accent-*` utilities; this is the global default */
    accent-color: var(--color-primary);
  }

  /* v4 also exposes `antialiased`/`subpixel-antialiased`; we apply once on <html> */
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Headings balance, body pretty — set once at the type layer.
     v4 also exposes `text-balance` / `text-pretty` utilities. */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    text-wrap: balance;
  }
  p,
  li,
  blockquote {
    text-wrap: pretty;
  }

  /* Anchored sections clear sticky headers.
     v4 also exposes `scroll-mt-*` utilities for one-off overrides. */
  [id] {
    scroll-margin-top: 4rem;
  }

  /* iOS zoom-prevention on form fields */
  input,
  select,
  textarea {
    font-size: max(16px, 1rem);
  }

  /* Universal focus-visible ring — currentColor adapts to dark mode */
  :focus-visible {
    outline: max(2px, 0.08em) solid currentColor;
    outline-offset: 0.15em;
  }

  /* View Transitions defaults + reduced-motion guard */
  ::view-transition-group(*) {
    animation-duration: 200ms;
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }

  /* <details> animated open/close — pairs with interpolate-size.
     v4 also exposes `transition-discrete` / `transition-normal` utilities;
     we set raw on the base element so it works without classes. */
  details::details-content {
    block-size: 0;
    overflow-y: clip;
    transition:
      block-size 200ms,
      content-visibility 200ms allow-discrete;
    transition-behavior: allow-discrete;
  }
  details[open]::details-content {
    block-size: auto;
  }

  /* Image outlines (10% pure black/white, never tinted) */
  img {
    outline: 1px solid rgb(0 0 0 / 0.1);
    outline-offset: -1px;
  }
  .dark img {
    outline-color: rgb(255 255 255 / 0.1);
  }
}

/* Optional. Tailwind v4 ships `field-sizing-content` directly; this only
   earns its keep when you want the min-height bundled with the resize. */
@utility field-auto {
  field-sizing: content;
  min-height: var(--input-min-height, 2.25rem);
}

/* Optional: thin scrollbar utility for opt-in regions */
@utility scrollbar-thin {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-muted-foreground);
    border-radius: 9999px;
  }
}
```

## Triage table — bake / utility / skip

Top recommendations ranked by impact-per-line. Cited browser-support is honest; some are full Baseline, some are progressive enhancement (your stack tolerates it — fall back is graceful).

| Feature                                                                                | Verdict                   | Status (May 2026)                                                   | Why                                                                                                                                                                                         |
| :------------------------------------------------------------------------------------- | :------------------------ | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `interpolate-size: allow-keywords`                                                     | **Bake**                  | Progressive enhancement (Chrome stable; Safari/Firefox catching up) | Single declaration unlocks `transition: height` against `auto` / `min-content`. Removes the #1 reason to reach for JS to animate height.                                                    |
| `@view-transition` + `::view-transition-*`                                             | **Bake**                  | Same-document Baseline; cross-document landing                      | Smooth `<Link>` navigations once `experimental.viewTransition: true` is set in `next.config.js`.                                                                                            |
| `@property` for animatable theme tokens                                                | **Bake**                  | Baseline newly available                                            | Without it, `transition: --gradient-angle` silently does nothing. Animated borders/conic spinners/shadow pulses driven by class toggles, no JS.                                             |
| `scrollbar-gutter: stable` + `scrollbar-color`                                         | **Bake**                  | Baseline                                                            | Kills the 1px reflow when modal-open toggles `overflow: hidden`; ties scrollbars to the shadcn token system in both themes.                                                                 |
| `<details>::details-content` animated open/close                                       | **Bake**                  | Progressive enhancement                                             | Pairs with `interpolate-size`. Free animated FAQ accordions / disclosure widgets without Base UI Disclosure / zero JS on marketing pages.                                                   |
| `field-sizing: content`                                                                | **Use v4's `field-sizing-content`** | Progressive enhancement (Chrome stable)                             | Tailwind v4 already ships `field-sizing-content` / `field-sizing-fixed`. Don't reinvent — use the utility per textarea. The custom `@utility field-auto` below only earns its keep if you want the `min-height` bundled in. |
| `text-wrap: balance` / `text-wrap: pretty`                                             | **Bake (already)**        | Baseline                                                            | Set at the type layer once. Eliminates one-word last lines on headings; orphans on body.                                                                                                    |
| Subgrid (`grid-template-columns: subgrid`)                                             | **Reach for it**          | Baseline widely available (March 2026)                              | Use when card content (image/title/CTA) must align across siblings. See `design-engineer/references/layout.md`.                                                                             |
| Container queries (`@container`, `cqi`)                                                | **Reach for it**          | Baseline                                                            | Already in Tailwind v4 core (`@container`, `@xs:`/`@md:` variants). Component-scoped responsive — the right answer when you'd otherwise reach for a viewport breakpoint inside a component. |
| New color spaces (`oklch`, `color-mix`, relative color syntax)                         | **Bake (already)**        | Baseline                                                            | shadcn 4.x uses `oklch()` tokens by default. `color-mix()` is the cleanest hover-state strategy (avoids parallel hover-state tokens).                                                       |
| Anchor positioning (`anchor-name`, `position-try`)                                     | **Skip (in this stack)**  | Baseline newly available                                            | Base UI uses Floating UI internally. Adding `position-try` rules globally fights primitive-level positioning. Reach for it only outside Base UI primitives.                                 |
| Native Popover API + `popover` attribute + invoker commands (`command` / `commandfor`) | **Skip (in this stack)**  | Baseline newly available                                            | Base UI's Popover/Menu/Dialog have better focus-trap and a11y wiring. Use the native attribute only inside Base UI components if needed.                                                    |
| `@scope`                                                                               | **Skip**                  | Baseline newly available (Dec 2025)                                 | Tailwind utility scoping + shadcn slot composition already solve the cascade problem. Mostly value for CMS-injected HTML you can't classname-control.                                       |
| `scrollend` event                                                                      | **Skip (in CSS)**         | Baseline newly available (Dec 2025)                                 | JS feature, not CSS. Reach for it in components if you need it. Doesn't belong in `globals.css`.                                                                                            |
| Niche typography units (`rcap`, `rch`, `ric`)                                          | **Skip (in product UI)**  | Baseline newly available (Jan 2026)                                 | Useful in editor / typography stacks; for shadcn product UI, `rem`/`ch` cover it. Revisit if you ship long-form reading surfaces.                                                           |
| `shape()` function                                                                     | **Skip**                  | Baseline newly available (Feb 2026)                                 | `clip-path: polygon()` covers 95% of cases.                                                                                                                                                 |
| `font-family: math`                                                                    | **Skip**                  | Baseline newly available (Dec 2025)                                 | Narrow use case.                                                                                                                                                                            |
| `text-indent: each-line` / `hanging`                                                   | **Skip (until prose)**    | Baseline newly available (Mar 2026)                                 | Long-form prose only. Add to a `prose` utility when you ship a blog.                                                                                                                        |
| Scroll-driven animations (`animation-timeline: view()`)                                | **`@utility` per use**    | Progressive enhancement                                             | High-impact but always opt-in per element. Ship one or two `@utility`s (`scroll-fade-in`, `view-reveal`) when needed; don't bake globally.                                                  |
| `contain-intrinsic-size` + `content-visibility: auto`                                  | **Reach for it**          | Baseline widely available (March 2026)                              | Long-list virtualization-lite. Pair them when you build a long marketing page or feed. Not for `globals.css`.                                                                               |

## Behavior notes — what each bake-item actually does

Pitch + visible effect + fallback for each of the five `globals.css` adds, plus the one `@utility`.

### `interpolate-size: allow-keywords`

**What it does**: tells CSS to compute intermediate values when transitioning between a fixed size and a keyword (`auto`, `min-content`, `max-content`, `fit-content`). Without this declaration, browsers can't interpolate to a keyword — they just snap.

**What you'll notice**: collapsible sections, accordions, expandable details, and any "grow to fit content" element now animate smoothly. `transition: height 200ms` from `0` → `auto` actually tweens.

**Without it**: instant snap on toggle. The motion you wrote does nothing.

### `@view-transition` + `::view-transition-group(*)`

**What it does**: opts the document into the View Transitions API. Browser snapshots the outgoing DOM, snapshots the incoming DOM after navigation, and runs a CSS transition between the two snapshots.

**What you'll notice**: `<Link>` clicks in the App Router feel like SPA route changes — old page fades out, new page fades in over 200ms. Across-document VT means even hard navigations between sub-apps benefit.

**Without it**: hard flash to the new page. Same behavior as a plain MPA in 2010.

**Required**: also set `experimental.viewTransition: true` in `next.config.js` for Next.js to wire the transition into navigation events.

### `@property`

**What it does**: registers a CSS custom property with a typed syntax declaration. With a registered type, the browser knows how to _interpolate_ between two values of that property — angles, percentages, colors, lengths.

**What you'll notice**: `transition: --gradient-angle 4s linear` actually rotates the gradient. Animated conic-gradient spinners, hue-shifting borders, pulsing box-shadow opacities all become reachable via class toggles.

**Without it**: custom-property transitions are silently no-ops. The property snaps to the new value on the next frame.

**Note**: only declare `@property` for custom properties you'll _actually animate_. Static tokens don't need it; over-declaring inflates the cascade with no benefit.

### `scrollbar-gutter: stable` + `scrollbar-color`

**What `scrollbar-gutter: stable` does**: reserves the scrollbar's gutter whether or not a scrollbar is currently shown. The page width stays constant when overflow toggles.

**What you'll notice**: opening a modal that flips `overflow: hidden` on `<body>` no longer shifts the page by ~15px. Long content arriving via SSR no longer reflows the columns.

**Without it**: 1px (or browser-thicker) page jumps when scroll appears or disappears.

**What `scrollbar-color` does**: themes the scrollbar's thumb and track via design tokens.

**What you'll notice**: dark-mode scrollbars match your `--color-muted-foreground` instead of staying OS-default white slugs.

**Without it**: OS-themed scrollbars (white in light mode, gray in dark mode), not your brand.

### `<details>::details-content` animation

**What it does**: animates the auto-generated content area inside a native `<details>` element when `[open]` toggles. `transition-behavior: allow-discrete` plus the `interpolate-size` rule above lets the height tween smoothly.

**What you'll notice**: native `<details>` accordions on FAQ / disclosure / "show more" widgets expand and collapse smoothly. Zero JS, zero Base UI dependency.

**Without it**: instant snap. The default `<details>` animation is disabled.

**Pairing**: requires the `interpolate-size: allow-keywords` rule to interpolate to/from `auto`. Don't add this without that.

### `field-sizing: content` (and the optional `@utility field-auto`)

**What it does**: makes a form control (`<textarea>`, `<input>`) size itself to fit its current content. The element grows as the user types.

**What you'll notice**: chat-style "type to grow" textareas without a resize-observer hook. Also gives single-line `<input>`s automatic width-fit, useful for inline-editing patterns.

**Without it**: fixed height — content overflows or scrolls inside the control.

**How to apply**: Tailwind v4 already ships `field-sizing-content` and `field-sizing-fixed` utilities. Reach for those first — `<Textarea className="field-sizing-content min-h-9" />` is the lowest-friction path.

**Why an optional `@utility field-auto`**: it bundles `field-sizing: content` with a token-driven `min-height` so a single class does both. Worth it only if you find yourself co-applying the two repeatedly. Otherwise, drop the custom utility and use v4's directly.

**Why not bake globally**: shadcn `Input` and `Textarea` ship with deliberate min-heights and field-sizing assumptions. Applying globally breaks those defaults; opt in per textarea.

## Easing tokens — why custom curves

Stock CSS easings (`ease`, `ease-in-out`) feel weak; they were tuned conservatively for backwards compatibility with 1990s motion sensibilities and never updated. Custom curves give you the punch that makes UI animation feel intentional.

**Override semantics**. Tailwind v4 already ships `--ease-in`, `--ease-out`, `--ease-in-out` defaults — and the `ease-in` / `ease-out` / `ease-in-out` utility classes resolve to whatever those tokens point at. Defining the same names in your `@theme` block **overrides** v4's defaults rather than adding new tokens, so the utility classes automatically pick up the stronger curves. `--ease-drawer` and `--ease-spring` are net-new (no v4 default to overlap).

**Bare `transition` is a separate token**. Tailwind v4 routes the unmodified `transition` utility through `--default-transition-timing-function` and `--default-transition-duration` — distinct from `--ease-out`. If you don't override those too, `<button class="transition">` keeps Tailwind's stock 150ms / weak ease-in-out. The token block below points both at the strong defaults so bare `transition` inherits the philosophy.

| Token                            | Curve                                | When to reach for it                                                                                                                       |
| :------------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `--ease-out`                     | `cubic-bezier(0.23, 1, 0.32, 1)`     | Default for UI. Things entering, exiting, anything transient. Strong deceleration → user sees instant motion.                              |
| `--ease-in-out`                  | `cubic-bezier(0.77, 0, 0.175, 1)`    | Moving between two on-screen states (toggle, switch, position change). Strong acceleration in, strong deceleration out — feels deliberate. |
| `--ease-drawer`                  | `cubic-bezier(0.32, 0.72, 0, 1)`     | iOS-like sheet/drawer feel. Slight overshoot at the start, settles smoothly. Use for vertical sheets, drawers, modals on touch surfaces.   |
| `--ease-spring` (when supported) | `linear()` approximation of a spring | Decorative motion that should feel elastic. Conditional behind `@supports` — falls back gracefully on browsers without `linear()`.         |

**Hard rule from `emil-design-eng`**: never `ease-in` for UI animation. It starts slow, exactly when the user is watching most closely, and reads as sluggish. A 200ms `ease-in` _feels_ slower than a 200ms `ease-out` doing the same animation.

**Don't hand-write `linear()` strings**. Use Jake Archibald's spring-easing tool or Easing Wizard to generate them; copy-paste. Hand-tuning is a tarpit.

## Hooks for animation, scoped (optional)

If you find yourself reaching for these often, ship as `@utility` so they compose with Tailwind:

```css
@utility scroll-fade-in {
  animation: scroll-fade-in linear both;
  animation-timeline: view();
  animation-range: entry 25% cover 50%;
}
@keyframes scroll-fade-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@utility view-reveal {
  animation: view-reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 60%;
}
@keyframes view-reveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**What `animation-timeline: view()` does**: maps animation progress to _the element's position relative to the viewport_ instead of to wall-clock time. The element animates as it enters/leaves the viewport.

**What `animation-range` does**: defines which slice of the entry/exit corresponds to animation 0%–100%. `entry 25% cover 50%` means: animation starts when the element is 25% into entering the viewport, finishes when it's 50% covered.

**What you'll notice**: section headlines fade up as you scroll past them; hero images reveal without IntersectionObserver hooks. Pure CSS; no JS, no React state.

**Without these utilities**: you'd reach for `IntersectionObserver` + `useInView` + class-toggle JS — three layers to do what `animation-timeline` does in one rule.

**Counter-intuitive gotcha** (from Comeau): springs on scroll-driven timelines are cursed. The spring oscillates as users scroll back and forth. Stick to `linear` timing for scroll-driven animation; reach for springs only on time-driven motion.

**Reduced-motion guard**: these inherit the body-level `@media (prefers-reduced-motion: reduce)` if your durations live in tokens; otherwise add a per-utility guard with `animation: none`.

## Easing tokens (reach for these instead of stock `ease-in-out`)

```css
@theme {
  /* Overrides Tailwind v4 defaults; `ease-out`/`ease-in-out` classes resolve to these. */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* strong ease-out — UI default */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* strong ease-in-out — moves between states */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1); /* iOS-like — drawers, sheets */

  /* Net-new tokens (Tailwind v4 has no `--duration-*` defaults). */
  --duration-fast: 180ms;
  --duration-medium: 240ms;
  --duration-slow: 320ms;

  /* Re-route bare `transition` utility through the strong defaults too. */
  --default-transition-timing-function: var(--ease-out);
  --default-transition-duration: var(--duration-fast);
}

@supports (animation-timing-function: linear(0, 1)) {
  @theme {
    --ease-spring: linear(0, 0.013 0.6%, 0.05 1.2%, 0.971 47.2%, 1.012 59.1%, 0.995 70.8%, 1);
  }
}

@media (prefers-reduced-motion: reduce) {
  @theme {
    --duration-fast: 0.01ms;
    --duration-medium: 0.01ms;
    --duration-slow: 0.01ms;
  }
}
```

Components consume tokens, never literals: `transition-transform duration-(--duration-fast) ease-(--ease-out)`.

Generators (don't hand-write `linear()`): Jake Archibald's spring tool, Easing Wizard.

## What's already in the stack — don't reinvent

**From shadcn 4.x:**

- `oklch()` colors — shadcn ships these by default in `:root` and `.dark`.
- `@theme inline { --color-foo: var(--foo) }` mapping pattern — shadcn's canonical theming.
- `@custom-variant dark (&:is(.dark *))` — shadcn's class-based dark mode.
- `tw-animate-css` — shipped via the canonical base import; gives you `animate-in`, `animate-out`, `fade-in-0`, `zoom-in-95`, etc.

**From Tailwind v4 core (utility classes — reach for these in JSX rather than re-implementing):**

- Container queries (`@container`, `@xs:`/`@md:` variants, `--container-3xs` … `--container-7xl`).
- `:has()` / `:is()` / `:where()` variants (`has-*`, `group-has-*`, etc.).
- `text-balance` / `text-pretty`.
- `field-sizing-content` / `field-sizing-fixed`.
- `scheme-light-dark` / `scheme-light` / `scheme-dark` / `scheme-only-*`.
- `antialiased` / `subpixel-antialiased`.
- `accent-*` / `caret-*` (read from theme colors).
- `scroll-mt-*` / `scroll-m*` / `scroll-mx-*` / etc.
- `transition-discrete` / `transition-normal`.
- `starting:` variant (CSS `@starting-style`).
- `ease-linear` / `ease-in` / `ease-out` / `ease-in-out` (resolve to your `@theme` overrides).
- `duration-*` (numeric or `duration-(--duration-fast)` for theme tokens).

The bake-in re-applies several of these at the base layer (`text-wrap`, `color-scheme`, `antialiased`, `scroll-margin-top`, `accent-color`) so they work without classes — that's deliberate. But in components, prefer the utility.

## Refresh discipline

Baseline status moves every six months. Re-triage by **2026-11**. Specifically watch:

- `interpolate-size` and `<details>::details-content` — likely full Baseline by then, can drop "progressive enhancement" caveat.
- Cross-document View Transitions — likely Baseline newly-available; bigger MPA stories then.
- Anchor positioning — Floating UI may add native fallback support, changing the skip → maybe-bake calculation.
- `field-sizing` — likely Baseline; consider promoting from `@utility` to base.

## Sources

- web.dev Baseline digest series (`web.dev/blog/baseline-digest-*`).
- Tailwind v4 docs: `tailwindcss.com/docs` — `@theme`, `@utility`, `@custom-variant`, `--container-*`.
- shadcn docs: `ui.shadcn.com/docs` — installation/manual setup, registry items.
- Base UI docs: `base-ui.com/react/handbook/animation` — `[data-starting-style]`, `[data-ending-style]`, `--transform-origin`, `--popup-*`, `--available-*`.
- Motion docs: `motion.dev/docs/base-ui` — Base UI integration, AnimatePresence + `keepMounted`.
- Josh Comeau on `linear()`, scroll-driven, squash-and-stretch, subgrid.

## Tying back to `design-engineer`

This guide is the _additive_ layer for the stack — what to put in `globals.css` once. The `design-engineer` skill is the _standing-instruction_ layer — what to reach for while writing components. Use the skill to author UI; use this guide to set up a new project's base.
