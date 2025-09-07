import { useState } from "react"
import Modal from "../common/Modal"
import { leaveApi } from "../../services/leaveApi"

const LeaveForm = ({ isOpen, setIsOpen, onSuccess }) => {
  const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await leaveApi.createLeave({ reason: formData.reason, startDate: formData.startDate, endDate: formData.endDate })
      onSuccess?.()
      setFormData({ reason: "", startDate: "", endDate: "" })
    } catch (err) {
      setError(err.message || "Failed to create leave")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Create Leave" onClose={() => setIsOpen(false)} width={600}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 p-3 rounded text-red-600 text-sm">{error}</div>}

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Reason</label>
          <textarea name="reason" placeholder="Reason for leave" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all resize-none h-24" value={formData.reason} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Start Date</label>
            <input type="date" name="startDate" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">End Date</label>
            <input type="date" name="endDate" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-6 border-t border-gray-100 space-x-3">
          <button type="button" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow font-medium flex items-center justify-center" disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default LeaveForm
