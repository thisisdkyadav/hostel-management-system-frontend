# LoadingScreen Component (`/src/components/common/LoadingScreen.jsx`)

A full-screen loading indicator displayed while the application initializes.

## Purpose and Functionality

This component provides visual feedback to the user during the initial loading phase of the application (e.g., while fetching initial data, authenticating, or loading assets). It covers the entire viewport and typically includes:

- A background (gradient in this case).
- The application logo (e.g., `IITILogo.png`) with a subtle animation.
- A custom animated loading bar.
- Loading text.

It is designed to be displayed temporarily until the main application content is ready to be shown.

## Props

This component does not accept any props.

## Usage Example

Typically used conditionally in the main application component (`App.jsx` or similar) based on an `isLoading` state.

```jsx
import React, { useState, useEffect } from "react"
import LoadingScreen from "./LoadingScreen"
import AppRoutes from "./routes/AppRoutes" // Example main app content
import { useAuth } from "./contexts/AuthProvider" // Example auth context

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { checkAuthStatus } = useAuth()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuthStatus() // Check login status, fetch initial data etc.
        // Simulate loading time if needed
        // await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error("Initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [checkAuthStatus])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <AppRoutes /> // Render the main application
  )
}

export default App
```

## Styling and Animations

- Uses Tailwind CSS utility classes for styling.
- Relies on custom CSS animations defined elsewhere (likely in `index.css` or a global stylesheet) for the logo pulse (`animate-pulse-slow`), pulsing circle (`animate-ping-slow`), and loading bar (`animate-loading-bar`).
