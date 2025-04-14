# Events Components (`/src/components/events`)

This directory contains components related to managing and displaying events within the hostel management system.

## Component Overview

- **[`EventStats.jsx`](./EventStats.md)**

  - **Summary:** Displays summary statistics related to events (e.g., upcoming events count, past events count) likely using `StatCards`.
  - _Future File:_ `./EventStats.md`

- **[`EventCard.jsx`](./EventCard.md)**

  - **Summary:** Renders a card displaying information about a single event (title, date, description, location, possibly actions like edit/delete).
  - _Future File:_ `./EventCard.md`

- **[`AddEventModal.jsx`](./AddEventModal.md)**

  - **Summary:** A modal dialog containing a form (likely `EventEditForm`) for adding a new event.
  - _Future File:_ `./AddEventModal.md`

- **[`EventEditForm.jsx`](./EventEditForm.md)**
  - **Summary:** A reusable form component for both adding and editing event details (title, description, date, time, location, etc.).
  - _Future File:_ `./EventEditForm.md`

## Structure Notes

These components are likely used together on an events page (e.g., `src/pages/EventsPage.jsx`) to display a list or calendar of events and allow administrators or wardens to manage them.
