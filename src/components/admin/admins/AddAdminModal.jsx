import React, { useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi"
import { FaUserShield } from "react-icons/fa"
import { superAdminApi } from "../../../service"
import { Modal, Button, Input, VStack, HStack, Label, Alert } from "@/components/ui"

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
      await superAdminApi.createAdmin(formData)
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

  return (
    <Modal isOpen={show} title="Add New Administrator" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          <div className="bg-[var(--color-primary-bg)] p-[var(--spacing-4)] rounded-[var(--radius-lg)]">
            <div className="flex items-center text-[var(--color-primary)]">
              <FaUserShield className="mr-[var(--spacing-2)]" />
              <h4 className="font-[var(--font-weight-medium)]">Administrator Information</h4>
            </div>
          </div>

          <div>
            <Label htmlFor="name" required>Name</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              icon={<FiUser />}
              placeholder="Enter full name"
              required
              error={errors.name}
            />
            {errors.name && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              icon={<FiMail />}
              placeholder="admin@example.com"
              required
              error={errors.email}
            />
            {errors.email && <Alert type="error">{errors.email}</Alert>}
          </div>

          <div>
            <Label htmlFor="password" required>Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              icon={<FiLock />}
              placeholder="Enter password"
              required
              error={errors.password}
            />
            {errors.password && <Alert type="error">{errors.password}</Alert>}
          </div>

          <div>
            <Label htmlFor="category" required>Category</Label>
            <Input
              type="text"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Admin"
              required
              error={errors.category}
            />
            {errors.category && <Alert type="error">{errors.category}</Alert>}
          </div>

          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={<FiPhone />}
              placeholder="+91 9876543210"
              error={errors.phone}
            />
            {errors.phone && <Alert type="error">{errors.phone}</Alert>}
          </div>

          <HStack gap="small" justify="end" style={{ paddingTop: "var(--spacing-5)", marginTop: "var(--spacing-2)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="medium"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Administrator"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default AddAdminModal
