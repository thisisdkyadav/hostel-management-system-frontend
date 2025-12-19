import React, { useState } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "../../common/Modal"

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

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <button type="button" onClick={onClose} style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', transition: 'var(--transition-colors)', marginRight: 'var(--spacing-3)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
          >
            Cancel
          </button>
          <button type="submit" style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'var(--transition-colors)', opacity: loading ? 'var(--opacity-disabled)' : '1' }} onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-hover)')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-bg)')}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddVisitorProfileModal
