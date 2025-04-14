# Mobile Header Component (`/src/components/MobileHeader.jsx`)

This component renders the fixed header bar specifically for mobile viewports.

## Purpose and Functionality

1.  **Mobile Only:** Designed to be displayed only on smaller screens (typically hidden on medium screens and up using Tailwind's `md:hidden` class).
2.  **Sidebar Toggle:**
    - Displays a hamburger icon (`FaBars`) or a close icon (`FaTimes`) button.
    - Clicking this button calls the `setIsOpen` function (passed via props) to toggle the visibility of the main `Sidebar` component.
3.  **Logo Display:** Shows the application logo (`/IITILogo.png`), which acts as a link to the home page (`/`) using `useNavigate`.
4.  **User Menu Dropdown:**
    - Displays a circular button showing the user's profile image or initial.
    - Clicking this button toggles a dropdown menu (`dropdownOpen` state).
    - The dropdown lists the `bottomNavItems` (e.g., Profile, Settings, Logout) passed via props.
    - Clicking an item in the dropdown calls the `handleNavigation` function (passed via props) and closes the dropdown.
    - Includes logic (`useEffect`, `useRef`) to close the dropdown automatically when clicking outside of it.

## Props

- `isOpen` (Boolean): The current state of the main sidebar (open or closed).
- `setIsOpen` (Function): Callback function to toggle the `isOpen` state of the main sidebar.
- `bottomNavItems` (Array): An array of navigation item objects intended for the bottom section of the sidebar (typically Profile, Settings, Logout). Passed down to populate the user dropdown menu.
- `handleNavigation` (Function): Callback function (passed from `Sidebar`) to handle navigation or actions when a dropdown menu item is clicked.

## Context Usage

- **`useAuth`** (from `../contexts/AuthProvider`):
  - `user`: To display the user's profile image or initial on the user menu button.

## Dependencies

- `react`: `useState`, `useRef`, `useEffect`
- `react-router-dom`: `useNavigate`
- `react-icons/fa`: `FaBars`, `FaTimes`, `FaUserCircle`
- `../contexts/AuthProvider`
