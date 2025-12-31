import React, { useState } from "react"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { Button, Modal, Input } from "@/components/ui"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
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
          <ToggleButtonGroup
            options={[
              { value: "Checked In", label: "Checked In", icon: <FaSignInAlt /> },
              { value: "Checked Out", label: "Checked Out", icon: <FaSignOutAlt /> },
            ]}
            value={formData.status}
            onChange={handleStatusChange}
            shape="rounded"
            size="medium"
            variant="primary"
            hideLabelsOnMobile={false}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Student Email</label>
            <Input type="text" name="studentId" value={formData.userId.email} onChange={handleChange} readOnly />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Student Name</label>
            <Input type="text" name="studentName" value={formData.userId.name} onChange={handleChange} readOnly />
          </div>

          {hostelType === "unit-based" && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Unit</label>
              <Input type="text" name="unit" value={formData.unit || ""} onChange={handleChange} readOnly />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Room</label>
            <Input type="text" name="room" value={formData.room} onChange={handleChange} readOnly required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Bed</label>
            <Input type="text" name="bed" value={formData.bed} onChange={handleChange} readOnly required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Date</label>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Time</label>
            <Input type="time" name="time" value={formData.time} onChange={handleChange} required />
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
