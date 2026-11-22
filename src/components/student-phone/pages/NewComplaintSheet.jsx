import { useState } from "react"
import { useAuth } from "../../../contexts/AuthProvider"
import { complaintApi } from "../../../service"
import { COMPLAINT_CATEGORIES } from "../../../constants/complaintConstants"
import PhoneSheet from "../kit/PhoneSheet"
import { CategoryIcon } from "./complaintBits"

/** Raise a complaint: pick what kind, say what's wrong, send. */
const NewComplaintSheet = ({ onClose, onCreated }) => {
  const { user } = useAuth()
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const ready = category && title.trim() && description.trim()

  const submit = async (event) => {
    event.preventDefault()
    if (!ready || saving) return
    setSaving(true)
    setError("")
    try {
      await complaintApi.createComplaint({ userId: user?._id, title: title.trim(), description: description.trim(), category, attachments: "", location: "" })
      onCreated?.()
    } catch (err) {
      setError(err?.message || "Couldn't send your complaint. Try again.")
      setSaving(false)
    }
  }

  return (
    <PhoneSheet
      title="New complaint"
      tall
      onClose={onClose}
      footer={
        <button type="submit" form="mc-new-form" className="mk-btn mk-btn--primary" disabled={!ready || saving}>
          {saving ? "Sending…" : "Send complaint"}
        </button>
      }
    >
      <form id="mc-new-form" className="mc-form" onSubmit={submit}>
        <fieldset className="mc-form__group">
          <legend className="mk-label">What&apos;s it about?</legend>
          <div className="mc-cats">
            {COMPLAINT_CATEGORIES.map((option) => (
              <button key={option} type="button" className="mc-cats__item" data-active={category === option || undefined} aria-pressed={category === option} onClick={() => setCategory(option)}>
                <CategoryIcon category={option} size={20} />
                <span>{option}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mc-form__group">
          <span className="mk-label">Short title</span>
          <input className="mk-input" maxLength={120} placeholder="e.g. Tap leaking in bathroom" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>

        <label className="mc-form__group">
          <span className="mk-label">Details</span>
          <textarea className="mk-input mk-input--area" rows={4} placeholder="What's wrong, and where exactly?" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>

        {error && <p className="mk-error">{error}</p>}
      </form>
    </PhoneSheet>
  )
}

export default NewComplaintSheet
