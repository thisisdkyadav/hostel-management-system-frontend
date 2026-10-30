import { useState } from "react"
import { Button, Textarea } from "hzero"
import { Lock, RotateCcw, X } from "lucide-react"
import ItemChipInput from "./ItemChipInput"
import { MAX_NOTE, sameItems } from "./menuHelpers"

/**
 * The side editor for the selected cell(s): a dish list and an optional note. The parent remounts it
 * (via `key`) whenever the selection changes, so its draft always starts from the selection's menu.
 * Read-only for past days and for people who can only look.
 */
const CellEditor = ({
  title,
  hint,
  meal,
  initial,
  mixed = false,
  readOnly = false,
  readOnlyNote = "",
  saving = false,
  saveLabel = "Save",
  onSave,
  onClose,
  resetLabel = "",
  canReset = false,
  resetting = false,
  onReset,
  children,
}) => {
  const [items, setItems] = useState(initial.items)
  const [note, setNote] = useState(initial.note || "")
  const [touched, setTouched] = useState(false)

  const dirty = touched || !sameItems(items, initial.items) || note.trim() !== (initial.note || "").trim()
  const canSave = !readOnly && !saving && (mixed ? touched : dirty)

  const changeItems = (next) => {
    setTouched(true)
    setItems(next)
  }

  return (
    <div className="dm-editor" style={meal}>
      <header className="dm-editor__head">
        <div className="dm-editor__titles">
          <h3>{title}</h3>
          {hint && <p>{hint}</p>}
        </div>
        {onClose && (
          <button type="button" className="dm-iconbtn" onClick={onClose} aria-label="Close editor">
            <X size={16} />
          </button>
        )}
      </header>

      {readOnly && readOnlyNote && (
        <p className="dm-editor__lock">
          <Lock size={13} aria-hidden="true" /> {readOnlyNote}
        </p>
      )}
      {mixed && !readOnly && <p className="dm-editor__mixed">These cells differ. Saving replaces all of them with the list below.</p>}

      <div className="dm-editor__field">
        <span className="dm-editor__label">Dishes</span>
        <ItemChipInput items={items} onChange={changeItems} disabled={readOnly} />
        {readOnly && items.length === 0 && <p className="dm-editor__quiet">Nothing was listed.</p>}
      </div>

      {(!readOnly || note) && (
        <div className="dm-editor__field">
          <span className="dm-editor__label">Note</span>
          {readOnly ? (
            <p className="dm-editor__quiet">{note}</p>
          ) : (
            <Textarea
              rows={2}
              value={note}
              maxLength={MAX_NOTE}
              placeholder="Optional, e.g. served with curd"
              aria-label="Note"
              onChange={(event) => {
                setTouched(true)
                setNote(event.target.value)
              }}
            />
          )}
        </div>
      )}

      {!readOnly && (
        <div className="dm-editor__actions">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canSave}
            loading={saving}
            onClick={() => onSave({ items, note: note.trim() })}
          >
            {saveLabel}
          </Button>
          {onReset && (
            <Button type="button" variant="secondary" size="sm" disabled={!canReset || resetting || saving} onClick={onReset}>
              <RotateCcw size={14} /> {resetLabel}
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default CellEditor
