import { useEffect, useMemo, useState } from "react"
import { Button, Modal, Input } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent } from "@/components/ui/layout"
import { Textarea, Checkbox, Select, Label } from "@/components/ui/form"
import { LoadingState, ErrorState, EmptyState, Alert, useToast } from "@/components/ui/feedback"
import { Badge } from "@/components/ui/data-display"
import { CalendarDays, History, Plus, FileText, Receipt } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import useAuthz from "@/hooks/useAuthz"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import uploadApi from "@/service/modules/upload.api"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"

const EXPENSE_STATUS_TO_APPROVER = {
  pending: "Student Affairs",
  pending_student_affairs: "Student Affairs",
  pending_joint_registrar: "Joint Registrar SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}

const PROPOSAL_STATUS_TO_APPROVER = {
  pending: "Student Affairs",
  pending_president: "President Gymkhana",
  pending_student_affairs: "Student Affairs",
  pending_joint_registrar: "Joint Registrar SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}

const POST_STUDENT_AFFAIRS_STAGE_OPTIONS = [
  "Joint Registrar SA",
  "Associate Dean SA",
  "Dean SA",
]

const PROGRAMME_TYPE_OPTIONS = [
  { value: "Workshop", label: "Workshop" },
  { value: "Conference", label: "Conference" },
  { value: "Outreach", label: "Outreach" },
  { value: "Cultural", label: "Cultural" },
  { value: "Technical", label: "Technical" },
  { value: "Sports", label: "Sports" },
  { value: "Other Event", label: "Other Event" },
]

const PROGRAMME_MODE_OPTIONS = [
  { value: "Offline", label: "Offline" },
  { value: "Online", label: "Online" },
  { value: "Hybrid", label: "Hybrid" },
]

const ORGANISING_UNIT_OPTIONS = [
  { value: "Department", label: "Department" },
  { value: "Centre", label: "Centre" },
  { value: "Office", label: "Office" },
  { value: "Student Body", label: "Student Body" },
]

const REGISTRATION_CATEGORIES = [
  { key: "instituteStudents", label: "Institute Students" },
  { key: "instituteFacultyStaff", label: "Institute Faculty & Staff" },
  { key: "guestsInvitees", label: "Guests / Invitees" },
  { key: "externalParticipants", label: "External Participants" },
  { key: "industryProfessionals", label: "Industry / Professionals" },
]

const footerTabStyles = {
  tabsBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--color-bg-tertiary)",
    borderTop: "var(--border-1) solid var(--color-border-primary)",
    padding: 0,
    flexShrink: 0,
    minHeight: "42px",
    overflowX: "auto",
    overflowY: "hidden",
  },
  tabsList: {
    display: "flex",
    alignItems: "stretch",
    height: "100%",
    gap: 0,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    padding: "0 var(--spacing-4)",
    minHeight: "42px",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-muted)",
    backgroundColor: "transparent",
    border: "none",
    borderRight: "var(--border-1) solid var(--color-border-primary)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "var(--transition-colors)",
    minWidth: "120px",
    justifyContent: "center",
    gap: "var(--spacing-2)",
  },
  tabActive: {
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-primary)",
    borderBottom: "var(--border-2) solid var(--color-primary)",
    fontWeight: "var(--font-weight-semibold)",
  },
  addTab: {
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
  },
}

const formLabelStyles = {
  display: "block",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  marginBottom: "var(--spacing-1)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
}

const FormField = ({ label, htmlFor, required = false, children }) => (
  <div>
    <Label htmlFor={htmlFor} required={required} size="sm" style={formLabelStyles}>
      {label}
    </Label>
    {children}
  </div>
)

const createDefaultSeriesForm = () => ({
  name: "",
  description: "",
})

const createDefaultOccurrenceForm = () => ({
  startDate: "",
  endDate: "",
})

const createDefaultRegistrationRow = () => ({
  registrationFee: "",
  accommodationCharges: "",
  remarks: "",
})

const createDefaultProposalDetails = () => ({
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

const createDefaultProposalForm = () => ({
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

const toFormNumberValue = (value) =>
  value === null || value === undefined || value === "" ? "" : String(value)

const toNumericValue = (value) => Number(value || 0)

const toProposalDetailsForm = (proposalDetails) => {
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

const calculateTotalExpectedIncomeFromDetails = (proposalDetails = {}) => {
  const sourceOfFunds = proposalDetails?.sourceOfFunds || {}
  return (
    toNumericValue(sourceOfFunds.registrationFee) +
    toNumericValue(sourceOfFunds.gymkhanaFund) +
    toNumericValue(sourceOfFunds.instituteSupport) +
    toNumericValue(sourceOfFunds.sponsorshipGrant)
  )
}

const generateExternalGuestsDetailsFromDetails = (proposalDetails = {}) => {
  return [
    proposalDetails?.guestsDetails?.guestsNamesDesignationAffiliations,
    proposalDetails?.targetParticipants?.guestsInvitees,
    proposalDetails?.targetParticipants?.externalVisitorsParticipants,
  ]
    .filter((value) => String(value || "").trim())
    .join("\n\n")
    .trim()
}

const generateProposalTextFromDetails = (proposalDetails = {}) => {
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

const hasRequiredDetailedProposalFields = (proposalDetails = {}) => {
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

const buildProposalDetailsPayload = (proposalDetails = {}) => {
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
      conductProgrammeAsProposed: Boolean(
        details?.approvalRequested?.conductProgrammeAsProposed
      ),
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

const setNestedValue = (source, path, value) => {
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

const createDefaultBill = () => ({
  description: "",
  amount: "",
  billNumber: "",
  billDate: "",
  vendor: "",
  attachmentUrl: "",
})

const createDefaultExpenseForm = () => ({
  bills: [createDefaultBill()],
  eventReportDocumentUrl: "",
  notes: "",
})

const toProposalForm = (proposal) => ({
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

const buildProposalPayload = (proposalForm) => {
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

const toExpenseForm = (expense) => ({
  bills:
    Array.isArray(expense?.bills) && expense.bills.length > 0
      ? expense.bills.map((bill) => ({
        description: bill.description || "",
        amount: bill.amount === null || bill.amount === undefined ? "" : String(bill.amount),
        billNumber: bill.billNumber || "",
        billDate: bill.billDate ? new Date(bill.billDate).toISOString().slice(0, 10) : "",
        vendor: bill.vendor || "",
        attachmentUrl: bill.attachments?.[0]?.url || "",
      }))
      : [createDefaultBill()],
  eventReportDocumentUrl: expense?.eventReportDocumentUrl || "",
  notes: expense?.notes || "",
})

const buildExpensePayload = (expenseForm) => ({
  bills: (expenseForm.bills || []).map((bill) => ({
    description: bill.description?.trim(),
    amount: Number(bill.amount || 0),
    billNumber: bill.billNumber?.trim() || "",
    billDate: bill.billDate || undefined,
    vendor: bill.vendor?.trim() || "",
    attachments: [{ filename: "bill.pdf", url: bill.attachmentUrl }],
  })),
  eventReportDocumentUrl: expenseForm.eventReportDocumentUrl?.trim() || "",
  notes: expenseForm.notes?.trim() || "",
})

const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const sortOccurrencesByDateDesc = (occurrences = []) =>
  [...occurrences].sort((left, right) => {
    const leftStart = toDate(left?.scheduledStartDate)?.getTime() || 0
    const rightStart = toDate(right?.scheduledStartDate)?.getTime() || 0
    if (rightStart !== leftStart) return rightStart - leftStart

    const leftEnd = toDate(left?.scheduledEndDate)?.getTime() || 0
    const rightEnd = toDate(right?.scheduledEndDate)?.getTime() || 0
    if (rightEnd !== leftEnd) return rightEnd - leftEnd

    const leftCreated = toDate(left?.createdAt)?.getTime() || 0
    const rightCreated = toDate(right?.createdAt)?.getTime() || 0
    return rightCreated - leftCreated
  })

const formatDateRange = (start, end) => {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate) return "Date not set"
  if (!endDate) return startDate.toLocaleDateString()
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
}

const getRequiredApproverForProposal = (proposalStatus) => PROPOSAL_STATUS_TO_APPROVER[proposalStatus] || null
const getRequiredApproverForExpense = (expenseStatus) => EXPENSE_STATUS_TO_APPROVER[expenseStatus] || null

const MegaEventsPage = () => {
  const { user } = useAuth()
  const { getConstraint } = useAuthz()
  const { toast } = useToast()

  const isAdminLevel = user?.role === "Admin" || user?.role === "Super Admin"
  const isGymkhana = user?.role === "Gymkhana"
  const isPresident = isGymkhana && user?.subRole === "President Gymkhana"
  const isGS = isGymkhana && user?.subRole === "GS Gymkhana"
  const canViewEventsCapability = true
  const canCreateEventsCapability = true
  const canApproveEventsCapability = true
  const maxApprovalAmountConstraint = getConstraint("constraint.events.maxApprovalAmount", null)
  const hasApprovalLimitValue = !(
    maxApprovalAmountConstraint === null ||
    maxApprovalAmountConstraint === undefined ||
    (typeof maxApprovalAmountConstraint === "string" && maxApprovalAmountConstraint.trim() === "")
  )
  const parsedApprovalLimit = hasApprovalLimitValue ? Number(maxApprovalAmountConstraint) : null
  const maxApprovalAmount = Number.isFinite(parsedApprovalLimit) && parsedApprovalLimit >= 0
    ? parsedApprovalLimit
    : null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [series, setSeries] = useState([])
  const [selectedSeriesId, setSelectedSeriesId] = useState("")
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [occurrences, setOccurrences] = useState([])
  const [latestOccurrence, setLatestOccurrence] = useState(null)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const [proposalData, setProposalData] = useState(null)
  const [expenseData, setExpenseData] = useState(null)
  const [proposalHistoryRefreshKey, setProposalHistoryRefreshKey] = useState(0)
  const [expenseHistoryRefreshKey, setExpenseHistoryRefreshKey] = useState(0)

  const [isCreateSeriesOpen, setIsCreateSeriesOpen] = useState(false)
  const [isCreateOccurrenceOpen, setIsCreateOccurrenceOpen] = useState(false)
  const [isProposalOpen, setIsProposalOpen] = useState(false)
  const [isProposalDetailsOpen, setIsProposalDetailsOpen] = useState(false)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)

  const [seriesForm, setSeriesForm] = useState(createDefaultSeriesForm)
  const [occurrenceForm, setOccurrenceForm] = useState(createDefaultOccurrenceForm)
  const [proposalForm, setProposalForm] = useState(createDefaultProposalForm)
  const [expenseForm, setExpenseForm] = useState(createDefaultExpenseForm)
  const [proposalComments, setProposalComments] = useState("")
  const [expenseComments, setExpenseComments] = useState("")
  const [proposalNextApprovalStages, setProposalNextApprovalStages] = useState([])
  const [expenseNextApprovalStages, setExpenseNextApprovalStages] = useState([])

  const [submitting, setSubmitting] = useState(false)

  const selectedOccurrence = useMemo(
    () => occurrences.find((entry) => entry._id === selectedOccurrenceId) || latestOccurrence,
    [occurrences, selectedOccurrenceId, latestOccurrence]
  )

  const canCreateSeries = isAdminLevel && canCreateEventsCapability
  const canCreateOccurrence = isAdminLevel && canCreateEventsCapability && Boolean(selectedSeries?._id)
  const canCreateOrEditProposal = isPresident && canCreateEventsCapability && Boolean(selectedOccurrence?._id)
  const canCreateOrEditExpense =
    isGS &&
    canCreateEventsCapability &&
    selectedOccurrence?.status === "proposal_approved"

  const canApproveCurrentProposalAmount =
    maxApprovalAmount === null ||
    Number(proposalData?.totalExpenditure || 0) <= maxApprovalAmount
  const canApproveCurrentExpenseAmount =
    maxApprovalAmount === null ||
    Number(expenseData?.totalExpenditure || 0) <= maxApprovalAmount

  const canReviewProposal = useMemo(() => {
    if (!canApproveEventsCapability) return false
    if (!proposalData?.status || !user?.subRole) return false
    if (!canApproveCurrentProposalAmount) return false
    const requiredApprover = getRequiredApproverForProposal(proposalData.status)
    if (!requiredApprover) return false
    if (user?.role === "Super Admin") return true
    return user?.subRole === requiredApprover
  }, [
    proposalData?.status,
    canApproveEventsCapability,
    canApproveCurrentProposalAmount,
    user?.role,
    user?.subRole,
  ])

  const canReviewExpense = useMemo(() => {
    if (!canApproveEventsCapability) return false
    if (!expenseData?.approvalStatus || !isAdminLevel) return false
    if (!canApproveCurrentExpenseAmount) return false
    const requiredApprover = getRequiredApproverForExpense(expenseData.approvalStatus)
    if (!requiredApprover) return false
    if (user?.role === "Super Admin") return true
    return user?.subRole === requiredApprover
  }, [
    expenseData?.approvalStatus,
    canApproveCurrentExpenseAmount,
    canApproveEventsCapability,
    isAdminLevel,
    user?.role,
    user?.subRole,
  ])

  const requiresProposalStageSelection = useMemo(
    () =>
      Boolean(
        canReviewProposal &&
          user?.subRole === "Student Affairs" &&
          (proposalData?.status === "pending_student_affairs" ||
            proposalData?.status === "pending")
      ),
    [canReviewProposal, proposalData?.status, user?.subRole]
  )
  const requiresExpenseStageSelection =
    expenseData?.approvalStatus === "pending_student_affairs" || expenseData?.approvalStatus === "pending"

  const computedTotalExpectedIncome = useMemo(
    () => calculateTotalExpectedIncomeFromDetails(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )
  const detailedProposalPreviewText = useMemo(
    () => generateProposalTextFromDetails(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )
  const detailedExternalGuestsText = useMemo(
    () => generateExternalGuestsDetailsFromDetails(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )
  const isDetailedProposalComplete = useMemo(
    () => hasRequiredDetailedProposalFields(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )

  const isProposalFormValid = Boolean(
    isDetailedProposalComplete &&
    Number(computedTotalExpectedIncome) >= 0 &&
    Number(proposalForm.totalExpenditure || 0) >= 0
  )

  const isExpenseFormValid = useMemo(() => {
    if (!Array.isArray(expenseForm.bills) || expenseForm.bills.length === 0) return false
    const validBills = expenseForm.bills.every((bill) =>
      bill.description?.trim() &&
      Number(bill.amount || 0) > 0 &&
      bill.attachmentUrl?.trim()
    )
    return validBills && Boolean(expenseForm.eventReportDocumentUrl?.trim())
  }, [expenseForm.bills, expenseForm.eventReportDocumentUrl])

  const loadSeries = async () => {
    if (!canViewEventsCapability) {
      setLoading(false)
      setError("")
      setSeries([])
      setSelectedSeriesId("")
      return
    }

    try {
      setLoading(true)
      setError("")
      const response = await gymkhanaEventsApi.getMegaSeries()
      const loadedSeries = response.data?.series || response.series || []
      setSeries(loadedSeries)

      const nextSelectedId = selectedSeriesId && loadedSeries.some((item) => item._id === selectedSeriesId)
        ? selectedSeriesId
        : loadedSeries[0]?._id || ""
      setSelectedSeriesId(nextSelectedId)
    } catch (err) {
      setError(err.message || "Failed to load mega event series")
    } finally {
      setLoading(false)
    }
  }

  const loadSeriesDetails = async (seriesId) => {
    if (!canViewEventsCapability) return

    if (!seriesId) {
      setSelectedSeries(null)
      setOccurrences([])
      setLatestOccurrence(null)
      setSelectedOccurrenceId("")
      return
    }

    try {
      const response = await gymkhanaEventsApi.getMegaSeriesById(seriesId)
      const seriesData = response.data?.series || response.series || null
      const responseOccurrences = response.data?.occurrences || response.occurrences || []
      const orderedOccurrences = sortOccurrencesByDateDesc(responseOccurrences)
      setSelectedSeries(seriesData)
      setOccurrences(orderedOccurrences)

      const latest = orderedOccurrences[0] || null
      setLatestOccurrence(latest)
      setSelectedOccurrenceId(latest?._id || "")
      setIsHistoryOpen(false)
    } catch (err) {
      setError(err.message || "Failed to load mega event details")
    }
  }

  const loadProposalAndExpense = async (occurrence) => {
    if (!canViewEventsCapability) return

    if (!occurrence?._id) {
      setProposalData(null)
      setExpenseData(null)
      return
    }

    try {
      const [proposalResponse, expenseResponse] = await Promise.all([
        gymkhanaEventsApi.getMegaOccurrenceProposal(occurrence._id).catch(() => null),
        gymkhanaEventsApi.getMegaOccurrenceExpense(occurrence._id).catch(() => null),
      ])

      const loadedProposal = proposalResponse?.data?.proposal || proposalResponse?.proposal || null
      const loadedExpense = expenseResponse?.data?.expense || expenseResponse?.expense || null
      setProposalData(loadedProposal)
      setExpenseData(loadedExpense)
      setProposalForm(loadedProposal ? toProposalForm(loadedProposal) : createDefaultProposalForm())
      setExpenseForm(loadedExpense ? toExpenseForm(loadedExpense) : createDefaultExpenseForm())
      setProposalComments("")
      setExpenseComments("")
      setProposalNextApprovalStages([])
      setExpenseNextApprovalStages([])
    } catch {
      setProposalData(null)
      setExpenseData(null)
    }
  }

  useEffect(() => {
    loadSeries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadSeriesDetails(selectedSeriesId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId])

  useEffect(() => {
    loadProposalAndExpense(selectedOccurrence)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOccurrence?._id])

  const toggleStageSelection = (stage, currentValues, setter) => {
    if (currentValues.includes(stage)) {
      setter(currentValues.filter((entry) => entry !== stage))
      return
    }
    setter([...currentValues, stage])
  }

  const handleProposalDetailsChange = (path, value) => {
    setProposalForm((prev) => ({
      ...prev,
      proposalDetails: setNestedValue(prev.proposalDetails || createDefaultProposalDetails(), path, value),
    }))
  }

  const handleProposalRegistrationDetailChange = (categoryKey, field, value) => {
    handleProposalDetailsChange(["registrationDetails", categoryKey, field], value)
  }

  const uploadProposalPdf = async (file) => {
    const formData = new FormData()
    formData.append("proposalPdf", file)
    return uploadApi.uploadEventProposalPDF(formData)
  }

  const uploadScheduleAnnexurePdf = async (file) => {
    const formData = new FormData()
    formData.append("proposalPdf", file)
    return uploadApi.uploadEventProposalPDF(formData)
  }

  const uploadChiefGuestPdf = async (file) => {
    const formData = new FormData()
    formData.append("chiefGuestPdf", file)
    return uploadApi.uploadEventChiefGuestPDF(formData)
  }

  const uploadBillPdf = async (file) => {
    const formData = new FormData()
    formData.append("billPdf", file)
    return uploadApi.uploadEventBillPDF(formData)
  }

  const uploadEventReportPdf = async (file) => {
    const formData = new FormData()
    formData.append("eventReportPdf", file)
    return uploadApi.uploadEventReportPDF(formData)
  }

  const handleCreateSeries = async () => {
    if (!canCreateSeries) {
      toast.error("You do not have permission to create mega event series")
      return
    }

    if (!seriesForm.name.trim()) {
      toast.error("Series name is required")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createMegaSeries({
        name: seriesForm.name.trim(),
        description: seriesForm.description.trim(),
      })
      toast.success("Mega event series created")
      setIsCreateSeriesOpen(false)
      setSeriesForm(createDefaultSeriesForm())
      await loadSeries()
    } catch (err) {
      toast.error(err.message || "Failed to create mega event series")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateOccurrence = async () => {
    if (!canCreateOccurrence) {
      toast.error("You do not have permission to create mega event occurrences")
      return
    }

    if (!selectedSeries?._id) return

    if (!occurrenceForm.startDate || !occurrenceForm.endDate) {
      toast.error("Please select start and end dates")
      return
    }
    if (new Date(occurrenceForm.endDate) < new Date(occurrenceForm.startDate)) {
      toast.error("End date cannot be before start date")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createMegaOccurrence(selectedSeries._id, {
        startDate: occurrenceForm.startDate,
        endDate: occurrenceForm.endDate,
      })
      toast.success("Occurrence created")
      setIsCreateOccurrenceOpen(false)
      setOccurrenceForm(createDefaultOccurrenceForm())
      await loadSeriesDetails(selectedSeries._id)
      await loadSeries()
    } catch (err) {
      toast.error(err.message || "Failed to create occurrence")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveProposal = async () => {
    if (!canCreateOrEditProposal) {
      toast.error("You do not have permission to submit this proposal")
      return
    }

    if (!selectedOccurrence?._id) return
    if (!isProposalFormValid) {
      toast.error("Please complete the required proposal details and expenditure fields")
      return
    }

    const payload = buildProposalPayload(proposalForm)

    try {
      setSubmitting(true)
      if (proposalData?._id) {
        await gymkhanaEventsApi.updateMegaOccurrenceProposal(selectedOccurrence._id, payload)
      } else {
        await gymkhanaEventsApi.createMegaOccurrenceProposal(selectedOccurrence._id, payload)
      }
      toast.success("Proposal saved")
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to save proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveProposal = async () => {
    if (!canReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!canApproveCurrentProposalAmount && maxApprovalAmount !== null) {
      toast.error(`Proposal amount exceeds your approval limit of ${maxApprovalAmount}`)
      return
    }
    if (requiresProposalStageSelection && proposalNextApprovalStages.length === 0) {
      toast.error("Select at least one next approval stage")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveMegaOccurrenceProposal(
        selectedOccurrence._id,
        proposalComments,
        requiresProposalStageSelection ? proposalNextApprovalStages : []
      )
      toast.success("Proposal decision saved")
      setProposalHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to approve proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectProposal = async () => {
    if (!canReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!proposalComments || proposalComments.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectMegaOccurrenceProposal(selectedOccurrence._id, proposalComments.trim())
      toast.success("Proposal rejected")
      setProposalHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to reject proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestProposalRevision = async () => {
    if (!canReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!proposalComments || proposalComments.trim().length < 10) {
      toast.error("Revision comments must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.requestMegaOccurrenceProposalRevision(
        selectedOccurrence._id,
        proposalComments.trim()
      )
      toast.success("Revision requested")
      setProposalHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to request revision")
    } finally {
      setSubmitting(false)
    }
  }

  const updateBillField = (index, key, value) => {
    setExpenseForm((prev) => {
      const nextBills = [...prev.bills]
      nextBills[index] = {
        ...nextBills[index],
        [key]: value,
      }
      return { ...prev, bills: nextBills }
    })
  }

  const handleSaveExpense = async () => {
    if (!canCreateOrEditExpense) {
      toast.error("You do not have permission to submit this expense")
      return
    }

    if (!selectedOccurrence?._id) return
    if (!isExpenseFormValid) {
      toast.error("Please complete required bill and report fields")
      return
    }

    const payload = buildExpensePayload(expenseForm)
    try {
      setSubmitting(true)
      if (expenseData?._id) {
        await gymkhanaEventsApi.updateMegaOccurrenceExpense(selectedOccurrence._id, payload)
      } else {
        await gymkhanaEventsApi.submitMegaOccurrenceExpense(selectedOccurrence._id, payload)
      }
      toast.success("Expense saved")
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to save expense")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveExpense = async () => {
    if (!canReviewExpense) {
      toast.error("You do not have permission to review this expense")
      return
    }

    if (!expenseData?._id) return
    if (!canApproveCurrentExpenseAmount && maxApprovalAmount !== null) {
      toast.error(`Expense amount exceeds your approval limit of ${maxApprovalAmount}`)
      return
    }
    if (requiresExpenseStageSelection && expenseNextApprovalStages.length === 0) {
      toast.error("Select at least one next approval stage")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveMegaOccurrenceExpense(
        selectedOccurrence._id,
        expenseComments,
        requiresExpenseStageSelection ? expenseNextApprovalStages : []
      )
      toast.success("Expense decision saved")
      setExpenseHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to approve expense")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectExpense = async () => {
    if (!canReviewExpense) {
      toast.error("You do not have permission to review this expense")
      return
    }

    if (!expenseData?._id) return
    if (!expenseComments || expenseComments.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectMegaOccurrenceExpense(selectedOccurrence._id, expenseComments.trim())
      toast.success("Expense rejected")
      setExpenseHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to reject expense")
    } finally {
      setSubmitting(false)
    }
  }

  const statusBadgeVariant = (status) => {
    if (!status) return "default"
    if (["approved", "completed", "proposal_approved"].includes(status)) return "success"
    if (status.includes("rejected")) return "danger"
    if (status.includes("pending")) return "warning"
    if (status.includes("submitted")) return "info"
    return "default"
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {selectedSeries && occurrences.length > 0 && (
        <Button size="md" variant="secondary" onClick={() => setIsHistoryOpen(true)}>
          <History size={16} /> History
        </Button>
      )}
      {canCreateOccurrence && (
        <Button size="md" onClick={() => setIsCreateOccurrenceOpen(true)}>
          <Plus size={16} /> Add Occurrence
        </Button>
      )}
    </div>
  )

  if (!canViewEventsCapability) {
    return (
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger-text)]">
          You do not have permission to view mega events.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <PageHeader
        title="Mega Events"
        subtitle="Recurring flagship events with date-based latest view and full occurrence history."
      >
        {headerActions}
      </PageHeader>

      <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-6)" }}>
        {loading ? (
          <LoadingState message="Loading mega events..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadSeries} />
        ) : series.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="No Mega Event Series"
                message={canCreateSeries
                  ? "Create your first mega event series from the footer to get started."
                  : "No mega event series available yet."}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedSeries && (
              <Card style={{ height: "100%" }}>
                <CardContent style={{ height: "100%", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                  {!selectedOccurrence ? (
                    <Alert type="info" title="No occurrence yet">
                      Create a new occurrence for this mega event series.
                    </Alert>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--spacing-2)",
                        }}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">{selectedSeries.name}</h3>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {formatDateRange(selectedOccurrence.scheduledStartDate, selectedOccurrence.scheduledEndDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              selectedOccurrence?._id && selectedOccurrence._id === latestOccurrence?._id
                                ? "success"
                                : "default"
                            }
                          >
                            {selectedOccurrence?._id && selectedOccurrence._id === latestOccurrence?._id
                              ? "Present"
                              : "Past"}
                          </Badge>
                          <Badge variant={statusBadgeVariant(selectedOccurrence.status)}>
                            {(selectedOccurrence.status || "unknown").replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>

                      <div
                        className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4"
                        style={{ flex: 1 }}
                      >
                        <h4 className="text-base font-semibold text-[var(--color-text-heading)]">{selectedOccurrence.title}</h4>
                        {selectedOccurrence.description ? (
                          <p className="mt-3 text-sm text-[var(--color-text-body)]">{selectedOccurrence.description}</p>
                        ) : (
                          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                            Description will be available after proposal details are added.
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                          {canCreateOrEditProposal && (
                            <Button size="sm" onClick={() => setIsProposalOpen(true)}>
                              <FileText size={14} /> {proposalData ? "Edit Proposal" : "Submit Proposal"}
                            </Button>
                          )}
                          {(proposalData || canReviewProposal) && (
                            <Button size="sm" variant="secondary" onClick={() => setIsProposalOpen(true)}>
                              <History size={14} /> Proposal Review
                            </Button>
                          )}
                          {(expenseData || canCreateOrEditExpense || canReviewExpense) && (
                            <Button size="sm" variant="secondary" onClick={() => setIsExpenseOpen(true)}>
                              <Receipt size={14} /> Expense Flow
                            </Button>
                          )}
                        </div>
                        {!canCreateOrEditProposal && !canCreateOrEditExpense && !canReviewProposal && !canReviewExpense && (
                          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                            You have read-only access for this occurrence.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <div style={footerTabStyles.tabsBar}>
        <div style={footerTabStyles.tabsList}>
          {series.map((entry) => (
            <button
              key={entry._id}
              type="button"
              onClick={() => setSelectedSeriesId(entry._id)}
              style={{
                ...footerTabStyles.tab,
                ...(selectedSeriesId === entry._id ? footerTabStyles.tabActive : {}),
              }}
            >
              <CalendarDays size={14} />
              {entry.name}
            </button>
          ))}
          {canCreateSeries && (
            <button
              type="button"
              onClick={() => setIsCreateSeriesOpen(true)}
              style={{ ...footerTabStyles.tab, ...footerTabStyles.addTab }}
            >
              <Plus size={14} />
              Add Event
            </button>
          )}
        </div>
      </div>

      <Modal
        title="Create Mega Event Series"
        isOpen={isCreateSeriesOpen}
        onClose={() => setIsCreateSeriesOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateSeriesOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSeries} loading={submitting}>Create</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <FormField label="Event Series Name" htmlFor="mega-series-name" required>
            <Input
              id="mega-series-name"
              value={seriesForm.name}
              onChange={(event) => setSeriesForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Event name (e.g., Flux, IPL Fest, Alumni Summit)"
            />
          </FormField>
          <FormField label="Series Description" htmlFor="mega-series-description">
            <Textarea
              id="mega-series-description"
              value={seriesForm.description}
              onChange={(event) => setSeriesForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Optional description"
              rows={4}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        title="Create Mega Event Occurrence"
        isOpen={isCreateOccurrenceOpen}
        onClose={() => setIsCreateOccurrenceOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateOccurrenceOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOccurrence} loading={submitting}>Create Occurrence</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            Select the date range for this occurrence. Proposal details will be added in the proposal flow.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Start Date" htmlFor="mega-occurrence-start-date" required>
              <Input
                id="mega-occurrence-start-date"
                type="date"
                value={occurrenceForm.startDate}
                onChange={(event) => setOccurrenceForm((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </FormField>
            <FormField label="End Date" htmlFor="mega-occurrence-end-date" required>
              <Input
                id="mega-occurrence-end-date"
                type="date"
                value={occurrenceForm.endDate}
                onChange={(event) => setOccurrenceForm((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </FormField>
          </div>
        </div>
      </Modal>

      <Modal
        title={`${selectedSeries?.name || "Mega Event"} Occurrences`}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      >
        <div className="space-y-2">
          {occurrences.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No occurrences available.</p>
          ) : (
            occurrences.map((entry) => {
              const isSelected = selectedOccurrenceId === entry._id
              const isPresent = latestOccurrence?._id === entry._id
              return (
                <button
                  key={entry._id}
                  type="button"
                  onClick={() => {
                    setSelectedOccurrenceId(entry._id)
                    setIsHistoryOpen(false)
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]"
                      : "border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {entry.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={isPresent ? "success" : "default"}>
                        {isPresent ? "Present" : "Past"}
                      </Badge>
                      <Badge variant={statusBadgeVariant(entry.status)}>
                        {(entry.status || "unknown").replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {formatDateRange(entry.scheduledStartDate, entry.scheduledEndDate)}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </Modal>

      <Modal
        title="Mega Event Proposal"
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        width={960}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsProposalOpen(false)}>Close</Button>
            {canCreateOrEditProposal && (
              <Button onClick={handleSaveProposal} loading={submitting}>
                {proposalData ? "Update Proposal" : "Submit Proposal"}
              </Button>
            )}
            {canReviewProposal && (
              <>
                <Button variant="outline" onClick={handleRequestProposalRevision} loading={submitting}>
                  Request Revision
                </Button>
                <Button variant="danger" onClick={handleRejectProposal} loading={submitting}>Reject</Button>
                <Button variant="success" onClick={handleApproveProposal} loading={submitting}>Approve</Button>
              </>
            )}
          </div>
        )}
      >
        <div className="space-y-4">
          {proposalData && (
            <Alert type="info" title="Current proposal status">
              {(proposalData.status || "draft").replace(/_/g, " ")}
            </Alert>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Proposal Details Format</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Fill all structured fields in the detailed popup.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProposalDetailsOpen(true)}
            >
              {canCreateOrEditProposal ? "Submit Proposal Details" : "View Proposal Details"}
            </Button>
          </div>

          {!isDetailedProposalComplete && (
            <Alert type="warning" title="Proposal details are incomplete">
              Complete mandatory fields in "Submit Proposal Details" before submitting the proposal.
            </Alert>
          )}

          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Details Summary</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-heading)]">
              {proposalForm.proposalDetails.programmeTitle || "Programme title not added"}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {proposalForm.proposalDetails.organisingUnit.unitType} | {proposalForm.proposalDetails.programmeDetails.programmeType} | {proposalForm.proposalDetails.programmeDetails.mode}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {proposalForm.proposalDetails.programmeDetails.datesAndDuration || "Dates & duration not added"}
            </p>
            {detailedProposalPreviewText && (
              <FormField label="Detailed Proposal Preview" htmlFor="mega-proposal-preview">
                <Textarea id="mega-proposal-preview" value={detailedProposalPreviewText} rows={5} disabled />
              </FormField>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Total Expected Income (Auto)" htmlFor="mega-total-expected-income">
              <Input
                id="mega-total-expected-income"
                type="number"
                min={0}
                value={String(computedTotalExpectedIncome)}
                placeholder="Total expected income"
                disabled
              />
            </FormField>
            <FormField label="Total Expenditure" htmlFor="mega-total-expenditure">
              <Input
                id="mega-total-expenditure"
                type="number"
                min={0}
                value={proposalForm.totalExpenditure}
                onChange={(event) => setProposalForm((prev) => ({ ...prev, totalExpenditure: event.target.value }))}
                placeholder="Total expenditure"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>
          <FormField label="Registration Fee (From Source of Funds)" htmlFor="mega-registration-fee-source">
            <Input
              id="mega-registration-fee-source"
              type="number"
              min={0}
              value={String(toNumericValue(proposalForm.proposalDetails?.sourceOfFunds?.registrationFee))}
              placeholder="Registration fee from source of funds"
              disabled
            />
          </FormField>
          <Checkbox
            checked={proposalForm.accommodationRequired}
            onChange={(event) => setProposalForm((prev) => ({ ...prev, accommodationRequired: event.target.checked }))}
            label="Accommodation required"
            disabled={!canCreateOrEditProposal}
          />
          {detailedExternalGuestsText && (
            <FormField label="External Guests Summary" htmlFor="mega-external-guests-summary">
              <Textarea id="mega-external-guests-summary" value={detailedExternalGuestsText} rows={3} disabled />
            </FormField>
          )}
          <PdfUploadField
            label="Proposal PDF"
            value={proposalForm.proposalDocumentUrl}
            onChange={(value) => setProposalForm((prev) => ({ ...prev, proposalDocumentUrl: value }))}
            onUpload={uploadProposalPdf}
            disabled={!canCreateOrEditProposal}
            viewerTitle="Proposal Document"
          />
          <PdfUploadField
            label="Chief Guest PDF"
            value={proposalForm.chiefGuestDocumentUrl}
            onChange={(value) => setProposalForm((prev) => ({ ...prev, chiefGuestDocumentUrl: value }))}
            onUpload={uploadChiefGuestPdf}
            disabled={!canCreateOrEditProposal}
            viewerTitle="Chief Guest Document"
          />

          {canReviewProposal && (
            <>
              {requiresProposalStageSelection && (
                <div className="space-y-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Select next approval stage(s)
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                      <Checkbox
                        key={stage}
                        checked={proposalNextApprovalStages.includes(stage)}
                        onChange={() =>
                          toggleStageSelection(stage, proposalNextApprovalStages, setProposalNextApprovalStages)}
                        label={stage}
                      />
                    ))}
                  </div>
                </div>
              )}
              <FormField label="Review Comments" htmlFor="mega-proposal-review-comments">
                <Textarea
                  id="mega-proposal-review-comments"
                  value={proposalComments}
                  onChange={(event) => setProposalComments(event.target.value)}
                  rows={3}
                  placeholder="Review comments"
                />
              </FormField>
            </>
          )}

          {proposalData?._id && (
            <Card>
              <CardContent>
                <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)]">Approval History</h4>
                <ApprovalHistory
                  key={`proposal-${selectedOccurrence?._id}-${proposalHistoryRefreshKey}`}
                  megaProposalOccurrenceId={selectedOccurrence?._id}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>

      <Modal
        title="Proposal Details Format"
        isOpen={isProposalDetailsOpen}
        onClose={() => setIsProposalDetailsOpen(false)}
        width={1080}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsProposalDetailsOpen(false)}>
              Close
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Basic Programme Information
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Title of the Programme" htmlFor="mega-proposal-programme-title" required>
              <Input
                id="mega-proposal-programme-title"
                value={proposalForm.proposalDetails.programmeTitle}
                onChange={(event) => handleProposalDetailsChange(["programmeTitle"], event.target.value)}
                placeholder="Title of the Programme"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Organising Unit Type" htmlFor="mega-proposal-organising-unit-type" required>
              <Select
                id="mega-proposal-organising-unit-type"
                options={ORGANISING_UNIT_OPTIONS}
                value={proposalForm.proposalDetails.organisingUnit.unitType}
                onChange={(event) => handleProposalDetailsChange(["organisingUnit", "unitType"], event.target.value)}
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Coordinator Name(s)" htmlFor="mega-proposal-coordinator-names" required>
              <Input
                id="mega-proposal-coordinator-names"
                value={proposalForm.proposalDetails.organisingUnit.coordinatorNames}
                onChange={(event) =>
                  handleProposalDetailsChange(["organisingUnit", "coordinatorNames"], event.target.value)
                }
                placeholder="Coordinator name(s)"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Contact Mobile" htmlFor="mega-proposal-contact-mobile" required>
              <Input
                id="mega-proposal-contact-mobile"
                value={proposalForm.proposalDetails.organisingUnit.contactMobile}
                onChange={(event) =>
                  handleProposalDetailsChange(["organisingUnit", "contactMobile"], event.target.value)
                }
                placeholder="Contact mobile"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>
          <FormField label="Contact Email" htmlFor="mega-proposal-contact-email" required>
            <Input
              id="mega-proposal-contact-email"
              type="email"
              value={proposalForm.proposalDetails.organisingUnit.contactEmail}
              onChange={(event) =>
                handleProposalDetailsChange(["organisingUnit", "contactEmail"], event.target.value)
              }
              placeholder="Contact email"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>

          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Background and Rationale
            </p>
          </div>
          <FormField label="Background and Rationale: Context and Relevance" htmlFor="mega-proposal-context-relevance" required>
            <Textarea
              id="mega-proposal-context-relevance"
              value={proposalForm.proposalDetails.backgroundAndRationale.contextRelevance}
              onChange={(event) =>
                handleProposalDetailsChange(["backgroundAndRationale", "contextRelevance"], event.target.value)}
              rows={3}
              placeholder="Background and rationale: context and relevance"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>
          <FormField label="Expected Institutional/Societal Impact" htmlFor="mega-proposal-expected-impact" required>
            <Textarea
              id="mega-proposal-expected-impact"
              value={proposalForm.proposalDetails.backgroundAndRationale.expectedImpact}
              onChange={(event) =>
                handleProposalDetailsChange(["backgroundAndRationale", "expectedImpact"], event.target.value)}
              rows={3}
              placeholder="Need and expected institutional/societal impact"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>
          <FormField label="Alignment with Institute Objectives" htmlFor="mega-proposal-alignment-objectives" required>
            <Textarea
              id="mega-proposal-alignment-objectives"
              value={proposalForm.proposalDetails.backgroundAndRationale.alignmentWithObjectives}
              onChange={(event) =>
                handleProposalDetailsChange(["backgroundAndRationale", "alignmentWithObjectives"], event.target.value)}
              rows={3}
              placeholder="Alignment with institute objectives"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>

          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Objectives and Programme Plan
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="Objective 1" htmlFor="mega-proposal-objective-1" required>
              <Input
                id="mega-proposal-objective-1"
                value={proposalForm.proposalDetails.objectives.objective1}
                onChange={(event) =>
                  handleProposalDetailsChange(["objectives", "objective1"], event.target.value)
                }
                placeholder="Objective 1"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Objective 2" htmlFor="mega-proposal-objective-2">
              <Input
                id="mega-proposal-objective-2"
                value={proposalForm.proposalDetails.objectives.objective2}
                onChange={(event) =>
                  handleProposalDetailsChange(["objectives", "objective2"], event.target.value)
                }
                placeholder="Objective 2"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Objective 3" htmlFor="mega-proposal-objective-3">
              <Input
                id="mega-proposal-objective-3"
                value={proposalForm.proposalDetails.objectives.objective3}
                onChange={(event) =>
                  handleProposalDetailsChange(["objectives", "objective3"], event.target.value)
                }
                placeholder="Objective 3"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Programme Type" htmlFor="mega-proposal-programme-type" required>
              <Select
                id="mega-proposal-programme-type"
                options={PROGRAMME_TYPE_OPTIONS}
                value={proposalForm.proposalDetails.programmeDetails.programmeType}
                onChange={(event) =>
                  handleProposalDetailsChange(["programmeDetails", "programmeType"], event.target.value)
                }
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Programme Mode" htmlFor="mega-proposal-programme-mode" required>
              <Select
                id="mega-proposal-programme-mode"
                options={PROGRAMME_MODE_OPTIONS}
                value={proposalForm.proposalDetails.programmeDetails.mode}
                onChange={(event) => handleProposalDetailsChange(["programmeDetails", "mode"], event.target.value)}
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="Dates and Duration" htmlFor="mega-proposal-dates-duration" required>
              <Input
                id="mega-proposal-dates-duration"
                value={proposalForm.proposalDetails.programmeDetails.datesAndDuration}
                onChange={(event) =>
                  handleProposalDetailsChange(["programmeDetails", "datesAndDuration"], event.target.value)}
                placeholder="Dates & Duration"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Venue" htmlFor="mega-proposal-venue" required>
              <Input
                id="mega-proposal-venue"
                value={proposalForm.proposalDetails.programmeDetails.venue}
                onChange={(event) => handleProposalDetailsChange(["programmeDetails", "venue"], event.target.value)}
                placeholder="Venue"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Expected Participants" htmlFor="mega-proposal-expected-participants" required>
              <Input
                id="mega-proposal-expected-participants"
                type="number"
                min={0}
                value={proposalForm.proposalDetails.programmeDetails.expectedParticipants}
                onChange={(event) =>
                  handleProposalDetailsChange(["programmeDetails", "expectedParticipants"], event.target.value)}
                placeholder="Expected participants"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>

          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Participants and Guest Details
            </p>
          </div>
          <FormField label="Target Participants: Institute Faculty / Staff / Students" htmlFor="mega-target-participants-institute">
            <Textarea
              id="mega-target-participants-institute"
              value={proposalForm.proposalDetails.targetParticipants.instituteFacultyStaffStudents}
              onChange={(event) =>
                handleProposalDetailsChange(["targetParticipants", "instituteFacultyStaffStudents"], event.target.value)
              }
              rows={2}
              placeholder="Target participants: Institute Faculty / Staff / Students"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>
          <FormField label="Target Participants: Guests / Invitees" htmlFor="mega-target-participants-guests">
            <Textarea
              id="mega-target-participants-guests"
              value={proposalForm.proposalDetails.targetParticipants.guestsInvitees}
              onChange={(event) =>
                handleProposalDetailsChange(["targetParticipants", "guestsInvitees"], event.target.value)
              }
              rows={2}
              placeholder="Target participants: Guests / Invitees"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>
          <FormField label="Target Participants: External Visitors / Participants" htmlFor="mega-target-participants-external">
            <Textarea
              id="mega-target-participants-external"
              value={proposalForm.proposalDetails.targetParticipants.externalVisitorsParticipants}
              onChange={(event) =>
                handleProposalDetailsChange(["targetParticipants", "externalVisitorsParticipants"], event.target.value)
              }
              rows={2}
              placeholder="Target participants: External Visitors / Participants"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Tentative Number of Speakers / Guests" htmlFor="mega-tentative-speakers-guests">
              <Input
                id="mega-tentative-speakers-guests"
                type="number"
                min={0}
                value={proposalForm.proposalDetails.guestsDetails.tentativeNumberOfSpeakersGuests}
                onChange={(event) =>
                  handleProposalDetailsChange(["guestsDetails", "tentativeNumberOfSpeakersGuests"], event.target.value)}
                placeholder="Tentative number of speakers/guests"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Source of Funds: Registration Fee" htmlFor="mega-source-funds-registration-fee">
              <Input
                id="mega-source-funds-registration-fee"
                type="number"
                min={0}
                value={proposalForm.proposalDetails.sourceOfFunds.registrationFee}
                onChange={(event) =>
                  handleProposalDetailsChange(["sourceOfFunds", "registrationFee"], event.target.value)}
                placeholder="Source of funds: Registration fee"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>

          <FormField label="Guests Names, Designation and Affiliations" htmlFor="mega-guests-details-names">
            <Textarea
              id="mega-guests-details-names"
              value={proposalForm.proposalDetails.guestsDetails.guestsNamesDesignationAffiliations}
              onChange={(event) =>
                handleProposalDetailsChange(["guestsDetails", "guestsNamesDesignationAffiliations"], event.target.value)}
              rows={3}
              placeholder="Names of guests with designation and affiliations"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>

          <FormField label="Programme Schedule (Brief)" htmlFor="mega-programme-schedule-brief" required>
            <Textarea
              id="mega-programme-schedule-brief"
              value={proposalForm.proposalDetails.programmeSchedule.brief}
              onChange={(event) =>
                handleProposalDetailsChange(["programmeSchedule", "brief"], event.target.value)}
              rows={3}
              placeholder="Programme schedule (brief)"
              disabled={!canCreateOrEditProposal}
            />
          </FormField>
          <PdfUploadField
            label="Detailed Schedule Annexure (Optional PDF)"
            value={proposalForm.proposalDetails.programmeSchedule.detailedScheduleAnnexureUrl}
            onChange={(value) =>
              handleProposalDetailsChange(["programmeSchedule", "detailedScheduleAnnexureUrl"], value)}
            onUpload={uploadScheduleAnnexurePdf}
            disabled={!canCreateOrEditProposal}
            viewerTitle="Detailed Schedule Annexure"
          />

          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Source of Funds
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="Source of Funds: Gymkhana Fund" htmlFor="mega-source-funds-gymkhana">
              <Input
                id="mega-source-funds-gymkhana"
                type="number"
                min={0}
                value={proposalForm.proposalDetails.sourceOfFunds.gymkhanaFund}
                onChange={(event) => handleProposalDetailsChange(["sourceOfFunds", "gymkhanaFund"], event.target.value)}
                placeholder="Source of funds: Gymkhana fund"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Source of Funds: Institute Support" htmlFor="mega-source-funds-institute-support">
              <Input
                id="mega-source-funds-institute-support"
                type="number"
                min={0}
                value={proposalForm.proposalDetails.sourceOfFunds.instituteSupport}
                onChange={(event) =>
                  handleProposalDetailsChange(["sourceOfFunds", "instituteSupport"], event.target.value)}
                placeholder="Source of funds: Institute support"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Source of Funds: Sponsorship / Grant" htmlFor="mega-source-funds-sponsorship">
              <Input
                id="mega-source-funds-sponsorship"
                type="number"
                min={0}
                value={proposalForm.proposalDetails.sourceOfFunds.sponsorshipGrant}
                onChange={(event) =>
                  handleProposalDetailsChange(["sourceOfFunds", "sponsorshipGrant"], event.target.value)}
                placeholder="Source of funds: Sponsorship / grant"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>

          <div className="space-y-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Registration Details</p>
            <div className="hidden gap-2 md:grid md:grid-cols-4">
              <span style={formLabelStyles}>Category</span>
              <span style={formLabelStyles}>Registration Fee (INR)</span>
              <span style={formLabelStyles}>Accommodation Charges (INR)</span>
              <span style={formLabelStyles}>Remarks</span>
            </div>
            {REGISTRATION_CATEGORIES.map((category) => (
              <div key={category.key} className="grid gap-2 md:grid-cols-4">
                <FormField label="Category" htmlFor={`mega-registration-category-${category.key}`}>
                  <Input id={`mega-registration-category-${category.key}`} value={category.label} disabled />
                </FormField>
                <FormField label="Registration Fee (INR)" htmlFor={`mega-registration-fee-${category.key}`}>
                  <Input
                    id={`mega-registration-fee-${category.key}`}
                    type="number"
                    min={0}
                    value={proposalForm.proposalDetails.registrationDetails[category.key].registrationFee}
                    onChange={(event) =>
                      handleProposalRegistrationDetailChange(
                        category.key,
                        "registrationFee",
                        event.target.value
                      )}
                    placeholder="Registration fee (₹)"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <FormField label="Accommodation Charges (INR)" htmlFor={`mega-registration-accommodation-${category.key}`}>
                  <Input
                    id={`mega-registration-accommodation-${category.key}`}
                    type="number"
                    min={0}
                    value={proposalForm.proposalDetails.registrationDetails[category.key].accommodationCharges}
                    onChange={(event) =>
                      handleProposalRegistrationDetailChange(
                        category.key,
                        "accommodationCharges",
                        event.target.value
                      )}
                    placeholder="Accommodation charges (₹)"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <FormField label="Remarks" htmlFor={`mega-registration-remarks-${category.key}`}>
                  <Input
                    id={`mega-registration-remarks-${category.key}`}
                    value={proposalForm.proposalDetails.registrationDetails[category.key].remarks}
                    onChange={(event) =>
                      handleProposalRegistrationDetailChange(category.key, "remarks", event.target.value)}
                    placeholder="Remarks"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Approval Requested</p>
            <Checkbox
              checked={proposalForm.proposalDetails.approvalRequested.conductProgrammeAsProposed}
              onChange={(event) =>
                handleProposalDetailsChange(
                  ["approvalRequested", "conductProgrammeAsProposed"],
                  event.target.checked
                )}
              label="Conduct of the programme as proposed"
              disabled={!canCreateOrEditProposal}
            />
            <Checkbox
              checked={proposalForm.proposalDetails.approvalRequested.chargingRegistrationFees}
              onChange={(event) =>
                handleProposalDetailsChange(
                  ["approvalRequested", "chargingRegistrationFees"],
                  event.target.checked
                )}
              label="Charging of registration fees for guests and external participants"
              disabled={!canCreateOrEditProposal}
            />
            <Checkbox
              checked={proposalForm.proposalDetails.approvalRequested.utilisationOfCollectedFees}
              onChange={(event) =>
                handleProposalDetailsChange(
                  ["approvalRequested", "utilisationOfCollectedFees"],
                  event.target.checked
                )}
              label="Utilisation of collected fees for programme expenditure"
              disabled={!canCreateOrEditProposal}
            />
            <Checkbox
              checked={proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport}
              onChange={(event) =>
                handleProposalDetailsChange(
                  ["approvalRequested", "additionalInstitutionalSupport"],
                  event.target.checked
                )}
              label="Any additional institutional support"
              disabled={!canCreateOrEditProposal}
            />
            {proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport && (
              <FormField label="Additional Institutional Support Details" htmlFor="mega-additional-support-details">
                <Textarea
                  id="mega-additional-support-details"
                  value={proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupportDetails}
                  onChange={(event) =>
                    handleProposalDetailsChange(
                      ["approvalRequested", "additionalInstitutionalSupportDetails"],
                      event.target.value
                    )}
                  rows={2}
                  placeholder="Additional institutional support details"
                  disabled={!canCreateOrEditProposal}
                />
              </FormField>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        title="Mega Event Expenses"
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        width={960}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsExpenseOpen(false)}>Close</Button>
            {canCreateOrEditExpense && (
              <Button onClick={handleSaveExpense} loading={submitting}>
                {expenseData ? "Update Expense" : "Submit Expense"}
              </Button>
            )}
            {canReviewExpense && (
              <>
                <Button variant="danger" onClick={handleRejectExpense} loading={submitting}>Reject</Button>
                <Button variant="success" onClick={handleApproveExpense} loading={submitting}>Approve</Button>
              </>
            )}
          </div>
        )}
      >
        <div className="space-y-4">
          {expenseData && (
            <Alert type="info" title="Current expense status">
              {(expenseData.approvalStatus || "pending").replace(/_/g, " ")}
            </Alert>
          )}

          {(expenseForm.bills || []).map((bill, index) => (
            <div key={`bill-${index}`} className="space-y-3 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Bill {index + 1}</p>
                {canCreateOrEditExpense && expenseForm.bills.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setExpenseForm((prev) => ({
                        ...prev,
                        bills: prev.bills.filter((_, billIndex) => billIndex !== index),
                      }))
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <FormField label="Bill Description" htmlFor={`mega-bill-description-${index}`} required>
                <Input
                  id={`mega-bill-description-${index}`}
                  value={bill.description}
                  onChange={(event) => updateBillField(index, "description", event.target.value)}
                  placeholder="Bill description"
                  disabled={!canCreateOrEditExpense}
                />
              </FormField>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Amount (INR)" htmlFor={`mega-bill-amount-${index}`} required>
                  <Input
                    id={`mega-bill-amount-${index}`}
                    type="number"
                    min={0}
                    value={bill.amount}
                    onChange={(event) => updateBillField(index, "amount", event.target.value)}
                    placeholder="Amount"
                    disabled={!canCreateOrEditExpense}
                  />
                </FormField>
                <FormField label="Bill Date" htmlFor={`mega-bill-date-${index}`}>
                  <Input
                    id={`mega-bill-date-${index}`}
                    type="date"
                    value={bill.billDate}
                    onChange={(event) => updateBillField(index, "billDate", event.target.value)}
                    disabled={!canCreateOrEditExpense}
                  />
                </FormField>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Bill Number" htmlFor={`mega-bill-number-${index}`}>
                  <Input
                    id={`mega-bill-number-${index}`}
                    value={bill.billNumber}
                    onChange={(event) => updateBillField(index, "billNumber", event.target.value)}
                    placeholder="Bill number"
                    disabled={!canCreateOrEditExpense}
                  />
                </FormField>
                <FormField label="Vendor Name" htmlFor={`mega-bill-vendor-${index}`}>
                  <Input
                    id={`mega-bill-vendor-${index}`}
                    value={bill.vendor}
                    onChange={(event) => updateBillField(index, "vendor", event.target.value)}
                    placeholder="Vendor"
                    disabled={!canCreateOrEditExpense}
                  />
                </FormField>
              </div>

              <PdfUploadField
                label="Bill PDF"
                value={bill.attachmentUrl}
                onChange={(value) => updateBillField(index, "attachmentUrl", value)}
                onUpload={uploadBillPdf}
                required
                disabled={!canCreateOrEditExpense}
                viewerTitle="Bill Document"
              />
            </div>
          ))}

          {canCreateOrEditExpense && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExpenseForm((prev) => ({ ...prev, bills: [...prev.bills, createDefaultBill()] }))}
            >
              <Plus size={14} /> Add Bill
            </Button>
          )}

          <PdfUploadField
            label="Event Report PDF"
            value={expenseForm.eventReportDocumentUrl}
            onChange={(value) => setExpenseForm((prev) => ({ ...prev, eventReportDocumentUrl: value }))}
            onUpload={uploadEventReportPdf}
            required
            disabled={!canCreateOrEditExpense}
            viewerTitle="Event Report Document"
          />

          <FormField label="Notes" htmlFor="mega-expense-notes">
            <Textarea
              id="mega-expense-notes"
              value={expenseForm.notes}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, notes: event.target.value }))}
              rows={3}
              placeholder="Notes"
              disabled={!canCreateOrEditExpense}
            />
          </FormField>

          {canReviewExpense && (
            <>
              {requiresExpenseStageSelection && (
                <div className="space-y-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Select next approval stage(s)
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                      <Checkbox
                        key={stage}
                        checked={expenseNextApprovalStages.includes(stage)}
                        onChange={() =>
                          toggleStageSelection(stage, expenseNextApprovalStages, setExpenseNextApprovalStages)}
                        label={stage}
                      />
                    ))}
                  </div>
                </div>
              )}
              <FormField label="Review Comments" htmlFor="mega-expense-review-comments">
                <Textarea
                  id="mega-expense-review-comments"
                  value={expenseComments}
                  onChange={(event) => setExpenseComments(event.target.value)}
                  rows={3}
                  placeholder="Review comments"
                />
              </FormField>
            </>
          )}

          {expenseData?._id && (
            <Card>
              <CardContent>
                <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)]">Approval History</h4>
                <ApprovalHistory
                  key={`expense-${selectedOccurrence?._id}-${expenseHistoryRefreshKey}`}
                  megaExpenseOccurrenceId={selectedOccurrence?._id}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default MegaEventsPage
