import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal, Table, Tabs } from "czero/react"
import { useNavigate } from "react-router-dom"
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  History,
  Plus,
  Shield,
  Users,
  Vote,
  XCircle,
} from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CsvUploader from "@/components/common/CsvUploader"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import { Alert, EmptyState, ErrorState, LoadingState, useToast } from "@/components/ui/feedback"
import { useAuth } from "@/contexts/AuthProvider"
import { useGlobal } from "@/contexts/GlobalProvider"
import StepIndicator from "@/components/ui/navigation/StepIndicator"
import { electionsApi, idCardApi, studentApi, uploadApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

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

const isPdfDocument = (url = "") => String(url).toLowerCase().includes(".pdf")

const resolveUploadedUrl = (uploadResponse) => {
  if (typeof uploadResponse === "string") return uploadResponse
  if (uploadResponse?.url) return uploadResponse.url
  if (uploadResponse?.data?.url) return uploadResponse.data.url
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

const DocumentUploadField = ({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}) => {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedMimeTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ]

    if (
      !allowedMimeTypes.includes(file.type) &&
      !/\.(pdf|png|jpe?g|webp|gif)$/i.test(file.name)
    ) {
      toast.error("Only PDF and image files are allowed")
      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Document size must be 5MB or smaller")
      event.target.value = ""
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      const uploadResponse = await uploadApi.uploadElectionNominationDocument(formData)
      const uploadedUrl = resolveUploadedUrl(uploadResponse)

      if (!uploadedUrl) {
        throw new Error("Upload response did not include a document URL")
      }

      onChange(uploadedUrl)
      toast.success(`${label} uploaded`)
    } catch (error) {
      toast.error(error.message || `Failed to upload ${label}`)
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  return (
    <>
      <div style={flatPanelStyle}>
        <label style={labelStyle}>
          {label}
          {required ? " *" : ""}
        </label>
        {value ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
              {isPdfDocument(value) ? "PDF uploaded" : "Image uploaded"}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Button size="sm" variant="secondary" onClick={() => setViewerOpen(true)}>
                View
              </Button>
              {!disabled ? (
                <label style={{ margin: 0 }}>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "36px",
                      padding: "0 var(--spacing-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border-primary)",
                      backgroundColor: "var(--color-bg-primary)",
                      color: "var(--color-text-body)",
                      cursor: uploading ? "wait" : "pointer",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    {uploading ? "Uploading..." : "Replace"}
                  </span>
                </label>
              ) : null}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={mutedTextStyle}>PDF or image, max 5MB</div>
            <label style={{ margin: 0 }}>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={disabled || uploading}
              />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "36px",
                  padding: "0 var(--spacing-3)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--button-primary-bg)",
                  color: "var(--color-white)",
                  cursor: disabled || uploading ? "not-allowed" : "pointer",
                  fontSize: "var(--font-size-sm)",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {uploading ? "Uploading..." : `Upload ${label}`}
              </span>
            </label>
          </div>
        )}
      </div>

      <CertificateViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        certificateUrl={value}
      />
    </>
  )
}

const StatusPill = ({ tone = "default", icon = null, children }) => (
  <span style={{ ...pillBaseStyle, ...(statusToneStyles[tone] || statusToneStyles.default) }}>
    {icon}
    {children}
  </span>
)

const HeaderSelect = ({ value, onChange, options, placeholder }) => (
  <div style={{ minWidth: "320px" }}>
    <select style={headerSelectStyle} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {formatElectionOptionLabel(option)}
        </option>
      ))}
    </select>
  </div>
)

const MetaList = ({ items = [] }) => (
  <div style={{ display: "grid", gap: "10px" }}>
    {items.map((item) => (
      <div
        key={item.label}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--spacing-3)",
        }}
      >
        <span style={mutedTextStyle}>{item.label}</span>
        <span style={{ color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)", textAlign: "right" }}>
          {item.value || "—"}
        </span>
      </div>
    ))}
  </div>
)

const ScopeEditor = ({ title, scope, onChange, batchOptions, error }) => {
  const toggleBatch = (batch) => {
    const exists = scope.batches.includes(batch)
    onChange({
      ...scope,
      batches: exists
        ? scope.batches.filter((item) => item !== batch)
        : [...scope.batches, batch],
    })
  }

  return (
    <div style={flatPanelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-3)", marginBottom: "var(--spacing-3)" }}>
        <div>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>{title}</div>
          <div style={mutedTextStyle}>{summarizeScope(scope)}</div>
        </div>
      </div>

      <div style={{ marginBottom: "var(--spacing-3)" }}>
        <div style={labelStyle}>Batches</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {batchOptions.map((batch) => {
            const isSelected = scope.batches.includes(batch)
            return (
              <button
                key={batch}
                type="button"
                onClick={() => toggleBatch(batch)}
                style={{
                  ...pillBaseStyle,
                  border: "1px solid",
                  borderColor: isSelected ? "var(--color-primary)" : "var(--color-border-primary)",
                  backgroundColor: isSelected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                  color: isSelected ? "var(--color-primary)" : "var(--color-text-body)",
                  cursor: "pointer",
                }}
              >
                {batch}
              </button>
            )
          })}
          {batchOptions.length === 0 ? <span style={mutedTextStyle}>No configured batches available.</span> : null}
        </div>
      </div>

      <div>
        <div style={labelStyle}>Additional students via CSV</div>
        <CsvUploader
          requiredFields={nominationTemplateHeaders}
          templateHeaders={nominationTemplateHeaders}
          templateFileName={`${title.toLowerCase().replace(/\s+/g, "_")}_students.csv`}
          instructionText="Upload a CSV with a single `rollNumber` column."
          onDataParsed={(rows) => {
            const nextRollNumbers = rows
              .map((row) => String(row.rollNumber || "").trim().toUpperCase())
              .filter(Boolean)

            onChange({
              ...scope,
              extraRollNumbers: [...new Set([...(scope.extraRollNumbers || []), ...nextRollNumbers])],
            })
          }}
        />
        {(scope.extraRollNumbers || []).length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "var(--spacing-3)" }}>
            {scope.extraRollNumbers.map((rollNumber) => (
              <StatusPill key={rollNumber} tone="default">
                {rollNumber}
              </StatusPill>
            ))}
          </div>
        ) : null}
        {error ? <div style={errorTextStyle}>{error}</div> : null}
      </div>
    </div>
  )
}

const HostelPicker = ({ selectedHostels = [], hostels = [], onChange }) => {
  const toggleHostel = (hostelName) => {
    const exists = selectedHostels.includes(hostelName)
    onChange(exists ? selectedHostels.filter((item) => item !== hostelName) : [...selectedHostels, hostelName])
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {hostels.map((hostel) => {
        const hostelName = hostel.name
        const isSelected = selectedHostels.includes(hostelName)
        return (
          <button
            key={hostel.id}
            type="button"
            onClick={() => toggleHostel(hostelName)}
            style={{
              ...pillBaseStyle,
              border: "1px solid",
              borderColor: isSelected ? "var(--color-primary)" : "var(--color-border-primary)",
              backgroundColor: isSelected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
              color: isSelected ? "var(--color-primary)" : "var(--color-text-body)",
              cursor: "pointer",
            }}
          >
            {hostelName}
          </button>
        )
      })}
      {hostels.length === 0 ? <span style={mutedTextStyle}>No hostels available.</span> : null}
    </div>
  )
}

