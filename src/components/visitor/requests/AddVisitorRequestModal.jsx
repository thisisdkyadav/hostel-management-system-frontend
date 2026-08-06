import React, { useState } from "react"
import { FaExclamationTriangle, FaPlus, FaUserAlt, FaUpload, FaFileAlt, FaCheckCircle } from "react-icons/fa"
import { Alert, Grid, Heading, HStack, IconCircle, Label, Surface, Text, Textarea, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"
import { uploadApi, resolveUploadedFileRef } from "../../../service"

const AddVisitorRequestModal = ({ isOpen, onClose, onSubmit, visitorProfiles, handleAddProfile }) => {
  const [formData, setFormData] = useState({
    selectedVisitorIds: [],
    reason: "",
    fromDate: "",
    toDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [h2FormFile, setH2FormFile] = useState(null)
  const [h2FormUploading, setH2FormUploading] = useState(false)
  const [h2FormUploaded, setH2FormUploaded] = useState(false)
  const [h2FormUrl, setH2FormUrl] = useState("")

  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 1)
  const minDateString = minDate.toISOString().split("T")[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVisitorSelection = (visitorId) => {
    setFormData((prev) => {
      const currentSelected = [...prev.selectedVisitorIds]

      if (currentSelected.includes(visitorId)) {
        return {
          ...prev,
          selectedVisitorIds: currentSelected.filter((id) => id !== visitorId),
        }
      } else {
        return {
          ...prev,
          selectedVisitorIds: [...currentSelected, visitorId],
        }
      }
    })
  }

  const handleH2FormFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type (PDF only)
      const validTypes = ["application/pdf"]
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF file for the H2 form")
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError(`H2 form file size exceeds 5MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`)
        return
      }

      setH2FormFile(file)
      setError(null)
    }
  }

  const uploadH2Form = async () => {
    if (!h2FormFile) return

    try {
      setH2FormUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append("h2Form", h2FormFile)

      const response = await uploadApi.uploadH2Form(formData)
      setH2FormUrl(resolveUploadedFileRef(response))
      setH2FormUploaded(true)
    } catch (err) {
      setError(err.message || "Failed to upload H2 form. Please try again.")
    } finally {
      setH2FormUploading(false)
    }
  }

  const removeH2Form = () => {
    setH2FormFile(null)
    setH2FormUploaded(false)
    setH2FormUrl("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validations
    if (formData.selectedVisitorIds.length === 0) {
      setError("Please select at least one visitor")
      return
    }

    if (!formData.fromDate || !formData.toDate) {
      setError("Please select both from and to dates")
      return
    }

    if (!h2FormUploaded) {
      setError("Please upload the H2 form before submitting the request")
      return
    }

    const fromDate = new Date(formData.fromDate)
    const toDate = new Date(formData.toDate)

    if (fromDate < minDate) {
      setError("Please select a from date that is at least 2 days from today")
      return
    }

    if (toDate < fromDate) {
      setError("To date cannot be earlier than from date")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const selectedVisitors = visitorProfiles.filter((profile) => formData.selectedVisitorIds.includes(profile._id))

      const requestData = {
        visitors: selectedVisitors,
        reason: formData.reason,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        h2FormUrl: h2FormUrl,
      }

      const success = await onSubmit(requestData)
      if (success) {
        setFormData({
          selectedVisitorIds: [],
          reason: "",
          fromDate: "",
          toDate: "",
        })
        removeH2Form()
        onClose()
      } else {
        setError("Failed to submit visitor request. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title="Create Visitor Request" onClose={onClose} width={650}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ color: 'var(--color-danger)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <Text color="danger-text">{error}</Text>
          </div>
        )}

        {/* Visitor Selection */}
        <div>
          <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
            <Heading as="h3" weight="medium" color="secondary">Select Visitors</Heading>
            <Button type="button" onClick={handleAddProfile} variant="ghost" size="sm">
              <FaPlus size={12} />
              Add New Profile
            </Button>
          </HStack>

          {visitorProfiles.length === 0 ? (
            <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <Text color="muted" size="sm">No visitor profiles found. Add some profiles first.</Text>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-3)', maxHeight: '240px', overflowY: 'auto', padding: 'var(--spacing-2)' }}>
              {visitorProfiles.map((visitor) => (
                <div key={visitor._id} onClick={() => handleVisitorSelection(visitor._id)}
                  style={{
                    border: `var(--border-1) solid ${formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
                    backgroundColor: formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-primary-bg)' : 'transparent',
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'var(--transition-colors)'
                  }}
                  onMouseEnter={(e) => {
                    if (!formData.selectedVisitorIds.includes(visitor._id)) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.selectedVisitorIds.includes(visitor._id)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <HStack gap="none" align="start">
                    <IconCircle size="var(--avatar-sm)" bg={formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-primary)' : 'var(--color-bg-muted)'} color={formData.selectedVisitorIds.includes(visitor._id) ? 'var(--color-white)' : 'var(--color-text-muted)'} style={{ marginRight: 'var(--spacing-3)' }}>
                      <FaUserAlt size={12} />
                    </IconCircle>
                    <div>
                      <Heading as="h4" weight="medium" color="primary">{visitor.name}</Heading>
                      <Text as="div" size="xs" color="muted">
                        <p>{visitor.relation}</p>
                        <p>{visitor.phone}</p>
                      </Text>
                    </div>
                  </HStack>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visit Details */}
        <Grid min={250} gap={4}>
          <VStack gap="xsmall">
            <Label htmlFor="fromDate" required>From Date</Label>
            <Input id="fromDate" type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} min={minDateString} required />
            <Text size="xs" color="muted">Must be at least 2 days from today</Text>
          </VStack>

          <VStack gap="xsmall">
            <Label htmlFor="toDate" required>To Date</Label>
            <Input id="toDate" type="date" name="toDate" value={formData.toDate} onChange={handleChange} min={formData.fromDate || minDateString} required />
          </VStack>
        </Grid>

        {/* Reason for Visit */}
        <VStack gap="xsmall">
          <Label htmlFor="reason" required>Reason for Visit</Label>
          <Textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} placeholder="Please provide details about the purpose of the visit" rows={4} resize="none" required />
        </VStack>

        {/* H2 Form Upload */}
        <div>
          <HStack justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
            <Label required>H2 Form Upload</Label>
            <a href="https://hostel.iiti.ac.in/docs/H2%20Form.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'underline', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary-hover)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--color-primary)'}
            >
              Download H2 Form
            </a>
          </HStack>

          {!h2FormUploaded ? (
            <Surface padding={6} radius="lg" border="var(--border-2) dashed var(--color-border-input)">
              <Text as="div" align="center">
                <IconCircle size="48px" bg="brand" style={{ margin: '0 auto var(--spacing-3)' }}>
                  <FaFileAlt style={{ width: 'var(--icon-xl)', height: 'var(--icon-xl)', color: 'var(--color-primary)' }} />
                </IconCircle>
                <VStack gap={2}>
                  <Text color="secondary" size="sm">Upload filled H2 form</Text>
                  <Text color="muted" size="xs">PDF only (max 5MB)</Text>
                </VStack>

                {h2FormFile ? (
                  <VStack gap={3} style={{ marginTop: 'var(--spacing-4)' }}>
                    <Surface bg="tertiary" padding={3} radius="lg">
                      <HStack gap={2} align="center" justify="center">
                        <FaFileAlt style={{ color: 'var(--color-text-tertiary)' }} />
                        <Text as="span" size="sm" color="secondary">{h2FormFile.name}</Text>
                      </HStack>
                    </Surface>
                    <HStack gap={3} justify="center">
                      <Button type="button" onClick={removeH2Form} variant="secondary" size="sm">
                        Remove
                      </Button>
                      <Button type="button" onClick={uploadH2Form} disabled={h2FormUploading} variant="primary" size="sm" loading={h2FormUploading}>
                        {h2FormUploading ? null : <FaUpload size={12} />}
                        {h2FormUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <div style={{ marginTop: 'var(--spacing-4)' }}>
                    <label style={{ display: 'inline-block' }}>
                      <input type="file" style={{ display: 'none' }} accept=".pdf" onChange={handleH2FormFileChange} />
                      <span style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'inline-block', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-primary-hover)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-primary-bg)'}
                      >
                        Select File
                      </span>
                    </label>
                  </div>
                )}
              </Text>
            </Surface>
          ) : (
            <Surface bg="var(--color-success-bg-light)" padding={4} radius="lg" border="var(--border-1) solid var(--color-success-bg)">
              <HStack gap="none" align="center">
                <IconCircle size="var(--avatar-sm)" bg="success" style={{ marginRight: 'var(--spacing-3)' }}>
                  <FaCheckCircle style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', color: 'var(--color-success)' }} />
                </IconCircle>
                <div style={{ flex: 1 }}>
                  <Text color="success-text" weight="medium" size="sm">H2 Form Uploaded Successfully</Text>
                  <Text color="success" size="xs">Ready to submit visitor request</Text>
                </div>
                <Button type="button" onClick={removeH2Form} variant="ghost" size="sm">
                  Change
                </Button>
              </HStack>
            </Surface>
          )}
        </div>

        {/* Submit Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', gap: 'var(--spacing-3)' }}>
<Button type="button" onClick={onClose} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={loading || visitorProfiles.length === 0 || !h2FormUploaded} loading={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddVisitorRequestModal
