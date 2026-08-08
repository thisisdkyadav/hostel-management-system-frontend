# Design Language Reference

> Quick reference for coding agents writing or modifying UI code. The design
> system is **hzero** — a fixed theme shipped as an npm package. Its tokens are
> the vocabulary below.

---

## Core rules

### 1. Tokens, never literals

```jsx
// ✅
style={{ color: "var(--color-primary)", borderRadius: "var(--radius-card)" }}

// ❌
style={{ color: "#1360AB", borderRadius: "16px" }}
```

hzero enforces this on itself: a build check fails if any component contains a
colour or length literal. Hold app code to the same line.

### 2. The theme decides interaction, not the call site

Whether a control reacts on hover, what its focus ring looks like, how fast it
settles — those are hzero's decisions. Never track `isHovered`/`isFocused` in
React state to paint an element. If a component's state isn't reachable in CSS,
that's a bug to fix in hzero, not to work around in the app.

### 3. Reach for a component before a `<div>`

`Surface`, `Stack`, `Grid`, `Card` and `Text` cover most layout. Hand-rolled
markup is where drift starts.

### 4. Dark mode is neutral grey, never blue-tinted

| Element | Light | Dark |
|---------|-------|------|
| Card background | `#FFFFFF` | `#1A1A1A` |
| Page background | `#F0F4F9` | `#0D0D0D` |
| Body text | `#334155` | `#D4D4D4` |
| Borders | `#E2E8F0` | `#2E2E2E` |

Dark mode is `data-theme="dark"` on `<html>`. Every token below has a dark value;
if you use tokens you get dark mode for free.

---

## Colour

### Primary

| Token | Light | Dark | Use for |
|-------|-------|------|---------|
| `--color-primary` | `#1360AB` | `#5B9FE8` | Buttons, links, accents |
| `--color-primary-hover` | `#0F4C81` | `#4A8FD8` | Hover |
| `--color-primary-active` | `#0A3D68` | `#3A7FC8` | Pressed |
| `--color-primary-bg` | `#E8F1FE` | `#1F2D3D` | Tinted background |
| `--color-primary-bg-hover` | `#D2E3FC` | — | Tinted background, hovered |

### Semantic

| Token | Light | Dark | Use for |
|-------|-------|------|---------|
| `--color-success` | `#22C55E` | `#4ADE80` | Approved, present |
| `--color-danger` | `#EF4444` | `#F87171` | Errors, destructive |
| `--color-warning` | `#F59E0B` | `#FBBF24` | Pending, caution |
| `--color-info` | `#3B82F6` | `#60A5FA` | Neutral information |

Each has `-bg` and `-text` companions. **Use `-text` for text on a tint** —
those are the variants tuned to pass AA, and a build check verifies all 36 pairs
at 4.5:1 in both themes.

### Text

| Token | Light | Dark | Use for |
|-------|-------|------|---------|
| `--color-text-heading` | `#0A1628` | `#F5F5F5` | Titles (alias of `-primary`) |
| `--color-text-primary` | `#0A1628` | `#F5F5F5` | Primary text |
| `--color-text-secondary` | `#1E293B` | `#E8E8E8` | Subheadings |
| `--color-text-body` | `#334155` | `#D4D4D4` | Body copy |
| `--color-text-muted` | `#64748B` | `#737373` | Labels, hints |
| `--color-text-placeholder` | `#8FA3C4` | `#525252` | Placeholders |
| `--color-text-disabled` | `#9CA3AF` | — | Disabled text |

### Background & border

| Token | Light | Dark | Use for |
|-------|-------|------|---------|
| `--color-bg-primary` | `#FFFFFF` | `#1A1A1A` | Cards, modals |
| `--color-bg-secondary` | `#FAFBFC` | `#121212` | Sections |
| `--color-bg-page` | `#F0F4F9` | `#0D0D0D` | Page |
| `--color-bg-hover` | `#F1F5F9` | `#262626` | Hover |
| `--color-bg-muted` | `#E2E8F0` | — | Muted fill |
| `--color-border-primary` | `#E2E8F0` | `#2E2E2E` | Default border |
| `--color-border-input` | `#D1D5DB` | `#3D3D3D` | Form controls |
| `--color-border-light` | `#F1F5F9` | — | Faintest rule |

### Text on a saturated fill

Two tokens, and the difference matters:

| Token | Behaviour | Use for |
|-------|-----------|---------|
| `--color-white` | Flips to near-black in dark mode | Text on an accent **fill** — the dark theme lightens those fills |
| `--color-on-accent` | Always `#FFFFFF` | Fills that stay dark in both themes |

Getting this backwards is a real contrast failure, not a nuance: white on a
lightened dark-mode success fill lands around 1.7:1.

---

## Spacing

```
--spacing-0-5  2px      --spacing-5   20px
--spacing-1    4px      --spacing-6   24px
--spacing-1-5  6px      --spacing-8   32px
--spacing-2    8px      --spacing-10  40px
--spacing-2-5 10px      --spacing-12  48px
--spacing-3   12px      --spacing-16  64px
--spacing-4   16px  ← base unit
```

---

## Typography

| Token | Size | Use for |
|-------|------|---------|
| `--font-size-2xs` | 10px | Micro labels |
| `--font-size-xs` | 12px | Badges, help text |
| `--font-size-sm` | 13px | Secondary text |
| `--font-size-base` | 14px | Body (default) |
| `--font-size-md` | 15px | Slightly larger body |
| `--font-size-lg` | 16px | Card titles |
| `--font-size-xl` | 18px | Section headings |
| `--font-size-2xl` | 20px | Page titles |
| `--font-size-3xl` | 24px | Hero |
| `--font-size-4xl` | 30px | Display |

> These are **not** Tailwind's sizes. Tailwind's `text-base` is 16px; this
> system's is 14px. Never translate a Tailwind class to a same-named token —
> match the pixel value.

| Weight | Value |
|--------|-------|
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |
| `--font-weight-extrabold` | 800 |

Line heights: `--line-height-none` 1, `--line-height-tight` 1.25,
`--line-height-snug` 1.375, `--line-height-normal` 1.5.

---

## Radius

| Token | Size | | Token | Size |
|-------|------|-|-------|------|
| `--radius-xs` | 4px | | `--radius-2xl` | 14px |
| `--radius-sm` | 6px | | `--radius-3xl` | 16px |
| `--radius-md` | 8px | | `--radius-4xl` | 20px |
| `--radius-lg` | 10px | | `--radius-full` | 9999px |
| `--radius-xl` | 12px | | | |

### The radius system

Four families, applied consistently:

| Family | Token | Size | Members |
|--------|-------|------|---------|
| Form controls | `--input-radius` | 10px | Input, Select, Textarea, DatePicker trigger, filter chips |
| Floating surfaces | `--radius-xl` | 12px | Menus, popovers, toasts, the calendar |
| Menu items | `--radius-md` | 8px | Items inside a floating surface — outer radius minus padding |
| Containers | `--radius-card` / `--radius-modal` | 16px | Cards, modals, drawers |

Buttons: `--radius-button-sm` 10px, `--radius-button-md` 12px (default),
`--radius-button-lg` 14px. Badges and tags: `--radius-badge` 6px,
`--radius-tag` 8px. `--radius-full` is for avatars, pills and dots only.

---

## Shadows

| Token | Use for |
|-------|---------|
| `--shadow-xs` / `--shadow-sm` | Subtle lift |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Raised cards, hover |
| `--shadow-card` / `--shadow-card-hover` | Card default / hovered |
| `--shadow-modal` | Modals, drawers |
| `--shadow-focus` | `0 0 0 3px rgba(19,96,171,0.2)` |
| `--shadow-glow` | Accent glow (opt-in) |

---

## Motion

One duration scale and one easing set. Everything interactive composes from
these; ambient loops (spinners, shimmer) own their own timing.

| Token | Value | Use for |
|-------|-------|---------|
| `--transition-fast` | 150ms | Hover, focus, small state flips |
| `--transition-normal` | 200ms | The default |
| `--transition-slow` | 300ms | Entrances, drawers, wide travel |

| Easing | Value | Use for |
|--------|-------|---------|
| `--ease-default` | `ease` | Ordinary colour changes |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Controls settling between states |
| `--ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Things that enter — modals, menus, the checkbox mark |
| `--ease-out` / `--ease-in` / `--ease-in-out` / `--ease-linear` | native | Entrances, exits, loops |

Ready-made shorthands: `--transition-colors`, `--transition-transform`,
`--transition-shadow`, `--transition-opacity`, `--transition-all`.

**Never write `transition: all`.** Enumerate the properties that change — `all`
animates layout too, and the cost shows up on long lists.

**Always add a reduced-motion block** when a rule animates:

```css
@media (prefers-reduced-motion: reduce) {
  .thing { transition: none; animation: none; }
}
```

Exception worth copying: an indeterminate progress bar *slows* rather than
freezing — a frozen indeterminate bar reads as "stuck", which is a lie.

---

## Interaction states

Every interactive element needs all six:

1. **Default**
2. **Hover** — `--color-*-hover` or `--color-bg-hover`
3. **Focus** — see the focus vocabulary below
4. **Active** — `--color-*-active`, or a small press scale
5. **Disabled** — `opacity: 0.5`, `cursor: not-allowed`
6. **Loading** — spinner + disabled

### Focus vocabulary

Two rings, and which one you use depends on the control:

```css
/* Buttons, checkboxes, radios, toggles, chips — a double ring that reads
   on any background. */
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--border-2) var(--color-bg-primary),
    0 0 0 calc(var(--border-2) * 2) var(--btn-focus-ring-color);
}

/* Text fields — a soft tint, on :focus rather than :focus-visible, because
   clicking into a field moves the caret and that has to be visible. */
:focus {
  outline: none;
  border-color: var(--input-border-focus);
  box-shadow: var(--input-focus-ring);
}
```

`:focus-visible`, not `:focus`, for anything you click — the browser decides
whether focus came from a keyboard, and JS cannot reproduce that heuristic.

---

## Component patterns

### Ownership

**Every shared component comes from hzero.** Do not build a local Button,
Modal, Table, tab bar or empty state — if hzero's is wrong, fix hzero.

App-specific compositions live in `@/components/common/`. The test: does it
carry HMS's vocabulary ("hostel", "warden", "rebate")? Then it's app code.
Is it generic UI? Then it belongs in hzero.

### Restyling

Override a token after the import — never fork a component:

```css
@import "hzero/styles.css";

:root {
  --btn-radius: var(--radius-full);
  --card-padding: var(--spacing-6);
}
```

Component CSS lives in `@layer components`, so an app's own utilities
(`@layer utilities`) win where they overlap.

### Tabs

- `variant="pills"` for filter rows.
- `variant="underline"` for section navigation.
- Array form for standard filters; compound form (`Tabs.List` / `Tabs.Trigger`
  / `Tabs.Content`) when the layout is custom.

### DataTable

- Header labels are compact metadata styling; body cells are `--font-size-sm`.
- Loading renders the real header plus shimmer rows, so the layout doesn't jump.
- Empty copy comes from `emptyTitle` / `emptyMessage`; `emptyState` replaces the
  whole block.

### StatusBadge

Prefer automatic tone mapping from the status text; pass `tone` only when the
label is ambiguous. To teach it new vocabulary, wrap a subtree in
`StatusBadgeProvider` rather than passing `tone` everywhere.

---

## Accessibility checklist

- [ ] Every interactive element is reachable and operable by keyboard
- [ ] Focus is visible on everything focusable
- [ ] Text contrast ≥ 4.5:1 in **both** themes
- [ ] No information carried by colour alone
- [ ] `ariaLabel` on every icon-only button
- [ ] Inputs have associated labels (`Field` does this for you)
- [ ] Errors are announced (`role="alert"`)
- [ ] A live region announces once, not twice

---

## Quick reference

```
COLOURS
  Primary:      var(--color-primary)
  Success:      var(--color-success)      + var(--color-success-text) on tints
  Danger:       var(--color-danger)
  On a fill:    var(--color-white)        ← flips in dark mode

TEXT
  Heading:      var(--color-text-heading)
  Body:         var(--color-text-body)
  Muted:        var(--color-text-muted)

SURFACES
  Card:         var(--color-bg-primary)
  Page:         var(--color-bg-page)
  Hover:        var(--color-bg-hover)
  Border:       var(--color-border-primary)

RADIUS
  Input:        var(--input-radius)       // 10px
  Button:       var(--radius-button-md)   // 12px
  Floating:     var(--radius-xl)          // 12px
  Card/Modal:   var(--radius-card)        // 16px

SPACING
  xs 4px  sm 8px  md 16px  lg 24px  xl 32px
  var(--spacing-1 / -2 / -4 / -6 / -8)

MOTION
  Fast 150ms   Normal 200ms   Slow 300ms
  Settling:     var(--ease-smooth)
  Entering:     var(--ease-spring)
```
