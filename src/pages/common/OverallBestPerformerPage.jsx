import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal } from "czero/react"
import {
  FileText,
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
import { useAuth } from "@/contexts/AuthProvider"
import { overallBestPerformerApi, uploadApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

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
    proofUrl: application?.coursework?.proofs?.[0]?.url || "",
  },
  projectThesis: {
    track: application?.projectThesis?.track || "btech_project",
    btpAwardLevel: application?.projectThesis?.btpAwardLevel || "none",
    btpAwardTitle: application?.projectThesis?.btpAwardTitle || "",
    btpAwardNotes: application?.projectThesis?.btpAwardNotes || "",
    btpAwardProofUrl: application?.projectThesis?.btpAwardProofs?.[0]?.url || "",
    projectGrade: application?.projectThesis?.projectGrade || "none",
    projectGradeTitle: application?.projectThesis?.projectGradeTitle || "",
    projectGradeNotes: application?.projectThesis?.projectGradeNotes || "",
    projectGradeProofUrl: application?.projectThesis?.projectGradeProofs?.[0]?.url || "",
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
    proofs: buildProofs(form.coursework.proofUrl, "COURSEWORK"),
  },
  projectThesis: {
    track: form.projectThesis.track,
    btpAwardLevel: form.projectThesis.btpAwardLevel,
    btpAwardTitle: form.projectThesis.btpAwardTitle || "",
    btpAwardNotes: form.projectThesis.btpAwardNotes || "",
    btpAwardProofs:
      form.projectThesis.btpAwardLevel !== "none"
        ? buildProofs(form.projectThesis.btpAwardProofUrl, "BTP")
        : [],
    projectGrade: form.projectThesis.projectGrade,
    projectGradeTitle: form.projectThesis.projectGradeTitle || "",
    projectGradeNotes: form.projectThesis.projectGradeNotes || "",
    projectGradeProofs:
      form.projectThesis.projectGrade !== "none"
        ? buildProofs(form.projectThesis.projectGradeProofUrl, "GRADE")
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
    if (!String(item.proofUrl || "").trim()) {
      return `${sectionTitle}: supporting PDF is required for item ${index + 1}.`
    }
  }

  return ""
}

const uploadBestPerformerProof = async (file) => {
  const formData = new FormData()
  formData.append("file", file)
  return uploadApi.uploadOverallBestPerformerProofPDF(formData)
}

const MinimalScoredItemsEditor = ({
  step,
  title,
  subtitle,
  items,
  onChange,
  options,
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
              Add only the relevant achievements for this section. A supporting PDF is required for every item.
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
                <PdfUploadField
                  label={uploadLabel}
                  value={item.proofUrl}
                  onChange={(url) => updateItem(index, "proofUrl", url)}
                  onUpload={uploadBestPerformerProof}
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
  onValueChange,
  onTitleChange,
  onNotesChange,
  onProofChange,
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
            <PdfUploadField
              label="Supporting document"
              value={proofUrl}
              onChange={onProofChange}
              onUpload={uploadBestPerformerProof}
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
      </div>
      {actions}
    </div>
    <div style={panelBodyStyle}>{children}</div>
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
      <div
        style={{
          padding: "var(--spacing-3) var(--spacing-4)",
          borderBottom: "1px solid var(--color-border-primary)",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        <div style={{ ...sectionLabelStyle, marginBottom: "6px" }}>Application Insight</div>
        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
          Score Breakdown
        </div>
      </div>
      <div style={{ padding: "var(--spacing-3) var(--spacing-4)" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--color-border-light)" }}>
            <span style={{ color: "var(--color-text-body)" }}>{label}</span>
            <strong style={{ color: "var(--color-text-primary)" }}>{value}</strong>
          </div>
        ))}
        <div
          style={{
            ...infoBoxStyle,
            marginTop: "var(--spacing-3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>Total</span>
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
            <div style={panelBodyStyle}>
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
                  <div><strong>Coursework mode:</strong> {application.coursework?.evaluationMode || "—"}</div>
                  <div><strong>CGPA / CPI:</strong> {application.coursework?.scoreValue || "—"}</div>
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
                {application.coursework?.proofs?.[0]?.url ? (
                  <a
                    href={getMediaUrl(application.coursework.proofs[0].url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", marginTop: "var(--spacing-3)", color: "var(--color-primary)" }}
                  >
                    Open coursework proof
                  </a>
                ) : null}
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
              {application.projectThesis?.track === "btech_project" &&
              (application.projectThesis?.btpAwardLevel !== "none" || application.projectThesis?.projectGrade !== "none") ? (
                <div style={{ marginTop: "var(--spacing-4)", display: "grid", gap: "var(--spacing-3)" }}>
                  {application.projectThesis?.btpAwardLevel !== "none" ? (
                    <div style={{ padding: "var(--spacing-3)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)" }}>
                      <div style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" }}>
                        BTP award
                      </div>
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                        {BTP_AWARD_OPTIONS.find((option) => option.value === application.projectThesis?.btpAwardLevel)?.label || application.projectThesis?.btpAwardLevel}
                      </div>
                      <div style={{ marginTop: "6px", color: "var(--color-text-body)" }}>
                        {application.projectThesis?.btpAwardTitle || "—"}
                      </div>
                      {application.projectThesis?.btpAwardNotes ? (
                        <div style={{ marginTop: "6px", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                          {application.projectThesis.btpAwardNotes}
                        </div>
                      ) : null}
                      {application.projectThesis?.btpAwardProofs?.[0]?.url ? (
                        <a
                          href={getMediaUrl(application.projectThesis.btpAwardProofs[0].url)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: "inline-block", marginTop: "8px", color: "var(--color-primary)" }}
                        >
                          Open proof
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  {application.projectThesis?.projectGrade !== "none" ? (
                    <div style={{ padding: "var(--spacing-3)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)" }}>
                      <div style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" }}>
                        Project grade
                      </div>
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                        {PROJECT_GRADE_OPTIONS.find((option) => option.value === application.projectThesis?.projectGrade)?.label || application.projectThesis?.projectGrade}
                      </div>
                      <div style={{ marginTop: "6px", color: "var(--color-text-body)" }}>
                        {application.projectThesis?.projectGradeTitle || "—"}
                      </div>
                      {application.projectThesis?.projectGradeNotes ? (
                        <div style={{ marginTop: "6px", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                          {application.projectThesis.projectGradeNotes}
                        </div>
                      ) : null}
                      {application.projectThesis?.projectGradeProofs?.[0]?.url ? (
                        <a
                          href={getMediaUrl(application.projectThesis.projectGradeProofs[0].url)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: "inline-block", marginTop: "8px", color: "var(--color-primary)" }}
                        >
                          Open proof
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <ItemsReviewTable title="Project publications / patents" items={application.projectThesis?.publicationItems || []} />
              <ItemsReviewTable title="Technology transfer" items={application.projectThesis?.technologyTransferItems || []} />
              <ItemsReviewTable title="Responsibilities" items={application.responsibilityItems || []} />
              <ItemsReviewTable title="Awards" items={application.awardItems || []} />
              <ItemsReviewTable title="Cultural activities" items={application.culturalItems || []} />
              <ItemsReviewTable title="Science & Technology activities" items={application.scienceTechnologyItems || []} />
              <ItemsReviewTable title="Games & Sports activities" items={application.gamesSportsItems || []} />
              <ItemsReviewTable title="Co-curricular activities" items={application.coCurricularItems || []} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <ScoreBreakdownCard breakdown={application.scoreBreakdown} />
            <div style={panelStyle}>
              <div style={panelBodyStyle}>
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
      </div>
    </Modal>
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
  const [showMarkingSchemeModal, setShowMarkingSchemeModal] = useState(false)
  const [occurrenceModalMode, setOccurrenceModalMode] = useState("create")
  const [reviewApplication, setReviewApplication] = useState(null)
  const [occurrenceForm, setOccurrenceForm] = useState({
    title: "",
    awardYear: String(new Date().getFullYear()),
    applyEndAt: "",
    description: "",
    eligibleRows: [],
  })

  const currentOccurrence = isAdminView ? occurrenceDetail?.occurrence : portalState?.data?.occurrence
  const currentApplication = portalState?.data?.application || null
  const canEditStudentForm = Boolean(portalState?.data?.canEdit)
  const applicantStage = useMemo(() => getApplicantStage(applicationForm), [applicationForm])

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
                btpAwardProofUrl: "",
                projectGrade: "none",
                projectGradeTitle: "",
                projectGradeNotes: "",
                projectGradeProofUrl: "",
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

    if (!String(applicationForm.coursework.proofUrl || "").trim()) {
      toast.error("Academic transcript / coursework proof PDF is required.")
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
        !String(applicationForm.projectThesis.btpAwardProofUrl || "").trim()
      ) {
        toast.error("BTP award proof PDF is required when you add a BTP award entry.")
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
        !String(applicationForm.projectThesis.projectGradeProofUrl || "").trim()
      ) {
        toast.error("Project grade proof PDF is required when you add a project grade entry.")
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
                <div style={{ ...panelBodyStyle, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>
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
              <div style={{ ...panelBodyStyle, display: "grid", gap: "var(--spacing-3)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    Deadline: {currentOccurrence?.applyEndAt ? new Date(currentOccurrence.applyEndAt).toLocaleString() : "—"}
                  </span>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    Min CGPA/CPI: 6.50
                  </span>
                  <span style={buildMetaChipStyle({ backgroundColor: "var(--color-bg-primary)" })}>
                    Passing-out students only
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)", marginBottom: "var(--spacing-1)" }}>
                    Application rules
                  </div>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", lineHeight: 1.7 }}>
                    You can edit your application until the deadline. Eligibility follows the manual form: passing out student, minimum CGPA/CPI 6.50, no disciplinary action, and no FR grade counted in academics. Once the deadline passes, the application becomes read-only and remains visible only if you applied in that occurrence.
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
                      <PdfUploadField
                        label="Supporting document"
                        value={applicationForm.coursework.proofUrl}
                        onChange={(url) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, proofUrl: url },
                          }))
                        }
                        onUpload={uploadBestPerformerProof}
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
                        proofUrl={applicationForm.projectThesis.btpAwardProofUrl}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              btpAwardLevel: value,
                              ...(value === "none"
                                ? { btpAwardTitle: "", btpAwardNotes: "", btpAwardProofUrl: "" }
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
                        onProofChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, btpAwardProofUrl: value },
                          }))
                        }
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
                        proofUrl={applicationForm.projectThesis.projectGradeProofUrl}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              projectGrade: value,
                              ...(value === "none"
                                ? { projectGradeTitle: "", projectGradeNotes: "", projectGradeProofUrl: "" }
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
                        onProofChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, projectGradeProofUrl: value },
                          }))
                        }
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
                    subtitle="Add only the relevant publications or patents and attach the required supporting PDF."
                    items={applicationForm.projectThesis.publicationItems}
                    onChange={(items) =>
                      setApplicationForm((current) => ({
                        ...current,
                        projectThesis: { ...current.projectThesis, publicationItems: items },
                      }))
                    }
                    options={PUBLICATION_OPTIONS}
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
                subtitle="Choose the exact POR marking category, add the title, a short description, and upload the supporting PDF."
                items={applicationForm.responsibilityItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, responsibilityItems: items }))}
                options={RESPONSIBILITY_OPTIONS}
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
                      I confirm that the information and supporting proofs submitted here are factual, correspond to my performance during my study period at IIT Indore, and I accept the award committee decision as final and binding.
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
