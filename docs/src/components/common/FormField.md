# FormField Component (`/src/components/common/FormField.jsx`)

A flexible component for rendering various types of form fields with labels and error messages.

## Purpose and Functionality

This component acts as a wrapper to standardize the rendering of common form inputs (`input`, `textarea`, `select`). It simplifies form creation by handling:

- Displaying a label associated with the input.
- Adding a visual indicator (`*`) for required fields.
- Rendering the appropriate input element based on the `type` prop.
- Passing down necessary attributes like `name`, `value`, `placeholder`, `required`.
- Handling `onChange` events.
- Displaying validation error messages below the field.

## Props

| Prop          | Type     | Description                                                                                                       | Default  | Required |
| :------------ | :------- | :---------------------------------------------------------------------------------------------------------------- | :------- | :------- |
| `label`       | `string` | The text content for the `<label>` element associated with the field.                                             | -        | Yes      |
| `name`        | `string` | The `name` attribute for the input element (used for form submission and linking label).                          | -        | Yes      |
| `type`        | `string` | The type of form field to render (`'text'`, `'textarea'`, `'select'`, `'email'`, `'password'`, `'number'`, etc.). | `'text'` | No       |
| `value`       | `any`    | The current value of the form field.                                                                              | -        | Yes      |
| `onChange`    | `func`   | Callback function invoked when the value of the form field changes.                                               | -        | Yes      |
| `required`    | `bool`   | If `true`, marks the field as required (adds `*` to label and sets `required` attribute).                         | `false`  | No       |
| `placeholder` | `string` | Placeholder text for `input` and `textarea` elements.                                                             | `""`     | No       |
| `options`     | `array`  | An array of objects for the `select` type. Each object should have `value` and `label` properties.                | `[]`     | No       |
| `rows`        | `number` | The number of visible text lines for the `textarea` type.                                                         | `4`      | No       |
| `error`       | `string` | An error message string to display below the field if validation fails.                                           | `""`     | No       |

## Type-Specific Behavior

- **`textarea`**: Renders a `<textarea>` element. Uses the `rows` prop.
- **`select`**: Renders a `<select>` element. Uses the `options` prop to generate `<option>` elements. Each object in `options` should be `{ value: any, label: string }`.
- **Other types (e.g., `text`, `email`, `password`)**: Renders an `<input>` element with the specified `type`.

## Usage Example

```jsx
import React, { useState } from "react"
import FormField from "./FormField"
import Button from "./Button"

const HOSTEL_OPTIONS = [
  { value: "", label: "Select Hostel" },
  { value: "BH1", label: "Boys Hostel 1" },
  { value: "GH1", label: "Girls Hostel 1" },
]

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hostel: "",
    comments: "",
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Basic validation example on change
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }))
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" })) // Clear error
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add more comprehensive validation on submit if needed
    console.log("Form Submitted:", formData)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" error={errors.name} />
      <FormField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your.email@example.com" error={errors.email} />
      <FormField label="Select Hostel" name="hostel" type="select" value={formData.hostel} onChange={handleChange} options={HOSTEL_OPTIONS} required error={errors.hostel} />
      <FormField label="Additional Comments" name="comments" type="textarea" value={formData.comments} onChange={handleChange} rows={5} placeholder="Any additional information..." error={errors.comments} />
      <Button type="submit">Register</Button>
    </form>
  )
}
```
