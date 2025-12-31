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

## Form Components

**Location:** `@/components/ui/form`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Input` | Text input field | `type`, `size`, `icon`, `error`, `disabled` |
| `Select` | Dropdown selection | `options`, `value`, `onChange`, `placeholder` |
| `Textarea` | Multi-line text input | `rows`, `maxLength`, `showCount`, `resize` |
| `Checkbox` | Single checkbox | `checked`, `onChange`, `label`, `description` |
| `Radio` | Single radio button | `checked`, `value`, `label`, `description` |
| `RadioGroup` | Group of radios | `value`, `onChange`, `options`, `orientation` |
| `Switch` | Toggle switch | `checked`, `onChange`, `label`, `size` |
| `FileInput` | File upload | `accept`, `multiple`, `onChange`, `hidden` |
| `SearchInput` | Search field | `value`, `onChange`, `onSearch`, `onClear` |
| `Label` | Form label | `htmlFor`, `required`, `children` |

---

## Button Components

**Location:** `@/components/ui/button`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Primary button | `variant`, `size`, `icon`, `isLoading`, `disabled` |
| `IconButton` | Icon-only button | `icon`, `variant`, `size`, `ariaLabel` |
| `ButtonGroup` | Grouped buttons | `orientation`, `attached`, `size`, `variant` |

### Button Variants
- `primary` - Main action (blue)
- `secondary` - Secondary action (light blue bg)
- `danger` - Destructive action (red)
- `success` - Positive action (green)
- `outline` - Bordered, transparent bg
- `ghost` - No border, transparent bg
- `white` - White background, border

### Button Sizes
- `small` - 32px height, 8px radius
- `medium` - 40px height, 12px radius (default)
- `large` - 48px height, 14px radius

---

## Layout Components

**Location:** `@/components/ui/layout`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Card` | Container with elevation | `variant`, `padding`, `hoverable`, `clickable` |
| `CardHeader` | Card header section | `children` |
| `CardTitle` | Card title text | `as`, `children` |
| `CardDescription` | Card subtitle | `children` |
| `CardContent` | Card body | `children` |
| `CardFooter` | Card footer with actions | `children` |
| `Container` | Centered max-width wrapper | `size`, `centered`, `padding` |
| `Stack` | Flexbox layout | `direction`, `gap`, `align`, `justify`, `wrap` |
| `HStack` | Horizontal stack | Same as Stack with `direction="row"` |
| `VStack` | Vertical stack | Same as Stack with `direction="column"` |
| `Divider` | Separator line | `orientation`, `variant`, `spacing`, `children` |
| `Spacer` | Flexible spacing | `size`, `axis`, `flex` |

### Card Variants
- `elevated` - Box shadow (default)
- `outlined` - Border only
- `filled` - Background color
- `ghost` - Transparent

---

## Feedback Components

**Location:** `@/components/ui/feedback`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Modal` | Dialog overlay | `isOpen`, `onClose`, `title`, `size`, `footer` |
| `Toast` | Notification popup | `message`, `type`, `isVisible`, `onClose` |
| `ToastProvider` | Toast context provider | `position`, `children` |
| `useToast` | Toast hook | Returns `{ toast }` with `.success()`, `.error()` |
| `Alert` | Static notification | `type`, `title`, `dismissible`, `onDismiss` |
| `Spinner` | Loading indicator | `size`, `color`, `thickness` |
| `Skeleton` | Loading placeholder | `variant`, `width`, `height`, `lines` |
| `SkeletonText` | Text skeleton | `lines`, `width` |
| `SkeletonCircle` | Circular skeleton | `size` |
| `SkeletonCard` | Card-shaped skeleton | `width`, `height` |
| `Progress` | Progress bar | `value`, `max`, `variant`, `color`, `showLabel` |
| `LoadingState` | Full loading display | `message`, `description`, `fullScreen` |
| `ErrorState` | Error display | `title`, `message`, `onRetry`, `icon` |
| `EmptyState` | Empty data display | `title`, `description`, `action`, `icon` |

### Alert/Toast Types
- `info` - Blue, information
- `success` - Green, positive
- `warning` - Yellow/amber, caution
- `error` - Red, problem

---

## Data Display Components

**Location:** `@/components/ui/data-display`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Badge` | Small label | `variant`, `size`, `dot`, `outline` |
| `Avatar` | User avatar | `src`, `name`, `size`, `shape`, `status` |
| `AvatarGroup` | Stacked avatars | `max`, `size`, `children` |
| `Tag` | Removable label | `color`, `size`, `removable`, `onRemove`, `icon` |
| `StatusBadge` | Status indicator | `status`, `label`, `size`, `showDot` |
| `StatCard` | Statistics card | `title`, `value`, `icon`, `trend`, `trendValue` |

