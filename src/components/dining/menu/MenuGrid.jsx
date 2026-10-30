import { Lock } from "lucide-react"
import { ItemList } from "./MenuBits"
import { mealVarsFor, timeSpan } from "./menuHelpers"

const sourceBadge = (cell) => {
  if (cell.source !== "date") return null
  return cell.changed
    ? { label: "Changed", title: "Different from the weekly menu for this day" }
    : { label: "Day-specific", title: "Special for this day" }
}

/** What goes inside one cell: dishes, note, or the quiet reason there are none. */
const CellBody = ({ cell, row, selectable, showName, showTime }) => {
  if (!cell) return <span className="dm-cell__empty">–</span>
  if (cell.served === false) return <span className="dm-cell__closed">Not served</span>
  const badge = sourceBadge(cell)
  const hasItems = cell.items?.length > 0
  const ownTime = timeSpan(cell)
  const rowTime = timeSpan(row)
  return (
    <>
      {(showName || badge) && (
        <span className="dm-cell__top">
          {showName && <span className="dm-cell__meal">{row.name}</span>}
          {badge && (
            <span className="dm-cell__badge" title={badge.title}>
              {badge.label}
            </span>
          )}
        </span>
      )}
      {showTime && ownTime && (showName || ownTime !== rowTime) && <span className="dm-cell__time">{ownTime}</span>}
      {hasItems ? (
        <ItemList items={cell.items} dense />
      ) : (
        <span className="dm-cell__empty">
          {cell.source === "date" ? "Nothing listed" : selectable && !cell.locked ? "Add dishes" : "Not listed"}
        </span>
      )}
      {cell.note && <p className="dm-cell__note">{cell.note}</p>}
    </>
  )
}

const Cell = ({ cell, row, col, selected, selectable, onClick, showName, showTime }) => {
  const interactive = selectable && cell && cell.served !== false
  const props = {
    className: "dm-cell",
    "data-selected": selected || undefined,
    "data-past": col.past || undefined,
    "data-today": col.today || undefined,
    "data-source": cell?.source === "date" ? (cell.changed ? "changed" : "date") : undefined,
    "data-closed": cell?.served === false || !cell ? true : undefined,
    "data-empty": cell && cell.served !== false && !cell.items?.length ? true : undefined,
  }
  const body = <CellBody cell={cell} row={row} selectable={selectable} showName={showName} showTime={showTime} />
  if (!interactive) return <div {...props}>{body}</div>
  return (
    <button type="button" {...props} aria-pressed={selected} aria-label={`${col.label} ${col.sub || ""}, ${row.name}`} onClick={onClick}>
      {body}
    </button>
  )
}

const ColHead = ({ col, selectable, onClick, stacked }) => {
  const content = (
    <>
      <span className="dm-colhead__day">{col.label}</span>
      <span className="dm-colhead__date">{col.sub}</span>
      {col.today && <span className="dm-colhead__today">Today</span>}
      {col.past && !col.today && <Lock size={11} className="dm-colhead__lock" aria-label="Past day, a record" />}
    </>
  )
  const props = {
    className: "dm-colhead",
    "data-today": col.today || undefined,
    "data-past": col.past || undefined,
    "data-stacked": stacked || undefined,
  }
  return selectable && !col.past ? (
    <button type="button" {...props} onClick={onClick} title="Select every meal of this day">
      {content}
    </button>
  ) : (
    <div {...props}>{content}</div>
  )
}

const RowHead = ({ row, palette, selectable, onClick }) => {
  const content = (
    <>
      <span className="dm-rowhead__name">
        <i aria-hidden="true" />
        {row.name}
      </span>
      {timeSpan(row) && <span className="dm-rowhead__time">{timeSpan(row)}</span>}
    </>
  )
  const props = { className: "dm-rowhead", style: mealVarsFor(palette, row.key) }
  return selectable ? (
    <button type="button" {...props} onClick={onClick} title="Select this meal for every open day">
      {content}
    </button>
  ) : (
    <div {...props}>{content}</div>
  )
}

/**
 * The meals × days grid. On wide screens it is a table-like grid with sticky meal labels; on phones it
 * stacks per day. It only draws: selection and data live in the parent.
 */
const MenuGrid = ({ cols, rows, getCell, palette, selectable = false, selected = [], onCell, onCol, onRow, narrow = false, ariaLabel }) => {
  const isSelected = (colId, rowKey) => selected.includes(`${colId}|${rowKey}`)

  if (narrow) {
    return (
      <div className="dm-days" aria-label={ariaLabel}>
        {cols.map((col) => (
          <section key={col.id} className="dm-daycard" data-today={col.today || undefined} data-past={col.past || undefined}>
            <ColHead col={col} stacked selectable={selectable} onClick={(event) => onCol?.(col.id, event)} />
            <div className="dm-daycard__meals">
              {rows.map((row) => (
                <div key={row.key} className="dm-daycard__row" style={mealVarsFor(palette, row.key)}>
                  <Cell
                    cell={getCell(col.id, row.key)}
                    row={row}
                    col={col}
                    selected={isSelected(col.id, row.key)}
                    selectable={selectable}
                    onClick={(event) => onCell?.(col.id, row.key, event)}
                    showName
                    showTime
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="dm-scroll">
      <div className="dm-grid" role="group" aria-label={ariaLabel} style={{ "--dm-rows": rows.length }}>
        <div className="dm-corner" />
        {cols.map((col) => (
          <ColHead key={col.id} col={col} selectable={selectable} onClick={(event) => onCol?.(col.id, event)} />
        ))}
        {rows.map((row) => (
          <div key={row.key} className="dm-row" style={mealVarsFor(palette, row.key)}>
            <RowHead row={row} palette={palette} selectable={selectable} onClick={(event) => onRow?.(row.key, event)} />
            {cols.map((col) => (
              <Cell
                key={col.id}
                cell={getCell(col.id, row.key)}
                row={row}
                col={col}
                selected={isSelected(col.id, row.key)}
                selectable={selectable}
                onClick={(event) => onCell?.(col.id, row.key, event)}
                showTime
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MenuGrid
