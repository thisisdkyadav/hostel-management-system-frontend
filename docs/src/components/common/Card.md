# Card Component (`/src/components/common/Card.jsx`)

A small, specific card component used to display complaint counts (Pending or Resolved).

## Purpose and Functionality

This component renders a small, styled card with a fixed width and blue background. It's designed specifically to show either the count of pending complaints or resolved complaints.

- Displays an icon (`FaRegFileAlt` for pending, `FaCheckCircle` for resolved).
- Shows the corresponding label ("Pending Complaints" or "Resolved Complaints").
- Displays the provided `count` number prominently.

## Props

| Prop    | Type     | Description                                                                                        | Default     | Required |
| :------ | :------- | :------------------------------------------------------------------------------------------------- | :---------- | :------- |
| `type`  | `string` | Determines the card's content. Should be either `"pending"` or another value (e.g., `"resolved"`). | `"pending"` | No       |
| `count` | `number` | The number to display on the card.                                                                 | `5`         | No       |

## Behavior

- If `type` is `"pending"`, the card shows the "Pending Complaints" label and the `FaRegFileAlt` icon.
- If `type` is anything other than `"pending"`, it shows the "Resolved Complaints" label and the `FaCheckCircle` icon.

## Usage Example

```jsx
import React from "react"
import Card from "./Card"

function ComplaintSummary({ pendingCount, resolvedCount }) {
  return (
    <div className="flex space-x-4 p-4">
      <Card type="pending" count={pendingCount} />
      <Card type="resolved" count={resolvedCount} />
    </div>
  )
}
```

## Dependencies

- `react-icons/fa`: Uses `FaRegFileAlt` and `FaCheckCircle` icons.
