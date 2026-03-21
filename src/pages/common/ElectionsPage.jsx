import { useEffect, useMemo, useState } from "react"
import { Button } from "czero/react"
import { FileText, History, Plus } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import ConfirmationDialog from "@/components/common/ConfirmationDialog"
import { EmptyState, ErrorState, LoadingState, useToast } from "@/components/ui/feedback"
import { useAuth } from "@/contexts/AuthProvider"
import { useGlobal } from "@/contexts/GlobalProvider"
import { useSocket } from "@/contexts/SocketProvider"
import { adminApi, electionsApi, studentApi } from "@/service"
import AdminElectionWorkspace from "@/components/elections/AdminElectionWorkspace"
import StudentElectionWorkspace from "@/components/elections/StudentElectionWorkspace"
import {
  ElectionHistoryModal,
  CloneElectionModal,
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
  { label: "Modification Requested", value: "modification_requested" },
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
]

const createBlankPost = () => ({
  id: "",
  title: "",
  code: "",
  category: "custom",
  description: "",
  candidateEligibility: {
    batches: [],
    groups: [],
    extraRollNumbers: [],
  },
  voterEligibility: {
    batches: [],
    groups: [],
    extraRollNumbers: [],
  },
  requirements: {
    minCgpa: 6,
    minCompletedSemestersUg: 0,
    minCompletedSemestersPg: 0,
    minRemainingSemesters: 0,
    proposersRequired: 1,
    secondersRequired: 1,
    requireElectorateMembership: false,
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
  cgpa: "",
  hasNoActiveBacklogs: false,
  proposerEntries: [],
  seconderEntries: [],
  gradeCardUrl: "",
  manifestoUrl: "",
  porDocumentUrl: "",
})

const createBlankSupporterEntry = () => ({
  rollNumber: "",
  userId: "",
  name: "",
  email: "",
  profileImage: "",
  lookupStatus: "idle",
  lookupMessage: "",
  supportStatus: "",
  supportRole: "",
})

const hydrateSupporterEntries = (entries = [], minimumCount = 0) => {
  const nextEntries = Array.isArray(entries)
    ? entries.map((entry) => ({
        ...createBlankSupporterEntry(),
        rollNumber: String(entry?.rollNumber || "").toUpperCase(),
        userId: entry?.userId || "",
        name: entry?.name || "",
        email: entry?.email || "",
        profileImage: entry?.profileImage || "",
        lookupStatus: entry?.rollNumber ? "validated" : "idle",
        lookupMessage: entry?.status
          ? `Support ${String(entry.status).replace(/^\w/, (match) => match.toUpperCase())}`
          : "",
        supportStatus: entry?.status || "",
        supportRole: entry?.supportRole || "",
      }))
    : []

  while (nextEntries.length < minimumCount) {
    nextEntries.push(createBlankSupporterEntry())
  }

  return nextEntries
}

const buildNominationDraftFromPost = (post = {}) => ({
  cgpa: post?.myNomination?.cgpa ?? "",
  hasNoActiveBacklogs: Boolean(post?.myNomination?.hasNoActiveBacklogs),
  proposerEntries: hydrateSupporterEntries(
    post?.myNomination?.proposerEntries || [],
    Math.max(1, Number(post?.requirements?.proposersRequired || 1))
  ),
  seconderEntries: hydrateSupporterEntries(
    post?.myNomination?.seconderEntries || [],
    Math.max(1, Number(post?.requirements?.secondersRequired || 1))
  ),
  gradeCardUrl: post?.myNomination?.gradeCardUrl || "",
  manifestoUrl: post?.myNomination?.manifestoUrl || "",
  porDocumentUrl: post?.myNomination?.porDocumentUrl || "",
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
  if (["withdrawal", "campaigning", "results", "handover", "modification_requested"].includes(status)) return "warning"
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
  const groups = Array.isArray(scope?.groups) ? scope.groups.length : 0
  const extra = Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers.length : 0
  const parts = []
  if (batches > 0) parts.push(`${batches} batch(es)`)
  if (groups > 0) parts.push(`${groups} group(s)`)
  if (extra > 0) parts.push(`${extra} CSV student(s)`)
  if (parts.length === 0) return "Not configured"
  return parts.join(" + ")
}

const hasScopeSelection = (scope = {}) =>
  (Array.isArray(scope?.batches) ? scope.batches.length : 0) > 0 ||
  (Array.isArray(scope?.groups) ? scope.groups.length : 0) > 0 ||
  (Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers.length : 0) > 0

const normalizeScopeForForm = (scope = {}) => ({
  batches: Array.isArray(scope?.batches) ? scope.batches : [],
  groups: Array.isArray(scope?.groups) ? scope.groups : [],
  extraRollNumbers: Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers : [],
})

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
          candidateEligibility: normalizeScopeForForm(post.candidateEligibility),
          voterEligibility: normalizeScopeForForm(post.voterEligibility),
          requirements: {
            minCgpa: post.requirements?.minCgpa ?? 6,
            minCompletedSemestersUg: post.requirements?.minCompletedSemestersUg ?? 0,
            minCompletedSemestersPg: post.requirements?.minCompletedSemestersPg ?? 0,
            minRemainingSemesters: post.requirements?.minRemainingSemesters ?? 0,
            proposersRequired: 1,
            secondersRequired: 1,
            requireElectorateMembership: false,
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
      groups: post.candidateEligibility.groups,
      extraRollNumbers: post.candidateEligibility.extraRollNumbers,
    },
    voterEligibility: {
      batches: post.voterEligibility.batches,
      groups: post.voterEligibility.groups,
      extraRollNumbers: post.voterEligibility.extraRollNumbers,
    },
    requirements: {
      minCgpa: Number(post.requirements.minCgpa || 0),
      minCompletedSemestersUg: 0,
      minCompletedSemestersPg: 0,
      minRemainingSemesters: 0,
      proposersRequired: 1,
      secondersRequired: 1,
      requireElectorateMembership: false,
      requireHostelResident: Boolean(post.requirements.requireHostelResident),
      allowedHostelNames: post.requirements.allowedHostelNames,
      notes: post.requirements.notes.trim(),
    },
  })),
})

const buildNominationPayload = (form) => ({
  cgpa: Number(form.cgpa || 0),
  completedSemesters: null,
  remainingSemesters: null,
  hasNoActiveBacklogs: Boolean(form.hasNoActiveBacklogs),
  proposerRollNumbers: (form.proposerEntries || [])
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean),
  seconderRollNumbers: (form.seconderEntries || [])
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean),
  gradeCardUrl: form.gradeCardUrl.trim(),
  manifestoUrl: form.manifestoUrl.trim(),
  porDocumentUrl: form.porDocumentUrl.trim(),
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

const isPdfDocumentPathOrEmpty = (value) => {
  const trimmed = String(value || "").trim()
  if (!trimmed) return true
  return /\.pdf(\?.*)?$/i.test(trimmed)
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
      const candidateScope = post.candidateEligibility || { batches: [], groups: [], extraRollNumbers: [] }
      const voterScope = post.voterEligibility || { batches: [], groups: [], extraRollNumbers: [] }
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

      if (!hasScopeSelection(candidateScope)) {
        markPostError(index, "candidateEligibility", "Select at least one batch, group, or CSV student for candidates.")
      }

      if (!hasScopeSelection(voterScope)) {
        markPostError(index, "voterEligibility", "Select at least one batch, group, or CSV student for voters.")
      }

      if ((candidateScope.extraRollNumbers || []).some((value) => String(value || "").trim().length > 30)) {
        markPostError(index, "candidateEligibility", "Candidate roll numbers cannot exceed 30 characters.")
      }

      if ((voterScope.extraRollNumbers || []).some((value) => String(value || "").trim().length > 30)) {
        markPostError(index, "voterEligibility", "Voter roll numbers cannot exceed 30 characters.")
      }

      if ((candidateScope.groups || []).some((value) => String(value || "").trim().length > 120)) {
        markPostError(index, "candidateEligibility", "Candidate group names cannot exceed 120 characters.")
      }

      if ((voterScope.groups || []).some((value) => String(value || "").trim().length > 120)) {
        markPostError(index, "voterEligibility", "Voter group names cannot exceed 120 characters.")
      }

      if (Number(requirements.minCgpa) < 0 || Number(requirements.minCgpa) > 10) {
        markPostError(index, "minCgpa", "Minimum CGPA must be between 0 and 10.")
      }

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

const validateNominationForm = (form, post) => {
  const proposerEntries = form.proposerEntries || []
  const seconderEntries = form.seconderEntries || []
  const proposerRollNumbers = proposerEntries
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean)
  const seconderRollNumbers = seconderEntries
    .map((entry) => String(entry?.rollNumber || "").trim().toUpperCase())
    .filter(Boolean)
  const requiredProposers = Math.max(1, Number(post?.requirements?.proposersRequired || 1))
  const requiredSeconders = Math.max(1, Number(post?.requirements?.secondersRequired || 1))

  if (!Number.isFinite(Number(form.cgpa)) || Number(form.cgpa) < 0 || Number(form.cgpa) > 10) {
    return "CGPA must be between 0 and 10."
  }

  if (!form.hasNoActiveBacklogs) {
    return "Confirm that you do not have any active backlog before saving the nomination."
  }

  if (new Set([...proposerRollNumbers, ...seconderRollNumbers]).size !== proposerRollNumbers.length + seconderRollNumbers.length) {
    return "The same student cannot be added as both proposer and seconder."
  }

  if (
    proposerRollNumbers.length > 20 ||
    seconderRollNumbers.length > 20 ||
    proposerRollNumbers.some((item) => item.length > 30) ||
    seconderRollNumbers.some((item) => item.length > 30)
  ) {
    return "Proposer and seconder roll numbers must stay within the allowed limits."
  }

  if (proposerRollNumbers.length < requiredProposers) {
    return `Add ${requiredProposers} proposer${requiredProposers === 1 ? "" : "s"} before saving the nomination.`
  }

  if (seconderRollNumbers.length < requiredSeconders) {
    return `Add ${requiredSeconders} seconder${requiredSeconders === 1 ? "" : "s"} before saving the nomination.`
  }

  const invalidSupporter = [...proposerEntries, ...seconderEntries].find((entry) => {
    const hasValue = Boolean(String(entry?.rollNumber || "").trim())
    return hasValue && entry?.lookupStatus !== "validated"
  })

  if (invalidSupporter) {
    return invalidSupporter.lookupMessage || `Verify roll number ${invalidSupporter.rollNumber} before saving the nomination.`
  }

  if (!String(form.gradeCardUrl || "").trim()) {
    return "Upload the latest grade card before submitting your nomination."
  }

  if (
    !isValidUrlOrEmpty(form.gradeCardUrl) ||
    !isValidUrlOrEmpty(form.manifestoUrl) ||
    !isValidUrlOrEmpty(form.porDocumentUrl)
  ) {
    return "Uploaded nomination documents are invalid. Please upload them again."
  }

  if (
    !isPdfDocumentPathOrEmpty(form.gradeCardUrl) ||
    !isPdfDocumentPathOrEmpty(form.manifestoUrl) ||
    !isPdfDocumentPathOrEmpty(form.porDocumentUrl)
  ) {
    return "Only PDF files are allowed for nomination documents."
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

const formatVotePercentage = (voteCount, totalVotes) => {
  const votes = Number(voteCount || 0)
  const total = Number(totalVotes || 0)
  if (total <= 0) return "0%"

  const percentage = (votes / total) * 100
  return percentage >= 10 ? `${percentage.toFixed(1)}%` : `${percentage.toFixed(2)}%`
}

const buildResultsDraftMap = (results = {}) =>
  Object.fromEntries(
    (results.posts || []).map((post) => [
      String(post.postId),
      {
        winnerNominationIds:
          (post.publishedWinnerNominationIds || []).length > 0 || post.publishedWinnerIsNota
            ? [
                ...(post.publishedWinnerNominationIds || []),
                ...(post.publishedWinnerIsNota ? ["nota"] : []),
              ]
            : [
                ...(post.previewWinnerNominationIds || []),
                ...(post.previewWinnerIsNota &&
                !(post.previewWinnerNominationIds || []).includes("nota")
                  ? ["nota"]
                  : []),
              ],
        winnerNominationId:
          post.publishedWinnerIsNota && !(post.publishedWinnerNominationIds || []).length
            ? "nota"
            : post.publishedWinnerNominationId ||
              (post.previewWinnerIsNota && !(post.previewWinnerNominationIds || []).length
                ? "nota"
                : post.previewWinnerNominationId || ""),
        winnerIsTie: Boolean(post.publishedWinnerIsTie || post.previewWinnerIsTie),
        notes: post.notes || "",
      },
    ])
  )

const ElectionsPage = () => {
  const { user } = useAuth()
  const { hostelList = [], fetchHostelList } = useGlobal()
  const { on: onSocketEvent, isConnected: isSocketConnected } = useSocket()
  const { toast } = useToast()

  const isAdminView = user?.role === "Admin" || user?.role === "Super Admin"
  const isStudentView = user?.role === "Student"
  const isGymkhanaElectionOfficerView =
    user?.role === "Gymkhana" &&
    String(user?.subRole || "").trim().toLowerCase().replace(/\s+/g, " ") === "election officer"
  const isAdminLikeView = isAdminView || isGymkhanaElectionOfficerView

  const [batchOptions, setBatchOptions] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [adminElections, setAdminElections] = useState([])
  const [selectedAdminElectionId, setSelectedAdminElectionId] = useState("")
  const [selectedAdminElection, setSelectedAdminElection] = useState(null)
  const [adminViewTab, setAdminViewTab] = useState(isGymkhanaElectionOfficerView ? "nominations" : "posts")
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
  const [supportLookupKey, setSupportLookupKey] = useState("")
  const [voteSelections, setVoteSelections] = useState({})
  const [resultsDrafts, setResultsDrafts] = useState({})
  const [resultsEditorPostId, setResultsEditorPostId] = useState("")
  const [busyKey, setBusyKey] = useState("")
  const [liveVotingStats, setLiveVotingStats] = useState(null)
  const [loadingVotingStats, setLoadingVotingStats] = useState(false)
  const [showSendVotingEmailsConfirm, setShowSendVotingEmailsConfirm] = useState(false)
  const [showPublishResultsConfirm, setShowPublishResultsConfirm] = useState(false)
  const [cloneElectionOpen, setCloneElectionOpen] = useState(false)
  const [cloneElectionTitle, setCloneElectionTitle] = useState("")

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

  const cloneElectionDisabledReason = useMemo(() => {
    if (!selectedAdminElection) return ""
    if (["voting", "results", "handover", "completed", "cancelled"].includes(selectedAdminElection.currentStage)) {
      return "Copy is only available before voting starts."
    }

    const hasPendingNominationReview = (selectedAdminElection?.nominations || []).some((nomination) =>
      ["submitted", "modification_requested"].includes(String(nomination.status || ""))
    )

    if (hasPendingNominationReview) {
      return "Copy is available only after all nominations are verified, rejected, or withdrawn."
    }

    return ""
  }, [selectedAdminElection])

  const canCloneElection = Boolean(selectedAdminElection && !cloneElectionDisabledReason)

  const loadBatchOptions = async () => {
    try {
      const batches = await studentApi.getBatchList()
      setBatchOptions(Array.isArray(batches) ? batches : [])
    } catch {
      setBatchOptions([])
    }
  }

  const loadGroupOptions = async () => {
    if (!isAdminView) {
      setGroupOptions([])
      return
    }

    try {
      const response = await adminApi.getStudentGroups()
      setGroupOptions(Array.isArray(response?.value) ? response.value : [])
    } catch {
      setGroupOptions([])
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

  const loadVotingLiveStats = async (electionId, { silent = false } = {}) => {
    if (!electionId) {
      setLiveVotingStats(null)
      setLoadingVotingStats(false)
      return
    }

    try {
      setLoadingVotingStats(true)
      const response = await electionsApi.getVotingLiveStats(electionId)
      setLiveVotingStats(response?.data || null)
    } catch (err) {
      setLiveVotingStats(null)
      if (!silent) {
        toast.error(formatApiErrorMessage(err, "Failed to load live voting data"))
      }
    } finally {
      setLoadingVotingStats(false)
    }
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
        nextDrafts[`${election.id}:${post.id}`] = buildNominationDraftFromPost(post)
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
      if (isAdminView) {
        await loadBatchOptions()
        await loadGroupOptions()
      }

      if (isAdminLikeView) {
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
  }, [isAdminLikeView, isStudentView])

  useEffect(() => {
    if (isAdminView && (!hostelList || hostelList.length === 0)) {
      fetchHostelList?.()
    }
  }, [fetchHostelList, hostelList, isAdminView])

  useEffect(() => {
    if (!isAdminLikeView) return
    if (!selectedAdminElectionId) {
      setSelectedAdminElection(null)
      return
    }

    loadAdminDetail(selectedAdminElectionId).catch((err) => {
      toast.error(formatApiErrorMessage(err, "Failed to load election details"))
    })
  }, [isAdminLikeView, selectedAdminElectionId, toast])

  useEffect(() => {
    if (!isGymkhanaElectionOfficerView) return
    if (adminViewTab !== "nominations") {
      setAdminViewTab("nominations")
    }
  }, [adminViewTab, isGymkhanaElectionOfficerView])

  useEffect(() => {
    if (!selectedAdminElection?.results) {
      setResultsDrafts({})
      return
    }
    setResultsDrafts(buildResultsDraftMap(selectedAdminElection.results))
  }, [selectedAdminElection])

  useEffect(() => {
    if (!isAdminView) return

    if (selectedAdminElection?.currentStage !== "voting") {
      setLiveVotingStats(null)
      setLoadingVotingStats(false)
      if (adminViewTab === "voting") {
        setAdminViewTab("posts")
      }
      return
    }

    if (selectedAdminElectionId) {
      loadVotingLiveStats(selectedAdminElectionId, { silent: true }).catch(() => {})
    }
  }, [adminViewTab, isAdminView, selectedAdminElection?.currentStage, selectedAdminElectionId])

  useEffect(() => {
    if (!isAdminView) return

    const canViewResults = ["results", "handover", "completed"].includes(selectedAdminElection?.currentStage)
    if (adminViewTab === "results" && !canViewResults) {
      setAdminViewTab("posts")
    }
  }, [adminViewTab, isAdminView, selectedAdminElection?.currentStage])

  useEffect(() => {
    if (!isAdminView || !selectedAdminElectionId) return undefined

    const cleanupVotingUpdate = onSocketEvent?.("election:voting-live:update", (payload) => {
      if (String(payload?.electionId || "") !== String(selectedAdminElectionId)) return
      setLiveVotingStats(payload?.stats || null)
    })

    const cleanupDispatchUpdate = onSocketEvent?.("election:voting-live:dispatch", (payload) => {
      if (String(payload?.electionId || "") !== String(selectedAdminElectionId)) return
      setLiveVotingStats((current) => ({
        electionId: String(payload?.electionId || selectedAdminElectionId),
        generatedAt: current?.generatedAt || null,
        overview: current?.overview || {},
        posts: current?.posts || [],
        dispatch: payload?.dispatch || {},
      }))
    })

    return () => {
      cleanupVotingUpdate?.()
      cleanupDispatchUpdate?.()
    }
  }, [isAdminView, onSocketEvent, selectedAdminElectionId])

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

  const openCloneElection = () => {
    if (!selectedAdminElection || !canCloneElection) return
    setCloneElectionTitle(`${selectedAdminElection.title} Copy`)
    setCloneElectionOpen(true)
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

  const handleReviewNomination = async (nominationId, status, notes = "") => {
    if (!selectedAdminElectionId) return
    const actionKey = `${selectedAdminElectionId}:${nominationId}:${status}`
    try {
      setBusyKey(actionKey)
      const response = await electionsApi.reviewNomination(selectedAdminElectionId, nominationId, {
        status,
        notes,
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

  const updateSupporterEntry = (supportType, index, patch) => {
    if (!nominationContext) return
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    updateNominationDraft(key, (currentForm) => {
      const nextEntries = [...(currentForm[fieldKey] || [])]
      nextEntries[index] = {
        ...createBlankSupporterEntry(),
        ...(nextEntries[index] || {}),
        ...patch,
      }
      return {
        ...currentForm,
        [fieldKey]: nextEntries,
      }
    })
  }

  const addSupporterEntry = (supportType) => {
    if (!nominationContext) return
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    updateNominationDraft(key, (currentForm) => ({
      ...currentForm,
      [fieldKey]: [...(currentForm[fieldKey] || []), createBlankSupporterEntry()],
    }))
  }

  const removeSupporterEntry = (supportType, index) => {
    if (!nominationContext) return
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    const minimumCount = Number(
      supportType === "proposer"
        ? nominationContext?.post?.requirements?.proposersRequired || 0
        : nominationContext?.post?.requirements?.secondersRequired || 0
    )
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    updateNominationDraft(key, (currentForm) => {
      const nextEntries = [...(currentForm[fieldKey] || [])]
      nextEntries.splice(index, 1)
      return {
        ...currentForm,
        [fieldKey]: hydrateSupporterEntries(nextEntries, minimumCount),
      }
    })
  }

  const lookupSupporter = async (supportType, index, rawRollNumber = "") => {
    if (!nominationContext) return

    const electionId = nominationContext.election.id
    const postId = nominationContext.post.id
    const formKey = `${electionId}:${postId}`
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    const currentEntry = nominationFormDrafts[formKey]?.[fieldKey]?.[index] || createBlankSupporterEntry()
    const rollNumber = String(rawRollNumber || currentEntry.rollNumber || "").trim().toUpperCase()
    const requestKey = `${formKey}:${supportType}:${index}`

    if (!rollNumber) {
      updateSupporterEntry(supportType, index, createBlankSupporterEntry())
      return
    }

    setSupportLookupKey(requestKey)
    try {
      const response = await electionsApi.lookupNominationSupporter(electionId, postId, {
        rollNumber,
        supportType,
        nominationId: nominationContext.post?.myNomination?.id || "",
      })
      const supporter = response?.data || {}
      updateSupporterEntry(supportType, index, {
        rollNumber,
        userId: supporter.userId || "",
        name: supporter.name || "",
        email: supporter.email || "",
        profileImage: supporter.profileImage || "",
        lookupStatus: "validated",
        lookupMessage: supporter.currentStatus
          ? `Support ${String(supporter.currentStatus).replace(/^\w/, (match) => match.toUpperCase())}`
          : "Eligible",
        supportStatus: supporter.currentStatus || "",
        supportRole: supporter.currentRole || supportType,
      })
    } catch (err) {
      updateSupporterEntry(supportType, index, {
        rollNumber,
        userId: "",
        name: "",
        email: "",
        profileImage: "",
        lookupStatus: "invalid",
        lookupMessage: formatApiErrorMessage(err, "Unable to verify this roll number"),
        supportStatus: "",
        supportRole: "",
      })
    } finally {
      setSupportLookupKey("")
    }
  }

  const openNominationModal = (election, post) => {
    const key = `${election.id}:${post.id}`
    setNominationFormDrafts((current) => ({
      ...current,
      [key]: current[key] ? {
        ...current[key],
        proposerEntries: hydrateSupporterEntries(
          current[key].proposerEntries,
          Math.max(1, Number(post?.requirements?.proposersRequired || 1))
        ),
        seconderEntries: hydrateSupporterEntries(
          current[key].seconderEntries,
          Math.max(1, Number(post?.requirements?.secondersRequired || 1))
        ),
      } : buildNominationDraftFromPost(post),
    }))
    setNominationContext({ election, post })
  }

  const saveNomination = async () => {
    if (!nominationContext) return
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    try {
      const validationMessage = validateNominationForm(
        nominationFormDrafts[key] || createBlankNominationForm(),
        nominationContext.post
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
        winnerNominationIds: current[postId]?.winnerNominationIds || [],
        winnerNominationId: current[postId]?.winnerNominationId || "",
        winnerIsTie: Boolean(current[postId]?.winnerIsTie),
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
          winnerNominationId:
            !draft?.winnerIsTie && draft?.winnerNominationIds?.[0] && draft.winnerNominationIds[0] !== "nota"
              ? draft.winnerNominationIds[0]
              : !draft?.winnerIsTie && draft?.winnerNominationId && draft.winnerNominationId !== "nota"
                ? draft.winnerNominationId
                : null,
          winnerNominationIds: Array.isArray(draft?.winnerNominationIds) ? draft.winnerNominationIds : [],
          winnerIsNota: (Array.isArray(draft?.winnerNominationIds) ? draft.winnerNominationIds : []).includes("nota"),
          winnerIsTie: Boolean(draft?.winnerIsTie),
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

  const exportResultsCsv = () => {
    if (!selectedAdminElection?.results?.posts?.length) {
      toast.error("No result data available to export")
      return
    }

    const escapeCsv = (value) => {
      const stringValue = String(value ?? "")
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const rows = (selectedAdminElection.results.posts || []).flatMap((postResult) => {
      const draft = resultsDrafts[String(postResult.postId)] || {}
      return (postResult.candidates || []).map((candidate, index) => {
        const selectedWinnerIds = Array.isArray(draft.winnerNominationIds)
          ? draft.winnerNominationIds
          : draft.winnerNominationId
            ? [draft.winnerNominationId]
            : []
        const isSelectedWinner = selectedWinnerIds.includes(String(candidate.nominationId || ""))
        const previewWinnerIds = Array.isArray(postResult.previewWinnerNominationIds)
          ? postResult.previewWinnerNominationIds.map((value) => String(value))
          : []
        const isPreviewWinner = previewWinnerIds.includes(String(candidate.nominationId || ""))

        return [
          selectedAdminElection.title,
          selectedAdminElection.academicYear,
          postResult.postTitle,
          index + 1,
          candidate.candidateName,
          candidate.candidateRollNumber || "",
          candidate.isNota ? "YES" : "NO",
          candidate.voteCount || 0,
          formatVotePercentage(candidate.voteCount, postResult.totalVotes),
          postResult.totalVotes || 0,
          isPreviewWinner ? "YES" : "NO",
          isSelectedWinner ? "YES" : "NO",
          draft?.winnerIsTie ? "TIE" : "SINGLE",
          draft.notes || "",
        ]
      })
    })

    const headers = [
      "Election",
      "Academic Year",
      "Post",
      "Rank",
      "Candidate",
      "Roll Number",
      "Is NOTA",
      "Votes",
      "Percentage",
      "Total Votes",
      "Preview Winner",
      "Selected Winner",
      "Selected Result Mode",
      "Notes",
    ]

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = URL.createObjectURL(blob)
    link.download = `election_results_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const exportNominationsCsv = () => {
    if (!selectedAdminElection) {
      toast.error("No election selected")
      return
    }

    if (!filteredNominations.length) {
      toast.error("No nominations available to export in this view")
      return
    }

    const escapeCsv = (value) => {
      const stringValue = String(value ?? "")
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const countByStatus = (entries = [], status) =>
      (Array.isArray(entries) ? entries : []).filter((entry) => entry?.status === status).length

    const rows = filteredNominations.map((nomination) => {
      const proposerEntries = Array.isArray(nomination?.proposerEntries) ? nomination.proposerEntries : []
      const seconderEntries = Array.isArray(nomination?.seconderEntries) ? nomination.seconderEntries : []

      return [
        selectedAdminElection.title,
        selectedAdminElection.academicYear,
        nomination.postTitle || "",
        nomination.candidateName || nomination.candidateRollNumber || "",
        nomination.candidateRollNumber || "",
        nomination.candidateEmail || "",
        formatDateTime(nomination.submittedAt),
        formatStageLabel(nomination.status),
        proposerEntries.length,
        countByStatus(proposerEntries, "accepted"),
        countByStatus(proposerEntries, "pending"),
        countByStatus(proposerEntries, "rejected"),
        seconderEntries.length,
        countByStatus(seconderEntries, "accepted"),
        countByStatus(seconderEntries, "pending"),
        countByStatus(seconderEntries, "rejected"),
        nomination.supporterSummary?.total || 0,
        nomination.supporterSummary?.accepted || 0,
        nomination.supporterSummary?.pending || 0,
        nomination.supporterSummary?.rejected || 0,
        nomination.review?.notes || "",
      ]
    })

    const headers = [
      "Election",
      "Academic Year",
      "Post",
      "Candidate Name",
      "Roll Number",
      "Email",
      "Submitted At",
      "Nomination Status",
      "Proposer Total",
      "Proposer Accepted",
      "Proposer Pending",
      "Proposer Rejected",
      "Seconder Total",
      "Seconder Accepted",
      "Seconder Pending",
      "Seconder Rejected",
      "Supporter Total",
      "Supporter Accepted",
      "Supporter Pending",
      "Supporter Rejected",
      "Review Comment",
    ]

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = URL.createObjectURL(blob)
    link.download = `election_nominations_${nominationTab}_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const sendVotingEmails = async () => {
    if (!selectedAdminElectionId) return

    try {
      setBusyKey(`voting-email:${selectedAdminElectionId}`)
      const response = await electionsApi.sendVotingEmails(selectedAdminElectionId)
      setLiveVotingStats((current) =>
        current
          ? {
              ...current,
              dispatch: {
                ...current.dispatch,
                status: "running",
                lastTriggeredAt: new Date().toISOString(),
              },
            }
          : current
      )
      toast.success(response?.message || "Voting emails queued")

      window.setTimeout(() => {
        loadVotingLiveStats(selectedAdminElectionId, { silent: true }).catch(() => {})
        loadAdminDetail(selectedAdminElectionId).catch(() => {})
      }, 1500)
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to send voting emails"))
    } finally {
      setBusyKey("")
    }
  }

  const cloneElection = async () => {
    if (!selectedAdminElectionId) return

    try {
      setBusyKey(`clone:${selectedAdminElectionId}`)
      const response = await electionsApi.cloneElection(selectedAdminElectionId, {
        title: cloneElectionTitle.trim(),
      })
      toast.success(response?.message || "Election copied")
      setCloneElectionOpen(false)
      await loadAdminElections(false)
      if (response?.data?.id) {
        setSelectedAdminElectionId(response.data.id)
        await loadAdminDetail(response.data.id)
      }
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to copy election"))
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
        {isAdminLikeView ? (
          <>
            <HeaderSelect
              value={selectedAdminElectionId}
              onChange={setSelectedAdminElectionId}
              options={adminElections}
              placeholder={isGymkhanaElectionOfficerView ? "Select published election" : "Select current or past election"}
              headerSelectStyle={headerSelectStyle}
              formatElectionOptionLabel={formatElectionOptionLabel}
            />
            {isAdminView && adminElections.length > 0 ? (
              <Button size="md" variant="ghost" onClick={() => setHistoryModalOpen(true)}>
                <History size={16} /> History
              </Button>
            ) : null}
            {isAdminView && selectedAdminElection ? (
              <Button size="md" variant="secondary" onClick={openEditWizard}>
                <FileText size={16} /> Edit Election
              </Button>
            ) : null}
            {isAdminView ? (
              <Button size="md" onClick={openCreateWizard}>
                <Plus size={16} /> Create Election
              </Button>
            ) : null}
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
        {isAdminLikeView && !selectedAdminElectionId ? (
          <EmptyState
            title="Select an election occurrence"
            message={
              adminElections.length === 0
                ? isGymkhanaElectionOfficerView
                  ? "No published elections are available for review right now."
                  : "Create the first election from the header to begin."
                : isGymkhanaElectionOfficerView
                  ? "Choose one of the published elections from the header to review nominations."
                  : "No election is auto-selected right now. Choose a current or past occurrence from the header."
            }
          />
        ) : null}

        {isAdminLikeView && selectedAdminElection ? (
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
            onPublishResults={() => setShowPublishResultsConfirm(true)}
            onExportResults={exportResultsCsv}
            onExportNominations={exportNominationsCsv}
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
            liveVotingStats={liveVotingStats}
            loadingVotingStats={loadingVotingStats}
            onSendVotingEmails={() => setShowSendVotingEmailsConfirm(true)}
            socketConnected={isSocketConnected}
            onOpenCloneElection={openCloneElection}
            canCloneElection={canCloneElection}
            cloneDisabledReason={cloneElectionDisabledReason}
            readOnly={isGymkhanaElectionOfficerView}
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
            groupOptions={groupOptions}
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
            textareaStyle={textareaStyle}
            readOnly={false}
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

          <CloneElectionModal
            isOpen={cloneElectionOpen}
            onClose={() => setCloneElectionOpen(false)}
            titleValue={cloneElectionTitle}
            onTitleChange={setCloneElectionTitle}
            onSubmit={cloneElection}
            loading={busyKey === `clone:${selectedAdminElectionId}`}
            mutedTextStyle={mutedTextStyle}
            errorTextStyle={errorTextStyle}
          />
        </>
      ) : isGymkhanaElectionOfficerView ? (
        <AdminNominationReviewModal
          nomination={reviewNomination}
          electionId={selectedAdminElectionId}
          onClose={() => setReviewNomination(null)}
          onReview={() => {}}
          busy=""
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
          textareaStyle={textareaStyle}
          readOnly
        />
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
            onSupporterChange={updateSupporterEntry}
            onLookupSupporter={lookupSupporter}
            onAddSupporter={addSupporterEntry}
            onRemoveSupporter={removeSupporterEntry}
            supportLookupKey={supportLookupKey}
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

      {isAdminView ? (
        <>
          <ConfirmationDialog
            isOpen={showSendVotingEmailsConfirm}
            onClose={() => setShowSendVotingEmailsConfirm(false)}
            onConfirm={sendVotingEmails}
            title="Send Voting List"
            message="This will send voting ballot emails again to students who are still eligible to vote in this election. Use this only when you intentionally want to resend the voting list."
            confirmText="Send Again"
            cancelText="Cancel"
          />

          <ConfirmationDialog
            isOpen={showPublishResultsConfirm}
            onClose={() => setShowPublishResultsConfirm(false)}
            onConfirm={publishResults}
            title="Publish Results"
            message="This will publish the currently selected winners for all posts and make the results visible to students. Please review the NOTA selections and candidate overrides before continuing."
            confirmText="Publish Now"
            cancelText="Cancel"
          />
        </>
      ) : null}
    </div>
  )
}

export default ElectionsPage
