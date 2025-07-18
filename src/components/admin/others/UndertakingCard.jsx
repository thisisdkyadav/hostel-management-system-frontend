import { useState } from "react"
import { FaFileSignature, FaEdit, FaTrash, FaCalendarAlt, FaUsers, FaInfoCircle, FaClipboardCheck } from "react-icons/fa"
import EditUndertakingModal from "./EditUndertakingModal"
import ManageStudentsModal from "./ManageStudentsModal"
import ViewAcceptanceStatusModal from "./ViewAcceptanceStatusModal"
import { adminApi } from "../../../services/adminApi"

const UndertakingCard = ({ undertaking, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this undertaking?")) {
      try {
        setIsDeleting(true)
        await adminApi.deleteUndertaking(undertaking.id)
        alert("Undertaking deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting undertaking:", error)
        alert("Failed to delete undertaking. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Calculate acceptance percentage
  const acceptancePercentage = undertaking.acceptedCount && undertaking.totalStudents ? Math.round((undertaking.acceptedCount / undertaking.totalStudents) * 100) : 0

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FaFileSignature className="text-[#1360AB]" size={20} />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">{undertaking.title}</h3>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setShowEditModal(true)} className="p-2 text-gray-500 hover:text-[#1360AB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit undertaking">
              <FaEdit />
            </button>
            <button onClick={handleDelete} disabled={isDeleting} className={`p-2 ${isDeleting ? "text-gray-400" : "text-gray-500 hover:text-red-600 hover:bg-red-50"} rounded-lg transition-colors`} title="Delete undertaking">
              {isDeleting ? <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></span> : <FaTrash />}
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="text-gray-600">
            <p className="line-clamp-2">{undertaking.description}</p>
          </div>
          <div className="flex items-start">
            <FaCalendarAlt className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
            <div className="text-gray-600">
              <span>Deadline: {formatDate(undertaking.deadline)}</span>
            </div>
          </div>
          <div className="flex items-start">
            <FaUsers className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
            <div className="text-gray-600">
              <span>Students: {undertaking.totalStudents || 0}</span>
            </div>
          </div>

          {/* Acceptance progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Acceptance Status</span>
              <span>{acceptancePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${acceptancePercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
          <button onClick={() => setShowManageStudentsModal(true)} className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-[#1360AB] rounded-lg transition-colors flex items-center justify-center font-medium text-sm">
            <FaUsers className="mr-1" /> Manage Students
          </button>
          <button onClick={() => setShowStatusModal(true)} className="py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors flex items-center justify-center font-medium text-sm">
            <FaClipboardCheck className="mr-1" /> View Status
          </button>
        </div>
      </div>

      {showEditModal && <EditUndertakingModal show={showEditModal} undertaking={undertaking} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
      {showManageStudentsModal && <ManageStudentsModal show={showManageStudentsModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowManageStudentsModal(false)} onUpdate={onUpdate} />}
      {showStatusModal && <ViewAcceptanceStatusModal show={showStatusModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowStatusModal(false)} />}
    </>
  )
}

export default UndertakingCard
