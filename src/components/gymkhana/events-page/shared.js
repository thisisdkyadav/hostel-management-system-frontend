export const DEFAULT_CATEGORY_DEFINITIONS = [
  { key: "academic", label: "Academic", isDefault: true },
  { key: "cultural", label: "Cultural", isDefault: true },
  { key: "sports", label: "Sports", isDefault: true },
  { key: "technical", label: "Technical", isDefault: true },
]

export const DEFAULT_CATEGORY_KEY = DEFAULT_CATEGORY_DEFINITIONS[0].key

const DEFAULT_CATEGORY_COLORS = {
  academic: "#475569",
  cultural: "#BE185D",
  sports: "#0D9488",
  technical: "#D97706",
}

const DEFAULT_CATEGORY_BADGE_BACKGROUNDS = {
  academic: "#F1F5F9",
  cultural: "#FFF1F2",
  sports: "#F0FDFA",
  technical: "#FFFBEB",
}

const CATEGORY_COLOR_PALETTE = ["#1D4ED8", "#B45309", "#0F766E", "#7C3AED", "#C2410C", "#15803D", "#BE123C", "#4338CA"]
const CATEGORY_BACKGROUND_PALETTE = ["#DBEAFE", "#FEF3C7", "#CCFBF1", "#EDE9FE", "#FFEDD5", "#DCFCE7", "#FFE4E6", "#E0E7FF"]

export const getDefaultCategoryDefinitions = () =>
  DEFAULT_CATEGORY_DEFINITIONS.map((definition) => ({ ...definition }))

export const normalizeCategoryKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")

const toCategoryLabel = (key = "") =>
  String(key || "")
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
    .trim() || "Category"

const getUniqueCategoryKey = (candidateKey, usedKeys) => {
  const normalizedCandidate = normalizeCategoryKey(candidateKey) || "category"
  if (!usedKeys.has(normalizedCandidate)) {
    return normalizedCandidate
  }

  let suffix = 2
  while (usedKeys.has(`${normalizedCandidate}_${suffix}`)) {
    suffix += 1
  }

  return `${normalizedCandidate}_${suffix}`
}

export const getCalendarCategoryDefinitions = (source = null) => {
  const explicitDefinitions = Array.isArray(source)
    ? source
    : Array.isArray(source?.categoryDefinitions)
      ? source.categoryDefinitions
      : []
  const events = Array.isArray(source?.events) ? source.events : []
  const budgetCapKeys = Object.keys(source?.budgetCaps || {})
  const definitions = []
  const definitionsByKey = new Map()

  const upsertDefinition = (rawDefinition, usedKeys) => {
    const rawKey = normalizeCategoryKey(rawDefinition?.key || rawDefinition?.label)
    if (!rawKey) return

    const isDefault = DEFAULT_CATEGORY_DEFINITIONS.some((definition) => definition.key === rawKey) || Boolean(rawDefinition?.isDefault)
    const key = definitionsByKey.has(rawKey) || isDefault ? rawKey : getUniqueCategoryKey(rawKey, usedKeys)
    usedKeys.add(key)
    const normalizedDefinition = {
      key,
      label: String(rawDefinition?.label || "").trim() || toCategoryLabel(key),
      isDefault,
    }

    if (definitionsByKey.has(key)) {
      definitionsByKey.set(key, {
        ...definitionsByKey.get(key),
        ...normalizedDefinition,
      })
      const index = definitions.findIndex((definition) => definition.key === key)
      if (index >= 0) {
        definitions[index] = definitionsByKey.get(key)
      }
      return
    }

    definitions.push(normalizedDefinition)
    definitionsByKey.set(key, normalizedDefinition)
  }

  const usedKeys = new Set()
  for (const definition of getDefaultCategoryDefinitions()) {
    upsertDefinition(definition, usedKeys)
  }
  for (const definition of explicitDefinitions) {
    upsertDefinition(definition, usedKeys)
  }

  for (const category of [...events.map((event) => event?.category), ...budgetCapKeys]) {
    const key = normalizeCategoryKey(category)
    if (!key || definitionsByKey.has(key)) continue
    const normalizedDefinition = {
      key,
      label: toCategoryLabel(key),
      isDefault: DEFAULT_CATEGORY_DEFINITIONS.some((definition) => definition.key === key),
    }
    definitions.push(normalizedDefinition)
    definitionsByKey.set(key, normalizedDefinition)
  }

  return definitions
}

export const getCategoryOptions = (source = null) =>
  getCalendarCategoryDefinitions(source).map((definition) => ({
    value: definition.key,
    label: definition.label,
  }))

export const getCategoryLabelsMap = (source = null) =>
  getCalendarCategoryDefinitions(source).reduce((labels, definition) => {
    labels[definition.key] = definition.label
    return labels
  }, {})

export const getCategoryOrder = (source = null) =>
  getCalendarCategoryDefinitions(source).map((definition) => definition.key)

const getCategoryPaletteIndex = (category = "") =>
  [...String(category || "")].reduce((hash, character) => hash + character.charCodeAt(0), 0) %
  CATEGORY_COLOR_PALETTE.length

export const getCategoryColor = (category) =>
  DEFAULT_CATEGORY_COLORS[category] || CATEGORY_COLOR_PALETTE[getCategoryPaletteIndex(category)]

export const getCategoryBadgeBackground = (category) =>
  DEFAULT_CATEGORY_BADGE_BACKGROUNDS[category] ||
  CATEGORY_BACKGROUND_PALETTE[getCategoryPaletteIndex(category)]

export const createCustomCategoryDefinition = (label = "", existingDefinitions = []) => {
  const usedKeys = new Set(
    getCalendarCategoryDefinitions(existingDefinitions).map((definition) => definition.key)
  )
  const key = getUniqueCategoryKey(label, usedKeys)
  return {
    key,
    label: String(label || "").trim() || toCategoryLabel(key),
    isDefault: false,
  }
}

export const buildCategoryDefinitionsPayload = (definitions = []) =>
  getCalendarCategoryDefinitions(definitions).map((definition) => ({
    key: definition.key,
    label: String(definition.label || "").trim(),
    isDefault: Boolean(definition.isDefault),
  }))

export const CALENDAR_WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const CALENDAR_DAY_TINT = {
  holiday: "var(--color-warning-bg)",
  saturday: "var(--color-primary-bg)",
  sunday: "var(--color-danger-bg-light)",
}
export const CALENDAR_DAY_BORDER = {
  holiday: "var(--color-warning)",
  saturday: "var(--color-primary)",
  sunday: "var(--color-danger-light)",
}
export const VALID_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/
export const CALENDAR_STATUS_TO_APPROVER = {
  pending_president: "President Gymkhana",
  pending_student_affairs: "Student Affairs",
  pending_joint_registrar: "Joint Registrar SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}
export const PROPOSAL_STATUS_TO_APPROVER = {
  pending: "Student Affairs",
  pending_president: "President Gymkhana",
  pending_student_affairs: "Student Affairs",
  pending_joint_registrar: "Joint Registrar SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}
export const POST_STUDENT_AFFAIRS_STAGE_OPTIONS = [
  "Joint Registrar SA",
  "Associate Dean SA",
  "Dean SA",
]

export const createEmptyNextApproverSelection = () =>
  POST_STUDENT_AFFAIRS_STAGE_OPTIONS.reduce((selection, stage) => {
    selection[stage] = ""
    return selection
  }, {})

export const buildNextApproversPayload = (selection = {}) =>
  POST_STUDENT_AFFAIRS_STAGE_OPTIONS.flatMap((stage) => {
    const userId = selection?.[stage]
    return userId ? [{ stage, userId }] : []
  })

export const getNextApproverSelectionCount = (selection = {}) =>
  buildNextApproversPayload(selection).length
export const PROGRAMME_TYPE_OPTIONS = [
  { value: "Workshop", label: "Workshop" },
  { value: "Conference", label: "Conference" },
  { value: "Outreach", label: "Outreach" },
  { value: "Cultural", label: "Cultural" },
  { value: "Technical", label: "Technical" },
  { value: "Sports", label: "Sports" },
  { value: "Other Event", label: "Other Event" },
]
export const PROGRAMME_MODE_OPTIONS = [
  { value: "Offline", label: "Offline" },
  { value: "Online", label: "Online" },
  { value: "Hybrid", label: "Hybrid" },
]
export const ORGANISING_UNIT_OPTIONS = [
  { value: "Department", label: "Department" },
  { value: "Centre", label: "Centre" },
  { value: "Office", label: "Office" },
  { value: "Student Body", label: "Student Body" },
]
export const REGISTRATION_CATEGORIES = [
  { key: "instituteStudents", label: "Institute Students" },
  { key: "instituteFacultyStaff", label: "Institute Faculty & Staff" },
  { key: "guestsInvitees", label: "Guests / Invitees" },
  { key: "externalParticipants", label: "External Participants" },
  { key: "industryProfessionals", label: "Industry / Professionals" },
]

export const getCategoryBadgeStyle = (category) => ({
  backgroundColor: getCategoryBadgeBackground(category),
  color: getCategoryColor(category),
  border: "1px solid transparent",
})

export const getEventStatusVariant = (status) => {
  switch (status) {
    case "proposal_approved":
    case "completed":
      return "success"
    case "proposal_submitted":
      return "info"
    case "proposal_pending":
    case "upcoming":
      return "warning"
    case "cancelled":
    case "rejected":
      return "danger"
    default:
      return "default"
  }
}

export const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDateKey = (value) => {
  const parsed = toDate(value)
  if (!parsed) return null
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const startOfDay = (dateValue) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

export const normalizeEvent = (event) => ({
  ...event,
  startDate: event.startDate || event.tentativeDate || null,
  endDate: event.endDate || event.tentativeDate || null,
})

export const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  const startA = toDate(aStart)
  const endA = toDate(aEnd)
  const startB = toDate(bStart)
  const endB = toDate(bEnd)
  if (!startA || !endA || !startB || !endB) return false
  return startA <= endB && startB <= endA
}

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "TBD"
  const start = new Date(startDate)
  const end = new Date(endDate)
  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return start.toLocaleDateString()
  }

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}

export const getBudgetSummary = (events = [], categoryDefinitions = []) => {
  const categoryOrder = getCategoryOrder({ categoryDefinitions, events })
  const byCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = 0
    return acc
  }, {})
  const counts = categoryOrder.reduce((acc, category) => {
    acc[category] = 0
    return acc
  }, {})

  let total = 0
  for (const event of events) {
    const budget = Number(event.estimatedBudget || 0)
    total += budget
    if (byCategory[event.category] !== undefined) {
      byCategory[event.category] += budget
      counts[event.category] += 1
    }
  }

  return { total, byCategory, counts }
}

export const createEmptyBudgetCaps = (categoryDefinitions = []) =>
  getCategoryOrder(categoryDefinitions).reduce((accumulator, category) => {
    accumulator[category] = ""
    return accumulator
  }, {})

export const toBudgetCapsForm = (budgetCaps = {}, categoryDefinitions = []) =>
  getCategoryOrder({ categoryDefinitions, budgetCaps }).reduce((accumulator, category) => {
    const rawValue = budgetCaps?.[category]
    accumulator[category] =
      rawValue === null || rawValue === undefined || rawValue === "" ? "" : String(rawValue)
    return accumulator
  }, {})

export const buildBudgetCapsPayload = (budgetCaps = {}, categoryDefinitions = []) =>
  getCategoryOrder({ categoryDefinitions, budgetCaps }).reduce((accumulator, category) => {
    const rawValue = budgetCaps?.[category]
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      accumulator[category] = null
      return accumulator
    }

    const parsedValue = Number(rawValue)
    accumulator[category] = Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null
    return accumulator
  }, {})

export const getConfiguredBudgetCapsTotal = (budgetCaps = {}, categoryDefinitions = []) => {
  const normalizedBudgetCaps = buildBudgetCapsPayload(budgetCaps, categoryDefinitions)
  return Object.values(normalizedBudgetCaps).reduce((sum, cap) => {
    if (cap === null || cap === undefined) return sum
    return sum + Number(cap || 0)
  }, 0)
}

export const validateCategoryBudgetCaps = (events = [], budgetCaps = {}, categoryDefinitions = []) => {
  const resolvedCategoryDefinitions = getCalendarCategoryDefinitions({
    categoryDefinitions,
    events,
    budgetCaps,
  })
  const normalizedBudgetCaps = buildBudgetCapsPayload(budgetCaps, resolvedCategoryDefinitions)
  const summary = getBudgetSummary(events, resolvedCategoryDefinitions)
  const categoryLabels = getCategoryLabelsMap(resolvedCategoryDefinitions)

  for (const category of getCategoryOrder(resolvedCategoryDefinitions)) {
    const cap = normalizedBudgetCaps[category]
    if (cap === null || cap === undefined) continue

    const total = Number(summary.byCategory[category] || 0)
    if (total > cap) {
      return {
        isValid: false,
        category,
        label: categoryLabels[category] || category,
        total,
        cap,
      }
    }
  }

  return {
    isValid: true,
    summary,
    budgetCaps: normalizedBudgetCaps,
  }
}

export const getDateConflicts = (events = []) => {
  const normalized = events.map(normalizeEvent)
  const conflicts = []

  for (let i = 0; i < normalized.length; i += 1) {
    for (let j = i + 1; j < normalized.length; j += 1) {
      if (
        rangesOverlap(
          normalized[i].startDate,
          normalized[i].endDate,
          normalized[j].startDate,
          normalized[j].endDate
        )
      ) {
        conflicts.push({
          eventA: normalized[i],
          eventB: normalized[j],
        })
      }
    }
  }

  return conflicts
}

export const normalizeEventId = (eventId) => {
  if (!eventId) return null
  if (typeof eventId === "string") {
    return VALID_OBJECT_ID_REGEX.test(eventId) ? eventId : null
  }
  if (typeof eventId === "object" && typeof eventId._id === "string") {
    return VALID_OBJECT_ID_REGEX.test(eventId._id) ? eventId._id : null
  }
  if (typeof eventId?.toString === "function") {
    const stringified = eventId.toString()
    if (
      stringified &&
      stringified !== "[object Object]" &&
      VALID_OBJECT_ID_REGEX.test(stringified)
    ) {
      return stringified
    }
  }
  return null
}

