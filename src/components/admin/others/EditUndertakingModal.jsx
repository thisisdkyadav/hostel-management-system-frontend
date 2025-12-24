import { useState, useEffect } from "react"
import { FaFileSignature, FaCalendarAlt, FaInfoCircle } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import { adminApi } from "../../../services/adminApi"

const EditUndertakingModal = ({ show, undertaking, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    content: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (undertaking) {
      setFormData({
        title: undertaking.title || "",
        description: undertaking.description || "",
        deadline: undertaking.deadline || "",
        content: undertaking.content || "",
      })
    }
  }, [undertaking])

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

      await adminApi.updateUndertaking(undertaking.id, formData)
      alert("Undertaking updated successfully!")

      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update undertaking:", error)
      setError("Failed to update undertaking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal title="Edit Undertaking" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Title</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaFileSignature />
            </div>
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Undertaking Title" required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Description</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaInfoCircle />
            </div>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'vertical' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Brief description of this undertaking" required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Deadline</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-muted)' }}>
              <FaCalendarAlt />
            </div>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Undertaking Content</label>
          <div style={{ position: 'relative' }}>
            <textarea name="content" value={formData.content} onChange={handleChange} rows={6} style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', outline: 'none', transition: 'var(--transition-all)', resize: 'vertical' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} placeholder="Full text of the undertaking that students will need to read and accept" required />
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
            <strong>Note:</strong> Editing the content will not affect students who have already accepted this undertaking.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-2)' }}>
          <Button type="button" onClick={onClose} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
            Update Undertaking
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditUndertakingModal
