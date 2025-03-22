import React, { useState } from "react"
import { FiUser, FiMail, FiLock, FiHome } from "react-icons/fi"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"

const AddSecurityModal = ({ show, onClose, onSuccess }) => {
  const { hostelList } = useAdmin()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hostelId: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await adminApi.addSecurity(formData)

      if (!response) {
        alert("Failed to add security personnel. Please try again.")
        return
      }

      alert("Security personnel added successfully!")

      setFormData({
        name: "",
        email: "",
        password: "",
        hostelId: "",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Error adding security personnel:", error)
      alert("Failed to add security personnel. Please try again.")
    }
  }

  if (!show) return null

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    // <div onClick={handleCloseModal} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
    //   <div className="bg-white p-8 rounded-[20px] w-[500px] max-w-full shadow-xl">
    //     <h2 className="text-2xl font-bold mb-6 text-[#1360AB]">Add New Security</h2>
    <Modal title="Add New Security" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiUser />
              </div>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" placeholder="Security Name" required />
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiMail />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" placeholder="security@example.com" required />
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
            <label className="block text-gray-700 font-medium mb-2">Assign Hostel</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FiHome />
              </div>
              <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB] focus:border-transparent" required>
                <option value="">Select a hostel</option>
                {hostelList.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 space-x-3">
          <button type="button" className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0D4D8A] transition-colors">
            Add Security
          </button>
        </div>
      </form>
      {/* </div>
    </div> */}
    </Modal>
  )
}

export default AddSecurityModal
