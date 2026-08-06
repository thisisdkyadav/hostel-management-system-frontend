import { useState, useEffect } from "react"
import { FaFileSignature, FaCalendarAlt, FaInfoCircle } from "react-icons/fa"
import { Alert, Field, HStack, Label, Text, Textarea, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"
import { adminApi } from "../../../service"

const EditUndertakingModal = ({ show, undertaking, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    content: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (undertaking) {
      setFormData({
        title: undertaking.title || "",
        description: undertaking.description || "",
        deadline: undertaking.deadline || "",
        content: undertaking.content || "",
      })
    }
  }, [undertaking])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      await adminApi.updateUndertaking(undertaking.id, formData)
      alert("Undertaking updated successfully!")

      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update undertaking:", error)
      setError("Failed to update undertaking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title="Edit Undertaking" onClose={onClose} width={500}>
      <VStack gap="large">
        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <VStack gap="large">
            <Field label="Title" htmlFor="title" required>
              <Input type="text" id="title" name="title" value={formData.title} onChange={handleChange} icon={<FaFileSignature />} placeholder="Undertaking Title" required />
            </Field>

            <Field label="Description" htmlFor="description" required>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} icon={<FaInfoCircle />} rows={2} placeholder="Brief description of this undertaking" required />
            </Field>

            <Field label="Deadline" htmlFor="deadline" required>
              <Input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} icon={<FaCalendarAlt />} required />
            </Field>

            <Field label="Undertaking Content" htmlFor="content" required>
              <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={6} placeholder="Full text of the undertaking that students will need to read and accept" required />
              <Text size="xs" color="muted" style={{ marginTop: 'var(--spacing-1)' }}>
                <strong>Note:</strong> Editing the content will not affect students who have already accepted this undertaking.
              </Text>
            </Field>

            <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button type="button" onClick={onClose} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
                Update Undertaking
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Modal>
  )
}

export default EditUndertakingModal
