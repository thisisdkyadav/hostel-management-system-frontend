# EditStudentModal Component (`/src/components/common/students/EditStudentModal.jsx`)

A modal dialog containing a form to edit an existing student's details.

## Purpose and Functionality

This component provides the modal wrapper for editing a student's information. It:

- Renders the base `Modal` component with the title "Edit Student".
- Initializes and renders the `StudentEditForm` component, passing the existing `studentData` as `initialData`.
- Handles the submission of the `StudentEditForm`:
  - Calls `studentApi.updateStudent` with the student's `userId` and the updated data from the form.
  - Shows loading state during the API call.
  - Displays success or error alerts.
  - Calls the `onUpdate` prop function upon successful update (for refreshing parent data).
  - Closes the modal (`onClose`) upon successful update.

## Props

| Prop          | Type     | Description                                                                                                                | Default | Required |
| :------------ | :------- | :------------------------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `isOpen`      | `bool`   | Controls the visibility of the modal. (Passed implicitly to the underlying `Modal` but not directly used).                 | -       | Yes      |
| `onClose`     | `func`   | Callback function invoked when the modal requests to be closed (via the Modal's close button or the form's cancel button). | -       | Yes      |
| `studentData` | `object` | An object containing the current data of the student to be edited. Must include `userId`.                                  | -       | Yes      |
| `onUpdate`    | `func`   | Callback function invoked after a successful update. Typically used to trigger a data refresh in the parent component.     | -       | Yes      |

## Internal State

- `loading`: Boolean indicating if the update submission is in progress.
- `formData`: Holds the initial student data to be passed to the form. (Used primarily to wait until `studentData` is available before rendering).

## Usage Example

Triggered from a component like `StudentDetailModal` or a table row action.

```jsx
// Inside StudentDetailModal or similar component
import React, { useState } from "react"
import EditStudentModal from "./EditStudentModal"
import Button from "../../common/Button"

function StudentDetailsDisplay({ student, onDataRefresh }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleOpenEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditModalOpen(false)
  }

  const handleSuccessfulUpdate = () => {
    // Passed to EditStudentModal, called after successful API update
    onDataRefresh() // Refresh the details or the list in the parent
  }

  return (
    <div>
      {/* ... Display student details ... */}
      <Button onClick={handleOpenEdit}>Edit Student</Button>

      {isEditModalOpen && (
        <EditStudentModal
          isOpen={isEditModalOpen} // Although not directly used by EditStudentModal, good practice to pass
          onClose={handleCloseEdit}
          studentData={student} // Pass the full student object including userId
          onUpdate={handleSuccessfulUpdate}
        />
      )}
    </div>
  )
}
```

## Dependencies

- `./forms/StudentEditForm`: The actual form component used for editing.
- `../../common/Modal`: The base modal component.
- `../../../services/apiService.js`: Uses `studentApi.updateStudent`.
