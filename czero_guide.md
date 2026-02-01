# CZero — AI Agent Guide

> **Complete reference for AI coding agents to use the CZero component library.**
> 
> Last Updated: January 18, 2026

---

## Quick Reference

| Item | Value |
|------|-------|
| **Package Name** | `czero` |
| **React Components** | `import { Button, Card, ... } from "czero/react"` |
| **CSS Generation** | `npx czero build --config czero.config.js --output czero.css` |
| **Class Prefix** | `cz-` (e.g., `cz-btn`, `cz-card`) |
| **CSS Variable Prefix** | `--cz-` (e.g., `--cz-color-primary`) |

---

## 1. Installation

```bash
npm install czero
```

**Peer Dependencies** (must be installed):
```bash
npm install react react-dom
```

---

## 2. Basic Setup

### Step 1: Generate CSS

Create a config file (optional, uses defaults if not provided):

```js
// czero.config.js
export default {
  color: {
    primary: { light: "222 47% 45%", dark: "210 80% 65%" },
  },
};
```

Run CLI:
```bash
npx czero build --config czero.config.js --output src/czero.css
```

### Step 2: Import CSS

```jsx
// main.jsx or App.jsx
import "./czero.css";
```

### Step 3: Use Components

```jsx
import { Button, Card, Input } from "czero/react";

function App() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Hello</Card.Title>
      </Card.Header>
      <Card.Body>
        <Input placeholder="Enter text" />
        <Button variant="primary">Submit</Button>
      </Card.Body>
    </Card>
  );
}
```

---

## 3. All Components (33 Total)

### Form Components

| Component | Import | Basic Usage |
|-----------|--------|-------------|
| **Button** | `Button` | `<Button variant="primary" size="md">Click</Button>` |
| **Input** | `Input` | `<Input placeholder="Text" size="md" />` |
| **Textarea** | `Textarea` | `<Textarea rows={4} />` |
| **Select** | `Select` | `<Select><Select.Trigger /><Select.Content>...</Select.Content></Select>` |
| **Checkbox** | `Checkbox` | `<Checkbox checked={true} onCheckedChange={fn} />` |
| **Switch** | `Switch` | `<Switch checked={true} onCheckedChange={fn} />` |
| **RadioGroup** | `RadioGroup` | `<RadioGroup><RadioGroup.Item value="a" /></RadioGroup>` |
| **Label** | `Label` | `<Label htmlFor="input">Name</Label>` |

### Display Components

| Component | Import | Basic Usage |
|-----------|--------|-------------|
| **Card** | `Card` | `<Card><Card.Header>...</Card.Header><Card.Body>...</Card.Body></Card>` |
| **Badge** | `Badge` | `<Badge variant="success">Active</Badge>` |
| **Tag** | `Tag` | `<Tag variant="primary" onRemove={fn}>Label</Tag>` |
| **Avatar** | `Avatar` | `<Avatar src="/img.jpg" fallback="JD" />` |
| **Separator** | `Separator` | `<Separator orientation="horizontal" />` |
| **Code** | `Code` | `<Code>const x = 1</Code>` |
| **Kbd** | `Kbd` | `<Kbd>⌘K</Kbd>` |

### Overlay Components

| Component | Import | Basic Usage |
|-----------|--------|-------------|
| **Dialog** | `Dialog` | `<Dialog><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Content>...</Dialog.Content></Dialog>` |
| **DropdownMenu** | `DropdownMenu` | `<DropdownMenu><DropdownMenu.Trigger>Menu</DropdownMenu.Trigger><DropdownMenu.Content>...</DropdownMenu.Content></DropdownMenu>` |
| **Tooltip** | `Tooltip` | `<Tooltip content="Help text"><Button>Hover</Button></Tooltip>` |

### Feedback Components

| Component | Import | Basic Usage |
|-----------|--------|-------------|
| **Alert** | `Alert` | `<Alert variant="success"><Alert.Title>Done</Alert.Title></Alert>` |
| **Toast** | `Toast`, `useToast` | `const { toast } = useToast(); toast({ title: "Saved" })` |
| **Progress** | `Progress` | `<Progress value={50} max={100} />` |
| **Skeleton** | `Skeleton` | `<Skeleton className="h-4 w-full" />` |
| **Spinner** | `Spinner` | `<Spinner size="md" />` |

### Navigation Components

| Component | Import | Basic Usage |
|-----------|--------|-------------|
| **Tabs** | `Tabs` | `<Tabs defaultValue="tab1"><Tabs.List><Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger></Tabs.List><Tabs.Content value="tab1">...</Tabs.Content></Tabs>` |
| **Accordion** | `Accordion` | `<Accordion type="single"><Accordion.Item value="a"><Accordion.Trigger>Q</Accordion.Trigger><Accordion.Content>A</Accordion.Content></Accordion.Item></Accordion>` |
| **Breadcrumb** | `Breadcrumb` | `<Breadcrumb><Breadcrumb.Item href="/">Home</Breadcrumb.Item></Breadcrumb>` |

### Data Components

| Component | Import | Basic Usage |
|-----------|--------|-------------|
| **Table** | `Table` | `<Table><Table.Header>...</Table.Header><Table.Body>...</Table.Body></Table>` |

### Layout Components

| Component | Import | Basic Usage |
|-----------|--------|-------------|
| **Stack** | `Stack` | `<Stack direction="column" gap="md">...</Stack>` |
| **Grid** | `Grid` | `<Grid cols={3} gap="lg">...</Grid>` |
| **Container** | `Container` | `<Container maxWidth="lg">...</Container>` |
| **AspectRatio** | `AspectRatio` | `<AspectRatio ratio={16/9}><img /></AspectRatio>` |
| **ScrollArea** | `ScrollArea` | `<ScrollArea className="h-[300px]">...</ScrollArea>` |
| **VisuallyHidden** | `VisuallyHidden` | `<VisuallyHidden>Screen reader only</VisuallyHidden>` |

---

## 4. Component Props Reference

### Button

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";  // "icon" for square icon-only buttons
  disabled?: boolean;
  loading?: boolean;
  asChild?: boolean;  // Render as child element
}
```

**Examples:**
```jsx
// Basic variants
<Button variant="primary" size="lg">Large Primary</Button>
<Button variant="danger" disabled>Disabled</Button>
<Button loading>Loading...</Button>

