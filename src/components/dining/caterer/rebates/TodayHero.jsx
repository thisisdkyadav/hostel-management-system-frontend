import { Card, Heading, Skeleton, Text, Tooltip } from "hzero"
import { Clock, LogIn, LogOut } from "lucide-react"
import { pluralize } from "../catererHelpers"
import "./Rebates.css"

const Chip = ({ icon, children, tabIndex }) => (
  <span className="reb-chip" tabIndex={tabIndex}>
    {icon}
    {children}
  </span>
)

/** Expected diners vs students away: two segments, 2px apart, labelled directly. */
const SplitBar = ({ expected, away }) => (
  <div className="reb-split">
    <div className="reb-split-bar" role="img" aria-label={`${expected} expected, ${away} away`}>
      {expected > 0 && <span className="reb-seg" data-kind="expected" style={{ flex: `${expected} 1 0` }} />}
      {away > 0 && <span className="reb-seg" data-kind="away" style={{ flex: `${away} 1 0` }} />}
    </div>
    <div className="reb-split-labels">
      <span className="reb-key"><span className="reb-swatch" data-kind="expected" />Expected {expected}</span>
      <span className="reb-key"><span className="reb-swatch" data-kind="away" />Away {away}</span>
    </div>
  </div>
)

const TodayHero = ({ day, tomorrow, loading }) => {
  if (loading) {
    return (
      <Card>
        <Skeleton variant="text" width="45%" height="2rem" />
        <Skeleton variant="text" width="30%" />
      </Card>
    )
  }

  if (!day || !day.periodId) {
    return (
      <Card>
        <Heading as="h2" size="3xl" weight="bold" color="heading" style={{ margin: 0 }}>No service today</Heading>
        <Text color="muted" style={{ margin: "var(--spacing-2) 0 0" }}>
          You have no active dining period today, so there is nothing to cook for.
        </Text>
      </Card>
    )
  }

  const away = day.onRebateCount
  const leavingTomorrow = tomorrow?.periodId ? tomorrow.startingCount : 0
  const chips = []
  if (day.returningCount > 0) chips.push(<Chip key="back" icon={<LogIn size={14} aria-hidden="true" />}>{day.returningCount} back today</Chip>)
  if (leavingTomorrow > 0) {
    chips.push(<Chip key="leave" icon={<LogOut size={14} aria-hidden="true" />}>{leavingTomorrow} {leavingTomorrow === 1 ? "leaves" : "leave"} tomorrow</Chip>)
  }
  if (day.pendingCount > 0) {
    chips.push(
      <Tooltip key="pending" content="May be away if approved">
        <Chip icon={<Clock size={14} aria-hidden="true" />} tabIndex={0}>{pluralize(day.pendingCount, "pending request")}</Chip>
      </Tooltip>,
    )
  }

  return (
    <Card>
      <div className="reb-hero">
        <div className="reb-hero-main">
          <Heading as="h2" size="3xl" weight="bold" color="heading" style={{ margin: 0 }}>
            {away === 0 ? "Everyone's in today" : `${pluralize(away, "student")} away today`}
          </Heading>
          <Text color="body" style={{ margin: "var(--spacing-1) 0 0" }}>
            Cook for {day.expectedCount} of {day.allocatedCount} allocated students
          </Text>
          <div className="reb-chips">
            {chips.length > 0 ? chips : <span className="reb-chip">No one leaving or returning around today</span>}
          </div>
        </div>
        <SplitBar expected={day.expectedCount} away={away} />
      </div>
    </Card>
  )
}

export default TodayHero
