# Feedback Card Component (`/src/components/FeedbackCard.jsx`)

This component displays a single feedback item and provides relevant actions based on the user's role and the feedback status.

## Purpose and Functionality

1.  **Display Feedback:**
    - Shows the feedback title, description, creation date/time, and status (Pending/Seen).
    - If not in `isStudentView`, displays the student's name, email, and profile picture.
    - Displays the staff reply if one exists.
2.  **Status Management (Non-Student View):**
    - Provides buttons to "Mark as Seen" (if Pending) or "Mark as Pending" (if Seen).
    - Confirmation prompts are shown before changing status, especially if removing a reply by marking as Pending.
    - Calls `feedbackApi.updateFeedbackStatus` to update the status.
    - Calls the `refresh` prop function on success.
3.  **Replying (Non-Student View):**
    - Provides a "Reply" or "Edit Reply" button.
    - Opens the [`FeedbackReplyModal`](./FeedbackReplyModal.md) component.
    - The modal handles the reply submission via the `handleReply` function passed to it.
    - `handleReply` calls `feedbackApi.replyToFeedback`.
    - On successful reply, it sets the status locally to "Seen" and calls `refresh`.
4.  **Editing (Student View):**
    - If `isStudentView` is true and the feedback status is "Pending", displays an "Edit" button.
    - Opens the [`FeedbackFormModal`](./student/feedback/FeedbackFormModal.md) with `isEditing={true}` and passes the current feedback data.
    - The modal handles the update submission via the `handleEdit` function.
    - `handleEdit` calls `feedbackApi.updateFeedback`.
    - Calls `refresh` on success.
5.  **Deleting (Student View):**
    - If `isStudentView` is true and the feedback status is "Pending", displays a "Delete" button.
    - Shows a confirmation prompt.
    - Calls `feedbackApi.deleteFeedback` on confirmation.
    - Calls `refresh` on success.
6.  **State Management:** Uses `useState` to manage the current status (allowing immediate UI update before refresh), modal visibility (`isReplyModalOpen`, `isEditModalOpen`), and loading state (`isUpdating`) for API calls.
7.  **Formatting:** Includes utility functions (`formatDate`, `formatTime`) and status color logic (`getStatusColor`).

## Props

- `feedback` (Object): The feedback data object, likely containing `_id`, `title`, `description`, `status`, `createdAt`, `reply`, and a nested `userId` object with `name`, `email`, `profileImage`.
- `refresh` (Function): A callback function to trigger a refresh of the feedback list in the parent component after an action (update status, reply, edit, delete).
- `isStudentView` (Boolean, optional, default: `false`): If true, displays actions relevant to the student who submitted the feedback (Edit/Delete if Pending). If false, displays actions for staff (Mark Seen/Pending, Reply).

## Context Usage

- None directly used, but actions likely depend on the user role determined in the parent component.

## Key Components Rendered

- [`FeedbackReplyModal`](./FeedbackReplyModal.md) (conditionally rendered)
- [`FeedbackFormModal`](./student/feedback/FeedbackFormModal.md) (conditionally rendered)

## API Usage

- `feedbackApi.updateFeedbackStatus(id, status)`
- `feedbackApi.replyToFeedback(id, replyText)`
- `feedbackApi.deleteFeedback(id)`
- `feedbackApi.updateFeedback(id, updatedData)`

## Dependencies

- `react`: `useState`
- `react-icons/hi`: `HiAnnotation`, `HiUser`, `HiCalendar`, `HiClock`, `HiEye`, `HiReply`, `HiTrash`, `HiPencilAlt`, `HiMail`
- `../services/feedbackApi`
- `./FeedbackReplyModal`
- `./student/feedback/FeedbackFormModal`

</rewritten_file>
