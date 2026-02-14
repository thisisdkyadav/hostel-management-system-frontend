# UI Component Library Reference

> Component inventory for coding agents. Import shared app components from `@/components/ui` and C0 base components from `czero/react`.

---

## Quick Import

```jsx
// Core components from CZero (not from @/components/ui)
import { Button, Modal, Table, DataTable, StatusBadge, Tabs } from 'czero/react'

// Other UI components
import { Input, Card, ... } from '@/components/ui'

// By category
import { IconButton } from '@/components/ui/button'
import { Input, Select, Checkbox } from '@/components/ui/form'
import { Card, Stack, Divider } from '@/components/ui/layout'
import { Toast, Alert } from '@/components/ui/feedback'
```

> **Note:** `Button`, `Modal`, `Table`, `DataTable`, `StatusBadge`, and `Tabs` are provided by the CZero UI library. Import them from `czero/react`.

## C0 Migration Status (Current)

- `Button` -> migrated to C0
- `Modal` -> migrated to C0
- `Table` -> migrated to C0
- `DataTable` -> migrated to C0
- `StatusBadge` -> migrated to C0
- `Tabs` -> migrated to C0 (import directly from `czero/react`)
- `UnderlineTabs` wrapper removed. Use `Tabs` with `variant="underline"`.
- Filter/table-style tabs standardized to C0 `Tabs` with `variant="pills"` for complaints-style parity.
- Legacy table wrapper import (`@/components/ui/table`) is removed. Use `Table` / `DataTable` from `czero/react`.

## C0 Config Surfaces (HMS Overrides)

HMS now customizes these via `frontend/czero.config.js`:
- `components.tabs` (variants, sizing, icon/count pills, list border/layout tokens)
- `components.modal` (close icon size/padding/bg/hover, tab colors, modal paddings)
- `components.dataTable` (container/header/body/pagination/empty/loading token surface)
- `components.statusBadge` (pill spacing, dot sizing, semantic tone colors)

```js
// frontend/czero.config.js
export default {
  components: {
    tabs: { /* ... */ },
    modal: { /* ... */ },
    dataTable: { /* ... */ },
    statusBadge: { /* ... */ }
  }
}
```

---

## Button Components

### Button (CZero)

**Location:** `czero/react` (NOT from `@/components/ui`)

```jsx
import { Button } from 'czero/react'
```

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Button content (including icons) |
| `onClick` | `function` | - | Click handler |
| `type` | `string` | `"button"` | `"button"`, `"submit"`, `"reset"` |
| `variant` | `string` | `"primary"` | `"primary"`, `"secondary"`, `"danger"`, `"success"`, `"outline"`, `"ghost"`, `"white"` |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | Full width button |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Usage Examples:**

```jsx
// Basic usage
<Button variant="primary" size="md">Save</Button>

// With icon (pass as children, not as prop)
<Button><FaPlus /> Add Item</Button>

// Loading state
<Button loading={isSubmitting} disabled={isSubmitting}>Submit</Button>

// All sizes
<Button size="sm">Small</Button>   // 32px height
<Button size="md">Medium</Button>  // 40px height (default)
<Button size="lg">Large</Button>   // 48px height
```

> **Migration Note:** Previous props `isLoading`, `icon`, `rounded`, and `gradient` are no longer supported.
> - Use `loading` instead of `isLoading`
> - Pass icons as children: `<Button><Icon /> Text</Button>`
> - Use `className="!rounded-full"` for pill buttons

---

**Location:** `@/components/ui/button`

### IconButton

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `icon` | `React.ReactNode` | **required** | Button icon |
| `onClick` | `function` | - | Click handler |
| `type` | `string` | `"button"` | `"button"`, `"submit"`, `"reset"` |
| `variant` | `string` | `"ghost"` | `"primary"`, `"secondary"`, `"danger"`, `"ghost"`, `"outline"` |
| `size` | `string` | `"medium"` | `"small"` (28px), `"medium"` (36px), `"large"` (44px) |
| `isLoading` | `boolean` | `false` | Show loading state |
| `disabled` | `boolean` | `false` | Disable button |
| `ariaLabel` | `string` | - | Accessibility label (recommended) |
| `rounded` | `boolean` | `true` | Circular button |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### ButtonGroup

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Button children |
| `orientation` | `string` | `"horizontal"` | `"horizontal"`, `"vertical"` |
| `size` | `string` | - | Size passed to children: `"small"`, `"medium"`, `"large"` |
| `variant` | `string` | - | Variant passed to children |
| `attached` | `boolean` | `false` | Buttons are attached (no gap) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### ToggleButtonGroup

A group of toggle buttons for switching between options. Supports icons, labels, multiple shapes and variants.

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `options` | `Array` | **required** | `[{ value, label?, icon?, disabled?, ariaLabel? }]` |
| `value` | `string\|number` | - | Currently selected value |
| `onChange` | `function` | - | Change handler `(value) => void` |
| `shape` | `string` | `"pill"` | `"pill"`, `"rounded"`, `"square"` |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `variant` | `string` | `"muted"` | `"muted"`, `"primary"`, `"outline"`, `"white"` |
| `fullWidth` | `boolean` | `false` | Buttons fill available width |
| `hideLabelsOnMobile` | `boolean` | `true` | Hide labels on mobile, show icons only |
| `disabled` | `boolean` | `false` | Disable all buttons |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

---

## Form Components

**Location:** `@/components/ui/form`

### Input

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `type` | `string` | `"text"` | `"text"`, `"email"`, `"password"`, `"number"`, `"date"`, `"time"`, `"datetime-local"`, `"tel"`, `"search"` |
| `name` | `string` | - | Input name attribute |
| `value` | `string` | - | Controlled input value |
| `onChange` | `function` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `icon` | `React.ReactNode` | - | Optional left icon |
| `error` | `boolean\|string` | - | Error state (boolean) or error message (string) |
| `disabled` | `boolean` | `false` | Disabled state |
| `readOnly` | `boolean` | `false` | ReadOnly state |
| `required` | `boolean` | `false` | Required field |
| `min` | `string\|number` | - | Min value for number/date types |
| `max` | `string\|number` | - | Max value for number/date types |
| `step` | `number` | - | Step value for number type |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `id` | `string` | - | Optional id (defaults to name) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Select

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `name` | `string` | - | Select name attribute |
| `value` | `string` | - | Controlled selected value |
| `onChange` | `function` | - | Change handler |
| `options` | `Array` | `[]` | `[{ value: "", label: "" }]` or `["option1", "option2"]` |
| `placeholder` | `string` | - | Placeholder option text |
| `icon` | `React.ReactNode` | - | Optional left icon |
| `error` | `boolean\|string` | - | Error state |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `id` | `string` | - | Optional id (defaults to name) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Textarea

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `name` | `string` | - | Textarea name attribute |
| `value` | `string` | - | Controlled textarea value |
| `onChange` | `function` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `icon` | `React.ReactNode` | - | Optional left icon |
| `error` | `boolean\|string` | - | Error state |
| `disabled` | `boolean` | `false` | Disabled state |
| `readOnly` | `boolean` | `false` | ReadOnly state |
| `required` | `boolean` | `false` | Required field |
| `rows` | `number` | `4` | Number of visible text rows |
| `resize` | `string` | `"vertical"` | `"none"`, `"vertical"`, `"horizontal"`, `"both"` |
| `maxLength` | `number` | - | Maximum character length |
| `showCount` | `boolean` | `false` | Show character count |
| `id` | `string` | - | Optional id (defaults to name) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Checkbox

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `id` | `string` | - | Checkbox id |
| `name` | `string` | - | Checkbox name attribute |
| `checked` | `boolean` | `false` | Controlled checked state |
| `onChange` | `function` | - | Change handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `size` | `string` | `"medium"` | `"small"` (16px), `"medium"` (18px), `"large"` (20px) |
| `label` | `string` | - | Optional inline label text |
| `description` | `string` | - | Optional description below label |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Radio

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `id` | `string` | - | Radio id |
| `name` | `string` | - | Radio name attribute (same for group) |
| `value` | `string` | - | Radio value |
| `checked` | `boolean` | `false` | Controlled checked state |
| `onChange` | `function` | - | Change handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `size` | `string` | `"medium"` | `"small"` (16px), `"medium"` (18px), `"large"` (20px) |
| `label` | `string` | - | Optional inline label text |
| `description` | `string` | - | Optional description below label |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### RadioGroup

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `name` | `string` | - | Radio group name |
| `value` | `string` | - | Selected value |
| `onChange` | `function` | - | Change handler |
| `disabled` | `boolean` | `false` | Disable all radios |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `orientation` | `string` | `"vertical"` | `"horizontal"`, `"vertical"` |
| `label` | `string` | - | Group label |
| `required` | `boolean` | `false` | Required field |
| `error` | `string` | - | Error message |
| `children` | `React.ReactNode` | - | Radio children |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Switch

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `id` | `string` | - | Switch id |
| `name` | `string` | - | Switch name attribute |
| `checked` | `boolean` | `false` | Controlled checked state |
| `onChange` | `function` | - | Change handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `size` | `string` | `"medium"` | `"small"` (32x18px), `"medium"` (40x22px), `"large"` (48x26px) |
| `label` | `string` | - | Optional inline label text |
| `description` | `string` | - | Optional description below label |
| `labelPosition` | `string` | `"right"` | `"left"`, `"right"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### FileInput

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `accept` | `string` | - | Accepted file types (e.g., `".csv,.pdf,image/*"`) |
| `onChange` | `function` | - | Change handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `hidden` | `boolean` | `false` | Hide the input (for custom trigger buttons) |
| `id` | `string` | - | Input id |
| `name` | `string` | - | Input name |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### SearchInput

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `value` | `string` | - | Controlled search value |
| `onChange` | `function` | - | Change handler |
| `placeholder` | `string` | `"Search..."` | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `showClear` | `boolean` | `true` | Show clear button when has value |
| `onClear` | `function` | - | Clear button handler |
| `onSearch` | `function` | - | Search submit handler (Enter key) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### DatePicker

Material Design 3 inspired date picker with calendar dropdown.

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `name` | `string` | - | Input name attribute |
| `value` | `string` | - | Selected date in `YYYY-MM-DD` format |
| `onChange` | `function` | - | Change handler (receives event-like object with `target.value`) |
| `placeholder` | `string` | `"Select date"` | Placeholder text |
| `icon` | `React.ReactNode` | `<FaCalendarAlt />` | Optional custom icon |
| `error` | `boolean\|string` | - | Error state (boolean) or error message (string) |
| `disabled` | `boolean` | `false` | Disabled state |
| `readOnly` | `boolean` | `false` | ReadOnly state |
| `required` | `boolean` | `false` | Required field |
| `min` | `string` | - | Minimum selectable date (`YYYY-MM-DD`) |
| `max` | `string` | - | Maximum selectable date (`YYYY-MM-DD`) |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `id` | `string` | - | Optional id (defaults to name) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Features:**
- Smart dropdown positioning (shows above if no space below)
- Month/year navigation with double arrows
- Today button for quick selection
- Clear button to reset value
- Disabled date ranges (min/max)
- Keyboard accessible
- M3 transitions and hover states

### Label

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `htmlFor` | `string` | - | Associated input id |
| `children` | `React.ReactNode` | - | Label text |
| `required` | `boolean` | `false` | Show required indicator (*) |
| `disabled` | `boolean` | `false` | Disabled styling |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

---

## Layout Components

**Location:** `@/components/ui/layout`

### Card

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Card content |
| `className` | `string` | `""` | Additional CSS classes |
| `padding` | `string` | `"p-5 md:p-6"` | Padding class |
| `rounded` | `string` | `"rounded-[var(--radius-card)]"` | Border radius class |
| `border` | `boolean` | `true` | Show border |
| `borderColor` | `string` | `"var(--color-border-secondary)"` | Border color CSS variable |
| `hoverBorderColor` | `string` | `"var(--color-border-hover)"` | Hover border color CSS variable |
| `shadow` | `string` | `"var(--shadow-card)"` | Box shadow CSS variable |
| `hoverShadow` | `string` | `"var(--shadow-card-hover)"` | Hover box shadow CSS variable |
| `transition` | `boolean` | `true` | Enable transition |
| `onClick` | `function` | - | Click handler (makes card clickable) |
| `style` | `object` | `{}` | Inline styles |

**Sub-components:** `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardBody`, `CardFooter`

### CardHeader

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Header content |
| `icon` | `React.ReactNode` | - | Icon element |
| `iconBg` | `string` | - | Icon background class |
| `title` | `string` | - | Title text |
| `subtitle` | `string` | - | Subtitle text |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### CardTitle

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Title content |
| `as` | `string` | `"h3"` | HTML element: `"h1"`, `"h2"`, `"h3"`, `"h4"`, `"h5"`, `"h6"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Container

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Container content |
| `size` | `string` | `"large"` | `"small"` (640px), `"medium"` (768px), `"large"` (1024px), `"xlarge"` (1280px), `"xxlarge"` (1536px), `"full"` (100%) |
| `centered` | `boolean` | `true` | Center content horizontally |
| `padding` | `string` | `"medium"` | `"none"`, `"small"`, `"medium"`, `"large"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Stack

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Stack items |
| `direction` | `string` | `"column"` | `"row"`, `"column"`, `"row-reverse"`, `"column-reverse"` |
| `gap` | `string` | `"medium"` | `"none"`, `"xsmall"`, `"small"`, `"medium"`, `"large"`, `"xlarge"` |
| `align` | `string` | `"stretch"` | `"start"`, `"center"`, `"end"`, `"stretch"`, `"baseline"` |
| `justify` | `string` | `"start"` | `"start"`, `"center"`, `"end"`, `"between"`, `"around"`, `"evenly"` |
| `wrap` | `boolean` | `false` | Flex wrap |
| `inline` | `boolean` | `false` | Display inline-flex |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Shortcuts:** `HStack` (horizontal), `VStack` (vertical)

### Divider

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `orientation` | `string` | `"horizontal"` | `"horizontal"`, `"vertical"` |
| `variant` | `string` | `"solid"` | `"solid"`, `"dashed"`, `"dotted"` |
| `color` | `string` | `"default"` | `"default"`, `"muted"`, `"primary"` |
| `spacing` | `string` | `"md"` | `"none"`, `"sm"`, `"md"`, `"lg"` |
| `children` | `React.ReactNode` | - | Optional label in center |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Spacer

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `size` | `string\|number` | - | Fixed size (e.g., `"16px"`, `"2rem"`, `32`) or `"xsmall"`, `"small"`, `"medium"`, `"large"`, `"xlarge"` |
| `axis` | `string` | `"vertical"` | `"horizontal"`, `"vertical"`, `"both"` |
| `flex` | `boolean` | `false` | Use flex grow to fill space |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

---

## Feedback Components

**Location:** mixed
- `Modal` from `czero/react`
- `Toast`, `Alert`, `Spinner`, `Skeleton`, `Progress`, `LoadingState`, `ErrorState`, `EmptyState` from `@/components/ui/feedback`

### Modal (CZero)

**Location:** `czero/react`

```jsx
import { Modal } from 'czero/react'
```

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `open` | `boolean` | - | Controlled open state (Radix-compatible API) |
| `defaultOpen` | `boolean` | auto | Uncontrolled initial state |
| `onOpenChange` | `function` | - | Called with next open state |
| `isOpen` | `boolean` | - | Backward-compatible alias for controlled open state |
| `onClose` | `function` | - | Called when modal closes |
| `trigger` | `React.ReactNode` | - | Optional trigger element (rendered with `Dialog.Trigger`) |
| `title` | `React.ReactNode` | - | Modal title (string or JSX) |
| `description` | `React.ReactNode` | - | Optional description text under title |
| `children` | `React.ReactNode` | - | Modal content |
| `footer` | `React.ReactNode` | - | Footer content |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"`, `"xl"`, `"full"` |
| `width` | `number\|string` | - | Custom width (e.g. `560`, `"60rem"`) |
| `minHeight` | `number\|string` | - | Minimum height (e.g. `420`, `"28rem"`) |
| `fullHeight` | `boolean` | `false` | Use full available viewport height |
| `tabs` | `Array` | - | Header tabs: `[{ id, name?, label?, icon?, disabled? }]` |
| `activeTab` | `string` | - | Current active tab id |
| `onTabChange` | `function` | - | Tab change handler |
| `hideTitle` | `boolean` | `false` | Hide the title |
| `showCloseButton` | `boolean` | `true` | Show/hide top-right close control |
| `closeButtonVariant` | `string` | `"icon"` | `"icon"` (X icon) or `"button"` (small button) |
| `closeButtonText` | `string` | `"Close"` | Label for close button variant |
| `closeOnOverlay` | `boolean` | `true` | Close on outside click |
| `closeOnEsc` | `boolean` | `true` | Close on escape key |
| `portalContainer` | `HTMLElement` | - | Optional portal mount container |
| `overlayClassName` | `string` | `""` | Extra class for overlay |
| `headerClassName` | `string` | `""` | Extra class for header |
| `bodyClassName` | `string` | `""` | Extra class for body |
| `footerClassName` | `string` | `""` | Extra class for footer |
| `className` | `string` | `""` | Extra class for modal content |
| `style` | `object` | `{}` | Inline styles for modal content |

> **Behavior Note:** Prefer `open` + `onOpenChange` for new code. `isOpen` + `onClose` is kept for compatibility and existing frontend usage.

### Toast (Standalone)

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `message` | `string` | - | Toast message |
| `title` | `string` | - | Optional title |
| `type` | `string` | `"info"` | `"info"`, `"success"`, `"warning"`, `"error"` |
| `isVisible` | `boolean` | - | Toast visibility |
| `onClose` | `function` | - | Close handler |
| `duration` | `number` | `5000` | Auto-dismiss duration in ms (use `Infinity` to disable) |

### ToastProvider

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | App children |
| `position` | `string` | `"top-right"` | `"top-right"`, `"top-left"`, `"top-center"`, `"bottom-right"`, `"bottom-left"`, `"bottom-center"` |

### Alert

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Alert content |
| `type` | `string` | `"info"` | `"info"`, `"success"`, `"warning"`, `"error"` |
| `title` | `string` | - | Optional title |
| `dismissible` | `boolean` | `false` | Show close button |
| `onDismiss` | `function` | - | Dismiss handler |
| `icon` | `React.ReactNode` | - | Custom icon (overrides default) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Spinner

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `size` | `string` | `"medium"` | `"xsmall"` (12px), `"small"` (16px), `"medium"` (24px), `"large"` (32px), `"xlarge"` (48px) |
| `color` | `string` | `"primary"` | `"primary"`, `"secondary"`, `"white"`, `"inherit"` |
| `thickness` | `string` | `"medium"` | `"thin"` (2px), `"medium"` (3px), `"thick"` (4px) |
| `label` | `string` | `"Loading"` | Accessibility label |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Skeleton

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `variant` | `string` | `"text"` | `"text"`, `"circular"`, `"rectangular"`, `"rounded"` |
| `width` | `string\|number` | - | Width (default auto based on variant) |
| `height` | `string\|number` | - | Height (default based on variant) |
| `animation` | `boolean` | `true` | Enable pulse animation |
| `lines` | `number` | `1` | Number of text lines (for text variant) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Shortcuts:** `SkeletonText`, `SkeletonCircle`, `SkeletonCard`

### Progress

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `value` | `number` | `0` | Current progress value (0-100) |
| `max` | `number` | `100` | Maximum value |
| `variant` | `string` | `"default"` | `"default"`, `"striped"`, `"indeterminate"` |
| `size` | `string` | `"md"` | `"sm"` (4px), `"md"` (8px), `"lg"` (12px) |
| `color` | `string` | `"primary"` | `"primary"`, `"success"`, `"warning"`, `"danger"` |
| `showLabel` | `boolean` | `false` | Show percentage label |
| `label` | `string` | - | Custom label |
| `animate` | `boolean` | `true` | Animate striped variant |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### LoadingState

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `message` | `string` | `"Loading..."` | Loading message |
| `description` | `string` | `"Please wait"` | Additional description |

### ErrorState

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `message` | `string` | - | Error message |
| `onRetry` | `function` | - | Retry handler |
| `title` | `string` | `"Something went wrong"` | Error title |
| `buttonText` | `string` | `"Try Again"` | Retry button text |

### EmptyState

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `icon` | `React.ElementType` | - | Icon component (not instance) |
| `title` | `string` | `"No Data Found"` | Empty state title |
| `message` | `string` | `"There is no data available to display"` | Description/help text |
| `iconBgColor` | `string` | `"bg-[var(--color-primary-bg)]"` | Icon background color class |
| `iconColor` | `string` | `"text-[var(--color-primary)]"` | Icon color class |

---

## Data Display Components

**Location:** `@/components/ui/data-display`

### Badge

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Badge content |
| `variant` | `string` | `"default"` | `"default"`, `"primary"`, `"success"`, `"warning"`, `"danger"`, `"info"` |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `dot` | `boolean` | `false` | Show as dot indicator |
| `outline` | `boolean` | `false` | Outlined style |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Avatar

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `src` | `string` | - | Image source URL |
| `alt` | `string` | `""` | Alt text |
| `name` | `string` | `""` | User name (for fallback initials) |
| `size` | `string` | `"medium"` | `"xsmall"` (24px), `"small"` (32px), `"medium"` (40px), `"large"` (48px), `"xlarge"` (64px), `"xxlarge"` (96px) |
| `shape` | `string` | `"circle"` | `"circle"`, `"square"`, `"rounded"` |
| `fallback` | `React.ReactNode` | - | Custom fallback content |
| `showStatus` | `boolean` | `false` | Show online/offline status |
| `status` | `string` | `"offline"` | `"online"`, `"offline"`, `"away"`, `"busy"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### AvatarGroup

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Avatar children |
| `max` | `number` | `5` | Maximum visible avatars |
| `size` | `string` | `"medium"` | Size passed to children |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Tag

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Tag content |
| `color` | `string` | `"default"` | `"default"`, `"primary"`, `"success"`, `"warning"`, `"danger"`, or custom hex |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `removable` | `boolean` | `false` | Show remove button |
| `onRemove` | `function` | - | Remove handler |
| `icon` | `React.ReactNode` | - | Icon before text |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### StatusBadge

**Location:** `czero/react` (NOT from `@/components/ui`)

```jsx
import { StatusBadge } from 'czero/react'
```

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `status` | `React.ReactNode` | - | Status text/value used for automatic tone mapping |
| `children` | `React.ReactNode` | - | Optional label override |
| `tone` | `string` | auto | `"primary"`, `"success"`, `"danger"`, `"warning"` |
| `showDot` | `boolean` | `true` | Show/hide the status dot |

**Automatic tone mapping (when `tone` is not passed):**
- `success`: `checked in`, `active`, `present`, `success`
- `danger`: `checked out`, `inactive`, `absent`, `danger`, `error`
- `warning`: `maintenance`, `pending`, `warning`
- fallback: `primary`

### StatCard

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `title` | `string` | - | Stat title/label |
| `value` | `string\|number` | - | Main value |
| `subtitle` | `string` | - | Secondary text |
| `icon` | `React.ReactNode` | - | Icon element |
| `color` | `string` | `"var(--color-primary)"` | Icon/value color (CSS color or variable) |

### StatCards

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `stats` | `Array` | - | Array of stat objects: `[{ title, value, subtitle, icon, color }]` |
| `columns` | `number` | `4` | Number of grid columns (1-5) |

---

## Navigation Components

### Tabs (CZero)

**Location:** `czero/react` (NOT from `@/components/ui/navigation`)

```jsx
import { Tabs } from 'czero/react'
```

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `tabs` / `items` | `Array` | - | Convenience mode: `[{ value, label, icon?, count?, disabled?, content? }]` |
| `activeTab` / `value` | `string\|number\|boolean` | - | Controlled active tab |
| `setActiveTab` / `onChange` | `function` | - | Change handler receiving tab value |
| `children` | `React.ReactNode` | - | Primitive mode (`Tabs.List` / `Tabs.Trigger` / `Tabs.Content`) |
| `variant` | `string` | `"underline"` | `"underline"`, `"pills"`, `"enclosed"` |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"` (aliases: `"small"`, `"medium"`, `"large"`) |
| `fullWidth` | `boolean` | `false` | Tabs take full width |
| `showBorder` | `boolean` | `true` | Show/hide list border line |
| `disabled` | `boolean` | `false` | Disable all triggers in convenience mode |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Primitive subcomponents:** `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `value` | `string\|number\|boolean` | - | Trigger/content key |
| `children` | `React.ReactNode` | - | Label or content |
| `disabled` | `boolean` | `false` | Disabled state |
| `icon` | `React.ReactNode` | - | Icon before label |
| `count` | `React.ReactNode` | - | Optional count pill for tab trigger |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Pagination

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `currentPage` | `number` | - | Current active page |
| `totalPages` | `number` | - | Total number of pages |
| `paginate` | `function` | - | Page change handler (receives page number) |
| `compact` | `boolean` | `false` | If true, removes padding/margins for minimal height (ideal for footers) |
| `showPageInfo` | `boolean` | `true` | If true, shows "Page X of Y" text |

### Breadcrumb

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `items` | `Array` | `[]` | Breadcrumb items: `[{ label, href, icon, onClick }]` |
| `separator` | `string` | `"chevron"` | `"chevron"` or custom character (e.g., `"/"`) |
| `showHome` | `boolean` | `false` | Show home icon as first item |
| `homeHref` | `string` | `"/"` | Home link href |
| `onHomeClick` | `function` | - | Home click handler |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

---

## Overlay Components

**Location:** `@/components/ui/overlay`

### Tooltip

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Trigger element |
| `content` | `string` | - | Tooltip content |
| `placement` | `string` | `"top"` | `"top"`, `"bottom"`, `"left"`, `"right"` |
| `delay` | `number` | `200` | Show delay in ms |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Popover

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Trigger element |
| `content` | `React.ReactNode` | - | Popover content |
| `placement` | `string` | `"bottom"` | `"top"`, `"bottom"`, `"left"`, `"right"` |
| `trigger` | `string` | `"click"` | `"click"`, `"hover"` |
| `isOpen` | `boolean` | - | Controlled open state |
| `onOpenChange` | `function` | - | Open state change handler |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Drawer

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `isOpen` | `boolean` | - | Drawer visibility |
| `onClose` | `function` | - | Close handler |
| `children` | `React.ReactNode` | - | Drawer content |
| `title` | `string` | - | Drawer title |
| `placement` | `string` | `"right"` | `"left"`, `"right"`, `"top"`, `"bottom"` |
| `size` | `string` | `"medium"` | `"small"` (320px), `"medium"` (400px), `"large"` (560px), `"xlarge"` (720px), `"full"` (100%) |
| `closeOnOverlay` | `boolean` | `true` | Close when clicking overlay |
| `closeOnEsc` | `boolean` | `true` | Close on escape key |
| `showCloseButton` | `boolean` | `true` | Show close button |
| `footer` | `React.ReactNode` | - | Footer content |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### ConfirmDialog

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `isOpen` | `boolean` | - | Dialog visibility |
| `onClose` | `function` | - | Close/cancel handler |
| `onConfirm` | `function` | - | Confirm handler |
| `title` | `string` | `"Confirm Action"` | Dialog title |
| `message` | `string` | `"Are you sure you want to proceed?"` | Confirmation message |
| `confirmText` | `string` | `"Confirm"` | Confirm button text |
| `cancelText` | `string` | `"Cancel"` | Cancel button text |
| `isDestructive` | `boolean` | `false` | Show danger styling |

---

## Table Components

**Location:** `czero/react` (NOT from `@/components/ui/table`)

### Table (CZero Compound API)

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Table content |
| `className` | `string` | `""` | Additional CSS classes on `<table>` |
| `...props` | native table attrs | - | Any native table prop (`aria-*`, etc.) |

**Compound sub-components:**
- `Table.Header` (`<thead>`)
- `Table.Body` (`<tbody>`)
- `Table.Row` (`<tr>`)
- `Table.Head` (`<th>`)
- `Table.Cell` (`<td>`)

```jsx
import { Table } from 'czero/react'

<Table>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Email</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Alice</Table.Cell>
      <Table.Cell>alice@iitk.ac.in</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

### DataTable

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `data` | `Array` | `[]` | Array of data objects |
| `columns` | `Array` | `[]` | Column definitions: `[{ key, header, render, sortable, align, width, className }]` |
| `selectable` | `boolean` | `false` | Enable row selection |
| `selectedRows` | `Array` | `[]` | Controlled selected row ids |
| `onSelectionChange` | `function` | - | Selection change handler |
| `sortable` | `boolean` | `false` | Enable sorting |
| `defaultSortKey` | `string` | `null` | Default sort column key |
| `defaultSortDir` | `string` | `"asc"` | `"asc"`, `"desc"` |
| `pagination` | `boolean` | `false` | Enable pagination |
| `pageSize` | `number` | `10` | Rows per page |
| `currentPage` | `number` | - | Controlled current page |
| `onPageChange` | `function` | - | Page change handler |
| `loading` | `boolean` | `false` | Loading state |
| `isLoading` | `boolean` | `false` | Alias of `loading` |
| `emptyState` | `React.ReactNode` | - | Custom empty state |
| `emptyMessage` | `string` | - | Custom empty message text |
| `onRowClick` | `function` | - | Row click handler |
| `getRowId` | `function` | `(row, i) => row.id ?? row._id ?? i` | Function to get unique row id |
| `variant` | `string` | `"default"` | `"default"`, `"striped"`, `"bordered"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

#### Column Definition Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Data key to access from row object |
| `header` | `string` | Column header text |
| `render` | `function` | Custom render: `(row, cellValue) => ReactNode` |
| `sortable` | `boolean` | Enable sorting for this column (requires table `sortable` prop) |
| `align` | `string` | Text alignment: `"left"`, `"center"`, `"right"` |
| `width` | `string` | Column width (e.g., `"100px"`, `"20%"`) |
| `className` | `string` | CSS classes applied to both header and cells (useful for responsive hiding, e.g., `"hidden md:table-cell"`) |
| `customHeaderRender` | `function` | Custom header render: `() => ReactNode` |

> **Migration Note:** Legacy imports from `@/components/ui/table` are removed. Use `Table` / `DataTable` from `czero/react`.

---

## Typography Components

**Location:** `@/components/ui/typography`

### Heading

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Heading content |
| `as` | `string` | `"h2"` | `"h1"`, `"h2"`, `"h3"`, `"h4"`, `"h5"`, `"h6"` |
| `size` | `string` | (based on `as`) | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"`, `"3xl"`, `"4xl"` |
| `weight` | `string` | `"semibold"` | `"normal"`, `"medium"`, `"semibold"`, `"bold"` |
| `color` | `string` | `"default"` | `"default"`, `"muted"`, `"primary"`, `"success"`, `"warning"`, `"danger"` |
| `align` | `string` | - | `"left"`, `"center"`, `"right"` |
| `truncate` | `boolean` | `false` | Truncate with ellipsis |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Default sizes:** h1→3xl, h2→2xl, h3→xl, h4→lg, h5→md, h6→sm

