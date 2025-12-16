import { useState } from "react"
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash, FaCalendarAlt, FaUsers } from "react-icons/fa"
import EditInsuranceProviderModal from "./EditInsuranceProviderModal"
import BulkStudentInsuranceModal from "./BulkStudentInsuranceModal"
import { insuranceProviderApi } from "../../../services/insuranceProviderApi"
import Card from "../../common/Card"

const InsuranceProviderCard = ({ provider, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
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

  const handleBulkUpdate = async (data) => {
    try {
      await insuranceProviderApi.updateBulkStudentInsurance(data)
      alert("Student insurance details updated successfully!")
      return true
    } catch (error) {
      console.error("Error updating student insurance details:", error)
      alert("Failed to update student insurance details. Please try again.")
      return false
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <>
      <Card>
        <Card.Header className="mb-0">
          <div className="flex justify-between items-start">
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
        </Card.Header>

        <Card.Body className="space-y-3 mt-4">
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
          <div className="flex items-start">
            <FaCalendarAlt className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
            <div className="text-gray-600">
              <span>
                Valid: {formatDate(provider.startDate)} - {formatDate(provider.endDate)}
              </span>
            </div>
          </div>
        </Card.Body>

        <Card.Footer className="mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => setShowBulkUpdateModal(true)} className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-[#1360AB] rounded-lg transition-colors flex items-center justify-center font-medium">
            <FaUsers className="mr-2" /> Update Student Insurance Details
          </button>
        </Card.Footer>
      </Card>

      {showEditModal && <EditInsuranceProviderModal show={showEditModal} provider={provider} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
      {showBulkUpdateModal && <BulkStudentInsuranceModal isOpen={showBulkUpdateModal} onClose={() => setShowBulkUpdateModal(false)} onUpdate={handleBulkUpdate} providerId={provider.id} providerName={provider.name} />}
    </>
  )
}

export default InsuranceProviderCard
