import { useState } from "react"
import { FaFileSignature, FaEdit, FaTrash, FaCalendarAlt, FaUsers, FaInfoCircle, FaClipboardCheck } from "react-icons/fa"
import EditUndertakingModal from "./EditUndertakingModal"
import ManageStudentsModal from "./ManageStudentsModal"
import ViewAcceptanceStatusModal from "./ViewAcceptanceStatusModal"
import { adminApi } from "../../../services/adminApi"
import Card from "../../common/Card"

const UndertakingCard = ({ undertaking, onUpdate, onDelete, isReadOnly = false }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this undertaking?")) {
      try {
        setIsDeleting(true)
        await adminApi.deleteUndertaking(undertaking.id)
        alert("Undertaking deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting undertaking:", error)
        alert("Failed to delete undertaking. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Calculate acceptance percentage
  const acceptancePercentage = undertaking.acceptedCount && undertaking.totalStudents ? Math.round((undertaking.acceptedCount / undertaking.totalStudents) * 100) : 0

  return (
    <>
      <Card>
        <Card.Header style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)', marginRight: 'var(--spacing-3)' }}>
                <FaFileSignature style={{ color: 'var(--color-primary)', fontSize: 'var(--icon-lg)' }} />
              </div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>{undertaking.title}</h3>
            </div>
            {!isReadOnly && (
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <button onClick={() => setShowEditModal(true)} style={{ padding: 'var(--spacing-2)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', border: 'none', cursor: 'pointer', background: 'none' }} onMouseEnter={(e) => { e.target.style.color = 'var(--color-primary)'; e.target.style.backgroundColor = 'var(--color-primary-bg)'; }} onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-muted)'; e.target.style.backgroundColor = 'transparent'; }} title="Edit undertaking">
                  <FaEdit />
                </button>
                <button onClick={handleDelete} disabled={isDeleting} style={{ padding: 'var(--spacing-2)', color: isDeleting ? 'var(--color-text-muted)' : 'var(--color-text-muted)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', border: 'none', cursor: isDeleting ? 'not-allowed' : 'pointer', background: 'none' }} onMouseEnter={(e) => { if (!isDeleting) { e.target.style.color = 'var(--color-danger)'; e.target.style.backgroundColor = 'var(--color-danger-bg)'; } }} onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-muted)'; e.target.style.backgroundColor = 'transparent'; }} title="Delete undertaking">
                  {isDeleting ? <span style={{ display: 'inline-block', width: 'var(--icon-md)', height: 'var(--icon-md)', border: 'var(--border-2) solid var(--color-border-input)', borderTopColor: 'var(--color-text-muted)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></span> : <FaTrash />}
                </button>
              </div>
            )}
          </div>
        </Card.Header>

        <Card.Body style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
          <div style={{ color: 'var(--color-text-muted)' }}>
            <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{undertaking.description}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaCalendarAlt style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <div style={{ color: 'var(--color-text-muted)' }}>
              <span>Deadline: {formatDate(undertaking.deadline)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaUsers style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <div style={{ color: 'var(--color-text-muted)' }}>
              <span>Students: {undertaking.totalStudents || 0}</span>
            </div>
          </div>

          {/* Acceptance progress bar */}
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
              <span>Acceptance Status</span>
              <span>{acceptancePercentage}%</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', height: '0.625rem' }}>
              <div style={{ backgroundColor: 'var(--color-success)', height: '0.625rem', borderRadius: 'var(--radius-full)', width: `${acceptancePercentage}%` }}></div>
            </div>
          </div>
        </Card.Body>

        <Card.Footer style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'grid', gridTemplateColumns: isReadOnly ? '1fr' : 'repeat(2, 1fr)', gap: 'var(--spacing-3)' }}>
          {!isReadOnly && (
            <button onClick={() => setShowManageStudentsModal(true)} style={{ padding: 'var(--spacing-2) var(--spacing-3)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg)'}>
              <FaUsers style={{ marginRight: 'var(--spacing-1)' }} /> Manage Students
            </button>
          )}
          <button onClick={() => setShowStatusModal(true)} style={{ padding: 'var(--spacing-2) var(--spacing-3)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-dark)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', border: 'none', cursor: 'pointer', gridColumn: isReadOnly ? 'span 1' : 'auto' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-success-bg-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-success-bg)'}>
            <FaClipboardCheck style={{ marginRight: 'var(--spacing-1)' }} /> View Status
          </button>
        </Card.Footer>
      </Card>

      {!isReadOnly && showEditModal && <EditUndertakingModal show={showEditModal} undertaking={undertaking} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
      {!isReadOnly && showManageStudentsModal && <ManageStudentsModal show={showManageStudentsModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowManageStudentsModal(false)} onUpdate={onUpdate} />}
      {showStatusModal && <ViewAcceptanceStatusModal show={showStatusModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowStatusModal(false)} />}
    </>
  )
}

export default UndertakingCard
