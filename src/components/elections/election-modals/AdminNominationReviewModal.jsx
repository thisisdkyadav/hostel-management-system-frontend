import { useState } from "react"
import { CheckCircle2, FileText, MessageSquareText, User, Users, XCircle } from "lucide-react"
import { Avatar, Badge, Button, DetailSection, EmptyState, Field, Grid, HStack, InfoRow, Modal, Table, Text, Textarea, useConfirm, VStack } from "hzero"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
import { studentApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

/**
 * Defined at module level, not inside the modal's render: React would
 * otherwise see a new component type on every keystroke in the review textarea
 * and tear the candidate panel down each time.
 */
const StudentSummaryRow = ({ name, email, image, subtitle, onClick, loading = false }) => {
  const body = (
    <>
      <Avatar src={image ? getMediaUrl(image) : undefined} name={name || ""} size="large" />
      <span className="min-w-0 flex-1">
        <Text as="div" weight="semibold" color="heading" truncate>
          {name || "Unknown student"}
        </Text>
        {subtitle ? (
          <Text as="div" size="xs" color="muted" truncate>
            {subtitle}
          </Text>
        ) : null}
        {email ? (
          <Text as="div" size="xs" color="muted" truncate>
            {email}
          </Text>
        ) : null}
      </span>
      {loading ? (
        <Text as="span" size="xs" color="muted">
          Opening…
        </Text>
      ) : null}
    </>
  )

  if (!onClick) {
    return <div className="flex w-full items-center gap-[var(--spacing-3)]">{body}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-[var(--spacing-3)] text-left"
    >
      {body}
    </button>
  )
}

export const AdminNominationReviewModal = ({
  nomination,
  electionId,
  onClose,
  onReview,
  busy,
  getStatusTone,
  formatStageLabel,
  formatDateTime,
  readOnly = false,
}) => {
  const confirm = useConfirm()
  const [viewerUrl, setViewerUrl] = useState("")
  const [reviewNotes, setReviewNotes] = useState(nomination?.review?.notes || "")
  const [noteError, setNoteError] = useState("")
  const [studentDetailTarget, setStudentDetailTarget] = useState(null)
  const [openingStudentUserId, setOpeningStudentUserId] = useState("")
  const [reviewedNomination, setReviewedNomination] = useState(nomination)

  // A different nomination is a different record: its notes and any validation
  // message from the last one do not carry over. Adjusting during render rather
  // than in an effect avoids painting the previous nomination's notes first.
  if (nomination !== reviewedNomination) {
    setReviewedNomination(nomination)
    setReviewNotes(nomination?.review?.notes || "")
    setNoteError("")
  }

  if (!nomination) return null

  const proposerEntries = Array.isArray(nomination.proposerEntries) ? nomination.proposerEntries : []
  const seconderEntries = Array.isArray(nomination.seconderEntries) ? nomination.seconderEntries : []
  const pendingSupporterCount = [...proposerEntries, ...seconderEntries].filter(
    (entry) => entry?.status === "pending"
  ).length
  const rejectedSupporterCount = [...proposerEntries, ...seconderEntries].filter(
    (entry) => entry?.status === "rejected"
  ).length
  const showSupporterVerificationWarning = pendingSupporterCount > 0 || rejectedSupporterCount > 0

  const handleReviewAction = async (status) => {
    const trimmedNotes = String(reviewNotes || "").trim()
    if (status === "modification_requested" && trimmedNotes.length < 3) {
      setNoteError("Add a clear comment before requesting modification.")
      return
    }

    if (status === "verified" && showSupporterVerificationWarning) {
      // Only reached when at least one count is non-zero, so this is never "()".
      const outstanding = [
        pendingSupporterCount > 0 ? `${pendingSupporterCount} pending` : "",
        rejectedSupporterCount > 0 ? `${rejectedSupporterCount} rejected` : "",
      ]
        .filter(Boolean)
        .join(", ")

      const ok = await confirm({
        title: "Verify nomination",
        message: `Supporter confirmations are still incomplete (${outstanding}). You can still verify this nomination if you want to proceed.`,
        confirmText: "Verify anyway",
        cancelText: "Cancel",
      })
      if (!ok) return
    }

    setNoteError("")
    onReview(nomination.id, status, trimmedNotes)
  }

  const openStudentDetail = async (userId) => {
    if (readOnly || !userId) return

    try {
      setOpeningStudentUserId(String(userId))
      const studentId = await studentApi.getStudentId(userId)
      if (!studentId) return
      setStudentDetailTarget({ _id: studentId, userId })
    } finally {
      setOpeningStudentUserId("")
    }
  }

  const renderSupporterList = (entries = []) => {
    if (entries.length === 0) {
      return <EmptyState variant="inline" icon={Users} message="No supporters added." />
    }

    return (
      <Table bordered dense>
        <Table.Header>
          <Table.Row>
            <Table.Head>Student</Table.Head>
            <Table.Head align="right">Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {entries.map((entry) => (
            <Table.Row key={`${entry.userId || entry.rollNumber}`}>
              <Table.Cell>
                <button
                  type="button"
                  onClick={() => openStudentDetail(entry.userId)}
                  disabled={readOnly || !entry.userId}
                  className="flex items-center gap-[var(--spacing-3)] text-left"
                >
                  <Avatar
                    src={entry.profileImage ? getMediaUrl(entry.profileImage) : undefined}
                    name={entry.name || entry.rollNumber || ""}
                    size="medium"
                  />
                  <span className="min-w-0">
                    <Text as="div" size="sm" weight="medium" color="heading">
                      {entry.name || entry.rollNumber}
                    </Text>
                    <Text as="div" size="xs" color="muted">
                      {entry.rollNumber}
                    </Text>
                  </span>
                </button>
              </Table.Cell>
              <Table.Cell align="right">
                <Badge variant={getStatusTone(entry.status)} size="small">
                  {formatStageLabel(entry.status)}
                </Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  const documents = [
    { label: "Grade card (optional)", value: nomination.gradeCardUrl },
    { label: "Manifesto (optional)", value: nomination.manifestoUrl },
    { label: "POR documents (optional)", value: nomination.porDocumentUrl },
    { label: "Student ID front", value: nomination.candidateIdCard?.front || "" },
    { label: "Student ID back", value: nomination.candidateIdCard?.back || "" },
  ]

  return (
    <>
      <Modal
        isOpen={Boolean(nomination)}
        onClose={onClose}
        title={nomination.candidateName || nomination.candidateRollNumber}
        width={1120}
        fullHeight={true}
        footer={
          <HStack gap={3} align="center" justify="between" wrap style={{ width: "100%" }}>
            <HStack gap={2} align="center" wrap>
              <Badge variant={getStatusTone(nomination.status)} size="small">
                {formatStageLabel(nomination.status)}
              </Badge>
              <Badge size="small">{nomination.postTitle}</Badge>
              <Badge size="small">{nomination.candidateRollNumber}</Badge>
            </HStack>
            <HStack gap={2} align="center" wrap>
              <Button size="sm" variant="secondary" onClick={onClose}>
                Close
              </Button>
              {!readOnly ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busy === `${electionId}:${nomination.id}:modification_requested`}
                    onClick={() => handleReviewAction("modification_requested")}
                  >
                    Request modification
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={busy === `${electionId}:${nomination.id}:rejected`}
                    onClick={() => handleReviewAction("rejected")}
                  >
                    <XCircle size={14} /> Reject
                  </Button>
                  <Button
                    size="sm"
                    loading={busy === `${electionId}:${nomination.id}:verified`}
                    onClick={() => handleReviewAction("verified")}
                  >
                    <CheckCircle2 size={14} /> Verify
                  </Button>
                </>
              ) : null}
            </HStack>
          </HStack>
        }
      >
        <VStack gap={3}>
          <Grid min={340} gap={3} align="start">
            <DetailSection title="Candidate details" icon={User}>
              <StudentSummaryRow
                name={nomination.candidateName || nomination.candidateRollNumber}
                email={nomination.candidateEmail}
                image={nomination.candidateProfileImage}
                subtitle={`${nomination.candidateRollNumber}${nomination.candidateBatch ? ` · ${nomination.candidateBatch}` : ""}`}
                onClick={
                  nomination.candidateUserId && !readOnly
                    ? () => openStudentDetail(nomination.candidateUserId)
                    : undefined
                }
                loading={openingStudentUserId === String(nomination.candidateUserId || "")}
              />
              <InfoRow label="CGPA" value={nomination.cgpa || "—"} />
              <InfoRow label="No active backlog" value={nomination.hasNoActiveBacklogs ? "Yes" : "No"} />
              <InfoRow label="Submitted" value={formatDateTime(nomination.submittedAt)} />
              <InfoRow label="Post" value={nomination.postTitle || "—"} />
            </DetailSection>

            <DetailSection title="Review comment" icon={MessageSquareText}>
              {readOnly ? (
                <Text color="muted">{reviewNotes || "No review comment available yet."}</Text>
              ) : (
                <Field error={noteError || undefined}>
                  <Textarea
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    placeholder="Add review feedback. This is required when requesting modification."
                    rows={4}
                    error={Boolean(noteError)}
                  />
                </Field>
              )}
            </DetailSection>
          </Grid>

          <Grid min={320} gap={3} align="start">
            <DetailSection title="Proposers" icon={Users} plain>
              {renderSupporterList(nomination.proposerEntries || [])}
            </DetailSection>

            <DetailSection title="Seconders" icon={Users} plain>
              {renderSupporterList(nomination.seconderEntries || [])}
            </DetailSection>
          </Grid>

          <DetailSection title="Documents" icon={FileText} plain>
            <Grid min={240} gap={3}>
              {documents.map((item) => (
                <DetailSection key={item.label} title={item.label}>
                  {item.value ? (
                    <HStack gap={2} align="center" wrap>
                      <Button size="sm" variant="secondary" onClick={() => setViewerUrl(item.value)}>
                        View
                      </Button>
                      <Text
                        as="a"
                        size="sm"
                        color="brand"
                        weight="medium"
                        href={getMediaUrl(item.value)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </Text>
                    </HStack>
                  ) : (
                    <EmptyState variant="inline" message="Not submitted" />
                  )}
                </DetailSection>
              ))}
            </Grid>
          </DetailSection>
        </VStack>
      </Modal>

      <CertificateViewerModal
        isOpen={Boolean(viewerUrl)}
        onClose={() => setViewerUrl("")}
        certificateUrl={viewerUrl}
      />

      {studentDetailTarget ? (
        <StudentDetailModal
          selectedStudent={studentDetailTarget}
          setShowStudentDetail={(show) => {
            if (!show) {
              setStudentDetailTarget(null)
            }
          }}
          onUpdate={() => setStudentDetailTarget(null)}
        />
      ) : null}
    </>
  )
}
