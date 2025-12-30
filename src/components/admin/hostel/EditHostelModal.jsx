import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import { FaBuilding, FaUser, FaDoorOpen, FaArchive } from "react-icons/fa"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"
import RoomManagementModal from "./RoomManagementModal"
import { hostelApi } from "../../../service"

const EditHostelModal = ({ hostel, onClose, onSave, refreshHostels }) => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
  })

  const [isArchived, setIsArchived] = useState(hostel.isArchived)

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRoomManagementModal, setShowRoomManagementModal] = useState(false)

  useEffect(() => {
    if (hostel) {
      setFormData({
        name: hostel.name || "",
        gender: hostel.gender || "",
      })
    }
  }, [hostel])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Hostel name is required"
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await onSave({
        ...hostel,
        name: formData.name,
        gender: formData.gender,
      })

      onClose()
    } catch (error) {
      setErrors({ form: "Failed to update hostel details. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoomsUpdated = () => {
    // Notify parent that rooms were updated
    onSave({ ...hostel })
  }

  const handleArchiveToggle = async () => {
    const message = isArchived ? "Are you sure you want to unarchive this hostel?" : "Are you sure you want to archive this hostel?"
    // confirm the action
    const confirm = window.confirm(message)
    if (!confirm) return

    try {
      await hostelApi.changeArchiveStatus(hostel.id, !isArchived)
      setIsArchived(!isArchived)
      refreshHostels()
    } catch (error) {
      console.error("Error changing archive status:", error)
    }
  }

  return (
    <>
      <Modal title="Edit Hostel Details" onClose={onClose} width={500}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {errors.form && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'flex-start' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--icon-lg)', width: 'var(--icon-lg)', marginRight: 'var(--spacing-2)', marginTop: 'var(--spacing-0-5)', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.form}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Hostel Name</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<FaBuilding />} placeholder="Enter hostel name" error={errors.name} />
            {errors.name && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Gender</label>
            <Select name="gender" value={formData.gender} onChange={handleChange} icon={<FaUser />} placeholder="Select Gender" options={[{ value: "Boys", label: "Boys" }, { value: "Girls", label: "Girls" }, { value: "Co-ed", label: "Co-ed" }]} error={errors.gender} />
            {errors.gender && <p style={{ marginTop: 'var(--spacing-1-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>{errors.gender}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="button" onClick={handleArchiveToggle} variant="secondary" icon={<FaArchive />} animation="ripple" fullWidth>
              {isArchived ? "Unarchive Hostel" : "Archive Hostel"}
            </Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="button" onClick={() => setShowRoomManagementModal(true)} variant="secondary" icon={<FaDoorOpen />} animation="ripple" fullWidth>
              Manage Hostel Rooms
            </Button>
          </div>

          <div style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="medium"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="medium"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {showRoomManagementModal && <RoomManagementModal hostel={hostel} onClose={() => setShowRoomManagementModal(false)} onRoomsUpdated={handleRoomsUpdated} />}
    </>
  )
}

export default EditHostelModal
