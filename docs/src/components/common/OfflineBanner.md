# OfflineBanner Component (`/src/components/common/OfflineBanner.jsx`)

Displays a banner indicating that the user is currently offline.

## Purpose and Functionality

This component provides a clear visual cue to the user when network connectivity is lost or unavailable. It typically shows an icon and an informative message.

## Props

| Prop        | Type     | Description                                                    | Default                                             | Required |
| :---------- | :------- | :------------------------------------------------------------- | :-------------------------------------------------- | :------- |
| `message`   | `string` | The text message to display within the banner.                 | `"You are currently offline. Viewing cached data."` | No       |
| `className` | `string` | Additional CSS classes to apply to the banner's `div` element. | `""`                                                | No       |

## Usage Example

```jsx
import React from "react"
import OfflineBanner from "./OfflineBanner"
import useNetworkStatus from "../hooks/useNetworkStatus" // Assuming a custom hook

function AppLayout() {
  const isOnline = useNetworkStatus()

  return (
    <div>
      {!isOnline && (
        <div className="p-4">
          <OfflineBanner message="Connection lost. Some features may be unavailable." />
        </div>
      )}
      {/* ... rest of the app layout ... */}
    </div>
  )
}
```

## Dependencies

- `react-icons/fi`: Uses the `FiWifiOff` icon.