const ElectionHistoryModal = ({
  isOpen,
  onClose,
  elections,
  selectedElectionId,
  onSelect,
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
                  <StatusPill tone={getStatusTone(election.currentStage)}>
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

const ElectionWizardModal = ({
  isOpen,
  mode,
  form,
  setForm,
  onClose,
  onSave,
  saving,
  batchOptions,
  hostels,
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
  }, [isOpen, mode])

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
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
                {form.timeline[field.key] ? formatDateTime(fromDateTimeLocal(form.timeline[field.key])) : "Not set"}
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--spacing-3)" }}>
          <div style={panelStyle}>
            <label style={labelStyle}>Chief election officer roll number</label>
            <Input
              style={
                commissionErrors.chiefElectionOfficerRollNumber
                  ? { borderColor: "var(--color-danger)" }
                  : undefined
              }
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap", marginBottom: "var(--spacing-3)" }}>
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
              return (
                <button
                  key={post.id || `post-${index}`}
                  type="button"
                  onClick={() => setActivePostIndex(index)}
                  style={{
                    ...postTabStyle,
                    borderColor: postErrors[index] && Object.keys(postErrors[index]).length > 0
                      ? "var(--color-danger)"
                      : isActive
                        ? "var(--color-primary)"
                        : "var(--color-border-primary)",
                    backgroundColor: isActive ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                    color: postErrors[index] && Object.keys(postErrors[index]).length > 0
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
            <div>
              <div style={{ ...labelStyle, marginBottom: "4px" }}>Selected post</div>
              <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                {activePost.title || `Post ${activePostIndex + 1}`}
              </div>
            </div>
            {form.posts.length > 1 ? (
              <Button size="sm" variant="ghost" onClick={() => removePost(activePostIndex)}>
                Remove Post
              </Button>
            ) : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
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
                style={
                  activePostErrors.category ? { ...selectStyle, borderColor: "var(--color-danger)" } : selectStyle
                }
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
              style={
                activePostErrors.description
                  ? { ...textareaStyle, borderColor: "var(--color-danger)" }
                  : textareaStyle
              }
              value={activePost.description}
              onChange={(event) => updatePost(activePostIndex, { description: event.target.value })}
            />
            {activePostErrors.description ? <div style={errorTextStyle}>{activePostErrors.description}</div> : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--spacing-3)" }}>
            <ScopeEditor
              title="Candidate eligibility"
              scope={activePost.candidateEligibility}
              onChange={(scope) => updatePost(activePostIndex, { candidateEligibility: scope })}
              batchOptions={batchOptions}
              error={activePostErrors.candidateEligibility}
            />
            <ScopeEditor
              title="Voter eligibility"
              scope={activePost.voterEligibility}
              onChange={(scope) => updatePost(activePostIndex, { voterEligibility: scope })}
              batchOptions={batchOptions}
              error={activePostErrors.voterEligibility}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-3)" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-3)" }}>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
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
        {currentStep === "posts" && wizardErrors.general ? <div style={errorBannerStyle}>{wizardErrors.general}</div> : null}
        {body}
      </div>
    </Modal>
  )
}

const AdminNominationReviewModal = ({ nomination, electionId, onClose, onReview, busy }) => {
  const [viewerUrl, setViewerUrl] = useState("")

  if (!nomination) return null

  return (
    <>
      <Modal
        isOpen={Boolean(nomination)}
        onClose={onClose}
        title={nomination.candidateName || nomination.candidateRollNumber}
        width={760}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
            <div style={badgeRowStyle}>
              <StatusPill tone={getStatusTone(nomination.status)}>{formatStageLabel(nomination.status)}</StatusPill>
              <StatusPill tone="default">{nomination.postTitle}</StatusPill>
              <StatusPill tone="default">{nomination.candidateRollNumber}</StatusPill>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="sm" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={busy === `${electionId}:${nomination.id}:rejected`}
                onClick={() => onReview(nomination.id, "rejected")}
              >
                <XCircle size={14} /> Reject
              </Button>
              <Button
                size="sm"
                loading={busy === `${electionId}:${nomination.id}:verified`}
                onClick={() => onReview(nomination.id, "verified")}
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
              />
            </div>

            <div style={detailPanelStyle}>
              <div style={labelStyle}>Supporting students</div>
              <MetaList
                items={[
                  { label: "Proposers", value: (nomination.proposerRollNumbers || []).join(", ") || "—" },
                  { label: "Seconders", value: (nomination.seconderRollNumbers || []).join(", ") || "—" },
                ]}
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

          <div style={detailGridStyle}>
            {[
              { label: "Grade Card", value: nomination.gradeCardUrl },
              { label: "Manifesto", value: nomination.manifestoUrl },
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
                      style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "var(--font-weight-medium)", alignSelf: "center" }}
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

const StudentNominationModal = ({
  election,
  post,
  form,
  setForm,
  onClose,
  onSave,
  saving,
  currentUserId,
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

  if (!post) return null

  return (
    <>
      <Modal
        isOpen={Boolean(post)}
        onClose={onClose}
        title={`Nomination · ${post.title}`}
        width={720}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
            <div style={badgeRowStyle}>
              <StatusPill tone="default">{election?.title}</StatusPill>
              <StatusPill tone="primary">P {post.requirements?.proposersRequired || 0}</StatusPill>
              <StatusPill tone="primary">S {post.requirements?.secondersRequired || 0}</StatusPill>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="sm" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button size="sm" onClick={onSave} loading={saving} disabled={saving || loadingIdCard || !hasUploadedIdCard}>
                <FileText size={14} /> Save
              </Button>
            </div>
          </div>
        }
      >
        <div style={modalBodyStyle}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
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
            />
            <DocumentUploadField
              label="Manifesto"
              value={form.manifestoUrl}
              onChange={(nextValue) => updateForm({ manifestoUrl: nextValue })}
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

const StudentVoteModal = ({
  election,
  post,
  selectedCandidateId,
  setSelectedCandidateId,
  onClose,
  onVote,
  saving,
}) => {
  if (!post) return null

  return (
    <Modal
      isOpen={Boolean(post)}
      onClose={onClose}
      title={`Vote · ${post.title}`}
      width={760}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
          <div style={badgeRowStyle}>
            <StatusPill tone="default">{election?.title}</StatusPill>
            <StatusPill tone="success">{(post.approvedCandidates || []).length} candidate(s)</StatusPill>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
            {!post.hasVoted ? (
              <Button size="sm" onClick={onVote} loading={saving} disabled={saving || !selectedCandidateId}>
                <Vote size={14} /> Cast Vote
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <div style={modalBodyStyle}>
        {(post.approvedCandidates || []).length === 0 ? (
          <EmptyState
            title="No approved candidates"
            message="Candidates will appear here after nomination verification."
          />
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Candidate</Table.Head>
                <Table.Head>Roll Number</Table.Head>
                <Table.Head>Pitch</Table.Head>
                <Table.Head align="right">Action</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {post.approvedCandidates.map((candidate) => {
                const isChosen = String(selectedCandidateId) === String(candidate.id)
                const isMyVote = String(post.votedCandidateNominationId) === String(candidate.id)
                return (
                  <Table.Row key={candidate.id}>
                    <Table.Cell>
                      <div style={{ display: "grid", gap: "4px" }}>
                        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                          {candidate.candidateName || "Candidate"}
                        </span>
                        <span style={mutedTextStyle}>{candidate.candidateEmail || "Student nomination"}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{candidate.candidateRollNumber}</Table.Cell>
                    <Table.Cell>{candidate.pitch || "—"}</Table.Cell>
                    <Table.Cell align="right">
                      {post.hasVoted ? (
                        <StatusPill tone={isMyVote ? "success" : "default"}>
                          {isMyVote ? "Your vote" : "Closed"}
                        </StatusPill>
                      ) : (
                        <Button
                          size="sm"
                          variant={isChosen ? "secondary" : "ghost"}
                          onClick={() => setSelectedCandidateId(candidate.id)}
                        >
                          {isChosen ? "Selected" : "Select"}
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        )}
      </div>
    </Modal>
  )
}

const AdminResultsEditModal = ({ postResult, draft, onClose, onChange }) => {
  if (!postResult) return null

  return (
    <Modal
      isOpen={Boolean(postResult)}
      onClose={onClose}
      title={`Results · ${postResult.postTitle}`}
      width={720}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
          <div style={badgeRowStyle}>
            <StatusPill tone="default">{postResult.totalVotes} vote(s)</StatusPill>
            {postResult.previewWinnerName ? (
              <StatusPill tone="success">Lead: {postResult.previewWinnerName}</StatusPill>
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
          <EmptyState title="No verified candidates" message="Results will appear here after verification and voting." />
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

  const [studentPortalState, setStudentPortalState] = useState(null)
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
    const [portalResponse, electionsResponse] = await Promise.all([
      electionsApi.getStudentPortalState(),
      electionsApi.getStudentCurrent(),
    ])
    const nextPortalState = portalResponse?.data || null
    const nextElections = electionsResponse?.data?.elections || []

    setStudentPortalState(nextPortalState)
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
          <>
            {/* Compact info banner */}
            <div style={infoBannerStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                  {selectedAdminElection.title}
                </span>
                <div style={badgeRowStyle}>
                  <StatusPill tone={getStatusTone(selectedAdminElection.currentStage)} icon={<Clock3 size={12} />}>
                    {formatStageLabel(selectedAdminElection.currentStage)}
                  </StatusPill>
                  <StatusPill tone={getStatusTone(selectedAdminElection.status)}>
                    {formatStageLabel(selectedAdminElection.status)}
                  </StatusPill>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  {selectedAdminElection.academicYear} · {formatStageLabel(selectedAdminElection.phase)}
                </span>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                  <strong>{adminOverview.postCount}</strong> posts · <strong>{adminOverview.nominationCount}</strong> nominations · <strong>{adminOverview.verifiedCount}</strong> verified · <strong>{adminOverview.voteCount}</strong> votes
                </span>
              </div>
            </div>

            {/* Tab navigation */}
            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <Tabs
                variant="pills"
                tabs={[
                  { label: "Posts", value: "posts" },
                  { label: "Nominations", value: "nominations" },
                  { label: "Results", value: "results" },
                  { label: "Schedule", value: "schedule" },
                ]}
                activeTab={adminViewTab}
                setActiveTab={setAdminViewTab}
              />
            </div>

            {/* Posts tab */}
            {adminViewTab === "posts" && (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Post</Table.Head>
                    <Table.Head>Candidate Pool</Table.Head>
                    <Table.Head>Voter Pool</Table.Head>
                    <Table.Head>Requirements</Table.Head>
                    <Table.Head>Nominations</Table.Head>
                    <Table.Head>Votes</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {(selectedAdminElection.posts || []).length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={6}>
                        <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--color-text-muted)" }}>
                          No posts configured yet.
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    (selectedAdminElection.posts || []).map((post) => (
                      <Table.Row key={post.id}>
                        <Table.Cell>
                          <div style={{ display: "grid", gap: "2px" }}>
                            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{post.title}</span>
                            <span style={mutedTextStyle}>
                              {formatStageLabel(post.category)}{post.code ? ` · ${post.code}` : ""}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{summarizeScope(post.candidateEligibility)}</Table.Cell>
                        <Table.Cell>{summarizeScope(post.voterEligibility)}</Table.Cell>
                        <Table.Cell>
                          CGPA {post.requirements.minCgpa} · P {post.requirements.proposersRequired} · S {post.requirements.secondersRequired}
                        </Table.Cell>
                        <Table.Cell>
                          {(post.nominationCounts?.submitted || 0) + (post.nominationCounts?.verified || 0)} total · {post.nominationCounts?.verified || 0} verified
                        </Table.Cell>
                        <Table.Cell>{post.voteCount || 0}</Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            )}

            {/* Nominations tab */}
            {adminViewTab === "nominations" && (
              <>
                <div style={{ marginBottom: "var(--spacing-3)" }}>
                  <Tabs
                    variant="pills"
                    tabs={nominationTabs}
                    activeTab={nominationTab}
                    setActiveTab={setNominationTab}
                  />
                </div>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Candidate</Table.Head>
                      <Table.Head>Post</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head>Submitted</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredNominations.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={4}>
                          <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--color-text-muted)" }}>
                            No nominations in this view.
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      filteredNominations.map((nomination) => (
                        <Table.Row
                          key={nomination.id}
                          onClick={() => setReviewNomination(nomination)}
                          style={{ cursor: "pointer" }}
                        >
                          <Table.Cell>
                            <div style={{ display: "grid", gap: "2px" }}>
                              <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                                {nomination.candidateName || nomination.candidateRollNumber}
                              </span>
                              <span style={mutedTextStyle}>{nomination.candidateRollNumber}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>{nomination.postTitle}</Table.Cell>
                          <Table.Cell>
                            <StatusPill tone={getStatusTone(nomination.status)}>
                              {formatStageLabel(nomination.status)}
                            </StatusPill>
                          </Table.Cell>
                          <Table.Cell>{formatDateTime(nomination.submittedAt)}</Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </>
            )}

            {adminViewTab === "results" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "var(--spacing-3)",
                    flexWrap: "wrap",
                    marginBottom: "var(--spacing-3)",
                  }}
                >
                  <div style={mutedTextStyle}>
                    Open a row to adjust the winner before publishing the final result.
                  </div>
                  <Button
                    size="sm"
                    onClick={publishResults}
                    loading={busyKey === `results:${selectedAdminElectionId}`}
                    disabled={(selectedAdminElection?.results?.posts || []).length === 0}
                  >
                    Publish Results
                  </Button>
                </div>

                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Post</Table.Head>
                      <Table.Head>Leading Candidate</Table.Head>
                      <Table.Head>Total Votes</Table.Head>
                      <Table.Head>Published Winner</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {(selectedAdminElection?.results?.posts || []).length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={4}>
                          <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--color-text-muted)" }}>
                            No result data available yet.
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      (selectedAdminElection?.results?.posts || []).map((postResult) => {
                        const draft = resultsDrafts[String(postResult.postId)] || {}
                        const selectedWinner =
                          (postResult.candidates || []).find(
                            (candidate) => String(candidate.nominationId) === String(draft.winnerNominationId || "")
                          ) || null

                        return (
                          <Table.Row
                            key={postResult.postId}
                            onClick={() => setResultsEditorPostId(String(postResult.postId))}
                            style={{ cursor: "pointer" }}
                          >
                            <Table.Cell>
                              <div style={{ display: "grid", gap: "2px" }}>
                                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{postResult.postTitle}</span>
                                <span style={mutedTextStyle}>{(postResult.candidates || []).length} candidate(s)</span>
                              </div>
                            </Table.Cell>
                            <Table.Cell>{postResult.previewWinnerName || "—"}</Table.Cell>
                            <Table.Cell>{postResult.totalVotes}</Table.Cell>
                            <Table.Cell>{selectedWinner?.candidateName || "Not selected"}</Table.Cell>
                          </Table.Row>
                        )
                      })
                    )}
                  </Table.Body>
                </Table>
              </>
            )}

            {/* Schedule tab */}
            {adminViewTab === "schedule" && (
              <div style={infoGridStyle}>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Announcement</span>
                  <span style={compactStatValueStyle}>{formatDateTime(selectedAdminElection.timeline?.announcementAt)}</span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Nomination Ends</span>
                  <span style={compactStatValueStyle}>{formatDateTime(selectedAdminElection.timeline?.nominationEndAt)}</span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Withdrawal Ends</span>
                  <span style={compactStatValueStyle}>{formatDateTime(selectedAdminElection.timeline?.withdrawalEndAt)}</span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Voting Starts</span>
                  <span style={compactStatValueStyle}>{formatDateTime(selectedAdminElection.timeline?.votingStartAt)}</span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Voting Ends</span>
                  <span style={compactStatValueStyle}>{formatDateTime(selectedAdminElection.timeline?.votingEndAt)}</span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Results</span>
                  <span style={compactStatValueStyle}>{formatDateTime(selectedAdminElection.timeline?.resultsAnnouncedAt)}</span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>CEO</span>
                  <span style={compactStatValueStyle}>{selectedAdminElection.electionCommission?.chiefElectionOfficerRollNumber || "—"}</span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Officers</span>
                  <span style={compactStatValueStyle}>{(selectedAdminElection.electionCommission?.officerRollNumbers || []).join(", ") || "—"}</span>
                </div>
              </div>
            )}
          </>
        ) : null}

        {isStudentView && !selectedStudentElectionId ? (
          <EmptyState
            title="No active election window"
            message="The active election will appear here when participation, voting, or results are available."
          />
        ) : null}

        {isStudentView && selectedStudentElection ? (
          <>
            <div style={infoBannerStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
                  {selectedStudentElection.title}
                </h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                {selectedStudentElection.mode === "voting" ? (
                  <span><strong>Voting:</strong> {formatDateTime(selectedStudentElection.timeline?.votingStartAt)} – {formatDateTime(selectedStudentElection.timeline?.votingEndAt)}</span>
                ) : null}
                {selectedStudentElection.mode === "results" ? (
                  <span>
                    <strong>Status:</strong> {selectedStudentElection.results?.isPublished ? "Published" : "Publishing soon"}
                  </span>
                ) : null}
              </div>
            </div>

            {selectedStudentElection.mode === "participation" ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Post</Table.Head>
                    <Table.Head>Status</Table.Head>
                    <Table.Head align="right">Action</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {(selectedStudentElection.posts || []).length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={3}>
                        <div style={{ padding: "var(--spacing-5)", textAlign: "center", color: "var(--color-text-muted)" }}>
                          No posts are available for nomination right now.
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    (selectedStudentElection.posts || []).map((post) => (
                      <Table.Row key={post.id}>
                        <Table.Cell>
                          <div style={{ display: "grid", gap: "4px" }}>
                            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{post.title}</span>
                            <span style={mutedTextStyle}>
                              {formatStageLabel(post.category)}
                              {post.code ? ` · ${post.code}` : ""}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          {post.myNomination ? `Nomination ${formatStageLabel(post.myNomination.status)}` : "Not submitted"}
                        </Table.Cell>
                        <Table.Cell align="right">
                          <div style={{ display: "inline-flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <Button size="sm" variant="ghost" onClick={() => openNominationModal(selectedStudentElection, post)}>
                              {post.myNomination ? "Edit" : "Nominate"}
                            </Button>
                            {selectedStudentElection.currentStage === "withdrawal" &&
                            post.myNomination &&
                            post.myNomination.status !== "withdrawn" ? (
                              <Button
                                size="sm"
                                variant="danger"
                                loading={busyKey === `withdraw:${selectedStudentElection.id}:${post.myNomination.id}`}
                                onClick={() => withdrawNomination(selectedStudentElection.id, post.myNomination.id)}
                              >
                                Withdraw
                              </Button>
                            ) : null}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            ) : null}

            {selectedStudentElection.mode === "voting" ? (
              <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
                {(selectedStudentElection.posts || []).map((post) => (
                  <div key={post.id} style={detailPanelStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>{post.title}</div>
                        <div style={mutedTextStyle}>{(post.approvedCandidates || []).length} candidate(s)</div>
                      </div>
                      {post.hasVoted ? <StatusPill tone="success">Vote submitted</StatusPill> : null}
                    </div>

                    {(post.approvedCandidates || []).length === 0 ? (
                      <div style={mutedTextStyle}>No verified candidates are available for this post yet.</div>
                    ) : (
                      <div style={{ display: "grid", gap: "10px" }}>
                        {(post.approvedCandidates || []).map((candidate) => {
                          const selectedValue = voteSelections[`${selectedStudentElection.id}:${post.id}`] || ""
                          const checked = String(selectedValue) === String(candidate.id)
                          return (
                            <label
                              key={candidate.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "var(--spacing-3)",
                                padding: "var(--spacing-3)",
                                border: "1px solid var(--color-border-primary)",
                                borderRadius: "var(--radius-lg)",
                                backgroundColor: checked ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                                cursor: post.hasVoted ? "default" : "pointer",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                                <input
                                  type="radio"
                                  name={`vote-${selectedStudentElection.id}-${post.id}`}
                                  checked={checked}
                                  disabled={post.hasVoted}
                                  onChange={() =>
                                    setVoteSelections((current) => ({
                                      ...current,
                                      [`${selectedStudentElection.id}:${post.id}`]: candidate.id,
                                    }))
                                  }
                                />
                                <div style={{ display: "grid", gap: "4px" }}>
                                  <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                                    {candidate.candidateName}
                                  </span>
                                  <span style={mutedTextStyle}>{candidate.candidateRollNumber}</span>
                                </div>
                              </div>
                              <span style={mutedTextStyle}>{candidate.pitch || "Candidate"}</span>
                            </label>
                          )
                        })}

                        {!post.hasVoted ? (
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              size="sm"
                              onClick={() => castVote(selectedStudentElection.id, post.id)}
                              loading={busyKey === `vote:${selectedStudentElection.id}:${post.id}`}
                              disabled={!voteSelections[`${selectedStudentElection.id}:${post.id}`]}
                            >
                              Submit Vote
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {selectedStudentElection.mode === "results" ? (
              selectedStudentElection.results?.isPublished ? (
                <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
                  {(selectedStudentElection.results?.posts || []).map((postResult) => {
                    const winner =
                      (postResult.candidates || []).find(
                        (candidate) =>
                          String(candidate.nominationId) === String(postResult.publishedWinnerNominationId || "")
                      ) || null

                    return (
                      <div key={postResult.postId} style={detailPanelStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                              {postResult.postTitle}
                            </div>
                            <div style={mutedTextStyle}>{postResult.totalVotes} vote(s)</div>
                          </div>
                          <StatusPill tone="success">{winner?.candidateName || "Result published"}</StatusPill>
                        </div>

                        <div style={{ display: "grid", gap: "8px" }}>
                          {(postResult.candidates || []).map((candidate) => (
                            <div
                              key={candidate.nominationId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "var(--spacing-3)",
                                padding: "var(--spacing-3)",
                                border: "1px solid var(--color-border-primary)",
                                borderRadius: "var(--radius-lg)",
                                backgroundColor:
                                  String(candidate.nominationId) === String(postResult.publishedWinnerNominationId || "")
                                    ? "var(--color-success-bg)"
                                    : "var(--color-bg-primary)",
                              }}
                            >
                              <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                                {candidate.candidateName}
                              </span>
                              <strong style={{ color: "var(--color-text-heading)" }}>{candidate.voteCount}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Alert type="info">Results will be published soon.</Alert>
              )
            ) : null}
          </>
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
          />

          <AdminNominationReviewModal
            nomination={reviewNomination}
            electionId={selectedAdminElectionId}
            onClose={() => setReviewNomination(null)}
            onReview={handleReviewNomination}
            busy={busyKey}
          />

          <AdminResultsEditModal
            postResult={selectedAdminResultPost}
            draft={selectedAdminResultPost ? resultsDrafts[String(selectedAdminResultPost.postId)] : null}
            onClose={() => setResultsEditorPostId("")}
            onChange={(patch) => {
              if (!selectedAdminResultPost) return
              updateResultsDraft(String(selectedAdminResultPost.postId), patch)
            }}
          />

          <ElectionHistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            elections={adminElections}
            selectedElectionId={selectedAdminElectionId}
            onSelect={setSelectedAdminElectionId}
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
          />
        </>
      ) : null}
    </div>
  )
}

export default ElectionsPage
