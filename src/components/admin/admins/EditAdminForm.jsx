import React, { useState, useEffect } from "react"
import { FaTrash, FaSave, FaPhone, FaUserShield } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import superAdminService from "../../../services/superAdminService"
import Modal from "../../common/Modal"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"

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
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center text-blue-800">
            <FaUserShield className="mr-2" />
            <h4 className="font-medium">Administrator Information</h4>
          </div>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative h-24 w-24 rounded-full mb-2">
            {formData.profileImage ? (
              <img src={getMediaUrl(formData.profileImage)} alt={admin.name} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md" />
            ) : (
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md">
                <FaUserShield className="h-12 w-12 text-[#1360AB]" />
              </div>
            )}
            <div onClick={() => setIsImageModalOpen(true)} className="absolute bottom-0 right-0 bg-[#1360AB] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#0F4C81] transition-colors">
              <HiCamera className="w-4 h-4" />
            </div>
          </div>
          <span className="text-sm text-gray-500">Click the camera icon to change profile photo</span>
        </div>

        {isImageModalOpen && <ImageUploadModal userId={admin.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
            <input type="text" value={admin.name} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
            <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input type="email" value={admin.email} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaPhone />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.phone ? "border-red-300" : "border-gray-300"}`}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.category ? "border-red-300" : "border-gray-300"}`}
              placeholder="Admin"
            />
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-5 mt-6 border-t border-gray-100">
          <button type="button" onClick={handleDelete} disabled={isLoading} className="mt-3 sm:mt-0 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center disabled:opacity-50">
            <FaTrash className="mr-2" /> Delete Administrator
          </button>

          <button type="submit" disabled={isLoading} className={`px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow flex items-center justify-center ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
            <FaSave className="mr-2" /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditAdminForm
