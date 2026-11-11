import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button, Checkbox, ConfirmDialog, Input, Modal, Textarea } from "hzero"
import { AlertTriangle, Archive, ArchiveRestore, Ban, CheckCircle2, Download, Eye, History, Info, Pencil, XCircle } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningRebateBoardApi } from "@/service"
import { getMediaDownloadUrl, getMediaUrl } from "@/utils/mediaUtils"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import RebateRibbon from "./RebateRibbon"
import RebateHistory from "./RebateHistory"
import { STATES, TYPES, days, formatWhen, initials, keysIn, listKeys, personName, placementIn, rangeText, stateOf, toKey } from "./rebateBoardHelpers"

export const Photo = ({ name, image, className = "rb-avatar" }) => {
  const [broken, setBroken] = useState(false)
  const url = image ? getMediaUrl(image) : ""
  return <span className={className}>{url && !broken ? <img src={url} alt="" loading="lazy" onError={() => setBroken(true)} /> : initials(name)}</span>
}

/** Conflicts (block), warnings and notes from a server plan for one student. */
export const PlanChecks = ({ student, notes = [], status }) => {
  if (!student) return null
  const conflicts = status === "rejected" ? [] : student.conflicts || []
  const items = [
    ...conflicts.map((c) => ({ tone: "bad", icon: Ban, text: `Already has a ${STATES[c.status]?.label.toLowerCase()} rebate on ${rangeText(toKey(c.startDate), toKey(c.endDate))}: those days can't have two` })),
    ...(student.warnings || []).map((text) => ({ tone: "warn", icon: AlertTriangle, text })),
    ...notes.map((text) => ({ tone: "info", icon: Info, text })),
  ]
  if (!items.length) return null
  return (
    <ul className="rb-checks">
      {items.map((item, index) => (
        <li key={index} data-tone={item.tone}>
          <item.icon size={14} aria-hidden="true" />
          {item.text}
        </li>
      ))}
    </ul>
  )
}

const Seg = ({ value, options, onChange, label }) => (
  <div className="rb-seg" role="group" aria-label={label}>
    {options.map((option) => (
      <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
        {option.tone && <i data-tone={option.tone} aria-hidden="true" />}
        {option.label}
      </button>
    ))}
  </div>
)
export { Seg }

const STATUS_OPTIONS = [
  { value: "approved", label: "Approved", tone: "ok" },
  { value: "pending", label: "Pending", tone: "warn" },
  { value: "rejected", label: "Rejected", tone: "bad" },
]

const facts = (rebate, period, placement) => {
  const state = stateOf(rebate)
  const asked = rebate.source === "office"
    ? { text: `Office · ${personName(rebate.people?.createdBy, "staff")}`, sub: formatWhen(rebate.createdAt) }
    : { text: "Student, in the portal", sub: formatWhen(rebate.createdAt) }

  let caterer
  if (!period) caterer = { text: "No period yet", sub: "Counts once a period covers it", tone: "warn" }
  else if (!placement) caterer = { text: "—", sub: "No days in this period" }
  else if (placement.caterer && placement.counted === false) caterer = { text: placement.caterer.name, sub: "Auto-allocated: not counted", tone: "bad" }
  else if (placement.caterer) caterer = { text: placement.caterer.name, sub: `${days(placement.dayCount)} off their count` }
  else caterer = { text: "No caterer yet", sub: "Counts once allocated", tone: "warn" }

  let decision
  if (rebate.status === "approved") {
    decision = rebate.people?.approvedBy
      ? { text: `Approved · ${personName(rebate.people.approvedBy)}`, sub: formatWhen(rebate.approvedAt), tone: state === "archived" ? undefined : "ok" }
      : { text: "Approved on request", sub: rebate.type === "short-term" ? "Short-term rebates need no approval" : formatWhen(rebate.approvedAt), tone: state === "archived" ? undefined : "ok" }
  } else if (rebate.status === "rejected") {
    decision = { text: `Rejected${rebate.people?.rejectedBy ? ` · ${personName(rebate.people.rejectedBy)}` : ""}`, sub: formatWhen(rebate.rejectedAt), tone: "bad" }
  } else {
    decision = { text: "Waiting for approval", sub: rebate.form?.ref ? "Form submitted" : "", tone: "warn" }
  }

  const edited = rebate.lastEditedAt
    ? { text: `Edited · ${personName(rebate.people?.lastEditedBy, "staff")}`, sub: formatWhen(rebate.lastEditedAt) }
    : { text: "Never edited", sub: "" }

  return [
    { label: "Asked by", ...asked },
    { label: "Caterer here", ...caterer },
    { label: "Decision", ...decision },
    { label: "Last change", ...edited },
  ]
}

