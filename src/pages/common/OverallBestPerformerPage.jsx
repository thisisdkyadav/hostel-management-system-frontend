import { useEffect, useMemo, useState } from "react"
import { Button, DataTable, Input, Modal } from "czero/react"
import {
  Download,
  FileText,
  CalendarDays,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Eye,
  MessageSquare,
  Plus,
  Save,
  Trophy,
  Upload,
  Users,
  XCircle,
  BookOpen,
  Share2,
  Sparkles,
  Cpu,
  Activity,
  Compass,
} from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CsvUploader from "@/components/common/CsvUploader"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
import ProfileAvatar from "@/components/profile/ProfileAvatar"
import {
  eventDetailMetaChipStyles,
  infoBoxStyle,
  sectionLabelStyle,
} from "@/components/gymkhana/events-page/sharedPrimitives"
import {
  EmptyState,
  ErrorState,
  LoadingState,
  useToast,
} from "@/components/ui/feedback"
import { Badge, StatCards } from "@/components/ui"
import { useAuth } from "@/contexts/AuthProvider"
import useLocalFormDraft, {
  buildLocalFormDraftKey,
  readLocalFormDraft,
} from "@/hooks/useLocalFormDraft"
import { overallBestPerformerApi, porApi, studentApi, uploadApi } from "@/service"
import { getMediaDownloadUrl } from "@/utils/mediaUtils"
import "../../styles/por-requests.css"

const BTP_AWARD_OPTIONS = [
  { value: "none", label: "No BTP award" },
  { value: "institute_best", label: "Institute Best BTP" },
  { value: "second", label: "Second Best BTP" },
  { value: "third", label: "Third Best BTP" },
  { value: "department_award_or_nomination", label: "Department award / nomination" },
]

const PROJECT_GRADE_OPTIONS = [
  { value: "none", label: "No project grade" },
  { value: "AP", label: "AP" },
  { value: "AA", label: "AA" },
  { value: "AB", label: "AB" },
  { value: "BB", label: "BB" },
  { value: "OTHER", label: "Other" },
]

const PUBLICATION_OPTIONS = [
  { value: "journal_first_author", label: "Journal first author" },
  { value: "journal_co_author", label: "Journal co-author" },
  { value: "patent_granted", label: "Patent granted" },
  { value: "patent_filed", label: "Patent filed" },
  { value: "patent_published", label: "Patent published" },
  { value: "conference_first_author", label: "Conference first author" },
  { value: "conference_co_author", label: "Conference co-author" },
]

const TECH_TRANSFER_OPTIONS = [
  { value: "lead_role", label: "Technology transfer: lead role" },
  { value: "supporting_role", label: "Technology transfer: supporting role" },
]

const RESPONSIBILITY_OPTIONS = [
  { value: "gymkhana_or_fluxus_coordinator_or_il_event_organiser", label: "Gymkhana / Fluxus coordinator / IL organiser" },
  { value: "club_head_or_placmgr_or_fluxus_head_or_senator", label: "Club head / PlacMgr / Fluxus head / Senator" },
  { value: "organiser_of_national_level_event", label: "Organiser of national-level event" },
  { value: "chair_of_scientific_body", label: "Chair of scientific body" },
  { value: "position_holder_in_scientific_body", label: "Position holder in scientific body" },
  { value: "organiser_or_avana_or_coordinator", label: "Organiser / Avana / coordinator" },
  { value: "team_member", label: "Team member" },
  { value: "participation", label: "Participation" },
]

const AWARD_OPTIONS = [
  { value: "young_scientist_award", label: "Young Scientist Award" },
  { value: "incubator_generating_revenue", label: "Incubator generating revenue" },
  { value: "international_award", label: "International award" },
  { value: "incubated_startup", label: "Incubated startup" },
  { value: "national_award", label: "National award" },
]

const ACTIVITY_LEVEL_OPTIONS = [
  { value: "inter_iit_top_3", label: "Inter IIT top 3" },
  { value: "inter_iit_top_5", label: "Inter IIT top 5" },
  { value: "intra_iit_top_3", label: "Intra IIT top 3" },
  { value: "intra_iit_top_5", label: "Intra IIT top 5" },
  { value: "participation_inter_iit", label: "Participation in Inter IIT" },
  { value: "participation_intra_iit", label: "Participation in Intra IIT" },
]

const CO_CURRICULAR_OPTIONS = [
  { value: "competitive_exam_topper", label: "Competitive exam topper" },
  { value: "competitive_exam_rank_2_5", label: "Competitive exam rank 2-5" },
  { value: "competitive_exam_rank_6_10", label: "Competitive exam rank 6-10" },
  { value: "competitive_exam_participation", label: "Competitive exam participation" },
  { value: "workshop", label: "Workshop" },
  { value: "social_service", label: "Social service" },
]

const PROOF_SOURCE_OPTIONS = [
  { value: "upload", label: "Upload PDF" },
  { value: "por", label: "Use Verified POR" },
]

const BTP_AWARD_POINTS = {
  none: 0,
  institute_best: 5,
  second: 4,
  third: 3,
  department_award_or_nomination: 2,
}

const PROJECT_GRADE_POINTS = {
  none: 0,
  AP: 5,
  AA: 4,
  AB: 3,
  BB: 2,
  OTHER: 1,
}

const PUBLICATION_POINTS = {
  journal_first_author: 4,
  journal_co_author: 2,
  patent_granted: 5,
  patent_filed: 2,
  patent_published: 3,
  conference_first_author: 2,
  conference_co_author: 1,
}

const TECHNOLOGY_TRANSFER_POINTS = {
  lead_role: 4,
  supporting_role: 2,
}

const RESPONSIBILITY_POINTS = {
  gymkhana_or_fluxus_coordinator_or_il_event_organiser: 5,
  club_head_or_placmgr_or_fluxus_head_or_senator: 4,
  organiser_of_national_level_event: 4,
  chair_of_scientific_body: 4,
  position_holder_in_scientific_body: 3,
  organiser_or_avana_or_coordinator: 3,
  team_member: 2,
  participation: 1,
}

const AWARD_POINTS = {
  young_scientist_award: 7.5,
  incubator_generating_revenue: 5,
  international_award: 5,
  incubated_startup: 4,
  national_award: 3,
}

const ACTIVITY_LEVEL_POINTS = {
  inter_iit_top_3: 5,
  inter_iit_top_5: 4,
  intra_iit_top_3: 3,
  intra_iit_top_5: 2,
  participation_inter_iit: 2,
  participation_intra_iit: 1,
}

const CO_CURRICULAR_POINTS = {
  competitive_exam_topper: 4,
  competitive_exam_rank_2_5: 3,
  competitive_exam_rank_6_10: 2,
  competitive_exam_participation: 1,
  workshop: 2,
  social_service: 2,
}

const SECTION_MAX_POINTS = {
  coursework: 15,
  projectThesis: 15,
  responsibilities: 15,
  awards: 15,
  cultural: 10,
  scienceTechnology: 10,
  gamesSports: 10,
  coCurricular: 10,
}

const surfaceStyle = {
  backgroundColor: "var(--color-bg-primary)",
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card)",
  boxShadow: "var(--shadow-card)",
}

const panelStyle = {
  ...surfaceStyle,
  overflow: "hidden",
}

const panelHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
  padding: "var(--spacing-3) var(--spacing-4)",
  borderBottom: "1px solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-secondary)",
}

const fieldLabelStyle = {
  display: "block",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "var(--spacing-1)",
}

const inputStyle = {
  width: "100%",
  border: "1px solid var(--color-border-input)",
  borderRadius: "var(--radius-input)",
  backgroundColor: "var(--color-bg-primary)",
  padding: "10px 12px",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-primary)",
}

const textareaStyle = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
}

const panelBodyStyle = {
  padding: "var(--spacing-4)",
}

const helperTextStyle = {
  marginTop: "var(--spacing-1)",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-muted)",
  lineHeight: 1.5,
}

const fieldClusterStyle = {
  ...infoBoxStyle,
  display: "grid",
  gap: "var(--spacing-3)",
}

const checklistItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--spacing-3)",
  padding: "var(--spacing-3)",
  borderRadius: "var(--radius-card-sm)",
  border: "1px solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-secondary)",
}

const buildMetaChipStyle = (extra = {}) => ({
  ...eventDetailMetaChipStyles,
  ...extra,
})

const badgeStyle = (tone = "default") => {
  const variants = {
    default: {
      backgroundColor: "var(--color-bg-tertiary)",
      color: "var(--color-text-body)",
    },
    success: {
      backgroundColor: "var(--color-success-bg)",
      color: "var(--color-success-text)",
    },
    danger: {
      backgroundColor: "var(--color-danger-bg-light)",
      color: "var(--color-danger-text)",
    },
    primary: {
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
    },
    warning: {
      backgroundColor: "var(--color-warning-bg-light)",
      color: "var(--color-warning-text)",
    },
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1)",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    ...variants[tone],
  }
}

const createEmptyItem = (scoreType = "") => ({
  year: "",
  title: "",
  level: "",
  eventName: "",
  performance: "",
  participationType: "individual",
  referenceCode: "",
  scoreType,
  notes: "",
  proofSourceType: "upload",
  proofUrl: "",
  proofPorId: "",
})

const createEmptyReference = () => ({
  name: "",
  designation: "",
  department: "",
  phoneNumber: "",
})

const formatDateTimeInput = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const normalizeRollNumbers = (rollNumbers = []) =>
  [...new Set(
    (Array.isArray(rollNumbers) ? rollNumbers : [])
      .map((rollNumber) => String(rollNumber || "").trim().toUpperCase())
      .filter(Boolean)
  )]

const buildEligibleStudentRows = (rollNumbers = [], studentRecords = []) => {
  const studentByRollNumber = new Map(
    (Array.isArray(studentRecords) ? studentRecords : []).map((student) => [
      String(student?.rollNumber || "").trim().toUpperCase(),
      student,
    ])
  )

  return normalizeRollNumbers(rollNumbers).map((rollNumber) => {
    const student = studentByRollNumber.get(rollNumber)

    return {
      rollNumber,
      name: String(student?.name || "").trim(),
      email: String(student?.email || "").trim(),
      department: String(student?.department || "").trim(),
      degree: String(student?.degree || "").trim(),
      exists: student?.exists !== false,
    }
  })
}

const createOccurrenceFormState = (overrides = {}) => ({
  title: "",
  awardYear: String(new Date().getFullYear()),
  applyStartAt: "",
  applyEndAt: "",
  description: "",
  eligibleRows: [],
  eligibleRollNumbers: [],
  eligibleStudents: [],
  studentListTouched: false,
  ...overrides,
})

const formatExportDateTime = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString()
}

const summarizeProofsForExport = (proofs = []) =>
  (Array.isArray(proofs) ? proofs : [])
    .map((proof) => {
      if (proof?.sourceType === "por") {
        const linkedPor = proof?.linkedPor
        return [
          "POR",
          linkedPor?.positionTitle || "",
          linkedPor?.club?.name || "",
          linkedPor?.gymkhanaCategoryLabel || "",
          linkedPor?.tenure || "",
          proof?.porRequestId || "",
        ]
          .filter(Boolean)
          .join(" | ")
      }

      return ["PDF", proof?.label || "", proof?.url || ""].filter(Boolean).join(" | ")
    })
    .filter(Boolean)
    .join(" || ")

const summarizeItemsForExport = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) =>
      [
        `#${index + 1}`,
        item?.title || "",
        item?.scoreType || "",
        item?.calculatedPoints ?? "",
        item?.year || "",
        item?.level || "",
        item?.eventName || "",
        item?.performance || "",
        item?.participationType || "",
        item?.referenceCode || "",
        item?.notes || "",
        summarizeProofsForExport(item?.proofs),
      ]
        .filter((value) => String(value ?? "").trim() !== "")
        .join(" | ")
    )
    .filter(Boolean)
    .join(" || ")

const escapeCsvValue = (value) => {
  const normalized = value === null || value === undefined ? "" : String(value)
  return `"${normalized.replace(/"/g, '""')}"`
}

const downloadCsvFile = (content, filename) => {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadBlobFile = (blob, filename) => {
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const slugifyFilePart = (value, fallback = "document") => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || fallback
}

const resolvePrimaryProof = (proofs = []) => (Array.isArray(proofs) ? proofs[0] || null : null)

const collectPdfDocumentsFromProofs = (proofs = [], fallbackLabel = "Supporting Document") =>
  (Array.isArray(proofs) ? proofs : [])
    .map((proof) => {
      if (proof?.sourceType === "por") {
        const linkedPor = proof?.linkedPor
        if (!linkedPor?.supportingDocumentUrl) return null

        return {
          url: linkedPor.supportingDocumentUrl,
          label: linkedPor.supportingDocumentName || linkedPor.positionTitle || proof?.label || fallbackLabel,
        }
      }

      if (!proof?.url) return null

      return {
        url: proof.url,
        label: proof.label || fallbackLabel,
      }
    })
    .filter(Boolean)

const collectApplicationPdfDocuments = (application = null) => {
  if (!application) return []

  const documents = []
  const addProofs = (proofs, label) => {
    documents.push(...collectPdfDocumentsFromProofs(proofs, label))
  }

  addProofs(application?.coursework?.proofs, "Coursework")
  addProofs(application?.projectThesis?.btpAwardProofs, "BTP Award")
  addProofs(application?.projectThesis?.projectGradeProofs, "Project Grade")

  const addItemProofs = (items = [], sectionLabel = "Supporting Document") => {
    for (const item of Array.isArray(items) ? items : []) {
      addProofs(item?.proofs, item?.title || sectionLabel)
    }
  }

  addItemProofs(application?.projectThesis?.publicationItems, "Publication")
  addItemProofs(application?.projectThesis?.technologyTransferItems, "Technology Transfer")
  addItemProofs(application?.responsibilityItems, "Responsibility")
  addItemProofs(application?.awardItems, "Award")
  addItemProofs(application?.culturalItems, "Cultural Activity")
  addItemProofs(application?.scienceTechnologyItems, "Science And Technology Activity")
  addItemProofs(application?.gamesSportsItems, "Games And Sports Activity")
  addItemProofs(application?.coCurricularItems, "Co-curricular Activity")

  const uniqueByUrl = new Map()
  for (const document of documents) {
    const key = String(document?.url || "").trim()
    if (key && !uniqueByUrl.has(key)) {
      uniqueByUrl.set(key, document)
    }
  }

  return [...uniqueByUrl.values()]
}

const fetchPdfBytes = async (document) => {
  const response = await fetch(getMediaDownloadUrl(document.url), {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${document.label || "supporting PDF"}`)
  }

  return response.arrayBuffer()
}

const mergePdfDocuments = async (documents = []) => {
  const { PDFDocument } = await import("pdf-lib")
  const mergedPdf = await PDFDocument.create()

  for (const document of documents) {
    const pdfBytes = await fetchPdfBytes(document)
    const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return mergedPdf.save()
}

const buildProofStateFromProofs = (proofs = []) => {
  const proof = resolvePrimaryProof(proofs)

  if (proof?.sourceType === "por") {
    return {
      proofSourceType: "por",
      proofUrl: "",
      proofPorId: proof?.porRequestId || proof?.linkedPor?.id || "",
    }
  }

  return {
    proofSourceType: "upload",
    proofUrl: proof?.url || "",
    proofPorId: "",
  }
}

const hasSelectedProof = ({ proofSourceType = "upload", proofUrl = "", proofPorId = "" } = {}) =>
  proofSourceType === "por" ? Boolean(String(proofPorId || "").trim()) : Boolean(String(proofUrl || "").trim())

const buildProofs = ({ proofSourceType = "upload", proofUrl = "", proofPorId = "" } = {}, referenceCode) => {
  if (proofSourceType === "por") {
    if (!proofPorId) return []
    return [
      {
        label: referenceCode || "Verified POR",
        sourceType: "por",
        porRequestId: proofPorId,
        url: "",
      },
    ]
  }

  if (!proofUrl) return []
  return [
    {
      label: referenceCode || "Proof",
      sourceType: "upload",
      url: proofUrl,
    },
  ]
}

const roundToTwo = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100
const clampPoints = (value, max) => Math.max(0, Math.min(roundToTwo(value), max))

const sumItemPoints = (items = [], pointsMap = {}, max = Number.POSITIVE_INFINITY) => {
  const total = (Array.isArray(items) ? items : []).reduce((sum, item) => {
    const hasMinimumData = String(item?.title || "").trim() && String(item?.scoreType || "").trim()
    if (!hasMinimumData) return sum
    return sum + Number(pointsMap[item.scoreType] || 0)
  }, 0)

  return clampPoints(total, max)
}

const computeStudentScorePreview = (form = {}) => {
  const coursework = clampPoints(Number(form?.coursework?.scoreValue || 0) * 1.5, SECTION_MAX_POINTS.coursework)

  const publicationTotal = sumItemPoints(
    form?.projectThesis?.publicationItems,
    PUBLICATION_POINTS,
    form?.projectThesis?.track === "pg_thesis" ? 10 : 5
  )

  const projectThesis =
    form?.projectThesis?.track === "pg_thesis"
      ? clampPoints(
          publicationTotal +
            sumItemPoints(
              form?.projectThesis?.technologyTransferItems,
              TECHNOLOGY_TRANSFER_POINTS,
              5
            ),
          SECTION_MAX_POINTS.projectThesis
        )
      : clampPoints(
          publicationTotal +
            Number(BTP_AWARD_POINTS[form?.projectThesis?.btpAwardLevel] || 0) +
            Number(PROJECT_GRADE_POINTS[form?.projectThesis?.projectGrade] || 0),
          SECTION_MAX_POINTS.projectThesis
        )

  const breakdown = {
    coursework,
    projectThesis,
    responsibilities: sumItemPoints(
      form?.responsibilityItems,
      RESPONSIBILITY_POINTS,
      SECTION_MAX_POINTS.responsibilities
    ),
    awards: sumItemPoints(form?.awardItems, AWARD_POINTS, SECTION_MAX_POINTS.awards),
    cultural: sumItemPoints(form?.culturalItems, ACTIVITY_LEVEL_POINTS, SECTION_MAX_POINTS.cultural),
    scienceTechnology: sumItemPoints(
      form?.scienceTechnologyItems,
      ACTIVITY_LEVEL_POINTS,
      SECTION_MAX_POINTS.scienceTechnology
    ),
    gamesSports: sumItemPoints(
      form?.gamesSportsItems,
      ACTIVITY_LEVEL_POINTS,
      SECTION_MAX_POINTS.gamesSports
    ),
    coCurricular: sumItemPoints(
      form?.coCurricularItems,
      CO_CURRICULAR_POINTS,
      SECTION_MAX_POINTS.coCurricular
    ),
  }

  breakdown.total = roundToTwo(
    breakdown.coursework +
      breakdown.projectThesis +
      breakdown.responsibilities +
      breakdown.awards +
      breakdown.cultural +
      breakdown.scienceTechnology +
      breakdown.gamesSports +
      breakdown.coCurricular
  )

  return breakdown
}

const collectLinkedPorsFromApplication = (application = null) => {
  if (!application) return []

  const proofs = []
  const pushProofs = (entries = []) => {
    for (const proof of Array.isArray(entries) ? entries : []) {
      if (proof?.linkedPor?.id) {
        proofs.push(proof.linkedPor)
      }
    }
  }

  pushProofs(application?.coursework?.proofs)
  pushProofs(application?.projectThesis?.btpAwardProofs)
  pushProofs(application?.projectThesis?.projectGradeProofs)

  for (const item of application?.projectThesis?.publicationItems || []) pushProofs(item?.proofs)
  for (const item of application?.projectThesis?.technologyTransferItems || []) pushProofs(item?.proofs)
  for (const item of application?.responsibilityItems || []) pushProofs(item?.proofs)
  for (const item of application?.awardItems || []) pushProofs(item?.proofs)
  for (const item of application?.culturalItems || []) pushProofs(item?.proofs)
  for (const item of application?.scienceTechnologyItems || []) pushProofs(item?.proofs)
  for (const item of application?.gamesSportsItems || []) pushProofs(item?.proofs)
  for (const item of application?.coCurricularItems || []) pushProofs(item?.proofs)

  const uniqueById = new Map()
  for (const por of proofs) {
    uniqueById.set(por.id, por)
  }

  return [...uniqueById.values()]
}

const toFormItems = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    year: item?.year || "",
    title: item?.title || "",
    level: item?.level || "",
    eventName: item?.eventName || "",
    performance: item?.performance || "",
    participationType: item?.participationType || "individual",
    referenceCode: item?.referenceCode || "",
    scoreType: item?.scoreType || "",
    notes: item?.notes || "",
    ...buildProofStateFromProofs(item?.proofs),
  }))

const toFormReferences = (references = []) => {
  const rows = Array.isArray(references)
    ? references.slice(0, 3).map((reference) => ({
        name: reference?.name || "",
        designation: reference?.designation || "",
        department: reference?.department || "",
        phoneNumber: reference?.phoneNumber || "",
      }))
    : []

  while (rows.length < 3) {
    rows.push(createEmptyReference())
  }

  return rows
}

const createInitialForm = (student = {}, application = null) => ({
  personalAcademic: {
    programme: application?.personalAcademic?.programme || student?.degree || "",
    department: application?.personalAcademic?.department || student?.department || "",
    hostelAddress: application?.personalAcademic?.hostelAddress || "",
    homeAddress: application?.personalAcademic?.homeAddress || "",
    mobileNumber: application?.personalAcademic?.mobileNumber || "",
    facultyAdvisorName: application?.personalAcademic?.facultyAdvisorName || "",
    facultyAdvisorPhone: application?.personalAcademic?.facultyAdvisorPhone || "",
    projectGuideName: application?.personalAcademic?.projectGuideName || "",
    projectGuidePhone: application?.personalAcademic?.projectGuidePhone || "",
    thesisGuideName: application?.personalAcademic?.thesisGuideName || "",
    thesisGuidePhone: application?.personalAcademic?.thesisGuidePhone || "",
    references: toFormReferences(application?.personalAcademic?.references),
    isPassingOutStudent: Boolean(application?.personalAcademic?.isPassingOutStudent),
    hasNoDisciplinaryAction: Boolean(application?.personalAcademic?.hasNoDisciplinaryAction),
    hasNoFrGrade: Boolean(application?.personalAcademic?.hasNoFrGrade),
    declarationAccepted: Boolean(application?.personalAcademic?.declarationAccepted),
  },
  coursework: {
    evaluationMode: application?.coursework?.evaluationMode || "ug_cgpa",
    scoreValue:
      application?.coursework?.scoreValue === 0 || application?.coursework?.scoreValue
        ? String(application.coursework.scoreValue)
        : "",
    notes: application?.coursework?.notes || "",
    ...buildProofStateFromProofs(application?.coursework?.proofs),
  },
  projectThesis: {
    track: application?.projectThesis?.track || "btech_project",
    btpAwardLevel: application?.projectThesis?.btpAwardLevel || "none",
    btpAwardTitle: application?.projectThesis?.btpAwardTitle || "",
    btpAwardNotes: application?.projectThesis?.btpAwardNotes || "",
    ...(() => {
      const proofState = buildProofStateFromProofs(application?.projectThesis?.btpAwardProofs)
      return {
        btpAwardProofSourceType: proofState.proofSourceType,
        btpAwardProofUrl: proofState.proofUrl,
        btpAwardProofPorId: proofState.proofPorId,
      }
    })(),
    projectGrade: application?.projectThesis?.projectGrade || "none",
    projectGradeTitle: application?.projectThesis?.projectGradeTitle || "",
    projectGradeNotes: application?.projectThesis?.projectGradeNotes || "",
    ...(() => {
      const proofState = buildProofStateFromProofs(application?.projectThesis?.projectGradeProofs)
      return {
        projectGradeProofSourceType: proofState.proofSourceType,
        projectGradeProofUrl: proofState.proofUrl,
        projectGradeProofPorId: proofState.proofPorId,
      }
    })(),
    publicationItems: toFormItems(application?.projectThesis?.publicationItems),
    technologyTransferItems: toFormItems(application?.projectThesis?.technologyTransferItems),
  },
  responsibilityItems: toFormItems(application?.responsibilityItems),
  awardItems: toFormItems(application?.awardItems),
  culturalItems: toFormItems(application?.culturalItems),
  scienceTechnologyItems: toFormItems(application?.scienceTechnologyItems),
  gamesSportsItems: toFormItems(application?.gamesSportsItems),
  coCurricularItems: toFormItems(application?.coCurricularItems),
})

const buildOverallBestPerformerDraftKey = (student = {}, occurrence = null) => {
  const studentKey =
    student?.id ||
    student?._id ||
    student?.rollNumber ||
    student?.email ||
    "student"
  const occurrenceKey =
    occurrence?.id ||
    occurrence?._id ||
    occurrence?.awardYear ||
    "occurrence"

  return buildLocalFormDraftKey(
    "overall-best-performer",
    "application",
    studentKey,
    occurrenceKey
  )
}

const sanitizeItemsForPayload = (items = []) =>
  (Array.isArray(items) ? items : [])
    .filter((item) => item.title?.trim() && item.scoreType?.trim())
    .map((item) => ({
      year: item.year || "",
      title: item.title.trim(),
      level: item.level || "",
      eventName: item.eventName || "",
      performance: item.performance || "",
      participationType: item.participationType || "individual",
      referenceCode: item.referenceCode || "",
      scoreType: item.scoreType,
      notes: item.notes || "",
      proofs: buildProofs(item, item.referenceCode),
    }))

const buildPayload = (form) => ({
  personalAcademic: {
    programme: form.personalAcademic.programme || "",
    department: form.personalAcademic.department || "",
    hostelAddress: form.personalAcademic.hostelAddress || "",
    homeAddress: form.personalAcademic.homeAddress || "",
    mobileNumber: form.personalAcademic.mobileNumber || "",
    facultyAdvisorName: form.personalAcademic.facultyAdvisorName || "",
    facultyAdvisorPhone: form.personalAcademic.facultyAdvisorPhone || "",
    projectGuideName: form.personalAcademic.projectGuideName || "",
    projectGuidePhone: form.personalAcademic.projectGuidePhone || "",
    thesisGuideName: form.personalAcademic.thesisGuideName || "",
    thesisGuidePhone: form.personalAcademic.thesisGuidePhone || "",
    references: (form.personalAcademic.references || [])
      .slice(0, 3)
      .filter((reference) =>
        [reference.name, reference.designation, reference.department, reference.phoneNumber]
          .some((value) => String(value || "").trim())
      )
      .map((reference) => ({
        name: reference.name?.trim() || "",
        designation: reference.designation?.trim() || "",
        department: reference.department?.trim() || "",
        phoneNumber: reference.phoneNumber?.trim() || "",
      })),
    isPassingOutStudent: Boolean(form.personalAcademic.isPassingOutStudent),
    hasNoDisciplinaryAction: Boolean(form.personalAcademic.hasNoDisciplinaryAction),
    hasNoFrGrade: Boolean(form.personalAcademic.hasNoFrGrade),
    declarationAccepted: Boolean(form.personalAcademic.declarationAccepted),
  },
  coursework: {
    evaluationMode: form.coursework.evaluationMode,
    scoreValue: Number(form.coursework.scoreValue || 0),
    notes: form.coursework.notes || "",
    proofs: buildProofs(form.coursework, "COURSEWORK"),
  },
  projectThesis: {
    track: form.projectThesis.track,
    btpAwardLevel: form.projectThesis.btpAwardLevel,
    btpAwardTitle: form.projectThesis.btpAwardTitle || "",
    btpAwardNotes: form.projectThesis.btpAwardNotes || "",
    btpAwardProofs:
      form.projectThesis.btpAwardLevel !== "none"
        ? buildProofs(
            {
              proofSourceType: form.projectThesis.btpAwardProofSourceType,
              proofUrl: form.projectThesis.btpAwardProofUrl,
              proofPorId: form.projectThesis.btpAwardProofPorId,
            },
            "BTP"
          )
        : [],
    projectGrade: form.projectThesis.projectGrade,
    projectGradeTitle: form.projectThesis.projectGradeTitle || "",
    projectGradeNotes: form.projectThesis.projectGradeNotes || "",
    projectGradeProofs:
      form.projectThesis.projectGrade !== "none"
        ? buildProofs(
            {
              proofSourceType: form.projectThesis.projectGradeProofSourceType,
              proofUrl: form.projectThesis.projectGradeProofUrl,
              proofPorId: form.projectThesis.projectGradeProofPorId,
            },
            "GRADE"
          )
        : [],
    publicationItems: sanitizeItemsForPayload(form.projectThesis.publicationItems),
    technologyTransferItems: sanitizeItemsForPayload(form.projectThesis.technologyTransferItems),
  },
  responsibilityItems: sanitizeItemsForPayload(form.responsibilityItems),
  awardItems: sanitizeItemsForPayload(form.awardItems),
  culturalItems: sanitizeItemsForPayload(form.culturalItems),
  scienceTechnologyItems: sanitizeItemsForPayload(form.scienceTechnologyItems),
  gamesSportsItems: sanitizeItemsForPayload(form.gamesSportsItems),
  coCurricularItems: sanitizeItemsForPayload(form.coCurricularItems),
})

const statusTone = (status) => {
  if (status === "approved") return "success"
  if (status === "rejected") return "danger"
  if (status === "active") return "primary"
  return "warning"
}

const getApplicationWindowLabel = (status) => {
  if (status === "open") return "Application open"
  if (status === "scheduled") return "Upcoming"
  if (status === "closed") return "Closed"
  return "Unavailable"
}

const INTER_INTRA_ACTIVITY_MARKS = [
  "Inter IIT top 3 - 5",
  "Inter IIT top 5 - 4",
  "Intra IIT top 3 - 3",
  "Intra IIT top 5 - 2",
  "Participation Inter IIT - 2",
  "Participation Intra IIT - 1",
]

const MARKING_SCHEME_ROWS = [
  {
    serial: "1",
    categoryTitle: "Academic achievements",
    categorySubtitle: "Credits in the coursework (15%)",
    maxMarks: 15,
    scoringBlocks: [
      { title: "UG", lines: ["CGPA x 1.5"] },
      { title: "PG", lines: ["CPI x 1.5"] },
      {
        title: "Note",
        lines: [
          "Only coursework CPI will be considered for PhD 1st or 2nd semester, M.Tech 2nd semester, MS 1st semester, and MSc 2nd semester.",
        ],
      },
    ],
  },
  {
    serial: "2",
    categoryTitle: "Academic achievements",
    categorySubtitle: "Project / thesis work (15%)",
    maxMarks: 15,
    scoringBlocks: [
      {
        title: "B.Tech. project work",
        lines: [
          "BTP award: Institute Best - 5, Second - 4, Third - 3, Department award / nomination - 2",
          "BTP project grade: AP - 5, AA - 4, AB - 3, BB - 2, Other - 1",
          "Publication / patent: Journal first author - 4, Journal co-author - 2, Patent granted - 5, Patent filed - 2, Patent published - 3, Conference first author - 2, Conference co-author - 1",
        ],
      },
      {
        title: "PhD / PG thesis work",
        lines: [
          "Journal publication / patents: Journal first author - 4, Journal co-author - 2, Patent granted - 5, Patent filed - 2, Patent published - 3, Conference first author - 2, Conference co-author - 1",
          "Technology transfer: Lead role - 4, Supporting role - 2",
        ],
      },
    ],
  },
  {
    serial: "3",
    categoryTitle: "Position of responsibilities held at the institute level",
    categorySubtitle: "Institute level (15%)",
    maxMarks: 15,
    scoringBlocks: [
      {
        title: null,
        lines: [
          "Gymkhana / Fluxus coordinator / organiser of IL event - 5",
          "Club head / PlacMgr / Fluxus head / Senator - 4",
          "Organiser of NL event - 4",
          "Chair of scientific body - 4",
          "Position holder in scientific body - 3",
          "Organiser / Avana / co-ordinator - 3",
          "Team member - 2",
          "Participation - 1",
        ],
      },
    ],
  },
  {
    serial: "4",
    categoryTitle: "Awards at national / international level / social work / incubation and entrepreneurial activities",
    categorySubtitle: "15%",
    maxMarks: 15,
    scoringBlocks: [
      {
        title: null,
        lines: [
          "Young Scientist Award - 7.5",
          "Incubators generate revenue - 5",
          "International award - 5",
          "Incubated - 4",
          "National award - 3",
        ],
      },
    ],
  },
  {
    serial: "5",
    categoryTitle: "Achievements in cultural activities",
    categorySubtitle: "10%",
    maxMarks: 10,
    scoringBlocks: [
      {
        title: null,
        lines: INTER_INTRA_ACTIVITY_MARKS,
      },
    ],
  },
  {
    serial: "6",
    categoryTitle: "Achievements in science and technology related activities",
    categorySubtitle: "10%",
    maxMarks: 10,
    scoringBlocks: [
      {
        title: null,
        lines: INTER_INTRA_ACTIVITY_MARKS,
      },
    ],
  },
  {
    serial: "7",
    categoryTitle: "Achievements in games and sports related activities",
    categorySubtitle: "10%",
    maxMarks: 10,
    scoringBlocks: [
      {
        title: null,
        lines: INTER_INTRA_ACTIVITY_MARKS,
      },
    ],
  },
  {
    serial: "8",
    categoryTitle: "Achievements in co-curricular / extra-curricular activities",
    categorySubtitle: "10%",
    maxMarks: 10,
    scoringBlocks: [
      {
        title: null,
        lines: [
          "Topper in any competitive exam - 4",
          "Top 2-5 in any competitive exam - 3",
          "Top 6-10 in any competitive exam - 2",
          "Participation in any competitive exam - 1",
          "Workshop - 2",
          "Social service - 2",
        ],
      },
    ],
  },
]

const APPLICANT_STAGE_OPTIONS = [
  { value: "ug", label: "UG" },
  { value: "pg", label: "PG" },
]

const getApplicantStage = (form = {}) =>
  form?.coursework?.evaluationMode === "ug_cgpa" && form?.projectThesis?.track === "btech_project"
    ? "ug"
    : "pg"

const validateScoredItems = (items = [], sectionTitle = "section") => {
  const rows = Array.isArray(items) ? items : []

  for (let index = 0; index < rows.length; index += 1) {
    const item = rows[index] || {}
    if (!String(item.title || "").trim()) {
      return `${sectionTitle}: title is required for item ${index + 1}.`
    }
    if (!String(item.scoreType || "").trim()) {
      return `${sectionTitle}: scoring category is required for item ${index + 1}.`
    }
    if (!hasSelectedProof(item)) {
      return `${sectionTitle}: supporting proof is required for item ${index + 1}.`
    }
  }

  return ""
}

const uploadBestPerformerProof = async (file) => {
  const formData = new FormData()
  formData.append("file", file)
  return uploadApi.uploadOverallBestPerformerProofPDF(formData)
}

const getPorOptionLabel = (por) => {
  if (!por) return "Select verified POR"
  const parts = [por.positionTitle, por.club?.name, por.tenure].filter(Boolean)
  return parts.join(" · ") || por.id
}

const PorProofDetailModal = ({ open, onClose, porRequest }) => {
  if (!open || !porRequest) return null

  return (
    <Modal
      title="Verified POR Details"
      onClose={onClose}
      width={980}
      minHeight="50vh"
      closeButtonVariant="button"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
          <span style={buildMetaChipStyle({ fontFamily: "monospace", backgroundColor: "var(--color-bg-muted)" })}>
            {porRequest.id}
          </span>
          <span style={buildMetaChipStyle()}>{porRequest.status || "approved"}</span>
          <span style={buildMetaChipStyle()}>{porRequest.gymkhanaCategoryLabel || "—"}</span>
          <span style={buildMetaChipStyle()}>
            <CalendarDays size={12} />
            {porRequest.approvedAt
              ? `Verified ${new Date(porRequest.approvedAt).toLocaleString()}`
              : porRequest.updatedAt || porRequest.createdAt
                ? `Updated ${new Date(porRequest.updatedAt || porRequest.createdAt).toLocaleString()}`
                : "Timestamp unavailable"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", gap: "var(--spacing-4)" }}>
          <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>POR Submission</span>
              <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                {porRequest.positionTitle || "—"}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                Tenure: {porRequest.tenure || "—"}
              </div>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.7 }}>
                {porRequest.positionDetails || "—"}
              </div>
            </div>

            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Disciplinary Disclosure</span>
              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                {porRequest.hasDisciplinaryAction ? "Disciplinary action disclosed" : "No disciplinary action declared"}
              </div>
              {porRequest.hasDisciplinaryAction ? (
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.7 }}>
                  {porRequest.disciplinaryActionDetails || "No details provided."}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Student Details</span>
              <div style={{ display: "grid", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <div><strong>Name:</strong> {porRequest.student?.name || "—"}</div>
                <div><strong>Roll Number:</strong> {porRequest.student?.rollNumber || "—"}</div>
                <div><strong>Email:</strong> {porRequest.student?.email || "—"}</div>
                <div><strong>Department:</strong> {porRequest.student?.department || "—"}</div>
                <div><strong>Degree:</strong> {porRequest.student?.degree || "—"}</div>
                <div><strong>Batch:</strong> {porRequest.student?.batch || "—"}</div>
              </div>
            </div>

            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Routing Details</span>
              <div style={{ display: "grid", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <div><strong>Club:</strong> {porRequest.club?.name || "—"}</div>
                <div><strong>Club Email:</strong> {porRequest.club?.email || "—"}</div>
                <div><strong>GS Category:</strong> {porRequest.gymkhanaCategoryLabel || "—"}</div>
                <div><strong>Current Stage:</strong> {porRequest.currentApprovalStage || "Completed"}</div>
                <div><strong>Revision Count:</strong> {porRequest.revisionCount || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const SupportingProofField = ({
  label,
  proofSourceType = "upload",
  proofUrl = "",
  proofPorId = "",
  onChange,
  verifiedPors = [],
  disabled = false,
  uploadedText = "Supporting PDF uploaded",
  viewerTitle = "Supporting document",
}) => {
  const [showPorModal, setShowPorModal] = useState(false)
  const selectedPor = (verifiedPors || []).find((por) => por.id === proofPorId) || null
  const canUsePor = Array.isArray(verifiedPors) && verifiedPors.length > 0
  const effectiveSourceType = proofSourceType === "por" && canUsePor ? "por" : "upload"

  const handleSourceChange = (nextSourceType) => {
    if (nextSourceType === "por") {
      onChange({
        proofSourceType: "por",
        proofUrl: "",
        proofPorId: proofPorId || selectedPor?.id || "",
      })
      return
    }

    onChange({
      proofSourceType: "upload",
      proofUrl,
      proofPorId: "",
    })
  }

  return (
    <>
      <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
        {canUsePor ? (
          <div style={fieldClusterStyle}>
            <span style={sectionLabelStyle}>Proof Source</span>
            <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
              {PROOF_SOURCE_OPTIONS.map((option) => (
                <Button
                  key={`${label}-${option.value}`}
                  size="sm"
                  variant={effectiveSourceType === option.value ? undefined : "secondary"}
                  onClick={() => handleSourceChange(option.value)}
                  disabled={disabled}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {effectiveSourceType === "por" ? (
          <div style={fieldClusterStyle}>
            <span style={sectionLabelStyle}>{label}</span>
            <select
              value={proofPorId}
              onChange={(event) =>
                onChange({
                  proofSourceType: "por",
                  proofUrl: "",
                  proofPorId: event.target.value,
                })
              }
              disabled={disabled}
              style={inputStyle}
            >
              <option value="">Select a verified POR</option>
              {(verifiedPors || []).map((por) => (
                <option key={por.id} value={por.id}>
                  {getPorOptionLabel(por)}
                </option>
              ))}
            </select>

            {selectedPor ? (
              <div
                style={{
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--radius-card-sm)",
                  border: "1px solid var(--color-border-primary)",
                  backgroundColor: "var(--color-bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--spacing-3)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "grid", gap: "4px" }}>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                    {selectedPor.positionTitle || "Verified POR"}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {selectedPor.club?.name || "—"} · {selectedPor.gymkhanaCategoryLabel || "—"} · {selectedPor.tenure || "—"}
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setShowPorModal(true)}>
                  <Eye size={14} /> View POR
                </Button>
              </div>
            ) : (
              <div style={helperTextStyle}>Select one of your verified PORs to use it as supporting proof.</div>
            )}
          </div>
        ) : (
          <PdfUploadField
            label={label}
            value={proofUrl}
            onChange={(url) =>
              onChange({
                proofSourceType: "upload",
                proofUrl: url,
                proofPorId: "",
              })
            }
            onUpload={uploadBestPerformerProof}
            disabled={disabled}
            uploadedText={uploadedText}
            viewerTitle={viewerTitle}
          />
        )}

        {!canUsePor ? (
          <div style={helperTextStyle}>Only uploaded PDFs are available right now because you do not have any verified PORs yet.</div>
        ) : null}
      </div>

      <PorProofDetailModal
        open={showPorModal}
        onClose={() => setShowPorModal(false)}
        porRequest={selectedPor}
      />
    </>
  )
}

const MinimalScoredItemsEditor = ({
  step,
  title,
  subtitle,
  items,
  onChange,
  options,
  verifiedPors = [],
  disabled = false,
  uploadLabel = "Supporting document",
  titleLabel = "Title",
  titlePlaceholder = "",
  descriptionLabel = "Description",
  descriptionPlaceholder = "",
  embedded = false,
}) => {
  const rows = Array.isArray(items) ? items : []

  const updateItem = (index, field, value) => {
    onChange(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  const updateItemFields = (index, nextFields) => {
    onChange(
      rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...nextFields } : item))
    )
  }

  const addItem = () => {
    onChange([...(rows || []), createEmptyItem(options?.[0]?.value || "")])
  }

  const removeItem = (index) => {
    onChange(rows.filter((_, itemIndex) => itemIndex !== index))
  }

  const content = (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        {!rows.length ? (
          <div style={fieldClusterStyle}>
            <span style={sectionLabelStyle}>No Entries Added</span>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Add only the relevant achievements for this section. Every item needs either an uploaded PDF or one of your verified PORs as supporting proof.
            </div>
          </div>
        ) : null}

        {rows.map((item, index) => (
          <div
            key={`${title}-${index}`}
            style={{
              padding: "var(--spacing-4)",
              borderRadius: "var(--radius-card-sm)",
              border: "1px solid var(--color-border-primary)",
              backgroundColor: "var(--color-bg-secondary)",
              display: "grid",
              gap: "var(--spacing-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                <span style={sectionLabelStyle}>Item {index + 1}</span>
                {item.scoreType ? (
                  <span style={buildMetaChipStyle()}>
                    {options.find((option) => option.value === item.scoreType)?.label || item.scoreType}
                  </span>
                ) : null}
              </div>
              {!disabled ? (
                <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
              <div>
                <label style={fieldLabelStyle}>Marking category</label>
                <NativeSelect
                  value={item.scoreType}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "scoreType", event.target.value)}
                  options={options}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>{titleLabel}</label>
                <input
                  value={item.title}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "title", event.target.value)}
                  style={inputStyle}
                  placeholder={titlePlaceholder}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>{descriptionLabel}</label>
                <textarea
                  value={item.notes}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "notes", event.target.value)}
                  style={textareaStyle}
                  placeholder={descriptionPlaceholder}
                />
              </div>
              <div>
                <SupportingProofField
                  label={uploadLabel}
                  proofSourceType={item.proofSourceType}
                  proofUrl={item.proofUrl}
                  proofPorId={item.proofPorId}
                  onChange={(proofState) => updateItemFields(index, proofState)}
                  verifiedPors={verifiedPors}
                  disabled={disabled}
                  uploadedText="Supporting PDF uploaded"
                  viewerTitle={`${title} supporting document`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )

  if (embedded) {
    return (
      <div style={fieldClusterStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
          <div>
            <div style={sectionLabelStyle}>{title}</div>
            {subtitle ? (
              <div style={{ marginTop: "6px", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          {!disabled ? <Button size="sm" variant="secondary" onClick={addItem}><Plus size={14} /> Add item</Button> : null}
        </div>
        {content}
      </div>
    )
  }

  return (
    <SectionPanel
      title={`${step}. ${title}`}
      subtitle={subtitle}
      actions={!disabled ? <Button size="sm" variant="secondary" onClick={addItem}><Plus size={14} /> Add item</Button> : null}
    >
      {content}
    </SectionPanel>
  )
}

const SingleSelectionAchievementEditor = ({
  heading,
  value,
  options,
  titleValue,
  notesValue,
  proofUrl,
  proofSourceType = "upload",
  proofPorId = "",
  onValueChange,
  onTitleChange,
  onNotesChange,
  onProofChange,
  verifiedPors = [],
  disabled = false,
  titleLabel = "Title",
  titlePlaceholder = "",
  descriptionLabel = "Description",
  descriptionPlaceholder = "",
}) => (
  <div style={fieldClusterStyle}>
    <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
      <div>
        <label style={fieldLabelStyle}>{heading} category</label>
        <NativeSelect
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          options={options}
        />
      </div>

      {value !== "none" ? (
        <>
          <div>
            <label style={fieldLabelStyle}>{titleLabel}</label>
            <input
              value={titleValue}
              disabled={disabled}
              onChange={(event) => onTitleChange(event.target.value)}
              style={inputStyle}
              placeholder={titlePlaceholder}
            />
          </div>
          <div>
            <label style={fieldLabelStyle}>{descriptionLabel}</label>
            <textarea
              value={notesValue}
              disabled={disabled}
              onChange={(event) => onNotesChange(event.target.value)}
              style={textareaStyle}
              placeholder={descriptionPlaceholder}
            />
          </div>
          <div>
            <SupportingProofField
              label="Supporting document"
              proofSourceType={proofSourceType}
              proofUrl={proofUrl}
              proofPorId={proofPorId}
              onChange={onProofChange}
              verifiedPors={verifiedPors}
              disabled={disabled}
              uploadedText="Supporting PDF uploaded"
              viewerTitle={`${heading} supporting document`}
            />
          </div>
        </>
      ) : (
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          Leave this as `No entry` if it does not apply to you.
        </div>
      )}
    </div>
  </div>
)

const NativeSelect = ({ value, onChange, options, disabled = false }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={inputStyle}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

const SectionPanel = ({ title, subtitle = null, actions = null, children }) => (
  <section style={panelStyle}>
    <div style={panelHeaderStyle}>
      <div>
        <div
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {subtitle}
          </div>
        )}
      </div>
      {actions}
    </div>
    <div style={panelBodyStyle}>{children}</div>
  </section>
)

const SummaryMetric = (props) => {
  const Icon = props.icon
  const { label, value } = props
  return (
    <div style={{ ...surfaceStyle, padding: "var(--spacing-3)", display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
      <div style={{ width: 40, height: 40, borderRadius: "var(--radius-icon)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {Icon && <Icon size={18} />}
      </div>
      <div>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </div>
        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
          {value}
        </div>
      </div>
    </div>
  )
}

const ScoreBreakdownCard = ({ breakdown }) => {
  const rows = [
    ["Coursework", breakdown?.coursework || 0, SECTION_MAX_POINTS.coursework],
    ["Project / Thesis", breakdown?.projectThesis || 0, SECTION_MAX_POINTS.projectThesis],
    ["Position of Responsibility", breakdown?.responsibilities || 0, SECTION_MAX_POINTS.responsibilities],
    ["Awards & Extracurricular", breakdown?.awards || 0, SECTION_MAX_POINTS.awards],
    ["Cultural", breakdown?.cultural || 0, SECTION_MAX_POINTS.cultural],
    ["Science & Technology", breakdown?.scienceTechnology || 0, SECTION_MAX_POINTS.scienceTechnology],
    ["Games & Sports", breakdown?.gamesSports || 0, SECTION_MAX_POINTS.gamesSports],
    ["Co-curricular", breakdown?.coCurricular || 0, SECTION_MAX_POINTS.coCurricular],
  ]

  return (
    <div style={{ ...surfaceStyle, overflow: "hidden" }}>
      <div
        style={{
          padding: "var(--spacing-3) var(--spacing-4)",
          borderBottom: "1px solid var(--color-border-primary)",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
          Score Breakdown
        </div>
      </div>
      <div style={{ padding: "var(--spacing-3) var(--spacing-4)" }}>
        {rows.map(([label, value, max]) => {
          const pct = Math.min(100, Math.max(0, (value / max) * 100))
          return (
            <div key={label} className="por-scorecard-row">
              <div className="por-scorecard-header">
                <span className="por-scorecard-label">{label}</span>
                <span className="por-scorecard-value-container">
                  {value} <span className="por-scorecard-max">/ {max}</span>
                </span>
              </div>
              <div className="por-scorecard-progress-bg">
                <div
                  className="por-scorecard-progress-bar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 100 ? "var(--color-success)" : "var(--color-primary)",
                  }}
                />
              </div>
            </div>
          )
        })}
        <div
          style={{
            ...infoBoxStyle,
            marginTop: "var(--spacing-4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>Total Score</span>
          <span style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)" }}>
            {breakdown?.total || 0}
          </span>
        </div>
      </div>
    </div>
  )
}

const MarkingSchemeModal = ({ open, onClose }) => {
  if (!open) return null

  return (
    <Modal
      title="Overall Best Performer Marking Scheme"
      onClose={onClose}
      width={1120}
      fullHeight={true}
      minHeight="68vh"
      closeButtonVariant="button"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <div
          style={{
            ...infoBoxStyle,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--spacing-3)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "78ch" }}>
            <div style={{ ...sectionLabelStyle, marginBottom: "6px" }}>Reference Guide</div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.65 }}>
              Check this marking scheme before filling the form and match every entry to the correct scoring category. Only one project track applies for a student: B.Tech. project work or PhD / PG thesis work.
            </div>
          </div>
          <span style={buildMetaChipStyle()}>Total: 100 marks</span>
        </div>

        <div
          style={{
            border: "1px solid var(--color-border-primary)",
            borderRadius: "var(--radius-card-sm)",
            overflow: "hidden",
            backgroundColor: "var(--color-bg-primary)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                <tr>
                  <th
                    style={{
                      width: 68,
                      padding: "10px 12px",
                      textAlign: "center",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Sn.
                  </th>
                  <th
                    style={{
                      width: "38%",
                      padding: "10px 12px",
                      textAlign: "left",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Category Of Achievement
                  </th>
                  <th
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Marks Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {MARKING_SCHEME_ROWS.map((row) => (
                  <tr key={`${row.serial}-${row.categoryTitle}`} style={{ borderTop: "1px solid var(--color-border-primary)" }}>
                    <td
                      style={{
                        padding: "12px 10px",
                        textAlign: "center",
                        verticalAlign: "top",
                        fontSize: "var(--font-size-base)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {row.serial}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "top",
                        borderLeft: "1px solid var(--color-border-primary)",
                      }}
                    >
                      <div style={{ display: "grid", gap: "6px" }}>
                        <div style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", lineHeight: 1.45 }}>
                          {row.categoryTitle}
                        </div>
                        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.55 }}>
                          {row.categorySubtitle}
                        </div>
                        <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>
                          Max {row.maxMarks} marks
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "top",
                        borderLeft: "1px solid var(--color-border-primary)",
                      }}
                    >
                      <div style={{ display: "grid", gap: "10px" }}>
                        {row.scoringBlocks.map((block, index) => (
                          <div key={`${row.serial}-block-${index}`} style={{ display: "grid", gap: "4px" }}>
                            {block.title ? (
                              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                                {block.title}
                              </div>
                            ) : null}
                            <div style={{ display: "grid", gap: "3px" }}>
                              {block.lines.map((line) => (
                                <div key={line} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.55 }}>
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "1px solid var(--color-border-primary)", backgroundColor: "var(--color-bg-secondary)" }}>
                  <td style={{ padding: "12px 10px" }} />
                  <td
                    style={{
                      padding: "12px",
                      borderLeft: "1px solid var(--color-border-primary)",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderLeft: "1px solid var(--color-border-primary)",
                      fontSize: "var(--font-size-xl)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--color-primary)",
                    }}
                  >
                    100 Marks
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const ProofActionButton = ({ proof, onViewPor, onViewPdf }) => {
  if (!proof) {
    return <span style={{ color: "var(--color-text-muted)" }}>—</span>
  }

  if (proof.sourceType === "por") {
    if (!proof.linkedPor) {
      return <span style={{ color: "var(--color-text-muted)" }}>Verified POR linked</span>
    }

    return (
      <Button size="sm" variant="secondary" onClick={() => onViewPor?.(proof.linkedPor || null)}>
        <Eye size={14} /> View POR
      </Button>
    )
  }

  if (proof.url) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          onViewPdf?.({
            url: proof.url,
            title: proof.label || "Supporting Document",
          })
        }
      >
        <Eye size={14} /> View PDF
      </Button>
    )
  }

  return <span style={{ color: "var(--color-text-muted)" }}>—</span>
}

const PorDetailCard = ({
  icon: Icon,
  title,
  accentColor = "var(--color-primary)",
  children,
  headerAction = null,
  bodyStyle = null,
}) => (
  <div className="por-detail-card" style={{ marginTop: "var(--spacing-4)" }}>
    <div className="por-detail-card-header">
      <div className="por-detail-card-header-left">
        <span
          className="por-detail-card-icon-wrapper"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            color: accentColor,
            width: 24,
            height: 24,
            borderRadius: "var(--radius-md)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Icon && <Icon size={14} />}
        </span>
        <h4 className="por-detail-card-title">{title}</h4>
      </div>
      {headerAction}
    </div>
    <div className="por-detail-card-body" style={bodyStyle || undefined}>{children}</div>
  </div>
)

const PorDetailInfoRow = ({ label, value }) => (
  <div className="por-detail-info-row">
    <span className="por-detail-info-label">{label}</span>
    <span className="por-detail-info-value">{value}</span>
  </div>
)

const REVIEW_SECTION_META = {
  "Project publications / patents": { icon: BookOpen, accent: "var(--color-primary)" },
  "Technology transfer": { icon: Share2, accent: "var(--color-info)" },
  "Responsibilities": { icon: Users, accent: "var(--color-primary)" },
  "Awards": { icon: Trophy, accent: "var(--color-warning)" },
  "Cultural activities": { icon: Sparkles, accent: "var(--color-warning)" },
  "Science & Technology activities": { icon: Cpu, accent: "var(--color-primary)" },
  "Games & Sports activities": { icon: Activity, accent: "var(--color-success)" },
  "Co-curricular activities": { icon: Compass, accent: "var(--color-info)" }
}

const SCORE_TYPE_LABELS = {
  // BTP Award Options
  none: "No BTP award",
  institute_best: "Institute Best BTP",
  second: "Second Best BTP",
  third: "Third Best BTP",
  department_award_or_nomination: "Department award / nomination",

  // Project Grade Options
  AP: "AP",
  AA: "AA",
  AB: "AB",
  BB: "BB",
  OTHER: "Other",

  // Publication Options
  journal_first_author: "Journal first author",
  journal_co_author: "Journal co-author",
  patent_granted: "Patent granted",
  patent_filed: "Patent filed",
  patent_published: "Patent published",
  conference_first_author: "Conference first author",
  conference_co_author: "Conference co-author",

  // Tech Transfer Options
  lead_role: "Technology transfer: lead role",
  supporting_role: "Technology transfer: supporting role",

  // Responsibility Options
  gymkhana_or_fluxus_coordinator_or_il_event_organiser: "Gymkhana / Fluxus coordinator / IL organiser",
  club_head_or_placmgr_or_fluxus_head_or_senator: "Club head / PlacMgr / Fluxus head / Senator",
  organiser_of_national_level_event: "Organiser of national-level event",
  chair_of_scientific_body: "Chair of scientific body",
  position_holder_in_scientific_body: "Position holder in scientific body",
  organiser_or_avana_or_coordinator: "Organiser / Avana / coordinator",
  team_member: "Team member",
  participation: "Participation",

  // Award Options
  young_scientist_award: "Young Scientist Award",
  incubator_generating_revenue: "Incubator generating revenue",
  international_award: "International award",
  incubated_startup: "Incubated startup",
  national_award: "National award",

  // Activity Level Options
  inter_iit_top_3: "Inter IIT top 3",
  inter_iit_top_5: "Inter IIT top 5",
  intra_iit_top_3: "Intra IIT top 3",
  intra_iit_top_5: "Intra IIT top 5",
  participation_inter_iit: "Participation in Inter IIT",
  participation_intra_iit: "Participation in Intra IIT",

  // Co-curricular Options
  competitive_exam_topper: "Competitive exam topper",
  competitive_exam_rank_2_5: "Competitive exam rank 2-5",
  competitive_exam_rank_6_10: "Competitive exam rank 6-10",
  competitive_exam_participation: "Competitive exam participation",
  workshop: "Workshop",
  social_service: "Social service",
}

const formatScoreTypeLabel = (scoreType) => {
  if (!scoreType) return "—"
  if (SCORE_TYPE_LABELS[scoreType]) {
    return SCORE_TYPE_LABELS[scoreType]
  }
  return scoreType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const ItemsReviewTable = ({ title, items = [], onViewPor, onViewPdf }) => {
  if (!items.length) return null

  const meta = REVIEW_SECTION_META[title] || { icon: FileText, accent: "var(--color-primary)" }
  const Icon = meta.icon
  const accentColor = meta.accent

  return (
    <PorDetailCard icon={Icon} title={title} accentColor={accentColor} bodyStyle={{ padding: 0, gap: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-primary)" }}>
              {["Title", "Type", "Year", "Level", "Ref Code", "Points", "Proof"].map((heading) => (
                <th
                  key={heading}
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    fontWeight: "var(--font-weight-semibold)",
                    letterSpacing: "0.05em",
                    ...(heading === "Proof" ? { width: 140, minWidth: 140 } : {}),
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${title}-${index}`} className="por-review-table-row" style={{ borderBottom: index < items.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "12px 16px", color: "var(--color-text-primary)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>{item.title}</td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>{formatScoreTypeLabel(item.scoreType)}</td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>{item.year || "—"}</td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>{item.level || "—"}</td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", fontFamily: "monospace" }}>{item.referenceCode || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-xs)" }}>
                    +{item.calculatedPoints || 0}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", width: 132, minWidth: 132 }}>
                  <ProofActionButton proof={resolvePrimaryProof(item.proofs)} onViewPor={onViewPor} onViewPdf={onViewPdf} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PorDetailCard>
  )
}

const formatHodVerificationActionLabel = (action = "") =>
  action === "verified" ? "Verified" : "Commented"

const HodVerificationsCard = ({ verifications = [] }) => {
  const entries = Array.isArray(verifications) ? verifications : []

  return (
    <PorDetailCard
      icon={MessageSquare}
      title="HOD Verifications"
      accentColor="var(--color-info)"
    >
      {entries.length > 0 ? (
        <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
          {entries.map((entry, index) => (
            <div
              key={entry?.id || `${entry?.verifiedBy || "hod"}-${entry?.verifiedAt || index}`}
              style={{
                display: "grid",
                gap: "var(--spacing-2)",
                padding: "var(--spacing-3)",
                border: "1px solid var(--color-border-primary)",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: "2px", minWidth: 0 }}>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                    {entry?.verifierName || "HOD"}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {entry?.verifierEmail || "Email not available"}
                  </div>
                </div>
                <Badge variant={entry?.action === "verified" ? "success" : "info"}>
                  {formatHodVerificationActionLabel(entry?.action)}
                </Badge>
              </div>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.7 }}>
                {entry?.remarks || "No remarks provided."}
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {entry?.verifiedAt ? new Date(entry.verifiedAt).toLocaleString() : "Timestamp unavailable"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          No HOD verification or comments have been recorded yet.
        </div>
      )}
    </PorDetailCard>
  )
}

const ReviewModal = ({
  application,
  open,
  onClose,
  onDecision,
  deciding,
  reviewMode = "readonly",
}) => {
  const [remarks, setRemarks] = useState("")
  const [activePorDetail, setActivePorDetail] = useState(null)
  const [activePdfDetail, setActivePdfDetail] = useState(null)
  const [downloadingAllPdfs, setDownloadingAllPdfs] = useState(false)
  const [studentProfileId, setStudentProfileId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const { toast } = useToast()
  const canAdminReview = reviewMode === "admin"
  const canHodVerify = reviewMode === "hod"
  const canTakeAction = canAdminReview || canHodVerify
  const applicationPdfDocuments = useMemo(
    () => collectApplicationPdfDocuments(application),
    [application]
  )

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setRemarks(canAdminReview ? application?.review?.remarks || "" : "")
        setActivePorDetail(null)
        setActivePdfDetail(null)
        setDownloadingAllPdfs(false)
        setShowStudentDetailModal(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, application, canAdminReview])

  useEffect(() => {
    let isSubscribed = true

    const loadStudentProfileId = async () => {
      if (!open || !application?.studentUserId) {
        if (isSubscribed) {
          setStudentProfileId(null)
        }
        return
      }

      if (application?.studentProfileId) {
        setStudentProfileId(application.studentProfileId)
        return
      }

      try {
        const resolvedStudentId = await studentApi.getStudentId(application.studentUserId)
        if (!isSubscribed) return
        setStudentProfileId(resolvedStudentId || null)
      } catch (error) {
        console.error("Failed to resolve Best Performer student profile id:", error)
        if (!isSubscribed) return
        setStudentProfileId(null)
      }
    }

    loadStudentProfileId()

    return () => {
      isSubscribed = false
    }
  }, [application?.studentProfileId, application?.studentUserId, open])

  if (!open || !application) return null

  const handleDownloadAllPdfs = async () => {
    if (!applicationPdfDocuments.length) {
      toast.error("No supporting PDFs are attached to this application.")
      return
    }

    try {
      setDownloadingAllPdfs(true)
      const mergedPdfBytes = await mergePdfDocuments(applicationPdfDocuments)
      const filename = `${slugifyFilePart(application.rollNumber || application.studentName, "best-performer")}-supporting-documents.pdf`
      downloadBlobFile(new Blob([mergedPdfBytes], { type: "application/pdf" }), filename)
      toast.success("Supporting PDFs downloaded.")
    } catch (error) {
      console.error("Failed to merge Best Performer PDFs:", error)
      toast.error(error?.message || "Failed to download supporting PDFs.")
    } finally {
      setDownloadingAllPdfs(false)
    }
  }

  return (
    <Modal title={`${canTakeAction ? "Review" : "View"} ${application.studentName}`} onClose={onClose} width={1800} fullHeight={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {/* Upper Meta Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", marginBottom: "var(--spacing-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
            <span className="por-detail-meta-chip por-detail-meta-chip-id">
              {application.rollNumber}
            </span>
            <Badge variant={statusTone(application.review?.status)}>{application.review?.status || "submitted"}</Badge>
            <span className="por-detail-meta-chip">
              <Trophy size={12} />
              Calculated Score: {application.calculatedTotal || 0}
            </span>
            <span className="por-detail-meta-chip">
              <CheckCircle2 size={12} />
              Final Score: {application.finalScore || 0}
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownloadAllPdfs}
            loading={downloadingAllPdfs}
            disabled={downloadingAllPdfs || !applicationPdfDocuments.length}
          >
            <Download size={14} /> Download All PDFs
          </Button>
        </div>

        {/* Main 3-Column Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
          
          {/* Main content - col-span-2 */}
          <div className="xl:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)", marginTop: "calc(-1 * var(--spacing-4))" }}>
            
            {/* Academic profile card */}
            <PorDetailCard
              icon={Users}
              title="Student Academic Profile"
              accentColor="var(--color-primary)"
            >
              <div className="por-student-profile-header">
                <ProfileAvatar
                  user={{
                    name: application.studentName,
                    profileImage: application.studentProfileImage,
                  }}
                  size="medium"
                />
                <div className="por-student-profile-info" style={{ minWidth: 0 }}>
                  <span className="por-student-profile-name">{application.studentName}</span>
                  <span className="por-student-profile-roll">{application.rollNumber}</span>
                </div>
                {canAdminReview && application?.studentUserId ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowStudentDetailModal(true)}
                    disabled={!studentProfileId}
                    style={{ marginLeft: "auto", flexShrink: 0 }}
                  >
                    <Eye size={14} /> View Student Profile
                  </Button>
                ) : null}
              </div>

              <div className="por-detail-info-grid">
                <PorDetailInfoRow label="Programme" value={application.personalAcademic?.programme || "—"} />
                <PorDetailInfoRow label="Department" value={application.personalAcademic?.department || application.department || "—"} />
                <PorDetailInfoRow label="CGPA / CPI" value={application.coursework?.scoreValue || "—"} />
              </div>

              {/* Declarations (Yes/No fields) styled beautifully! */}
              <div style={{ marginTop: "var(--spacing-4)", borderTop: "1px solid var(--color-border-primary)", paddingTop: "var(--spacing-4)" }}>
                <div style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-3)" }}>
                  Disclosures & Declarations
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
                  <div className={application.personalAcademic?.isPassingOutStudent ? "por-detail-success-card" : "por-detail-alert-card"} style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Passing Out Student</div>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-bold)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      {application.personalAcademic?.isPassingOutStudent ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Yes</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> No</>
                      )}
                    </div>
                  </div>
                  <div className={application.personalAcademic?.hasNoDisciplinaryAction ? "por-detail-success-card" : "por-detail-alert-card"} style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>No Disciplinary Action</div>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-bold)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      {application.personalAcademic?.hasNoDisciplinaryAction ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Declared Clean</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Action Disclosed</>
                      )}
                    </div>
                  </div>
                  <div className={application.personalAcademic?.hasNoFrGrade ? "por-detail-success-card" : "por-detail-alert-card"} style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>No FR Grade</div>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-bold)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      {application.personalAcademic?.hasNoFrGrade ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> None</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Has FR Grade</>
                      )}
                    </div>
                  </div>
                  <div className={application.personalAcademic?.declarationAccepted ? "por-detail-success-card" : "por-detail-alert-card"} style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Undertaking Accepted</div>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-bold)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      {application.personalAcademic?.declarationAccepted ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Confirmed</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Pending</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coursework proof */}
              {application.coursework?.proofs && (
                <div style={{ marginTop: "var(--spacing-4)" }}>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)", fontWeight: "var(--font-weight-semibold)" }}>
                    Coursework Supporting Document
                  </div>
                  <ProofActionButton
                    proof={resolvePrimaryProof(application.coursework?.proofs)}
                    onViewPor={setActivePorDetail}
                    onViewPdf={setActivePdfDetail}
                  />
                </div>
              )}
            </PorDetailCard>

            {/* BTP details card if applicable */}
            {application.projectThesis?.track === "btech_project" &&
            (application.projectThesis?.btpAwardLevel !== "none" || application.projectThesis?.projectGrade !== "none") ? (
              <PorDetailCard
                icon={Trophy}
                title="BTP & Project Grade Details"
                accentColor="var(--color-warning)"
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-4)" }}>
                  {application.projectThesis?.btpAwardLevel !== "none" ? (
                    <div className="por-detail-hero-box" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderLeft: "4px solid var(--color-warning)" }}>
                      <div style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" }}>
                        BTP Award
                      </div>
                      <div style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-text-primary)", fontSize: "var(--font-size-md)" }}>
                        {BTP_AWARD_OPTIONS.find((option) => option.value === application.projectThesis?.btpAwardLevel)?.label || application.projectThesis?.btpAwardLevel}
                      </div>
                      <div style={{ marginTop: "6px", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                        {application.projectThesis?.btpAwardTitle || "—"}
                      </div>
                      {application.projectThesis?.btpAwardNotes ? (
                        <div style={{ marginTop: "6px", color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)", fontStyle: "italic" }}>
                          Notes: {application.projectThesis.btpAwardNotes}
                        </div>
                      ) : null}
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.projectThesis?.btpAwardProofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      </div>
                    </div>
                  ) : null}

                  {application.projectThesis?.projectGrade !== "none" ? (
                    <div className="por-detail-hero-box" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderLeft: "4px solid var(--color-primary)" }}>
                      <div style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" }}>
                        Project Grade
                      </div>
                      <div style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-text-primary)", fontSize: "var(--font-size-md)" }}>
                        {PROJECT_GRADE_OPTIONS.find((option) => option.value === application.projectThesis?.projectGrade)?.label || application.projectThesis?.projectGrade}
                      </div>
                      <div style={{ marginTop: "6px", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                        {application.projectThesis?.projectGradeTitle || "—"}
                      </div>
                      {application.projectThesis?.projectGradeNotes ? (
                        <div style={{ marginTop: "6px", color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)", fontStyle: "italic" }}>
                          Notes: {application.projectThesis.projectGradeNotes}
                        </div>
                      ) : null}
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.projectThesis?.projectGradeProofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </PorDetailCard>
            ) : null}

            {/* List of achievements tables styled beautifully */}
            <ItemsReviewTable title="Project publications / patents" items={application.projectThesis?.publicationItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
            <ItemsReviewTable title="Technology transfer" items={application.projectThesis?.technologyTransferItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
            <ItemsReviewTable title="Responsibilities" items={application.responsibilityItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
            <ItemsReviewTable title="Awards" items={application.awardItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
            <ItemsReviewTable title="Cultural activities" items={application.culturalItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
            <ItemsReviewTable title="Science & Technology activities" items={application.scienceTechnologyItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
            <ItemsReviewTable title="Games & Sports activities" items={application.gamesSportsItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
            <ItemsReviewTable title="Co-curricular activities" items={application.coCurricularItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} />
          </div>

          {/* Right sidebar column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            
            {/* Scorecard */}
            <ScoreBreakdownCard breakdown={application.scoreBreakdown} />

            <HodVerificationsCard verifications={application.hodVerifications} />

            {/* Admin Decision card */}
            <PorDetailCard
              icon={canHodVerify ? BadgeCheck : CheckCircle2}
              title={canAdminReview ? "Application Review Decision" : canHodVerify ? "HOD Verification" : "Review Summary"}
              accentColor="var(--color-primary)"
            >
              {canAdminReview ? (
                <div>
                  <label style={{ ...fieldLabelStyle, marginBottom: "var(--spacing-2)" }}>Review Remarks / Notes</label>
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    className="por-decision-textarea"
                    placeholder="Add review feedback, notes, or justification for rejection..."
                  />
                  <div className="por-decision-actions">
                    <Button
                      onClick={() => onDecision("approved", remarks)}
                      loading={deciding}
                      disabled={deciding}
                    >
                      <CheckCircle2 size={16} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => onDecision("rejected", remarks)}
                      loading={deciding}
                      disabled={deciding}
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                </div>
              ) : canHodVerify ? (
                <div>
                  <label style={{ ...fieldLabelStyle, marginBottom: "var(--spacing-2)" }}>Verification Comment</label>
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    className="por-decision-textarea"
                    placeholder="Add your verification note or comment..."
                  />
                  <div style={{ ...helperTextStyle, marginTop: "var(--spacing-2)" }}>
                    A comment is required for both actions.
                  </div>
                  <div className="por-decision-actions">
                    <Button
                      onClick={() => onDecision("verified", remarks)}
                      loading={deciding}
                      disabled={deciding || !String(remarks || "").trim()}
                    >
                      <BadgeCheck size={16} /> Verify
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDecision("commented", remarks)}
                      loading={deciding}
                      disabled={deciding || !String(remarks || "").trim()}
                    >
                      <MessageSquare size={16} /> Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                  <div className="por-detail-info-grid">
                    <PorDetailInfoRow label="Review Status" value={application.review?.status || "submitted"} />
                    <PorDetailInfoRow label="Final Score" value={application.finalScore ?? "—"} />
                  </div>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Review Remarks / Notes</span>
                    <div style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", lineHeight: 1.7 }}>
                      {application.review?.remarks || "No review remarks have been added yet."}
                    </div>
                  </div>
                </div>
              )}
            </PorDetailCard>
          </div>
        </div>

        {/* Support Modal portals */}
        <PorProofDetailModal
          open={Boolean(activePorDetail)}
          onClose={() => setActivePorDetail(null)}
          porRequest={activePorDetail}
        />
        <PdfViewerModal
          isOpen={Boolean(activePdfDetail?.url)}
          onClose={() => setActivePdfDetail(null)}
          documentUrl={activePdfDetail?.url}
          title={activePdfDetail?.title || "Supporting Document"}
          subtitle="Uploaded supporting PDF"
          downloadFileName={`${activePdfDetail?.title || "supporting-document"}.pdf`}
        />
        {showStudentDetailModal && studentProfileId ? (
          <StudentDetailModal
            selectedStudent={{ _id: studentProfileId, userId: application.studentUserId }}
            setShowStudentDetail={setShowStudentDetailModal}
            onUpdate={() => setShowStudentDetailModal(false)}
          />
        ) : null}
      </div>
    </Modal>
  )
}

const OverallBestPerformerPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdminView = user?.role === "Admin" || user?.role === "Super Admin"
  const isAcademicsView = user?.role === "Academics"
  const isReviewerView = isAdminView || isAcademicsView
  const canManageOccurrence = isAdminView
  const canReviewApplications = isAdminView
  const canAddHodVerification = isAcademicsView

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectorData, setSelectorData] = useState(null)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState("")
  const [occurrenceDetail, setOccurrenceDetail] = useState(null)
  const [portalState, setPortalState] = useState(null)
  const [verifiedPors, setVerifiedPors] = useState([])
  const [applicationForm, setApplicationForm] = useState(createInitialForm())
  const [applicationDraftReady, setApplicationDraftReady] = useState(false)
  const [savingApplication, setSavingApplication] = useState(false)
  const [savingOccurrence, setSavingOccurrence] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false)
  const [showEligibleStudentsModal, setShowEligibleStudentsModal] = useState(false)
  const [showMarkingSchemeModal, setShowMarkingSchemeModal] = useState(false)
  const [occurrenceModalMode, setOccurrenceModalMode] = useState("create")
  const [reviewApplication, setReviewApplication] = useState(null)
  const [occurrenceForm, setOccurrenceForm] = useState(createOccurrenceFormState())
  const [eligibleStudentSearch, setEligibleStudentSearch] = useState("")
  const [manualEligibleRollNumber, setManualEligibleRollNumber] = useState("")

  const currentOccurrence = isReviewerView ? occurrenceDetail?.occurrence : portalState?.data?.occurrence
  const currentApplication = portalState?.data?.application || null
  const canEditStudentForm = Boolean(portalState?.data?.canEdit)
  const applicationDraftKey = isReviewerView
    ? ""
    : buildOverallBestPerformerDraftKey(portalState?.data?.student, portalState?.data?.occurrence)
  const applicantStage = useMemo(() => getApplicantStage(applicationForm), [applicationForm])
  const studentScorePreview = useMemo(
    () => computeStudentScorePreview(applicationForm),
    [applicationForm]
  )
  const filteredEligibleStudents = useMemo(() => {
    const normalizedSearch = String(eligibleStudentSearch || "").trim().toLowerCase()
    const rows = Array.isArray(occurrenceForm.eligibleStudents) ? occurrenceForm.eligibleStudents : []

    if (!normalizedSearch) return rows

    return rows.filter((student) =>
      [
        student?.rollNumber,
        student?.name,
        student?.email,
        student?.department,
        student?.degree,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [eligibleStudentSearch, occurrenceForm.eligibleStudents])
  const { clearDraft: clearApplicationDraft } = useLocalFormDraft({
    formKey: applicationDraftKey,
    value: applicationForm,
    enabled: Boolean(!isReviewerView && canEditStudentForm && applicationDraftKey),
    ready: applicationDraftReady,
  })

  const updatePersonalAcademicField = (field, value) => {
    setApplicationForm((current) => ({
      ...current,
      personalAcademic: {
        ...current.personalAcademic,
        [field]: value,
      },
    }))
  }

  const syncApplicantStage = (nextStage) => {
    setApplicationForm((current) => {
      const isPg = nextStage === "pg"

      return {
        ...current,
        coursework: {
          ...current.coursework,
          evaluationMode: isPg ? "pg_cpi" : "ug_cgpa",
        },
        projectThesis: {
          ...current.projectThesis,
          track: isPg ? "pg_thesis" : "btech_project",
          ...(isPg
            ? {
                btpAwardLevel: "none",
                btpAwardTitle: "",
                btpAwardNotes: "",
                btpAwardProofSourceType: "upload",
                btpAwardProofUrl: "",
                btpAwardProofPorId: "",
                projectGrade: "none",
                projectGradeTitle: "",
                projectGradeNotes: "",
                projectGradeProofSourceType: "upload",
                projectGradeProofUrl: "",
                projectGradeProofPorId: "",
              }
            : {
                technologyTransferItems: [],
              }),
        },
      }
    })
  }

  const loadAdminData = async () => {
    const selector = await overallBestPerformerApi.getOccurrenceSelector()
    const selectorPayload = selector?.data || {}
    setSelectorData(selectorPayload)

    if (selectorPayload.activeOccurrenceId && !selectedOccurrenceId) {
      setSelectedOccurrenceId(String(selectorPayload.activeOccurrenceId))
    }

    return selectorPayload
  }

  const loadAdminOccurrence = async (occurrenceId) => {
    if (!occurrenceId) {
      setOccurrenceDetail(null)
      return
    }
    const detail = await overallBestPerformerApi.getOccurrenceDetail(occurrenceId)
    setOccurrenceDetail(detail?.data || null)
  }

  const loadStudentData = async () => {
    const [state, porWorkspace] = await Promise.all([
      overallBestPerformerApi.getStudentPortalState(),
      porApi.getWorkspace().catch(() => null),
    ])
    const baseForm = createInitialForm(state?.data?.student, state?.data?.application)
    const draftKey = buildOverallBestPerformerDraftKey(
      state?.data?.student,
      state?.data?.occurrence
    )
    const savedDraft = state?.data?.canEdit ? readLocalFormDraft(draftKey) : null

    setPortalState(state)
    setApplicationForm(savedDraft?.data || baseForm)
    setApplicationDraftReady(true)

    if (savedDraft?.data) {
      toast.success("Restored your unsaved Best Performer draft from this browser.")
    }

    const approvedWorkspacePors = (porWorkspace?.requests || []).filter((request) => request.status === "approved")
    const linkedApplicationPors = collectLinkedPorsFromApplication(state?.data?.application)
    const mergedPors = new Map()

    for (const por of [...approvedWorkspacePors, ...linkedApplicationPors]) {
      if (por?.id) {
        mergedPors.set(por.id, por)
      }
    }

    setVerifiedPors(
      [...mergedPors.values()].sort(
        (left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0)
      )
    )
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        setApplicationDraftReady(false)
        if (isReviewerView) {
          setVerifiedPors([])
          await loadAdminData()
        } else {
          await loadStudentData()
        }
      } catch (err) {
        setError(err.message || "Failed to load Overall Best Performer data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isReviewerView])

  useEffect(() => {
    if (isReviewerView && selectorData?.activeOccurrenceId && !selectedOccurrenceId) {
      setSelectedOccurrenceId(String(selectorData.activeOccurrenceId))
    }
  }, [isReviewerView, selectorData, selectedOccurrenceId])

  useEffect(() => {
    if (!isReviewerView) return

    const loadDetail = async () => {
      try {
        if (selectedOccurrenceId) {
          await loadAdminOccurrence(selectedOccurrenceId)
        } else {
          setOccurrenceDetail(null)
        }
      } catch (err) {
        setError(err.message || "Failed to load occurrence detail")
      }
    }

    loadDetail()
  }, [isReviewerView, selectedOccurrenceId])

  const resetOccurrenceForm = (mode = "create") => {
    if (mode === "edit" && occurrenceDetail?.occurrence) {
      const eligibleRollNumbers = normalizeRollNumbers(occurrenceDetail.occurrence.eligibleRollNumbers)
      setOccurrenceForm(createOccurrenceFormState({
        title: occurrenceDetail.occurrence.title || "",
        awardYear: String(occurrenceDetail.occurrence.awardYear || new Date().getFullYear()),
        applyStartAt: formatDateTimeInput(occurrenceDetail.occurrence.applyStartAt),
        applyEndAt: formatDateTimeInput(occurrenceDetail.occurrence.applyEndAt),
        description: occurrenceDetail.occurrence.description || "",
        eligibleRows: [],
        eligibleRollNumbers,
        eligibleStudents: buildEligibleStudentRows(
          eligibleRollNumbers,
          occurrenceDetail.occurrence.eligibleStudents
        ),
        studentListTouched: false,
      }))
      setOccurrenceModalMode("edit")
      setEligibleStudentSearch("")
      setManualEligibleRollNumber("")
      setShowEligibleStudentsModal(false)
      return
    }

    setOccurrenceForm(createOccurrenceFormState())
    setOccurrenceModalMode("create")
    setEligibleStudentSearch("")
    setManualEligibleRollNumber("")
    setShowEligibleStudentsModal(false)
  }

  const handleOccurrenceRowsParsed = (rows) => {
    const nextRollNumbers = normalizeRollNumbers(
      (Array.isArray(rows) ? rows : []).map((row) => row?.rollNumber)
    )

    setOccurrenceForm((current) => ({
      ...current,
      eligibleRows: rows,
      eligibleRollNumbers: nextRollNumbers,
      eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
      studentListTouched: true,
    }))
  }

  const handleAddEligibleStudent = () => {
    const nextRollNumber = String(manualEligibleRollNumber || "").trim().toUpperCase()
    if (!nextRollNumber) {
      toast.error("Enter a roll number to add.")
      return
    }

    setOccurrenceForm((current) => {
      const nextRollNumbers = normalizeRollNumbers([
        ...(current.eligibleRollNumbers || []),
        nextRollNumber,
      ])

      if (nextRollNumbers.length === (current.eligibleRollNumbers || []).length) {
        return current
      }

      return {
        ...current,
        eligibleRollNumbers: nextRollNumbers,
        eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
        studentListTouched: true,
      }
    })

    setManualEligibleRollNumber("")
  }

  const handleRemoveEligibleStudent = (rollNumberToRemove) => {
    setOccurrenceForm((current) => {
      const nextRollNumbers = normalizeRollNumbers(current.eligibleRollNumbers).filter(
        (rollNumber) => rollNumber !== String(rollNumberToRemove || "").trim().toUpperCase()
      )

      return {
        ...current,
        eligibleRollNumbers: nextRollNumbers,
        eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
        studentListTouched: true,
      }
    })
  }

  const handleSaveOccurrence = async () => {
    const rollNumbers = normalizeRollNumbers(occurrenceForm.eligibleRollNumbers)

    if (!occurrenceForm.title.trim()) {
      toast.error("Occurrence title is required")
      return
    }

    if (!occurrenceForm.applyStartAt) {
      toast.error("Application start date is required")
      return
    }

    if (!occurrenceForm.applyEndAt) {
      toast.error("Application end date is required")
      return
    }

    if (new Date(occurrenceForm.applyStartAt) >= new Date(occurrenceForm.applyEndAt)) {
      toast.error("Application start date must be before the end date")
      return
    }

    if (occurrenceModalMode === "create" && rollNumbers.length === 0) {
      toast.error("Upload eligible roll numbers before activating the occurrence")
      return
    }

    if (occurrenceModalMode === "edit" && occurrenceForm.studentListTouched && rollNumbers.length === 0) {
      toast.error("Keep at least one eligible student in the list.")
      return
    }

    try {
      setSavingOccurrence(true)
      const payload = {
        title: occurrenceForm.title.trim(),
        awardYear: Number(occurrenceForm.awardYear || new Date().getFullYear()),
        applyStartAt: new Date(occurrenceForm.applyStartAt).toISOString(),
        applyEndAt: new Date(occurrenceForm.applyEndAt).toISOString(),
        description: occurrenceForm.description.trim(),
        ...(
          occurrenceModalMode === "create" || occurrenceForm.studentListTouched
            ? { eligibleRollNumbers: rollNumbers }
            : {}
        ),
      }

      if (occurrenceModalMode === "edit" && occurrenceDetail?.occurrence?.id) {
        await overallBestPerformerApi.updateOccurrence(occurrenceDetail.occurrence.id, payload)
        toast.success("Occurrence updated")
      } else {
        await overallBestPerformerApi.createOccurrence(payload)
        toast.success("Occurrence activated")
      }

      setShowOccurrenceModal(false)
      setShowEligibleStudentsModal(false)
      const selectorPayload = await loadAdminData()
      const nextSelectedOccurrenceId = String(
        selectorPayload?.activeOccurrenceId || occurrenceDetail?.occurrence?.id || selectedOccurrenceId || ""
      )
      setSelectedOccurrenceId(nextSelectedOccurrenceId)
      if (nextSelectedOccurrenceId) {
        await loadAdminOccurrence(nextSelectedOccurrenceId)
      }
    } catch (err) {
      toast.error(err.message || "Failed to save occurrence")
    } finally {
      setSavingOccurrence(false)
    }
  }

  const handleSaveStudentApplication = async () => {
    if (!portalState?.data?.occurrence?.id) {
      toast.error("No active occurrence available")
      return
    }

    if (!applicationForm.personalAcademic.declarationAccepted) {
      toast.error("Please accept the undertaking before submitting")
      return
    }

    if (!applicationForm.personalAcademic.isPassingOutStudent) {
      toast.error("Only passing out students are eligible to apply")
      return
    }

    if (!applicationForm.personalAcademic.hasNoDisciplinaryAction) {
      toast.error("Applicants with disciplinary action are not eligible")
      return
    }

    if (!applicationForm.personalAcademic.hasNoFrGrade) {
      toast.error("Applicants must confirm that no FR grade is counted in academics")
      return
    }

    if (Number(applicationForm.coursework.scoreValue || 0) < 6.5) {
      toast.error("Minimum CGPA / CPI required is 6.50")
      return
    }

    if (!hasSelectedProof(applicationForm.coursework)) {
      toast.error("Academic transcript / coursework proof is required.")
      return
    }

    const sectionValidationError =
      validateScoredItems(applicationForm.projectThesis.publicationItems, "Project / thesis publication items") ||
      validateScoredItems(applicationForm.projectThesis.technologyTransferItems, "Technology transfer items") ||
      validateScoredItems(applicationForm.responsibilityItems, "Position of responsibility") ||
      validateScoredItems(applicationForm.awardItems, "Awards and entrepreneurship") ||
      validateScoredItems(applicationForm.culturalItems, "Cultural activities") ||
      validateScoredItems(applicationForm.scienceTechnologyItems, "Science and technology activities") ||
      validateScoredItems(applicationForm.gamesSportsItems, "Games and sports activities") ||
      validateScoredItems(applicationForm.coCurricularItems, "Co-curricular activities")

    if (sectionValidationError) {
      toast.error(sectionValidationError)
      return
    }

    if (applicationForm.projectThesis.track === "btech_project") {
      if (
        applicationForm.projectThesis.btpAwardLevel !== "none" &&
        !hasSelectedProof({
          proofSourceType: applicationForm.projectThesis.btpAwardProofSourceType,
          proofUrl: applicationForm.projectThesis.btpAwardProofUrl,
          proofPorId: applicationForm.projectThesis.btpAwardProofPorId,
        })
      ) {
        toast.error("BTP award proof is required when you add a BTP award entry.")
        return
      }

      if (
        applicationForm.projectThesis.btpAwardLevel !== "none" &&
        !String(applicationForm.projectThesis.btpAwardTitle || "").trim()
      ) {
        toast.error("BTP award title is required when you add a BTP award entry.")
        return
      }

      if (
        applicationForm.projectThesis.projectGrade !== "none" &&
        !hasSelectedProof({
          proofSourceType: applicationForm.projectThesis.projectGradeProofSourceType,
          proofUrl: applicationForm.projectThesis.projectGradeProofUrl,
          proofPorId: applicationForm.projectThesis.projectGradeProofPorId,
        })
      ) {
        toast.error("Project grade proof is required when you add a project grade entry.")
        return
      }

      if (
        applicationForm.projectThesis.projectGrade !== "none" &&
        !String(applicationForm.projectThesis.projectGradeTitle || "").trim()
      ) {
        toast.error("Project grade title is required when you add a project grade entry.")
        return
      }
    }

    try {
      setSavingApplication(true)
      const response = await overallBestPerformerApi.upsertApplication(
        portalState.data.occurrence.id,
        buildPayload(applicationForm)
      )
      clearApplicationDraft()
      toast.success(response?.message || "Application saved")
      await loadStudentData()
    } catch (err) {
      toast.error(err.message || "Failed to save application")
    } finally {
      setSavingApplication(false)
    }
  }

  const handleReviewDecision = async (decision, remarks) => {
    if (!reviewApplication?.id || !canReviewApplications) return

    try {
      setReviewing(true)
      await overallBestPerformerApi.reviewApplication(reviewApplication.id, {
        decision,
        remarks,
      })
      toast.success(decision === "approved" ? "Application approved" : "Application rejected")
      setReviewApplication(null)
      await loadAdminOccurrence(selectedOccurrenceId)
    } catch (err) {
      toast.error(err.message || "Failed to review application")
    } finally {
      setReviewing(false)
    }
  }

  const handleHodVerification = async (action, remarks) => {
    if (!reviewApplication?.id || !canAddHodVerification) return

    const trimmedRemarks = String(remarks || "").trim()
    if (!trimmedRemarks) {
      toast.error("Comments are required.")
      return
    }

    try {
      setReviewing(true)
      await overallBestPerformerApi.addHodVerification(reviewApplication.id, {
        action,
        remarks: trimmedRemarks,
      })
      toast.success(action === "verified" ? "Application verified" : "Comment added")
      setReviewApplication(null)
      await loadAdminOccurrence(selectedOccurrenceId)
    } catch (err) {
      toast.error(err.message || "Failed to save HOD verification")
    } finally {
      setReviewing(false)
    }
  }

  const handleExportOccurrenceCsv = () => {
    const applications = occurrenceDetail?.leaderboard || []
    if (!applications.length) {
      toast.error("No applications available to export.")
      return
    }

    const headers = [
      "rank",
      "occurrence_title",
      "award_year",
      "student_name",
      "student_email",
      "roll_number",
      "department",
      "degree",
      "programme",
      "personal_department",
      "is_passing_out_student",
      "has_no_disciplinary_action",
      "has_no_fr_grade",
      "undertaking_accepted",
      "coursework_mode",
      "coursework_score_value",
      "coursework_notes",
      "coursework_proofs",
      "project_track",
      "btp_award_level",
      "btp_award_title",
      "btp_award_notes",
      "btp_award_proofs",
      "project_grade",
      "project_grade_title",
      "project_grade_notes",
      "project_grade_proofs",
      "publication_items",
      "technology_transfer_items",
      "responsibility_items",
      "award_items",
      "cultural_items",
      "science_technology_items",
      "games_sports_items",
      "co_curricular_items",
      "coursework_points",
      "project_thesis_points",
      "responsibilities_points",
      "awards_points",
      "cultural_points",
      "science_technology_points",
      "games_sports_points",
      "co_curricular_points",
      "calculated_total",
      "review_status",
      "review_remarks",
      "reviewed_by",
      "reviewed_at",
      "final_score",
      "submitted_at",
      "created_at",
      "updated_at",
    ]

    const rows = applications.map((application, index) => {
      const personalAcademic = application?.personalAcademic || {}
      const coursework = application?.coursework || {}
      const projectThesis = application?.projectThesis || {}
      const review = application?.review || {}
      const scoreBreakdown = application?.scoreBreakdown || {}

      return [
        index + 1,
        currentOccurrence?.title || "",
        application?.awardYear || currentOccurrence?.awardYear || "",
        application?.studentName || "",
        application?.studentEmail || "",
        application?.rollNumber || "",
        application?.department || "",
        application?.degree || "",
        personalAcademic?.programme || "",
        personalAcademic?.department || "",
        personalAcademic?.isPassingOutStudent ? "Yes" : "No",
        personalAcademic?.hasNoDisciplinaryAction ? "Yes" : "No",
        personalAcademic?.hasNoFrGrade ? "Yes" : "No",
        personalAcademic?.declarationAccepted ? "Yes" : "No",
        coursework?.evaluationMode || "",
        coursework?.scoreValue ?? "",
        coursework?.notes || "",
        summarizeProofsForExport(coursework?.proofs),
        projectThesis?.track || "",
        projectThesis?.btpAwardLevel || "",
        projectThesis?.btpAwardTitle || "",
        projectThesis?.btpAwardNotes || "",
        summarizeProofsForExport(projectThesis?.btpAwardProofs),
        projectThesis?.projectGrade || "",
        projectThesis?.projectGradeTitle || "",
        projectThesis?.projectGradeNotes || "",
        summarizeProofsForExport(projectThesis?.projectGradeProofs),
        summarizeItemsForExport(projectThesis?.publicationItems),
        summarizeItemsForExport(projectThesis?.technologyTransferItems),
        summarizeItemsForExport(application?.responsibilityItems),
        summarizeItemsForExport(application?.awardItems),
        summarizeItemsForExport(application?.culturalItems),
        summarizeItemsForExport(application?.scienceTechnologyItems),
        summarizeItemsForExport(application?.gamesSportsItems),
        summarizeItemsForExport(application?.coCurricularItems),
        scoreBreakdown?.coursework ?? "",
        scoreBreakdown?.projectThesis ?? "",
        scoreBreakdown?.responsibilities ?? "",
        scoreBreakdown?.awards ?? "",
        scoreBreakdown?.cultural ?? "",
        scoreBreakdown?.scienceTechnology ?? "",
        scoreBreakdown?.gamesSports ?? "",
        scoreBreakdown?.coCurricular ?? "",
        application?.calculatedTotal ?? "",
        review?.status || "",
        review?.remarks || "",
        review?.reviewedBy || "",
        formatExportDateTime(review?.reviewedAt),
        application?.finalScore ?? "",
        formatExportDateTime(application?.submittedAt),
        formatExportDateTime(application?.createdAt),
        formatExportDateTime(application?.updatedAt),
      ]
    })

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n")

    const occurrenceSlug = String(currentOccurrence?.title || "best-performer")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    downloadCsvFile(
      csvContent,
      `${occurrenceSlug || "best-performer"}-${currentOccurrence?.awardYear || "occurrence"}-${new Date().toISOString().split("T")[0]}.csv`
    )
    toast.success("Best Performer export downloaded.")
  }

  const leaderboardRows = useMemo(
    () =>
      (occurrenceDetail?.leaderboard || []).map((application, index) => ({
        ...application,
        leaderboardRank: index + 1,
      })),
    [occurrenceDetail?.leaderboard]
  )

  const leaderboardColumns = useMemo(
    () => [
      {
        header: "Rank",
        key: "leaderboardRank",
        render: (application) => (
          <Badge variant="primary">#{application.leaderboardRank}</Badge>
        ),
      },
      {
        header: "Student",
        key: "studentName",
        render: (application) => (
          <div style={{ display: "grid", gap: "4px", minWidth: 0 }}>
            <div
              style={{
                color: "var(--color-text-primary)",
                fontWeight: "var(--font-weight-medium)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {application.studentName || "—"}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {application.rollNumber || "—"}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-light)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {application.department || "—"}{application.degree ? ` · ${application.degree}` : ""}
            </div>
          </div>
        ),
      },
      {
        header: "Calculated",
        key: "calculatedTotal",
        render: (application) => (
          <div style={{ display: "grid", gap: "4px" }}>
            <div
              style={{
                color: "var(--color-text-primary)",
                fontWeight: "var(--font-weight-semibold)",
                whiteSpace: "nowrap",
              }}
            >
              {application.calculatedTotal ?? "—"}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              Auto score
            </div>
          </div>
        ),
      },
      {
        header: "Final",
        key: "finalScore",
        render: (application) => (
          <div style={{ display: "grid", gap: "4px" }}>
            <div>
              <Badge variant="info">{application.finalScore ?? "—"}</Badge>
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              Reviewed score
            </div>
          </div>
        ),
      },
      {
        header: "Status",
        key: "status",
        render: (application) => (
          <Badge variant={statusTone(application.review?.status)}>
            {application.review?.status || "submitted"}
          </Badge>
        ),
      },
      {
        header: "Updated",
        key: "updatedAt",
        render: (application) => {
          if (!application.updatedAt) return "—"
          const updatedAt = new Date(application.updatedAt)
          return (
            <div style={{ display: "grid", gap: "4px" }}>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-primary)",
                  fontWeight: "var(--font-weight-medium)",
                  whiteSpace: "nowrap",
                }}
              >
                {updatedAt.toLocaleDateString()}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          )
        },
      },
    ],
    []
  )

  if (loading) {
    return <LoadingState message="Loading Overall Best Performer award..." />
  }

  if (error) {
    return <ErrorState title="Overall Best Performer unavailable" message={error} />
  }

  if (!isReviewerView && !portalState?.data?.canAccessPortal) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <PageHeader title="Overall Best Performer" subtitle="Student portal" showDate={false} />
        <div style={{ padding: "var(--spacing-6)" }}>
          <EmptyState
            title={
              portalState?.data?.studentStatusAllowed === false
                ? "Best Performer unavailable"
                : portalState?.data?.applicationWindowStatus === "scheduled"
                  ? "Application window not started"
                  : portalState?.data?.applicationWindowStatus === "closed"
                    ? "Application window closed"
                : "No accessible occurrence"
            }
            description={
              portalState?.data?.studentStatusAllowed === false
                ? "Only students with Active or Graduated status can access the Best Performer portal."
                : portalState?.data?.applicationWindowStatus === "scheduled"
                  ? "The Best Performer portal will become visible only after the configured application start date."
                  : portalState?.data?.applicationWindowStatus === "closed"
                    ? "The Best Performer portal is visible to students only between the configured application start and end date."
                    : "There is no active Overall Best Performer occurrence for you right now."
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100%", backgroundColor: "var(--color-bg-page)" }}>
      <PageHeader
        title={isReviewerView ? "Overall Best Performer" : "Overall Best Performer Award"}
        subtitle={isReviewerView ? (canManageOccurrence ? "Annual occurrence control, review, and leaderboard" : "Occurrence leaderboard and application review") : "Apply, upload proofs, and track your score"}
        showDate={false}
      >
        {isReviewerView ? (
          <>
            <div style={{ minWidth: 260 }}>
              <select
                value={selectedOccurrenceId}
                onChange={(event) => setSelectedOccurrenceId(event.target.value)}
                style={inputStyle}
              >
                <option value="">Select an occurrence</option>
                {(selectorData?.occurrences || []).map((occurrence) => (
                  <option key={occurrence.id} value={occurrence.id}>
                    {occurrence.awardYear} · {occurrence.title} · {occurrence.status}
                  </option>
                ))}
              </select>
            </div>
            {canManageOccurrence ? (
              <Button
                onClick={() => {
                  resetOccurrenceForm("create")
                  setShowOccurrenceModal(true)
                }}
              >
                <Plus size={16} /> Start occurrence
              </Button>
            ) : null}
            {canManageOccurrence && occurrenceDetail?.occurrence?.status === "active" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  resetOccurrenceForm("edit")
                  setShowOccurrenceModal(true)
                }}
              >
                <Save size={16} /> Edit active
              </Button>
            ) : null}
            {canManageOccurrence ? (
              <Button
                variant="secondary"
                onClick={handleExportOccurrenceCsv}
                disabled={!occurrenceDetail?.leaderboard?.length}
              >
                <Download size={16} /> Export CSV
              </Button>
            ) : null}
          </>
        ) : (
          <div style={badgeStyle(currentOccurrence?.applicationWindowStatus === "open" ? "primary" : "default")}>
            <Trophy size={14} />
            {getApplicationWindowLabel(currentOccurrence?.applicationWindowStatus)}
          </div>
        )}
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-6) var(--spacing-8)", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {currentOccurrence ? (
          <>
            <StatCards
              columns={5}
              stats={[
                {
                  title: "Award Year",
                  value: currentOccurrence.awardYear,
                  subtitle: currentOccurrence.title || "Occurrence",
                  icon: <CalendarDays size={18} />,
                  color: "var(--color-primary)",
                },
                {
                  title: "Application Starts",
                  value: (
                    <span style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.4, display: "inline-block" }}>
                      {currentOccurrence.applyStartAt ? new Date(currentOccurrence.applyStartAt).toLocaleString() : "—"}
                    </span>
                  ),
                  subtitle: "Opening time",
                  icon: <Clock3 size={18} />,
                  color: "var(--color-info)",
                },
                {
                  title: "Application Ends",
                  value: (
                    <span style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.4, display: "inline-block" }}>
                      {currentOccurrence.applyEndAt ? new Date(currentOccurrence.applyEndAt).toLocaleString() : "—"}
                    </span>
                  ),
                  subtitle: "Closing time",
                  icon: <Clock3 size={18} />,
                  color: "var(--color-warning)",
                },
                {
                  title: "Eligible Students",
                  value: currentOccurrence.eligibleStudentCount || 0,
                  subtitle: "Configured list",
                  icon: <Users size={18} />,
                  color: "var(--color-success)",
                },
                {
                  title: "Window",
                  value: (
                    <span
                      style={{
                        fontSize: "var(--font-size-sm)",
                        lineHeight: 1.35,
                        display: "inline-block",
                        maxWidth: "100%",
                        wordBreak: "break-word",
                      }}
                    >
                      {getApplicationWindowLabel(currentOccurrence.applicationWindowStatus)}
                    </span>
                  ),
                  subtitle: "Current status",
                  icon: <Trophy size={18} />,
                  color: "var(--color-primary)",
                },
              ]}
            />

            {currentOccurrence.description ? (
              <div style={{ ...panelStyle, backgroundColor: "var(--color-primary-bg)" }}>
                <div style={{ ...panelBodyStyle, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>
                  {currentOccurrence.description}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {isReviewerView ? (
          occurrenceDetail ? (
            <>
              {leaderboardRows.length ? (
                <DataTable
                  columns={leaderboardColumns}
                  data={leaderboardRows}
                  loading={false}
                  emptyMessage="No applications yet."
                  onRowClick={setReviewApplication}
                />
              ) : (
                <EmptyState
                  title="No applications yet"
                  description="Students have not submitted applications for this occurrence."
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No occurrence selected"
              description={canManageOccurrence ? "If there is no active occurrence, pick one from history. If you want to open a new annual round, start an occurrence from the header." : "Pick an occurrence from the header to inspect applications and scores."}
            />
          )
        ) : (
          <>
            <div style={{ ...panelStyle, backgroundColor: "var(--color-primary-bg)" }}>
              <div style={{ ...panelBodyStyle, display: "grid", gap: "var(--spacing-3)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    Start: {currentOccurrence?.applyStartAt ? new Date(currentOccurrence.applyStartAt).toLocaleString() : "—"}
                  </span>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    End: {currentOccurrence?.applyEndAt ? new Date(currentOccurrence.applyEndAt).toLocaleString() : "—"}
                  </span>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    Min CGPA/CPI: 6.50
                  </span>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    Passing-out students only
                  </span>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    Allowed status: Active / Graduated
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)", marginBottom: "var(--spacing-1)" }}>
                    Application rules
                  </div>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.7 }}>
                    The portal is visible to students only between the configured application start and end date. During that window, you can edit your application. Eligibility follows the manual form: only students with Active or Graduated status, passing out student declaration, minimum CGPA/CPI 6.50, no disciplinary action, and no FR grade counted in academics.
                  </div>
                </div>
              </div>
            </div>

            <div style={panelStyle}>
              <div style={panelBodyStyle}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-4)", flexWrap: "wrap" }}>
                  <div style={{ maxWidth: "72ch" }}>
                    <div style={{ ...sectionLabelStyle, marginBottom: "8px" }}>Reference Guide</div>
                    <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                      Marking Scheme
                    </div>
                    <div style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.7 }}>
                      Check the marking scheme before filling the form and map each entry to the correct scoring category. Use the official scheme to decide which achievements to add and what supporting proof to attach.
                    </div>
                  </div>

                  <Button variant="secondary" onClick={() => setShowMarkingSchemeModal(true)}>
                    <FileText size={16} /> View Marking Scheme
                  </Button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <div style={panelStyle}>
                <div style={{ ...panelBodyStyle, display: "grid", gap: "var(--spacing-3)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                    <span style={buildMetaChipStyle()}>{portalState?.data?.student?.name || "Student"}</span>
                    <span style={buildMetaChipStyle()}>{portalState?.data?.student?.rollNumber || "—"}</span>
                    <span style={buildMetaChipStyle()}>{portalState?.data?.student?.department || "—"}</span>
                    <span style={buildMetaChipStyle()}>
                      Status: {portalState?.data?.student?.status || "—"}
                    </span>
                    <span style={buildMetaChipStyle()}>Review: {currentApplication?.review?.status || "draft"}</span>
                  </div>
                  {currentApplication?.review?.status === "rejected" && currentApplication.review?.remarks ? (
                    <div style={{ ...fieldClusterStyle, backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)" }}>
                      <span style={{ ...sectionLabelStyle, color: "var(--color-danger-text)" }}>Latest Review Remark</span>
                      <div style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.7 }}>
                        {currentApplication.review.remarks}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <SectionPanel title="Score Preview">
                <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
                    <SummaryMetric icon={Trophy} label="Current Score" value={studentScorePreview.total} />
                    <SummaryMetric
                      icon={Save}
                      label="Saved Score"
                      value={currentApplication ? currentApplication.calculatedTotal || 0 : "Not saved"}
                    />
                    <SummaryMetric
                      icon={CheckCircle2}
                      label="Final Review Score"
                      value={
                        currentApplication?.review?.status === "approved" ||
                        currentApplication?.review?.status === "rejected"
                          ? currentApplication?.finalScore ?? 0
                          : "Pending review"
                      }
                    />
                  </div>

                  <div style={helperTextStyle}>
                    This score preview updates as you edit the form. The saved score is the last submitted calculation, and the final review score appears after admin review.
                  </div>

                  <ScoreBreakdownCard breakdown={studentScorePreview} />
                </div>
              </SectionPanel>

              <SectionPanel
                title="1. Academic achievements"
                subtitle="Choose your programme type and provide your CGPA / CPI with supporting transcript proof."
              >
                <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Programme Type</span>
                    <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                      {APPLICANT_STAGE_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          variant={applicantStage === option.value ? undefined : "secondary"}
                          onClick={() => syncApplicantStage(option.value)}
                          disabled={!canEditStudentForm}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                    <div>
                      <label style={fieldLabelStyle}>
                        {applicantStage === "ug" ? "CGPA" : "CPI"}
                      </label>
                      <Input
                        type="number"
                        value={applicationForm.coursework.scoreValue}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, scoreValue: event.target.value },
                          }))
                        }
                        disabled={!canEditStudentForm}
                      />
                      <div style={helperTextStyle}>Minimum eligible value is 6.50.</div>
                    </div>

                    <div>
                      <label style={fieldLabelStyle}>Brief note</label>
                      <textarea
                        value={applicationForm.coursework.notes}
                        disabled={!canEditStudentForm}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, notes: event.target.value },
                          }))
                        }
                        style={textareaStyle}
                        placeholder="Mention any coursework context if needed."
                      />
                    </div>

                    <div>
                      <SupportingProofField
                        label="Supporting document"
                        proofSourceType={applicationForm.coursework.proofSourceType}
                        proofUrl={applicationForm.coursework.proofUrl}
                        proofPorId={applicationForm.coursework.proofPorId}
                        onChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, ...proofState },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        uploadedText="Academic proof uploaded"
                        viewerTitle="Academic transcript / coursework proof"
                      />
                    </div>
                  </div>
                </div>
              </SectionPanel>

              <SectionPanel
                title="2. Project / thesis work"
                subtitle="The UG / PG choice here is synced with section 1. Add only the relevant project or thesis achievements."
              >
                <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Project Track</span>
                    <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                      {APPLICANT_STAGE_OPTIONS.map((option) => (
                        <Button
                          key={`project-${option.value}`}
                          variant={applicantStage === option.value ? undefined : "secondary"}
                          onClick={() => syncApplicantStage(option.value)}
                          disabled={!canEditStudentForm}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {applicantStage === "ug" ? (
                    <>
                      <SingleSelectionAchievementEditor
                        heading="BTP award"
                        value={applicationForm.projectThesis.btpAwardLevel}
                        options={BTP_AWARD_OPTIONS}
                        titleValue={applicationForm.projectThesis.btpAwardTitle}
                        notesValue={applicationForm.projectThesis.btpAwardNotes}
                        proofSourceType={applicationForm.projectThesis.btpAwardProofSourceType}
                        proofUrl={applicationForm.projectThesis.btpAwardProofUrl}
                        proofPorId={applicationForm.projectThesis.btpAwardProofPorId}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              btpAwardLevel: value,
                              ...(value === "none"
                                ? {
                                    btpAwardTitle: "",
                                    btpAwardNotes: "",
                                    btpAwardProofSourceType: "upload",
                                    btpAwardProofUrl: "",
                                    btpAwardProofPorId: "",
                                  }
                                : {}),
                            },
                          }))
                        }
                        onTitleChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, btpAwardTitle: value },
                          }))
                        }
                        onNotesChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, btpAwardNotes: value },
                          }))
                        }
                        onProofChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              btpAwardProofSourceType: proofState.proofSourceType,
                              btpAwardProofUrl: proofState.proofUrl,
                              btpAwardProofPorId: proofState.proofPorId,
                            },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        titleLabel="Project title"
                        titlePlaceholder="Enter the BTP title"
                        descriptionLabel="Short description"
                        descriptionPlaceholder="Add any necessary context for this BTP award."
                      />

                      <SingleSelectionAchievementEditor
                        heading="Project grade"
                        value={applicationForm.projectThesis.projectGrade}
                        options={PROJECT_GRADE_OPTIONS}
                        titleValue={applicationForm.projectThesis.projectGradeTitle}
                        notesValue={applicationForm.projectThesis.projectGradeNotes}
                        proofSourceType={applicationForm.projectThesis.projectGradeProofSourceType}
                        proofUrl={applicationForm.projectThesis.projectGradeProofUrl}
                        proofPorId={applicationForm.projectThesis.projectGradeProofPorId}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              projectGrade: value,
                              ...(value === "none"
                                ? {
                                    projectGradeTitle: "",
                                    projectGradeNotes: "",
                                    projectGradeProofSourceType: "upload",
                                    projectGradeProofUrl: "",
                                    projectGradeProofPorId: "",
                                  }
                                : {}),
                            },
                          }))
                        }
                        onTitleChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, projectGradeTitle: value },
                          }))
                        }
                        onNotesChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, projectGradeNotes: value },
                          }))
                        }
                        onProofChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              projectGradeProofSourceType: proofState.proofSourceType,
                              projectGradeProofUrl: proofState.proofUrl,
                              projectGradeProofPorId: proofState.proofPorId,
                            },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        titleLabel="Project title"
                        titlePlaceholder="Enter the project title"
                        descriptionLabel="Short description"
                        descriptionPlaceholder="Add any necessary context for the awarded grade."
                      />
                    </>
                  ) : null}

                  <MinimalScoredItemsEditor
                    step={applicantStage === "ug" ? "2" : "2"}
                    title={applicantStage === "ug" ? "Project publications / patents" : "Thesis publications / patents"}
                    subtitle="Add only the relevant publications or patents and attach the required supporting proof."
                    items={applicationForm.projectThesis.publicationItems}
                    onChange={(items) =>
                      setApplicationForm((current) => ({
                        ...current,
                        projectThesis: { ...current.projectThesis, publicationItems: items },
                      }))
                    }
                    options={PUBLICATION_OPTIONS}
                    verifiedPors={verifiedPors}
                    disabled={!canEditStudentForm}
                    uploadLabel="Supporting document"
                    titleLabel="Achievement title"
                    titlePlaceholder="Enter publication / patent title"
                    descriptionLabel="Short description"
                    descriptionPlaceholder="Mention the publication, patent, or conference context."
                    embedded
                  />

                  {applicantStage === "pg" ? (
                    <MinimalScoredItemsEditor
                      step="2"
                      title="Technology transfer"
                      subtitle="Add only the relevant technology transfer achievements for the PG / PhD thesis track."
                      items={applicationForm.projectThesis.technologyTransferItems}
                      onChange={(items) =>
                        setApplicationForm((current) => ({
                          ...current,
                          projectThesis: { ...current.projectThesis, technologyTransferItems: items },
                        }))
                      }
                      options={TECH_TRANSFER_OPTIONS}
                      verifiedPors={verifiedPors}
                      disabled={!canEditStudentForm}
                      uploadLabel="Supporting document"
                      titleLabel="Transfer / work title"
                      titlePlaceholder="Enter the technology transfer title"
                      descriptionLabel="Short description"
                      descriptionPlaceholder="Mention the role, work, or transfer context."
                      embedded
                    />
                  ) : null}
                </div>
              </SectionPanel>

              <MinimalScoredItemsEditor
                step="3"
                title="Position of responsibility"
                subtitle="Choose the exact POR marking category, add the title, a short description, and attach the supporting proof."
                items={applicationForm.responsibilityItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, responsibilityItems: items }))}
                options={RESPONSIBILITY_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Position title"
                titlePlaceholder="Enter the POR title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the responsibility briefly."
              />

              <MinimalScoredItemsEditor
                step="4"
                title="Awards / entrepreneurship / social work"
                subtitle="Add only the relevant awards, incubation, entrepreneurship, or social-work achievements."
                items={applicationForm.awardItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, awardItems: items }))}
                options={AWARD_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the award or achievement title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the achievement briefly."
              />

              <MinimalScoredItemsEditor
                step="5"
                title="Cultural activities"
                subtitle="Add only the relevant cultural achievements and select the correct marking category."
                items={applicationForm.culturalItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, culturalItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the cultural activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="6"
                title="Science and technology activities"
                subtitle="Add only the relevant science and technology activities with the correct scoring category."
                items={applicationForm.scienceTechnologyItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, scienceTechnologyItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the science / technology activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="7"
                title="Games and sports activities"
                subtitle="Add only the relevant sports achievements and match them to the correct marking category."
                items={applicationForm.gamesSportsItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, gamesSportsItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the sports activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="8"
                title="Co-curricular / extra-curricular activities"
                subtitle="Add only the relevant co-curricular or extra-curricular achievements."
                items={applicationForm.coCurricularItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, coCurricularItems: items }))}
                options={CO_CURRICULAR_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity briefly."
              />

              <SectionPanel
                title="Final Declaration"
                subtitle="Confirm your eligibility and then save the application."
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", color: "var(--color-text-body)" }}>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.isPassingOutStudent}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("isPassingOutStudent", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <span style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.7 }}>
                      I confirm that I am a passing out student and eligible to apply for this award.
                    </span>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.hasNoDisciplinaryAction}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("hasNoDisciplinaryAction", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <span style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.7 }}>
                      I confirm that I have not been subjected to any disciplinary action.
                    </span>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.hasNoFrGrade}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("hasNoFrGrade", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <span style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.7 }}>
                      I confirm that no FR grade is accounted in my academics for this application.
                    </span>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.declarationAccepted}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("declarationAccepted", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <span style={{ fontSize: "var(--font-size-sm)", lineHeight: 1.7 }}>
                      I hereby declare that the information provided by me is true and correct to the best of my knowledge and belief. If any of the information is found to be false or misleading, I authorize the Institute to take appropriate action against me as deemed fit.
                    </span>
                  </label>

                  <div style={{ ...infoBoxStyle, display: "grid", gap: "var(--spacing-3)" }}>
                    <span style={sectionLabelStyle}>Submission Action</span>
                    <Button onClick={handleSaveStudentApplication} loading={savingApplication} disabled={!canEditStudentForm}>
                      <Save size={16} /> Save application
                    </Button>
                    {!canEditStudentForm ? (
                      <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", lineHeight: 1.6 }}>
                        This application is read-only because the deadline has passed or the submission has already been reviewed.
                      </div>
                    ) : null}
                  </div>
                </div>
              </SectionPanel>
            </div>
          </>
        )}
      </div>

      <MarkingSchemeModal
        open={showMarkingSchemeModal}
        onClose={() => setShowMarkingSchemeModal(false)}
      />

      {showOccurrenceModal ? (
        <Modal
          title={occurrenceModalMode === "edit" ? "Edit active occurrence" : "Start Overall Best Performer occurrence"}
          onClose={() => {
            setShowOccurrenceModal(false)
            setShowEligibleStudentsModal(false)
          }}
          width={980}
          fullHeight={true}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
              <div>
                <label style={fieldLabelStyle}>Occurrence title</label>
                <input value={occurrenceForm.title} onChange={(event) => setOccurrenceForm((current) => ({ ...current, title: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Award year</label>
                <input value={occurrenceForm.awardYear} onChange={(event) => setOccurrenceForm((current) => ({ ...current, awardYear: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Application start date</label>
                <input type="datetime-local" value={occurrenceForm.applyStartAt} onChange={(event) => setOccurrenceForm((current) => ({ ...current, applyStartAt: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Application end date</label>
                <input type="datetime-local" value={occurrenceForm.applyEndAt} onChange={(event) => setOccurrenceForm((current) => ({ ...current, applyEndAt: event.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "end", color: "var(--color-text-muted)" }}>
                {occurrenceModalMode === "edit"
                  ? `${occurrenceForm.eligibleRollNumbers.length || 0} eligible students currently configured`
                  : (occurrenceForm.eligibleRows || []).length
                    ? `${occurrenceForm.eligibleRows.length} CSV rows loaded`
                    : "CSV upload required when activating a new occurrence"}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabelStyle}>Description / instructions</label>
                <textarea value={occurrenceForm.description} onChange={(event) => setOccurrenceForm((current) => ({ ...current, description: event.target.value }))} style={textareaStyle} />
              </div>
            </div>

            {occurrenceModalMode === "edit" ? (
              <SectionPanel
                title="Eligible students"
                subtitle="Review and update the active student list without reuploading unless you want to replace it."
                actions={(
                  <Button variant="secondary" onClick={() => setShowEligibleStudentsModal(true)}>
                    <Eye size={16} /> View Students
                  </Button>
                )}
              >
                <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Current list</span>
                    <div style={{ display: "grid", gap: "6px", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                      <div>{occurrenceForm.eligibleRollNumbers.length || 0} eligible students configured for this active occurrence.</div>
                      <div style={{ color: "var(--color-text-muted)" }}>
                        Editing this list will not remove or delete already submitted applications for this occurrence.
                      </div>
                    </div>
                  </div>
                </div>
              </SectionPanel>
            ) : (
              <SectionPanel
                title="Eligible students CSV"
                subtitle="Upload a CSV with a single required column: rollNumber"
              >
                <CsvUploader
                  onDataParsed={handleOccurrenceRowsParsed}
                  requiredFields={["rollNumber"]}
                  templateFileName="overall_best_performer_eligible_students.csv"
                  templateHeaders={["rollNumber"]}
                  maxRecords={5000}
                  instructionText="Upload the exact roll numbers allowed to apply in this occurrence."
                />
              </SectionPanel>
            )}

            <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "flex-end" }}>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowOccurrenceModal(false)
                  setShowEligibleStudentsModal(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveOccurrence} loading={savingOccurrence}>
                <Upload size={16} /> {occurrenceModalMode === "edit" ? "Save changes" : "Activate occurrence"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showEligibleStudentsModal ? (
        <Modal
          title="Manage Eligible Students"
          onClose={() => setShowEligibleStudentsModal(false)}
          width={1080}
          minHeight="60vh"
        >
          <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Important</span>
              <div style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", lineHeight: 1.6 }}>
                Changing this list affects future eligibility for the active occurrence, but it does not remove or delete already submitted applications.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "var(--spacing-3)", alignItems: "end" }}>
              <div>
                <label style={fieldLabelStyle}>Search students</label>
                <Input
                  value={eligibleStudentSearch}
                  onChange={(event) => setEligibleStudentSearch(event.target.value)}
                  placeholder="Search by roll number, name, email, department..."
                />
              </div>
              <div style={{ minWidth: 220 }}>
                <label style={fieldLabelStyle}>Add by roll number</label>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "var(--spacing-2)" }}>
                  <Input
                    value={manualEligibleRollNumber}
                    onChange={(event) => setManualEligibleRollNumber(event.target.value.toUpperCase())}
                    placeholder="e.g. 22CS10001"
                  />
                  <Button onClick={handleAddEligibleStudent}>
                    <Plus size={16} /> Add
                  </Button>
                </div>
              </div>
            </div>

            <SectionPanel
              title="Replace entire list"
              subtitle="Upload a new CSV to overwrite the current eligible student list for this occurrence."
            >
              <CsvUploader
                onDataParsed={handleOccurrenceRowsParsed}
                requiredFields={["rollNumber"]}
                templateFileName="overall_best_performer_eligible_students.csv"
                templateHeaders={["rollNumber"]}
                maxRecords={5000}
                instructionText="Uploading here replaces the current list inside this edit session. Save the occurrence to apply the changes."
              />
            </SectionPanel>

            <SectionPanel
              title="Eligible students"
              subtitle={`${occurrenceForm.eligibleRollNumbers.length || 0} students currently in this edit list.`}
            >
              <div style={{ display: "grid", gap: "var(--spacing-2)", maxHeight: "42vh", overflowY: "auto" }}>
                {filteredEligibleStudents.length > 0 ? (
                  filteredEligibleStudents.map((student) => (
                    <div
                      key={student.rollNumber}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) auto",
                        gap: "var(--spacing-3)",
                        alignItems: "center",
                        padding: "var(--spacing-3)",
                        border: "1px solid var(--color-border-primary)",
                        borderRadius: "var(--radius-card-sm)",
                        backgroundColor: "var(--color-bg-secondary)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                          {student.name || "Student record will be validated on save"}
                        </div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                          {student.rollNumber}
                        </div>
                      </div>
                      <div style={{ minWidth: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                        <div>{student.email || "Name/email not loaded yet"}</div>
                        <div>
                          {[student.department, student.degree].filter(Boolean).join(" · ") || "Profile details unavailable"}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleRemoveEligibleStudent(student.rollNumber)}
                      >
                        <XCircle size={16} /> Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    No students match the current search.
                  </div>
                )}
              </div>
            </SectionPanel>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
              <Button variant="ghost" onClick={() => setShowEligibleStudentsModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <ReviewModal
        application={reviewApplication}
        open={Boolean(reviewApplication)}
        onClose={() => setReviewApplication(null)}
        onDecision={canReviewApplications ? handleReviewDecision : handleHodVerification}
        deciding={reviewing}
        reviewMode={canReviewApplications ? "admin" : canAddHodVerification ? "hod" : "readonly"}
      />
    </div>
  )
}

export default OverallBestPerformerPage
