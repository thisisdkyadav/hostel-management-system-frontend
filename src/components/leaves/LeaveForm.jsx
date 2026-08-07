import { useState } from "react"
import { Button, Input } from "hzero"
import { Field, Grid, Label, Modal, Surface } from "@/components/ui"
import { leaveApi } from "../../service"

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
          <Surface bg="var(--color-danger-bg-light)" padding={3} radius="md" color="danger-text" size="sm">{error}</Surface>
        )}

        <Field label="Reason" color="secondary" spacing={2}>
          <textarea name="reason" placeholder="Reason for leave" value={formData.reason} onChange={handleChange} required style={{ width: '100%', padding: 'var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-input)', outline: 'none', transition: 'var(--transition-all)', resize: 'none', height: '6rem' }} />
        </Field>

        <Grid min={200} gap="var(--gap-md)">
          <Field label="Start Date" color="secondary" spacing={2}>
            <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </Field>
          <Field label="End Date" color="secondary" spacing={2}>
            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </Field>
        </Grid>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--gap-sm)' }}>
          <Button type="button" onClick={() => setIsOpen(false)} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default LeaveForm
