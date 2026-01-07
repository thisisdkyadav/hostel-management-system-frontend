import { useState } from "react"
import { FaBuilding, FaEnvelope, FaEdit, FaTrash } from "react-icons/fa"
import EditHostelGateModal from "./EditHostelGateModal"
import { hostelGateApi } from "../../../service"
import { Card, CardHeader, CardBody, CardFooter, Button } from "@/components/ui"

const HostelGateCard = ({ gate, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this hostel gate login?")) {
      try {
        setIsDeleting(true)
        await hostelGateApi.deleteHostelGate(gate.hostelId._id)
        alert("Hostel gate login deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting hostel gate login:", error)
        alert("Failed to delete hostel gate login. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      <Card>
        <CardHeader style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)', marginRight: 'var(--spacing-3)' }}>
                <FaBuilding style={{ color: 'var(--color-primary)', fontSize: 'var(--icon-lg)' }} />
              </div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>{gate.userId?.name || "Unknown Hostel"}</h3>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button onClick={() => setShowEditModal(true)} variant="ghost" size="small" icon={<FaEdit />} title="Edit hostel gate login" />
              <Button onClick={handleDelete} variant="ghost" size="small" icon={<FaTrash />} isLoading={isDeleting} disabled={isDeleting} title="Delete hostel gate login" />
            </div>
          </div>
        </CardHeader>

        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaEnvelope style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>{gate.userId?.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>Created</span>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(gate.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>Updated</span>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(gate.updatedAt)}</span>
          </div>
        </CardBody>
      </Card>

      {showEditModal && <EditHostelGateModal show={showEditModal} gate={gate} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
    </>
  )
}

export default HostelGateCard
