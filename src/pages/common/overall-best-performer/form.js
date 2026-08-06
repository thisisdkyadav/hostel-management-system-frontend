import { buildLocalFormDraftKey } from "@/hooks/useLocalFormDraft"
import { resolvePrimaryProof } from "./documents"

export const createEmptyItem = (scoreType = "") => ({
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

export const createEmptyReference = () => ({
  name: "",
  designation: "",
  department: "",
  phoneNumber: "",
})

export const formatDateTimeInput = (value) => {
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

export const normalizeRollNumbers = (rollNumbers = []) =>
  [...new Set(
    (Array.isArray(rollNumbers) ? rollNumbers : [])
      .map((rollNumber) => String(rollNumber || "").trim().toUpperCase())
      .filter(Boolean)
  )]

export const buildEligibleStudentRows = (rollNumbers = [], studentRecords = []) => {
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

export const createOccurrenceFormState = (overrides = {}) => ({
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

export const buildProofStateFromProofs = (proofs = []) => {
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

export const hasSelectedProof = ({ proofSourceType = "upload", proofUrl = "", proofPorId = "" } = {}) =>
  proofSourceType === "por" ? Boolean(String(proofPorId || "").trim()) : Boolean(String(proofUrl || "").trim())

export const buildProofs = ({ proofSourceType = "upload", proofUrl = "", proofPorId = "" } = {}, referenceCode) => {
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

export const toFormItems = (items = []) =>
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

export const toFormReferences = (references = []) => {
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

export const createInitialForm = (student = {}, application = null) => ({
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

export const buildOverallBestPerformerDraftKey = (student = {}, occurrence = null) => {
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

export const sanitizeItemsForPayload = (items = []) =>
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

export const buildPayload = (form) => ({
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

export const getDefaultBestPerformerOccurrenceId = (selectorPayload = {}) =>
  selectorPayload?.defaultOccurrenceId || selectorPayload?.activeOccurrenceId || ""
