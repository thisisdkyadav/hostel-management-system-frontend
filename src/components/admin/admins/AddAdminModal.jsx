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
        <div className="bg-[var(--color-primary-bg)] p-[var(--spacing-4)] rounded-[var(--radius-lg)] mb-[var(--spacing-4)]">
          <div className="flex items-center text-[var(--color-primary)]">
            <FaUserShield className="mr-[var(--spacing-2)]" />
            <h4 className="font-[var(--font-weight-medium)]">Administrator Information</h4>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Name *</label>
            <div className="relative">
              <div className="absolute left-[var(--spacing-3)] top-[var(--spacing-3)] text-[var(--color-text-placeholder)]">
                <FiUser />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-[var(--spacing-3)] pl-[var(--spacing-10)] border rounded-[var(--radius-lg)] focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-[var(--transition-all)] ${errors.name ? "border-[var(--color-danger-border)]" : "border-[var(--color-border-input)]"}`}
                placeholder="Enter full name"
                required
              />
              {errors.name && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Email *</label>
            <div className="relative">
              <div className="absolute left-[var(--spacing-3)] top-[var(--spacing-3)] text-[var(--color-text-placeholder)]">
                <FiMail />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-[var(--spacing-3)] pl-[var(--spacing-10)] border rounded-[var(--radius-lg)] focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-[var(--transition-all)] ${errors.email ? "border-[var(--color-danger-border)]" : "border-[var(--color-border-input)]"}`}
                placeholder="admin@example.com"
                required
              />
              {errors.email && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Password *</label>
            <div className="relative">
              <div className="absolute left-[var(--spacing-3)] top-[var(--spacing-3)] text-[var(--color-text-placeholder)]">
                <FiLock />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-[var(--spacing-3)] pl-[var(--spacing-10)] border rounded-[var(--radius-lg)] focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-[var(--transition-all)] ${errors.password ? "border-[var(--color-danger-border)]" : "border-[var(--color-border-input)]"}`}
                placeholder="Enter password"
                required
              />
              {errors.password && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.password}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Category *</label>
            <div className="relative">
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-[var(--spacing-3)] border rounded-[var(--radius-lg)] focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-[var(--transition-all)] ${errors.category ? "border-[var(--color-danger-border)]" : "border-[var(--color-border-input)]"}`}
                placeholder="Admin"
                required
              />
              {errors.category && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Phone (Optional)</label>
            <div className="relative">
              <div className="absolute left-[var(--spacing-3)] top-[var(--spacing-3)] text-[var(--color-text-placeholder)]">
                <FiPhone />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-[var(--spacing-3)] pl-[var(--spacing-10)] border rounded-[var(--radius-lg)] focus:ring-2 focus:ring-[var(--color-primary-bg-hover)] focus:border-[var(--color-primary)] outline-none transition-[var(--transition-all)] ${errors.phone ? "border-[var(--color-danger-border)]" : "border-[var(--color-border-input)]"}`}
                placeholder="+91 9876543210"
              />
              {errors.phone && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end pt-[var(--spacing-5)] mt-[var(--spacing-6)] border-t border-[var(--color-border-light)] space-y-[var(--spacing-3)] sm:space-y-0 sm:space-x-[var(--spacing-3)]">
          <button type="button" className="order-last sm:order-first px-[var(--spacing-5)] py-[var(--spacing-2-5)] bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] rounded-[var(--radius-lg)] transition-[var(--transition-all)]" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={`px-[var(--spacing-5)] py-[var(--spacing-2-5)] bg-[var(--color-primary)] text-[var(--color-white)] rounded-[var(--radius-lg)] hover:bg-[var(--color-primary-hover)] transition-[var(--transition-all)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] ${isSubmitting ? "opacity-[var(--opacity-disabled)] cursor-not-allowed" : ""}`} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Administrator"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddAdminModal
