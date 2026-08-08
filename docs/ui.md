# UI Component Library Reference

> Component inventory for coding agents. Every shared component comes from **hzero** — a fixed-theme design system published to npm. There is no czero, no Radix, and no Tailwind in the component layer.

---

## Quick Import

```jsx
// The whole library is one flat export surface
import { Button, Modal, DataTable, Input, Card, Tabs } from "hzero"

// The @/components/ui shims re-export hzero and still resolve.
// Both forms work; prefer "hzero" in new code.
import { Button, Input } from "@/components/ui"
```

Every component listed below is exported from the package root. There are no
sub-paths (`hzero/react` and `hzero/czero` were removed in 0.1.31).

### Styles

`src/index.css` imports the one stylesheet:

```css
@import "hzero/styles.css";   /* theme tokens + all component CSS */
@import "tailwindcss";        /* HMS's own utilities, unrelated to hzero */
```

As of 0.1.33 hzero ships **no Tailwind utilities** — `dist/tailwind.css` is 116
bytes of layer declaration. Nothing needs to scan `node_modules/hzero`.

---

## How hzero works

Three rules explain almost every API decision:

1. **The theme decides, the call site doesn't.** Whether a button reacts on
   hover is an hzero decision. No component takes a colour-per-instance for a
   state, and no app should ever hold an `isHovered` in state.
2. **State lives in the DOM, styling reads it.** Components set real ARIA
   attributes (`aria-pressed`, `aria-selected`, `aria-checked`, `aria-current`)
   and the CSS selects on them. There is no `data-state` to keep in sync with
   what a screen reader is told.
3. **Everything is a token.** Component CSS contains no colour or length
   literals; a build check enforces it. To restyle, change a token in
   `theme.css` — never fork a component.

### Restyling

Override an hzero token in your own stylesheet, after the import:

```css
:root {
  --btn-radius: var(--radius-full);      /* every button becomes a pill */
  --card-padding: var(--spacing-6);
}
```

Per-instance overrides that the API supports are passed as props and land as
custom properties on that element — see `Card`'s `borderColor`/`shadow`.

---

## Buttons

### Button

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `node` | - | Button content, including icons |
| `onClick` | `function` | - | Click handler |
| `type` | `string` | `"button"` | `"button"`, `"submit"`, `"reset"` |
| `variant` | `string` | `"primary"` | `"primary"`, `"secondary"`, `"danger"`, `"success"`, `"warning"`, `"info"`, `"outline"`, `"ghost"`, `"white"` |
| `size` | `string` | `"md"` | `"sm"` (32px), `"md"` (40px), `"lg"` (48px) |
| `loading` / `isLoading` | `boolean` | `false` | Show spinner; both spellings accepted |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | Fill the container |
| `className` / `style` | - | - | Passthrough |

```jsx
<Button variant="primary">Save</Button>
<Button><Plus size={16} /> Add item</Button>
<Button loading={submitting} disabled={submitting}>Submit</Button>
```

Icons are children, not a prop.

### IconButton

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `icon` | `node` | **required** | The icon |
| `variant` | `string` | `"ghost"` | `"primary"`, `"secondary"`, `"danger"`, `"ghost"`, `"outline"` |
| `size` | `string` | `"medium"` | `"small"` (28px), `"medium"` (36px), `"large"` (44px) |
| `isLoading` | `boolean` | `false` | Show loading state |
| `disabled` | `boolean` | `false` | Disable |
| `ariaLabel` | `string` | - | **Always pass this** — the button has no text |
| `rounded` | `boolean` | `true` | Circular |

### ButtonGroup

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `children` | `node` | - | Buttons |
| `orientation` | `string` | `"horizontal"` | `"horizontal"`, `"vertical"` |
| `size` / `variant` | `string` | - | Inherited by children that don't set their own |
| `attached` | `boolean` | `false` | Seamless run — interior corners square, borders merged |

### ToggleButtonGroup

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `options` | `Array` | **required** | `[{ value, label?, icon?, disabled?, ariaLabel? }]` |
| `value` | `any` | - | Selected value |
| `onChange` | `function` | - | `(value) => void` |
| `shape` | `string` | `"pill"` | `"pill"`, `"rounded"`, `"square"` |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `variant` | `string` | `"muted"` | `"muted"`, `"primary"`, `"outline"`, `"white"` |
| `fullWidth` | `boolean` | `false` | Buttons fill the row |
| `hideLabelsOnMobile` | `boolean` | `true` | Below 640px an icon carries the button alone — only applied to options that *have* an icon |
| `disabled` | `boolean` | `false` | Disable all |

Selection is `aria-pressed` on each button.

---

## Form

### Input

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `type` | `string` | `"text"` | Any native text-like type, incl. `"search"`, `"password"` |
| `name` / `value` / `onChange` | - | - | Controlled field |
| `placeholder` | `string` | - | Placeholder |
| `leftIcon` / `icon` | `node` | - | Icon in the left gutter |
| `onClear` | `function` | - | Renders a clear affordance when there is a value |
| `error` | `boolean\|string` | - | Error state, or state + message |
| `label` / `description` | `node` | - | Rendered above / below |
| `required` | `boolean` | `false` | Marks the label |
| `disabled` / `readOnly` | `boolean` | `false` | States |
| `size` | `string` | `"md"` | `"sm"` (32px), `"md"` (40px), `"lg"` (48px) |

A text field takes its focus ring on `:focus`, not `:focus-visible` — the caret
has moved and that must be visible whether you clicked or tabbed.

### Select

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `options` | `Array` | `[]` | `[{ value, label }]` or `["a", "b"]` |
| `value` / `onChange` | - | - | Controlled |
| `placeholder` | `string` | - | Empty-state option text |
| `error` | `boolean\|string` | - | Error state |
| `disabled` / `required` | `boolean` | `false` | States |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"` |

### Textarea

Input's API plus `rows` (default `4`), `resize`
(`"none"|"vertical"|"horizontal"|"both"`), `maxLength`, `showCount`.

### Checkbox

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `checked` | `boolean\|"indeterminate"\|"mixed"` | `false` | Tri-state |
| `onChange` | `function` | - | Receives an event-like object: `e.target.{checked,name,value,id}` |
| `size` | `string` | `"medium"` | `"small"` (14px), `"medium"` (16px), `"large"` (20px) |
| `label` / `description` | `node` | - | Optional text block |
| `disabled` | `boolean` | `false` | Disable |

Rendered as `<button role="checkbox" aria-checked>`, so indeterminate is the
real ARIA value `"mixed"`. Inside a `<form>` a named checked box also renders a
hidden input, so it still posts.

### Radio

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `name` / `value` / `checked` / `onChange` | - | - | Controlled radio; `onChange` gets the real DOM event |
| `size` | `string` | `"medium"` | Matches Checkbox's box sizes |
| `label` / `description` | `node` | - | Optional text block |
| `disabled` | `boolean` | `false` | Disable |

The `<input>` **is** the circle (`appearance: none`, dot as `::after`), so
`:checked`, `:focus-visible` and `:disabled` are the input's own states. When
`label` is given the input is nested inside the `<label>`, so clicking the text
always hits the right radio.

### RadioGroup + RadioGroupItem

| Prop (RadioGroup) | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `name` / `value` / `onChange` | - | - | Controlled; `onChange` receives the item's change event (`e.target.value`) |
| `orientation` | `string` | `"vertical"` | `"horizontal"`, `"vertical"` |
| `label` | `node` | - | Group caption, styled as a field label |
| `required` | `boolean` | `false` | Red asterisk + `aria-required` |
| `error` | `node` | - | Error line + `aria-invalid` |
| `size` / `disabled` | - | - | Inherited by every item |

```jsx
<RadioGroup name="decision" value={value} onChange={(e) => set(e.target.value)}>
  <RadioGroupItem value="approve" label="Approve" />
  <RadioGroupItem value="reject" label="Reject — back to student" />
</RadioGroup>
```

### Switch

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `checked` / `onChange` | - | - | Controlled |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `label` / `description` | `node` | - | Optional text |
| `labelPosition` | `string` | `"right"` | `"left"`, `"right"` |
| `disabled` | `boolean` | `false` | Disable |

### FileInput

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `accept` | `string` | - | e.g. `".csv,image/*"` |
| `onChange` | `function` | - | Real DOM event — read `e.target.files` |
| `multiple` | `boolean` | `false` | Multi-select |
| `hidden` | `boolean` | `false` | `display:none`, for a custom trigger |
| `disabled` | `boolean` | `false` | Disable |

Forwards its ref to the **native input**, so `ref.current.click()` and
`ref.current.value = ""` both work. When visible, the browser's "Choose file"
button is restyled as a secondary button.

### SearchInput

A recipe over Input: search icon in the left gutter, Enter fires `onSearch`,
clear button when there is a value.

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `value` / `onChange` | - | - | Controlled |
| `onSearch` | `function` | - | Called with the value on Enter |
| `showClear` | `boolean` | `true` | Clear affordance |
| `onClear` | `function` | - | Defaults to `onChange({target:{value:""}})` |
| `size` | `string` | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `className` / `style` | - | - | Land on the **outer wrapper** — this is where width is set |

### DatePicker

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `value` | `string` | - | `YYYY-MM-DD` |
| `onChange` | `function` | - | Event-like object with `target.value` |
| `min` / `max` | `string` | - | Selectable range |
| `error` / `disabled` / `readOnly` / `required` | - | - | States |
| `size` | `string` | `"medium"` | `"small"`, `"medium"`, `"large"` |

Calendar opens up or down depending on room. The chosen day carries
`aria-current="date"`; today is marked `data-today`.

### Label

`htmlFor`, `children`, `required` (red asterisk), `disabled`, `size`
(`"sm"|"md"|"lg"`). Carries its own bottom margin per size.

### Field

Wraps a control with a label, help text and error, generating and wiring the id.

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `label` | `node` | - | Label content |
| `children` | `node` | - | The control — the first element receives the id |
| `required` | `boolean` | `false` | Asterisk |
| `help` | `node` | - | Hint below the control |
| `error` | `node` | - | Error below the control; also marks it invalid |
| `htmlFor` | `string` | - | Override when the control owns its id |
| `size` / `color` / `spacing` | - | - | Label size, colour, gap |

### FormField

The older all-in-one: renders Label + Input/Select/Textarea from a `type` prop
(`"textarea"`, `"select"`, or any input type), plus `options`, `rows`, `error`.
Prefer `Field` for new code — it composes instead of switching.

---

## Layout

### Page + Page.Body

The routed-page shell: a header that stays put, a body that scrolls under it.

```jsx
<Page>
  <PageHeader />
  <Page.Body>{content}</Page.Body>
</Page>
```

`Page.Body` takes `padded` (default `true`). The gutters step at 640px and
1024px and are deliberately not configurable — a page that needs different
padding passes `padded={false}` and owns the decision visibly.

### Card

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `padding` | `string` | `"p-5 md:p-6"` | Escape hatch; a `p-N` class is translated to a custom property |
| `rounded` | `string` | - | Class passthrough; the default radius comes from `--card-radius` |
| `border` | `boolean` | `true` | Show border |
| `borderColor` / `hoverBorderColor` | `string` | - | CSS colour values |
| `shadow` / `hoverShadow` | `string` | - | CSS shadow values |
| `transition` | `boolean` | `true` | Animate the hover change |
| `onClick` | `function` | - | Makes the card clickable |

