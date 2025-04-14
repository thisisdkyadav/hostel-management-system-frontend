# Maintenance Components (`/src/components/maintenance`)

This directory contains components related to managing and viewing maintenance requests, likely from an administrative or warden perspective.

## Component Overview

- **[`ComplaintsStatsM.jsx`](./ComplaintsStatsM.md)**

  - **Summary:** Displays summary statistics specifically for maintenance-related complaints/requests (e.g., total open, pending assignment, completed).
  - _Future File:_ `./ComplaintsStatsM.md`

- **[`ComplaintsM.jsx`](./ComplaintsM.md)**

  - **Summary:** Likely the main component for displaying the list or view of maintenance requests. May handle filtering, sorting, and rendering individual requests using `ComplaintItemM`.
  - _Future File:_ `./ComplaintsM.md`

- **[`ComplaintItemM.jsx`](./ComplaintItemM.md)**

  - **Summary:** Renders a single maintenance request item, perhaps as a card or list row, showing key details (request ID, location, description, status, assigned staff).
  - _Future File:_ `./ComplaintItemM.md`

- **[`ComplaintDetailModal.jsx`](./ComplaintDetailModal.md)**

  - **Summary:** A modal dialog displaying comprehensive details of a specific maintenance request, potentially including history, comments, and actions (assign staff, update status).
  - _Future File:_ `./ComplaintDetailModal.md`

- **[`PrintComplaints.jsx`](./PrintComplaints.md)**
  - **Summary:** A component likely responsible for generating a printable view or report of selected maintenance requests.
  - _Future File:_ `./PrintComplaints.md`

## Structure Notes

These components probably form a dedicated maintenance management interface, used within a specific page (e.g., `src/pages/MaintenancePage.jsx`). Note the potential naming overlap with general "complaints" components; these are likely specialized for maintenance tasks.
