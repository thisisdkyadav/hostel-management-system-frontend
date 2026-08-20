import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Alert, Badge, Button, Card, CardContent, Checkbox, DetailSection, EmptyState, ErrorState, Grid, Heading, HStack, Input, LoadingState, Modal, Surface, Text, Textarea, useToast, VStack } from "hzero"
import PageHeader from "@/components/common/PageHeader"
import { CalendarDays, History, Plus, FileText, Receipt, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import uploadApi from "@/service/modules/upload.api"
import { FormField, SectionHeader, sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { GymkhanaProposalDetailsModal } from "@/components/gymkhana/events-page/proposalDetailsModal"
import { ProposalDossier, ProposalLedger, ProposalPapers } from "@/components/gymkhana/events-page/proposalDossier"
import {
  getProposalDetailsCompleteness,
  ORGANISING_UNIT_OPTIONS,
  PROGRAMME_MODE_OPTIONS,
  PROGRAMME_TYPE_OPTIONS,
  REGISTRATION_CATEGORIES,
} from "@/components/gymkhana/events-page/shared"

const EXPENSE_STATUS_TO_APPROVER = {
  pending: "Student Affairs",
  pending_student_affairs: "Student Affairs",
  pending_officer: "Officer SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}

const PROPOSAL_STATUS_TO_APPROVER = {
  pending: "Student Affairs",
  pending_president: "President Gymkhana",
  pending_student_affairs: "Student Affairs",
  pending_officer: "Officer SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}

const POST_STUDENT_AFFAIRS_STAGE_OPTIONS = [
  "Officer SA",
  "Associate Dean SA",
  "Dean SA",
]

const layoutStyles = {
  masterDetail: {
    display: "flex",
    gap: "var(--spacing-4)",
    height: "100%",
    minHeight: 0,
  },
  sidebar: {
    width: 264,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-3)",
    backgroundColor: "var(--color-bg-primary)",
    border: "var(--border-1) solid var(--color-border-primary)",
    borderRadius: "var(--radius-card)",
    padding: "var(--spacing-3)",
    minHeight: 0,
  },
  sidebarHeader: {
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0 var(--spacing-1)",
  },
  sidebarList: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-1)",
  },
  seriesItem: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-2)",
    width: "100%",
    textAlign: "left",
    padding: "var(--spacing-2) var(--spacing-3)",
    borderRadius: "var(--radius-md)",
    border: "var(--border-1) solid transparent",
    backgroundColor: "transparent",
    color: "var(--color-text-body)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    cursor: "pointer",
    transition: "var(--transition-colors)",
  },
  seriesItemActive: {
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
    borderColor: "var(--color-primary)",
    fontWeight: "var(--font-weight-semibold)",
  },
  detail: {
    flex: 1,
    minWidth: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  },
  detailHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--spacing-2)",
  },
  occStrip: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--spacing-2)",
  },
  occChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-2)",
    padding: "var(--spacing-1-5) var(--spacing-3)",
    borderRadius: "var(--radius-button-pill)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-text-body)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    cursor: "pointer",
    transition: "var(--transition-colors)",
    whiteSpace: "nowrap",
  },
  occChipActive: {
    borderColor: "var(--color-primary)",
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
    fontWeight: "var(--font-weight-semibold)",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "var(--spacing-3)",
  },
  miniStat: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-2)",
    padding: "var(--spacing-3)",
    borderRadius: "var(--radius-card-sm)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
  },
}

const MiniStat = ({ icon: Icon, label, value, tone = "var(--color-primary)" }) => (
  <div style={layoutStyles.miniStat}>
    <HStack gap={2} align="center">
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--color-bg-secondary)",
          color: tone,
        }}
      >
        {Icon && <Icon size={14} />}
      </span>
      <Text as="span" size="xs" weight="semibold" color="muted" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </Text>
    </HStack>
    <Text as="div" size="base" weight="semibold" color="heading" style={{ textTransform: "capitalize", wordBreak: "break-word" }}>
      {value}
    </Text>
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
  const { toast } = useToast()

  const isAdminLevel = user?.role === "Admin" || user?.role === "Super Admin"
  const isGymkhana = user?.role === "Gymkhana"
  const isPresident = isGymkhana && user?.subRole === "President Gymkhana"
  const isGS = isGymkhana && user?.subRole === "GS Gymkhana"
  const canViewEventsCapability = true
  const canCreateEventsCapability = true
  const canApproveEventsCapability = true
  const maxApprovalAmount = null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [series, setSeries] = useState([])
  const [selectedSeriesId, setSelectedSeriesId] = useState("")
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [occurrences, setOccurrences] = useState([])
  const [latestOccurrence, setLatestOccurrence] = useState(null)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState("")

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
  const isDetailedProposalComplete = useMemo(
    () => hasRequiredDetailedProposalFields(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )
  const detailsCompleteness = useMemo(
    () => getProposalDetailsCompleteness(proposalForm.proposalDetails),
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

  // Deep links from approval emails: ?series=<id>&occurrence=<id>&review=proposal|expense
  const [searchParams] = useSearchParams()
  const megaDeepLinkRef = useRef("")

  useEffect(() => {
    const seriesParam = searchParams.get("series")
    if (seriesParam && seriesParam !== selectedSeriesId) {
      setSelectedSeriesId(seriesParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    const occurrenceParam = searchParams.get("occurrence")
    if (!occurrenceParam) return
    if (occurrenceParam !== selectedOccurrenceId && occurrences.some((entry) => String(entry._id) === occurrenceParam)) {
      setSelectedOccurrenceId(occurrenceParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, occurrences])

  useEffect(() => {
    const review = searchParams.get("review")
    const occurrenceParam = searchParams.get("occurrence")
    if (!review || !occurrenceParam || String(selectedOccurrence?._id) !== occurrenceParam) return
    const key = `${review}:${occurrenceParam}`
    if (megaDeepLinkRef.current === key) return
    megaDeepLinkRef.current = key
    if (review === "proposal") setIsProposalOpen(true)
    else if (review === "expense") setIsExpenseOpen(true)
  }, [searchParams, selectedOccurrence?._id])

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
    const normalizedProposalComments = String(proposalComments || "").trim()
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
        normalizedProposalComments,
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
    const normalizedProposalComments = String(proposalComments || "").trim()
    if (normalizedProposalComments.length < 10) {
      toast.error("Rejection reason must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectMegaOccurrenceProposal(selectedOccurrence._id, normalizedProposalComments)
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
    const normalizedProposalComments = String(proposalComments || "").trim()
    if (normalizedProposalComments.length < 10) {
      toast.error("Revision comments must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.requestMegaOccurrenceProposalRevision(
        selectedOccurrence._id,
        normalizedProposalComments
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
    const normalizedExpenseComments = String(expenseComments || "").trim()
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
        normalizedExpenseComments,
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
    const normalizedExpenseComments = String(expenseComments || "").trim()
    if (normalizedExpenseComments.length < 10) {
      toast.error("Rejection reason must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectMegaOccurrenceExpense(selectedOccurrence._id, normalizedExpenseComments)
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
    <HStack gap={2} align="center" wrap>
      {canCreateOccurrence && (
        <Button size="md" onClick={() => setIsCreateOccurrenceOpen(true)}>
          <Plus size={16} /> Add Occurrence
        </Button>
      )}
    </HStack>
  )

  if (!canViewEventsCapability) {
    return (
      <div style={{ flex: 1, padding: "var(--spacing-6)" }}>
        <Text as="div" color="danger-text" style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-danger-bg)", border: "var(--border-1) solid var(--color-danger)" }}>
          You do not have permission to view mega events.
        </Text>
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

      <div style={{ flex: 1, overflow: "hidden", padding: "var(--spacing-6)" }}>
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
                  ? "Create your first mega event series to get started."
                  : "No mega event series available yet."}
              />
              {canCreateSeries && (
                <HStack gap="none" justify="center" style={{ marginTop: "var(--spacing-4)" }}>
                  <Button onClick={() => setIsCreateSeriesOpen(true)}>
                    <Plus size={16} /> New Series
                  </Button>
                </HStack>
              )}
            </CardContent>
          </Card>
        ) : (
          <div style={layoutStyles.masterDetail}>
            <aside style={layoutStyles.sidebar}>
              <div style={layoutStyles.sidebarHeader}>Series</div>
              <div style={layoutStyles.sidebarList}>
                {series.map((entry) => {
                  const isActive = selectedSeriesId === entry._id
                  return (
                    <button
                      key={entry._id}
                      type="button"
                      onClick={() => setSelectedSeriesId(entry._id)}
                      style={{
                        ...layoutStyles.seriesItem,
                        ...(isActive ? layoutStyles.seriesItemActive : {}),
                      }}
                    >
                      <CalendarDays size={15} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</span>
                    </button>
                  )
                })}
              </div>
              {canCreateSeries && (
                <Button size="sm" variant="secondary" fullWidth onClick={() => setIsCreateSeriesOpen(true)}>
                  <Plus size={14} /> New Series
                </Button>
              )}
            </aside>

            <section style={layoutStyles.detail}>
              {!selectedSeries ? (
                <EmptyState
                  title="Select a series"
                  message="Choose a mega event series from the list to view its occurrences."
                />
              ) : !selectedOccurrence ? (
                <Alert type="info" title="No occurrence yet">
                  <VStack gap={3} align="start">
                    <span>Create a new occurrence for {selectedSeries.name}.</span>
                    {canCreateOccurrence && (
                      <Button size="sm" onClick={() => setIsCreateOccurrenceOpen(true)}>
                        <Plus size={14} /> Add Occurrence
                      </Button>
                    )}
                  </VStack>
                </Alert>
              ) : (
                <>
                  <div style={layoutStyles.detailHeader}>
                    <div>
                      <Heading as="h2" size="xl" weight="semibold" color="heading" style={{ margin: 0 }}>{selectedSeries.name}</Heading>
                      <Text size="sm" color="muted" style={{ margin: 0, marginTop: 2 }}>
                        {formatDateRange(selectedOccurrence.scheduledStartDate, selectedOccurrence.scheduledEndDate)}
                      </Text>
                    </div>
                    <HStack gap={2} align="center">
                      <Badge variant={selectedOccurrence._id === latestOccurrence?._id ? "success" : "default"}>
                        {selectedOccurrence._id === latestOccurrence?._id ? "Present" : "Past"}
                      </Badge>
                      <Badge variant={statusBadgeVariant(selectedOccurrence.status)}>
                        {(selectedOccurrence.status || "unknown").replace(/_/g, " ")}
                      </Badge>
                    </HStack>
                  </div>

                  {occurrences.length > 0 && (
                    <VStack gap={2}>
                      <span style={sectionLabelStyle}>Occurrences</span>
                      <div style={layoutStyles.occStrip}>
                        {occurrences.map((entry) => {
                          const isActive = selectedOccurrence._id === entry._id
                          const isPresent = latestOccurrence?._id === entry._id
                          return (
                            <button
                              key={entry._id}
                              type="button"
                              onClick={() => setSelectedOccurrenceId(entry._id)}
                              style={{
                                ...layoutStyles.occChip,
                                ...(isActive ? layoutStyles.occChipActive : {}),
                              }}
                            >
                              {isPresent && (
                                <span style={{ width: 7, height: 7, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-success)" }} />
                              )}
                              <span>{entry.title}</span>
                            </button>
                          )
                        })}
                      </div>
                    </VStack>
                  )}

                  <div style={layoutStyles.summaryGrid}>
                    <MiniStat
                      icon={FileText}
                      label="Proposal"
                      tone="var(--color-primary)"
                      value={proposalData?.status ? proposalData.status.replace(/_/g, " ") : "Not started"}
                    />
                    <MiniStat
                      icon={Receipt}
                      label="Expense"
                      tone="var(--color-warning)"
                      value={expenseData?.approvalStatus ? expenseData.approvalStatus.replace(/_/g, " ") : "Not started"}
                    />
                    <MiniStat
                      icon={DollarSign}
                      label="Expected Income"
                      tone="var(--color-success)"
                      value={proposalData?.totalExpectedIncome != null ? `₹${Number(proposalData.totalExpectedIncome).toLocaleString()}` : "—"}
                    />
                    <MiniStat
                      icon={DollarSign}
                      label="Expenditure"
                      tone="var(--color-info)"
                      value={proposalData?.totalExpenditure != null ? `₹${Number(proposalData.totalExpenditure).toLocaleString()}` : "—"}
                    />
                  </div>

                  <Surface bg="primary" padding={4} radius="card-sm" border="var(--border-1) solid var(--color-border-primary)">
                    <Heading as="h4" size="base" weight="semibold" color="heading" style={{ margin: 0 }}>{selectedOccurrence.title}</Heading>
                    {selectedOccurrence.description ? (
                      <Text size="sm" color="body" leading={1.55} style={{ marginTop: "var(--spacing-3)" }}>{selectedOccurrence.description}</Text>
                    ) : (
                      <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-3)" }}>
                        Description will be available after proposal details are added.
                      </Text>
                    )}

                    <HStack gap={2} wrap style={{ marginTop: "var(--spacing-4)" }}>
                      {canCreateOrEditProposal && (
                        <Button size="sm" onClick={() => setIsProposalOpen(true)}>
                          <FileText size={14} /> {proposalData ? "Open the brief" : "Write the brief"}
                        </Button>
                      )}
                      {(proposalData || canReviewProposal) && (
                        <Button size="sm" variant="secondary" onClick={() => setIsProposalOpen(true)}>
                          <History size={14} /> Review the brief
                        </Button>
                      )}
                      {(expenseData || canCreateOrEditExpense || canReviewExpense) && (
                        <Button size="sm" variant="secondary" onClick={() => setIsExpenseOpen(true)}>
                          <Receipt size={14} /> Expense Flow
                        </Button>
                      )}
                    </HStack>
                    {!canCreateOrEditProposal && !canCreateOrEditExpense && !canReviewProposal && !canReviewExpense && (
                      <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-3)" }}>
                        You have read-only access for this occurrence.
                      </Text>
                    )}
                  </Surface>
                </>
              )}
            </section>
          </div>
        )}
      </div>

      <Modal
        title="Create Mega Event Series"
        isOpen={isCreateSeriesOpen}
        onClose={() => setIsCreateSeriesOpen(false)}
        width={480}
        footer={(
          <HStack gap={2} justify="end">
            <Button size="sm" variant="secondary" onClick={() => setIsCreateSeriesOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateSeries} loading={submitting}>Create</Button>
          </HStack>
        )}
      >
        <VStack gap={3}>
          <FormField label="Event Series Name" htmlFor="mega-series-name" required>
            <Input
              id="mega-series-name"
              value={seriesForm.name}
              onChange={(event) => setSeriesForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g., Flux, IPL Fest, Alumni Summit"
            />
          </FormField>
          <FormField label="Description" htmlFor="mega-series-description">
            <Textarea
              id="mega-series-description"
              value={seriesForm.description}
              onChange={(event) => setSeriesForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Optional description"
              rows={2}
            />
          </FormField>
        </VStack>
      </Modal>

      <Modal
        title="Create Occurrence"
        isOpen={isCreateOccurrenceOpen}
        onClose={() => setIsCreateOccurrenceOpen(false)}
        width={420}
        footer={(
          <HStack gap={2} justify="end">
            <Button size="sm" variant="secondary" onClick={() => setIsCreateOccurrenceOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateOccurrence} loading={submitting}>Create</Button>
          </HStack>
        )}
      >
        <VStack gap={3}>
          <Text size="sm" color="muted">
            Select the date range for this occurrence.
          </Text>
          <Grid cols={2} gap={2}>
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
          </Grid>
        </VStack>
      </Modal>

      <Modal
        title={!proposalData ? `New brief${selectedOccurrence?.title ? `: ${selectedOccurrence.title}` : ""}` : `Programme brief${selectedOccurrence?.title ? `: ${selectedOccurrence.title}` : ""}`}
        description={
          !proposalData
            ? "Write it as if the Dean has two minutes. The brief is the case; the rest is the paper around it."
            : undefined
        }
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        width={1080}
        closeButtonVariant="button"
        footer={(
          <HStack gap={2} justify="end" wrap>
            <Button size="sm" variant="secondary" onClick={() => setIsProposalOpen(false)}>Close</Button>
            {canCreateOrEditProposal && (
              <Button size="sm" onClick={handleSaveProposal} loading={submitting} disabled={!isProposalFormValid}>
                {proposalData ? "Save the brief" : "Submit this brief"}
              </Button>
            )}
            {canReviewProposal && (
              <>
                <Button size="sm" variant="outline" onClick={handleRequestProposalRevision} loading={submitting}>
                  Request Revision
                </Button>
                <Button size="sm" variant="danger" onClick={handleRejectProposal} loading={submitting}>Reject</Button>
                <Button size="sm" variant="success" onClick={handleApproveProposal} loading={submitting}>Approve</Button>
              </>
            )}
          </HStack>
        )}
      >
        <VStack gap={4}>
          {proposalData ? (
            <Alert type="info" title="Where this stands">
              {(proposalData.status || "draft").replace(/_/g, " ")}
            </Alert>
          ) : (
            <Alert type="info" title="A new brief">
              You are writing the case for {selectedOccurrence?.title || "this occurrence"}. Name the programme first.
            </Alert>
          )}

          <HStack gap={3} align="center" justify="between" wrap>
            <Text as="div" size="sm" weight="semibold" color="heading">
              Programme brief
            </Text>
            <Button variant="primary" size="sm" onClick={() => setIsProposalDetailsOpen(true)}>
              {canCreateOrEditProposal
                ? detailsCompleteness.requiredFilled === 0
                  ? "Write the brief"
                  : detailsCompleteness.complete
                    ? "Refine the brief"
                    : "Continue the brief"
                : "Read the full brief"}
            </Button>
          </HStack>

          {!isDetailedProposalComplete && detailsCompleteness.requiredFilled > 0 && (
            <Alert type="warning" title="The brief is still open">
              {detailsCompleteness.requiredTotal - detailsCompleteness.requiredFilled} required{" "}
              {detailsCompleteness.requiredTotal - detailsCompleteness.requiredFilled === 1 ? "line is" : "lines are"}{" "}
              still missing.
            </Alert>
          )}

          <ProposalDossier
            details={proposalForm.proposalDetails}
            variant="compact"
            completeness={detailsCompleteness}
            action={
              detailsCompleteness.requiredFilled === 0 ? (
                <Button variant="secondary" size="sm" onClick={() => setIsProposalDetailsOpen(true)}>
                  {canCreateOrEditProposal ? "Write the brief" : "Read the full brief"}
                </Button>
              ) : null
            }
          />

          <SectionHeader>The ledger</SectionHeader>
          <ProposalLedger
            idPrefix="mega"
            income={computedTotalExpectedIncome}
            expenditure={proposalForm.totalExpenditure}
            onExpenditureChange={(value) => setProposalForm((prev) => ({ ...prev, totalExpenditure: value }))}
            registrationFee={toNumericValue(proposalForm.proposalDetails?.sourceOfFunds?.registrationFee)}
            accommodationRequired={proposalForm.accommodationRequired}
            onAccommodationChange={(checked) => setProposalForm((prev) => ({ ...prev, accommodationRequired: checked }))}
            estimatedBudget={proposalData?.eventBudgetAtSubmission}
            editable={canCreateOrEditProposal}
          />

          <SectionHeader>The papers</SectionHeader>
          <ProposalPapers
            proposalUrl={proposalForm.proposalDocumentUrl}
            onProposalUrl={(value) => setProposalForm((prev) => ({ ...prev, proposalDocumentUrl: value }))}
            onUploadProposal={uploadProposalPdf}
            guestUrl={proposalForm.chiefGuestDocumentUrl}
            onGuestUrl={(value) => setProposalForm((prev) => ({ ...prev, chiefGuestDocumentUrl: value }))}
            onUploadGuest={uploadChiefGuestPdf}
            disabled={!canCreateOrEditProposal}
          />

          {canReviewProposal && (
            <>
              <SectionHeader>Stand behind it</SectionHeader>
              {requiresProposalStageSelection && (
                <DetailSection title="Next Approval Stage(s)">
                  <Grid cols={3} gap={2}>
                    {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                      <Checkbox
                        key={stage}
                        checked={proposalNextApprovalStages.includes(stage)}
                        onChange={() =>
                          toggleStageSelection(stage, proposalNextApprovalStages, setProposalNextApprovalStages)}
                        label={stage}
                      />
                    ))}
                  </Grid>
                </DetailSection>
              )}
              <FormField label="Review Comments" htmlFor="mega-proposal-review-comments">
                <Textarea
                  id="mega-proposal-review-comments"
                  value={proposalComments}
                  onChange={(event) => setProposalComments(event.target.value)}
                  rows={2}
                  placeholder="What you would say in the corridor"
                />
              </FormField>
            </>
          )}

          {proposalData?._id && (
            <DetailSection title="How it got here">
              <ApprovalHistory
                key={`proposal-${selectedOccurrence?._id}-${proposalHistoryRefreshKey}`}
                megaProposalOccurrenceId={selectedOccurrence?._id}
              />
            </DetailSection>
          )}
        </VStack>
      </Modal>

      <GymkhanaProposalDetailsModal
        isOpen={isProposalDetailsOpen}
        onClose={() => setIsProposalDetailsOpen(false)}
        proposalForm={proposalForm}
        canEditProposalForm={canCreateOrEditProposal}
        handleProposalDetailsChange={handleProposalDetailsChange}
        uploadScheduleAnnexureDocument={uploadScheduleAnnexurePdf}
        handleProposalRegistrationDetailChange={handleProposalRegistrationDetailChange}
        programmeTypeOptions={PROGRAMME_TYPE_OPTIONS}
        programmeModeOptions={PROGRAMME_MODE_OPTIONS}
        organisingUnitOptions={ORGANISING_UNIT_OPTIONS}
        registrationCategories={REGISTRATION_CATEGORIES}
      />

      <Modal
        title="Mega Event Expenses"
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        width={680}
        footer={(
          <HStack gap={2} justify="end" wrap>
            <Button size="sm" variant="secondary" onClick={() => setIsExpenseOpen(false)}>Close</Button>
            {canCreateOrEditExpense && (
              <Button size="sm" onClick={handleSaveExpense} loading={submitting}>
                {expenseData ? "Update" : "Submit"}
              </Button>
            )}
            {canReviewExpense && (
              <>
                <Button size="sm" variant="danger" onClick={handleRejectExpense} loading={submitting}>Reject</Button>
                <Button size="sm" variant="success" onClick={handleApproveExpense} loading={submitting}>Approve</Button>
              </>
            )}
          </HStack>
        )}
      >
        <VStack gap={3}>
          {expenseData && (
            <Alert type="info" title="Expense status">
              {(expenseData.approvalStatus || "pending").replace(/_/g, " ")}
            </Alert>
          )}

          <SectionHeader>Bills</SectionHeader>
          {(expenseForm.bills || []).map((bill, index) => (
            <VStack gap={2} key={`bill-${index}`}>
              <HStack gap={2} align="center" justify="between">
                <Text as="span" size="sm" weight="semibold" color="secondary">Bill {index + 1}</Text>
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
              </HStack>

              <FormField label="Description" htmlFor={`mega-bill-description-${index}`} required>
                <Input
                  id={`mega-bill-description-${index}`}
                  value={bill.description}
                  onChange={(event) => updateBillField(index, "description", event.target.value)}
                  placeholder="Bill description"
                  disabled={!canCreateOrEditExpense}
                />
              </FormField>
              <Grid cols={2} gap={2}>
                <FormField label="Amount (₹)" htmlFor={`mega-bill-amount-${index}`} required>
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
                <FormField label="Date" htmlFor={`mega-bill-date-${index}`}>
                  <Input
                    id={`mega-bill-date-${index}`}
                    type="date"
                    value={bill.billDate}
                    onChange={(event) => updateBillField(index, "billDate", event.target.value)}
                    disabled={!canCreateOrEditExpense}
                  />
                </FormField>
              </Grid>
              <Grid cols={2} gap={2}>
                <FormField label="Bill Number" htmlFor={`mega-bill-number-${index}`}>
                  <Input
                    id={`mega-bill-number-${index}`}
                    value={bill.billNumber}
                    onChange={(event) => updateBillField(index, "billNumber", event.target.value)}
                    placeholder="Bill number"
                    disabled={!canCreateOrEditExpense}
                  />
                </FormField>
                <FormField label="Vendor" htmlFor={`mega-bill-vendor-${index}`}>
                  <Input
                    id={`mega-bill-vendor-${index}`}
                    value={bill.vendor}
                    onChange={(event) => updateBillField(index, "vendor", event.target.value)}
                    placeholder="Vendor"
                    disabled={!canCreateOrEditExpense}
                  />
                </FormField>
              </Grid>

              <PdfUploadField
                label="Bill PDF"
                value={bill.attachmentUrl}
                onChange={(value) => updateBillField(index, "attachmentUrl", value)}
                onUpload={uploadBillPdf}
                required
                disabled={!canCreateOrEditExpense}
                viewerTitle="Bill Document"
              />
            </VStack>
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

          <SectionHeader>Event Report</SectionHeader>
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
              rows={2}
              placeholder="Notes"
              disabled={!canCreateOrEditExpense}
            />
          </FormField>

          {canReviewExpense && (
            <>
              <SectionHeader>Review</SectionHeader>
              {requiresExpenseStageSelection && (
                <DetailSection title="Next Approval Stage(s)">
                  <Grid cols={3} gap={2}>
                    {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                      <Checkbox
                        key={stage}
                        checked={expenseNextApprovalStages.includes(stage)}
                        onChange={() =>
                          toggleStageSelection(stage, expenseNextApprovalStages, setExpenseNextApprovalStages)}
                        label={stage}
                      />
                    ))}
                  </Grid>
                </DetailSection>
              )}
              <FormField label="Review Comments" htmlFor="mega-expense-review-comments">
                <Textarea
                  id="mega-expense-review-comments"
                  value={expenseComments}
                  onChange={(event) => setExpenseComments(event.target.value)}
                  rows={2}
                  placeholder="Review comments"
                />
              </FormField>
            </>
          )}

          {expenseData?._id && (
            <DetailSection title="Approval History">
              <ApprovalHistory
                key={`expense-${selectedOccurrence?._id}-${expenseHistoryRefreshKey}`}
                megaExpenseOccurrenceId={selectedOccurrence?._id}
              />
            </DetailSection>
          )}
        </VStack>
      </Modal>
    </div>
  )
}

export default MegaEventsPage
