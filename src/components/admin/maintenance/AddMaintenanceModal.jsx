import React, { useState } from "react"
import { FiUser, FiMail, FiLock, FiTool, FiPhone } from "react-icons/fi"
import { FaExclamationTriangle } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
import Button from "../../common/Button"

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

const AddMaintenanceModal = ({ show, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    category: "",
    phone: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const response = await adminApi.addMaintenanceStaff(formData)

      if (!response) {
        setError("Failed to add maintenance staff. Please try again.")
        return
      }

      alert("Maintenance staff added successfully!")

      setFormData({
        name: "",
        email: "",
        password: "",
        category: "",
        phone: "",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Error adding maintenance staff:", error)
      setError("Failed to add maintenance staff. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal title="Add New Maintenance Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {error && (
          <div style={{ padding: "var(--spacing-4)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "flex-start" }}>
            <FaExclamationTriangle style={{ marginTop: "var(--spacing-0-5)", marginRight: "var(--spacing-2)", flexShrink: 0 }} />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Staff Name</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--spacing-3)", top: "var(--spacing-3)", color: "var(--color-text-placeholder)" }}>
              <FiUser />
            </div>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: "100%", padding: "var(--spacing-3)", paddingLeft: "var(--spacing-10)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-lg)", outline: "none", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }} placeholder="Enter staff name" required />
          </div>
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Email Address</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--spacing-3)", top: "var(--spacing-3)", color: "var(--color-text-placeholder)" }}>
              <FiMail />
            </div>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: "100%", padding: "var(--spacing-3)", paddingLeft: "var(--spacing-10)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-lg)", outline: "none", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }} placeholder="maintenance@example.com" required />
          </div>
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Phone Number</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--spacing-3)", top: "var(--spacing-3)", color: "var(--color-text-placeholder)" }}>
              <FiPhone />
            </div>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: "100%", padding: "var(--spacing-3)", paddingLeft: "var(--spacing-10)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-lg)", outline: "none", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }} placeholder="+91 9876543210" />
          </div>
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Password</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--spacing-3)", top: "var(--spacing-3)", color: "var(--color-text-placeholder)" }}>
              <FiLock />
            </div>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: "100%", padding: "var(--spacing-3)", paddingLeft: "var(--spacing-10)", border: "var(--border-1) solid var(--color-border-input)", borderRadius: "var(--radius-lg)", outline: "none", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-body)", fontSize: "var(--font-size-base)" }} placeholder="Enter a strong password" required />
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)", marginLeft: "var(--spacing-1)" }}>Password should be at least 8 characters</div>
          </div>
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Specialty Category</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "var(--spacing-3)", top: "var(--spacing-3)", color: "var(--color-text-placeholder)" }}>
              <FiTool />
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



        <div className="flex flex-row justify-end gap-3 pt-4 mt-5 border-t" style={{ borderColor: "var(--color-border-light)" }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>

          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
            {loading ? "Adding..." : "Add Staff"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddMaintenanceModal
