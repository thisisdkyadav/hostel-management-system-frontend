import { useState } from "react"
import { FaFileSignature, FaEdit, FaTrash, FaCalendarAlt, FaUsers, FaInfoCircle, FaClipboardCheck } from "react-icons/fa"
import EditUndertakingModal from "./EditUndertakingModal"
import ManageStudentsModal from "./ManageStudentsModal"
import ViewAcceptanceStatusModal from "./ViewAcceptanceStatusModal"
import { adminApi } from "../../../services/adminApi"
import Card from "../../common/Card"
import Button from "../../common/Button"

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
                <Button onClick={() => setShowEditModal(true)} variant="ghost" size="small" icon={<FaEdit />} title="Edit undertaking" />
                <Button onClick={handleDelete} variant="ghost" size="small" icon={<FaTrash />} isLoading={isDeleting} disabled={isDeleting} title="Delete undertaking" />
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
            <Button onClick={() => setShowManageStudentsModal(true)} variant="secondary" size="small" icon={<FaUsers />}>
              Manage Students
            </Button>
          )}
          <Button onClick={() => setShowStatusModal(true)} variant="success" size="small" icon={<FaClipboardCheck />}>
            View Status
          </Button>
        </Card.Footer>
      </Card>

      {!isReadOnly && showEditModal && <EditUndertakingModal show={showEditModal} undertaking={undertaking} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
      {!isReadOnly && showManageStudentsModal && <ManageStudentsModal show={showManageStudentsModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowManageStudentsModal(false)} onUpdate={onUpdate} />}
      {showStatusModal && <ViewAcceptanceStatusModal show={showStatusModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowStatusModal(false)} />}
    </>
  )
}

export default UndertakingCard
