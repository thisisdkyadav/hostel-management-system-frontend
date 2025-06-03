import React, { useState, useEffect } from "react"
import { FaTrash, FaSave, FaBuilding, FaPhone, FaCalendarAlt } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"
import ImageUploadModal from "../../common/ImageUploadModal"

const EditWardenForm = ({ warden, staffType = "warden", onClose, onSave, onDelete }) => {
  const { hostelList } = useAdmin()
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : "Hostel Supervisor"
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    phone: warden.phone || "",
    hostelIds: warden.hostelIds?.map((h) => h._id || h) || [],
    joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
    profileImage: warden.profileImage || "",
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      phone: warden.phone || "",
      hostelIds: warden.hostelIds?.map((h) => h._id || h) || [],
      joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
      profileImage: warden.profileImage || "",
    }))
  }, [warden])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hostelIds") {
      const hostelId = value
      setFormData((prev) => {
        const currentHostelIds = prev.hostelIds || []
        if (checked) {
          return { ...prev, hostelIds: [...new Set([...currentHostelIds, hostelId])] }
        } else {
          return { ...prev, hostelIds: currentHostelIds.filter((id) => id !== hostelId) }
        }
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
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
      const payload = {
        phone: formData.phone,
        hostelIds: formData.hostelIds,
        joinDate: formData.joinDate,
        profileImage: formData.profileImage,
      }
      const message = staffType === "warden" ? await adminApi.updateWarden(warden.id, payload) : staffType === "associateWarden" ? await adminApi.updateAssociateWarden(warden.id, payload) : await adminApi.updateHostelSupervisor(warden.id, payload)

      if (!message) {
        alert(`Failed to update ${staffTitle.toLowerCase()}. Please try again.`)
        return
      }
      alert(`${staffTitle} updated successfully!`)
      if (onSave) onSave()
      onClose()
    } catch (error) {
      console.error(`Failed to update ${staffTitle.toLowerCase()}:`, error)
      alert(`Failed to update ${staffTitle.toLowerCase()}. Please try again.`)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${staffTitle.toLowerCase()}?`)
    if (confirmDelete) {
      try {
        const message = staffType === "warden" ? await adminApi.deleteWarden(warden.id) : staffType === "associateWarden" ? await adminApi.deleteAssociateWarden(warden.id) : await adminApi.deleteHostelSupervisor(warden.id)

        if (!message) {
          alert(`Failed to delete ${staffTitle.toLowerCase()}. Please try again.`)
          return
        }
        alert(`${staffTitle} deleted successfully!`)
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error(`Failed to delete ${staffTitle.toLowerCase()}:`, error)
        alert(`Failed to delete ${staffTitle.toLowerCase()}. Please try again.`)
      }
    }
  }

  return (
    <Modal title={`Edit ${staffTitle}: ${warden.name}`} onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center text-blue-800">
            <FaBuilding className="mr-2" />
            <h4 className="font-medium">{staffTitle} Information</h4>
          </div>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative h-24 w-24 rounded-full mb-2">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt={warden.name} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md" />
            ) : (
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md">
                <FaBuilding className="h-12 w-12 text-[#1360AB]" />
              </div>
            )}
            <div onClick={() => setIsImageModalOpen(true)} className="absolute bottom-0 right-0 bg-[#1360AB] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#0F4C81] transition-colors">
              <HiCamera className="w-4 h-4" />
            </div>
          </div>
          <span className="text-sm text-gray-500">Click the camera icon to change profile photo</span>
        </div>

        {isImageModalOpen && <ImageUploadModal userId={warden.id} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaPhone />
              </div>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter phone number" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Hostel Assignments</label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {hostelList.length > 0 ? (
                hostelList.map((hostel) => (
                  <div key={hostel._id} className="flex items-center">
                    <input id={`hostel-${hostel._id}`} name="hostelIds" type="checkbox" value={hostel._id} checked={formData.hostelIds.includes(hostel._id)} onChange={handleChange} className="h-4 w-4 text-[#1360AB] border-gray-300 rounded focus:ring-[#1360AB]" />
                    <label htmlFor={`hostel-${hostel._id}`} className="ml-3 block text-sm text-gray-700">
                      {hostel.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hostels available.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Join Date</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaCalendarAlt />
              </div>
              <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-5 mt-6 border-t border-gray-100">
          <button type="button" onClick={handleDelete} className="mt-3 sm:mt-0 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center">
            <FaTrash className="mr-2" /> Delete {staffTitle}
          </button>

          <button type="submit" className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow flex items-center justify-center">
            <FaSave className="mr-2" /> Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditWardenForm
