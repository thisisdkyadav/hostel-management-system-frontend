import React, { useState, useEffect } from "react"
import { FaMapMarkerAlt, FaUserCircle, FaClipboardList, FaInfoCircle, FaEdit, FaStar } from "react-icons/fa"
import { getStatusColor, getPriorityColor } from "../../utils/adminUtils"
import Modal from "../common/Modal"
import Button from "../common/Button"
import { getMediaUrl } from "../../utils/mediaUtils"
import { useAuth } from "../../contexts/AuthProvider"
import UpdateComplaintModal from "./UpdateComplaintModal"
import { studentApi } from "../../service"
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
      const studentId = await studentApi.getStudentId(complaintData.reportedBy.id)
      setStudentId(studentId)
    }
    fetchStudentId()
  }, [complaintData.reportedBy.id])

  const getSatisfactionStatusStyle = (status) => {
    switch (status) {
      case "Satisfied":
        return {
          backgroundColor: "var(--color-success-bg)",
          color: "var(--color-success-text)",
        }
      case "Unsatisfied":
        return {
          backgroundColor: "var(--color-danger-bg)",
          color: "var(--color-danger-text)",
        }
      default:
        return {
          backgroundColor: "var(--color-warning-bg)",
          color: "var(--color-warning-text)",
        }
    }
  }

  return (
    <>
      <Modal title="Complaint Details" onClose={() => setShowDetailModal(false)} width={800}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "var(--spacing-3)", borderBottom: `var(--border-1) solid var(--color-border-light)`, }} className="sm:flex-row sm:items-center" >
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", }} >
                {complaintData.id}
              </span>
              <h2 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", }} >
                {complaintData.title}
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", marginTop: "var(--spacing-3)", }} className="sm:mt-0" >
              <span className={`${getStatusColor(complaintData.status)}`} style={{ paddingTop: "var(--spacing-1)", paddingBottom: "var(--spacing-1)", paddingLeft: "var(--spacing-3)", paddingRight: "var(--spacing-3)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", }} >
                {complaintData.status}
              </span>
              <span className={`${getPriorityColor(complaintData.priority)}`} style={{ paddingTop: "var(--spacing-1)", paddingBottom: "var(--spacing-1)", paddingLeft: "var(--spacing-3)", paddingRight: "var(--spacing-3)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", }} >
                {complaintData.priority}
              </span>
              <span style={{ paddingTop: "var(--spacing-1)", paddingBottom: "var(--spacing-1)", paddingLeft: "var(--spacing-3)", paddingRight: "var(--spacing-3)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-body)", }} >
                {complaintData.category}
              </span>

              {canUpdateComplaint && (
                <Button onClick={() => setShowUpdateModal(true)} variant="outline" size="small" icon={<FaEdit />}>
                  Update Status & Notes
                </Button>
              )}

              {user && user._id === complaintData.reportedBy.id && (
                <Button onClick={() => setShowFeedbackModal(true)} variant="success" size="small" icon={<FaStar />}>
                  Give Feedback
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-6)" }}>
            <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", }} >
              <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)", display: "flex", alignItems: "center", marginBottom: "var(--spacing-4)", }} >
                <FaMapMarkerAlt style={{ marginRight: "var(--spacing-2)" }} /> Location Details
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                {complaintData.hostel && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-tertiary)" }}>Hostel:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>{complaintData.hostel}</span>
                  </div>
                )}
                {complaintData.roomNumber && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-tertiary)" }}>Room Number:</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>{complaintData.roomNumber}</span>
                  </div>
                )}
                {complaintData.location && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="break-words">{complaintData.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div onClick={() => handleReporterClick()}
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                padding: "var(--spacing-5)",
                borderRadius: "var(--radius-xl)",
                cursor: "pointer",
              }}
            >
              <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)", display: "flex", alignItems: "center", marginBottom: "var(--spacing-4)", }} >
                <FaUserCircle style={{ marginRight: "var(--spacing-2)" }} /> Reported By
              </h4>
              <div style={{ display: "flex", alignItems: "center" }}>
                {complaintData.reportedBy?.profileImage ? (
                  <img src={getMediaUrl(complaintData.reportedBy.profileImage)} alt={complaintData.reportedBy.name} style={{ height: "var(--avatar-lg)", width: "var(--avatar-lg)", borderRadius: "var(--radius-full)", objectFit: "cover", marginRight: "var(--spacing-4)", }} />
                ) : (
                  <div style={{ height: "var(--avatar-lg)", width: "var(--avatar-lg)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", fontWeight: "var(--font-weight-medium)", marginRight: "var(--spacing-4)", }} >
                    {complaintData.reportedBy?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: "var(--font-weight-medium)" }}>{complaintData.reportedBy?.name}</div>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", }} >
                    Email: {complaintData.reportedBy?.email}
                  </div>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", }} >
                    {complaintData.reportedBy?.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)", display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", }} >
              <FaClipboardList style={{ marginRight: "var(--spacing-2)" }} /> Description
            </h4>
            <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", color: "var(--color-text-body)", }} >
              {complaintData.description}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)", display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", }} >
              <FaInfoCircle style={{ marginRight: "var(--spacing-2)" }} /> Resolution Notes
            </h4>
            {complaintData.resolutionNotes ? (
              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", color: "var(--color-text-body)", }} >
                {complaintData.resolutionNotes}
              </div>
            ) : (
              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", color: "var(--color-text-muted)", fontStyle: "italic", }} >
                No resolution notes yet.
              </div>
            )}
          </div>

          {complaintData.feedbackRating && (
            <div>
              <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)", display: "flex", alignItems: "center", marginBottom: "var(--spacing-3)", }} >
                <FaStar style={{ marginRight: "var(--spacing-2)" }} /> User Feedback
              </h4>
              <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-5)", borderRadius: "var(--radius-xl)", }} >
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: "var(--color-text-tertiary)", marginRight: "var(--spacing-2)", }} >
                      Rating:
                    </span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} style={{ fontSize: "var(--font-size-sm)", color: i < complaintData.feedbackRating ? "var(--color-warning)" : "var(--color-border-primary)", }} />
                      ))}
                      <span style={{ marginLeft: "var(--spacing-2)", color: "var(--color-text-body)", }} >
                        ({complaintData.feedbackRating}/5)
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-tertiary)" }}>Satisfaction:</span>
                    <span style={{ ...getSatisfactionStatusStyle(complaintData.satisfactionStatus), padding: "var(--badge-padding-sm)", fontSize: "var(--badge-font-sm)", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", }} >
                      {complaintData.satisfactionStatus}
                    </span>
                  </div>
                  {complaintData.feedback && (
                    <div>
                      <span style={{ color: "var(--color-text-tertiary)", display: "block", marginBottom: "var(--spacing-1)", }} >
                        Comments:
                      </span>
                      <div style={{ color: "var(--color-text-body)" }}>{complaintData.feedback}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", paddingTop: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-light)`, }} >
            <div>Created: {new Date(complaintData.createdDate).toLocaleString()}</div>
            {complaintData.lastUpdated !== complaintData.createdDate && <div>Last Updated: {new Date(complaintData.lastUpdated).toLocaleString()}</div>}
          </div>
        </div>
      </Modal>

      {showUpdateModal && <UpdateComplaintModal complaint={complaintData} onClose={() => setShowUpdateModal(false)} onUpdate={handleComplaintUpdate} />}
      {showStudentDetailModal && studentId && <StudentDetailModal selectedStudent={{ _id: studentId, userId: complaintData.reportedBy.id }} setShowStudentDetail={setShowStudentDetailModal} onUpdate={handleStudentUpdate} />}
      {showFeedbackModal && <FeedbackModal complaint={complaintData} onClose={() => setShowFeedbackModal(false)} onFeedback={() => { }} />}
    </>
  )
}

export default ComplaintDetailModal
