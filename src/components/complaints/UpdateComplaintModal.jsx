import React, { useState } from "react"
import { Pencil } from "lucide-react"
import { Button, Modal, Select, Text } from "hzero"
import { complaintApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { patchItemById, queryKeys, useOptimisticMutation } from "../../lib/query"
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
  const [error, setError] = useState("")

  const statusOptions = ["Pending", "In Progress", "Resolved", "Forwarded to IDO", "Rejected"]

  // Optimistically paint the new status/notes into every cached complaints
  // list behind the modal; the server response then wins via invalidation.
  const updateComplaint = useOptimisticMutation({
    queryKey: queryKeys.complaints.all,
    mutationFn: async ({ changes }) => {
      if (changes.status !== undefined) {
        await complaintApi.updateStatus(complaint.id, changes.status)
      }

      if (canChangeCategory && changes.category !== undefined) {
        await complaintApi.updateCategory(complaint.id, changes.category)
      }

      if (changes.resolutionNotes !== undefined) {
        await complaintApi.updateComplaintResolutionNotes(complaint.id, changes.resolutionNotes)
      }
    },
    updateFn: (previous, { complaintId, changes }) =>
      patchItemById(
        (item) => item?._id ?? item?.id,
        () => ({ ...changes, lastUpdated: new Date().toISOString() })
      )(previous, { id: complaintId }),
    onError: (err) => {
      setError(err?.message || "Failed to update complaint. Please try again.")
      console.error("Error updating complaint:", err)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    const changes = {}
    if (status !== complaint.status) changes.status = status
    if (canChangeCategory && category && category !== complaint.category) {
      changes.category = category
    }
    if (resolutionNotes !== complaint.resolutionNotes) {
      changes.resolutionNotes = resolutionNotes
    }

    updateComplaint.mutate(
      { complaintId: complaint._id ?? complaint.id, changes },
      {
        onSuccess: () => {
          onUpdate({
            ...complaint,
            ...changes,
            lastUpdated: new Date().toISOString(),
          })
          onClose()
        },
      }
    )
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
          <Button type="submit" variant="primary" loading={updateComplaint.isPending} disabled={updateComplaint.isPending}
          >
            {!updateComplaint.isPending && <Pencil size="1em" />} {updateComplaint.isPending ? 'Updating...' : 'Update Complaint'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UpdateComplaintModal
