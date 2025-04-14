# Visitor Components (`/src/components/visitor`)

This directory contains components related to managing visitor entries, requests, and related information.

## Component Overview

- **[`VisitorStats.jsx`](./VisitorStats.md)**

  - **Summary:** Displays summary statistics related to visitors (e.g., total visitors today, pending requests, check-ins).
  - _Future File:_ `./VisitorStats.md`

- **[`VisitorForm.jsx`](./VisitorForm.md)**

  - **Summary:** A form for registering a new visitor entry or request, collecting details like visitor name, contact info, student being visited, purpose, entry/exit times.
  - _Future File:_ `./VisitorForm.md`

- **[`VisitorTable.jsx`](./VisitorTable.md)**

  - **Summary:** Displays a list of visitor requests or logs in a table format, likely using `BaseTable`.
  - _Future File:_ `./VisitorTable.md`

- **[`EditVisitorModal.jsx`](./EditVisitorModal.md)**

  - **Summary:** A modal dialog containing a form (likely `VisitorForm`) for editing the details of an existing visitor request or log.
  - _Future File:_ `./EditVisitorModal.md`

- **[`requests/`](./requests/README.md)**
  - **Summary:** Likely contains components specifically for handling the _request_ aspect of visitors (e.g., approval/rejection workflows, student view of requests).
  - _Future File:_ `./requests/README.md`

## Structure Notes

These components likely form the UI for managing visitor entries, used perhaps by security guards, and potentially a separate interface for students to submit visitor requests.
