import React, { useState } from "react"
import { Modal, Input, Select, Label, Alert, VStack, HStack } from "@/components/ui"
import { Button } from "czero/react"
import { DoorOpen, Users, Trash2 } from "lucide-react"

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
    <Modal isOpen={true} onClose={onClose} title="Edit Room Details" width={500}>
      {confirmDelete ? (
        <VStack gap="medium" style={{ padding: 'var(--spacing-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Confirm Deletion</h3>
          <p style={{ color: 'var(--color-text-tertiary)' }}>Are you sure you want to delete this room? This action cannot be undone.</p>
          <HStack justify="end" gap="small">
            <Button onClick={() => setConfirmDelete(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button onClick={handleDeleteRoom} variant="danger" size="sm">
              Delete Room
            </Button>
          </HStack>
        </VStack>
      ) : (
        <form onSubmit={handleSubmit}>
          <VStack gap="large">
            {errors.form && (
              <Alert type="error" icon>
                {errors.form}
              </Alert>
            )}

            {isUnitBased && (
              <div>
                <Label>Unit Number</Label>
                <Input type="text" value={formData.unitNumber} icon={<DoorOpen size={16} />} disabled />
              </div>
            )}

            <div>
              <Label>Room {isUnitBased ? "Letter" : "Number"}</Label>
              <Input type="text" value={formData.roomNumber} icon={<DoorOpen size={16} />} disabled />
            </div>

            <div>
              <Label htmlFor="capacity" required>Capacity</Label>
              <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" icon={<Users size={16} />} placeholder="Room capacity" error={errors.capacity} />
            </div>

            <div>
              <Label htmlFor="status" required>Status</Label>
              <Select name="status" value={formData.status} onChange={handleChange} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Maintenance", label: "Maintenance" }]} error={errors.status} />
            </div>

            <HStack gap="small" style={{ paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button onClick={onClose} type="button" variant="outline" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </HStack>
          </VStack>
        </form>
      )}
    </Modal>
  )
}

export default EditRoomModal
