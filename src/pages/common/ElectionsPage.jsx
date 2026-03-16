import { useEffect, useMemo, useState } from "react"
import { Button } from "czero/react"
import { FileText, History, Plus } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { EmptyState, ErrorState, LoadingState, useToast } from "@/components/ui/feedback"
import { useAuth } from "@/contexts/AuthProvider"
import { useGlobal } from "@/contexts/GlobalProvider"
import { electionsApi, studentApi } from "@/service"
import AdminElectionWorkspace from "@/components/elections/AdminElectionWorkspace"
import StudentElectionWorkspace from "@/components/elections/StudentElectionWorkspace"
import {
  ElectionHistoryModal,
  ElectionWizardModal,
  AdminNominationReviewModal,
  StudentNominationModal,
  AdminResultsEditModal,
} from "@/components/elections/ElectionModals"
import { HeaderSelect } from "@/components/elections/ElectionShared"

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  minHeight: 0,
  overflow: "hidden",
}

const workspaceStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "var(--spacing-4) var(--spacing-6)",
  backgroundColor: "transparent",
}

const infoBannerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
  flexWrap: "wrap",
  padding: "var(--spacing-3) var(--spacing-4)",
  marginBottom: "var(--spacing-4)",
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
}

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "var(--spacing-3)",
  marginBottom: "var(--spacing-4)",
}

const badgeRowStyle = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  alignItems: "center",
}

const compactStatStyle = {
  padding: "var(--spacing-2) var(--spacing-3)",
  backgroundColor: "var(--color-bg-secondary)",
  borderRadius: "var(--radius-card-sm)",
  border: "1px solid var(--color-border-primary)",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
}

const compactStatLabelStyle = {
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
}

const compactStatValueStyle = {
  fontSize: "var(--font-size-base)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-heading)",
}

const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "var(--spacing-3)",
}

const detailPanelStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
  padding: "var(--spacing-3)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-2)",
}

const mutedTextStyle = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
}

const labelStyle = {
  display: "block",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "var(--spacing-1)",
}

const inputShellStyle = {
  width: "100%",
  border: "1px solid var(--color-border-input)",
  borderRadius: "var(--radius-input)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-primary)",
}

const selectStyle = {
  ...inputShellStyle,
  padding: "10px 12px",
  fontSize: "var(--font-size-sm)",
}

const headerSelectStyle = {
  ...selectStyle,
  minWidth: "320px",
  backgroundColor: "var(--color-bg-primary)",
}

const textareaStyle = {
  width: "100%",
  minHeight: "72px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "var(--radius-input)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-primary)",
  padding: "8px 12px",
  fontSize: "var(--font-size-sm)",
  resize: "vertical",
}

const panelStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-primary)",
  padding: "var(--spacing-3)",
}

const flatPanelStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
  padding: "var(--spacing-3)",
}

const pillBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  whiteSpace: "nowrap",
}

const timelinePreviewStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "var(--spacing-3)",
}

const timelineCellStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  padding: "var(--spacing-3)",
  backgroundColor: "var(--color-bg-primary)",
}

const postTabListStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
}

const postTabStyle = {
  ...pillBaseStyle,
  border: "1px solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-body)",
  cursor: "pointer",
}

const modalBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-3)",
  maxHeight: "72vh",
  overflowY: "auto",
  paddingRight: "var(--spacing-1)",
}

const modalHeroStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card)",
  padding: "var(--spacing-3)",
  backgroundColor: "var(--color-bg-primary)",
}

const errorTextStyle = {
  marginTop: "6px",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-danger-text)",
}

const errorBannerStyle = {
  padding: "var(--spacing-3) var(--spacing-4)",
  borderRadius: "var(--radius-card-sm)",
  border: "1px solid var(--color-danger)",
  backgroundColor: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  fontSize: "var(--font-size-sm)",
}

const nominationTemplateHeaders = ["rollNumber"]

const wizardSteps = [
  { id: "basics", label: "Basics", sublabel: "Identity & phase" },
  { id: "timeline", label: "Timeline", sublabel: "D-15 schedule" },
  { id: "commission", label: "Commission", sublabel: "CEO & officers" },
  { id: "posts", label: "Posts", sublabel: "Electorate & rules" },
]

const nominationTabs = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
]

const phaseOptions = [
  { value: "phase1", label: "Phase 1" },
  { value: "horc", label: "HORC" },
  { value: "custom", label: "Custom" },
]

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const postCategoryOptions = [
  { value: "executive", label: "Executive" },
  { value: "senator", label: "Senator" },
  { value: "horc", label: "HORC" },
  { value: "custom", label: "Custom" },
]

const timelineFieldDefs = [
  { key: "announcementAt", label: "Announcement", day: "D-15" },
  { key: "nominationStartAt", label: "Nomination Start", day: "D-14" },
  { key: "nominationEndAt", label: "Nomination End", day: "D-12" },
  { key: "withdrawalEndAt", label: "Withdrawal", day: "D-10" },
  { key: "campaigningStartAt", label: "Campaigning Start", day: "D-8" },
  { key: "campaigningEndAt", label: "Campaigning End", day: "D-2" },
  { key: "votingStartAt", label: "Voting Start", day: "D" },
  { key: "votingEndAt", label: "Voting End", day: "D" },
  { key: "resultsAnnouncedAt", label: "Results", day: "D+1" },
  { key: "handoverAt", label: "Handover", day: "Post-election" },
]

const requirementFieldDefs = [
  { key: "minCgpa", label: "Minimum CGPA", step: "0.1" },
  { key: "minCompletedSemestersUg", label: "UG semesters completed" },
  { key: "minCompletedSemestersPg", label: "PG semesters completed" },
  { key: "minRemainingSemesters", label: "Remaining semesters" },
  { key: "proposersRequired", label: "Proposers required" },
  { key: "secondersRequired", label: "Seconders required" },
]

const createBlankPost = () => ({
  id: "",
  title: "",
  code: "",
  category: "custom",
  description: "",
  candidateEligibility: {
    batches: [],
    extraRollNumbers: [],
  },
  voterEligibility: {
    batches: [],
    extraRollNumbers: [],
  },
  requirements: {
    minCgpa: 6,
    minCompletedSemestersUg: 3,
    minCompletedSemestersPg: 1,
    minRemainingSemesters: 2,
    proposersRequired: 3,
    secondersRequired: 5,
    requireElectorateMembership: true,
    requireHostelResident: false,
    allowedHostelNames: [],
    notes: "",
  },
})

const createBlankElectionForm = () => ({
  title: "",
  academicYear: "",
  phase: "phase1",
  description: "",
  status: "draft",
  electionCommission: {
    chiefElectionOfficerRollNumber: "",
    officerRollNumbers: [],
  },
  timeline: {
    announcementAt: "",
    nominationStartAt: "",
    nominationEndAt: "",
    withdrawalEndAt: "",
    campaigningStartAt: "",
    campaigningEndAt: "",
    votingStartAt: "",
    votingEndAt: "",
    resultsAnnouncedAt: "",
    handoverAt: "",
  },
  posts: [createBlankPost()],
})

const createBlankNominationForm = () => ({
  pitch: "",
  agendaPoints: "",
  cgpa: "",
  completedSemesters: "",
  remainingSemesters: "",
  proposerRollNumbers: "",
  seconderRollNumbers: "",
  gradeCardUrl: "",
  manifestoUrl: "",
})

const statusToneStyles = {
  primary: {
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
  },
  success: {
    backgroundColor: "var(--color-success-bg)",
    color: "var(--color-success-text)",
  },
  warning: {
    backgroundColor: "var(--color-warning-bg-light)",
    color: "var(--color-warning-text)",
  },
  danger: {
    backgroundColor: "var(--color-danger-bg-light)",
    color: "var(--color-danger-text)",
  },
  default: {
    backgroundColor: "var(--color-bg-secondary)",
    color: "var(--color-text-body)",
  },
}

const getStatusTone = (status) => {
  if (["verified", "published", "completed", "voting"].includes(status)) return "success"
  if (["rejected", "cancelled"].includes(status)) return "danger"
  if (["withdrawal", "campaigning", "results", "handover"].includes(status)) return "warning"
  if (["nomination", "announced", "draft", "submitted", "participation"].includes(status)) return "primary"
  return "default"
}

const formatStageLabel = (value) =>
  String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())

const formatDateTime = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

const toDateTimeLocal = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

const fromDateTimeLocal = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const splitListInput = (value) =>
  [...new Set(
    String(value || "")
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  )]

const daysToMs = (days) => days * 24 * 60 * 60 * 1000

const buildD15Timeline = (votingStartValue) => {
  const sourceValue =
    typeof votingStartValue === "string" && votingStartValue.length === 16
      ? fromDateTimeLocal(votingStartValue)
      : votingStartValue
  const votingStart = new Date(sourceValue)
  if (Number.isNaN(votingStart.getTime())) return null

  const votingEnd = new Date(votingStart.getTime() + 10 * 60 * 60 * 1000)
  return {
    announcementAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(15))),
    nominationStartAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(14))),
    nominationEndAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(12))),
    withdrawalEndAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(10))),
    campaigningStartAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(8))),
    campaigningEndAt: toDateTimeLocal(new Date(votingStart.getTime() - daysToMs(2))),
    votingStartAt: toDateTimeLocal(votingStart),
    votingEndAt: toDateTimeLocal(votingEnd),
    resultsAnnouncedAt: toDateTimeLocal(new Date(votingEnd.getTime() + daysToMs(1))),
    handoverAt: toDateTimeLocal(new Date(votingEnd.getTime() + daysToMs(20))),
  }
}

const summarizeScope = (scope = {}) => {
  const batches = Array.isArray(scope?.batches) ? scope.batches.length : 0
  const extra = Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers.length : 0
  if (batches === 0 && extra === 0) return "Not configured"
  if (batches > 0 && extra > 0) return `${batches} batch(es) + ${extra} CSV student(s)`
  if (batches > 0) return `${batches} batch(es)`
  return `${extra} CSV student(s)`
}

const sortByActivity = (items = []) => {
  const activeStages = new Set([
    "announced",
    "nomination",
    "withdrawal",
    "campaigning",
    "voting",
    "results",
    "handover",
  ])
  const active = items.find((item) => activeStages.has(item.currentStage))
  return active?.id || ""
}

const formatElectionOptionLabel = (election) => {
  const stage = formatStageLabel(election.currentStage)
  return `${election.title} • ${election.academicYear} • ${stage}`
}

const buildElectionFormFromDetail = (detail) => ({
  title: detail?.title || "",
  academicYear: detail?.academicYear || "",
  phase: detail?.phase || "phase1",
  description: detail?.description || "",
  status: detail?.status || "draft",
  electionCommission: {
    chiefElectionOfficerRollNumber: detail?.electionCommission?.chiefElectionOfficerRollNumber || "",
    officerRollNumbers: detail?.electionCommission?.officerRollNumbers || [],
  },
  timeline: {
    announcementAt: toDateTimeLocal(detail?.timeline?.announcementAt),
    nominationStartAt: toDateTimeLocal(detail?.timeline?.nominationStartAt),
    nominationEndAt: toDateTimeLocal(detail?.timeline?.nominationEndAt),
    withdrawalEndAt: toDateTimeLocal(detail?.timeline?.withdrawalEndAt),
    campaigningStartAt: toDateTimeLocal(detail?.timeline?.campaigningStartAt),
    campaigningEndAt: toDateTimeLocal(detail?.timeline?.campaigningEndAt),
    votingStartAt: toDateTimeLocal(detail?.timeline?.votingStartAt),
    votingEndAt: toDateTimeLocal(detail?.timeline?.votingEndAt),
    resultsAnnouncedAt: toDateTimeLocal(detail?.timeline?.resultsAnnouncedAt),
    handoverAt: toDateTimeLocal(detail?.timeline?.handoverAt),
  },
  posts:
    (detail?.posts || []).length > 0
      ? detail.posts.map((post) => ({
          id: post.id || "",
          title: post.title || "",
          code: post.code || "",
          category: post.category || "custom",
          description: post.description || "",
          candidateEligibility: {
            batches: post.candidateEligibility?.batches || [],
            extraRollNumbers: post.candidateEligibility?.extraRollNumbers || [],
          },
          voterEligibility: {
            batches: post.voterEligibility?.batches || [],
            extraRollNumbers: post.voterEligibility?.extraRollNumbers || [],
          },
          requirements: {
            minCgpa: post.requirements?.minCgpa ?? 6,
            minCompletedSemestersUg: post.requirements?.minCompletedSemestersUg ?? 3,
            minCompletedSemestersPg: post.requirements?.minCompletedSemestersPg ?? 1,
            minRemainingSemesters: post.requirements?.minRemainingSemesters ?? 2,
            proposersRequired: post.requirements?.proposersRequired ?? 3,
            secondersRequired: post.requirements?.secondersRequired ?? 5,
            requireElectorateMembership: Boolean(post.requirements?.requireElectorateMembership),
            requireHostelResident: Boolean(post.requirements?.requireHostelResident),
            allowedHostelNames: post.requirements?.allowedHostelNames || [],
            notes: post.requirements?.notes || "",
          },
        }))
      : [createBlankPost()],
})

const serializeElectionFormForApi = (form) => ({
  title: form.title.trim(),
  academicYear: form.academicYear.trim(),
  phase: form.phase,
  description: form.description.trim(),
  status: form.status,
  electionCommission: {
    chiefElectionOfficerRollNumber: form.electionCommission.chiefElectionOfficerRollNumber
      .trim()
      .toUpperCase(),
    officerRollNumbers: form.electionCommission.officerRollNumbers,
  },
  timeline: Object.fromEntries(
    Object.entries(form.timeline).map(([key, value]) => [key, fromDateTimeLocal(value)])
  ),
  posts: form.posts.map((post) => ({
    ...(post.id ? { id: post.id } : {}),
    title: post.title.trim(),
    code: post.code.trim().toUpperCase(),
    category: post.category,
    description: post.description.trim(),
    candidateEligibility: {
      batches: post.candidateEligibility.batches,
      extraRollNumbers: post.candidateEligibility.extraRollNumbers,
    },
    voterEligibility: {
      batches: post.voterEligibility.batches,
      extraRollNumbers: post.voterEligibility.extraRollNumbers,
    },
    requirements: {
      minCgpa: Number(post.requirements.minCgpa || 0),
      minCompletedSemestersUg: Number(post.requirements.minCompletedSemestersUg || 0),
      minCompletedSemestersPg: Number(post.requirements.minCompletedSemestersPg || 0),
      minRemainingSemesters: Number(post.requirements.minRemainingSemesters || 0),
      proposersRequired: Number(post.requirements.proposersRequired || 0),
      secondersRequired: Number(post.requirements.secondersRequired || 0),
      requireElectorateMembership: Boolean(post.requirements.requireElectorateMembership),
      requireHostelResident: Boolean(post.requirements.requireHostelResident),
      allowedHostelNames: post.requirements.allowedHostelNames,
      notes: post.requirements.notes.trim(),
    },
  })),
})

const buildNominationPayload = (form) => ({
  pitch: form.pitch.trim(),
  agendaPoints: splitListInput(form.agendaPoints),
  cgpa: Number(form.cgpa || 0),
  completedSemesters: Number(form.completedSemesters || 0),
  remainingSemesters: Number(form.remainingSemesters || 0),
  proposerRollNumbers: splitListInput(form.proposerRollNumbers).map((item) => item.toUpperCase()),
  seconderRollNumbers: splitListInput(form.seconderRollNumbers).map((item) => item.toUpperCase()),
  gradeCardUrl: form.gradeCardUrl.trim(),
  manifestoUrl: form.manifestoUrl.trim(),
  attachments: [],
})

const createEmptyWizardErrors = () => ({
  basics: {},
  timeline: {},
  commission: {},
  posts: [],
  general: "",
})

const isValidUrlOrEmpty = (value) => {
  const trimmed = String(value || "").trim()
  if (!trimmed) return true
  if (trimmed.startsWith("/")) return true
  try {
    new URL(trimmed)
    return true
  } catch {
    return false
  }
}

const hasAnyWizardErrors = (errors = createEmptyWizardErrors()) =>
  Boolean(
    errors.general ||
      Object.keys(errors.basics || {}).length ||
      Object.keys(errors.timeline || {}).length ||
      Object.keys(errors.commission || {}).length ||
      (errors.posts || []).some((postError) => Object.keys(postError || {}).length > 0)
  )

const validateElectionWizard = (form, step = "all", hostels = []) => {
  const errors = createEmptyWizardErrors()
  const hostelNames = new Set(hostels.map((hostel) => hostel.name))
  let firstInvalidStep = null
  let firstInvalidPostIndex = null

  const markStep = (stepId) => {
    if (!firstInvalidStep) firstInvalidStep = stepId
  }

  const markPostError = (index, key, message) => {
    if (!errors.posts[index]) errors.posts[index] = {}
    if (!errors.posts[index][key]) {
      errors.posts[index][key] = message
      markStep("posts")
      if (firstInvalidPostIndex === null) firstInvalidPostIndex = index
    }
  }

  const shouldValidate = (stepId) => step === "all" || step === stepId

  if (shouldValidate("basics")) {
    const title = String(form.title || "").trim()
    const academicYear = String(form.academicYear || "").trim()
    const description = String(form.description || "").trim()

    if (title.length < 3 || title.length > 200) {
      errors.basics.title = "Title must be between 3 and 200 characters."
      markStep("basics")
    }

    if (academicYear.length < 4 || academicYear.length > 50) {
      errors.basics.academicYear = "Academic year must be between 4 and 50 characters."
      markStep("basics")
    }

    if (!phaseOptions.some((option) => option.value === form.phase)) {
      errors.basics.phase = "Select a valid election phase."
      markStep("basics")
    }

    if (!statusOptions.some((option) => option.value === form.status)) {
      errors.basics.status = "Select a valid election status."
      markStep("basics")
    }

    if (description.length > 5000) {
      errors.basics.description = "Description cannot exceed 5000 characters."
      markStep("basics")
    }
  }

  if (shouldValidate("timeline")) {
    const parsedTimeline = {}

    timelineFieldDefs.forEach((field) => {
      const rawValue = form.timeline?.[field.key]
      if (!rawValue && field.key !== "handoverAt") {
        errors.timeline[field.key] = `${field.label} is required.`
        markStep("timeline")
        return
      }

      if (rawValue) {
        const isoValue = fromDateTimeLocal(rawValue)
        const parsedDate = new Date(isoValue)
        if (Number.isNaN(parsedDate.getTime())) {
          errors.timeline[field.key] = `${field.label} must be a valid date and time.`
          markStep("timeline")
          return
        }
        parsedTimeline[field.key] = parsedDate
      }
    })

    const orderedKeys = [
      "announcementAt",
      "nominationStartAt",
      "nominationEndAt",
      "withdrawalEndAt",
      "campaigningStartAt",
      "campaigningEndAt",
      "votingStartAt",
      "votingEndAt",
      "resultsAnnouncedAt",
    ]

    for (let index = 0; index < orderedKeys.length - 1; index += 1) {
      const currentKey = orderedKeys[index]
      const nextKey = orderedKeys[index + 1]
      if (
        parsedTimeline[currentKey] &&
        parsedTimeline[nextKey] &&
        parsedTimeline[currentKey] > parsedTimeline[nextKey]
      ) {
        errors.timeline[nextKey] = `${timelineFieldDefs.find((item) => item.key === nextKey)?.label || nextKey} must be after ${
          timelineFieldDefs.find((item) => item.key === currentKey)?.label || currentKey
        }.`
        markStep("timeline")
      }
    }

    if (
      parsedTimeline.handoverAt &&
      parsedTimeline.resultsAnnouncedAt &&
      parsedTimeline.handoverAt < parsedTimeline.resultsAnnouncedAt
    ) {
      errors.timeline.handoverAt = "Handover must be on or after results announcement."
      markStep("timeline")
    }
  }

  if (shouldValidate("commission")) {
    const chief = String(form.electionCommission?.chiefElectionOfficerRollNumber || "").trim().toUpperCase()
    const officers = Array.isArray(form.electionCommission?.officerRollNumbers)
      ? form.electionCommission.officerRollNumbers
      : []

    if (chief.length > 30) {
      errors.commission.chiefElectionOfficerRollNumber =
        "Chief Election Officer roll number cannot exceed 30 characters."
      markStep("commission")
    }

    if (officers.length > 12) {
      errors.commission.officerRollNumbers = "You can add up to 12 election officers."
      markStep("commission")
    }

    if (
      officers.some((rollNumber) => !String(rollNumber || "").trim() || String(rollNumber || "").trim().length > 30)
    ) {
      errors.commission.officerRollNumbers =
        "Each election officer roll number must be between 1 and 30 characters."
      markStep("commission")
    }
  }

  if (shouldValidate("posts")) {
    if (!Array.isArray(form.posts) || form.posts.length === 0) {
      errors.general = "Add at least one post before creating the election."
      markStep("posts")
    }

    ;(form.posts || []).forEach((post, index) => {
      const title = String(post.title || "").trim()
      const code = String(post.code || "").trim().toUpperCase()
      const description = String(post.description || "").trim()
      const candidateScope = post.candidateEligibility || { batches: [], extraRollNumbers: [] }
      const voterScope = post.voterEligibility || { batches: [], extraRollNumbers: [] }
      const requirements = post.requirements || {}

      if (title.length < 2 || title.length > 200) {
        markPostError(index, "title", "Post title must be between 2 and 200 characters.")
      }

      if (code.length > 60) {
        markPostError(index, "code", "Code cannot exceed 60 characters.")
      }

      if (!postCategoryOptions.some((option) => option.value === post.category)) {
        markPostError(index, "category", "Select a valid post category.")
      }

      if (description.length > 4000) {
        markPostError(index, "description", "Description cannot exceed 4000 characters.")
      }

      const hasCandidateScope =
        (candidateScope.batches || []).length > 0 || (candidateScope.extraRollNumbers || []).length > 0
      const hasVoterScope =
        (voterScope.batches || []).length > 0 || (voterScope.extraRollNumbers || []).length > 0

      if (!hasCandidateScope) {
        markPostError(index, "candidateEligibility", "Select at least one batch or CSV student for candidates.")
      }

      if (!hasVoterScope) {
        markPostError(index, "voterEligibility", "Select at least one batch or CSV student for voters.")
      }

      if ((candidateScope.extraRollNumbers || []).some((value) => String(value || "").trim().length > 30)) {
        markPostError(index, "candidateEligibility", "Candidate roll numbers cannot exceed 30 characters.")
      }

      if ((voterScope.extraRollNumbers || []).some((value) => String(value || "").trim().length > 30)) {
        markPostError(index, "voterEligibility", "Voter roll numbers cannot exceed 30 characters.")
      }

      if (Number(requirements.minCgpa) < 0 || Number(requirements.minCgpa) > 10) {
        markPostError(index, "minCgpa", "Minimum CGPA must be between 0 and 10.")
      }

      ;[
        "minCompletedSemestersUg",
        "minCompletedSemestersPg",
        "minRemainingSemesters",
        "proposersRequired",
        "secondersRequired",
      ].forEach((key) => {
        const value = Number(requirements[key])
        if (!Number.isInteger(value) || value < 0) {
          markPostError(index, key, "This field must be a non-negative whole number.")
        }
      })

      if (String(requirements.notes || "").trim().length > 2000) {
        markPostError(index, "notes", "Notes cannot exceed 2000 characters.")
      }

      if (
        Boolean(requirements.requireHostelResident) &&
        (requirements.allowedHostelNames || []).some((hostelName) => !hostelNames.has(hostelName))
      ) {
        markPostError(index, "allowedHostelNames", "Select hostels only from the available hostel list.")
      }
    })
  }

  return {
    isValid: !hasAnyWizardErrors(errors),
    errors,
    firstInvalidStep,
    firstInvalidPostIndex,
  }
}

const validateNominationForm = (form) => {
  const agendaPoints = splitListInput(form.agendaPoints)
  const proposerRollNumbers = splitListInput(form.proposerRollNumbers)
  const seconderRollNumbers = splitListInput(form.seconderRollNumbers)

  if (!Number.isFinite(Number(form.cgpa)) || Number(form.cgpa) < 0 || Number(form.cgpa) > 10) {
    return "CGPA must be between 0 and 10."
  }

  if (!Number.isInteger(Number(form.completedSemesters)) || Number(form.completedSemesters) < 0) {
    return "Completed semesters must be a non-negative whole number."
  }

  if (!Number.isInteger(Number(form.remainingSemesters)) || Number(form.remainingSemesters) < 0) {
    return "Remaining semesters must be a non-negative whole number."
  }

  if (String(form.pitch || "").trim().length > 3000) {
    return "Pitch cannot exceed 3000 characters."
  }

  if (agendaPoints.length > 8 || agendaPoints.some((item) => item.length > 200)) {
    return "You can add up to 8 agenda points, each with a maximum of 200 characters."
  }

  if (
    proposerRollNumbers.length > 20 ||
    seconderRollNumbers.length > 20 ||
    proposerRollNumbers.some((item) => item.length > 30) ||
    seconderRollNumbers.some((item) => item.length > 30)
  ) {
    return "Proposer and seconder roll numbers must stay within the allowed limits."
  }

  if (!String(form.gradeCardUrl || "").trim()) {
    return "Upload the latest grade card before submitting your nomination."
  }

  if (!isValidUrlOrEmpty(form.gradeCardUrl) || !isValidUrlOrEmpty(form.manifestoUrl)) {
    return "Uploaded nomination documents are invalid. Please upload them again."
  }

  return ""
}

const formatApiErrorMessage = (error, fallbackMessage) => {
  const detailedMessages = Array.isArray(error?.errors)
    ? [...new Set(
        error.errors
          .map((item) => (typeof item === "string" ? item : item?.message || ""))
          .filter(Boolean)
      )]
    : []

  if (detailedMessages.length > 0) {
    return detailedMessages.join("\n")
  }

  return error?.message || fallbackMessage
}

const buildResultsDraftMap = (results = {}) =>
  Object.fromEntries(
    (results.posts || []).map((post) => [
      String(post.postId),
      {
        winnerNominationId: post.publishedWinnerNominationId || post.previewWinnerNominationId || "",
        notes: post.notes || "",
      },
    ])
  )

const ElectionsPage = () => {
  const { user } = useAuth()
  const { hostelList = [], fetchHostelList } = useGlobal()
  const { toast } = useToast()

  const isAdminView = user?.role === "Admin" || user?.role === "Super Admin"
  const isStudentView = user?.role === "Student"

  const [batchOptions, setBatchOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [adminElections, setAdminElections] = useState([])
  const [selectedAdminElectionId, setSelectedAdminElectionId] = useState("")
  const [selectedAdminElection, setSelectedAdminElection] = useState(null)
  const [adminViewTab, setAdminViewTab] = useState("posts")
  const [nominationTab, setNominationTab] = useState("all")
  const [historyModalOpen, setHistoryModalOpen] = useState(false)

  const [studentElections, setStudentElections] = useState([])
  const [selectedStudentElectionId, setSelectedStudentElectionId] = useState("")

  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState("create")
  const [wizardForm, setWizardForm] = useState(createBlankElectionForm())
  const [savingElection, setSavingElection] = useState(false)

  const [reviewNomination, setReviewNomination] = useState(null)
  const [nominationFormDrafts, setNominationFormDrafts] = useState({})
  const [nominationContext, setNominationContext] = useState(null)
  const [voteSelections, setVoteSelections] = useState({})
  const [resultsDrafts, setResultsDrafts] = useState({})
  const [resultsEditorPostId, setResultsEditorPostId] = useState("")
  const [busyKey, setBusyKey] = useState("")

  const normalizedHostels = useMemo(
    () =>
      (hostelList || [])
        .map((hostel) => ({
          id: hostel?._id || hostel?.id || hostel?.name || hostel?.hostelName,
          name: hostel?.name || hostel?.hostelName || "",
        }))
        .filter((hostel) => hostel.id && hostel.name),
    [hostelList]
  )

  const selectedStudentElection = useMemo(
    () => studentElections.find((item) => item.id === selectedStudentElectionId) || null,
    [studentElections, selectedStudentElectionId]
  )

  const filteredNominations = useMemo(() => {
    const nominations = selectedAdminElection?.nominations || []
    if (nominationTab === "all") return nominations
    return nominations.filter((nomination) => nomination.status === nominationTab)
  }, [selectedAdminElection, nominationTab])

  const adminOverview = useMemo(() => {
    const posts = selectedAdminElection?.posts || []
    const nominations = selectedAdminElection?.nominations || []
    return {
      postCount: posts.length,
      nominationCount: nominations.length,
      verifiedCount: nominations.filter((item) => item.status === "verified").length,
      voteCount: posts.reduce((total, post) => total + Number(post.voteCount || 0), 0),
    }
  }, [selectedAdminElection])

  const selectedAdminResultPost = useMemo(
    () => (selectedAdminElection?.results?.posts || []).find((item) => item.postId === resultsEditorPostId) || null,
    [resultsEditorPostId, selectedAdminElection]
  )

  const loadBatchOptions = async () => {
    try {
      const batches = await studentApi.getBatchList()
      setBatchOptions(Array.isArray(batches) ? batches : [])
    } catch {
      setBatchOptions([])
    }
  }

  const loadAdminElections = async (preserveSelection = true) => {
    const response = await electionsApi.listAdminElections()
    const elections = response?.data?.elections || []
    setAdminElections(elections)

    setSelectedAdminElectionId((current) => {
      if (preserveSelection && current && elections.some((item) => item.id === current)) {
        return current
      }
      return sortByActivity(elections)
    })
  }

  const loadAdminDetail = async (electionId) => {
    if (!electionId) {
      setSelectedAdminElection(null)
      return
    }
    const response = await electionsApi.getElectionDetail(electionId)
    setSelectedAdminElection(response?.data || null)
  }

  const loadStudentPortal = async () => {
    const electionsResponse = await electionsApi.getStudentCurrent()
    const nextElections = electionsResponse?.data?.elections || []

    setStudentElections(nextElections)

    setSelectedStudentElectionId((current) => {
      if (current && nextElections.some((item) => item.id === current)) return current
      return sortByActivity(nextElections) || nextElections[0]?.id || ""
    })

    const nextDrafts = {}
    const nextVoteSelections = {}
    nextElections.forEach((election) => {
      ;(election.posts || []).forEach((post) => {
        nextDrafts[`${election.id}:${post.id}`] = post.myNomination
          ? {
              pitch: post.myNomination.pitch || "",
              agendaPoints: (post.myNomination.agendaPoints || []).join("\n"),
              cgpa: post.myNomination.cgpa ?? "",
              completedSemesters: post.myNomination.completedSemesters ?? "",
              remainingSemesters: post.myNomination.remainingSemesters ?? "",
              proposerRollNumbers: (post.myNomination.proposerRollNumbers || []).join(", "),
              seconderRollNumbers: (post.myNomination.seconderRollNumbers || []).join(", "),
              gradeCardUrl: post.myNomination.gradeCardUrl || "",
              manifestoUrl: post.myNomination.manifestoUrl || "",
            }
          : createBlankNominationForm()
        nextVoteSelections[`${election.id}:${post.id}`] = post.votedCandidateNominationId || ""
      })
    })
    setNominationFormDrafts(nextDrafts)
    setVoteSelections(nextVoteSelections)
  }

  const loadPage = async () => {
    try {
      setLoading(true)
      setError("")
      await loadBatchOptions()

      if (isAdminView) {
        await loadAdminElections(false)
      }

      if (isStudentView) {
        await loadStudentPortal()
      }
    } catch (err) {
      setError(formatApiErrorMessage(err, "Failed to load elections"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage()
  }, [isAdminView, isStudentView])

  useEffect(() => {
    if (isAdminView && (!hostelList || hostelList.length === 0)) {
      fetchHostelList?.()
    }
  }, [fetchHostelList, hostelList, isAdminView])

  useEffect(() => {
    if (!isAdminView) return
    if (!selectedAdminElectionId) {
      setSelectedAdminElection(null)
      return
    }

    loadAdminDetail(selectedAdminElectionId).catch((err) => {
      toast.error(formatApiErrorMessage(err, "Failed to load election details"))
    })
  }, [isAdminView, selectedAdminElectionId, toast])

  useEffect(() => {
    if (!selectedAdminElection?.results) {
      setResultsDrafts({})
      return
    }
    setResultsDrafts(buildResultsDraftMap(selectedAdminElection.results))
  }, [selectedAdminElection])

  const openCreateWizard = () => {
    setWizardMode("create")
    setWizardForm(createBlankElectionForm())
    setWizardOpen(true)
  }

  const openEditWizard = () => {
    if (!selectedAdminElection) return
    setWizardMode("edit")
    setWizardForm(buildElectionFormFromDetail(selectedAdminElection))
    setWizardOpen(true)
  }

  const saveElection = async () => {
    try {
      setSavingElection(true)
      const payload = serializeElectionFormForApi(wizardForm)
      const response =
        wizardMode === "edit" && selectedAdminElectionId
          ? await electionsApi.updateElection(selectedAdminElectionId, payload)
          : await electionsApi.createElection(payload)

      toast.success(response?.message || "Election saved")
      setWizardOpen(false)
      await loadAdminElections(false)
      if (response?.data?.id) {
        setSelectedAdminElectionId(response.data.id)
      }
      if (selectedAdminElectionId || response?.data?.id) {
        await loadAdminDetail(response?.data?.id || selectedAdminElectionId)
      }
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to save election"))
    } finally {
      setSavingElection(false)
    }
  }

  const handleReviewNomination = async (nominationId, status) => {
    if (!selectedAdminElectionId) return
    const actionKey = `${selectedAdminElectionId}:${nominationId}:${status}`
    try {
      setBusyKey(actionKey)
      const response = await electionsApi.reviewNomination(selectedAdminElectionId, nominationId, {
        status,
        notes: "",
      })
      toast.success(response?.message || "Nomination updated")
      await loadAdminDetail(selectedAdminElectionId)
      setReviewNomination(null)
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to review nomination"))
    } finally {
      setBusyKey("")
    }
  }

  const updateNominationDraft = (key, updater) => {
    setNominationFormDrafts((current) => ({
      ...current,
      [key]:
        typeof updater === "function"
          ? updater(current[key] || createBlankNominationForm())
          : updater,
    }))
  }

  const openNominationModal = (election, post) => {
    setNominationContext({ election, post })
  }

  const saveNomination = async () => {
    if (!nominationContext) return
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    try {
      const validationMessage = validateNominationForm(
        nominationFormDrafts[key] || createBlankNominationForm()
      )
      if (validationMessage) {
        toast.error(validationMessage)
        return
      }

      setBusyKey(`nomination:${key}`)
      const payload = buildNominationPayload(nominationFormDrafts[key] || createBlankNominationForm())
      const response = await electionsApi.upsertNomination(
        nominationContext.election.id,
        nominationContext.post.id,
        payload
      )
      toast.success(response?.message || "Nomination saved")
      setNominationContext(null)
      await loadStudentPortal()
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to save nomination"))
    } finally {
      setBusyKey("")
    }
  }

  const withdrawNomination = async (electionId, nominationId) => {
    try {
      setBusyKey(`withdraw:${electionId}:${nominationId}`)
      const response = await electionsApi.withdrawNomination(electionId, nominationId)
      toast.success(response?.message || "Nomination withdrawn")
      await loadStudentPortal()
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to withdraw nomination"))
    } finally {
      setBusyKey("")
    }
  }

  const castVote = async (electionId, postId) => {
    const selectedCandidateId = voteSelections[`${electionId}:${postId}`]
    if (!selectedCandidateId) return

    try {
      setBusyKey(`vote:${electionId}:${postId}`)
      const response = await electionsApi.castVote(electionId, postId, {
        candidateNominationId: selectedCandidateId,
      })
      toast.success(response?.message || "Vote cast successfully")
      await loadStudentPortal()
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to cast vote"))
    } finally {
      setBusyKey("")
    }
  }

  const updateResultsDraft = (postId, patch) => {
    setResultsDrafts((current) => ({
      ...current,
      [postId]: {
        winnerNominationId: current[postId]?.winnerNominationId || "",
        notes: current[postId]?.notes || "",
        ...patch,
      },
    }))
  }

  const publishResults = async () => {
    if (!selectedAdminElectionId) return

    try {
      setBusyKey(`results:${selectedAdminElectionId}`)
      const payload = {
        posts: Object.entries(resultsDrafts).map(([postId, draft]) => ({
          postId,
          winnerNominationId: draft?.winnerNominationId || null,
          notes: draft?.notes || "",
        })),
      }
      const response = await electionsApi.publishResults(selectedAdminElectionId, payload)
      toast.success(response?.message || "Results published")
      await loadAdminDetail(selectedAdminElectionId)
      setResultsEditorPostId("")
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to publish results"))
    } finally {
      setBusyKey("")
    }
  }

  if (loading) {
    return <LoadingState message="Loading elections" description="Preparing the elections workspace..." />
  }

  if (error) {
    return <ErrorState title="Unable to load elections" message={error} onRetry={loadPage} />
  }

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Elections"
        showDate={false}
      >
        {isAdminView ? (
          <>
            <HeaderSelect
              value={selectedAdminElectionId}
              onChange={setSelectedAdminElectionId}
              options={adminElections}
              placeholder="Select current or past election"
              headerSelectStyle={headerSelectStyle}
              formatElectionOptionLabel={formatElectionOptionLabel}
            />
            {adminElections.length > 0 ? (
              <Button size="md" variant="ghost" onClick={() => setHistoryModalOpen(true)}>
                <History size={16} /> History
              </Button>
            ) : null}
            {selectedAdminElection ? (
              <Button size="md" variant="secondary" onClick={openEditWizard}>
                <FileText size={16} /> Edit Election
              </Button>
            ) : null}
            <Button size="md" onClick={openCreateWizard}>
              <Plus size={16} /> Create Election
            </Button>
          </>
        ) : (
          <>
            {studentElections.length > 1 ? (
              <HeaderSelect
                value={selectedStudentElectionId}
                onChange={setSelectedStudentElectionId}
                options={studentElections}
                placeholder="Select active election"
                headerSelectStyle={headerSelectStyle}
                formatElectionOptionLabel={formatElectionOptionLabel}
              />
            ) : null}
          </>
        )}
      </PageHeader>

      <div style={workspaceStyle}>
        {isAdminView && !selectedAdminElectionId ? (
          <EmptyState
            title="Select an election occurrence"
            message={
              adminElections.length === 0
                ? "Create the first election from the header to begin."
                : "No election is auto-selected right now. Choose a current or past occurrence from the header."
            }
          />
        ) : null}

        {isAdminView && selectedAdminElection ? (
          <AdminElectionWorkspace
            selectedAdminElection={selectedAdminElection}
            selectedAdminElectionId={selectedAdminElectionId}
            adminViewTab={adminViewTab}
            setAdminViewTab={setAdminViewTab}
            nominationTab={nominationTab}
            setNominationTab={setNominationTab}
            filteredNominations={filteredNominations}
            adminOverview={adminOverview}
            resultsDrafts={resultsDrafts}
            busyKey={busyKey}
            publishResults={publishResults}
            setReviewNomination={setReviewNomination}
            setResultsEditorPostId={setResultsEditorPostId}
            infoBannerStyle={infoBannerStyle}
            badgeRowStyle={badgeRowStyle}
            mutedTextStyle={mutedTextStyle}
            infoGridStyle={infoGridStyle}
            compactStatStyle={compactStatStyle}
            compactStatLabelStyle={compactStatLabelStyle}
            compactStatValueStyle={compactStatValueStyle}
            formatStageLabel={formatStageLabel}
            formatDateTime={formatDateTime}
            getStatusTone={getStatusTone}
            summarizeScope={summarizeScope}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
            nominationTabs={nominationTabs}
          />
        ) : null}

        {isStudentView && !selectedStudentElectionId ? (
          <EmptyState
            title="No active election window"
            message="The active election will appear here when participation, voting, or results are available."
          />
        ) : null}

        {isStudentView && selectedStudentElection ? (
          <StudentElectionWorkspace
            selectedStudentElection={selectedStudentElection}
            openNominationModal={openNominationModal}
            withdrawNomination={withdrawNomination}
            busyKey={busyKey}
            voteSelections={voteSelections}
            setVoteSelections={setVoteSelections}
            castVote={castVote}
            infoBannerStyle={infoBannerStyle}
            detailPanelStyle={detailPanelStyle}
            mutedTextStyle={mutedTextStyle}
            formatStageLabel={formatStageLabel}
            formatDateTime={formatDateTime}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />
        ) : null}
      </div>

      {isAdminView ? (
        <>
          <ElectionWizardModal
            isOpen={wizardOpen}
            mode={wizardMode}
            form={wizardForm}
            setForm={setWizardForm}
            onClose={() => setWizardOpen(false)}
            onSave={saveElection}
            saving={savingElection}
            batchOptions={batchOptions}
            hostels={normalizedHostels}
            createBlankPost={createBlankPost}
            buildD15Timeline={buildD15Timeline}
            validateElectionWizard={validateElectionWizard}
            createEmptyWizardErrors={createEmptyWizardErrors}
            wizardSteps={wizardSteps}
            phaseOptions={phaseOptions}
            statusOptions={statusOptions}
            postCategoryOptions={postCategoryOptions}
            timelineFieldDefs={timelineFieldDefs}
            requirementFieldDefs={requirementFieldDefs}
            splitListInput={splitListInput}
            formatDateTime={formatDateTime}
            fromDateTimeLocal={fromDateTimeLocal}
            flatPanelStyle={flatPanelStyle}
            panelStyle={panelStyle}
            modalBodyStyle={modalBodyStyle}
            labelStyle={labelStyle}
            mutedTextStyle={mutedTextStyle}
            selectStyle={selectStyle}
            textareaStyle={textareaStyle}
            errorTextStyle={errorTextStyle}
            errorBannerStyle={errorBannerStyle}
            timelinePreviewStyle={timelinePreviewStyle}
            timelineCellStyle={timelineCellStyle}
            postTabListStyle={postTabListStyle}
            postTabStyle={postTabStyle}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
            nominationTemplateHeaders={nominationTemplateHeaders}
          />

          <AdminNominationReviewModal
            nomination={reviewNomination}
            electionId={selectedAdminElectionId}
            onClose={() => setReviewNomination(null)}
            onReview={handleReviewNomination}
            busy={busyKey}
            modalBodyStyle={modalBodyStyle}
            badgeRowStyle={badgeRowStyle}
            detailGridStyle={detailGridStyle}
            detailPanelStyle={detailPanelStyle}
            labelStyle={labelStyle}
            mutedTextStyle={mutedTextStyle}
            getStatusTone={getStatusTone}
            formatStageLabel={formatStageLabel}
            formatDateTime={formatDateTime}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />

          <AdminResultsEditModal
            postResult={selectedAdminResultPost}
            draft={selectedAdminResultPost ? resultsDrafts[String(selectedAdminResultPost.postId)] : null}
            onClose={() => setResultsEditorPostId("")}
            onChange={(patch) => {
              if (!selectedAdminResultPost) return
              updateResultsDraft(String(selectedAdminResultPost.postId), patch)
            }}
            modalBodyStyle={modalBodyStyle}
            badgeRowStyle={badgeRowStyle}
            flatPanelStyle={flatPanelStyle}
            labelStyle={labelStyle}
            textareaStyle={textareaStyle}
            mutedTextStyle={mutedTextStyle}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />

          <ElectionHistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            elections={adminElections}
            selectedElectionId={selectedAdminElectionId}
            onSelect={setSelectedAdminElectionId}
            modalBodyStyle={modalBodyStyle}
            mutedTextStyle={mutedTextStyle}
            formatStageLabel={formatStageLabel}
            getStatusTone={getStatusTone}
            formatDateTime={formatDateTime}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />
        </>
      ) : null}

      {isStudentView ? (
        <>
          <StudentNominationModal
            election={nominationContext?.election}
            post={nominationContext?.post}
            form={
              nominationContext
                ? nominationFormDrafts[`${nominationContext.election.id}:${nominationContext.post.id}`] ||
                  createBlankNominationForm()
                : createBlankNominationForm()
            }
            setForm={(updater) => {
              if (!nominationContext) return
              const key = `${nominationContext.election.id}:${nominationContext.post.id}`
              updateNominationDraft(key, updater)
            }}
            onClose={() => setNominationContext(null)}
            onSave={saveNomination}
            saving={busyKey === `nomination:${nominationContext?.election?.id}:${nominationContext?.post?.id}`}
            currentUserId={user?._id}
            modalBodyStyle={modalBodyStyle}
            badgeRowStyle={badgeRowStyle}
            detailGridStyle={detailGridStyle}
            detailPanelStyle={detailPanelStyle}
            labelStyle={labelStyle}
            flatPanelStyle={flatPanelStyle}
            mutedTextStyle={mutedTextStyle}
            panelStyle={panelStyle}
            textareaStyle={textareaStyle}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />
        </>
      ) : null}
    </div>
  )
}

export default ElectionsPage
