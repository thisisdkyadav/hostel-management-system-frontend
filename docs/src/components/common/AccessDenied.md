# AccessDenied Component (`/src/components/common/AccessDenied.jsx`)

A full-page component displayed when a user attempts to access a resource they do not have permission for.

## Purpose and Functionality

This component provides a clear and user-friendly way to inform users that they lack the necessary permissions for a specific page or feature. It occupies the entire screen and includes:

- A prominent icon (defaults to an info/warning icon).
- A clear title (e.g., "Access Denied").
- An informative message explaining the lack of permission.
- An optional suggestion area for guiding the user (e.g., "Contact your administrator").
- A button to navigate the user away, typically back to the home page or dashboard.

## Props

| Prop         | Type              | Description                                                                                  | Default                                             | Required |
| :----------- | :---------------- | :------------------------------------------------------------------------------------------- | :-------------------------------------------------- | :------- |
| `title`      | `string`          | The main heading text displayed.                                                             | `"Access Denied"`                                   | No       |
| `message`    | `string`          | The primary message explaining the lack of access.                                           | `"You do not have permission to access this page."` | No       |
| `icon`       | `React Component` | An optional React component to use as the icon. If not provided, a default SVG icon is used. | `undefined` (uses default SVG)                      | No       |
| `suggestion` | `string`          | An optional message offering guidance or next steps for the user.                            | `undefined`                                         | No       |
| `buttonText` | `string`          | The text displayed on the navigation button.                                                 | `"Return to Home"`                                  | No       |
| `to`         | `string`          | The route path (used by `react-router-dom`) to navigate to when the button is clicked.       | `"/"`                                               | No       |

## Usage Example

Typically used within routing logic or component rendering logic where authorization checks fail.

```jsx
import React from "react"
import AccessDenied from "./AccessDenied"
import { useAuth } from "../contexts/AuthProvider" // Assuming auth context
import { FaLock } from "react-icons/fa"

function AdminSettingsPage() {
  const { user } = useAuth()

  if (user.role !== "admin") {
    return <AccessDenied title="Admin Access Required" message="Only administrators can access the settings page." icon={<FaLock />} suggestion="If you believe this is an error, please contact support." buttonText="Go to Dashboard" to="/dashboard" />
  }

  return <div>{/* Admin settings content */}</div>
}
```

## Dependencies

- `react-router-dom`: Uses the `useNavigate` hook for the button's navigation action.
