# Pagination Component (`/src/components/common/Pagination.jsx`)

A component for rendering pagination controls (page numbers, previous/next buttons).

## Purpose and Functionality

Used typically below tables or lists, this component allows users to navigate through large sets of data divided into pages. It provides:

- A display of the current page number and total pages.
- "Previous" and "Next" buttons, which are disabled when on the first or last page, respectively.
- A set of clickable page number buttons.
- Logic to display a limited window of page numbers (up to 5) centered around the current page, especially when the total number of pages is large.

## Props

| Prop          | Type     | Description                                                                                                                  | Default | Required |
| :------------ | :------- | :--------------------------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `currentPage` | `number` | The currently active page number.                                                                                            | -       | Yes      |
| `totalPages`  | `number` | The total number of available pages.                                                                                         | -       | Yes      |
| `paginate`    | `func`   | Callback function invoked when a page number or previous/next is clicked. It receives the target page number as an argument. | -       | Yes      |

## Page Number Display Logic

The component displays up to 5 page number buttons:

- If `totalPages <= 5`, all page numbers are shown.
- If `totalPages > 5`:
  - If `currentPage <= 3`, pages 1 through 5 are shown.
  - If `currentPage >= totalPages - 2`, the last 5 pages are shown.
  - Otherwise, the current page and the two pages before and after it are shown (e.g., if current is 7, pages 5, 6, 7, 8, 9 are shown).

## Usage Example

```jsx
import React, { useState, useEffect } from "react"
import Pagination from "./Pagination"
import LoadingState from "./LoadingState"
import ErrorState from "./ErrorState"

const ITEMS_PER_PAGE = 10

function PaginatedList() {
  const [items, setItems] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Example API call with pagination parameters
        const response = await fetch(`/api/items?page=${currentPage}&limit=${ITEMS_PER_PAGE}`)
        if (!response.ok) throw new Error("Failed to fetch items")
        const data = await response.json()

        setItems(data.items) // Assuming API returns items array
        setTotalPages(data.totalPages) // Assuming API returns total pages
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentPage]) // Refetch when currentPage changes

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={handlePageChange} />}
    </div>
  )
}
```
