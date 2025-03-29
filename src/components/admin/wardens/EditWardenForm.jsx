import React, { useState } from "react"
import { FaTrash, FaSave, FaBuilding, FaPhone, FaCalendarAlt } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"

const EditWardenForm = ({ warden, staffType = "warden", onClose, onSave, onDelete }) => {
  const { hostelList } = useAdmin()
  const staffTitle = staffType === "warden" ? "Warden" : "Associate Warden"

  const [formData, setFormData] = useState({
    phone: warden.phone || "",
    hostelId: warden.hostelId || "",
    joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const message = staffType === "warden" ? await adminApi.updateWarden(warden.id, formData) : await adminApi.updateAssociateWarden(warden.id, formData)

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
        const message = staffType === "warden" ? await adminApi.deleteWarden(warden.id) : await adminApi.deleteAssociateWarden(warden.id)

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
            <label className="block text-gray-700 text-sm font-medium mb-2">Hostel Assignment</label>
            <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all bg-white">
              <option value="">Select a hostel</option>
              {hostelList.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
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
