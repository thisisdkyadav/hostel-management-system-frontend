import { Activity, BookOpen, Compass, Cpu, Share2, Sparkles, Trophy, Upload, Users } from "lucide-react"
import { hasSelectedProof } from "./form"

export const BTP_AWARD_OPTIONS = [
  { value: "none", label: "No BTP award" },
  { value: "institute_best", label: "Institute Best BTP" },
  { value: "second", label: "Second Best BTP" },
  { value: "third", label: "Third Best BTP" },
  { value: "department_award_or_nomination", label: "Department award / nomination" },
]

export const PROJECT_GRADE_OPTIONS = [
  { value: "none", label: "No project grade" },
  { value: "AP", label: "AP" },
  { value: "AA", label: "AA" },
  { value: "AB", label: "AB" },
  { value: "BB", label: "BB" },
  { value: "OTHER", label: "Other" },
]

export const PUBLICATION_OPTIONS = [
  { value: "journal_first_author", label: "Journal first author" },
  { value: "journal_co_author", label: "Journal co-author" },
  { value: "patent_granted", label: "Patent granted" },
  { value: "patent_filed", label: "Patent filed" },
  { value: "patent_published", label: "Patent published" },
  { value: "conference_first_author", label: "Conference first author" },
  { value: "conference_co_author", label: "Conference co-author" },
]

export const TECH_TRANSFER_OPTIONS = [
  { value: "lead_role", label: "Technology transfer: lead role" },
  { value: "supporting_role", label: "Technology transfer: supporting role" },
]

export const RESPONSIBILITY_OPTIONS = [
  { value: "gymkhana_or_fluxus_coordinator_or_il_event_organiser", label: "Gymkhana / Fluxus coordinator / IL organiser" },
  { value: "club_head_or_placmgr_or_fluxus_head_or_senator", label: "Club head / PlacMgr / Fluxus head / Senator" },
  { value: "organiser_of_national_level_event", label: "Organiser of national-level event" },
  { value: "chair_of_scientific_body", label: "Chair of scientific body" },
  { value: "position_holder_in_scientific_body", label: "Position holder in scientific body" },
  { value: "organiser_or_avana_or_coordinator", label: "Organiser / Avana / coordinator" },
  { value: "team_member", label: "Team member" },
  { value: "participation", label: "Participation" },
]

export const AWARD_OPTIONS = [
  { value: "young_scientist_award", label: "Young Scientist Award" },
  { value: "incubator_generating_revenue", label: "Incubator generating revenue" },
  { value: "international_award", label: "International award" },
  { value: "incubated_startup", label: "Incubated startup" },
  { value: "national_award", label: "National award" },
]

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: "inter_iit_top_3", label: "Inter IIT top 3" },
  { value: "inter_iit_top_5", label: "Inter IIT top 5" },
  { value: "intra_iit_top_3", label: "Intra IIT top 3" },
  { value: "intra_iit_top_5", label: "Intra IIT top 5" },
  { value: "participation_inter_iit", label: "Participation in Inter IIT" },
  { value: "participation_intra_iit", label: "Participation in Intra IIT" },
]

export const CO_CURRICULAR_OPTIONS = [
  { value: "competitive_exam_topper", label: "Competitive exam topper" },
  { value: "competitive_exam_rank_2_5", label: "Competitive exam rank 2-5" },
  { value: "competitive_exam_rank_6_10", label: "Competitive exam rank 6-10" },
  { value: "competitive_exam_participation", label: "Competitive exam participation" },
  { value: "workshop", label: "Workshop" },
  { value: "social_service", label: "Social service" },
]

export const PROOF_SOURCE_OPTIONS = [
  { value: "upload", label: "Upload PDF" },
  { value: "por", label: "Use Verified POR" },
]

export const BTP_AWARD_POINTS = {
  none: 0,
  institute_best: 5,
  second: 4,
  third: 3,
  department_award_or_nomination: 2,
}

export const PROJECT_GRADE_POINTS = {
  none: 0,
  AP: 5,
  AA: 4,
  AB: 3,
  BB: 2,
  OTHER: 1,
}

export const PUBLICATION_POINTS = {
  journal_first_author: 4,
  journal_co_author: 2,
  patent_granted: 5,
  patent_filed: 2,
  patent_published: 3,
  conference_first_author: 2,
  conference_co_author: 1,
}

export const TECHNOLOGY_TRANSFER_POINTS = {
  lead_role: 4,
  supporting_role: 2,
}

export const RESPONSIBILITY_POINTS = {
  gymkhana_or_fluxus_coordinator_or_il_event_organiser: 5,
  club_head_or_placmgr_or_fluxus_head_or_senator: 4,
  organiser_of_national_level_event: 4,
  chair_of_scientific_body: 4,
  position_holder_in_scientific_body: 3,
  organiser_or_avana_or_coordinator: 3,
  team_member: 2,
  participation: 1,
}

export const AWARD_POINTS = {
  young_scientist_award: 7.5,
  incubator_generating_revenue: 5,
  international_award: 5,
  incubated_startup: 4,
  national_award: 3,
}

