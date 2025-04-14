# Complaints Components (`/src/components/complaints`)

This directory contains components related to viewing, managing, and displaying information about student complaints.

## Component Overview

- **[`ComplaintsHeader.jsx`](./ComplaintsHeader.md)**

  - **Summary:** Displays the main header for the complaints section, potentially including title, action buttons (like "New Complaint"), or high-level filters.
  - _Future File:_ `./ComplaintsHeader.md`

- **[`ComplaintsFilterPanel.jsx`](./ComplaintsFilterPanel.md)**

  - **Summary:** Renders a panel with various filter options specifically for the complaints list (e.g., filter by status, date range, type).
  - _Future File:_ `./ComplaintsFilterPanel.md`

- **[`ComplaintStats.jsx`](./ComplaintStats.md)**

  - **Summary:** Displays summary statistics related to complaints (e.g., total open, resolved today) likely using `StatCards`.
  - _Future File:_ `./ComplaintStats.md`

- **[`ComplaintsContent.jsx`](./ComplaintsContent.md)**

  - **Summary:** Likely acts as a container for the main content area, deciding whether to show the list view, card view, loading state, or empty state based on data and view preference.
  - _Future File:_ `./ComplaintsContent.md`

- **[`ComplaintListView.jsx`](./ComplaintListView.md)**

  - **Summary:** Renders the list of complaints in a table format, likely using `BaseTable`. Defines columns specific to complaints (ID, student, status, date, etc.) and handles row clicks or actions.
  - _Future File:_ `./ComplaintListView.md`

- **[`ComplaintCardView.jsx`](./ComplaintCardView.md)**

  - **Summary:** Provides an alternative view, rendering each complaint as an individual card, suitable for smaller screens or different layout preferences.
  - _Future File:_ `./ComplaintCardView.md`

- **[`ComplaintDetailModal.jsx`](./ComplaintDetailModal.md)**
  - **Summary:** A modal dialog that displays detailed information about a single selected complaint, potentially including description, history, assigned warden, and resolution actions.
  - _Future File:_ `./ComplaintDetailModal.md`

## Structure Notes

These components likely work together within a parent page component (e.g., `src/pages/ComplaintsPage.jsx`) to provide the full complaint management interface.
