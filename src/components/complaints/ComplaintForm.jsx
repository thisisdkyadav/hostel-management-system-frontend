import React, { useState, useEffect } from "react"
import { AlertTriangle, ClipboardList } from "lucide-react"
import { useAuth } from "../../contexts/AuthProvider"
import { complaintApi } from "../../service"
import { Button, Field, Input, Modal, Select, Text, useToast, VStack } from "hzero"
import { COMPLAINT_CATEGORIES } from "../../constants/complaintConstants"

const ComplaintForm = ({ isOpen, setIsOpen }) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    attachments: "",
    location: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const complaintData = {
        userId: user._id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        attachments: formData.attachments,
        location: formData.location,
      }

      await complaintApi.createComplaint(complaintData)
      toast.success("Complaint submitted successfully!")
      setIsOpen(false)
      setFormData({
        title: "",
        description: "",
        category: "",
        attachments: "",
        location: "",
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Submit New Complaint" onClose={() => setIsOpen(false)} width={650}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'flex-start' }}>
            <AlertTriangle size="1em" style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-danger)" />
            <Text color="danger-text">{error}</Text>
          </div>
        )}

        <VStack gap={4}>
          <Field label="Complaint Title" color="secondary" spacing={2}>
            <Input type="text" name="title" placeholder="Brief summary of the issue" value={formData.title} onChange={handleChange} required />
          </Field>

          <Field label="Description" color="secondary" spacing={2}>
            <textarea name="description" placeholder="Please provide details about the issue..." value={formData.description} onChange={handleChange} required style={{ width: '100%', padding: 'var(--input-padding)', border: 'var(--border-1) solid var(--input-border)', borderRadius: 'var(--input-radius)', outline: 'none', transition: 'var(--transition-all)', resize: 'none', height: '112px', backgroundColor: 'var(--input-bg)' }} />
          </Field>

          {/* location only for warden, associate warden, hostel supervisor, admin */}
          {["Warden", "Associate Warden", "Hostel Supervisor", "Admin"].includes(user?.role) && (
            <Field label="Location" color="secondary" spacing={2}>
              <Input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
            </Field>
          )}

          <Field label="Category" color="secondary" spacing={2}>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Select Category"
              icon={<ClipboardList size="1em" />}
              options={COMPLAINT_CATEGORIES.map((option) => ({ value: option, label: option }))}
              required
            />
          </Field>
        </VStack>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--spacing-3)' }}>
          <Button type="button" onClick={() => setIsOpen(false)} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ComplaintForm
