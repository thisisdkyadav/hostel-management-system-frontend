# Page Components (`/src/pages`)

This directory contains top-level components representing distinct pages or views within the application.

## Pages Overview

- **`Homepage.jsx`**

  - **Summary:** The main landing page of the application, possibly for unauthenticated users.
  - _Future File:_ `./Homepage.md`

- **`LoginPage.jsx`**

  - **Summary:** The page containing the login form for user authentication.
  - _Future File:_ `./LoginPage.md`

- **`Profile.jsx`**

  - **Summary:** The user profile page, likely rendering role-specific profile components (e.g., `StudentProfile`, `WardenProfile`).
  - _Future File:_ `./Profile.md`

- **`Students.jsx`**

  - **Summary:** A page for viewing and managing student lists, likely used by admins or wardens. Incorporates filtering, sorting, and potentially bulk actions.
  - _Future File:_ `./Students.md`

- **`Complaints.jsx`**

  - **Summary:** The page for viewing and managing complaints (student view or staff/warden view).
  - _Future File:_ `./Complaints.md`

- **`Events.jsx`**

  - **Summary:** The page for viewing and managing events.
  - _Future File:_ `./Events.md`

- **`LostAndFound.jsx`**

  - **Summary:** The page for viewing and managing lost and found items.
  - _Future File:_ `./LostAndFound.md`

- **`NotificationCenter.jsx`**

  - **Summary:** The page for viewing system notifications.
  - _Future File:_ `./NotificationCenter.md`

- **`UnitsAndRooms.jsx`**

  - **Summary:** A page specifically for managing hostel units and rooms, likely for wardens or admins.
  - _Future File:_ `./UnitsAndRooms.md`

- **`VisitorRequests.jsx`**

  - **Summary:** A page for managing or viewing visitor requests.
  - _Future File:_ `./VisitorRequests.md`

- **`Visitors.jsx`**

  - **Summary:** A page for managing visitor logs or entries, likely for security personnel.
  - _Future File:_ `./Visitors.md`

- **Role-Specific Subdirectories (`admin/`, `guard/`, `maintainance/`, `student/`, `warden/`)**
  - **Summary:** These directories contain pages accessible only to specific user roles, further organizing the application's views.
  - _Future Files:_ `./admin/README.md`, `./guard/README.md`, etc.

## Structure Notes

Page components typically orchestrate data fetching (often via custom hooks or context) and assemble various feature components (from `/src/components`) to build the complete user interface for a specific route. They are rendered within the appropriate layout component defined in the routing configuration.
