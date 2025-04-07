import React, { useState, useEffect } from "react"
import { FaExclamationTriangle, FaBell } from "react-icons/fa"
import Modal from "../common/Modal"
import { notificationApi } from "../../services/notificationApi"
import { useGlobal } from "../../contexts/GlobalProvider"

const CreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { hostelList } = useGlobal()
  console.log(hostelList, "Hostel List from Global Context")

  // hostelList is an array of objects with id and name properties
  // Example: [{ id: "hostel1", name: "Hostel 1" }, { id: "hostel2", name: "Hostel 2" }]

  if (!isOpen) return null

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement",
    hostelId: "",
    degree: "",
    department: "",
    gender: "",
    expiryDate: "",
  })

  useEffect(() => {
    const date = new Date()
    date.setDate(date.getDate() + 15)
    setFormData((prev) => ({
      ...prev,
      expiryDate: date.toISOString().split("T")[0],
    }))
  }, [])

  const getHostelNameById = (id) => {
    const hostel = hostelList.find((hostel) => hostel._id === id)
    return hostel ? hostel.name : ""
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required")
      return false
    }

    if (!formData.message.trim()) {
      setError("Message is required")
      return false
    }

    return true
  }

  const moveToStep2 = () => {
    if (!validateForm()) return
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        expiryDate: formData.expiryDate,
      }

      if (formData.hostelId) payload.hostelId = formData.hostelId
      if (formData.degree) payload.degree = formData.degree
      if (formData.department) payload.department = formData.department
      if (formData.gender) payload.gender = formData.gender

      const response = await notificationApi.createNotification(payload)

      if (response) {
        alert("Notification sent successfully")
        if (onSuccess) onSuccess()
        onClose()
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating the notification")
      console.error("Error creating notification:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const date = new Date()
    date.setDate(date.getDate() + 15)

    setFormData({
      title: "",
      message: "",
      type: "announcement",
      hostelId: "",
      degree: "",
      department: "",
      gender: "",
      expiryDate: date.toISOString().split("T")[0],
    })
    setStep(1)
    setError(null)
  }

  return (
    <Modal
      title={step === 1 ? "Create New Notification" : "Review & Send Notification"}
      onClose={() => {
        onClose()
        handleReset()
      }}
      width={700}
    >
      {step === 1 ? (
        <form className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-start">
              <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Notification Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter notification title" required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter notification message" required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Expiry Date</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" min={new Date().toISOString().split("T")[0]} required />
            <p className="text-xs text-gray-500 mt-1">Notifications will be shown to students until this date</p>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Target Recipients (Optional)</h3>
            <p className="text-xs text-gray-500 mb-4">Leave all fields empty to target all students</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Hostel</label>
                <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all">
                  <option value="">All Hostels</option>
                  {hostelList &&
                    hostelList.map((hostel) => (
                      <option key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all"
                  placeholder="Enter department (leave empty for all)"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Degree</label>
                <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter degree (leave empty for all)" />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all">
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  handleReset()
                }}
                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button type="button" onClick={moveToStep2} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Continue
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-start">
              <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-3">Notification Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Title:</span>
                <span className="font-medium">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium capitalize">{formData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expiry:</span>
                <span className="font-medium">{new Date(formData.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-3">Target Recipients</h3>
            <div className="space-y-2">
              {!formData.hostelId && !formData.department && !formData.degree && !formData.gender ? (
                <p className="text-gray-700">All Students</p>
              ) : (
                <>
                  {formData.hostelId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hostel:</span>
                      <span className="font-medium">{getHostelNameById(formData.hostelId)}</span>
                    </div>
                  )}
                  {formData.department && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Department:</span>
                      <span className="font-medium">{formData.department}</span>
                    </div>
                  )}
                  {formData.degree && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Degree:</span>
                      <span className="font-medium">{formData.degree}</span>
                    </div>
                  )}
                  {formData.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium">{formData.gender}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-3">Message</h3>
            <p className="text-gray-700 whitespace-pre-line">{formData.message}</p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button type="button" onClick={handleSubmit} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaBell className="mr-2" /> Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default CreateNotificationModal
