# NoResults Component (`/src/components/common/NoResults.jsx`)

Displays a message indicating that no results were found, typically after a search or filter operation.

## Purpose and Functionality

This component provides a user-friendly placeholder when a list or table is empty due to filtering or search criteria. It renders:

- An icon (defaults to `FaBuilding` with a pulse animation) within a colored circle.
- A primary message (e.g., "No results found").
- A suggestion message (e.g., "Try changing your search or filter criteria").

It is visually similar to `EmptyState` but semantically used for situations where data exists but is filtered out.

## Props

| Prop         | Type            | Description                                                           | Default                                         | Required |
| :----------- | :-------------- | :-------------------------------------------------------------------- | :---------------------------------------------- | :------- |
| `icon`       | `React Element` | Optional React element (e.g., `<FaSearch />`) to display as the icon. | `undefined` (uses default `FaBuilding`)         | No       |
| `message`    | `string`        | The main message indicating no results were found.                    | `"No results found"`                            | No       |
| `suggestion` | `string`        | An optional suggestion for the user on how to find results.           | `"Try changing your search or filter criteria"` | No       |

## Usage Example

Used after filtering or searching data when the resulting list is empty.

```jsx
import React, { useState } from "react"
import SearchBar from "./SearchBar"
import NoResults from "./NoResults"
import { FaSearch } from "react-icons/fa"

function SearchableList({ items }) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-4">
      <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search..." className="mb-4" />

      {filteredItems.length > 0 ? (
        <ul>
          {filteredItems.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <NoResults
          message={`No items found matching "${searchTerm}"`}
          suggestion="Try a different search term or clear the search."
          icon={<FaSearch className="text-gray-300 text-3xl" />} // Optional custom icon
        />
      )}
    </div>
  )
}
```

## Dependencies

- `react-icons/fa`: Uses `FaBuilding` as the default icon.
