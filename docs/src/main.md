# Main Entry Point (`/src/main.jsx`)

This file serves as the primary entry point for the React frontend application.

## Purpose and Functionality

1.  **Imports:**

    - Imports `StrictMode` from React for highlighting potential problems.
    - Imports `createRoot` from `react-dom/client` for the React 18+ rendering API.
    - Imports global styles from `./index.css`.
    - Imports the root application component `App` from `./App.jsx`.

2.  **Service Worker Registration:**

    - Checks if service workers are supported by the browser (`'serviceWorker' in navigator`).
    - Adds an event listener to register `/sw.js` after the page loads (`'load'` event).
    - Logs success or failure messages for the service worker registration to the console.

3.  **Rendering:**
    - Uses `createRoot` to target the DOM element with the ID `root` (typically in `index.html`).
    - Renders the main `App` component, wrapped in `StrictMode`, into the root DOM node.

## Key Dependencies

- `react`
- `react-dom/client`
- [`./index.css`](./index-css.md) (Global Styles)
- [`./App.jsx`](./App.md) (Root Application Component)
- `/sw.js` (Service Worker file - expected in the public root directory)
