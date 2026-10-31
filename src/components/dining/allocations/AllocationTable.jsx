import { useMemo, useState } from "react"
import { Avatar, Button, Card, DataTable, EmptyState, FilterTabs, SearchInput, Select, StatusBadge } from "hzero"
import { Download, FilterX, Upload, UserPlus, Users } from "lucide-react"
import { getMediaUrl } from "@/utils/mediaUtils"
import { catererColor } from "../caterer/diningScope"
import { formatDayMonth, toDayKey } from "../caterer/catererHelpers"
import DiningTagChips from "../DiningTagChips"
import { clearanceTone, formatClearance } from "../diningBillingHelpers"
import { mealPaletteFor, slotKey } from "../meal-planner/mealPlanner"
import {
  buildAllocationsCsv,
  downloadCsv,
  formatCurrency,
  formatPct,
  LOW_ATTENDANCE,
  matchesQuick,
  matchesRegistration,
  matchesTag,
  PAGE_SIZE,
  quickFilterDefs,
  REGISTRATION_OPTIONS,
  searchText,
  TAG_VALUE_OPTIONS,
  toRow,
  todayStatus,
} from "./allocationHelpers"
import "./Allocations.css"

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))

const MealMix = ({ row, slots, palette }) => (
  <span className="al-mealmix" title={slots.map((slot) => `${slot.name}: ${row.mealsBySlot?.[slot.key] || 0}`).join(" · ")}>
    <b>{row.meals}</b>
    <span className="al-mealmix__bar" aria-hidden="true">
      {slots.map((slot) => (
        <span key={slot.key} style={{ flex: row.mealsBySlot?.[slot.key] || 0, background: (palette[slot.key] || palette[slotKey(slot.name)])?.color }} />
      ))}
    </span>
  </span>
)

const Attendance = ({ value }) => (
  <span className="al-att" data-low={value !== null && value !== undefined && value < LOW_ATTENDANCE ? "" : undefined}>
    {formatPct(value)}
  </span>
)

const emptyCopy = ({ total, searching, canManage }) => {
  if (total === 0) {
    return {
      title: "No allocations yet",
      message: canManage ? "Nobody is seated in this period. Add students by roll number or upload a list." : "Nobody is allocated here for this period.",
    }
  }
  return { title: searching ? "No student matches" : "Nothing in this view", message: "Try clearing a filter or the search." }
}

