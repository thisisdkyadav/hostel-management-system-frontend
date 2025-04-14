# StatCards & StatCard Components (`/src/components/common/StatCards.jsx`)

This file exports two components: `StatCards` for displaying a grid of statistics and `StatCard` for rendering an individual statistic card.

## `StatCards` Component

This component takes an array of statistics and renders them in a responsive grid layout using the `StatCard` component.

### Purpose and Functionality

Provides a convenient way to display multiple key metrics or statistics in a visually appealing grid. The number of columns adjusts based on the screen size and the `columns` prop.

### Props

| Prop      | Type     | Description                                                                                               | Default | Required |
| :-------- | :------- | :-------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `stats`   | `array`  | An array of objects, where each object represents a statistic and contains the props for a `StatCard`.    | -       | Yes      |
| `columns` | `number` | The maximum desired number of columns for the grid layout (e.g., 1, 2, 3, 4). Responsiveness is built-in. | `4`     | No       |

### Usage Example

```jsx
import StatCards from "./StatCards"
import { FaUsers, FaBed, FaExclamationCircle } from "react-icons/fa"

const myStats = [
  { title: "Total Students", value: "1,234", subtitle: "In active session", icon: <FaUsers />, color: "#3498db" },
  { title: "Available Beds", value: "56", subtitle: "Across all hostels", icon: <FaBed />, color: "#2ecc71" },
  { title: "Open Complaints", value: "7", subtitle: "Requiring attention", icon: <FaExclamationCircle />, color: "#e74c3c" },
]

function Dashboard() {
  return <StatCards stats={myStats} columns={3} />
}
```

---

## `StatCard` Component (Internal)

This component renders a single statistic card. It's typically used internally by the `StatCards` component but can be exported and used individually if needed.

### Purpose and Functionality

Displays a single metric with a title, value, subtitle, and an icon. It features a colored border accent and subtle hover animations.

### Props

| Prop       | Type                 | Description                                                                       | Default     | Required |
| :--------- | :------------------- | :-------------------------------------------------------------------------------- | :---------- | :------- |
| `title`    | `string`             | The main title or label for the statistic.                                        | -           | Yes      |
| `value`    | `string` or `number` | The primary value of the statistic to display prominently.                        | -           | Yes      |
| `subtitle` | `string`             | Additional context or description displayed below the value.                      | -           | Yes      |
| `icon`     | `node`               | A React node (typically an icon component) to display on the card.                | -           | Yes      |
| `color`    | `string`             | The color string (e.g., hex code) for the left border and icon background accent. | `'#1360AB'` | No       |

</rewritten_file>
