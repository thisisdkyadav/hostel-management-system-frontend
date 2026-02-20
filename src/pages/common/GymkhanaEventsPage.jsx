/**
 * Gymkhana Events Page
 * Calendar view with year selector, event list, and role-based actions:
 * - GS Gymkhana: Add/Edit events
 * - President Gymkhana: Edit all pre-submission events + submit calendar
 */

import { useState, useEffect, useMemo, useRef, createElement } from "react"
import { Tabs, Button, DataTable, Modal, Table, Input } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent } from "@/components/ui/layout"
import { Select, Textarea, Checkbox } from "@/components/ui/form"
import {
  LoadingState, ErrorState, EmptyState, Alert, useToast, } from "@/components/ui/feedback"
import { Badge, StatCards } from "@/components/ui/data-display"
import { ToggleButtonGroup } from "@/components/ui"
import {
  CompactEventSection,
  CompactInfoRow,
  EventMetaChip,
  CompactInfoGrid,
  CompactFormField,
} from "@/components/common/gymkhana"
import {
  CalendarDays,
  Plus,
  Lock,
  Unlock,
  Send,
  X,
  FileText,
  Check,
  History,
  Settings,
  List,
  Receipt,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Bell,
  CircleDollarSign,
  Clock3,
  NotebookText,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import useAuthz from "@/hooks/useAuthz"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import uploadApi from "@/service/modules/upload.api"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"

const CATEGORY_OPTIONS = [
  { value: "academic", label: "Academic" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "technical", label: "Technical" },
]

const CATEGORY_LABELS = {
  academic: "Academic",
  cultural: "Cultural",
  sports: "Sports",
  technical: "Technical",
}

const CATEGORY_COLORS = {
  academic: "#475569",   // Slate - professional, scholarly
  cultural: "#BE185D",   // Rose - creative, vibrant
  sports: "#0D9488",     // Teal - energetic, balanced
  technical: "#D97706",  // Amber - innovative, modern
}

const CATEGORY_BADGE_BACKGROUNDS = {
  academic: "#F1F5F9",   // Slate-50
  cultural: "#FFF1F2",   // Rose-50
  sports: "#F0FDFA",     // Teal-50
  technical: "#FFFBEB",  // Amber-50
}

const CALENDAR_WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const CALENDAR_DAY_TINT = {
  holiday: "var(--color-warning-bg)",
  saturday: "var(--color-primary-bg)",
  sunday: "var(--color-danger-bg-light)",
}
const CALENDAR_DAY_BORDER = {
  holiday: "var(--color-warning)",
  saturday: "var(--color-primary)",
  sunday: "var(--color-danger-light)",
}

const getCategoryBadgeStyle = (category) => ({
  backgroundColor: CATEGORY_BADGE_BACKGROUNDS[category] || "var(--color-primary-bg)",
  color: CATEGORY_COLORS[category] || "var(--color-primary)",
  border: "1px solid transparent",
})

const CATEGORY_ORDER = ["academic", "cultural", "sports", "technical"]
const VALID_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/
const CALENDAR_STATUS_TO_APPROVER = {
  pending_president: "President Gymkhana",
  pending_student_affairs: "Student Affairs",
  pending_joint_registrar: "Joint Registrar SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}
const PROPOSAL_STATUS_TO_APPROVER = {
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
    minWidth: "100px",
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
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-muted)",
  marginBottom: "var(--spacing-1)",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
}

const eventDetailMetaChipStyles = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-muted)",
  padding: "2px 8px",
  borderRadius: "var(--radius-badge)",
  border: "var(--border-1) solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-secondary)",
}

// Compact event detail section card
const EventDetailSectionCard = ({ icon: Icon, title, accentColor = "var(--color-primary)", children, headerAction = null }) => (
  <div
    style={{
      background: "var(--color-bg-primary)",
      borderRadius: "var(--radius-card-sm)",
      border: "var(--border-1) solid var(--color-border-primary)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-2) var(--spacing-3)",
        borderBottom: "var(--border-1) solid var(--color-border-primary)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "var(--radius-sm)",
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            color: accentColor,
          }}
        >
          {createElement(Icon, { size: 12 })}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-heading)",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}
        >
          {title}
        </span>
      </div>
      {headerAction}
    </div>
    <div style={{ padding: "var(--spacing-3)" }}>{children}</div>
  </div>
)

// Compact info row for key-value displays
const EventDetailInfoRow = ({ label, value, valueColor }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-1) 0",
    }}
  >
    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{label}</span>
    <span
      style={{
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        color: valueColor || "var(--color-text-body)",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
)

const getEventStatusVariant = (status) => {
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

const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDateKey = (value) => {
  const parsed = toDate(value)
  if (!parsed) return null
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const startOfDay = (dateValue) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const normalizeEvent = (event) => ({
  ...event,
  startDate: event.startDate || event.tentativeDate || null,
  endDate: event.endDate || event.tentativeDate || null,
})

const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  const startA = toDate(aStart)
  const endA = toDate(aEnd)
  const startB = toDate(bStart)
  const endB = toDate(bEnd)
  if (!startA || !endA || !startB || !endB) return false
  return startA <= endB && startB <= endA
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "TBD"
  const start = new Date(startDate)
  const end = new Date(endDate)
  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return start.toLocaleDateString()
  }

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}

const getBudgetSummary = (events = []) => {
  const byCategory = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = 0
    return acc
  }, {})
  const counts = CATEGORY_ORDER.reduce((acc, category) => {
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

const getDateConflicts = (events = []) => {
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

const normalizeEventId = (eventId) => {
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

const createDefaultOverlapState = () => ({
  status: "idle",
  hasOverlap: false,
  overlaps: [],
  checkedKey: null,
  checkingKey: null,
  errorMessage: "",
})

const createDefaultProposalForm = () => ({
  proposalText: "",
  proposalDocumentUrl: "",
  externalGuestsDetails: "",
  chiefGuestDocumentUrl: "",
  accommodationRequired: false,
  hasRegistrationFee: false,
  registrationFeeAmount: "",
  totalExpectedIncome: "",
  totalExpenditure: "",
})

const createEmptyBill = () => ({
  localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  description: "",
  amount: "",
  billNumber: "",
  billDate: "",
  vendor: "",
  documentUrl: "",
  documentName: "",
})

const createDefaultExpenseForm = () => ({
  bills: [createEmptyBill()],
  eventReportDocumentUrl: "",
  notes: "",
})

const toProposalForm = (proposal) => ({
  proposalText: proposal?.proposalText || "",
  proposalDocumentUrl: proposal?.proposalDocumentUrl || "",
  externalGuestsDetails: proposal?.externalGuestsDetails || "",
  chiefGuestDocumentUrl: proposal?.chiefGuestDocumentUrl || "",
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

const buildProposalPayload = (proposalForm) => ({
  proposalText: proposalForm.proposalText?.trim(),
  proposalDocumentUrl: proposalForm.proposalDocumentUrl?.trim() || "",
  externalGuestsDetails: proposalForm.externalGuestsDetails?.trim() || "",
  chiefGuestDocumentUrl: proposalForm.chiefGuestDocumentUrl?.trim() || "",
  accommodationRequired: Boolean(proposalForm.accommodationRequired),
  hasRegistrationFee: Boolean(proposalForm.hasRegistrationFee),
  registrationFeeAmount: proposalForm.hasRegistrationFee
    ? Number(proposalForm.registrationFeeAmount || 0)
    : 0,
  totalExpectedIncome: Number(proposalForm.totalExpectedIncome || 0),
  totalExpenditure: Number(proposalForm.totalExpenditure || 0),
})

const toDateInputValue = (value) => {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().split("T")[0]
}

const getFilenameFromUrl = (url = "") => {
  if (!url || typeof url !== "string") return "bill.pdf"
  const cleanedUrl = url.split("?")[0]
  const parts = cleanedUrl.split("/")
  const candidate = parts[parts.length - 1]
  return candidate || "bill.pdf"
}

const toExpenseForm = (expense) => ({
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

const buildExpensePayload = (expenseForm) => ({
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

const isProposalWindowOpen = (event) => {
  if (event?.proposalSubmitted) return false
  const dueDate = getProposalDueDate(event)
  if (!dueDate) return false
  const dueDateStart = startOfDay(dueDate)
  const todayStart = startOfDay(new Date())
  if (!dueDateStart || !todayStart) return false
  return dueDateStart <= todayStart
}

const getProposalDueDate = (event) => {
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

const mergeCalendarEventsWithGymkhanaEvents = (calendarEvents = [], gymkhanaEvents = []) => {
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

const toGymkhanaDisplayEvent = (event) => ({
  ...event,
  startDate: event.scheduledStartDate || null,
  endDate: event.scheduledEndDate || null,
  gymkhanaEventId: event._id || null,
  proposalSubmitted: Boolean(event.proposalSubmitted),
  proposalId: event.proposalId || null,
  proposalDueDate: getProposalDueDate(event),
  eventStatus: event.status || null,
})



const EventsPage = () => {
  const { user } = useAuth()
  const { can, getConstraint } = useAuthz()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [events, setEvents] = useState([])
  const [hasAttemptedCalendarLoad, setHasAttemptedCalendarLoad] = useState(false)
  const [proposalsForApproval, setProposalsForApproval] = useState([])
  const [pendingExpenseApprovals, setPendingExpenseApprovals] = useState([])
  const [viewMode, setViewMode] = useState("list")
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all")
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [calendarHolidays, setCalendarHolidays] = useState([])

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAmendmentModal, setShowAmendmentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showOverlapConfirmModal, setShowOverlapConfirmModal] = useState(false)
  const [showOverlapDetailsModal, setShowOverlapDetailsModal] = useState(false)
  const [showPendingProposalModal, setShowPendingProposalModal] = useState(false)
  const [showPendingBillsModal, setShowPendingBillsModal] = useState(false)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const [eventForm, setEventForm] = useState({
    title: "",
    category: "academic",
    startDate: "",
    endDate: "",
    estimatedBudget: "",
    description: "",
  })
  const [amendmentReason, setAmendmentReason] = useState("")
  const [newAcademicYear, setNewAcademicYear] = useState("")
  const [approvalComments, setApprovalComments] = useState("")
  const [calendarNextApprovalStages, setCalendarNextApprovalStages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [dateOverlapInfo, setDateOverlapInfo] = useState(createDefaultOverlapState)
  const [submitOverlapInfo, setSubmitOverlapInfo] = useState(null)
  const [proposalEvent, setProposalEvent] = useState(null)
  const [proposalData, setProposalData] = useState(null)
  const [proposalForm, setProposalForm] = useState(createDefaultProposalForm)
  const [proposalActionComments, setProposalActionComments] = useState("")
  const [proposalNextApprovalStages, setProposalNextApprovalStages] = useState([])
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalHistoryRefreshKey, setProposalHistoryRefreshKey] = useState(0)
  const [expenseEvent, setExpenseEvent] = useState(null)
  const [expenseData, setExpenseData] = useState(null)
  const [expenseForm, setExpenseForm] = useState(createDefaultExpenseForm)
  const [expenseLoading, setExpenseLoading] = useState(false)
  const [expenseApprovalComments, setExpenseApprovalComments] = useState("")
  const [expenseNextApprovalStages, setExpenseNextApprovalStages] = useState([])
  const [expenseHistoryRefreshKey, setExpenseHistoryRefreshKey] = useState(0)
  const overlapCheckRequestRef = useRef(0)
  const calendarRequestRef = useRef(0)

  const isGymkhanaRole = user?.role === "Gymkhana"
  const isAdminLevel = user?.role === "Admin" || user?.role === "Super Admin"
  const isSuperAdmin = user?.role === "Super Admin"
  const isGS = user?.subRole === "GS Gymkhana"
  const isPresident = user?.subRole === "President Gymkhana"
  const canViewEventsCapability = can("cap.events.view")
  const canCreateEventsCapability = can("cap.events.create")
  const canApproveEventsCapability = can("cap.events.approve")
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
  const canEditGS =
    calendar &&
    !calendar.isLocked &&
    isGS &&
    canCreateEventsCapability &&
    (calendar.status === "draft" || calendar.status === "rejected")
  const canEditPresident =
    calendar &&
    !calendar.isLocked &&
    isPresident &&
    canCreateEventsCapability &&
    ["draft", "rejected", "pending_president"].includes(calendar.status)
  const canEdit = canEditGS || canEditPresident
  const canSubmitCalendar = Boolean(
    calendar &&
      !calendar.isLocked &&
      isPresident &&
      canCreateEventsCapability &&
      calendar.status === "draft" &&
      events.length > 0
  )
  const canApprove = Boolean(
    calendar?.status &&
      canApproveEventsCapability &&
      user?.subRole &&
      CALENDAR_STATUS_TO_APPROVER[calendar.status] === user.subRole
  )
  const requiresCalendarNextApprovalSelection = Boolean(
    canApprove &&
      user?.subRole === "Student Affairs" &&
      calendar?.status === "pending_student_affairs"
  )
  const canManageCalendarLock = isAdminLevel && canApproveEventsCapability && Boolean(calendar?._id)
  const canCreateCalendar = isAdminLevel && canCreateEventsCapability

  const VIEW_OPTIONS = [
    { value: "list", label: "List", icon: <List size={14} /> },
    { value: "calendar", label: "Calendar", icon: <CalendarDays size={14} /> },
  ]

  const budgetSummary = useMemo(() => getBudgetSummary(events), [events])
  const categoryFilterTabs = useMemo(
    () => [
      { label: "All", value: "all", count: events.length },
      ...CATEGORY_OPTIONS.map((category) => ({
        label: category.label,
        value: category.value,
        count: budgetSummary.counts[category.value] || 0,
      })),
    ],
    [events.length, budgetSummary.counts]
  )
  const filteredEvents = useMemo(() => {
    if (activeCategoryFilter === "all") return events
    return events.filter((event) => event.category === activeCategoryFilter)
  }, [events, activeCategoryFilter])
  const eventTableColumns = useMemo(
    () => [
      {
        key: "title",
        header: "Event",
        render: (event) => (
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>{event.title}</span>
        ),
      },
      {
        key: "category",
        header: "Category",
        render: (event) => (
          <Badge style={getCategoryBadgeStyle(event.category)}>
            {CATEGORY_LABELS[event.category] || event.category}
          </Badge>
        ),
      },
      {
        key: "dateRange",
        header: "Date Range",
        render: (event) => formatDateRange(event.startDate, event.endDate),
      },
      {
        key: "estimatedBudget",
        header: "Budget",
        render: (event) => `₹${Number(event.estimatedBudget || 0).toLocaleString()}`,
      },
    ],
    []
  )
  const holidaysByDate = useMemo(() => {
    const map = new Map()
    for (const holiday of calendarHolidays || []) {
      const dateKey = formatDateKey(holiday?.date)
      if (!dateKey) continue
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey).push({
        title: holiday?.title || "Holiday",
        date: dateKey,
      })
    }
    return map
  }, [calendarHolidays])
  const budgetStats = useMemo(
    () => [
      {
        title: "Academic Budget",
        value: `₹${(budgetSummary.byCategory.academic || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.academic || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.academic,
        tintBackground: true,
      },
      {
        title: "Cultural Budget",
        value: `₹${(budgetSummary.byCategory.cultural || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.cultural || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.cultural,
        tintBackground: true,
      },
      {
        title: "Sports Budget",
        value: `₹${(budgetSummary.byCategory.sports || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.sports || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.sports,
        tintBackground: true,
      },
      {
        title: "Technical Budget",
        value: `₹${(budgetSummary.byCategory.technical || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.technical || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.technical,
        tintBackground: true,
      },
      {
        title: "Total Budget",
        value: `₹${budgetSummary.total.toLocaleString()}`,
        subtitle: `${events.length} event(s)`,
        icon: <FileText size={16} />,
        color: "var(--color-primary)",
      },
    ],
    [budgetSummary, events.length]
  )
  const dateConflicts = useMemo(() => getDateConflicts(events), [events])
  const pendingProposalReminders = useMemo(
    () => events.filter((event) => event.gymkhanaEventId && isProposalWindowOpen(event)),
    [events]
  )
  const selectedCalendarEventIds = useMemo(() => {
    const ids = new Set()
    for (const event of events) {
      const linkedEventId = normalizeEventId(event.gymkhanaEventId) || normalizeEventId(event._id)
      if (linkedEventId) ids.add(linkedEventId)
    }
    return ids
  }, [events])
  const pendingProposalsForSelectedCalendar = useMemo(
    () =>
      proposalsForApproval.filter((proposal) =>
        selectedCalendarEventIds.has(normalizeEventId(proposal?.eventId?._id))
      ),
    [proposalsForApproval, selectedCalendarEventIds]
  )
  const pendingExpenseApprovalsForSelectedCalendar = useMemo(
    () =>
      pendingExpenseApprovals.filter((expense) =>
        selectedCalendarEventIds.has(normalizeEventId(expense?.eventId?._id))
      ),
    [pendingExpenseApprovals, selectedCalendarEventIds]
  )
  const availableYearsForCreation = useMemo(() => {
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
  }, [years])
  const isProposalEditableByCurrentUser = useMemo(() => {
    if (!proposalData) return false
    if (isGS) {
      return proposalData.status === "revision_requested" || proposalData.status === "rejected"
    }
    if (isPresident) return proposalData.status === "pending_president"
    return false
  }, [proposalData, isGS, isPresident])
  const canCreateProposalForSelectedEvent = useMemo(() => {
    if (!proposalEvent) return false
    return (
      isGS &&
      canCreateEventsCapability &&
      isProposalWindowOpen(proposalEvent) &&
      !proposalData &&
      proposalEvent.gymkhanaEventId
    )
  }, [proposalEvent, isGS, canCreateEventsCapability, proposalData])
  const isProposalWithinApprovalLimit = useMemo(
    () =>
      maxApprovalAmount === null ||
      Number(proposalData?.totalExpenditure || 0) <= maxApprovalAmount,
    [maxApprovalAmount, proposalData?.totalExpenditure]
  )
  const canCurrentUserReviewProposal = useMemo(() => {
    if (!canApproveEventsCapability) return false
    if (!proposalData?.status || !user?.subRole) return false
    if (!isProposalWithinApprovalLimit) return false
    return PROPOSAL_STATUS_TO_APPROVER[proposalData.status] === user.subRole
  }, [
    proposalData?.status,
    canApproveEventsCapability,
    isProposalWithinApprovalLimit,
    user?.subRole,
  ])
  const requiresProposalNextApprovalSelection = useMemo(
    () =>
      Boolean(
        canCurrentUserReviewProposal &&
          user?.subRole === "Student Affairs" &&
          proposalData?.status === "pending_student_affairs"
      ),
    [canCurrentUserReviewProposal, proposalData?.status, user?.subRole]
  )
  const proposalDeflection = useMemo(() => {
    if (!proposalEvent) return 0
    return Number(proposalForm.totalExpenditure || 0) - Number(proposalEvent.estimatedBudget || 0)
  }, [proposalForm.totalExpenditure, proposalEvent])
  const assignedExpenseBudget = useMemo(
    () => Number(expenseData?.estimatedBudget || expenseEvent?.estimatedBudget || 0),
    [expenseData?.estimatedBudget, expenseEvent?.estimatedBudget]
  )
  const expenseTotal = useMemo(
    () =>
      (expenseForm.bills || []).reduce(
        (total, bill) => total + Number(bill?.amount || 0),
        0
      ),
    [expenseForm.bills]
  )
  const expenseVariance = useMemo(
    () => expenseTotal - assignedExpenseBudget,
    [expenseTotal, assignedExpenseBudget]
  )
  const isExpenseFormValid = useMemo(() => {
    if (!Array.isArray(expenseForm.bills) || expenseForm.bills.length === 0) {
      return false
    }

    const areBillsValid = expenseForm.bills.every(
      (bill) =>
        bill.description?.trim() &&
        Number(bill.amount || 0) >= 0 &&
        Boolean(bill.documentUrl?.trim())
    )

    return areBillsValid && Boolean(expenseForm.eventReportDocumentUrl?.trim())
  }, [expenseForm.bills, expenseForm.eventReportDocumentUrl])
  const isExpenseSubmissionAllowedForSelectedEvent = useMemo(() => {
    if (!expenseEvent?.gymkhanaEventId) return false
    return expenseEvent.eventStatus === "proposal_approved"
  }, [expenseEvent])
  const canEditExpenseForm = useMemo(
    () =>
      isGS &&
      canCreateEventsCapability &&
      isExpenseSubmissionAllowedForSelectedEvent &&
      expenseData?.approvalStatus !== "approved",
    [isGS, canCreateEventsCapability, isExpenseSubmissionAllowedForSelectedEvent, expenseData?.approvalStatus]
  )
  const canApproveExpense = useMemo(
    () => {
      if (!canApproveEventsCapability) return false
      if (!isAdminLevel || !expenseData?._id) return false
      if (!expenseData?.approvalStatus || expenseData.approvalStatus === "approved") return false
      if (!expenseData.approvalStatus.startsWith("pending")) return false
      if (
        maxApprovalAmount !== null &&
        Number(expenseData.totalExpenditure || 0) > maxApprovalAmount
      ) {
        return false
      }
      if (isSuperAdmin) return true

      const expenseStatusBySubRole = {
        "Student Affairs": "pending_student_affairs",
        "Joint Registrar SA": "pending_joint_registrar",
        "Associate Dean SA": "pending_associate_dean",
        "Dean SA": "pending_dean",
      }

      if (user?.subRole === "Student Affairs") {
        return (
          expenseData.approvalStatus === "pending" ||
          expenseData.approvalStatus === expenseStatusBySubRole[user.subRole]
        )
      }

      return expenseStatusBySubRole[user?.subRole] === expenseData.approvalStatus
    },
    [
      canApproveEventsCapability,
      isAdminLevel,
      isSuperAdmin,
      maxApprovalAmount,
      expenseData?._id,
      expenseData?.approvalStatus,
      expenseData?.totalExpenditure,
      user?.subRole,
    ]
  )
  const requiresExpenseNextApprovalSelection = useMemo(
    () =>
      Boolean(
        canApproveExpense &&
          (expenseData?.approvalStatus === "pending_student_affairs" ||
            expenseData?.approvalStatus === "pending")
      ),
    [canApproveExpense, expenseData?.approvalStatus]
  )
  const isDateRangeOrdered = useMemo(() => {
    if (!eventForm.startDate || !eventForm.endDate) return true
    return new Date(eventForm.endDate) >= new Date(eventForm.startDate)
  }, [eventForm.startDate, eventForm.endDate])

  const overlapCheckKey = useMemo(() => {
    if (!calendar?._id || !eventForm.startDate || !eventForm.endDate || !isDateRangeOrdered) {
      return null
    }
    return `${calendar._id}:${selectedEvent?._id || "new"}:${eventForm.startDate}:${eventForm.endDate}`
  }, [calendar?._id, eventForm.startDate, eventForm.endDate, isDateRangeOrdered, selectedEvent?._id])

  const overlapCheckCompletedForCurrentDates = Boolean(
    overlapCheckKey && dateOverlapInfo.status === "checked" && dateOverlapInfo.checkedKey === overlapCheckKey
  )

  const overlapCheckInProgressForCurrentDates = Boolean(
    overlapCheckKey && dateOverlapInfo.status === "pending" && dateOverlapInfo.checkingKey === overlapCheckKey
  )

  const isBaseEventFormValid = Boolean(
    eventForm.title?.trim() &&
      eventForm.category &&
      eventForm.startDate &&
      eventForm.endDate &&
      isDateRangeOrdered
  )

  const canSaveEventInModal = isBaseEventFormValid && overlapCheckCompletedForCurrentDates && !submitting
  const canSubmitAmendmentInModal = canSaveEventInModal && amendmentReason.length >= 10
  const isProposalFormValid = Boolean(
    proposalForm.proposalText?.trim() &&
      Number(proposalForm.totalExpectedIncome || 0) >= 0 &&
      Number(proposalForm.totalExpenditure || 0) >= 0 &&
      (!proposalForm.hasRegistrationFee || Number(proposalForm.registrationFeeAmount || 0) >= 0)
  )
  const canEditProposalForm = canCreateProposalForSelectedEvent || isProposalEditableByCurrentUser
  const calendarStatusLabel = calendar?.status ? calendar.status.replace(/_/g, " ") : ""
  const headerTitle = calendar?.academicYear
    ? `Activity Calendar ${calendar.academicYear}`
    : selectedYear
      ? `Activity Calendar ${selectedYear}`
    : "Events Calendar"
  const headerSubtitle = loading
    ? "Loading selected academic year..."
    : calendarStatusLabel
      ? `Status: ${calendarStatusLabel}`
      : selectedYear
        ? `No active calendar for ${selectedYear}`
        : "No active calendar"

  useEffect(() => {
    fetchYears()
  }, [user?.role, user?.subRole])

  useEffect(() => {
    if (selectedYear) {
      fetchCalendar(selectedYear, { resetData: true })
    }
  }, [selectedYear])

  useEffect(() => {
    if (!calendar?._id || viewMode !== "calendar") {
      setCalendarHolidays([])
      return
    }

    const loadCalendarMonthView = async () => {
      try {
        const monthStart = new Date(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth(),
          1
        )
        const monthEnd = new Date(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth() + 1,
          0
        )

        const response = await gymkhanaEventsApi.getCalendarView({
          startDate: formatDateKey(monthStart),
          endDate: formatDateKey(monthEnd),
        })
        const data = response.data || response || {}
        setCalendarHolidays(Array.isArray(data.holidays) ? data.holidays : [])
      } catch {
        setCalendarHolidays([])
      }
    }

    loadCalendarMonthView()
  }, [calendar?._id, calendarMonth, viewMode])

  const getPendingExpenseApprovals = async () => {
    if (!isAdminLevel) return []

    try {
      const firstPageResponse = await gymkhanaEventsApi.getAllExpenses({
        page: 1,
        limit: 100,
      })
      const firstPageData = firstPageResponse.data || firstPageResponse || {}
      const firstPageExpenses = firstPageData.expenses || []
      const totalPages = firstPageData.pagination?.pages || 1

      let expenses = [...firstPageExpenses]
      if (totalPages > 1) {
        const remainingPageRequests = []
        for (let page = 2; page <= totalPages; page += 1) {
          remainingPageRequests.push(
            gymkhanaEventsApi.getAllExpenses({
              page,
              limit: 100,
            })
          )
        }

        const remainingResponses = await Promise.all(remainingPageRequests)
        for (const response of remainingResponses) {
          const responseData = response.data || response || {}
          expenses = expenses.concat(responseData.expenses || [])
        }
      }

      return expenses.filter((expense) =>
        String(expense?.approvalStatus || "").startsWith("pending")
      )
    } catch {
      return []
    }
  }

  const fetchYears = async () => {
    if (!canViewEventsCapability) {
      setYears([])
      setSelectedYear(null)
      setCalendar(null)
      setEvents([])
      setHasAttemptedCalendarLoad(true)
      setLoading(false)
      return
    }

    try {
      setHasAttemptedCalendarLoad(false)
      const [yearsResponse, proposalsResponse, pendingExpenses] = await Promise.all([
        gymkhanaEventsApi.getAcademicYears(),
        user?.subRole
          ? gymkhanaEventsApi.getProposalsForApproval().catch(() => ({ data: { proposals: [] } }))
          : Promise.resolve({ data: { proposals: [] } }),
        isAdminLevel ? getPendingExpenseApprovals() : Promise.resolve([]),
      ])
      const yearsList = yearsResponse.data?.years || yearsResponse.years || []
      const approvals = proposalsResponse.data?.proposals || proposalsResponse.proposals || []

      setYears(yearsList)
      setProposalsForApproval(approvals)
      setPendingExpenseApprovals(pendingExpenses || [])
      setSelectedYear((previousYear) => {
        if (previousYear && yearsList.some((year) => year.academicYear === previousYear)) {
          return previousYear
        }
        return yearsList[0]?.academicYear || null
      })

      if (yearsList.length === 0) {
        setCalendar(null)
        setEvents([])
        setHasAttemptedCalendarLoad(true)
      }
    } catch (err) {
      setError(err.message || "Failed to load academic years")
      setHasAttemptedCalendarLoad(true)
    }
  }

  const fetchCalendar = async (year, { resetData = false, showLoader = resetData } = {}) => {
    if (!canViewEventsCapability) {
      setCalendar(null)
      setEvents([])
      setCalendarHolidays([])
      setHasAttemptedCalendarLoad(true)
      return
    }

    const requestId = ++calendarRequestRef.current
    try {
      if (showLoader) {
        setLoading(true)
      }
      setError(null)
      setHasAttemptedCalendarLoad(false)
      if (resetData) {
        setCalendar(null)
        setEvents([])
        setCalendarHolidays([])
      }
      const res = await gymkhanaEventsApi.getCalendarByYear(year)
      if (requestId !== calendarRequestRef.current) return
      const calendarData = res.data?.calendar || res.calendar || null

      if (!calendarData) {
        setCalendar(null)
        setEvents([])
        setHasAttemptedCalendarLoad(true)
        return
      }

      const normalizedEvents = (calendarData.events || []).map(normalizeEvent)
      let mergedEvents = normalizedEvents

      try {
        const firstPageRes = await gymkhanaEventsApi.getEvents({
          calendarId: calendarData._id,
          limit: 100,
          page: 1,
        })
        if (requestId !== calendarRequestRef.current) return
        const firstPageData = firstPageRes.data || firstPageRes || {}
        const firstPageEvents = firstPageData.events || []
        const totalPages = firstPageData.pagination?.pages || 1

        let gymkhanaEvents = [...firstPageEvents]
        if (totalPages > 1) {
          const remainingPageRequests = []
          for (let page = 2; page <= totalPages; page += 1) {
            remainingPageRequests.push(
              gymkhanaEventsApi.getEvents({
                calendarId: calendarData._id,
                limit: 100,
                page,
              })
            )
          }

          const remainingResponses = await Promise.all(remainingPageRequests)
          if (requestId !== calendarRequestRef.current) return
          for (const response of remainingResponses) {
            const responseData = response.data || response || {}
            gymkhanaEvents = gymkhanaEvents.concat(responseData.events || [])
          }
        }

        if (calendarData.status === "approved" && gymkhanaEvents.length > 0) {
          mergedEvents = gymkhanaEvents.map(toGymkhanaDisplayEvent)
        } else {
          mergedEvents = mergeCalendarEventsWithGymkhanaEvents(normalizedEvents, gymkhanaEvents)
        }
      } catch {
        mergedEvents = normalizedEvents
      }

      setCalendar({ ...calendarData, events: mergedEvents })
      setEvents(mergedEvents)
      setHasAttemptedCalendarLoad(true)
    } catch (err) {
      if (requestId !== calendarRequestRef.current) return
      if (err.status === 404) {
        setCalendar(null)
        setEvents([])
        setHasAttemptedCalendarLoad(true)
      } else {
        setError(err.message || "Failed to load calendar")
      }
    } finally {
      if (showLoader && requestId === calendarRequestRef.current) {
        setLoading(false)
      }
    }
  }

  const toggleNextApprovalStage = (stage, setStages) => {
    setStages((previousStages) => {
      if (previousStages.includes(stage)) {
        return previousStages.filter((existingStage) => existingStage !== stage)
      }
      return [...previousStages, stage]
    })
  }

  const getDaysInMonth = (date) => {
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

  const getEventsForDate = (date) => {
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

  const getHolidaysForDate = (date) => {
    if (!date) return []
    const dateKey = formatDateKey(date)
    if (!dateKey) return []
    return holidaysByDate.get(dateKey) || []
  }

  const toFormModel = (event) => {
    const normalized = normalizeEvent(event)
    return {
      title: normalized.title || "",
      category: normalized.category || "academic",
      startDate: normalized.startDate ? String(normalized.startDate).split("T")[0] : "",
      endDate: normalized.endDate ? String(normalized.endDate).split("T")[0] : "",
      estimatedBudget:
        normalized.estimatedBudget === null || normalized.estimatedBudget === undefined
          ? ""
          : String(normalized.estimatedBudget),
      description: normalized.description || "",
    }
  }

const buildEventPayload = (formData) => ({
  title: formData.title?.trim(),
  category: formData.category,
  startDate: formData.startDate,
  endDate: formData.endDate,
  estimatedBudget: Number(formData.estimatedBudget || 0),
  description: formData.description?.trim(),
})

const toCalendarEventPayload = (event) => {
  const normalized = normalizeEvent(event)
  return {
    title: normalized.title?.trim(),
    category: normalized.category,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    estimatedBudget: Number(normalized.estimatedBudget || 0),
    description: normalized.description?.trim(),
  }
}

  const resetDateOverlapInfo = () => {
    overlapCheckRequestRef.current += 1
    setDateOverlapInfo(createDefaultOverlapState())
  }

  const checkDateOverlap = async (candidateForm, eventId = null) => {
    if (!calendar?._id || !candidateForm.startDate || !candidateForm.endDate) {
      resetDateOverlapInfo()
      return
    }

    if (new Date(candidateForm.endDate) < new Date(candidateForm.startDate)) {
      resetDateOverlapInfo()
      return
    }

    const normalizedEventId = normalizeEventId(eventId)
    const checkKey = `${calendar._id}:${normalizedEventId || "new"}:${candidateForm.startDate}:${candidateForm.endDate}`
    const requestId = overlapCheckRequestRef.current + 1
    overlapCheckRequestRef.current = requestId

    setDateOverlapInfo((prev) => ({
      ...prev,
      status: "pending",
      checkingKey: checkKey,
      errorMessage: "",
    }))

    try {
      const overlapRequestPayload = {
        startDate: candidateForm.startDate,
        endDate: candidateForm.endDate,
        ...(normalizedEventId ? { eventId: normalizedEventId } : {}),
      }
      const res = await gymkhanaEventsApi.checkDateOverlap(calendar._id, overlapRequestPayload)
      if (requestId !== overlapCheckRequestRef.current) return
      const data = res.data || res || {}
      setDateOverlapInfo({
        status: "checked",
        hasOverlap: Boolean(data.hasOverlap),
        overlaps: data.overlaps || [],
        checkedKey: checkKey,
        checkingKey: null,
        errorMessage: "",
      })
    } catch {
      if (requestId !== overlapCheckRequestRef.current) return
      setDateOverlapInfo({
        status: "error",
        hasOverlap: false,
        overlaps: [],
        checkedKey: null,
        checkingKey: null,
        errorMessage: "Could not verify date overlap. Please retry.",
      })
    }
  }

  const retryDateOverlapCheck = () => {
    checkDateOverlap(eventForm, selectedEvent?._id)
  }

  const handleEventFormChange = (field, value) => {
    setEventForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "startDate" || field === "endDate") {
        checkDateOverlap(next, selectedEvent?._id)
      }
      return next
    })
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleEventRowClick = (event) => {
    if (canEdit) {
      handleEditEvent(event)
      return
    }

    if (calendar?.isLocked && isGS && canCreateEventsCapability) {
      openAmendmentModal(event)
      return
    }

    handleEventClick(event)
  }

  const fetchProposalForEvent = async (event) => {
    if (!event?.gymkhanaEventId) {
      setProposalData(null)
      setProposalForm(createDefaultProposalForm())
      return
    }

    try {
      setProposalLoading(true)
      const res = await gymkhanaEventsApi.getProposalByEvent(event.gymkhanaEventId)
      const proposal = res.data?.proposal || res.proposal || null
      setProposalData(proposal)
      setProposalForm(proposal ? toProposalForm(proposal) : createDefaultProposalForm())
    } catch (err) {
      if (err.status === 404) {
        setProposalData(null)
        setProposalForm(createDefaultProposalForm())
      } else {
        toast.error(err.message || "Failed to load proposal")
      }
    } finally {
      setProposalLoading(false)
    }
  }

  const openProposalModal = async (event) => {
    if (!canViewEventsCapability) {
      toast.error("You do not have permission to view event proposals")
      return
    }

    setProposalEvent(event)
    setProposalActionComments("")
    setProposalNextApprovalStages([])
    setProposalHistoryRefreshKey((prev) => prev + 1)
    setShowProposalModal(true)
    await fetchProposalForEvent(event)
  }

  const handleProposalFormChange = (field, value) => {
    setProposalForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const uploadProposalDocument = async (file) => {
    const formData = new FormData()
    formData.append("proposalPdf", file)
    return uploadApi.uploadEventProposalPDF(formData)
  }

  const uploadChiefGuestDocument = async (file) => {
    const formData = new FormData()
    formData.append("chiefGuestPdf", file)
    return uploadApi.uploadEventChiefGuestPDF(formData)
  }

  const handleCreateOrUpdateProposal = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit proposals")
      return
    }

    if (!proposalEvent?.gymkhanaEventId) {
      toast.error("Linked event record not found")
      return
    }

    if (!isProposalFormValid) {
      toast.error("Please complete all required proposal fields")
      return
    }

    const payload = buildProposalPayload(proposalForm)

    try {
      setSubmitting(true)

      if (proposalData?._id) {
        await gymkhanaEventsApi.updateProposal(proposalData._id, payload)
        toast.success("Proposal updated successfully")
      } else {
        await gymkhanaEventsApi.createProposal(proposalEvent.gymkhanaEventId, payload)
        toast.success("Proposal submitted successfully")
      }

      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to save proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const openPendingExpenseReview = async (expense) => {
    const eventEntity = expense?.eventId
    if (!eventEntity?._id) {
      toast.error("Linked event not found for this expense")
      return
    }

    await openExpenseModal({
      title: eventEntity.title || "Event Bills",
      gymkhanaEventId: eventEntity._id,
      estimatedBudget: Number(expense?.estimatedBudget || 0),
      startDate: eventEntity?.scheduledStartDate || null,
      endDate: eventEntity?.scheduledEndDate || null,
      eventStatus: "proposal_approved",
    })
  }

  const handleApproveProposal = async () => {
    if (!canCurrentUserReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!isProposalWithinApprovalLimit && maxApprovalAmount !== null) {
      toast.error(`Proposal amount exceeds your approval limit of ${maxApprovalAmount}`)
      return
    }
    if (
      requiresProposalNextApprovalSelection &&
      proposalNextApprovalStages.length === 0
    ) {
      toast.error("Select at least one next approval stage")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveProposal(
        proposalData._id,
        proposalActionComments,
        requiresProposalNextApprovalSelection ? proposalNextApprovalStages : []
      )
      toast.success("Proposal approved")
      setProposalActionComments("")
      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to approve proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectProposal = async () => {
    if (!canCurrentUserReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!proposalActionComments || proposalActionComments.length < 10) {
      toast.error("Please provide a rejection reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectProposal(proposalData._id, proposalActionComments)
      toast.success("Proposal rejected")
      setProposalActionComments("")
      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to reject proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestProposalRevision = async () => {
    if (!canCurrentUserReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!proposalActionComments || proposalActionComments.length < 10) {
      toast.error("Please provide revision notes (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.requestRevision(proposalData._id, proposalActionComments)
      toast.success("Revision requested")
      setProposalActionComments("")
      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to request revision")
    } finally {
      setSubmitting(false)
    }
  }

  const fetchExpenseForEvent = async (event) => {
    if (!event?.gymkhanaEventId) {
      setExpenseData(null)
      setExpenseForm(createDefaultExpenseForm())
      return
    }

    try {
      setExpenseLoading(true)
      const res = await gymkhanaEventsApi.getExpenseByEvent(event.gymkhanaEventId)
      const expense = res.data?.expense || res.expense || null
      setExpenseData(expense)
      setExpenseForm(expense ? toExpenseForm(expense) : createDefaultExpenseForm())
    } catch (err) {
      if (err.status === 404) {
        setExpenseData(null)
        setExpenseForm(createDefaultExpenseForm())
      } else {
        toast.error(err.message || "Failed to load bills")
      }
    } finally {
      setExpenseLoading(false)
    }
  }

  const openExpenseModal = async (event) => {
    if (!canViewEventsCapability) {
      toast.error("You do not have permission to view event expenses")
      return
    }

    setExpenseEvent(event)
    setExpenseApprovalComments("")
    setExpenseNextApprovalStages([])
    setExpenseHistoryRefreshKey((prev) => prev + 1)
    setShowExpenseModal(true)
    await fetchExpenseForEvent(event)
  }

  const handleExpenseFormChange = (field, value) => {
    setExpenseForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBillFieldChange = (localId, field, value) => {
    setExpenseForm((prev) => ({
      ...prev,
      bills: (prev.bills || []).map((bill) =>
        bill.localId === localId ? { ...bill, [field]: value } : bill
      ),
    }))
  }

  const handleAddBillRow = () => {
    setExpenseForm((prev) => ({
      ...prev,
      bills: [...(prev.bills || []), createEmptyBill()],
    }))
  }

  const handleRemoveBillRow = (localId) => {
    setExpenseForm((prev) => {
      const nextBills = (prev.bills || []).filter((bill) => bill.localId !== localId)
      return {
        ...prev,
        bills: nextBills.length > 0 ? nextBills : [createEmptyBill()],
      }
    })
  }

  const uploadBillDocument = async (file) => {
    const formData = new FormData()
    formData.append("billPdf", file)
    return uploadApi.uploadEventBillPDF(formData)
  }

  const uploadEventReportDocument = async (file) => {
    const formData = new FormData()
    formData.append("eventReportPdf", file)
    return uploadApi.uploadEventReportPDF(formData)
  }

  const handleCreateOrUpdateExpense = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit event expenses")
      return
    }

    if (!expenseEvent?.gymkhanaEventId) {
      toast.error("Linked event record not found")
      return
    }

    if (!isExpenseSubmissionAllowedForSelectedEvent) {
      toast.error("Bills can be submitted only after proposal approval")
      return
    }

    if (!isExpenseFormValid) {
      toast.error("Each bill needs description, amount, and PDF, and event report PDF is required")
      return
    }

    const payload = buildExpensePayload(expenseForm)
    try {
      setSubmitting(true)
      if (expenseData?._id) {
        await gymkhanaEventsApi.updateExpense(expenseData._id, payload)
        toast.success("Bills updated successfully")
      } else {
        await gymkhanaEventsApi.submitExpense(expenseEvent.gymkhanaEventId, payload)
        toast.success("Bills submitted successfully")
      }

      await fetchExpenseForEvent(expenseEvent)
      setExpenseHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to save bills")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveExpense = async () => {
    if (!canApproveExpense) {
      toast.error("You do not have permission to review this expense")
      return
    }

    if (!expenseData?._id) return
    if (
      maxApprovalAmount !== null &&
      Number(expenseData.totalExpenditure || 0) > maxApprovalAmount
    ) {
      toast.error(`Expense amount exceeds your approval limit of ${maxApprovalAmount}`)
      return
    }
    if (
      requiresExpenseNextApprovalSelection &&
      expenseNextApprovalStages.length === 0
    ) {
      toast.error("Select at least one next approval stage")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveExpense(
        expenseData._id,
        expenseApprovalComments,
        requiresExpenseNextApprovalSelection ? expenseNextApprovalStages : []
      )
      toast.success("Bills approved")
      setExpenseApprovalComments("")
      await fetchExpenseForEvent(expenseEvent)
      setExpenseHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      const pendingExpenses = await getPendingExpenseApprovals()
      setPendingExpenseApprovals(pendingExpenses)
    } catch (err) {
      toast.error(err.message || "Failed to approve bills")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectExpense = async () => {
    if (!canApproveExpense) {
      toast.error("You do not have permission to review this expense")
      return
    }

    if (!expenseData?._id) return
    if (!expenseApprovalComments || expenseApprovalComments.trim().length < 10) {
      toast.error("Please provide a rejection reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectExpense(expenseData._id, expenseApprovalComments)
      toast.success("Bills rejected")
      setExpenseApprovalComments("")
      await fetchExpenseForEvent(expenseEvent)
      setExpenseHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      const pendingExpenses = await getPendingExpenseApprovals()
      setPendingExpenseApprovals(pendingExpenses)
    } catch (err) {
      toast.error(err.message || "Failed to reject bills")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddEvent = () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to create events")
      return
    }

    setSelectedEvent(null)
    resetDateOverlapInfo()
    setEventForm({
      title: "",
      category: "academic",
      startDate: "",
      endDate: "",
      estimatedBudget: "",
      description: "",
    })
    setShowAddEventModal(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    resetDateOverlapInfo()
    const formModel = toFormModel(event)
    setEventForm(formModel)
    setShowAddEventModal(true)
    if (formModel.startDate && formModel.endDate) {
      checkDateOverlap(formModel, event?._id)
    }
  }

  const openAmendmentModal = (event = null) => {
    setSelectedEvent(event)
    setAmendmentReason("")
    resetDateOverlapInfo()

    if (event) {
      const formModel = toFormModel(event)
      setEventForm(formModel)
      if (formModel.startDate && formModel.endDate) {
        checkDateOverlap(formModel, event?._id)
      }
    } else {
      setEventForm({
        title: "",
        category: "academic",
        startDate: "",
        endDate: "",
        estimatedBudget: "",
        description: "",
      })
    }

    setShowAmendmentModal(true)
  }

  const handleSaveEvent = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to update events")
      return
    }

    const payload = buildEventPayload(eventForm)

    if (!payload.title || !payload.startDate || !payload.endDate || !payload.category) {
      toast.error("Title, category, start date and end date are required")
      return
    }

    if (new Date(payload.endDate) < new Date(payload.startDate)) {
      toast.error("End date cannot be before start date")
      return
    }

    if (!overlapCheckCompletedForCurrentDates) {
      toast.error("Please wait for date overlap check result before saving the event")
      return
    }

    try {
      setSubmitting(true)

      let updatedEvents = []
      if (selectedEvent && events.find((event) => event._id === selectedEvent._id)) {
        updatedEvents = events.map((event) =>
          event._id === selectedEvent._id ? { ...event, ...payload } : event
        )
      } else {
        updatedEvents = [...events, { ...payload, _id: `temp-${Date.now()}` }]
      }

      await gymkhanaEventsApi.updateCalendar(calendar._id, {
        events: updatedEvents.map(toCalendarEventPayload),
      })
      toast.success("Event saved successfully")
      setShowAddEventModal(false)
      setSelectedEvent(null)
      resetDateOverlapInfo()
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to save event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAmendment = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit amendments")
      return
    }

    const payload = buildEventPayload(eventForm)

    if (!payload.title || !payload.startDate || !payload.endDate || !payload.category) {
      toast.error("Title, category, start date and end date are required")
      return
    }

    if (new Date(payload.endDate) < new Date(payload.startDate)) {
      toast.error("End date cannot be before start date")
      return
    }

    if (!overlapCheckCompletedForCurrentDates) {
      toast.error("Please wait for date overlap check result before submitting")
      return
    }

    if (!amendmentReason || amendmentReason.length < 10) {
      toast.error("Please provide a detailed reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createAmendment({
        calendarId: calendar._id,
        type: selectedEvent ? "edit" : "new_event",
        eventId: selectedEvent?._id,
        proposedChanges: payload,
        reason: amendmentReason,
      })
      toast.success("Amendment request submitted")
      setShowAmendmentModal(false)
      setSelectedEvent(null)
      resetDateOverlapInfo()
    } catch (err) {
      toast.error(err.message || "Failed to submit amendment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitCalendar = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit calendar")
      return
    }

    try {
      setSubmitting(true)
      const response = await gymkhanaEventsApi.submitCalendar(calendar._id, false)
      const data = response.data || response || {}

      if (data.requiresOverlapConfirmation) {
        setSubmitOverlapInfo(data)
        setShowOverlapConfirmModal(true)
        setSubmitting(false)
        return
      }

      toast.success("Calendar submitted for approval")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to submit calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmSubmitWithOverlap = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit calendar")
      return
    }

    if (!calendar?._id) return

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.submitCalendar(calendar._id, true)
      toast.success("Calendar submitted with overlap warning")
      setShowOverlapConfirmModal(false)
      setSubmitOverlapInfo(null)
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to submit calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!canApprove) {
      toast.error("You do not have permission to approve calendar")
      return
    }

    if (
      requiresCalendarNextApprovalSelection &&
      calendarNextApprovalStages.length === 0
    ) {
      toast.error("Select at least one next approval stage")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveCalendar(
        calendar._id,
        approvalComments,
        requiresCalendarNextApprovalSelection ? calendarNextApprovalStages : []
      )
      toast.success("Calendar approved successfully")
      setShowApprovalModal(false)
      setApprovalComments("")
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to approve calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!canApprove) {
      toast.error("You do not have permission to reject calendar")
      return
    }

    if (!approvalComments || approvalComments.length < 10) {
      toast.error("Please provide a rejection reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectCalendar(calendar._id, approvalComments)
      toast.success("Calendar rejected")
      setShowApprovalModal(false)
      setApprovalComments("")
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to reject calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateCalendar = async () => {
    if (!canCreateCalendar) {
      toast.error("You do not have permission to create calendar")
      return
    }

    if (!newAcademicYear) {
      toast.error("Please select an academic year")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createCalendar({ academicYear: newAcademicYear })
      toast.success("Calendar created successfully")
      setShowCreateCalendarModal(false)
      setNewAcademicYear("")
      await fetchYears()
      setSelectedYear(newAcademicYear)
    } catch (err) {
      toast.error(err.message || "Failed to create calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLockCalendar = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar lock")
      return
    }

    if (!calendar?._id) return
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.lockCalendar(calendar._id)
      toast.success("Calendar locked")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to lock calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlockCalendar = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar lock")
      return
    }

    if (!calendar?._id) return
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.unlockCalendar(calendar._id)
      toast.success("Calendar unlocked")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to unlock calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const openPendingProposalReview = async (proposal) => {
    const eventEntity = proposal?.eventId
    if (!eventEntity?._id) {
      toast.error("Linked event not found for this proposal")
      return
    }

    await openProposalModal({
      title: eventEntity.title || "Proposal",
      gymkhanaEventId: eventEntity._id,
      estimatedBudget:
        Number(proposal?.eventBudgetAtSubmission || 0) || Number(eventEntity?.estimatedBudget || 0),
      startDate: eventEntity?.scheduledStartDate || null,
      endDate: eventEntity?.scheduledEndDate || null,
      proposalSubmitted: true,
    })
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchYears} />
  }

  if (!canViewEventsCapability) {
    return (
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger-text)]">
          You do not have permission to view events.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <PageHeader title={headerTitle} subtitle={headerSubtitle} showDate={false}>
        <ToggleButtonGroup
          options={VIEW_OPTIONS}
          value={viewMode}
          onChange={setViewMode}
          size="medium"
          variant="muted"
        />
        {canEdit && (
          <Button size="md" variant="secondary" onClick={handleAddEvent}>
            <Plus size={16} /> Add Event
          </Button>
        )}
        {canSubmitCalendar && (
          <Button size="md" onClick={handleSubmitCalendar} loading={submitting}>
            <Send size={16} /> Submit for Approval
          </Button>
        )}
        {calendar?.isLocked && isGS && canCreateEventsCapability && (
          <Button size="md" variant="secondary" onClick={() => openAmendmentModal(null)}>
            <FileText size={16} /> Request New Event
          </Button>
        )}
        {canApprove && (
          <>
            <Button
              size="md"
              variant="success"
              onClick={() => {
                setApprovalComments("")
                setCalendarNextApprovalStages([])
                setShowApprovalModal(true)
              }}
            >
              <Check size={16} /> Approve
            </Button>
            <Button
              size="md"
              variant="danger"
              onClick={() => {
                setApprovalComments("")
                setCalendarNextApprovalStages([])
                setShowApprovalModal(true)
              }}
            >
              <X size={16} /> Reject
            </Button>
          </>
        )}
        {calendar && (
          <Button size="md" variant="ghost" onClick={() => setShowHistoryModal(true)}>
            <History size={16} /> History
          </Button>
        )}
        {calendar && canManageCalendarLock && (
          <Button size="md" variant="ghost" onClick={() => setShowSettingsModal(true)}>
            <Settings size={16} /> Settings
          </Button>
        )}
      </PageHeader>

      <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-6)" }}>
        {(loading || calendar) && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <StatCards
              stats={budgetStats}
              columns={5}
              loading={loading || !calendar}
              loadingCount={5}
            />
          </div>
        )}

        {!loading && calendar && canCreateEventsCapability && (isGS || isPresident) && pendingProposalReminders.length > 0 && (
          <div
            style={{
              marginBottom: "var(--spacing-3)",
              padding: "var(--spacing-3)",
              backgroundColor: "var(--color-warning-bg)",
              border: "var(--border-1) solid var(--color-warning)",
              borderRadius: "var(--radius-card-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)", flexWrap: "wrap", marginBottom: "var(--spacing-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                <Bell size={14} style={{ color: "var(--color-warning)" }} />
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                  {pendingProposalReminders.length} event(s) in proposal window
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
              {pendingProposalReminders.slice(0, 5).map((event) => (
                <div
                  key={`proposal-reminder-${event._id || event.title}`}
                  onClick={() => openProposalModal(event)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--spacing-2)",
                    padding: "var(--spacing-1-5) var(--spacing-2-5)",
                    borderRadius: "var(--radius-badge)",
                    backgroundColor: "var(--color-bg-primary)",
                    border: "var(--border-1) solid var(--color-border-primary)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-warning)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-primary)" }}
                >
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                    {event.title}
                  </span>
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {formatDateRange(event.startDate, event.endDate)}
                  </span>
                  <FileText size={12} style={{ color: "var(--color-warning)" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && calendar && pendingProposalsForSelectedCalendar.length > 0 && (
          <div
            style={{
              marginBottom: "var(--spacing-3)",
              padding: "var(--spacing-2) var(--spacing-3)",
              border: "var(--border-1) solid var(--color-info)",
              borderRadius: "var(--radius-card-sm)",
              backgroundColor: "var(--color-info-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-2)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <AlertTriangle size={14} style={{ color: "var(--color-info)" }} />
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{pendingProposalsForSelectedCalendar.length}</strong> pending proposal approval(s)
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowPendingProposalModal(true)}>
              View Proposals
            </Button>
          </div>
        )}

        {!loading && calendar && canApproveEventsCapability && isAdminLevel && pendingExpenseApprovalsForSelectedCalendar.length > 0 && (
          <div
            style={{
              marginBottom: "var(--spacing-3)",
              padding: "var(--spacing-2) var(--spacing-3)",
              border: "var(--border-1) solid var(--color-info)",
              borderRadius: "var(--radius-card-sm)",
              backgroundColor: "var(--color-info-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-2)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <Receipt size={14} style={{ color: "var(--color-info)" }} />
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{pendingExpenseApprovalsForSelectedCalendar.length}</strong> pending bill approval(s)
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowPendingBillsModal(true)}>
              View Bills
            </Button>
          </div>
        )}

        {calendar && calendar.status !== "approved" && dateConflicts.length > 0 && (
          <div
            style={{
              marginBottom: "var(--spacing-3)",
              padding: "var(--spacing-2) var(--spacing-3)",
              border: "var(--border-1) solid var(--color-warning)",
              borderRadius: "var(--radius-card-sm)",
              backgroundColor: "var(--color-warning-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-2)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <AlertTriangle size={14} style={{ color: "var(--color-warning)" }} />
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{dateConflicts.length}</strong> date overlap(s) detected
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowOverlapDetailsModal(true)}>
              View Details
            </Button>
          </div>
        )}

        {!loading && !calendar && hasAttemptedCalendarLoad && (
          <EmptyState
            icon={CalendarDays}
            title="No Calendar Found"
            message={
              canCreateCalendar
                ? "No activity calendar exists yet. Create one using the New Calendar action."
                : `No activity calendar exists for ${selectedYear || "this year"}. Contact Admin to create one.`
            }
          />
        )}

        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <Tabs
            variant="pills"
            tabs={categoryFilterTabs}
            activeTab={activeCategoryFilter}
            setActiveTab={setActiveCategoryFilter}
          />
        </div>

        {viewMode === "list" && (
          <>
            {loading ? (
              <DataTable
                data={[]}
                columns={eventTableColumns}
                loading
                emptyMessage="No events available"
              />
            ) : !calendar ? null : filteredEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={activeCategoryFilter === "all" ? "No Events Yet" : "No Events In This Category"}
                message={
                  activeCategoryFilter === "all"
                    ? canEdit
                      ? "Add events to the calendar to get started."
                      : "No events have been added to this calendar yet."
                    : "Try another category filter."
                }
              />
            ) : (
              <DataTable
                data={filteredEvents}
                columns={eventTableColumns}
                onRowClick={handleEventRowClick}
                getRowId={(event) =>
                  event?._id ||
                  `${event?.title || "event"}-${event?.category || "na"}-${event?.startDate || "na"}-${event?.endDate || "na"}`
                }
              />
            )}
          </>
        )}

        {viewMode === "calendar" && (
          loading ? (
            <div
              style={{
                backgroundColor: "var(--color-bg-primary)",
                borderRadius: "var(--radius-card)",
                border: "var(--border-1) solid var(--color-border-primary)",
                padding: "var(--spacing-6)",
              }}
            >
              <LoadingState message={`Loading calendar for ${selectedYear || "selected year"}...`} />
            </div>
          ) : !calendar ? null : (
          <div style={{
            backgroundColor: "var(--color-bg-primary)",
            borderRadius: "var(--radius-card)",
            border: "var(--border-1) solid var(--color-border-primary)",
            overflow: "hidden",
          }}>
            {/* Calendar Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--spacing-3) var(--spacing-4)",
              backgroundColor: "var(--color-bg-secondary)",
              borderBottom: "var(--border-1) solid var(--color-border-primary)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1)" }}>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: "var(--radius-sm)",
                    border: "var(--border-1) solid var(--color-border-primary)",
                    backgroundColor: "var(--color-bg-primary)", cursor: "pointer",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: "var(--radius-sm)",
                    border: "var(--border-1) solid var(--color-border-primary)",
                    backgroundColor: "var(--color-bg-primary)", cursor: "pointer",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <span style={{
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-heading)",
                letterSpacing: "-0.01em",
              }}>
                {calendarMonth.toLocaleString("default", { month: "long" })}{" "}
                <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--font-weight-normal)" }}>
                  {calendarMonth.getFullYear()}
                </span>
              </span>

              <button
                onClick={() => setCalendarMonth(new Date())}
                style={{
                  fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)",
                  padding: "var(--spacing-1) var(--spacing-2)",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-1) solid var(--color-border-primary)",
                  backgroundColor: "var(--color-bg-primary)", cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                Today
              </button>
            </div>

            {/* Legend */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-4)",
              padding: "var(--spacing-2) var(--spacing-4)",
              borderBottom: "var(--border-1) solid var(--color-border-primary)",
              flexWrap: "wrap",
              backgroundColor: "var(--color-bg-primary)",
            }}>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: "var(--font-weight-medium)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Legend</span>
              {CATEGORY_ORDER.map((cat) => (
                <span key={cat} style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: CATEGORY_COLORS[cat], flexShrink: 0 }} />
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
              <span style={{ width: 1, height: 12, backgroundColor: "var(--color-border-primary)", flexShrink: 0 }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "var(--color-warning)", flexShrink: 0 }} />
                Holiday
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary)", flexShrink: 0 }} />
                Today
              </span>
            </div>

            {/* Calendar Grid */}
            <div style={{ padding: "var(--spacing-3)" }}>
              {/* Weekday headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: "var(--spacing-1)" }}>
                {CALENDAR_WEEKDAY_LABELS.map((day, i) => (
                  <div
                    key={day}
                    style={{
                      textAlign: "center",
                      padding: "var(--spacing-1) 0",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: i === 5 ? "var(--color-primary)" : i === 6 ? "var(--color-danger)" : "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                {getDaysInMonth(calendarMonth).map((date, index) => {
                  const dayEvents = date ? getEventsForDate(date) : []
                  const dayHolidays = date ? getHolidaysForDate(date) : []
                  const isToday = date?.toDateString() === new Date().toDateString()
                  const weekday = date?.getDay()
                  const isSaturday = weekday === 6
                  const isSunday = weekday === 0
                  const isHoliday = dayHolidays.length > 0
                  const shownEvents = dayEvents.slice(0, isHoliday ? 1 : 2)
                  const remainingEventCount = dayEvents.length - shownEvents.length

                  return (
                    <div
                      key={index}
                      style={{
                        minHeight: 88,
                        padding: "var(--spacing-1)",
                        backgroundColor: !date
                          ? "transparent"
                          : isSunday
                            ? "rgba(239,68,68,0.07)"
                            : isSaturday
                              ? "rgba(59,130,246,0.07)"
                              : "var(--color-bg-primary)",
                        border: "var(--border-1) solid",
                        borderColor: !date
                          ? "transparent"
                          : isToday
                            ? "var(--color-primary)"
                            : "var(--color-border-primary)",
                        borderRadius: "var(--radius-sm)",
                        position: "relative",
                      }}
                    >
                      {date && (
                        <>
                          {/* Date number */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            marginBottom: "var(--spacing-0-5)",
                          }}>
                            {isHoliday && (
                              <span
                                title={dayHolidays[0].title}
                                style={{
                                  flex: 1,
                                  fontSize: 9,
                                  fontWeight: "var(--font-weight-medium)",
                                  color: "#92400e",
                                  backgroundColor: "#fef3c7",
                                  padding: "1px var(--spacing-1)",
                                  borderRadius: "var(--radius-xs)",
                                  marginRight: "var(--spacing-1)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {dayHolidays[0].title}
                              </span>
                            )}
                            <span style={{
                              width: 20, height: 20, borderRadius: "var(--radius-full)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                              fontSize: "var(--font-size-xs)",
                              fontWeight: isToday ? "var(--font-weight-bold)" : "var(--font-weight-normal)",
                              color: isToday ? "white" : isSunday ? "var(--color-danger)" : isSaturday ? "var(--color-primary)" : "var(--color-text-body)",
                              backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                            }}>
                              {date.getDate()}
                            </span>
                          </div>

                          {/* Events */}
                          {shownEvents.map((event, i) => (
                            <div
                              key={i}
                              onClick={() => handleEventClick(event)}
                              title={event.title}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 10,
                                padding: "2px var(--spacing-1)",
                                marginBottom: 2,
                                backgroundColor: `${CATEGORY_COLORS[event.category]}15`,
                                borderLeft: `2.5px solid ${CATEGORY_COLORS[event.category]}`,
                                borderRadius: "0 var(--radius-xs) var(--radius-xs) 0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                                color: "var(--color-text-body)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              {event.title}
                            </div>
                          ))}

                          {remainingEventCount > 0 && (
                            <span style={{
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                              fontWeight: "var(--font-weight-medium)",
                              paddingLeft: "var(--spacing-1)",
                            }}>
                              +{remainingEventCount} more
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          )
        )}
      </div>

      <div style={footerTabStyles.tabsBar}>
        <div style={footerTabStyles.tabsList}>
          {years.map((year) => (
            <button
              key={year._id || year.academicYear}
              onClick={() => setSelectedYear(year.academicYear)}
              style={{
                ...footerTabStyles.tab,
                ...(selectedYear === year.academicYear ? footerTabStyles.tabActive : {}),
              }}
              onMouseEnter={(event) => {
                if (selectedYear !== year.academicYear) {
                  event.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
                }
              }}
              onMouseLeave={(event) => {
                if (selectedYear !== year.academicYear) {
                  event.currentTarget.style.backgroundColor = "transparent"
                }
              }}
            >
              {year.academicYear}
            </button>
          ))}
          {canCreateCalendar && (
            <button
              onClick={() => setShowCreateCalendarModal(true)}
              style={{ ...footerTabStyles.tab, ...footerTabStyles.addTab }}
            >
              <Plus size={12} />
              New
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateCalendarModal}
        title="Create New Calendar"
        width={460}
        onClose={() => {
          setShowCreateCalendarModal(false)
          setNewAcademicYear("")
        }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateCalendarModal(false)
                setNewAcademicYear("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCalendar} loading={submitting} disabled={!newAcademicYear}>
              Create Calendar
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            Select the academic year for the new activity calendar.
          </p>
          <label style={formLabelStyles} htmlFor="newAcademicYear">
            Academic Year
          </label>
          <Select
            id="newAcademicYear"
            name="newAcademicYear"
            value={newAcademicYear}
            onChange={(event) => setNewAcademicYear(event.target.value)}
            options={availableYearsForCreation}
            placeholder="Select academic year"
          />
        </div>
      </Modal>

      <Modal
        isOpen={showEventModal}
        title={selectedEvent?.title || "Event Details"}
        width={640}
        closeButtonVariant="button"
        onClose={() => { setShowEventModal(false); setSelectedEvent(null) }}
      >
        {selectedEvent && showEventModal && (() => {
          const proposalDueDate = getProposalDueDate(selectedEvent)
          const proposalDueText = proposalDueDate ? proposalDueDate.toLocaleDateString() : "Not available"
          const canOpenProposal =
            canViewEventsCapability &&
            selectedEvent.gymkhanaEventId &&
            (selectedEvent.proposalSubmitted || ((isGS || isPresident) && canCreateEventsCapability))
          const canManageBills =
            canViewEventsCapability &&
            selectedEvent.gymkhanaEventId &&
            (selectedEvent.eventStatus === "proposal_approved" ||
              selectedEvent.eventStatus === "completed") &&
            ((isGS && canCreateEventsCapability) || (isAdminLevel && canApproveEventsCapability))

          const proposalSummary = !selectedEvent.gymkhanaEventId
            ? "Available after calendar approval and event record generation."
            : selectedEvent.proposalSubmitted
              ? "Proposal submitted and under review/approved."
              : `Proposal due on ${proposalDueText}.`

          const billsSummary = !selectedEvent.gymkhanaEventId
            ? "Available after calendar approval and event record generation."
            : selectedEvent.eventStatus !== "proposal_approved" && selectedEvent.eventStatus !== "completed"
              ? "Bills open after final proposal approval."
              : "Upload and review bill PDFs for this event."

          const eventStatusLabel = selectedEvent.eventStatus
            ? selectedEvent.eventStatus.replace(/_/g, " ")
            : "calendar event"

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--spacing-2)",
                  flexWrap: "wrap",
                  paddingBottom: "var(--spacing-3)",
                  borderBottom: "var(--border-1) solid var(--color-border-primary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                  <Badge style={getCategoryBadgeStyle(selectedEvent.category)}>
                    {CATEGORY_LABELS[selectedEvent.category] || selectedEvent.category}
                  </Badge>
                  <Badge variant={getEventStatusVariant(selectedEvent.eventStatus)}>
                    {eventStatusLabel}
                  </Badge>
                  <span style={eventDetailMetaChipStyles}>
                    <CalendarDays size={12} />
                    {formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}
                  </span>
                  <span style={eventDetailMetaChipStyles}>
                    <CircleDollarSign size={12} />
                    ₹{Number(selectedEvent.estimatedBudget || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
                <EventDetailSectionCard icon={CalendarDays} title="Schedule" accentColor="var(--color-info)">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                    <EventDetailInfoRow
                      label="Start"
                      value={selectedEvent.startDate ? new Date(selectedEvent.startDate).toLocaleDateString() : "TBD"}
                    />
                    <EventDetailInfoRow
                      label="End"
                      value={selectedEvent.endDate ? new Date(selectedEvent.endDate).toLocaleDateString() : "TBD"}
                    />
                    <EventDetailInfoRow label="Proposal Due" value={proposalDueText} />
                    <EventDetailInfoRow label="Budget" value={`₹${Number(selectedEvent.estimatedBudget || 0).toLocaleString()}`} />
                  </div>
                </EventDetailSectionCard>

                {((isGymkhanaRole && canCreateEventsCapability) || (isAdminLevel && canApproveEventsCapability)) && (
                  <EventDetailSectionCard icon={Clock3} title="Workflow" accentColor="var(--color-primary)">
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--spacing-2)",
                          padding: "var(--spacing-2)",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--color-bg-secondary)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                            Proposal
                          </p>
                          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            {proposalSummary}
                          </p>
                        </div>
                        {canOpenProposal && (
                          <Button size="sm" variant="ghost" onClick={() => openProposalModal(selectedEvent)}>
                            <FileText size={12} /> {selectedEvent.proposalSubmitted ? "View" : "Submit"}
                          </Button>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--spacing-2)",
                          padding: "var(--spacing-2)",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--color-bg-secondary)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                            Bills
                          </p>
                          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            {billsSummary}
                          </p>
                        </div>
                        {canManageBills && (
                          <Button size="sm" variant="ghost" onClick={() => openExpenseModal(selectedEvent)}>
                            <Receipt size={12} /> Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  </EventDetailSectionCard>
                )}
              </div>

              <EventDetailSectionCard icon={NotebookText} title="Description" accentColor="var(--color-text-secondary)">
                <div
                  style={{
                    color: "var(--color-text-body)",
                    fontSize: "var(--font-size-sm)",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedEvent.description || "No description provided."}
                </div>
              </EventDetailSectionCard>
            </div>
          )
        })()}
      </Modal>

      <Modal
        isOpen={showProposalModal}
        title={`Event Proposal${proposalEvent?.title ? `: ${proposalEvent.title}` : ""}`}
        width={1080}
        closeButtonVariant="button"
        onClose={() => {
          setShowProposalModal(false)
          setProposalEvent(null)
          setProposalData(null)
          setProposalForm(createDefaultProposalForm())
          setProposalActionComments("")
          setProposalNextApprovalStages([])
        }}
        footer={
          canEditProposalForm ? (
            <Button
              onClick={handleCreateOrUpdateProposal}
              loading={submitting}
              disabled={!isProposalFormValid}
            >
              {proposalData?._id ? "Save Proposal" : "Submit Proposal"}
            </Button>
          ) : null
        }
      >
        {proposalLoading ? (
          <LoadingState message="Loading proposal..." />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
            <div className="xl:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <EventDetailSectionCard icon={FileText} title="Proposal Details" accentColor="var(--color-primary)">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  {proposalEvent && (
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", flexWrap: "wrap", padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Budget: <strong style={{ color: "var(--color-text-heading)" }}>₹{Number(proposalEvent.estimatedBudget || 0).toLocaleString()}</strong>
                      </span>
                      {(() => {
                        const proposalDueDate = getProposalDueDate(proposalEvent)
                        return proposalDueDate ? (
                          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            Due: <strong style={{ color: "var(--color-text-heading)" }}>{proposalDueDate.toLocaleDateString()}</strong>
                          </span>
                        ) : null
                      })()}
                      {proposalData && (
                        <Badge variant={proposalData.status === "approved" ? "success" : proposalData.status === "rejected" ? "danger" : "info"}>
                          {proposalData.status?.replace(/_/g, " ")}
                        </Badge>
                      )}
                      {proposalData?.currentApprovalStage && (
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                          @ {proposalData.currentApprovalStage}
                        </span>
                      )}
                    </div>
                  )}

                  {!proposalData && !canCreateProposalForSelectedEvent && (
                    <Alert type="warning">
                      Proposal submission opens 21 days before event.
                    </Alert>
                  )}

                  <div>
                    <label style={formLabelStyles} htmlFor="proposalText">
                      Proposal Details
                    </label>
                    <Textarea
                      id="proposalText"
                      name="proposalText"
                      placeholder="Proposal details"
                      value={proposalForm.proposalText}
                      onChange={(event) => handleProposalFormChange("proposalText", event.target.value)}
                      rows={4}
                      disabled={!canEditProposalForm}
                      required
                    />
                  </div>

                  <PdfUploadField
                    label="Proposal PDF"
                    value={proposalForm.proposalDocumentUrl}
                    onChange={(url) => handleProposalFormChange("proposalDocumentUrl", url)}
                    onUpload={uploadProposalDocument}
                    disabled={!canEditProposalForm}
                    uploadedText="Proposal document uploaded"
                    viewerTitle="Proposal Document"
                    viewerSubtitle="Event proposal attachment"
                    downloadFileName="proposal-document.pdf"
                  />

                  <div>
                    <label style={formLabelStyles} htmlFor="externalGuestsDetails">
                      External Guests
                    </label>
                    <Textarea
                      id="externalGuestsDetails"
                      name="externalGuestsDetails"
                      placeholder="External guests details"
                      value={proposalForm.externalGuestsDetails}
                      onChange={(event) => handleProposalFormChange("externalGuestsDetails", event.target.value)}
                      rows={2}
                      disabled={!canEditProposalForm}
                    />
                  </div>

                  <PdfUploadField
                    label="Chief Guest PDF"
                    value={proposalForm.chiefGuestDocumentUrl}
                    onChange={(url) => handleProposalFormChange("chiefGuestDocumentUrl", url)}
                    onUpload={uploadChiefGuestDocument}
                    disabled={!canEditProposalForm}
                    uploadedText="Chief guest document uploaded"
                    viewerTitle="Chief Guest Document"
                    viewerSubtitle="External guest attachment"
                    downloadFileName="chief-guest-document.pdf"
                  />

                  <div style={{ display: "flex", gap: "var(--spacing-4)", flexWrap: "wrap" }}>
                    <Checkbox
                      name="accommodationRequired"
                      label="Accommodation required"
                      checked={proposalForm.accommodationRequired}
                      onChange={(event) => handleProposalFormChange("accommodationRequired", event.target.checked)}
                      disabled={!canEditProposalForm}
                    />

                  <Checkbox
                    name="hasRegistrationFee"
                    label="Registration fee applicable"
                    checked={proposalForm.hasRegistrationFee}
                    onChange={(event) => handleProposalFormChange("hasRegistrationFee", event.target.checked)}
                    disabled={!canEditProposalForm}
                  />
                  </div>

                  {proposalForm.hasRegistrationFee && (
                    <div>
                      <label style={formLabelStyles} htmlFor="registrationFeeAmount">
                        Registration Fee (₹)
                      </label>
                      <Input
                        id="registrationFeeAmount"
                        name="registrationFeeAmount"
                        type="number"
                        placeholder="Amount"
                        value={proposalForm.registrationFeeAmount}
                        onChange={(event) =>
                          handleProposalFormChange("registrationFeeAmount", event.target.value)
                        }
                        disabled={!canEditProposalForm}
                      />
                    </div>
                  )}

                  <div style={{ display: "grid", gap: "var(--spacing-2)", gridTemplateColumns: "repeat(2, 1fr)" }}>
                    <div>
                      <label style={formLabelStyles} htmlFor="totalExpectedIncome">
                        Expected Income (₹)
                      </label>
                      <Input
                        id="totalExpectedIncome"
                        name="totalExpectedIncome"
                        type="number"
                        placeholder="Income"
                        value={proposalForm.totalExpectedIncome}
                        onChange={(event) =>
                          handleProposalFormChange("totalExpectedIncome", event.target.value)
                        }
                        disabled={!canEditProposalForm}
                      />
                    </div>
                    <div>
                      <label style={formLabelStyles} htmlFor="totalExpenditure">
                        Total Expenditure (₹)
                      </label>
                      <Input
                        id="totalExpenditure"
                        name="totalExpenditure"
                        type="number"
                        placeholder="Expenditure"
                        value={proposalForm.totalExpenditure}
                        onChange={(event) =>
                          handleProposalFormChange("totalExpenditure", event.target.value)
                        }
                        disabled={!canEditProposalForm}
                      />
                    </div>
                  </div>
                </div>
              </EventDetailSectionCard>

              <EventDetailSectionCard icon={CircleDollarSign} title="Budget Summary" accentColor="var(--color-success)">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                  <EventDetailInfoRow
                    label="Income"
                    value={`₹${Number(proposalForm.totalExpectedIncome || 0).toLocaleString()}`}
                  />
                  <EventDetailInfoRow
                    label="Expenditure"
                    value={`₹${Number(proposalForm.totalExpenditure || 0).toLocaleString()}`}
                  />
                  <EventDetailInfoRow
                    label="Deflection"
                    value={`₹${proposalDeflection.toLocaleString()}`}
                    valueColor={proposalDeflection > 0 ? "var(--color-danger)" : "var(--color-success)"}
                  />
                </div>
              </EventDetailSectionCard>

              {canCurrentUserReviewProposal && proposalData && (
                <EventDetailSectionCard icon={Check} title="Review Actions" accentColor="var(--color-warning)">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                    {requiresProposalNextApprovalSelection && (
                      <div style={{ padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                        <label style={{ ...formLabelStyles, marginBottom: "var(--spacing-1)" }}>
                          Next Approval Order
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                          {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                            <Checkbox
                              key={`proposal-stage-${stage}`}
                              label={stage}
                              checked={proposalNextApprovalStages.includes(stage)}
                              onChange={() =>
                                toggleNextApprovalStage(stage, setProposalNextApprovalStages)
                              }
                            />
                          ))}
                        </div>
                        {proposalNextApprovalStages.length > 0 && (
                          <p style={{ margin: "var(--spacing-1) 0 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            Order: {proposalNextApprovalStages.join(" → ")}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label style={formLabelStyles} htmlFor="proposalActionComments">
                        Comments
                      </label>
                      <Textarea
                        id="proposalActionComments"
                        name="proposalActionComments"
                        placeholder="Comments (required for reject/revision)"
                        value={proposalActionComments}
                        onChange={(event) => setProposalActionComments(event.target.value)}
                        rows={2}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Button size="sm" variant="warning" onClick={handleRequestProposalRevision} loading={submitting}>
                        Request Revision
                      </Button>
                      <Button size="sm" variant="danger" onClick={handleRejectProposal} loading={submitting}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={handleApproveProposal}
                        loading={submitting}
                        disabled={
                          requiresProposalNextApprovalSelection &&
                          proposalNextApprovalStages.length === 0
                        }
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </EventDetailSectionCard>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
              <EventDetailSectionCard icon={Clock3} title="Proposal Snapshot" accentColor="var(--color-info)">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <EventDetailInfoRow
                    label="Status"
                    value={proposalData?.status ? proposalData.status.replace(/_/g, " ") : "Draft"}
                  />
                  <EventDetailInfoRow
                    label="Current Stage"
                    value={proposalData?.currentApprovalStage || "Not submitted"}
                  />
                  <EventDetailInfoRow
                    label="Due Date"
                    value={proposalEvent ? (getProposalDueDate(proposalEvent)?.toLocaleDateString() || "Not available") : "Not available"}
                  />
                  <EventDetailInfoRow
                    label="Event Budget"
                    value={`₹${Number(proposalEvent?.estimatedBudget || 0).toLocaleString()}`}
                  />
                </div>
              </EventDetailSectionCard>

              <EventDetailSectionCard icon={History} title="Activity Log" accentColor="var(--color-text-secondary)">
                {proposalData?._id ? (
                  <ApprovalHistory key={proposalHistoryRefreshKey} proposalId={proposalData._id} />
                ) : (
                  <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                    Activity log appears after proposal submission.
                  </p>
                )}
              </EventDetailSectionCard>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showExpenseModal}
        title={`Event Bills${expenseEvent?.title ? `: ${expenseEvent.title}` : ""}`}
        width={1120}
        closeButtonVariant="button"
        onClose={() => {
          setShowExpenseModal(false)
          setExpenseEvent(null)
          setExpenseData(null)
          setExpenseForm(createDefaultExpenseForm())
          setExpenseApprovalComments("")
          setExpenseNextApprovalStages([])
        }}
        footer={
          canEditExpenseForm ? (
            <Button
              onClick={handleCreateOrUpdateExpense}
              loading={submitting}
              disabled={!isExpenseFormValid}
            >
              {expenseData?._id ? "Update Bills" : "Submit Bills"}
            </Button>
          ) : null
        }
      >
        {expenseLoading ? (
          <LoadingState message="Loading bills..." />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
            <div className="xl:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <EventDetailSectionCard icon={Receipt} title="Bills & Documents" accentColor="var(--color-primary)">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  {expenseEvent && (
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", flexWrap: "wrap", padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Budget: <strong style={{ color: "var(--color-text-heading)" }}>₹{assignedExpenseBudget.toLocaleString()}</strong>
                      </span>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Total: <strong style={{ color: "var(--color-text-heading)" }}>₹{expenseTotal.toLocaleString()}</strong>
                      </span>
                      {expenseData && (
                        <Badge
                          variant={
                            expenseData.approvalStatus === "approved"
                              ? "success"
                              : expenseData.approvalStatus === "rejected"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {expenseData.approvalStatus === "approved" ? "Approved" : expenseData.approvalStatus === "rejected" ? "Rejected" : "Pending"}
                        </Badge>
                      )}
                      {expenseData?.currentApprovalStage && expenseData.approvalStatus !== "approved" && (
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                          @ {expenseData.currentApprovalStage}
                        </span>
                      )}
                    </div>
                  )}

                  {!expenseData && !isExpenseSubmissionAllowedForSelectedEvent && (
                    <Alert type="warning">
                      Bills submission opens after proposal approval.
                    </Alert>
                  )}

                  {expenseData?.approvalStatus === "rejected" && expenseData?.rejectionReason && (
                    <Alert type="error">
                      Rejection: {expenseData.rejectionReason}
                    </Alert>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                    {(expenseForm.bills || []).map((bill, index) => (
                      <div
                        key={bill.localId}
                        style={{
                          border: "var(--border-1) solid var(--color-border-primary)",
                          borderRadius: "var(--radius-card-sm)",
                          padding: "var(--spacing-2)",
                          backgroundColor: "var(--color-bg-primary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--spacing-2)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-2)" }}>
                          <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                            Bill #{index + 1}
                          </span>
                          {canEditExpenseForm && (expenseForm.bills || []).length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveBillRow(bill.localId)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          )}
                        </div>

                        <div style={{ display: "grid", gap: "var(--spacing-2)", gridTemplateColumns: "repeat(4, 1fr)" }}>
                          <div>
                            <label style={formLabelStyles} htmlFor={`bill-description-${bill.localId}`}>
                              Description
                            </label>
                            <Input
                              id={`bill-description-${bill.localId}`}
                              name={`bill-description-${bill.localId}`}
                              placeholder="Description"
                              value={bill.description}
                              onChange={(event) =>
                                handleBillFieldChange(bill.localId, "description", event.target.value)
                              }
                              disabled={!canEditExpenseForm}
                            />
                          </div>
                          <div>
                            <label style={formLabelStyles} htmlFor={`bill-amount-${bill.localId}`}>
                              Amount (₹)
                            </label>
                            <Input
                              id={`bill-amount-${bill.localId}`}
                              name={`bill-amount-${bill.localId}`}
                              type="number"
                              placeholder="₹"
                              value={bill.amount}
                              onChange={(event) =>
                                handleBillFieldChange(bill.localId, "amount", event.target.value)
                              }
                              disabled={!canEditExpenseForm}
                            />
                          </div>
                          <div>
                            <label style={formLabelStyles} htmlFor={`bill-number-${bill.localId}`}>
                              Bill No.
                            </label>
                            <Input
                              id={`bill-number-${bill.localId}`}
                              name={`bill-number-${bill.localId}`}
                              placeholder="Optional"
                              value={bill.billNumber}
                              onChange={(event) =>
                                handleBillFieldChange(bill.localId, "billNumber", event.target.value)
                              }
                              disabled={!canEditExpenseForm}
                            />
                          </div>
                          <div>
                            <label style={formLabelStyles} htmlFor={`bill-date-${bill.localId}`}>
                              Date
                            </label>
                            <Input
                              id={`bill-date-${bill.localId}`}
                              name={`bill-date-${bill.localId}`}
                              type="date"
                              value={bill.billDate}
                              onChange={(event) =>
                                handleBillFieldChange(bill.localId, "billDate", event.target.value)
                              }
                              disabled={!canEditExpenseForm}
                            />
                          </div>
                        </div>

                        <div style={{ display: "grid", gap: "var(--spacing-2)", gridTemplateColumns: "1fr 2fr" }}>
                          <div>
                            <label style={formLabelStyles} htmlFor={`bill-vendor-${bill.localId}`}>
                              Vendor
                            </label>
                            <Input
                              id={`bill-vendor-${bill.localId}`}
                              name={`bill-vendor-${bill.localId}`}
                              placeholder="Optional"
                              value={bill.vendor}
                              onChange={(event) =>
                                handleBillFieldChange(bill.localId, "vendor", event.target.value)
                              }
                              disabled={!canEditExpenseForm}
                            />
                          </div>

                          <PdfUploadField
                            label="Bill PDF"
                            value={bill.documentUrl}
                            onChange={(url) => {
                              handleBillFieldChange(bill.localId, "documentUrl", url)
                              handleBillFieldChange(
                              bill.localId,
                              "documentName",
                              getFilenameFromUrl(url)
                            )
                          }}
                          onUpload={uploadBillDocument}
                          disabled={!canEditExpenseForm}
                          uploadedText="Uploaded"
                          viewerTitle={`Bill ${index + 1}`}
                          viewerSubtitle="Bill attachment"
                          downloadFileName={`event-bill-${index + 1}.pdf`}
                        />
                        </div>
                      </div>
                    ))}
                  </div>

                  {canEditExpenseForm && (
                    <Button size="sm" variant="ghost" onClick={handleAddBillRow}>
                      <Plus size={12} /> Add Bill
                    </Button>
                  )}

                  <div style={{ display: "grid", gap: "var(--spacing-2)", gridTemplateColumns: "1fr 1fr" }}>
                    <PdfUploadField
                      label="Event Report PDF"
                      value={expenseForm.eventReportDocumentUrl}
                      onChange={(url) => handleExpenseFormChange("eventReportDocumentUrl", url)}
                      onUpload={uploadEventReportDocument}
                      disabled={!canEditExpenseForm}
                      uploadedText="Uploaded"
                      viewerTitle="Event Report"
                      viewerSubtitle="Post-event report"
                      downloadFileName="event-report.pdf"
                    />

                    <div>
                      <label style={formLabelStyles} htmlFor="expenseNotes">
                        Notes
                      </label>
                      <Textarea
                        id="expenseNotes"
                        name="expenseNotes"
                        placeholder="Optional"
                        value={expenseForm.notes}
                        onChange={(event) => handleExpenseFormChange("notes", event.target.value)}
                        rows={2}
                        disabled={!canEditExpenseForm}
                      />
                    </div>
                  </div>
                </div>
              </EventDetailSectionCard>

              <EventDetailSectionCard icon={CircleDollarSign} title="Bill Summary" accentColor="var(--color-success)">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                  <EventDetailInfoRow label="Bills" value={`₹${expenseTotal.toLocaleString()}`} />
                  <EventDetailInfoRow label="Budget" value={`₹${assignedExpenseBudget.toLocaleString()}`} />
                  <EventDetailInfoRow
                    label="Variance"
                    value={`₹${expenseVariance.toLocaleString()}`}
                    valueColor={expenseVariance > 0 ? "var(--color-danger)" : "var(--color-success)"}
                  />
                </div>
              </EventDetailSectionCard>

              {canApproveExpense && (
                <EventDetailSectionCard icon={Check} title="Approval" accentColor="var(--color-warning)">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                    {requiresExpenseNextApprovalSelection && (
                      <div style={{ padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                        <label style={{ ...formLabelStyles, marginBottom: "var(--spacing-1)" }}>
                          Next Approval Order
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                          {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                            <Checkbox
                              key={`expense-stage-${stage}`}
                              label={stage}
                              checked={expenseNextApprovalStages.includes(stage)}
                              onChange={() =>
                                toggleNextApprovalStage(stage, setExpenseNextApprovalStages)
                              }
                            />
                          ))}
                        </div>
                        {expenseNextApprovalStages.length > 0 && (
                          <p style={{ margin: "var(--spacing-1) 0 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            Order: {expenseNextApprovalStages.join(" → ")}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label style={formLabelStyles} htmlFor="expenseApprovalComments">
                        Comments
                      </label>
                      <Textarea
                        id="expenseApprovalComments"
                        name="expenseApprovalComments"
                        placeholder="Required for rejection"
                        value={expenseApprovalComments}
                        onChange={(event) => setExpenseApprovalComments(event.target.value)}
                        rows={2}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
                      <Button size="sm" variant="danger" onClick={handleRejectExpense} loading={submitting}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={handleApproveExpense}
                        loading={submitting}
                        disabled={
                          requiresExpenseNextApprovalSelection &&
                          expenseNextApprovalStages.length === 0
                        }
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </EventDetailSectionCard>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
              <EventDetailSectionCard icon={Clock3} title="Status" accentColor="var(--color-info)">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                  <EventDetailInfoRow
                    label="Status"
                    value={
                      expenseData?.approvalStatus === "approved"
                        ? "Approved"
                        : expenseData?.approvalStatus === "rejected"
                          ? "Rejected"
                          : expenseData?.approvalStatus
                            ? "Pending Approval"
                            : "Draft"
                    }
                  />
                  <EventDetailInfoRow
                    label="Current Stage"
                    value={expenseData?.currentApprovalStage || "Not submitted"}
                  />
                  <EventDetailInfoRow
                    label="Bills Count"
                    value={`${(expenseForm.bills || []).length}`}
                  />
                  <EventDetailInfoRow
                    label="Submitted By"
                    value={expenseData?.submittedBy?.name || "Not submitted"}
                  />
                </div>
              </EventDetailSectionCard>

              <EventDetailSectionCard icon={History} title="Activity Log" accentColor="var(--color-text-secondary)">
                {expenseData?._id ? (
                  <ApprovalHistory
                    key={`${expenseData._id}-${expenseHistoryRefreshKey}`}
                    expenseId={expenseData._id}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                    Activity log appears after bill submission.
                  </p>
                )}
              </EventDetailSectionCard>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAddEventModal}
        title={selectedEvent ? "Edit Event" : "Add Event"}
        width={640}
        onClose={() => { setShowAddEventModal(false); setSelectedEvent(null); resetDateOverlapInfo() }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => setShowAddEventModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveEvent} loading={submitting} disabled={!canSaveEventInModal}>Save</Button>
          </div>
        }
      >
        {showAddEventModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "2fr 1fr" }}>
              <div>
                <label style={formLabelStyles} htmlFor="eventTitle">
                  Title
                </label>
                <Input
                  id="eventTitle"
                  name="title"
                  placeholder="Event title"
                  value={eventForm.title}
                  onChange={(event) => handleEventFormChange("title", event.target.value)}
                  required
                />
              </div>
              <div>
                <label style={formLabelStyles} htmlFor="eventCategory">
                  Category
                </label>
                <Select
                  id="eventCategory"
                  name="category"
                  value={eventForm.category}
                  onChange={(event) => handleEventFormChange("category", event.target.value)}
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </div>
            <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div>
                <label style={formLabelStyles} htmlFor="eventStartDate">
                  Start
                </label>
                <Input
                  id="eventStartDate"
                  name="startDate"
                  type="date"
                  value={eventForm.startDate}
                  onChange={(event) => handleEventFormChange("startDate", event.target.value)}
                  required
                />
              </div>
              <div>
                <label style={formLabelStyles} htmlFor="eventEndDate">
                  End
                </label>
                <Input
                  id="eventEndDate"
                  name="endDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(event) => handleEventFormChange("endDate", event.target.value)}
                  required
                />
              </div>
              <div>
                <label style={formLabelStyles} htmlFor="eventEstimatedBudget">
                  Budget (₹)
                </label>
                <Input
                  id="eventEstimatedBudget"
                  name="estimatedBudget"
                  type="number"
                  placeholder="₹"
                  value={eventForm.estimatedBudget}
                  onChange={(event) => handleEventFormChange("estimatedBudget", event.target.value)}
                />
              </div>
            </div>
            {eventForm.startDate && eventForm.endDate && !isDateRangeOrdered && (
              <Alert type="error">
                End date cannot be before start date.
              </Alert>
            )}
            {overlapCheckInProgressForCurrentDates && (
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-info)" }}>Checking overlap...</span>
            )}
            {dateOverlapInfo.status === "error" && overlapCheckKey && (
              <Alert type="error">
                {dateOverlapInfo.errorMessage}{" "}
                <button
                  type="button"
                  onClick={retryDateOverlapCheck}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-danger)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Retry
                </button>
              </Alert>
            )}
            {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
              <Alert type="warning">
                Overlaps with {dateOverlapInfo.overlaps.length} event(s).
              </Alert>
            )}
            {overlapCheckCompletedForCurrentDates && !dateOverlapInfo.hasOverlap && (
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-success)" }}>✓ No overlaps</span>
            )}
            {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
              <div style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                padding: "var(--spacing-2)",
                borderRadius: "var(--radius-card-sm)",
                backgroundColor: "var(--color-bg-secondary)",
              }}>
                {dateOverlapInfo.overlaps.slice(0, 3).map((overlap, index) => {
                  const conflicting = overlap.eventB || overlap.eventA
                  return (
                    <span key={`${conflicting?.eventId || conflicting?.title}-${index}`} style={{ marginRight: "var(--spacing-2)" }}>
                      • {conflicting?.title || "Event"} ({formatDateRange(conflicting?.startDate, conflicting?.endDate)})
                    </span>
                  )
                })}
              </div>
            )}
            <div>
              <label style={formLabelStyles} htmlFor="eventDescription">
                Description
              </label>
              <Textarea
                id="eventDescription"
                name="description"
                placeholder="Event description"
                value={eventForm.description}
                onChange={(event) => handleEventFormChange("description", event.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAmendmentModal}
        title="Request Amendment"
        width={640}
        onClose={() => { setShowAmendmentModal(false); setSelectedEvent(null); resetDateOverlapInfo() }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => setShowAmendmentModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmitAmendment} loading={submitting} disabled={!canSubmitAmendmentInModal}>Submit</Button>
          </div>
        }
      >
        {showAmendmentModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)", padding: "var(--spacing-1) var(--spacing-2)", backgroundColor: "var(--color-warning-bg)", borderRadius: "var(--radius-card-sm)", display: "inline-block" }}>
              Calendar locked. Amendment will be reviewed by Admin.
            </span>
            <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "2fr 1fr" }}>
              <div>
                <label style={formLabelStyles} htmlFor="amendmentEventTitle">
                  Title
                </label>
                <Input
                  id="amendmentEventTitle"
                  name="title"
                  placeholder="Event title"
                  value={eventForm.title}
                  onChange={(event) => handleEventFormChange("title", event.target.value)}
                  required
                />
              </div>
              <div>
                <label style={formLabelStyles} htmlFor="amendmentEventCategory">
                  Category
                </label>
                <Select
                  id="amendmentEventCategory"
                  name="category"
                  value={eventForm.category}
                  onChange={(event) => handleEventFormChange("category", event.target.value)}
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </div>
            <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div>
                <label style={formLabelStyles} htmlFor="amendmentStartDate">
                  Start
                </label>
                <Input
                  id="amendmentStartDate"
                  name="startDate"
                  type="date"
                  value={eventForm.startDate}
                  onChange={(event) => handleEventFormChange("startDate", event.target.value)}
                  required
                />
              </div>
              <div>
                <label style={formLabelStyles} htmlFor="amendmentEndDate">
                  End
                </label>
                <Input
                  id="amendmentEndDate"
                  name="endDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(event) => handleEventFormChange("endDate", event.target.value)}
                  required
                />
              </div>
              <div>
                <label style={formLabelStyles} htmlFor="amendmentEstimatedBudget">
                  Budget (₹)
                </label>
                <Input
                  id="amendmentEstimatedBudget"
                  name="estimatedBudget"
                  type="number"
                  placeholder="₹"
                  value={eventForm.estimatedBudget}
                  onChange={(event) => handleEventFormChange("estimatedBudget", event.target.value)}
                />
              </div>
            </div>
            {eventForm.startDate && eventForm.endDate && !isDateRangeOrdered && (
              <Alert type="error">End date cannot be before start date.</Alert>
            )}
            {overlapCheckInProgressForCurrentDates && (
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-info)" }}>Checking overlap...</span>
            )}
            {dateOverlapInfo.status === "error" && overlapCheckKey && (
              <Alert type="error">
                {dateOverlapInfo.errorMessage}{" "}
                <button type="button" onClick={retryDateOverlapCheck} style={{ background: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Retry</button>
              </Alert>
            )}
            {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
              <Alert type="warning">Overlaps with {dateOverlapInfo.overlaps.length} event(s).</Alert>
            )}
            {overlapCheckCompletedForCurrentDates && !dateOverlapInfo.hasOverlap && (
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-success)" }}>✓ No overlaps</span>
            )}
            {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", padding: "var(--spacing-2)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }}>
                {dateOverlapInfo.overlaps.slice(0, 3).map((overlap, index) => {
                  const conflicting = overlap.eventB || overlap.eventA
                  return (
                    <span key={`${conflicting?.eventId || conflicting?.title}-${index}`} style={{ marginRight: "var(--spacing-2)" }}>
                      • {conflicting?.title || "Event"} ({formatDateRange(conflicting?.startDate, conflicting?.endDate)})
                    </span>
                  )
                })}
              </div>
            )}
            <div>
              <label style={formLabelStyles} htmlFor="amendmentDescription">
                Description
              </label>
              <Textarea
                id="amendmentDescription"
                name="description"
                placeholder="Event description"
                value={eventForm.description}
                onChange={(event) => handleEventFormChange("description", event.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label style={formLabelStyles} htmlFor="amendmentReason">
                Reason for Amendment *
              </label>
              <Textarea
                id="amendmentReason"
                name="reason"
                placeholder="Min 10 characters"
                value={amendmentReason}
                onChange={(event) => setAmendmentReason(event.target.value)}
                rows={2}
                required
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        title="Approval History"
        width={640}
        onClose={() => setShowHistoryModal(false)}
        footer={<Button size="sm" variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>}
      >
        {calendar && <ApprovalHistory calendarId={calendar._id} />}
      </Modal>

      <Modal
        isOpen={showPendingProposalModal}
        title="Pending Proposals"
        width={860}
        onClose={() => setShowPendingProposalModal(false)}
        footer={<Button size="sm" variant="secondary" onClick={() => setShowPendingProposalModal(false)}>Close</Button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)", fontWeight: "var(--font-weight-medium)" }}>
            {pendingProposalsForSelectedCalendar.length} pending in current calendar
          </span>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Event</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Expected Income</Table.Head>
                <Table.Head>Total Expenditure</Table.Head>
                <Table.Head>Deflection</Table.Head>
                <Table.Head align="right">Action</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pendingProposalsForSelectedCalendar.map((proposal) => (
                <Table.Row key={proposal._id}>
                  <Table.Cell>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                      <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                        {proposal.eventId?.title || "Unknown event"}
                      </span>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        By {proposal.submittedBy?.name || "Unknown"}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDateRange(
                      proposal.eventId?.scheduledStartDate,
                      proposal.eventId?.scheduledEndDate
                    )}
                  </Table.Cell>
                  <Table.Cell>₹{Number(proposal.totalExpectedIncome || 0).toLocaleString()}</Table.Cell>
                  <Table.Cell>₹{Number(proposal.totalExpenditure || 0).toLocaleString()}</Table.Cell>
                  <Table.Cell
                    style={{
                      color:
                        Number(proposal.budgetDeflection || 0) > 0
                          ? "var(--color-danger)"
                          : "var(--color-success)",
                    }}
                  >
                    ₹{Number(proposal.budgetDeflection || 0).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        setShowPendingProposalModal(false)
                        await openPendingProposalReview(proposal)
                      }}
                    >
                      Review
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Modal>

      <Modal
        isOpen={showPendingBillsModal}
        title="Pending Bills"
        width={860}
        onClose={() => setShowPendingBillsModal(false)}
        footer={<Button size="sm" variant="secondary" onClick={() => setShowPendingBillsModal(false)}>Close</Button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)", fontWeight: "var(--font-weight-medium)" }}>
            {pendingExpenseApprovalsForSelectedCalendar.length} pending in current calendar
          </span>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Event</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Submitted By</Table.Head>
                <Table.Head>Total Bills</Table.Head>
                <Table.Head>Assigned Budget</Table.Head>
                <Table.Head>Variance</Table.Head>
                <Table.Head align="right">Action</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pendingExpenseApprovalsForSelectedCalendar.map((expense) => (
                <Table.Row key={expense._id}>
                  <Table.Cell>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {expense.eventId?.title || "Unknown event"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDateRange(
                      expense.eventId?.scheduledStartDate,
                      expense.eventId?.scheduledEndDate
                    )}
                  </Table.Cell>
                  <Table.Cell>{expense.submittedBy?.name || "Unknown"}</Table.Cell>
                  <Table.Cell>₹{Number(expense.totalExpenditure || 0).toLocaleString()}</Table.Cell>
                  <Table.Cell>₹{Number(expense.estimatedBudget || 0).toLocaleString()}</Table.Cell>
                  <Table.Cell
                    style={{
                      color:
                        Number(expense.budgetVariance || 0) > 0
                          ? "var(--color-danger)"
                          : "var(--color-success)",
                    }}
                  >
                    ₹{Number(expense.budgetVariance || 0).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        setShowPendingBillsModal(false)
                        await openPendingExpenseReview(expense)
                      }}
                    >
                      Review
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Modal>

      <Modal
        isOpen={showOverlapDetailsModal}
        title="Date Overlaps"
        width={640}
        onClose={() => setShowOverlapDetailsModal(false)}
        footer={<Button size="sm" variant="secondary" onClick={() => setShowOverlapDetailsModal(false)}>Close</Button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)", fontWeight: "var(--font-weight-medium)" }}>
            {dateConflicts.length} overlaps detected
          </span>
          {dateConflicts.map((conflict, index) => (
            <div
              key={`${conflict.eventA._id || conflict.eventA.title}-${conflict.eventB._id || conflict.eventB.title}-${index}`}
              style={{
                borderRadius: "var(--radius-card-sm)",
                padding: "var(--spacing-2)",
                backgroundColor: "var(--color-bg-secondary)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              <span style={{ fontWeight: "var(--font-weight-medium)" }}>{conflict.eventA.title}</span>
              <span style={{ color: "var(--color-text-muted)", margin: "0 var(--spacing-1)" }}>↔</span>
              <span style={{ fontWeight: "var(--font-weight-medium)" }}>{conflict.eventB.title}</span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={showSettingsModal}
        title="Calendar Settings"
        width={480}
        onClose={() => setShowSettingsModal(false)}
        footer={<Button size="sm" variant="secondary" onClick={() => setShowSettingsModal(false)}>Close</Button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Configure lock state for {calendar?.academicYear}
          </span>
          <div
            style={{
              borderRadius: "var(--radius-card-sm)",
              padding: "var(--spacing-3)",
              backgroundColor: "var(--color-bg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-2)",
            }}
          >
            <div>
              <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)", color: "var(--color-text-heading)" }}>
                Calendar Lock
              </span>
              <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {calendar?.isLocked ? "Locked. GS cannot edit." : "Unlocked. GS can edit."}
              </p>
            </div>
            {calendar?.isLocked ? (
              <Button
                size="sm"
                variant="success"
                onClick={async () => {
                  await handleUnlockCalendar()
                  setShowSettingsModal(false)
                }}
                loading={submitting}
              >
                <Unlock size={14} /> Unlock
              </Button>
            ) : (
              <Button
                size="sm"
                variant="warning"
                onClick={async () => {
                  await handleLockCalendar()
                  setShowSettingsModal(false)
                }}
                loading={submitting}
              >
                <Lock size={14} /> Lock
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showApprovalModal}
        title="Review Calendar"
        width={640}
        onClose={() => {
          setShowApprovalModal(false)
          setCalendarNextApprovalStages([])
        }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
            <Button size="sm" variant="danger" onClick={handleReject} loading={submitting}><X size={14} /> Reject</Button>
            <Button size="sm" variant="success" onClick={handleApprove} loading={submitting} disabled={requiresCalendarNextApprovalSelection && calendarNextApprovalStages.length === 0}><Check size={14} /> Approve</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Reviewing {calendar?.academicYear} calendar with {events.length} events
          </span>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)", fontSize: "var(--font-size-xs)" }}>
            {CATEGORY_ORDER.map((category) => (
              <span key={category} style={{ padding: "var(--spacing-1) var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-card-sm)" }}>
                {CATEGORY_LABELS[category]}: ₹{(budgetSummary.byCategory[category] || 0).toLocaleString()}
              </span>
            ))}
            <span style={{ padding: "var(--spacing-1) var(--spacing-2)", backgroundColor: "var(--color-primary-bg)", borderRadius: "var(--radius-card-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>
              Total: ₹{budgetSummary.total.toLocaleString()}
            </span>
          </div>

          {dateConflicts.length > 0 && (
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)" }}>
              <AlertTriangle size={12} style={{ marginRight: "var(--spacing-1)" }} />
              {dateConflicts.length} overlap(s) detected
            </span>
          )}

          {requiresCalendarNextApprovalSelection && (
            <div>
              <label style={formLabelStyles}>Next Approval Order</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)", padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-card-sm)" }}>
                {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                  <Checkbox key={`calendar-stage-${stage}`} label={stage} checked={calendarNextApprovalStages.includes(stage)} onChange={() => toggleNextApprovalStage(stage, setCalendarNextApprovalStages)} />
                ))}
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>
                  {calendarNextApprovalStages.length > 0 ? calendarNextApprovalStages.join(" → ") : "No stage selected"}
                </span>
              </div>
            </div>
          )}

          <div>
            <label style={formLabelStyles} htmlFor="calendarReviewComments">Comments</label>
            <Textarea id="calendarReviewComments" name="comments" placeholder="Required for rejection" value={approvalComments} onChange={(event) => setApprovalComments(event.target.value)} rows={2} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showOverlapConfirmModal}
        title="Confirm Overlap"
        width={560}
        onClose={() => { setShowOverlapConfirmModal(false); setSubmitOverlapInfo(null) }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button size="sm" variant="secondary" onClick={() => { setShowOverlapConfirmModal(false); setSubmitOverlapInfo(null) }}>Cancel</Button>
            <Button size="sm" variant="warning" onClick={handleConfirmSubmitWithOverlap} loading={submitting}>Submit Anyway</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)" }}>
            {submitOverlapInfo?.message || "Events have overlapping date ranges."}
          </span>
          {(submitOverlapInfo?.overlaps || []).slice(0, 5).map((overlap, index) => (
            <div
              key={`${overlap.eventA?.eventId || overlap.eventA?.title}-${overlap.eventB?.eventId || overlap.eventB?.title}-${index}`}
              style={{ borderRadius: "var(--radius-card-sm)", padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", fontSize: "var(--font-size-xs)" }}
            >
              <span style={{ fontWeight: "var(--font-weight-medium)" }}>{overlap.eventA?.title}</span>
              <span style={{ color: "var(--color-text-muted)", margin: "0 var(--spacing-1)" }}>↔</span>
              <span style={{ fontWeight: "var(--font-weight-medium)" }}>{overlap.eventB?.title}</span>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  )
}

export default EventsPage
