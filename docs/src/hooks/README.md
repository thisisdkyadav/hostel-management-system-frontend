# Custom Hooks (`/src/hooks`)

This directory contains custom React hooks designed to encapsulate reusable logic and stateful behavior.

## Hooks Overview

- **`useStudents.js`**

  - **Summary:** Likely encapsulates logic for fetching, filtering, sorting, and managing the state of the student list, potentially interacting with `studentApi`.
  - _Future File:_ `./useStudents.md`

- **`useNetworkStatus.js`**
  - **Summary:** A hook to detect and report the application's online/offline status, probably using browser events (`navigator.onLine`, `online`, `offline`).
  - _Future File:_ `./useNetworkStatus.md`

## Purpose

Custom hooks help abstract complex logic away from components, making them cleaner and promoting code reuse.
