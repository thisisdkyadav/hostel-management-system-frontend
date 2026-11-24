import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react"
import { useAdaptiveConfirm as useConfirm } from "@/components/common/AdaptiveConfirm"
import { useToast } from "hzero"
import { feedbackApi } from "../../../service"
import { queryKeys } from "../../../lib/query"
import PhoneSheet from "../kit/PhoneSheet"
import { EmptyCard, ErrorCard, Ghosts, Lead, Pill, Row, shortDate } from "../kit/ListBits"
import { feedbacksQuery } from "../phoneQueries"
import { timeAgo } from "./complaintBits"

const toneOf = (status) => (status === "Seen" ? "success" : "warning")

/** Write or edit a piece of feedback. */
const FeedbackForm = ({ initial, onClose, onSaved }) => {
  const [title, setTitle] = useState(initial?.title || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const ready = title.trim().length > 0 && description.trim().length > 0

  const submit = async (event) => {
    event.preventDefault()
    if (!ready || saving) return
    setSaving(true)
    setError("")
    try {
      const payload = { title: title.trim(), description: description.trim() }
      const response = initial ? await feedbackApi.updateFeedback(initial._id, payload) : await feedbackApi.submitFeedback(payload)
      if (response?.success === false) throw new Error(response?.message)
      onSaved()
    } catch (err) {
      setError(err?.message || "Couldn't send that. Please try again.")
      setSaving(false)
    }
  }

  return (
    <PhoneSheet
      title={initial ? "Edit feedback" : "New feedback"}
      onClose={onClose}
      tall
      footer={
        <button type="submit" form="mf-form" className="mk-btn mk-btn--primary" disabled={!ready || saving}>
          {saving ? "Sending…" : initial ? "Save changes" : "Send feedback"}
        </button>
      }
    >
      <form id="mf-form" className="mc-form" onSubmit={submit}>
        <label className="mc-form__group">
          <span className="mk-label">Title</span>
          <input className="mk-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What's it about?" maxLength={120} />
        </label>
        <label className="mc-form__group">
          <span className="mk-label">Your feedback</span>
          <textarea className="mk-input mk-input--area" rows={7} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell the hostel office what's working and what isn't." />
        </label>
        {error && <p className="mk-error">{error}</p>}
      </form>
    </PhoneSheet>
  )
}

/** Feedback to the hostel office: what you've sent, their replies, and a button to write more. */
const PhoneFeedback = () => {
  const { toast } = useToast()
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const query = useQuery(feedbacksQuery())
  const items = query.data?.feedbacks || []
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(null) // null | "new" | feedback
  const open = items.find((item) => item._id === openId) || null

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all })

  const remove = async (feedback) => {
    const ok = await confirm({ title: "Delete this feedback?", message: "It will be removed for the hostel office too.", confirmText: "Delete", variant: "danger" })
    if (!ok) return
    try {
      await feedbackApi.deleteFeedback(feedback._id)
      setOpenId(null)
      refresh()
      toast.success("Feedback deleted.")
    } catch {
      toast.error("Couldn't delete it. Please try again.")
    }
  }

  const list = () => {
    if (query.isPending) return <Ghosts />
    if (query.isError && !query.data) return <ErrorCard text="Couldn't load your feedback." onRetry={() => query.refetch()} />
    if (items.length === 0) return <EmptyCard icon={MessageSquareText} title="No feedback yet" text="Tell the hostel office what's working and what isn't. Tap New to start." />
    return (
      <ul className="mk-list">
        {items.map((item) => (
          <li key={item._id}>
            <Row
              lead={<Lead icon={MessageSquareText} tone={item.reply ? "success" : "info"} />}
              title={item.title}
              meta={`${timeAgo(item.createdAt)}${item.reply ? " · Replied" : ""}`}
              trailing={<Pill tone={toneOf(item.status)}>{item.status}</Pill>}
              onClick={() => setOpenId(item._id)}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="mk-page mk-page--fab">
      <h1 className="mk-title">Feedback</h1>
      {list()}

      <button type="button" className="mk-fab" onClick={() => setEditing("new")} aria-label="New feedback">
        <Plus size={22} strokeWidth={2.5} />
        <span>New</span>
      </button>

      {open && !editing && (
        <PhoneSheet title="" label={open.title} onClose={() => setOpenId(null)}>
          <div className="mc-detail">
            <div className="mc-detail__titles">
              <h2 className="mc-detail__title">{open.title}</h2>
              <span className="mk-sub">Sent {shortDate(open.createdAt, true)}</span>
            </div>
            <Pill tone={toneOf(open.status)}>{open.status === "Seen" ? "Seen by the office" : "Not seen yet"}</Pill>
            <p className="mc-text">{open.description}</p>
            {open.reply && (
              <section className="mc-note">
                <span className="mk-label">Reply from the office</span>
                <p className="mc-text">{open.reply}</p>
              </section>
            )}
            {open.status === "Pending" && (
              <div className="mk-actions">
                <button type="button" className="mk-btn mk-btn--soft mk-btn--sm" onClick={() => setEditing(open)}>
                  <Pencil size={16} /> Edit
                </button>
                <button type="button" className="mk-btn mk-btn--danger mk-btn--sm" onClick={() => remove(open)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        </PhoneSheet>
      )}
      {editing && (
        <FeedbackForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            toast.success(editing === "new" ? "Feedback sent. Thanks!" : "Feedback updated.")
            setEditing(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

export default PhoneFeedback
