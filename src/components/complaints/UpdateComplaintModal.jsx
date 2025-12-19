import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import Modal from "../common/Modal"
import Button from "../common/Button"
import { complaintApi } from "../../services/complaintApi"

const UpdateComplaintModal = ({ complaint, onClose, onUpdate }) => {
  const [status, setStatus] = useState(complaint?.status || "")
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

      // Update resolution notes if changed
      if (resolutionNotes !== complaint.resolutionNotes) {
        await complaintApi.updateComplaintResolutionNotes(complaint.id, resolutionNotes)
      }

      onUpdate({
        ...complaint,
        status,
        resolutionNotes,
        lastUpdated: new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      setError("Failed to update complaint. Please try again.")
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
            <p style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="status" className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }} >
            Status
          </label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} 
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
            required
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="resolutionNotes" className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }} >
            Resolution Notes
          </label>
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
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting} icon={!isSubmitting && <FaEdit />}
          >
            {isSubmitting ? 'Updating...' : 'Update Complaint'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UpdateComplaintModal
