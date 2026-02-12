/**
 * Gymkhana Events Page
 * Calendar view with year selector, event list, and role-based actions:
 * - GS Gymkhana: Add/Edit events
 * - President Gymkhana: Edit all pre-submission events + submit calendar
 */

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent } from "@/components/ui/layout"
import { Select, Input, Textarea, Checkbox } from "@/components/ui/form"
import {
  Modal,
  LoadingState,
  ErrorState,
  EmptyState,
  Alert,
  useToast,
} from "@/components/ui/feedback"
import { Badge, StatCards } from "@/components/ui/data-display"
import { ToggleButtonGroup, DataTable, Tabs } from "@/components/ui"
import { Table, TableHead, TableBody, TableHeader, TableRow, TableCell } from "@/components/ui/table"
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
} from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
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
  academic: "#1D4ED8",
  cultural: "#6D28D9",
  sports: "#15803D",
  technical: "#0369A1",
}

const CATEGORY_BADGE_BACKGROUNDS = {
  academic: "#DBEAFE",
  cultural: "#EDE9FE",
  sports: "#DCFCE7",
  technical: "#E0F2FE",
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
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-secondary)",
  marginBottom: "var(--spacing-1)",
}

const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
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
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [events, setEvents] = useState([])
  const [proposalsForApproval, setProposalsForApproval] = useState([])
  const [pendingExpenseApprovals, setPendingExpenseApprovals] = useState([])
  const [viewMode, setViewMode] = useState("list")
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all")
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAmendmentModal, setShowAmendmentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showOverlapConfirmModal, setShowOverlapConfirmModal] = useState(false)
  const [showOverlapDetailsModal, setShowOverlapDetailsModal] = useState(false)
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
  const [submitting, setSubmitting] = useState(false)
  const [dateOverlapInfo, setDateOverlapInfo] = useState(createDefaultOverlapState)
  const [submitOverlapInfo, setSubmitOverlapInfo] = useState(null)
  const [proposalEvent, setProposalEvent] = useState(null)
  const [proposalData, setProposalData] = useState(null)
  const [proposalForm, setProposalForm] = useState(createDefaultProposalForm)
  const [proposalActionComments, setProposalActionComments] = useState("")
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalHistoryRefreshKey, setProposalHistoryRefreshKey] = useState(0)
  const [expenseEvent, setExpenseEvent] = useState(null)
  const [expenseData, setExpenseData] = useState(null)
  const [expenseForm, setExpenseForm] = useState(createDefaultExpenseForm)
  const [expenseLoading, setExpenseLoading] = useState(false)
  const [expenseApprovalComments, setExpenseApprovalComments] = useState("")
  const overlapCheckRequestRef = useRef(0)

  const isGymkhanaRole = user?.role === "Gymkhana"
  const isAdminLevel = user?.role === "Admin" || user?.role === "Super Admin"
  const isGS = user?.subRole === "GS Gymkhana"
  const isPresident = user?.subRole === "President Gymkhana"
  const canEditGS = calendar && !calendar.isLocked && isGS && (calendar.status === "draft" || calendar.status === "rejected")
  const canEditPresident =
    calendar &&
    !calendar.isLocked &&
    isPresident &&
    ["draft", "rejected", "pending_president"].includes(calendar.status)
  const canEdit = canEditGS || canEditPresident
  const canSubmitCalendar = Boolean(
    calendar &&
      !calendar.isLocked &&
      isPresident &&
      calendar.status === "draft" &&
      events.length > 0
  )
  const canApprove = Boolean(
    calendar?.status &&
      user?.subRole &&
      CALENDAR_STATUS_TO_APPROVER[calendar.status] === user.subRole
  )
  const canManageCalendarLock = isAdminLevel && Boolean(calendar?._id)
  const canCreateCalendar = isAdminLevel

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
  const budgetStats = useMemo(
    () => [
      {
        title: "Academic Budget",
        value: `₹${(budgetSummary.byCategory.academic || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.academic || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.academic,
      },
      {
        title: "Cultural Budget",
        value: `₹${(budgetSummary.byCategory.cultural || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.cultural || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.cultural,
      },
      {
        title: "Sports Budget",
        value: `₹${(budgetSummary.byCategory.sports || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.sports || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.sports,
      },
      {
        title: "Technical Budget",
        value: `₹${(budgetSummary.byCategory.technical || 0).toLocaleString()}`,
        subtitle: `${budgetSummary.counts.technical || 0} event(s)`,
        icon: <CalendarDays size={16} />,
        color: CATEGORY_COLORS.technical,
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
    return isGS && isProposalWindowOpen(proposalEvent) && !proposalData && proposalEvent.gymkhanaEventId
  }, [proposalEvent, isGS, proposalData])
  const canCurrentUserReviewProposal = useMemo(() => {
    if (!proposalData?.status || !user?.subRole) return false
    return PROPOSAL_STATUS_TO_APPROVER[proposalData.status] === user.subRole
  }, [proposalData?.status, user?.subRole])
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
      isExpenseSubmissionAllowedForSelectedEvent &&
      expenseData?.approvalStatus !== "approved",
    [isGS, isExpenseSubmissionAllowedForSelectedEvent, expenseData?.approvalStatus]
  )
  const canApproveExpense = useMemo(
    () =>
      isAdminLevel &&
      Boolean(expenseData?._id) &&
      expenseData?.approvalStatus !== "approved",
    [isAdminLevel, expenseData?._id, expenseData?.approvalStatus]
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
    : "Events Calendar"
  const headerSubtitle = calendarStatusLabel ? `Status: ${calendarStatusLabel}` : "No active calendar"

  useEffect(() => {
    fetchYears()
  }, [user?.role, user?.subRole])

  useEffect(() => {
    if (selectedYear) {
      fetchCalendar(selectedYear)
    }
  }, [selectedYear])

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

      return expenses.filter((expense) => expense?.approvalStatus !== "approved")
    } catch {
      return []
    }
  }

  const fetchYears = async () => {
    try {
      setLoading(true)
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
      }
    } catch (err) {
      setError(err.message || "Failed to load academic years")
    } finally {
      setLoading(false)
    }
  }

  const fetchCalendar = async (year) => {
    try {
      setLoading(true)
      setError(null)
      const res = await gymkhanaEventsApi.getCalendarByYear(year)
      const calendarData = res.data?.calendar || res.calendar || null

      if (!calendarData) {
        setCalendar(null)
        setEvents([])
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
    } catch (err) {
      if (err.status === 404) {
        setCalendar(null)
        setEvents([])
      } else {
        setError(err.message || "Failed to load calendar")
      }
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i += 1) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i += 1) {
      days.push(new Date(year, month, i))
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

    if (calendar?.isLocked && isGS) {
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
    setProposalEvent(event)
    setProposalActionComments("")
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
    if (!proposalData?._id) return
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveProposal(proposalData._id, proposalActionComments)
      toast.success("Proposal approved")
      setProposalActionComments("")
      await fetchProposalForEvent(proposalEvent)
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to approve proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectProposal = async () => {
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
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to reject proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestProposalRevision = async () => {
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
    setExpenseEvent(event)
    setExpenseApprovalComments("")
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
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to save bills")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveExpense = async () => {
    if (!expenseData?._id) return

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveExpense(expenseData._id, expenseApprovalComments)
      toast.success("Bills approved")
      setExpenseApprovalComments("")
      await fetchExpenseForEvent(expenseEvent)
      await fetchCalendar(selectedYear)
      const pendingExpenses = await getPendingExpenseApprovals()
      setPendingExpenseApprovals(pendingExpenses)
    } catch (err) {
      toast.error(err.message || "Failed to approve bills")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddEvent = () => {
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
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveCalendar(calendar._id, approvalComments)
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

  if (loading && !calendar) {
    return <LoadingState message="Loading events..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchYears} />
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
        {calendar?.isLocked && isGS && (
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
        {calendar && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <StatCards stats={budgetStats} columns={5} />
          </div>
        )}

        {calendar && (isGS || isPresident) && pendingProposalReminders.length > 0 && (
          <Card style={{ marginBottom: "var(--spacing-4)" }}>
            <CardContent style={{ padding: "var(--spacing-4)" }}>
              <Alert type="warning">
                <Bell size={16} style={{ marginRight: "var(--spacing-1)" }} />
                {pendingProposalReminders.length} event(s) are in proposal submission window (21 days before event).
              </Alert>
              <div style={{ marginTop: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {pendingProposalReminders.slice(0, 5).map((event) => (
                  <div
                    key={`proposal-reminder-${event._id || event.title}`}
                    style={{
                      border: "var(--border-1) solid var(--color-border-primary)",
                      borderRadius: "var(--radius-card-sm)",
                      padding: "var(--spacing-3)",
                      backgroundColor: "var(--color-bg-secondary)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                        {event.title}
                      </p>
                      <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                        {formatDateRange(event.startDate, event.endDate)} | Budget ₹{Number(event.estimatedBudget || 0).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => openProposalModal(event)}>
                      <FileText size={14} /> Proposal
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {proposalsForApproval.length > 0 && (
          <Card style={{ marginBottom: "var(--spacing-4)" }}>
            <CardContent style={{ padding: "var(--spacing-4)" }}>
              <h3
                style={{
                  marginBottom: "var(--spacing-3)",
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Pending Proposal Approvals ({proposalsForApproval.length})
              </h3>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Expected Income</TableHeader>
                    <TableHeader>Total Expenditure</TableHeader>
                    <TableHeader>Deflection</TableHeader>
                    <TableHeader align="right">Action</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposalsForApproval.map((proposal) => (
                    <TableRow key={proposal._id}>
                      <TableCell>
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                            {proposal.eventId?.title || "Unknown event"}
                          </span>
                          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            By {proposal.submittedBy?.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateRange(
                          proposal.eventId?.scheduledStartDate,
                          proposal.eventId?.scheduledEndDate
                        )}
                      </TableCell>
                      <TableCell>₹{Number(proposal.totalExpectedIncome || 0).toLocaleString()}</TableCell>
                      <TableCell>₹{Number(proposal.totalExpenditure || 0).toLocaleString()}</TableCell>
                      <TableCell
                        style={{
                          color:
                            Number(proposal.budgetDeflection || 0) > 0
                              ? "var(--color-danger)"
                              : "var(--color-success)",
                        }}
                      >
                        ₹{Number(proposal.budgetDeflection || 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPendingProposalReview(proposal)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {isAdminLevel && pendingExpenseApprovals.length > 0 && (
          <Card style={{ marginBottom: "var(--spacing-4)" }}>
            <CardContent style={{ padding: "var(--spacing-4)" }}>
              <h3
                style={{
                  marginBottom: "var(--spacing-3)",
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Pending Bill Approvals ({pendingExpenseApprovals.length})
              </h3>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Submitted By</TableHeader>
                    <TableHeader>Total Bills</TableHeader>
                    <TableHeader>Assigned Budget</TableHeader>
                    <TableHeader>Variance</TableHeader>
                    <TableHeader align="right">Action</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingExpenseApprovals.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>
                        <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                          {expense.eventId?.title || "Unknown event"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDateRange(
                          expense.eventId?.scheduledStartDate,
                          expense.eventId?.scheduledEndDate
                        )}
                      </TableCell>
                      <TableCell>{expense.submittedBy?.name || "Unknown"}</TableCell>
                      <TableCell>₹{Number(expense.totalExpenditure || 0).toLocaleString()}</TableCell>
                      <TableCell>₹{Number(expense.estimatedBudget || 0).toLocaleString()}</TableCell>
                      <TableCell
                        style={{
                          color:
                            Number(expense.budgetVariance || 0) > 0
                              ? "var(--color-danger)"
                              : "var(--color-success)",
                        }}
                      >
                        ₹{Number(expense.budgetVariance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPendingExpenseReview(expense)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {calendar && calendar.status !== "approved" && dateConflicts.length > 0 && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--spacing-3)",
                padding: "var(--spacing-3)",
                border: "var(--border-1) solid var(--color-border-primary)",
                borderRadius: "var(--radius-card-sm)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-3)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-warning-bg)",
                    color: "var(--color-warning)",
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={14} />
                </span>
                <span style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                  <strong>{dateConflicts.length}</strong> date overlap(s) found in this calendar.
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOverlapDetailsModal(true)}
              >
                View Overlap Details
              </Button>
            </div>
          </div>
        )}

        {!calendar && (
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

        {calendar && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <Tabs
              tabs={categoryFilterTabs}
              activeTab={activeCategoryFilter}
              setActiveTab={setActiveCategoryFilter}
            />
          </div>
        )}

        {calendar && viewMode === "list" && (
          <>
            {filteredEvents.length === 0 ? (
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
                columns={[
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
                ]}
                onRowClick={handleEventRowClick}
                getRowId={(event) =>
                  event?._id ||
                  `${event?.title || "event"}-${event?.category || "na"}-${event?.startDate || "na"}-${event?.endDate || "na"}`
                }
              />
            )}
          </>
        )}

        {calendar && viewMode === "calendar" && (
          <Card>
            <CardContent style={{ padding: "var(--spacing-4)" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--spacing-4)",
              }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)" }}>
                  {calendarMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "var(--spacing-1)",
              }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} style={{
                    padding: "var(--spacing-2)",
                    textAlign: "center",
                    fontWeight: "var(--font-weight-semibold)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                  }}>
                    {day}
                  </div>
                ))}

                {getDaysInMonth(calendarMonth).map((date, index) => {
                  const dayEvents = date ? getEventsForDate(date) : []
                  const isToday = date?.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      style={{
                        minHeight: "88px",
                        padding: "var(--spacing-1)",
                        backgroundColor: date ? "var(--color-bg-primary)" : "transparent",
                        border: isToday
                          ? "var(--border-2) solid var(--color-primary)"
                          : "var(--border-1) solid var(--color-border-primary)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {date && (
                        <>
                          <div style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: isToday ? "var(--font-weight-bold)" : "var(--font-weight-normal)",
                            color: isToday ? "var(--color-primary)" : "var(--color-text-body)",
                            marginBottom: "var(--spacing-1)",
                          }}>
                            {date.getDate()}
                          </div>
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <div
                              key={i}
                              onClick={() => handleEventClick(event)}
                              style={{
                                fontSize: "var(--font-size-xs)",
                                padding: "var(--spacing-0-5) var(--spacing-1)",
                                marginBottom: "var(--spacing-0-5)",
                                backgroundColor: CATEGORY_COLORS[event.category],
                                color: "white",
                                borderRadius: "var(--radius-xs)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div style={{
                              fontSize: "var(--font-size-xs)",
                              color: "var(--color-text-muted)",
                            }}>
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
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
        onClose={() => { setShowEventModal(false); setSelectedEvent(null) }}
        footer={<Button variant="secondary" onClick={() => setShowEventModal(false)}>Close</Button>}
      >
        {selectedEvent && showEventModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div>
              <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Category</label>
              <Badge style={{ ...getCategoryBadgeStyle(selectedEvent.category), marginLeft: "var(--spacing-2)" }}>
                {CATEGORY_LABELS[selectedEvent.category] || selectedEvent.category}
              </Badge>
            </div>
            <div>
              <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Date Range</label>
              <p>{formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}</p>
            </div>
            <div>
              <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Estimated Budget</label>
              <p>₹{Number(selectedEvent.estimatedBudget || 0).toLocaleString()}</p>
            </div>
            {selectedEvent.description && (
              <div>
                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Description</label>
                <p>{selectedEvent.description}</p>
              </div>
            )}
            {(isGymkhanaRole || isAdminLevel) && (
              <div style={{ borderTop: "var(--border-1) solid var(--color-border-primary)", paddingTop: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                <div>
                  <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    Proposal
                  </label>
                  <p style={{ margin: "var(--spacing-1) 0", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                    {(() => {
                      const proposalDueDate = getProposalDueDate(selectedEvent)
                      const dueDateText = proposalDueDate ? proposalDueDate.toLocaleDateString() : null

                      if (!selectedEvent.gymkhanaEventId) {
                        return "Proposal option will be available once this calendar is approved and event records are generated."
                      }

                      if (selectedEvent.proposalSubmitted) {
                        return "Proposal submitted for this event."
                      }

                      if (dueDateText) {
                        return `Proposal due on ${dueDateText}.`
                      }

                      return "Proposal due date is not available."
                    })()}
                  </p>
                  {selectedEvent.gymkhanaEventId && (selectedEvent.proposalSubmitted || isGS || isPresident) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openProposalModal(selectedEvent)}
                    >
                      <FileText size={14} /> {selectedEvent.proposalSubmitted ? "View Proposal" : "Submit Proposal"}
                    </Button>
                  )}
                </div>

                <div>
                  <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    Bills
                  </label>
                  <p style={{ margin: "var(--spacing-1) 0", color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                    {(() => {
                      if (!selectedEvent.gymkhanaEventId) {
                        return "Bills option will be available once this calendar is approved and event records are generated."
                      }

                      if (
                        selectedEvent.eventStatus !== "proposal_approved" &&
                        selectedEvent.eventStatus !== "completed"
                      ) {
                        return "Bills can be submitted only after final proposal approval."
                      }

                      return "Upload and review bill PDFs for this event."
                    })()}
                  </p>
                  {selectedEvent.gymkhanaEventId &&
                    (selectedEvent.eventStatus === "proposal_approved" ||
                      selectedEvent.eventStatus === "completed") &&
                    (isGS || isAdminLevel) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openExpenseModal(selectedEvent)}
                      >
                        <Receipt size={14} /> Manage Bills
                      </Button>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showProposalModal}
        title={`Event Proposal${proposalEvent?.title ? `: ${proposalEvent.title}` : ""}`}
        width={760}
        onClose={() => {
          setShowProposalModal(false)
          setProposalEvent(null)
          setProposalData(null)
          setProposalForm(createDefaultProposalForm())
          setProposalActionComments("")
        }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button variant="secondary" onClick={() => setShowProposalModal(false)}>
              Close
            </Button>
            {canEditProposalForm && (
              <Button
                onClick={handleCreateOrUpdateProposal}
                loading={submitting}
                disabled={!isProposalFormValid}
              >
                {proposalData?._id ? "Save Proposal" : "Submit Proposal"}
              </Button>
            )}
          </div>
        }
      >
        {proposalLoading ? (
          <LoadingState message="Loading proposal..." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            {proposalEvent && (
              <Alert type="info">
                Event budget: ₹{Number(proposalEvent.estimatedBudget || 0).toLocaleString()}
                {(() => {
                  const proposalDueDate = getProposalDueDate(proposalEvent)
                  return proposalDueDate ? ` | Proposal due: ${proposalDueDate.toLocaleDateString()}` : ""
                })()}
              </Alert>
            )}

            {proposalData && (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                <Badge variant={proposalData.status === "approved" ? "success" : proposalData.status === "rejected" ? "danger" : "info"}>
                  {proposalData.status?.replace(/_/g, " ")}
                </Badge>
                {proposalData.currentApprovalStage && (
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                    Current stage: {proposalData.currentApprovalStage}
                  </span>
                )}
              </div>
            )}

            {!proposalData && !canCreateProposalForSelectedEvent && (
              <Alert type="warning">
                Proposal submission is available to GS only after the proposal window opens (21 days before event).
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
                rows={5}
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
                External Guests Details
              </label>
              <Textarea
                id="externalGuestsDetails"
                name="externalGuestsDetails"
                placeholder="External guests details"
                value={proposalForm.externalGuestsDetails}
                onChange={(event) => handleProposalFormChange("externalGuestsDetails", event.target.value)}
                rows={3}
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

            {proposalForm.hasRegistrationFee && (
              <div>
                <label style={formLabelStyles} htmlFor="registrationFeeAmount">
                  Registration Fee Amount (₹)
                </label>
                <Input
                  id="registrationFeeAmount"
                  name="registrationFeeAmount"
                  type="number"
                  placeholder="Registration fee amount (₹)"
                  value={proposalForm.registrationFeeAmount}
                  onChange={(event) =>
                    handleProposalFormChange("registrationFeeAmount", event.target.value)
                  }
                  disabled={!canEditProposalForm}
                />
              </div>
            )}

            <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <div>
                <label style={formLabelStyles} htmlFor="totalExpectedIncome">
                  Total Expected Income (₹)
                </label>
                <Input
                  id="totalExpectedIncome"
                  name="totalExpectedIncome"
                  type="number"
                  placeholder="Total expected income (₹)"
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
                  placeholder="Total expenditure (₹)"
                  value={proposalForm.totalExpenditure}
                  onChange={(event) =>
                    handleProposalFormChange("totalExpenditure", event.target.value)
                  }
                  disabled={!canEditProposalForm}
                />
              </div>
            </div>

            <div
              style={{
                border: "var(--border-1) solid var(--color-border-primary)",
                borderRadius: "var(--radius-card-sm)",
                padding: "var(--spacing-3)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                Budget deflection (Auto)
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: proposalDeflection > 0 ? "var(--color-danger)" : "var(--color-success)",
                }}
              >
                ₹{proposalDeflection.toLocaleString()}
              </p>
            </div>

            {canCurrentUserReviewProposal && proposalData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <div>
                  <label style={formLabelStyles} htmlFor="proposalActionComments">
                    Review Comments
                  </label>
                  <Textarea
                    id="proposalActionComments"
                    name="proposalActionComments"
                    placeholder="Approval comments (required for reject/revision)"
                    value={proposalActionComments}
                    onChange={(event) => setProposalActionComments(event.target.value)}
                    rows={3}
                  />
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                  <Button variant="warning" onClick={handleRequestProposalRevision} loading={submitting}>
                    Request Revision
                  </Button>
                  <Button variant="danger" onClick={handleRejectProposal} loading={submitting}>
                    Reject
                  </Button>
                  <Button variant="success" onClick={handleApproveProposal} loading={submitting}>
                    Approve
                  </Button>
                </div>
              </div>
            )}

            {proposalData?._id && (
              <div>
                <p style={{ marginBottom: "var(--spacing-2)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                  Activity Log
                </p>
                <ApprovalHistory key={proposalHistoryRefreshKey} proposalId={proposalData._id} />
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showExpenseModal}
        title={`Event Bills${expenseEvent?.title ? `: ${expenseEvent.title}` : ""}`}
        width={860}
        onClose={() => {
          setShowExpenseModal(false)
          setExpenseEvent(null)
          setExpenseData(null)
          setExpenseForm(createDefaultExpenseForm())
          setExpenseApprovalComments("")
        }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
              Close
            </Button>
            {canEditExpenseForm && (
              <Button
                onClick={handleCreateOrUpdateExpense}
                loading={submitting}
                disabled={!isExpenseFormValid}
              >
                {expenseData?._id ? "Update Bills" : "Submit Bills"}
              </Button>
            )}
          </div>
        }
      >
        {expenseLoading ? (
          <LoadingState message="Loading bills..." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            {expenseEvent && (
              <Alert type="info">
                Assigned budget: ₹{assignedExpenseBudget.toLocaleString()}
                {` | Total bills: ₹${expenseTotal.toLocaleString()}`}
              </Alert>
            )}

            {expenseData && (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                <Badge variant={expenseData.approvalStatus === "approved" ? "success" : "warning"}>
                  {expenseData.approvalStatus === "approved" ? "Approved" : "Pending Approval"}
                </Badge>
                {expenseData.approvedBy?.name && (
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                    Approved by {expenseData.approvedBy.name}
                    {expenseData.approvedAt ? ` on ${new Date(expenseData.approvedAt).toLocaleDateString()}` : ""}
                  </span>
                )}
              </div>
            )}

            {!expenseData && !isExpenseSubmissionAllowedForSelectedEvent && (
              <Alert type="warning">
                Bills can be submitted only after final proposal approval.
              </Alert>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
              {(expenseForm.bills || []).map((bill, index) => (
                <div
                  key={bill.localId}
                  style={{
                    border: "var(--border-1) solid var(--color-border-primary)",
                    borderRadius: "var(--radius-card-sm)",
                    padding: "var(--spacing-3)",
                    backgroundColor: "var(--color-bg-secondary)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-3)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-2)" }}>
                    <p style={{ margin: 0, fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                      Bill #{index + 1}
                    </p>
                    {canEditExpenseForm && (expenseForm.bills || []).length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveBillRow(bill.localId)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    <div>
                      <label style={formLabelStyles} htmlFor={`bill-description-${bill.localId}`}>
                        Bill Description
                      </label>
                      <Input
                        id={`bill-description-${bill.localId}`}
                        name={`bill-description-${bill.localId}`}
                        placeholder="Bill description"
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
                        placeholder="Amount (₹)"
                        value={bill.amount}
                        onChange={(event) =>
                          handleBillFieldChange(bill.localId, "amount", event.target.value)
                        }
                        disabled={!canEditExpenseForm}
                      />
                    </div>
                    <div>
                      <label style={formLabelStyles} htmlFor={`bill-number-${bill.localId}`}>
                        Bill Number
                      </label>
                      <Input
                        id={`bill-number-${bill.localId}`}
                        name={`bill-number-${bill.localId}`}
                        placeholder="Bill number (optional)"
                        value={bill.billNumber}
                        onChange={(event) =>
                          handleBillFieldChange(bill.localId, "billNumber", event.target.value)
                        }
                        disabled={!canEditExpenseForm}
                      />
                    </div>
                    <div>
                      <label style={formLabelStyles} htmlFor={`bill-date-${bill.localId}`}>
                        Bill Date
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

                  <div>
                    <label style={formLabelStyles} htmlFor={`bill-vendor-${bill.localId}`}>
                      Vendor
                    </label>
                    <Input
                      id={`bill-vendor-${bill.localId}`}
                      name={`bill-vendor-${bill.localId}`}
                      placeholder="Vendor (optional)"
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
                    uploadedText="Bill document uploaded"
                    viewerTitle={`Bill ${index + 1}`}
                    viewerSubtitle="Uploaded bill attachment"
                    downloadFileName={`event-bill-${index + 1}.pdf`}
                  />
                </div>
              ))}
            </div>

            {canEditExpenseForm && (
              <Button size="sm" variant="secondary" onClick={handleAddBillRow}>
                <Plus size={14} /> Add Another Bill
              </Button>
            )}

            <PdfUploadField
              label="Event Report PDF"
              value={expenseForm.eventReportDocumentUrl}
              onChange={(url) => handleExpenseFormChange("eventReportDocumentUrl", url)}
              onUpload={uploadEventReportDocument}
              disabled={!canEditExpenseForm}
              uploadedText="Event report uploaded"
              viewerTitle="Event Report"
              viewerSubtitle="Post-event report attachment"
              downloadFileName="event-report.pdf"
            />

            <div>
              <label style={formLabelStyles} htmlFor="expenseNotes">
                Notes
              </label>
              <Textarea
                id="expenseNotes"
                name="expenseNotes"
                placeholder="Notes (optional)"
                value={expenseForm.notes}
                onChange={(event) => handleExpenseFormChange("notes", event.target.value)}
                rows={3}
                disabled={!canEditExpenseForm}
              />
            </div>

            <div
              style={{
                border: "var(--border-1) solid var(--color-border-primary)",
                borderRadius: "var(--radius-card-sm)",
                padding: "var(--spacing-3)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                Bill Summary (GS)
              </p>
              <p style={{ margin: "var(--spacing-1) 0 0 0", color: "var(--color-text-body)" }}>
                Total Bill Amount: <strong>₹{expenseTotal.toLocaleString()}</strong>
              </p>
              <p style={{ margin: "var(--spacing-1) 0 0 0", color: "var(--color-text-body)" }}>
                Assigned Budget: <strong>₹{assignedExpenseBudget.toLocaleString()}</strong>
              </p>
              <p
                style={{
                  margin: "var(--spacing-1) 0 0 0",
                  color: expenseVariance > 0 ? "var(--color-danger)" : "var(--color-success)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Variance: ₹{expenseVariance.toLocaleString()}
              </p>
            </div>

            {canApproveExpense && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <div>
                  <label style={formLabelStyles} htmlFor="expenseApprovalComments">
                    Approval Comments
                  </label>
                  <Textarea
                    id="expenseApprovalComments"
                    name="expenseApprovalComments"
                    placeholder="Approval comments (optional)"
                    value={expenseApprovalComments}
                    onChange={(event) => setExpenseApprovalComments(event.target.value)}
                    rows={3}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="success" onClick={handleApproveExpense} loading={submitting}>
                    <Check size={14} /> Approve Bills
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAddEventModal}
        title={selectedEvent ? "Edit Event" : "Add Event"}
        width={760}
        onClose={() => { setShowAddEventModal(false); setSelectedEvent(null); resetDateOverlapInfo() }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button variant="secondary" onClick={() => setShowAddEventModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent} loading={submitting} disabled={!canSaveEventInModal}>Save Event</Button>
          </div>
        }
      >
        {showAddEventModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div>
              <label style={formLabelStyles} htmlFor="eventTitle">
                Event Title
              </label>
              <Input
                id="eventTitle"
                name="title"
                placeholder="Event Title"
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
            <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              <div>
                <label style={formLabelStyles} htmlFor="eventStartDate">
                  Start Date
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
                  End Date
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
            </div>
            {eventForm.startDate && eventForm.endDate && !isDateRangeOrdered && (
              <Alert type="error">
                End date cannot be before start date.
              </Alert>
            )}
            {overlapCheckInProgressForCurrentDates && (
              <Alert type="info">
                Checking overlap for selected date range...
              </Alert>
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
                <strong>Date overlap warning:</strong> this range overlaps with {dateOverlapInfo.overlaps.length} existing event(s).
              </Alert>
            )}
            {overlapCheckCompletedForCurrentDates && !dateOverlapInfo.hasOverlap && (
              <Alert type="success">
                Date overlap check completed: no overlaps found for the selected range.
              </Alert>
            )}
            {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-2)",
                padding: "var(--spacing-3)",
                borderRadius: "var(--radius-card-sm)",
                backgroundColor: "var(--color-bg-secondary)",
                border: "var(--border-1) solid var(--color-border-primary)",
              }}>
                {dateOverlapInfo.overlaps.slice(0, 3).map((overlap, index) => {
                  const conflicting = overlap.eventB || overlap.eventA
                  return (
                    <p key={`${conflicting?.eventId || conflicting?.title}-${index}`} style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                      {conflicting?.title || "Existing event"} ({formatDateRange(conflicting?.startDate, conflicting?.endDate)})
                    </p>
                  )
                })}
              </div>
            )}
            <div>
              <label style={formLabelStyles} htmlFor="eventEstimatedBudget">
                Estimated Budget (₹)
              </label>
              <Input
                id="eventEstimatedBudget"
                name="estimatedBudget"
                type="number"
                placeholder="Estimated Budget (₹)"
                value={eventForm.estimatedBudget}
                onChange={(event) => handleEventFormChange("estimatedBudget", event.target.value)}
              />
            </div>
            <div>
              <label style={formLabelStyles} htmlFor="eventDescription">
                Description
              </label>
              <Textarea
                id="eventDescription"
                name="description"
                placeholder="Description"
                value={eventForm.description}
                onChange={(event) => handleEventFormChange("description", event.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAmendmentModal}
        title="Request Amendment"
        width={760}
        onClose={() => { setShowAmendmentModal(false); setSelectedEvent(null); resetDateOverlapInfo() }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button variant="secondary" onClick={() => setShowAmendmentModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitAmendment} loading={submitting} disabled={!canSubmitAmendmentInModal}>Submit Request</Button>
          </div>
        }
      >
        {showAmendmentModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <Alert type="info">
              The calendar is locked. Your amendment request will be reviewed by Admin.
            </Alert>
            <div>
              <label style={formLabelStyles} htmlFor="amendmentEventTitle">
                Event Title
              </label>
              <Input
                id="amendmentEventTitle"
                name="title"
                placeholder="Event Title"
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
            <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              <div>
                <label style={formLabelStyles} htmlFor="amendmentStartDate">
                  Start Date
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
                  End Date
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
            </div>
            {eventForm.startDate && eventForm.endDate && !isDateRangeOrdered && (
              <Alert type="error">
                End date cannot be before start date.
              </Alert>
            )}
            {overlapCheckInProgressForCurrentDates && (
              <Alert type="info">
                Checking overlap for selected date range...
              </Alert>
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
                <strong>Date overlap warning:</strong> this range overlaps with {dateOverlapInfo.overlaps.length} existing event(s).
              </Alert>
            )}
            {overlapCheckCompletedForCurrentDates && !dateOverlapInfo.hasOverlap && (
              <Alert type="success">
                Date overlap check completed: no overlaps found for the selected range.
              </Alert>
            )}
            {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-2)",
                padding: "var(--spacing-3)",
                borderRadius: "var(--radius-card-sm)",
                backgroundColor: "var(--color-bg-secondary)",
                border: "var(--border-1) solid var(--color-border-primary)",
              }}>
                {dateOverlapInfo.overlaps.slice(0, 3).map((overlap, index) => {
                  const conflicting = overlap.eventB || overlap.eventA
                  return (
                    <p key={`${conflicting?.eventId || conflicting?.title}-${index}`} style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                      {conflicting?.title || "Existing event"} ({formatDateRange(conflicting?.startDate, conflicting?.endDate)})
                    </p>
                  )
                })}
              </div>
            )}
            <div>
              <label style={formLabelStyles} htmlFor="amendmentEstimatedBudget">
                Estimated Budget (₹)
              </label>
              <Input
                id="amendmentEstimatedBudget"
                name="estimatedBudget"
                type="number"
                placeholder="Estimated Budget (₹)"
                value={eventForm.estimatedBudget}
                onChange={(event) => handleEventFormChange("estimatedBudget", event.target.value)}
              />
            </div>
            <div>
              <label style={formLabelStyles} htmlFor="amendmentDescription">
                Description
              </label>
              <Textarea
                id="amendmentDescription"
                name="description"
                placeholder="Description"
                value={eventForm.description}
                onChange={(event) => handleEventFormChange("description", event.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label style={formLabelStyles} htmlFor="amendmentReason">
                Reason for Amendment
              </label>
              <Textarea
                id="amendmentReason"
                name="reason"
                placeholder="Reason for amendment (min 10 characters)"
                value={amendmentReason}
                onChange={(event) => setAmendmentReason(event.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        title="Approval History"
        width={700}
        onClose={() => setShowHistoryModal(false)}
        footer={<Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>}
      >
        {calendar && <ApprovalHistory calendarId={calendar._id} />}
      </Modal>

      <Modal
        isOpen={showOverlapDetailsModal}
        title="Date Overlap Details"
        width={760}
        onClose={() => setShowOverlapDetailsModal(false)}
        footer={
          <Button variant="secondary" onClick={() => setShowOverlapDetailsModal(false)}>
            Close
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <Alert type="warning">
            Total overlaps: <strong>{dateConflicts.length}</strong>
          </Alert>
          {dateConflicts.map((conflict, index) => (
            <div
              key={`${conflict.eventA._id || conflict.eventA.title}-${conflict.eventB._id || conflict.eventB.title}-${index}`}
              style={{
                border: "var(--border-1) solid var(--color-border-primary)",
                borderRadius: "var(--radius-card-sm)",
                padding: "var(--spacing-3)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{conflict.eventA.title}</strong> ({formatDateRange(conflict.eventA.startDate, conflict.eventA.endDate)})
              </p>
              <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                overlaps with
              </p>
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{conflict.eventB.title}</strong> ({formatDateRange(conflict.eventB.startDate, conflict.eventB.endDate)})
              </p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={showSettingsModal}
        title="Calendar Settings"
        width={560}
        onClose={() => setShowSettingsModal(false)}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <Alert type="info">
            Configure lock state for <strong>{calendar?.academicYear}</strong>.
          </Alert>
          <div
            style={{
              border: "var(--border-1) solid var(--color-border-primary)",
              borderRadius: "var(--radius-card-sm)",
              padding: "var(--spacing-4)",
              backgroundColor: "var(--color-bg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                Calendar Lock
              </p>
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                {calendar?.isLocked
                  ? "Calendar is locked. GS cannot edit directly."
                  : "Calendar is unlocked. GS can edit based on status."}
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
        width={720}
        onClose={() => setShowApprovalModal(false)}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={submitting}>
              <X size={14} /> Reject
            </Button>
            <Button variant="success" onClick={handleApprove} loading={submitting}>
              <Check size={14} /> Approve
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <Alert type="info">
            You are reviewing the {calendar?.academicYear} calendar with {events.length} events.
          </Alert>

          <div style={{
            border: "var(--border-1) solid var(--color-border-primary)",
            borderRadius: "var(--radius-card-sm)",
            padding: "var(--spacing-3)",
            backgroundColor: "var(--color-bg-secondary)",
          }}>
            <p style={{ margin: 0, marginBottom: "var(--spacing-2)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
              Budget Summary
            </p>
            {CATEGORY_ORDER.map((category) => (
              <p key={category} style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                {CATEGORY_LABELS[category]}: ₹{(budgetSummary.byCategory[category] || 0).toLocaleString()}
              </p>
            ))}
            <p style={{ margin: 0, marginTop: "var(--spacing-2)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>
              Total: ₹{budgetSummary.total.toLocaleString()}
            </p>
          </div>

          {dateConflicts.length > 0 && (
            <Alert type="warning">
              <AlertTriangle size={16} style={{ marginRight: "var(--spacing-1)" }} />
              {dateConflicts.length} date overlap(s) detected in this calendar.
            </Alert>
          )}

          <div>
            <label style={formLabelStyles} htmlFor="calendarReviewComments">
              Review Comments
            </label>
            <Textarea
              id="calendarReviewComments"
              name="comments"
              placeholder="Comments (required for rejection, optional for approval)"
              value={approvalComments}
              onChange={(event) => setApprovalComments(event.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showOverlapConfirmModal}
        title="Date Overlap Confirmation"
        width={760}
        onClose={() => { setShowOverlapConfirmModal(false); setSubmitOverlapInfo(null) }}
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button variant="secondary" onClick={() => { setShowOverlapConfirmModal(false); setSubmitOverlapInfo(null) }}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleConfirmSubmitWithOverlap} loading={submitting}>
              Submit Anyway
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <Alert type="warning">
            {submitOverlapInfo?.message || "Some events have overlapping date ranges."}
          </Alert>

          {(submitOverlapInfo?.overlaps || []).slice(0, 8).map((overlap, index) => (
            <div
              key={`${overlap.eventA?.eventId || overlap.eventA?.title}-${overlap.eventB?.eventId || overlap.eventB?.title}-${index}`}
              style={{
                border: "var(--border-1) solid var(--color-border-primary)",
                borderRadius: "var(--radius-card-sm)",
                padding: "var(--spacing-3)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{overlap.eventA?.title}</strong> ({formatDateRange(overlap.eventA?.startDate, overlap.eventA?.endDate)})
              </p>
              <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>overlaps with</p>
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{overlap.eventB?.title}</strong> ({formatDateRange(overlap.eventB?.startDate, overlap.eventB?.endDate)})
              </p>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  )
}

export default EventsPage
