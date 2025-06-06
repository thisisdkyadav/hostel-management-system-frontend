import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import FormField from "../../common/FormField"
import Button from "../../common/Button"
import { FaTrash } from "react-icons/fa"

const FamilyMemberModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditing = false, onDelete = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    address: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        relationship: initialData.relationship || "",
        address: initialData.address || "",
      })
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        relationship: "",
        address: "",
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = "Relationship is required"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
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
      await onSubmit(formData)
    } catch (error) {
      console.error("Error in form submission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (onDelete && initialData?.id) {
      onDelete(initialData.id)
      onClose()
    }
  }

  const relationshipOptions = [
    { value: "", label: "Select relationship" },
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian", label: "Guardian" },
    { value: "Sibling", label: "Sibling" },
    { value: "Other", label: "Other" },
  ]

  if (!isOpen) return null

  return (
    <Modal title={isEditing ? "Edit Family Member" : "Add Family Member"} onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name" name="name" value={formData.name} onChange={handleChange} required error={errors.name} placeholder="Enter full name" />

        <FormField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required error={errors.phone} placeholder="Enter 10-digit phone number" />

        <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Enter email address" />

        <FormField label="Relationship" name="relationship" type="select" value={formData.relationship} onChange={handleChange} required options={relationshipOptions} error={errors.relationship} />

        <FormField label="Address" name="address" type="textarea" value={formData.address} onChange={handleChange} required error={errors.address} placeholder="Enter complete address" rows={3} />

        <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
          {isEditing && onDelete && (
            <Button type="button" variant="danger" size="small" icon={<FaTrash />} onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div className="flex space-x-3 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditing ? "Update" : "Add"} Family Member
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default FamilyMemberModal
