import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { Alert, Button, DataTable, EmptyState, LoadingState, Page, SearchInput, Select, StatusBadge, Text } from "hzero"
import { CalendarRange, Download, FilterX, ReceiptText, Users, Wallet } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { clearanceTone, formatClearance, formatCurrency, formatDateRange, getErrorMessage } from "@/components/dining/diningBillingHelpers"
import { mealPaletteFor } from "@/components/dining/meal-planner/mealPlanner"
import {
  CATEGORY_FIELDS,
  EMPTY_FILTERS,
  aggregate,
  applyFilters,
  formatPct,
  groupBy,
  optionsFor,
  toCsv,
} from "@/components/dining/billing-cycles/billingCycleHelpers"
import "@/components/dining/billing-cycles/BillingCycles.css"

const STATUS_TONE = { Open: "success", Upcoming: "warning", Closed: "primary", Archived: "primary" }

const shortDay = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })

/** One cycle in the horizontal rail. */
const CycleTile = ({ cycle, active, to }) => {
  const progress = cycle.totalDays ? (cycle.elapsedDays / cycle.totalDays) * 100 : 0
  return (
    <Link to={to} className={`bc-tile${active ? " is-active" : ""}`} data-status={cycle.status}>
      <span className="bc-tile__top">
        <span className="bc-tile__dot" />
        <span className="bc-tile__status">{cycle.status}</span>
        <span className="bc-tile__rate">{cycle.dailyRate ? `${formatCurrency(cycle.dailyRate)}/day` : "no rate"}</span>
      </span>
      <span className="bc-tile__range">{formatDateRange(cycle.startDate, cycle.endDate)}</span>
      <span className="bc-tile__amount">{formatCurrency(cycle.billedAmount)}</span>
      <span className="bc-tile__meta">
        {cycle.allocated} students · {formatPct(cycle.attendanceRate)} attendance
      </span>
      <span className="bc-tile__progress" title={`${cycle.elapsedDays} of ${cycle.totalDays} days`}>
        <span style={{ width: `${progress}%` }} />
      </span>
    </Link>
  )
}

const Kpi = ({ label, value, hint, tone = "neutral", meter }) => (
  <div className="bc-kpi" data-tone={tone}>
    <span className="bc-kpi__label">{label}</span>
    <span className="bc-kpi__value">{value}</span>
    {meter !== undefined && meter !== null && (
      <span className="bc-kpi__meter"><span style={{ width: `${Math.min(100, Math.max(0, meter))}%` }} /></span>
    )}
    {hint && <span className="bc-kpi__hint">{hint}</span>}
  </div>
)

/** Eligible → allocated → ate → cleared, as shrinking bars. */
const Funnel = ({ steps }) => {
  const max = Math.max(...steps.map((step) => step.value), 1)
  return (
    <div className="bc-funnel">
      {steps.map((step) => (
        <div key={step.label} className="bc-funnel__row">
          <span className="bc-funnel__label">{step.label}</span>
          <span className="bc-funnel__bar"><span style={{ width: `${(step.value / max) * 100}%` }} /></span>
          <span className="bc-funnel__value">
            {step.value.toLocaleString("en-IN")}
            {step.of ? <em> {formatPct((step.value / step.of) * 100)}</em> : null}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Stacked daily meal bars, rebates as a faint cap. */
const Turnout = ({ daily, slots, palette }) => {
  const max = Math.max(...daily.map((day) => day.total + day.onRebate), 1)
  if (!daily.length) return <p className="bc-muted">This cycle hasn’t started yet.</p>
  return (
    <div className="bc-turnout">
      <div className="bc-turnout__bars">
        {daily.map((day) => (
          <div key={day.date} className="bc-turnout__day" title={`${shortDay(day.date)}: ${day.total} meals, ${day.onRebate} on rebate`}>
            <span className="bc-turnout__rebate" style={{ height: `${(day.onRebate / max) * 100}%` }} />
            {slots.map((slot) => (
              <span key={slot.key} style={{ height: `${((day.meals[slot.key] || 0) / max) * 100}%`, background: palette[slot.key]?.color }} />
            ))}
          </div>
        ))}
      </div>
      <div className="bc-turnout__axis">
        <span>{shortDay(daily[0].date)}</span>
        <span>{shortDay(daily.at(-1).date)}</span>
      </div>
      <div className="bc-legend">
        {slots.map((slot) => (
          <span key={slot.key}><i style={{ background: palette[slot.key]?.color }} />{slot.name}</span>
        ))}
        <span><i className="is-rebate" />On rebate</span>
      </div>
    </div>
  )
}

const BillingCyclesPage = () => {
  const { periodId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const base = location.pathname.startsWith("/dining-office") ? "/dining-office" : "/admin"

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [search, setSearch] = useState("")
  const [groupField, setGroupField] = useState("caterer")

  const cyclesQuery = useQuery({ queryKey: ["billing-cycles"], queryFn: () => adminApi.getBillingCycles() })
  const cycles = useMemo(() => (Array.isArray(cyclesQuery.data) ? cyclesQuery.data : []), [cyclesQuery.data])
  const selectedId = periodId || cycles.find((cycle) => cycle.status === "Open")?.id || cycles[0]?.id

  const detailQuery = useQuery({
    queryKey: ["billing-cycle", selectedId],
    queryFn: () => adminApi.getBillingCycle(selectedId),
    enabled: Boolean(selectedId),
  })
  const detail = detailQuery.data
  const cycle = detail?.cycle
  const students = useMemo(() => detail?.students || [], [detail])
  const slots = useMemo(() => detail?.mealSlots || [], [detail])
  const palette = useMemo(() => mealPaletteFor(slots), [slots])

  const context = useMemo(() => ({
    elapsedDays: cycle?.elapsedDays || 0,
    mealsOfferedPerStudent: cycle?.allocated ? cycle.mealsOffered / cycle.allocated : 0,
  }), [cycle])
  const filtered = useMemo(() => applyFilters(students, filters, search), [students, filters, search])
  const totals = useMemo(() => aggregate(filtered, context), [filtered, context])
  const groups = useMemo(() => groupBy(filtered, groupField, context), [filtered, groupField, context])
  const filtersActive = CATEGORY_FIELDS.some((field) => filters[field.id] !== "all") || Boolean(search.trim())

  const setFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))
  const resetFilters = () => {
    setFilters(EMPTY_FILTERS)
    setSearch("")
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered, slots)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `billing-cycle-${cycle.startDate.slice(0, 10)}-to-${cycle.endDate.slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    { key: "rollNumber", header: "Roll No", render: (row) => <Text as="span" weight="semibold">{row.rollNumber}</Text> },
    { key: "name", header: "Name", render: (row) => <Text as="span" color="muted">{row.name || "—"}</Text> },
    { key: "caterer", header: "Caterer" },
    { key: "hostel", header: "Hostel" },
    {
      key: "meals",
      header: "Meals",
      render: (row) => (
        <span className="bc-mealmix" title={slots.map((slot) => `${slot.name}: ${row.mealsBySlot[slot.key] || 0}`).join(" · ")}>
          <b>{row.meals}</b>
          <span className="bc-mealmix__bar">
            {slots.map((slot) => (
              <span key={slot.key} style={{ flex: row.mealsBySlot[slot.key] || 0, background: palette[slot.key]?.color }} />
            ))}
          </span>
        </span>
      ),
    },
    { key: "rebateDays", header: "Rebate days", align: "right", render: (row) => (row.rebateDays ? row.rebateDays : <span className="bc-muted">0</span>) },
    { key: "chargeableDays", header: "Billed days", align: "right" },
    { key: "billed", header: "Billed", align: "right", render: (row) => formatCurrency(row.billed) },
    {
      key: "fee",
      header: "Mess fee",
      align: "right",
      render: (row) =>
        row.fee ? (
          <StatusBadge status={`${formatClearance(row.fee.clearance)} · ${formatCurrency(row.fee.balance)}`} tone={clearanceTone(row.fee.clearance)} />
        ) : (
          <span className="bc-muted">—</span>
        ),
    },
  ]

  if (cyclesQuery.isLoading) return <LoadingState message="Loading billing cycles..." />

  return (
    <Page>
      <PageHeader title="Billing Cycles" subtitle="Every dining period at a glance: who was in, who ate, and what it cost." />
      <Page.Body>
        {cyclesQuery.error && <Alert type="error" icon>{getErrorMessage(cyclesQuery.error, "Unable to load billing cycles.")}</Alert>}

        {!cycles.length ? (
          <EmptyState icon={ReceiptText} title="No Billing Cycles Yet" message="Each dining period becomes a billing cycle. Create a dining period to get started." />
        ) : (
          <div className="bc">
            <nav className="bc-rail" aria-label="Billing cycles">
              {cycles.map((item) => (
                <CycleTile key={item.id} cycle={item} active={item.id === selectedId} to={`${base}/billing-cycles/${item.id}`} />
              ))}
            </nav>

            {detailQuery.isLoading || !cycle ? (
              detailQuery.error ? (
                <Alert type="error" icon>{getErrorMessage(detailQuery.error, "Unable to load this billing cycle.")}</Alert>
              ) : (
                <LoadingState message="Crunching the cycle..." />
              )
            ) : (
              <>
                <section className="bc-hero">
                  <div>
                    <div className="bc-hero__title">
                      <CalendarRange size={20} />
                      <h2>{formatDateRange(cycle.startDate, cycle.endDate)}</h2>
                      <StatusBadge status={cycle.status} tone={STATUS_TONE[cycle.status] || "primary"} />
                    </div>
                    <p className="bc-muted">
                      Day {Math.min(cycle.elapsedDays, cycle.totalDays)} of {cycle.totalDays} · {formatCurrency(cycle.dailyRate)}/day ·{" "}
                      {cycle.caterers.map((caterer) => caterer.name).join(", ")}
                    </p>
                  </div>
                  <div className="bc-hero__fee">
                    {detail.feePeriod ? (
                      <Button variant="secondary" size="sm" onClick={() => navigate(`${base}/dining-billing/${detail.feePeriod.id}`)}>
                        <Wallet size={16} /> Mess fee: {detail.feePeriod.name}
                      </Button>
                    ) : (
                      <Alert type="warning" icon>Not part of any mess fee period yet — fee status is unavailable.</Alert>
                    )}
                  </div>
                </section>

                <section className="bc-filters">
                  {CATEGORY_FIELDS.map((field) => (
                    <label key={field.id} className="bc-filter">
                      <span>{field.label}</span>
                      <Select
                        value={filters[field.id]}
                        onChange={(event) => setFilter(field.id, event.target.value)}
                        options={[{ value: "all", label: "All" }, ...optionsFor(students, field.id).map((value) => ({ value, label: value }))]}
                      />
                    </label>
                  ))}
                  <div className="bc-filter bc-filter--search">
                    <span>Student</span>
                    <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Roll no or name" />
                  </div>
                  {filtersActive && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <FilterX size={16} /> Clear
                    </Button>
                  )}
                </section>
                {filtersActive && (
                  <p className="bc-scope">
                    Showing <strong>{totals.students}</strong> of {students.length} allocated students — every number below follows the filters.
                  </p>
                )}

                <section className="bc-kpis">
                  <Kpi label="Allocated" value={totals.students.toLocaleString("en-IN")} hint={filtersActive ? `of ${students.length} in cycle` : `${cycle.capacity} seats · ${cycle.eligible} eligible`} meter={filtersActive ? null : (cycle.allocated / Math.max(cycle.capacity, 1)) * 100} />
                  <Kpi label="Ate at least once" value={totals.ate.toLocaleString("en-IN")} hint={`${formatPct(totals.ateRate)} of allocated`} meter={totals.ateRate} tone="good" />
                  <Kpi label="Meals served" value={totals.meals.toLocaleString("en-IN")} hint={`${totals.avgMeals.toFixed(1)} per student`} />
                  <Kpi label="Attendance" value={formatPct(totals.attendance, 1)} hint="of meals offered on non-rebate days" meter={totals.attendance} tone={totals.attendance !== null && totals.attendance < 40 ? "warn" : "good"} />
                  <Kpi label="Rebate days" value={totals.rebateDays.toLocaleString("en-IN")} hint={`${totals.rebaters} students · ${totals.pendingRebates} pending · ${formatCurrency(totals.rebateDays * cycle.dailyRate)} off`} tone="warn" />
                  <Kpi label="Billed so far" value={formatCurrency(totals.billed)} hint={filtersActive ? "for these students" : `≈ ${formatCurrency(cycle.projectedAmount)} by cycle end`} tone="accent" />
                  <Kpi label="Mess fee paid" value={detail.feePeriod ? formatCurrency(totals.paid) : "—"} hint={detail.feePeriod ? `${totals.withFee} students with a fee account` : "no mess fee period"} />
                  <Kpi label="In dues" value={detail.feePeriod ? totals.dues.toLocaleString("en-IN") : "—"} hint={detail.feePeriod ? `${formatCurrency(totals.duesAmount)} outstanding` : "no mess fee period"} tone={totals.dues ? "bad" : "good"} />
                </section>

                <section className="bc-panels">
                  <div className="bc-panel">
                    <h3>Daily turnout {filtersActive && <em>· all students</em>}</h3>
                    <Turnout daily={detail.daily} slots={slots} palette={palette} />
                  </div>
                  <div className="bc-panel">
                    <h3>Funnel</h3>
                    <Funnel
                      steps={[
                        ...(filtersActive ? [] : [{ label: "Eligible", value: cycle.eligible }]),
                        { label: "Allocated", value: totals.students, of: filtersActive ? null : cycle.eligible },
                        { label: "Ate", value: totals.ate, of: totals.students },
                        ...(detail.feePeriod ? [{ label: "Fee cleared", value: totals.withFee - totals.dues, of: totals.students }] : []),
                      ]}
                    />
                    <h3 className="bc-panel__sub">Meal mix</h3>
                    <div className="bc-mix">
                      {slots.map((slot) => {
                        const count = filtered.reduce((sum, student) => sum + (student.mealsBySlot[slot.key] || 0), 0)
                        return (
                          <div key={slot.key} className="bc-mix__row">
                            <span>{slot.name}</span>
                            <span className="bc-mix__bar"><span style={{ width: `${totals.meals ? (count / totals.meals) * 100 : 0}%`, background: palette[slot.key]?.color }} /></span>
                            <b>{count.toLocaleString("en-IN")}</b>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>

                <section className="bc-panel">
                  <div className="bc-panel__head">
                    <h3>Breakdown by</h3>
                    <div className="bc-seg" role="tablist">
                      {CATEGORY_FIELDS.map((field) => (
                        <button key={field.id} type="button" role="tab" aria-selected={groupField === field.id} className={groupField === field.id ? "is-active" : ""} onClick={() => setGroupField(field.id)}>
                          {field.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bc-table-wrap">
                    <table className="bc-table">
                      <thead>
                        <tr>
                          <th>{CATEGORY_FIELDS.find((field) => field.id === groupField)?.label}</th>
                          <th>Students</th>
                          <th>Ate</th>
                          <th>Meals</th>
                          <th>Attendance</th>
                          <th>Rebate days</th>
                          <th>Billed</th>
                          <th>Fee paid</th>
                          <th>In dues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groups.map((group) => (
                          <tr key={group.key} onClick={() => setFilter(groupField, group.key)} title={`Filter to ${group.key}`}>
                            <td>
                              <span className="bc-share">
                                <span>{group.key}</span>
                                <span className="bc-share__bar"><span style={{ width: `${totals.billed ? (group.billed / totals.billed) * 100 : 0}%` }} /></span>
                              </span>
                            </td>
                            <td>{group.students}</td>
                            <td>{formatPct(group.ateRate)}</td>
                            <td>{group.meals.toLocaleString("en-IN")}</td>
                            <td>
                              <span className="bc-att" data-low={group.attendance !== null && group.attendance < 40 ? "" : undefined}>{formatPct(group.attendance, 1)}</span>
                            </td>
                            <td>{group.rebateDays}</td>
                            <td>{formatCurrency(group.billed)}</td>
                            <td>{detail.feePeriod ? formatCurrency(group.paid) : "—"}</td>
                            <td>{detail.feePeriod ? group.dues : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>Total</td>
                          <td>{totals.students}</td>
                          <td>{formatPct(totals.ateRate)}</td>
                          <td>{totals.meals.toLocaleString("en-IN")}</td>
                          <td>{formatPct(totals.attendance, 1)}</td>
                          <td>{totals.rebateDays}</td>
                          <td>{formatCurrency(totals.billed)}</td>
                          <td>{detail.feePeriod ? formatCurrency(totals.paid) : "—"}</td>
                          <td>{detail.feePeriod ? totals.dues : "—"}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>

                <section className="bc-panel">
                  <div className="bc-panel__head">
                    <h3>
                      <Users size={16} /> Students <em>· {filtered.length}</em>
                    </h3>
                    <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!filtered.length}>
                      <Download size={16} /> Export CSV
                    </Button>
                  </div>
                  {filtered.length ? (
                    <DataTable data={filtered} columns={columns} getRowId={(row) => row.studentUserId} pagination pageSize={15} />
                  ) : (
                    <EmptyState icon={Users} title="No Students" message="No allocated students match these filters." />
                  )}
                  {detail.unallocatedMealStudents > 0 && (
                    <p className="bc-muted bc-note">{detail.unallocatedMealStudents} student(s) had verified meals without an allocation in this cycle — they aren’t billed here.</p>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </Page.Body>
    </Page>
  )
}

export default BillingCyclesPage
