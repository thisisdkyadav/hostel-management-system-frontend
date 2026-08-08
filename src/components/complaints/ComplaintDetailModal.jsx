import { useState, useEffect } from "react"
import { CalendarDays, CheckCircle, ClipboardList, FileText, MapPin, MessageSquare, Pencil, Star, User } from "lucide-react"
import { Avatar, Badge, Button, DetailSection, Divider, EmptyState, Grid, HStack, InfoRow, Modal, Text, VStack } from "hzero"
import { getMediaUrl } from "../../utils/mediaUtils"
import { useAuth } from "../../contexts/AuthProvider"
import UpdateComplaintModal from "./UpdateComplaintModal"
import { studentApi } from "../../service"
import StudentDetailModal from "../common/students/StudentDetailModal"
import FeedbackModal from "./FeedbackModal"

// The statuses this modal can show, keeping the meaning the old Tailwind
// palette carried: pending reads as new, in progress as waiting, forwarded as
// handed on, resolved as done, closed as filed away.
const STATUS_VARIANT = {
  Pending: "info",
  "In Progress": "warning",
  "Forwarded to IDO": "purple",
  Resolved: "success",
  Closed: "default",
}

const satisfactionVariant = (status) => {
  switch (status) {
    case "Satisfied": return "success"
    case "Unsatisfied": return "danger"
    default: return "warning"
  }
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

const StarRating = ({ rating }) => (
  <HStack gap="var(--spacing-0-5)" align="center">
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

const Person = ({ person }) => (
  <HStack gap={3} align="center">
    <Avatar
      src={person?.profileImage ? getMediaUrl(person.profileImage) : undefined}
      name={person?.name || "?"}
      alt={person?.name || ""}
      size="medium"
    />
    <VStack gap="none" style={{ flex: 1, minWidth: 0 }}>
      <Text as="div" weight="medium" color="primary" truncate>{person?.name}</Text>
      {person?.email && <Text as="div" size="xs" color="muted" truncate>{person.email}</Text>}
      {person?.phone && <Text as="div" size="xs" color="muted">{person.phone}</Text>}
    </VStack>
  </HStack>
)

const ComplaintDetailModal = ({ selectedComplaint, setShowDetailModal, onComplaintUpdate }) => {
  const { user } = useAuth()
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [complaintData, setComplaintData] = useState(selectedComplaint)
  const [studentId, setStudentId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  const isResolved = complaintData?.status === "Resolved"
  const canUpdateComplaint =
    user &&
    ["Maintenance Staff", "Warden", "Associate Warden", "Admin", "Hostel Supervisor", "Super Admin"].includes(user.role)

  const canViewReporterProfile =
    user &&
    ["Admin", "Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role)

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
      if (complaintData?.reportedBy?.role !== "Student" || !canViewReporterProfile) return
      const studentId = await studentApi.getStudentId(complaintData.reportedBy.id)
      setStudentId(studentId)
    }
    fetchStudentId()
  }, [canViewReporterProfile, complaintData?.reportedBy?.id, complaintData?.reportedBy?.role])

  if (!complaintData) return null

  const canOpenReporterProfile = complaintData.reportedBy.role === "Student" && canViewReporterProfile

  // Rendered under the resolution summary when the complaint is closed out, and
  // at the foot of the modal when feedback arrived before it was.
  const feedbackSection = (
    <DetailSection title="User feedback" icon={MessageSquare} tone="warning">
      <HStack gap={2} align="center" justify="between" wrap>
        <StarRating rating={complaintData.feedbackRating} />
        <Badge variant={satisfactionVariant(complaintData.satisfactionStatus)} size="small">
          {complaintData.satisfactionStatus}
        </Badge>
      </HStack>
      {complaintData.feedback && (
        <Text as="div" size="sm" color="body" italic>“{complaintData.feedback}”</Text>
      )}
    </DetailSection>
  )

  const modalTitle = (
    <Text as="span" truncate title={complaintData.title} style={{ display: "block", maxWidth: "100%" }}>
      {complaintData.title}
    </Text>
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

          {/* Reference, status, category, filed date — and what you can do about it */}
          <HStack gap={2} align="center" justify="between" wrap>
            <HStack gap={2} align="center" wrap>
              <Badge variant="outline" size="small" style={{ fontFamily: "var(--font-family-mono)" }}>
                {complaintData.id}
              </Badge>
              <Badge variant={STATUS_VARIANT[complaintData.status] ?? "default"} size="small">
                {complaintData.status}
              </Badge>
              <Badge variant="primary" size="small">{complaintData.category}</Badge>
              <Badge variant="default" size="small" icon={<CalendarDays />}>
                {formatDate(complaintData.createdDate)}
              </Badge>
            </HStack>

            <HStack gap={2}>
              {canUpdateComplaint && (
                <Button onClick={() => setShowUpdateModal(true)} variant="secondary" size="sm">
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
          </HStack>

          <Divider spacing="none" color="muted" />

          {/* How it ended — shown first once the complaint is resolved */}
          {isResolved && (complaintData.feedbackRating || complaintData.resolvedBy) && (
            <>
              <Grid cols={{ base: 1, md: 2 }} gap={3} align="start">
                {complaintData.feedbackRating && feedbackSection}

                {complaintData.resolvedBy && (
                  <DetailSection title="Resolved by" icon={CheckCircle} tone="success">
                    <Person person={complaintData.resolvedBy} />
                    {complaintData.resolutionDate && (
                      <InfoRow label="Resolved on" value={formatDate(complaintData.resolutionDate)} />
                    )}
                  </DetailSection>
                )}
              </Grid>

              <Divider spacing="sm" color="muted" />
            </>
          )}

          <Grid cols={{ base: 1, md: 2 }} gap={3} align="start">
            <DetailSection title="Location" icon={MapPin} tone="info">
              {complaintData.hostel && <InfoRow label="Hostel" value={complaintData.hostel} />}
              {complaintData.roomNumber && <InfoRow label="Room" value={complaintData.roomNumber} />}
              {complaintData.location && <InfoRow label="Details" value={complaintData.location} />}
              {!complaintData.hostel && !complaintData.roomNumber && !complaintData.location && (
                <EmptyState variant="inline" message="No location was recorded." />
              )}
            </DetailSection>

            <DetailSection
              title="Reported by"
              icon={User}
              tone="primary"
              actions={canOpenReporterProfile ? (
                <Button type="button" variant="ghost" size="sm" onClick={handleReporterClick}>View profile</Button>
              ) : undefined}
            >
              <Person person={complaintData.reportedBy} />
            </DetailSection>
          </Grid>

          <DetailSection title="Description" icon={ClipboardList}>
            <Text as="div" color="body" size="base" leading="1.6" style={{ whiteSpace: "pre-wrap" }}>
              {complaintData.description}
            </Text>
          </DetailSection>

          <DetailSection title="Resolution notes" icon={FileText} tone="success">
            {complaintData.resolutionNotes ? (
              <Text as="div" color="body" size="base" leading="1.6" style={{ whiteSpace: "pre-wrap" }}>
                {complaintData.resolutionNotes}
              </Text>
            ) : (
              <EmptyState variant="inline" message="No resolution notes yet." />
            )}
          </DetailSection>

          {/* Feedback can arrive before the complaint is closed out */}
          {!isResolved && complaintData.feedbackRating && feedbackSection}
        </VStack>
      </Modal>

      {showUpdateModal && <UpdateComplaintModal complaint={complaintData} onClose={() => setShowUpdateModal(false)} onUpdate={handleComplaintUpdate} />}
      {showStudentDetailModal && studentId && <StudentDetailModal selectedStudent={{ _id: studentId, userId: complaintData.reportedBy.id }} setShowStudentDetail={setShowStudentDetailModal} onUpdate={handleStudentUpdate} />}
      {showFeedbackModal && <FeedbackModal complaint={complaintData} onClose={() => setShowFeedbackModal(false)} onFeedback={() => { }} />}
    </>
  )
}

export default ComplaintDetailModal
