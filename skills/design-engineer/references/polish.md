# Polish — the details that compound

Most of these are micro-details users never consciously notice. That's the point. The aggregate of invisible correctness creates interfaces people love without knowing why.

The list is opinionated and reflexive. Apply unprompted on every UI surface unless there's a stated reason not to.

## 1. Concentric border radius

Outer radius = inner radius + padding. Mismatched nested radii is the #1 visual smell — surfaces look like they don't belong together.

```tsx
// Wrong — same radius on both
<div className="rounded-2xl p-6">
  <button className="rounded-2xl">…</button>
</div>

// Right — outer 24px, inner 16px (padding 8px = 24-16)
<div className="rounded-2xl p-2">
  <button className="rounded-xl">…</button>
</div>

// Right — outer 16px, inner 8px (padding 8px)
<div className="rounded-2xl p-2">
  <div className="rounded-lg">…</div>
</div>
```

**The math**: when you nest a rounded element inside a rounded element with padding, the inner radius should be `outer_radius - padding` so the curves stay visually concentric.

**Tailwind v4 token shape**:
```css
@theme {
  --radius-xs:  0.25rem;  /* 4px  */
  --radius-sm:  0.375rem; /* 6px  */
  --radius:     0.5rem;   /* 8px  */
  --radius-md:  0.625rem; /* 10px */
  --radius-lg:  0.75rem;  /* 12px */
  --radius-xl:  1rem;     /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
}
```

When in doubt: take a screenshot, draw the concentric curves, compare to what's rendered.

## 2. Optical alignment over geometric

Geometric centering puts the bounding box at the center. **Optical centering puts the visual weight at the center**, which is what humans perceive.

Common cases:
- **Play button triangles** — the geometric centroid of a triangle isn't at the visual center; nudge it 1–2px right of geometric center.
- **Asymmetric icons** (chevron, arrow) — pad asymmetrically so the *visual mass* is centered.
- **Button with leading icon** — geometric centering puts the text-icon group center at the button center; optical centering shifts the text slightly to compensate for the icon's heavier visual weight.

```tsx
// Geometric — text feels off-center to the right
<Button><Icon /> Click me</Button>

// Optical — visual weight balanced
<Button className="pl-3 pr-4"><Icon /> Click me</Button>
```

When you write `flex items-center justify-center` and it still looks off, that's the cue to optical-align.

## 3. Shadows over borders for depth

Solid borders read as flat lines and don't adapt to the surface beneath. Layered transparent shadows read as depth and adapt to any background.

```css
@theme {
  --shadow-sm:
    0 1px 0 rgb(0 0 0 / 0.04),
    0 1px 2px rgb(0 0 0 / 0.06);
  --shadow:
    0 1px 0 rgb(0 0 0 / 0.04),
    0 2px 6px rgb(0 0 0 / 0.06),
    0 8px 16px rgb(0 0 0 / 0.04);
  --shadow-md:
    0 1px 0 rgb(0 0 0 / 0.05),
    0 4px 8px rgb(0 0 0 / 0.06),
    0 12px 24px rgb(0 0 0 / 0.06);
}
```

**Rauno's Next.js redesign trick**: don't animate `box-shadow` (triggers repaints). Pre-render the shadowed state on a pseudo-element and toggle its opacity:

```css
.card                   { position: relative; }
.card::after {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  box-shadow: var(--shadow-md);
  opacity: 0;
  transition: opacity 200ms;
  pointer-events: none;
}
.card:hover::after      { opacity: 1; }
```

Borders aren't *wrong* — they're the right call when you specifically want a flat hairline between surfaces. But for "card lifts off the page", reach for shadow.

## 4. Focus rings — `currentColor` outline

The universal pattern, set once at the global layer:

```css
:focus-visible {
  outline: max(2px, 0.08em) solid currentColor;
  outline-offset: 0.15em;
}
```

**Why `currentColor`**: the focus ring matches the element's text color, which means it adapts to dark mode, error states, and contextual color shifts automatically. **One rule for the whole app.**

For component-internal focus rings where `outline` would be clipped (`overflow: hidden`), use the double-shadow Rauno pattern:

```css
:focus-visible {
  box-shadow:
    0 0 0 2px var(--color-background),
    0 0 0 4px var(--color-ring);
}
```

The inner shadow matches the page background to create a "halo" gap; the outer shadow is the visible ring. Robust across components and color contexts.

**Never** remove focus styles without replacing them. `outline: none` without an alternative is an a11y violation.

## 5. Image outlines — 10% pure black / pure white

Adds a subtle edge to images for consistent depth. Critical: the outline must be **pure** black or white, never tinted.

```css
img {
  outline: 1px solid rgb(0 0 0 / 0.1);
  outline-offset: -1px;
}

.dark img {
  outline-color: rgb(255 255 255 / 0.1);
}
```

Or via a token:
```css
@theme {
  --color-image-outline: rgb(0 0 0 / 0.1);
}
.dark { --color-image-outline: rgb(255 255 255 / 0.1); }

img { outline: 1px solid var(--color-image-outline); outline-offset: -1px; }
```

**Why pure**: a tinted neutral (slate-900 at 10% etc.) picks up the surface color underneath and reads as dirt on the image edge. Pure black/white is mathematically clean — it always works.

## 6. `tabular-nums` on changing numbers

`font-variant-numeric: tabular-nums` makes all digits the same width. Without it, "9" (narrow) and "0" (wide) cause visible per-digit shifts in counters, timers, and prices.

```tsx
<span className="tabular-nums">{count}</span>     // counter
<span className="tabular-nums">{price.toFixed(2)}</span>  // price
<time className="tabular-nums">{time}</time>      // timer
```

Or set on the root for app-wide adoption — costs nothing visually for static text, fixes every dynamic counter:
```css
:root { font-variant-numeric: tabular-nums; }
```

**Always apply** to anything that updates. Counters, timers, currency, percentages, vote counts.

## 7. Text wrap — balance and pretty

```css
h1, h2, h3, h4, h5, h6 { text-wrap: balance; }
p, li, blockquote      { text-wrap: pretty; }
```

- `balance` evenly distributes lines — eliminates "one-word last line" smell on headings.
- `pretty` avoids orphans (single-word last lines) and very short last lines in body text.

**Set once at the type layer**. Don't apply per component.

**Tailwind v4**: `text-balance`, `text-pretty`.

## 8. Scale on press — `:active` feedback

Every pressable element should respond to press. The reflex value: `scale(0.97)`. Never go below `0.95`.

```tsx
<Button className="active:scale-[0.97] transition-transform duration-150">
  Click
</Button>
```

**Why subtle**: a heavy scale-down (0.85, 0.9) reads as broken, not tactile. Subtle (0.95–0.98) reads as the interface acknowledging the press.

**Apply to**: buttons, pressable cards, list rows, anything with an `onClick`.

For a stronger spring feel, hand the scale to Motion via `whileTap`:
```tsx
<motion.button whileTap={{ scale: 0.97 }} transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
```

## 9. Hit area — 40×40px floor

Every interactive element needs at least 40×40px of touchable area. Visible target can be smaller; **extend the hit area with a pseudo-element**:

```css
.icon-btn {
  position: relative;
  width: 24px; height: 24px;
}
.icon-btn::before {
  content: "";
  position: absolute;
  inset: -8px;        /* extends 8px on every side: 24+16 = 40px */
}
```

Tailwind v4:
```tsx
<button className="relative h-6 w-6 before:absolute before:-inset-2 before:content-['']">
  <Icon />
</button>
```

**Hit areas of two adjacent elements should never overlap** (a tap on the boundary is ambiguous). Test by triggering hits at the edge.

## 10. `scrollbar-gutter: stable` on scroll containers

Prevents layout shift when content goes from "fits" to "overflows":

```css
.scroll-region { overflow-y: auto; scrollbar-gutter: stable; }

/* Or app-wide */
html { scrollbar-gutter: stable; }
```

**`stable both-edges`** keeps the gutter symmetrical even when no scrollbar is needed — useful when content alignment matters (centered hero, etc.).

## 11. `scroll-margin-top` on anchored sections

Sticky headers cover anchor link targets. `scroll-margin-top` fixes it:

```css
[id] { scroll-margin-top: 4rem; }  /* matches your sticky header height */
```

Or per-section in JSX:
```tsx
<section id="features" className="scroll-mt-16">…</section>
```

Set once at the global layer using `[id]`. Per-section opt-out is cheaper than per-section opt-in.

## 12. Font smoothing on macOS

```css
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
```

Crisper text on Retina macOS displays. Set at the root.

**Don't** apply `subpixel-antialiased` to dark backgrounds — it reads as fuzzy. The default rendering is already correct on dark backgrounds in modern browsers.

## 13. No `transition: all`

Always specify properties:

```css
.thing { transition: transform 200ms, opacity 200ms; }
/* Not: transition: all 200ms; */
```

**Why**: `transition: all` animates layout properties (width, height, padding, margin, top, left), which trigger reflow/repaint and drop frames. Specifying explicit properties keeps you on the compositor track.

Tailwind: prefer `transition-transform`, `transition-colors`, `transition-opacity` over bare `transition`.

## 14. `will-change` only when needed

`will-change` hints to the browser to promote a layer. Useful for first-frame stutter; expensive when over-applied.

**Rules**:
- Only on `transform`, `opacity`, `filter` (compositor properties).
- Only when you've observed first-frame stutter.
- **Never `will-change: all`** — promotes the entire element, defeats the purpose.

```css
/* Good — opt-in for known-heavy animation */
.heavy-animation { will-change: transform; }

/* Bad */
* { will-change: auto; }
```

## 15. `prefers-reduced-motion` at the token layer

```css
@theme {
  --duration-fast: 180ms;
  --duration-medium: 240ms;
  --duration-slow: 320ms;
}

@media (prefers-reduced-motion: reduce) {
  @theme {
    --duration-fast: 0.01ms;
    --duration-medium: 0.01ms;
    --duration-slow: 0.01ms;
  }
}
```

Components consume the variable; one media query covers everything. Don't write per-component `prefers-reduced-motion` branches.

For animations where reduced-motion should still permit *opacity* changes but skip *transform* changes (vestibular concern), branch per-property — but this is rare.

## 16. `aria-live` on dynamic regions

Toasts, error banners, status messages: announce to screen readers without stealing focus.

```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {message}
</div>

// Or for high-urgency errors:
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

**`polite`** queues; **`assertive`** interrupts. Default to `polite`.

## 17. Skip enter on first paint

`AnimatePresence` will play enter animations on initial render unless told otherwise. For UI that should appear instantly on page load:

```tsx
<AnimatePresence initial={false}>
  {open && <motion.div … />}
</AnimatePresence>
```

`initial={false}` makes the first render skip the enter animation. Subsequent toggles still animate.

## 18. Depth via blur + stagger

(Rauno's `craft/depth` essay.)

Depth comes from layering, blur, and asynchronous timing — not from perspective transforms.

**Backdrop blur** as Z-axis demotion:
```css
.overlay-bg { backdrop-filter: blur(12px); background: rgb(0 0 0 / 0.4); }
```

**Edge fades** suggest space continuing:
```css
.scroll-row {
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 1rem,
    black calc(100% - 1rem),
    transparent 100%
  );
}
```

**Stagger** — sequential, not synchronous. Real flocks aren't synchronized; UI doesn't have to be either.
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.04, duration: 0.2 }}
  />
))}
```

Keep stagger delays short (30–80ms between items). Long delays make the interface feel slow.

## 19. Empty / loading / error states

Every list, every fetch, every user-facing dynamic surface needs all three:

```tsx
{state === "loading" && <Skeleton />}        // preserves layout, no spinner-jump
{state === "empty"   && <EmptyState …/>}     // real message, suggested action
{state === "error"   && <ErrorState retry={…}/>}  // recovery path, not just "Error"
{state === "ready"   && <List items={…}/>}
```

Anti-pattern: showing a spinner where a skeleton would. Spinners say "loading"; skeletons say "this is what will be here." The latter feels faster (perceived performance).

## 20. Semantic input types

Mobile keyboards adapt to input type:

```tsx
<input type="email" autoComplete="email" />
<input type="tel" inputMode="numeric" autoComplete="tel" />
<input type="search" />
<input type="number" inputMode="decimal" />
```

`type` controls validation; `inputMode` controls the keyboard. `autoComplete` enables system fill. Combine all three for the best mobile UX.

## Pre-ship polish checklist

Before saying "done":

- [ ] Concentric radii on every nested rounded surface.
- [ ] Optical alignment checked on icon-with-text buttons.
- [ ] Shadows over borders where depth is implied.
- [ ] Focus-visible rings on every interactive (`currentColor` outline pattern).
- [ ] Image outlines added (10% pure black/white).
- [ ] `tabular-nums` on changing numbers.
- [ ] `text-balance` on headings; `text-pretty` on paragraphs.
- [ ] `:active scale(0.97)` on buttons.
- [ ] Hit area ≥40×40px (pseudo-element extension if smaller visible target).
- [ ] `scrollbar-gutter: stable` on scroll containers.
- [ ] `scroll-margin-top` on anchored sections.
- [ ] Font smoothing applied at root.
- [ ] No `transition: all`.
- [ ] `will-change` only where needed.
- [ ] `prefers-reduced-motion` at token layer.
- [ ] `aria-live` on dynamic announcement regions.
- [ ] `initial={false}` on AnimatePresence at app shell.
- [ ] Stagger limited to 30–80ms between items.
- [ ] Empty / loading / error states present.
- [ ] Semantic input types on every form field.

## Further reading

- The `make-interfaces-feel-better` skill (when present) — the canonical list these patterns derive from.
- Rauno Freiberg's `rauno.me/craft/depth` and `rauno.me/craft/nextjs` — depth and the Next.js redesign details.
- Emil Kowalski's `emilkowal.ski` — micro-detail thinking; defer to `emil-design-eng` for the deep treatment of animation polish.
