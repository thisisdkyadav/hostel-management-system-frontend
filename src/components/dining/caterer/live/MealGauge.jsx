import { Keyboard, ScanFace, TriangleAlert, UserRoundCheck, UsersRound } from "lucide-react"
import { Skeleton } from "hzero"
import { percent } from "../catererHelpers"

// The ring is 270 degrees of a circle; pathLength=100 lets dash lengths read as percentages of that arc.
const ARC = 75

const Stat = ({ icon, label, tone, children }) => (
  <div className="lf-stat" data-tone={tone}>
    <span className="lf-stat-label">{icon}{label}</span>
    <span className="lf-stat-value">{children}</span>
  </div>
)

/** Verified out of expected for the meal being served, with the numbers that sit beside it. */
const MealGauge = ({ summary, error, onRetry }) => {
  if (!summary) {
    return (
      <section className="lf-gauge lf-panel" aria-label="Meal progress">
        {error ? (
          <div className="lf-empty" role="alert">
            <p className="lf-empty-title">Could not load the count</p>
            <button type="button" className="lf-link" onClick={onRetry}>Try again</button>
          </div>
        ) : (
          <Skeleton variant="rounded" height="100%" />
        )}
      </section>
    )
  }

  const verified = summary.verifiedCount ?? 0
  const expected = summary.expectedCount ?? 0
  const pct = percent(verified, expected)
  const fill = expected > 0 ? Math.min(1, verified / expected) : 0

  return (
    <section className="lf-gauge lf-panel" aria-label="Meal progress">
      <div className="lf-ring" role="img" aria-label={`${verified} of ${expected} expected students verified, ${pct} percent`}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle className="lf-ring-track" cx="100" cy="100" r="84" pathLength="100" strokeDasharray={`${ARC} 100`} transform="rotate(135 100 100)" />
          <circle className="lf-ring-fill" data-empty={fill === 0 || undefined} cx="100" cy="100" r="84" pathLength="100" strokeDasharray={`${ARC * fill} 100`} transform="rotate(135 100 100)" />
        </svg>
        <div className="lf-ring-center">
          <span className="lf-ring-number">{verified}</span>
          <span className="lf-ring-of">of {expected} expected</span>
        </div>
        <span className="lf-ring-pct">{pct}%</span>
      </div>

      <div className="lf-stats">
        <Stat icon={<UsersRound size={16} aria-hidden="true" />} label="Still to come">{summary.pendingCount ?? 0}</Stat>
        <Stat icon={<TriangleAlert size={16} aria-hidden="true" />} label="Issues" tone={summary.issueCount > 0 ? "danger" : undefined}>{summary.issueCount ?? 0}</Stat>
        <Stat icon={<UserRoundCheck size={16} aria-hidden="true" />} label="On rebate">{summary.onRebateCount ?? 0}</Stat>
        <div className="lf-stat">
          <span className="lf-stat-label">Scan type</span>
          <span className="lf-split">
            <span className="lf-split-item" title="Face scan"><ScanFace size={18} aria-hidden="true" />{summary.faceCount ?? 0}<span className="lf-sr">by face</span></span>
            <span className="lf-split-item" title="Manual"><Keyboard size={18} aria-hidden="true" />{summary.manualCount ?? 0}<span className="lf-sr">manual</span></span>
          </span>
        </div>
      </div>
    </section>
  )
}

export default MealGauge
