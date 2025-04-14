# SimpleDatePicker Component (`/src/components/common/SimpleDatePicker.jsx`)

A styled wrapper around the native HTML date input (`<input type="date">`).

## Purpose and Functionality

This component provides a consistent look and feel for date selection using the browser's built-in date picker UI. It enhances the standard date input by:

- Adding a calendar icon (`FaCalendarAlt`) inside the input field for better visual indication.
- Applying consistent styling (padding, border, focus states) matching other form elements in the application.
- Handling the conversion between the input's string value (`YYYY-MM-DD`) and JavaScript `Date` objects for easier state management.
- Supporting an optional `minDate` prop to disable past dates.

## Props

| Prop           | Type             | Description                                                                                                     | Default     | Required |
| :------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------- | :---------- | :------- |
| `selectedDate` | `Date` or `null` | The currently selected date value (as a JavaScript `Date` object) or `null` if no date is selected.             | -           | Yes      |
| `onChange`     | `func`           | Callback function invoked when the date value changes. Receives the new `Date` object or `null` as an argument. | -           | Yes      |
| `placeholder`  | `string`         | Placeholder text for the input field (Note: browser support/display for date input placeholders may vary).      | `undefined` | No       |
| `minDate`      | `Date` or `null` | An optional minimum selectable date (as a `Date` object). Dates before this will be disabled.                   | `undefined` | No       |

## Date Handling

- The component internally formats the `selectedDate` (Date object) into the `YYYY-MM-DD` string format required by the `value` attribute of `<input type="date">`.
- When the input value changes, the `onChange` handler parses the `YYYY-MM-DD` string back into a `Date` object before calling the `onChange` prop function.
- If the date input is cleared, `onChange(null)` is called.

## Usage Example

```jsx
import React, { useState } from "react"
import SimpleDatePicker from "./SimpleDatePicker"

function EventForm() {
  const [eventDate, setEventDate] = useState(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set time to start of day for accurate comparison

  const handleDateChange = (newDate) => {
    console.log("Selected Date:", newDate)
    setEventDate(newDate)
  }

  return (
    <div className="p-4">
      <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">
        Event Date
      </label>
      <SimpleDatePicker
        selectedDate={eventDate}
        onChange={handleDateChange}
        placeholder="Select event date"
        minDate={today} // Disallow selecting past dates
      />
      {eventDate && <p className="mt-2 text-sm">Selected: {eventDate.toLocaleDateString()}</p>}
    </div>
  )
}
```

## Dependencies

- `react-icons/fa`: Uses the `FaCalendarAlt` icon.
