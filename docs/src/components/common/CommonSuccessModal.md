# CommonSuccessModal Component (`/src/components/common/CommonSuccessModal.jsx`)

A reusable modal dialog to display a success message after an operation.

## Purpose and Functionality

This component provides a standardized way to inform the user that an action they performed has completed successfully. It builds upon the base `Modal` component and features:

- A large success icon (`HiCheckCircle`).
- A customizable title and message.
- An optional section (`infoText`, `infoIcon`) to display additional relevant information (e.g., a generated ID, a confirmation number).
- A single confirmation button (e.g., "Done") that closes the modal.

## Props

| Prop         | Type              | Description                                                                                                                       | Default                               | Required |
| :----------- | :---------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :------- |
| `show`       | `bool`            | Controls the visibility of the modal. If `false`, the component returns `null`.                                                   | -                                     | Yes      |
| `onClose`    | `func`            | Callback function invoked when the modal requests to be closed (via the button or potentially the base Modal's close mechanisms). | -                                     | Yes      |
| `title`      | `string`          | The main title text displayed in the modal header and body.                                                                       | `"Success"`                           | No       |
| `message`    | `string`          | The primary success message displayed below the title.                                                                            | `"Operation completed successfully."` | No       |
| `buttonText` | `string`          | The text displayed on the confirmation button.                                                                                    | `"Done"`                              | No       |
| `infoText`   | `string`          | Optional additional text to display in a highlighted box.                                                                         | `""`                                  | No       |
| `infoIcon`   | `React Component` | Optional React icon component to display next to the `infoText`.                                                                  | `null`                                | No       |
| `width`      | `number`          | The width of the modal dialog in pixels.                                                                                          | `500`                                 | No       |

## Usage Example

```jsx
import React, { useState } from "react"
import CommonSuccessModal from "./CommonSuccessModal"
import Button from "./Button"
import { FaTicketAlt } from "react-icons/fa" // Example icon

function SubmitComplaintForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [complaintId, setComplaintId] = useState(null)

  const handleSubmit = async (formData) => {
    // ... submit form data to API ...
    const response = await fetch("/api/complaints", { method: "POST", body: formData })
    const result = await response.json()

    if (response.ok) {
      setComplaintId(result.id) // Assume API returns the ID
      setIsSuccess(true)
    } else {
      // Handle error
    }
  }

  return (
    <div>
      {/* ... form fields ... */}
      <Button type="submit" onClick={handleSubmit}>
        Submit Complaint
      </Button>

      <CommonSuccessModal
        show={isSuccess}
        onClose={() => setIsSuccess(false)}
        title="Complaint Submitted!"
        message="Your complaint has been successfully registered."
        infoText={`Complaint ID: ${complaintId}`}
        infoIcon={FaTicketAlt} // Show a ticket icon next to the ID
        buttonText="Okay"
      />
    </div>
  )
}
```

## Dependencies

- `../common/Modal`: Uses the base Modal component.
- `react-icons/hi`: Uses the `HiCheckCircle` icon.

</rewritten_file>
