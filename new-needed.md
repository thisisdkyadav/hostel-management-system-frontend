# New UI Components Needed

This file lists UI components that could be added to `@/components/ui` based on shadcn/ui standards and common patterns found in the codebase.

---

## High Priority Components

### 1. Calendar / DatePicker
**Priority:** High  
**Why Needed:**
- Multiple date inputs in the application (AddEventModal.jsx line 93 uses native `<input type="datetime-local">`)
- Better UX for date selection with calendar visualization
- Needed for event management, date filters, and scheduling features
- Inconsistent styling across browsers with native datetime input

**Current Usage:**
```jsx
// AddEventModal.jsx line 93 - native datetime picker
<input type="datetime-local" />

// Various filter forms - native date inputs
<input type="date" />
```

**Recommended Implementation:**
- Popover-based calendar picker
- Support for date only or date + time
- Range selection support for date ranges
- Consistent styling with other UI components
- Time picker integration for datetime inputs

---

### 2. DropdownMenu
**Priority:** Medium-High  
**Why Needed:**
- Custom dropdown implementations in Sidebar.jsx, BottomBar.jsx, and other navigation components
- Profile menus, action menus, and user settings need standardized dropdown behavior
- Better accessibility and keyboard navigation compared to custom implementations
- Reusable pattern for menu actions throughout the app

**Current Usage:**
- Sidebar.jsx has custom navigation with dropdowns
- BottomBar.jsx has similar custom navigation
- Various action menus in admin components

**Recommended Implementation:**
- Popover-based dropdown menu
- Support for icons, separators, and keyboard navigation
- Trigger variants: hover, click
- Submenu support for nested menus
- Checkbox/radio item support for multi-select

---

## Medium Priority Components

### 3. Collapsible
**Priority:** Medium  
**Why Needed:**
- Expandable filter panels throughout the application (various FilterPanel components)
- Settings panels that can be collapsed
- Better UX for managing large forms or content
- FAQ sections (seen in About page)

**Current Usage:**
- Filter panels in various admin pages
- Expandable sections in forms
- Custom collapse implementations with state

**Recommended Implementation:**
- Animated height transitions
- Support for controlled and uncontrolled modes
- Custom trigger button styling
- Accessible with keyboard (ARIA)

---

### 4. AlertDialog
**Priority:** Medium  
**Why Needed:**
- Currently using native `confirm()` and `alert()` in some places
- Have `ConfirmDialog` but AlertDialog is the shadcn/ui standard
- Better for destructive actions with confirmation
- Consistent with shadcn/ui patterns
- Some places use custom confirmation dialogs

**Current Usage:**
```jsx
// Using native confirm() in some files
if (confirm("Are you sure?")) { }

// Custom ConfirmDialog.jsx exists but could be aligned with shadcn/ui pattern
```

**Recommended Implementation:**
- Confirm dialog for destructive actions
- Warning/error states
- Action button styling (danger for destructive)
- Modal-like overlay with focus management
- Consistent with Modal component design

---

### 5. ScrollArea
**Priority:** Medium  
**Why Needed:**
- Custom scrollable areas in Modal.jsx, tables, and list containers
- Tables and lists that need consistent scroll behavior
- Mobile-friendly scrollbars
- Cross-browser consistent scrollbar styling
- Multiple places implement custom scrollbar styling

**Current Usage:**
- Modal content overflow
- Table containers with custom scrolling
- List containers with max-height and scroll
- Filter panels with scrolling

**Recommended Implementation:**
- Custom scrollbar styling (hide or customize)
- Auto-hide options
- Scroll position tracking
- Smooth scrolling support
- Cross-browser consistent appearance

---

### 6. ToggleGroup
**Priority:** Medium  
**Why Needed:**
- Already have custom ToggleButtonGroup in common/ToggleButtonGroup.jsx and common/FilterTabs.jsx
- Standardized toggle button groups for filters
- Single-select and multi-select modes
- Better than using ButtonGroup for toggle behavior
- Aligns with shadcn/ui ToggleGroup component

**Current Usage:**
```jsx
// common/ToggleButtonGroup.jsx - custom implementation
// common/FilterTabs.jsx - custom implementation
// Used for view toggles, filter options, etc.
```

**Recommended Implementation:**
- Button group with single/multi select
- Outline and pill variants
- Size variants
- Consistent with Button component styling
- Support for icons and labels

