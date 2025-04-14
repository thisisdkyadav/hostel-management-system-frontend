# DisCoActions Component (`/src/components/common/students/DisCoActions.jsx`)

Component for viewing, adding, and editing disciplinary committee actions for a specific student.

## Purpose and Functionality

This component manages the display and modification of disciplinary records associated with a student identified by `userId`. Its features include:

- **Fetching Data:** Retrieves existing disciplinary actions for the student using `getDisCoActionsByStudent` when the component mounts or `userId` changes.
- **Displaying Actions:** Lists the fetched actions, showing the reason, action taken, date, and remarks for each.
- **Adding Actions:** Provides a toggleable form to add a new disciplinary action. The form includes fields for reason, action taken, date, and optional remarks.
- **Editing Actions:** Allows editing an existing action by populating the form with its details and providing a "Save Changes" button.
- **API Interaction:** Uses API service functions (`addDisCoAction`, `updateDisCoAction`) to persist new or updated actions.
- **Loading State:** Shows a loading indicator on the submit button during API calls.
- **Empty State:** Displays a message if no actions are found for the student.

## Props

| Prop     | Type     | Description                                                                        | Default | Required |
| :------- | :------- | :--------------------------------------------------------------------------------- | :------ | :------- |
| `userId` | `string` | The unique identifier of the student whose disciplinary actions are being managed. | -       | Yes      |

## Internal State

- `actions`: Array storing the fetched disciplinary actions.
- `showForm`: Boolean controlling the visibility of the add/edit form.
- `formData`: Object holding the current values of the form fields (`reason`, `actionTaken`, `date`, `remarks`).
- `loading`: Boolean indicating if an add/update operation is in progress.
- `editingId`: Stores the `_id` of the action being edited, or `null` if adding a new action.

## Key Functions

- `fetchDisCoActions`: Fetches actions for the current `userId`.
- `handleChange`: Updates the `formData` state as the user types.
- `handleEdit`: Populates the form with data from an existing action and sets `editingId`.
- `handleSubmit`: Handles both adding new actions (if `editingId` is null) and updating existing ones by calling the appropriate API function. Resets the form and refetches actions upon success.

## Usage Example

Typically used within a larger student detail view or profile page.

```jsx
import React from "react"
import DisCoActions from "./DisCoActions"

function StudentProfilePage({ studentId }) {
  // ... other profile components ...

  return (
    <div className="container mx-auto p-4">
      {/* ... Student Info Section ... */}

      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <DisCoActions userId={studentId} />
      </div>

      {/* ... Other sections ... */}
    </div>
  )
}
```

## Dependencies

- [`../../../services/apiService.js`](../../../services/README.md): Uses `addDisCoAction`, `getDisCoActionsByStudent`, `updateDisCoAction` functions for API communication.
