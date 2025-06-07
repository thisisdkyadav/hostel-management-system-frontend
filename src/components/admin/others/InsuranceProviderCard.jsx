import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash } from "react-icons/fa"
import EditInsuranceProviderModal from "./EditInsuranceProviderModal"
import { insuranceProviderApi } from "../../../services/insuranceProviderApi"

const InsuranceProviderCard = ({ provider, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this insurance provider?")) {
      try {
        setIsDeleting(true)
        await insuranceProviderApi.deleteInsuranceProvider(provider.id)
        alert("Insurance provider deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting insurance provider:", error)
        alert("Failed to delete insurance provider. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FaBuilding className="text-[#1360AB]" size={20} />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">{provider.name}</h3>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setShowEditModal(true)} className="p-2 text-gray-500 hover:text-[#1360AB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit provider">
              <FaEdit />
            </button>
            <button onClick={handleDelete} disabled={isDeleting} className={`p-2 ${isDeleting ? "text-gray-400" : "text-gray-500 hover:text-red-600 hover:bg-red-50"} rounded-lg transition-colors`} title="Delete provider">
              {isDeleting ? <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></span> : <FaTrash />}
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-start">
            <FaEnvelope className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
            <span className="text-gray-600 break-all">{provider.email}</span>
          </div>
          <div className="flex items-start">
            <FaPhone className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
            <span className="text-gray-600">{provider.phone}</span>
          </div>
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
            <span className="text-gray-600">{provider.address}</span>
          </div>
        </div>
      </div>

      {showEditModal && <EditInsuranceProviderModal show={showEditModal} provider={provider} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
    </>
  )
}

export default InsuranceProviderCard
