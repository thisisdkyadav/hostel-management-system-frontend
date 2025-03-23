import React, { useState } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "../common/Modal"
import { studentApi } from "../../services/apiService"

const RoomChangeForm = ({ isOpen, setIsOpen, student }) => {
  console.log(student)

  const [formData, setFormData] = useState({
    preferredRoom: "",
    preferredUnit: "",
    reason: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await studentApi.submitRoomChangeRequest({ ...formData, currentAllocationId: student.currentRoomAllocation })

      alert("Room change request submitted successfully!")
      setIsOpen(false)
      setFormData({
        preferredRoom: "",
        preferredUnit: "",
        reason: "",
      })
    } catch (err) {
      setError(err.message || "Failed to submit room change request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Apply for Room Change" onClose={() => setIsOpen(false)} width={550}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Preferred Unit Number</label>
              <input type="text" name="preferredUnit" placeholder="E.g., 101, 202" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.preferredUnit} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Preferred Room</label>
              <input type="text" name="preferredRoom" placeholder="E.g., E, F, G" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.preferredRoom} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Reason for Room Change</label>
            <textarea
              name="reason"
              placeholder="Please explain why you need a room change..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all resize-none h-32"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button type="button" className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow font-medium flex items-center justify-center" disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default RoomChangeForm
