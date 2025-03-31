import React, { useState } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "../../common/Modal"

const AddVisitorProfileModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relation: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      const success = await onSubmit(formData)
      if (success) {
        setFormData({
          name: "",
          phone: "",
          email: "",
          relation: "",
        })
        onClose()
      } else {
        setError("Failed to add visitor profile. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title="Add Visitor Profile" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Visitor Name</label>
            <input type="text" name="name" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
            <input type="tel" name="phone" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.phone} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
            <input type="email" name="email" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Relation with Student</label>
            <select name="relation" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.relation} onChange={handleChange} required>
              <option value="">Select relation</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Guardian">Guardian</option>
              <option value="Relative">Relative</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mr-3">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddVisitorProfileModal
