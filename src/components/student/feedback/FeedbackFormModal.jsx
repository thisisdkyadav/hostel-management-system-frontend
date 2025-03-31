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
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Feedback Title</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <HiPencil size={20} />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full pl-10 p-3 border ${errors.title ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB] transition-colors`}
                placeholder="Enter feedback title"
              />
            </div>
            {errors.title && (
              <p className="text-red-600 text-sm mt-1.5 flex items-center">
                <HiExclamationCircle className="mr-1.5 flex-shrink-0" /> {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <HiDocumentText size={20} />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full pl-10 p-3 border ${errors.description ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB] transition-colors`}
                placeholder="Describe your feedback in detail"
              />
            </div>
            {errors.description && (
              <p className="text-red-600 text-sm mt-1.5 flex items-center">
                <HiExclamationCircle className="mr-1.5 flex-shrink-0" /> {errors.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
            <button type="button" onClick={onClose} className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow font-medium disabled:bg-blue-300 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : isEditing ? (
                "Update Feedback"
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default FeedbackFormModal
