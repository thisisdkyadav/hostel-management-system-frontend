import React, { useState } from "react"
import { FaTrash, FaSave, FaBuilding, FaUser, FaExclamationTriangle } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"
import Modal from "../../common/Modal"

const EditSecurityForm = ({ security, onClose, onUpdate, onDelete }) => {
  const { hostelList } = useAdmin()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: security.name || "",
    hostelId: security.hostelId || "",
  })

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

      const message = await adminApi.updateSecurity(security.id, formData)
      if (!message) {
        setError("Failed to update security staff. Please try again.")
        return
      }

      alert("Security staff updated successfully!")
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update security staff:", error)
      setError("Failed to update security staff. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this security staff account?")
    if (confirmDelete) {
      try {
        setLoading(true)
        setError(null)

        const message = await adminApi.deleteSecurity(security.id)
        if (!message) {
          setError("Failed to delete security staff. Please try again.")
          return
        }

        alert("Security staff deleted successfully!")
        if (onDelete) onDelete()
        onClose()
      } catch (error) {
        console.error("Failed to delete security staff:", error)
        setError("Failed to delete security staff. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Modal title="Edit Security Staff" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-start">
            <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Security Name</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaUser />
            </div>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Enter security staff name" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Assignment</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaBuilding />
            </div>
            <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] appearance-none bg-white">
              <option value="">Not assigned to any hostel</option>
              {hostelList.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 mt-5 border-t border-gray-100">
          <button type="button" onClick={handleDelete} disabled={loading} className="mt-3 sm:mt-0 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center sm:justify-start">
            {loading ? <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></span> : <FaTrash className="mr-2" />}
            Delete Account
          </button>

          <button type="submit" disabled={loading} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4d8a] transition-colors flex items-center justify-center sm:justify-start">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : <FaSave className="mr-2" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditSecurityForm
