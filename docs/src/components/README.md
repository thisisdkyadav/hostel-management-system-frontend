# Components (`/src/components`)

This directory houses all the reusable UI components used throughout the Hostel Management System frontend.

## Organization

Components are organized primarily based on the feature they belong to, with common, widely reusable components placed in the `/common` subdirectory.

- **Feature-Specific Components:** Found in directories named after the feature (e.g., [`/visitor`](./visitor/README.md), [`/admin`](./admin/README.md), [`/complaints`](./complaints/README.md), etc.). Each feature directory may contain its own `README.md` explaining the components within.
- **Common Components:** Located in the [`/common`](./common/README.md) directory. These are generic components like buttons, modals, inputs, etc., designed for reuse across multiple features.
- **Top-Level Components:** Some general components might reside directly within `/src/components` (e.g., `Sidebar.jsx`, `MobileHeader.jsx`). Documentation for these should be added here or linked individually.

## Documentation Approach

Each significant component should ideally have its own corresponding `.md` file within the `/docs/src/components` structure (mirroring the source location). For example, documentation for `src/components/common/Modal.jsx` would be at `docs/src/components/common/Modal.md`.

Component documentation should typically include:

- A brief description of its purpose.
- Details about its `props` (name, type, description, default value).
- Information about any significant internal `state` it manages.
- Explanation of key event handlers or logic.
- Notes on context usage or API calls made.

## Key Subdirectories

_(List and link to the README.md for major subdirectories as they are created)_

- [`/admin`](./admin/README.md)
- [`/charts`](./charts/README.md)
- [`/common`](./common/README.md)
- [`/complaints`](./complaints/README.md)
- [`/events`](./events/README.md)
- [`/guard`](./guard/README.md)
- [`/home`](./home/README.md)
- [`/lostAndFound`](./lostAndFound/README.md)
- [`/maintenance`](./maintenance/README.md)
- [`/notifications`](./notifications/README.md)
- [`/passwordChange`](./passwordChange/README.md)
- [`/profile`](./profile/README.md)
- [`/stats`](./stats/README.md)
- [`/student`](./student/README.md)
- [`/students`](./students/README.md)
- [`/visitor`](./visitor/README.md)
- [`/wardens`](./wardens/README.md)

_(Add links to individual component docs like Sidebar.md, MobileHeader.md if needed)_
