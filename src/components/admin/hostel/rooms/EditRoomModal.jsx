import React, { useState } from "react"
import Modal from "../../../common/Modal"
import Button from "../../../common/Button"
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
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                  <FaDoorOpen style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }} />
                </div>
                <input type="text" value={formData.unitNumber} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }} disabled />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Room {isUnitBased ? "Letter" : "Number"}</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FaDoorOpen style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }} />
              </div>
              <input type="text" value={formData.roomNumber} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }} disabled />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Capacity</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
                <FaUsers style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)' }} />
              </div>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: `var(--border-1) solid ${errors.capacity ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', backgroundColor: errors.capacity ? 'var(--color-danger-bg)' : 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { if (!errors.capacity) { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; } }} onBlur={(e) => { if (!errors.capacity) { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; } }} placeholder="Room capacity" />
            </div>
            {errors.capacity && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.capacity}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Status</label>
            <div style={{ position: 'relative' }}>
              <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', border: `var(--border-1) solid ${errors.status ? 'var(--color-danger)' : 'var(--color-border-input)'}`, borderRadius: 'var(--radius-lg)', backgroundColor: errors.status ? 'var(--color-danger-bg)' : 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-all)', appearance: 'none' }} onFocus={(e) => { if (!errors.status) { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; } }} onBlur={(e) => { if (!errors.status) { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; } }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', padding: '0 var(--spacing-2)', pointerEvents: 'none' }}>
                <svg style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', color: 'var(--color-text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
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
