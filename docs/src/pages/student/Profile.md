# Student Profile Page (`/src/pages/student/Profile.jsx`)

This page displays the detailed profile information for the logged-in student, including personal details, academic information, and room allocation.

## Route

Likely corresponds to the `/student/profile` route.

## Purpose and Functionality

1.  **Data Fetching:**
    - Retrieves the `userId` from the `useAuth` context.
    - Fetches the detailed student profile using the imported `fetchStudentProfile(userId)` service function (likely from `../../services/studentService`).
    - Handles loading and error states during data fetching.
2.  **Profile Display:**
    - Displays the student's profile image (using a default image `userImg` as fallback).
    - Shows personal details: Name, Email, Roll No, DOB, Gender, Address.
    - Shows academic details: Department, Degree, Admission Year, Graduation Year.
3.  **Room Information Display:**
    - Displays the student's allocated `roomNumber`.
    - Includes a visual representation of a room layout (potentially simplified/static) indicating the student's bed (E2 in the example).
4.  **Room Change Request:**
    - Provides an "Apply for Room Change" button.
    - Clicking the button sets the `isOpen` state to true, which displays the [`RoomChangeForm`](../../components/students/RoomChangeForm.md) modal, passing the `student` data to it.
5.  **Layout:** Uses absolute positioning for layout elements (which might be less flexible than other methods like Flexbox or Grid for the main page structure). Organizes profile and room info into styled cards.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `user`: To get the `_id` of the logged-in student for fetching their profile.

## Key Components Rendered

- [`RoomChangeForm`](../../components/students/RoomChangeForm.md) (modal, conditionally rendered)

## Service Usage

- `fetchStudentProfile(userId)` (from `../../services/studentService`)

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/bs`: `BsDoorOpenFill`
- `../../contexts/AuthProvider`
- `../../services/studentService`
- `../../components/students/RoomChangeForm`
- `../../assets/girlImg.jpeg` (default profile image)
