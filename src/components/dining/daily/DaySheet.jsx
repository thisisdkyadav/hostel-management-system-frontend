import { percent } from "../caterer/catererHelpers"
import { catererColor } from "../caterer/diningScope"
import { turnoutTone } from "./dailyMealsHelpers"

const MealCell = ({ meal, slot }) => {
  if (slot.state === "upcoming") return <span className="dm-meal dm-meal--later">Later</span>
  const pct = percent(meal.verifiedCount, meal.verifiedCount + (meal.notEatenCount || 0))
  if (slot.state === "serving") {
    return (
      <span className="dm-meal" data-tone="live">
        <span className="dm-meal__count"><strong>{meal.verifiedCount}</strong> so far</span>
        <span className="dm-meal__sub"><span className="dm-live-dot" aria-hidden="true" />{meal.notEatenCount} not yet</span>
      </span>
    )
  }
  return (
    <span className="dm-meal" data-tone={turnoutTone(meal.verifiedCount, meal.verifiedCount + meal.notEatenCount)}>
      <span className="dm-meal__count"><strong>{meal.verifiedCount}</strong> ate</span>
      <span className="dm-meal__bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
      <span className="dm-meal__sub">{meal.notEatenCount} didn&apos;t · {pct}%</span>
    </span>
  )
}

const Row = ({ row, slots, palette, onPick, total = false }) => {
  const name = total ? "All caterers" : row.name
  return (
    <tr className={total ? "dm-sheet__total" : undefined}>
      <th scope="row">
        {total || !onPick ? (
          <span className="dm-sheet__name" style={total ? undefined : { "--kitchen": catererColor(palette, row.id) }}>
            {!total && <span className="dm-sheet__dot" aria-hidden="true" />}
            {name}
          </span>
        ) : (
          <button type="button" className="dm-sheet__name dm-sheet__pick" style={{ "--kitchen": catererColor(palette, row.id) }} onClick={() => onPick(row.id)} title={`Show only ${row.name}`}>
            <span className="dm-sheet__dot" aria-hidden="true" />
            {name}
          </button>
        )}
      </th>
      <td className="dm-num">{row.allocatedCount}</td>
      <td className="dm-num">{row.onRebateCount}</td>
      <td className="dm-num dm-num--strong">{row.expectedCount}</td>
      {slots.map((slot) => (
        <td key={slot.key}>
          <MealCell meal={row.meals[slot.key]} slot={slot} />
        </td>
      ))}
      <td className="dm-num">
        {row.ateNothingCount === null ? (
          <span className="dm-muted">-</span>
        ) : (
          <span data-alert={row.ateNothingCount > 0 || undefined}>{row.ateNothingCount}</span>
        )}
      </td>
      <td className="dm-num">{row.issueCount > 0 ? <span data-alert>{row.issueCount}</span> : <span className="dm-muted">0</span>}</td>
    </tr>
  )
}

/** One row per caterer for the day, with a total. Meals read "ate / didn't" so the gap is obvious. */
const DaySheet = ({ report, palette, onPick }) => {
  const slots = report.mealSlots
  const rows = report.caterers
  return (
    <div className="dm-sheet-wrap">
      <table className="dm-sheet">
        <thead>
          <tr>
            <th scope="col">Caterer</th>
            <th scope="col" className="dm-num">Assigned</th>
            <th scope="col" className="dm-num">Away</th>
            <th scope="col" className="dm-num">Should eat</th>
            {slots.map((slot) => (
              <th scope="col" key={slot.key}>
                {slot.name}
                <span className="dm-sheet__time">{slot.startTime}–{slot.endTime}</span>
              </th>
            ))}
            <th scope="col" className="dm-num">Ate nothing</th>
            <th scope="col" className="dm-num">Scanner issues</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row key={row.id} row={row} slots={slots} palette={palette} onPick={onPick} />
          ))}
        </tbody>
        {rows.length > 1 && (
          <tfoot>
            <Row row={report.totals} slots={slots} total />
          </tfoot>
        )}
      </table>
    </div>
  )
}

export default DaySheet
