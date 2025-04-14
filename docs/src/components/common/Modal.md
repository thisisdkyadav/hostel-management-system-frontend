# Modal Component (`/src/components/common/Modal.jsx`)

A base component for rendering modal dialogs using React Portals.

## Purpose and Functionality

This component provides the core structure and behavior for modal dialogs throughout the application. Other specific modals (like `ImageUploadModal`, `CommonSuccessModal`) often build upon this base. Its key features include:

- **React Portal:** Renders the modal directly into `document.body`, ensuring it appears above other page content regardless of its position in the component tree.
- **Backdrop:** Displays a semi-transparent, blurred backdrop behind the modal.
- **Closing Mechanisms:**
  - Closes when the user presses the `Escape` key.
  - Closes when the user clicks on the backdrop (outside the modal content).
  - Provides a close button (`FaTimes`) in the header.
- **Structure:**
  - A fixed header containing the `title` and the close button.
  - A scrollable content area for the `children` prop.
- **Styling:** Includes basic styling for appearance (background, shadow, rounded corners), a maximum height constraint (`max-h-[90vh]`), and an entrance animation (`animate-fadeIn`).
- **Custom Width:** Allows specifying a `width` prop for the modal.

## Props

| Prop       | Type     | Description                                                                                                        | Default     | Required |
| :--------- | :------- | :----------------------------------------------------------------------------------------------------------------- | :---------- | :------- |
| `title`    | `string` | The text to display in the modal header.                                                                           | -           | Yes      |
| `children` | `node`   | The React node(s) to render as the main content of the modal.                                                      | -           | Yes      |
| `onClose`  | `func`   | Callback function invoked when the modal requests to be closed (via Escape key, backdrop click, or close button).  | -           | Yes      |
| `width`    | `number` | Optional width in pixels for the modal. If provided, sets `max-width`. If not, defaults to Tailwind's `max-w-2xl`. | `undefined` | No       |

## Usage Example

This component is typically used as a wrapper for more specific modal content.

```jsx
import React, { useState } from "react"
import Modal from "./Modal"
import Button from "./Button"

function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  return (
    <div>
      <Button onClick={handleOpen}>Open Settings</Button>

      {isOpen && (
        <Modal title="Application Settings" onClose={handleClose} width={700}>
          {/* Content of the settings modal */}
          <div className="space-y-4">
            <p>Here you can adjust various application settings.</p>
            {/* Example: Form fields, toggles, etc. */}
            <label className="block">
              <input type="checkbox" className="mr-2" />
              Enable dark mode
            </label>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleClose}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
```

## Dependencies

- `react-dom`: Uses `createPortal`.
- `react-icons/fa`: Uses the `FaTimes` icon.
