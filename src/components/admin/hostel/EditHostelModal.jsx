import React, { useState, useEffect } from "react"
import { Modal, Button, Input, Select, Label, Alert, VStack, HStack } from "@/components/ui"
import { FaBuilding, FaUser, FaDoorOpen, FaArchive } from "react-icons/fa"
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
      <Modal isOpen={true} onClose={onClose} title="Edit Hostel Details" width={500}>
        <form onSubmit={handleSubmit}>
          <VStack gap="large">
            {errors.form && (
              <Alert type="error" icon>
                {errors.form}
              </Alert>
            )}

            <div>
              <Label htmlFor="name" required>Hostel Name</Label>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<FaBuilding />} placeholder="Enter hostel name" error={errors.name} />
            </div>

            <div>
              <Label htmlFor="gender" required>Gender</Label>
              <Select name="gender" value={formData.gender} onChange={handleChange} icon={<FaUser />} placeholder="Select Gender" options={[{ value: "Boys", label: "Boys" }, { value: "Girls", label: "Girls" }, { value: "Co-ed", label: "Co-ed" }]} error={errors.gender} />
            </div>

            <Button type="button" onClick={handleArchiveToggle} variant="secondary" icon={<FaArchive />} fullWidth>
              {isArchived ? "Unarchive Hostel" : "Archive Hostel"}
            </Button>

            <Button type="button" onClick={() => setShowRoomManagementModal(true)} variant="secondary" icon={<FaDoorOpen />} fullWidth>
              Manage Hostel Rooms
            </Button>

            <HStack justify="between" gap="small" style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
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
            </HStack>
          </VStack>
        </form>
      </Modal>

      {showRoomManagementModal && <RoomManagementModal hostel={hostel} onClose={() => setShowRoomManagementModal(false)} onRoomsUpdated={handleRoomsUpdated} />}
    </>
  )
}

export default EditHostelModal
