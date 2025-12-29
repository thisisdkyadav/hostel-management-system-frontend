import React, { useState } from "react"
import { FiUser, FiMail, FiLock, FiHome } from "react-icons/fi"
import { FaExclamationTriangle } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"

const AddSecurityModal = ({ show, onClose, onSuccess }) => {
  const { hostelList } = useAdmin()
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
    <Modal title="Add New Security" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Security Name</label>
          <Input type="text" name="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Enter security staff name" required />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Email Address</label>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="security@example.com" required />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Password</label>
          <Input type="password" name="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Enter a strong password" required />
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginLeft: 'var(--spacing-1)' }}>Password should be at least 8 characters</div>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Assign Hostel</label>
          <Select
            name="hostelId"
            value={formData.hostelId}
            onChange={handleChange}
            icon={<FiHome />}
            options={[{ value: "", label: "Select a hostel" }, ...hostelList.map((hostel) => ({ value: hostel._id, label: hostel.name }))]}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-5)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
            {loading ? "Adding..." : "Add Security"}
          </Button>
        </div>
      </form >
    </Modal >
  )
}

export default AddSecurityModal
