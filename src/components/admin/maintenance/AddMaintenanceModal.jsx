import React, { useState } from "react"
import { FiUser, FiMail, FiLock, FiTool, FiPhone } from "react-icons/fi"
import { adminApi } from "../../../service"
import { Alert, Field, HStack, Label, Select, Text, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"
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
    <Modal isOpen={show} title="Add New Maintenance Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error">{error}</Alert>}

          <Field label="Staff Name" htmlFor="name" required>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Enter staff name" required />
          </Field>

          <Field label="Email Address" htmlFor="email" required>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="maintenance@example.com" required />
          </Field>

          <Field label="Phone Number" htmlFor="phone">
            <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} icon={<FiPhone />} placeholder="+91 9876543210" />
          </Field>

          <Field label="Password" htmlFor="password" required>
            <Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Enter a strong password" required />
            <Text as="div" size="xs" color="muted" style={{ marginTop: "var(--spacing-1)", marginLeft: "var(--spacing-1)" }}>Password should be at least 8 characters</Text>
          </Field>

          <div>
            <Label htmlFor="category" required>Specialty Category</Label>
          </div>



          <HStack gap="small" justify="end" style={{ paddingTop: "var(--spacing-4)", marginTop: "var(--spacing-5)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
            <Button type="button" onClick={onClose} variant="secondary" size="md">
              Cancel
            </Button>

            <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
              {loading ? "Adding..." : "Add Staff"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default AddMaintenanceModal
