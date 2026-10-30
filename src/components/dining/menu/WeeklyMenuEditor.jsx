import { useCallback, useMemo, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Drawer, ErrorState, Skeleton, useConfirm, useToast } from "hzero"
import { CalendarClock, Copy, History, Lock, MousePointerClick, Save, Trash2, Undo2 } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningMenuApi } from "@/service"
import CellEditor from "./CellEditor"
import { CopyKitchenModal, ApplyFromModal } from "./MenuDialogs"
import MenuGrid from "./MenuGrid"
import { DietLegend } from "./MenuBits"
import useCellSelection from "./useCellSelection"
import useNarrow from "./useNarrow"
import {
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  WEEK_ORDER,
  addDays,
  cleanItems,
  formatFull,
  formatShort,
  getErrorMessage,
  isEmptyMeal,
  mealPaletteFor,
  mealVarsFor,
  parseCellId,
  sameItems,
  slotKey,
} from "./menuHelpers"

const COPY_TARGETS = [
  { label: "Mon–Fri", days: [1, 2, 3, 4, 5] },
  { label: "Weekend", days: [6, 0] },
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
]

const DRAFT = "draft"

// model: { [weekday]: { [mealKey]: { name, items, note } } }
const modelFromVersion = (version) => {
  const model = {}
  for (const day of version?.days || []) {
    for (const meal of day.meals || []) {
      const key = slotKey(meal.name)
      if (!key) continue
      model[day.weekday] = { ...(model[day.weekday] || {}), [key]: { name: meal.name, items: meal.items || [], note: meal.note || "" } }
    }
  }
  return model
}

const daysFromModel = (model) =>
  WEEK_ORDER.map((weekday) => ({
    weekday,
    meals: Object.values(model[weekday] || {})
      .filter((meal) => !isEmptyMeal(meal))
      .map((meal) => ({ name: meal.name, items: cleanItems(meal.items), note: meal.note || "" })),
  })).filter((day) => day.meals.length > 0)

const setMeal = (model, weekday, row, value) => {
  const day = { ...(model[weekday] || {}) }
  if (isEmptyMeal(value)) delete day[row.key]
  else day[row.key] = { name: row.name, items: value.items, note: value.note || "" }
  const next = { ...model, [weekday]: day }
  if (!Object.keys(day).length) delete next[weekday]
  return next
}

const copyDay = (model, from, targets) => {
  const next = { ...model }
  for (const weekday of targets) {
    if (weekday === from) continue
    if (model[from]) next[weekday] = { ...model[from] }
    else delete next[weekday]
  }
  return next
}

/** Chip text for the history timeline. `next` is the following (newer) version, if any. */
const chipText = (version, next) => {
  if (version.isScheduled) return { top: `From ${formatShort(version.effectiveFrom)}`, bottom: "Scheduled" }
  if (version.isCurrent) return { top: `Since ${formatShort(version.effectiveFrom)}`, bottom: "Current" }
  return { top: formatShort(version.effectiveFrom), bottom: next ? `to ${formatShort(addDays(next.effectiveFrom, -1))}` : "Earlier" }
}

/**
 * The weekly menu: a weekday × meal grid for one kitchen, kept as dated versions. Edits are made on a
 * local copy and saved as a new version "from" a chosen day, so past weeks never change.
 */
const WeeklyMenuEditor = ({ catererId, kitchens, mealRows, today }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const confirm = useConfirm()
  const narrow = useNarrow()

  const versionsQuery = useQuery({
    queryKey: queryKeys.diningMenu.versions(catererId),
    queryFn: () => diningMenuApi.getVersions(catererId),
    enabled: Boolean(catererId),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
  const versions = useMemo(
    () => [...(versionsQuery.data?.versions || [])].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom)),
    [versionsQuery.data],
  )

  const [pickedKey, setPickedKey] = useState(null)
  // Unsaved edits to the shown version; null means "no edits", so the grid just shows the version.
  const [edits, setEdits] = useState(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [copyOpen, setCopyOpen] = useState(false)
  const dirty = edits !== null

  const fallbackKey = (versions.find((version) => version.isCurrent) || versions.at(-1))?.effectiveFrom || DRAFT
  const activeKey = pickedKey && (pickedKey === DRAFT || versions.some((v) => v.effectiveFrom === pickedKey)) ? pickedKey : fallbackKey
  const active = versions.find((version) => version.effectiveFrom === activeKey) || null
  const readOnly = Boolean(active && !active.isCurrent && !active.isScheduled)
  const hasVersions = versions.length > 0

  const saved = useMemo(() => modelFromVersion(active), [active])
  const model = edits ?? saved

  const rows = useMemo(() => {
    const seen = new Set(mealRows.map((row) => row.key))
    const extra = []
    for (const meals of Object.values(model)) {
      for (const [key, meal] of Object.entries(meals)) {
        if (!seen.has(key)) {
          seen.add(key)
          extra.push({ key, name: meal.name, startTime: null, endTime: null })
        }
      }
    }
    return [...mealRows, ...extra]
  }, [mealRows, model])
  const palette = useMemo(() => mealPaletteFor(rows), [rows])
  const cols = useMemo(
    () => WEEK_ORDER.map((weekday) => ({ id: String(weekday), label: WEEKDAY_SHORT[weekday], sub: "", today: false, past: false })),
    [],
  )

  const getCell = useCallback(
    (colId, rowKey) => {
      const row = rows.find((item) => item.key === rowKey)
      const meal = model[Number(colId)]?.[rowKey]
      return { name: row?.name || rowKey, items: meal?.items || [], note: meal?.note || "", served: true, source: "week", locked: readOnly }
    },
    [model, rows, readOnly],
  )

  const always = useCallback(() => true, [])
  const selection = useCellSelection({ cols, rows, canView: always, canPick: always, resetKey: `${catererId}|${activeKey}` })

  const selectedCells = useMemo(
    () =>
      selection.selected.map((id) => {
        const { date: colId, key } = parseCellId(id)
        return { id, weekday: Number(colId), key, row: rows.find((row) => row.key === key), cell: getCell(colId, key) }
      }),
    [selection.selected, rows, getCell],
  )

  const edit = (value) => {
    setEdits(selectedCells.reduce((acc, entry) => setMeal(acc, entry.weekday, entry.row, value), model))
  }
  const clearSelected = () => edit({ items: [], note: "" })
  const applyCopy = (from, targets) => {
    setEdits(copyDay(model, from, targets))
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningMenu.all })

  const saveWeek = useMutation({
    mutationFn: (effectiveFrom) =>
      diningMenuApi.saveWeek({ catererId, effectiveFrom, days: daysFromModel(model), note: active?.note || "" }).then(() => effectiveFrom),
    onSuccess: async (effectiveFrom) => {
      toast.success(`Weekly menu saved. It applies from ${formatFull(effectiveFrom)}.`)
      setSaveOpen(false)
      setEdits(null)
      setPickedKey(effectiveFrom)
      await invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save the weekly menu.")),
  })

  const removeVersion = useMutation({
    mutationFn: (effectiveFrom) => diningMenuApi.deleteWeek({ catererId, effectiveFrom }),
    onSuccess: async () => {
      toast.success("Scheduled menu deleted.")
      setEdits(null)
      setPickedKey(null)
      await invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete that version.")),
  })

  const copyKitchens = useMutation({
    mutationFn: (payload) => diningMenuApi.copy(payload),
    onSuccess: async (_data, payload) => {
      toast.success(`Menu copied. It applies from ${formatFull(payload.effectiveFrom)}.`)
      setCopyOpen(false)
      setEdits(null)
      setPickedKey(null)
      await invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't copy the menu.")),
  })

  const switchTo = async (key) => {
    if (key === activeKey) return
    if (dirty) {
      const ok = await confirm({
        title: "Discard your changes?",
        message: "You have unsaved changes to this menu. Switching version drops them.",
        confirmText: "Discard",
        isDestructive: true,
      })
      if (!ok) return
    }
    setEdits(null)
    setPickedKey(key)
  }

  const discard = () => {
    setEdits(null)
    selection.clear()
  }

  const startFromOld = () => {
    setEdits(saved)
    setPickedKey(DRAFT)
  }

  const askDelete = async () => {
    const ok = await confirm({
      title: "Delete this scheduled menu?",
      message: `The menu that was due to start on ${formatFull(active.effectiveFrom)} is removed. The current menu keeps running.`,
      confirmText: "Delete",
      isDestructive: true,
    })
    if (ok) removeVersion.mutate(active.effectiveFrom)
  }

  const renderEditor = () => {
    if (!selectedCells.length) {
      return (
        <div className="dm-editor dm-editor--empty">
          <MousePointerClick size={24} aria-hidden="true" />
          <p>Pick a weekday and meal to set what is usually served.</p>
          <ul>
            <li>
              <kbd>Shift</kbd> + click selects a range
            </li>
            <li>
              <kbd>Ctrl</kbd> + click adds single cells
            </li>
            <li>Click a weekday or a meal name to select the whole line</li>
          </ul>
        </div>
      )
    }
    const first = selectedCells[0]
    const mixed = selectedCells.some((entry) => !sameItems(entry.cell.items, first.cell.items) || entry.cell.note !== first.cell.note)
    const single = selectedCells.length === 1
    const weekdays = [...new Set(selectedCells.map((entry) => entry.weekday))]
    const lone = weekdays.length === 1 ? weekdays[0] : null
    const signature = JSON.stringify([
      selectedCells.map((entry) => entry.id),
      selectedCells.map((entry) => [entry.cell.items, entry.cell.note]),
    ])
    return (
      <CellEditor
        key={signature}
        title={single ? `Every ${WEEKDAY_LONG[first.weekday]}` : `${selectedCells.length} cells selected`}
        hint={single ? first.row?.name : "One edit applies to all of them."}
        meal={single ? mealVarsFor(palette, first.key) : undefined}
        initial={{ items: first.cell.items, note: first.cell.note }}
        mixed={mixed}
        readOnly={readOnly}
        readOnlyNote={readOnly ? "An earlier version is a record. Start a new version from it to edit." : ""}
        saveLabel={single ? "Set for this weekday" : "Apply to cells"}
        onSave={edit}
        onClose={selection.clear}
        resetLabel="Clear"
        canReset={selectedCells.some((entry) => !isEmptyMeal(entry.cell))}
        onReset={clearSelected}
      >
        {!readOnly && lone !== null && (
          <div className="dm-editor__copy">
            <span className="dm-editor__quiet">Copy {WEEKDAY_SHORT[lone]}&apos;s whole menu to</span>
            <div className="dm-chips">
              {COPY_TARGETS.map((target) => (
                <button key={target.label} type="button" className="dm-chip-btn" onClick={() => applyCopy(lone, target.days)}>
                  {target.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </CellEditor>
    )
  }

  if (versionsQuery.isError && !versionsQuery.data) {
    return (
      <ErrorState
        message={getErrorMessage(versionsQuery.error, "Couldn't load the weekly menu.")}
        onRetry={() => versionsQuery.refetch()}
      />
    )
  }
  if (versionsQuery.isPending && !versionsQuery.data) {
    return <Skeleton variant="rounded" height={320} />
  }

  return (
    <div className="dm-weekly">
      <section className="dm-history" aria-label="Menu history">
        <div className="dm-history__head">
          <h3>
            <History size={15} aria-hidden="true" /> Menu history
          </h3>
          <div className="dm-history__tools">
            <Button type="button" variant="secondary" size="sm" onClick={() => setCopyOpen(true)}>
              <Copy size={14} /> Copy between kitchens
            </Button>
            {active?.isScheduled && (
              <Button type="button" variant="secondary" size="sm" loading={removeVersion.isPending} onClick={askDelete}>
                <Trash2 size={14} /> Delete scheduled
              </Button>
            )}
          </div>
        </div>
        <ol className="dm-history__line">
          {versions.map((version, index) => {
            const text = chipText(version, versions[index + 1])
            return (
              <li key={version.effectiveFrom}>
                <button
                  type="button"
                  className="dm-version"
                  aria-pressed={activeKey === version.effectiveFrom}
                  data-state={version.isScheduled ? "scheduled" : version.isCurrent ? "current" : "past"}
                  onClick={() => switchTo(version.effectiveFrom)}
                  title={version.updatedBy?.name ? `Last edited by ${version.updatedBy.name}` : undefined}
                >
                  <strong>{text.top}</strong>
                  <span>{text.bottom}</span>
                </button>
              </li>
            )
          })}
          {(activeKey === DRAFT || !hasVersions) && (
            <li>
              <button type="button" className="dm-version" aria-pressed data-state="draft">
                <strong>{hasVersions ? "New version" : "First menu"}</strong>
                <span>Not saved yet</span>
              </button>
            </li>
          )}
        </ol>
        {!hasVersions && (
          <p className="dm-quiet-line">This kitchen has no weekly menu yet. Fill in the grid, then choose when it starts.</p>
        )}
      </section>

      <div className="dm-board" data-manage>
        <div className="dm-board__main">
          {readOnly && (
            <div className="dm-banner">
              <Lock size={14} aria-hidden="true" />
              <span>The menu from {formatFull(active.effectiveFrom)}. It is kept as a record.</span>
              <Button type="button" variant="secondary" size="sm" onClick={startFromOld}>
                <Undo2 size={14} /> Start a new version from this
              </Button>
            </div>
          )}
          {active?.isScheduled && !dirty && (
            <div className="dm-banner" data-tone="info">
              <CalendarClock size={14} aria-hidden="true" />
              <span>Scheduled to start on {formatFull(active.effectiveFrom)}. You can still change it.</span>
            </div>
          )}
          <MenuGrid
            cols={cols}
            rows={rows}
            getCell={getCell}
            palette={palette}
            selectable
            selected={selection.selected}
            onCell={selection.clickCell}
            onCol={selection.clickCol}
            onRow={selection.clickRow}
            narrow={narrow}
            ariaLabel="Weekly menu"
          />
          <DietLegend />
          {!readOnly && (
            <div className="dm-savebar" data-dirty={dirty || undefined}>
              <span>{dirty ? "You have unsaved changes." : "Edit cells, then save the menu as a new version."}</span>
              <div className="dm-savebar__actions">
                <Button type="button" variant="secondary" size="sm" disabled={!dirty} onClick={discard}>
                  Discard
                </Button>
                <Button type="button" variant="primary" size="sm" disabled={!dirty} onClick={() => setSaveOpen(true)}>
                  <Save size={14} /> Save menu
                </Button>
              </div>
            </div>
          )}
        </div>
        {!narrow && <aside className="dm-board__side">{renderEditor()}</aside>}
        {narrow && (
          <Drawer isOpen={selectedCells.length > 0} onClose={selection.clear} title="Edit weekly menu" size="md">
            {selectedCells.length > 0 && renderEditor()}
          </Drawer>
        )}
      </div>

      {saveOpen && (
        <ApplyFromModal
          isOpen
          onClose={() => setSaveOpen(false)}
          onConfirm={(date) => saveWeek.mutate(date)}
          saving={saveWeek.isPending}
          today={today}
          keepDate={active?.isScheduled ? active.effectiveFrom : ""}
          existingDates={versions.map((version) => version.effectiveFrom)}
        />
      )}
      {copyOpen && (
        <CopyKitchenModal
          isOpen
          onClose={() => setCopyOpen(false)}
          onConfirm={(payload) => copyKitchens.mutate(payload)}
          saving={copyKitchens.isPending}
          today={today}
          kitchens={kitchens}
          currentId={catererId}
          dirty={dirty}
        />
      )}
    </div>
  )
}

export default WeeklyMenuEditor
