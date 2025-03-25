import { useState } from "react"
import { HiPencil, HiDocumentText, HiExclamationCircle } from "react-icons/hi"

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

      <div className="pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm hover:shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center">
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </div>
    </form>
  )
}

export default FeedbackForm
