import React, { useState, useEffect } from "react"
import { MapPin, User, ClipboardList, FileText, Pencil, Star, CheckCircle, CalendarDays, MessageSquare } from "lucide-react"
import { getStatusColor } from "../../utils/adminUtils"
import { Modal, Button, Badge, HStack, VStack, Divider } from "@/components/ui"
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

  const isResolved = complaintData.status === "Resolved"
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

  const getSatisfactionVariant = (status) => {
    switch (status) {
      case "Satisfied": return "success"
      case "Unsatisfied": return "danger"
      default: return "warning"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Section Card Component for consistent styling
  const SectionCard = ({ icon: Icon, title, children, accentColor = "var(--color-primary)", onClick, headerAction, className = "" }) => (
    <div
      onClick={onClick}
      style={{
        background: "var(--color-bg-tertiary)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-3) var(--spacing-4)",
        border: "1px solid var(--color-border-light)",
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
      }}
      className={className}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = "var(--color-border-hover)"
          e.currentTarget.style.transform = "translateY(-1px)"
          e.currentTarget.style.boxShadow = "var(--shadow-sm)"
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = "var(--color-border-light)"
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "none"
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "var(--radius-sm)",
            background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}25)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Icon size={13} style={{ color: accentColor }} />
          </div>
          <h4 style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            color: accentColor,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {title}
          </h4>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  )

  // Info Row Component
  const InfoRow = ({ label, value, fullWidth = false }) => (
    <div style={{
      display: "flex",
      justifyContent: fullWidth ? "flex-start" : "space-between",
      alignItems: "center",
      gap: "var(--spacing-3)"
    }}>
      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{label}</span>
      {!fullWidth && <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)" }}>{value}</span>}
    </div>
  )

  // Person Card Component
  const PersonCard = ({ person, label, accentBg = "var(--color-primary-bg)", accentText = "var(--color-primary)" }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
      {person?.profileImage ? (
        <img
          src={getMediaUrl(person.profileImage)}
          alt={person.name}
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "var(--radius-full)",
            objectFit: "cover",
            border: `2px solid ${accentBg}`
          }}
        />
      ) : (
        <div style={{
          height: "40px",
          width: "40px",
          borderRadius: "var(--radius-full)",
          backgroundColor: accentBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accentText,
          fontWeight: "var(--font-weight-semibold)",
          fontSize: "var(--font-size-base)"
        }}>
          {person?.name?.charAt(0) || "?"}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: "var(--font-weight-medium)",
          color: "var(--color-text-primary)",
          marginBottom: "2px"
        }}>
          {person?.name}
        </div>
        <div style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {person?.email}
        </div>
        {person?.phone && (
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {person.phone}
          </div>
        )}
      </div>
    </div>
  )

  // Star Rating Component
  const StarRating = ({ rating }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? "var(--color-warning)" : "transparent"}
          stroke={i < rating ? "var(--color-warning)" : "var(--color-border-primary)"}
          strokeWidth={1.5}
        />
      ))}
      <span style={{
        marginLeft: "var(--spacing-2)",
        color: "var(--color-text-body)",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)"
      }}>
        {rating}/5
      </span>
    </div>
  )

  // Custom title with truncation and hover tooltip
  const modalTitle = (
    <span
      title={complaintData.title}
      style={{
        display: "block",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }}
    >
      {complaintData.title}
    </span>
  )

  return (
    <>
      <Modal
        title={modalTitle}
        onClose={() => setShowDetailModal(false)}
        width={800}
        closeButtonVariant="button"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>

          {/* Compact Info Bar - ID, Status, Category, Filed Date, Actions */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--spacing-2)",
            flexWrap: "wrap",
            paddingBottom: "var(--spacing-3)",
            borderBottom: "1px solid var(--color-border-light)"
          }}>
            {/* Left - Metadata */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                fontFamily: "monospace",
                padding: "var(--spacing-0-5) var(--spacing-2)",
                background: "var(--color-bg-muted)",
                borderRadius: "var(--radius-sm)"
              }}>
                {complaintData.id}
              </span>
              <span
                className={getStatusColor(complaintData.status)}
                style={{
                  padding: "var(--spacing-0-5) var(--spacing-2)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                  borderRadius: "var(--radius-full)"
                }}
              >
                {complaintData.status}
              </span>
              <span style={{
                padding: "var(--spacing-0-5) var(--spacing-2)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary-bg)",
                color: "var(--color-primary)"
              }}>
                {complaintData.category}
              </span>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--spacing-1)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)"
              }}>
                <CalendarDays size={11} />
                {formatDate(complaintData.createdDate)}
              </span>
            </div>

            {/* Right - Action Buttons */}
            <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
              {canUpdateComplaint && (
                <Button onClick={() => setShowUpdateModal(true)} variant="outline" size="small" icon={<Pencil size={14} />}>
                  Update
                </Button>
              )}
              {user?.role === "Student" && user._id === complaintData.reportedBy.id && complaintData.status === "Resolved" && !complaintData.feedbackRating && (
                <Button onClick={() => setShowFeedbackModal(true)} variant="success" size="small" icon={<Star size={14} />}>
                  Feedback
                </Button>
              )}
            </div>
          </div>

          {/* Resolution Section - Shown first when resolved */}
          {isResolved && (complaintData.feedbackRating || complaintData.resolvedBy) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
                {/* User Feedback Card */}
                {complaintData.feedbackRating && (
                  <SectionCard icon={MessageSquare} title="User Feedback" accentColor="var(--color-warning)">
                    <VStack gap="small">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                        <StarRating rating={complaintData.feedbackRating} />
                        <Badge variant={getSatisfactionVariant(complaintData.satisfactionStatus)} size="small">
                          {complaintData.satisfactionStatus}
                        </Badge>
                      </div>
                      {complaintData.feedback && (
                        <div style={{
                          marginTop: "var(--spacing-2)",
                          padding: "var(--spacing-2) var(--spacing-3)",
                          background: "var(--color-bg-secondary)",
                          borderRadius: "var(--radius-sm)",
                          borderLeft: "2px solid var(--color-warning)",
                          fontSize: "var(--font-size-sm)",
                          color: "var(--color-text-body)",
                          fontStyle: "italic"
                        }}>
                          "{complaintData.feedback}"
                        </div>
                      )}
                    </VStack>
                  </SectionCard>
                )}

                {/* Resolved By Card */}
                {complaintData.resolvedBy && (
                  <SectionCard icon={CheckCircle} title="Resolved By" accentColor="var(--color-success)">
                    <PersonCard
                      person={complaintData.resolvedBy}
                      accentBg="var(--color-success-bg)"
                      accentText="var(--color-success-text)"
                    />
                    {complaintData.resolutionDate && (
                      <div style={{
                        marginTop: "var(--spacing-2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--spacing-1-5)",
                        padding: "var(--spacing-1) var(--spacing-2)",
                        background: "var(--color-success-bg)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-success-text)"
                      }}>
                        <CheckCircle size={11} />
                        <span>Resolved on {formatDate(complaintData.resolutionDate)}</span>
                      </div>
                    )}
                  </SectionCard>
                )}
              </div>

              <Divider spacing="sm" color="muted" />
            </>
          )}

          {/* Location & Reporter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
            {/* Location Details */}
            <SectionCard icon={MapPin} title="Location Details" accentColor="var(--color-info)">
              <VStack gap="small">
                {complaintData.hostel && <InfoRow label="Hostel" value={complaintData.hostel} />}
                {complaintData.roomNumber && <InfoRow label="Room" value={complaintData.roomNumber} />}
                {complaintData.location && (
                  <div style={{
                    marginTop: "var(--spacing-1)",
                    padding: "var(--spacing-2)",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-body)"
                  }}>
                    {complaintData.location}
                  </div>
                )}
              </VStack>
            </SectionCard>

            {/* Reported By */}
            <SectionCard
              icon={User}
              title="Reported By"
              accentColor="var(--color-primary)"
              onClick={complaintData.reportedBy.role === "Student" && canUpdateComplaint ? handleReporterClick : undefined}
              headerAction={complaintData.reportedBy.role === "Student" && canUpdateComplaint ? (
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary)", opacity: 0.8 }}>
                  View profile →
                </span>
              ) : null}
            >
              <PersonCard person={complaintData.reportedBy} />
            </SectionCard>
          </div>

          {/* Description Section */}
          <SectionCard icon={ClipboardList} title="Description" accentColor="var(--color-text-tertiary)">
            <div style={{
              color: "var(--color-text-body)",
              fontSize: "var(--font-size-base)",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap"
            }}>
              {complaintData.description}
            </div>
          </SectionCard>

          {/* Resolution Notes Section */}
          <SectionCard icon={FileText} title="Resolution Notes" accentColor="var(--color-success)">
            {complaintData.resolutionNotes ? (
              <div style={{
                color: "var(--color-text-body)",
                fontSize: "var(--font-size-base)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}>
                {complaintData.resolutionNotes}
              </div>
            ) : (
              <div style={{
                color: "var(--color-text-muted)",
                fontSize: "var(--font-size-sm)",
                fontStyle: "italic"
              }}>
                No resolution notes added yet
              </div>
            )}
          </SectionCard>

          {/* Non-resolved state: Show feedback and resolved by at bottom if they exist */}
          {!isResolved && complaintData.feedbackRating && (
            <SectionCard icon={MessageSquare} title="User Feedback" accentColor="var(--color-warning)">
              <VStack gap="small">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                  <StarRating rating={complaintData.feedbackRating} />
                  <Badge variant={getSatisfactionVariant(complaintData.satisfactionStatus)} size="small">
                    {complaintData.satisfactionStatus}
                  </Badge>
                </div>
                {complaintData.feedback && (
                  <div style={{
                    marginTop: "var(--spacing-2)",
                    padding: "var(--spacing-2) var(--spacing-3)",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    borderLeft: "2px solid var(--color-warning)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-body)",
                    fontStyle: "italic"
                  }}>
                    "{complaintData.feedback}"
                  </div>
                )}
              </VStack>
            </SectionCard>
          )}
        </div>
      </Modal>

      {showUpdateModal && <UpdateComplaintModal complaint={complaintData} onClose={() => setShowUpdateModal(false)} onUpdate={handleComplaintUpdate} />}
      {showStudentDetailModal && studentId && <StudentDetailModal selectedStudent={{ _id: studentId, userId: complaintData.reportedBy.id }} setShowStudentDetail={setShowStudentDetailModal} onUpdate={handleStudentUpdate} />}
      {showFeedbackModal && <FeedbackModal complaint={complaintData} onClose={() => setShowFeedbackModal(false)} onFeedback={() => { }} />}
    </>
  )
}

export default ComplaintDetailModal
