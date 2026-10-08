import { useMemo } from "react"
import { Tooltip } from "hzero"
import { pluralize } from "../catererHelpers"
import { buildArrivalCurve } from "./mealRecordsHelpers"
import "./MealRecords.css"

/** Histogram of first-verified times in 10-minute buckets across the meal window. */
const ArrivalCurve = ({ students, slot }) => {
  const curve = useMemo(() => buildArrivalCurve(students, slot), [students, slot])

  if (!curve || curve.total === 0) {
    return <p className="mr-curve__empty">Nobody has been verified in this meal yet.</p>
  }

  const { buckets, peak, max } = curve
  const peakCenter = ((peak.index + 0.5) / buckets.length) * 100
  const peakAlign = peakCenter < 22 ? "start" : peakCenter > 78 ? "end" : "center"
  const summary = `Arrivals from ${curve.startLabel} to ${curve.endLabel}. Rush ${peak.label}, ${pluralize(peak.count, "student")}.`

  return (
    <div className="mr-curve">
      <div className="mr-curve__plot" role="img" aria-label={summary}>
        <div
          className="mr-curve__rush"
          data-align={peakAlign}
          style={{ "--mr-peak-x": `${peakCenter}%` }}
        >
          Rush {peak.label}
        </div>
        <div className="mr-curve__bars">
          {buckets.map((bucket) => (
            <Tooltip key={bucket.index} content={`${bucket.label}: ${pluralize(bucket.count, "student")}`} placement="top" delay={100}>
              <div className="mr-curve__col" data-peak={bucket === peak || undefined} data-empty={bucket.count === 0 || undefined}>
                <span
                  className="mr-curve__bar"
                  style={{ height: bucket.count === 0 ? undefined : `${Math.max(4, (bucket.count / max) * 100)}%` }}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="mr-curve__axis" aria-hidden="true">
        <span>{curve.startLabel}</span>
        <span>{curve.endLabel}</span>
      </div>
    </div>
  )
}

export default ArrivalCurve
