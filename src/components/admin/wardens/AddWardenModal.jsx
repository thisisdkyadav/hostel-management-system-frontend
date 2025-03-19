import React, { useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar } from "react-icons/fi"
import { adminApi } from "../../../services/apiService"

const AddWardenModal = ({ show, onClose }) => {
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
    <div onClick={handleCloseModal} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[500px] max-w-full shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-[#1360AB]">Add New Warden</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2">Name</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiUser />
                </div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" placeholder="Dr. Full Name" required />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiMail />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" placeholder="email@iiti.ac.in" required />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiLock />
                </div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" placeholder="Enter password" required />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2">Phone</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiPhone />
                </div>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" placeholder="+91 9876543210" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2">Join Date</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiCalendar />
                </div>
                <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 space-x-3">
            <button type="button" className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0D4D8A] transition-colors">
              Add Warden
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddWardenModal
