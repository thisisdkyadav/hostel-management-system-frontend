import React, { useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi"
import { FaUserShield } from "react-icons/fa"
import superAdminService from "../../../services/superAdminService"
import Modal from "../../common/Modal"

const AddAdminModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    category: "Admin",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Phone number is invalid"
    }
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Category is required"
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await superAdminService.createAdmin(formData)
      alert("Administrator added successfully!")
      onAdd()

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        category: "Admin",
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error("Error adding administrator:", error)
      alert(error.message || "Failed to add administrator. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!show) return null

  return (
    <Modal title="Add New Administrator" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center text-blue-800">
            <FaUserShield className="mr-2" />
            <h4 className="font-medium">Administrator Information</h4>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Name *</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiUser />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.name ? "border-red-300" : "border-gray-300"}`}
                placeholder="Enter full name"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email *</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiMail />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.email ? "border-red-300" : "border-gray-300"}`}
                placeholder="admin@example.com"
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password *</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiLock />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.password ? "border-red-300" : "border-gray-300"}`}
                placeholder="Enter password"
                required
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Category *</label>
            <div className="relative">
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.category ? "border-red-300" : "border-gray-300"}`}
                placeholder="Admin"
                required
              />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone (Optional)</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiPhone />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.phone ? "border-red-300" : "border-gray-300"}`}
                placeholder="+91 9876543210"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
          <button type="button" className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={`px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Administrator"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddAdminModal
