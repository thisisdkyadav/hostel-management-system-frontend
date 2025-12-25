import { useState } from "react"
import Modal from "../common/Modal"
import Button from "../common/Button"
import { leaveApi } from "../../services/leaveApi"

const LeaveForm = ({ isOpen, setIsOpen, onSuccess }) => {
  const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await leaveApi.createLeave({ reason: formData.reason, startDate: formData.startDate, endDate: formData.endDate })
      onSuccess?.()
      setFormData({ reason: "", startDate: "", endDate: "" })
    } catch (err) {
      setError(err.message || "Failed to create leave")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Create Leave" onClose={() => setIsOpen(false)} width={600}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg-light)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-text)', fontSize: 'var(--font-size-sm)' }}>{error}</div>
        )}

        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Reason</label>
          <textarea name="reason" placeholder="Reason for leave" style={{ width: '100%', padding: 'var(--spacing-3)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-input)', outline: 'none', transition: 'var(--transition-all)', resize: 'none', height: '6rem' }} onFocus={(e) => {
            e.target.style.boxShadow = 'var(--input-focus-ring)';
            e.target.style.borderColor = 'var(--input-border-focus)';
          }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--color-border-input)';
            }}
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-md)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Start Date</label>
            <input type="date" name="startDate" style={{ width: '100%', padding: 'var(--spacing-3)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-input)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--input-border-focus)';
            }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--color-border-input)';
              }}
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>End Date</label>
            <input type="date" name="endDate" style={{ width: '100%', padding: 'var(--spacing-3)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-input)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--input-border-focus)';
            }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--color-border-input)';
              }}
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--gap-sm)' }}>
          <Button type="button" onClick={() => setIsOpen(false)} variant="secondary" size="medium">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="medium" isLoading={loading} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default LeaveForm
