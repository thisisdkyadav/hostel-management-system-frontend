import { Moon, Wifi, WifiOff } from "lucide-react"
import { percent } from "../catererHelpers"
import MealGauge from "./MealGauge"
import RushMeter from "./RushMeter"
import Spotlight from "./Spotlight"
import { formatSpan, formatWindow, useNow } from "./liveHelpers"

const ConnectionPill = ({ connected }) => (
  <span className="lf-conn" data-connected={connected || undefined} role="status">
    {connected ? <Wifi size={16} aria-hidden="true" /> : <WifiOff size={16} aria-hidden="true" />}
    {connected ? "Live" : "Reconnecting"}
  </span>
)

/** Ticks every second on its own, so only the clock re-renders. */
const LiveClock = () => {
  const now = useNow(1000)
  const date = new Date(now)
  const hm = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  const seconds = String(date.getSeconds()).padStart(2, "0")
  return (
    <time className="lf-clock" dateTime={date.toISOString()}>
      {hm}<span className="lf-clock-sec">{seconds}</span>
    </time>
  )
}

const ServingHeader = ({ meal, endsIn, connected }) => (
  <header className="lf-head lf-panel" data-live>
    <div className="lf-head-main">
      <span className="lf-kicker"><span className="lf-dot" aria-hidden="true" />Now serving</span>
      <h1 className="lf-meal-name">{meal.name}</h1>
      <p className="lf-meal-window">{formatWindow(meal)}</p>
    </div>
    <div className="lf-head-side">
      <LiveClock />
      <span className="lf-countdown">ends in {formatSpan(endsIn)}</span>
      <ConnectionPill connected={connected} />
    </div>
  </header>
)

const IdleHeader = ({ next, last, lastRecord, connected }) => {
  const summary = lastRecord?.summary
  return (
    <header className="lf-head lf-panel lf-head-idle">
      <div className="lf-head-main">
        <span className="lf-kicker"><Moon size={16} aria-hidden="true" />No meal right now</span>
        {next ? (
          <>
            <h1 className="lf-meal-name">{next.slot.name}</h1>
            <p className="lf-meal-window">{next.tomorrow ? "Tomorrow, " : ""}{formatWindow(next.slot)}</p>
            <p className="lf-countdown lf-countdown-big">starts in {formatSpan(next.minutes)}</p>
          </>
        ) : (
          <h1 className="lf-meal-name">No meals planned</h1>
        )}
      </div>
      <div className="lf-head-side">
        <LiveClock />
        <ConnectionPill connected={connected} />
      </div>
      {last && (
        <div className="lf-tally">
          <span className="lf-tally-title">Last meal: {last.slot.name}{last.yesterday ? " (yesterday)" : ""}</span>
          {summary ? (
            <span className="lf-tally-body">
              <strong>{summary.verifiedCount}</strong> of {summary.expectedCount} ate, {percent(summary.verifiedCount, summary.expectedCount)}%
              {summary.issueCount > 0 && <span className="lf-tally-issues">{summary.issueCount} {summary.issueCount === 1 ? "issue" : "issues"}</span>}
            </span>
          ) : (
            <span className="lf-tally-body lf-muted">Final count not available</span>
          )}
        </div>
      )}
    </header>
  )
}

/** Left side: which meal, how it is going, how busy it is, and who just walked in. */
const PulsePanel = ({ meals, connected, summary, summaryError, onRetrySummary, lastRecord, rush, spotlight, previewing, nowMs }) => {
  const idle = !meals.current
  return (
    <div className="lf-pulse">
      {idle ? (
        <IdleHeader next={meals.next} last={meals.last} lastRecord={lastRecord} connected={connected} />
      ) : (
        <>
          <ServingHeader meal={meals.current} endsIn={meals.endsIn} connected={connected} />
          <MealGauge summary={summary} error={summaryError} onRetry={onRetrySummary} />
          <RushMeter rush={rush} />
        </>
      )}
      <Spotlight entry={spotlight} previewing={previewing} nowMs={nowMs} idle={idle} />
    </div>
  )
}

export default PulsePanel