export const createDefaultOverlapState = () => ({
  status: "idle",
  hasOverlap: false,
  overlaps: [],
  checkedKey: null,
  checkingKey: null,
  errorMessage: "",
})

export const DEFAULT_EVENT_FORM = {
  title: "",
  category: DEFAULT_CATEGORY_KEY,
  startDate: "",
  endDate: "",
  estimatedBudget: "",
  description: "",
}

export const createDefaultEventForm = (categoryDefinitions = []) => ({
  ...DEFAULT_EVENT_FORM,
  category: getCategoryOrder(categoryDefinitions)[0] || DEFAULT_CATEGORY_KEY,
})

export const createDefaultRegistrationRow = () => ({
  registrationFee: "",
  accommodationCharges: "",
  remarks: "",
})

export const createDefaultProposalDetails = () => ({
  programmeTitle: "",
  organisingUnit: {
    unitType: "Student Body",
    coordinatorNames: "",
    contactEmail: "",
    contactMobile: "",
  },
  backgroundAndRationale: {
    contextRelevance: "",
    expectedImpact: "",
    alignmentWithObjectives: "",
  },
  objectives: {
    objective1: "",
    objective2: "",
    objective3: "",
  },
  programmeDetails: {
    programmeType: "Cultural",
    mode: "Offline",
    datesAndDuration: "",
    venue: "",
    expectedParticipants: "",
  },
  targetParticipants: {
    instituteFacultyStaffStudents: "",
    guestsInvitees: "",
    externalVisitorsParticipants: "",
  },
  guestsDetails: {
    tentativeNumberOfSpeakersGuests: "",
    guestsNamesDesignationAffiliations: "",
  },
  programmeSchedule: {
    brief: "",
    detailedScheduleAnnexureUrl: "",
  },
  sourceOfFunds: {
    registrationFee: "",
    gymkhanaFund: "",
    instituteSupport: "",
    sponsorshipGrant: "",
  },
  registrationDetails: {
    instituteStudents: createDefaultRegistrationRow(),
    instituteFacultyStaff: createDefaultRegistrationRow(),
    guestsInvitees: createDefaultRegistrationRow(),
    externalParticipants: createDefaultRegistrationRow(),
    industryProfessionals: createDefaultRegistrationRow(),
  },
  approvalRequested: {
    conductProgrammeAsProposed: true,
    chargingRegistrationFees: false,
    utilisationOfCollectedFees: false,
    additionalInstitutionalSupport: false,
    additionalInstitutionalSupportDetails: "",
  },
})

export const createDefaultProposalForm = () => ({
  proposalText: "",
  proposalDocumentUrl: "",
  externalGuestsDetails: "",
  chiefGuestDocumentUrl: "",
  proposalDetails: createDefaultProposalDetails(),
  accommodationRequired: false,
  hasRegistrationFee: false,
  registrationFeeAmount: "",
  totalExpectedIncome: "",
  totalExpenditure: "",
})

export const toFormNumberValue = (value) =>
  value === null || value === undefined || value === "" ? "" : String(value)

export const toNumericValue = (value) => Number(value || 0)

export const toProposalDetailsForm = (proposalDetails) => {
  const defaults = createDefaultProposalDetails()
  const details = proposalDetails || {}
  const getRegistrationRow = (key) => {
    const row = details?.registrationDetails?.[key] || {}
    return {
      ...defaults.registrationDetails[key],
      ...row,
      registrationFee: toFormNumberValue(row.registrationFee),
      accommodationCharges: toFormNumberValue(row.accommodationCharges),
    }
  }

  return {
    ...defaults,
    ...details,
    organisingUnit: {
      ...defaults.organisingUnit,
      ...(details.organisingUnit || {}),
    },
    backgroundAndRationale: {
      ...defaults.backgroundAndRationale,
      ...(details.backgroundAndRationale || {}),
    },
    objectives: {
      ...defaults.objectives,
      ...(details.objectives || {}),
    },
    programmeDetails: {
      ...defaults.programmeDetails,
      ...(details.programmeDetails || {}),
      expectedParticipants: toFormNumberValue(details?.programmeDetails?.expectedParticipants),
    },
    targetParticipants: {
      ...defaults.targetParticipants,
      ...(details.targetParticipants || {}),
    },
    guestsDetails: {
      ...defaults.guestsDetails,
      ...(details.guestsDetails || {}),
      tentativeNumberOfSpeakersGuests: toFormNumberValue(
        details?.guestsDetails?.tentativeNumberOfSpeakersGuests
      ),
    },
    programmeSchedule: {
      ...defaults.programmeSchedule,
      ...(details.programmeSchedule || {}),
    },
    sourceOfFunds: {
      ...defaults.sourceOfFunds,
      ...(details.sourceOfFunds || {}),
      registrationFee: toFormNumberValue(details?.sourceOfFunds?.registrationFee),
      gymkhanaFund: toFormNumberValue(details?.sourceOfFunds?.gymkhanaFund),
      instituteSupport: toFormNumberValue(details?.sourceOfFunds?.instituteSupport),
      sponsorshipGrant: toFormNumberValue(details?.sourceOfFunds?.sponsorshipGrant),
    },
    registrationDetails: {
      instituteStudents: getRegistrationRow("instituteStudents"),
      instituteFacultyStaff: getRegistrationRow("instituteFacultyStaff"),
      guestsInvitees: getRegistrationRow("guestsInvitees"),
      externalParticipants: getRegistrationRow("externalParticipants"),
      industryProfessionals: getRegistrationRow("industryProfessionals"),
    },
    approvalRequested: {
      ...defaults.approvalRequested,
      ...(details.approvalRequested || {}),
    },
  }
}

