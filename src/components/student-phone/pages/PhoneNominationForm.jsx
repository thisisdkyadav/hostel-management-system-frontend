import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "hzero"
import { CheckCircle2, Clock, FileText, IdCard, Plus, UserCheck, X, XCircle } from "lucide-react"
import { uploadApi, resolveUploadedFileRef } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

const MAX_PDF_BYTES = 10 * 1024 * 1024

/** One optional PDF: shows whether it's uploaded, with View and Upload/Replace. */
const DocRow = ({ label, hint, value, onChange, onView }) => {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const pick = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) return toast.error("Only PDF files can be uploaded")
    if (file.size > MAX_PDF_BYTES) return toast.error("The PDF must be 10 MB or smaller")
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      const url = resolveUploadedFileRef(await uploadApi.uploadElectionNominationDocument(formData))
      if (!url) throw new Error("The upload didn't return a file")
      onChange(url)
      toast.success(`${label} uploaded`)
    } catch (error) {
      toast.error(error.message || `Couldn't upload the ${label.toLowerCase()}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <li className="mn-doc">
      <span className="mn-doc__icon" data-done={value ? "" : undefined} aria-hidden="true">
        {value ? <CheckCircle2 size={20} /> : <FileText size={20} />}
      </span>
      <span className="mn-doc__main">
        <span className="mn-doc__label">{label}</span>
        <span className="mk-sub">{value ? "Uploaded" : hint}</span>
      </span>
      {value && (
        <button type="button" className="mk-btn mk-btn--ghost mk-btn--sm" onClick={() => onView(value)}>
          View
        </button>
      )}
      <label className="mk-btn mk-btn--soft mk-btn--sm mn-doc__pick" aria-busy={uploading || undefined}>
        <input type="file" accept=".pdf,application/pdf" onChange={pick} disabled={uploading} hidden />
        {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
      </label>
    </li>
  )
}

/** Proposers or seconders: one roll number per row, checked as you leave the box. */
/** Where each supporter is: found by roll number, then asked, then confirmed or declined. */
const SUPPORT_STATE = {
  accepted: { label: "confirmed", tone: "success" },
  pending: { label: "hasn't confirmed yet", tone: "warning" },
  rejected: { label: "declined", tone: "danger" },
}

/** "1 needed" until enough have confirmed, then "1 needed · 1 confirmed" in green. */
const ConfirmedCount = ({ entries, required }) => {
  const confirmed = entries.filter((entry) => (entry.supportStatus || entry.status) === "accepted").length
  const done = required > 0 && confirmed >= required
  return (
    <span className="mn-need" data-done={done || undefined}>
      · {required} needed{confirmed > 0 ? ` · ${confirmed} confirmed` : ""}
    </span>
  )
}

const Supporters = ({ type, title, entries, required, rowKey, lookupKey, onChange, onLookup, onAdd, onRemove }) => (
  <section className="mn-group">
    <h3 className="mk-label">
      {title}{" "}
      <ConfirmedCount entries={entries} required={required} />
    </h3>
    {entries.map((entry, index) => {
      const key = rowKey(type, index)
      return (
        <div key={key} className="mn-supporter">
          <div className="mn-supporter__line">
            <input
              className="mk-input"
              value={entry.rollNumber || ""}
              placeholder={`Roll number of ${title.toLowerCase().replace(/s$/, "")} ${index + 1}`}
              autoCapitalize="characters"
              aria-label={`${title} ${index + 1} roll number`}
              onChange={(event) =>
                onChange?.(type, index, {
                  rollNumber: String(event.target.value || "").toUpperCase(),
                  userId: "",
                  name: "",
                  email: "",
                  profileImage: "",
                  lookupStatus: "idle",
                  lookupMessage: "",
                  supportStatus: "",
                  supportRole: "",
                })
              }
              onBlur={(event) => onLookup?.(type, index, event.target.value)}
            />
            {entries.length > required && (
              <button type="button" className="sp-icon-btn" aria-label={`Remove ${title.toLowerCase()} ${index + 1}`} onClick={() => onRemove?.(type, index)}>
                <X size={18} />
              </button>
            )}
          </div>
          {lookupKey === key ? (
            <span className="mk-sub mn-supporter__state">Checking roll number…</span>
          ) : entry.name ? (
            <span className="mn-supporter__state" data-tone={SUPPORT_STATE[entry.supportStatus]?.tone || "found"}>
              {entry.supportStatus === "accepted" ? <CheckCircle2 size={14} aria-hidden="true" /> : entry.supportStatus === "rejected" ? <XCircle size={14} aria-hidden="true" /> : entry.supportStatus === "pending" ? <Clock size={14} aria-hidden="true" /> : <UserCheck size={14} aria-hidden="true" />}
              <span>
                {entry.name} · {SUPPORT_STATE[entry.supportStatus]?.label || "student found"}
              </span>
            </span>
          ) : entry.lookupStatus === "invalid" ? (
            <span className="mn-supporter__state" data-tone="danger">
              {entry.lookupMessage || "We couldn't find this roll number"}
            </span>
          ) : null}
        </div>
      )
    })}
    <button type="button" className="mk-btn mk-btn--ghost mk-btn--sm mn-add" onClick={() => onAdd?.(type)}>
      <Plus size={16} aria-hidden="true" /> Add another
    </button>
  </section>
)

/**
 * The nomination form laid out for the phone: same fields and actions as the
 * desktop form, as phone groups instead of nested bordered boxes.
 */
const PhoneNominationForm = ({ election, post, form, updateForm, idCard, loadingIdCard, reviewNote, changesAsked, proposerRequired, seconderRequired, supportLookupKey, onSupporterChange, onLookupSupporter, onAddSupporter, onRemoveSupporter, onView }) => {
  const navigate = useNavigate()
  const [broken, setBroken] = useState({})
  const docsRef = useRef(null)
  // Scroll the sheet body itself (scrollIntoView would also move the page behind it).
  const showDocs = () => {
    const section = docsRef.current
    const body = section?.closest(".mk-sheet__body")
    if (!section || !body) return
    body.scrollTo({ top: body.scrollTop + section.getBoundingClientRect().top - body.getBoundingClientRect().top - 8, behavior: "smooth" })
  }
  const hasIdCard = Boolean(idCard.front || idCard.back)
  const rowKey = (type, index) => `${election?.id}:${post?.id}:${type}:${index}`

  return (
    <div className="mn">
      {reviewNote && (
        <div className="mc-note mn-note" data-tone={changesAsked ? "warning" : undefined}>
          <p className="mn-note__title">{changesAsked ? "The election office asked for changes" : "Note from the election office"}</p>
          <p className="mc-text">{reviewNote}</p>
          {changesAsked && (
            <>
              <p className="mk-sub">Fix what they asked for below, then tap Save changes. Files you already uploaded stay unless you replace them.</p>
              <button type="button" className="mk-btn mk-btn--soft mk-btn--sm mn-note__action" onClick={showDocs}>
                <FileText size={16} aria-hidden="true" /> Go to documents
              </button>
            </>
          )}
        </div>
      )}

      <section className="mn-group">
        <h3 className="mk-label">Student ID card</h3>
        {loadingIdCard ? (
          <span className="mk-shimmer mn-id-ghost" />
        ) : !hasIdCard ? (
          <div className="mc-note" data-tone="warning">
            <p className="mc-text">Upload both sides of your ID card before you file a nomination.</p>
            <button type="button" className="mk-btn mk-btn--soft mk-btn--sm mn-note__action" onClick={() => navigate("/student/id-card")}>
              <IdCard size={16} aria-hidden="true" /> Upload ID card
            </button>
          </div>
        ) : (
          <>
            <div className="mn-id">
              {[
                ["Front", idCard.front],
                ["Back", idCard.back],
              ].map(([side, url]) => (
                <button key={side} type="button" className="mn-id__side" disabled={!url} onClick={() => onView(url)} aria-label={url ? `View ID card ${side.toLowerCase()}` : `${side} not uploaded`}>
                  {url && !broken[url] ? (
                    <img src={getMediaUrl(url)} alt="" onError={() => setBroken((current) => ({ ...current, [url]: true }))} />
                  ) : (
                    <span className="mn-id__fallback">
                      <IdCard size={22} aria-hidden="true" />
                      <span className="mk-sub">{url ? "Saved · tap to open" : "Not uploaded"}</span>
                    </span>
                  )}
                  <span className="mn-id__tag">{side}</span>
                </button>
              ))}
            </div>
            <p className="mk-sub mn-hint">
              Sent with your nomination. Wrong photo?{" "}
              <button type="button" className="mn-link" onClick={() => navigate("/student/id-card")}>
                Change it on the ID card page
              </button>
            </p>
          </>
        )}
      </section>

      <label className="mn-group">
        <span className="mk-label">Your CGPA</span>
        <input className="mk-input" type="number" inputMode="decimal" step="0.01" min="0" max="10" placeholder="e.g. 8.25" value={form.cgpa ?? ""} onChange={(event) => updateForm({ cgpa: event.target.value })} />
      </label>

      <label className="mk-check mn-declare">
        <input type="checkbox" checked={Boolean(form.hasNoActiveBacklogs)} onChange={(event) => updateForm({ hasNoActiveBacklogs: event.target.checked })} />
        <span>I have no active backlogs, and I understand I can have only one active nomination in this election.</span>
      </label>

      <Supporters type="proposer" title="Proposers" entries={form.proposerEntries || []} required={proposerRequired} rowKey={rowKey} lookupKey={supportLookupKey} onChange={onSupporterChange} onLookup={onLookupSupporter} onAdd={onAddSupporter} onRemove={onRemoveSupporter} />
      <Supporters type="seconder" title="Seconders" entries={form.seconderEntries || []} required={seconderRequired} rowKey={rowKey} lookupKey={supportLookupKey} onChange={onSupporterChange} onLookup={onLookupSupporter} onAdd={onAddSupporter} onRemove={onRemoveSupporter} />
      <p className="mk-sub mn-hint">Everyone you list gets a request to confirm their support. Their status shows under each roll number.</p>

      <section className="mn-group" ref={docsRef}>
        <h3 className="mk-label">
          Supporting documents <span className="mn-need">· {changesAsked ? "replace any the office asked for" : "optional"}</span>
        </h3>
        <ul className="mn-docs">
          <DocRow label="Grade card" hint="PDF, up to 10 MB" value={form.gradeCardUrl} onChange={(url) => updateForm({ gradeCardUrl: url })} onView={onView} />
          <DocRow label="Manifesto" hint="PDF, up to 10 MB" value={form.manifestoUrl} onChange={(url) => updateForm({ manifestoUrl: url })} onView={onView} />
          <DocRow label="POR documents" hint="Proof of positions you've held" value={form.porDocumentUrl} onChange={(url) => updateForm({ porDocumentUrl: url })} onView={onView} />
        </ul>
      </section>
    </div>
  )
}

export default PhoneNominationForm
