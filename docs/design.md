# Design Language Reference

> Quick reference for coding agents when creating or modifying UI code.

---

## Core Rules

### 1. Always Use CSS Variables

```jsx
// ✅ CORRECT
style={{ color: "var(--color-primary)", borderRadius: "var(--radius-button-md)" }}

// ❌ WRONG
style={{ color: "#1360AB", borderRadius: "12px" }}
```

### 2. Default Button Radius = 12px

```jsx
// Default button uses --radius-button-md (12px)
// Pill buttons use --radius-button-pill (9999px) - opt-in only
```

### 3. Dark Mode = Neutral Grays (No Blue Tint)

| Element | Light | Dark |
|---------|-------|------|
| Card Background | `#FFFFFF` | `#1A1A1A` |
| Page Background | `#F0F4F9` | `#0D0D0D` |
| Text Body | `#334155` | `#D4D4D4` |
| Borders | `#E2E8F0` | `#2E2E2E` |

---

## Color Tokens

### Primary Brand

| Token | Light | Dark | Use For |
|-------|-------|------|---------|
| `--color-primary` | `#1360AB` | `#5B9FE8` | Buttons, links, accents |
| `--color-primary-hover` | `#0F4C81` | `#4A8FD8` | Hover states |
| `--color-primary-active` | `#0A3D68` | `#3A7FC8` | Active/pressed |
| `--color-primary-bg` | `#E8F1FE` | `#1F2D3D` | Light backgrounds |

### Semantic Colors

| Token | Light | Dark | Use For |
|-------|-------|------|---------|
| `--color-success` | `#22C55E` | `#4ADE80` | Success, approved |
| `--color-danger` | `#EF4444` | `#F87171` | Errors, delete |
| `--color-warning` | `#F59E0B` | `#FBBF24` | Warnings, pending |
| `--color-info` | `#3B82F6` | `#60A5FA` | Info messages |

### Text Colors

| Token | Light | Dark | Use For |
|-------|-------|------|---------|
| `--color-text-heading` | `#0A1628` | `#F5F5F5` | Page/section titles |
| `--color-text-primary` | `#0A1628` | `#F5F5F5` | Primary text |
| `--color-text-secondary` | `#1E293B` | `#E8E8E8` | Subheadings |
| `--color-text-body` | `#334155` | `#D4D4D4` | Body content |
| `--color-text-muted` | `#64748B` | `#737373` | Labels, hints |
| `--color-text-placeholder` | `#8FA3C4` | `#525252` | Input placeholders |

### Background Colors

| Token | Light | Dark | Use For |
|-------|-------|------|---------|
| `--color-bg-primary` | `#FFFFFF` | `#1A1A1A` | Cards, modals |
| `--color-bg-secondary` | `#FAFBFC` | `#121212` | Sections |
| `--color-bg-page` | `#F0F4F9` | `#0D0D0D` | Page background |
| `--color-bg-hover` | `#F1F5F9` | `#262626` | Hover states |
| `--color-bg-tertiary` | `#F8FAFC` | `#1F1F1F` | Elevated surfaces |

### Border Colors

| Token | Light | Dark | Use For |
|-------|-------|------|---------|
| `--color-border-primary` | `#E2E8F0` | `#2E2E2E` | Default borders |
| `--color-border-input` | `#D1D5DB` | `#3D3D3D` | Form inputs |
| `--color-border-focus` | `#1360AB` | `#5B9FE8` | Focus rings |

---

## Spacing Scale

```
--spacing-0: 0
--spacing-1: 4px    (0.25rem)
--spacing-1-5: 6px  (0.375rem)
--spacing-2: 8px    (0.5rem)
--spacing-2-5: 10px (0.625rem)
--spacing-3: 12px   (0.75rem)
--spacing-4: 16px   (1rem)      ← Base unit
--spacing-5: 20px   (1.25rem)
--spacing-6: 24px   (1.5rem)
--spacing-8: 32px   (2rem)
--spacing-10: 40px  (2.5rem)
--spacing-12: 48px  (3rem)
```

---

## Typography

### Font Sizes

| Token | Size | Use For |
|-------|------|---------|
| `--font-size-xs` | 12px | Badges, labels |
| `--font-size-sm` | 13px | Secondary text |
| `--font-size-base` | 14px | Body text (default) |
| `--font-size-md` | 15px | Slightly larger |
| `--font-size-lg` | 16px | Card titles |
| `--font-size-xl` | 18px | Section headings |
| `--font-size-2xl` | 20px | Page titles |
| `--font-size-3xl` | 24px | Hero headings |
| `--font-size-4xl` | 32px | Large displays |

### Font Weights

| Token | Weight | Use For |
|-------|--------|---------|
| `--font-weight-normal` | 400 | Body text |
| `--font-weight-medium` | 500 | Labels, buttons |
| `--font-weight-semibold` | 600 | Headings |
| `--font-weight-bold` | 700 | Emphasis |

---

## Border Radius

### Base Scale

| Token | Size | Use For |
|-------|------|---------|
| `--radius-xs` | 4px | Tiny elements |
| `--radius-sm` | 6px | Small badges |
| `--radius-md` | 8px | Chips, tabs |
| `--radius-lg` | 10px | Icons, inputs |
| `--radius-xl` | 12px | Buttons (base) |
| `--radius-2xl` | 14px | Large buttons |
| `--radius-3xl` | 16px | Cards, modals |
| `--radius-4xl` | 20px | Large panels |
| `--radius-full` | 9999px | Avatars only |

### Component-Specific

| Token | Size | Component |
|-------|------|-----------|
| `--radius-button-sm` | 10px | Small buttons |
| `--radius-button-md` | 12px | **Default buttons** |
| `--radius-button-lg` | 14px | Large buttons |
| `--radius-button-pill` | 9999px | Pill buttons (opt-in) |
| `--radius-input` | 10px | Form inputs |
| `--radius-card` | 16px | Cards |
| `--radius-card-sm` | 12px | Small cards |
| `--radius-card-lg` | 20px | Large panels |
| `--radius-modal` | 16px | Modals, dialogs |
| `--radius-dropdown` | 12px | Dropdowns |
| `--radius-badge` | 6px | Badges |
| `--radius-tag` | 6px | Tags |
| `--radius-tooltip` | 8px | Tooltips |
| `--radius-toast` | 12px | Toast notifications |
| `--radius-avatar` | 9999px | Circular avatars |

---

## Shadows

| Token | Use For |
|-------|---------|
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Modals |
| `--shadow-xl` | Popovers |
| `--shadow-card` | Card default |
| `--shadow-button` | Button elevation |
| `--shadow-button-primary` | Primary button |
| `--shadow-focus` | Focus rings |
| `--shadow-modal` | Modal overlay |
| `--shadow-toast` | Toast notifications |
| `--shadow-tooltip` | Tooltips |

---

## Transitions

| Token | Duration | Use For |
|-------|----------|---------|
| `--transition-fast` | 100ms | Quick feedback |
| `--transition-base` | 150ms | Default |
| `--transition-slow` | 300ms | Modals, drawers |
| `--transition-all` | all 150ms ease | Standard transition |
| `--transition-colors` | colors only | Color changes |
| `--transition-transform` | transform only | Animations |

---

## Component Patterns

### C0 Component Ownership

Use these from `czero/react`:
- `Button`
- `Input`
- `Modal`
- `Table`
- `DataTable`
- `StatusBadge`
- `Tabs`

Keep app-specific composed components in `@/components/ui`.

### Config-Driven Customization Rule

For C0-owned components, keep C0 internals generic and apply HMS design via `frontend/czero.config.js`.

Current HMS config-driven surfaces:
- `components.input` (input/search icon, clear action, focus, disabled/readOnly visuals)
- `components.tabs` (filter/header tab variants, sizing, icon/count treatments)
- `components.modal` (close icon, modal spacing, tab styles)
- `components.dataTable` (table wrapper, cells, pagination, empty/loading)
- `components.statusBadge` (pill and tone system)

### Button (CZero)

Buttons use the CZero UI library. Import from `czero/react`:

```jsx
import { Button } from 'czero/react'

// Size props: "sm", "md" (default), "lg"
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state (use `loading`, not `isLoading`)
<Button loading={isSubmitting}>Submit</Button>

// Icons as children (not as icon prop)
<Button><FaPlus /> Add Item</Button>

// Variants: "primary", "secondary", "danger", "success", "outline", "ghost"
<Button variant="danger">Delete</Button>
```

**Size Dimensions:**
| Size | Height | Radius |
|------|--------|--------|
| `sm` | 32px | 10px |
| `md` | 40px | 12px |
| `lg` | 48px | 14px |

### Input Sizes

```jsx
// Small: 32px height
{ height: "32px", fontSize: "var(--font-size-xs)", padding: "var(--spacing-2)" }

// Medium (default): 40px height
{ height: "40px", fontSize: "var(--font-size-base)", padding: "var(--spacing-2-5) var(--spacing-3)" }

// Large: 48px height
{ height: "48px", fontSize: "var(--font-size-lg)", padding: "var(--spacing-3) var(--spacing-4)" }
```

### Card Layout

```jsx
{
  background: "var(--color-bg-primary)",
  borderRadius: "var(--radius-card)",
  padding: "var(--spacing-4)",
  boxShadow: "var(--shadow-card)"
}
```

### Modal Layout

```jsx
{
  background: "var(--color-bg-primary)",
  borderRadius: "var(--radius-modal)",
  boxShadow: "var(--shadow-modal)",
  border: "1px solid var(--color-border-primary)"
}
```

**Modal behavior defaults (C0):**
- `size="md"` (default width preset)
- `showCloseButton={true}`
- `closeButtonVariant="icon"`
- `closeOnOverlay={true}`
- `closeOnEsc={true}`

### Table / DataTable (C0)

```jsx
{
  borderRadius: "var(--radius-card)",
  border: "1px solid var(--color-border-primary)",
  background: "var(--color-bg-primary)"
}
```

**DataTable design notes:**
- Header labels use compact, uppercase metadata styling.
- Body cells use `var(--font-size-sm)` with consistent row rhythm.
- Keep cell padding token-driven; avoid hardcoded project-specific spacing.

### StatusBadge (C0)

```jsx
{
  borderRadius: "9999px",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)"
}
```

**Tone mapping guidance:**
- Prefer automatic tone mapping from status text.
- Pass explicit `tone` only when status labels are custom or ambiguous.

### Tabs (C0)

```jsx
{
  variant: "pills",        // filter/table tabs
  size: "sm|md|lg",
  fullWidth: false
}
```

**Tabs usage guidance:**
- Use `variant="pills"` for filter tabs (complaints/events/board-table style).
- Use `variant="underline"` for header/section navigation tabs.
- Prefer convenience mode (`tabs` + `activeTab` + `setActiveTab`) for standard filters.
- Use primitive mode (`Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) for custom layouts.

---

## Interaction States

### Required States for All Interactive Elements

1. **Default** - Resting appearance
2. **Hover** - `--color-*-hover` or `--color-bg-hover`
3. **Focus** - `box-shadow: var(--shadow-focus)`
4. **Active** - `--color-*-active` (pressed)
5. **Disabled** - `opacity: 0.5`, `cursor: not-allowed`
6. **Loading** - Spinner + disabled state

### Focus Ring Pattern

```jsx
{
  outline: "none",
  boxShadow: "var(--shadow-focus)" // 0 0 0 3px rgba(19, 96, 171, 0.2)
}
```

---

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all focusable elements
- [ ] Color contrast minimum 4.5:1 for text
- [ ] No color-only information
- [ ] aria-labels on icon-only buttons
- [ ] Form inputs have associated labels
- [ ] Error states announced to screen readers

---

## File Imports

```jsx
// Theme variables
import '@/theme.css'

// Core reusable components (from C0)
import { Button, Modal, Table, DataTable, StatusBadge, Tabs } from 'czero/react'

// Other UI Components
import { Input, Card } from '@/components/ui'

// Legacy support (if needed)
import '@/styles/legacy-theme.css'
```

---

## Quick Reference Card

```
COLORS
  Primary:     var(--color-primary)
  Success:     var(--color-success)
  Danger:      var(--color-danger)
  Warning:     var(--color-warning)
  
TEXT
  Heading:     var(--color-text-heading)
  Body:        var(--color-text-body)
  Muted:       var(--color-text-muted)
  
BACKGROUNDS
  Card:        var(--color-bg-primary)
  Page:        var(--color-bg-page)
  Hover:       var(--color-bg-hover)
  
BORDERS
  Default:     var(--color-border-primary)
  Input:       var(--color-border-input)
  
RADIUS
  Button:      var(--radius-button-md)     // 12px
  Input:       var(--radius-input)         // 10px
  Card:        var(--radius-card)          // 16px
  Badge:       var(--radius-badge)         // 6px
  
SPACING
  xs:          var(--spacing-1)            // 4px
  sm:          var(--spacing-2)            // 8px
  md:          var(--spacing-4)            // 16px
  lg:          var(--spacing-6)            // 24px
  xl:          var(--spacing-8)            // 32px
```