const draftOf = (rebate) => ({
  startDate: toKey(rebate.startDate),
  endDate: toKey(rebate.endDate),
  type: rebate.type,
  status: rebate.status,
  reason: rebate.reason || "",
  adminComment: rebate.adminComment || "",
  note: "",
})

/**
 * The selected rebate: who, when (the ribbon), where it counts, the messages,
 * and everything staff can do with it. Edit turns the card into a form; the
 * ribbon and the server's checks follow the draft as it changes.
 */
const RebateCard = ({ rebate, period, today, onDone }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => draftOf(rebate))
  const [error, setError] = useState("")
  const [dialog, setDialog] = useState(null) // approve | reject | archive | history
  const [comment, setComment] = useState("")
  const [formChecked, setFormChecked] = useState(false)
  const [viewForm, setViewForm] = useState(false)

  const state = stateOf(rebate)
  const placement = placementIn(rebate, period)
  const archived = state === "archived"
  const inPeriod = period ? keysIn(rebate.dateKeys, period).length : rebate.dayCount

  // Server checks for the draft (debounced): conflicts, rule warnings, where the days land.
  const planInput = useDebouncedValue(editing ? `${draft.startDate}|${draft.endDate}|${draft.type}` : "", 300)
  const datesValid = draft.startDate && draft.endDate && draft.startDate <= draft.endDate
  const plan = useQuery({
    queryKey: [...queryKeys.diningRebateBoard.all, "preview", rebate.id, planInput],
    queryFn: () => {
      const [startDate, endDate, type] = planInput.split("|")
      return diningRebateBoardApi.preview({ rebateId: rebate.id, startDate, endDate, type })
    },
    enabled: Boolean(editing && planInput && datesValid),
    placeholderData: (previous) => previous,
    retry: false,
  })
  const planned = plan.data?.plan
  const plannedStudent = planned?.students?.[0]
  const blocked = draft.status !== "rejected" && (plannedStudent?.conflicts?.length || 0) > 0

  const done = (message, extra) => {
    setDialog(null)
    setComment("")
    setError("")
    onDone?.({ message, ...extra })
  }
  const fail = (err, fallback) => setError(getErrorMessage(err, fallback))

  const save = useMutation({
    mutationFn: () => {
      const { note, ...fields } = draft
      return diningRebateBoardApi.update(rebate.id, { ...fields, note })
    },
    onSuccess: () => {
      setEditing(false)
      done(`Saved ${rebate.rollNumber}'s rebate.`)
    },
    onError: (err) => fail(err, "Couldn't save the rebate."),
  })
  const approve = useMutation({
    mutationFn: () => diningRebateBoardApi.approve(rebate.id),
    onSuccess: () => done(`Approved ${rebate.rollNumber}'s rebate.`),
    onError: (err) => fail(err, "Couldn't approve."),
  })
  const reject = useMutation({
    mutationFn: () => diningRebateBoardApi.reject(rebate.id, comment.trim()),
    onSuccess: () => done(`Rejected ${rebate.rollNumber}'s rebate.`),
    onError: (err) => fail(err, "Couldn't reject."),
  })
  const restore = useMutation({
    mutationFn: () => diningRebateBoardApi.restore(rebate.id),
    onSuccess: () => done(`Restored ${rebate.rollNumber}'s rebate.`),
    onError: (err) => fail(err, "Couldn't restore."),
  })
  const archive = useMutation({
    mutationFn: () => diningRebateBoardApi.archive(rebate.id, { reason: comment.trim() }),
    onSuccess: () =>
      done(`Archived ${rebate.rollNumber}'s rebate. It no longer counts anywhere.`, { restoreId: rebate.id }),
    onError: (err) => fail(err, "Couldn't archive."),
  })

  const startEdit = () => {
    setDraft(draftOf(rebate))
    setError("")
    setEditing(true)
  }
  const set = (field) => (value) => setDraft((current) => ({ ...current, [field]: value }))
  const needsFormCheck = rebate.type === "long-term" && Boolean(rebate.form?.ref)
  const ribbonKeys = editing ? (datesValid ? listKeys(draft.startDate, draft.endDate) : []) : rebate.dateKeys
  // While editing, the big count follows the draft dates.
  const shownTotal = editing ? ribbonKeys.length : rebate.dayCount
  const shownIn = editing ? (period ? keysIn(ribbonKeys, period).length : 0) : inPeriod
  const autoType = planned?.autoType
  const factRows = facts(rebate, period, placement)

  return (
    <article className="rc" data-state={state} aria-label={`${rebate.student?.name || rebate.rollNumber}'s rebate`}>
      <header className="rc-head">
        <Photo name={rebate.student?.name} image={rebate.student?.profileImage} className="rc-photo" />
        <div className="rc-who">
          <h2 title={rebate.student?.name || undefined}>{rebate.student?.name || rebate.rollNumber}</h2>
          <p className="rc-tags">
            <span>{rebate.rollNumber}</span>
            <span className="rc-tag" data-tone={STATES[state].tone}>
              {STATES[state].label}
            </span>
            <span className="rc-tag">{TYPES[rebate.type]?.label}</span>
            {rebate.source === "office" && (
              <span className="rc-tag" data-tone="info">
                Added by office
              </span>
            )}
          </p>
        </div>
        <div className="rc-big" data-tone={STATES[state].tone}>
          <b>{days(shownTotal)}</b>
          <span>{period ? (shownIn === shownTotal ? "all in this period" : `${shownIn} in this period`) : "in no period yet"}</span>
        </div>
      </header>

      {archived && (
        <p className="rc-banner">
          <Archive size={16} aria-hidden="true" />
          Archived {formatWhen(rebate.archivedAt)}
          {rebate.people?.archivedBy ? ` by ${personName(rebate.people.archivedBy)}` : ""}
          {rebate.archiveReason ? `: “${rebate.archiveReason}”` : ""}. It counts nowhere until restored.
        </p>
      )}

      {ribbonKeys.length > 0 ? (
        <RebateRibbon
          period={period}
          startKey={ribbonKeys[0]}
          endKey={ribbonKeys[ribbonKeys.length - 1]}
          dateKeys={ribbonKeys}
          state={editing ? draft.status : state}
          placements={editing ? plannedStudent?.placements : rebate.placements}
          today={today}
        />
      ) : (
        <p className="rc-banner">Pick a start and an end date.</p>
      )}

      {editing ? (
        <div className="rc-form">
          <label className="rb-field">
            <span>Dates</span>
            <div className="rb-dates">
              <Input type="date" value={draft.startDate} onChange={(e) => set("startDate")(e.target.value)} aria-label="First day" />
              <span>→</span>
              <Input type="date" value={draft.endDate} min={draft.startDate || undefined} onChange={(e) => set("endDate")(e.target.value)} aria-label="Last day" />
            </div>
          </label>
          <div className="rb-field">
            <span>Type</span>
            <Seg
              label="Type"
              value={draft.type}
              onChange={set("type")}
              options={[
                { value: "short-term", label: "Short-term" },
                { value: "long-term", label: "Long-term" },
              ]}
            />
            {autoType && <small>By the rules: {TYPES[autoType].label.toLowerCase()}</small>}
          </div>
          <div className="rb-field rc-form__wide">
            <span>Status</span>
            <Seg label="Status" value={draft.status} onChange={set("status")} options={STATUS_OPTIONS} />
          </div>
          <label className="rb-field">
            <span>Student&apos;s message</span>
            <Textarea rows={3} value={draft.reason} onChange={(e) => set("reason")(e.target.value)} placeholder="Why they're away" />
          </label>
          <label className="rb-field">
            <span>Office comment</span>
            <Textarea rows={3} value={draft.adminComment} onChange={(e) => set("adminComment")(e.target.value)} placeholder="The student sees this" />
          </label>
          <label className="rb-field rc-form__wide">
            <span>Why the change</span>
            <Input value={draft.note} onChange={(e) => set("note")(e.target.value)} placeholder="Kept in this rebate's history (optional)" />
          </label>
          <div className="rc-form__wide">
            <PlanChecks student={plannedStudent} notes={planned?.notes} status={draft.status} />
          </div>
        </div>
      ) : (
        <>
          <dl className="rc-facts">
            {factRows.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd data-tone={fact.tone} title={[fact.text, fact.sub].filter(Boolean).join(" · ")}>
                  {fact.text}
                  {fact.sub ? <small>{fact.sub}</small> : null}
                </dd>
              </div>
            ))}
          </dl>
          <div className="rc-notes">
            <div className="rc-note">
              <h3>Student&apos;s message</h3>
              <p data-empty={!rebate.reason || undefined}>{rebate.reason || "No message"}</p>
            </div>
            <div className="rc-note rc-note--office">
              <h3>Office comment</h3>
              <p data-empty={!rebate.adminComment || undefined}>{rebate.adminComment || "None"}</p>
            </div>
          </div>
          {rebate.type === "long-term" && rebate.form?.ref && (
            <div className="rc-form-file">
              <span>Form: {rebate.form.name || "Rebate form"}</span>
              <Button size="sm" variant="secondary" onClick={() => setViewForm(true)}>
                <Eye size={14} /> Open
              </Button>
              <Button size="sm" variant="ghost" onClick={() => window.open(getMediaDownloadUrl(rebate.form.ref), "_blank", "noopener")}>
                <Download size={14} /> Download
              </Button>
            </div>
          )}
        </>
      )}

      <footer className="rc-actions">
        {error && <p className="rc-feedback">{error}</p>}
        {editing ? (
          <div className="rc-actions__end">
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => save.mutate()} loading={save.isPending} disabled={!datesValid || blocked || save.isPending}>
              Save changes
            </Button>
          </div>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setDialog("history")}>
              <History size={15} /> History
            </Button>
            <div className="rc-actions__end">
              {archived ? (
                <Button variant="primary" size="sm" onClick={() => restore.mutate()} loading={restore.isPending}>
                  <ArchiveRestore size={15} /> Restore
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setDialog("archive")}>
                    <Archive size={15} /> Archive
                  </Button>
                  <Button variant="secondary" size="sm" onClick={startEdit}>
                    <Pencil size={15} /> Edit
                  </Button>
                  {rebate.status === "pending" && (
                    <>
                      <Button variant="danger" size="sm" onClick={() => setDialog("reject")}>
                        <XCircle size={15} /> Reject
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setFormChecked(false)
                          setDialog("approve")
                        }}
                      >
                        <CheckCircle2 size={15} /> Approve
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </footer>

      {dialog === "approve" && !needsFormCheck && (
        <ConfirmDialog
          isOpen
          onClose={() => setDialog(null)}
          onConfirm={() => approve.mutate()}
          title="Approve rebate"
          message={`Approve ${rebate.rollNumber}'s ${days(rebate.dayCount)} away (${rangeText(toKey(rebate.startDate), toKey(rebate.endDate))})?`}
          confirmText="Approve"
        />
      )}
      {dialog === "approve" && needsFormCheck && (
        <Modal
          isOpen
          onClose={() => setDialog(null)}
          title="Approve rebate"
          width={460}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => approve.mutate()} loading={approve.isPending} disabled={!formChecked || approve.isPending}>
                Approve
              </Button>
            </>
          }
        >
          <div className="rb-modal rn-pane">
            <p className="rn-hint">This long-term rebate came with a filled form. Check it before approving.</p>
            <div>
              <Button size="sm" variant="secondary" onClick={() => setViewForm(true)}>
                <Eye size={14} /> Open the form
              </Button>
            </div>
            <Checkbox checked={formChecked} onChange={(event) => setFormChecked(event.target.checked)} label="I have checked the submitted form" />
          </div>
        </Modal>
      )}
      {(dialog === "reject" || dialog === "archive") && (
        <Modal
          isOpen
          onClose={() => setDialog(null)}
          title={dialog === "reject" ? "Reject rebate" : "Archive rebate"}
          width={460}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              {dialog === "reject" ? (
                <Button variant="danger" onClick={() => reject.mutate()} loading={reject.isPending}>
                  Reject
                </Button>
              ) : (
                <Button variant="danger" onClick={() => archive.mutate()} loading={archive.isPending}>
                  <Archive size={15} /> Archive
                </Button>
              )}
            </>
          }
        >
          <div className="rb-modal rn-pane">
            <p className="rn-hint">
              {dialog === "reject"
                ? `${rebate.rollNumber}'s request for ${days(rebate.dayCount)} is turned down. The student sees your comment.`
                : `${rebate.rollNumber}'s rebate stops counting everywhere (charges, caterer counts, the student's page) but is kept. You can restore it from the Archived list.`}
            </p>
            <label className="rb-field">
              <span>{dialog === "reject" ? "Comment for the student" : "Why (optional)"}</span>
              <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={dialog === "reject" ? "Optional" : "e.g. Duplicate entry"} />
            </label>
            {error && <p className="rc-feedback">{error}</p>}
          </div>
        </Modal>
      )}
      {dialog === "history" && (
        <Modal isOpen onClose={() => setDialog(null)} title={`History · ${rebate.rollNumber}`} width={560}>
          <RebateHistory rebate={rebate} />
        </Modal>
      )}
      <PdfViewerModal
        isOpen={viewForm}
        onClose={() => setViewForm(false)}
        documentUrl={rebate.form?.ref}
        title="Submitted rebate form"
        subtitle={rebate.form?.name || "Long-term rebate form"}
        downloadFileName={rebate.form?.name || "rebate-form.pdf"}
      />
    </article>
  )
}

export default RebateCard
