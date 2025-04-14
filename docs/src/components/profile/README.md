# Profile Components (`/src/components/profile`)

This directory contains components related to displaying user profile information.

## Component Overview

- **[`ProfileHeader.jsx`](./ProfileHeader.md)**

  - **Summary:** Renders the main header section of a profile page, possibly including the user's name, role, and action buttons (like Edit Profile, Change Password).
  - _Future File:_ `./ProfileHeader.md`

- **[`ProfileAvatar.jsx`](./ProfileAvatar.md)**

  - **Summary:** A component specifically for displaying the user's profile picture/avatar, potentially including logic for placeholders or upload triggers.
  - _Future File:_ `./ProfileAvatar.md`

- **[`ProfileInfo.jsx`](./ProfileInfo.md)**

  - **Summary:** A generic component likely used to display individual pieces of profile information (e.g., a label and value pair).
  - _Future File:_ `./ProfileInfo.md`

- **[`ProfileCard.jsx`](./ProfileCard.md)**

  - **Summary:** A generic card component perhaps used as a container for sections within the profile page.
  - _Future File:_ `./ProfileCard.md`

- **[`StudentProfile.jsx`](./StudentProfile.md)**

  - **Summary:** A component specifically laying out and displaying the profile information relevant to a Student user.
  - _Future File:_ `./StudentProfile.md`

- **[`WardenProfile.jsx`](./WardenProfile.md)**

  - **Summary:** A component specifically laying out and displaying the profile information relevant to a Warden user.
  - _Future File:_ `./WardenProfile.md`

- **[`AdminProfile.jsx`](./AdminProfile.md)**
  - **Summary:** A component specifically laying out and displaying the profile information relevant to an Admin user.
  - _Future File:_ `./AdminProfile.md`

## Structure Notes

The generic components (`ProfileHeader`, `ProfileAvatar`, `ProfileInfo`, `ProfileCard`) are likely used by the role-specific components (`StudentProfile`, `WardenProfile`, `AdminProfile`) which are then assembled within a main profile page (e.g., `src/pages/ProfilePage.jsx`).
