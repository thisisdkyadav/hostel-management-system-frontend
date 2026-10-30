import { createPortal } from "react-dom"
import { DietLegend, ItemList } from "./MenuBits"
import {
  WEEKDAY_SHORT,
  buildBoard,
  formatFull,
  formatShort,
  formatWeekRange,
  mondayIndex,
  timeSpan,
  toKey,
  weekKeysFrom,
} from "./menuHelpers"

/**
 * A notice-board copy of the week, A4 landscape. It lives in a portal on <body> and is hidden on screen;
 * `@media print` hides everything else and shows only this.
 */
const PrintSheet = ({ days = [], weekStart, kitchenName }) => {
  if (typeof document === "undefined") return null
  const board = buildBoard(days)
  const keys = weekKeysFrom(weekStart)
  return createPortal(
    <div className="dm-print-root" aria-hidden="true">
      <header className="dm-print__head">
        <div>
          <h1>{kitchenName ? `${kitchenName} menu` : "Dining menu"}</h1>
          <p>Week of {formatWeekRange(weekStart)}</p>
        </div>
        <DietLegend />
      </header>
      <table className="dm-print__table">
        <thead>
          <tr>
            <th />
            {keys.map((key) => (
              <th key={key}>
                {WEEKDAY_SHORT[(mondayIndex(key) + 1) % 7]}
                <span>{formatShort(key)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {board.rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">
                {row.name}
                {timeSpan(row) && <span>{timeSpan(row)}</span>}
              </th>
              {keys.map((key) => {
                const cell = board.cell(key, row.key)
                return (
                  <td key={key}>
                    {!cell || cell.served === false ? (
                      <span className="dm-print__muted">{cell ? "Not served" : ""}</span>
                    ) : (
                      <>
                        <ItemList items={cell.items} dense />
                        {cell.note && <p>{cell.note}</p>}
                      </>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <footer className="dm-print__foot">
        Printed {formatFull(toKey(new Date()))}. Menu may change; check the notice board for updates.
      </footer>
    </div>,
    document.body,
  )
}

export default PrintSheet
