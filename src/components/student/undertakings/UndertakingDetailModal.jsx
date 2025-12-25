import { useState } from "react"
import { FaFileSignature, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"

const UndertakingDetailModal = ({ show, undertaking, onClose, onAccept }) => {
  const [isAccepting, setIsAccepting] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }

  // Check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  const handleAccept = async () => {
    if (!hasConfirmed) {
      setHasConfirmed(true)
      return
    }

    try {
      setIsAccepting(true)
      await onAccept(undertaking.id)
    } finally {
      setIsAccepting(false)
      setHasConfirmed(false)
    }
  }

  const handleClose = () => {
    setHasConfirmed(false)
    onClose()
  }

  if (!show || !undertaking) return null

  const deadlinePassed = isDeadlinePassed(undertaking.deadline)

  return (
    <Modal title={undertaking.title} onClose={handleClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Undertaking metadata */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: 'var(--spacing-2)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-info-bg)' }}>
              <FaFileSignature style={{ color: 'var(--color-info)' }} />
            </div>
            <span style={{ marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              {undertaking.status === "not_viewed" ? "New" : "Pending Acceptance"}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaCalendarAlt style={{ color: 'var(--color-text-placeholder)', marginRight: 'var(--spacing-2)' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              Deadline: {formatDate(undertaking.deadline)}
              {deadlinePassed && <span style={{ marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-danger-text)' }}>(Overdue)</span>}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Description</h3>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)' }}>{undertaking.description}</p>
        </div>

        {/* Content */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Undertaking Content</h3>
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-input)', border: `var(--border-1) solid var(--color-border-primary)`, maxHeight: '15rem', overflowY: 'auto' }}>
            <div style={{ color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', whiteSpace: 'pre-wrap' }}>{undertaking.content}</div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <input type="checkbox" id="confirm-read" checked={hasConfirmed} onChange={() => setHasConfirmed(!hasConfirmed)}
            style={{
              marginTop: 'var(--spacing-1)',
              height: 'var(--icon-md)',
              width: 'var(--icon-md)',
              borderRadius: 'var(--radius-sm)',
              border: `var(--border-1) solid var(--color-border-input)`,
              accentColor: 'var(--color-info)',
              cursor: 'pointer'
            }}
          />
          <label htmlFor="confirm-read" style={{ marginLeft: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-body)', cursor: 'pointer' }} >
            I confirm that I have read and understood the above undertaking and agree to abide by it.
          </label>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button type="button" onClick={handleClose} variant="secondary" size="medium" icon={<FaTimes />}>
            Close
          </Button>
          <Button type="button" onClick={handleAccept} disabled={isAccepting || !hasConfirmed} variant="success" size="medium" icon={isAccepting ? null : <FaCheck />} isLoading={isAccepting}>
            I Accept
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default UndertakingDetailModal
