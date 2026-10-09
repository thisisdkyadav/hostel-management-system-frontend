import { useMemo } from "react"
import { smoothPath, RUSH_MINUTES } from "./liveHelpers"

const W = 300
const H = 64

/** Verified scans per minute over the last quarter hour: a small area chart plus the current rate and the peak. */
const RushMeter = ({ rush }) => {
  const { buckets, rate, peak } = rush
  const ceiling = Math.max(4, peak)
  const path = useMemo(() => smoothPath(buckets, W, H, ceiling), [buckets, ceiling])
  const step = W / (buckets.length - 1)

  return (
    <section className="lf-rush lf-panel" aria-label="Scan rate">
      <div className="lf-rush-numbers">
        <span className="lf-rush-label">Scan rate</span>
        <span className="lf-rush-rate"><strong>{rate}</strong><span>/min</span></span>
        <span className="lf-rush-peak">Peak {peak}/min</span>
      </div>
      <div className="lf-rush-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Scans per minute over the last ${RUSH_MINUTES} minutes. Now ${rate} per minute, peak ${peak}.`}>
          {[0.5, 1].map((f) => (
            <line key={f} className="lf-rush-grid" x1="0" x2={W} y1={H - H * f} y2={H - H * f} vectorEffect="non-scaling-stroke" />
          ))}
          <path className="lf-rush-area" d={path.area} />
          <path className="lf-rush-line" d={path.line} vectorEffect="non-scaling-stroke" />
          {buckets.map((count, i) => (
            <rect key={i} className="lf-rush-hit" x={Math.max(0, i * step - step / 2)} y="0" width={step} height={H}>
              <title>{`${RUSH_MINUTES - i - 1 === 0 ? "This minute" : `${RUSH_MINUTES - i - 1}m ago`}: ${count} scanned`}</title>
            </rect>
          ))}
        </svg>
        <div className="lf-rush-axis" aria-hidden="true"><span>{RUSH_MINUTES}m ago</span><span>now</span></div>
      </div>
    </section>
  )
}

export default RushMeter
