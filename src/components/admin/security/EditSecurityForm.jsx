import React, { useState } from "react"
import { FaTrash, FaSave, FaBuilding, FaUser, FaExclamationTriangle } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"

const EditSecurityForm = ({ security, onClose, onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()
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
    <Modal title="Edit Security Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Security Name</label>
          <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<FaUser />} placeholder="Enter security staff name" required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Hostel Assignment</label>
          <Select
            name="hostelId"
            value={formData.hostelId}
            onChange={handleChange}
            icon={<FaBuilding />}
            options={[{ value: "", label: "Not assigned to any hostel" }, ...hostelList.map((hostel) => ({ value: hostel._id, label: hostel.name }))]}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-5)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
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

export default EditSecurityForm
