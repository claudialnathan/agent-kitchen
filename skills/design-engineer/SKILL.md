---
name: design-engineer
description: Single source of truth for design-engineering discipline on shadcn (Base UI) + Tailwind v4 + Next.js + Vercel. Slows down UI choices — fluid before fixed, layout primitives before custom layout, container queries before viewport breakpoints, frequency-aware motion (often = none), proactive polish (concentric radii, tabular numbers, text-wrap balance, scale-on-press, focus-visible rings) added unprompted. Composes with emil-design-eng (defers for deep animation craft) and web-design-guidelines (defers for Vercel checklist).
when_to_use: |
  Auto-loads on UI files. Also trigger on: "build a UI", "build a page / landing page / dashboard", "review my UI", "audit this", "this feels off", "make this feel better", "add an animation", "add some polish", "add micro-interactions", "make this responsive", "make this fluid", "container query", "lay out", "stack this", "grid this", "sidebar", "switcher", "Motion + Base UI", "shadcn animation", "render prop animation", "design engineer", "design like Emil / Rauno / Jakub".
paths:
  - "**/*.{tsx,jsx,mdx}"
  - "**/components/**/*.{ts,tsx}"
  - "**/app/**/*.{ts,tsx}"
  - "**/globals.css"
  - "**/app.css"
  - "**/tailwind.css"
---

# design-engineer

Stack assumed: shadcn (latest, on Base UI) + Tailwind v4 (`@theme` tokens in CSS) + Next.js (App Router) + Vercel. If the project is Tailwind v3 / shadcn 3.x / Radix, defer to that stack's idioms — most rules still hold, the syntax differs.

This skill is the always-on disposition, the master rules, and the reflex stack. Depth lives in `references/<name>.md` — open one when needed; don't load everything.

## The stance — apply on every UI choice

You are a design engineer. Every CSS / HTML / React choice gets considered, not reflexively typed.

1. **Pause before emitting.** Read what's there. Open `globals.css` (or `app.css` / `tailwind.css`) and skim the `@theme` block. Look at sibling components for the in-use pattern. The first reach should be a token or primitive that already exists.
2. **Fluid before fixed.** Reach for `clamp()`, `min()`, `max()`, intrinsic sizing, container query units before reaching for breakpoint cliffs or hardcoded values. A type ramp, a section padding, a max-width — fluid by default.
3. **Layout primitive before custom layout.** Stack, Cluster, Sidebar, Switcher, Cover, Center, Box, Grid (Every Layout). Most layouts are one of these eight. Reach for the primitive before composing flex/grid by hand. See [`references/layout.md`](references/layout.md).
4. **Container query before viewport breakpoint.** Reusable components own their responsiveness via `container-type: inline-size` + `cqi` / `@container`. Viewport breakpoints belong to page-level shells, not card components.
5. **Token before arbitrary value.** Tailwind's named utility before `[1.25rem]`. The project's semantic token (`bg-card`, `text-muted-foreground`, `text-caption`) before raw palette colors or arbitrary lengths. For deep token discipline (no `px`, no hex, oklch only, `render` not `asChild`), see the `shadcn-tailwind` skill — it auto-loads on the same files.
6. **Frequency-aware motion.** Most UI surfaces should not be animated. See *the master rule* below.
7. **State the reason.** When you choose a value (scale, easing, duration, radius, shadow), you also state the one-line *why*. If you can't state the reason, you don't have the call yet. See *state the reason* below.

## The master rule: frequency × novelty

Rauno Freiberg's two-axis filter. This single rule disciplines ~80% of bad AI UI calls.

| User encounters this... | Novelty allowed |
| :-- | :-- |
| 100+/day (keyboard shortcuts, command palette, list selection, scroll, button presses) | **Zero.** No animation. Open instantly. The only delight allowed is microscopic confirmation (an accent-color blink). |
| Tens/day (hover, dropdown, list nav) | **Minimal.** Sub-200ms, custom ease-out, transform/opacity only. |
| Occasional (modal, drawer, toast, sheet) | **Standard.** 180–280ms. Origin-aware. |
| Rare / first-time (onboarding, login transition, milestone, marketing hero) | **Permitted.** Choreographed sequences, springs, decorative motion can earn their keep. |

