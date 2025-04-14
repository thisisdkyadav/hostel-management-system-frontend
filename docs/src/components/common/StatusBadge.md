# StatusBadge Component (`/src/components/common/StatusBadge.jsx`)

A component to display a status label with a corresponding color indicator.

## Purpose and Functionality

This component is specifically styled to display a student's check-in/out status. It renders a rounded badge containing:

- A small colored dot (green for "Checked In", red otherwise).
- The status text itself.

The background color of the badge also changes based on the status (green for "Checked In", red otherwise).

## Props

| Prop     | Type     | Description                                                                 | Default | Required |
| :------- | :------- | :-------------------------------------------------------------------------- | :------ | :------- |
| `status` | `string` | The status text to display (e.g., "Checked In", "Checked Out", "On Leave"). | -       | Yes      |

## Styling Logic

- If `status` is exactly `"Checked In"`, the dot and background are green.
- For any other `status` value, the dot and background are red.

## Usage Example

```jsx
import React from "react"
import StatusBadge from "./StatusBadge"

function StudentTableRow({ student }) {
  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.rollNumber}</td>
      <td>
        <StatusBadge status={student.currentStatus} />
      </td>
      {/* ... other columns ... */}
    </tr>
  )
}
```
