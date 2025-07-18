import { useState, useEffect } from "react"
import { FaFileSignature, FaCalendarAlt, FaInfoCircle } from "react-icons/fa"
import Modal from "../../common/Modal"
import { adminApi } from "../../../services/adminApi"

const EditUndertakingModal = ({ show, undertaking, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    content: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (undertaking) {
      setFormData({
        title: undertaking.title || "",
        description: undertaking.description || "",
        deadline: undertaking.deadline || "",
        content: undertaking.content || "",
      })
    }
  }, [undertaking])

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
      setLoading(true)
      setError(null)

      await adminApi.updateUndertaking(undertaking.id, formData)
      alert("Undertaking updated successfully!")

      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update undertaking:", error)
      setError("Failed to update undertaking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal title="Edit Undertaking" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaFileSignature />
            </div>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Undertaking Title" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaInfoCircle />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]"
              placeholder="Brief description of this undertaking"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaCalendarAlt />
            </div>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Undertaking Content</label>
          <div className="relative">
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]"
              placeholder="Full text of the undertaking that students will need to read and accept"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            <strong>Note:</strong> Editing the content will not affect students who have already accepted this undertaking.
          </p>
        </div>

        <div className="flex justify-end pt-4 mt-6 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 mr-2">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-colors flex items-center">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : null}
            Update Undertaking
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditUndertakingModal
