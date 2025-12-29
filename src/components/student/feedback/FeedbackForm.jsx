import { useState } from "react"
import { HiPencil, HiDocumentText, HiExclamationCircle } from "react-icons/hi"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Textarea from "../../common/ui/Textarea"

const FeedbackForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const isSuccess = await onSubmit(formData.title, formData.description)
      if (isSuccess) {
        setFormData({
          title: "",
          description: "",
        })
      }
    } catch (error) {
      console.error("Error in form submission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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

      <div style={{ paddingTop: "var(--spacing-4)" }}>
        <Button type="submit" disabled={isSubmitting} variant="primary" size="large" fullWidth isLoading={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </form>
  )
}

export default FeedbackForm
