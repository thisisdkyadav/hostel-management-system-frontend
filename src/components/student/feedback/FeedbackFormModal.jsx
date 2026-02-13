import { useState, useEffect } from "react"
import { HiPencil, HiDocumentText, HiExclamationCircle } from "react-icons/hi"
import { Input, Textarea } from "@/components/ui"
import { Button, Modal } from "czero/react"

const FeedbackFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({ title: formData.title, description: formData.description })
      onClose()
    } catch (error) {
      console.error("Error in form submission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title={isEditing ? "Edit Feedback" : "Submit Feedback"} onClose={onClose} width={600}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
          <div>
            <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Feedback Title</label>
            <Input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter feedback title" error={errors.title} icon={<HiPencil size={20} />} />
            {errors.title && (
              <p style={{ color: "var(--color-danger-text)", fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-1-5)", display: "flex", alignItems: "center" }}>
                <HiExclamationCircle style={{ marginRight: "var(--spacing-1-5)", flexShrink: 0 }} /> {errors.title}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>Description</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Describe your feedback in detail" error={errors.description} icon={<HiDocumentText size={20} />} />
            {errors.description && (
              <p style={{ color: "var(--color-danger-text)", fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-1-5)", display: "flex", alignItems: "center" }}>
                <HiExclamationCircle style={{ marginRight: "var(--spacing-1-5)", flexShrink: 0 }} /> {errors.description}
              </p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingTop: "var(--spacing-5)", marginTop: "var(--spacing-6)", borderTop: `var(--border-1) solid var(--color-border-light)`, gap: "var(--spacing-3)" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "var(--spacing-3)", justifyContent: "flex-end" }}>
              <Button type="button" onClick={onClose} variant="secondary" size="md">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="primary" size="md" loading={isSubmitting}>
                {isSubmitting ? (isEditing ? "Updating..." : "Submitting...") : isEditing ? "Update Feedback" : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default FeedbackFormModal
