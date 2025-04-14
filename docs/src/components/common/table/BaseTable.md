# BaseTable Component (`/src/components/common/table/BaseTable.jsx`)

A reusable component for displaying data in a styled table.

## Purpose and Functionality

Provides a standardized way to render tabular data with features like:

- Configurable column definitions (header text, data key, custom rendering, alignment, styling).
- Data rendering based on the provided `data` array and `columns` configuration.
- Optional row click handling (`onRowClick`).
- Built-in loading state display (spinner).
- Built-in empty state display (icon and message).
- Optional table title.
- Optional sticky table header.
- Basic styling (borders, padding, hover effects, alternating row colors).

## Props

| Prop           | Type     | Description                                                                                                         | Default                | Required |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------ | :--------------------- | :------- |
| `columns`      | `array`  | An array of column definition objects. See **Column Definition** below.                                             | -                      | Yes      |
| `data`         | `array`  | An array of data objects to display in the table rows.                                                              | -                      | Yes      |
| `onRowClick`   | `func`   | Optional callback function invoked when a table row is clicked. Receives the data item for that row as an argument. | `undefined`            | No       |
| `emptyMessage` | `string` | The message to display when `isLoading` is false and the `data` array is empty.                                     | `"No data to display"` | No       |
| `isLoading`    | `bool`   | If `true`, displays a loading spinner covering the table body.                                                      | `false`                | No       |
| `stickyHeader` | `bool`   | If `true`, makes the table header (`<thead>`) stick to the top when scrolling vertically within its container.      | `false`                | No       |
| `title`        | `string` | An optional title to display above the table within the card structure.                                             | `undefined`            | No       |
| `className`    | `string` | Optional additional CSS classes to apply to the root `div` container of the table.                                  | `""`                   | No       |

## Column Definition

Each object in the `columns` array defines a table column and can have the following properties:

| Property             | Type     | Description                                                                                                                       | Required                   |
| :------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------- |
| `header`             | `string` | The text to display in the table header (`<th>`) for this column. (Ignored if `customHeaderRender` is provided).                  | Yes                        |
| `key`                | `string` | The key in the data object whose value should be displayed in this column's cells. (Ignored if `render` is provided).             | Yes (if `render` not used) |
| `render`             | `func`   | Optional function to customize the rendering of cells in this column. Receives the data item for the row (`item`) as an argument. | No                         |
| `customHeaderRender` | `func`   | Optional function to customize the rendering of the header cell (`<th>`) for this column.                                         | No                         |
| `className`          | `string` | Optional CSS classes to apply specifically to the cells (`<td>` and `<th>`) in this column.                                       | No                         |
| `align`              | `string` | Optional alignment for the content in this column's cells. Can be set to `"right"` for right alignment (defaults to left).        | No                         |

## Rendering Logic

- **Header:** Renders `column.customHeaderRender()` if provided, otherwise `column.header`.
- **Cell:** Renders the output of `column.render(item)` if provided, otherwise accesses the data using `item[column.key]`.

## Usage Example

```jsx
import React, { useState, useEffect } from "react"
import BaseTable from "./BaseTable" // Adjust path as needed
import StatusBadge from "../StatusBadge" // Example related component
import Pagination from "../Pagination" // Example related component

function UserList() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Mock data fetching
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const fetchedData = [
        { id: 1, name: "Alice Smith", email: "alice@example.com", role: "Student", status: "Checked In" },
        { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "Warden", status: "Checked Out" },
        // ... more users
      ]
      setUsers(fetchedData) // Assume pagination happens server-side usually
      setTotalPages(5) // Mock total pages
      setIsLoading(false)
    }, 1000)
  }, [currentPage])

  const handleRowClick = (user) => {
    console.log("Clicked on user:", user.name)
    // Navigate to user detail page or open a modal
  }

  const columns = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Role", key: "role" },
    {
      header: "Status",
      key: "status",
      render: (item) => <StatusBadge status={item.status} />, // Use custom render for badge
    },
    {
      header: "Actions",
      align: "right",
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            console.log("Edit user:", item.id)
          }}
          className="text-blue-600 hover:text-blue-800 text-xs"
        >
          Edit
        </button>
      ),
    },
  ]

  return (
    <div className="p-4">
      <BaseTable columns={columns} data={users} isLoading={isLoading} onRowClick={handleRowClick} emptyMessage="No users found." stickyHeader title="User Management" />
      <Pagination currentPage={currentPage} totalPages={totalPages} paginate={setCurrentPage} />
    </div>
  )
}
```
