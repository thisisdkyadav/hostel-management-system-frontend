import React, { useState } from "react"
import { FaTrash, FaSave, FaTools, FaExclamationTriangle, FaPhone } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../service"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"
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
    <Modal title="Edit Maintenance Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {error && (
          <div style={{ padding: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "flex-start" }}>
            <FaExclamationTriangle style={{ marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
            <p>{error}</p>
          </div>
        )}

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
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Staff Name</label>
          <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter staff name" required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Phone Number</label>
          <Input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" icon={<FaPhone />} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Specialty Category</label>
          <Select
            name="category"
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



        <div className="flex flex-row justify-between pt-4 mt-5 border-t gap-3" style={{ borderColor: "var(--color-border-light)" }}>
          <Button type="button" onClick={handleDelete} variant="danger" size="medium" icon={<FaTrash />} isLoading={loading} disabled={loading}>
            Delete Account
          </Button>

          <Button type="submit" variant="primary" size="medium" icon={<FaSave />} isLoading={loading} disabled={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditMaintenanceForm
