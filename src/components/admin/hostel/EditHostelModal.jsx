import React, { useState, useEffect } from "react"
import { Alert, Button, Field, HStack, Input, Label, Modal, Select, useConfirm, VStack } from "hzero"
import { Building, User, DoorOpen, Archive } from "lucide-react"
import RoomManagementModal from "./RoomManagementModal"
import { hostelApi } from "../../../service"

const EditHostelModal = ({ hostel, onClose, onSave, refreshHostels }) => {
  const confirm = useConfirm()
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    phone: "",
    extensionNumber: "",
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
        email: hostel.email || "",
        phone: hostel.phone || "",
        extensionNumber: hostel.extensionNumber || "",
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

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits"
    }

    if (formData.extensionNumber.trim() && !/^\d{2,8}$/.test(formData.extensionNumber.trim())) {
      newErrors.extensionNumber = "Extension number must be 2 to 8 digits"
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
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ""),
        extensionNumber: formData.extensionNumber.trim(),
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
    const confirmed = await confirm({ message, confirmText: isArchived ? "Unarchive" : "Archive" })
    if (!confirmed) return

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

            <Field label="Hostel Name" htmlFor="name" required>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<Building size={16} />} placeholder="Enter hostel name" error={errors.name} />
            </Field>

            <Field label="Gender" htmlFor="gender" required>
              <Select name="gender" value={formData.gender} onChange={handleChange} icon={<User size={16} />} placeholder="Select Gender" options={[{ value: "Boys", label: "Boys" }, { value: "Girls", label: "Girls" }, { value: "Co-ed", label: "Co-ed" }]} error={errors.gender} />
            </Field>

            <Field label="Email" htmlFor="email" help="Optional">
              <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hostel@iiti.ac.in" error={errors.email} />
            </Field>

            <Field label="Phone Number" htmlFor="phone" help="Optional">
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit phone number" error={errors.phone} />
            </Field>

            <Field label="Extension Number" htmlFor="extensionNumber" help="Optional">
              <Input type="text" name="extensionNumber" value={formData.extensionNumber} onChange={handleChange} placeholder="e.g. 2345" error={errors.extensionNumber} />
            </Field>

            <Button type="button" onClick={handleArchiveToggle} variant="secondary" fullWidth>
              <Archive size={16} /> {isArchived ? "Unarchive Hostel" : "Archive Hostel"}
            </Button>

            <Button type="button" onClick={() => setShowRoomManagementModal(true)} variant="secondary" fullWidth>
              <DoorOpen size={16} /> Manage Hostel Rooms
            </Button>

            <HStack justify="between" gap="small" style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                size="md"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
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
