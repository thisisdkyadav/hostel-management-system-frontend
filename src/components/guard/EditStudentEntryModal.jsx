import React, { useState } from "react"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import Button from "../common/Button"
import Modal from "../common/Modal"
import { useAuth } from "../../contexts/AuthProvider"

const EditStudentEntryModal = ({ entry, onClose, onSave, onDelete }) => {
  const { user } = useAuth()
  const hostelType = user?.hostel?.type

  const [formData, setFormData] = useState({
    ...entry,
    date: new Date(entry.dateAndTime).toISOString().split("T")[0],
    time: new Date(entry.dateAndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString()

    const updatedEntry = {
      ...formData,
      dateTime,
    }

    await onSave(updatedEntry)
    onClose()
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return
    }
    await onDelete(entry._id)
    onClose()
  }

  return (
    <Modal title="Edit Student Entry" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', border: `var(--border-1) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--spacing-4)', width: 'fit-content' }}>
            <button type="button" style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', backgroundColor: formData.status === "Checked In" ? 'var(--button-primary-bg)' : 'var(--color-bg-tertiary)', color: formData.status === "Checked In" ? 'var(--color-white)' : 'var(--color-text-body)', border: 'none', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)', transition: 'var(--transition-colors)' }} onClick={() => handleStatusChange("Checked In")}
              onMouseEnter={(e) => formData.status !== "Checked In" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
              onMouseLeave={(e) => formData.status !== "Checked In" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)')}
            >
              <FaSignInAlt size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-sm'))} /> Checked In
            </button>
            <button type="button" style={{ padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', backgroundColor: formData.status === "Checked Out" ? 'var(--button-primary-bg)' : 'var(--color-bg-tertiary)', color: formData.status === "Checked Out" ? 'var(--color-white)' : 'var(--color-text-body)', border: 'none', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)', transition: 'var(--transition-colors)' }} onClick={() => handleStatusChange("Checked Out")}
              onMouseEnter={(e) => formData.status !== "Checked Out" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
              onMouseLeave={(e) => formData.status !== "Checked Out" && (e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)')}
            >
              <FaSignOutAlt size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-sm'))} /> Checked Out
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Student Email</label>
            <input type="text" name="studentId" value={formData.userId.email} onChange={handleChange} readOnly style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-input)`, fontSize: 'var(--font-size-base)' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Student Name</label>
            <input type="text" name="studentName" value={formData.userId.name} onChange={handleChange} readOnly style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-input)`, fontSize: 'var(--font-size-base)' }} required />
          </div>

          {hostelType === "unit-based" && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Unit</label>
              <input type="text" name="unit" value={formData.unit || ""} onChange={handleChange} readOnly style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-input)`, fontSize: 'var(--font-size-base)' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Room</label>
            <input type="text" name="room" value={formData.room} onChange={handleChange} readOnly style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-input)`, fontSize: 'var(--font-size-base)' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Bed</label>
            <input type="text" name="bed" value={formData.bed} onChange={handleChange} readOnly style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-input)`, fontSize: 'var(--font-size-base)' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-input)`, fontSize: 'var(--font-size-base)' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} style={{ width: '100%', backgroundColor: 'var(--input-bg)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-input)`, fontSize: 'var(--font-size-base)' }} required />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)' }}>
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete Entry
          </Button>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default EditStudentEntryModal
