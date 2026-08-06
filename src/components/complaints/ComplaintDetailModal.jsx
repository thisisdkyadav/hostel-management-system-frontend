import React, { useState, useEffect } from "react"
import { MapPin, User, ClipboardList, FileText, Pencil, Star, CheckCircle, CalendarDays, MessageSquare } from "lucide-react"
import { getStatusColor } from "../../utils/adminUtils"
import { Badge, Divider, Heading, HStack, IconCircle, Surface, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { Modal } from "@/components/ui"
import { getMediaUrl } from "../../utils/mediaUtils"
import { useAuth } from "../../contexts/AuthProvider"
import UpdateComplaintModal from "./UpdateComplaintModal"
import { studentApi } from "../../service"
import StudentDetailModal from "../common/students/StudentDetailModal"
import FeedbackModal from "./FeedbackModal"
import useAuthz from "../../hooks/useAuthz"

const ComplaintDetailModal = ({ selectedComplaint, setShowDetailModal, onComplaintUpdate }) => {
  const { user } = useAuth()
  const { canAny } = useAuthz()
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [complaintData, setComplaintData] = useState(selectedComplaint)
  const [studentId, setStudentId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  if (!complaintData) return null

  const isResolved = complaintData.status === "Resolved"
  const canUpdateComplaint =
    user &&
    ["Maintenance Staff", "Warden", "Associate Warden", "Admin", "Hostel Supervisor", "Super Admin"].includes(user.role) &&
    true

  const canViewReporterProfile =
    user &&
    ["Admin", "Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) &&
    true

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
    if (complaintData.reportedBy.role !== "Student" || !canViewReporterProfile) return
    setShowStudentDetailModal(true)
  }

  useEffect(() => {
    const fetchStudentId = async () => {
      if (complaintData.reportedBy.role !== "Student" || !canViewReporterProfile) return
      const studentId = await studentApi.getStudentId(complaintData.reportedBy.id)
      setStudentId(studentId)
    }
    fetchStudentId()
  }, [canViewReporterProfile, complaintData.reportedBy.id, complaintData.reportedBy.role])

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
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: "var(--spacing-2)" }}>
        <HStack gap={2} align="center">
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
          <Heading as="h4" size="xs" weight="semibold" color={accentColor} style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {title}
          </Heading>
        </HStack>
        {headerAction}
      </HStack>
      {children}
    </div>
  )

  // Info Row Component
  const InfoRow = ({ label, value, fullWidth = false }) => (
    <HStack gap={3} align="center" justify={fullWidth ? "flex-start" : "space-between"}>
      <Text as="span" color="muted" size="sm">{label}</Text>
      {!fullWidth && <Text as="span" weight="medium" color="body">{value}</Text>}
    </HStack>
  )

  // Person Card Component
  const PersonCard = ({ person, label, accentBg = "var(--color-primary-bg)", accentText = "var(--color-primary)" }) => (
    <HStack gap={3} align="center">
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
        <IconCircle size="40px" bg={accentBg} color={accentText} style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
          {person?.name?.charAt(0) || "?"}
        </IconCircle>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text as="div" weight="medium" color="primary" style={{ marginBottom: "2px" }}>
          {person?.name}
        </Text>
        <Text as="div" size="xs" color="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {person?.email}
        </Text>
        {person?.phone && (
          <Text as="div" size="xs" color="muted">
            {person.phone}
          </Text>
        )}
      </div>
    </HStack>
  )

  // Star Rating Component
  const StarRating = ({ rating }) => (
    <HStack gap="2px" align="center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? "var(--color-warning)" : "transparent"}
          stroke={i < rating ? "var(--color-warning)" : "var(--color-border-primary)"}
          strokeWidth={1.5}
        />
      ))}
      <Text as="span" color="body" size="sm" weight="medium" style={{ marginLeft: "var(--spacing-2)" }}>
        {rating}/5
      </Text>
    </HStack>
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
        <VStack gap={4}>

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
            <HStack gap={2} align="center" wrap>
              <Text as="span" size="xs" color="muted" style={{ fontFamily: "monospace", padding: "var(--spacing-0-5) var(--spacing-2)", background: "var(--color-bg-muted)", borderRadius: "var(--radius-sm)" }}>
                {complaintData.id}
              </Text>
              <Text as="span" size="xs" weight="semibold" style={{ padding: "var(--spacing-0-5) var(--spacing-2)", borderRadius: "var(--radius-full)" }} className={getStatusColor(complaintData.status)}>
                {complaintData.status}
              </Text>
              <Surface as="span" bg="brand" padding="var(--spacing-0-5) var(--spacing-2)" radius="full" color="brand" size="xs" weight="medium">
                {complaintData.category}
              </Surface>
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
            </HStack>

            {/* Right - Action Buttons */}
            <HStack gap={2}>
              {canUpdateComplaint && (
                <Button onClick={() => setShowUpdateModal(true)} variant="outline" size="sm">
                  <Pencil size={14} />
                  Update
                </Button>
              )}
              {user?.role === "Student" && user._id === complaintData.reportedBy.id && complaintData.status === "Resolved" && !complaintData.feedbackRating && (
                <Button onClick={() => setShowFeedbackModal(true)} variant="success" size="sm">
                  <Star size={14} />
                  Feedback
                </Button>
              )}
            </HStack>
          </div>

          {/* Resolution Section - Shown first when resolved */}
          {isResolved && (complaintData.feedbackRating || complaintData.resolvedBy) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
                {/* User Feedback Card */}
                {complaintData.feedbackRating && (
                  <SectionCard icon={MessageSquare} title="User Feedback" accentColor="var(--color-warning)">
                    <VStack gap="small">
                      <HStack gap={2} align="center" justify="between" wrap>
                        <StarRating rating={complaintData.feedbackRating} />
                        <Badge variant={getSatisfactionVariant(complaintData.satisfactionStatus)} size="small">
                          {complaintData.satisfactionStatus}
                        </Badge>
                      </HStack>
                      {complaintData.feedback && (
                        <Text as="div" size="sm" color="body" style={{ marginTop: "var(--spacing-2)", padding: "var(--spacing-2) var(--spacing-3)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--color-warning)", fontStyle: "italic" }}>
                          "{complaintData.feedback}"
                        </Text>
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
                      <HStack align="center" gap="var(--spacing-1-5)" size="xs" color="success-text" style={{ marginTop: "var(--spacing-2)", padding: "var(--spacing-1) var(--spacing-2)", background: "var(--color-success-bg)", borderRadius: "var(--radius-sm)" }}>
                        <CheckCircle size={11} />
                        <span>Resolved on {formatDate(complaintData.resolutionDate)}</span>
                      </HStack>
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
                  <Text as="div" size="sm" color="body" style={{ marginTop: "var(--spacing-1)", padding: "var(--spacing-2)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                    {complaintData.location}
                  </Text>
                )}
              </VStack>
            </SectionCard>

            {/* Reported By */}
            <SectionCard
              icon={User}
              title="Reported By"
              accentColor="var(--color-primary)"
              onClick={complaintData.reportedBy.role === "Student" && canViewReporterProfile ? handleReporterClick : undefined}
              headerAction={complaintData.reportedBy.role === "Student" && canViewReporterProfile ? (
                <Text as="span" size="xs" color="brand" style={{ opacity: 0.8 }}>
                  View profile →
                </Text>
              ) : null}
            >
              <PersonCard person={complaintData.reportedBy} />
            </SectionCard>
          </div>

          {/* Description Section */}
          <SectionCard icon={ClipboardList} title="Description" accentColor="var(--color-text-tertiary)">
            <Text as="div" color="body" size="base" leading="1.6" style={{ whiteSpace: "pre-wrap" }}>
              {complaintData.description}
            </Text>
          </SectionCard>

          {/* Resolution Notes Section */}
          <SectionCard icon={FileText} title="Resolution Notes" accentColor="var(--color-success)">
            {complaintData.resolutionNotes ? (
              <Text as="div" color="body" size="base" leading="1.6" style={{ whiteSpace: "pre-wrap" }}>
                {complaintData.resolutionNotes}
              </Text>
            ) : (
              <Text as="div" color="muted" size="sm" style={{ fontStyle: "italic" }}>
                No resolution notes added yet
              </Text>
            )}
          </SectionCard>

          {/* Non-resolved state: Show feedback and resolved by at bottom if they exist */}
          {!isResolved && complaintData.feedbackRating && (
            <SectionCard icon={MessageSquare} title="User Feedback" accentColor="var(--color-warning)">
              <VStack gap="small">
                <HStack gap={2} align="center" justify="between" wrap>
                  <StarRating rating={complaintData.feedbackRating} />
                  <Badge variant={getSatisfactionVariant(complaintData.satisfactionStatus)} size="small">
                    {complaintData.satisfactionStatus}
                  </Badge>
                </HStack>
                {complaintData.feedback && (
                  <Text as="div" size="sm" color="body" style={{ marginTop: "var(--spacing-2)", padding: "var(--spacing-2) var(--spacing-3)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--color-warning)", fontStyle: "italic" }}>
                    "{complaintData.feedback}"
                  </Text>
                )}
              </VStack>
            </SectionCard>
          )}
        </VStack>
      </Modal>

      {showUpdateModal && <UpdateComplaintModal complaint={complaintData} onClose={() => setShowUpdateModal(false)} onUpdate={handleComplaintUpdate} />}
      {showStudentDetailModal && studentId && <StudentDetailModal selectedStudent={{ _id: studentId, userId: complaintData.reportedBy.id }} setShowStudentDetail={setShowStudentDetailModal} onUpdate={handleStudentUpdate} />}
      {showFeedbackModal && <FeedbackModal complaint={complaintData} onClose={() => setShowFeedbackModal(false)} onFeedback={() => { }} />}
    </>
  )
}

export default ComplaintDetailModal
