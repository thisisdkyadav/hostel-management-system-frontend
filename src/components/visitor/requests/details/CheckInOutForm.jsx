import React, { useState } from "react"
import { format } from "date-fns"

const CheckInOutForm = ({ requestId, visitorInfo, checkInTime, checkOutTime, onCheckIn, onCheckOut, onUpdateTimes, onCancel }) => {
  const today = new Date()
  const formattedDate = format(today, "yyyy-MM-dd")
  const formattedTime = format(today, "HH:mm")

  const [newCheckInDate, setNewCheckInDate] = useState(checkInTime ? format(new Date(checkInTime), "yyyy-MM-dd") : formattedDate)
  const [newCheckInTime, setNewCheckInTime] = useState(checkInTime ? format(new Date(checkInTime), "HH:mm") : formattedTime)
  const [newCheckOutDate, setNewCheckOutDate] = useState(checkOutTime ? format(new Date(checkOutTime), "yyyy-MM-dd") : formattedDate)
  const [newCheckOutTime, setNewCheckOutTime] = useState(checkOutTime ? format(new Date(checkOutTime), "HH:mm") : formattedTime)
  const [notes, setNotes] = useState("")

  // Determine the current state
  const isCheckedIn = !!checkInTime
  const isCheckedOut = !!checkOutTime
  const isEditMode = isCheckedIn // We're in edit mode if already checked in

  const handleCheckIn = () => {
    const checkInDateTime = `${newCheckInDate}T${newCheckInTime}:00`
    onCheckIn({
      checkInTime: checkInDateTime,
      notes,
    })
  }

  const handleCheckOut = () => {
    const checkOutDateTime = `${newCheckOutDate}T${newCheckOutTime}:00`
    onCheckOut({
      checkOutTime: checkOutDateTime,
      notes,
    })
  }

  const handleUpdateTimes = () => {
    const checkInDateTime = `${newCheckInDate}T${newCheckInTime}:00`
    const checkOutDateTime = isCheckedOut ? `${newCheckOutDate}T${newCheckOutTime}:00` : null

    onUpdateTimes({
      checkInTime: checkInDateTime,
      checkOutTime: checkOutDateTime,
      notes,
    })
  }

  // Dynamic title based on the current state
  const getFormTitle = () => {
    if (!isCheckedIn) return "Security Check-in"
    if (isCheckedOut) return "Update Check-in/Check-out Information"
    return "Security Check-out"
  }

  const containerStyle = {
    backgroundColor: "var(--color-bg-muted)",
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    border: `var(--border-1) solid var(--color-border-primary)`,
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  }

  const headingStyle = {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-primary)",
  }

  const labelStyle = {
    display: "block",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-secondary)",
    marginBottom: "var(--spacing-1)",
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    border: `var(--border-1) solid var(--color-border-input)`,
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-sm)",
    fontSize: "var(--font-size-sm)",
    padding: "var(--spacing-2)",
    outline: "none",
    transition: "var(--transition-colors)",
  }

  const readOnlyStyle = {
    ...inputStyle,
    padding: "var(--spacing-2)",
    backgroundColor: "var(--color-bg-disabled)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
  }

  const buttonBaseStyle = {
    padding: "var(--spacing-2) var(--spacing-4)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    border: "var(--border-1) solid transparent",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-sm)",
    cursor: "pointer",
    outline: "none",
    transition: "var(--transition-colors)",
  }

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    color: "var(--color-text-secondary)",
    backgroundColor: "var(--color-bg-primary)",
    borderColor: "var(--color-border-input)",
  }

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    color: "var(--color-white)",
    backgroundColor: "var(--color-primary)",
    borderColor: "transparent",
  }

  const successButtonStyle = {
    ...buttonBaseStyle,
    color: "var(--color-white)",
    backgroundColor: "var(--color-success-hover)",
    borderColor: "transparent",
  }

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>{getFormTitle()}</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "var(--spacing-4)",
        }}
      >
        <div>
          <label style={labelStyle}>Visitor Name(s)</label>
          <div style={readOnlyStyle}>{visitorInfo}</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "var(--spacing-4)",
        }}
      >
        <div>
          <label style={labelStyle}>Check-in Date</label>
          <input
            type="date"
            value={newCheckInDate}
            onChange={(e) => setNewCheckInDate(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)"
              e.target.style.boxShadow = "var(--input-focus-ring)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border-input)"
              e.target.style.boxShadow = "var(--shadow-sm)"
            }}
            disabled={!isEditMode && isCheckedIn} // Only editable if in edit mode
          />
        </div>
        <div>
          <label style={labelStyle}>Check-in Time</label>
          <input
            type="time"
            value={newCheckInTime}
            onChange={(e) => setNewCheckInTime(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)"
              e.target.style.boxShadow = "var(--input-focus-ring)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border-input)"
              e.target.style.boxShadow = "var(--shadow-sm)"
            }}
            disabled={!isEditMode && isCheckedIn} // Only editable if in edit mode
          />
        </div>
      </div>

      {/* Show check-out fields if already checked in or checked out */}
      {isCheckedIn && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--spacing-4)",
          }}
        >
          <div>
            <label style={labelStyle}>Check-out Date</label>
            <input
              type="date"
              value={newCheckOutDate}
              onChange={(e) => setNewCheckOutDate(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-primary)"
                e.target.style.boxShadow = "var(--input-focus-ring)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border-input)"
                e.target.style.boxShadow = "var(--shadow-sm)"
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>Check-out Time</label>
            <input
              type="time"
              value={newCheckOutTime}
              onChange={(e) => setNewCheckOutTime(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-primary)"
                e.target.style.boxShadow = "var(--input-focus-ring)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border-input)"
                e.target.style.boxShadow = "var(--shadow-sm)"
              }}
            />
          </div>
        </div>
      )}

      <div>
        <label style={labelStyle}>Security Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="2"
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary)"
            e.target.style.boxShadow = "var(--input-focus-ring)"
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border-input)"
            e.target.style.boxShadow = "var(--shadow-sm)"
          }}
          placeholder="Add any security notes about the visitors..."
        ></textarea>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--spacing-3)",
          paddingTop: "var(--spacing-2)",
        }}
      >
        <button type="button" onClick={onCancel} style={cancelButtonStyle}>
          Cancel
        </button>

        {/* Show appropriate action button based on the current state */}
        {!isCheckedIn ? (
          // Case 1: Initial check-in (not checked in yet)
          <button type="button" onClick={handleCheckIn} style={primaryButtonStyle}>
            Check-in Visitor
          </button>
        ) : isCheckedOut ? (
          // Case 2: Already checked out, only edit allowed
          <button type="button" onClick={handleUpdateTimes} style={primaryButtonStyle}>
            Update Times
          </button>
        ) : (
          // Case 3: Checked in but not checked out, show both options
          <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <button type="button" onClick={handleUpdateTimes} style={primaryButtonStyle}>
              Update Check-in
            </button>
            <button type="button" onClick={handleCheckOut} style={successButtonStyle}>
              Check-out Visitor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckInOutForm
