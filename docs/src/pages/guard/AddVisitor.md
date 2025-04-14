# Add Visitor Page (`/src/pages/guard/AddVisitor.jsx`)

This page allows security guards to register new visitors and view recent visitor records.

## Route

Likely corresponds to the `/guard/add-visitor` route.

## Purpose and Functionality

1.  **Visitor Registration:**
    - Renders the [`VisitorForm`](../../components/visitor/VisitorForm.md) component for entering new visitor details.
    - The form's submission triggers `handleAddVisitor`.
    - `handleAddVisitor` calls `securityApi.addVisitor` to save the new visitor record.
2.  **Recent Visitor Display:**
    - Retrieves the current list of `visitors` and the `fetchVisitors` function from the `useSecurity` context.
    - Displays statistics about the fetched visitors (Total, Checked In, Checked Out).
    - Renders the [`VisitorTable`](../../components/visitor/VisitorTable.md) component, passing the fetched `visitors` and the `fetchVisitors` function (as `refresh`) to it.
    - Includes a commented-out `handleUpdateVisitor` function, suggesting that updating visitors might be handled within the `VisitorTable` or is not fully implemented on this page directly.

## Context Usage

- **`useSecurity`** (from `../../contexts/SecurityProvider`):
  - `visitors`: The list of recent visitor records (likely fetched and managed by the provider).
  - `fetchVisitors`: A function provided by the context to refresh the visitor list.

## Key Components Rendered

- [`VisitorForm`](../../components/visitor/VisitorForm.md)
- [`VisitorTable`](../../components/visitor/VisitorTable.md)

## API Usage

- `securityApi.addVisitor(newVisitor)`

## Dependencies

- `react`: `useState`
- `../../contexts/SecurityProvider`
- `../../services/apiService`: `securityApi`
- `../../components/visitor/VisitorForm`
- `../../components/visitor/VisitorTable`
