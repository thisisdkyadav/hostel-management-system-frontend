import { useState } from "react"
import { FaBuilding, FaEnvelope, FaEdit, FaTrash } from "react-icons/fa"
import EditHostelGateModal from "./EditHostelGateModal"
import { hostelGateApi } from "../../../services/hostelGateApi"
import Card from "../../common/Card"

const HostelGateCard = ({ gate, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this hostel gate login?")) {
      try {
        setIsDeleting(true)
        await hostelGateApi.deleteHostelGate(gate.hostelId._id)
        alert("Hostel gate login deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting hostel gate login:", error)
        alert("Failed to delete hostel gate login. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
              <h3 className="font-semibold text-lg text-gray-800">{gate.userId?.name || "Unknown Hostel"}</h3>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setShowEditModal(true)} className="p-2 text-gray-500 hover:text-[#1360AB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit hostel gate login">
                <FaEdit />
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className={`p-2 ${isDeleting ? "text-gray-400" : "text-gray-500 hover:text-red-600 hover:bg-red-50"} rounded-lg transition-colors`} title="Delete hostel gate login">
                {isDeleting ? <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></span> : <FaTrash />}
              </button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="space-y-3 mt-4">
          <div className="flex items-start">
            <FaEnvelope className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
            <span className="text-gray-600 break-all">{gate.userId?.email}</span>
          </div>
          <div className="flex items-start">
            <div className="text-gray-400 mt-1 mr-3 flex-shrink-0">
              <span className="text-xs font-medium">Created</span>
            </div>
            <span className="text-gray-600">{formatDate(gate.createdAt)}</span>
          </div>
          <div className="flex items-start">
            <div className="text-gray-400 mt-1 mr-3 flex-shrink-0">
              <span className="text-xs font-medium">Updated</span>
            </div>
            <span className="text-gray-600">{formatDate(gate.updatedAt)}</span>
          </div>
        </Card.Body>
      </Card>

      {showEditModal && <EditHostelGateModal show={showEditModal} gate={gate} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
    </>
  )
}

export default HostelGateCard
