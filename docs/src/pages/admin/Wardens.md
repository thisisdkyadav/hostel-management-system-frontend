# Wardens Page (`/src/pages/admin/Wardens.jsx`)

This page provides the interface for managing Warden staff members.

## Route

Likely corresponds to the `/admin/wardens` route.

## Purpose and Functionality

This component acts as a simple wrapper around the generic staff management component.

- It renders the [`StaffManagement`](../../components/admin/staff/StaffManagement.md) component.
- It passes the specific `staffType="warden"` prop to the `StaffManagement` component, configuring it to handle Wardens.

All the actual logic for fetching, displaying, adding, editing, and managing Warden data resides within the `StaffManagement` component.

## Key Components Rendered

- [`StaffManagement`](../../components/admin/staff/StaffManagement.md) (with `staffType="warden"`)

## Dependencies

- `../../components/admin/staff/StaffManagement`
