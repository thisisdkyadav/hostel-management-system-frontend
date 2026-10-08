import { useMemo, useState } from "react"
import { Avatar, Badge, Card, DataTable, EmptyState, FilterTabs, SearchInput, StatusBadge } from "hzero"
import { Users } from "lucide-react"
import { getMediaUrl } from "@/utils/mediaUtils"
import { describeRoom, formatDayMonth, MEAL_STATUS, SCAN_SOURCE_LABELS } from "../catererHelpers"
import { countByStatus, formatClock, PAGE_SIZE, rebateEndLabel } from "./mealRecordsHelpers"
import "./MealRecords.css"

const matchesFilter = (row, filter) => {
  if (filter === "all") return true
  if (filter === "left") return row.status === "missed" || row.status === "pending"
  return row.status === filter
}

const emptyCopy = ({ filter, ended, searching, query }) => {
  if (searching) return { title: "No student matches", message: `Nothing in this list matches "${query}".` }
  if (filter === "verified") {
    return ended
      ? { title: "Nobody ate this meal", message: "No student was verified at your counter." }
      : { title: "Nobody has eaten yet", message: "Students show up here as they are verified." }
  }
  if (filter === "left") {
    return ended
      ? { title: "Nobody missed this meal", message: "Every expected student ate." }
      : { title: "Nobody is waiting", message: "Every expected student has eaten." }
  }
  if (filter === "on-rebate") return { title: "Nobody is away on rebate", message: "Everyone allocated to you is expected at this meal." }
  return { title: "No students for this meal", message: "Nobody is allocated to you for this period." }
}

const COLUMNS = [
  {
    key: "sortName",
    header: "Student",
    render: (row) => (
      <div className="mr-student">
        <Avatar src={getMediaUrl(row.student.profileImage)} name={row.student.name} alt="" size="small" />
        <div className="mr-student__text">
          <span className="mr-student__name">{row.student.name || "Unnamed student"}</span>
          <span className="mr-student__roll">{row.student.rollNumber || "No roll number"}</span>
        </div>
      </div>
    ),
  },
  { key: "room", header: "Room", render: (row) => row.room || <span className="mr-muted">-</span> },
  {
    key: "statusLabel",
    header: "Status",
    render: (row) => {
      const meta = MEAL_STATUS[row.status] || { label: row.status, tone: "neutral" }
      return (
        <StatusBadge tone={meta.tone} showDot={false}>
          {meta.label}
        </StatusBadge>
      )
    },
  },
  {
    key: "sortTime",
    header: "Time",
    render: (row) => {
      if (row.verifiedAt) return <span className="mr-time">{formatClock(row.verifiedAt)}</span>
      if (row.status === "on-rebate" && row.rebate?.endDate) {
        return <span className="mr-muted">Away until {formatDayMonth(rebateEndLabel(row.rebate))}</span>
      }
      return <span className="mr-muted">-</span>
    },
  },
  {
    key: "method",
    header: "Method",
    render: (row) =>
      row.method ? (
        <span className="mr-method">
          {row.method}
          {row.attemptCount > 1 && (
            <Badge variant="default" size="small">
              ×{row.attemptCount} scans
            </Badge>
          )}
        </span>
      ) : (
        <span className="mr-muted">-</span>
      ),
  },
]

/** The whole roster for one service, filterable, searchable and sortable client-side. */
const MealRoster = ({ record, stale }) => {
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  // A different service starts on page one; the filter and search carry over.
  const serviceKey = record ? `${record.date}|${record.mealSlot?.key}` : ""
  const [seenService, setSeenService] = useState(serviceKey)
  if (seenService !== serviceKey) {
    setSeenService(serviceKey)
    setPage(1)
  }

  const students = record?.students
  const ended = record?.mealState === "ended"
  const counts = useMemo(() => countByStatus(students), [students])

  const rows = useMemo(
    () =>
      (students || []).map((item) => ({
        id: item.allocationId || item.student?.id,
        student: item.student || {},
        status: item.status,
        statusLabel: MEAL_STATUS[item.status]?.label || item.status,
        sortName: (item.student?.name || "").toLowerCase(),
        room: describeRoom(item.student),
        verifiedAt: item.verifiedAt,
        sortTime: item.verifiedAt ? new Date(item.verifiedAt).getTime() : null,
        method: SCAN_SOURCE_LABELS[item.verificationSource] || "",
        attemptCount: item.attemptCount || 0,
        rebate: item.rebate,
      })),
    [students]
  )

  const needle = query.trim().toLowerCase()
  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          matchesFilter(row, filter) &&
          (!needle || row.sortName.includes(needle) || String(row.student.rollNumber || "").toLowerCase().includes(needle))
      ),
    [rows, filter, needle]
  )

  const tabs = [
    { value: "all", label: "All", count: rows.length },
    { value: "verified", label: "Ate", count: counts.verified },
    { value: "left", label: ended ? "Missed" : "Not yet", count: counts.missed + counts.pending },
    { value: "on-rebate", label: "Away", count: counts["on-rebate"] },
  ]

  const copy = emptyCopy({ filter, ended, searching: Boolean(needle), query: query.trim() })
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))

  return (
    <Card className="mr-roster" data-stale={stale || undefined}>
      <div className="mr-roster__toolbar">
        <FilterTabs
          tabs={tabs}
          activeTab={filter}
          setActiveTab={(value) => {
            setFilter(value)
            setPage(1)
          }}
          size="sm"
        />
        <SearchInput
          className="mr-roster__search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          placeholder="Search name or roll number"
          size="sm"
          aria-label="Search students by name or roll number"
        />
      </div>
      <DataTable
        data={visible}
        columns={COLUMNS}
        sortable
        pagination
        pageSize={PAGE_SIZE}
        currentPage={Math.min(page, totalPages)}
        onPageChange={setPage}
        loading={!record}
        getRowId={(row) => row.id}
        emptyState={<EmptyState icon={Users} size="sm" title={copy.title} message={copy.message} />}
      />
    </Card>
  )
}

export default MealRoster
