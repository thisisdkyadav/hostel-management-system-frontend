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
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <label className="block text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-500">
            <HiMail size={20} />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 p-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter user's email address" />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <HiExclamationCircle className="mr-1" /> {errors.email}
          </p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-gray-700 mb-2">New Password</label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-500">
            <HiLockClosed size={20} />
          </div>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`w-full pl-10 p-3 border ${errors.newPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter new password"
          />
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <HiExclamationCircle className="mr-1" /> {errors.newPassword}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Confirm New Password</label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-500">
            <HiLockClosed size={20} />
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 p-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Confirm new password"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <HiExclamationCircle className="mr-1" /> {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-[#1360AB] text-white rounded-xl hover:bg-[#0d4b86] transition-colors w-full md:w-1/2 flex justify-center items-center">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </div>
    </form>
  )
}

export default UpdatePasswordForm
