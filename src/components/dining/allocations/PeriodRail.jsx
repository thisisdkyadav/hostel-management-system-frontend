import { useEffect, useRef } from "react"
import { Switch } from "hzero"
import { Wand2 } from "lucide-react"
import CapacityBar from "../CapacityBar"
import { PHASE_META, autoAllocationPending, periodRange } from "./allocationHelpers"
import "./Allocations.css"

/** Seats to show on a tile: the picked kitchen's, or the whole period's. */
const seatsFor = (period, catererId) => {
  if (catererId) {
    const seat = (period.caterers || []).find((item) => item.id === catererId)
    if (seat) return { allocated: seat.allocated, capacity: seat.capacity }
  }
  return { allocated: period.allocated, capacity: period.capacity }
}

const PeriodTile = ({ period, active, catererId, onSelect, tileRef }) => {
  const meta = PHASE_META[period.phase] || PHASE_META.past
  const seats = seatsFor(period, catererId)
  const autoHint = period.phase === "upcoming" ? autoAllocationPending(period) : ""
  const progress = period.totalDays ? Math.min(100, (period.elapsedDays / period.totalDays) * 100) : 0
  return (
    <button
      ref={tileRef}
      type="button"
      className="al-tile"
      data-phase={period.phase}
      data-archived={period.isArchived || undefined}
      aria-pressed={active}
      onClick={() => onSelect(period.id)}
    >
      <span className="al-tile__top">
        <span className="al-tile__dot" aria-hidden="true" />
        <span className="al-tile__phase">{meta.label}</span>
        {autoHint && (
          <span className="al-tile__auto" title={autoHint} role="img" aria-label={autoHint}>
            <Wand2 size={12} aria-hidden="true" />
          </span>
        )}
        {period.isArchived && <span className="al-tile__archived">Archived</span>}
      </span>
      <span className="al-tile__range">{periodRange(period.startDate, period.endDate)}</span>
      <span className="al-tile__seats">
        <CapacityBar allocated={seats.allocated} total={seats.capacity} size="sm" label="Seats" />
      </span>
      {period.phase === "current" && (
        <span className="al-tile__day">
          <span>
            Day {Math.min(period.elapsedDays, period.totalDays)} of {period.totalDays}
          </span>
          <span className="al-tile__progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </span>
        </span>
      )}
    </button>
  )
}

/** Horizontally scrolling period picker. The active tile is centred when the selection changes. */
const PeriodRail = ({ periods, selectedId, catererId, onSelect, archivedCount, showArchived, onToggleArchived }) => {
  const railRef = useRef(null)
  const activeRef = useRef(null)

  useEffect(() => {
    const rail = railRef.current
    const tile = activeRef.current
    if (!rail || !tile) return
    const left = tile.offsetLeft - (rail.clientWidth - tile.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, left) })
  }, [selectedId, periods.length])

  return (
    <section className="al-rail-wrap" aria-label="Dining periods">
      <div className="al-rail" ref={railRef}>
        {periods.map((period) => (
          <PeriodTile
            key={period.id}
            period={period}
            active={period.id === selectedId}
            catererId={catererId}
            onSelect={onSelect}
            tileRef={period.id === selectedId ? activeRef : undefined}
          />
        ))}
      </div>
      {archivedCount > 0 && (
        <div className="al-rail-wrap__foot">
          <Switch
            size="small"
            checked={showArchived}
            onChange={(event) => onToggleArchived(event.target.checked)}
            label={`Show archived (${archivedCount})`}
          />
        </div>
      )}
    </section>
  )
}

export default PeriodRail