---

### 7. Stepper
**Priority:** Medium  
**Why Needed:**
- Multi-step forms throughout the application (student registration, onboarding, etc.)
- Complex processes that need step-by-step guidance
- Better UX for long forms
- Progress indication for multi-step workflows

**Current Usage:**
- Student registration forms (could use stepper)
- Complaint submission workflows
- Various multi-step modals

**Recommended Implementation:**
- Step indicator with labels
- Progress bar visualization
- Navigate between steps
- Step validation
- Summary/review step

---

## Low Priority Components

### 8. Accordion
**Priority:** Low  
**Why Needed:**
- FAQ sections (seen in About page)
- Expandable content sections
- Documentation-style content
- Settings pages with collapsible sections

**Current Usage:**
- Minimal usage in informational pages
- Some settings sections

**Recommended Implementation:**
- Multiple collapsible sections
- Allow single or multiple open items
- Icon rotation on expand
- Custom content styling
- Accessible with keyboard

---

### 9. Command
**Priority:** Low  
**Why Needed:**
- Command palette for power users
- Quick navigation and actions
- Search functionality across the app
- Not currently implemented

**Current Usage:**
- Not currently implemented
- Could be added as an advanced feature

**Recommended Implementation:**
- Search with keyboard shortcuts (Cmd+K / Ctrl+K)
- Fuzzy search across items
- Keyboard navigation
- Grouped items with categories
- Recent items history

---

### 10. ContextMenu
**Priority:** Low  
**Why Needed:**
- Right-click menus for actions
- Currently not used heavily
- Nice-to-have for advanced interactions
- Common in table row actions

**Current Usage:**
- Rare usage in the current codebase
- Some places could benefit from context menus

**Recommended Implementation:**
- Triggered by right-click or long-press
- Custom menu items
- Separator support
- Destructive action styling
- Keyboard accessible

---

### 11. Hover Card
**Priority:** Low  
**Why Needed:**
- Rich hover states for user profiles
- Preview cards on hover
- Better UX for profile information
- Tooltips with more content

**Current Usage:**
- Could enhance user profile displays
- Not currently implemented

**Recommended Implementation:**
- Popover with hover trigger
- Delay controls (debounce)
- Custom content layout
- Arrow indicator
- Card-style content

---

### 12. Slider
**Priority:** Low  
**Why Needed:**
- Range inputs for numeric values
- Currently not used in the codebase
- Could be useful for settings, filters, etc.
- Future-proofing for features that might need range inputs

**Current Usage:**
- No current usage
- Future features might need it

**Recommended Implementation:**
- Single and range modes
- Step value support
- Tick marks
- Value labels
- Min/max constraints

---

### 13. Dialog
**Priority:** Low  
**Why Needed:**
- Already have Modal which covers most use cases
- Dialog is lighter-weight than Modal (no header by default)
- Could be used for simpler confirmations or prompts
- Alternative to Modal for simple content

**Current Usage:**
- Modal.jsx covers most dialog needs
- Some simple dialogs could use Dialog instead

**Recommended Implementation:**
- Smaller footprint than Modal
- No header/footer required
- Centered by default
- Focus trap support
- Consistent with Modal styling

---

### 14. FormField (Enhanced)
**Priority:** Low  
**Why Needed:**
- Have FormField in common/, but could be enhanced
- Better form validation integration
- Grouping related fields
- Consistent error display
- Help text and descriptions

**Current Usage:**
```jsx
// common/FormField.jsx exists but could be enhanced
// Used throughout forms but could be more feature-rich
```

**Recommended Implementation:**
- Integrated validation
- Help text
- Error message display
- Label + field grouping
- Consistent spacing

---

### 15. Chip / Select (Multi-select enhancement)
**Priority:** Low  
**Why Needed:**
- Multi-select tags/chips for filtering
- Tag input with autocomplete
- Better UX for multi-value selection
- Currently have MultiSelectDropdown in common/

**Current Usage:**
```jsx
// common/MultiSelectDropdown.jsx - custom implementation
// Used for multi-select filters throughout app
```

**Recommended Implementation:**
- Chip with remove button
- Multi-select input with autocomplete
- Tag selection
- Clear all functionality
- Consistent with other UI components

---

## Already Have (No Action Needed)

✅ **Button** - Have Button, IconButton, ButtonGroup  
✅ **Card** - Have Card with subcomponents (CardHeader, CardTitle, CardDescription, CardContent, CardBody, CardFooter)  
✅ **Checkbox** - Have Checkbox component  
✅ **Form Components** - Have Input, Textarea, Select, Radio, RadioGroup, Switch, FileInput, SearchInput, FormField  
✅ **Label** - Have Label component  
✅ **Popover** - Have Popover component  
✅ **Progress** - Have Progress component  
✅ **Radio** - Have Radio and RadioGroup  
✅ **Select** - Have Select component  
✅ **Separator** - Have Divider (equivalent)  
✅ **Switch** - Have Switch component  
✅ **Table** - Have Table and DataTable (with TableHeader, TableCell, TableRow)  
✅ **Tabs** - Have Tabs, Tab, TabPanel (with TabList, TabPanels)  
✅ **Toast** - Have Toast and ToastProvider  
✅ **Tooltip** - Have Tooltip component  
✅ **Badge** - Have Badge component  
✅ **Avatar** - Have Avatar and AvatarGroup  
✅ **Alert** - Have Alert component  
✅ **Skeleton** - Have Skeleton component  
✅ **Spinner** - Have Spinner component  
✅ **Drawer** - Have Drawer component  
✅ **ConfirmDialog** - Have ConfirmDialog component  
✅ **Modal** - Have Modal component with tabs support  
✅ **Breadcrumb** - Have Breadcrumb component  
✅ **Pagination** - Have Pagination component  
✅ **Stack** - Have Stack, HStack, VStack  
✅ **Container** - Have Container component  
✅ **Divider** - Have Divider component  
✅ **Spacer** - Have Spacer component  
✅ **Text** - Have Text component  
✅ **Heading** - Have Heading component  
✅ **Tag** - Have Tag component  
✅ **StatusBadge** - Have StatusBadge component  
✅ **StatCard** - Have StatCard and StatCards components  
✅ **EmptyState** - Have EmptyState component  
✅ **LoadingState** - Have LoadingState component  
✅ **ErrorState** - Have ErrorState component  

---

## Implementation Priority Summary

### Phase 1 - Immediate (Next Sprint)
1. **Calendar / DatePicker** - Critical for UX, replaces native datetime inputs
2. **DropdownMenu** - Replaces custom implementations in navigation

### Phase 2 - Short Term (Within 2 Sprints)
3. **ToggleGroup** - Standardize filter controls, replace common/ToggleButtonGroup
4. **Collapsible** - Better UX for expandable content (filters, FAQs)
5. **AlertDialog** - Replace native confirm() and align with shadcn/ui

### Phase 3 - Medium Term (Within 4 Sprints)
6. **ScrollArea** - Consistent scroll behavior across the app
7. **Stepper** - Improve UX for multi-step forms
8. **FormField (Enhanced)** - Better form validation integration

### Phase 4 - Long Term (Future Features)
9. **Command** - Power user features, command palette
10. **ContextMenu** - Advanced interactions
11. **Hover Card** - Enhanced UX for profiles
12. **Accordion** - FAQ and documentation
13. **Slider** - Future-proofing for range inputs
14. **Dialog** - Alternative to Modal for simple dialogs
15. **Chip/Select** - Enhanced multi-select

---

## Design Guidelines for New Components

All new components should follow these guidelines:

1. **Consistent Styling:**
   - Use CSS variables from `theme.css`
   - Follow the same color patterns as existing components
   - Support `className` and `style` props for customization

2. **Accessibility:**
   - Include ARIA labels where appropriate
   - Support keyboard navigation
   - Include focus indicators
   - Use semantic HTML elements

3. **Responsive:**
   - Mobile-first approach
   - Responsive variants where applicable
   - Touch-friendly on mobile

4. **API Design:**
   - Intuitive prop names
   - Provide sensible defaults
   - Support controlled and uncontrolled modes
   - Include TypeScript prop types (when TS is adopted)

5. **Documentation:**
   - Add prop types or TypeScript interfaces
   - Include usage examples
   - Document accessibility features
   - Update docs/ui.md with new components

---

## Notes

- All components should follow the same design patterns as existing UI components
- Use the same color variables from `theme.css`
- Support `className` and `style` props for customization
- Include TypeScript prop types (when TS is adopted)
- Follow accessibility standards (ARIA labels, keyboard navigation)
- Include responsive variants where applicable
