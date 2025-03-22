import { useState } from "react"
import { HiMail, HiLockClosed, HiExclamationCircle } from "react-icons/hi"

const UpdatePasswordForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
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

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
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
      await onSubmit(formData.email, formData.newPassword)
      setFormData({
        email: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error in form submission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-400">
            <HiMail size={20} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 p-3 border ${errors.email ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB] transition-colors`}
            placeholder="Enter user's email address"
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-sm mt-1.5 flex items-center">
            <HiExclamationCircle className="mr-1.5 flex-shrink-0" /> {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-400">
            <HiLockClosed size={20} />
          </div>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`w-full pl-10 p-3 border ${errors.newPassword ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB] transition-colors`}
            placeholder="Enter new password"
          />
        </div>
        {errors.newPassword ? (
          <p className="text-red-600 text-sm mt-1.5 flex items-center">
            <HiExclamationCircle className="mr-1.5 flex-shrink-0" /> {errors.newPassword}
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1.5 ml-1">Password must be at least 6 characters long</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">Confirm New Password</label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-400">
            <HiLockClosed size={20} />
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 p-3 border ${errors.confirmPassword ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100"} rounded-lg focus:outline-none focus:ring-2 focus:border-[#1360AB] transition-colors`}
            placeholder="Confirm new password"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1.5 flex items-center">
            <HiExclamationCircle className="mr-1.5 flex-shrink-0" /> {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="pt-4">
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="text-sm text-gray-500 max-w-xs order-2 sm:order-1">
            <p className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              This action will immediately change the user's password
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm hover:shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center order-1 sm:order-2">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default UpdatePasswordForm