// With icons (icons are passed as children alongside text)
<Button><IconMail /> Send Email</Button>        {/* Icon on left */}
<Button>Download <IconDownload /></Button>      {/* Icon on right */}
<Button size="icon" variant="ghost"><IconSearch /></Button>  {/* Icon-only */}
```

### Input

```tsx
interface InputProps {
  size?: "sm" | "md" | "lg";
  error?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
```

**Examples:**
```jsx
<Input size="lg" placeholder="Large input" />
<Input error leftIcon={<IconSearch />} />
```

### Card

```tsx
// Card is composed of multiple parts
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Dialog

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger asChild>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Confirm Action</Dialog.Title>
      <Dialog.Description>Are you sure?</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>
```

### Select

```tsx
<Select value={value} onValueChange={setValue}>
  <Select.Trigger placeholder="Choose option" />
  <Select.Content>
    <Select.Item value="a">Option A</Select.Item>
    <Select.Item value="b">Option B</Select.Item>
    <Select.Separator />
    <Select.Item value="c">Option C</Select.Item>
  </Select.Content>
</Select>
```

### Tabs

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Account</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Account content</Tabs.Content>
  <Tabs.Content value="tab2">Settings content</Tabs.Content>
</Tabs>
```

### Table

```tsx
<Table>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Email</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John</Table.Cell>
      <Table.Cell>john@example.com</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

---

## 5. CSS Classes (For Custom HTML)

If not using React components, you can use CSS classes directly:

### Button Classes

```html
<button class="cz-btn cz-btn-primary cz-btn-md">Primary Button</button>
<button class="cz-btn cz-btn-outline cz-btn-sm">Small Outline</button>
<button class="cz-btn cz-btn-danger cz-btn-lg" disabled>Disabled</button>
```

**Pattern:** `cz-btn cz-btn-{variant} cz-btn-{size}`

### Input Classes

```html
<input class="cz-input cz-input-md" placeholder="Default input" />
<input class="cz-input cz-input-lg cz-input-error" />
```

### Card Classes

```html
<div class="cz-card">
  <div class="cz-card-header">
    <h3 class="cz-card-title">Title</h3>
    <p class="cz-card-description">Description</p>
  </div>
  <div class="cz-card-body">Content</div>
  <div class="cz-card-footer">Footer</div>
</div>
```

### Badge Classes

```html
<span class="cz-badge cz-badge-primary cz-badge-md">Primary</span>
<span class="cz-badge cz-badge-success cz-badge-sm">Success</span>
```

### Common Utility Classes

```html
<div class="cz-flex cz-items-center cz-gap-2">...</div>
<div class="cz-flex-col cz-gap-1">...</div>
<span class="cz-text-sm cz-font-medium">Text</span>
<div class="cz-bg-primary cz-text-white cz-p-lg">Box</div>
```

---

## 6. Configuration System

### Full Config Structure

```js
// czero.config.js
export default {
  // ═══════════════════════════════════════════════════
  // GLOBAL DESIGN TOKENS
  // ═══════════════════════════════════════════════════
  
  color: {
    bg: { light: "0 0% 100%", dark: "220 40% 3%" },
    fg: { light: "220 15% 10%", dark: "210 40% 96%" },
    primary: { light: "222 47% 45%", dark: "210 80% 65%" },
    primaryFg: { light: "0 0% 100%", dark: "220 40% 3%" },
    secondary: { light: "220 10% 95%", dark: "220 8% 25%" },
    secondaryFg: { light: "220 15% 10%", dark: "210 40% 96%" },
    muted: { light: "220 10% 95%", dark: "220 8% 20%" },
    mutedFg: { light: "220 10% 40%", dark: "220 10% 60%" },
    danger: { light: "0 70% 55%", dark: "0 80% 65%" },
    dangerFg: { light: "0 0% 100%", dark: "0 0% 100%" },
    success: { light: "142 70% 45%", dark: "142 70% 55%" },
    successFg: { light: "0 0% 100%", dark: "0 0% 100%" },
    warning: { light: "38 92% 50%", dark: "38 92% 60%" },
    warningFg: { light: "0 0% 100%", dark: "0 0% 0%" },
    border: { light: "220 13% 90%", dark: "220 10% 20%" },
    ring: { light: "222 47% 45%", dark: "210 80% 65%" },
  },
  
  radius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  
  shadow: {
    none: "none",
    sm: "0 1px 2px rgb(0 0 0 / 0.05)",
    md: "0 2px 4px rgb(0 0 0 / 0.08)",
    lg: "0 4px 12px rgb(0 0 0 / 0.12)",
  },
  
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
  },
  
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    size: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    },
    weight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  
  transition: {
    fast: "150ms ease",
    normal: "200ms ease",
    slow: "300ms ease",
  },

  // ═══════════════════════════════════════════════════
  // COMPONENT-LEVEL CUSTOMIZATION
  // ═══════════════════════════════════════════════════
  
  components: {
    button: {
      height: { sm: "2rem", md: "2.5rem", lg: "3rem" },
      paddingX: { sm: "0.75rem", md: "1rem", lg: "1.5rem" },
      fontSize: { sm: "$font-size-sm", md: "$font-size-md", lg: "$font-size-lg" },
      fontWeight: "$font-weight-medium",
      borderRadius: "$radius-md",
      gap: "0.5rem",
      
      states: {
        hover: { opacity: "0.9" },
        focus: { ringWidth: "2px", ringOffset: "2px", ringColor: "$color-ring" },
        disabled: { opacity: "0.5" },
      },
      
      // Override existing variants
      variants: {
        primary: {
          bg: "hsl(var(--cz-color-primary))",
          color: "hsl(var(--cz-color-primaryFg))",
          hover: { opacity: "0.9" },
        },
        // Add NEW custom variants
        success: {
          bg: "#10b981",
          color: "white",
          hover: { opacity: "0.85" },
        },
        gradient: {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        },
      },
    },
    
    input: {
      height: { sm: "2rem", md: "2.5rem", lg: "3rem" },
      borderRadius: "$radius-md",
      borderColor: "$color-border",
    },
    
    card: {
      padding: "$spacing-lg",
      borderRadius: "$radius-lg",
      shadow: "$shadow-sm",
    },
    
    badge: {
      borderRadius: "$radius-full",
      fontSize: { sm: "0.65rem", md: "0.75rem" },
    },
    
    // ... other components
  },
};
```

### Token References

Use `$` prefix to reference global tokens in component config:

```js
components: {
  button: {
    borderRadius: "$radius-lg",      // → var(--cz-radius-lg)
    fontSize: "$font-size-md",       // → var(--cz-font-size-md)
    fontWeight: "$font-weight-bold", // → var(--cz-font-weight-bold)
  },
}
```

---

## 7. Dark Mode

### Enabling Dark Mode

Add `.dark` class to root element:

```html
<html class="dark">
```

### Using useTheme Hook

```jsx
import { useTheme, ThemeProvider } from "czero/react";

function App() {
  return (
    <ThemeProvider>
      <MyApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme}>
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}
```

---

## 8. CLI Reference

### Commands

```bash
# Basic usage (uses czero.config.js, outputs to czero.css)
npx czero build

# Custom config and output
npx czero build --config my-theme.js --output src/styles/czero.css

# Apply built-in presets
npx czero build --preset compact
npx czero build --preset rounded --preset minimal

# Show help
npx czero build --help
```

### Available Presets

| Preset | Description |
|--------|-------------|
| `compact` | Smaller spacing and component sizes |
| `comfortable` | Larger, more spacious layout |
| `rounded` | Larger border radii |
| `sharp` | No border radius (square corners) |
| `minimal` | Subtle shadows and muted colors |
| `vibrant` | Bold, saturated colors |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--config <path>` | Path to config file | `czero.config.js` |
| `--output <path>` | Output CSS file path | `czero.css` |
| `--preset <name>` | Apply a built-in preset (can be used multiple times) | - |
| `--help, -h` | Show help message | - |

---

## 9. CSS Variables Reference

### Color Variables

```css
--cz-color-bg          /* Background color */
--cz-color-fg          /* Foreground/text color */
--cz-color-primary     /* Primary brand color */
--cz-color-primaryFg   /* Text on primary background */
--cz-color-secondary   /* Secondary color */
--cz-color-secondaryFg /* Text on secondary background */
--cz-color-muted       /* Muted background */
--cz-color-mutedFg     /* Muted text */
--cz-color-danger      /* Error/danger color */
--cz-color-dangerFg    /* Text on danger background */
--cz-color-success     /* Success color */
--cz-color-successFg   /* Text on success background */
--cz-color-warning     /* Warning color */
--cz-color-warningFg   /* Text on warning background */
--cz-color-border      /* Border color */
--cz-color-ring        /* Focus ring color */
```

**Usage in CSS:**
```css
.my-element {
  background-color: hsl(var(--cz-color-primary));
  color: hsl(var(--cz-color-primaryFg));
  border: 1px solid hsl(var(--cz-color-border));
}
```

### Spacing Variables

```css
--cz-spacing-xs   /* 0.25rem */
--cz-spacing-sm   /* 0.5rem */
--cz-spacing-md   /* 0.75rem */
--cz-spacing-lg   /* 1rem */
--cz-spacing-xl   /* 1.5rem */
--cz-spacing-2xl  /* 2rem */
```

### Radius Variables

```css
--cz-radius-none  /* 0 */
--cz-radius-sm    /* 0.25rem */
--cz-radius-md    /* 0.5rem */
--cz-radius-lg    /* 0.75rem */
--cz-radius-xl    /* 1rem */
--cz-radius-full  /* 9999px (circular) */
```

### Typography Variables

```css
--cz-font-fontFamily        /* Font family */
--cz-font-size-xs           /* 0.75rem */
--cz-font-size-sm           /* 0.875rem */
--cz-font-size-md           /* 1rem */
--cz-font-size-lg           /* 1.125rem */
--cz-font-size-xl           /* 1.25rem */
--cz-font-weight-normal     /* 400 */
--cz-font-weight-medium     /* 500 */
--cz-font-weight-semibold   /* 600 */
--cz-font-weight-bold       /* 700 */
--cz-font-lineHeight-tight  /* 1.25 */
--cz-font-lineHeight-normal /* 1.5 */
```

### Shadow Variables

```css
--cz-shadow-none  /* none */
--cz-shadow-sm    /* 0 1px 2px rgb(0 0 0 / 0.05) */
--cz-shadow-md    /* 0 2px 4px rgb(0 0 0 / 0.08) */
--cz-shadow-lg    /* 0 4px 12px rgb(0 0 0 / 0.12) */
```

### Transition Variables

```css
--cz-transition-fast   /* 150ms ease */
--cz-transition-normal /* 200ms ease */
--cz-transition-slow   /* 300ms ease */
```

---

## 10. Common Patterns

### Form with Validation

```jsx
import { Input, Button, Label } from "czero/react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <form>
      <div className="cz-flex-col cz-gap-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          placeholder="you@example.com"
        />
        {error && <span className="cz-text-sm" style={{ color: "hsl(var(--cz-color-danger))" }}>{error}</span>}
      </div>
      <Button type="submit" variant="primary" className="cz-w-full">
        Sign In
      </Button>
    </form>
  );
}
```

### Modal Confirmation

```jsx
import { Dialog, Button } from "czero/react";

function DeleteConfirmation({ onConfirm }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="danger">Delete</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Delete Item</Dialog.Title>
          <Dialog.Description>
            This action cannot be undone.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => { onConfirm(); setOpen(false); }}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
```

### Data Table with Actions

```jsx
import { Table, Badge, Button, DropdownMenu } from "czero/react";

function UserTable({ users }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>
              <Badge variant={user.active ? "success" : "secondary"}>
                {user.active ? "Active" : "Inactive"}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="sm">•••</Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>Edit</DropdownMenu.Item>
                  <DropdownMenu.Item>Delete</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
```

### Settings Page with Tabs

```jsx
import { Tabs, Card, Switch, Label, Input, Button } from "czero/react";

function SettingsPage() {
  return (
    <Card>
      <Tabs defaultValue="general">
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="general">
          <div className="cz-flex-col cz-gap-2">
            <Label>Display Name</Label>
            <Input placeholder="John Doe" />
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="notifications">
          <div className="cz-flex cz-items-center cz-gap-2">
            <Switch id="emails" />
            <Label htmlFor="emails">Email notifications</Label>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="security">
          <Button variant="danger">Reset Password</Button>
        </Tabs.Content>
      </Tabs>
    </Card>
  );
}
```

---

## 11. Accessibility Notes

CZero uses **Radix UI primitives** for interactive components, providing:

- ✅ Full keyboard navigation
- ✅ ARIA attributes
- ✅ Focus management
- ✅ Screen reader support
- ✅ Click-outside handling
- ✅ Escape key dismissal

### Keyboard Shortcuts

| Component | Keys |
|-----------|------|
| **Dialog** | `Escape` to close |
| **DropdownMenu** | `↑↓` to navigate, `Enter` to select, `Escape` to close |
| **Tabs** | `←→` to switch tabs |
| **Select** | `↑↓` to navigate, `Enter` to select |
| **Checkbox** | `Space` to toggle |
| **Switch** | `Space` to toggle |
| **Accordion** | `↑↓` to navigate, `Enter/Space` to toggle |

---

## 12. TypeScript Support

All components are fully typed:

```tsx
import type { ButtonProps, InputProps, CardProps } from "czero/react";

// Component props are available
const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

---

## 13. Package Exports

```js
// React components
import { Button, Card, Input, ... } from "czero/react";

// Hooks
import { useTheme, ThemeProvider, useToast } from "czero/react";

// Pre-built styles (for library development)
import "czero/styles.css";
import "czero/components.css";
import "czero/reset.css";

// Theme presets (for extending)
import { compact, comfortable, rounded } from "czero/presets";
```

---

## 14. Summary

| What | How |
|------|-----|
| **Install** | `npm install czero` |
| **Generate CSS** | `npx czero build` |
| **Import CSS** | `import "./czero.css"` |
| **Use Components** | `import { Button } from "czero/react"` |
| **Customize Theme** | Create `czero.config.js` with overrides |
| **Component Tokens** | Add `components: { button: { ... } }` to config |
| **Dark Mode** | Add `.dark` class or use `useTheme()` hook |
| **CSS Classes** | Use `cz-` prefix (e.g., `cz-btn-primary`) |
| **CSS Variables** | Use `--cz-` prefix (e.g., `--cz-color-primary`) |
