import React, { useState, useEffect } from "react"
import { FaMapMarkerAlt, FaUserCircle, FaClipboardList, FaInfoCircle, FaEdit, FaStar } from "react-icons/fa"
import { getStatusColor, getPriorityColor } from "../../utils/adminUtils"
import Modal from "../common/Modal"
import { getMediaUrl } from "../../utils/mediaUtils"
import { useAuth } from "../../contexts/AuthProvider"
import UpdateComplaintModal from "./UpdateComplaintModal"
import { getStudentId } from "../../services/studentService"
import StudentDetailModal from "../common/students/StudentDetailModal"
import FeedbackModal from "./FeedbackModal"

const ComplaintDetailModal = ({ selectedComplaint, setShowDetailModal, onComplaintUpdate }) => {
  const { user } = useAuth()
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [complaintData, setComplaintData] = useState(selectedComplaint)
  const [studentId, setStudentId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  if (!complaintData) return null

  // Check if user has permission to update complaints
  const canUpdateComplaint = user && ["Maintenance Staff", "Warden", "Associate Warden", "Admin", "Hostel Supervisor", "Super Admin"].includes(user.role)

  const handleComplaintUpdate = (updatedComplaint) => {
    setComplaintData(updatedComplaint)
    if (onComplaintUpdate) {
      onComplaintUpdate(updatedComplaint)
    }
  }

  const handleStudentUpdate = () => {
    setShowStudentDetailModal(false)
  }

  const handleReporterClick = () => {
    if (complaintData.reportedBy.role !== "Student") return
    setShowStudentDetailModal(true)
  }

  useEffect(() => {
    const fetchStudentId = async () => {
      if (complaintData.reportedBy.role !== "Student") return
      const studentId = await getStudentId(complaintData.reportedBy.id)
      setStudentId(studentId)
    }
    fetchStudentId()
  }, [complaintData.reportedBy.id])

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

              {user && user._id === complaintData.reportedBy.id && (
                <button onClick={() => setShowFeedbackModal(true)} className="flex items-center text-sm text-green-600 hover:text-green-800 transition-colors px-3 py-1 border border-green-200 rounded-full hover:bg-green-50">
                  <FaStar className="mr-1" /> Give Feedback
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

            <div onClick={() => handleReporterClick()} className="bg-gray-50 p-5 rounded-xl cursor-pointer">
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

          {complaintData.feedback && (
            <div>
              <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-3">
                <FaStar className="mr-2" /> User Feedback
              </h4>
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`text-sm ${i < complaintData.feedbackRating ? "text-yellow-400" : "text-gray-300"}`} />
                      ))}
                      <span className="ml-2 text-gray-700">({complaintData.feedbackRating}/5)</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Satisfaction:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${complaintData.satisfactionStatus === "Satisfied" ? "bg-green-100 text-green-800" : complaintData.satisfactionStatus === "Unsatisfied" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {complaintData.satisfactionStatus}
                    </span>
                  </div>
                  {complaintData.feedback && (
                    <div>
                      <span className="text-gray-600 block mb-1">Comments:</span>
                      <div className="text-gray-700">{complaintData.feedback}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div>Created: {new Date(complaintData.createdDate).toLocaleString()}</div>
            {complaintData.lastUpdated !== complaintData.createdDate && <div>Last Updated: {new Date(complaintData.lastUpdated).toLocaleString()}</div>}
          </div>
        </div>
      </Modal>

      {showUpdateModal && <UpdateComplaintModal complaint={complaintData} onClose={() => setShowUpdateModal(false)} onUpdate={handleComplaintUpdate} />}
      {showStudentDetailModal && studentId && <StudentDetailModal selectedStudent={{ _id: studentId, userId: complaintData.reportedBy.id }} setShowStudentDetail={setShowStudentDetailModal} onUpdate={handleStudentUpdate} />}
      {showFeedbackModal && <FeedbackModal complaint={complaintData} onClose={() => setShowFeedbackModal(false)} onFeedback={() => {}} />}
    </>
  )
}

export default ComplaintDetailModal
