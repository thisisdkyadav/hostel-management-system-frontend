import React, { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaHospital, FaMedkit, FaCalendarAlt, FaDollarSign, FaFileAlt, FaSave, FaCalendarCheck } from "react-icons/fa"
import { HStack, Select, Text, useConfirm } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"

const InsuranceClaimModal = ({ claim, onClose, onSave, onDelete, insuranceProviders, isNew = false }) => {
  const confirm = useConfirm()
  const canEditHealth = true
  const [isEditing, setIsEditing] = useState(isNew)
  const [formData, setFormData] = useState({
    insuranceProvider: "",
    amount: "",
    hospitalName: "",
    description: "",
  })
  const [selectedProvider, setSelectedProvider] = useState(null)

  useEffect(() => {
    if (claim) {
      setFormData({
        insuranceProvider: claim.insuranceProvider?._id || claim.insuranceProvider || "",
        amount: claim.amount || "",
        hospitalName: claim.hospitalName || "",
        description: claim.description || "",
      })

      // Find the selected provider
      if (claim.insuranceProvider) {
        const providerId = claim.insuranceProvider?._id || claim.insuranceProvider
        const provider = insuranceProviders.find((p) => p._id === providerId)
        setSelectedProvider(provider || null)
      }
    }
  }, [claim, insuranceProviders])

  useEffect(() => {
    // Update selected provider when form data changes
    if (formData.insuranceProvider) {
      const provider = insuranceProviders.find((p) => p._id === formData.insuranceProvider)
      setSelectedProvider(provider || null)
    } else {
      setSelectedProvider(null)
    }
  }, [formData.insuranceProvider, insuranceProviders])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const handleDelete = async () => {
    if (await confirm({ message: "Are you sure you want to delete this insurance claim?", isDestructive: true })) {
      onDelete(claim._id)
      onClose()
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(claim?._id, formData)
    onClose()
  }

  const getProviderName = (providerId) => {
    const provider = insuranceProviders.find((p) => p._id === providerId)
    return provider ? provider.name : "Unknown Provider"
  }

  const renderViewMode = () => (
    <>
      <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--spacing-6)', border: 'var(--border-1) solid var(--color-primary-light)' }}>
        <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
            <FaMedkit style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-2)' }} />
            Claim Information
          </h3>
          <Text as="div" size="sm" color="muted">
            <Text as="span" weight="medium">Submitted:</Text> {formatDate(claim.createdAt)}
          </Text>
        </HStack>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
          <HStack gap="none" align="start">
            <FaHospital style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <div>
              <Text size="sm" color="muted">Hospital</Text>
              <Text weight="medium" color="body">{claim.hospitalName}</Text>
            </div>
          </HStack>

          <HStack gap="none" align="start">
            <FaDollarSign style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <div>
              <Text size="sm" color="muted">Claim Amount</Text>
              <Text weight="medium" color="body">{formatCurrency(claim.amount)}</Text>
            </div>
          </HStack>

          <HStack gap="none" align="start">
            <FaMedkit style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <div>
              <Text size="sm" color="muted">Insurance Provider</Text>
              <Text weight="medium" color="body">{claim.insuranceProvider.name || getProviderName(claim.insuranceProvider)}</Text>
            </div>
          </HStack>

          <HStack gap="none" align="start">
            <FaCalendarAlt style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <div>
              <Text size="sm" color="muted">Last Updated</Text>
              <Text weight="medium" color="body">{formatDate(claim.updatedAt)}</Text>
            </div>
          </HStack>

          {selectedProvider && (
            <>
              <HStack gap="none" align="start">
                <FaCalendarCheck style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
                <div>
                  <Text size="sm" color="muted">Policy Start Date</Text>
                  <Text weight="medium" color="body">{formatDate(selectedProvider.startDate)}</Text>
                </div>
              </HStack>

              <HStack gap="none" align="start">
                <FaCalendarCheck style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
                <div>
                  <Text size="sm" color="muted">Policy End Date</Text>
                  <Text weight="medium" color="body">{formatDate(selectedProvider.endDate)}</Text>
                </div>
              </HStack>
            </>
          )}
        </div>

        <HStack gap="none" align="start" style={{ marginTop: 'var(--spacing-4)' }}>
          <FaFileAlt style={{ color: 'var(--color-primary)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Text size="sm" color="muted">Description</Text>
            <p style={{ marginTop: 'var(--spacing-1)', color: 'var(--color-text-body)', backgroundColor: 'var(--color-bg-primary)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: 'var(--border-1) solid var(--color-border-primary)', minHeight: '80px' }}>{claim.description || "No description provided."}</p>
          </div>
        </HStack>
      </div>

      <HStack gap={3} justify="end" style={{ marginTop: 'var(--spacing-6)' }}>
        {canEditHealth && (
          <Button onClick={() => setIsEditing(true)} variant="primary" size="md">
            <FaEdit /> Edit Claim
          </Button>
        )}
        {canEditHealth && (
          <Button onClick={handleDelete} variant="danger" size="md">
            <FaTrash /> Delete Claim
          </Button>
        )}
        <Button onClick={onClose} variant="secondary" size="md">
          Close
        </Button>
      </HStack>
    </>
  )

  const renderEditMode = () => (
    <form onSubmit={handleSubmit}>
      <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Insurance Provider</label>
            <Select name="insuranceProvider" value={formData.insuranceProvider} onChange={handleInputChange} required
              options={[
                { value: "", label: "Select Insurance Provider" },
                ...insuranceProviders.map((provider) => ({ value: provider._id, label: provider.name }))
              ]}
            />

            {selectedProvider && (
              <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Policy period: {formatDate(selectedProvider.startDate)} - {formatDate(selectedProvider.endDate)}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Amount</label>
            <Input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="Enter claim amount" required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Hospital Name</label>
            <Input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} placeholder="Enter hospital name" required />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-body)' }} placeholder="Enter claim description" required></textarea>
          </div>
        </div>
      </div>

      <HStack gap={3} justify="end">
        <Button type="submit" variant="primary" size="md">
          <FaSave /> {isNew ? "Add Claim" : "Save Changes"}
        </Button>
        <Button type="button" onClick={() => {
          if (isNew) {
            onClose()
          } else {
            setIsEditing(false)
          }
        }} variant="secondary" size="md">
          Cancel
        </Button>
      </HStack>
    </form>
  )

  return (
    <Modal title={isNew ? "Add Insurance Claim" : isEditing ? "Edit Insurance Claim" : "Insurance Claim Details"} onClose={onClose} width={600}>
      <div style={{ backgroundColor: 'var(--color-bg-primary)', padding: 'var(--spacing-4)' }}>{isNew || isEditing ? renderEditMode() : renderViewMode()}</div>
    </Modal>
  )
}

export default InsuranceClaimModal
