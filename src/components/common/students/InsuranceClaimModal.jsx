import React, { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaHospital, FaMedkit, FaCalendarAlt, FaDollarSign, FaFileAlt, FaSave, FaCalendarCheck } from "react-icons/fa"
import { Field, Grid, HStack, Label, Select, Surface, Text, useConfirm } from "@/components/ui"
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
      <Surface bg="brand" padding={5} radius="xl" border="var(--border-1) solid var(--color-primary-light)" style={{ marginBottom: 'var(--spacing-6)' }}>
        <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
            <FaMedkit style={{ marginRight: 'var(--spacing-2)' }} color="var(--color-primary)" />
            Claim Information
          </h3>
          <Text as="div" size="sm" color="muted">
            <Text as="span" weight="medium">Submitted:</Text> {formatDate(claim.createdAt)}
          </Text>
        </HStack>

        <Grid cols={2} gap={4}>
          <HStack gap="none" align="start">
            <FaHospital style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-primary)" />
            <div>
              <Text size="sm" color="muted">Hospital</Text>
              <Text weight="medium" color="body">{claim.hospitalName}</Text>
            </div>
          </HStack>

          <HStack gap="none" align="start">
            <FaDollarSign style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-primary)" />
            <div>
              <Text size="sm" color="muted">Claim Amount</Text>
              <Text weight="medium" color="body">{formatCurrency(claim.amount)}</Text>
            </div>
          </HStack>

          <HStack gap="none" align="start">
            <FaMedkit style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-primary)" />
            <div>
              <Text size="sm" color="muted">Insurance Provider</Text>
              <Text weight="medium" color="body">{claim.insuranceProvider.name || getProviderName(claim.insuranceProvider)}</Text>
            </div>
          </HStack>

          <HStack gap="none" align="start">
            <FaCalendarAlt style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-primary)" />
            <div>
              <Text size="sm" color="muted">Last Updated</Text>
              <Text weight="medium" color="body">{formatDate(claim.updatedAt)}</Text>
            </div>
          </HStack>

          {selectedProvider && (
            <>
              <HStack gap="none" align="start">
                <FaCalendarCheck style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-primary)" />
                <div>
                  <Text size="sm" color="muted">Policy Start Date</Text>
                  <Text weight="medium" color="body">{formatDate(selectedProvider.startDate)}</Text>
                </div>
              </HStack>

              <HStack gap="none" align="start">
                <FaCalendarCheck style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-primary)" />
                <div>
                  <Text size="sm" color="muted">Policy End Date</Text>
                  <Text weight="medium" color="body">{formatDate(selectedProvider.endDate)}</Text>
                </div>
              </HStack>
            </>
          )}
        </Grid>

        <HStack gap="none" align="start" style={{ marginTop: 'var(--spacing-4)' }}>
          <FaFileAlt style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-primary)" />
          <div style={{ flex: 1 }}>
            <Text size="sm" color="muted">Description</Text>
            <Text color="body" style={{ marginTop: 'var(--spacing-1)', backgroundColor: 'var(--color-bg-primary)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: 'var(--border-1) solid var(--color-border-primary)', minHeight: '80px' }}>{claim.description || "No description provided."}</Text>
          </div>
        </HStack>
      </Surface>

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
      <Surface bg="tertiary" padding={4} radius="lg" style={{ marginBottom: 'var(--spacing-6)' }}>
        <Grid cols={2} gap={4}>
          <Field label="Insurance Provider" color="body" spacing={1}>
            <Select name="insuranceProvider" value={formData.insuranceProvider} onChange={handleInputChange} required
              options={[
                { value: "", label: "Select Insurance Provider" },
                ...insuranceProviders.map((provider) => ({ value: provider._id, label: provider.name }))
              ]}
            />

            {selectedProvider && (
              <Text as="div" size="xs" color="muted" style={{ marginTop: 'var(--spacing-2)' }}>
                Policy period: {formatDate(selectedProvider.startDate)} - {formatDate(selectedProvider.endDate)}
              </Text>
            )}
          </Field>

          <Field label="Amount" color="body" spacing={1}>
            <Input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="Enter claim amount" required />
          </Field>

          <Field label="Hospital Name" color="body" spacing={1}>
            <Input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} placeholder="Enter hospital name" required />
          </Field>

          <div style={{ gridColumn: 'span 2' }}>
            <Label color="body" spacing={1}>Description</Label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-body)' }} placeholder="Enter claim description" required></textarea>
          </div>
        </Grid>
      </Surface>

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
      <Surface bg="primary" padding={4}>{isNew || isEditing ? renderEditMode() : renderViewMode()}</Surface>
    </Modal>
  )
}

export default InsuranceClaimModal
