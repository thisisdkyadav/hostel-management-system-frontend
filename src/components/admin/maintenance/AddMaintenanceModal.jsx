import React, { useState } from "react"
import { FiUser, FiMail, FiLock, FiTool, FiPhone } from "react-icons/fi"
import { FaExclamationTriangle } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
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
          <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Enter staff name" required />
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Email Address</label>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="maintenance@example.com" required />
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Phone Number</label>
          <Input type="text" name="phone" value={formData.phone} onChange={handleChange} icon={<FiPhone />} placeholder="+91 9876543210" />
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Password</label>
          <Input type="password" name="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Enter a strong password" required />
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)", marginLeft: "var(--spacing-1)" }}>Password should be at least 8 characters</div>
        </div>

        <div>
          <label style={{ display: "block", color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Specialty Category</label>
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
