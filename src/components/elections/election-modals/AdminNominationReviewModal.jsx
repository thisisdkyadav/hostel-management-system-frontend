import { useEffect, useState } from "react"
import { Button } from "hzero"
import { Grid, HStack, IconCircle, Modal, Text } from "@/components/ui"
import { CheckCircle2, User, Users, XCircle } from "lucide-react"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import ConfirmationDialog from "@/components/common/ConfirmationDialog"
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
import { studentApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"
import { MetaList, StatusPill } from "@/components/elections/ElectionShared"

/**
 * Both of these were defined inside AdminNominationReviewModal's render, so
 * React saw a new component type on every keystroke in the review textarea and
 * tore down the candidate, proposer and seconder panels each time.
 */
const SectionCard = ({ icon: Icon, title, children }) => (
  <Grid cols={1} gap={3} style={{ background: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3) var(--spacing-4)", border: "1px solid var(--color-border-light)" }}>
    <HStack gap={2} align="center">
      <HStack align="center" justify="center" gap="none" color="brand" style={{ width: "24px", height: "24px", borderRadius: "var(--radius-sm)", background: "linear-gradient(135deg, var(--color-primary-bg), color-mix(in srgb, var(--color-primary-bg) 76%, white 24%))" }}>
        <Icon size={13} />
      </HStack>
      <Text as="div" size="xs" weight="semibold" color="brand" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </Text>
    </HStack>
    {children}
  </Grid>
)

/** The card's resting border and offset, and the raised ones it hovers to. */
const CARD_RESTING = { borderColor: "var(--color-border-primary)", transform: "translateY(0)" }
const CARD_RAISED = { borderColor: "var(--color-border-hover)", transform: "translateY(-1px)" }

const applyCardState = (element, state) => {
  element.style.borderColor = state.borderColor
  element.style.transform = state.transform
}

const StudentSummaryCard = ({
  name,
  email,
  image,
  subtitle,
  onClick,
  loading = false,
  mutedTextStyle,
}) => (
  <div
    onClick={
      onClick
        ? (event) => {
            // Reset the hover before opening the detail modal. These writes go
            // straight to the DOM, so React never reverts them — and clicking
            // covers this card with an overlay, which means no mouseleave is
            // ever dispatched to undo them. While this component was defined
            // during its parent's render the accidental remount cleared it;
            // now that it is stable, nothing would, and the card would sit
            // raised behind the modal and stay raised after it closed.
            applyCardState(event.currentTarget, CARD_RESTING)
            onClick()
          }
        : undefined
    }
    style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-3)",
      padding: "var(--spacing-3)",
      borderRadius: "var(--radius-lg)",
      backgroundColor: "var(--color-bg-primary)",
      border: `1px solid ${CARD_RESTING.borderColor}`,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(event) => {
      if (!onClick) return
      applyCardState(event.currentTarget, CARD_RAISED)
    }}
    onMouseLeave={(event) => {
      if (!onClick) return
      applyCardState(event.currentTarget, CARD_RESTING)
    }}
  >
    {image ? (
      <img
        src={getMediaUrl(image)}
        alt={name}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-full)",
          objectFit: "cover",
          border: "2px solid var(--color-primary-bg)",
          flexShrink: 0,
        }}
      />
    ) : (
      <IconCircle size="48px" bg="brand" color="brand" style={{ fontWeight: "var(--font-weight-semibold)" }}>
        {(name || "?").trim().charAt(0).toUpperCase()}
      </IconCircle>
    )}
    <Grid cols={1} gap="2px" style={{ minWidth: 0, flex: 1 }}>
      <Text as="div" weight="semibold" color="heading" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name || "Unknown student"}
      </Text>
      {subtitle ? <div style={mutedTextStyle}>{subtitle}</div> : null}
      {email ? (
        <Text as="div" size="xs" color="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email}
        </Text>
      ) : null}
    </Grid>
    {loading ? <span style={mutedTextStyle}>Opening...</span> : null}
  </div>
)

export const AdminNominationReviewModal = ({
  nomination,
  electionId,
  onClose,
  onReview,
  busy,
  modalBodyStyle,
  badgeRowStyle,
  detailGridStyle,
  detailPanelStyle,
  labelStyle,
  mutedTextStyle,
  getStatusTone,
  formatStageLabel,
  formatDateTime,
  pillBaseStyle,
  statusToneStyles,
  textareaStyle,
  readOnly = false,
}) => {
  const [viewerUrl, setViewerUrl] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [noteError, setNoteError] = useState("")
  const [studentDetailTarget, setStudentDetailTarget] = useState(null)
  const [openingStudentUserId, setOpeningStudentUserId] = useState("")
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false)

  useEffect(() => {
    setReviewNotes(nomination?.review?.notes || "")
    setNoteError("")
    setShowVerifyConfirm(false)
  }, [nomination])

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

  const handleReviewAction = (status) => {
    const trimmedNotes = String(reviewNotes || "").trim()
    if (status === "modification_requested" && trimmedNotes.length < 3) {
      setNoteError("Add a clear comment before requesting modification.")
      return
    }

    if (status === "verified" && showSupporterVerificationWarning) {
      setShowVerifyConfirm(true)
      return
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
      return <div style={mutedTextStyle}>No supporters added.</div>
    }

    return (
      <Grid cols={1} gap="10px">
        {entries.map((entry) => (
          <div
            key={`${entry.userId || entry.rollNumber}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-3)",
              padding: "var(--spacing-3)",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg-primary)",
              border: "1px solid var(--color-border-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-3)",
                minWidth: 0,
                flex: 1,
              }}
            >
              {entry.profileImage ? (
                <img
                  src={getMediaUrl(entry.profileImage)}
                  alt={entry.name || entry.rollNumber}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-full)",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <IconCircle size="40px" bg="brand" color="brand" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  {(entry.name || entry.rollNumber || "?").trim().charAt(0).toUpperCase()}
                </IconCircle>
              )}
              <button
                type="button"
                onClick={() => openStudentDetail(entry.userId)}
                disabled={readOnly || !entry.userId}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  textAlign: "left",
                  cursor: !readOnly && entry.userId ? "pointer" : "default",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Text as="div" weight="medium" color="heading" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.name || entry.rollNumber}
                </Text>
                <div style={mutedTextStyle}>{entry.rollNumber}</div>
              </button>
            </div>

            <StatusPill
              tone={getStatusTone(entry.status)}
              pillBaseStyle={pillBaseStyle}
              statusToneStyles={statusToneStyles}
            >
              {formatStageLabel(entry.status)}
            </StatusPill>
          </div>
        ))}
      </Grid>
    )
  }

  return (
    <>
      <Modal
        isOpen={Boolean(nomination)}
        onClose={onClose}
        title={nomination.candidateName || nomination.candidateRollNumber}
        width={1120}
        fullHeight={true}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
            }}
          >
            <div style={badgeRowStyle}>
              <StatusPill
                tone={getStatusTone(nomination.status)}
                pillBaseStyle={pillBaseStyle}
                statusToneStyles={statusToneStyles}
              >
                {formatStageLabel(nomination.status)}
              </StatusPill>
              <StatusPill tone="default" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                {nomination.postTitle}
              </StatusPill>
              <StatusPill tone="default" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                {nomination.candidateRollNumber}
              </StatusPill>
            </div>
            <HStack gap="8px">
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
                    Request Modification
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
          </div>
        }
      >
        <div style={modalBodyStyle}>
          <Grid min={340} gap={3} align="start">
            <SectionCard icon={User} title="Candidate Details">
              <StudentSummaryCard
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
                mutedTextStyle={mutedTextStyle}
              />
              <div style={detailGridStyle}>
                <div style={detailPanelStyle}>
                  <div style={labelStyle}>Academic details</div>
                  <MetaList
                    items={[
                      { label: "CGPA", value: nomination.cgpa ?? "—" },
                      { label: "No active backlog", value: nomination.hasNoActiveBacklogs ? "Yes" : "No" },
                    ]}
                  />
                </div>
                <div style={detailPanelStyle}>
                  <div style={labelStyle}>Nomination</div>
                  <MetaList
                    items={[
                      { label: "Submitted", value: formatDateTime(nomination.submittedAt) },
                      { label: "Post", value: nomination.postTitle || "—" },
                    ]}
                  />
                </div>
              </div>
            </SectionCard>

            <div style={{ ...detailPanelStyle, minHeight: "100%" }}>
              <div style={labelStyle}>Review comment</div>
              {readOnly ? (
                <div style={mutedTextStyle}>{reviewNotes || "No review comment available yet."}</div>
              ) : (
                <>
                  <textarea
                    style={noteError ? { ...textareaStyle, borderColor: "var(--color-danger)" } : textareaStyle}
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    placeholder="Add review feedback. This is required when requesting modification."
                  />
                  {noteError ? <Text as="div" color="danger-text" size="xs">{noteError}</Text> : null}
                </>
              )}
            </div>
          </Grid>

          <Grid min={320} gap={3} align="start">
            <SectionCard icon={Users} title="Proposers">
              {renderSupporterList(nomination.proposerEntries || [])}
            </SectionCard>

            <SectionCard icon={Users} title="Seconders">
              {renderSupporterList(nomination.seconderEntries || [])}
            </SectionCard>
          </Grid>

          <div style={detailGridStyle}>
            {[
              { label: "Grade Card (Optional)", value: nomination.gradeCardUrl },
              { label: "Manifesto (Optional)", value: nomination.manifestoUrl },
              { label: "POR Documents (Optional)", value: nomination.porDocumentUrl },
              { label: "Student ID Front", value: nomination.candidateIdCard?.front || "" },
              { label: "Student ID Back", value: nomination.candidateIdCard?.back || "" },
            ].map((item) => (
              <div key={item.label} style={detailPanelStyle}>
                <div style={labelStyle}>{item.label}</div>
                {item.value ? (
                  <HStack gap="8px" wrap>
                    <Button size="sm" variant="secondary" onClick={() => setViewerUrl(item.value)}>
                      View
                    </Button>
                    <Text as="a" color="brand" weight="medium" style={{ textDecoration: "none", alignSelf: "center" }} href={getMediaUrl(item.value)}
                      target="_blank"
                      rel="noreferrer">
                      Open
                    </Text>
                  </HStack>
                ) : (
                  <span style={mutedTextStyle}>Not submitted</span>
                )}
              </div>
            ))}
          </div>
        </div>
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

      <ConfirmationDialog
        isOpen={showVerifyConfirm}
        onClose={() => setShowVerifyConfirm(false)}
        onConfirm={() => {
          setShowVerifyConfirm(false)
          setNoteError("")
          onReview(nomination.id, "verified", String(reviewNotes || "").trim())
        }}
        title="Verify Nomination"
        message={`Supporter confirmations are still incomplete${pendingSupporterCount > 0 ? ` (${pendingSupporterCount} pending` : ""}${pendingSupporterCount > 0 && rejectedSupporterCount > 0 ? ", " : ""}${rejectedSupporterCount > 0 ? `${rejectedSupporterCount} rejected` : ""}). You can still verify this nomination if you want to proceed.`}
        confirmText="Verify Anyway"
        cancelText="Cancel"
      />
    </>
  )
}
