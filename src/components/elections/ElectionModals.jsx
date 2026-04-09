import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Input, Modal, Table } from "czero/react"
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Plus,
  User,
  Users,
  XCircle,
} from "lucide-react"
import StepIndicator from "@/components/ui/navigation/StepIndicator"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import ConfirmationDialog from "@/components/common/ConfirmationDialog"
import CsvUploader from "@/components/common/CsvUploader"
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
import { Alert } from "@/components/ui/feedback"
import { idCardApi, studentApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"
import {
  DocumentUploadField,
  HostelPicker,
  MetaList,
  ScopeEditor,
  StatusPill,
} from "@/components/elections/ElectionShared"

export const ElectionHistoryModal = ({
  isOpen,
  onClose,
  elections,
  selectedElectionId,
  onSelect,
  modalBodyStyle,
  mutedTextStyle,
  formatStageLabel,
  getStatusTone,
  formatDateTime,
  pillBaseStyle,
  statusToneStyles,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Election History"
    width={860}
    footer={
      <Button size="sm" variant="secondary" onClick={onClose}>
        Close
      </Button>
    }
  >
    <div style={modalBodyStyle}>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Election</Table.Head>
            <Table.Head>Phase</Table.Head>
            <Table.Head>Stage</Table.Head>
            <Table.Head>Voting</Table.Head>
            <Table.Head align="right">Action</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {elections.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <div style={{ padding: "var(--spacing-5)", textAlign: "center", color: "var(--color-text-muted)" }}>
                  No elections available yet.
                </div>
              </Table.Cell>
            </Table.Row>
          ) : (
            elections.map((election) => (
              <Table.Row key={election.id}>
                <Table.Cell>
                  <div style={{ display: "grid", gap: "4px" }}>
                    <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{election.title}</span>
                    <span style={mutedTextStyle}>{election.academicYear}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>{formatStageLabel(election.phase)}</Table.Cell>
                <Table.Cell>
                  <StatusPill
                    tone={getStatusTone(election.currentStage)}
                    pillBaseStyle={pillBaseStyle}
                    statusToneStyles={statusToneStyles}
                  >
                    {formatStageLabel(election.currentStage)}
                  </StatusPill>
                </Table.Cell>
                <Table.Cell>{formatDateTime(election.timeline?.votingStartAt)}</Table.Cell>
                <Table.Cell align="right">
                  <Button
                    size="sm"
                    variant={selectedElectionId === election.id ? "secondary" : "ghost"}
                    onClick={() => {
                      onSelect(election.id)
                      onClose()
                    }}
                  >
                    {selectedElectionId === election.id ? "Selected" : "Open"}
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  </Modal>
)

export const CloneElectionModal = ({
  isOpen,
  onClose,
  titleValue,
  onTitleChange,
  onSubmit,
  loading,
  mutedTextStyle,
  errorTextStyle,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Copy Election"
    width={520}
    footer={
      <>
        <Button size="sm" variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSubmit} loading={loading} disabled={!String(titleValue || "").trim()}>
          Create Copy
        </Button>
      </>
    }
  >
    <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
      <div style={mutedTextStyle}>
        This creates a fresh draft copy of the current election configuration and nominations. Votes, results, and voting email state are not copied.
      </div>
      <div>
        <div style={{ marginBottom: "6px", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
          New election name
        </div>
        <Input
          value={titleValue}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Enter the mock election name"
          autoFocus
        />
        {!String(titleValue || "").trim() ? (
          <div style={errorTextStyle}>Election name is required.</div>
        ) : null}
      </div>
    </div>
  </Modal>
)

export const LiveVotingFullscreenModal = ({
  isOpen,
  onClose,
  electionTitle,
  liveVotingStats,
  loadingVotingStats,
  socketConnected,
  formatDateTime,
}) => {
  const posts = liveVotingStats?.posts || []
  const overview = liveVotingStats?.overview || {}

  const formatCompactPercentage = (value) => {
    const percentage = Number(value || 0)
    if (!Number.isFinite(percentage) || percentage <= 0) return "0%"
    return percentage >= 10 ? `${percentage.toFixed(1)}%` : `${percentage.toFixed(2)}%`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={1480}
      closeButtonVariant="button"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-6)", marginTop: "-4px", marginBottom: "-4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px",
              borderRadius: "var(--radius-button-pill)",
              backgroundColor: socketConnected ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
              color: socketConnected ? "var(--color-success)" : "var(--color-warning)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              border: `1px solid ${socketConnected ? "rgba(34, 197, 94, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "currentColor",
                animation: socketConnected ? "pulse 2s infinite" : "none",
              }}
            />
            {socketConnected ? "Live Status" : "Reconnecting"}
          </div>

          <div style={{ display: "flex", gap: "var(--spacing-5)", fontSize: "var(--font-size-base)", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Eligible Voters</span>
              <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)", fontSize: "var(--font-size-md)" }}>
                {overview.ballotsSubmitted + overview.ballotsPending || 0}
              </span>
            </div>
            <div style={{ width: "1px", height: "18px", backgroundColor: "var(--color-border-primary)" }} />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Votes Submitted</span>
              <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-success)", fontSize: "var(--font-size-md)" }}>
                {overview.ballotsSubmitted || 0}
              </span>
            </div>
            <div style={{ width: "1px", height: "18px", backgroundColor: "var(--color-border-primary)" }} />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Pending</span>
              <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-warning)", fontSize: "var(--font-size-md)" }}>
                {overview.ballotsPending || 0}
              </span>
            </div>
            <div style={{ width: "1px", height: "18px", backgroundColor: "var(--color-border-primary)" }} />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Turnout</span>
              <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)", fontSize: "var(--font-size-lg)" }}>
                {overview.turnoutPercentage || 0}%
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div
        style={{
          maxHeight: "calc(95vh - 100px)",
          overflow: "auto",
          backgroundColor: "var(--color-bg-page)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border-primary)",
        }}
      >
        <Table>
          <Table.Header>
            <Table.Row style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-primary)" }}>
              <Table.Head style={{ width: "240px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Post</Table.Head>
              <Table.Head style={{ padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Candidates</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Elect</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Voted</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pending</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Turnout</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {posts.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} style={{ textAlign: "center", padding: "var(--spacing-5)", color: "var(--color-text-muted)" }}>
                  {loadingVotingStats ? "Loading live data..." : "No live voting data available."}
                </Table.Cell>
              </Table.Row>
            ) : (
              posts.map((post, index) => {
                const sortedCandidates = [...(post.candidates || [])].sort((left, right) => {
                  if (left.isNota && !right.isNota) return -1
                  if (!left.isNota && right.isNota) return 1
                  return (right.voteCount || 0) - (left.voteCount || 0) || String(left.candidateName || "").localeCompare(String(right.candidateName || ""))
                })

                return (
                  <Table.Row key={post.postId} style={{ backgroundColor: index % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-tertiary)" }}>
                    <Table.Cell style={{ padding: "6px 10px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)", fontSize: "13px", lineHeight: 1.2 }}>
                        {post.postTitle}
                      </div>
                    </Table.Cell>
                    <Table.Cell style={{ padding: "4px 10px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {sortedCandidates.map((candidate) => (
                          <div
                            key={candidate.nominationId}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              border: `1px solid ${candidate.isNota ? "var(--color-border-primary)" : "var(--color-primary-bg)"}`,
                              backgroundColor: candidate.isNota ? "var(--color-bg-secondary)" : "rgba(19, 96, 171, 0.04)",
                              borderRadius: "var(--radius-md)",
                              padding: "2px 6px",
                              gap: "6px",
                            }}
                          >
                            <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {candidate.isNota ? "NOTA" : candidate.candidateName || candidate.candidateRollNumber}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
                                {candidate.voteCount || 0}
                              </span>
                              <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                                ({formatCompactPercentage(candidate.votePercentage)})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", color: "var(--color-text-muted)", fontSize: "13px" }}>
                      {post.eligibleVoterCount || 0}
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", fontSize: "13px" }}>
                      {post.votedCount || 0}
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", color: "var(--color-warning)", fontWeight: "var(--font-weight-medium)", fontSize: "13px" }}>
                      {post.pendingCount || 0}
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)", fontSize: "13px" }}>
                      {post.turnoutPercentage || 0}%
                    </Table.Cell>
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>
      </div>
    </Modal>
  )
}

export const ElectionWizardModal = ({
  isOpen,
  mode,
  form,
  setForm,
  onClose,
  onSave,
  saving,
  batchOptions,
  groupOptions,
  hostels,
  createBlankPost,
  buildD15Timeline,
  validateElectionWizard,
  createEmptyWizardErrors,
  wizardSteps,
  phaseOptions,
  statusOptions,
  votingAccessOptions,
  postCategoryOptions,
  timelineFieldDefs,
  requirementFieldDefs,
  splitListInput,
  formatDateTime,
  fromDateTimeLocal,
  flatPanelStyle,
  panelStyle,
  modalBodyStyle,
  labelStyle,
  mutedTextStyle,
  selectStyle,
  textareaStyle,
  errorTextStyle,
  errorBannerStyle,
  timelinePreviewStyle,
  timelineCellStyle,
  postTabListStyle,
  postTabStyle,
  pillBaseStyle,
  statusToneStyles,
  nominationTemplateHeaders,
}) => {
  const [currentStep, setCurrentStep] = useState("basics")
  const [activePostIndex, setActivePostIndex] = useState(0)
  const [wizardErrors, setWizardErrors] = useState(createEmptyWizardErrors())
  const [showMockEnableConfirm, setShowMockEnableConfirm] = useState(false)
  const wizardBodyStyle = {
    ...modalBodyStyle,
    height: "calc(90vh - 180px)",
    maxHeight: "calc(90vh - 180px)",
    minHeight: "calc(90vh - 180px)",
  }

  useEffect(() => {
    if (isOpen) {
      setCurrentStep("basics")
      setActivePostIndex(0)
      setWizardErrors(createEmptyWizardErrors())
      setShowMockEnableConfirm(false)
    }
  }, [createEmptyWizardErrors, isOpen, mode])

  const currentStepIndex = wizardSteps.findIndex((step) => step.id === currentStep)
  const isLastStep = currentStepIndex === wizardSteps.length - 1
  const activePost = form.posts[activePostIndex] || form.posts[0]
  const basicsErrors = wizardErrors.basics || {}
  const timelineErrors = wizardErrors.timeline || {}
  const commissionErrors = wizardErrors.commission || {}
  const postErrors = wizardErrors.posts || []
  const showVotingEmailStartField =
    ["email", "both"].includes(form.votingAccess?.mode || "both")
  const visibleTimelineFieldDefs = timelineFieldDefs.filter(
    (field) => field.key !== "votingEmailStartAt" || showVotingEmailStartField
  )
  const activePostErrors = postErrors[activePostIndex] || {}

  const updateForm = (patch) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }))
  }

  const updateTimeline = (key, value) => {
    setForm((current) => ({
      ...current,
      timeline: {
        ...current.timeline,
        [key]: value,
      },
    }))
  }

  const updateMockSettings = (patch) => {
    setForm((current) => ({
      ...current,
      mockSettings: {
        ...(current.mockSettings || {}),
        ...patch,
      },
    }))
  }

  const updatePost = (index, patch) => {
    setForm((current) => ({
      ...current,
      posts: current.posts.map((post, postIndex) => (postIndex === index ? { ...post, ...patch } : post)),
    }))
  }

  const updatePostRequirements = (index, key, value) => {
    setForm((current) => ({
      ...current,
      posts: current.posts.map((post, postIndex) =>
        postIndex === index
          ? {
              ...post,
              requirements: {
                ...post.requirements,
                [key]: value,
              },
            }
          : post
      ),
    }))
  }

  const addPost = () => {
    setForm((current) => ({
      ...current,
      posts: [...current.posts, createBlankPost()],
    }))
    setActivePostIndex(form.posts.length)
  }

  const removePost = (index) => {
    setForm((current) => ({
      ...current,
      posts: current.posts.filter((_, postIndex) => postIndex !== index),
    }))
    setActivePostIndex((currentIndex) => {
      if (currentIndex > index) return currentIndex - 1
      return Math.max(0, Math.min(currentIndex, form.posts.length - 2))
    })
  }

  const applyD15Timeline = () => {
    const nextTimeline = buildD15Timeline(form.timeline.votingStartAt)
    if (!nextTimeline) {
      setWizardErrors((current) => ({
        ...current,
        timeline: {
          ...current.timeline,
          votingStartAt: "Set a valid voting start date and time before applying the D-15 guide.",
        },
      }))
      return
    }

    updateForm({ timeline: nextTimeline })
    setWizardErrors((current) => ({
      ...current,
      timeline: {},
    }))
  }

  const goToNextStep = () => {
    const validation = validateElectionWizard(form, currentStep, hostels)
    if (!validation.isValid) {
      setWizardErrors(validation.errors)
      if (validation.firstInvalidPostIndex !== null) {
        setActivePostIndex(validation.firstInvalidPostIndex)
      }
      return
    }

    setWizardErrors(createEmptyWizardErrors())
    setCurrentStep(wizardSteps[currentStepIndex + 1].id)
  }

  const handleSave = () => {
    const validation = validateElectionWizard(form, "all", hostels)
    if (!validation.isValid) {
      setWizardErrors(validation.errors)
      if (validation.firstInvalidStep) {
        setCurrentStep(validation.firstInvalidStep)
      }
      if (validation.firstInvalidPostIndex !== null) {
        setActivePostIndex(validation.firstInvalidPostIndex)
      }
      return
    }

    setWizardErrors(createEmptyWizardErrors())
    onSave()
  }

  let body = null

  if (currentStep === "basics") {
    const mockVoterCount = Array.isArray(form.mockSettings?.voterRollNumbers)
      ? form.mockSettings.voterRollNumbers.length
      : 0

    body = (
      <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--spacing-3)",
          }}
        >
          <div>
            <label style={labelStyle}>Election title</label>
            <Input
              style={basicsErrors.title ? { borderColor: "var(--color-danger)" } : undefined}
              value={form.title}
              onChange={(event) => updateForm({ title: event.target.value })}
              placeholder="Students' Gymkhana Elections 2026"
            />
            {basicsErrors.title ? <div style={errorTextStyle}>{basicsErrors.title}</div> : null}
          </div>
          <div>
            <label style={labelStyle}>Academic year</label>
            <Input
              style={basicsErrors.academicYear ? { borderColor: "var(--color-danger)" } : undefined}
              value={form.academicYear}
              onChange={(event) => updateForm({ academicYear: event.target.value })}
              placeholder="2025-26"
            />
            {basicsErrors.academicYear ? <div style={errorTextStyle}>{basicsErrors.academicYear}</div> : null}
          </div>
          <div>
            <label style={labelStyle}>Phase</label>
            <select
              style={basicsErrors.phase ? { ...selectStyle, borderColor: "var(--color-danger)" } : selectStyle}
              value={form.phase}
              onChange={(event) => updateForm({ phase: event.target.value })}
            >
              {phaseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {basicsErrors.phase ? <div style={errorTextStyle}>{basicsErrors.phase}</div> : null}
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              style={basicsErrors.status ? { ...selectStyle, borderColor: "var(--color-danger)" } : selectStyle}
              value={form.status}
              onChange={(event) => updateForm({ status: event.target.value })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {basicsErrors.status ? <div style={errorTextStyle}>{basicsErrors.status}</div> : null}
          </div>
          <div>
            <label style={labelStyle}>Voting access</label>
            <select
              style={basicsErrors.votingAccess ? { ...selectStyle, borderColor: "var(--color-danger)" } : selectStyle}
              value={form.votingAccess?.mode || "both"}
              onChange={(event) =>
                updateForm({
                  votingAccess: {
                    ...(form.votingAccess || {}),
                    mode: event.target.value,
                  },
                })
              }
            >
              {votingAccessOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {basicsErrors.votingAccess ? <div style={errorTextStyle}>{basicsErrors.votingAccess}</div> : null}
          </div>
        </div>

        {["email", "both"].includes(form.votingAccess?.mode || "both") ? (
          <div style={flatPanelStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--spacing-3)",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ ...labelStyle, marginBottom: "4px" }}>Auto send voting links</div>
                <div style={mutedTextStyle}>
                  If enabled, voting links will start sending automatically from the configured link-sending time.
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-body)" }}>
                <input
                  type="checkbox"
                  checked={Boolean(form.votingAccess?.autoSendEnabled !== false)}
                  onChange={(event) =>
                    updateForm({
                      votingAccess: {
                        ...(form.votingAccess || {}),
                        autoSendEnabled: event.target.checked,
                      },
                    })
                  }
                />
                Enable auto send
              </label>
            </div>
            {basicsErrors.autoSendEnabled ? <div style={errorTextStyle}>{basicsErrors.autoSendEnabled}</div> : null}
          </div>
        ) : null}

        <div style={flatPanelStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            style={basicsErrors.description ? { ...textareaStyle, borderColor: "var(--color-danger)" } : textareaStyle}
            value={form.description}
            onChange={(event) => updateForm({ description: event.target.value })}
            placeholder="Add constitutional notes, internal remarks, or an overview for this election cycle."
          />
          {basicsErrors.description ? <div style={errorTextStyle}>{basicsErrors.description}</div> : null}
        </div>

        <div style={flatPanelStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
              marginBottom: form.mockSettings?.enabled ? "var(--spacing-3)" : 0,
            }}
          >
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Mock election</div>
              <div style={mutedTextStyle}>
                Limit voting to an uploaded mock voter list while keeping the rest of the election flow unchanged.
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-body)" }}>
              <input
                type="checkbox"
                checked={Boolean(form.mockSettings?.enabled)}
                onChange={(event) => {
                  if (event.target.checked) {
                    setShowMockEnableConfirm(true)
                    return
                  }
                  updateMockSettings({ enabled: false })
                }}
              />
              Mark as mock
            </label>
          </div>

          {form.mockSettings?.enabled ? (
            <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
              <Alert
                type="warning"
                title="Mock election enabled"
              >
                Only the students from the uploaded mock voter CSV will be allowed to vote in this mock election.
              </Alert>

              <div>
                <div style={{ ...labelStyle, marginBottom: "4px" }}>Mock voter list</div>
                <div style={mutedTextStyle}>
                  Upload a CSV with a single <code>rollNumber</code> column. Uploading a new file replaces the previous mock list.
                </div>
              </div>

              <CsvUploader
                requiredFields={nominationTemplateHeaders}
                templateHeaders={nominationTemplateHeaders}
                templateFileName="mock_voters.csv"
                instructionText="Upload a CSV with a single `rollNumber` column."
                onDataParsed={(rows) => {
                  const nextRollNumbers = rows
                    .map((row) => String(row.rollNumber || "").trim().toUpperCase())
                    .filter(Boolean)

                  updateMockSettings({
                    voterRollNumbers: [...new Set(nextRollNumbers)],
                  })
                }}
              />

              <div style={mutedTextStyle}>{mockVoterCount} mock voter(s) uploaded</div>
              {basicsErrors.mockSettings ? <div style={errorTextStyle}>{basicsErrors.mockSettings}</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  if (currentStep === "timeline") {
    body = (
      <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
        <div style={flatPanelStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Election schedule</div>
              <div style={mutedTextStyle}>
                Set the polling start time, then apply the D-15 template to prefill the rest of the schedule. Link sending starts 6 hours before voting by default.
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={applyD15Timeline}>
              <History size={14} /> Apply D-15 Guide
            </Button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--spacing-3)",
          }}
        >
          {visibleTimelineFieldDefs.map((field) => (
            <div key={field.key} style={panelStyle}>
              <label style={labelStyle}>{field.label}</label>
              <Input
                style={timelineErrors[field.key] ? { borderColor: "var(--color-danger)" } : undefined}
                type="datetime-local"
                value={form.timeline[field.key]}
                onChange={(event) => updateTimeline(field.key, event.target.value)}
              />
              <div style={{ ...mutedTextStyle, marginTop: "var(--spacing-2)" }}>{field.day}</div>
              {timelineErrors[field.key] ? <div style={errorTextStyle}>{timelineErrors[field.key]}</div> : null}
            </div>
          ))}
        </div>

        <div style={timelinePreviewStyle}>
          {timelineFieldDefs.slice(0, 6).map((field) => (
            <div key={`${field.key}-preview`} style={timelineCellStyle}>
              <div style={labelStyle}>{field.label}</div>
              <div style={{ color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)" }}>
                {form.timeline[field.key]
                  ? formatDateTime(fromDateTimeLocal(form.timeline[field.key]))
                  : "Not set"}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (currentStep === "commission") {
    body = (
      <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
        <div style={flatPanelStyle}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Election Commission</div>
          <div style={mutedTextStyle}>
            Capture the Chief Election Officer and the supporting election officers for this cycle.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--spacing-3)",
          }}
        >
          <div style={panelStyle}>
            <label style={labelStyle}>Chief election officer roll number</label>
            <Input
              style={commissionErrors.chiefElectionOfficerRollNumber ? { borderColor: "var(--color-danger)" } : undefined}
              value={form.electionCommission.chiefElectionOfficerRollNumber}
              onChange={(event) =>
                updateForm({
                  electionCommission: {
                    ...form.electionCommission,
                    chiefElectionOfficerRollNumber: event.target.value.toUpperCase(),
                  },
                })
              }
              placeholder="21CS10001"
            />
            {commissionErrors.chiefElectionOfficerRollNumber ? (
              <div style={errorTextStyle}>{commissionErrors.chiefElectionOfficerRollNumber}</div>
            ) : null}
          </div>

          <div style={panelStyle}>
            <label style={labelStyle}>Election officer roll numbers</label>
            <textarea
              style={
                commissionErrors.officerRollNumbers
                  ? { ...textareaStyle, borderColor: "var(--color-danger)" }
                  : textareaStyle
              }
              value={form.electionCommission.officerRollNumbers.join(", ")}
              onChange={(event) =>
                updateForm({
                  electionCommission: {
                    ...form.electionCommission,
                    officerRollNumbers: splitListInput(event.target.value).map((item) => item.toUpperCase()),
                  },
                })
              }
              placeholder="Comma or newline separated roll numbers"
            />
            {commissionErrors.officerRollNumbers ? (
              <div style={errorTextStyle}>{commissionErrors.officerRollNumbers}</div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "posts" && activePost) {
    body = (
      <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
        <div style={flatPanelStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
              marginBottom: "var(--spacing-3)",
            }}
          >
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Election posts</div>
              <div style={mutedTextStyle}>Define each post, its electorate, and its contesting requirements.</div>
            </div>
            <Button size="sm" variant="secondary" onClick={addPost}>
              <Plus size={14} /> Add Post
            </Button>
          </div>

          <div style={postTabListStyle}>
            {form.posts.map((post, index) => {
              const isActive = index === activePostIndex
              const hasError = postErrors[index] && Object.keys(postErrors[index]).length > 0
              return (
                <button
                  key={post.id || `post-${index}`}
                  type="button"
                  onClick={() => setActivePostIndex(index)}
                  style={{
                    ...postTabStyle,
                    borderColor: hasError
                      ? "var(--color-danger)"
                      : isActive
                        ? "var(--color-primary)"
                        : "var(--color-border-primary)",
                    backgroundColor: isActive ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                    color: hasError
                      ? "var(--color-danger-text)"
                      : isActive
                        ? "var(--color-primary)"
                        : "var(--color-text-body)",
                  }}
                >
                  {post.title || `Post ${index + 1}`}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ ...panelStyle, display: "grid", gap: "var(--spacing-4)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Selected post</div>
              <div
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-heading)",
                }}
              >
                {activePost.title || `Post ${activePostIndex + 1}`}
              </div>
            </div>
            {form.posts.length > 1 ? (
              <Button size="sm" variant="ghost" onClick={() => removePost(activePostIndex)}>
                Remove Post
              </Button>
            ) : null}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--spacing-3)",
            }}
          >
            <div>
              <label style={labelStyle}>Post title</label>
              <Input
                style={activePostErrors.title ? { borderColor: "var(--color-danger)" } : undefined}
                value={activePost.title}
                onChange={(event) => updatePost(activePostIndex, { title: event.target.value })}
              />
              {activePostErrors.title ? <div style={errorTextStyle}>{activePostErrors.title}</div> : null}
            </div>
            <div>
              <label style={labelStyle}>Code</label>
              <Input
                style={activePostErrors.code ? { borderColor: "var(--color-danger)" } : undefined}
                value={activePost.code}
                onChange={(event) => updatePost(activePostIndex, { code: event.target.value.toUpperCase() })}
              />
              {activePostErrors.code ? <div style={errorTextStyle}>{activePostErrors.code}</div> : null}
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                style={activePostErrors.category ? { ...selectStyle, borderColor: "var(--color-danger)" } : selectStyle}
                value={activePost.category}
                onChange={(event) => updatePost(activePostIndex, { category: event.target.value })}
              >
                {postCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {activePostErrors.category ? <div style={errorTextStyle}>{activePostErrors.category}</div> : null}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={activePostErrors.description ? { ...textareaStyle, borderColor: "var(--color-danger)" } : textareaStyle}
              value={activePost.description}
              onChange={(event) => updatePost(activePostIndex, { description: event.target.value })}
            />
            {activePostErrors.description ? <div style={errorTextStyle}>{activePostErrors.description}</div> : null}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "var(--spacing-3)",
            }}
          >
            <ScopeEditor
              title="Candidate eligibility"
              scope={activePost.candidateEligibility}
              onChange={(scope) => updatePost(activePostIndex, { candidateEligibility: scope })}
              batchOptions={batchOptions}
              groupOptions={groupOptions}
              error={activePostErrors.candidateEligibility}
              flatPanelStyle={flatPanelStyle}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
              pillBaseStyle={pillBaseStyle}
              errorTextStyle={errorTextStyle}
              nominationTemplateHeaders={nominationTemplateHeaders}
            />
            <ScopeEditor
              title="Voter eligibility"
              scope={activePost.voterEligibility}
              onChange={(scope) => updatePost(activePostIndex, { voterEligibility: scope })}
              batchOptions={batchOptions}
              groupOptions={groupOptions}
              error={activePostErrors.voterEligibility}
              flatPanelStyle={flatPanelStyle}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
              pillBaseStyle={pillBaseStyle}
              errorTextStyle={errorTextStyle}
              nominationTemplateHeaders={nominationTemplateHeaders}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "var(--spacing-3)",
            }}
          >
            {requirementFieldDefs.map((field) => (
              <div key={field.key}>
                <label style={labelStyle}>{field.label}</label>
                <Input
                  style={activePostErrors[field.key] ? { borderColor: "var(--color-danger)" } : undefined}
                  type="number"
                  step={field.step || "1"}
                  value={activePost.requirements[field.key]}
                  onChange={(event) => updatePostRequirements(activePostIndex, field.key, event.target.value)}
                />
                {activePostErrors[field.key] ? <div style={errorTextStyle}>{activePostErrors[field.key]}</div> : null}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--spacing-3)",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-body)" }}>
              <input
                type="checkbox"
                checked={Boolean(activePost.requirements.requireHostelResident)}
                onChange={(event) =>
                  updatePostRequirements(activePostIndex, "requireHostelResident", event.target.checked)
                }
              />
              Restrict by hostel residence
            </label>
          </div>

          {activePost.requirements.requireHostelResident ? (
            <div style={flatPanelStyle}>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Allowed hostels</div>
              <div style={mutedTextStyle}>Select hostels from the shared hostel list.</div>
              <div style={{ marginTop: "var(--spacing-3)" }}>
                <HostelPicker
                  selectedHostels={activePost.requirements.allowedHostelNames}
                  hostels={hostels}
                  onChange={(value) => updatePostRequirements(activePostIndex, "allowedHostelNames", value)}
                  pillBaseStyle={pillBaseStyle}
                  mutedTextStyle={mutedTextStyle}
                />
              </div>
              {activePostErrors.allowedHostelNames ? (
                <div style={errorTextStyle}>{activePostErrors.allowedHostelNames}</div>
              ) : null}
            </div>
          ) : null}

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={activePostErrors.notes ? { ...textareaStyle, borderColor: "var(--color-danger)" } : textareaStyle}
              value={activePost.requirements.notes}
              onChange={(event) => updatePostRequirements(activePostIndex, "notes", event.target.value)}
              placeholder="Add constitutional notes or post-specific clarifications."
            />
            {activePostErrors.notes ? <div style={errorTextStyle}>{activePostErrors.notes}</div> : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === "edit" ? "Edit Election" : "Create Election"}
        width={1040}
        fullHeight={true}
        footer={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Button size="sm" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStep(wizardSteps[currentStepIndex - 1].id)}
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              {isLastStep ? (
                <Button size="sm" onClick={handleSave} loading={saving} disabled={saving}>
                  <BadgeCheck size={14} /> {mode === "edit" ? "Save Changes" : "Create Election"}
                </Button>
              ) : (
                <Button size="sm" onClick={goToNextStep}>
                  Next <ChevronRight size={14} />
                </Button>
              )}
            </div>
            <StepIndicator
              steps={wizardSteps}
              currentStep={currentStep}
              compact
              onStepClick={(stepId) => setCurrentStep(stepId)}
            />
          </div>
        }
      >
        <div style={wizardBodyStyle}>
          {currentStep === "posts" && wizardErrors.general ? (
            <div style={errorBannerStyle}>{wizardErrors.general}</div>
          ) : null}
          {body}
        </div>
      </Modal>
      <ConfirmationDialog
        isOpen={showMockEnableConfirm}
        onClose={() => setShowMockEnableConfirm(false)}
        onConfirm={() => {
          updateMockSettings({ enabled: true })
          setShowMockEnableConfirm(false)
        }}
        title="Enable Mock Election"
        message="Only students from the uploaded mock voter list will receive the voting email for this election. You can upload or replace that list in this step."
        confirmText="Enable Mock"
      />
    </>
  )
}

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

  const SectionCard = ({ icon: Icon, title, children }) => (
    <div
      style={{
        background: "var(--color-bg-tertiary)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-3) var(--spacing-4)",
        border: "1px solid var(--color-border-light)",
        display: "grid",
        gap: "var(--spacing-3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, var(--color-primary-bg), color-mix(in srgb, var(--color-primary-bg) 76%, white 24%))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
          }}
        >
          <Icon size={13} />
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </div>
      </div>
      {children}
    </div>
  )

  const StudentSummaryCard = ({
    name,
    email,
    image,
    subtitle,
    onClick,
    loading = false,
  }) => (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-3)",
        padding: "var(--spacing-3)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-bg-primary)",
        border: "1px solid var(--color-border-primary)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(event) => {
        if (!onClick) return
        event.currentTarget.style.borderColor = "var(--color-border-hover)"
        event.currentTarget.style.transform = "translateY(-1px)"
      }}
      onMouseLeave={(event) => {
        if (!onClick) return
        event.currentTarget.style.borderColor = "var(--color-border-primary)"
        event.currentTarget.style.transform = "translateY(0)"
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
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary-bg)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "var(--font-weight-semibold)",
            flexShrink: 0,
          }}
        >
          {(name || "?").trim().charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1, display: "grid", gap: "2px" }}>
        <div
          style={{
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-heading)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name || "Unknown student"}
        </div>
        {subtitle ? <div style={mutedTextStyle}>{subtitle}</div> : null}
        {email ? (
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </div>
        ) : null}
      </div>
      {loading ? <span style={mutedTextStyle}>Opening...</span> : null}
    </div>
  )

  const renderSupporterList = (entries = []) => {
    if (entries.length === 0) {
      return <div style={mutedTextStyle}>No supporters added.</div>
    }

    return (
      <div style={{ display: "grid", gap: "10px" }}>
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
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-primary-bg)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "var(--font-weight-semibold)",
                    flexShrink: 0,
                  }}
                >
                  {(entry.name || entry.rollNumber || "?").trim().charAt(0).toUpperCase()}
                </div>
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
                <div
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--color-text-heading)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.name || entry.rollNumber}
                </div>
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
      </div>
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
            <div style={{ display: "flex", gap: "8px" }}>
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
            </div>
          </div>
        }
      >
        <div style={modalBodyStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "var(--spacing-3)",
              alignItems: "start",
            }}
          >
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
              />
              <div style={detailGridStyle}>
                <div style={detailPanelStyle}>
                  <div style={labelStyle}>Academic details</div>
                  <MetaList
                    items={[
                      { label: "CGPA", value: nomination.cgpa ?? "—" },
                      { label: "No active backlog", value: nomination.hasNoActiveBacklogs ? "Yes" : "No" },
                    ]}
                    mutedTextStyle={mutedTextStyle}
                  />
                </div>
                <div style={detailPanelStyle}>
                  <div style={labelStyle}>Nomination</div>
                  <MetaList
                    items={[
                      { label: "Submitted", value: formatDateTime(nomination.submittedAt) },
                      { label: "Post", value: nomination.postTitle || "—" },
                    ]}
                    mutedTextStyle={mutedTextStyle}
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
                  {noteError ? <div style={{ color: "var(--color-danger-text)", fontSize: "var(--font-size-xs)" }}>{noteError}</div> : null}
                </>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "var(--spacing-3)",
              alignItems: "start",
            }}
          >
            <SectionCard icon={Users} title="Proposers">
              {renderSupporterList(nomination.proposerEntries || [])}
            </SectionCard>

            <SectionCard icon={Users} title="Seconders">
              {renderSupporterList(nomination.seconderEntries || [])}
            </SectionCard>
          </div>

          <div style={detailGridStyle}>
            {[
              { label: "Grade Card", value: nomination.gradeCardUrl },
              { label: "Manifesto (Optional)", value: nomination.manifestoUrl },
              { label: "POR Documents", value: nomination.porDocumentUrl },
              { label: "Student ID Front", value: nomination.candidateIdCard?.front || "" },
              { label: "Student ID Back", value: nomination.candidateIdCard?.back || "" },
            ].map((item) => (
              <div key={item.label} style={detailPanelStyle}>
                <div style={labelStyle}>{item.label}</div>
                {item.value ? (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Button size="sm" variant="secondary" onClick={() => setViewerUrl(item.value)}>
                      View
                    </Button>
                    <a
                      href={getMediaUrl(item.value)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "var(--color-primary)",
                        textDecoration: "none",
                        fontWeight: "var(--font-weight-medium)",
                        alignSelf: "center",
                      }}
                    >
                      Open
                    </a>
                  </div>
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

export const StudentNominationModal = ({
  election,
  post,
  form,
  setForm,
  onSupporterChange,
  onLookupSupporter,
  onAddSupporter,
  onRemoveSupporter,
  supportLookupKey,
  onClose,
  onSave,
  saving,
  currentUserId,
  modalBodyStyle,
  badgeRowStyle,
  detailGridStyle,
  detailPanelStyle,
  labelStyle,
  flatPanelStyle,
  mutedTextStyle,
  panelStyle,
  textareaStyle,
  pillBaseStyle,
  statusToneStyles,
}) => {
  const navigate = useNavigate()
  const [idCard, setIdCard] = useState({ front: "", back: "" })
  const [loadingIdCard, setLoadingIdCard] = useState(false)
  const [viewerUrl, setViewerUrl] = useState("")

  useEffect(() => {
    let isActive = true

    const loadIdCard = async () => {
      if (!currentUserId || !post) {
        if (isActive) {
          setIdCard({ front: "", back: "" })
        }
        return
      }

      try {
        setLoadingIdCard(true)
        const response = await idCardApi.getIDcard(currentUserId)
        if (!isActive) return
        setIdCard({
          front: response?.front || "",
          back: response?.back || "",
        })
      } catch (_error) {
        if (!isActive) return
        setIdCard({ front: "", back: "" })
      } finally {
        if (isActive) {
          setLoadingIdCard(false)
        }
      }
    }

    loadIdCard()

    return () => {
      isActive = false
    }
  }, [currentUserId, post?.id])

  const updateForm = (patch) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }))
  }

  const hasUploadedIdCard = Boolean(idCard.front || idCard.back)
  const reviewNote = String(post?.myNomination?.review?.notes || "").trim()
  const hasReviewNote = reviewNote.length > 0
  const proposerRequired = Math.max(1, Number(post?.requirements?.proposersRequired || 1))
  const seconderRequired = Math.max(1, Number(post?.requirements?.secondersRequired || 1))

  if (!post) return null

  return (
    <>
      <Modal
        isOpen={Boolean(post)}
        onClose={onClose}
        title={`Nomination · ${post.title}`}
        width={720}
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
              <StatusPill tone="default" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                {election?.title}
              </StatusPill>
              <StatusPill tone="primary" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                P {proposerRequired}
              </StatusPill>
              <StatusPill tone="primary" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                S {seconderRequired}
              </StatusPill>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="sm" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                loading={saving}
                disabled={saving || loadingIdCard || !hasUploadedIdCard}
              >
                <FileText size={14} /> Save
              </Button>
            </div>
          </div>
        }
      >
        <div style={modalBodyStyle}>
          {hasReviewNote ? (
            <Alert
              type={post?.myNomination?.status === "modification_requested" ? "warning" : "info"}
              title={
                post?.myNomination?.status === "modification_requested"
                  ? "Modification requested"
                  : "Review comment"
              }
            >
              {reviewNote}
            </Alert>
          ) : null}

          {loadingIdCard ? (
            <Alert type="info">Checking your student ID card...</Alert>
          ) : !hasUploadedIdCard ? (
            <Alert type="warning" title="Student ID card required">
              Upload your student ID card from the Student ID Card page before submitting nomination.
              <div style={{ marginTop: "var(--spacing-3)" }}>
                <Button size="sm" variant="secondary" onClick={() => navigate("/student/id-card")}>
                  Open ID Card Page
                </Button>
              </div>
            </Alert>
          ) : (
            <div style={detailPanelStyle}>
              <div style={labelStyle}>Student ID card</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "var(--spacing-3)",
                }}
              >
                {[
                  { label: "Front", value: idCard.front },
                  { label: "Back", value: idCard.back },
                ].map((item) => (
                  <div key={item.label} style={flatPanelStyle}>
                    <div style={{ ...labelStyle, marginBottom: "8px" }}>{item.label}</div>
                    {item.value ? (
                      <div style={{ display: "grid", gap: "10px" }}>
                        <div
                          style={{
                            border: "1px solid var(--color-border-primary)",
                            borderRadius: "var(--radius-lg)",
                            minHeight: "120px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            backgroundColor: "var(--color-bg-primary)",
                          }}
                        >
                          <img
                            src={getMediaUrl(item.value)}
                            alt={`Student ID ${item.label}`}
                            style={{ width: "100%", maxHeight: "140px", objectFit: "contain" }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <Button size="sm" variant="secondary" onClick={() => setViewerUrl(item.value)}>
                            View
                          </Button>
                          <a
                            href={getMediaUrl(item.value)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "var(--color-primary)", textDecoration: "none", alignSelf: "center" }}
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span style={mutedTextStyle}>Not uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--spacing-3)" }}>
            <div style={panelStyle}>
              <label style={labelStyle}>CGPA</label>
              <Input type="number" value={form.cgpa} onChange={(event) => updateForm({ cgpa: event.target.value })} />
            </div>
          </div>

          <div style={flatPanelStyle}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                color: "var(--color-text-body)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(form.hasNoActiveBacklogs)}
                onChange={(event) => updateForm({ hasNoActiveBacklogs: event.target.checked })}
                style={{ marginTop: "2px" }}
              />
              <span>
                I confirm that I do not have any active backlog and that I understand I can keep only one active
                nomination in this election at a time.
              </span>
            </label>
          </div>

          <div style={detailGridStyle}>
            {[
              {
                supportType: "proposer",
                label: "Proposers",
                entries: form.proposerEntries || [],
                requiredCount: proposerRequired,
              },
              {
                supportType: "seconder",
                label: "Seconders",
                entries: form.seconderEntries || [],
                requiredCount: seconderRequired,
              },
            ].map((section) => (
              <div key={section.supportType} style={flatPanelStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "var(--spacing-2)",
                  }}
                >
                  <div>
                    <div style={labelStyle}>{section.label}</div>
                    <div style={mutedTextStyle}>
                      Required: {section.requiredCount}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAddSupporter?.(section.supportType)}
                  >
                    <Plus size={14} /> Add
                  </Button>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {section.entries.map((entry, index) => {
                    const rowKey = `${election?.id}:${post?.id}:${section.supportType}:${index}`
                    const isLookingUp = supportLookupKey === rowKey
                    return (
                      <div
                        key={rowKey}
                        style={{
                          border: "1px solid var(--color-border-primary)",
                          borderRadius: "var(--radius-lg)",
                          padding: "var(--spacing-3)",
                          display: "grid",
                          gap: "8px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Input
                            value={entry.rollNumber || ""}
                            placeholder={`Roll number ${index + 1}`}
                            onChange={(event) =>
                              onSupporterChange?.(section.supportType, index, {
                                rollNumber: String(event.target.value || "").toUpperCase(),
                                userId: "",
                                name: "",
                                email: "",
                                profileImage: "",
                                lookupStatus: "idle",
                                lookupMessage: "",
                                supportStatus: "",
                                supportRole: "",
                              })
                            }
                            onBlur={(event) => onLookupSupporter?.(section.supportType, index, event.target.value)}
                          />
                          {section.entries.length > section.requiredCount ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onRemoveSupporter?.(section.supportType, index)}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </div>

                        {isLookingUp ? (
                          <div style={mutedTextStyle}>Checking roll number...</div>
                        ) : null}

                        {entry.name ? (
                          <div style={{ display: "grid", gap: "2px" }}>
                            <div style={{ fontWeight: "var(--font-weight-medium)" }}>{entry.name}</div>
                            <div style={mutedTextStyle}>
                              {entry.lookupMessage || "Verified"}
                            </div>
                          </div>
                        ) : null}

                        {!entry.name && entry.lookupStatus === "invalid" ? (
                          <div style={{ color: "var(--color-danger-text)", fontSize: "var(--font-size-sm)" }}>
                            {entry.lookupMessage || "Unable to verify this roll number"}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={detailGridStyle}>
            <DocumentUploadField
              label="Grade Card"
              value={form.gradeCardUrl}
              onChange={(nextValue) => updateForm({ gradeCardUrl: nextValue })}
              required
              flatPanelStyle={flatPanelStyle}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
            />
            <DocumentUploadField
              label="Manifesto (Optional)"
              value={form.manifestoUrl}
              onChange={(nextValue) => updateForm({ manifestoUrl: nextValue })}
              flatPanelStyle={flatPanelStyle}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
            />
            <DocumentUploadField
              label="POR Documents (Optional)"
              value={form.porDocumentUrl}
              onChange={(nextValue) => updateForm({ porDocumentUrl: nextValue })}
              flatPanelStyle={flatPanelStyle}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
            />
          </div>
        </div>
      </Modal>

      <CertificateViewerModal
        isOpen={Boolean(viewerUrl)}
        onClose={() => setViewerUrl("")}
        certificateUrl={viewerUrl}
      />
    </>
  )
}

export const AdminResultsEditModal = ({
  postResult,
  draft,
  onClose,
  onChange,
  modalBodyStyle,
  badgeRowStyle,
  flatPanelStyle,
  labelStyle,
  textareaStyle,
  mutedTextStyle,
  pillBaseStyle,
  statusToneStyles,
}) => {
  if (!postResult) return null

  return (
    <Modal
      isOpen={Boolean(postResult)}
      onClose={onClose}
      title={`Results · ${postResult.postTitle}`}
      width={720}
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
            <StatusPill tone="default" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
              {postResult.totalVotes} vote(s)
            </StatusPill>
            {postResult.previewWinnerName ? (
              <StatusPill tone="success" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                Lead: {postResult.previewWinnerName}
              </StatusPill>
            ) : null}
          </div>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={modalBodyStyle}>
        {(postResult.candidates || []).length === 0 ? (
          <div style={{ padding: "var(--spacing-5)", color: "var(--color-text-muted)", textAlign: "center" }}>
            No verified candidates. Results will appear here after verification and voting.
          </div>
        ) : (
          <>
            <div style={{ ...flatPanelStyle, display: "grid", gap: "10px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--color-text-body)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                <input
                  type="checkbox"
                  checked={draft?.showVoteCountToStudents !== false}
                  onChange={(event) => onChange({ showVoteCountToStudents: event.target.checked })}
                />
                Show vote count to students for this post
              </label>
              <div style={mutedTextStyle}>
                Leave this on to show candidate vote counts and percentages to students after result publication.
                Turn it off to publish only the winner/result without the counts.
              </div>
            </div>

            <div style={{ ...flatPanelStyle, display: "grid", gap: "10px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--color-text-body)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(draft?.winnerIsTie)}
                  onChange={(event) => {
                    const nextIsTie = event.target.checked
                    const selectedWinnerIds = Array.isArray(draft?.winnerNominationIds)
                      ? draft.winnerNominationIds.map((value) => String(value))
                      : draft?.winnerNominationId
                        ? [String(draft.winnerNominationId)]
                        : []

                    if (!nextIsTie) {
                      const nextSingleWinnerId = selectedWinnerIds[0] || ""
                      onChange({
                        winnerIsTie: false,
                        winnerNominationIds: nextSingleWinnerId ? [nextSingleWinnerId] : [],
                        winnerNominationId: nextSingleWinnerId,
                      })
                      return
                    }

                    onChange({
                      winnerIsTie: true,
                      winnerNominationIds: selectedWinnerIds,
                      winnerNominationId: selectedWinnerIds[0] || "",
                    })
                  }}
                />
                Publish this post as a tie
              </label>
              <div style={mutedTextStyle}>
                Turn this on to select multiple tied winners for the published result. Leave it off to publish a
                single winner.
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {(postResult.candidates || []).map((candidate) => {
                const selectedWinnerIds = Array.isArray(draft?.winnerNominationIds)
                  ? draft.winnerNominationIds.map((value) => String(value))
                  : draft?.winnerNominationId
                    ? [String(draft.winnerNominationId)]
                    : []
                const checked = selectedWinnerIds.includes(String(candidate.nominationId))
                return (
                  <label
                    key={candidate.nominationId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--spacing-3)",
                      padding: "var(--spacing-3)",
                      border: "1px solid var(--color-border-primary)",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: checked ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                      <input
                        type={draft?.winnerIsTie ? "checkbox" : "radio"}
                        name={`winner-${postResult.postId}`}
                        checked={checked}
                        onChange={() => {
                          if (draft?.winnerIsTie) {
                            const nextIds = checked
                              ? selectedWinnerIds.filter((value) => value !== String(candidate.nominationId))
                              : [...selectedWinnerIds, String(candidate.nominationId)]
                            onChange({
                              winnerNominationIds: nextIds,
                              winnerNominationId: nextIds[0] || "",
                            })
                            return
                          }

                          onChange({
                            winnerNominationIds: [String(candidate.nominationId)],
                            winnerNominationId: String(candidate.nominationId),
                          })
                        }}
                      />
                      <div style={{ display: "grid", gap: "4px" }}>
                        <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                          {candidate.candidateName}
                        </span>
                        {!candidate.isNota && candidate.candidateRollNumber ? (
                          <span style={mutedTextStyle}>{candidate.candidateRollNumber}</span>
                        ) : null}
                      </div>
                    </div>
                    <strong style={{ color: "var(--color-text-heading)" }}>{candidate.voteCount}</strong>
                  </label>
                )
              })}
            </div>

            {draft?.winnerIsTie && (draft?.winnerNominationIds || []).length < 2 ? (
              <div style={mutedTextStyle}>Select at least two options to publish this post as a tie.</div>
            ) : null}

            <div style={flatPanelStyle}>
              <label style={labelStyle}>Notes</label>
              <textarea
                style={textareaStyle}
                value={draft?.notes || ""}
                onChange={(event) => onChange({ notes: event.target.value })}
                placeholder="Optional notes for this result."
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
