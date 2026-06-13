import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaUser, FaCalendarAlt, FaFileAlt, FaReceipt, FaAward, FaChevronRight, FaClipboardList, FaCheck } from "react-icons/fa"
import { MdOutlineEvent } from "react-icons/md"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { HiStatusOnline } from "react-icons/hi"
import { useAuth } from "../../contexts/AuthProvider"
import { dashboardApi } from "../../service"
import gymkhanaEventsApi from "../../service/modules/gymkhanaEvents.api"
import porApi from "../../service/modules/por.api"
import { useOnlineUsers } from "../../hooks/useOnlineUsers"
import DashboardHeader from "../../components/headers/DashboardHeader"
import { Card, Checkbox, Popover } from "@/components/ui"
import OnlineUsersPopupContent from "../../components/admin/OnlineUsersPopupContent"

// Maps an admin SA sub-role to the status that means "pending my approval"
// across activity calendars, event proposals/expenses, and POR requests.
const APPROVAL_STAGE_STATUS = {
  "Student Affairs": "pending_student_affairs",
  "Officer SA": "pending_officer",
  "Associate Dean SA": "pending_associate_dean",
  "Dean SA": "pending_dean",
}

// Chart components
// (Removed chart.js imports as they were unused)

// Enhanced shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => <div className={`animate-pulse bg-gradient-to-r from-[var(--color-bg-muted)] via-[var(--color-bg-hover)] to-[var(--color-bg-muted)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] ${className}`} style={{ height, width }} aria-hidden="true" />

// Shimmer for tables
const TableShimmer = ({ rows = 4, className = "" }) => (
  <div className={`overflow-hidden rounded-[var(--radius-lg)] ${className}`}>
    <div className="bg-[var(--color-bg-tertiary)] py-[var(--spacing-2)] px-[var(--spacing-4)] flex">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 px-[var(--spacing-2)]">
          <ShimmerLoader height="1rem" className="mb-[var(--spacing-1)]" />
        </div>
      ))}
    </div>

    {[...Array(rows)].map((_, i) => (
      <div key={i} className={`flex py-[var(--spacing-2)] px-[var(--spacing-4)] ${i % 2 === 0 ? "bg-[var(--color-bg-primary)]" : "bg-[var(--color-bg-tertiary)]"}`}>
        {[...Array(4)].map((_, j) => (
          <div key={j} className="flex-1 px-[var(--spacing-2)]">
            <ShimmerLoader height="0.8rem" width={j === 0 ? "80%" : "50%"} className="mx-auto" />
          </div>
        ))}
      </div>
    ))}
  </div>
)

const HeaderStatCard = ({ icon, label, value, children }) => (
  <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl px-3.5 py-1.5 hover:border-[var(--color-primary)] transition-[var(--transition-all)]">
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="flex items-center gap-2.5">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide leading-none mb-0.5">{label}</p>
          <p className="text-lg font-bold text-[var(--color-text-primary)] leading-none">{value}</p>
        </div>
        <div className="flex gap-1 ml-1.5 border-l border-[var(--color-border-primary)] pl-2">
          {children}
        </div>
      </div>
    </div>
  </div>
)

const HeaderStatBadge = ({ label, value }) => (
  <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-body)] rounded-[var(--radius-sm)] text-xs font-medium">
    {label} {value}
  </span>
)

