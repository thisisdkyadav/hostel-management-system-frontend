# Notifications Components (`/src/components/notifications`)

This directory contains components related to creating, viewing, and managing system notifications.

## Component Overview

- **[`NotificationStats.jsx`](./NotificationStats.md)**

  - **Summary:** Displays summary statistics about notifications (e.g., total sent, unread count) likely using `StatCards`.
  - _Future File:_ `./NotificationStats.md`

- **[`NotificationFilterSection.jsx`](./NotificationFilterSection.md)**

  - **Summary:** Renders a panel with filter options for the notifications list (e.g., filter by read/unread, date range, target audience).
  - _Future File:_ `./NotificationFilterSection.md`

- **[`NotificationTable.jsx`](./NotificationTable.md)**

  - **Summary:** Displays a list of notifications in a table format, likely using `BaseTable`. Shows key details like title, date, sender, and status.
  - _Future File:_ `./NotificationTable.md`

- **[`CreateNotificationModal.jsx`](./CreateNotificationModal.md)**

  - **Summary:** A modal dialog containing a form for composing and sending new notifications. May include options for targeting specific users, roles, or hostels, potentially using `SelectStudentsForm`.
  - _Future File:_ `./CreateNotificationModal.md`

- **[`SelectStudentsForm.jsx`](./SelectStudentsForm.md)**

  - **Summary:** A form component specifically designed for selecting target students or groups for notifications, likely with filtering and selection capabilities.
  - _Future File:_ `./SelectStudentsForm.md`

- **[`ViewNotificationModal.jsx`](./ViewNotificationModal.md)**
  - **Summary:** A modal dialog for displaying the full content and details of a selected notification.
  - _Future File:_ `./ViewNotificationModal.md`

## Structure Notes

These components likely form a notification management page (e.g., `src/pages/NotificationsPage.jsx`) accessible to relevant roles (admin, warden) and potentially a simpler view for users to see their received notifications.
