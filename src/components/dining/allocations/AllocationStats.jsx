import { Button, StatTile } from "hzero"
import { ReceiptText } from "lucide-react"
import { autoAllocationLabel, choiceWindowLabel, formatCurrency, formatPct, startsInLabel } from "./allocationHelpers"
import "./Allocations.css"

const seatsNote = (summary) => (summary.capacity > 0 ? `${Math.round((summary.allocated / summary.capacity) * 100)}% of seats` : "No seats set")

/** A tile you can press: the figure is the same StatTile, wrapped so it is a real button. */
const ActionTile = ({ onClick, label, ...tile }) => (
  <button type="button" className="al-kpi-button" onClick={onClick} aria-label={`${label}: show these students`}>
    <StatTile label={label} {...tile} />
  </button>
)

const currentTiles = (summary, { onQuick }) => {
  const expected = Math.max(0, summary.allocated - summary.onRebateToday)
  return (
    <>
      <StatTile label="Allocated" value={`${summary.allocated} / ${summary.capacity}`} tone="primary" note={seatsNote(summary)} />
      <StatTile label="Eating today" value={summary.ateToday} tone="success" note={`of ${expected} expected`} />
      <StatTile label="On rebate today" value={summary.onRebateToday} tone={summary.onRebateToday ? "warning" : "neutral"} note={summary.pendingRebates ? `${summary.pendingRebates} pending` : "None pending"} />
      <StatTile label="Attendance so far" value={formatPct(summary.attendance)} tone="info" note={`${summary.meals} meals served`} />
      <ActionTile
        label="Never scanned"
        value={summary.neverAte}
        tone={summary.neverAte ? "danger" : "neutral"}
        note={summary.neverAte ? "Tap to list them" : "Everyone has eaten"}
        onClick={() => onQuick("never")}
      />
      <StatTile label="Billed so far" value={formatCurrency(summary.billedAmount)} tone="primary" note={`about ${formatCurrency(summary.projectedAmount)} by period end`} />
    </>
  )
}

const pastTiles = (summary, { oversight, onOpenCycle, onQuick }) => (
  <>
    <StatTile label="Allocated" value={`${summary.allocated} / ${summary.capacity}`} tone="primary" note={seatsNote(summary)} />
    <StatTile label="Attendance" value={formatPct(summary.attendance)} tone="info" />
    <StatTile label="Meals served" value={summary.meals} />
    <StatTile label="Rebate days" value={summary.rebateDays} tone={summary.rebateDays ? "warning" : "neutral"} />
    <StatTile label="Billed" value={formatCurrency(summary.billedAmount)} tone="primary" note={`${summary.billedDays} billable days`} />
    {oversight && summary.fee && (
      <ActionTile
        label="In dues"
        value={summary.fee.dues}
        tone={summary.fee.dues ? "danger" : "success"}
        note={summary.fee.dues ? `${formatCurrency(summary.fee.duesAmount)} owed` : "Everyone has cleared"}
        onClick={() => onQuick("dues")}
      />
    )}
    {oversight && (
      <div className="al-kpi-action">
        <Button variant="secondary" size="sm" onClick={onOpenCycle}>
          <ReceiptText size={16} /> Open billing cycle
        </Button>
      </div>
    )}
  </>
)

const upcomingTiles = (summary, { period, oversight, today }) => {
  const window = choiceWindowLabel(period)
  const starts = startsInLabel(period, today)
  const auto = autoAllocationLabel(period)
  return (
    <>
      <StatTile label="Seats filled" value={`${summary.allocated} / ${summary.capacity}`} tone="primary" note={seatsNote(summary)} />
      {oversight && <StatTile label="Not chosen yet" value={summary.notChosen ?? 0} tone={summary.notChosen ? "warning" : "success"} note={period.eligible ? `of ${period.eligible} eligible` : undefined} />}
      <StatTile label="Choice window" value={window.value} tone="info" note={window.note} />
      {auto && <StatTile label="Auto-allocation" value={auto.value} tone={auto.tone} note={auto.note} />}
      <StatTile label="Starts in" value={starts.value} note={starts.note} />
      <StatTile label="Projected bill" value={formatCurrency(summary.projectedAmount)} tone="primary" note={`at ${formatCurrency(period.dailyRate)} a day`} />
    </>
  )
}

/** The phase-aware figures row. */
const AllocationStats = ({ period, summary, oversight, today, onQuick, onOpenCycle }) => {
  const props = { period, oversight, today, onQuick, onOpenCycle }
  return (
    <section className="al-kpis" aria-label="Period summary">
      {period.phase === "current" && currentTiles(summary, props)}
      {period.phase === "past" && pastTiles(summary, props)}
      {period.phase === "upcoming" && upcomingTiles(summary, props)}
      {summary.unregisteredCount > 0 && (
        <StatTile label="Unregistered" value={summary.unregisteredCount} tone="warning" note="Auto-allocated, no rebates" />
      )}
    </section>
  )
}

export default AllocationStats
