import React, { useState } from "react"
import { FaTrash, FaSave, FaTools, FaPhone } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../service"
import { Alert, Field, HStack, IconCircle, Label, Select, Text, useConfirm, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
const MAINTENANCE_CATEGORIES = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Attendant", "Other"]
const CATEGORY_DISPLAY_LABELS = {
  Plumbing: "Plumber",
  Electrical: "Electrician",
  Civil: "Carpenter",
  Cleanliness: "House Keeping",
  Internet: "IT Technician",
  Attendant: "Attendant",
  Other: "Other",
}
const getCategoryDisplayLabel = (value) => CATEGORY_DISPLAY_LABELS[value] || value

const EditMaintenanceForm = ({ staff, onClose, onUpdate, onDelete }) => {
  const confirm = useConfirm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: staff.name || "",
    category: staff.category || "",
    phone: staff.phone || "",
    profileImage: staff.profileImage || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const message = await adminApi.updateMaintenanceStaff(staff.id, formData)
      if (!message) {
        setError("Failed to update maintenance staff. Please try again.")
        return
      }

      alert("Maintenance staff updated successfully!")
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update maintenance staff:", error)
      setError("Failed to update maintenance staff. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = await confirm({ message: "Are you sure you want to delete this maintenance staff account?", isDestructive: true })
    if (confirmDelete) {
      try {
        setLoading(true)
        setError(null)

        const message = await adminApi.deleteMaintenanceStaff(staff.id)
        if (!message) {
          setError("Failed to delete maintenance staff. Please try again.")
          return
        }

        alert("Maintenance staff deleted successfully!")
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error("Failed to delete maintenance staff:", error)
        setError("Failed to delete maintenance staff. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Modal isOpen={true} title="Edit Maintenance Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error">{error}</Alert>}

          <VStack gap="none" align="center" style={{ marginBottom: "var(--spacing-6)" }}>
            <IconCircle size="var(--avatar-3xl)" style={{ position: "relative", marginBottom: "var(--spacing-2)" }}>
              {formData.profileImage ? (
                <img src={getMediaUrl(formData.profileImage)} alt={formData.name} style={{ height: "var(--avatar-3xl)", width: "var(--avatar-3xl)", borderRadius: "var(--radius-full)", objectFit: "cover", border: "var(--border-4) solid var(--color-primary)", boxShadow: "var(--shadow-md)" }} />
              ) : (
                <IconCircle size="var(--avatar-3xl)" bg="brand" style={{ border: "var(--border-4) solid var(--color-primary)", boxShadow: "var(--shadow-md)" }}>
                  <FaTools style={{ height: "var(--icon-4xl)", width: "var(--icon-4xl)" }} color="var(--color-primary)" />
                </IconCircle>
              )}
              <Text as="div" color="var(--color-white)" style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "var(--color-primary)", padding: "var(--spacing-1-5)", borderRadius: "var(--radius-full)", cursor: "pointer", transition: "var(--transition-colors)" }} onClick={() => setIsImageModalOpen(true)}>
                <HiCamera style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
              </Text>
            </IconCircle>
            <Text as="span" size="sm" color="muted">Click the camera icon to change profile photo</Text>
          </VStack>

          {isImageModalOpen && <ImageUploadModal userId={staff.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

          <Field label="Staff Name" htmlFor="name" required>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Enter staff name" required />
          </Field>

          <Field label="Phone Number" htmlFor="phone">
            <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" icon={<FaPhone />} />
          </Field>

          <Field label="Specialty Category" htmlFor="category" required>
            <Select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Select a category"
              icon={<FaTools />}
              options={MAINTENANCE_CATEGORIES.map((category) => ({
                value: category,
                label: getCategoryDisplayLabel(category),
              }))}
              required
            />
          </Field>



          <HStack gap="small" justify="between" style={{ paddingTop: "var(--spacing-4)", marginTop: "var(--spacing-5)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
            <Button type="button" onClick={handleDelete} variant="danger" size="md" loading={loading} disabled={loading}>
              <FaTrash /> Delete Account
            </Button>

            <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
              <FaSave /> Save Changes
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default EditMaintenanceForm