export const calculateTotalExpectedIncomeFromDetails = (proposalDetails = {}) => {
  const sourceOfFunds = proposalDetails?.sourceOfFunds || {}
  return (
    toNumericValue(sourceOfFunds.registrationFee) +
    toNumericValue(sourceOfFunds.gymkhanaFund) +
    toNumericValue(sourceOfFunds.instituteSupport) +
    toNumericValue(sourceOfFunds.sponsorshipGrant)
  )
}

export const generateExternalGuestsDetailsFromDetails = (proposalDetails = {}) =>
  [
    proposalDetails?.guestsDetails?.guestsNamesDesignationAffiliations,
    proposalDetails?.targetParticipants?.guestsInvitees,
    proposalDetails?.targetParticipants?.externalVisitorsParticipants,
  ]
    .filter((value) => String(value || "").trim())
    .join("\n\n")
    .trim()

export const generateProposalTextFromDetails = (proposalDetails = {}) => {
  const lines = [
    `Title: ${proposalDetails?.programmeTitle || ""}`.trim(),
    `Organising Unit: ${proposalDetails?.organisingUnit?.unitType || ""}`.trim(),
    `Coordinators: ${proposalDetails?.organisingUnit?.coordinatorNames || ""}`.trim(),
    `Programme Type: ${proposalDetails?.programmeDetails?.programmeType || ""}`.trim(),
    `Mode: ${proposalDetails?.programmeDetails?.mode || ""}`.trim(),
    `Dates & Duration: ${proposalDetails?.programmeDetails?.datesAndDuration || ""}`.trim(),
    `Venue: ${proposalDetails?.programmeDetails?.venue || ""}`.trim(),
    `Background: ${proposalDetails?.backgroundAndRationale?.contextRelevance || ""}`.trim(),
    `Expected Impact: ${proposalDetails?.backgroundAndRationale?.expectedImpact || ""}`.trim(),
    `Objective 1: ${proposalDetails?.objectives?.objective1 || ""}`.trim(),
    `Schedule Brief: ${proposalDetails?.programmeSchedule?.brief || ""}`.trim(),
  ].filter((value) => !value.endsWith(":"))

  return lines.join("\n")
}

export const hasRequiredDetailedProposalFields = (proposalDetails = {}) => {
  const details = proposalDetails || {}
  const contactEmail = String(details?.organisingUnit?.contactEmail || "").trim()
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)

  return Boolean(
    String(details?.programmeTitle || "").trim() &&
      String(details?.organisingUnit?.unitType || "").trim() &&
      String(details?.organisingUnit?.coordinatorNames || "").trim() &&
      emailLooksValid &&
      String(details?.organisingUnit?.contactMobile || "").trim() &&
      String(details?.backgroundAndRationale?.contextRelevance || "").trim() &&
      String(details?.backgroundAndRationale?.expectedImpact || "").trim() &&
      String(details?.backgroundAndRationale?.alignmentWithObjectives || "").trim() &&
      String(details?.objectives?.objective1 || "").trim() &&
      String(details?.programmeDetails?.programmeType || "").trim() &&
      String(details?.programmeDetails?.mode || "").trim() &&
      String(details?.programmeDetails?.datesAndDuration || "").trim() &&
      String(details?.programmeDetails?.venue || "").trim() &&
      String(details?.programmeDetails?.expectedParticipants || "").trim() &&
      String(details?.programmeSchedule?.brief || "").trim()
  )
}

export const buildProposalDetailsPayload = (proposalDetails = {}) => {
  const details = proposalDetails || {}
  const getRowPayload = (key) => ({
    registrationFee: toNumericValue(details?.registrationDetails?.[key]?.registrationFee),
    accommodationCharges: toNumericValue(details?.registrationDetails?.[key]?.accommodationCharges),
    remarks: String(details?.registrationDetails?.[key]?.remarks || "").trim(),
  })

  return {
    programmeTitle: String(details?.programmeTitle || "").trim(),
    organisingUnit: {
      unitType: String(details?.organisingUnit?.unitType || "").trim(),
      coordinatorNames: String(details?.organisingUnit?.coordinatorNames || "").trim(),
      contactEmail: String(details?.organisingUnit?.contactEmail || "").trim(),
      contactMobile: String(details?.organisingUnit?.contactMobile || "").trim(),
    },
    backgroundAndRationale: {
      contextRelevance: String(details?.backgroundAndRationale?.contextRelevance || "").trim(),
      expectedImpact: String(details?.backgroundAndRationale?.expectedImpact || "").trim(),
      alignmentWithObjectives: String(details?.backgroundAndRationale?.alignmentWithObjectives || "").trim(),
    },
    objectives: {
      objective1: String(details?.objectives?.objective1 || "").trim(),
      objective2: String(details?.objectives?.objective2 || "").trim(),
      objective3: String(details?.objectives?.objective3 || "").trim(),
    },
    programmeDetails: {
      programmeType: String(details?.programmeDetails?.programmeType || "").trim(),
      mode: String(details?.programmeDetails?.mode || "").trim(),
      datesAndDuration: String(details?.programmeDetails?.datesAndDuration || "").trim(),
      venue: String(details?.programmeDetails?.venue || "").trim(),
      expectedParticipants: toNumericValue(details?.programmeDetails?.expectedParticipants),
    },
    targetParticipants: {
      instituteFacultyStaffStudents: String(
        details?.targetParticipants?.instituteFacultyStaffStudents || ""
      ).trim(),
      guestsInvitees: String(details?.targetParticipants?.guestsInvitees || "").trim(),
      externalVisitorsParticipants: String(
        details?.targetParticipants?.externalVisitorsParticipants || ""
      ).trim(),
    },
    guestsDetails: {
      tentativeNumberOfSpeakersGuests: toNumericValue(
        details?.guestsDetails?.tentativeNumberOfSpeakersGuests
      ),
      guestsNamesDesignationAffiliations: String(
        details?.guestsDetails?.guestsNamesDesignationAffiliations || ""
      ).trim(),
    },
    programmeSchedule: {
      brief: String(details?.programmeSchedule?.brief || "").trim(),
      detailedScheduleAnnexureUrl: String(
        details?.programmeSchedule?.detailedScheduleAnnexureUrl || ""
      ).trim(),
    },
    sourceOfFunds: {
      registrationFee: toNumericValue(details?.sourceOfFunds?.registrationFee),
      gymkhanaFund: toNumericValue(details?.sourceOfFunds?.gymkhanaFund),
      instituteSupport: toNumericValue(details?.sourceOfFunds?.instituteSupport),
      sponsorshipGrant: toNumericValue(details?.sourceOfFunds?.sponsorshipGrant),
    },
    registrationDetails: {
      instituteStudents: getRowPayload("instituteStudents"),
      instituteFacultyStaff: getRowPayload("instituteFacultyStaff"),
      guestsInvitees: getRowPayload("guestsInvitees"),
      externalParticipants: getRowPayload("externalParticipants"),
      industryProfessionals: getRowPayload("industryProfessionals"),
    },
    approvalRequested: {
      conductProgrammeAsProposed: Boolean(details?.approvalRequested?.conductProgrammeAsProposed),
      chargingRegistrationFees: Boolean(details?.approvalRequested?.chargingRegistrationFees),
      utilisationOfCollectedFees: Boolean(details?.approvalRequested?.utilisationOfCollectedFees),
      additionalInstitutionalSupport: Boolean(
        details?.approvalRequested?.additionalInstitutionalSupport
      ),
      additionalInstitutionalSupportDetails: String(
        details?.approvalRequested?.additionalInstitutionalSupportDetails || ""
      ).trim(),
    },
  }
}

export const setNestedValue = (source, path, value) => {
  if (!Array.isArray(path) || path.length === 0) return source
  const [head, ...rest] = path
  if (rest.length === 0) {
    return {
      ...(source || {}),
      [head]: value,
    }
  }
  return {
    ...(source || {}),
    [head]: setNestedValue(source?.[head] || {}, rest, value),
  }
}

export const createEmptyBill = () => ({
  localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  description: "",
  amount: "",
  billNumber: "",
  billDate: "",
  vendor: "",
  documentUrl: "",
  documentName: "",
})

export const createDefaultExpenseForm = () => ({
  bills: [createEmptyBill()],
  eventReportDocumentUrl: "",
  notes: "",
})

