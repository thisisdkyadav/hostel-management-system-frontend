# Hostel Management System - Design System

> A comprehensive design system and component library documentation for building consistent, accessible, and beautiful user interfaces.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Design Tokens](#design-tokens)
3. [Component Inventory](#component-inventory)
4. [Component Specifications](#component-specifications)
5. [Usage Guidelines](#usage-guidelines)
6. [Accessibility Standards](#accessibility-standards)

---

## Design Principles

### Core Values

1. **Consistency** - Every component follows the same visual language
2. **Accessibility** - WCAG 2.1 AA compliant, keyboard navigable, screen reader friendly
3. **Responsiveness** - Mobile-first design, works on all screen sizes
4. **Performance** - Lightweight components with minimal re-renders
5. **Themeable** - Full dark/light mode support via CSS variables

### Visual Identity

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| **Primary Color** | `#1360AB` | `#5B9FE8` (softer blue) |
| **Background** | `#FFFFFF` | `#1A1A1A` (neutral dark) |
| **Page Background** | `#F0F4F9` | `#0D0D0D` (deepest) |
| **Text Primary** | `#0A1628` | `#F5F5F5` (pure off-white) |
| **Text Body** | `#334155` | `#D4D4D4` (neutral gray) |
| **Border** | `#E2E8F0` | `#2E2E2E` (neutral) |

**Dark Mode Philosophy:**
- **Neutral grays** - No blue tint in backgrounds (#1A1A1A, #262626, etc.)
- **Warm text** - Off-white (#F5F5F5) instead of blue-white
- **Softer primary** - Desaturated blue (#5B9FE8) for reduced eye strain
- **True black accents** - Deep backgrounds (#0D0D0D) for contrast
- **Color only on interactive elements** - Blue reserved for buttons, links, focus states

### Interaction States

All interactive elements MUST have these states:
- **Default** - Resting state
- **Hover** - Mouse over (darker shade, cursor: pointer)
- **Focus** - Keyboard focus (visible ring using `--shadow-focus`)
- **Active/Pressed** - Click/tap state (even darker)
- **Disabled** - Non-interactive (50% opacity, cursor: not-allowed)
- **Loading** - Processing state (spinner, disabled interaction)

---

## Design Tokens

### Color Tokens

#### Light Mode
```css
/* Primary Brand Colors */
--color-primary: #1360AB
--color-primary-hover: #0F4C81
--color-primary-active: #0A3D68
--color-primary-bg: #E8F1FE
--color-primary-bg-hover: #D2E3FC

/* Semantic Colors */
--color-success: #22C55E
--color-danger: #EF4444
--color-warning: #F59E0B
--color-info: #3B82F6

/* Text Colors */
--color-text-primary: #0A1628    /* Headings */
--color-text-secondary: #1E293B  /* Subheadings */
--color-text-body: #334155       /* Body text */
--color-text-muted: #64748B      /* Secondary text */
--color-text-placeholder: #8FA3C4 /* Placeholders */

/* Background Colors */
--color-bg-primary: #FFFFFF      /* Cards, modals */
--color-bg-secondary: #FAFBFC    /* Page background */
--color-bg-page: #F0F4F9         /* App background */
--color-bg-hover: #F1F5F9        /* Hover states */

/* Border Colors */
--color-border-primary: #E2E8F0
--color-border-input: #D1D5DB
--color-border-focus: #1360AB
```

#### Dark Mode (Neutral & Pleasant)
```css
/* Primary Brand Colors - Softer for dark mode */
--color-primary: #5B9FE8          /* Desaturated blue */
--color-primary-hover: #4A8FD8
--color-primary-active: #3A7FC8
--color-primary-bg: #1F2D3D       /* Subtle blue tint ONLY here */
--color-primary-bg-hover: #283848

/* Semantic Colors - Brighter for visibility */
--color-success: #4ADE80          /* Bright green */
--color-danger: #F87171           /* Softer red */
--color-warning: #FBBF24          /* Bright amber */
--color-info: #60A5FA             /* Soft blue */

/* Text Colors - Warm neutral tones */
--color-text-primary: #F5F5F5     /* Pure off-white */
--color-text-secondary: #E8E8E8
--color-text-body: #D4D4D4        /* Neutral gray (NO blue) */
--color-text-muted: #737373
--color-text-placeholder: #525252

/* Background Colors - TRUE NEUTRAL (no blue tint!) */
--color-bg-primary: #1A1A1A       /* Cards, modals */
--color-bg-secondary: #121212     /* Page sections */
--color-bg-page: #0D0D0D          /* Deepest background */
--color-bg-hover: #262626         /* Hover states */
--color-bg-tertiary: #1F1F1F      /* Elevated surfaces */

/* Border Colors - Neutral grays */
--color-border-primary: #2E2E2E   /* Main borders */
--color-border-input: #3D3D3D
--color-border-focus: #5B9FE8     /* Only focus uses blue */
```

### Spacing Scale

```css
--spacing-0: 0
--spacing-1: 0.25rem   /* 4px */
--spacing-2: 0.5rem    /* 8px */
--spacing-3: 0.75rem   /* 12px */
--spacing-4: 1rem      /* 16px */
--spacing-5: 1.25rem   /* 20px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
--spacing-10: 2.5rem   /* 40px */
--spacing-12: 3rem     /* 48px */
```

### Typography Scale

```css
/* Font Sizes */
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.8125rem  /* 13px */
--font-size-base: 0.875rem /* 14px - Default */
--font-size-md: 0.9375rem  /* 15px */
--font-size-lg: 1rem       /* 16px */
--font-size-xl: 1.125rem   /* 18px */
--font-size-2xl: 1.25rem   /* 20px */
--font-size-3xl: 1.5rem    /* 24px */

/* Font Weights */
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Border Radius

**Design Philosophy:** Harmonious scale centered around 12px (button-md) as the base reference.

```css
/* Base Scale */
--radius-xs: 4px       /* Tiny elements */
--radius-sm: 6px       /* Small badges */
--radius-md: 8px       /* Chips, tabs */
--radius-lg: 10px      /* Inputs, icons */
--radius-xl: 12px      /* Buttons (base reference) */
--radius-2xl: 14px     /* Large buttons */
--radius-3xl: 16px     /* Cards, modals */
--radius-4xl: 20px     /* Large panels */
--radius-full: 9999px  /* Avatars only */

/* Component-Specific */
--radius-button-sm: 10px      /* Small buttons */
--radius-button-md: 12px     /* Medium buttons (DEFAULT) */
--radius-button-lg: 14px     /* Large buttons */
--radius-button-pill: 9999px /* Pill variant (optional) */
--radius-input: 10px         /* Form inputs */
--radius-card: 16px          /* Cards */
--radius-card-sm: 12px       /* Small cards */
--radius-card-lg: 20px       /* Large panels */
--radius-modal: 16px         /* Modals */
--radius-dropdown: 12px      /* Dropdown menus */
--radius-badge: 6px          /* Badges, tags */
--radius-badge-pill: 9999px  /* Pill badges */
--radius-tooltip: 8px        /* Tooltips */
--radius-tab: 8px            /* Tab buttons */
--radius-chip: 8px           /* Chips */
--radius-icon: 10px          /* Icon containers */
--radius-avatar: 9999px      /* Circular avatars */
```

**Radius Harmony Principle:**
- Buttons (12px) are the visual anchor
- Inputs (10px) slightly smaller for subtle hierarchy
- Cards (16px) larger for container feel
- Badges/chips (6-8px) smaller for inline elements
- Only avatars and explicit pills use `9999px`

### Shadows

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.15)

--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05)
--shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.1)
--shadow-focus: 0 0 0 3px rgba(19, 96, 171, 0.2)
--shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Z-Index Layers

```css
--z-base: 0
--z-dropdown: 10
--z-sticky: 20
--z-fixed: 30
--z-modal-backdrop: 40
--z-modal: 50
--z-tooltip: 60
--z-toast: 70
```

---

## Component Inventory

### Legend
- ✅ **Exists** - Component is implemented
- 🔧 **Needs Update** - Component exists but needs consistency fixes
- ❌ **Missing** - Component needs to be created

---

### Form Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| Input | ✅ | `ui/Input.jsx` | Text, email, password, number, date, time inputs |
| Textarea | ✅ | `ui/Textarea.jsx` | Multi-line text input |
| Select | ✅ | `ui/Select.jsx` | Custom dropdown select |
| Checkbox | ✅ | `ui/Checkbox.jsx` | Single checkbox with label |
| FileInput | ✅ | `ui/FileInput.jsx` | File upload input |
| **Radio** | ❌ | - | Radio button group |
| **RadioGroup** | ❌ | - | Grouped radio buttons with label |
| **Switch/Toggle** | ❌ | - | On/off toggle switch |
| **Slider** | ❌ | - | Range input slider |
| **DatePicker** | 🔧 | `SimpleDatePicker.jsx` | Calendar date picker (needs enhancement) |
| **TimePicker** | ❌ | - | Time selection component |
| **DateRangePicker** | ❌ | - | Date range selection |
| **ColorPicker** | ❌ | - | Color selection (if needed) |
| **OTPInput** | ❌ | - | One-time password input |
| FormField | 🔧 | `FormField.jsx` | Legacy form field wrapper |
| SearchBar | ✅ | `SearchBar.jsx` | Search input with icon |
| MultiSelectDropdown | ✅ | `MultiSelectDropdown.jsx` | Multi-select dropdown |

---

### Button Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| Button | ✅ | `Button.jsx` | Primary button component |
| **IconButton** | ❌ | - | Icon-only button (circular) |
| **ButtonGroup** | ❌ | - | Group of related buttons |
| ToggleButtonGroup | ✅ | `ToggleButtonGroup.jsx` | Toggle between options |
| **SplitButton** | ❌ | - | Button with dropdown menu |
| **FloatingActionButton** | ❌ | - | FAB for mobile (if needed) |

---

### Layout Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| Card | ✅ | `Card.jsx` | Content container |
| **Container** | ❌ | - | Max-width wrapper |
| **Stack** | ❌ | - | Vertical/horizontal flex container |
| **Grid** | ❌ | - | CSS Grid wrapper |
| **Divider** | ❌ | - | Horizontal/vertical separator |
| **Spacer** | ❌ | - | Flex spacer |
| **AspectRatio** | ❌ | - | Fixed aspect ratio container |
| PageHeader | ✅ | `PageHeader.jsx` | Page title header |
| Sidebar | ✅ | `Sidebar.jsx` | Navigation sidebar |
| BottomBar | ✅ | `BottomBar.jsx` | Mobile bottom navigation |
| MobileHeader | ✅ | `MobileHeader.jsx` | Mobile header |

---

### Data Display Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| BaseTable | ✅ | `table/BaseTable.jsx` | Data table |
| **DataTable** | ❌ | - | Enhanced table with sorting/filtering |
| StatCards | ✅ | `StatCards.jsx` | Statistics display |
| StatusBadge | ✅ | `StatusBadge.jsx` | Status indicator badge |
| **Badge** | ❌ | - | Generic badge/tag component |
| **Tag** | ❌ | - | Removable tag/chip |
| **Avatar** | ❌ | - | User avatar with fallback |
| **AvatarGroup** | ❌ | - | Stacked avatars |
| **List** | ❌ | - | Styled list component |
| **ListItem** | ❌ | - | List item with actions |
| **DescriptionList** | ❌ | - | Key-value pair display |
| **Timeline** | ❌ | - | Vertical timeline |
| **Calendar** | ❌ | - | Calendar display |
| **KBD** | ❌ | - | Keyboard shortcut display |
| **Code** | ❌ | - | Inline code display |
| **Pre** | ❌ | - | Code block |

---

### Feedback Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| Modal | ✅ | `Modal.jsx` | Modal dialog |
| Toast | ✅ | `Toast.jsx` | Toast notification |
| NotificationToast | ✅ | `NotificationToast.jsx` | Rich notification toast |
| LoadingState | ✅ | `LoadingState.jsx` | Loading indicator |
| LoadingScreen | ✅ | `LoadingScreen.jsx` | Full page loading |
| ErrorState | ✅ | `ErrorState.jsx` | Error display |
| EmptyState | ✅ | `EmptyState.jsx` | Empty data state |
| NoResults | ✅ | `NoResults.jsx` | No search results |
| ConfirmationDialog | ✅ | `ConfirmationDialog.jsx` | Confirm action modal |
| CommonSuccessModal | ✅ | `CommonSuccessModal.jsx` | Success feedback |
| **Alert** | ❌ | - | Inline alert/banner |
| **AlertDialog** | ❌ | - | Blocking confirmation |
| **Progress** | ❌ | - | Progress bar |
| **CircularProgress** | ❌ | - | Circular progress |
| **Skeleton** | ❌ | - | Loading skeleton |
| **Spinner** | ❌ | - | Standalone spinner |
| OfflineBanner | ✅ | `OfflineBanner.jsx` | Offline status banner |

---

### Navigation Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| Pagination | ✅ | `Pagination.jsx` | Page navigation |
| FilterTabs | ✅ | `FilterTabs.jsx` | Filter tab navigation |
| **Tabs** | ❌ | - | Generic tab component |
| **TabPanel** | ❌ | - | Tab content panel |
| **Breadcrumb** | ❌ | - | Breadcrumb navigation |
| **Stepper** | ❌ | - | Multi-step wizard |
| **NavLink** | ❌ | - | Styled navigation link |
| **Menu** | ❌ | - | Dropdown menu |
| **MenuItem** | ❌ | - | Menu item |
| **ContextMenu** | ❌ | - | Right-click menu |
| **Command** | ❌ | - | Command palette (Cmd+K) |

---

### Overlay Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| Modal | ✅ | `Modal.jsx` | Dialog overlay |
| **Sheet** | ❌ | - | Side sheet (drawer) |
| **Drawer** | ❌ | - | Slide-out panel |
| **Popover** | ❌ | - | Content popover |
| **Tooltip** | ❌ | - | Hover tooltip |
| **HoverCard** | ❌ | - | Rich hover preview |
| **Dropdown** | ❌ | - | Dropdown container |

---

### Utility Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| CsvUploader | ✅ | `CsvUploader.jsx` | CSV file upload |
| ImageUploadModal | ✅ | `ImageUploadModal.jsx` | Image upload with crop |
| UserSearch | ✅ | `UserSearch.jsx` | User search autocomplete |
| UserSelector | ✅ | `UserSelector.jsx` | User selection widget |
| SelectedUsersList | ✅ | `SelectedUsersList.jsx` | Selected users display |
| RoleFilter | ✅ | `RoleFilter.jsx` | Role filter dropdown |
| QRCodeGenerator | ✅ | `QRCodeGenerator.jsx` | QR code display |
| AccessDenied | ✅ | `AccessDenied.jsx` | Access denied page |
| PWAInstallPrompt | ✅ | `PWAInstallPrompt.jsx` | PWA install prompt |
| **Collapsible** | ❌ | - | Collapsible section |
| **Accordion** | ❌ | - | Accordion panels |
| **ScrollArea** | ❌ | - | Custom scrollbar |
| **Resizable** | ❌ | - | Resizable panels |
| **CopyButton** | ❌ | - | Copy to clipboard |
| **VisuallyHidden** | ❌ | - | Screen reader only text |

---

### Typography Components

| Component | Status | Location | Description |
|-----------|--------|----------|-------------|
| **Heading** | ❌ | - | H1-H6 with consistent styling |
| **Text** | ❌ | - | Body text variants |
| **Label** | ❌ | - | Form label |
| **Caption** | ❌ | - | Small caption text |
| **Link** | ❌ | - | Styled anchor |
| **Highlight** | ❌ | - | Highlighted text |

---

## Component Specifications

### Button Variants

| Variant | Use Case | Background | Text |
|---------|----------|------------|------|
| `primary` | Main actions | `--color-primary` | White |
| `secondary` | Secondary actions | `--color-primary-bg` | `--color-primary` |
| `danger` | Destructive actions | `--color-danger` | White |
| `success` | Positive actions | `--color-success` | White |
| `outline` | Tertiary actions | Transparent | `--color-primary` |
| `ghost` | Subtle actions | Transparent | `--color-text-muted` |
| `white` | On dark backgrounds | White | `--color-text-body` |

### Button Sizes

| Size | Padding | Font Size | Height | Border Radius |
|------|---------|-----------|--------|---------------|
| `small` | `0.5rem 1rem` | 12px | 32px | 10px |
| `medium` | `0.625rem 1.25rem` | 14px | 40px | **12px** (default) |
| `large` | `0.75rem 1.5rem` | 16px | 48px | 14px |

> **Note:** Pill-style buttons (`border-radius: 9999px`) are available via the `rounded` prop but are NOT the default.

### Input Specification

```jsx
// Standard Input Props
{
  type: "text" | "email" | "password" | "number" | "date" | "time" | "tel" | "search",
  name: string,
  value: string | number,
  onChange: (e: Event) => void,
  placeholder?: string,
  icon?: ReactNode,           // Left icon
  error?: boolean | string,   // Error state/message
  disabled?: boolean,
  readOnly?: boolean,
  required?: boolean,
  min?: string | number,
  max?: string | number,
}
```

### Modal Specification

```jsx
// Modal Props
{
  title: string,
  children: ReactNode,
  onClose: () => void,
  width?: number | string,      // Default: 500px
  footer?: ReactNode,           // Footer content
  tabs?: Array<{label, value}>, // Optional tabs
  hideTitle?: boolean,
  fullHeight?: boolean,
}
```

### Card Specification

```jsx
// Card Props
{
  children: ReactNode,
  padding?: string,             // Default: "p-5 md:p-6"
  rounded?: string,             // Default: "rounded-[var(--radius-card)]"
  border?: boolean,             // Default: true
  shadow?: string,              // Default: var(--shadow-card)
  hoverShadow?: string,         // Default: var(--shadow-card-hover)
  onClick?: () => void,
}

// Sub-components
Card.Header - { icon, title, subtitle }
Card.Body
Card.Footer
```

---

## Missing Components - Priority Implementation

### Priority 1 (High - Create First)

1. **Switch/Toggle**
   ```jsx
   <Switch 
     checked={value} 
     onChange={handleChange}
     label="Enable notifications"
     size="md"
     disabled={false}
   />
   ```

2. **Radio / RadioGroup**
   ```jsx
   <RadioGroup value={selected} onChange={setSelected}>
     <Radio value="option1" label="Option 1" />
     <Radio value="option2" label="Option 2" />
   </RadioGroup>
   ```

3. **Badge**
   ```jsx
   <Badge variant="success" size="sm">Active</Badge>
   <Badge variant="danger" dot>3</Badge>
   ```

4. **Avatar**
   ```jsx
   <Avatar 
     src="/user.jpg" 
     alt="John Doe" 
     size="md"
     fallback="JD"
   />
   ```

5. **Tooltip**
   ```jsx
   <Tooltip content="This is helpful text">
     <Button>Hover me</Button>
   </Tooltip>
   ```

6. **Skeleton**
   ```jsx
   <Skeleton variant="text" width={200} />
   <Skeleton variant="circular" width={40} height={40} />
   <Skeleton variant="rectangular" height={200} />
   ```

7. **Alert**
   ```jsx
   <Alert variant="warning" title="Warning">
     This action cannot be undone.
   </Alert>
   ```

8. **Tabs**
   ```jsx
   <Tabs value={activeTab} onChange={setActiveTab}>
     <TabsList>
       <Tab value="tab1">Tab 1</Tab>
       <Tab value="tab2">Tab 2</Tab>
     </TabsList>
     <TabPanel value="tab1">Content 1</TabPanel>
     <TabPanel value="tab2">Content 2</TabPanel>
   </Tabs>
   ```

### Priority 2 (Medium)

9. **Progress**
10. **IconButton**
11. **Breadcrumb**
12. **Drawer/Sheet**
13. **Popover**
14. **Dropdown Menu**
15. **Accordion**
16. **Divider**
17. **Stack**
18. **Container**

### Priority 3 (Lower)

19. **Slider**
20. **DateRangePicker**
21. **Timeline**
22. **Stepper**
23. **Command Palette**
24. **AvatarGroup**
25. **HoverCard**
26. **Resizable**
27. **ScrollArea**

---

## Usage Guidelines

### Component Naming Convention

```
// File naming
ComponentName.jsx              // PascalCase

// Component export
export default ComponentName   // Default export preferred

// Props interface (if TypeScript)
interface ComponentNameProps { }
```

### Styling Guidelines

1. **Use CSS Variables** - Never hardcode colors
   ```jsx
   // ✅ Good
   style={{ color: 'var(--color-primary)' }}
   
   // ❌ Bad
   style={{ color: '#1360AB' }}
   ```

2. **Use Theme Tokens** - For spacing, radius, shadows
   ```jsx
   // ✅ Good
   className="rounded-[var(--radius-md)] p-[var(--spacing-4)]"
   
   // ❌ Bad
   className="rounded-lg p-4"
   ```

3. **Consistent Hover States** - Darker shades
   ```jsx
   // ✅ Good
   hover:bg-[var(--color-primary-hover)]
   
   // ❌ Bad
   hover:bg-[var(--color-primary-light)]  // Lighter is wrong!
   ```

### Import Pattern

```jsx
// UI Components (atomic)
import Input from "@/components/common/ui/Input"
import Select from "@/components/common/ui/Select"
import Checkbox from "@/components/common/ui/Checkbox"

// Common Components
import Button from "@/components/common/Button"
import Card from "@/components/common/Card"
import Modal from "@/components/common/Modal"

// Headers
import PageHeader from "@/components/common/PageHeader"

// Domain-specific Components
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
```

### Component Structure Template

```jsx
import React, { useState, forwardRef } from "react"

/**
 * ComponentName - Brief description
 * 
 * @param {string} prop1 - Description
 * @param {boolean} prop2 - Description
 */
const ComponentName = forwardRef(({
  prop1,
  prop2 = defaultValue,
  className = "",
  style = {},
  ...rest
}, ref) => {
  // State
  const [state, setState] = useState(initialValue)

  // Styles using theme variables
  const containerStyles = {
    backgroundColor: 'var(--color-bg-primary)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-4)',
    ...style,
  }

  return (
    <div 
      ref={ref}
      className={className}
      style={containerStyles}
      {...rest}
    >
      {/* Content */}
    </div>
  )
})

ComponentName.displayName = "ComponentName"

export default ComponentName
```

---

## Accessibility Standards

### Keyboard Navigation

All interactive components MUST support:
- `Tab` - Focus navigation
- `Enter/Space` - Activation
- `Escape` - Close/cancel
- `Arrow keys` - List navigation

### Focus Indicators

```css
/* All focusable elements must have visible focus */
:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
```

### ARIA Labels

```jsx
// Buttons with icons only
<button aria-label="Close modal">
  <XIcon />
</button>

// Form fields
<Input 
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
<span id="email-error" role="alert">
  {errorMessage}
</span>
```

### Color Contrast

| Text Type | Minimum Contrast |
|-----------|-----------------|
| Normal text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |

### Screen Reader Support

```jsx
// Loading states
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>

// Announcements
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

---

## File Structure

```
src/
├── components/
│   ├── common/
│   │   ├── ui/                    # Atomic UI components
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   ├── Radio.jsx          # NEW
│   │   │   ├── Switch.jsx         # NEW
│   │   │   ├── Textarea.jsx
│   │   │   ├── FileInput.jsx
│   │   │   ├── Slider.jsx         # NEW
│   │   │   └── index.js           # Barrel export
│   │   │
│   │   ├── layout/                # NEW: Layout components
│   │   │   ├── Container.jsx
│   │   │   ├── Stack.jsx
│   │   │   ├── Grid.jsx
│   │   │   ├── Divider.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── feedback/              # NEW: Feedback components
│   │   │   ├── Alert.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── navigation/            # NEW: Navigation components
│   │   │   ├── Tabs.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   ├── Menu.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── overlay/               # NEW: Overlay components
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Popover.jsx
│   │   │   ├── Drawer.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── data-display/          # NEW: Data display components
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Tag.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── typography/            # NEW: Typography components
│   │   │   ├── Heading.jsx
│   │   │   ├── Text.jsx
│   │   │   ├── Label.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── table/                 # Table components
│   │   │   ├── BaseTable.jsx
│   │   │   ├── DataTable.jsx      # NEW
│   │   │   └── index.js
│   │   │
│   │   ├── students/              # Student-specific components
│   │   │
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Pagination.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterTabs.jsx
│   │   ├── PageHeader.jsx
│   │   ├── LoadingState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── EmptyState.jsx
│   │   └── ...
│   │
│   ├── headers/                   # Page headers
│   ├── complaints/                # Complaint-specific
│   ├── events/                    # Event-specific
│   └── ...
│
├── styles/
│   └── index.css
│
├── theme.css                      # Design tokens
└── index.css                      # Global styles
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Create barrel exports (`index.js`) for all component folders
- [ ] Create `Switch` component
- [ ] Create `Radio` and `RadioGroup` components
- [ ] Create `Badge` component
- [ ] Create `Avatar` component
- [ ] Create `Tooltip` component

### Phase 2: Feedback & Display (Week 3-4)
- [ ] Create `Alert` component
- [ ] Create `Skeleton` component
- [ ] Create `Progress` component
- [ ] Create `Spinner` component
- [ ] Create `Tag` component
- [ ] Create `IconButton` component

### Phase 3: Navigation & Layout (Week 5-6)
- [ ] Create `Tabs` component (generic)
- [ ] Create `Breadcrumb` component
- [ ] Create `Divider` component
- [ ] Create `Stack` component
- [ ] Create `Container` component
- [ ] Create `Drawer/Sheet` component

### Phase 4: Advanced (Week 7-8)
- [ ] Create `Popover` component
- [ ] Create `Menu/Dropdown` component
- [ ] Create `Accordion` component
- [ ] Create `DateRangePicker` component
- [ ] Create `DataTable` component
- [ ] Create typography components

### Phase 5: Polish
- [ ] Update existing components for consistency
- [ ] Add Storybook documentation
- [ ] Add unit tests
- [ ] Performance optimization

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-30 | Initial design system documentation |

---

## Contributing

When creating new components:

1. Follow the component template structure
2. Use CSS variables from `theme.css`
3. Include proper JSDoc comments
4. Ensure keyboard accessibility
5. Test in both light and dark modes
6. Add to this documentation

---

*This design system is inspired by [shadcn/ui](https://ui.shadcn.com/) and tailored for the Hostel Management System.*
