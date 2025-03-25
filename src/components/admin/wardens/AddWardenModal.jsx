import React, { useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar } from "react-icons/fi"
import { adminApi } from "../../../services/apiService"
import Modal from "../../common/Modal"

const AddWardenModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    joinDate: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await adminApi.addWarden(formData)

      if (!response) {
        alert("Failed to add warden. Please try again.")
        return
      }
      onAdd()
      alert("Warden added successfully!")

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        joinDate: "",
      })

      onClose()
    } catch (error) {
      console.error("Error adding warden:", error)
      alert("Failed to add warden. Please try again.")
    }
  }

  if (!show) return null

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <Modal title="Add New Warden" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center text-blue-800">
            <FiUser className="mr-2" />
            <h4 className="font-medium">Basic Information</h4>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiUser />
              </div>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Dr. Full Name" required />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiMail />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="email@iiti.ac.in" required />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiLock />
              </div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter password" required />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiPhone />
              </div>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="+91 9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Join Date</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiCalendar />
              </div>
              <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
          <button type="button" className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow">
            Add Warden
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddWardenModal
