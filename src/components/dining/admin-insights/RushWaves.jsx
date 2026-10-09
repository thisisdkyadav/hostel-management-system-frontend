import { useLayoutEffect, useRef, useState } from "react"
import { ToggleButtonGroup } from "hzero"
import InsightCard, { PanelMessage } from "./InsightCard"
import { fmtInt, friendlyTime, mealVars, monotonePath, RANGE_OPTIONS, slotName } from "./insightHelpers"

const PAD_TOP = 46
const PAD_BOTTOM = 26
const PAD_X = 12

const useSize = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((prev) => (prev.width === Math.round(width) && prev.height === Math.round(height) ? prev : { width: Math.round(width), height: Math.round(height) }))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, size]
}

/** Every meal's arrivals on one shared clock: a skyline of the day's appetite. Taller means more people at once. */
const Skyline = ({ peaks, palette, mealSlots, nowMin }) => {
  const [ref, { width, height }] = useSize()
  const withData = peaks.filter((p) => (p.buckets || []).length)
  const minX = Math.min(...withData.map((p) => p.buckets[0].minute))
  const maxX = Math.max(...withData.map((p) => p.buckets[p.buckets.length - 1].minute + (p.bucketMinutes || 5)))
  const maxY = Math.max(1, ...withData.flatMap((p) => p.buckets.map((b) => b.avgScans || 0)))
  const ready = width > 0 && height > 0
  const plotW = Math.max(1, width - PAD_X * 2)
  const baseY = height - PAD_BOTTOM
  const x = (minute) => PAD_X + ((minute - minX) / Math.max(1, maxX - minX)) * plotW
  const y = (value) => baseY - (value / maxY) * Math.max(1, baseY - PAD_TOP)

  const hours = []
  for (let h = Math.ceil(minX / 60); h * 60 <= maxX; h += 1) if (h % 2 === 0) hours.push(h * 60)

  return (
    <div className="dxi-skyline" ref={ref}>
      {ready && (
        <svg width={width} height={height} role="img" aria-label="Average arrivals through the day for each meal">
          <defs>
            {withData.map((p) => (
              <linearGradient key={p.mealSlotKey} id={`dxi-wave-${p.mealSlotKey}`} x1="0" y1="0" x2="0" y2="1" style={mealVars(palette, p.mealSlotKey)}>
                <stop offset="0%" className="dxi-wave-stop-top" />
                <stop offset="100%" className="dxi-wave-stop-bottom" />
              </linearGradient>
            ))}
          </defs>

          {hours.map((minute) => (
            <g key={minute} className="dxi-skyline-hour">
              <line x1={x(minute)} x2={x(minute)} y1={PAD_TOP - 8} y2={baseY} />
              <text x={x(minute)} y={height - 8} textAnchor="middle">{friendlyTime(minute)}</text>
            </g>
          ))}
          <line className="dxi-skyline-base" x1={PAD_X} x2={width - PAD_X} y1={baseY} y2={baseY} />

          {withData.map((p, index) => {
            const step = p.bucketMinutes || 5
            const pts = p.buckets.map((b) => [x(b.minute + step / 2), y(b.avgScans || 0)])
            const line = monotonePath([[x(p.buckets[0].minute), baseY], ...pts, [x(p.buckets[p.buckets.length - 1].minute + step), baseY]])
            const area = `${line} Z`
            const peakBucket = p.buckets.find((b) => b.minute === p.peakMinute) || p.buckets.reduce((a, b) => ((b.avgScans || 0) > (a.avgScans || 0) ? b : a))
            const px = x(peakBucket.minute + step / 2)
            const py = y(peakBucket.avgScans || 0)
            return (
              <g key={p.mealSlotKey} className="dxi-wave" style={{ ...mealVars(palette, p.mealSlotKey), "--i": index }}>
                <title>{`${slotName(mealSlots, p.mealSlotKey)}: busiest around ${friendlyTime(p.peakMinute)}`}</title>
                <path className="dxi-wave-area" d={area} fill={`url(#dxi-wave-${p.mealSlotKey})`} />
                <path className="dxi-wave-line" d={line} pathLength="1" />
                {p.p10Minute !== null && p.p90Minute !== null && (
                  <line className="dxi-wave-band" x1={x(p.p10Minute)} x2={x(p.p90Minute)} y1={baseY} y2={baseY} />
                )}
                <circle className="dxi-wave-peak-halo" cx={px} cy={py} r="9" />
                <circle className="dxi-wave-peak" cx={px} cy={py} r="4.5" />
                <text className="dxi-wave-name" x={px} y={py - 26} textAnchor="middle">{slotName(mealSlots, p.mealSlotKey)}</text>
                <text className="dxi-wave-time" x={px} y={py - 12} textAnchor="middle">{friendlyTime(p.peakMinute)}</text>
              </g>
            )
          })}

          {nowMin >= minX && nowMin <= maxX && (
            <g className="dxi-skyline-now">
              <line x1={x(nowMin)} x2={x(nowMin)} y1={PAD_TOP} y2={baseY} />
              <text x={x(nowMin) + 5} y={baseY - 6}>Now</text>
            </g>
          )}
        </svg>
      )}
    </div>
  )
}

/** When does the rush hit? One shared timeline, a wave per meal, the busiest moment called out. */
const RushWaves = ({ data, palette, nowMin, loading, days, onDaysChange }) => {
  const peaks = (data?.peaks || []).filter((p) => (p.buckets || []).some((b) => b.avgScans > 0))
  const mealSlots = data?.mealSlots || []

  return (
    <InsightCard
      className="dxi-rush"
      title="When the rush hits"
      caption={`Average day over the last ${days} days`}
      loading={loading}
      actions={<ToggleButtonGroup options={RANGE_OPTIONS} value={days} onChange={onDaysChange} size="small" aria-label="How many days to look back" />}
    >
      {peaks.length === 0 ? (
        <PanelMessage title="No meals scanned yet" text="Once students start scanning in, their arrival waves appear here." />
      ) : (
        <div className="dxi-rush-inner">
          <Skyline peaks={peaks} palette={palette} mealSlots={mealSlots} nowMin={nowMin} />
          <ul className="dxi-rush-legend">
            {peaks.map((p) => (
              <li key={p.mealSlotKey} style={mealVars(palette, p.mealSlotKey)}>
                <span className="dxi-rush-legend-name">{slotName(mealSlots, p.mealSlotKey)}</span>
                <span className="dxi-rush-legend-text" title={`About ${fmtInt(p.avgDailyVerified)} students a day`}>
                  most come {friendlyTime(p.p10Minute)} – {friendlyTime(p.p90Minute)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </InsightCard>
  )
}

export default RushWaves
