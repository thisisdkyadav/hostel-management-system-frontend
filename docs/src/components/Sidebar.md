# Sidebar Component (`/src/components/Sidebar.jsx`)

This component renders the main sidebar navigation for the application.

## Purpose and Functionality

1.  **Navigation Display:**
    - Accepts an array of `navItems` via props.
    - Separates items into `main` and `bottom` sections.
    - Renders each navigation item using `renderNavItem`, displaying its icon and name.
    - Includes special rendering logic for the "Profile" item to show the user's image/initial, name, email, and role.
    - Applies distinct styling for the "Logout" item.
    - Displays notification badges on items if `item.badge > 0`.
2.  **Active State:**
    - Uses `useLocation` to determine the current pathname.
    - Compares the current path (or `pathPattern` regex if provided) with `item.path` to determine the active navigation item.
    - Applies distinct visual styles (background, text color, indicator bar) to the active item.
3.  **Responsive Behavior:**
    - Uses `useEffect` with a resize listener to detect mobile viewports (`window.innerWidth < 768`).
    - Collapses (`isOpen = false`) on mobile by default, expands (`isOpen = true`) on desktop.
    - Renders a [`MobileHeader`](./MobileHeader.md) component, passing down state and handlers for mobile interaction (likely a hamburger menu).
    - Sidebar collapses automatically on navigation click in mobile view.
    - Uses CSS transitions for smooth collapsing/expanding animations.
4.  **Navigation Handling:**
    - The `handleNavigation` function is called on item click.
    - If the item has an `action` function, it executes it (e.g., for logout).
    - If the item has a `path`, it navigates to that path using `useNavigate` from `react-router-dom` and updates the `active` state.
5.  **Warden Hostel Switching:**
    - Checks if the user role is "Warden" or "Associate Warden".
    - Retrieves assigned hostels and the currently active hostel ID from the `useWarden` context (or falls back to user data).
    - Displays a dropdown (`<select>`) allowing the warden to switch their active hostel.
    - The `handleHostelChange` function:
      - Calls the appropriate API (`wardenApi.setActiveHostel` or `associateWardenApi.setActiveHostel`) to update the active hostel on the backend.
      - Calls `fetchProfile` from the `useWarden` context to refresh the warden's profile data (including the updated active hostel).
      - Shows a loading indicator (`isUpdatingHostel`) during the API call.

## Props

- `navItems` (Array): An array of navigation item objects. Each object should likely have:
  - `name` (String): The display name of the item.
  - `icon` (React Component): The icon component to display.
  - `section` (String): Either "main" or "bottom".
  - `path` (String, optional): The route path to navigate to.
  - `pathPattern` (String, optional): A regex string to match against the location pathname for highlighting.
  - `action` (Function, optional): A function to execute on click (e.g., logout).
  - `badge` (Number, optional): A number to display as a notification badge.

## Context Usage

- **`useAuth`** (from `../contexts/AuthProvider`):
  - `user`: To display user information (name, email, role, profile image) and check the role for hostel switching logic.
- **`useWarden`** (from `../contexts/WardenProvider`):
  - `profile`: To get the warden's assigned hostels (`hostelIds`) and currently active hostel (`activeHostelId`).
  - `fetchProfile`: Function to refresh the warden's profile data after changing the active hostel.
  - `isAssociateWarden`: (Used indirectly via `user.role` check within the component).

## Key Components Rendered

- [`MobileHeader`](./MobileHeader.md)

## API Usage

- `wardenApi.setActiveHostel(hostelId)`
- `associateWardenApi.setActiveHostel(hostelId)`

## Dependencies

- `react`: `useState`, `useEffect`, `useRef`
- `react-router-dom`: `useNavigate`, `useLocation`
- `react-icons`: `FaUserCircle`, `FaBuilding`, `CgSpinner`
- `../contexts/AuthProvider`
- `../contexts/WardenProvider`
- `../services/apiService`: `wardenApi`, `associateWardenApi`
- `./MobileHeader`
