/**
 * Admin Gymkhana Events Page
 * Calendar management with:
 * - PageHeader component
 * - View toggle (List/Calendar)
 * - Footer year tabs
 * - Approval history
 */

import { useState, useEffect, useMemo } from "react"
import { Button } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent } from "@/components/ui/layout"
import { Select, Textarea } from "@/components/ui/form"
import { Modal, LoadingState, ErrorState, EmptyState, Alert } from "@/components/ui/feedback"
import { Badge } from "@/components/ui/data-display"
import { ToggleButtonGroup } from "@/components/ui"
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import {
    CalendarDays, Plus, Lock, Unlock, Check, X, List,
    FileText, ChevronRight, Settings, History, ChevronLeft
} from "lucide-react"
import { useToast } from "@/components/ui/feedback"
import { useAuth } from "@/contexts/AuthProvider"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"

// Map from status to required subrole for approval
const STATUS_TO_APPROVER = {
    pending_student_affairs: "Student Affairs",
    pending_joint_registrar: "Joint Registrar SA",
    pending_associate_dean: "Associate Dean SA",
    pending_dean: "Dean SA",
}

// Category colors for calendar view
const CATEGORY_COLORS = {
    academic: "var(--color-info)",
    cultural: "var(--color-primary)",
    technical: "var(--color-warning)",
    sports: "var(--color-success)",
}

const CATEGORY_LABELS = {
    academic: "Academic",
    cultural: "Cultural",
    sports: "Sports",
    technical: "Technical",
}

const CATEGORY_ORDER = ["academic", "cultural", "sports", "technical"]

const toDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "TBD"
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start.toDateString() === end.toDateString()) {
        return start.toLocaleDateString()
    }
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}

const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
    const startA = toDate(aStart)
    const endA = toDate(aEnd)
    const startB = toDate(bStart)
    const endB = toDate(bEnd)
    if (!startA || !endA || !startB || !endB) return false
    return startA <= endB && startB <= endA
}

// Footer tabs styles
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "var(--color-bg-page)",
        overflow: "hidden",
    },
    mainContent: {
        flex: 1,
        overflow: "auto",
        padding: "var(--spacing-6)",
    },
    tabsBar: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--color-bg-tertiary)",
        borderTop: "var(--border-1) solid var(--color-border-primary)",
        padding: "0",
        flexShrink: 0,
        height: "42px",
        overflowX: "auto",
        overflowY: "hidden",
    },
    tabsList: {
        display: "flex",
        alignItems: "stretch",
        height: "100%",
        gap: "0",
    },
    tab: {
        display: "flex",
        alignItems: "center",
        padding: "0 var(--spacing-4)",
        height: "100%",
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

const GymkhanaEventsPage = () => {
    const { toast } = useToast()
    const { user } = useAuth()

    // State
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [calendars, setCalendars] = useState([])
    const [selectedYear, setSelectedYear] = useState(null)
    const [selectedCalendar, setSelectedCalendar] = useState(null)
    const [amendments, setAmendments] = useState([])
    const [viewMode, setViewMode] = useState("list") // "list" or "calendar"
    const [calendarMonth, setCalendarMonth] = useState(new Date())

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showAmendmentModal, setShowAmendmentModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showEventModal, setShowEventModal] = useState(false)
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [showProposalModal, setShowProposalModal] = useState(false)
    const [selectedAmendment, setSelectedAmendment] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [selectedProposal, setSelectedProposal] = useState(null)

    // Form state
    const [newYear, setNewYear] = useState("")
    const [reviewComments, setReviewComments] = useState("")
    const [approvalComments, setApprovalComments] = useState("")
    const [proposalComments, setProposalComments] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [pendingProposals, setPendingProposals] = useState([])

    // Check if current user can approve this calendar
    const canApprove = selectedCalendar &&
        STATUS_TO_APPROVER[selectedCalendar.status] === user?.subRole

    const budgetSummary = useMemo(() => {
        const initial = CATEGORY_ORDER.reduce((acc, category) => {
            acc[category] = 0
            return acc
        }, {})
        let total = 0

        for (const event of selectedCalendar?.events || []) {
            const budget = Number(event.estimatedBudget || 0)
            total += budget
            if (initial[event.category] !== undefined) {
                initial[event.category] += budget
            }
        }

        return { byCategory: initial, total }
    }, [selectedCalendar])

    const dateConflicts = useMemo(() => {
        const events = selectedCalendar?.events || []
        const overlaps = []

        for (let i = 0; i < events.length; i += 1) {
            for (let j = i + 1; j < events.length; j += 1) {
                if (rangesOverlap(events[i].startDate, events[i].endDate, events[j].startDate, events[j].endDate)) {
                    overlaps.push({ eventA: events[i], eventB: events[j] })
                }
            }
        }

        return overlaps
    }, [selectedCalendar])

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedYear && calendars.length > 0) {
            fetchCalendarDetails(selectedYear)
        }
    }, [selectedYear, calendars])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [calendarsRes, amendmentsRes, proposalsRes] = await Promise.all([
                gymkhanaEventsApi.getAcademicYears(),
                gymkhanaEventsApi.getPendingAmendments().catch(() => ({ data: { amendments: [] } })),
                gymkhanaEventsApi.getProposalsForApproval().catch(() => ({ data: { proposals: [] } })),
            ])
            const yearsList = calendarsRes.data?.years || calendarsRes.years || []
            setCalendars(yearsList)
            setAmendments(amendmentsRes.data?.amendments || amendmentsRes.amendments || [])
            setPendingProposals(proposalsRes.data?.proposals || proposalsRes.proposals || [])

            if (yearsList.length > 0 && !selectedYear) {
                setSelectedYear(yearsList[0].academicYear)
            }
        } catch (err) {
            setError(err.message || "Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const fetchCalendarDetails = async (year, calendarId = null) => {
        try {
            let id = calendarId
            if (!id) {
                const cal = calendars.find(c => c.academicYear === year)
                id = cal?._id
            }
            if (id) {
                const res = await gymkhanaEventsApi.getCalendarById(id)
                const rawCalendar = res.data?.calendar || res.calendar || res
                const normalizedEvents = (rawCalendar?.events || []).map((event) => ({
                    ...event,
                    startDate: event.startDate || event.tentativeDate || null,
                    endDate: event.endDate || event.tentativeDate || null,
                }))
                setSelectedCalendar({ ...rawCalendar, events: normalizedEvents })
            }
        } catch (err) {
            console.error("Failed to load calendar details:", err)
        }
    }

    // Get available years for creation
    const availableYearsForCreation = useMemo(() => {
        const existingYears = new Set(calendars.map(c => c.academicYear))
        let latestYear = new Date().getFullYear()
        if (calendars.length > 0) {
            const years = calendars.map(c => parseInt(c.academicYear.split("-")[0]))
            latestYear = Math.max(...years)
        }

        const options = []
        for (let i = 0; i <= 2; i++) {
            const startYear = latestYear + i
            const endYear = (startYear + 1) % 100
            const yearStr = `${startYear}-${endYear.toString().padStart(2, "0")}`
            if (!existingYears.has(yearStr)) {
                options.push({ value: yearStr, label: yearStr })
            }
        }
        return options
    }, [calendars])

    // Calendar view helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []
        // Add empty cells for days before first of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }
        // Add days of month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }
        return days
    }

    const getEventsForDate = (date) => {
        if (!date || !selectedCalendar?.events) return []
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
        return selectedCalendar.events.filter(event => {
            const start = toDate(event.startDate)
            const end = toDate(event.endDate)
            if (!start || !end) return false
            return start <= dayEnd && end >= dayStart
        })
    }

    const handleCreateCalendar = async () => {
        if (!newYear) {
            toast.error("Please select a year")
            return
        }

        try {
            setSubmitting(true)
            await gymkhanaEventsApi.createCalendar({ academicYear: newYear })
            toast.success("Calendar created successfully")
            setShowCreateModal(false)
            setNewYear("")
            fetchData()
            setSelectedYear(newYear)
        } catch (err) {
            toast.error(err.message || "Failed to create calendar")
        } finally {
            setSubmitting(false)
        }
    }

    const handleLockCalendar = async () => {
        if (!selectedCalendar) return
        try {
            setSubmitting(true)
            const calendarId = selectedCalendar._id
            await gymkhanaEventsApi.lockCalendar(calendarId)
            toast.success("Calendar locked")
            await fetchData()
            await fetchCalendarDetails(selectedYear, calendarId)
        } catch (err) {
            toast.error(err.message || "Failed to lock calendar")
        } finally {
            setSubmitting(false)
        }
    }

    const handleUnlockCalendar = async () => {
        if (!selectedCalendar) return
        try {
            setSubmitting(true)
            const calendarId = selectedCalendar._id
            await gymkhanaEventsApi.unlockCalendar(calendarId)
            toast.success("Calendar unlocked")
            await fetchData()
            await fetchCalendarDetails(selectedYear, calendarId)
        } catch (err) {
            toast.error(err.message || "Failed to unlock calendar")
        } finally {
            setSubmitting(false)
        }
    }

    const handleApproveAmendment = async () => {
        if (!selectedAmendment) return
        try {
            setSubmitting(true)
            await gymkhanaEventsApi.approveAmendment(selectedAmendment._id, reviewComments)
            toast.success("Amendment approved")
            setShowAmendmentModal(false)
            setSelectedAmendment(null)
            fetchData()
        } catch (err) {
            toast.error(err.message || "Failed to approve")
        } finally {
            setSubmitting(false)
        }
    }

    const handleRejectAmendment = async () => {
        if (!selectedAmendment || !reviewComments) {
            toast.error("Please provide rejection reason")
            return
        }
        try {
            setSubmitting(true)
            await gymkhanaEventsApi.rejectAmendment(selectedAmendment._id, reviewComments)
            toast.success("Amendment rejected")
            setShowAmendmentModal(false)
            setSelectedAmendment(null)
            fetchData()
        } catch (err) {
            toast.error(err.message || "Failed to reject")
        } finally {
            setSubmitting(false)
        }
    }

    const handleEventClick = (event) => {
        setSelectedEvent(event)
        setShowEventModal(true)
    }

    // Calendar approval handlers
    const handleApproveCalendar = async () => {
        if (!selectedCalendar) return
        try {
            setSubmitting(true)
            await gymkhanaEventsApi.approveCalendar(selectedCalendar._id, approvalComments)
            toast.success("Calendar approved")
            setShowApprovalModal(false)
            setApprovalComments("")
            await fetchData()
            if (selectedYear) {
                await fetchCalendarDetails(selectedYear, selectedCalendar._id)
            }
        } catch (err) {
            toast.error(err.message || "Failed to approve calendar")
        } finally {
            setSubmitting(false)
        }
    }

    const handleRejectCalendar = async () => {
        if (!selectedCalendar) return
        if (!approvalComments || approvalComments.length < 10) {
            toast.error("Please provide a rejection reason (min 10 characters)")
            return
        }
        try {
            setSubmitting(true)
            await gymkhanaEventsApi.rejectCalendar(selectedCalendar._id, approvalComments)
            toast.success("Calendar rejected")
            setShowApprovalModal(false)
            setApprovalComments("")
            await fetchData()
            if (selectedYear) {
                await fetchCalendarDetails(selectedYear, selectedCalendar._id)
            }
        } catch (err) {
            toast.error(err.message || "Failed to reject calendar")
        } finally {
            setSubmitting(false)
        }
    }

    const openProposalReview = (proposal) => {
        setSelectedProposal(proposal)
        setProposalComments("")
        setShowProposalModal(true)
    }

    const handleApproveProposal = async () => {
        if (!selectedProposal?._id) return
        try {
            setSubmitting(true)
            await gymkhanaEventsApi.approveProposal(selectedProposal._id, proposalComments)
            toast.success("Proposal approved")
            setShowProposalModal(false)
            setSelectedProposal(null)
            setProposalComments("")
            await fetchData()
        } catch (err) {
            toast.error(err.message || "Failed to approve proposal")
        } finally {
            setSubmitting(false)
        }
    }

    const handleRejectProposal = async () => {
        if (!selectedProposal?._id) return
        if (!proposalComments || proposalComments.length < 10) {
            toast.error("Please provide rejection reason (min 10 characters)")
            return
        }
        try {
            setSubmitting(true)
            await gymkhanaEventsApi.rejectProposal(selectedProposal._id, proposalComments)
            toast.success("Proposal rejected")
            setShowProposalModal(false)
            setSelectedProposal(null)
            setProposalComments("")
            await fetchData()
        } catch (err) {
            toast.error(err.message || "Failed to reject proposal")
        } finally {
            setSubmitting(false)
        }
    }

    const handleRequestProposalRevision = async () => {
        if (!selectedProposal?._id) return
        if (!proposalComments || proposalComments.length < 10) {
            toast.error("Please provide revision notes (min 10 characters)")
            return
        }
        try {
            setSubmitting(true)
            await gymkhanaEventsApi.requestRevision(selectedProposal._id, proposalComments)
            toast.success("Revision requested")
            setShowProposalModal(false)
            setSelectedProposal(null)
            setProposalComments("")
            await fetchData()
        } catch (err) {
            toast.error(err.message || "Failed to request revision")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading && calendars.length === 0) {
        return <LoadingState message="Loading..." />
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchData} />
    }

    const VIEW_OPTIONS = [
        { value: "list", label: "List", icon: <List size={14} /> },
        { value: "calendar", label: "Calendar", icon: <CalendarDays size={14} /> },
    ]

    return (
        <div style={styles.container}>
            {/* PageHeader */}
            <PageHeader title="Events Management">
                <ToggleButtonGroup
                    options={VIEW_OPTIONS}
                    value={viewMode}
                    onChange={setViewMode}
                    size="small"
                    variant="muted"
                />
                {selectedCalendar && (
                    <>
                        <Button size="sm" variant="ghost" onClick={() => setShowHistoryModal(true)}>
                            <History size={16} /> History
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowSettingsModal(true)}>
                            <Settings size={16} />
                        </Button>
                    </>
                )}
            </PageHeader>

            {/* Main Content Area */}
            <div style={styles.mainContent}>
                {/* No Calendars State */}
                {calendars.length === 0 && (
                    <EmptyState
                        icon={CalendarDays}
                        title="No Calendars Yet"
                        message="Create your first academic year calendar to get started."
                    />
                )}

                {/* Calendar/List View */}
                {selectedCalendar && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                        {/* Calendar Info Bar */}
                        <Card>
                            <CardContent style={{ padding: "var(--spacing-3)" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                                        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                                            {selectedCalendar.academicYear}
                                        </span>
                                        <Badge variant={selectedCalendar.isLocked ? "warning" : "success"} size="small">
                                            {selectedCalendar.isLocked ? <><Lock size={10} /> Locked</> : <><Unlock size={10} /> Editable</>}
                                        </Badge>
                                        <Badge variant={
                                            selectedCalendar.status === "approved" ? "success" :
                                                selectedCalendar.status === "rejected" ? "danger" :
                                                    selectedCalendar.status === "draft" ? "default" : "info"
                                        } size="small">
                                            {selectedCalendar.status?.replace(/_/g, " ")}
                                        </Badge>
                                        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                                            ({selectedCalendar.events?.length || 0} events)
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                                        {/* Approval buttons for sub-role admins */}
                                        {canApprove && (
                                            <>
                                                <Button size="sm" variant="success" onClick={() => { setApprovalComments(""); setShowApprovalModal(true) }} loading={submitting}>
                                                    <Check size={14} /> Approve
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => { setApprovalComments(""); setShowApprovalModal(true) }} loading={submitting}>
                                                    <X size={14} /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {selectedCalendar.isLocked ? (
                                            <Button size="sm" variant="success" onClick={handleUnlockCalendar} loading={submitting}>
                                                <Unlock size={14} /> Unlock
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="warning" onClick={handleLockCalendar} loading={submitting}>
                                                <Lock size={14} /> Lock
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent style={{ padding: "var(--spacing-4)" }}>
                                <h3 style={{ marginBottom: "var(--spacing-3)", fontWeight: "var(--font-weight-semibold)" }}>
                                    Category-wise Budget Summary
                                </h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-3)" }}>
                                    {CATEGORY_ORDER.map((category) => (
                                        <div
                                            key={category}
                                            style={{
                                                border: "var(--border-1) solid var(--color-border-primary)",
                                                borderRadius: "var(--radius-card-sm)",
                                                padding: "var(--spacing-3)",
                                                backgroundColor: "var(--color-bg-secondary)",
                                            }}
                                        >
                                            <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                                                {CATEGORY_LABELS[category]}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                                                ₹{(budgetSummary.byCategory[category] || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                    <div
                                        style={{
                                            border: "var(--border-1) solid var(--color-border-primary)",
                                            borderRadius: "var(--radius-card-sm)",
                                            padding: "var(--spacing-3)",
                                            backgroundColor: "var(--color-primary-bg)",
                                        }}
                                    >
                                        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                                            Total Budget
                                        </p>
                                        <p style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary)" }}>
                                            ₹{budgetSummary.total.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {dateConflicts.length > 0 && (
                            <Card>
                                <CardContent style={{ padding: "var(--spacing-4)" }}>
                                    <Alert type="warning">
                                        {dateConflicts.length} date overlap(s) detected in this calendar.
                                    </Alert>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginTop: "var(--spacing-3)" }}>
                                        {dateConflicts.slice(0, 5).map((conflict, idx) => (
                                            <div
                                                key={`${conflict.eventA._id || conflict.eventA.title}-${conflict.eventB._id || conflict.eventB.title}-${idx}`}
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
                                </CardContent>
                            </Card>
                        )}

                        {/* List View */}
                        {viewMode === "list" && (
                            <Card>
                                <CardContent style={{ padding: "var(--spacing-4)" }}>
                                    {selectedCalendar.events?.length > 0 ? (
                                        <Table>
                                            <thead>
                                                <TableRow>
                                                    <TableHeader>Event</TableHeader>
                                                    <TableHeader>Category</TableHeader>
                                                    <TableHeader>Date Range</TableHeader>
                                                    <TableHeader>Budget</TableHeader>
                                                </TableRow>
                                            </thead>
                                            <tbody>
                                                {selectedCalendar.events.map((event, idx) => (
                                                    <TableRow
                                                        key={event._id || idx}
                                                        onClick={() => handleEventClick(event)}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <TableCell style={{ fontWeight: "var(--font-weight-medium)" }}>
                                                            {event.title}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge style={{ backgroundColor: CATEGORY_COLORS[event.category] }}>
                                                                {CATEGORY_LABELS[event.category] || event.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDateRange(event.startDate, event.endDate)}
                                                        </TableCell>
                                                        <TableCell>₹{event.estimatedBudget?.toLocaleString() || 0}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--spacing-6)" }}>
                                            No events added yet.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Calendar View */}
                        {viewMode === "calendar" && (
                            <Card>
                                <CardContent style={{ padding: "var(--spacing-4)" }}>
                                    {/* Month Navigation */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "var(--spacing-4)"
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

                                    {/* Calendar Grid */}
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(7, 1fr)",
                                        gap: "var(--spacing-1)",
                                    }}>
                                        {/* Day Headers */}
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
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

                                        {/* Day Cells */}
                                        {getDaysInMonth(calendarMonth).map((date, idx) => {
                                            const events = date ? getEventsForDate(date) : []
                                            const isToday = date?.toDateString() === new Date().toDateString()

                                            return (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        minHeight: "80px",
                                                        padding: "var(--spacing-1)",
                                                        backgroundColor: date ? "var(--color-bg-primary)" : "transparent",
                                                        border: isToday ? "var(--border-2) solid var(--color-primary)" : "var(--border-1) solid var(--color-border-primary)",
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
                                                            {events.slice(0, 2).map((event, i) => (
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
                                                            {events.length > 2 && (
                                                                <div style={{
                                                                    fontSize: "var(--font-size-xs)",
                                                                    color: "var(--color-text-muted)",
                                                                }}>
                                                                    +{events.length - 2} more
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

                        {/* Pending Amendments */}
                        {amendments.length > 0 && (
                            <Card>
                                <CardContent style={{ padding: "var(--spacing-4)" }}>
                                    <h3 style={{ marginBottom: "var(--spacing-3)", fontWeight: "var(--font-weight-medium)" }}>
                                        <FileText size={16} style={{ marginRight: "var(--spacing-2)" }} />
                                        Pending Amendments ({amendments.length})
                                    </h3>
                                    <Table>
                                        <thead>
                                            <TableRow>
                                                <TableHeader>Type</TableHeader>
                                                <TableHeader>Event</TableHeader>
                                                <TableHeader>Requested By</TableHeader>
                                                <TableHeader>Date</TableHeader>
                                                <TableHeader align="right">Action</TableHeader>
                                            </TableRow>
                                        </thead>
                                        <tbody>
                                            {amendments.map((amendment) => (
                                                <TableRow key={amendment._id}>
                                                    <TableCell>
                                                        <Badge variant={amendment.type === "new_event" ? "info" : "default"}>
                                                            {amendment.type === "new_event" ? "New Event" : "Edit"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{amendment.proposedChanges?.title || "—"}</TableCell>
                                                    <TableCell>{amendment.requestedBy?.name || "—"}</TableCell>
                                                    <TableCell>{new Date(amendment.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell align="right">
                                                        <Button size="sm" variant="ghost" onClick={() => {
                                                            setSelectedAmendment(amendment)
                                                            setReviewComments("")
                                                            setShowAmendmentModal(true)
                                                        }}>
                                                            Review <ChevronRight size={14} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </tbody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {pendingProposals.length > 0 && (
                            <Card>
                                <CardContent style={{ padding: "var(--spacing-4)" }}>
                                    <h3 style={{ marginBottom: "var(--spacing-3)", fontWeight: "var(--font-weight-medium)" }}>
                                        <FileText size={16} style={{ marginRight: "var(--spacing-2)" }} />
                                        Pending Proposal Approvals ({pendingProposals.length})
                                    </h3>
                                    <Table>
                                        <thead>
                                            <TableRow>
                                                <TableHeader>Event</TableHeader>
                                                <TableHeader>Date</TableHeader>
                                                <TableHeader>Expected Income</TableHeader>
                                                <TableHeader>Total Expenditure</TableHeader>
                                                <TableHeader>Deflection</TableHeader>
                                                <TableHeader align="right">Action</TableHeader>
                                            </TableRow>
                                        </thead>
                                        <tbody>
                                            {pendingProposals.map((proposal) => (
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
                                                        <Button size="sm" variant="ghost" onClick={() => openProposalReview(proposal)}>
                                                            Review <ChevronRight size={14} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </tbody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Tabs Bar */}
            <div style={styles.tabsBar}>
                <div style={styles.tabsList}>
                    {calendars.map((cal) => (
                        <button
                            key={cal._id}
                            onClick={() => setSelectedYear(cal.academicYear)}
                            style={{
                                ...styles.tab,
                                ...(selectedYear === cal.academicYear ? styles.tabActive : {}),
                            }}
                            onMouseEnter={(e) => {
                                if (selectedYear !== cal.academicYear) {
                                    e.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedYear !== cal.academicYear) {
                                    e.currentTarget.style.backgroundColor = "transparent"
                                }
                            }}
                        >
                            <CalendarDays size={14} />
                            {cal.academicYear}
                            {cal.isLocked && <Lock size={12} />}
                        </button>
                    ))}

                    {availableYearsForCreation.length > 0 && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                ...styles.tab,
                                ...styles.addTab,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--color-primary-bg)"
                            }}
                        >
                            <Plus size={14} />
                            New Year
                        </button>
                    )}
                </div>
            </div>

            {/* Create Calendar Modal */}
            <Modal
                isOpen={showCreateModal}
                title="Create Academic Calendar"
                onClose={() => setShowCreateModal(false)}
                width={400}
                footer={
                    <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "flex-end" }}>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreateCalendar}
                            loading={submitting}
                            disabled={!newYear || availableYearsForCreation.length === 0}
                        >
                            Create Calendar
                        </Button>
                    </div>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                    <Alert type="warning">
                        <strong>Important:</strong> Once created, a calendar cannot be deleted.
                    </Alert>
                    <div>
                        <label style={{
                            color: "var(--color-text-body)",
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            marginBottom: "var(--spacing-2)",
                            display: "block"
                        }}>
                            Academic Year
                        </label>
                        {availableYearsForCreation.length > 0 ? (
                            <Select
                                value={newYear}
                                onChange={(e) => setNewYear(e.target.value)}
                                options={availableYearsForCreation}
                                placeholder="Select academic year..."
                            />
                        ) : (
                            <Alert type="info">
                                All upcoming years already have calendars created.
                            </Alert>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Amendment Review Modal */}
            <Modal
                isOpen={showAmendmentModal}
                title="Review Amendment Request"
                width={720}
                onClose={() => { setShowAmendmentModal(false); setSelectedAmendment(null) }}
                footer={
                    <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                        <Button variant="secondary" onClick={() => setShowAmendmentModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleRejectAmendment} loading={submitting}>
                            <X size={14} /> Reject
                        </Button>
                        <Button variant="success" onClick={handleApproveAmendment} loading={submitting}>
                            <Check size={14} /> Approve
                        </Button>
                    </div>
                }
            >
                {selectedAmendment && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Type</label>
                            <Badge variant="info">{selectedAmendment.type === "new_event" ? "New Event" : "Edit Existing"}</Badge>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Proposed Event</label>
                            <p style={{ fontWeight: "var(--font-weight-medium)" }}>{selectedAmendment.proposedChanges?.title}</p>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Reason</label>
                            <p>{selectedAmendment.reason}</p>
                        </div>
                        <Textarea
                            name="comments"
                            placeholder="Review comments (required for rejection)"
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            rows={3}
                        />
                    </div>
                )}
            </Modal>

            {/* Approval History Modal */}
            <Modal
                isOpen={showHistoryModal}
                title="Approval History"
                width={700}
                onClose={() => setShowHistoryModal(false)}
                footer={
                    <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
                }
            >
                {selectedCalendar && <ApprovalHistory calendarId={selectedCalendar._id} />}
            </Modal>

            {/* Settings/Info Modal */}
            <Modal
                isOpen={showSettingsModal}
                title="Calendar Settings"
                width={640}
                onClose={() => setShowSettingsModal(false)}
                footer={
                    <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>Close</Button>
                }
            >
                {selectedCalendar && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Academic Year</label>
                            <p style={{ fontWeight: "var(--font-weight-medium)" }}>{selectedCalendar.academicYear}</p>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Status</label>
                            <Badge variant={selectedCalendar.status === "approved" ? "success" : "info"}>
                                {selectedCalendar.status?.replace(/_/g, " ")}
                            </Badge>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Lock Status</label>
                            <Badge variant={selectedCalendar.isLocked ? "warning" : "success"}>
                                {selectedCalendar.isLocked ? "Locked" : "Editable"}
                            </Badge>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Total Events</label>
                            <p>{selectedCalendar.events?.length || 0}</p>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Created By</label>
                            <p>{selectedCalendar.createdBy?.name || "Unknown"}</p>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Created At</label>
                            <p>{new Date(selectedCalendar.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Event Details Modal */}
            <Modal
                isOpen={showEventModal}
                title={selectedEvent?.title || "Event Details"}
                width={640}
                onClose={() => { setShowEventModal(false); setSelectedEvent(null) }}
                footer={
                    <Button variant="secondary" onClick={() => setShowEventModal(false)}>Close</Button>
                }
            >
                {selectedEvent && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Category</label>
                            <Badge style={{ backgroundColor: CATEGORY_COLORS[selectedEvent.category] }}>
                                {CATEGORY_LABELS[selectedEvent.category] || selectedEvent.category}
                            </Badge>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Date Range</label>
                            <p>{formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}</p>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Estimated Budget</label>
                            <p>₹{selectedEvent.estimatedBudget?.toLocaleString() || 0}</p>
                        </div>
                        {selectedEvent.description && (
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Description</label>
                                <p>{selectedEvent.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Calendar Approval Modal */}
            <Modal
                isOpen={showApprovalModal}
                title="Review Calendar"
                width={720}
                onClose={() => setShowApprovalModal(false)}
                footer={
                    <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                        <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleRejectCalendar} loading={submitting}>
                            <X size={14} /> Reject
                        </Button>
                        <Button variant="success" onClick={handleApproveCalendar} loading={submitting}>
                            <Check size={14} /> Approve
                        </Button>
                    </div>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                    <Alert type="info">
                        You are reviewing the {selectedCalendar?.academicYear} calendar as <strong>{user?.subRole}</strong>.
                        <br />
                        Current status: <strong>{selectedCalendar?.status?.replace(/_/g, " ")}</strong>
                    </Alert>
                    <div>
                        <p style={{ marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-sm)" }}>
                            {selectedCalendar?.events?.length || 0} events in this calendar.
                        </p>
                    </div>
                    <div
                        style={{
                            border: "var(--border-1) solid var(--color-border-primary)",
                            borderRadius: "var(--radius-card-sm)",
                            padding: "var(--spacing-3)",
                            backgroundColor: "var(--color-bg-secondary)",
                        }}
                    >
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
                            {dateConflicts.length} date overlap(s) detected in this calendar.
                        </Alert>
                    )}
                    <Textarea
                        name="approvalComments"
                        placeholder="Comments (required for rejection, optional for approval)"
                        value={approvalComments}
                        onChange={(e) => setApprovalComments(e.target.value)}
                        rows={4}
                    />
                </div>
            </Modal>

            <Modal
                isOpen={showProposalModal}
                title={`Review Proposal${selectedProposal?.eventId?.title ? `: ${selectedProposal.eventId.title}` : ""}`}
                width={760}
                onClose={() => { setShowProposalModal(false); setSelectedProposal(null); setProposalComments("") }}
                footer={
                    <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                        <Button variant="secondary" onClick={() => setShowProposalModal(false)}>
                            Close
                        </Button>
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
                }
            >
                {selectedProposal && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                        <Alert type="info">
                            Reviewing as <strong>{user?.subRole}</strong>. Current stage:{" "}
                            <strong>{selectedProposal.currentApprovalStage || "Final"}</strong>
                        </Alert>
                        <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Event Date</label>
                                <p>{formatDateRange(selectedProposal.eventId?.scheduledStartDate, selectedProposal.eventId?.scheduledEndDate)}</p>
                            </div>
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Event Budget</label>
                                <p>₹{Number(selectedProposal.eventBudgetAtSubmission || selectedProposal.eventId?.estimatedBudget || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Total Expected Income</label>
                                <p>₹{Number(selectedProposal.totalExpectedIncome || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Total Expenditure</label>
                                <p>₹{Number(selectedProposal.totalExpenditure || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Budget Deflection</label>
                                <p
                                    style={{
                                        color: Number(selectedProposal.budgetDeflection || 0) > 0 ? "var(--color-danger)" : "var(--color-success)",
                                        fontWeight: "var(--font-weight-semibold)",
                                    }}
                                >
                                    ₹{Number(selectedProposal.budgetDeflection || 0).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Accommodation Required</label>
                                <p>{selectedProposal.accommodationRequired ? "Yes" : "No"}</p>
                            </div>
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Registration Fee</label>
                                <p>
                                    {selectedProposal.hasRegistrationFee
                                        ? `Yes (₹${Number(selectedProposal.registrationFeeAmount || 0).toLocaleString()})`
                                        : "No"}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Proposal</label>
                            <p style={{ whiteSpace: "pre-wrap" }}>{selectedProposal.proposalText || "—"}</p>
                        </div>
                        {selectedProposal.externalGuestsDetails && (
                            <div>
                                <label style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>External Guest Details</label>
                                <p style={{ whiteSpace: "pre-wrap" }}>{selectedProposal.externalGuestsDetails}</p>
                            </div>
                        )}
                        <Textarea
                            name="proposalComments"
                            placeholder="Comments (required for reject/revision, optional for approve)"
                            value={proposalComments}
                            onChange={(e) => setProposalComments(e.target.value)}
                            rows={3}
                        />
                        <div>
                            <p style={{ marginBottom: "var(--spacing-2)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-heading)" }}>
                                Activity Log
                            </p>
                            <ApprovalHistory proposalId={selectedProposal._id} />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default GymkhanaEventsPage
