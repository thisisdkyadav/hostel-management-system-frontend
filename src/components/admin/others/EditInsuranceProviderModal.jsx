import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaSave } from "react-icons/fa"
import Modal from "../../common/Modal"
import { insuranceProviderApi } from "../../../services/insuranceProviderApi"

const EditInsuranceProviderModal = ({ show, provider, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: provider?.name || "",
    email: provider?.email || "",
    phone: provider?.phone || "",
    address: provider?.address || "",
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
    try {
      setLoading(true)
      setError(null)

      await insuranceProviderApi.updateInsuranceProvider(provider.id, formData)
      alert("Insurance provider updated successfully!")
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error("Failed to update insurance provider:", error)
      setError("Failed to update insurance provider. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this insurance provider?")) {
      try {
        setLoading(true)
        await insuranceProviderApi.deleteInsuranceProvider(provider.id)
        alert("Insurance provider deleted successfully!")
        if (onUpdate) onUpdate()
        onClose()
      } catch (error) {
        console.error("Error deleting insurance provider:", error)
        setError("Failed to delete insurance provider. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  if (!show) return null

  return (
    <Modal title="Edit Insurance Provider" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaBuilding />
            </div>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Provider Name" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaEnvelope />
            </div>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="example@provider.com" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaPhone />
            </div>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="+91 9876543210" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaMapMarkerAlt />
            </div>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" placeholder="Provider address" required />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 mt-6 border-t border-gray-100">
          <button type="button" onClick={handleDelete} disabled={loading} className="mt-3 sm:mt-0 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center sm:justify-start">
            {loading ? <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></span> : <FaTrash className="mr-2" />}
            Delete Provider
          </button>

          <div className="flex space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-colors flex items-center">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : <FaSave className="mr-2" />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default EditInsuranceProviderModal
