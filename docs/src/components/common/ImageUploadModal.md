# ImageUploadModal Component (`/src/components/common/ImageUploadModal.jsx`)

A modal dialog for uploading and cropping a user's profile picture.

## Purpose and Functionality

This component provides a user interface for:

1.  Selecting an image file (via drag-and-drop or file input).
2.  Cropping the selected image to a square aspect ratio using an interactive cropper (`react-easy-crop`).
3.  Zooming and positioning the image within the crop area.
4.  Uploading the cropped image to the server (using `uploadApi.uploadProfileImage`).
5.  Displaying loading and success states.

## Props

| Prop            | Type     | Description                                                                                         | Default | Required |
| :-------------- | :------- | :-------------------------------------------------------------------------------------------------- | :------ | :------- |
| `userId`        | `string` | The ID of the user for whom the image is being uploaded. Passed to the API.                         | -       | Yes      |
| `isOpen`        | `bool`   | Controls whether the modal is currently visible.                                                    | -       | Yes      |
| `onClose`       | `func`   | Callback function invoked when the modal requests to be closed.                                     | -       | Yes      |
| `onImageUpload` | `func`   | Callback function invoked after successful image upload. Receives the new image URL as an argument. | -       | Yes      |

## Internal State

- `image`: Stores the base64 representation of the selected image file.
- `croppedAreaPixels`: Stores the pixel data of the cropped area provided by `react-easy-crop`.
- `crop`: Stores the current {x, y} position of the crop area.
- `zoom`: Stores the current zoom level of the image in the cropper.
- `uploading`: Boolean flag indicating if the upload process is in progress.
- `uploaded`: Boolean flag indicating if the upload was successful (used to show success message).

## Key Functionality

- **File Selection:** Handles file input change events, reads the file using `FileReader`.
- **Cropping:** Integrates `react-easy-crop` to allow visual cropping. `onCropComplete` updates the `croppedAreaPixels` state.
- **Image Processing:** `getCroppedImg` function uses a `canvas` element to draw the cropped portion of the image based on `croppedAreaPixels` and returns a `Blob`.
- **Uploading:** `uploadImage` constructs `FormData`, appends the cropped image Blob, and calls `uploadApi.uploadProfileImage`. Handles loading and success states.
- **Reset:** `handleReset` clears the component's state to allow for a new upload or cancellation.

## Usage Example

```jsx
import React, { useState } from "react"
import ImageUploadModal from "./ImageUploadModal"
import Button from "./Button"
import { useAuth } from "../contexts/AuthProvider" // Assuming auth context

function UserProfile() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, updateUserProfile } = useAuth() // Assuming context provides user and update function

  const handleUploadComplete = (newImageUrl) => {
    // Optionally update user context or refetch data
    console.log("New image URL:", newImageUrl)
    // Example: Update user profile in context
    updateUserProfile({ ...user, profileImageUrl: newImageUrl })
  }

  return (
    <div>
      {/* ... user profile display ... */}
      <Button onClick={() => setIsModalOpen(true)}>Change Profile Picture</Button>

      {isModalOpen && user && (
        <ImageUploadModal
          userId={user._id} // Pass the user's ID
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onImageUpload={handleUploadComplete}
        />
      )}
    </div>
  )
}
```

## Dependencies

- `react-easy-crop`: For the interactive image cropping UI.
- [`./Modal`](./Modal.md): Uses the common Modal component as a base.
- `react-icons/hi`: Uses `HiCheckCircle`, `HiUpload`, `HiX` icons.
- [`../../services/apiService`](../../services/README.md): Uses `uploadApi.uploadProfileImage` for the upload request.