// Unified card section title with accent bar and optional "View all" link
const SectionTitle = ({ title, accent = "var(--color-primary)", to, linkLabel = "View all", children }) => (
  <div className="flex justify-between items-center gap-[var(--spacing-2)] mb-[var(--spacing-2)]">
    <h2 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] flex items-center gap-[var(--spacing-1-5)]">
      <span className="w-1 h-4 rounded-[var(--radius-full)]" style={{ backgroundColor: accent }}></span>
      {title}
    </h2>
    <div className="flex items-center gap-[var(--spacing-1-5)]">
      {children}
      {to && (
        <Link
          to={to}
          className="text-[0.7rem] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-[var(--transition-colors)] whitespace-nowrap"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  </div>
)

const APPROVAL_TODO_ITEMS = [
  { key: "proposals", label: "Event Proposals", icon: FaFileAlt, accent: "var(--color-primary)", to: "/admin/gymkhana-events" },
  { key: "calendars", label: "Activity Calendars", icon: FaCalendarAlt, accent: "var(--color-info)", to: "/admin/gymkhana-events" },
  { key: "expenses", label: "Event Bills", icon: FaReceipt, accent: "var(--color-warning)", to: "/admin/gymkhana-events" },
  { key: "por", label: "POR Requests", icon: FaAward, accent: "var(--color-purple-text)", to: "/admin/por" },
]

// Compact row-toggle indicator (used by the split-bar / occupancy lists, where the
// whole row is clickable — avoids nesting a real checkbox inside a clickable row)
const RowCheck = ({ selected }) => (
  <span className={`w-4 h-4 shrink-0 rounded-[var(--radius-sm)] border flex items-center justify-center transition-colors ${selected ? "bg-[var(--color-primary)] border-[var(--color-primary)]" : "border-[var(--color-border-input)] bg-[var(--color-bg-primary)]"}`}>
    {selected && <FaCheck className="text-[var(--color-white)]" style={{ fontSize: "0.55rem" }} />}
  </span>
)

const buildComplaintDashboardLink = (filters = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== false && value !== "") {
      params.set(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `/admin/complaints?${queryString}` : "/admin/complaints"
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Center — a single unified strip combining four operational feeds into
// one cohesive widget (vertical-divided columns), instead of four separate cards.
// ─────────────────────────────────────────────────────────────────────────────

const SnapColumn = ({ title, icon, accent, count, to, isFirst = false, children }) => {
  const Icon = icon
  return (
  <div className={`flex-1 min-w-0 flex flex-col p-[var(--spacing-3)] ${isFirst ? "" : "border-t xl:border-t-0 xl:border-l border-[var(--color-border-primary)]"}`}>
    <div className="flex items-center justify-between gap-2 mb-[var(--spacing-2-5)]">
      <div className="flex items-center gap-[var(--spacing-2)] min-w-0">
        <span className="w-7 h-7 shrink-0 rounded-[var(--radius-lg)] flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-secondary)", color: accent }}>
          <Icon className="text-xs" />
        </span>
        <h3 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] truncate">{title}</h3>
        {count != null && (
          <span className="shrink-0 min-w-[1.25rem] h-5 px-[var(--spacing-1-5)] inline-flex items-center justify-center rounded-[var(--radius-full)] text-[0.65rem] font-bold tabular-nums" style={{ backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}>{count}</span>
        )}
      </div>
      {to && (
        <Link to={to} aria-label={`Open ${title}`} className="shrink-0 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
          <FaChevronRight className="text-[0.7rem]" />
        </Link>
      )}
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--color-bg-tertiary)] flex flex-col gap-[var(--spacing-1-5)]">
      {children}
    </div>
  </div>
  )
}

const SnapEmpty = ({ icon, label }) => {
  const Icon = icon
  return (
  <div className="flex flex-col items-center justify-center h-full text-center py-[var(--spacing-6)]">
    <div className="w-10 h-10 bg-[var(--color-bg-muted)] rounded-[var(--radius-full)] flex items-center justify-center mb-[var(--spacing-2)]">
      <Icon className="text-[var(--color-text-light)]" />
    </div>
    <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
  </div>
  )
}

const SnapShimmer = () => (
  <>
    {[...Array(4)].map((_, i) => <ShimmerLoader key={i} height="2.5rem" className="rounded-[var(--radius-lg)]" />)}
  </>
)

const ActionCenter = ({ loading, error, dashboardData, approvalCounts, approvalsLoading }) => {
  const leaves = dashboardData?.leaves?.data?.leaves || []
  const events = dashboardData?.events || []
  const complaints = dashboardData?.complaints || {}
  const approvalTotal = APPROVAL_TODO_ITEMS.reduce((sum, item) => sum + (approvalCounts[item.key] || 0), 0)
  const complaintsOpen = (complaints.pending || 0) + (complaints.inProgress || 0) + (complaints.forwardedToIDO || 0)

  const complaintRows = [
    { label: "Pending", value: complaints.pending || 0, color: "var(--color-warning)", to: buildComplaintDashboardLink({ status: "Pending" }) },
    { label: "In Progress", value: complaints.inProgress || 0, color: "var(--color-info)", to: buildComplaintDashboardLink({ status: "In Progress" }) },
    { label: "To IDO", value: complaints.forwardedToIDO || 0, color: "var(--color-purple-text)", to: buildComplaintDashboardLink({ status: "Forwarded to IDO" }) },
    { label: "Resolved Today", value: complaints.resolvedToday || 0, color: "var(--color-success)", to: buildComplaintDashboardLink({ resolvedToday: true }) },
  ]

  if (error) {
    return <p className="m-[var(--spacing-3)] text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
  }

  return (
      <div className="flex flex-col xl:flex-row xl:h-[22rem]">
        {/* Staff upcoming joins */}
        <SnapColumn title="Upcoming Joins" icon={FaCalendarAlt} accent="var(--color-info)" count={loading ? null : leaves.length} to="/admin/leaves" isFirst>
          {loading ? <SnapShimmer /> : leaves.length === 0 ? <SnapEmpty icon={FaCalendarAlt} label="No upcoming returns" /> : (
            leaves.map((lv) => {
              const name = lv?.userId?.name || lv?.userId?.email || "Unknown"
              let joinLabel = "—"
              let urgency = "var(--color-info)"
              try {
                const end = lv?.endDate ? new Date(lv.endDate) : null
                if (end) {
                  const j = new Date(end)
                  j.setDate(j.getDate() + 1)
                  joinLabel = j.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  const days = Math.ceil((j.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  urgency = days <= 1 ? "var(--color-success)" : days <= 3 ? "var(--color-warning)" : "var(--color-info)"
                }
              } catch {
                joinLabel = "—"
              }
              return (
                <div key={lv._id} className="flex items-center justify-between gap-2 px-[var(--spacing-2-5)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)]">
                  <div className="flex items-center gap-[var(--spacing-2)] min-w-0">
                    <span className="w-1.5 h-1.5 rounded-[var(--radius-full)] shrink-0" style={{ backgroundColor: urgency }}></span>
                    <span className="text-[0.78rem] font-medium text-[var(--color-text-primary)] truncate">{name}</span>
                  </div>
                  <span className="shrink-0 text-[0.7rem] font-semibold text-[var(--color-success-text)] bg-[var(--color-success-bg)] border border-[var(--color-success-light)] rounded-[var(--radius-md)] px-[var(--spacing-2)] py-[var(--spacing-0-5)]">↩ {joinLabel}</span>
                </div>
              )
            })
          )}
        </SnapColumn>

        {/* My approvals */}
        <SnapColumn title="To-Do" icon={FaFileAlt} accent="var(--color-success)" count={approvalsLoading ? null : approvalTotal}>
          {approvalsLoading ? <SnapShimmer /> : approvalTotal === 0 ? <SnapEmpty icon={FaAward} label="All caught up" /> : (
            APPROVAL_TODO_ITEMS.map((item) => {
              const count = approvalCounts[item.key] || 0
              const Icon = item.icon
              const hasItems = count > 0
              return (
                <Link key={item.key} to={item.to} className="group flex items-center justify-between gap-2 px-[var(--spacing-2-5)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                  <div className="flex items-center gap-[var(--spacing-2)] min-w-0">
                    <Icon className="text-[0.72rem] shrink-0" style={{ color: item.accent }} />
                    <span className="text-[0.78rem] font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">{item.label}</span>
                  </div>
                  <span
                    className="shrink-0 min-w-[1.25rem] h-5 px-[var(--spacing-1-5)] inline-flex items-center justify-center rounded-[var(--radius-full)] text-[0.65rem] font-bold tabular-nums"
                    style={hasItems ? { backgroundColor: item.accent, color: "var(--color-white)" } : { backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }}
                  >
                    {count}
                  </span>
                </Link>
              )
            })
          )}
        </SnapColumn>

        {/* Complaints */}
        <SnapColumn title="Complaints" icon={FaClipboardList} accent="var(--color-warning)" count={loading ? null : complaintsOpen} to="/admin/complaints">
          {loading ? <SnapShimmer /> : (
            <>
              {complaintRows.map((row) => (
                <Link key={row.label} to={row.to} className="flex items-center justify-between gap-2 px-[var(--spacing-2-5)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                  <div className="flex items-center gap-[var(--spacing-2)] min-w-0">
                    <span className="w-1.5 h-1.5 rounded-[var(--radius-full)] shrink-0" style={{ backgroundColor: row.color }}></span>
                    <span className="text-[0.78rem] font-medium text-[var(--color-text-body)] truncate">{row.label}</span>
                  </div>
                  <span className="shrink-0 text-[0.85rem] font-bold tabular-nums" style={{ color: row.color }}>{row.value}</span>
                </Link>
              ))}
              <Link to={buildComplaintDashboardLink({ overdue: true })} className="flex items-center justify-between gap-2 px-[var(--spacing-2-5)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] bg-[var(--color-danger-bg)] border border-[var(--color-danger-light)] hover:border-[var(--color-danger)] transition-colors mt-[var(--spacing-0-5)]">
                <span className="flex items-center gap-[var(--spacing-1-5)] text-[0.72rem] font-bold text-[var(--color-danger-text)] min-w-0 truncate">⚠ Overdue 20+ days</span>
                <span className="shrink-0 text-[0.95rem] font-black text-[var(--color-danger-text)] tabular-nums">{complaints.overdueCount || 0}</span>
              </Link>
            </>
          )}
        </SnapColumn>

        {/* Upcoming events */}
        <SnapColumn title="Upcoming Events" icon={MdOutlineEvent} accent="var(--color-purple-text)" count={loading ? null : events.length} to="/admin/events">
          {loading ? <SnapShimmer /> : events.length === 0 ? <SnapEmpty icon={MdOutlineEvent} label="No upcoming events" /> : (
            events.map((event) => {
              const eventDate = new Date(event.date)
              const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const isToday = daysUntil === 0
              const isTomorrow = daysUntil === 1
              const isThisWeek = daysUntil > 1 && daysUntil <= 7
              const dateColors = isToday
                ? "bg-[var(--color-success-bg)] border-[var(--color-success-light)] text-[var(--color-success-text)]"
                : isTomorrow
                  ? "bg-[var(--color-warning-bg)] border-[var(--color-warning-light)] text-[var(--color-warning-text)]"
                  : isThisWeek
                    ? "bg-[var(--color-info-bg)] border-[var(--color-info-light)] text-[var(--color-info-text)]"
                    : "bg-[var(--color-bg-muted)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]"
              return (
                <div key={event.id} className="flex items-center justify-between gap-2 px-[var(--spacing-2-5)] py-[var(--spacing-2)] rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border-l-2 border-[var(--color-purple-text)]">
                  <span className="text-[0.78rem] font-medium text-[var(--color-text-primary)] truncate">{event.title}</span>
                  <span className={`shrink-0 px-[var(--spacing-2)] py-[var(--spacing-0-5)] rounded-[var(--radius-md)] text-[0.6rem] font-bold uppercase tracking-wide border whitespace-nowrap ${dateColors}`}>
                    {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(event.date)}
                  </span>
                </div>
              )
            })
          )}
        </SnapColumn>
      </div>
  )
}

const DashboardPage = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [normalizedView, setNormalizedView] = useState(false)
  const [studentDataView, setStudentDataView] = useState("normal") // Toggle between "normal" and "registered"
  const [selectedHostels, setSelectedHostels] = useState([]) // Track selected hostels for total calculation
  const [approvalCounts, setApprovalCounts] = useState({ proposals: 0, calendars: 0, expenses: 0, por: 0 })
  const [approvalsLoading, setApprovalsLoading] = useState(true)

  // Fetch online users stats with auto-refresh every 5 seconds
  const { stats: onlineStats } = useOnlineUsers({
    autoFetch: true,
    refreshInterval: 5000, // Refresh every 5 seconds
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await dashboardApi.getAdminDashboardData()
        setDashboardData(response.data)
        setLoading(false)
        // Using dummy data for now
        // setTimeout(() => {
        //   setDashboardData(getDummyData())
        //   setLoading(false)
        // }, 1200) // Simulate API delay
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard statistics")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Initialize selected hostels when data loads
  useEffect(() => {
    if (dashboardData?.hostels) {
      setSelectedHostels(dashboardData.hostels.map((_, index) => index))
    }
  }, [dashboardData])

  // Fetch counts of items pending the current admin's approval stage
  useEffect(() => {
    let active = true
    const myStage = APPROVAL_STAGE_STATUS[user?.subRole]
    const meId = user?._id ? String(user._id) : null
    const unwrap = (res) => res?.data ?? res ?? {}
    // Mirrors backend "pending for me" logic: assigned to me, or unassigned (open to the stage)
    const isMine = (item) => {
      const single = item?.currentApproverUser?._id || item?.currentApproverUser
      const multi = (item?.currentApproverUsers || []).map((u) => String(u?._id || u))
      if (!single && multi.length === 0) return true
      if (single && String(single) === meId) return true
      return meId ? multi.includes(meId) : false
    }

    const fetchApprovalCounts = async () => {
      setApprovalsLoading(true)
      const next = { proposals: 0, calendars: 0, expenses: 0, por: 0 }

      const [proposalsRes, expensesRes, calendarsRes, porRes] = await Promise.allSettled([
        // Proposals + expenses are already filtered to the caller's stage server-side
        gymkhanaEventsApi.getProposalsForApproval(),
        myStage ? gymkhanaEventsApi.getAllExpenses({ limit: 1 }) : Promise.resolve(null),
        myStage ? gymkhanaEventsApi.getCalendars({ status: myStage, limit: 100 }) : Promise.resolve(null),
        myStage ? porApi.getWorkspace() : Promise.resolve(null),
      ])

      if (proposalsRes.status === "fulfilled") {
        const data = unwrap(proposalsRes.value)
        next.proposals = Array.isArray(data.proposals) ? data.proposals.length : 0
      }
      if (expensesRes.status === "fulfilled" && expensesRes.value) {
        const data = unwrap(expensesRes.value)
        next.expenses = data.pagination?.total ?? (Array.isArray(data.expenses) ? data.expenses.length : 0)
      }
      if (calendarsRes.status === "fulfilled" && calendarsRes.value) {
        const data = unwrap(calendarsRes.value)
        const list = Array.isArray(data.data) ? data.data : Array.isArray(data.calendars) ? data.calendars : []
        next.calendars = list.filter((c) => c.status === myStage && isMine(c)).length
      }
      if (porRes.status === "fulfilled" && porRes.value) {
        const data = unwrap(porRes.value)
        const list = Array.isArray(data.requests) ? data.requests : []
        next.por = list.filter((r) => r.status === myStage && isMine(r)).length
      }

      if (active) {
        setApprovalCounts(next)
        setApprovalsLoading(false)
      }
    }

    fetchApprovalCounts()
    return () => {
      active = false
    }
  }, [user?._id, user?.subRole])

  // Toggle hostel selection
  const toggleHostelSelection = (index) => {
    setSelectedHostels((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  // Check if all hostels are selected
  const allHostelsSelected = dashboardData?.hostels ? selectedHostels.length === dashboardData.hostels.length : false

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader>
        {loading ? (
          <div className="flex gap-[var(--spacing-2-5)]">
            <ShimmerLoader height="2.25rem" width="8.5rem" className="rounded-[var(--radius-md)]" />
            <ShimmerLoader height="2.25rem" width="8.5rem" className="rounded-[var(--radius-md)]" />
          </div>
        ) : error ? (
          <div className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-1-5)] text-[var(--font-size-xs)]">Error loading data</div>
        ) : (
          (() => {
            // Safe access to degreeWise and registered data
            const degreeWise = dashboardData?.students?.degreeWise || []

            // Sum normal (actual) counts by gender and total
            const normalSums = degreeWise.reduce(
              (acc, d) => {
                const boys = parseInt(d.boys) || 0
                const girls = parseInt(d.girls) || 0
                acc.boys += boys
                acc.girls += girls
                acc.total += boys + girls
                return acc
              },
              { boys: 0, girls: 0, total: 0 }
            )

            // Sum registered counts; try multiple possible shapes
            const registeredSums = degreeWise.reduce(
              (acc, d) => {
                // preferred: d.registered (object with boys/girls/total)
                if (d.registered && typeof d.registered === "object") {
                  const rb = parseInt(d.registered.boys) || 0
                  const rg = parseInt(d.registered.girls) || 0
                  const rt = parseInt(d.registered.total) || rb + rg
                  acc.boys += rb
                  acc.girls += rg
                  acc.total += rt
                } else if (d.registeredStudents != null) {
                  // older format: registeredStudents might be a number
                  const rt = parseInt(d.registeredStudents) || 0
                  // if no breakdown available, split evenly
                  const rb = Math.floor(rt / 2)
                  const rg = rt - rb
                  acc.boys += rb
                  acc.girls += rg
                  acc.total += rt
                } else {
                  // fallback: use d.totalRegistered or d.total if available
                  const rt = parseInt(d.totalRegistered || d.registeredTotal || 0) || 0
                  const rb = Math.floor(rt / 2)
                  const rg = rt - rb
                  acc.boys += rb
                  acc.girls += rg
                  acc.total += rt
                }

                return acc
              },
              { boys: 0, girls: 0, total: 0 }
            )

            // Derive day scholar = registered - normal (per gender and total)
            const dayScholar = {
              boys: Math.max(0, registeredSums.boys - normalSums.boys),
              girls: Math.max(0, registeredSums.girls - normalSums.girls),
            }
            dayScholar.total = Math.max(0, registeredSums.total - normalSums.total)

            // Prefer exact backend counts for hostlers/day scholars; fall back to derived values only if needed.
            const hostler = {
              boys: dashboardData?.hostlerAndDayScholarCounts?.hostler?.boys ?? normalSums.boys ?? 0,
              girls: dashboardData?.hostlerAndDayScholarCounts?.hostler?.girls ?? normalSums.girls ?? 0,
            }
            hostler.total = dashboardData?.hostlerAndDayScholarCounts?.hostler?.total ?? normalSums.total ?? (hostler.boys + hostler.girls)

            // Fall back to derived day scholar counts only if exact backend data is unavailable.
            const finalDayScholar = {
              boys: dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.boys ?? dayScholar.boys ?? 0,
              girls: dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.girls ?? dayScholar.girls ?? 0,
            }
            finalDayScholar.total = dashboardData?.hostlerAndDayScholarCounts?.dayScholar?.total ?? dayScholar.total ?? (finalDayScholar.boys + finalDayScholar.girls)

            return (
              <div className="flex items-center gap-[var(--spacing-2-5)] border-l border-[var(--color-border-primary)] pl-[var(--spacing-5)]">
                <HeaderStatCard icon={<FaUser className="text-[var(--color-primary)] text-sm" />} label="Hostlers" value={hostler.total}>
                  <HeaderStatBadge label="B" value={hostler.boys} />
                  <HeaderStatBadge label="G" value={hostler.girls} />
                </HeaderStatCard>

                <HeaderStatCard icon={<FaUser className="text-[var(--color-primary)] text-sm" />} label="Day Scholars" value={finalDayScholar.total}>
                  <HeaderStatBadge label="B" value={finalDayScholar.boys} />
                  <HeaderStatBadge label="G" value={finalDayScholar.girls} />
                </HeaderStatCard>

                {/* Online Users Card */}
                <div className="bg-[var(--color-success-bg-light)] border border-[var(--color-success-light)] rounded-xl px-3.5 py-1.5 hover:border-[var(--color-success)] transition-[var(--transition-all)]">
                  <div className="flex items-center gap-2.5">
                    <HiStatusOnline className="text-[var(--color-success)] text-sm animate-pulse" />
                    <div className="flex items-center gap-2.5">
                      <div>
                        <p className="text-xs text-[var(--color-success-text)] font-medium uppercase tracking-wide leading-none mb-0.5">Online Now</p>
                        <p className="text-lg font-bold text-[var(--color-success-text)] leading-none">{onlineStats?.totalOnline || 0}</p>
                      </div>
                      <div className="flex gap-1 ml-1.5 border-l border-[var(--color-success-light)] pl-2">
                        <Popover
                          trigger="hover"
                          placement="bottom"
                          align="end"
                          content={<OnlineUsersPopupContent role="Student" roleLabel="Students" />}
                        >
                          <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer hover:bg-[var(--color-success-bg)] transition-[var(--transition-colors)]">
                            S: {onlineStats?.byRole?.Student || 0}
                          </span>
                        </Popover>
                        <Popover
                          trigger="hover"
                          placement="bottom"
                          align="end"
                          content={<OnlineUsersPopupContent role="Hostel Supervisor" roleLabel="Hostel Supervisors" />}
                        >
                          <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer hover:bg-[var(--color-success-bg)] transition-[var(--transition-colors)]">
                            HS: {onlineStats?.byRole?.["Hostel Supervisor"] || 0}
                          </span>
                        </Popover>
                        <Popover
                          trigger="hover"
                          placement="bottom"
                          align="end"
                          content={<OnlineUsersPopupContent role="Admin" roleLabel="Admins" />}
                        >
                          <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer hover:bg-[var(--color-success-bg)] transition-[var(--transition-colors)]">
                            A: {onlineStats?.byRole?.Admin || 0}
                          </span>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()
        )}
      </DashboardHeader>

      {/* Unified console surface — one full-bleed area, sections split by dividers (no cards) */}
      <div className="flex-1 overflow-y-auto p-[var(--spacing-4)]">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          {/* Top band: Student Distribution | Hostel Occupancy */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Student Distribution */}
            <section className="h-[25rem] min-w-0 flex flex-col p-[var(--spacing-3)] border-b lg:border-b-0 lg:border-r border-[var(--color-border-primary)]">
              {loading ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-[var(--spacing-4)]">
                    <ShimmerLoader height="1.25rem" width="50%" />
                    <ShimmerLoader height="1.75rem" width="8rem" className="rounded-[var(--radius-full)]" />
                  </div>
                  <TableShimmer rows={6} className="flex-1" />
                </div>
              ) : error ? (
                <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
              ) : (
                <>
                  <SectionTitle title="Student Distribution" to="/admin/students">
                    {/* Normal/Registered Toggle */}
                    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-[var(--radius-full)] p-[var(--spacing-0-5)] text-[0.7rem]" role="tablist">
                      <button onClick={() => setStudentDataView("normal")}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${studentDataView === "normal" ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        Hostler
                      </button>
                      <button onClick={() => setStudentDataView("registered")}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${studentDataView === "registered" ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        Registered
                      </button>
                    </div>
                    {/* Absolute/Normalized Toggle */}
                    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-[var(--radius-full)] p-[var(--spacing-0-5)] text-[0.7rem]" role="tablist">
                      <button onClick={() => setNormalizedView(false)}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${!normalizedView ? "bg-[var(--color-success)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        Abs
                      </button>
                      <button onClick={() => setNormalizedView(true)}
                        className={`px-[var(--spacing-2-5)] py-[var(--spacing-1)] rounded-[var(--radius-full)] transition-all duration-150 font-medium ${normalizedView ? "bg-[var(--color-success)] text-[var(--color-white)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}
                      >
                        %
                      </button>
                    </div>
                  </SectionTitle>
                  <div className="flex-1 min-h-0">
                    <DegreeWiseStudentsChart data={dashboardData?.students} normalized={normalizedView} studentDataView={studentDataView} />
                  </div>
                </>
              )}
            </section>

            {/* Hostel Occupancy */}
            <section className="h-[25rem] min-w-0 flex flex-col p-[var(--spacing-3)]">
              {loading ? (
                <div className="h-full flex flex-col">
                  <ShimmerLoader height="1.25rem" width="50%" className="mb-[var(--spacing-4)]" />
                  <TableShimmer rows={6} className="flex-1" />
                </div>
              ) : error ? (
                <p className="text-[var(--color-danger)] bg-[var(--color-danger-bg-light)] border border-[var(--color-danger-border)] rounded-[var(--radius-lg)] p-[var(--spacing-3)]">{error}</p>
              ) : (
                <>
                  <SectionTitle title="Hostel Occupancy" to="/admin/hostels" />
                  <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-primary)]">
                      <table className="min-w-full table-fixed">
                        <thead>
                          <tr>
                            <th className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-left uppercase tracking-wider w-[40%]">
                              <div className="flex items-center gap-[var(--spacing-2)]">
                                <Checkbox checked={allHostelsSelected} onChange={() => {
                                  if (allHostelsSelected) {
                                    setSelectedHostels([])
                                  } else {
                                    setSelectedHostels(dashboardData.hostels.map((_, index) => index))
                                  }
                                }} />
                                Hostel
                              </div>
                            </th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Rooms</th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Capacity</th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Occupancy</th>
                            <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.7rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wider w-[15%]">Vacancy</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--color-bg-tertiary)]">
                      <table className="min-w-full table-fixed">
                        <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-light)]">
                          {dashboardData?.hostels?.map((hostel, index) => {
                            const occupancyPercent = hostel.totalCapacity > 0 ? Math.round((hostel.currentOccupancy / hostel.totalCapacity) * 100) : 0
                            return (
                              <tr key={index} className={`group hover:bg-[var(--color-primary-bg)] transition-all duration-150 ${index % 2 === 0 ? 'bg-[var(--color-bg-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                                <td className="px-[var(--spacing-3)] py-[var(--spacing-1-5)] w-[40%]">
                                  <div className="flex items-center gap-[var(--spacing-2)]">
                                    <Checkbox checked={selectedHostels.includes(index)} onChange={() => toggleHostelSelection(index)} />
                                    <div className="flex-1 min-w-0">
                                      <span className={`block text-[0.8125rem] font-semibold leading-tight transition-colors ${selectedHostels.includes(index) ? "text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>{hostel.name}</span>
                                      <div className="flex items-center gap-[var(--spacing-1-5)]">
                                        <div className="w-20 h-1 rounded-[var(--radius-full)] bg-[var(--color-bg-muted)] overflow-hidden">
                                          <div
                                            className={`h-full rounded-[var(--radius-full)] ${occupancyPercent >= 95 ? 'bg-[var(--color-danger)]' : occupancyPercent >= 80 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'}`}
                                            style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-[0.65rem] leading-none text-[var(--color-text-muted)] tabular-nums">{occupancyPercent}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-text-muted)] text-center font-medium tabular-nums w-[15%]">{hostel.totalRooms}</td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-text-muted)] text-center font-medium tabular-nums w-[15%]">{hostel.totalCapacity}</td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-info)] text-center font-bold tabular-nums w-[15%]">{hostel.currentOccupancy}</td>
                                <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-success)] text-center font-bold tabular-nums w-[15%]">{hostel.vacantCapacity}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Fixed Footer */}
                    <div className="flex-shrink-0 bg-[var(--color-bg-muted)] border-t-2 border-[var(--color-border-dark)]">
                      <table className="min-w-full table-fixed">
                        <tfoot>
                          <tr>
                            <td className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.75rem] text-[var(--color-text-primary)] w-[40%]">
                              <div className="flex items-center gap-[var(--spacing-2)]">
                                <div className="w-3.5 h-3.5"></div>
                                <div className="flex items-center gap-[var(--spacing-1-5)]">
                                  <span className="uppercase tracking-wider font-extrabold">Total</span>
                                  {selectedHostels.length > 0 && selectedHostels.length < (dashboardData?.hostels?.length || 0) && (
                                    <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-primary)] text-[var(--color-white)] text-[0.65rem] rounded-[var(--radius-sm)] font-bold">{selectedHostels.length}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-text-primary)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalRooms, 0) || 0}</td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-text-primary)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.totalCapacity, 0) || 0}</td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-info)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.currentOccupancy, 0) || 0}</td>
                            <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-success)] text-center font-extrabold tabular-nums w-[15%]">{dashboardData?.hostels?.filter((_, index) => selectedHostels.includes(index)).reduce((sum, hostel) => sum + hostel.vacantCapacity, 0) || 0}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>

          {/* Bottom band: Action Center */}
          <div className="border-t border-[var(--color-border-primary)]">
            <ActionCenter
              loading={loading}
              error={error}
              dashboardData={dashboardData}
              approvalCounts={approvalCounts}
              approvalsLoading={approvalsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for date formatting
const formatDate = (dateString) => {
  const options = { month: "short", day: "numeric", year: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Chart components
const DegreeWiseStudentsChart = ({ data, normalized = false, studentDataView = "normal" }) => {
  const degreeWiseData = data?.degreeWise || []
  const [deselectedDegrees, setDeselectedDegrees] = useState([])

  if (!degreeWiseData.length) return <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">No student data available</div>

  const degreeData = degreeWiseData.map((item) => {
    // Choose which data to display based on studentDataView toggle
    let displayBoys, displayGirls, displayTotal
    if (studentDataView === "registered") {
      // Show registered students data from settings
      const registeredData = item.registeredStudents
      const registered = item?.registered || null
      if (registered !== null) {
        displayBoys = registered.boys || 0
        displayGirls = registered.girls || 0
        displayTotal = registered.total || 0
      } else {
        // If old format or no breakdown available, show total as boys+girls split evenly or 0
        const total = parseInt(registeredData) || 0
        displayBoys = Math.floor(total / 2)
        displayGirls = Math.ceil(total / 2)
        displayTotal = total
      }
    } else {
      // Show normal/actual students data (default)
      displayBoys = item.boys || 0
      displayGirls = item.girls || 0
      displayTotal = displayBoys + displayGirls
    }

    return {
      ...item,
      boys: displayBoys,
      girls: displayGirls,
      total: displayTotal,
    }
  })

  const toggleDegreeSelection = (index) => {
    setDeselectedDegrees((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      }
      return [...prev, index]
    })
  }

  const selectedDegreeData = degreeData.filter((_, index) => !deselectedDegrees.includes(index))
  const allDegreesSelected = degreeData.length > 0 && selectedDegreeData.length === degreeData.length

  // Calculate totals for footer based on selected degrees
  const totalBoys = selectedDegreeData.reduce((sum, item) => sum + (item.boys || 0), 0)
  const totalGirls = selectedDegreeData.reduce((sum, item) => sum + (item.girls || 0), 0)
  const grandTotal = selectedDegreeData.reduce((sum, item) => sum + (item.total || 0), 0)
  const boysPercentTotal = grandTotal > 0 ? Math.round((totalBoys / grandTotal) * 100) : 0
  const girlsPercentTotal = grandTotal > 0 ? Math.round((totalGirls / grandTotal) * 100) : 0

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-primary)]">
        <table className="min-w-full table-fixed">
          <thead>
            <tr>
              <th className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-left uppercase tracking-wide w-[30%]">
                <div className="flex items-center gap-[var(--spacing-2)]">
                  <Checkbox checked={allDegreesSelected} onChange={() => {
                    if (allDegreesSelected) {
                      setDeselectedDegrees(degreeData.map((_, index) => index))
                    } else {
                      setDeselectedDegrees([])
                    }
                  }} />
                  Degree
                </div>
              </th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[17.5%]">Boys</th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[17.5%]">Girls</th>
              <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[17.5%]">Total</th>
              {normalized && (
                <>
                  <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[8.75%]">B%</th>
                  <th className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.75rem] font-bold text-[var(--color-text-muted)] text-center uppercase tracking-wide w-[8.75%]">G%</th>
                </>
              )}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--color-bg-tertiary)]">
        <table className="min-w-full table-fixed">
          <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-light)]">
            {degreeData.map((item, index) => {
              const boysPercent = item.total > 0 ? Math.round((item.boys / item.total) * 100) : 0
              const girlsPercent = item.total > 0 ? Math.round((item.girls / item.total) * 100) : 0
              const isSelected = !deselectedDegrees.includes(index)

              return (
                <tr key={index} className={`group hover:bg-[var(--color-primary-bg)] transition-colors ${index % 2 === 0 ? 'bg-[var(--color-bg-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                  <td className="px-[var(--spacing-3)] py-[var(--spacing-1-5)] w-[30%]">
                    <div className="flex items-center gap-[var(--spacing-2)]">
                      <Checkbox checked={isSelected} onChange={() => toggleDegreeSelection(index)} />
                      <span className={`text-[0.8125rem] font-medium transition-colors ${isSelected ? "text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>{item.degree}</span>
                    </div>
                  </td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-info)] text-center font-medium tabular-nums w-[17.5%]">{item.boys}</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-medium tabular-nums w-[17.5%]">{item.girls}</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-purple-text)] text-center font-semibold tabular-nums w-[17.5%]">{item.total}</td>
                  {normalized && (
                    <>
                      <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-info)] text-center font-medium tabular-nums w-[8.75%]">{boysPercent}%</td>
                      <td className="px-[var(--spacing-2)] py-[var(--spacing-1-5)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-medium tabular-nums w-[8.75%]">{girlsPercent}%</td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-[var(--color-bg-muted)] border-t-2 border-[var(--color-border-dark)]">
        <table className="min-w-full table-fixed">
          <tfoot>
            <tr>
              <td className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-text-primary)] font-extrabold uppercase tracking-wide w-[30%]">
                <div className="flex items-center gap-[var(--spacing-1-5)]">
                  <span>Total</span>
                  {selectedDegreeData.length > 0 && selectedDegreeData.length < degreeData.length && (
                    <span className="px-[var(--spacing-1-5)] py-[var(--spacing-0-5)] bg-[var(--color-primary)] text-[var(--color-white)] text-[0.65rem] rounded-[var(--radius-sm)] font-bold">{selectedDegreeData.length}</span>
                  )}
                </div>
              </td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-info)] text-center font-extrabold tabular-nums w-[17.5%]">{totalBoys}</td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-extrabold tabular-nums w-[17.5%]">{totalGirls}</td>
              <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-purple-text)] text-center font-extrabold tabular-nums w-[17.5%]">{grandTotal}</td>
              {normalized && (
                <>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-info)] text-center font-extrabold tabular-nums w-[8.75%]">{boysPercentTotal}%</td>
                  <td className="px-[var(--spacing-2)] py-[var(--spacing-2)] text-[0.8125rem] text-[var(--color-girls-text)] text-center font-extrabold tabular-nums w-[8.75%]">{girlsPercentTotal}%</td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}


export default DashboardPage
