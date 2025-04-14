# Feedback Reply Modal Component (`/src/components/FeedbackReplyModal.jsx`)

This component provides a modal dialog for staff (Warden/Admin) to view feedback details and submit or edit a reply.

## Purpose and Functionality

1.  **Modal Display:** Uses the common [`Modal`](./common/Modal.md) component to display the content.
2.  **Feedback Context:** Displays the title and description of the original feedback item passed via the `feedback` prop.
3.  **Reply Input:** Provides a `textarea` for entering the reply text.
    - Initializes the `textarea` with the existing `feedback.reply` if available (for editing).
    - Manages the reply text using the `replyText` state.
4.  **Submission:**
    - The "Submit Reply" button triggers the `handleSubmit` function.
    - `handleSubmit` calls the `onReply` callback function (passed via props) with the current `replyText`.
    - It manages a `isSubmitting` state to show a loading indicator on the button during submission.
    - On successful submission (indicated by the `onReply` function resolving), it clears the `replyText` state and calls `onClose`.

## Props

- `isOpen` (Boolean): Controls the visibility of the modal.
- `onClose` (Function): Callback function to close the modal.
- `feedback` (Object): The feedback object being replied to (contains `title`, `description`, `reply`).
- `onReply` (Function): An async callback function that is called when the user clicks "Submit Reply". It receives the `replyText` as an argument and should handle the API call to save the reply. It is expected to resolve (e.g., return true or a promise that resolves) on success.

## Key Components Rendered

- [`Modal`](./common/Modal.md)

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/hi`: `HiPaperAirplane`
- `react-icons/fa`: `FaComment`, `FaReply`
- `./common/Modal`
