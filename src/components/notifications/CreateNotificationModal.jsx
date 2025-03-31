import React, { useState, useEffect } from "react"
import { FaExclamationTriangle, FaBell } from "react-icons/fa"
import Modal from "../common/Modal"
import { notificationApi } from "../../services/notificationApi"

const CreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement",
    targetType: "all", // Default and only option for now
    // Only keeping this structure for future compatibility
    // targets: {
    // hostelIds: [],
    // departments: [],
    // degrees: [],
    // admissionYearStart: "",
    // admissionYearEnd: "",
    // specific: [],
    // },
    expiryDate: "",
    status: "sent",
  })

  useEffect(() => {
    const date = new Date()
    date.setDate(date.getDate() + 15)
    setFormData((prev) => ({
      ...prev,
      expiryDate: date.toISOString().split("T")[0],
    }))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
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
    console.log("Submitting notification:", formData)

    try {
      setLoading(true)
      setError(null)

      const response = await notificationApi.createNotification(formData)

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
    setFormData({
      title: "",
      message: "",
      type: "announcement",
      targetType: "all",
      // targets: {
      //   hostelIds: [],
      //   departments: [],
      //   degrees: [],
      //   admissionYearStart: "",
      //   admissionYearEnd: "",
      //   specific: [],
      // },
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split("T")[0],
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

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Target Recipients</label>
            <select disabled name="targetType" value="all" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700">
              <option value="all">All Students</option>
              {/* Other target options are commented out for now
              <option value="hostel">By Hostel</option>
              <option value="department">By Department</option>
              <option value="degree">By Degree</option>
              <option value="admission_year">By Admission Year</option>
              <option value="specific">Specific Students</option>
              */}
            </select>
            <p className="text-xs text-gray-500 mt-1">Currently only "All Students" option is available</p>
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
              <div className="flex justify-between">
                <span className="text-gray-500">Recipients:</span>
                <span className="font-medium">All Students</span>
              </div>
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