### Text

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Text content |
| `as` | `string` | `"p"` | `"p"`, `"span"`, `"div"`, `"label"` |
| `size` | `string` | `"md"` | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `weight` | `string` | `"normal"` | `"normal"`, `"medium"`, `"semibold"`, `"bold"` |
| `color` | `string` | `"default"` | `"default"`, `"muted"`, `"secondary"`, `"heading"`, `"primary"`, `"success"`, `"warning"`, `"danger"` |
| `align` | `string` | - | `"left"`, `"center"`, `"right"`, `"justify"` |
| `truncate` | `boolean` | `false` | Truncate with ellipsis |
| `lineClamp` | `number` | - | Number of lines before truncating |
| `italic` | `boolean` | `false` | Italic style |
| `underline` | `boolean` | `false` | Underline style |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

---

## Common Prop Patterns

### Size Props
Most components accept: `"small"`, `"medium"`, `"large"` (some use `"sm"`, `"md"`, `"lg"`)

### Color/Variant Props
- Colors: `"primary"`, `"secondary"`, `"success"`, `"warning"`, `"danger"`, `"info"`
- Variants: Component-specific (see individual sections)

### Event Props
- `onClick` - Click handler: `(event) => void`
- `onChange` - Value change handler: `(event) => void`
- `onClose` - Close/dismiss handler: `() => void`
- `onSubmit` - Form submit: `(event) => void`

### State Props
- `disabled` - `boolean` - Disable interaction
- `loading` - `boolean` - Show loading state (Button only, use `loading` not `isLoading`)
- `error` - `boolean|string` - Error message/state
- `selected` - `boolean` - Selection state

### Style Props
- `className` - `string` - Additional CSS classes
- `style` - `object` - Inline styles (React CSSProperties)

---

## Usage Examples

### Form with Validation

```jsx
import { Button } from 'czero/react'
import { Input, Select, Label } from '@/components/ui'

<form>
  <Label htmlFor="name" required>Name</Label>
  <Input id="name" placeholder="Enter name" error={errors.name} />
  
  <Label htmlFor="role">Role</Label>
  <Select 
    id="role" 
    options={[{ value: "admin", label: "Admin" }]} 
  />
  
  <Button type="submit" loading={submitting}>Submit</Button>
</form>
```

### Card with Actions

```jsx
import { Button } from 'czero/react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Modal with Form

```jsx
import { Button, Modal } from 'czero/react'
import { Input } from '@/components/ui'

<Modal 
  isOpen={isOpen} 
  onClose={close} 
  title="Edit Item"
  footer={
    <>
      <Button variant="ghost" onClick={close}>Cancel</Button>
      <Button onClick={save}>Save</Button>
    </>
  }
>
  <Input label="Name" value={name} onChange={setName} />
</Modal>
```

### Data Table

```jsx
import { DataTable, StatusBadge } from 'czero/react'

<DataTable
  data={users}
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (_row, val) => <StatusBadge status={val} /> }
  ]}
  selectable
  pagination
  pageSize={10}
/>
```

### Toast Notifications

```jsx
import { Button } from 'czero/react'
import { ToastProvider, useToast } from '@/components/ui'

// Wrap app
<ToastProvider position="top-right">
  <App />
</ToastProvider>

// In component
const { toast } = useToast()

<Button onClick={() => toast.success('Saved!')}>Save</Button>
<Button onClick={() => toast.error('Failed!')}>Delete</Button>
```

### Tabs Example

```jsx
import { Tabs } from 'czero/react'

const [activeTab, setActiveTab] = useState('tab1')

<Tabs
  variant="pills"
  tabs={[
    { value: 'tab1', label: 'First Tab' },
    { value: 'tab2', label: 'Second Tab', count: 4 }
  ]}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>

<Tabs value={activeTab} onChange={setActiveTab} variant="underline">
  <Tabs.List>
    <Tabs.Trigger value="tab1">First Tab</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Second Tab</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">First panel content</Tabs.Content>
  <Tabs.Content value="tab2">Second panel content</Tabs.Content>
</Tabs>
```

### Drawer Example

```jsx
import { Drawer, Button } from '@/components/ui'

<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Settings"
  placement="right"
  size="medium"
  footer={<Button onClick={() => setIsOpen(false)}>Close</Button>}
>
  <p>Drawer content here</p>
</Drawer>
```

### Stack Layout

```jsx
import { Stack, HStack, VStack } from '@/components/ui'

<Stack direction="row" gap="medium" align="center">
  <Avatar name="John" />
  <VStack gap="xsmall">
    <Text weight="medium">John Doe</Text>
    <Text size="sm" color="muted">john@example.com</Text>
  </VStack>
</Stack>
```

---

## Not Included (Use From /common/)

These domain-specific components remain in `/components/common/`:

- `AccessDenied` - Auth error page
- `CsvUploader` - CSV import utility
- `ImageUploadModal` - Image upload modal
- `MultiSelectDropdown` - Multi-select dropdown
- `OfflineBanner` - PWA offline indicator
- `PageHeader` - Page header layout
- `PWAInstallPrompt` - PWA install prompt
- `SimpleDatePicker` - Date picker
- `UserSearch`, `UserSelector` - User selection

---