/** The searchable, filterable roster of one period. */
const AllocationTable = ({
  period,
  slots,
  students,
  tags,
  oversight,
  showCaterer,
  palette,
  quick,
  onQuick,
  canManage,
  onAdd,
  onOpenStudent,
  stale,
  loading,
}) => {
  const [query, setQuery] = useState("")
  const [hostel, setHostel] = useState("")
  const [batch, setBatch] = useState("")
  const [tagId, setTagId] = useState("")
  const [tagValue, setTagValue] = useState("yes")
  const [registration, setRegistration] = useState("")
  const [page, setPage] = useState(1)

  // A different period starts on page one; the filters carry over.
  const [seenPeriod, setSeenPeriod] = useState(period.id)
  if (seenPeriod !== period.id) {
    setSeenPeriod(period.id)
    setPage(1)
  }

  const tagList = useMemo(() => tags || [], [tags])
  const rows = useMemo(() => students.map((student) => toRow(student, tagList)), [students, tagList])
  // A tag from another period no longer exists here; treat the filter as off.
  const activeTagId = tagList.some((tag) => tag.id === tagId) ? tagId : ""
  const tagOptions = useMemo(
    () => [
      { value: "", label: "All tags" },
      ...tagList.map((tag) => ({ value: tag.id, label: `${tag.name} · ${rows.filter((row) => matchesTag(row, tag.id, "yes")).length}` })),
    ],
    [tagList, rows]
  )
  const hasUnregistered = useMemo(() => rows.some((row) => row.unregistered), [rows])
  const hostels = useMemo(() => uniqueSorted(rows.map((row) => row.hostel?.name)), [rows])
  const batches = useMemo(() => uniqueSorted(rows.map((row) => row.batch)), [rows])
  const mealPalette = useMemo(() => mealPaletteFor(slots), [slots])

  const needle = query.trim().toLowerCase()
  const scoped = useMemo(
    () =>
      rows.filter(
        (row) =>
          (!hostel || row.hostel?.name === hostel) &&
          (!batch || row.batch === batch) &&
          matchesTag(row, activeTagId, tagValue) &&
          matchesRegistration(row, registration) &&
          (!needle || searchText(row).includes(needle))
      ),
    [rows, hostel, batch, activeTagId, tagValue, registration, needle]
  )
  const visible = useMemo(() => scoped.filter((row) => matchesQuick(row, quick)), [scoped, quick])

  const defs = quickFilterDefs(period.phase, oversight)
  const tabs = defs.map((def) => ({ ...def, count: scoped.filter((row) => matchesQuick(row, def.value)).length }))
  const filtersActive = Boolean(needle || hostel || batch || activeTagId || registration || quick !== "all")
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))

  const resetFilters = () => {
    setQuery("")
    setHostel("")
    setBatch("")
    setTagId("")
    setTagValue("yes")
    setRegistration("")
    onQuick("all")
    setPage(1)
  }

  const exportCsv = () => {
    const csv = buildAllocationsCsv(visible, { slots, oversight, phase: period.phase, tags: tagList })
    downloadCsv(`allocations-${toDayKey(period.startDate)}-to-${toDayKey(period.endDate)}.csv`, csv)
  }

  const columns = useMemo(() => {
    const studentColumn = {
      key: "sortName",
      header: "Student",
      sortable: true,
      render: (row) => (
        <button type="button" className="al-student" onClick={() => onOpenStudent(row.id)} aria-label={`Open ${row.name || row.rollNumber}`}>
          <Avatar src={getMediaUrl(row.profileImage)} name={row.name} alt="" size="small" />
          <span className="al-student__text">
            <span className="al-student__name">{row.name || "Unnamed student"}</span>
            <span className="al-student__roll">{row.rollNumber || "No roll number"}</span>
            {row.unregistered && (
              <span className="al-student__flag" title="Auto-allocated: did not choose a caterer. Cannot request rebates for this period.">
                <StatusBadge tone="warning" showDot={false}>Unregistered</StatusBadge>
              </span>
            )}
          </span>
        </button>
      ),
    }
    const tagsColumn = {
      key: "tagText",
      header: "Tags",
      sortable: true,
      render: (row) => (row.tagChips.length ? <DiningTagChips tags={row.tagChips} max={3} /> : <span className="al-muted">-</span>),
    }
    const roomColumn = {
      key: "roomText",
      header: "Room",
      sortable: true,
      className: "al-col-wide",
      render: (row) => row.roomText || <span className="al-muted">-</span>,
    }
    const programColumn = {
      key: "programText",
      header: "Program",
      sortable: true,
      className: "al-col-wide",
      render: (row) => row.programText || <span className="al-muted">-</span>,
    }
    const catererColumn = {
      key: "catererName",
      header: "Caterer",
      sortable: true,
      render: (row) => (
        <span className="al-caterer" style={{ "--kitchen": catererColor(palette, row.caterer?.id) }}>
          <span className="al-caterer__dot" aria-hidden="true" />
          {row.catererName || "-"}
        </span>
      ),
    }
    const mealsColumn = {
      key: "meals",
      header: "Meals",
      sortable: true,
      render: (row) => <MealMix row={row} slots={slots} palette={mealPalette} />,
    }
    const attendanceColumn = { key: "attendance", header: "Attendance", sortable: true, align: "right", render: (row) => <Attendance value={row.attendance} /> }
    const rebateColumn = { key: "rebateDays", header: "Rebate days", sortable: true, align: "right", className: "al-col-wide", render: (row) => row.rebateDays || <span className="al-muted">0</span> }
    const billableColumn = { key: "chargeableDays", header: "Billable days", sortable: true, align: "right", className: "al-col-wide" }

    const lead = [studentColumn, ...(tagList.length ? [tagsColumn] : []), roomColumn, programColumn, ...(showCaterer ? [catererColumn] : [])]

    if (period.phase === "current") {
      return [
        ...lead,
        {
          key: "todayText",
          header: "Today",
          sortable: true,
          render: (row) => {
            const status = todayStatus(row)
            return <StatusBadge tone={status.tone} showDot={false}>{status.label}</StatusBadge>
          },
        },
        mealsColumn,
        attendanceColumn,
        rebateColumn,
        billableColumn,
      ]
    }
    if (period.phase === "past") {
      return [
        ...lead,
        mealsColumn,
        attendanceColumn,
        rebateColumn,
        billableColumn,
        { key: "billed", header: "Billed", sortable: true, align: "right", render: (row) => formatCurrency(row.billed) },
        ...(oversight
          ? [
              {
                key: "feeBalance",
                header: "Mess fee",
                sortable: true,
                align: "right",
                render: (row) =>
                  row.fee ? (
                    <StatusBadge tone={clearanceTone(row.fee.clearance)} showDot={false}>
                      {formatClearance(row.fee.clearance)} · {formatCurrency(row.fee.balance)}
                    </StatusBadge>
                  ) : (
                    <span className="al-muted">-</span>
                  ),
              },
            ]
          : []),
      ]
    }
    return [
      ...lead,
      {
        key: "selectedTime",
        header: "Allocated on",
        sortable: true,
        render: (row) => (row.selectedAt ? formatDayMonth(toDayKey(row.selectedAt)) : <span className="al-muted">-</span>),
      },
      { key: "approvedRebateDays", header: "Rebates booked", sortable: true, align: "right", render: (row) => row.approvedRebateDays || <span className="al-muted">0</span> },
    ]
  }, [period.phase, oversight, showCaterer, palette, slots, mealPalette, onOpenStudent, tagList])

  const copy = emptyCopy({ total: rows.length, searching: Boolean(needle), canManage })

  return (
    <Card className="al-roster" data-stale={stale || undefined}>
      <div className="al-toolbar">
        <div className="al-toolbar__filters">
          <SearchInput
            className="al-toolbar__search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search name, roll number or room"
            size="sm"
            aria-label="Search students by name, roll number or room"
          />
          {hostels.length > 1 && (
            <Select
              size="small"
              value={hostel}
              onChange={(event) => {
                setHostel(event.target.value)
                setPage(1)
              }}
              options={[{ value: "", label: "All hostels" }, ...hostels.map((name) => ({ value: name, label: name }))]}
              aria-label="Hostel"
            />
          )}
          {batches.length > 1 && (
            <Select
              size="small"
              value={batch}
              onChange={(event) => {
                setBatch(event.target.value)
                setPage(1)
              }}
              options={[{ value: "", label: "All batches" }, ...batches.map((name) => ({ value: name, label: name }))]}
              aria-label="Batch"
            />
          )}
          {tagList.length > 0 && (
            <>
              <Select
                size="small"
                value={activeTagId}
                onChange={(event) => {
                  setTagId(event.target.value)
                  setPage(1)
                }}
                options={tagOptions}
                aria-label="Dining tag"
              />
              {activeTagId && (
                <Select
                  size="small"
                  value={tagValue}
                  onChange={(event) => {
                    setTagValue(event.target.value)
                    setPage(1)
                  }}
                  options={TAG_VALUE_OPTIONS}
                  aria-label="Dining tag answer"
                />
              )}
            </>
          )}
          {(hasUnregistered || registration) && (
            <Select
              size="small"
              value={registration}
              onChange={(event) => {
                setRegistration(event.target.value)
                setPage(1)
              }}
              options={REGISTRATION_OPTIONS}
              aria-label="Registration"
            />
          )}
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <FilterX size={16} /> Clear
            </Button>
          )}
        </div>
        <div className="al-toolbar__actions">
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!visible.length}>
            <Download size={16} /> Export CSV
          </Button>
          {canManage && (
            <>
              <Button variant="secondary" size="sm" onClick={() => onAdd("bulk")}>
                <Upload size={16} /> Bulk upload
              </Button>
              <Button size="sm" onClick={() => onAdd("single")}>
                <UserPlus size={16} /> Add student
              </Button>
            </>
          )}
        </div>
      </div>

      {tabs.length > 1 && (
        <div className="al-quick">
          <FilterTabs
            tabs={tabs}
            activeTab={quick}
            setActiveTab={(value) => {
              onQuick(value)
              setPage(1)
            }}
            size="sm"
          />
        </div>
      )}

      <DataTable
        data={visible}
        columns={columns}
        sortable
        pagination
        pageSize={PAGE_SIZE}
        currentPage={Math.min(page, totalPages)}
        onPageChange={setPage}
        loading={loading}
        onRowClick={(row) => onOpenStudent(row.id)}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            icon={Users}
            size="sm"
            title={copy.title}
            message={copy.message}
            buttonText={rows.length === 0 && canManage ? "Add student" : undefined}
            buttonAction={rows.length === 0 && canManage ? () => onAdd("single") : undefined}
          />
        }
      />
    </Card>
  )
}

export default AllocationTable
