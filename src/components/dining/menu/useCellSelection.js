import { useCallback, useRef, useState } from "react"

/**
 * Multi-cell selection for a (columns × rows) grid, in the spirit of the meal planner calendar:
 * click selects one, Shift+click a rectangle from the anchor, Ctrl/Cmd+click toggles, and a column or
 * row header selects the whole line. Ids are `${colId}|${rowKey}`.
 *
 * `canView(id)` allows a plain single click (e.g. a past cell, shown read-only); `canPick(id)` is the
 * stricter test for anything that builds a multi-selection.
 */
const NONE = []

const useCellSelection = ({ cols, rows, canView, canPick, resetKey }) => {
  // Selection belongs to one `resetKey` (kitchen + week + view); a new key starts empty.
  const [state, setState] = useState({ key: resetKey, ids: [] })
  const anchor = useRef(null)
  const selected = state.key === resetKey ? state.ids : NONE
  const setSelected = useCallback(
    (next) =>
      setState((prev) => ({ key: resetKey, ids: typeof next === "function" ? next(prev.key === resetKey ? prev.ids : NONE) : next })),
    [resetKey],
  )

  const idOf = (colId, rowKey) => `${colId}|${rowKey}`

  const clickCell = useCallback(
    (colId, rowKey, event) => {
      const id = idOf(colId, rowKey)
      const additive = event.ctrlKey || event.metaKey
      if (event.shiftKey && anchor.current) {
        const colIds = cols.map((col) => col.id)
        const rowKeys = rows.map((row) => row.key)
        const [c1, c2] = [colIds.indexOf(anchor.current.colId), colIds.indexOf(colId)].sort((a, b) => a - b)
        const [r1, r2] = [rowKeys.indexOf(anchor.current.rowKey), rowKeys.indexOf(rowKey)].sort((a, b) => a - b)
        const picked = []
        for (let c = c1; c <= c2; c += 1) for (let r = r1; r <= r2; r += 1) picked.push(idOf(colIds[c], rowKeys[r]))
        setSelected(picked.filter((cell) => canPick(cell)))
        return
      }
      if (additive) {
        if (!canPick(id)) return
        anchor.current = { colId, rowKey }
        setSelected((prev) => {
          const base = prev.filter((cell) => canPick(cell))
          return base.includes(id) ? base.filter((cell) => cell !== id) : [...base, id]
        })
        return
      }
      if (!canView(id)) return
      anchor.current = { colId, rowKey }
      setSelected([id])
    },
    [cols, rows, canView, canPick, setSelected],
  )

  const pickLine = useCallback(
    (ids, event) => {
      const usable = ids.filter((id) => canPick(id))
      anchor.current = null
      if (!usable.length) return
      if (event.ctrlKey || event.metaKey) {
        setSelected((prev) => {
          const base = prev.filter((cell) => canPick(cell))
          const all = usable.every((id) => base.includes(id))
          return all ? base.filter((id) => !usable.includes(id)) : [...new Set([...base, ...usable])]
        })
      } else {
        setSelected(usable)
      }
    },
    [canPick, setSelected],
  )

  const clickCol = useCallback(
    (colId, event) =>
      pickLine(
        rows.map((row) => idOf(colId, row.key)),
        event,
      ),
    [rows, pickLine],
  )
  const clickRow = useCallback(
    (rowKey, event) =>
      pickLine(
        cols.map((col) => idOf(col.id, rowKey)),
        event,
      ),
    [cols, pickLine],
  )
  const clear = useCallback(() => {
    anchor.current = null
    setSelected([])
  }, [setSelected])

  return { selected, clickCell, clickCol, clickRow, clear }
}

export default useCellSelection