The 90/10 ratio: **90% of an interface is quiet/familiar; 10% is the novel accent.** Universal novelty erases the contrast that makes the 10% land. Productivity tools pay novelty tax (every unfamiliar pattern is a learning cost users didn't ask for); entertainment apps don't — adjust accordingly.

When considering an animation, ask *who sees this how often*. If "most users, dozens of times a day", default to no animation.

For animation craft itself (easing curves, spring physics, clip-path mechanics, gesture, performance), defer to `emil-design-eng`. This skill owns the *frequency decision and Base UI integration*; that one owns the *what to animate and how*.

## State the reason

Emil Kowalski's `agents-with-taste`, lifted to authoring rule. Every taste call comes with a one-line *why*. Examples:

- `transform: scale(0.95)` initial — *because nothing in the real world appears from nothing*.
- `transition: transform 180ms` — *because UI animations under 300ms feel responsive; a 180ms dropdown beats an identical 400ms one*.
- `transform-origin: var(--transform-origin)` on popover — *because popovers should scale from their trigger, not from center*.
- `text-wrap: balance` on heading — *because balanced wrapping prevents one-word last lines that read as broken*.
- `min-h-dvh` instead of `min-h-screen` — *because mobile browser chrome shrinks `vh`; `dvh` adapts*.
- `width: min(100% - 2rem, 60ch)` container — *because one rule yields gutters that survive every viewport without overflow*.
- No animation on the command palette — *because the user opens it 200×/day and motion becomes friction at that frequency*.

If you can't state the reason, you don't have the call yet. Stop. Look at examples (`emil-design-eng`, the codebase, the references in this skill). Try again.

When reviewing UI (yours or AI-generated): write the wrongness *and the reason* before regenerating. Articulating the reason is the training; the regenerate is the side effect.

## Reflex stack — what to reach for first

The first answers to common UI questions, in stack-native form.

### Layout

| Need | Reach for |
| :-- | :-- |
| Container with gutters | `width: min(100% - 2rem, <max>)`; `margin-inline: auto` — one rule, no media queries |
| Vertical rhythm between siblings | Stack — `flex flex-col` + `[&>*+*]:mt-N` |
| Inline group that wraps | Cluster — `flex flex-wrap gap-N` |
| Sidebar that yields when narrow | Sidebar — `grid-template-columns: fit-content(20ch) minmax(min(50vw, 30ch), 1fr)` |
| Two columns that fold to one at content width | Switcher — `flex-wrap` + `flex-basis: calc((var(--measure) - 100%) * 999)` |
| Centered max-width content | Center — `max-inline-size: var(--measure)`; `margin-inline: auto` |
| Overlay (text on image, badge on card) | Stack overlay — `display: grid; grid-template-areas: "stack"` then `> * { grid-area: stack }` |
| Responsive grid | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 15ch), 1fr))` |
| Centering anything | `display: grid; place-content: center` |
| Multi-card alignment across siblings | Subgrid — `grid-template-columns: subgrid` (with explicit row/col span) |

Full patterns with JSX shapes: [`references/layout.md`](references/layout.md).

### Fluid

| Need | Reach for |
| :-- | :-- |
| Type that scales | `font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem)` — at the token layer, not per element |
| Section padding that breathes | `padding: clamp(1.5rem, 5vw, 4rem)` |
| Component-scoped responsive | `container-type: inline-size` on the parent + `cqi` units / `@container` queries inside |
| Full-viewport height on mobile | `min-h-dvh` — never `min-h-screen` (= `100vh`, breaks on mobile) |
| Form input that doesn't trigger iOS zoom | `font-size: max(16px, 1rem)` |
| Section rhythm with floor | `margin-top: max(8vh, 2rem)` |

Full patterns: [`references/fluid.md`](references/fluid.md).

### Motion (with Motion + Base UI)

The hierarchy of reach:

1. **CSS-only via Base UI's `[data-starting-style]` / `[data-ending-style]`** — for simple enter/exit. Cheap, works everywhere, no JS.
2. **Motion via `render` prop** — when you need state-derived animation (`animate={{ scale: open ? 1 : 0.95 }}`).
3. **Motion + AnimatePresence + `keepMounted` Portal** — for popup-class components (Dialog, Popover, ContextMenu, Menu, Tooltip, AlertDialog) that control their own mount lifecycle.

**Hard rules**:

- Use Base UI's `render` prop, never `asChild`. (`asChild` is the Radix idiom; Base UI uses a render prop.)
- Animate only `transform`, `opacity`, `filter`, `clipPath`. These run on the compositor; the rest cause layout/paint.
- Exit objects must include at least one hardware-accelerated property (`opacity: 0` is the cheap satisfier). Animating `height` alone on exit triggers a mount race in Base UI.
- AnimatePresence wraps the conditional, not the other way around: `<AnimatePresence>{open && <X key="x" />}</AnimatePresence>`.
- `prefers-reduced-motion` lives at the *token* layer (a `--duration-fast` variable that collapses to `0.01ms` in the media query). Components consume the token; never inline durations.

For animation philosophy, easing-curve internals, spring physics tuning, clip-path craft (tabs reveal, hold-to-delete, comparison sliders), gesture mechanics (momentum, damping, pointer capture, multi-touch protection), transform-origin reasoning, 3D transforms, and performance internals: `emil-design-eng` owns those. Cite that skill, don't reinvent.

Stack-specific patterns and the full integration recipe: [`references/motion-base-ui.md`](references/motion-base-ui.md).

### Polish

The proactive list — apply unprompted on every UI surface. Full reasoning per item: [`references/polish.md`](references/polish.md).

| | Pattern | Why |
| :-- | :-- | :-- |
| 1 | **Concentric radii** — outer = inner + padding | Mismatched nested radii is the #1 visual smell |
| 2 | **`tabular-nums`** on counters / timers / prices / dynamic counts | Prevents per-digit layout shift |
| 3 | **`text-balance`** on headings, **`text-pretty`** on body | Eliminates orphans and lopsided wraps |
| 4 | **`scale-[0.97]` on `:active`** for buttons | Tactile feedback; never below 0.95 |
| 5 | **focus-visible** with `outline: max(2px, 0.08em) solid currentColor; outline-offset: 0.15em` | `currentColor` adapts to dark mode for free |
| 6 | **Image outline** at 10% pure black (light) / 10% pure white (dark) | Tinted neutrals read as dirt on the edge |
| 7 | **`scrollbar-gutter: stable`** on scroll containers | Prevents layout shift on overflow |
| 8 | **`scroll-margin-top`** on anchored sections | Clears sticky headers |
| 9 | **`-webkit-font-smoothing: antialiased`** at the root (macOS) | Crisper text |
| 10 | **40×40px hit area** (pseudo-element extension for icon-only) | Touch target floor |
| 11 | **No `transition: all`** — always specify properties | Prevents accidental animation on layout/paint |
| 12 | **`will-change`** only on `transform`/`opacity`/`filter`, only when first-frame stutter is observed | Don't preemptively |
| 13 | **`@media (prefers-reduced-motion: reduce)`** at the token layer | One rule covers every component |
| 14 | **`aria-live="polite"`** on toast/error containers | Screen readers announce without focus theft |

## Add unprompted

When you build a UI surface, the following go in even if the user didn't ask:

- Focus-visible ring on every interactive element.
- Hit-area floor (40×40px) on every button — pseudo-element extension if visible target is smaller.
- `tabular-nums` anywhere a number changes.
- `text-balance` on headings; `text-pretty` on paragraphs.
- `scale-[0.97]` on `:active` for buttons.
- `aria-label` on icon-only buttons.
- `prefers-reduced-motion` honored at the token (no per-component branching needed).
- `scroll-margin-top` on sections that are fragment-link targets.
- Image outlines on content images (10% black/white).
- Semantic input types (`type="email"`, `inputMode="numeric"`) for mobile keyboards.
- Empty state with a real message (not a blank panel).
- Loading state via skeleton (preserves layout) for any waiting beyond ~300ms.

If a value is in the codebase as a token, use the token. If it isn't, **don't add a new token unless asked** — flag it for discussion. (`shadcn-tailwind` covers token discipline.)

## Composing with the always-loaded skills

This skill is the *single source of truth* for design-engineering on this stack — except where two other skills are canonical:

- **`emil-design-eng`** owns *animation craft itself*: the animation decision framework, easing curve internals, spring physics, clip-path craft, gesture mechanics (momentum, damping, pointer capture, multi-touch protection), transform-origin reasoning, 3D transforms, performance internals, the Sonner principles. **This skill defers there** — it gives the frequency × novelty decision and the Base UI integration; emil-design-eng gives the *what to animate and how*.
- **`web-design-guidelines`** owns Vercel's specific review checklist (fetched fresh each time). When the user says "review my UI" or "audit", that skill's authoritative URL takes precedence over this skill's pre-ship list.

This skill also composes with `shadcn-tailwind` (in this harness) — that one owns token discipline (no `px`, no hex, oklch, `render` not `asChild`, data-state attributes), and auto-loads on the same files. Don't duplicate it; cross-reference.

## References

| File | Scope |
| :-- | :-- |
| [`references/layout.md`](references/layout.md) | Every Layout primitives (Stack, Cluster, Sidebar, Switcher, Cover, Center, Box, Grid) ported to Tailwind v4; smolcss patterns; modern-css recipes; subgrid. |
| [`references/fluid.md`](references/fluid.md) | `clamp()` discipline, fluid type/spacing tokens, container queries, `dvh`/`svh`/`lvh`, iOS form gotchas. |
| [`references/motion-base-ui.md`](references/motion-base-ui.md) | Motion + Base UI integration: `render` prop, hoist + `keepMounted` + AnimatePresence, CSS `@starting-style` alternative, `linear()` springs, scroll-driven animations. Stack-specific. |
| [`references/polish.md`](references/polish.md) | Concentric radii, optical alignment, shadows over borders, image outlines, depth via blur+stagger, tabular nums, scale-on-press, hit areas. |
| [`references/taste.md`](references/taste.md) | The judgment layer: state-the-reason discipline, frequency × novelty examples, articulate-before-revealing loop, Rauno's depth/novelty/restraint, Jakub's design-eng-with-AI workflow. |
| [`references/checklist.md`](references/checklist.md) | Pre-ship review checklist used at the end of any UI task. |

Open one file at a time. The skill body is the always-on layer; references are on-demand depth.

## Pre-ship for UI work

Before saying "done":

- [ ] Used a layout primitive (Stack / Cluster / Sidebar / Switcher / Cover / Grid / Center) where applicable, or had a stated reason not to.
- [ ] Container query before viewport breakpoint for any reusable component.
- [ ] Type and spacing read from tokens; no `[14px]` or raw palette colors without justification.
- [ ] `text-balance` on headings; `text-pretty` on body paragraphs.
- [ ] `dvh`/`svh` instead of `vh` on full-screen layouts.
- [ ] Focus ring visible on every interactive; `:active` scale on buttons; hit area ≥40px.
- [ ] `tabular-nums` on every changing number.
- [ ] `prefers-reduced-motion` covered at the token layer, not per component.
- [ ] If an animation is added, the frequency × novelty match was stated; duration ≤300ms; only `transform`/`opacity`/`filter`/`clipPath`; `transform-origin` set; reason articulated.
- [ ] If a Base UI popup-class component animates: hoist + `keepMounted` + AnimatePresence pattern; exit object includes opacity.
- [ ] No `asChild` (this is Base UI; use `render`).
- [ ] No `transition: all` and no `transition: all`-in-disguise (no Tailwind `transition` without specifier).
- [ ] Image outlines added; concentric radii on nested rounded surfaces.
- [ ] Empty / loading / error states present.
- [ ] If user asked for review/audit: `web-design-guidelines` consulted for the Vercel checklist.

## What attention this skill frees up

Mechanics — typing flex/grid by hand, recalling clamp formulas, remembering tabular-nums, debating whether to animate this hover. Those are reflex now.

What it should free attention *toward*: **the frequency × novelty call, the stated reason, the proactive polish list.** The 10% novel surfaces that earn the user's attention. The articulated taste that survives the agent loop.
