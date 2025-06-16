import React, { useState, useEffect } from "react"
import { FaExclamationTriangle, FaBell } from "react-icons/fa"
import Modal from "../common/Modal"
import { notificationApi } from "../../services/notificationApi"
import { useGlobal } from "../../contexts/GlobalProvider"

const CreateNotificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { hostelList } = useGlobal()

  if (!isOpen) return null

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [departmentInput, setDepartmentInput] = useState("")
  const [degreeInput, setDegreeInput] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement",
    hostelIds: [],
    degrees: [],
    departments: [],
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

  const getHostelNamesByIds = (ids) => {
    return ids
      .map((id) => {
        const hostel = hostelList.find((hostel) => hostel._id === id)
        return hostel ? hostel.name : id
      })
      .join(", ")
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hostelIds" && type === "checkbox") {
      setFormData((prev) => {
        const currentHostelIds = prev.hostelIds || []
        if (checked) {
          return { ...prev, hostelIds: [...currentHostelIds, value] }
        } else {
          return { ...prev, hostelIds: currentHostelIds.filter((id) => id !== value) }
        }
      })
    } else if (name === "departmentsInput") {
      setDepartmentInput(value)
    } else if (name === "degreesInput") {
      setDegreeInput(value)
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

  const parseInputToArray = (inputString) => {
    return inputString
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
  }

  const moveToStep2 = () => {
    if (!validateForm()) return

    setFormData((prev) => ({
      ...prev,
      departments: parseInputToArray(departmentInput),
      degrees: parseInputToArray(degreeInput),
    }))

    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const finalDepartments = parseInputToArray(departmentInput)
    const finalDegrees = parseInputToArray(degreeInput)

    try {
      setLoading(true)
      setError(null)

      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        expiryDate: formData.expiryDate,
      }

      if (formData.hostelIds.length > 0) payload.hostelId = formData.hostelIds
      if (finalDegrees.length > 0) payload.degree = finalDegrees
      if (finalDepartments.length > 0) payload.department = finalDepartments
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
      hostelIds: [],
      degrees: [],
      departments: [],
      gender: "",
      expiryDate: date.toISOString().split("T")[0],
    })
    setDepartmentInput("")
    setDegreeInput("")
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Hostel(s)</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2 bg-white">
                  {hostelList && hostelList.length > 0 ? (
                    hostelList.map((hostel) => (
                      <div key={hostel._id} className="flex items-center">
                        <input type="checkbox" id={`hostel-${hostel._id}`} name="hostelIds" value={hostel._id} checked={formData.hostelIds.includes(hostel._id)} onChange={handleChange} className="h-4 w-4 text-[#1360AB] border-gray-300 rounded focus:ring-[#1360AB]" />
                        <label htmlFor={`hostel-${hostel._id}`} className="ml-2 block text-sm text-gray-900">
                          {hostel.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hostels available.</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select one or more hostels</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Department(s)</label>
                <textarea
                  name="departmentsInput"
                  value={departmentInput}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all"
                  placeholder="Enter departments, separated by commas"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., CSE, ECE, ME</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Degree(s)</label>
                <textarea name="degreesInput" value={degreeInput} onChange={handleChange} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter degrees, separated by commas" />
                <p className="text-xs text-gray-500 mt-1">e.g., BTech, MTech</p>
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
              {!formData.hostelIds?.length && !formData.departments?.length && !formData.degrees?.length && !formData.gender ? (
                <p className="text-gray-700">All Students</p>
              ) : (
                <>
                  {formData.hostelIds.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hostel(s):</span>
                      <span className="font-medium text-right">{getHostelNamesByIds(formData.hostelIds)}</span>
                    </div>
                  )}
                  {formData.departments.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Department(s):</span>
                      <span className="font-medium text-right">{formData.departments.join(", ")}</span>
                    </div>
                  )}
                  {formData.degrees.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Degree(s):</span>
                      <span className="font-medium text-right">{formData.degrees.join(", ")}</span>
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
