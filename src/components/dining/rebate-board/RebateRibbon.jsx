import { ArrowLeft, ArrowRight } from "lucide-react"
import { STATES, days, isWeekend, keysIn, listKeys, periodText, rangeText, shortDate, spillOf, weekday } from "./rebateBoardHelpers"

const Spill = ({ side, segments, loose, tone }) => {
  const total = segments.reduce((sum, s) => sum + s.dayCount, 0) + loose
  if (!total) return null
  const where = [
    ...segments.map((s) => `in ${periodText(s.period)}${s.caterer ? ` (${s.caterer})` : ""}`),
    ...(loose ? [`${days(loose)} in no period`] : []),
  ].join(", ")
  return (
    <div className="rc-spill" data-side={side} data-tone={tone} title={`${days(total)} ${where}`}>
      <b>
        {side === "before" && <ArrowLeft size={12} aria-hidden="true" />}
        {days(total)}
        {side === "after" && <ArrowRight size={12} aria-hidden="true" />}
      </b>
      <span>{segments.length ? `in ${periodText(segments[0].period)}` : "in no period"}</span>
    </div>
  )
}

/**
 * Every day of the period as a cell, the rebate's days lit. Days of the
 * rebate in other periods show as arrows on either side, so a rebate that runs
 * across periods reads at a glance. Without a period (the "outside" view) the
 * ribbon spans the rebate itself.
 */
const RebateRibbon = ({ period, startKey, endKey, dateKeys, state = "approved", placements, today }) => {
  const keys = dateKeys?.length ? dateKeys : listKeys(startKey, endKey)
  const frame = period || (startKey ? { startDate: startKey, endDate: endKey } : null)
  if (!frame) return null
  const all = listKeys(frame.startDate, frame.endDate)
  const on = new Set(keys)
  const inside = period ? keysIn(keys, period).length : keys.length
  const spill = period ? spillOf({ dateKeys: keys }, period, placements) : { before: [], after: [], before0: 0, after0: 0 }
  const dense = all.length > 45
  const tone = STATES[state]?.tone || "ok"

  return (
    <div className="rc-ribbon" data-tone={tone}>
      <div className="rc-ribbon__cap">
        <span>
          <b>{rangeText(keys[0], keys[keys.length - 1])}</b> · {days(keys.length)}
        </span>
        <span>
          {!period
            ? "Not in any dining period yet"
            : inside === keys.length
              ? `All in this period (${periodText(period)})`
              : `${inside} of ${days(keys.length)} in this period (${periodText(period)})`}
        </span>
      </div>
      <div className="rc-ribbon__row">
        <Spill side="before" segments={spill.before} loose={spill.before0} tone={tone} />
        <div className="rc-days" style={{ "--n": all.length }} role="img" aria-label={`${days(inside)} of ${days(all.length)} marked`}>
          {all.map((key, index) => {
            const month = index === 0 || key.endsWith("-01")
            return month ? (
              <span key={`m${key}`} className="rc-month" style={{ gridColumn: index + 1 }}>
                {shortDate(key).split(" ")[1]}
              </span>
            ) : null
          })}
          {all.map((key, index) => (
            <span
              key={key}
              className="rc-day"
              style={{ gridColumn: index + 1 }}
              title={shortDate(key)}
              data-on={on.has(key) || undefined}
              data-state={state}
              data-weekend={isWeekend(key) || undefined}
              data-today={key === today || undefined}
            />
          ))}
          {all.map((key, index) => {
            const major = index === 0 || weekday(key) === 1
            return !dense || major ? (
              <span key={`n${key}`} className="rc-daynum" style={{ gridColumn: index + 1 }} data-on={on.has(key) || undefined} data-minor={!major || undefined}>
                {Number(key.slice(8))}
              </span>
            ) : null
          })}
        </div>
        <Spill side="after" segments={spill.after} loose={spill.after0} tone={tone} />
      </div>
      <div className="rc-legend" aria-hidden="true">
        <span>
          <i data-tone={tone} />
          Rebate day ({STATES[state]?.label.toLowerCase()})
        </span>
        <span>
          <i data-tone="none" />
          Weekend shaded
        </span>
        {today >= frame.startDate && today <= frame.endDate && (
          <span>
            <i data-today />
            Today
          </span>
        )}
      </div>
    </div>
  )
}

export default RebateRibbon