export const toProposalForm = (proposal) => ({
  proposalText: proposal?.proposalText || "",
  proposalDocumentUrl: proposal?.proposalDocumentUrl || "",
  externalGuestsDetails: proposal?.externalGuestsDetails || "",
  chiefGuestDocumentUrl: proposal?.chiefGuestDocumentUrl || "",
  proposalDetails: toProposalDetailsForm(proposal?.proposalDetails),
  accommodationRequired: Boolean(proposal?.accommodationRequired),
  hasRegistrationFee: Boolean(proposal?.hasRegistrationFee),
  registrationFeeAmount:
    proposal?.registrationFeeAmount === null || proposal?.registrationFeeAmount === undefined
      ? ""
      : String(proposal.registrationFeeAmount),
  totalExpectedIncome:
    proposal?.totalExpectedIncome === null || proposal?.totalExpectedIncome === undefined
      ? ""
      : String(proposal.totalExpectedIncome),
  totalExpenditure:
    proposal?.totalExpenditure === null || proposal?.totalExpenditure === undefined
      ? ""
      : String(proposal.totalExpenditure),
})

export const buildProposalPayload = (proposalForm) => {
  const detailsPayload = buildProposalDetailsPayload(proposalForm.proposalDetails)
  const registrationFeeAmount = toNumericValue(detailsPayload?.sourceOfFunds?.registrationFee)
  const totalExpectedIncome = calculateTotalExpectedIncomeFromDetails(proposalForm.proposalDetails)
  const generatedText = generateProposalTextFromDetails(proposalForm.proposalDetails)
  const generatedExternalGuests = generateExternalGuestsDetailsFromDetails(proposalForm.proposalDetails)

  return {
    proposalText: generatedText || proposalForm.proposalText?.trim() || "Detailed proposal submitted",
    proposalDocumentUrl: proposalForm.proposalDocumentUrl?.trim() || "",
    externalGuestsDetails: generatedExternalGuests || proposalForm.externalGuestsDetails?.trim() || "",
    chiefGuestDocumentUrl: proposalForm.chiefGuestDocumentUrl?.trim() || "",
    proposalDetails: detailsPayload,
    accommodationRequired: Boolean(proposalForm.accommodationRequired),
    hasRegistrationFee: registrationFeeAmount > 0 ? true : Boolean(proposalForm.hasRegistrationFee),
    registrationFeeAmount:
      registrationFeeAmount > 0
        ? registrationFeeAmount
        : proposalForm.hasRegistrationFee
          ? Number(proposalForm.registrationFeeAmount || 0)
          : 0,
    totalExpectedIncome: totalExpectedIncome || Number(proposalForm.totalExpectedIncome || 0),
    totalExpenditure: Number(proposalForm.totalExpenditure || 0),
  }
}

export const toDateInputValue = (value) => {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().split("T")[0]
}

export const getFilenameFromUrl = (url = "") => {
  if (!url || typeof url !== "string") return "bill.pdf"
  const cleanedUrl = url.split("?")[0]
  const parts = cleanedUrl.split("/")
  const candidate = parts[parts.length - 1]
  return candidate || "bill.pdf"
}

export const toExpenseForm = (expense) => ({
  bills:
    Array.isArray(expense?.bills) && expense.bills.length > 0
      ? expense.bills.map((bill) => ({
          localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          description: bill?.description || "",
          amount: bill?.amount === null || bill?.amount === undefined ? "" : String(bill.amount),
          billNumber: bill?.billNumber || "",
          billDate: toDateInputValue(bill?.billDate),
          vendor: bill?.vendor || "",
          documentUrl: bill?.attachments?.[0]?.url || "",
          documentName: bill?.attachments?.[0]?.filename || "",
        }))
      : [createEmptyBill()],
  eventReportDocumentUrl: expense?.eventReportDocumentUrl || "",
  notes: expense?.notes || "",
})

export const buildExpensePayload = (expenseForm) => ({
  bills: (expenseForm.bills || []).map((bill, index) => {
    const filename = bill.documentName?.trim() || getFilenameFromUrl(bill.documentUrl)
    return {
      description: bill.description?.trim() || `Bill ${index + 1}`,
      amount: Number(bill.amount || 0),
      billNumber: bill.billNumber?.trim() || "",
      billDate: bill.billDate || undefined,
      vendor: bill.vendor?.trim() || "",
      attachments: [
        {
          filename,
          url: bill.documentUrl?.trim() || "",
        },
      ],
    }
  }),
  eventReportDocumentUrl: expenseForm.eventReportDocumentUrl?.trim() || "",
  notes: expenseForm.notes?.trim() || "",
})

export const isProposalWindowOpen = (event) => {
  if (event?.proposalSubmitted) return false
  const dueDate = getProposalDueDate(event)
  if (!dueDate) return false
  const dueDateStart = startOfDay(dueDate)
  const todayStart = startOfDay(new Date())
  if (!dueDateStart || !todayStart) return false
  return dueDateStart <= todayStart
}