export const ACTIVITY_LEVEL_POINTS = {
  inter_iit_top_3: 5,
  inter_iit_top_5: 4,
  intra_iit_top_3: 3,
  intra_iit_top_5: 2,
  participation_inter_iit: 2,
  participation_intra_iit: 1,
}

export const CO_CURRICULAR_POINTS = {
  competitive_exam_topper: 4,
  competitive_exam_rank_2_5: 3,
  competitive_exam_rank_6_10: 2,
  competitive_exam_participation: 1,
  workshop: 2,
  social_service: 2,
}

export const SECTION_MAX_POINTS = {
  coursework: 15,
  projectThesis: 15,
  responsibilities: 15,
  awards: 15,
  cultural: 10,
  scienceTechnology: 10,
  gamesSports: 10,
  coCurricular: 10,
}

export const roundToTwo = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100

export const clampPoints = (value, max) => Math.max(0, Math.min(roundToTwo(value), max))

export const sumItemPoints = (items = [], pointsMap = {}, max = Number.POSITIVE_INFINITY) => {
  const total = (Array.isArray(items) ? items : []).reduce((sum, item) => {
    const hasMinimumData = String(item?.title || "").trim() && String(item?.scoreType || "").trim()
    if (!hasMinimumData) return sum
    return sum + Number(pointsMap[item.scoreType] || 0)
  }, 0)

  return clampPoints(total, max)
}

export const computeStudentScorePreview = (form = {}) => {
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

export const INTER_INTRA_ACTIVITY_MARKS = [
  "Inter IIT top 3 - 5",
  "Inter IIT top 5 - 4",
  "Intra IIT top 3 - 3",
  "Intra IIT top 5 - 2",
  "Participation Inter IIT - 2",
  "Participation Intra IIT - 1",
]

export const MARKING_SCHEME_ROWS = [
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

export const APPLICANT_STAGE_OPTIONS = [
  { value: "ug", label: "UG" },
  { value: "pg", label: "PG" },
]

export const getApplicantStage = (form = {}) =>
  form?.coursework?.evaluationMode === "ug_cgpa" && form?.projectThesis?.track === "btech_project"
    ? "ug"
    : "pg"

export const validateScoredItems = (items = [], sectionTitle = "section") => {
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

export const REVIEW_SECTION_META = {
  "Project publications / patents": {
    icon: BookOpen,
    accent: "var(--color-primary)",
    sectionKey: "publicationItems",
    options: PUBLICATION_OPTIONS,
    pointsMap: PUBLICATION_POINTS,
  },
  "Technology transfer": {
    icon: Share2,
    accent: "var(--color-info)",
    sectionKey: "technologyTransferItems",
    options: TECH_TRANSFER_OPTIONS,
    pointsMap: TECHNOLOGY_TRANSFER_POINTS,
  },
  "Responsibilities": {
    icon: Users,
    accent: "var(--color-primary)",
    sectionKey: "responsibilityItems",
    options: RESPONSIBILITY_OPTIONS,
    pointsMap: RESPONSIBILITY_POINTS,
  },
  "Awards": {
    icon: Trophy,
    accent: "var(--color-warning)",
    sectionKey: "awardItems",
    options: AWARD_OPTIONS,
    pointsMap: AWARD_POINTS,
  },
  "Cultural activities": {
    icon: Sparkles,
    accent: "var(--color-warning)",
    sectionKey: "culturalItems",
    options: ACTIVITY_LEVEL_OPTIONS,
    pointsMap: ACTIVITY_LEVEL_POINTS,
  },
  "Science & Technology activities": {
    icon: Cpu,
    accent: "var(--color-primary)",
    sectionKey: "scienceTechnologyItems",
    options: ACTIVITY_LEVEL_OPTIONS,
    pointsMap: ACTIVITY_LEVEL_POINTS,
  },
  "Games & Sports activities": {
    icon: Activity,
    accent: "var(--color-success)",
    sectionKey: "gamesSportsItems",
    options: ACTIVITY_LEVEL_OPTIONS,
    pointsMap: ACTIVITY_LEVEL_POINTS,
  },
  "Co-curricular activities": {
    icon: Compass,
    accent: "var(--color-info)",
    sectionKey: "coCurricularItems",
    options: CO_CURRICULAR_OPTIONS,
    pointsMap: CO_CURRICULAR_POINTS,
  },
}

export const SCORE_TYPE_LABELS = {
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

export const formatScoreTypeLabel = (scoreType) => {
  if (!scoreType) return "—"
  if (SCORE_TYPE_LABELS[scoreType]) {
    return SCORE_TYPE_LABELS[scoreType]
  }
  return scoreType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export const getApplicationItemsForReviewSection = (application, sectionKey) => {
  if (!application || !sectionKey) return []
  if (sectionKey === "publicationItems") return application.projectThesis?.publicationItems || []
  if (sectionKey === "technologyTransferItems") return application.projectThesis?.technologyTransferItems || []
  return application?.[sectionKey] || []
}

export const formatSignedPoints = (value) => {
  const numericValue = Number(value || 0)
  return `${numericValue > 0 ? "+" : ""}${numericValue}`
}
