import { useState, useEffect } from "react"
import { HiPencil, HiDocumentText, HiExclamationCircle } from "react-icons/hi"
import Modal from "../../common/Modal"

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Feedback Title</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <HiPencil size={20} />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={{
                  width: '100%',
                  paddingLeft: 'var(--spacing-10)',
                  padding: 'var(--spacing-3)',
                  border: `var(--border-1) solid ${errors.title ? 'var(--color-danger-border)' : 'var(--color-border-input)'}`,
                  backgroundColor: errors.title ? 'var(--color-danger-bg)' : 'var(--input-bg)',
                  borderRadius: 'var(--radius-input)',
                  outline: 'none',
                  transition: 'var(--transition-colors)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.title ? 'var(--color-danger)' : 'var(--input-border-focus)';
                  e.target.style.boxShadow = errors.title ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.title ? 'var(--color-danger-border)' : 'var(--color-border-input)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter feedback title"
              />
            </div>
            {errors.title && (
              <p style={{ color: 'var(--color-danger-text)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1-5)', display: 'flex', alignItems: 'center' }}>
                <HiExclamationCircle style={{ marginRight: 'var(--spacing-1-5)', flexShrink: 0 }} /> {errors.title}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Description</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-3)', top: 'var(--spacing-3)', color: 'var(--color-text-placeholder)' }}>
                <HiDocumentText size={20} />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                style={{
                  width: '100%',
                  paddingLeft: 'var(--spacing-10)',
                  padding: 'var(--spacing-3)',
                  border: `var(--border-1) solid ${errors.description ? 'var(--color-danger-border)' : 'var(--color-border-input)'}`,
                  backgroundColor: errors.description ? 'var(--color-danger-bg)' : 'var(--input-bg)',
                  borderRadius: 'var(--radius-input)',
                  outline: 'none',
                  transition: 'var(--transition-colors)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.description ? 'var(--color-danger)' : 'var(--input-border-focus)';
                  e.target.style.boxShadow = errors.description ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.description ? 'var(--color-danger-border)' : 'var(--color-border-input)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Describe your feedback in detail"
              />
            </div>
            {errors.description && (
              <p style={{ color: 'var(--color-danger-text)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1-5)', display: 'flex', alignItems: 'center' }}>
                <HiExclamationCircle style={{ marginRight: 'var(--spacing-1-5)', flexShrink: 0 }} /> {errors.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--spacing-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{
                  padding: 'var(--button-padding-md)',
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text-body)',
                  borderRadius: 'var(--radius-input)',
                  border: 'none',
                  transition: 'var(--transition-all)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-base)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-bg-muted)';
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--button-padding-md)',
                  backgroundColor: isSubmitting ? 'var(--color-primary-muted)' : 'var(--button-primary-bg)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-input)',
                  border: 'none',
                  transition: 'var(--transition-all)',
                  boxShadow: 'var(--shadow-button)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-base)',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = 'var(--button-primary-hover)';
                    e.target.style.boxShadow = 'var(--shadow-button-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = 'var(--button-primary-bg)';
                    e.target.style.boxShadow = 'var(--shadow-button)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ 
                      width: 'var(--icon-md)', 
                      height: 'var(--icon-md)', 
                      border: 'var(--border-2) solid var(--color-white)', 
                      borderTopColor: 'transparent', 
                      borderRadius: 'var(--radius-full)', 
                      animation: 'spin 1s linear infinite',
                      marginRight: 'var(--spacing-2)'
                    }}></div>
                    {isEditing ? "Updating..." : "Submitting..."}
                  </>
                ) : isEditing ? (
                  "Update Feedback"
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default FeedbackFormModal