**Sub-components:** `CardHeader` (`icon`, `iconBg`, `iconHoverBg`, `title`,
`subtitle`, or free children), `CardTitle` (`as`), `CardDescription`,
`CardContent` / `CardBody`, `CardFooter`.

`iconBg`/`iconHoverBg` accept a colour value (becomes a custom property) or a
class name (passed through).

### Container

`size` (`"small"` 640px → `"xxlarge"` 1536px, `"full"`), `centered` (default
`true`), `padding` (`"none"|"small"|"medium"|"large"`). Max-widths are the
theme's breakpoints, so a container and a media query can never disagree.

### Grid

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `min` | `string\|number` | - | Narrowest column (`"xs"…"xl"` or a width) — auto-fitting grid |
| `cols` | `number\|string\|object` | - | Fixed count, a raw track list, or `{ base, sm, md, lg, xl }` |
| `gap` | `number\|string` | `4` | A number is a spacing step |
| `as` | `string` | `"div"` | A form or list is often the grid itself |

### Surface

A styled box: `bg` (surface or tint name, or a colour), `padding`, `radius`,
`border`, `shadow`, `accent` (thick left rule, for callouts), plus text props
(`color`, `size`, `weight`, `align`, `leading`). Any unset prop emits no
declaration and inherits.

### Stack / HStack / VStack

`direction`, `gap`, `align`, `justify`, `wrap`, `inline`. `HStack` and `VStack`
are the two directions pre-set.

### Divider

`orientation`, `variant` (`"solid"|"dashed"|"dotted"`), `color`, `spacing`,
and optional `children` as a centred label.

### Spacer

`size` (named step or raw), `axis`, `flex`.

---

## Feedback

### Toast + ToastProvider + useToast

```jsx
<ToastProvider position="top-right"><App /></ToastProvider>

const { toast } = useToast()
toast.success("Saved")
toast.error("Failed")
```

`Toast` standalone takes `message`, `title`, `type`
(`"info"|"success"|"warning"|"error"`), `isVisible`, `onClose`, `duration`
(default 5000, `Infinity` to pin).

### Alert

`children`, `type`, `title`, `dismissible`, `onDismiss`, `icon`.

### Spinner

`size` (`"xsmall"`, `"small"`, `"medium"`, `"large"`, `"xlarge"`, **or an exact
box** — a number is pixels, a string is used verbatim), `color`, `thickness`,
`label`.

### Skeleton

`variant` (`"text"|"circular"|"rectangular"|"rounded"`), `width`, `height`,
`animation`, `lines`. Shorthands: `SkeletonText`, `SkeletonCircle` (`size`),
`SkeletonCard`.

### Progress

`value`, `max`, `variant` (`"default"|"striped"|"indeterminate"`), `size`,
`color`, `showLabel`, `label`, `animate`.

Under `prefers-reduced-motion` the stripe stops but the indeterminate sweep only
slows — a frozen indeterminate bar reads as "stuck", which is a lie.

### The state family — EmptyState / ErrorState / LoadingState

One anatomy: a tinted chip (or spinner) over a title, a muted message, and an
optional action.

**EmptyState**

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `icon` | `ElementType` | - | Icon **component**, not an element |
| `title` / `label` | `node` | `"No Data Found"` | `label` is an alias |
| `message` / `description` | `node` | (stock text) | `description` is an alias |
| `variant` | `string` | `"block"` | `"block"` or `"inline"` (one muted line, for a dropdown) |
| `action` | `node` | - | Rendered below the message |
| `buttonText` + `buttonAction` | - | - | Shorthand for a primary-button action |

**ErrorState** — `message`, `onRetry`, `title`, `buttonText`. Danger chip and
`CircleAlert` are fixed.

**LoadingState** — `message`, `description`. The spinner is decorative; the text
block is the live region, so the message is announced once.

---

## Data display

### Badge

