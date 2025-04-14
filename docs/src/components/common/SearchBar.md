# SearchBar Component (`/src/components/common/SearchBar.jsx`)

A styled search input component with an icon and clear button.

## Purpose and Functionality

Provides a standardized and visually enhanced text input field for search functionality. Key features include:

- **Styling:** Applies consistent border, background, and focus styling (border color change, shadow, underline effect) using Tailwind CSS.
- **Search Icon:** Displays a search icon (`FaSearch`) inside the input field.
- **Placeholder:** Supports customizable placeholder text.
- **Clear Button:** Shows a clear button (`FaTimes`) on the right side of the input when there is text entered, allowing the user to quickly clear the search query.
- **Focus Handling:** Tracks focus state to apply visual changes (icon color, border, underline effect).

## Props

| Prop          | Type     | Description                                                                                         | Default       | Required |
| :------------ | :------- | :-------------------------------------------------------------------------------------------------- | :------------ | :------- |
| `value`       | `string` | The current value of the search input.                                                              | -             | Yes      |
| `onChange`    | `func`   | Callback function invoked when the input value changes. Receives the standard input `event` object. | -             | Yes      |
| `placeholder` | `string` | Placeholder text displayed when the input is empty.                                                 | `"Search..."` | No       |
| `className`   | `string` | Additional CSS classes to apply to the root `div` element.                                          | `undefined`   | No       |

## Clear Functionality

The `handleClear` function simulates an `onChange` event with an empty value (`{ target: { value: "" } }`) to clear the input via the provided `onChange` prop.

## Usage Example

```jsx
import React, { useState } from "react"
import SearchBar from "./SearchBar"

function ItemList({ allItems }) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredItems = allItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-4">
      <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search items by name..." className="mb-4 max-w-sm" />

      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      {/* Optional: Add NoResults component if filteredItems is empty */}
    </div>
  )
}
```

## Dependencies

- `react-icons/fa`: Uses `FaSearch` and `FaTimes` icons.
