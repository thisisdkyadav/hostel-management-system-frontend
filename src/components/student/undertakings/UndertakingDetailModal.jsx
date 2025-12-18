import { useState } from "react"
import { FaFileSignature, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa"
import Modal from "../../common/Modal"

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
      <div className="space-y-6">
        {/* Undertaking metadata */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-info-bg)' }}>
              <FaFileSignature style={{ color: 'var(--color-info)' }} />
            </div>
            <span className="ml-2 text-sm text-gray-600">{undertaking.status === "not_viewed" ? "New" : "Pending Acceptance"}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              Deadline: {formatDate(undertaking.deadline)}
              {deadlinePassed && <span className="ml-2 text-xs" style={{ color: 'var(--color-danger-text)' }}>(Overdue)</span>}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">{undertaking.description}</p>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Undertaking Content</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
            <div className="text-gray-700 text-sm whitespace-pre-wrap">{undertaking.content}</div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <div className="flex items-start">
          <input type="checkbox" id="confirm-read" checked={hasConfirmed} onChange={() => setHasConfirmed(!hasConfirmed)} className="mt-1 h-4 w-4 rounded border-gray-300" style={{ color: 'var(--color-info)' }} />
          <label htmlFor="confirm-read" className="ml-2 text-sm text-gray-700">
            I confirm that I have read and understood the above undertaking and agree to abide by it.
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center">
            <FaTimes className="mr-2" /> Close
          </button>
          <button type="button" onClick={handleAccept} disabled={isAccepting || !hasConfirmed} className="px-4 py-2 rounded-lg flex items-center" style={{ backgroundColor: hasConfirmed ? 'var(--color-success)' : 'var(--color-bg-muted)', color: hasConfirmed ? 'var(--color-white)' : 'var(--color-text-muted)', cursor: hasConfirmed ? 'pointer' : 'not-allowed' }} onMouseEnter={(e) => { if (hasConfirmed) e.currentTarget.style.backgroundColor = 'var(--color-success-hover)' }} onMouseLeave={(e) => { if (hasConfirmed) e.currentTarget.style.backgroundColor = 'var(--color-success)' }}>
            {isAccepting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : <FaCheck className="mr-2" />}I Accept
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default UndertakingDetailModal
