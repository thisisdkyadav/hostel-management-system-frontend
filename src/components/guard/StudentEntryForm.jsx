import React, { useState } from "react"
import Button from "../common/Button"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import { useAuth } from "../../contexts/AuthProvider"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"

const StudentEntryForm = ({ onAddEntry }) => {
  const { user } = useAuth()
  const hostelType = user?.hostel?.type

  const [entryData, setEntryData] = useState({
    unit: "",
    room: "",
    bed: "",
    studentName: "",
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    status: "Checked In",
    notes: "",
  })

  const handleReset = () => {
    setEntryData({
      unit: "",
      room: "",
      bed: "",
      studentName: "",
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "Checked In",
      notes: "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEntryData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (status) => {
    setEntryData({ ...entryData, status })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isSuccess = await onAddEntry(entryData)
    if (isSuccess) {
      alert("Student entry added successfully!")
      handleReset()
    } else {
      alert("Failed to add student entry.")
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--color-bg-muted)',
    color: 'var(--color-text-secondary)',
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-input)',
    border: `var(--border-1) solid var(--color-border-input)`,
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-family-primary)'
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-card)', padding: 'var(--spacing-6)', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>Add New Student Entry</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <ToggleButtonGroup
            options={[
              { value: "Checked In", label: "Checked In", icon: <FaSignInAlt /> },
              { value: "Checked Out", label: "Checked Out", icon: <FaSignOutAlt /> },
            ]}
            value={entryData.status}
            onChange={handleStatusChange}
            shape="rounded"
            size="small"
            variant="primary"
            hideLabelsOnMobile={false}
          />
          <Button type="button" variant="primary" onClick={handleReset} className="flex items-center">
            Reset
          </Button>
        </div>
      </div>

      <form id="studentEntryForm" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-6)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Student ID</label>
            <input type="text" name="studentId" value={entryData.studentId} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Student Name</label>
            <input type="text" name="studentName" value={entryData.studentName} onChange={handleChange} style={inputStyle} required />
          </div>

          {hostelType === "unit-based" && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Unit</label>
              <input type="text" name="unit" value={entryData.unit} onChange={handleChange} style={inputStyle} required />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Room</label>
            <input type="text" name="room" value={entryData.room} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Bed</label>
            <input type="text" name="bed" value={entryData.bed} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Date</label>
            <input type="date" name="date" value={entryData.date} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Time</label>
            <input type="time" name="time" value={entryData.time} onChange={handleChange} style={inputStyle} required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Notes (Optional)</label>
            <textarea name="notes" value={entryData.notes} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} rows="2" />
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary">
            Register Entry
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StudentEntryForm
