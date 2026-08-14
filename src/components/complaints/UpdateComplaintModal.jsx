import React, { useState } from "react"
import { Pencil } from "lucide-react"
import { Button, Modal, Select, Text } from "hzero"
import { complaintApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import {
  COMPLAINT_CATEGORIES,
  WHO_CAN_CHANGE_COMPLAINT_CATEGORY,
} from "../../constants/complaintConstants"

const UpdateComplaintModal = ({ complaint, onClose, onUpdate }) => {
  const { user } = useAuth()
  const canChangeCategory = WHO_CAN_CHANGE_COMPLAINT_CATEGORY.includes(user?.role)

  const [status, setStatus] = useState(complaint?.status || "")
  const [category, setCategory] = useState(complaint?.category || "")
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolutionNotes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const statusOptions = ["Pending", "In Progress", "Resolved", "Forwarded to IDO", "Rejected"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Update status if changed
      if (status !== complaint.status) {
        await complaintApi.updateStatus(complaint.id, status)
      }

      // Update category if allowed and changed
      if (canChangeCategory && category && category !== complaint.category) {
        await complaintApi.updateCategory(complaint.id, category)
      }

      // Update resolution notes if changed
      if (resolutionNotes !== complaint.resolutionNotes) {
        await complaintApi.updateComplaintResolutionNotes(complaint.id, resolutionNotes)
      }

      onUpdate({
        ...complaint,
        status,
        ...(canChangeCategory ? { category } : {}),
        resolutionNotes,
        lastUpdated: new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || "Failed to update complaint. Please try again.")
      console.error("Error updating complaint:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const MODAL_WIDTH = 600;
  const TEXTAREA_ROWS = 6;

  return (
    <Modal title="Update Complaint" onClose={onClose} width={MODAL_WIDTH}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div className="border-l-4" style={{ backgroundColor: 'var(--color-danger-bg)', borderColor: 'var(--color-danger)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }} >
            <Text color="danger-text">{error}</Text>
          </div>
        )}

        <div>
          <Text as="label" size="sm" weight="medium" color="secondary" style={{ marginBottom: 'var(--spacing-1)' }} htmlFor="status" className="block">
            Status
          </Text>
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions.map((option) => ({ value: option, label: option }))} required />
        </div>

        {canChangeCategory && (
          <div>
            <Text as="label" size="sm" weight="medium" color="secondary" style={{ marginBottom: 'var(--spacing-1)' }} htmlFor="category" className="block">
              Category
            </Text>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={COMPLAINT_CATEGORIES.map((option) => ({ value: option, label: option }))}
              required
            />
          </div>
        )}

        <div>
          <Text as="label" size="sm" weight="medium" color="secondary" style={{ marginBottom: 'var(--spacing-1)' }} htmlFor="resolutionNotes" className="block">
            Resolution Notes
          </Text>
          <textarea id="resolutionNotes" value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} 
            rows={TEXTAREA_ROWS} 
            className="w-full focus:outline-none" 
            style={{ 
              paddingLeft: 'var(--spacing-4)', 
              paddingRight: 'var(--spacing-4)', 
              paddingTop: 'var(--spacing-2)', 
              paddingBottom: 'var(--spacing-2)', 
              border: `var(--border-1) solid var(--color-border-input)`, 
              borderRadius: 'var(--radius-lg)', 
              backgroundColor: 'var(--color-bg-primary)' 
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = 'var(--input-focus-ring)';
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--color-border-input)';
            }}
            placeholder="Enter resolution notes or comments..."
          />
        </div>

        <div className="flex justify-end" style={{ gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)' }}>
          <Button type="button" onClick={onClose} variant="outline" >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}
          >
            {!isSubmitting && <Pencil size="1em" />} {isSubmitting ? 'Updating...' : 'Update Complaint'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UpdateComplaintModal
