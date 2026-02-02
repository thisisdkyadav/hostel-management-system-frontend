import React, { useState } from "react"
import { FaTrash, FaSave, FaTools, FaPhone } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../service"
import { Modal, Input, Select, VStack, HStack, Label, Alert } from "@/components/ui"
import { Button } from "czero/react"
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
    const confirmDelete = window.confirm("Are you sure you want to delete this maintenance staff account?")
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

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--spacing-6)" }}>
            <div style={{ position: "relative", height: "var(--avatar-3xl)", width: "var(--avatar-3xl)", borderRadius: "var(--radius-full)", marginBottom: "var(--spacing-2)" }}>
              {formData.profileImage ? (
                <img src={getMediaUrl(formData.profileImage)} alt={formData.name} style={{ height: "var(--avatar-3xl)", width: "var(--avatar-3xl)", borderRadius: "var(--radius-full)", objectFit: "cover", border: "var(--border-4) solid var(--color-primary)", boxShadow: "var(--shadow-md)" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "var(--avatar-3xl)", width: "var(--avatar-3xl)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", border: "var(--border-4) solid var(--color-primary)", boxShadow: "var(--shadow-md)" }}>
                  <FaTools style={{ height: "var(--icon-4xl)", width: "var(--icon-4xl)", color: "var(--color-primary)" }} />
                </div>
              )}
              <div onClick={() => setIsImageModalOpen(true)} style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "var(--color-primary)", color: "var(--color-white)", padding: "var(--spacing-1-5)", borderRadius: "var(--radius-full)", cursor: "pointer", transition: "var(--transition-colors)" }}>
                <HiCamera style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
              </div>
            </div>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Click the camera icon to change profile photo</span>
          </div>

          {isImageModalOpen && <ImageUploadModal userId={staff.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

          <div>
            <Label htmlFor="name" required>Staff Name</Label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Enter staff name" required />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" icon={<FaPhone />} />
          </div>

          <div>
            <Label htmlFor="category" required>Specialty Category</Label>
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
          </div>



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
