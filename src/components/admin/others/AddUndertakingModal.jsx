import { useState } from "react"
import { FaFileSignature, FaCalendarAlt, FaInfoCircle } from "react-icons/fa"
import { Alert, Field, HStack, Label, Text, Textarea, VStack } from "@/components/ui"
import { Button, Input } from "hzero"
import { Modal } from "@/components/ui"
import { adminApi } from "../../../service"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format, parseISO } from "date-fns"

const AddUndertakingModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: null, // Use Date object for deadline
    content: "", // The actual undertaking text that students will read and accept
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // For react-datepicker
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      deadline: date,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      // Format deadline as mm-dd-yyyy string before sending
      const payload = {
        ...formData,
        deadline: formData.deadline ? format(formData.deadline, "MM-dd-yyyy") : "",
      }

      await adminApi.createUndertaking(payload)
      alert("Undertaking created successfully!")

      // Reset form
      setFormData({
        title: "",
        description: "",
        deadline: null,
        content: "",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to create undertaking:", error)
      setError("Failed to create undertaking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title="Create New Undertaking" onClose={onClose} width={500}>
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

            <Field label="Deadline" required>
              <div style={{ position: 'relative' }}>
                <Text as="div" color="muted" style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', zIndex: 1 }}>
                  <FaCalendarAlt />
                </Text>
                <DatePicker selected={formData.deadline} onChange={handleDateChange} dateFormat="MM-dd-yyyy" style={{ width: '100%', padding: 'var(--spacing-3)', paddingLeft: 'var(--spacing-10)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)' }} placeholderText="mm-dd-yyyy" required popperPlacement="bottom" showMonthDropdown showYearDropdown dropdownMode="select" autoComplete="off" wrapperClassName="w-full" className="w-full p-3 pl-10 border rounded-lg" />
              </div>
            </Field>

            <Field label="Undertaking Content" htmlFor="content" required>
              <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={6} placeholder="Full text of the undertaking that students will need to read and accept" required />
              <Text size="xs" color="muted" style={{ marginTop: 'var(--spacing-1)' }}>This is the full text that students will be required to read and accept.</Text>
            </Field>

            <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
              <Button type="button" onClick={onClose} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
                Create Undertaking
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Modal>
  )
}

export default AddUndertakingModal
