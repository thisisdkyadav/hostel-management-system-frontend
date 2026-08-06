import { useEffect, useState } from "react"
import { Button, Input } from "czero/react"
import { Grid, HStack, Modal, Text } from "@/components/ui"
import { BadgeCheck, ChevronLeft, ChevronRight, History, Plus } from "lucide-react"
import StepIndicator from "@/components/ui/navigation/StepIndicator"
import ConfirmationDialog from "@/components/common/ConfirmationDialog"
import CsvUploader from "@/components/common/CsvUploader"
import { Alert } from "@/components/ui/feedback"
import { HostelPicker, ScopeEditor } from "@/components/elections/ElectionShared"

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
      <Grid cols={1} gap={4}>
        <Grid min={220} gap={3}>
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
        </Grid>

        {["email", "both"].includes(form.votingAccess?.mode || "both") ? (
          <div style={flatPanelStyle}>
            <HStack gap={3} align="center" justify="between" wrap>
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
            </HStack>
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
          <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: form.mockSettings?.enabled ? "var(--spacing-3)" : 0 }}>
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
          </HStack>

          {form.mockSettings?.enabled ? (
            <Grid cols={1} gap={3}>
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
            </Grid>
          ) : null}
        </div>
      </Grid>
    )
  }

  if (currentStep === "timeline") {
    body = (
      <Grid cols={1} gap={4}>
        <div style={flatPanelStyle}>
          <HStack gap={3} align="center" justify="between" wrap>
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Election schedule</div>
              <div style={mutedTextStyle}>
                Set the polling start time, then apply the D-15 template to prefill the rest of the schedule. Link sending starts 6 hours before voting by default.
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={applyD15Timeline}>
              <History size={14} /> Apply D-15 Guide
            </Button>
          </HStack>
        </div>

        <Grid min={220} gap={3}>
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
        </Grid>

        <div style={timelinePreviewStyle}>
          {timelineFieldDefs.slice(0, 6).map((field) => (
            <div key={`${field.key}-preview`} style={timelineCellStyle}>
              <div style={labelStyle}>{field.label}</div>
              <Text as="div" color="body" weight="medium">
                {form.timeline[field.key]
                  ? formatDateTime(fromDateTimeLocal(form.timeline[field.key]))
                  : "Not set"}
              </Text>
            </div>
          ))}
        </div>
      </Grid>
    )
  }

  if (currentStep === "commission") {
    body = (
      <Grid cols={1} gap={4}>
        <div style={flatPanelStyle}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Election Commission</div>
          <div style={mutedTextStyle}>
            Capture the Chief Election Officer and the supporting election officers for this cycle.
          </div>
        </div>

        <Grid min={260} gap={3}>
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
        </Grid>
      </Grid>
    )
  }

  if (currentStep === "posts" && activePost) {
    body = (
      <Grid cols={1} gap={4}>
        <div style={flatPanelStyle}>
          <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Election posts</div>
              <div style={mutedTextStyle}>Define each post, its electorate, and its contesting requirements.</div>
            </div>
            <Button size="sm" variant="secondary" onClick={addPost}>
              <Plus size={14} /> Add Post
            </Button>
          </HStack>

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

        <Grid cols={1} gap={4} style={{ ...panelStyle }}>
          <HStack gap={3} align="start" justify="between" wrap>
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Selected post</div>
              <Text as="div" size="lg" weight="semibold" color="heading">
                {activePost.title || `Post ${activePostIndex + 1}`}
              </Text>
            </div>
            {form.posts.length > 1 ? (
              <Button size="sm" variant="ghost" onClick={() => removePost(activePostIndex)}>
                Remove Post
              </Button>
            ) : null}
          </HStack>

          <Grid min={220} gap={3}>
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
          </Grid>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={activePostErrors.description ? { ...textareaStyle, borderColor: "var(--color-danger)" } : textareaStyle}
              value={activePost.description}
              onChange={(event) => updatePost(activePostIndex, { description: event.target.value })}
            />
            {activePostErrors.description ? <div style={errorTextStyle}>{activePostErrors.description}</div> : null}
          </div>

          <Grid min={320} gap={3}>
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
          </Grid>

          <Grid min={180} gap={3}>
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
          </Grid>

          <Grid min={240} gap={3}>
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
          </Grid>

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
        </Grid>
      </Grid>
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
            <HStack gap="8px" align="center" wrap>
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
            </HStack>
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
