import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal } from "czero/react"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Save,
  Trophy,
  Upload,
  Users,
  XCircle,
} from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import CsvUploader from "@/components/common/CsvUploader"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import {
  EmptyState,
  ErrorState,
  LoadingState,
  useToast,
} from "@/components/ui/feedback"
import { useAuth } from "@/contexts/AuthProvider"
import { overallBestPerformerApi, uploadApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

const COURSEWORK_MODE_OPTIONS = [
  { value: "ug_cgpa", label: "UG CGPA" },
  { value: "pg_cpi", label: "PG CPI" },
  { value: "research_coursework_cpi", label: "Research Coursework CPI" },
]

const PROJECT_TRACK_OPTIONS = [
  { value: "btech_project", label: "B.Tech Project Work" },
  { value: "pg_thesis", label: "PG / PhD Thesis Work" },
]

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

const ACTIVITY_POINTS = {
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

const SECTION_MAX = {
  coursework: 15,
  projectThesis: 15,
  responsibilities: 15,
  awards: 15,
  cultural: 10,
  scienceTechnology: 10,
  gamesSports: 10,
  coCurricular: 10,
}

const LEVEL_CODE_HINT = "Use IIT Indore level codes where applicable: IL, NL, SL, UL, RL, AL."

const surfaceStyle = {
  backgroundColor: "var(--color-bg-primary)",
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card)",
  boxShadow: "var(--shadow-card)",
}

const panelStyle = {
  ...surfaceStyle,
  padding: "var(--spacing-4)",
}

const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
  marginBottom: "var(--spacing-4)",
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
  proofUrl: "",
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

const buildProofs = (proofUrl, referenceCode) => {
  if (!proofUrl) return []
  return [
    {
      label: referenceCode || "Proof",
      url: proofUrl,
    },
  ]
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
    proofUrl: item?.proofs?.[0]?.url || "",
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
  },
  projectThesis: {
    track: application?.projectThesis?.track || "btech_project",
    btpAwardLevel: application?.projectThesis?.btpAwardLevel || "none",
    projectGrade: application?.projectThesis?.projectGrade || "none",
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

const roundToTwo = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100
const clamp = (value, max) => Math.max(0, Math.min(roundToTwo(value), max))

const scoreMappedItems = (items = [], pointsMap = {}, max = Number.POSITIVE_INFINITY) => {
  const rows = Array.isArray(items) ? items : []
  const nextItems = rows.map((item) => ({
    ...item,
    calculatedPoints: Number(pointsMap[item.scoreType] || 0),
  }))
  const total = clamp(nextItems.reduce((sum, item) => sum + Number(item.calculatedPoints || 0), 0), max)
  return { items: nextItems, total }
}

const computeClientBreakdown = (form) => {
  const courseworkPoints = clamp((Number(form.coursework.scoreValue || 0) || 0) * 1.5, SECTION_MAX.coursework)
  const publicationResult = scoreMappedItems(
    form.projectThesis.publicationItems,
    PUBLICATION_POINTS,
    form.projectThesis.track === "pg_thesis" ? 10 : 5
  )
  const technologyTransferResult = scoreMappedItems(
    form.projectThesis.technologyTransferItems,
    TECHNOLOGY_TRANSFER_POINTS,
    5
  )

  let projectPoints = publicationResult.total
  if (form.projectThesis.track === "pg_thesis") {
    projectPoints += technologyTransferResult.total
  } else {
    projectPoints += Number(BTP_AWARD_POINTS[form.projectThesis.btpAwardLevel] || 0)
    projectPoints += Number(PROJECT_GRADE_POINTS[form.projectThesis.projectGrade] || 0)
  }
  projectPoints = clamp(projectPoints, SECTION_MAX.projectThesis)

  const responsibilities = scoreMappedItems(form.responsibilityItems, RESPONSIBILITY_POINTS, SECTION_MAX.responsibilities)
  const awards = scoreMappedItems(form.awardItems, AWARD_POINTS, SECTION_MAX.awards)
  const cultural = scoreMappedItems(form.culturalItems, ACTIVITY_POINTS, SECTION_MAX.cultural)
  const scienceTechnology = scoreMappedItems(form.scienceTechnologyItems, ACTIVITY_POINTS, SECTION_MAX.scienceTechnology)
  const gamesSports = scoreMappedItems(form.gamesSportsItems, ACTIVITY_POINTS, SECTION_MAX.gamesSports)
  const coCurricular = scoreMappedItems(form.coCurricularItems, CO_CURRICULAR_POINTS, SECTION_MAX.coCurricular)

  return {
    coursework: courseworkPoints,
    projectThesis: projectPoints,
    responsibilities: responsibilities.total,
    awards: awards.total,
    cultural: cultural.total,
    scienceTechnology: scienceTechnology.total,
    gamesSports: gamesSports.total,
    coCurricular: coCurricular.total,
    total: roundToTwo(
      courseworkPoints +
        projectPoints +
        responsibilities.total +
        awards.total +
        cultural.total +
        scienceTechnology.total +
        gamesSports.total +
        coCurricular.total
    ),
  }
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
      proofs: buildProofs(item.proofUrl, item.referenceCode),
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
    references: (form.personalAcademic.references || []).slice(0, 3).map((reference) => ({
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
  },
  projectThesis: {
    track: form.projectThesis.track,
    btpAwardLevel: form.projectThesis.btpAwardLevel,
    projectGrade: form.projectThesis.projectGrade,
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
        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {actions}
    </div>
    {children}
  </section>
)

const SummaryMetric = ({ icon: Icon, label, value }) => (
  <div style={{ ...surfaceStyle, padding: "var(--spacing-3)", display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-icon)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={18} />
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

const ScoreBreakdownCard = ({ breakdown }) => {
  const rows = [
    ["Coursework", breakdown?.coursework || 0],
    ["Project / Thesis", breakdown?.projectThesis || 0],
    ["Position of Responsibility", breakdown?.responsibilities || 0],
    ["Awards & Extracurricular", breakdown?.awards || 0],
    ["Cultural", breakdown?.cultural || 0],
    ["Science & Technology", breakdown?.scienceTechnology || 0],
    ["Games & Sports", breakdown?.gamesSports || 0],
    ["Co-curricular", breakdown?.coCurricular || 0],
  ]

  return (
    <div style={{ ...surfaceStyle, overflow: "hidden" }}>
      <div style={{ padding: "var(--spacing-3) var(--spacing-4)", borderBottom: "1px solid var(--color-border-primary)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
        Score Breakdown
      </div>
      <div style={{ padding: "var(--spacing-3) var(--spacing-4)" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--color-border-light)" }}>
            <span style={{ color: "var(--color-text-body)" }}>{label}</span>
            <strong style={{ color: "var(--color-text-primary)" }}>{value}</strong>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "var(--spacing-3)", fontSize: "var(--font-size-lg)" }}>
          <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>Total</span>
          <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)" }}>{breakdown?.total || 0}</span>
        </div>
      </div>
    </div>
  )
}

const ItemsReviewTable = ({ title, items = [] }) => {
  if (!items.length) return null

  return (
    <div style={{ marginTop: "var(--spacing-4)" }}>
      <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--spacing-2)" }}>
        {title}
      </div>
      <div style={{ overflowX: "auto", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead style={{ backgroundColor: "var(--color-bg-secondary)" }}>
            <tr>
              {["Title", "Type", "Year", "Level", "Ref", "Points", "Proof"].map((heading) => (
                <th key={heading} style={{ textAlign: "left", padding: "10px 12px", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${title}-${index}`} style={{ borderTop: "1px solid var(--color-border-light)" }}>
                <td style={{ padding: "10px 12px", color: "var(--color-text-primary)" }}>{item.title}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-body)" }}>{item.scoreType}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-body)" }}>{item.year || "—"}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-body)" }}>{item.level || "—"}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-text-body)" }}>{item.referenceCode || "—"}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)" }}>{item.calculatedPoints || 0}</td>
                <td style={{ padding: "10px 12px" }}>
                  {item.proofs?.[0]?.url ? (
                    <a href={getMediaUrl(item.proofs[0].url)} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>
                      Open
                    </a>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ReviewModal = ({
  application,
  open,
  onClose,
  onDecision,
  deciding,
}) => {
  const [remarks, setRemarks] = useState("")

  useEffect(() => {
    if (open) {
      setRemarks(application?.review?.remarks || "")
    }
  }, [open, application])

  if (!open || !application) return null

  return (
    <Modal title={`Review ${application.studentName}`} onClose={onClose} width={1100} fullHeight={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--spacing-4)" }}>
          <div style={{ ...panelStyle }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
              <SummaryMetric icon={Users} label="Student" value={`${application.studentName} (${application.rollNumber})`} />
              <SummaryMetric icon={Trophy} label="Review Status" value={application.review?.status || "submitted"} />
              <SummaryMetric icon={Clock3} label="Calculated Score" value={application.calculatedTotal || 0} />
              <SummaryMetric icon={CheckCircle2} label="Final Score" value={application.finalScore || 0} />
            </div>
            <div style={{ marginTop: "var(--spacing-4)", padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }}>
              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--spacing-3)" }}>
                Personal / academic details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-3)", fontSize: "var(--font-size-sm)" }}>
                <div><strong>Programme:</strong> {application.personalAcademic?.programme || "—"}</div>
                <div><strong>Department:</strong> {application.personalAcademic?.department || application.department || "—"}</div>
                <div><strong>Mobile:</strong> {application.personalAcademic?.mobileNumber || "—"}</div>
                <div><strong>Hostel address:</strong> {application.personalAcademic?.hostelAddress || "—"}</div>
                <div><strong>Home address:</strong> {application.personalAcademic?.homeAddress || "—"}</div>
                <div><strong>Faculty advisor:</strong> {application.personalAcademic?.facultyAdvisorName || "—"} {application.personalAcademic?.facultyAdvisorPhone ? `(${application.personalAcademic.facultyAdvisorPhone})` : ""}</div>
                <div><strong>Project guide:</strong> {application.personalAcademic?.projectGuideName || "—"} {application.personalAcademic?.projectGuidePhone ? `(${application.personalAcademic.projectGuidePhone})` : ""}</div>
                <div><strong>Thesis guide:</strong> {application.personalAcademic?.thesisGuideName || "—"} {application.personalAcademic?.thesisGuidePhone ? `(${application.personalAcademic.thesisGuidePhone})` : ""}</div>
                <div><strong>Passing out student:</strong> {application.personalAcademic?.isPassingOutStudent ? "Yes" : "No"}</div>
                <div><strong>No disciplinary action:</strong> {application.personalAcademic?.hasNoDisciplinaryAction ? "Yes" : "No"}</div>
                <div><strong>No FR grade:</strong> {application.personalAcademic?.hasNoFrGrade ? "Yes" : "No"}</div>
                <div><strong>Declaration accepted:</strong> {application.personalAcademic?.declarationAccepted ? "Yes" : "No"}</div>
              </div>
              {(application.personalAcademic?.references || []).length ? (
                <div style={{ marginTop: "var(--spacing-4)" }}>
                  <div style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" }}>
                    Faculty / staff references
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                    {(application.personalAcademic.references || []).map((reference, index) => (
                      <div key={`reference-${index}`} style={{ padding: "var(--spacing-3)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-primary)", border: "1px solid var(--color-border-primary)" }}>
                        <strong>{reference.name || `Reference ${index + 1}`}</strong>
                        <div>{reference.designation || "—"}</div>
                        <div>{reference.department || "—"}</div>
                        <div>{reference.phoneNumber || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <ItemsReviewTable title="Project publications / patents" items={application.projectThesis?.publicationItems || []} />
            <ItemsReviewTable title="Technology transfer" items={application.projectThesis?.technologyTransferItems || []} />
            <ItemsReviewTable title="Responsibilities" items={application.responsibilityItems || []} />
            <ItemsReviewTable title="Awards" items={application.awardItems || []} />
            <ItemsReviewTable title="Cultural activities" items={application.culturalItems || []} />
            <ItemsReviewTable title="Science & Technology activities" items={application.scienceTechnologyItems || []} />
            <ItemsReviewTable title="Games & Sports activities" items={application.gamesSportsItems || []} />
            <ItemsReviewTable title="Co-curricular activities" items={application.coCurricularItems || []} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <ScoreBreakdownCard breakdown={application.scoreBreakdown} />
            <div style={panelStyle}>
              <label style={fieldLabelStyle}>Review remarks</label>
              <textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                style={textareaStyle}
                placeholder="Add review notes or rejection reason"
              />
              <div style={{ display: "flex", gap: "var(--spacing-2)", marginTop: "var(--spacing-4)" }}>
                <Button
                  onClick={() => onDecision("approved", remarks)}
                  loading={deciding}
                >
                  <CheckCircle2 size={16} /> Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => onDecision("rejected", remarks)}
                  loading={deciding}
                >
                  <XCircle size={16} /> Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const ScoredItemsEditor = ({
  title,
  subtitle,
  items,
  onChange,
  options,
  disabled = false,
  uploadLabel,
}) => {
  const updateItem = (index, field, value) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  const addItem = () => {
    onChange([...(items || []), createEmptyItem(options[0]?.value || "")])
  }

  const removeItem = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index))
  }

  const uploadProof = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    return uploadApi.uploadOverallBestPerformerProofPDF(formData)
  }

  return (
    <SectionPanel
      title={title}
      subtitle={subtitle}
      actions={!disabled ? <Button size="sm" variant="secondary" onClick={addItem}><Plus size={14} /> Add item</Button> : null}
    >
      {!items?.length ? (
        <div style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-muted)" }}>
          No entries added yet.
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {(items || []).map((item, index) => (
          <div key={`${title}-${index}`} style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", border: "1px solid var(--color-border-primary)", backgroundColor: "var(--color-bg-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-3)", marginBottom: "var(--spacing-3)" }}>
              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                Entry {index + 1}
              </div>
              {!disabled ? (
                <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              ) : null}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
              <div>
                <label style={fieldLabelStyle}>Title / achievement</label>
                <input value={item.title} disabled={disabled} onChange={(event) => updateItem(index, "title", event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Scoring type</label>
                <NativeSelect value={item.scoreType} disabled={disabled} onChange={(event) => updateItem(index, "scoreType", event.target.value)} options={options} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Year</label>
                <input value={item.year} disabled={disabled} onChange={(event) => updateItem(index, "year", event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Level</label>
                <input value={item.level} disabled={disabled} onChange={(event) => updateItem(index, "level", event.target.value)} placeholder="IL / NL / SL / UL / RL / AL" style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Event / competition</label>
                <input value={item.eventName} disabled={disabled} onChange={(event) => updateItem(index, "eventName", event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Performance / outcome</label>
                <input value={item.performance} disabled={disabled} onChange={(event) => updateItem(index, "performance", event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Participation type</label>
                <NativeSelect
                  value={item.participationType}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "participationType", event.target.value)}
                  options={[
                    { value: "individual", label: "Individual" },
                    { value: "team", label: "Team" },
                  ]}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>Reference code / enclosure</label>
                <input value={item.referenceCode} disabled={disabled} onChange={(event) => updateItem(index, "referenceCode", event.target.value)} placeholder="A1, R1, AA1, C1..." style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabelStyle}>Notes</label>
                <textarea value={item.notes} disabled={disabled} onChange={(event) => updateItem(index, "notes", event.target.value)} style={textareaStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <PdfUploadField
                  label={uploadLabel}
                  value={item.proofUrl}
                  onChange={(url) => updateItem(index, "proofUrl", url)}
                  onUpload={uploadProof}
                  disabled={disabled}
                  uploadedText="Proof uploaded"
                  viewerTitle={`${title} proof`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  )
}

const OverallBestPerformerPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdminView = user?.role === "Admin" || user?.role === "Super Admin"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectorData, setSelectorData] = useState(null)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState("")
  const [occurrenceDetail, setOccurrenceDetail] = useState(null)
  const [portalState, setPortalState] = useState(null)
  const [applicationForm, setApplicationForm] = useState(createInitialForm())
  const [savingApplication, setSavingApplication] = useState(false)
  const [savingOccurrence, setSavingOccurrence] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false)
  const [occurrenceModalMode, setOccurrenceModalMode] = useState("create")
  const [reviewApplication, setReviewApplication] = useState(null)
  const [occurrenceForm, setOccurrenceForm] = useState({
    title: "",
    awardYear: String(new Date().getFullYear()),
    applyEndAt: "",
    description: "",
    eligibleRows: [],
  })

  const scorePreview = useMemo(() => computeClientBreakdown(applicationForm), [applicationForm])
  const currentOccurrence = isAdminView ? occurrenceDetail?.occurrence : portalState?.data?.occurrence
  const currentApplication = portalState?.data?.application || null
  const canEditStudentForm = Boolean(portalState?.data?.canEdit)

  const updatePersonalAcademicField = (field, value) => {
    setApplicationForm((current) => ({
      ...current,
      personalAcademic: {
        ...current.personalAcademic,
        [field]: value,
      },
    }))
  }

  const updateReference = (index, field, value) => {
    setApplicationForm((current) => ({
      ...current,
      personalAcademic: {
        ...current.personalAcademic,
        references: (current.personalAcademic.references || []).map((reference, referenceIndex) =>
          referenceIndex === index ? { ...reference, [field]: value } : reference
        ),
      },
    }))
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
    const state = await overallBestPerformerApi.getStudentPortalState()
    setPortalState(state)
    setApplicationForm(createInitialForm(state?.data?.student, state?.data?.application))
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        if (isAdminView) {
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
  }, [isAdminView])

  useEffect(() => {
    if (isAdminView && selectorData?.activeOccurrenceId && !selectedOccurrenceId) {
      setSelectedOccurrenceId(String(selectorData.activeOccurrenceId))
    }
  }, [isAdminView, selectorData, selectedOccurrenceId])

  useEffect(() => {
    if (!isAdminView) return

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
  }, [isAdminView, selectedOccurrenceId])

  const resetOccurrenceForm = (mode = "create") => {
    if (mode === "edit" && occurrenceDetail?.occurrence) {
      setOccurrenceForm({
        title: occurrenceDetail.occurrence.title || "",
        awardYear: String(occurrenceDetail.occurrence.awardYear || new Date().getFullYear()),
        applyEndAt: formatDateTimeInput(occurrenceDetail.occurrence.applyEndAt),
        description: occurrenceDetail.occurrence.description || "",
        eligibleRows: [],
      })
      setOccurrenceModalMode("edit")
      return
    }

    setOccurrenceForm({
      title: "",
      awardYear: String(new Date().getFullYear()),
      applyEndAt: "",
      description: "",
      eligibleRows: [],
    })
    setOccurrenceModalMode("create")
  }

  const handleOccurrenceRowsParsed = (rows) => {
    setOccurrenceForm((current) => ({
      ...current,
      eligibleRows: rows,
    }))
  }

  const handleSaveOccurrence = async () => {
    const rollNumbers = [...new Set(
      (occurrenceForm.eligibleRows || [])
        .map((row) => String(row.rollNumber || "").trim().toUpperCase())
        .filter(Boolean)
    )]

    if (!occurrenceForm.title.trim()) {
      toast.error("Occurrence title is required")
      return
    }

    if (!occurrenceForm.applyEndAt) {
      toast.error("Application deadline is required")
      return
    }

    if (occurrenceModalMode === "create" && rollNumbers.length === 0) {
      toast.error("Upload eligible roll numbers before activating the occurrence")
      return
    }

    try {
      setSavingOccurrence(true)
      const payload = {
        title: occurrenceForm.title.trim(),
        awardYear: Number(occurrenceForm.awardYear || new Date().getFullYear()),
        applyEndAt: new Date(occurrenceForm.applyEndAt).toISOString(),
        description: occurrenceForm.description.trim(),
        ...(rollNumbers.length > 0 ? { eligibleRollNumbers: rollNumbers } : {}),
      }

      if (occurrenceModalMode === "edit" && occurrenceDetail?.occurrence?.id) {
        await overallBestPerformerApi.updateOccurrence(occurrenceDetail.occurrence.id, payload)
        toast.success("Occurrence updated")
      } else {
        await overallBestPerformerApi.createOccurrence(payload)
        toast.success("Occurrence activated")
      }

      setShowOccurrenceModal(false)
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
      toast.error("Please accept the declaration before submitting")
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

    const hasIncompleteReference = (applicationForm.personalAcademic.references || []).some(
      (reference) =>
        !reference.name.trim() ||
        !reference.designation.trim() ||
        !reference.department.trim() ||
        !reference.phoneNumber.trim()
    )

    if (hasIncompleteReference) {
      toast.error("Please provide all three faculty / staff references with complete details")
      return
    }

    try {
      setSavingApplication(true)
      const response = await overallBestPerformerApi.upsertApplication(
        portalState.data.occurrence.id,
        buildPayload(applicationForm)
      )
      toast.success(response?.message || "Application saved")
      await loadStudentData()
    } catch (err) {
      toast.error(err.message || "Failed to save application")
    } finally {
      setSavingApplication(false)
    }
  }

  const handleReviewDecision = async (decision, remarks) => {
    if (!reviewApplication?.id) return

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

  if (loading) {
    return <LoadingState message="Loading Overall Best Performer award..." />
  }

  if (error) {
    return <ErrorState title="Overall Best Performer unavailable" message={error} />
  }

  if (!isAdminView && !portalState?.data?.canAccessPortal) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <PageHeader title="Overall Best Performer" subtitle="Student portal" showDate={false} />
        <div style={{ padding: "var(--spacing-6)" }}>
          <EmptyState
            title="No accessible occurrence"
            description="There is no active Overall Best Performer occurrence for you right now."
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100%", backgroundColor: "var(--color-bg-page)" }}>
      <PageHeader
        title={isAdminView ? "Overall Best Performer" : "Overall Best Performer Award"}
        subtitle={isAdminView ? "Annual occurrence control, review, and leaderboard" : "Apply, upload proofs, and track your score"}
        showDate={false}
      >
        {isAdminView ? (
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
            <Button
              onClick={() => {
                resetOccurrenceForm("create")
                setShowOccurrenceModal(true)
              }}
            >
              <Plus size={16} /> Start occurrence
            </Button>
            {occurrenceDetail?.occurrence?.status === "active" ? (
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
          </>
        ) : (
          <div style={badgeStyle(currentOccurrence?.status === "active" ? "primary" : "default")}>
            <Trophy size={14} />
            {currentOccurrence?.status === "active" ? "Application open" : "Submitted occurrence"}
          </div>
        )}
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-6) var(--spacing-8)", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {currentOccurrence ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
              <SummaryMetric icon={CalendarDays} label="Award year" value={currentOccurrence.awardYear} />
              <SummaryMetric icon={Clock3} label="Deadline" value={new Date(currentOccurrence.applyEndAt).toLocaleString()} />
              <SummaryMetric icon={Users} label="Eligible students" value={currentOccurrence.eligibleStudentCount || 0} />
              <SummaryMetric icon={Trophy} label="Status" value={currentOccurrence.status} />
            </div>

            {currentOccurrence.description ? (
              <div style={{ ...panelStyle, backgroundColor: "var(--color-primary-bg)" }}>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>
                  {currentOccurrence.description}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {isAdminView ? (
          occurrenceDetail ? (
            <>
              <SectionPanel
                title="Occurrence overview"
                subtitle="Ranked by final score when reviewed, otherwise by calculated score"
              >
                {occurrenceDetail.leaderboard?.length ? (
                  <div style={{ overflowX: "auto", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)" }}>
                    <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}>
                      <thead style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                        <tr>
                          {["Rank", "Student", "Roll", "Calculated", "Final", "Status", "Updated", "Action"].map((heading) => (
                            <th key={heading} style={{ textAlign: "left", padding: "12px", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {occurrenceDetail.leaderboard.map((application, index) => (
                          <tr key={application.id} style={{ borderTop: "1px solid var(--color-border-light)" }}>
                            <td style={{ padding: "12px", color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)" }}>#{index + 1}</td>
                            <td style={{ padding: "12px", color: "var(--color-text-primary)" }}>{application.studentName}</td>
                            <td style={{ padding: "12px", color: "var(--color-text-body)" }}>{application.rollNumber}</td>
                            <td style={{ padding: "12px", color: "var(--color-text-body)" }}>{application.calculatedTotal}</td>
                            <td style={{ padding: "12px", color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)" }}>{application.finalScore}</td>
                            <td style={{ padding: "12px" }}>
                              <span style={badgeStyle(statusTone(application.review?.status))}>
                                {application.review?.status || "submitted"}
                              </span>
                            </td>
                            <td style={{ padding: "12px", color: "var(--color-text-body)" }}>
                              {application.updatedAt ? new Date(application.updatedAt).toLocaleString() : "—"}
                            </td>
                            <td style={{ padding: "12px" }}>
                              <Button size="sm" variant="secondary" onClick={() => setReviewApplication(application)}>
                                Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="No applications yet"
                    description="Students have not submitted applications for this occurrence."
                  />
                )}
              </SectionPanel>
            </>
          ) : (
            <EmptyState
              title="No occurrence selected"
              description="If there is no active occurrence, pick one from history. If you want to open a new annual round, start an occurrence from the header."
            />
          )
        ) : (
          <>
            <div style={{ ...panelStyle, backgroundColor: "var(--color-primary-bg)" }}>
              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)", marginBottom: "var(--spacing-1)" }}>
                Application rules
              </div>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                You can edit your application until the deadline. Eligibility follows the manual form: passing out student, minimum CGPA/CPI 6.50, no disciplinary action, and no FR grade counted in academics. Once the deadline passes, the application becomes read-only and remains visible only if you applied in that occurrence.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--spacing-4)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                <SectionPanel title="Applicant details" subtitle="Basic details are auto-filled from your student profile">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-3)" }}>
                    <div>
                      <label style={fieldLabelStyle}>Name</label>
                      <input value={portalState?.data?.student?.name || ""} readOnly style={{ ...inputStyle, backgroundColor: "var(--color-bg-secondary)" }} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Email</label>
                      <input value={portalState?.data?.student?.email || ""} readOnly style={{ ...inputStyle, backgroundColor: "var(--color-bg-secondary)" }} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Roll number</label>
                      <input value={portalState?.data?.student?.rollNumber || ""} readOnly style={{ ...inputStyle, backgroundColor: "var(--color-bg-secondary)" }} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Department</label>
                      <input value={portalState?.data?.student?.department || ""} readOnly style={{ ...inputStyle, backgroundColor: "var(--color-bg-secondary)" }} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Programme / degree</label>
                      <input value={applicationForm.personalAcademic.programme} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("programme", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Mobile number</label>
                      <input value={applicationForm.personalAcademic.mobileNumber} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("mobileNumber", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Hostel address</label>
                      <input value={applicationForm.personalAcademic.hostelAddress} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("hostelAddress", event.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={fieldLabelStyle}>Home address (for day scholar, if applicable)</label>
                      <input value={applicationForm.personalAcademic.homeAddress} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("homeAddress", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Faculty advisor name</label>
                      <input value={applicationForm.personalAcademic.facultyAdvisorName} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("facultyAdvisorName", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Faculty advisor phone</label>
                      <input value={applicationForm.personalAcademic.facultyAdvisorPhone} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("facultyAdvisorPhone", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Project guide name</label>
                      <input value={applicationForm.personalAcademic.projectGuideName} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("projectGuideName", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Project guide phone</label>
                      <input value={applicationForm.personalAcademic.projectGuidePhone} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("projectGuidePhone", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Thesis guide name</label>
                      <input value={applicationForm.personalAcademic.thesisGuideName} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("thesisGuideName", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Thesis guide phone</label>
                      <input value={applicationForm.personalAcademic.thesisGuidePhone} disabled={!canEditStudentForm} onChange={(event) => updatePersonalAcademicField("thesisGuidePhone", event.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Coursework evaluation mode</label>
                      <NativeSelect
                        value={applicationForm.coursework.evaluationMode}
                        disabled={!canEditStudentForm}
                        onChange={(event) => setApplicationForm((current) => ({ ...current, coursework: { ...current.coursework, evaluationMode: event.target.value } }))}
                        options={COURSEWORK_MODE_OPTIONS}
                      />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>CGPA / CPI value</label>
                      <Input
                        type="number"
                        value={applicationForm.coursework.scoreValue}
                        onChange={(event) => setApplicationForm((current) => ({ ...current, coursework: { ...current.coursework, scoreValue: event.target.value } }))}
                        disabled={!canEditStudentForm}
                      />
                      <div style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Minimum eligible value is 6.50.
                      </div>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={fieldLabelStyle}>Coursework notes</label>
                      <textarea value={applicationForm.coursework.notes} disabled={!canEditStudentForm} onChange={(event) => setApplicationForm((current) => ({ ...current, coursework: { ...current.coursework, notes: event.target.value } }))} style={textareaStyle} />
                    </div>
                  </div>
                  <div style={{ marginTop: "var(--spacing-4)", paddingTop: "var(--spacing-4)", borderTop: "1px solid var(--color-border-primary)" }}>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--spacing-1)" }}>
                      Faculty / staff references
                    </div>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-3)" }}>
                      Provide three references with their concurrence, as required in the manual form.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-3)" }}>
                      {(applicationForm.personalAcademic.references || []).map((reference, index) => (
                        <div key={`reference-form-${index}`} style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)" }}>
                          <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--spacing-3)" }}>
                            Reference {index + 1}
                          </div>
                          <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                            <div>
                              <label style={fieldLabelStyle}>Name</label>
                              <input value={reference.name} disabled={!canEditStudentForm} onChange={(event) => updateReference(index, "name", event.target.value)} style={inputStyle} />
                            </div>
                            <div>
                              <label style={fieldLabelStyle}>Designation</label>
                              <input value={reference.designation} disabled={!canEditStudentForm} onChange={(event) => updateReference(index, "designation", event.target.value)} style={inputStyle} />
                            </div>
                            <div>
                              <label style={fieldLabelStyle}>Department</label>
                              <input value={reference.department} disabled={!canEditStudentForm} onChange={(event) => updateReference(index, "department", event.target.value)} style={inputStyle} />
                            </div>
                            <div>
                              <label style={fieldLabelStyle}>Phone number</label>
                              <input value={reference.phoneNumber} disabled={!canEditStudentForm} onChange={(event) => updateReference(index, "phoneNumber", event.target.value)} style={inputStyle} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionPanel>

                <SectionPanel title="Project / thesis work" subtitle="Configure the B.Tech or PG/PhD track and attach proof documents where required">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                    <div>
                      <label style={fieldLabelStyle}>Track</label>
                      <NativeSelect
                        value={applicationForm.projectThesis.track}
                        disabled={!canEditStudentForm}
                        onChange={(event) => setApplicationForm((current) => ({ ...current, projectThesis: { ...current.projectThesis, track: event.target.value } }))}
                        options={PROJECT_TRACK_OPTIONS}
                      />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>BTP award level</label>
                      <NativeSelect
                        value={applicationForm.projectThesis.btpAwardLevel}
                        disabled={!canEditStudentForm || applicationForm.projectThesis.track === "pg_thesis"}
                        onChange={(event) => setApplicationForm((current) => ({ ...current, projectThesis: { ...current.projectThesis, btpAwardLevel: event.target.value } }))}
                        options={BTP_AWARD_OPTIONS}
                      />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Project grade</label>
                      <NativeSelect
                        value={applicationForm.projectThesis.projectGrade}
                        disabled={!canEditStudentForm || applicationForm.projectThesis.track === "pg_thesis"}
                        onChange={(event) => setApplicationForm((current) => ({ ...current, projectThesis: { ...current.projectThesis, projectGrade: event.target.value } }))}
                        options={PROJECT_GRADE_OPTIONS}
                      />
                    </div>
                  </div>
                </SectionPanel>

                <ScoredItemsEditor
                  title="Project publications / patents"
                  subtitle={`Use the publication or patent type that matches the scoring table. ${LEVEL_CODE_HINT}`}
                  items={applicationForm.projectThesis.publicationItems}
                  onChange={(items) => setApplicationForm((current) => ({ ...current, projectThesis: { ...current.projectThesis, publicationItems: items } }))}
                  options={PUBLICATION_OPTIONS}
                  disabled={!canEditStudentForm}
                  uploadLabel="Publication / patent proof"
                />

                {applicationForm.projectThesis.track === "pg_thesis" ? (
                  <ScoredItemsEditor
                    title="Technology transfer"
                    subtitle={`Used only for PG / PhD thesis track. ${LEVEL_CODE_HINT}`}
                    items={applicationForm.projectThesis.technologyTransferItems}
                    onChange={(items) => setApplicationForm((current) => ({ ...current, projectThesis: { ...current.projectThesis, technologyTransferItems: items } }))}
                    options={TECH_TRANSFER_OPTIONS}
                    disabled={!canEditStudentForm}
                    uploadLabel="Technology transfer proof"
                  />
                ) : null}

                <ScoredItemsEditor
                  title="Position of responsibility"
                  subtitle={`Institute-level positions and organisation roles. ${LEVEL_CODE_HINT}`}
                  items={applicationForm.responsibilityItems}
                  onChange={(items) => setApplicationForm((current) => ({ ...current, responsibilityItems: items }))}
                  options={RESPONSIBILITY_OPTIONS}
                  disabled={!canEditStudentForm}
                  uploadLabel="Responsibility proof"
                />

                <ScoredItemsEditor
                  title="Awards and extracurricular"
                  subtitle={`National / international awards, incubation, entrepreneurship, and similar achievements. ${LEVEL_CODE_HINT}`}
                  items={applicationForm.awardItems}
                  onChange={(items) => setApplicationForm((current) => ({ ...current, awardItems: items }))}
                  options={AWARD_OPTIONS}
                  disabled={!canEditStudentForm}
                  uploadLabel="Award proof"
                />

                <ScoredItemsEditor
                  title="Cultural activities"
                  subtitle={`Inter IIT / Intra IIT results and participation. ${LEVEL_CODE_HINT}`}
                  items={applicationForm.culturalItems}
                  onChange={(items) => setApplicationForm((current) => ({ ...current, culturalItems: items }))}
                  options={ACTIVITY_LEVEL_OPTIONS}
                  disabled={!canEditStudentForm}
                  uploadLabel="Cultural proof"
                />

                <ScoredItemsEditor
                  title="Science and Technology activities"
                  subtitle={`Use the same result scale as cultural activities. ${LEVEL_CODE_HINT}`}
                  items={applicationForm.scienceTechnologyItems}
                  onChange={(items) => setApplicationForm((current) => ({ ...current, scienceTechnologyItems: items }))}
                  options={ACTIVITY_LEVEL_OPTIONS}
                  disabled={!canEditStudentForm}
                  uploadLabel="Science & Technology proof"
                />

                <ScoredItemsEditor
                  title="Games and Sports"
                  subtitle={`Use the same result scale as cultural activities. ${LEVEL_CODE_HINT}`}
                  items={applicationForm.gamesSportsItems}
                  onChange={(items) => setApplicationForm((current) => ({ ...current, gamesSportsItems: items }))}
                  options={ACTIVITY_LEVEL_OPTIONS}
                  disabled={!canEditStudentForm}
                  uploadLabel="Sports proof"
                />

                <ScoredItemsEditor
                  title="Co-curricular / extra-curricular"
                  subtitle={`Competitive exams, workshops, and social service. ${LEVEL_CODE_HINT}`}
                  items={applicationForm.coCurricularItems}
                  onChange={(items) => setApplicationForm((current) => ({ ...current, coCurricularItems: items }))}
                  options={CO_CURRICULAR_OPTIONS}
                  disabled={!canEditStudentForm}
                  uploadLabel="Co-curricular proof"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                <ScoreBreakdownCard breakdown={scorePreview} />
                <div style={panelStyle}>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--spacing-2)" }}>
                    Application status
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", color: "var(--color-text-body)" }}>
                    <div>
                      <span style={badgeStyle(statusTone(currentOccurrence?.status))}>{currentOccurrence?.status || "inactive"}</span>
                    </div>
                    {currentApplication ? (
                      <span>
                        Review status: <strong>{currentApplication.review?.status || "submitted"}</strong>
                      </span>
                    ) : (
                      <span>No saved application yet.</span>
                    )}
                    {currentApplication?.review?.status === "rejected" && currentApplication.review?.remarks ? (
                      <div style={{ marginTop: "var(--spacing-2)", padding: "var(--spacing-3)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger-text)" }}>
                        {currentApplication.review.remarks}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={panelStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", color: "var(--color-text-body)" }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-2)" }}>
                      <input
                        type="checkbox"
                        checked={applicationForm.personalAcademic.isPassingOutStudent}
                        disabled={!canEditStudentForm}
                        onChange={(event) => updatePersonalAcademicField("isPassingOutStudent", event.target.checked)}
                      />
                      <span>I confirm that I am a passing out student and eligible to apply for this award.</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-2)" }}>
                      <input
                        type="checkbox"
                        checked={applicationForm.personalAcademic.hasNoDisciplinaryAction}
                        disabled={!canEditStudentForm}
                        onChange={(event) => updatePersonalAcademicField("hasNoDisciplinaryAction", event.target.checked)}
                      />
                      <span>I confirm that I have not been subjected to any disciplinary action.</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-2)" }}>
                      <input
                        type="checkbox"
                        checked={applicationForm.personalAcademic.hasNoFrGrade}
                        disabled={!canEditStudentForm}
                        onChange={(event) => updatePersonalAcademicField("hasNoFrGrade", event.target.checked)}
                      />
                      <span>I confirm that no FR grade is accounted in my academics for this application.</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-2)" }}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.declarationAccepted}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("declarationAccepted", event.target.checked)}
                    />
                    <span>
                        I confirm that the information and supporting proofs submitted here are factual, correspond to my performance during my study period at IIT Indore, and I accept the award committee decision as final and binding.
                    </span>
                    </label>
                  </div>
                  <div style={{ marginTop: "var(--spacing-4)" }}>
                    <Button onClick={handleSaveStudentApplication} loading={savingApplication} disabled={!canEditStudentForm}>
                      <Save size={16} /> Save application
                    </Button>
                  </div>
                  {!canEditStudentForm ? (
                    <div style={{ marginTop: "var(--spacing-3)", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                      This application is read-only because the deadline has passed or the submission has already been reviewed.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showOccurrenceModal ? (
        <Modal
          title={occurrenceModalMode === "edit" ? "Edit active occurrence" : "Start Overall Best Performer occurrence"}
          onClose={() => setShowOccurrenceModal(false)}
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
                <label style={fieldLabelStyle}>Application end date</label>
                <input type="datetime-local" value={occurrenceForm.applyEndAt} onChange={(event) => setOccurrenceForm((current) => ({ ...current, applyEndAt: event.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "end", color: "var(--color-text-muted)" }}>
                {(occurrenceForm.eligibleRows || []).length ? `${occurrenceForm.eligibleRows.length} CSV rows loaded` : "CSV upload required when activating a new occurrence"}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabelStyle}>Description / instructions</label>
                <textarea value={occurrenceForm.description} onChange={(event) => setOccurrenceForm((current) => ({ ...current, description: event.target.value }))} style={textareaStyle} />
              </div>
            </div>

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

            <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setShowOccurrenceModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOccurrence} loading={savingOccurrence}>
                <Upload size={16} /> {occurrenceModalMode === "edit" ? "Save changes" : "Activate occurrence"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <ReviewModal
        application={reviewApplication}
        open={Boolean(reviewApplication)}
        onClose={() => setReviewApplication(null)}
        onDecision={handleReviewDecision}
        deciding={reviewing}
      />
    </div>
  )
}

export default OverallBestPerformerPage
