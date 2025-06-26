import React, { useState } from "react"
import { FaMapMarkerAlt, FaUserCircle, FaClipboardList, FaInfoCircle, FaEdit } from "react-icons/fa"
import { getStatusColor, getPriorityColor } from "../../utils/adminUtils"
import Modal from "../common/Modal"
import { getMediaUrl } from "../../utils/mediaUtils"
import { useAuth } from "../../contexts/AuthProvider"
import UpdateComplaintModal from "./UpdateComplaintModal"

const ComplaintDetailModal = ({ selectedComplaint, setShowDetailModal, onComplaintUpdate }) => {
  const { user } = useAuth()
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [complaintData, setComplaintData] = useState(selectedComplaint)

  if (!complaintData) return null

  // Check if user has permission to update complaints
  const canUpdateComplaint = user && ["Maintenance Staff", "Warden", "Associate Warden", "Admin", "Hostel Supervisor", "Super Admin"].includes(user.role)

  const handleComplaintUpdate = (updatedComplaint) => {
    setComplaintData(updatedComplaint)
    if (onComplaintUpdate) {
      onComplaintUpdate(updatedComplaint)
    }
  }

  return (
    <>
      <Modal title="Complaint Details" onClose={() => setShowDetailModal(false)} width={800}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-500">{complaintData.id}</span>
              <h2 className="text-xl font-bold text-gray-800">{complaintData.title}</h2>
            </div>

            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(complaintData.status)}`}>{complaintData.status}</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(complaintData.priority)}`}>{complaintData.priority}</span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">{complaintData.category}</span>

              {canUpdateComplaint && (
                <button onClick={() => setShowUpdateModal(true)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 border border-blue-200 rounded-full hover:bg-blue-50">
                  <FaEdit className="mr-1" /> Update Status & Notes
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-xl">
              <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-4">
                <FaMapMarkerAlt className="mr-2" /> Location Details
              </h4>
              <div className="space-y-3">
                {complaintData.hostel && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hostel:</span>
                    <span className="font-medium">{complaintData.hostel}</span>
                  </div>
                )}
                {complaintData.roomNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Number:</span>
                    <span className="font-medium">{complaintData.roomNumber}</span>
                  </div>
                )}
                {complaintData.location && (
                  <div className="flex justify-between">
                    <span className="break-words">{complaintData.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl">
              <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-4">
                <FaUserCircle className="mr-2" /> Reported By
              </h4>
              <div className="flex items-center">
                {complaintData.reportedBy?.profileImage ? (
                  <img src={getMediaUrl(complaintData.reportedBy.profileImage)} alt={complaintData.reportedBy.name} className="h-12 w-12 rounded-full object-cover mr-4" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium mr-4">{complaintData.reportedBy?.name?.charAt(0) || "U"}</div>
                )}
                <div>
                  <div className="font-medium">{complaintData.reportedBy?.name}</div>
                  <div className="text-sm text-gray-500">Email: {complaintData.reportedBy?.email}</div>
                  <div className="text-sm text-gray-500">{complaintData.reportedBy?.phone}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-3">
              <FaClipboardList className="mr-2" /> Description
            </h4>
            <div className="bg-gray-50 p-5 rounded-xl text-gray-700">{complaintData.description}</div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-3">
              <FaInfoCircle className="mr-2" /> Resolution Notes
            </h4>
            {complaintData.resolutionNotes ? <div className="bg-gray-50 p-5 rounded-xl text-gray-700">{complaintData.resolutionNotes}</div> : <div className="bg-gray-50 p-5 rounded-xl text-gray-500 italic">No resolution notes yet.</div>}
          </div>

          <div className="flex flex-wrap justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div>Created: {new Date(complaintData.createdDate).toLocaleString()}</div>
            {complaintData.lastUpdated !== complaintData.createdDate && <div>Last Updated: {new Date(complaintData.lastUpdated).toLocaleString()}</div>}
          </div>
        </div>
      </Modal>

      {showUpdateModal && <UpdateComplaintModal complaint={complaintData} onClose={() => setShowUpdateModal(false)} onUpdate={handleComplaintUpdate} />}
    </>
  )
}

export default ComplaintDetailModal
