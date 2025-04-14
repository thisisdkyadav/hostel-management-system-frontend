# Student Feedback Page (`/src/pages/student/Feedback.jsx`)

This page provides a dedicated interface for students to submit feedback to the hostel management.

## Route

Likely corresponds to the `/student/feedback` route.

## Purpose and Functionality

1.  **Access Control:** Explicitly checks if the logged-in `user.role` is "Student". If not, it renders an "Access Denied" message.
2.  **Feedback Form:** Renders the [`FeedbackForm`](../../components/student/feedback/FeedbackForm.md) component, which likely contains fields for a feedback title and description.
3.  **Submission Logic:**
    - The `handleFeedbackSubmit` function is passed as the `onSubmit` prop to the form.
    - It calls `studentApi.submitFeedback` with the title and description.
    - On success, it sets state to show the [`CommonSuccessModal`](../../components/common/CommonSuccessModal.md) displaying the submitted feedback title.
    - On failure, it displays an alert message.
4.  **Success Feedback:** Uses a generic success modal component to confirm the feedback submission.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `user`: To check if the user has the "Student" role for access control.

## Key Components Rendered

- [`FeedbackForm`](../../components/student/feedback/FeedbackForm.md)
- [`CommonSuccessModal`](../../components/common/CommonSuccessModal.md) (conditionally rendered on success)
- Access Denied UI (conditionally rendered)

## API Usage

- `studentApi.submitFeedback(title, description)`

## Dependencies

- `react`: `useState`
- `react-icons/hi`: `HiAnnotation`
- `../../contexts/AuthProvider`
- `../../services/apiService`: `studentApi`
- `../../components/student/feedback/FeedbackForm`
- `../../components/common/CommonSuccessModal`
