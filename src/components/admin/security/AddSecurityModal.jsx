import React, { useState } from "react"
import { FiUser, FiMail, FiLock, FiHome } from "react-icons/fi"
import { adminApi } from "../../../service"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Select, VStack, HStack, Label, Alert } from "@/components/ui"
import { Button, Modal, Input } from "czero/react"
const AddSecurityModal = ({ show, onClose, onSuccess }) => {
  const { hostelList } = useGlobal()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hostelId: "",
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

      const response = await adminApi.addSecurity(formData)

      if (!response) {
        setError("Failed to add security personnel. Please try again.")
        return
      }

      alert("Security personnel added successfully!")

      setFormData({
        name: "",
        email: "",
        password: "",
        hostelId: "",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Error adding security personnel:", error)
      setError("Failed to add security personnel. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title="Add New Security" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error">{error}</Alert>}

          <div>
            <Label htmlFor="name" required>Security Name</Label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Enter security staff name" required />
          </div>

          <div>
            <Label htmlFor="email" required>Email Address</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="security@example.com" required />
          </div>

          <div>
            <Label htmlFor="password" required>Password</Label>
            <Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Enter a strong password" required />
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginLeft: 'var(--spacing-1)' }}>Password should be at least 8 characters</div>
          </div>

          <div>
            <Label htmlFor="hostelId" required>Assign Hostel</Label>
            <Select
              name="hostelId"
              id="hostelId"
              value={formData.hostelId}
              onChange={handleChange}
              icon={<FiHome />}
              options={[{ value: "", label: "Select a hostel" }, ...hostelList.map((hostel) => ({ value: hostel._id, label: hostel.name }))]}
              required
            />
          </div>

        <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-5)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button type="button" onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
            {loading ? "Adding..." : "Add Security"}
          </Button>
        </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default AddSecurityModal
