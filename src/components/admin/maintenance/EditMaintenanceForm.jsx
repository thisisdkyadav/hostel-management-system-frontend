import React, { useState } from "react"
import { FaTrash, FaSave, FaTools, FaExclamationTriangle, FaPhone } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
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
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: "100%", padding: "var(--spacing-3)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-lg)", outline: "none", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }} placeholder="Enter staff name" required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Phone Number</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--spacing-3)", top: "var(--spacing-3)", color: "var(--color-text-placeholder)" }}>
              <FaPhone />
            </div>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: "100%", padding: "var(--spacing-3)", paddingLeft: "var(--spacing-10)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-lg)", outline: "none", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }} placeholder="+91 9876543210" />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Specialty Category</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--spacing-3)", top: "var(--spacing-3)", color: "var(--color-text-placeholder)" }}>
              <FaTools />
            </div>
            <select name="category" value={formData.category} onChange={handleChange} style={{ width: "100%", padding: "var(--spacing-3)", paddingLeft: "var(--spacing-10)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-lg)", outline: "none", appearance: "none", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }} required>
              <option value="">Select a category</option>
              {MAINTENANCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>


        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", paddingTop: "var(--spacing-4)", marginTop: "var(--spacing-5)", borderTop: "var(--border-1) solid var(--color-border-light)", gap: "var(--spacing-3)" }}>
          <button type="button" onClick={handleDelete} disabled={loading} style={{ padding: "var(--spacing-2-5) var(--spacing-4)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", transition: "var(--transition-colors)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? "var(--opacity-disabled)" : "var(--opacity-100)" }}>
            {loading ? <span style={{ width: "var(--spacing-5)", height: "var(--spacing-5)", border: "var(--border-2) solid var(--color-danger)", borderTopColor: "transparent", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite", marginRight: "var(--spacing-2)" }}></span> : <FaTrash style={{ marginRight: "var(--spacing-2)" }} />}
            Delete Account
          </button>

          <button type="submit" disabled={loading} style={{ padding: "var(--spacing-2-5) var(--spacing-4)", backgroundColor: "var(--color-primary)", color: "var(--color-white)", borderRadius: "var(--radius-lg)", transition: "var(--transition-colors)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? "var(--opacity-disabled)" : "var(--opacity-100)" }}>
            {loading ? <span style={{ width: "var(--spacing-5)", height: "var(--spacing-5)", border: "var(--border-2) solid var(--color-white)", borderTopColor: "transparent", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite", marginRight: "var(--spacing-2)" }}></span> : <FaSave style={{ marginRight: "var(--spacing-2)" }} />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditMaintenanceForm
