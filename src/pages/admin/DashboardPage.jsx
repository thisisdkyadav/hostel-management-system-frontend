import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Activity, Award, CalendarCheck, CalendarClock, ClipboardList, CornerDownLeft,
  FileText, GraduationCap, Receipt, TriangleAlert, Trophy, User, Users,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthProvider"
import { dashboardApi } from "../../service"
import gymkhanaEventsApi from "../../service/modules/gymkhanaEvents.api"
import porApi from "../../service/modules/por.api"
import { useOnlineUsers } from "../../hooks/useOnlineUsers"
import PageHeader from "../../components/common/PageHeader"
import OnlineUsersPopupContent from "../../components/admin/OnlineUsersPopupContent"
// hzero is the only component source now; the @/components/ui shim is gone
// that re-exports it verbatim.
import { Badge, Checkbox, EmptyState, ErrorState, Grid, HStack, Page, Panel, Popover, Progress, Skeleton, SkeletonTable, StatPill, StatRow, Table, Text, ToggleButtonGroup, VStack } from "hzero"

// Maps an admin SA sub-role to the status that means "pending my approval"
// across activity calendars, event proposals/expenses, and POR requests.
const APPROVAL_STAGE_STATUS = {
  "Student Affairs": "pending_student_affairs",
  "Officer SA": "pending_officer",
  "Associate Dean SA": "pending_associate_dean",
  "Dean SA": "pending_dean",
}

const APPROVAL_TODO_ITEMS = [
  { key: "proposals", label: "Event proposals", icon: FileText, tone: "primary", to: "/admin/gymkhana-events" },
  { key: "megaProposals", label: "Mega event proposals", icon: Trophy, tone: "teal", to: "/admin/mega-events" },
  { key: "calendars", label: "Activity calendars", icon: CalendarCheck, tone: "info", to: "/admin/gymkhana-events" },
  { key: "expenses", label: "Event bills", icon: Receipt, tone: "warning", to: "/admin/gymkhana-events" },
  { key: "por", label: "POR requests", icon: Award, tone: "purple", to: "/admin/por" },
]

const COHORTS = [
  { value: "hostler", label: "Hostlers" },
  { value: "dayScholar", label: "Day scholars" },
  { value: "all", label: "All" },
]

const UNITS = [
  { value: "count", label: "Count" },
  { value: "share", label: "%" },
]

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

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

const daysFromNow = (date) => Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

// A staff member rejoins the day after their leave ends. The sooner that is,
// the warmer the row reads.
const joinDetails = (leave) => {
  const end = leave?.endDate ? new Date(leave.endDate) : null
  if (!end || Number.isNaN(end.getTime())) return { label: "—", tone: "info" }

  const joinDate = new Date(end)
  joinDate.setDate(joinDate.getDate() + 1)
  const days = daysFromNow(joinDate)

  return {
    label: joinDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    tone: days <= 1 ? "success" : days <= 3 ? "warning" : "info",
  }
}

const eventTiming = (date) => {
  const days = daysFromNow(new Date(date))
  if (days === 0) return { label: "Today", variant: "success" }
  if (days === 1) return { label: "Tomorrow", variant: "warning" }
  if (days <= 7) return { label: formatDate(date), variant: "primary" }
  return { label: formatDate(date), variant: "default" }
}

// ─────────────────────────────────────────────────────────────────────────────
// Header figures
// ─────────────────────────────────────────────────────────────────────────────

const ONLINE_ROLES = [
  { role: "Student", roleLabel: "Students", short: "S" },
  { role: "Hostel Supervisor", roleLabel: "Hostel supervisors", short: "HS" },
  { role: "Admin", roleLabel: "Admins", short: "A" },
]

const HeaderFigures = ({ loading, error, dashboardData, onlineStats }) => {
  if (loading) {
    return (
      <HStack gap="var(--spacing-2-5)">
        <Skeleton variant="rounded" height="var(--spacing-9)" width="var(--spacing-24)" />
        <Skeleton variant="rounded" height="var(--spacing-9)" width="var(--spacing-24)" />
        <Skeleton variant="rounded" height="var(--spacing-9)" width="var(--spacing-24)" />
        <Skeleton variant="rounded" height="var(--spacing-9)" width="var(--spacing-24)" />
      </HStack>
    )
  }

  if (error) {
    return <Badge variant="danger" size="medium">Statistics unavailable</Badge>
  }

  const counts = dashboardData?.hostlerAndDayScholarCounts || {}
  const hostler = counts.hostler || {}
  const dayScholar = counts.dayScholar || {}
  const total = {
    boys: (hostler.boys || 0) + (dayScholar.boys || 0),
    girls: (hostler.girls || 0) + (dayScholar.girls || 0),
    total: (hostler.total || 0) + (dayScholar.total || 0),
  }

  return (
    <HStack align="center" gap="var(--spacing-2-5)" className="border-l border-[var(--color-border-primary)] pl-[var(--spacing-5)]">
      <StatPill icon={Users} label="Total" value={total.total}>
        <StatPill.Chip>B {total.boys}</StatPill.Chip>
        <StatPill.Chip>G {total.girls}</StatPill.Chip>
      </StatPill>

      <StatPill icon={User} label="Hostlers" value={hostler.total || 0}>
        <StatPill.Chip>B {hostler.boys || 0}</StatPill.Chip>
        <StatPill.Chip>G {hostler.girls || 0}</StatPill.Chip>
      </StatPill>

      <StatPill icon={User} label="Day-sch." value={dayScholar.total || 0}>
        <StatPill.Chip>B {dayScholar.boys || 0}</StatPill.Chip>
        <StatPill.Chip>G {dayScholar.girls || 0}</StatPill.Chip>
      </StatPill>

      <StatPill icon={Activity} label="Online now" value={onlineStats?.totalOnline || 0} tone="success" live>
        {ONLINE_ROLES.map(({ role, roleLabel, short }) => (
          <Popover
            key={role}
            trigger="hover"
            placement="bottom"
            align="end"
            content={<OnlineUsersPopupContent role={role} roleLabel={roleLabel} />}
          >
            <StatPill.Chip>{short} {onlineStats?.byRole?.[role] || 0}</StatPill.Chip>
          </Popover>
        ))}
      </StatPill>
    </HStack>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Student distribution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rows excluded from a table's totals are tracked by their own key, not by
 * position. Keying on the index looks equivalent and is not: the dashboard
 * refetches, and a list that comes back in a different order would silently
 * move every tick to a different row.
 */
const useExclusions = () => {
  const [excluded, setExcluded] = useState(() => new Set())

  const toggle = (key) =>
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const toggleAll = (keys) =>
    setExcluded((prev) => (prev.size === 0 ? new Set(keys) : new Set()))

  return { excluded, toggle, toggleAll }
}

const DegreeTable = ({ data, unit, cohort }) => {
  const { excluded, toggle, toggleAll } = useExclusions()
  const degreeWise = data?.degreeWise || []

  if (!degreeWise.length) {
    return <EmptyState size="sm" icon={GraduationCap} title="No student data" message="Nothing has been recorded yet." />
  }

  const share = unit === "share"

  const rows = degreeWise.map((item) => {
    const hostler = item.hostler || {}
    const dayScholar = item.dayScholar || {}

    let boys, girls
    if (cohort === "hostler") {
      boys = hostler.boys || 0
      girls = hostler.girls || 0
    } else if (cohort === "dayScholar") {
      boys = dayScholar.boys || 0
      girls = dayScholar.girls || 0
    } else {
      // "all" — prefer the combined count from the backend, fall back to the splits
      boys = item.boys ?? (hostler.boys || 0) + (dayScholar.boys || 0)
      girls = item.girls ?? (hostler.girls || 0) + (dayScholar.girls || 0)
    }

    return { ...item, key: item.degree ?? String(boys + girls), boys, girls, total: boys + girls }
  })

  const included = rows.filter((row) => !excluded.has(row.key))
  const allIncluded = included.length === rows.length
  const partial = included.length > 0 && !allIncluded

  const totalBoys = included.reduce((sum, item) => sum + item.boys, 0)
  const totalGirls = included.reduce((sum, item) => sum + item.girls, 0)
  const grandTotal = included.reduce((sum, item) => sum + item.total, 0)
  const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

  // Declared here, not on the header cells: a sticky table's rows are table
  // boxes of their own, so the widths have to reach every one of them.
  const columns = share
    ? ["30%", "17.5%", "17.5%", "17.5%", "8.75%", "8.75%"]
    : ["30%", "17.5%", "17.5%", "17.5%"]

  return (
    <Table sticky dense bordered striped columns={columns}>
      <Table.Header>
        <Table.Row>
          <Table.Head>
            <HStack align="center" gap={2}>
              <Checkbox
                checked={allIncluded}
                onChange={() => toggleAll(rows.map((row) => row.key))}
                aria-label={allIncluded ? "Exclude every degree from the total" : "Include every degree in the total"}
              />
              Degree
            </HStack>
          </Table.Head>
          <Table.Head align="center">Boys</Table.Head>
          <Table.Head align="center">Girls</Table.Head>
          <Table.Head align="center">Total</Table.Head>
          {share && (
            <>
              <Table.Head align="center">B%</Table.Head>
              <Table.Head align="center">G%</Table.Head>
            </>
          )}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rows.map((item) => {
          const isIncluded = !excluded.has(item.key)
          return (
            <Table.Row key={item.key}>
              <Table.Cell>
                <HStack align="center" gap={2}>
                  <Checkbox
                    checked={isIncluded}
                    onChange={() => toggle(item.key)}
                    aria-label={`Include ${item.degree} in the total`}
                  />
                  <Text as="span" size="sm" weight="medium" color={isIncluded ? "secondary" : "muted"}>
                    {item.degree}
                  </Text>
                </HStack>
              </Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-info)] font-medium">{item.boys}</Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-girls-text)] font-medium">{item.girls}</Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-purple-text)] font-semibold">{item.total}</Table.Cell>
              {share && (
                <>
                  <Table.Cell align="center" numeric className="text-[var(--color-info)] font-medium">{percent(item.boys, item.total)}%</Table.Cell>
                  <Table.Cell align="center" numeric className="text-[var(--color-girls-text)] font-medium">{percent(item.girls, item.total)}%</Table.Cell>
                </>
              )}
            </Table.Row>
          )
        })}
      </Table.Body>

      <Table.Foot>
        <Table.Row>
          <Table.Cell>
            <HStack align="center" gap="var(--spacing-1-5)">
              Total
              {partial && <Badge variant="primary" size="small">{included.length} of {rows.length}</Badge>}
            </HStack>
          </Table.Cell>
          <Table.Cell align="center" numeric className="text-[var(--color-info)]">{totalBoys}</Table.Cell>
          <Table.Cell align="center" numeric className="text-[var(--color-girls-text)]">{totalGirls}</Table.Cell>
          <Table.Cell align="center" numeric className="text-[var(--color-purple-text)]">{grandTotal}</Table.Cell>
          {share && (
            <>
              <Table.Cell align="center" numeric className="text-[var(--color-info)]">{percent(totalBoys, grandTotal)}%</Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-girls-text)]">{percent(totalGirls, grandTotal)}%</Table.Cell>
            </>
          )}
        </Table.Row>
      </Table.Foot>
    </Table>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hostel occupancy
// ─────────────────────────────────────────────────────────────────────────────

const occupancyTone = (percent) => (percent >= 95 ? "danger" : percent >= 80 ? "warning" : "success")

const hostelKey = (hostel, index) => hostel._id ?? hostel.name ?? String(index)

const OccupancyTable = ({ hostels }) => {
  const { excluded, toggle, toggleAll } = useExclusions()

  if (!hostels.length) {
    return <EmptyState size="sm" icon={ClipboardList} title="No hostels" message="Add a hostel to see occupancy." />
  }

  const keys = hostels.map(hostelKey)
  const includedCount = keys.filter((key) => !excluded.has(key)).length
  const allIncluded = includedCount === hostels.length
  const partial = includedCount > 0 && !allIncluded
  const sumOf = (field) =>
    hostels.reduce((sum, hostel, index) => (excluded.has(keys[index]) ? sum : sum + (hostel[field] || 0)), 0)

  return (
    <Table sticky dense bordered striped columns={["40%", "15%", "15%", "15%", "15%"]}>
      <Table.Header>
        <Table.Row>
          <Table.Head>
            <HStack align="center" gap={2}>
              <Checkbox
                checked={allIncluded}
                onChange={() => toggleAll(keys)}
                aria-label={allIncluded ? "Exclude every hostel from the total" : "Include every hostel in the total"}
              />
              Hostel
            </HStack>
          </Table.Head>
          <Table.Head align="center">Rooms</Table.Head>
          <Table.Head align="center">Capacity</Table.Head>
          <Table.Head align="center">Occupied</Table.Head>
          <Table.Head align="center">Vacant</Table.Head>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {hostels.map((hostel, index) => {
          const key = keys[index]
          const isIncluded = !excluded.has(key)
          const percent = hostel.totalCapacity > 0
            ? Math.round((hostel.currentOccupancy / hostel.totalCapacity) * 100)
            : 0

          return (
            <Table.Row key={key}>
              <Table.Cell>
                <HStack align="center" gap={2}>
                  <Checkbox
                    checked={isIncluded}
                    onChange={() => toggle(key)}
                    aria-label={`Include ${hostel.name} in the total`}
                  />
                  {/* Name and bar sit tight against each other: the row is two
                      lines of a single label, not two stacked things. Both
                      leadings are pinned, or the line boxes add ~12px per row
                      and the table stops being dense. */}
                  <VStack gap="none" className="min-w-0 flex-1">
                    <Text
                      as="span"
                      size="sm"
                      weight="semibold"
                      leading="var(--line-height-tight)"
                      color={isIncluded ? "secondary" : "muted"}
                      className="truncate"
                    >
                      {hostel.name}
                    </Text>
                    <HStack align="center" gap="var(--spacing-1-5)">
                      <span style={{ width: "var(--spacing-20)" }}>
                        <Progress
                          value={percent}
                          size="sm"
                          color={occupancyTone(percent)}
                          aria-label={`${hostel.name} occupancy`}
                        />
                      </span>
                      <Text as="span" size="2xs" color="muted" leading="var(--line-height-none)" className="tabular-nums">
                        {percent}%
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-text-muted)] font-medium">{hostel.totalRooms}</Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-text-muted)] font-medium">{hostel.totalCapacity}</Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-info)] font-bold">{hostel.currentOccupancy}</Table.Cell>
              <Table.Cell align="center" numeric className="text-[var(--color-success)] font-bold">{hostel.vacantCapacity}</Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>

      <Table.Foot>
        <Table.Row>
          <Table.Cell>
            <HStack align="center" gap="var(--spacing-1-5)">
              Total
              {partial && <Badge variant="primary" size="small">{includedCount} of {hostels.length}</Badge>}
            </HStack>
          </Table.Cell>
          <Table.Cell align="center" numeric>{sumOf("totalRooms")}</Table.Cell>
          <Table.Cell align="center" numeric>{sumOf("totalCapacity")}</Table.Cell>
          <Table.Cell align="center" numeric className="text-[var(--color-info)]">{sumOf("currentOccupancy")}</Table.Cell>
          <Table.Cell align="center" numeric className="text-[var(--color-success)]">{sumOf("vacantCapacity")}</Table.Cell>
        </Table.Row>
      </Table.Foot>
    </Table>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Action centre — four operational feeds sharing one surface
// ─────────────────────────────────────────────────────────────────────────────

const FeedSkeleton = () => (
  <VStack gap="var(--spacing-1-5)">
    {[0, 1, 2, 3].map((i) => (
      <Skeleton key={i} variant="rounded" height="var(--spacing-10)" />
    ))}
  </VStack>
)

const Feed = ({ title, icon, accent, count, to, loading, children }) => (
  <Panel
    bordered={false}
    title={title}
    icon={icon}
    accent={accent}
    count={loading ? undefined : count}
    link={to ? <Panel.Link as={Link} to={to}>Open</Panel.Link> : undefined}
  >
    <Panel.Body scroll>
      {loading ? <FeedSkeleton /> : <VStack gap="var(--spacing-1-5)">{children}</VStack>}
    </Panel.Body>
  </Panel>
)

const ActionCenter = ({ loading, error, dashboardData, approvalCounts, approvalsLoading }) => {
  const leaves = dashboardData?.leaves?.data?.leaves || []
  const events = dashboardData?.events || []
  const complaints = dashboardData?.complaints || {}

  const approvalTotal = APPROVAL_TODO_ITEMS.reduce((sum, item) => sum + (approvalCounts[item.key] || 0), 0)
  const complaintsOpen = (complaints.pending || 0) + (complaints.inProgress || 0) + (complaints.forwardedToIDO || 0)

  const complaintRows = [
    { label: "Pending", value: complaints.pending || 0, tone: "warning", to: buildComplaintDashboardLink({ status: "Pending" }) },
    { label: "In progress", value: complaints.inProgress || 0, tone: "info", to: buildComplaintDashboardLink({ status: "In Progress" }) },
    { label: "To IDO", value: complaints.forwardedToIDO || 0, tone: "purple", to: buildComplaintDashboardLink({ status: "Forwarded to IDO" }) },
    { label: "Resolved today", value: complaints.resolvedToday || 0, tone: "success", to: buildComplaintDashboardLink({ resolvedToday: true }) },
  ]

  if (error) return <ErrorState message={error} />

  return (
    <Panel.Columns>
      <Feed title="Upcoming joins" icon={CalendarCheck} accent="info" count={leaves.length} to="/admin/leaves" loading={loading}>
        {leaves.length === 0 ? (
          <EmptyState size="sm" icon={CalendarCheck} title="No upcoming returns" message="" />
        ) : (
          leaves.map((leave) => {
            const { label, tone } = joinDetails(leave)
            return (
              <StatRow
                key={leave._id}
                dot
                tone={tone}
                label={leave?.userId?.name || leave?.userId?.email || "Unknown"}
                value={<Badge variant="success" size="small" icon={<CornerDownLeft />}>{label}</Badge>}
              />
            )
          })
        )}
      </Feed>

      <Feed title="To-do" icon={ClipboardList} accent="success" count={approvalTotal} loading={approvalsLoading}>
        {approvalTotal === 0 ? (
          <EmptyState size="sm" icon={Award} title="All caught up" message="" />
        ) : (
          APPROVAL_TODO_ITEMS.filter((item) => (approvalCounts[item.key] || 0) > 0).map((item) => (
            <StatRow
              key={item.key}
              as={Link}
              to={item.to}
              icon={item.icon}
              tone={item.tone}
              label={item.label}
              value={approvalCounts[item.key]}
            />
          ))
        )}
      </Feed>

      <Feed title="Complaints" icon={FileText} accent="warning" count={complaintsOpen} to="/admin/complaints" loading={loading}>
        {complaintRows.map((row) => (
          <StatRow key={row.label} as={Link} to={row.to} dot tone={row.tone} label={row.label} value={row.value} />
        ))}
        <StatRow
          as={Link}
          to={buildComplaintDashboardLink({ overdue: true })}
          icon={TriangleAlert}
          tone="danger"
          emphasis
          label="Overdue 20+ days"
          value={complaints.overdueCount || 0}
        />
      </Feed>

      <Feed title="Upcoming events" icon={CalendarClock} accent="purple" count={events.length} to="/admin/events" loading={loading}>
        {events.length === 0 ? (
          <EmptyState size="sm" icon={CalendarClock} title="No upcoming events" message="" />
        ) : (
          events.map((event) => {
            const { label, variant } = eventTiming(event.date)
            return (
              <StatRow
                key={event.id}
                edge
                tone="purple"
                label={event.title}
                value={<Badge variant={variant} size="small">{label}</Badge>}
              />
            )
          })
        )}
      </Feed>
    </Panel.Columns>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [unit, setUnit] = useState("count")
  const [cohort, setCohort] = useState("hostler")
  const [approvalCounts, setApprovalCounts] = useState({ proposals: 0, megaProposals: 0, calendars: 0, expenses: 0, por: 0 })
  const [approvalsLoading, setApprovalsLoading] = useState(true)

  const { stats: onlineStats } = useOnlineUsers({ autoFetch: true, refreshInterval: 5000 })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await dashboardApi.getAdminDashboardData()
        setDashboardData(response.data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("The dashboard statistics could not be loaded.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Counts of items pending the current admin's approval stage
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
      const next = { proposals: 0, megaProposals: 0, calendars: 0, expenses: 0, por: 0 }

      const [proposalsRes, megaProposalsRes, expensesRes, calendarsRes, porRes] = await Promise.allSettled([
        // Proposals, mega proposals + expenses are already filtered to the caller's stage server-side
        gymkhanaEventsApi.getProposalsForApproval(),
        gymkhanaEventsApi.getMegaProposalsForApproval(),
        myStage ? gymkhanaEventsApi.getAllExpenses({ limit: 1 }) : Promise.resolve(null),
        myStage ? gymkhanaEventsApi.getCalendars({ status: myStage, limit: 100 }) : Promise.resolve(null),
        myStage ? porApi.getWorkspace() : Promise.resolve(null),
      ])

      if (proposalsRes.status === "fulfilled") {
        const data = unwrap(proposalsRes.value)
        next.proposals = Array.isArray(data.proposals) ? data.proposals.length : 0
      }
      if (megaProposalsRes.status === "fulfilled") {
        const data = unwrap(megaProposalsRes.value)
        next.megaProposals = Array.isArray(data.occurrences) ? data.occurrences.length : 0
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

  const hostels = dashboardData?.hostels || []

  return (
    <Page>
      <PageHeader title="Admin Dashboard">
        <HeaderFigures loading={loading} error={error} dashboardData={dashboardData} onlineStats={onlineStats} />
      </PageHeader>

      <Page.Body padded={false} className="p-[var(--spacing-4)]">
        <VStack gap={4}>
          <Grid cols={{ base: 1, lg: 2 }} gap={4}>
            <Panel
              title="Student distribution"
              height="lg"
              actions={!loading && !error && (
                <>
                  <ToggleButtonGroup options={COHORTS} value={cohort} onChange={setCohort} size="small" />
                  <ToggleButtonGroup options={UNITS} value={unit} onChange={setUnit} size="small" />
                </>
              )}
              link={<Panel.Link as={Link} to="/admin/students">View all</Panel.Link>}
            >
              <Panel.Body>
                {loading ? (
                  <SkeletonTable rows={6} columns={4} />
                ) : error ? (
                  <ErrorState message={error} />
                ) : (
                  <DegreeTable data={dashboardData?.students} unit={unit} cohort={cohort} />
                )}
              </Panel.Body>
            </Panel>

            <Panel
              title="Hostel occupancy"
              height="lg"
              link={<Panel.Link as={Link} to="/admin/hostels">View all</Panel.Link>}
            >
              <Panel.Body>
                {loading ? (
                  <SkeletonTable rows={6} columns={5} />
                ) : error ? (
                  <ErrorState message={error} />
                ) : (
                  <OccupancyTable hostels={hostels} />
                )}
              </Panel.Body>
            </Panel>
          </Grid>

          <Panel padded={false} height="md">
            <ActionCenter
              loading={loading}
              error={error}
              dashboardData={dashboardData}
              approvalCounts={approvalCounts}
              approvalsLoading={approvalsLoading}
            />
          </Panel>
        </VStack>
      </Page.Body>
    </Page>
  )
}

export default DashboardPage
