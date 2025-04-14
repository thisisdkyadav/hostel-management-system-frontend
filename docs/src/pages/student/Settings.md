# Student Settings Page (`/src/pages/student/Settings.jsx`)

This page provides students access to view and manage certain profile settings and related information.

## Route

Likely corresponds to the `/student/settings` route.

## Purpose and Functionality

1.  **Data Fetching:**
    - Retrieves the `userId` from the `useAuth` context.
    - Fetches the detailed student profile using `fetchStudentProfile(userId)` (likely from `../../services/studentService`).
    - Handles loading and error states.
2.  **Information Display:**
    - Displays the current date, formatted.
    - Shows the student's profile picture and name in the header area.
    - Displays key profile details: Name, Email, Phone, Department, Hostel.
    - Displays information about the student's Faculty Advisor and Mentor (names fetched from `student.userId.mentorName`, likely requires the backend to populate this).
    - Includes placeholder "About" text for both advisor and mentor.
3.  **Profile Editing:**
    - An "Edit Profile" button opens a modal (`isOpenProfile`).
    - The modal contains a form (`handleSubmit`) allowing the student to update their Name, Email, Phone, Department, and Hostel.
    - Form data is managed using the `formData` state and `handleChange` function.
    - Submitting the form calls the `updateProfile(userId, formData)` service function.
    - On success, it shows an alert and reloads the page (`window.location.reload()`).
4.  **Room Change Request:**
    - A "Room change" button opens a separate modal (`isOpenRoom`).
    - This modal contains basic input fields for Preferred Room No. and Reason.
    - The submit button currently only triggers an alert (`alert("Room change request submitted")`) and does not appear to call any API service function to actually submit the request.
5.  **Layout:** Uses absolute positioning for major layout blocks, which might lead to responsiveness issues. Organizes profile details, advisor/mentor info into styled cards.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `user`: To get the `_id` of the logged-in student.

## Key Components Rendered

- Modal for Editing Profile (inline JSX)
- Modal for Room Change Request (inline JSX)

## Service Usage

- `fetchStudentProfile(userId)` (from `../../services/studentService`)
- `updateProfile(userId, formData)` (from `../../services/studentService`)

## Dependencies

- `react`: `useState`, `useEffect`
- `../../contexts/AuthProvider`
- `../../services/studentService`
- `../../assets/user.png` (default profile image)
