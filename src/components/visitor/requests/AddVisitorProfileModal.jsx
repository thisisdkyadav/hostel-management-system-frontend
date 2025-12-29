import React, { useState } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"

const AddVisitorProfileModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relation: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const success = await onSubmit(formData)
      if (success) {
        setFormData({
          name: "",
          phone: "",
          email: "",
          relation: "",
        })
        onClose()
      } else {
        setError("Failed to add visitor profile. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title="Add Visitor Profile" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ color: 'var(--color-danger)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <p style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Visitor Name</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Phone Number</label>
            <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Email Address</label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Relation with Student</label>
            <Select name="relation" value={formData.relation} onChange={handleChange} placeholder="Select relation" options={[
              { value: "Parent", label: "Parent" },
              { value: "Sibling", label: "Sibling" },
              { value: "Guardian", label: "Guardian" },
              { value: "Relative", label: "Relative" },
              { value: "Friend", label: "Friend" },
              { value: "Other", label: "Other" }
            ]} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" disabled={loading} isLoading={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddVisitorProfileModal
