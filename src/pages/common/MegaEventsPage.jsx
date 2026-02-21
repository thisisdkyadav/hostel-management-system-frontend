import { useEffect, useMemo, useState } from "react"
import { Button, Modal, Input } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent } from "@/components/ui/layout"
import { Textarea, Checkbox, Select, Label } from "@/components/ui/form"
import { LoadingState, ErrorState, EmptyState, Alert, useToast } from "@/components/ui/feedback"
import { Badge } from "@/components/ui/data-display"
import { CalendarDays, History, Plus, FileText, Receipt, Building2, Users, Target, DollarSign, ClipboardCheck, MapPin, Clock } from "lucide-react"
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

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
  paddingTop: "var(--spacing-2)",
  marginBottom: "var(--spacing-2)",
}

const sectionLabelStyle = {
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

const sectionDividerStyle = {
  flex: 1,
  height: 1,
  backgroundColor: "var(--color-border-primary)",
}

const infoBoxStyle = {
  padding: "var(--spacing-3)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
}

const compactCardStyle = {
  padding: "var(--spacing-2) var(--spacing-3)",
  borderRadius: "var(--radius-card-sm)",
  border: "var(--border-1) solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-primary)",
}

// Panel styles for wide modal layout
const panelStyle = {
  padding: "var(--spacing-4)",
  borderRadius: "var(--radius-card-sm)",
  border: "var(--border-1) solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-primary)",
}

const panelHeaderStyle = {
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-primary)",
  marginBottom: "var(--spacing-3)",
  paddingBottom: "var(--spacing-2)",
  borderBottom: "var(--border-1) solid var(--color-border-primary)",
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
}

const panelAccentStyle = {
  ...panelStyle,
  backgroundColor: "var(--color-bg-secondary)",
  border: "none",
}

const Panel = ({ title, icon: Icon, accent = false, children }) => (
  <div style={accent ? panelAccentStyle : panelStyle}>
    {title && (
      <div style={panelHeaderStyle}>
        {Icon && <Icon size={16} style={{ color: "var(--color-primary)" }} />}
        <span>{title}</span>
      </div>
    )}
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      {children}
    </div>
  </div>
)

const FormField = ({ label, htmlFor, required = false, children }) => (
  <div>
    <Label htmlFor={htmlFor} required={required} size="sm" style={formLabelStyles}>
      {label}
    </Label>
    {children}
  </div>
)

const SectionHeader = ({ children }) => (
  <div style={sectionHeaderStyle}>
    <span style={sectionLabelStyle}>{children}</span>
    <div style={sectionDividerStyle} />
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
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--spacing-2)" }}>
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
      <div style={{ flex: 1, padding: "var(--spacing-6)" }}>
        <div style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "var(--border-1) solid var(--color-danger)" }}>
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
                          <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>{selectedSeries.name}</h3>
                          <p style={{ margin: 0, marginTop: 2, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                            {formatDateRange(selectedOccurrence.scheduledStartDate, selectedOccurrence.scheduledEndDate)}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
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
                        style={{
                          flex: 1,
                          padding: "var(--spacing-4)",
                          borderRadius: "var(--radius-card-sm)",
                          backgroundColor: "var(--color-bg-secondary)",
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>{selectedOccurrence.title}</h4>
                        {selectedOccurrence.description ? (
                          <p style={{ marginTop: "var(--spacing-3)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{selectedOccurrence.description}</p>
                        ) : (
                          <p style={{ marginTop: "var(--spacing-3)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                            Description will be available after proposal details are added.
                          </p>
                        )}

                        <div style={{ marginTop: "var(--spacing-4)", display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
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
                          <p style={{ marginTop: "var(--spacing-3)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
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
        width={480}
        footer={(
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => setIsCreateSeriesOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateSeries} loading={submitting}>Create</Button>
          </div>
        )}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
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
        </div>
      </Modal>

      <Modal
        title="Create Occurrence"
        isOpen={isCreateOccurrenceOpen}
        onClose={() => setIsCreateOccurrenceOpen(false)}
        width={420}
        footer={(
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => setIsCreateOccurrenceOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateOccurrence} loading={submitting}>Create</Button>
          </div>
        )}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Select the date range for this occurrence.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
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
        title={`${selectedSeries?.name || "Mega Event"} — Occurrences`}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        width={480}
        footer={<Button size="sm" variant="secondary" onClick={() => setIsHistoryOpen(false)}>Close</Button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
          {occurrences.length === 0 ? (
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>No occurrences available.</p>
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
                  style={{
                    ...compactCardStyle,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "var(--transition-colors)",
                    ...(isSelected ? {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-primary-bg)",
                    } : {}),
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)" }}>
                    <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
                      {entry.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1)" }}>
                      <Badge variant={isPresent ? "success" : "default"} size="sm">
                        {isPresent ? "Present" : "Past"}
                      </Badge>
                      <Badge variant={statusBadgeVariant(entry.status)} size="sm">
                        {(entry.status || "unknown").replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <p style={{ marginTop: 2, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
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
        width={680}
        footer={(
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => setIsProposalOpen(false)}>Close</Button>
            {canCreateOrEditProposal && (
              <Button size="sm" onClick={handleSaveProposal} loading={submitting}>
                {proposalData ? "Update Proposal" : "Submit Proposal"}
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
          </div>
        )}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          {proposalData && (
            <Alert type="info" title="Current proposal status">
              {(proposalData.status || "draft").replace(/_/g, " ")}
            </Alert>
          )}

          {/* Details card with action */}
          <div style={{ ...infoBoxStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                {proposalForm.proposalDetails.programmeTitle || "Programme title not set"}
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                {proposalForm.proposalDetails.organisingUnit.unitType} · {proposalForm.proposalDetails.programmeDetails.programmeType} · {proposalForm.proposalDetails.programmeDetails.mode}
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {proposalForm.proposalDetails.programmeDetails.datesAndDuration || "Dates not added"}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsProposalDetailsOpen(true)}>
              {canCreateOrEditProposal ? "Edit Details" : "View Details"}
            </Button>
          </div>

          {!isDetailedProposalComplete && (
            <Alert type="warning" title="Details incomplete">
              Complete mandatory fields before submitting.
            </Alert>
          )}

          {detailedProposalPreviewText && (
            <div style={infoBoxStyle}>
              <span style={sectionLabelStyle}>Proposal Preview</span>
              <div style={{ marginTop: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {detailedProposalPreviewText.slice(0, 400)}{detailedProposalPreviewText.length > 400 ? "..." : ""}
              </div>
            </div>
          )}

          <SectionHeader>Financials</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-2)" }}>
            <FormField label="Expected Income" htmlFor="mega-total-expected-income">
              <Input
                id="mega-total-expected-income"
                type="number"
                min={0}
                value={String(computedTotalExpectedIncome)}
                placeholder="Auto"
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
                placeholder="Amount"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <FormField label="Registration Fee" htmlFor="mega-registration-fee-source">
              <Input
                id="mega-registration-fee-source"
                type="number"
                min={0}
                value={String(toNumericValue(proposalForm.proposalDetails?.sourceOfFunds?.registrationFee))}
                placeholder="From source"
                disabled
              />
            </FormField>
          </div>

          <Checkbox
            checked={proposalForm.accommodationRequired}
            onChange={(event) => setProposalForm((prev) => ({ ...prev, accommodationRequired: event.target.checked }))}
            label="Accommodation required"
            disabled={!canCreateOrEditProposal}
          />

          {detailedExternalGuestsText && (
            <div style={infoBoxStyle}>
              <span style={sectionLabelStyle}>External Guests</span>
              <div style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                {detailedExternalGuestsText}
              </div>
            </div>
          )}

          <SectionHeader>Documents</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
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
          </div>

          {canReviewProposal && (
            <>
              <SectionHeader>Review</SectionHeader>
              {requiresProposalStageSelection && (
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>Next Approval Stage(s)</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-2)", marginTop: "var(--spacing-2)" }}>
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
                  rows={2}
                  placeholder="Review comments"
                />
              </FormField>
            </>
          )}

          {proposalData?._id && (
            <div style={infoBoxStyle}>
              <span style={sectionLabelStyle}>Approval History</span>
              <div style={{ marginTop: "var(--spacing-2)" }}>
                <ApprovalHistory
                  key={`proposal-${selectedOccurrence?._id}-${proposalHistoryRefreshKey}`}
                  megaProposalOccurrenceId={selectedOccurrence?._id}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title="Proposal Details Format"
        isOpen={isProposalDetailsOpen}
        onClose={() => setIsProposalDetailsOpen(false)}
        width={1200}
        footer={(
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => setIsProposalDetailsOpen(false)}>
              Close
            </Button>
          </div>
        )}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          {/* Programme Title - Full Width Header */}
          <div style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-primary-bg)", border: "var(--border-1) solid var(--color-primary)", }}>
            <FormField label="Programme Title" htmlFor="mega-proposal-programme-title" required>
              <Input
                id="mega-proposal-programme-title"
                value={proposalForm.proposalDetails.programmeTitle}
                onChange={(event) => handleProposalDetailsChange(["programmeTitle"], event.target.value)}
                placeholder="Enter the full title of the programme"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              {/* Programme Details Panel */}
              <Panel title="Programme Details" icon={CalendarDays}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                  <FormField label="Programme Type" htmlFor="mega-proposal-programme-type" required>
                    <Select
                      id="mega-proposal-programme-type"
                      options={PROGRAMME_TYPE_OPTIONS}
                      value={proposalForm.proposalDetails.programmeDetails.programmeType}
                      onChange={(event) => handleProposalDetailsChange(["programmeDetails", "programmeType"], event.target.value)}
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--spacing-2)" }}>
                  <FormField label="Dates & Duration" htmlFor="mega-proposal-dates-duration" required>
                    <Input
                      id="mega-proposal-dates-duration"
                      value={proposalForm.proposalDetails.programmeDetails.datesAndDuration}
                      onChange={(event) => handleProposalDetailsChange(["programmeDetails", "datesAndDuration"], event.target.value)}
                      placeholder="e.g., 3-5 March, 3 days"
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
                      onChange={(event) => handleProposalDetailsChange(["programmeDetails", "expectedParticipants"], event.target.value)}
                      placeholder="Count"
                      disabled={!canCreateOrEditProposal}
                    />
                  </FormField>
                </div>
              </Panel>

              {/* Background & Rationale Panel */}
              <Panel title="Background & Rationale" icon={FileText} accent>
                <FormField label="Context and Relevance" htmlFor="mega-proposal-context-relevance" required>
                  <Textarea
                    id="mega-proposal-context-relevance"
                    value={proposalForm.proposalDetails.backgroundAndRationale.contextRelevance}
                    onChange={(event) => handleProposalDetailsChange(["backgroundAndRationale", "contextRelevance"], event.target.value)}
                    rows={2}
                    placeholder="Describe the background context and relevance of this programme"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <FormField label="Expected Impact" htmlFor="mega-proposal-expected-impact" required>
                  <Textarea
                    id="mega-proposal-expected-impact"
                    value={proposalForm.proposalDetails.backgroundAndRationale.expectedImpact}
                    onChange={(event) => handleProposalDetailsChange(["backgroundAndRationale", "expectedImpact"], event.target.value)}
                    rows={2}
                    placeholder="Expected institutional/societal impact"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <FormField label="Alignment with Objectives" htmlFor="mega-proposal-alignment-objectives" required>
                  <Textarea
                    id="mega-proposal-alignment-objectives"
                    value={proposalForm.proposalDetails.backgroundAndRationale.alignmentWithObjectives}
                    onChange={(event) => handleProposalDetailsChange(["backgroundAndRationale", "alignmentWithObjectives"], event.target.value)}
                    rows={2}
                    placeholder="How does this align with institute objectives?"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
              </Panel>

              {/* Objectives Panel */}
              <Panel title="Programme Objectives" icon={Target}>
                <FormField label="Primary Objective" htmlFor="mega-proposal-objective-1" required>
                  <Input
                    id="mega-proposal-objective-1"
                    value={proposalForm.proposalDetails.objectives.objective1}
                    onChange={(event) => handleProposalDetailsChange(["objectives", "objective1"], event.target.value)}
                    placeholder="Main objective of the programme"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                  <FormField label="Secondary Objective" htmlFor="mega-proposal-objective-2">
                    <Input
                      id="mega-proposal-objective-2"
                      value={proposalForm.proposalDetails.objectives.objective2}
                      onChange={(event) => handleProposalDetailsChange(["objectives", "objective2"], event.target.value)}
                      placeholder="Optional"
                      disabled={!canCreateOrEditProposal}
                    />
                  </FormField>
                  <FormField label="Tertiary Objective" htmlFor="mega-proposal-objective-3">
                    <Input
                      id="mega-proposal-objective-3"
                      value={proposalForm.proposalDetails.objectives.objective3}
                      onChange={(event) => handleProposalDetailsChange(["objectives", "objective3"], event.target.value)}
                      placeholder="Optional"
                      disabled={!canCreateOrEditProposal}
                    />
                  </FormField>
                </div>
              </Panel>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              {/* Organising Unit Panel */}
              <Panel title="Organising Unit" icon={Building2} accent>
                <FormField label="Unit Type" htmlFor="mega-proposal-organising-unit-type" required>
                  <Select
                    id="mega-proposal-organising-unit-type"
                    options={ORGANISING_UNIT_OPTIONS}
                    value={proposalForm.proposalDetails.organisingUnit.unitType}
                    onChange={(event) => handleProposalDetailsChange(["organisingUnit", "unitType"], event.target.value)}
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <FormField label="Coordinator Name(s)" htmlFor="mega-proposal-coordinator-names" required>
                  <Input
                    id="mega-proposal-coordinator-names"
                    value={proposalForm.proposalDetails.organisingUnit.coordinatorNames}
                    onChange={(event) => handleProposalDetailsChange(["organisingUnit", "coordinatorNames"], event.target.value)}
                    placeholder="Names of coordinators"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                  <FormField label="Contact Mobile" htmlFor="mega-proposal-contact-mobile" required>
                    <Input
                      id="mega-proposal-contact-mobile"
                      value={proposalForm.proposalDetails.organisingUnit.contactMobile}
                      onChange={(event) => handleProposalDetailsChange(["organisingUnit", "contactMobile"], event.target.value)}
                      placeholder="Mobile"
                      disabled={!canCreateOrEditProposal}
                    />
                  </FormField>
                  <FormField label="Contact Email" htmlFor="mega-proposal-contact-email" required>
                    <Input
                      id="mega-proposal-contact-email"
                      type="email"
                      value={proposalForm.proposalDetails.organisingUnit.contactEmail}
                      onChange={(event) => handleProposalDetailsChange(["organisingUnit", "contactEmail"], event.target.value)}
                      placeholder="Email"
                      disabled={!canCreateOrEditProposal}
                    />
                  </FormField>
                </div>
              </Panel>

              {/* Target Participants Panel */}
              <Panel title="Target Participants" icon={Users}>
                <FormField label="Institute Faculty / Staff / Students" htmlFor="mega-target-participants-institute">
                  <Textarea
                    id="mega-target-participants-institute"
                    value={proposalForm.proposalDetails.targetParticipants.instituteFacultyStaffStudents}
                    onChange={(event) => handleProposalDetailsChange(["targetParticipants", "instituteFacultyStaffStudents"], event.target.value)}
                    rows={2}
                    placeholder="Faculty, staff, students from the institute"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <FormField label="Guests / Invitees" htmlFor="mega-target-participants-guests">
                  <Textarea
                    id="mega-target-participants-guests"
                    value={proposalForm.proposalDetails.targetParticipants.guestsInvitees}
                    onChange={(event) => handleProposalDetailsChange(["targetParticipants", "guestsInvitees"], event.target.value)}
                    rows={2}
                    placeholder="Invited guests"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
                <FormField label="External Visitors / Participants" htmlFor="mega-target-participants-external">
                  <Textarea
                    id="mega-target-participants-external"
                    value={proposalForm.proposalDetails.targetParticipants.externalVisitorsParticipants}
                    onChange={(event) => handleProposalDetailsChange(["targetParticipants", "externalVisitorsParticipants"], event.target.value)}
                    rows={2}
                    placeholder="External participants"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
              </Panel>

              {/* Guest Details Panel */}
              <Panel title="Guest & Speaker Details" icon={Users} accent>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                  <FormField label="No. of Speakers/Guests" htmlFor="mega-tentative-speakers-guests">
                    <Input
                      id="mega-tentative-speakers-guests"
                      type="number"
                      min={0}
                      value={proposalForm.proposalDetails.guestsDetails.tentativeNumberOfSpeakersGuests}
                      onChange={(event) => handleProposalDetailsChange(["guestsDetails", "tentativeNumberOfSpeakersGuests"], event.target.value)}
                      placeholder="Count"
                      disabled={!canCreateOrEditProposal}
                    />
                  </FormField>
                  <FormField label="Registration Fee Source" htmlFor="mega-source-funds-registration-fee">
                    <Input
                      id="mega-source-funds-registration-fee"
                      type="number"
                      min={0}
                      value={proposalForm.proposalDetails.sourceOfFunds.registrationFee}
                      onChange={(event) => handleProposalDetailsChange(["sourceOfFunds", "registrationFee"], event.target.value)}
                      placeholder="₹"
                      disabled={!canCreateOrEditProposal}
                    />
                  </FormField>
                </div>
                <FormField label="Guest Names, Designations & Affiliations" htmlFor="mega-guests-details-names">
                  <Textarea
                    id="mega-guests-details-names"
                    value={proposalForm.proposalDetails.guestsDetails.guestsNamesDesignationAffiliations}
                    onChange={(event) => handleProposalDetailsChange(["guestsDetails", "guestsNamesDesignationAffiliations"], event.target.value)}
                    rows={3}
                    placeholder="List guests with their designation and affiliation"
                    disabled={!canCreateOrEditProposal}
                  />
                </FormField>
              </Panel>
            </div>
          </div>

          {/* Programme Schedule - Full Width */}
          <Panel title="Programme Schedule" icon={Clock}>
            <FormField label="Brief Schedule" htmlFor="mega-programme-schedule-brief" required>
              <Textarea
                id="mega-programme-schedule-brief"
                value={proposalForm.proposalDetails.programmeSchedule.brief}
                onChange={(event) => handleProposalDetailsChange(["programmeSchedule", "brief"], event.target.value)}
                rows={3}
                placeholder="Brief overview of the programme schedule"
                disabled={!canCreateOrEditProposal}
              />
            </FormField>
            <PdfUploadField
              label="Detailed Schedule (PDF)"
              value={proposalForm.proposalDetails.programmeSchedule.detailedScheduleAnnexureUrl}
              onChange={(value) => handleProposalDetailsChange(["programmeSchedule", "detailedScheduleAnnexureUrl"], value)}
              onUpload={uploadScheduleAnnexurePdf}
              disabled={!canCreateOrEditProposal}
              viewerTitle="Detailed Schedule Annexure"
            />
          </Panel>

          {/* Source of Funds - Full Width */}
          <Panel title="Source of Funds" icon={DollarSign} accent>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-2)" }}>
              <FormField label="Registration Fee" htmlFor="mega-source-funds-registration-fee-main">
                <Input
                  id="mega-source-funds-registration-fee-main"
                  type="number"
                  min={0}
                  value={proposalForm.proposalDetails.sourceOfFunds.registrationFee}
                  onChange={(event) => handleProposalDetailsChange(["sourceOfFunds", "registrationFee"], event.target.value)}
                  placeholder="₹"
                  disabled={!canCreateOrEditProposal}
                />
              </FormField>
              <FormField label="Gymkhana Fund" htmlFor="mega-source-funds-gymkhana">
                <Input
                  id="mega-source-funds-gymkhana"
                  type="number"
                  min={0}
                  value={proposalForm.proposalDetails.sourceOfFunds.gymkhanaFund}
                  onChange={(event) => handleProposalDetailsChange(["sourceOfFunds", "gymkhanaFund"], event.target.value)}
                  placeholder="₹"
                  disabled={!canCreateOrEditProposal}
                />
              </FormField>
              <FormField label="Institute Support" htmlFor="mega-source-funds-institute-support">
                <Input
                  id="mega-source-funds-institute-support"
                  type="number"
                  min={0}
                  value={proposalForm.proposalDetails.sourceOfFunds.instituteSupport}
                  onChange={(event) => handleProposalDetailsChange(["sourceOfFunds", "instituteSupport"], event.target.value)}
                  placeholder="₹"
                  disabled={!canCreateOrEditProposal}
                />
              </FormField>
              <FormField label="Sponsorship / Grant" htmlFor="mega-source-funds-sponsorship">
                <Input
                  id="mega-source-funds-sponsorship"
                  type="number"
                  min={0}
                  value={proposalForm.proposalDetails.sourceOfFunds.sponsorshipGrant}
                  onChange={(event) => handleProposalDetailsChange(["sourceOfFunds", "sponsorshipGrant"], event.target.value)}
                  placeholder="₹"
                  disabled={!canCreateOrEditProposal}
                />
              </FormField>
            </div>
          </Panel>

          {/* Registration Details - Full Width Table-style */}
          <Panel title="Registration Details by Category" icon={ClipboardCheck}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr", gap: "var(--spacing-2)", padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-card-sm)", marginBottom: "var(--spacing-2)" }}>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Category</span>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Registration Fee</span>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Accommodation</span>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Remarks</span>
            </div>
            {REGISTRATION_CATEGORIES.map((category) => (
              <div key={category.key} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr", gap: "var(--spacing-2)", alignItems: "center", padding: "var(--spacing-2)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }}>
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{category.label}</span>
                <Input
                  id={`mega-registration-fee-${category.key}`}
                  type="number"
                  min={0}
                  value={proposalForm.proposalDetails.registrationDetails[category.key].registrationFee}
                  onChange={(event) => handleProposalRegistrationDetailChange(category.key, "registrationFee", event.target.value)}
                  placeholder="₹"
                  disabled={!canCreateOrEditProposal}
                />
                <Input
                  id={`mega-registration-accommodation-${category.key}`}
                  type="number"
                  min={0}
                  value={proposalForm.proposalDetails.registrationDetails[category.key].accommodationCharges}
                  onChange={(event) => handleProposalRegistrationDetailChange(category.key, "accommodationCharges", event.target.value)}
                  placeholder="₹"
                  disabled={!canCreateOrEditProposal}
                />
                <Input
                  id={`mega-registration-remarks-${category.key}`}
                  value={proposalForm.proposalDetails.registrationDetails[category.key].remarks}
                  onChange={(event) => handleProposalRegistrationDetailChange(category.key, "remarks", event.target.value)}
                  placeholder="Optional remarks"
                  disabled={!canCreateOrEditProposal}
                />
              </div>
            ))}
          </Panel>

          {/* Approval Requested - Full Width */}
          <Panel title="Approval Requested" icon={ClipboardCheck} accent>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
              <Checkbox
                checked={proposalForm.proposalDetails.approvalRequested.conductProgrammeAsProposed}
                onChange={(event) => handleProposalDetailsChange(["approvalRequested", "conductProgrammeAsProposed"], event.target.checked)}
                label="Conduct of the programme as proposed"
                disabled={!canCreateOrEditProposal}
              />
              <Checkbox
                checked={proposalForm.proposalDetails.approvalRequested.chargingRegistrationFees}
                onChange={(event) => handleProposalDetailsChange(["approvalRequested", "chargingRegistrationFees"], event.target.checked)}
                label="Charging registration fees for guests/external participants"
                disabled={!canCreateOrEditProposal}
              />
              <Checkbox
                checked={proposalForm.proposalDetails.approvalRequested.utilisationOfCollectedFees}
                onChange={(event) => handleProposalDetailsChange(["approvalRequested", "utilisationOfCollectedFees"], event.target.checked)}
                label="Utilisation of collected fees for programme expenditure"
                disabled={!canCreateOrEditProposal}
              />
              <Checkbox
                checked={proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport}
                onChange={(event) => handleProposalDetailsChange(["approvalRequested", "additionalInstitutionalSupport"], event.target.checked)}
                label="Additional institutional support"
                disabled={!canCreateOrEditProposal}
              />
            </div>
            {proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport && (
              <FormField label="Additional Support Details" htmlFor="mega-additional-support-details">
                <Textarea
                  id="mega-additional-support-details"
                  value={proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupportDetails}
                  onChange={(event) => handleProposalDetailsChange(["approvalRequested", "additionalInstitutionalSupportDetails"], event.target.value)}
                  rows={2}
                  placeholder="Describe the additional institutional support required"
                  disabled={!canCreateOrEditProposal}
                />
              </FormField>
            )}
          </Panel>
        </div>
      </Modal>

      <Modal
        title="Mega Event Expenses"
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        width={680}
        footer={(
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
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
          </div>
        )}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          {expenseData && (
            <Alert type="info" title="Expense status">
              {(expenseData.approvalStatus || "pending").replace(/_/g, " ")}
            </Alert>
          )}

          <SectionHeader>Bills</SectionHeader>
          {(expenseForm.bills || []).map((bill, index) => (
            <div key={`bill-${index}`} style={{ ...compactCardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)" }}>
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>Bill {index + 1}</span>
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

              <FormField label="Description" htmlFor={`mega-bill-description-${index}`} required>
                <Input
                  id={`mega-bill-description-${index}`}
                  value={bill.description}
                  onChange={(event) => updateBillField(index, "description", event.target.value)}
                  placeholder="Bill description"
                  disabled={!canCreateOrEditExpense}
                />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
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
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
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
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>Next Approval Stage(s)</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-2)", marginTop: "var(--spacing-2)" }}>
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
                  rows={2}
                  placeholder="Review comments"
                />
              </FormField>
            </>
          )}

          {expenseData?._id && (
            <div style={infoBoxStyle}>
              <span style={sectionLabelStyle}>Approval History</span>
              <div style={{ marginTop: "var(--spacing-2)" }}>
                <ApprovalHistory
                  key={`expense-${selectedOccurrence?._id}-${expenseHistoryRefreshKey}`}
                  megaExpenseOccurrenceId={selectedOccurrence?._id}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default MegaEventsPage
