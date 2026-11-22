import { useState } from "react"
import { Check, Star } from "lucide-react"
import { complaintApi } from "../../../service"
import PhoneSheet from "../kit/PhoneSheet"
import { CategoryIcon, formatStamp, statusMeta, StatusPill, timeAgo } from "./complaintBits"

const VERDICTS = [
  { value: "Satisfied", label: "Fixed well" },
  { value: "Unsatisfied", label: "Not happy" },
  { value: "False Resolution", label: "Not fixed" },
]

const Stars = ({ value, onChange, size = 30 }) => (
  <div className="mc-stars" role={onChange ? "radiogroup" : "img"} aria-label={onChange ? "Rating" : `${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) =>
      onChange ? (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}>
          <Star size={size} fill={n <= value ? "currentColor" : "none"} data-on={n <= value || undefined} />
        </button>
      ) : (
        <Star key={n} size={size} fill={n <= value ? "currentColor" : "none"} data-on={n <= value || undefined} />
      )
    )}
  </div>
)

/** Rate a resolved complaint, inside the sheet. */
const RateFix = ({ complaint, onDone }) => {
  const [rating, setRating] = useState(0)
  const [verdict, setVerdict] = useState("Satisfied")
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    setSaving(true)
    setError("")
    try {
      await complaintApi.giveFeedback(complaint.id, { feedback: comment.trim(), feedbackRating: rating, satisfactionStatus: verdict })
      onDone?.({ feedback: comment.trim(), feedbackRating: rating, satisfactionStatus: verdict })
    } catch (err) {
      setError(err?.message || "Couldn't send your rating. Try again.")
      setSaving(false)
    }
  }

  return (
    <section className="mc-rate">
      <h3 className="mk-label">How was the fix?</h3>
      <Stars value={rating} onChange={setRating} />
      <div className="mk-chips">
        {VERDICTS.map((option) => (
          <button key={option.value} type="button" className="mk-chip" data-active={verdict === option.value || undefined} onClick={() => setVerdict(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <textarea className="mk-input mk-input--area" rows={2} placeholder="Anything to add? (optional)" value={comment} onChange={(event) => setComment(event.target.value)} />
      {error && <p className="mk-error">{error}</p>}
      <button type="button" className="mk-btn mk-btn--primary" disabled={!rating || saving} onClick={submit}>
        {saving ? "Sending…" : "Send rating"}
      </button>
    </section>
  )
}

/**
 * One complaint, opened from the list (or from Home's "rate the fix" prompt):
 * where it is, what was said, and the rating once it's resolved.
 */
const ComplaintSheet = ({ complaint: initial, onClose, onChanged }) => {
  const [complaint, setComplaint] = useState(initial)
  const meta = statusMeta(complaint.status)
  const resolved = meta.step >= 2
  const middleLabel = complaint.status === "Forwarded to IDO" ? "Forwarded to IDO" : "Being worked on"

  const steps = [
    { label: "Submitted", when: formatStamp(complaint.createdDate), done: true },
    { label: middleLabel, when: "", done: meta.step >= 1 },
    { label: ["Closed", "Rejected"].includes(complaint.status) ? complaint.status : "Resolved", when: formatStamp(complaint.resolutionDate), done: resolved },
  ]

  return (
    <PhoneSheet title="" label={complaint.title} onClose={onClose}>
      <div className="mc-detail">
        <div className="mc-detail__head">
          <CategoryIcon category={complaint.category} size={24} />
          <div className="mc-detail__titles">
            <h2 className="mc-detail__title">{complaint.title}</h2>
            <p className="mk-sub">
              {complaint.category}
              {complaint.roomNumber ? ` · Room ${complaint.roomNumber}` : ""} · {timeAgo(complaint.createdDate)}
            </p>
          </div>
        </div>

        <StatusPill status={complaint.status} />

        <ol className="mc-steps" data-tone={meta.tone}>
          {steps.map((step) => (
            <li key={step.label} data-done={step.done || undefined}>
              <span className="mc-steps__dot">{step.done && <Check size={12} strokeWidth={3} />}</span>
              <span className="mc-steps__label">{step.label}</span>
              {step.done && step.when && <span className="mc-steps__when">{step.when}</span>}
            </li>
          ))}
        </ol>

        {complaint.description && (
          <section>
            <h3 className="mk-label">What you reported</h3>
            <p className="mc-text">{complaint.description}</p>
          </section>
        )}

        {(complaint.resolutionNotes || complaint.resolvedBy?.name) && (
          <section className="mc-note">
            <h3 className="mk-label">{resolved ? "How it was fixed" : "Update"}</h3>
            {complaint.resolutionNotes && <p className="mc-text">{complaint.resolutionNotes}</p>}
            {complaint.resolvedBy?.name && <p className="mk-sub">— {complaint.resolvedBy.name}</p>}
          </section>
        )}

        {complaint.feedbackRating ? (
          <section>
            <h3 className="mk-label">Your rating</h3>
            <Stars value={complaint.feedbackRating} size={20} />
            {complaint.feedback && <p className="mc-text">{complaint.feedback}</p>}
          </section>
        ) : (
          complaint.status === "Resolved" && (
            <RateFix
              complaint={complaint}
              onDone={(feedback) => {
                setComplaint((current) => ({ ...current, ...feedback }))
                onChanged?.()
              }}
            />
          )
        )}
      </div>
    </PhoneSheet>
  )
}

export default ComplaintSheet
