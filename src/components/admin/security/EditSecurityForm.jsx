import React, { useState } from "react"
import { FaTrash, FaSave, FaBuilding, FaUser } from "react-icons/fa"
import { adminApi } from "../../../service"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Modal, Button, Input, Select, VStack, HStack, Label, Alert } from "@/components/ui"

const EditSecurityForm = ({ security, onClose, onUpdate, onDelete }) => {
  const { hostelList } = useGlobal()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: security.name || "",
    hostelId: security.hostelId || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const message = await adminApi.updateSecurity(security.id, formData)
      if (!message) {
        setError("Failed to update security staff. Please try again.")
        return
      }

      alert("Security staff updated successfully!")
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update security staff:", error)
      setError("Failed to update security staff. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this security staff account?")
    if (confirmDelete) {
      try {
        setLoading(true)
        setError(null)

        const message = await adminApi.deleteSecurity(security.id)
        if (!message) {
          setError("Failed to delete security staff. Please try again.")
          return
        }

        alert("Security staff deleted successfully!")
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error("Failed to delete security staff:", error)
        setError("Failed to delete security staff. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Modal isOpen={true} title="Edit Security Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error">{error}</Alert>}

          <div>
            <Label htmlFor="name">Security Name</Label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} icon={<FaUser />} placeholder="Enter security staff name" required />
          </div>

          <div>
            <Label htmlFor="hostelId">Hostel Assignment</Label>
            <Select
              name="hostelId"
              id="hostelId"
              value={formData.hostelId}
              onChange={handleChange}
              icon={<FaBuilding />}
              options={[{ value: "", label: "Not assigned to any hostel" }, ...hostelList.map((hostel) => ({ value: hostel._id, label: hostel.name }))]}
            />
          </div>

          <HStack gap="small" justify="between" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-5)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
            <Button type="button" onClick={handleDelete} variant="danger" size="medium" icon={<FaTrash />} isLoading={loading} disabled={loading}>
              Delete Account
            </Button>

            <Button type="submit" variant="primary" size="medium" icon={<FaSave />} isLoading={loading} disabled={loading}>
              Save Changes
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default EditSecurityForm
