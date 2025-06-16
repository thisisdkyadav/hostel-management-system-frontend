import { useState } from "react"
import { FaBuilding, FaEnvelope, FaKey, FaTrash, FaSave } from "react-icons/fa"
import Modal from "../../common/Modal"
import { hostelGateApi } from "../../../services/hostelGateApi"

const EditHostelGateModal = ({ show, gate, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await hostelGateApi.updateHostelGate(gate.hostelId._id, { password: formData.password })
      alert("Hostel gate login password updated successfully!")

      // Reset form
      setFormData({
        password: "",
        confirmPassword: "",
      })

      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update hostel gate login:", error)
      setError("Failed to update hostel gate login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this hostel gate login?")) {
      try {
        setLoading(true)

        await hostelGateApi.deleteHostelGate(gate.hostelId._id)
        alert("Hostel gate login deleted successfully!")
        if (onUpdate) onUpdate()
        onClose()
      } catch (error) {
        console.error("Error deleting hostel gate login:", error)
        setError("Failed to delete hostel gate login. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  if (!show) return null

  return (
    <Modal title="Edit Hostel Gate Login" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hostel</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaBuilding />
            </div>
            <input type="text" value={gate.userId?.name || "Unknown Hostel"} className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50" readOnly />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaEnvelope />
            </div>
            <input type="email" value={gate.userId?.email} className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50" readOnly />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaKey />
            </div>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Enter new password" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaKey />
            </div>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Confirm new password" required />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 mt-6 border-t border-gray-100">
          <button type="button" onClick={handleDelete} disabled={loading} className="mt-3 sm:mt-0 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center sm:justify-start">
            {loading ? <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></span> : <FaTrash className="mr-2" />}
            Delete Gate Login
          </button>

          <div className="flex space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.password || !formData.confirmPassword}
              className={`px-4 py-2 bg-[#1360AB] text-white rounded-lg transition-colors flex items-center ${!formData.password || !formData.confirmPassword ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0F4C81]"}`}
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : <FaSave className="mr-2" />}
              Update Password
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default EditHostelGateModal
