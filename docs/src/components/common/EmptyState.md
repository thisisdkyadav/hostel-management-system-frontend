# EmptyState Component (`/src/components/common/EmptyState.jsx`)

Displays a placeholder message typically used when there is no data to show.

## Purpose and Functionality

Provides a user-friendly indication that a list, table, or section is empty. It renders an icon within a colored circle, a title, and a descriptive message.

## Props

| Prop          | Type              | Description                                                       | Default                                   | Required |
| :------------ | :---------------- | :---------------------------------------------------------------- | :---------------------------------------- | :------- |
| `icon`        | `React Component` | The React icon component to display (passed as `Icon`).           | -                                         | Yes      |
| `title`       | `string`          | The main heading text.                                            | `"No Data Found"`                         | No       |
| `message`     | `string`          | The descriptive text below the title.                             | `"There is no data available to display"` | No       |
| `iconBgColor` | `string`          | Tailwind CSS class for the background color of the icon's circle. | `"bg-blue-100"`                           | No       |
| `iconColor`   | `string`          | Tailwind CSS class for the color of the icon itself.              | `"text-[#1360AB]"`                        | No       |

## Usage Example

```jsx
import React from "react"
import EmptyState from "./EmptyState"
import { FaInbox } from "react-icons/fa"

function Notifications({ notifications }) {
  if (notifications.length === 0) {
    return <EmptyState icon={FaInbox} title="No Notifications Yet" message="You have no new notifications at this time." iconBgColor="bg-green-100" iconColor="text-green-600" />
  }

  return <ul>{/* ... list of notifications ... */}</ul>
}
```

## Note on Icon Prop

The `icon` prop expects the actual component type (e.g., `FaInbox`), not a rendered instance (`<FaInbox />`). It's passed using prop renaming (`icon: Icon`).
