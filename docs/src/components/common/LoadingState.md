# LoadingState Component (`/src/components/common/LoadingState.jsx`)

A component to display a loading indicator within a specific UI section.

## Purpose and Functionality

This component is used to provide visual feedback when a part of the page or a specific component is loading data or processing information. It's distinct from `LoadingScreen` which covers the entire page. It typically renders:

- A spinning loading indicator.
- A primary message (e.g., "Loading...").
- An optional secondary description.

## Props

| Prop          | Type     | Description                                            | Default         | Required |
| :------------ | :------- | :----------------------------------------------------- | :-------------- | :------- |
| `message`     | `string` | The main text displayed below the spinner.             | `"Loading..."`  | No       |
| `description` | `string` | Optional descriptive text displayed below the message. | `"Please wait"` | No       |

## Usage Example

Often used conditionally while data is being fetched for a specific part of the UI.

```jsx
import React, { useState, useEffect } from "react"
import LoadingState from "./LoadingState"
import ErrorState from "./ErrorState" // Assume an ErrorState component exists

function UserDetails({ userId }) {
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error("Failed to fetch user")
        const data = await response.json()
        setUserData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (isLoading) {
    return <LoadingState message="Loading user details..." description="Fetching from server" />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!userData) {
    return null // Or an empty state
  }

  return (
    <div>
      <h2>{userData.name}</h2>
      <p>Email: {userData.email}</p>
      {/* ... other user details ... */}
    </div>
  )
}
```
