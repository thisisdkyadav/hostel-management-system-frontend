import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash, FaCalendarAlt, FaUsers } from "react-icons/fa"
import EditInsuranceProviderModal from "./EditInsuranceProviderModal"
import BulkStudentInsuranceModal from "./BulkStudentInsuranceModal"
import { insuranceProviderApi } from "../../../service"
import Card from "../../common/Card"
import Button from "../../common/Button"

const InsuranceProviderCard = ({ provider, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this insurance provider?")) {
      try {
        setIsDeleting(true)
        await insuranceProviderApi.deleteInsuranceProvider(provider.id)
        alert("Insurance provider deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting insurance provider:", error)
        alert("Failed to delete insurance provider. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleBulkUpdate = async (data) => {
    try {
      await insuranceProviderApi.updateBulkStudentInsurance(data)
      alert("Student insurance details updated successfully!")
      return true
    } catch (error) {
      console.error("Error updating student insurance details:", error)
      alert("Failed to update student insurance details. Please try again.")
      return false
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <>
      <Card>
        <Card.Header style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)', marginRight: 'var(--spacing-3)' }}>
                <FaBuilding style={{ color: 'var(--color-primary)', fontSize: 'var(--icon-lg)' }} />
              </div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>{provider.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button onClick={() => setShowEditModal(true)} variant="ghost" size="small" icon={<FaEdit />} title="Edit provider" />
              <Button onClick={handleDelete} variant="ghost" size="small" icon={<FaTrash />} isLoading={isDeleting} disabled={isDeleting} title="Delete provider" />
            </div>
          </div>
        </Card.Header>

        <Card.Body style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaEnvelope style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>{provider.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaPhone style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-muted)' }}>{provider.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaMapMarkerAlt style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-muted)' }}>{provider.address}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaCalendarAlt style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <div style={{ color: 'var(--color-text-muted)' }}>
              <span>
                Valid: {formatDate(provider.startDate)} - {formatDate(provider.endDate)}
              </span>
            </div>
          </div>
        </Card.Body>

        <Card.Footer style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <Button onClick={() => setShowBulkUpdateModal(true)} variant="secondary" size="medium" icon={<FaUsers />} fullWidth>
            Update Student Insurance Details
          </Button>
        </Card.Footer>
      </Card>

      {showEditModal && <EditInsuranceProviderModal show={showEditModal} provider={provider} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
      {showBulkUpdateModal && <BulkStudentInsuranceModal isOpen={showBulkUpdateModal} onClose={() => setShowBulkUpdateModal(false)} onUpdate={handleBulkUpdate} providerId={provider.id} providerName={provider.name} />}
    </>
  )
}

export default InsuranceProviderCard
