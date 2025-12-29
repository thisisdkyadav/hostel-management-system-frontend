import React, { useState } from "react"
import Modal from "../../../common/Modal"
import Button from "../../../common/Button"
import Input from "../../../common/ui/Input"
import Select from "../../../common/ui/Select"
import { FaDoorOpen, FaUsers, FaTrash } from "react-icons/fa"

const EditRoomModal = ({ room, isUnitBased, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    id: room.id,
    unitNumber: room.unitNumber || "",
    roomNumber: room.roomNumber || "",
    capacity: room.capacity || 1,
    status: room.status || "Active",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "capacity" ? parseInt(value) : value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      setErrors({ form: "Failed to update room. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = () => {
    setConfirmDelete(true)
  }

  const handleDeleteRoom = async () => {
    try {
      await onDelete(room.id)
    } catch (error) {
      setErrors({ form: "Failed to delete room. Please try again." })
      setConfirmDelete(false)
    }
  }

  return (
    <Modal title="Edit Room Details" onClose={onClose} width={500}>
      {confirmDelete ? (
        <div style={{ padding: 'var(--spacing-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>Confirm Deletion</h3>
          <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-6)' }}>Are you sure you want to delete this room? This action cannot be undone.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
            <Button onClick={() => setConfirmDelete(false)} variant="outline" size="small">
              Cancel
            </Button>
            <Button onClick={handleDeleteRoom} variant="danger" size="small" animation="shake">
              Delete Room
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {errors.form && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'flex-start' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.form}
            </div>
          )}

          {isUnitBased && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Unit Number</label>
              <Input type="text" value={formData.unitNumber} icon={<FaDoorOpen />} disabled />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Room {isUnitBased ? "Letter" : "Number"}</label>
            <Input type="text" value={formData.roomNumber} icon={<FaDoorOpen />} disabled />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Capacity</label>
            <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" icon={<FaUsers />} placeholder="Room capacity" error={errors.capacity} />
            {errors.capacity && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.capacity}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Status</label>
            <Select name="status" value={formData.status} onChange={handleChange} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Maintenance", label: "Maintenance" }]} error={errors.status} />
            {errors.status && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.status}</p>}
          </div>

          <div style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }} className="sm:flex-row sm:justify-between">
            {/* <Button onClick={handleDeleteConfirm} type="button" variant="danger" size="medium" className="flex items-center gap-2">
              <FaTrash /> Delete Room
            </Button> */}

            {/* <div className="flex flex-col-reverse sm:flex-row gap-3"> */}
            <Button onClick={onClose} type="button" variant="outline" size="medium">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" isLoading={isSubmitting} animation="ripple">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            {/* </div> */}
          </div>
        </form>
      )}
    </Modal>
  )
}

export default EditRoomModal
