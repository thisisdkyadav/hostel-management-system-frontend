import { Link } from "react-router-dom"
import { Skeleton } from "hzero"
import { useMemo } from "react"
import { buildDayTrack, formatCountdown, mealRecordsLink, useElementWidth } from "./dashboardHelpers"
import PanelMessage from "./PanelMessage"

const subLabel = (segment) => {
  if (segment.state === "upcoming") return `in ${formatCountdown(segment.minutesUntil)}`
  if (segment.state === "serving") return `${segment.verified}/${segment.expected}`
  return segment.expected > 0 || segment.verified > 0 ? `${segment.verified}/${segment.expected}` : "No records"
}

const describe = (segment) => {
  const window = `${segment.startTime} to ${segment.endTime}`
  if (segment.state === "serving") return `${segment.name}, serving now, ${window}. ${subLabel(segment)}`
  if (segment.state === "ended") return `${segment.name}, ended, ${window}. ${subLabel(segment)}`
  return `${segment.name}, ${window}, starts ${subLabel(segment)}`
}

const Segment = ({ segment, today, periodId }) => {
  const style = { left: `${segment.left}%`, width: `${segment.width}%` }
  const inner = (
    <>
      <span className="cdb-slot-bar" aria-hidden="true">
        <span className="cdb-slot-fill" style={{ width: `${segment.fill * 100}%` }} />
      </span>
      <span className="cdb-slot-label">
        <span className="cdb-slot-name">{segment.name}</span>
        <span className="cdb-slot-sub">{subLabel(segment)}</span>
      </span>
    </>
  )

  if (segment.state === "upcoming") {
    return (
      <div className="cdb-slot" data-state="upcoming" data-row={segment.row} style={style} title={describe(segment)} role="group" aria-label={describe(segment)}>
        {inner}
      </div>
    )
  }
  return (
    <Link
      className="cdb-slot"
      data-state={segment.state}
      data-row={segment.row}
      style={style}
      to={mealRecordsLink({ periodId, date: today, meal: segment.key })}
      title={describe(segment)}
      aria-label={describe(segment)}
    >
      {inner}
    </Link>
  )
}

/** Today's meals on a clock: where each sits in the day, and how it went or when it starts. */
const DayTrack = ({ input, today, periodId, loading }) => {
  const [measureRef, laneWidth] = useElementWidth()
  const track = useMemo(() => (input ? buildDayTrack({ ...input, laneWidth }) : null), [input, laneWidth])
  // A zero-height probe with the lane's own margins, so the lane width is known before the lane is built.
  const probe = <div ref={measureRef} className="cdb-track-probe" aria-hidden="true" />

  if (loading) {
    return (
      <div className="cdb-track" aria-hidden="true">
        {probe}
        <Skeleton variant="rounded" height="4.5rem" />
      </div>
    )
  }
  if (!track) {
    return (
      <div className="cdb-track">
        {probe}
        <PanelMessage title="No meal times to show" />
      </div>
    )
  }

  return (
    <div className="cdb-track">
      {probe}
      <h3 className="cdb-track-title">Today's meals</h3>
      <div className="cdb-track-scale" aria-hidden="true">
        {track.ticks.map((tick) => (
          <span key={tick.label} className="cdb-tick" style={{ left: `${tick.at}%` }}>{tick.label}</span>
        ))}
      </div>
      <div className="cdb-track-lane" data-rows={track.rows}>
        <div className="cdb-track-rail" aria-hidden="true" />
        {track.segments.map((segment) => (
          <Segment key={segment.key} segment={segment} today={today} periodId={periodId} />
        ))}
        {track.nowPct !== null && (
          <span className="cdb-now" style={{ left: `${track.nowPct}%` }} role="img" aria-label="Current time" title="Now" />
        )}
      </div>
    </div>
  )
}

export default DayTrack
