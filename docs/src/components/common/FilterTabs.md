# FilterTabs Component (`/src/components/common/FilterTabs.jsx`)

This component renders a set of tabs for filtering data or switching views.

## Purpose and Functionality

`FilterTabs` displays a row of clickable tabs, visually indicating the currently active tab. It utilizes the common `Button` component for each tab, allowing for consistent styling and interaction (like the ripple animation).

## Props

| Prop           | Type    | Description                                                                                                  | Default | Required |
| :------------- | :------ | :----------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `tabs`         | `array` | An array of tab objects. Each object should have a `value` (unique identifier) and a `label` (display text). | -       | Yes      |
| `activeTab`    | `any`   | The `value` of the currently active tab. Used to apply the active styling.                                   | -       | Yes      |
| `setActiveTab` | `func`  | A callback function that is called with the `value` of the clicked tab when a tab is selected.               | -       | Yes      |

## Tab Object Structure

Each object in the `tabs` array should follow this structure:

```typescript
{
  label: string // Text displayed on the tab
  value: any // Unique identifier for the tab (can be string, number, etc.)
}
```

## Usage Example

```jsx
import React, { useState } from "react"
import FilterTabs from "./FilterTabs"

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
]

function ComplaintList() {
  const [currentFilter, setCurrentFilter] = useState("all")

  // Further logic to filter data based on currentFilter...

  return (
    <div>
      <FilterTabs tabs={TABS} activeTab={currentFilter} setActiveTab={setCurrentFilter} />
      {/* ... display filtered list ... */}
    </div>
  )
}
```

## Dependencies

- `./Button` - Uses the common Button component for rendering individual tabs.
