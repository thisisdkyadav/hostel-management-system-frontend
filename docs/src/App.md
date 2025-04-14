# Root Application Component (`/src/App.jsx`)

This component serves as the root of the React application's component tree.

## Purpose and Functionality

- **Router Setup:** Initializes `BrowserRouter` from `react-router-dom` to enable client-side routing for the entire application.
- **Context Providers:** Wraps the application's routes with essential context providers:
  - `AuthProvider`: Makes authentication state and functions available throughout the app.
  - `GlobalProvider`: Makes globally relevant data (like hostel lists) available.
- **Route Rendering:** Renders the `AppRoutes` component, which contains the actual route definitions and corresponding page components.

## Structure

The component hierarchy established here is typically:

```
<BrowserRouter>
  <AuthProvider>
    <GlobalProvider>
      {/* Other global providers could go here */}
      <AppRoutes />
    </GlobalProvider>
  </AuthProvider>
</BrowserRouter>
```

## Key Dependencies

- `react-router-dom`: Uses `BrowserRouter`.
- [`./contexts/AuthProvider`](./contexts/README.md): Wraps the app with the authentication context.
- [`./contexts/GlobalProvider`](./contexts/README.md): Wraps the app with the global data context.
- [`./routes/AppRoutes`](./routes/README.md): Contains the application's route definitions.
