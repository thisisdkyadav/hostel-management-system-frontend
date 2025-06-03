import React, { useState } from "react"
import { FaTrash, FaSave, FaTools, FaExclamationTriangle, FaPhone } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"
import ImageUploadModal from "../../common/ImageUploadModal"

const MAINTENANCE_CATEGORIES = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other"]

const EditMaintenanceForm = ({ staff, onClose, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: staff.name || "",
    category: staff.category || "",
    phone: staff.phone || "",
    profileImage: staff.profileImage || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const message = await adminApi.updateMaintenanceStaff(staff.id, formData)
      if (!message) {
        setError("Failed to update maintenance staff. Please try again.")
        return
      }

      alert("Maintenance staff updated successfully!")
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update maintenance staff:", error)
      setError("Failed to update maintenance staff. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this maintenance staff account?")
    if (confirmDelete) {
      try {
        setLoading(true)
        setError(null)

        const message = await adminApi.deleteMaintenanceStaff(staff.id)
        if (!message) {
          setError("Failed to delete maintenance staff. Please try again.")
          return
        }

        alert("Maintenance staff deleted successfully!")
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error("Failed to delete maintenance staff:", error)
        setError("Failed to delete maintenance staff. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Modal title="Edit Maintenance Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-start">
            <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="relative h-24 w-24 rounded-full mb-2">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt={formData.name} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md" />
            ) : (
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md">
                <FaTools className="h-12 w-12 text-[#1360AB]" />
              </div>
            )}
            <div onClick={() => setIsImageModalOpen(true)} className="absolute bottom-0 right-0 bg-[#1360AB] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#0F4C81] transition-colors">
              <HiCamera className="w-4 h-4" />
            </div>
          </div>
          <span className="text-sm text-gray-500">Click the camera icon to change profile photo</span>
        </div>

        {isImageModalOpen && <ImageUploadModal userId={staff.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Staff Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Enter staff name" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaPhone />
            </div>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="+91 9876543210" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialty Category</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaTools />
            </div>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] appearance-none bg-white" required>
              <option value="">Select a category</option>
              {MAINTENANCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 mt-5 border-t border-gray-100">
          <button type="button" onClick={handleDelete} disabled={loading} className="mt-3 sm:mt-0 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center sm:justify-start">
            {loading ? <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></span> : <FaTrash className="mr-2" />}
            Delete Account
          </button>

          <button type="submit" disabled={loading} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4d8a] transition-colors flex items-center justify-center sm:justify-start">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : <FaSave className="mr-2" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditMaintenanceForm
