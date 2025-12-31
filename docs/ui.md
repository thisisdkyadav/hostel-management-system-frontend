# UI Component Library Reference

> Component inventory for coding agents. Import from `@/components/ui`.

---

## Quick Import

```jsx
// All components
import { Button, Input, Card, Modal, ... } from '@/components/ui'

// By category
import { Button, IconButton } from '@/components/ui/button'
import { Input, Select, Checkbox } from '@/components/ui/form'
import { Card, Stack, Divider } from '@/components/ui/layout'
import { Modal, Toast, Alert } from '@/components/ui/feedback'
```

---

## Button Components

**Location:** `@/components/ui/button`

### Button

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Button content |
| `onClick` | `function` | - | Click handler |
| `type` | `string` | `"button"` | `"button"`, `"submit"`, `"reset"` |
| `variant` | `string` | `"primary"` | `"primary"`, `"secondary"`, `"danger"`, `"success"`, `"outline"`, `"ghost"`, `"white"` |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `icon` | `React.ReactNode` | - | Optional icon element |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | Full width button |
| `gradient` | `boolean` | `false` | Use gradient background (primary only) |
| `rounded` | `boolean` | `false` | Pill-shaped button |
| `animation` | `string` | `"none"` | `"none"`, `"pulse"`, `"bounce"`, `"glow"`, `"ripple"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

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

**Location:** `@/components/ui/feedback`

### Modal

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `title` | `string` | - | Modal title |
| `children` | `React.ReactNode` | - | Modal content |
| `onClose` | `function` | - | Close handler |
| `width` | `number` | - | Custom width in pixels |
| `autoWidth` | `boolean` | - | Auto width based on content |
| `minHeight` | `number` | - | Minimum height in pixels |
| `footer` | `React.ReactNode` | - | Footer content |
| `tabs` | `Array` | `null` | Array of tab objects: `[{ id, name, icon }]` |
| `activeTab` | `string` | `null` | Active tab id |
| `onTabChange` | `function` | `null` | Tab change handler |
| `hideTitle` | `boolean` | `false` | Hide the title |
| `fullHeight` | `boolean` | `false` | Take full viewport height |

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

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `status` | `string` | - | Status text to display (e.g., `"Checked In"`, `"Checked Out"`) |

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

**Location:** `@/components/ui/navigation`

### Tabs

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Tab components |
| `value` | `string\|number` | - | Current active tab value |
| `onChange` | `function` | - | Tab change handler |
| `variant` | `string` | `"underline"` | `"underline"`, `"pills"`, `"enclosed"` |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `fullWidth` | `boolean` | `false` | Tabs take full width |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Tab

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Tab label |
| `value` | `string\|number` | - | Tab value (must match for active state) |
| `disabled` | `boolean` | `false` | Disabled state |
| `icon` | `React.ReactNode` | - | Icon before label |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### TabPanel

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Panel content |
| `value` | `string\|number` | - | Panel value (must match tab value) |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Also exports:** `TabList`, `TabPanels`

### Pagination

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `currentPage` | `number` | - | Current active page |
| `totalPages` | `number` | - | Total number of pages |
| `paginate` | `function` | - | Page change handler (receives page number) |

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

**Location:** `@/components/ui/table`

### Table

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Table content |
| `variant` | `string` | `"default"` | `"default"`, `"striped"`, `"bordered"` |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `hoverable` | `boolean` | `true` | Highlight row on hover |
| `stickyHeader` | `boolean` | `false` | Sticky header |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### TableHeader

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Header content |
| `align` | `string` | `"left"` | `"left"`, `"center"`, `"right"` |
| `sortable` | `boolean` | `false` | Enable sorting |
| `sortDirection` | `string` | - | `"asc"`, `"desc"`, or `null` |
| `onSort` | `function` | - | Sort handler |
| `width` | `string` | - | Column width |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### TableCell

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Cell content |
| `align` | `string` | `"left"` | `"left"`, `"center"`, `"right"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### TableRow

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `React.ReactNode` | - | Row content |
| `selected` | `boolean` | `false` | Selected state |
| `onClick` | `function` | - | Click handler |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

**Also exports:** `TableHead`, `TableBody`

### DataTable

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `data` | `Array` | `[]` | Array of data objects |
| `columns` | `Array` | `[]` | Column definitions: `[{ key, header, render, sortable, align, width }]` |
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
| `emptyState` | `React.ReactNode` | - | Custom empty state |
| `onRowClick` | `function` | - | Row click handler |
| `getRowId` | `function` | `(row) => row.id` | Function to get unique row id |
| `variant` | `string` | `"default"` | `"default"`, `"striped"`, `"bordered"` |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

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
- `isLoading` - `boolean` - Show loading state
- `error` - `boolean|string` - Error message/state
- `selected` - `boolean` - Selection state

### Style Props
- `className` - `string` - Additional CSS classes
- `style` - `object` - Inline styles (React CSSProperties)

---

## Usage Examples

### Form with Validation

```jsx
import { Input, Select, Button, Label } from '@/components/ui'

<form>
  <Label htmlFor="name" required>Name</Label>
  <Input id="name" placeholder="Enter name" error={errors.name} />
  
  <Label htmlFor="role">Role</Label>
  <Select 
    id="role" 
    options={[{ value: "admin", label: "Admin" }]} 
  />
  
  <Button type="submit" isLoading={submitting}>Submit</Button>
</form>
```

### Card with Actions

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui'

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
import { Modal, Input, Button } from '@/components/ui'

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
import { DataTable } from '@/components/ui'

<DataTable
  data={users}
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> }
  ]}
  selectable
  pagination
  pageSize={10}
/>
```

### Toast Notifications

```jsx
import { ToastProvider, useToast, Button } from '@/components/ui'

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
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui'

const [activeTab, setActiveTab] = useState('tab1')

<Tabs value={activeTab} onChange={setActiveTab} variant="pills">
  <TabList>
    <Tab value="tab1">First Tab</Tab>
    <Tab value="tab2">Second Tab</Tab>
  </TabList>
  <TabPanels>
    <TabPanel value="tab1">First panel content</TabPanel>
    <TabPanel value="tab2">Second panel content</TabPanel>
  </TabPanels>
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

## Usage Examples

### Form with Validation

```jsx
import { Input, Select, Button, Label } from '@/components/ui'

<form>
  <Label htmlFor="name" required>Name</Label>
  <Input id="name" placeholder="Enter name" error={errors.name} />
  
  <Label htmlFor="role">Role</Label>
  <Select 
    id="role" 
    options={[{ value: "admin", label: "Admin" }]} 
  />
  
  <Button type="submit" isLoading={submitting}>Submit</Button>
</form>
```

### Card with Actions

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui'

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
import { Modal, Input, Button } from '@/components/ui'

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
import { DataTable } from '@/components/ui'

<DataTable
  data={users}
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> }
  ]}
  selectable
  pagination
  pageSize={10}
/>
```

### Toast Notifications

```jsx
import { ToastProvider, useToast, Button } from '@/components/ui'

// Wrap app
<ToastProvider position="top-right">
  <App />
</ToastProvider>

// In component
const { toast } = useToast()

<Button onClick={() => toast.success('Saved!')}>Save</Button>
<Button onClick={() => toast.error('Failed!')}>Delete</Button>
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