export const getProposalDueDate = (event) => {
  const candidateDueDate = event?.proposalDueDate || event?.eventId?.proposalDueDate
  if (candidateDueDate) {
    const parsed = new Date(candidateDueDate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  const startDateCandidate =
    event?.startDate ||
    event?.scheduledStartDate ||
    event?.eventId?.scheduledStartDate
  const startDate = new Date(startDateCandidate)
  if (Number.isNaN(startDate.getTime())) {
    return null
  }

  const fallbackDueDate = new Date(startDate)
  fallbackDueDate.setDate(fallbackDueDate.getDate() - 21)
  return fallbackDueDate
}

export const mergeCalendarEventsWithGymkhanaEvents = (calendarEvents = [], gymkhanaEvents = []) => {
  const normalizeKeyDate = (value) => {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10)
  }

  const buckets = new Map()

  for (const event of gymkhanaEvents) {
    const key = [
      event.title || "",
      event.category || "",
      normalizeKeyDate(event.scheduledStartDate),
      normalizeKeyDate(event.scheduledEndDate),
    ].join("|")

    if (!buckets.has(key)) {
      buckets.set(key, [])
    }
    buckets.get(key).push(event)
  }

  return calendarEvents.map((calendarEvent) => {
    const key = [
      calendarEvent.title || "",
      calendarEvent.category || "",
      normalizeKeyDate(calendarEvent.startDate),
      normalizeKeyDate(calendarEvent.endDate),
    ].join("|")
    const matchBucket = buckets.get(key) || []
    const linkedEvent = matchBucket.length > 0 ? matchBucket.shift() : null

    return {
      ...calendarEvent,
      gymkhanaEventId: linkedEvent?._id || null,
      proposalSubmitted: Boolean(linkedEvent?.proposalSubmitted),
      proposalId: linkedEvent?.proposalId || null,
      proposalDueDate: getProposalDueDate(linkedEvent || calendarEvent),
      eventStatus: linkedEvent?.status || null,
    }
  })
}

export const toGymkhanaDisplayEvent = (event) => ({
  ...event,
  startDate: event.scheduledStartDate || null,
  endDate: event.scheduledEndDate || null,
  gymkhanaEventId: event._id || null,
  proposalSubmitted: Boolean(event.proposalSubmitted),
  proposalId: event.proposalId || null,
  proposalDueDate: getProposalDueDate(event),
  eventStatus: event.status || null,
})

export const toFormModel = (event) => {
  const normalized = normalizeEvent(event)
  return {
    title: normalized.title || "",
    category: normalized.category || DEFAULT_CATEGORY_KEY,
    startDate: normalized.startDate ? String(normalized.startDate).split("T")[0] : "",
    endDate: normalized.endDate ? String(normalized.endDate).split("T")[0] : "",
    estimatedBudget:
      normalized.estimatedBudget === null || normalized.estimatedBudget === undefined
        ? ""
        : String(normalized.estimatedBudget),
    description: normalized.description || "",
  }
}

export const buildAvailableYearsForCreation = (years = []) => {
  const existingYears = new Set(years.map((year) => year.academicYear))
  let latestYear = new Date().getFullYear()
  if (years.length > 0) {
    const parsedYears = years
      .map((year) => parseInt(year.academicYear?.split("-")[0], 10))
      .filter((year) => Number.isFinite(year))
    if (parsedYears.length > 0) {
      latestYear = Math.max(...parsedYears)
    }
  }

  const options = []
  for (let i = 0; i <= 2; i += 1) {
    const startYear = latestYear + i
    const endYear = (startYear + 1) % 100
    const formatted = `${startYear}-${String(endYear).padStart(2, "0")}`
    if (!existingYears.has(formatted)) {
      options.push({ value: formatted, label: formatted })
    }
  }
  return options
}

export const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7

  const days = []
  for (let i = 0; i < startingDayOfWeek; i += 1) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i += 1) {
    days.push(new Date(year, month, i))
  }
  while (days.length % 7 !== 0) {
    days.push(null)
  }
  return days
}

export const getEventsForDate = (date, filteredEvents = []) => {
  if (!date || !filteredEvents) return []
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

  return filteredEvents.filter((event) => {
    const start = toDate(event.startDate)
    const end = toDate(event.endDate)
    if (!start || !end) return false
    return start <= dayEnd && end >= dayStart
  })
}

export const getHolidaysForDate = (date, holidaysByDate) => {
  if (!date) return []
  const dateKey = formatDateKey(date)
  if (!dateKey) return []
  return holidaysByDate.get(dateKey) || []
}

export const buildEventPayload = (formData) => ({
  title: formData.title?.trim(),
  category: formData.category,
  startDate: formData.startDate,
  endDate: formData.endDate,
  estimatedBudget: Number(formData.estimatedBudget || 0),
  description: formData.description?.trim(),
})

export const toCalendarEventPayload = (event) => {
  const normalized = normalizeEvent(event)
  return {
    ...(typeof normalized._id === "string" && VALID_OBJECT_ID_REGEX.test(normalized._id)
      ? { _id: normalized._id }
      : {}),
    title: normalized.title?.trim(),
    category: normalized.category,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    estimatedBudget: Number(normalized.estimatedBudget || 0),
    description: normalized.description?.trim(),
  }
}
