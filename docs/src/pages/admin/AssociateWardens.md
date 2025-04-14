# Associate Wardens Page (`/src/pages/admin/AssociateWardens.jsx`)

This page provides the interface for managing Associate Warden staff members.

## Route

Likely corresponds to the `/admin/associate-wardens` route.

## Purpose and Functionality

This component acts as a simple wrapper around the generic staff management component.

- It renders the [`StaffManagement`](../../components/admin/staff/StaffManagement.md) component.
- It passes the specific `staffType="associateWarden"` prop to the `StaffManagement` component, configuring it to handle Associate Wardens.

All the actual logic for fetching, displaying, adding, editing, and managing Associate Warden data resides within the `StaffManagement` component.

## Key Components Rendered

- [`StaffManagement`](../../components/admin/staff/StaffManagement.md) (with `staffType="associateWarden"`)

## Dependencies

- `../../components/admin/staff/StaffManagement`
