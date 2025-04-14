# Guard Components (`/src/components/guard`)

This directory contains components specifically designed for the Security Guard user interface, focusing on student entry/exit logging and QR code scanning.

## Component Overview

- **[`DashboardHeader.jsx`](./DashboardHeader.md)**

  - **Summary:** Displays the header for the guard's dashboard, possibly showing the guard's name, current time, or quick action buttons.
  - _Future File:_ `./DashboardHeader.md`

- **[`QRScanner.jsx`](./QRScanner.md)**

  - **Summary:** Implements the QR code scanning functionality, likely using a library like `react-qr-scanner` or similar. Handles camera access and decoding QR codes (presumably containing student IDs).
  - _Future File:_ `./QRScanner.md`

- **[`ScannedStudentInfo.jsx`](./ScannedStudentInfo.md)**

  - **Summary:** Displays information about the student whose QR code was just scanned. Likely shows name, photo, room, and status, along with buttons for check-in/check-out actions.
  - _Future File:_ `./ScannedStudentInfo.md`

- **[`StudentEntryForm.jsx`](./StudentEntryForm.md)**

  - **Summary:** A form for manually logging student entries or exits, used when QR scanning is not possible or for corrections.
  - _Future File:_ `./StudentEntryForm.md`

- **[`NewEntryForm.jsx`](./NewEntryForm.md)**

  - **Summary:** Potentially another form for manual entry, maybe differing slightly from `StudentEntryForm` (e.g., for visitors or different types of entries). Requires inspection for exact purpose.
  - _Future File:_ `./NewEntryForm.md`

- **[`StudentEntryTable.jsx`](./StudentEntryTable.md)**

  - **Summary:** Displays a table listing recent student entry/exit logs, likely using `BaseTable`. Includes columns for student details, time, direction (in/out), and potentially remarks.
  - _Future File:_ `./StudentEntryTable.md`

- **[`EntryDetails.jsx`](./EntryDetails.md)**

  - **Summary:** Displays detailed information about a single entry/exit record, possibly in a modal or separate view.
  - _Future File:_ `./EntryDetails.md`

- **[`EditStudentEntryModal.jsx`](./EditStudentEntryModal.md)**
  - **Summary:** A modal dialog containing a form to edit details of an existing entry/exit log (e.g., correcting time, adding remarks).
  - _Future File:_ `./EditStudentEntryModal.md`

## Structure Notes

These components form the core UI for the security guard role, typically integrated into a guard-specific dashboard page (e.g., `src/pages/GuardDashboard.jsx`).