### Status Types
- `active`, `inactive`, `pending`, `approved`, `rejected`
- `completed`, `in-progress`, `cancelled`
- `online`, `offline`, `away`

---

## Navigation Components

**Location:** `@/components/ui/navigation`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Tabs` | Tab container | `value`, `onChange`, `variant`, `size` |
| `TabList` | Tab button container | `children` |
| `Tab` | Individual tab | `value`, `disabled`, `icon` |
| `TabPanels` | Panel container | `children` |
| `TabPanel` | Individual panel | `value`, `children` |
| `Pagination` | Page navigation | `currentPage`, `totalPages`, `onPageChange` |
| `Breadcrumb` | Path navigation | `items`, `separator`, `showHome` |

### Tab Variants
- `underline` - Underlined active tab (default)
- `pills` - Pill-shaped tabs
- `enclosed` - Box-style tabs

---

## Overlay Components

**Location:** `@/components/ui/overlay`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Tooltip` | Hover tooltip | `content`, `placement`, `delay` |
| `Popover` | Click popover | `content`, `placement`, `trigger`, `isOpen` |
| `Drawer` | Slide-in panel | `isOpen`, `onClose`, `placement`, `size`, `title` |
| `ConfirmDialog` | Confirmation modal | `isOpen`, `onClose`, `onConfirm`, `title`, `variant` |

### Placement Options
- `top`, `bottom`, `left`, `right`

### Drawer Sizes
- `sm` (320px), `md` (400px), `lg` (560px), `xl` (720px), `full`

---

## Table Components

**Location:** `@/components/ui/table`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Table` | Base table wrapper | `variant`, `size`, `hoverable`, `stickyHeader` |
| `TableHead` | Table header section | `stickyHeader` |
| `TableBody` | Table body section | `children` |
| `TableRow` | Table row | `selected`, `onClick` |
| `TableHeader` | Header cell (th) | `align`, `sortable`, `sortDirection`, `onSort` |
| `TableCell` | Data cell (td) | `align` |
| `DataTable` | Full-featured table | `data`, `columns`, `selectable`, `pagination`, `sortable` |

### Table Variants
- `default` - Standard table
- `striped` - Alternating row colors
- `bordered` - Outer border

---

## Typography Components

**Location:** `@/components/ui/typography`

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Heading` | Heading text | `as`, `size`, `weight`, `color`, `truncate` |
| `Text` | Body text | `as`, `size`, `weight`, `color`, `lineClamp` |

### Heading Levels
- `h1` → size `3xl`
- `h2` → size `2xl`
- `h3` → size `xl`
- `h4` → size `lg`
- `h5` → size `md`
- `h6` → size `sm`

---

## Common Prop Patterns

### Size Props
Most components accept: `small`, `medium`, `large`

### Color/Variant Props
- Colors: `primary`, `secondary`, `success`, `warning`, `danger`, `info`
- Variants: Component-specific (see individual sections)

### Event Props
- `onClick` - Click handler
- `onChange` - Value change handler
- `onClose` - Close/dismiss handler
- `onSubmit` - Form submit

### State Props
- `disabled` - Disable interaction
- `isLoading` - Show loading state
- `error` - Error message/state
- `selected` - Selection state

### Style Props
- `className` - Additional CSS classes
- `style` - Inline styles (object)

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
