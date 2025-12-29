import React, { useState, useEffect } from "react"
import { FaTrash, FaSave, FaPhone, FaUserShield } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import superAdminService from "../../../services/superAdminService"
import Modal from "../../common/Modal"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"

const EditAdminForm = ({ admin, onClose, onSave, onDelete }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    phone: admin.phone || "",
    profileImage: admin.profileImage || "",
    category: admin.category || "Admin",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData({
      phone: admin.phone || "",
      profileImage: admin.profileImage || "",
      category: admin.category || "Admin",
    })
  }, [admin])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Phone number is invalid"
    }
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Category is required"
    }
    return newErrors
  }

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        phone: formData.phone,
        profileImage: formData.profileImage,
        category: formData.category,
      }

      await superAdminService.updateAdmin(admin.id, payload)
      alert("Administrator updated successfully!")
      if (onSave) onSave()
      onClose()
    } catch (error) {
      console.error("Failed to update administrator:", error)
      alert(error.message || "Failed to update administrator. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this administrator?")
    if (confirmDelete) {
      setIsLoading(true)
      try {
        await superAdminService.deleteAdmin(admin.id)
        alert("Administrator deleted successfully!")
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error("Failed to delete administrator:", error)
        alert(error.message || "Failed to delete administrator. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Modal title={`Edit Administrator: ${admin.name}`} onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[var(--color-primary-bg)] p-[var(--spacing-4)] rounded-[var(--radius-lg)] mb-[var(--spacing-4)]">
          <div className="flex items-center text-[var(--color-primary)]">
            <FaUserShield className="mr-[var(--spacing-2)]" />
            <h4 className="font-[var(--font-weight-medium)]">Administrator Information</h4>
          </div>
        </div>

        <div className="flex flex-col items-center mb-[var(--spacing-6)]">
          <div className="relative h-[var(--avatar-3xl)] w-[var(--avatar-3xl)] rounded-[var(--radius-full)] mb-[var(--spacing-2)]">
            {formData.profileImage ? (
              <img src={getMediaUrl(formData.profileImage)} alt={admin.name} className="h-[var(--avatar-3xl)] w-[var(--avatar-3xl)] rounded-[var(--radius-full)] object-cover border-[var(--border-4)] border-[var(--color-primary)] shadow-[var(--shadow-md)]" />
            ) : (
              <div className="flex items-center justify-center h-[var(--avatar-3xl)] w-[var(--avatar-3xl)] rounded-[var(--radius-full)] bg-[var(--color-primary-bg-hover)] border-[var(--border-4)] border-[var(--color-primary)] shadow-[var(--shadow-md)]">
                <FaUserShield className="h-[var(--spacing-12)] w-[var(--spacing-12)] text-[var(--color-primary)]" />
              </div>
            )}
            <div onClick={() => setIsImageModalOpen(true)} className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-[var(--color-white)] p-[var(--spacing-1-5)] rounded-[var(--radius-full)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-[var(--transition-colors)]">
              <HiCamera className="w-[var(--spacing-4)] h-[var(--spacing-4)]" />
            </div>
          </div>
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">Click the camera icon to change profile photo</span>
        </div>

        {isImageModalOpen && <ImageUploadModal userId={admin.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

        <div className="space-y-4">
          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Name</label>
            <Input type="text" value={admin.name} disabled />
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)] mt-[var(--spacing-1)]">Name cannot be changed</p>
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Email</label>
            <Input type="email" value={admin.email} disabled />
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)] mt-[var(--spacing-1)]">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Phone Number</label>
            <Input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={<FaPhone />}
              placeholder="Enter phone number"
              error={errors.phone}
            />
            {errors.phone && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-[var(--color-text-tertiary)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] mb-[var(--spacing-2)]">Category</label>
            <Input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Admin"
              error={errors.category}
            />
            {errors.category && <p className="mt-[var(--spacing-1)] text-[var(--font-size-sm)] text-[var(--color-danger)]">{errors.category}</p>}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-[var(--spacing-5)] mt-[var(--spacing-6)] border-t border-[var(--color-border-light)]">
          <Button
            type="button"
            onClick={handleDelete}
            variant="danger"
            size="medium"
            icon={<FaTrash />}
            disabled={isLoading}
            className="mt-[var(--spacing-3)] sm:mt-0"
          >
            Delete Administrator
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="medium"
            icon={<FaSave />}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditAdminForm
