import { Link } from "react-router-dom"
import { Skeleton } from "hzero"
import { CalendarClock, ClipboardList, Plane, Users, UtensilsCrossed } from "lucide-react"
import { pluralize } from "../catererHelpers"

const Stat = ({ icon, label, value, loading }) => (
  <div className="cdb-stat">
    <span className="cdb-stat-icon" aria-hidden="true">{icon}</span>
    <span className="cdb-stat-text">
      <span className="cdb-stat-label">{label}</span>
      {loading ? <Skeleton variant="text" width="3rem" /> : <span className="cdb-stat-value">{value}</span>}
    </span>
  </div>
)

/** One line of totals plus the two places the caterer is most likely to go next. */
const DashboardRibbon = ({ day, periodEndsIn, loadingDay, loadingPeriod }) => {
  const has = Boolean(day?.periodId)
  const periodText = periodEndsIn === null ? "No active period" : periodEndsIn < 0 ? "Ended" : periodEndsIn === 0 ? "Ends today" : `Ends in ${pluralize(periodEndsIn, "day")}`
  return (
    <section className="cdb-card cdb-ribbon" aria-label="Totals">
      <Stat icon={<Users size={18} />} label="Assigned students" value={has ? day.allocatedCount : "-"} loading={loadingDay} />
      <Stat icon={<Plane size={18} />} label="On rebate today" value={has ? day.onRebateCount : "-"} loading={loadingDay} />
      <Stat icon={<CalendarClock size={18} />} label="Dining period" value={periodText} loading={loadingPeriod} />
      <nav className="cdb-ribbon-links" aria-label="Quick links">
        <Link to="/caterer/meal-records" className="cdb-quick"><ClipboardList size={16} aria-hidden="true" />Meal records</Link>
        <Link to="/caterer/rebates" className="cdb-quick"><UtensilsCrossed size={16} aria-hidden="true" />Rebates</Link>
      </nav>
    </section>
  )
}

export default DashboardRibbon
