# ErrorState Component (`/src/components/common/ErrorState.jsx`)

A component to display an error message within a specific UI section, with an optional retry action.

## Purpose and Functionality

This component is used to inform the user when an error has occurred while loading data or performing an action for a part of the page. It typically renders:

- An error icon (`FiAlertCircle`) within a colored circle.
- A customizable title (e.g., "Something went wrong").
- The specific error message.
- An optional button (e.g., "Try Again") that triggers a provided `onRetry` function.

## Props

| Prop         | Type     | Description                                                                                                  | Default                  | Required |
| :----------- | :------- | :----------------------------------------------------------------------------------------------------------- | :----------------------- | :------- |
| `message`    | `string` | The specific error message to display.                                                                       | -                        | Yes      |
| `onRetry`    | `func`   | Optional callback function to execute when the retry button is clicked. If omitted, the button is not shown. | `undefined`              | No       |
| `title`      | `string` | The main heading text displayed above the error message.                                                     | `"Something went wrong"` | No       |
| `buttonText` | `string` | The text displayed on the optional retry button.                                                             | `"Try Again"`            | No       |

## Usage Example

Used in conjunction with data fetching logic to handle error scenarios.

```jsx
import React, { useState, useEffect, useCallback } from "react"
import LoadingState from "./LoadingState"
import ErrorState from "./ErrorState"

function WidgetData({ widgetId }) {
  const [widgetData, setWidgetData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/widgets/${widgetId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setWidgetData(data)
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err.message || "Failed to load widget data.")
    } finally {
      setIsLoading(false)
    }
  }, [widgetId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return <LoadingState message="Loading widget..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Widget Error"
        message={error}
        onRetry={fetchData} // Pass the fetchData function to enable retry
        buttonText="Retry Load"
      />
    )
  }

  if (!widgetData) {
    return null // Or empty state
  }

  return (
    <div>
      <h3>{widgetData.title}</h3>
      <p>{widgetData.content}</p>
    </div>
  )
}
```

## Dependencies

- `react-icons/fi`: Uses the `FiAlertCircle` icon.
