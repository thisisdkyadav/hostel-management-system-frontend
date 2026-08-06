import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash, FaCalendarAlt, FaUsers } from "react-icons/fa"
import EditInsuranceProviderModal from "./EditInsuranceProviderModal"
import BulkStudentInsuranceModal from "./BulkStudentInsuranceModal"
import { insuranceProviderApi } from "../../../service"
import { Card, CardBody, CardFooter, CardHeader, HStack, Surface, Text, useConfirm } from "@/components/ui"
import { Button } from "czero/react"

const InsuranceProviderCard = ({ provider, onUpdate, onDelete }) => {
  const confirm = useConfirm()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (await confirm({ message: "Are you sure you want to delete this insurance provider?", isDestructive: true })) {
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
        <CardHeader style={{ marginBottom: 0 }}>
          <HStack gap="none" align="start" justify="between">
            <HStack gap="none" align="center">
              <Surface bg="brand" padding={2} radius="lg" style={{ marginRight: 'var(--spacing-3)' }}>
                <FaBuilding style={{ color: 'var(--color-primary)', fontSize: 'var(--icon-lg)' }} />
              </Surface>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>{provider.name}</h3>
            </HStack>
            <HStack gap={2}>
              <Button onClick={() => setShowEditModal(true)} variant="ghost" size="sm" title="Edit provider"><FaEdit /></Button>
              <Button onClick={handleDelete} variant="ghost" size="sm" loading={isDeleting} disabled={isDeleting} title="Delete provider"><FaTrash /></Button>
            </HStack>
          </HStack>
        </CardHeader>

        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
          <HStack gap="none" align="start">
            <FaEnvelope style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <Text as="span" color="muted" style={{ wordBreak: 'break-all' }}>{provider.email}</Text>
          </HStack>
          <HStack gap="none" align="start">
            <FaPhone style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <Text as="span" color="muted">{provider.phone}</Text>
          </HStack>
          <HStack gap="none" align="start">
            <FaMapMarkerAlt style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <Text as="span" color="muted">{provider.address}</Text>
          </HStack>
          <HStack gap="none" align="start">
            <FaCalendarAlt style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <Text as="div" color="muted">
              <span>
                Valid: {formatDate(provider.startDate)} - {formatDate(provider.endDate)}
              </span>
            </Text>
          </HStack>
        </CardBody>

        <CardFooter style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
          <Button onClick={() => setShowBulkUpdateModal(true)} variant="secondary" size="md" fullWidth>
            <FaUsers />
            Update Student Insurance Details
          </Button>
        </CardFooter>
      </Card>

      {showEditModal && <EditInsuranceProviderModal show={showEditModal} provider={provider} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
      {showBulkUpdateModal && <BulkStudentInsuranceModal isOpen={showBulkUpdateModal} onClose={() => setShowBulkUpdateModal(false)} onUpdate={handleBulkUpdate} providerId={provider.id} providerName={provider.name} />}
    </>
  )
}

export default InsuranceProviderCard
