import { useCallback, useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Drawer, useToast } from "hzero"
import { MousePointerClick } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningMenuApi } from "@/service"
import CellEditor from "./CellEditor"
import MenuGrid from "./MenuGrid"
import { DietLegend } from "./MenuBits"
import useCellSelection from "./useCellSelection"
import useNarrow from "./useNarrow"
import {
  WEEKDAY_SHORT,
  buildBoard,
  cleanItems,
  formatLong,
  formatShort,
  getErrorMessage,
  mealPaletteFor,
  mealVarsFor,
  mondayIndex,
  parseCellId,
  sameItems,
  weekKeysFrom,
} from "./menuHelpers"

const PAST_NOTE = "Past days are a record and can't be changed."

const sourceLine = (cell) => {
  if (cell.source === "date") return cell.changed ? "Changed for this day only." : "Set for this day only."
  if (cell.source === "week") return cell.weekFrom ? `From the weekly menu, since ${formatShort(cell.weekFrom)}.` : "From the weekly menu."
  return "No menu has been set for this meal yet."
}

const groupByMeal = (cells) => {
  const groups = new Map()
  for (const { date, cell } of cells) {
    const group = groups.get(cell.name) || { name: cell.name, dates: [] }
    group.dates.push(date)
    groups.set(cell.name, group)
  }
  return [...groups.values()]
}

/**
 * The week as a meals × days board. Read-only by default (caterer, students); with `manage` the cells
 * select (click, Shift, Ctrl, or a day / meal header) and a side editor writes date-specific overrides.
 */
const WeekBoard = ({ days = [], weekStart, catererId, manage = false, today }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const narrow = useNarrow()

  const board = useMemo(() => buildBoard(days), [days])
  const palette = useMemo(() => mealPaletteFor(board.rows), [board.rows])
  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days])
  const cols = useMemo(
    () =>
      weekKeysFrom(weekStart).map((date) => {
        const day = byDate.get(date)
        return {
          id: date,
          label: WEEKDAY_SHORT[(mondayIndex(date) + 1) % 7],
          sub: formatShort(date),
          today: day ? Boolean(day.isToday) : date === today,
          past: day ? Boolean(day.isPast) : date < today,
        }
      }),
    [weekStart, byDate, today],
  )
  const colById = useMemo(() => new Map(cols.map((col) => [col.id, col])), [cols])

  const getCell = useCallback(
    (colId, rowKey) => {
      const meal = board.cell(colId, rowKey)
      if (!meal) return null
      return { ...meal, locked: Boolean(colById.get(colId)?.past) }
    },
    [board, colById],
  )

  const canView = useCallback(
    (id) => {
      const { date, key } = parseCellId(id)
      const cell = board.cell(date, key)
      return Boolean(cell) && cell.served !== false
    },
    [board],
  )
  const canPick = useCallback((id) => canView(id) && !colById.get(parseCellId(id).date)?.past, [canView, colById])

  const selection = useCellSelection({
    cols,
    rows: board.rows,
    canView,
    canPick,
    resetKey: `${catererId}|${weekStart}`,
  })

  const selectedCells = useMemo(
    () =>
      selection.selected
        .map((id) => {
          const { date, key } = parseCellId(id)
          const cell = board.cell(date, key)
          return cell ? { id, date, key, cell, past: Boolean(colById.get(date)?.past) } : null
        })
        .filter(Boolean),
    [selection.selected, board, colById],
  )
  const editable = selectedCells.filter((entry) => !entry.past)
  const viewOnly = selectedCells.length > 0 && editable.length === 0

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningMenu.all })

  const save = useMutation({
    mutationFn: ({ cells, value }) =>
      Promise.all(
        groupByMeal(cells).map((group) =>
          diningMenuApi.saveDates({
            catererId,
            dates: group.dates,
            meals: [{ name: group.name, items: cleanItems(value.items), note: value.note }],
          }),
        ),
      ),
    onSuccess: async (_data, { cells }) => {
      toast.success(cells.length === 1 ? "Menu saved for this day." : `Menu saved for ${cells.length} meals.`)
      await invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save the menu.")),
  })

  const reset = useMutation({
    mutationFn: ({ cells }) =>
      Promise.all(groupByMeal(cells).map((group) => diningMenuApi.deleteDates({ catererId, dates: group.dates, mealNames: [group.name] }))),
    onSuccess: async () => {
      toast.success("Back to the weekly menu.")
      await invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't reset that day.")),
  })

  const overridden = editable.filter((entry) => entry.cell.source === "date")

  const renderEditor = () => {
    if (!selectedCells.length) {
      return (
        <div className="dm-editor dm-editor--empty">
          <MousePointerClick size={24} aria-hidden="true" />
          <p>Pick a meal to change what is served on that day.</p>
          <ul>
            <li>
              <kbd>Shift</kbd> + click selects a range
            </li>
            <li>
              <kbd>Ctrl</kbd> + click adds single meals
            </li>
            <li>Click a day or a meal name to select the whole line</li>
          </ul>
          <p className="dm-editor__quiet">Changes here apply to those dates only. To change the usual weekly menu, use Weekly menu.</p>
        </div>
      )
    }
    const target = viewOnly ? selectedCells : editable
    const first = target[0]
    const mixed = target.some(
      (entry) => !sameItems(entry.cell.items, first.cell.items) || (entry.cell.note || "") !== (first.cell.note || ""),
    )
    const single = target.length === 1
    const dayCount = new Set(target.map((entry) => entry.date)).size
    const mealCount = new Set(target.map((entry) => entry.key)).size
    const signature = JSON.stringify([
      target.map((entry) => entry.id),
      target.map((entry) => [entry.cell.items, entry.cell.note, entry.cell.source]),
    ])
    return (
      <CellEditor
        key={signature}
        title={single ? `${formatLong(first.date)}` : `${target.length} meals selected`}
        hint={
          single
            ? `${first.cell.name} · ${sourceLine(first.cell)}`
            : `${dayCount} day${dayCount === 1 ? "" : "s"}, ${mealCount} meal${mealCount === 1 ? "" : "s"}. One edit applies to all of them.`
        }
        meal={single ? mealVarsFor(palette, first.key) : undefined}
        initial={{ items: first.cell.items || [], note: first.cell.note || "" }}
        mixed={mixed}
        readOnly={viewOnly || !manage}
        readOnlyNote={viewOnly ? PAST_NOTE : ""}
        saving={save.isPending}
        saveLabel={single ? "Save for this day" : `Save for ${target.length} meals`}
        onSave={(value) => save.mutate({ cells: target, value })}
        onClose={selection.clear}
        resetLabel="Back to weekly menu"
        canReset={overridden.length > 0}
        resetting={reset.isPending}
        onReset={() => reset.mutate({ cells: overridden })}
      />
    )
  }

  const grid = (
    <MenuGrid
      cols={cols}
      rows={board.rows}
      getCell={getCell}
      palette={palette}
      selectable={manage}
      selected={selection.selected}
      onCell={selection.clickCell}
      onCol={selection.clickCol}
      onRow={selection.clickRow}
      narrow={narrow}
      ariaLabel="Menu for the week"
    />
  )

  if (!board.rows.length) {
    return (
      <div className="dm-quiet">
        <p>No meals are set up for this week yet.</p>
      </div>
    )
  }

  return (
    <div className="dm-board" data-manage={manage || undefined}>
      <div className="dm-board__main">
        {grid}
        <DietLegend />
      </div>
      {manage && !narrow && <aside className="dm-board__side">{renderEditor()}</aside>}
      {manage && narrow && (
        <Drawer isOpen={selectedCells.length > 0} onClose={selection.clear} title="Edit menu" size="md">
          {selectedCells.length > 0 && renderEditor()}
        </Drawer>
      )}
    </div>
  )
}

export default WeekBoard
