# Lost and Found Components (`/src/components/lostAndFound`)

This directory contains components related to the Lost and Found feature of the application.

## Component Overview

- **[`LostAndFoundStats.jsx`](./LostAndFoundStats.md)**

  - **Summary:** Displays summary statistics related to lost and found items (e.g., total items reported, items claimed) likely using `StatCards`.
  - _Future File:_ `./LostAndFoundStats.md`

- **[`LostAndFoundCard.jsx`](./LostAndFoundCard.md)**

  - **Summary:** Renders a card displaying information about a single lost or found item (description, date reported, status, location, image, contact info, actions like Claim/Edit/Delete).
  - _Future File:_ `./LostAndFoundCard.md`

- **[`AddLostItemModal.jsx`](./AddLostItemModal.md)**

  - **Summary:** A modal dialog containing a form (likely `LostAndFoundEditForm`) for reporting a new lost item.
  - _Future File:_ `./AddLostItemModal.md`

- **[`LostAndFoundEditForm.jsx`](./LostAndFoundEditForm.md)**
  - **Summary:** A reusable form component for adding or editing details of a lost or found item (item name, description, date, location, contact info, image upload).
  - _Future File:_ `./LostAndFoundEditForm.md`

## Structure Notes

These components are likely used together on a Lost and Found page (e.g., `src/pages/LostAndFoundPage.jsx`) to display items and allow users to report new ones or manage existing reports.
