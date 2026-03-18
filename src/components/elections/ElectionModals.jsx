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
  XCircle,
} from "lucide-react"
import StepIndicator from "@/components/ui/navigation/StepIndicator"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import { Alert } from "@/components/ui/feedback"
import { idCardApi } from "@/service"
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

export const ElectionWizardModal = ({
  isOpen,
  mode,
  form,
  setForm,
  onClose,
  onSave,
  saving,
  batchOptions,
  hostels,
  createBlankPost,
  buildD15Timeline,
  validateElectionWizard,
  createEmptyWizardErrors,
  wizardSteps,
  phaseOptions,
  statusOptions,
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

  useEffect(() => {
    if (isOpen) {
      setCurrentStep("basics")
      setActivePostIndex(0)
      setWizardErrors(createEmptyWizardErrors())
    }
  }, [createEmptyWizardErrors, isOpen, mode])

  const currentStepIndex = wizardSteps.findIndex((step) => step.id === currentStep)
  const isLastStep = currentStepIndex === wizardSteps.length - 1
  const activePost = form.posts[activePostIndex] || form.posts[0]
  const basicsErrors = wizardErrors.basics || {}
  const timelineErrors = wizardErrors.timeline || {}
  const commissionErrors = wizardErrors.commission || {}
  const postErrors = wizardErrors.posts || []
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
        </div>

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
                Set the polling start time, then apply the D-15 template to prefill the rest of the schedule.
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
          {timelineFieldDefs.map((field) => (
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
                checked={Boolean(activePost.requirements.requireElectorateMembership)}
                onChange={(event) =>
                  updatePostRequirements(activePostIndex, "requireElectorateMembership", event.target.checked)
                }
              />
              Candidate must belong to electorate
            </label>
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Election" : "Create Election"}
      width={1040}
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
      <div style={modalBodyStyle}>
        {currentStep === "posts" && wizardErrors.general ? (
          <div style={errorBannerStyle}>{wizardErrors.general}</div>
        ) : null}
        {body}
      </div>
    </Modal>
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
}) => {
  const [viewerUrl, setViewerUrl] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [noteError, setNoteError] = useState("")

  useEffect(() => {
    setReviewNotes(nomination?.review?.notes || "")
    setNoteError("")
  }, [nomination])

  if (!nomination) return null

  const handleReviewAction = (status) => {
    const trimmedNotes = String(reviewNotes || "").trim()
    if (status === "modification_requested" && trimmedNotes.length < 3) {
      setNoteError("Add a clear comment before requesting modification.")
      return
    }

    setNoteError("")
    onReview(nomination.id, status, trimmedNotes)
  }

  return (
    <>
      <Modal
        isOpen={Boolean(nomination)}
        onClose={onClose}
        title={nomination.candidateName || nomination.candidateRollNumber}
        width={760}
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
            </div>
          </div>
        }
      >
        <div style={modalBodyStyle}>
          <div style={detailGridStyle}>
            <div style={detailPanelStyle}>
              <div style={labelStyle}>Academic details</div>
              <MetaList
                items={[
                  { label: "CGPA", value: nomination.cgpa ?? "—" },
                  { label: "Completed semesters", value: nomination.completedSemesters ?? "—" },
                  { label: "Remaining semesters", value: nomination.remainingSemesters ?? "—" },
                  { label: "Submitted", value: formatDateTime(nomination.submittedAt) },
                ]}
                mutedTextStyle={mutedTextStyle}
              />
            </div>

            <div style={detailPanelStyle}>
              <div style={labelStyle}>Supporting students</div>
              <MetaList
                items={[
                  { label: "Proposers", value: (nomination.proposerRollNumbers || []).join(", ") || "—" },
                  { label: "Seconders", value: (nomination.seconderRollNumbers || []).join(", ") || "—" },
                ]}
                mutedTextStyle={mutedTextStyle}
              />
            </div>
          </div>

          {nomination.pitch ? (
            <div style={detailPanelStyle}>
              <div style={labelStyle}>Pitch</div>
              <div style={{ color: "var(--color-text-body)", lineHeight: 1.6 }}>{nomination.pitch}</div>
            </div>
          ) : null}

          {(nomination.agendaPoints || []).length > 0 ? (
            <div style={detailPanelStyle}>
              <div style={labelStyle}>Agenda points</div>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--color-text-body)", lineHeight: 1.7 }}>
                {nomination.agendaPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div style={detailPanelStyle}>
            <div style={labelStyle}>Review comment</div>
            <textarea
              style={noteError ? { ...textareaStyle, borderColor: "var(--color-danger)" } : textareaStyle}
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
              placeholder="Add review feedback. This is required when requesting modification."
            />
            {noteError ? <div style={{ color: "var(--color-danger-text)", fontSize: "var(--font-size-xs)" }}>{noteError}</div> : null}
          </div>

          <div style={detailGridStyle}>
            {[
              { label: "Grade Card", value: nomination.gradeCardUrl },
              { label: "Manifesto", value: nomination.manifestoUrl },
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
    </>
  )
}

export const StudentNominationModal = ({
  election,
  post,
  form,
  setForm,
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
                P {post.requirements?.proposersRequired || 0}
              </StatusPill>
              <StatusPill tone="primary" pillBaseStyle={pillBaseStyle} statusToneStyles={statusToneStyles}>
                S {post.requirements?.secondersRequired || 0}
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-3)" }}>
            <div style={panelStyle}>
              <label style={labelStyle}>CGPA</label>
              <Input type="number" value={form.cgpa} onChange={(event) => updateForm({ cgpa: event.target.value })} />
            </div>
            <div style={panelStyle}>
              <label style={labelStyle}>Completed semesters</label>
              <Input
                type="number"
                value={form.completedSemesters}
                onChange={(event) => updateForm({ completedSemesters: event.target.value })}
              />
            </div>
            <div style={panelStyle}>
              <label style={labelStyle}>Remaining semesters</label>
              <Input
                type="number"
                value={form.remainingSemesters}
                onChange={(event) => updateForm({ remainingSemesters: event.target.value })}
              />
            </div>
          </div>

          <div style={flatPanelStyle}>
            <label style={labelStyle}>Pitch</label>
            <textarea style={textareaStyle} value={form.pitch} onChange={(event) => updateForm({ pitch: event.target.value })} />
          </div>

          <div style={flatPanelStyle}>
            <label style={labelStyle}>Agenda points</label>
            <textarea
              style={textareaStyle}
              value={form.agendaPoints}
              onChange={(event) => updateForm({ agendaPoints: event.target.value })}
              placeholder="One agenda point per line"
            />
          </div>

          <div style={detailGridStyle}>
            <div style={flatPanelStyle}>
              <label style={labelStyle}>Proposer roll numbers</label>
              <textarea
                style={{ ...textareaStyle, minHeight: "56px" }}
                value={form.proposerRollNumbers}
                onChange={(event) => updateForm({ proposerRollNumbers: event.target.value })}
              />
            </div>
            <div style={flatPanelStyle}>
              <label style={labelStyle}>Seconder roll numbers</label>
              <textarea
                style={{ ...textareaStyle, minHeight: "56px" }}
                value={form.seconderRollNumbers}
                onChange={(event) => updateForm({ seconderRollNumbers: event.target.value })}
              />
            </div>
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
              label="Manifesto"
              value={form.manifestoUrl}
              onChange={(nextValue) => updateForm({ manifestoUrl: nextValue })}
              flatPanelStyle={flatPanelStyle}
              labelStyle={labelStyle}
              mutedTextStyle={mutedTextStyle}
            />
            <DocumentUploadField
              label="POR Documents"
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
            <div style={{ display: "grid", gap: "12px" }}>
              {(postResult.candidates || []).map((candidate) => {
                const checked = String(draft?.winnerNominationId || "") === String(candidate.nominationId)
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
                        type="radio"
                        name={`winner-${postResult.postId}`}
                        checked={checked}
                        onChange={() => onChange({ winnerNominationId: candidate.nominationId })}
                      />
                      <div style={{ display: "grid", gap: "4px" }}>
                        <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                          {candidate.candidateName}
                        </span>
                        <span style={mutedTextStyle}>{candidate.candidateRollNumber}</span>
                      </div>
                    </div>
                    <strong style={{ color: "var(--color-text-heading)" }}>{candidate.voteCount}</strong>
                  </label>
                )
              })}
            </div>

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
