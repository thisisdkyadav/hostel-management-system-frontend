import React, { useState, useEffect } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"

const EditVisitorProfileModal = ({ isOpen, onClose, profile, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relation: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        relation: profile.relation || "",
      })
    }
  }, [profile])

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
        onClose()
      } else {
        setError("Failed to update visitor profile. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !profile) return null

  return (
    <Modal title="Edit Visitor Profile" onClose={onClose} width={500}>
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
            <input type="text" name="name" style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-border-focus)';
              e.target.style.boxShadow = 'var(--input-focus-ring)';
            }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Phone Number</label>
            <input type="tel" name="phone" style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-border-focus)';
              e.target.style.boxShadow = 'var(--input-focus-ring)';
            }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Email Address</label>
            <input type="email" name="email" style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-border-focus)';
              e.target.style.boxShadow = 'var(--input-focus-ring)';
            }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Relation with Student</label>
            <select name="relation" style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-colors)' }} onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-border-focus)';
              e.target.style.boxShadow = 'var(--input-focus-ring)';
            }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
              value={formData.relation}
              onChange={handleChange}
              required
            >
              <option value="">Select relation</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Guardian">Guardian</option>
              <option value="Relative">Relative</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" disabled={loading} isLoading={loading}>
            {loading ? "Saving..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditVisitorProfileModal
