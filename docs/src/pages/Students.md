# Student Management Page (`/src/pages/Students.jsx`)

This page provides a comprehensive interface for viewing, managing, importing, and exporting student data.

## Route

Likely corresponds to a route like `/students` or `/admin/students`, depending on the routing setup.

## Purpose and Functionality

1.  **Student Data Management:** Leverages the custom hook [`useStudents`](../hooks/useStudents.md) to handle fetching, filtering, sorting, pagination, and state management for student data.
2.  **Display:**
    - Displays student data in either a table view ([`StudentTableView`](../components/common/students/StudentTableView.md)) or a card view ([`StudentCard`](../components/common/students/StudentCard.md)).
    - Allows switching between view modes.
    - Shows overall statistics using [`StudentStats`](../components/common/students/StudentStats.md).
    - Includes [`Pagination`](../components/common/Pagination.md).
    - Displays a [`NoResults`](../components/common/NoResults.md) component when no students match the criteria.
3.  **Filtering & Sorting:**
    - Provides a toggleable advanced filter section ([`StudentFilterSection`](../components/common/students/StudentFilterSection.md)) allowing filtering by hostel, unit, year, department, degree, search term, and page size.
    - Supports sorting when using the table view (via `handleSort` from `useStudents`).
4.  **Student Details:** Clicking a student (in either view) opens the [`StudentDetailModal`](../components/common/students/StudentDetailModal.md) to show detailed information.
5.  **Import/Export (Admin):**
    - **Import:** An admin-only button opens [`ImportStudentModal`](../components/common/students/ImportStudentModal.md) to upload and process a CSV file for importing new students (`handleImportStudents` -> `useStudents.importStudents`).
    - **Export:** An export button (`handleExportStudents`) fetches full details for the currently displayed students (`studentApi.getStudentsByIds`) and generates a downloadable CSV file.
6.  **Bulk Updates (Admin):**
    - **Student Data:** An admin-only button opens [`UpdateStudentsModal`](../components/common/students/UpdateStudentsModal.md) for bulk updating student information (`handleUpdateStudents` -> `studentApi.updateStudents`).
    - **Allocations:** An admin-only button opens [`UpdateAllocationModal`](../components/common/students/UpdateAllocationModal.md) for bulk updating room allocations (`handleUpdateAllocations` -> `hostelApi.updateRoomAllocations`).
7.  **State Management:** Primarily managed within the `useStudents` hook, but the component also uses `useState` for view mode, modal visibility, and selected student state.
8.  **Access Control:** Uses `useAuth` to check the user's role (`Admin`) to conditionally render import, bulk update, and allocation update features.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To check the user's role for access control.
- **`useGlobal`** (from [`/src/contexts/GlobalProvider.jsx`](../contexts/GlobalProvider.md)):
  - `hostelList`, `unitList`: To provide options for the filter section.

## Custom Hooks

- **`useStudents`** (from [`/src/hooks/useStudents.md`]): Central hook for managing student data fetching, state, filtering, sorting, and pagination logic.

## Key Components Rendered

- [`StudentStats`](../components/common/students/StudentStats.md)
- [`StudentFilterSection`](../components/common/students/StudentFilterSection.md) (conditionally rendered)
- [`StudentTableView`](../components/common/students/StudentTableView.md) (conditionally rendered)
- [`StudentCard`](../components/common/students/StudentCard.md) (conditionally rendered)
- [`Pagination`](../components/common/Pagination.md)
- [`NoResults`](../components/common/NoResults.md) (conditionally rendered)
- [`StudentDetailModal`](../components/common/students/StudentDetailModal.md) (conditionally rendered)
- [`ImportStudentModal`](../components/common/students/ImportStudentModal.md) (conditionally rendered, Admin only)
- [`UpdateStudentsModal`](../components/common/students/UpdateStudentsModal.md) (conditionally rendered, Admin only)
- [`UpdateAllocationModal`](../components/common/students/UpdateAllocationModal.md) (conditionally rendered, Admin only)

## API Usage

- Managed within `useStudents` hook (likely uses `studentApi.getStudents`).
- `studentApi.getStudentsByIds(userIds)` (for export)
- `studentApi.updateStudents(updatedStudents)` (for bulk update)
- `hostelApi.updateRoomAllocations(allocations, hostelId)` (for allocation update)

## Dependencies

- `react`: `useState`
- `react-icons`: `FaUserGraduate`, `FaFileExport`, `FaFileImport`, `FaEdit`, `MdFilterAlt`, `MdClearAll`
- `../hooks/useStudents`
- `../contexts/AuthProvider`, `../contexts/GlobalProvider`
- `../services/apiService`: `studentApi`
- `../services/hostelApi`
- Multiple components from `/src/components/common` and `/src/components/common/students`