`children`, `variant` (`"default"|"primary"|"success"|"warning"|"danger"|"info"|"outline"`),
`size`, `dot`, `outline`, `soft` (default `true`), `icon` (leading icon, sized
to the badge's own type).

### Avatar / AvatarGroup

Avatar: `src`, `alt`, `name` (fallback initials), `size` (`"xsmall"` 24px →
`"xxlarge"` 96px), `shape`, `fallback`, `showStatus`, `status`.
AvatarGroup: `max` (default 5), `size`.

### Tag

`children`, `color` (named or a custom hex), `size`, `removable`, `onRemove`,
`icon`.

### StatusBadge + StatusBadgeProvider

```jsx
<StatusBadge status="checked in" />          // tone inferred
<StatusBadge status="Custom" tone="warning" />
```

`status`, `children` (label override), `tone`, `showDot`. Default mapping:
success = checked in/active/present/success; danger = checked
out/inactive/absent/danger/error; warning = maintenance/pending/warning;
otherwise primary.

Wrap a subtree in `StatusBadgeProvider` with a `map` to add or replace
vocabulary; `defaultStatusMap` is exported for merging.

### StatCard / StatCards

| Prop (StatCard) | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `title` / `value` / `subtitle` | - | - | Content |
| `icon` | `node` | - | Icon element |
| `color` | `string` | `"var(--color-primary)"` | Accent; every gradient and tint is derived from it |
| `trend` | `object` | - | `{ direction: "up"\|"down"\|"flat", label }` |
| `tintBackground` | `boolean` | `false` | Tint the card with the accent |
| `loading` | `boolean` | `false` | Shimmer the value, keep the layout |
| `valueSize` | `string` | `"lg"` | `"sm"`, `"md"`, `"lg"` |
| `variant` | `string` | `"glass"` | `"aurora"`, `"spotlight"`, `"orb"`, `"glass"`, `"refined"`, `"expressive"` |

`StatCards` takes `stats`, `columns` (default 4), `loading`, `loadingCount`,
`valueSize`, `variant`. Two columns on a phone (one below 375px), stepping to
`columns` at 768px for three or 1024px for four and up.

### CompactStudentTag / StudentTagGroup

Tag: `name`, `rollNumber`, `email`, `role` (`"accused"|"accusing"` pick an
accent), `selected`, `onClick`, `onRemove`.
Group: `label`, `students`, `role`, `onRemove`, `emptyText`.

### IconCircle

`children` (the icon), `size` (pixels or a length), `bg`, `color`.

### InfoRow

`label`, `value`, `strong` (for a total or headline figure).

---

## Tables

### Table (compound)

```jsx
<Table>
  <Table.Header>
    <Table.Row><Table.Head>Name</Table.Head></Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row><Table.Cell>Alice</Table.Cell></Table.Row>
  </Table.Body>
</Table>
```

Sub-components: `Table.Header`, `Table.Body`, `Table.Row`, `Table.Head`,
`Table.Cell`. The wrapper owns horizontal overflow.

### DataTable

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `data` | `Array` | `[]` | Rows |
| `columns` | `Array` | `[]` | See below |
| `selectable` | `boolean` | `false` | Row selection with a tri-state header box |
| `selectedRows` / `onSelectionChange` | - | - | Controlled selection |
| `sortable` | `boolean` | `false` | Enable sorting |
| `defaultSortKey` / `defaultSortDir` | - | `"asc"` | Initial sort |
| `pagination` / `pageSize` | - | `10` | Paging |
| `currentPage` / `onPageChange` | - | - | Controlled paging |
| `loading` / `isLoading` | `boolean` | `false` | Shimmer rows, header kept |
| `emptyTitle` / `emptyMessage` | `node` | - | Empty-block copy |
| `emptyState` | `node` | - | Replace the whole empty block |
| `onRowClick` | `function` | - | Row click |
| `getRowId` | `function` | `row.id ?? row._id ?? i` | Row identity |
| `variant` | `string` | `"default"` | `"default"`, `"striped"`, `"bordered"` |

**Column definition:** `key`, `header`, `render(row, cellValue)`, `sortable`,
`align`, `width`, `className`, `customHeaderRender()`.

Sorting is numeric for numbers, case-insensitive for strings, and null/undefined
always sort last.

---

## Navigation

### Tabs

Both APIs are supported.

```jsx
// array form
<Tabs variant="pills" tabs={[{ value: "a", label: "All", count: 4 }]}
      activeTab={tab} setActiveTab={setTab} />

// compound form
<Tabs value={tab} onChange={setTab} variant="underline">
  <Tabs.List>
    <Tabs.Trigger value="a">All</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">…</Tabs.Content>
</Tabs>
```

`variant` (`"underline"|"pills"|"enclosed"`), `size`, `fullWidth`, `showBorder`,
`disabled`. Values are compared as strings, so numbers and booleans work as keys.
Arrow keys move between triggers and activate as they go.

### FilterTabs / FilterButton / FilterChip

The chip-style filter row. `FilterTabs`: `tabs` (`[{ label, value, icon?,
count?, disabled? }]`), `activeTab`, `setActiveTab`, `size`, `disabled`.
`FilterChip`: `label`, `onRemove`, `icon` — for showing applied filters.

### Pagination

`currentPage`, `totalPages`, `paginate`, `compact` (no outer margin, for a card
footer), `showPageInfo`.

### Breadcrumb

`items` (`[{ label, href, icon, onClick }]`), `separator` (`"chevron"` or any
node), `showHome`, `homeHref`, `onHomeClick`. The last item is `aria-current`
and never a link.

### StepIndicator

`steps` (`[{ id, label, sublabel? }]`), `currentStep`, `onStepClick`, `compact`.
Completed steps become real buttons when `onStepClick` is given — keyboard
included; the current step carries `aria-current="step"`.

---

## Overlays

### Modal

| Prop | Type | Default | Values/Description |
|------|------|---------|-------------------|
| `isOpen` / `open` | `boolean` | - | Controlled; both spellings |
| `onClose` / `onOpenChange` | `function` | - | Close handlers |
| `defaultOpen` | `boolean` | - | Uncontrolled initial state |
| `trigger` | `node` | - | Element that opens it |
| `title` / `description` | `node` | - | Header text |
| `children` / `footer` | `node` | - | Body / footer |
| `headerExtra` | `node` | - | Extra header row |
| `tabs` / `activeTab` / `onTabChange` | - | - | Header tab strip |
| `size` | `string` | `"md"` | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"full"` |
| `width` / `minHeight` | `number\|string` | - | Exact sizing |
| `fullHeight` | `boolean` | `false` | Fill the viewport height |
| `centered` | `boolean` | `true` | `false` aligns to the top |
| `hideTitle` | `boolean` | `false` | Removes the title visually, keeps the accessible name |
| `showCloseButton` / `closeButtonVariant` / `closeButtonText` | - | `"icon"` | Close control |
| `closeOnOverlay` / `closeOnEsc` | `boolean` | `true` | Dismissal |
| `portalContainer` | `HTMLElement` | `document.body` | Mount point |
| `overlayClassName` / `headerClassName` / `bodyClassName` / `footerClassName` | `string` | - | Slot classes |

**Mount-to-show:** a Modal rendered with neither `open` nor a `trigger` opens
on mount, which is what makes `{show && <Modal/>}` work.

Stacked modals layer automatically, Escape only closes the topmost one, and the
body scroll lock is reference-counted across the stack.

### Drawer

`isOpen`, `onClose`, `title`, `placement` (`"left"|"right"|"top"|"bottom"`),
`size` (`"small"|"medium"|"large"|"xlarge"|"full"`, short aliases accepted),
`closeOnOverlay`, `closeOnEsc`, `showCloseButton`, `footer`.

### Tooltip

`children` (trigger), `content`, `placement`, `delay` (default 200ms).

### Popover

`children` (trigger), `content`, `placement`, `align`
(`"start"|"center"|"end"`), `trigger` (`"click"|"hover"`), `isOpen`,
`onOpenChange`.

### ConfirmDialog + ConfirmProvider + useConfirm

```jsx
<ConfirmProvider><App /></ConfirmProvider>

const confirm = useConfirm()
if (await confirm({ title: "Delete?", isDestructive: true })) remove()
```

`ConfirmDialog` directly: `isOpen`, `onClose`, `onConfirm`, `title`, `message`,
`confirmText`, `cancelText`, `isDestructive`.

---

## Typography

### Heading

`as` (`"h1"`–`"h6"`, default `"h2"`), `size` (`"xs"`–`"4xl"`, defaults from
`as`), `weight`, `color`, `align`, `truncate`.

Default sizes: h1→3xl, h2→2xl, h3→xl, h4→lg, h5→md, h6→sm.

### Text

`as` (`"p"|"span"|"div"|"label"`), `size` (`"xs"`–`"xl"`), `weight`, `color`,
`align`, `truncate`, `lineClamp`, `italic`, `underline`.

An unset prop emits no declaration and inherits — that is the contract, so a
`Text` inside a coloured `Surface` picks up its colour.

---

## Common patterns

### Sizes
`"sm"|"md"|"lg"` and `"small"|"medium"|"large"` are both accepted almost
everywhere; components normalise internally.

### State props
`disabled`, `loading`/`isLoading`, `error` (`boolean|string`), `checked`.

### Event props
`onClick(event)`, `onChange(event)`, `onClose()`, `onSubmit(event)`.

Checkbox is the one component whose `onChange` receives a **synthesized**
event-like object (it renders a button, not an input); it carries
`target.{checked,name,value,id}`.

---

## Examples

### Form with validation

```jsx
import { Button, Field, Input, Select } from "hzero"

<form onSubmit={submit}>
  <Field label="Name" required error={errors.name}>
    <Input value={name} onChange={(e) => setName(e.target.value)} />
  </Field>

  <Field label="Role" help="Determines dashboard access">
    <Select value={role} onChange={(e) => setRole(e.target.value)}
            options={[{ value: "admin", label: "Admin" }]} />
  </Field>

  <Button type="submit" loading={submitting}>Submit</Button>
</form>
```

### Modal with a footer

```jsx
import { Button, Modal, Input } from "hzero"

{editing && (
  <Modal
    isOpen
    onClose={close}
    title="Edit item"
    footer={
      <>
        <Button variant="ghost" onClick={close}>Cancel</Button>
        <Button onClick={save}>Save</Button>
      </>
    }
  >
    <Input value={name} onChange={(e) => setName(e.target.value)} />
  </Modal>
)}
```

### Data table

```jsx
import { DataTable, StatusBadge } from "hzero"

<DataTable
  data={users}
  columns={[
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", className: "hidden md:table-cell" },
    { key: "status", header: "Status", render: (_row, v) => <StatusBadge status={v} /> },
  ]}
  selectable
  pagination
  emptyTitle="No users yet"
  emptyMessage="Invite someone to get started."
/>
```

### Empty state with an action

```jsx
<EmptyState
  icon={Users}
  title="No visitor requests"
  description="Requests appear here once a student submits one."
  buttonText="Create request"
  buttonAction={openForm}
/>
```

---

## Still app-specific (`/components/common/`)

These stay in HMS because they carry HMS's vocabulary, not general UI:

- `AccessDenied`, `CsvUploader`, `ImageUploadModal`, `MultiSelectDropdown`,
  `OfflineBanner`, `PageHeader`, `PWAInstallPrompt`, `UserSearch`, `UserSelector`

---

## Component gallery

Every component has a live sample in hzero's gallery app:

```bash
cd ../hzero && npm run gallery
```
