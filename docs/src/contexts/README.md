# Contexts (`/src/contexts`)

This directory contains React Context providers used for managing global or feature-specific state across the application.

## Providers Overview

- **`AuthProvider.jsx`**

  - **Summary:** Manages authentication state (e.g., current user, login status, tokens) and provides functions for login, logout, and potentially fetching user profile information.
  - _Future File:_ `./AuthProvider.md`

- **`GlobalProvider.jsx`**

  - **Summary:** Likely manages globally relevant data that doesn't fit into other specific contexts, such as lists needed in multiple places (e.g., `hostelList`).
  - _Future File:_ `./GlobalProvider.md`

- **`AdminProvider.jsx`**

  - **Summary:** Manages state specific to the administrative sections of the application.
  - _Future File:_ `./AdminProvider.md`

- **`WardenProvider.jsx`**

  - **Summary:** Manages state specific to the Warden role, potentially including the warden's profile, assigned hostel details, or related data.
  - _Future File:_ `./WardenProvider.md`

- **`SecurityProvider.jsx`**
  - **Summary:** Manages state specific to the Security Guard role.
  - _Future File:_ `./SecurityProvider.md`

## Usage

These providers typically wrap large portions of the application (often in `main.jsx` or `App.jsx`) or specific feature routes. Components consume the context values using the `useContext` hook (or custom hooks provided by the context file, e.g., `useAuth`).

## Purpose

Contexts provide a way to pass data through the component tree without having to pass props down manually at every level. They are used here to manage:

- **Global State:** Data that needs to be accessible by many components across the application (e.g., authentication status, user information, theme settings).
- **Feature State:** State specific to a particular feature or section of the application that is shared between multiple components within that feature.

## Structure

Typically, each context might consist of:

- **Context Definition:** Created using `React.createContext()`.
- **Provider Component:** A component that wraps a part of the application and provides the context value to its children. This component usually manages the state using `useState` or `useReducer` and defines functions to update the state.
- **Consumer Hook (Optional but Recommended):** A custom hook (e.g., `useAuth()`, `useGlobal()`) that simplifies consuming the context value in components.

## Documentation

Each context provider (e.g., `AuthProvider.jsx`) should have a corresponding documentation file (e.g., `docs/src/contexts/AuthProvider.md`). This documentation should cover:

- The purpose of the context.
- The structure of the data/state provided by the context.
- Details about any functions or actions provided to update the context state.
- How to use the consumer hook (if applicable).

## Available Contexts

_(List and link to the documentation for individual contexts as they are created)_

- [`AuthProvider.md`](./AuthProvider.md)
- [`GlobalProvider.md`](./GlobalProvider.md)
- ... _(add other contexts)_
