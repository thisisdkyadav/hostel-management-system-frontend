import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Award, BadgeCheck, Check, ChevronRight, CircleAlert, Download, FileText, PencilLine, Plus, Send, X } from "lucide-react"
import { useToast } from "hzero"
import { porApi } from "@/service"
import { POST_SA_STAGE_ORDER } from "@/components/por/porStatus"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import PhonePorForm from "./PhonePorForm"
import { createDefaultForm } from "@/pages/common/por-requests/form"
import "@/styles/por-requests.css"
import { ModalOverrideContext } from "../../common/AdaptiveModal"
import { renderSheetModal } from "../kit/SheetModal"
import PhoneSheet from "../kit/PhoneSheet"
import Segmented from "../kit/Segmented"
import { EmptyCard, ErrorCard, Ghosts, Lead, Pill, Row, shortDate } from "../kit/ListBits"
import { porWorkspaceQuery } from "../phoneQueries"

/** Student-facing buckets for the POR statuses. */
const bucketOf = (status) => {
  if (status === "approved") return "approved"
  if (status === "rejected") return "rejected"
  if (status === "revision_requested") return "changes"
  return "review"
}
const BUCKET = {
  review: { label: "In review", tone: "info" },
  changes: { label: "Changes requested", short: "Changes", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
}

const stageName = (stage) => (stage === "Student Affairs" ? "Student Affairs office" : stage || "")

/** Where the request is: Gymkhana steps of its category, then Student Affairs, then done. */
const buildSteps = (request, category) => {
  const gymkhana = (category?.gymkhanaSteps || []).map((step) => step.label).filter(Boolean)
  const labels = [...gymkhana, "Student Affairs", "Approved"]
  const status = request.status
  if (status === "approved") return labels.map((label) => ({ label, done: true }))
  const current = request.currentApprovalStage
  let at = labels.indexOf(current)
  if (at < 0 && POST_SA_STAGE_ORDER.includes(current)) at = gymkhana.length // Officer / Associate Dean / Dean all sit inside Student Affairs
  if (at < 0) at = 0
  return labels.map((label, index) => ({
    label: index === gymkhana.length && POST_SA_STAGE_ORDER.includes(current) ? `Student Affairs · ${current}` : label,
    done: index < at,
    current: index === at,
  }))
}


const ACTION = {
  submitted: { label: "Sent", icon: Send, tone: "info" },
  resubmitted: { label: "Sent again", icon: Send, tone: "info" },
  recommended: { label: "Recommended", icon: Check, tone: "success" },
  approved: { label: "Approved", icon: Check, tone: "success" },
  rejected: { label: "Rejected", icon: X, tone: "danger" },
  revision_requested: { label: "Changes requested", icon: PencilLine, tone: "warning" },
}
const stamp = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${shortDate(date, true)}, ${date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase()}`
}

/** What happened to this request, oldest first, with each reviewer's note. */
const History = ({ requestId }) => {
  const query = useQuery({ queryKey: ["por", "history", requestId], queryFn: () => porApi.getHistory(requestId) })
  const logs = Array.isArray(query.data?.history) ? query.data.history : []
  if (query.isPending) return <Ghosts count={2} />
  if (query.isError) return <ErrorCard text="Couldn't load the history." onRetry={() => query.refetch()} />
  if (logs.length === 0) return <p className="mk-sub">Nothing has happened yet.</p>
  return (
    <ol className="mq-history">
      {logs.map((log, index) => {
        const meta = ACTION[log.action] || { label: String(log.action || "Updated").replace(/_/g, " "), icon: FileText, tone: "info" }
        const Icon = meta.icon
        const sent = log.action === "submitted" || log.action === "resubmitted"
        const who = sent ? "You" : log.performedBy?.name
        return (
          <li key={log._id || index} className="mq-history__item">
            <span className="mq-history__dot" data-tone={meta.tone} aria-hidden="true">
              <Icon size={14} strokeWidth={2.5} />
            </span>
            <span className="mq-history__main">
              <span className="mq-history__title">
                {meta.label}
                {!sent && log.stage ? ` at ${stageName(log.stage)}` : ""}
              </span>
              <span className="mk-sub">{[who, stamp(log.createdAt)].filter(Boolean).join(" · ")}</span>
              {String(log.comments || "").trim() && <span className="mq-history__note">“{String(log.comments).trim()}”</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

const RequestSheet = ({ request, category, onClose, onEdit }) => {
  const { toast } = useToast()
  const [making, setMaking] = useState(false)
  const [viewing, setViewing] = useState(false)
  const bucket = bucketOf(request.status)
  const steps = buildSteps(request, category)

  const downloadCertificate = async () => {
    setMaking(true)
    try {
      const [{ renderCertificate, downloadBytes }, payload] = await Promise.all([import("pdf-certificate-kit"), porApi.getCertificateData(request.id)])
      const bytes = await renderCertificate({
        template: payload?.template || {},
        data: payload?.data || {},
        signatures: Array.isArray(payload?.signatures) ? payload.signatures : [],
        meta: { title: "POR Certificate", subject: payload?.request?.positionTitle || "" },
      })
      const student = payload?.request?.student || request.student || {}
      const slug = String(student.rollNumber || student.name || request.id).trim().replace(/[^a-zA-Z0-9._-]+/g, "_")
      downloadBytes(bytes, `POR_Certificate_${slug}.pdf`)
      toast.success("Certificate downloaded.")
    } catch (error) {
      toast.error(error?.message || "Couldn't make the certificate. Please try again.")
    } finally {
      setMaking(false)
    }
  }

  const footer =
    bucket === "changes" && request.permissions?.canEdit ? (
      <button type="button" className="mk-btn mk-btn--primary" onClick={onEdit}>
        <PencilLine size={18} /> Edit and resubmit
      </button>
    ) : bucket === "approved" ? (
      <button type="button" className="mk-btn mk-btn--primary" onClick={downloadCertificate} disabled={making}>
        <Download size={18} /> {making ? "Making certificate…" : "Download certificate"}
      </button>
    ) : null

  return (
    <PhoneSheet title="" label={request.positionTitle || "POR request"} onClose={onClose} tall footer={footer}>
      <div className="mc-detail">
        <div className="mc-detail__titles">
          <span className="mk-sub">{request.porCategoryName || request.club?.name}</span>
          <h2 className="mc-detail__title">{request.positionTitle}</h2>
          <span className="mk-sub">{[request.tenure, `Sent ${shortDate(request.createdAt, true)}`].filter(Boolean).join(" · ")}</span>
        </div>
        <Pill tone={BUCKET[bucket].tone}>{BUCKET[bucket].label}</Pill>

        {bucket === "changes" && (
          <section className="mc-note" data-tone="warning">
            <h3 className="mk-label">What to change</h3>
            <p className="mc-text">{request.rejectionReason || "A reviewer asked for changes. Their note is in the history below."}</p>
            {request.permissions?.canEdit && <p className="mk-sub">Tap Edit and resubmit to change the details or replace the PDF.</p>}
          </section>
        )}
        {bucket === "rejected" && (
          <section className="mc-note" data-tone="danger">
            <h3 className="mk-label">Why it was rejected</h3>
            <p className="mc-text">{request.rejectionReason || "No reason was given."}</p>
            {request.rejectedBy?.name && <p className="mk-sub">{request.rejectedBy.name}</p>}
          </section>
        )}

        {bucket === "review" && request.currentApprovalStage && (
          <p className="mq-now">
            Waiting on <strong>{stageName(request.currentApprovalStage)}</strong>. You don&apos;t need to do anything until they reply.
          </p>
        )}
        {bucket !== "rejected" && (
          <ol className="mc-steps" data-tone={BUCKET[bucket].tone}>
            {steps.map((step) => (
              <li key={step.label} data-done={step.done || undefined} data-current={step.current || undefined}>
                <span className="mc-steps__dot">{step.done && <Check size={12} strokeWidth={3} />}</span>
                <span className="mc-steps__label">{step.label}</span>
                {step.current && bucket === "review" && <span className="mc-steps__when">Reviewing now</span>}
                {step.current && bucket === "changes" && <span className="mc-steps__when">Waiting on you</span>}
              </li>
            ))}
          </ol>
        )}

        {request.positionDetails && (
          <section>
            <h3 className="mk-label">Your responsibilities</h3>
            <p className="mc-text">{request.positionDetails}</p>
          </section>
        )}

        {request.supportingDocumentUrl && (
          <section>
            <h3 className="mk-label">Supporting document</h3>
            <button type="button" className="mn-doc mq-doc-open" onClick={() => setViewing(true)}>
              <span className="mn-doc__icon" aria-hidden="true">
                <FileText size={20} />
              </span>
              <span className="mn-doc__main">
                <span className="mn-doc__label">{request.supportingDocumentName || "Supporting PDF"}</span>
                <span className="mk-sub">PDF · tap to open</span>
              </span>
              <ChevronRight size={18} className="mk-row__chev" aria-hidden="true" />
            </button>
            <CertificateViewerModal isOpen={viewing} onClose={() => setViewing(false)} certificateUrl={request.supportingDocumentUrl} />
          </section>
        )}

        <section>
          <h3 className="mk-label">History</h3>
          <History requestId={request.id} />
        </section>
      </div>
    </PhoneSheet>
  )
}

/** Your position-of-responsibility requests: send one, follow it, fix it, get the certificate. */
const PhonePor = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const query = useQuery(porWorkspaceQuery())
  const requests = useMemo(() => query.data?.requests || [], [query.data])
  const categories = useMemo(() => query.data?.porCategories || [], [query.data])
  const canCreate = Boolean(query.data?.viewer?.canCreate)
  const [filter, setFilter] = useState("all")
  const [openId, setOpenId] = useState(null)
  const [form, setForm] = useState(null) // { editing, data }
  const [pendingDoc, setPendingDoc] = useState(false)
  const [saving, setSaving] = useState(false)

  const counts = useMemo(() => {
    const out = { all: requests.length, review: 0, changes: 0, approved: 0, rejected: 0 }
    for (const request of requests) out[bucketOf(request.status)] += 1
    return out
  }, [requests])
  const filters = [
    { value: "all", label: "All", count: query.data ? counts.all : undefined },
    ...Object.entries(BUCKET)
      .filter(([key]) => counts[key] > 0)
      .map(([key, meta]) => ({ value: key, label: meta.short || meta.label, count: counts[key] })),
  ]
  const shownFilter = filter === "all" || counts[filter] ? filter : "all"
  // Requests waiting on the student come first; the rest keep the server's order.
  const shown = requests
    .filter((request) => shownFilter === "all" || bucketOf(request.status) === shownFilter)
    .map((request, index) => ({ request, index }))
    .sort((a, b) => (bucketOf(b.request.status) === "changes") - (bucketOf(a.request.status) === "changes") || a.index - b.index)
    .map(({ request }) => request)
  const open = requests.find((request) => request.id === openId) || null
  const categoryOf = (request) => categories.find((category) => category.id === request?.porCategory?.id)

  const startNew = () => {
    setPendingDoc(false)
    setForm({ editing: null, data: createDefaultForm() })
  }
  const startEdit = (request) => {
    setOpenId(null)
    setPendingDoc(false)
    setForm({
      editing: request,
      data: {
        porCategoryId: request.porCategory?.id || "",
        hasDisciplinaryAction: Boolean(request.hasDisciplinaryAction),
        disciplinaryActionDetails: request.disciplinaryActionDetails || "",
        positionTitle: request.positionTitle || "",
        positionDetails: request.positionDetails || "",
        tenure: request.tenure || "",
        supportingDocumentUrl: request.supportingDocumentUrl || "",
        supportingDocumentName: request.supportingDocumentName || "",
        undertakingAccepted: Boolean(request.undertakingAccepted),
      },
    })
  }
  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => {
      const data = { ...current.data, [name]: type === "checkbox" ? checked : value }
      if (name === "hasDisciplinaryAction" && !checked) data.disciplinaryActionDetails = ""
      return { ...current, data }
    })
  }
  // Everything still needed, in form order, so the footer never drip-feeds one field at a time.
  const missingFor = (data) => {
    if (pendingDoc) return "Wait for the PDF to finish uploading."
    const blank = (value) => !String(value || "").trim()
    const todo = [
      blank(data.porCategoryId) && "club or body",
      blank(data.positionTitle) && "position",
      blank(data.tenure) && "tenure",
      blank(data.positionDetails) && "what you did",
      blank(data.supportingDocumentUrl) && "supporting PDF",
      data.hasDisciplinaryAction !== true && data.hasDisciplinaryAction !== false && "disciplinary question",
      data.hasDisciplinaryAction === true && blank(data.disciplinaryActionDetails) && "disciplinary details",
      !data.undertakingAccepted && "declaration",
    ].filter(Boolean)
    if (todo.length === 0) return ""
    if (todo.length === 1) return `Still needed: ${todo[0]}.`
    if (todo.length === 2) return `Still needed: ${todo[0]} and ${todo[1]}.`
    return `Still needed: ${todo[0]}, ${todo[1]} and ${todo.length - 2} more.`
  }
  const submit = async () => {
    const data = form.data
    const missing = missingFor(data)
    if (missing) {
      toast.error(missing)
      return
    }
    setSaving(true)
    try {
      if (form.editing) await porApi.update(form.editing.id, data)
      else await porApi.create(data)
      toast.success(form.editing ? "Resubmitted for review." : "POR request sent for review.")
      setForm(null)
      await queryClient.invalidateQueries({ queryKey: ["por"] })
    } catch (error) {
      toast.error(error?.message || "Couldn't save it. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const list = () => {
    if (query.isPending) return <Ghosts count={3} />
    if (query.isError && !query.data) return <ErrorCard text="Couldn't load your POR requests." onRetry={() => query.refetch()} />
    if (query.data?.viewer?.mode && query.data.viewer.mode !== "student") return <EmptyCard icon={CircleAlert} title="Not available" text="Your account isn't set up for POR requests." />
    if (requests.length === 0) {
      return (
        <EmptyCard
          icon={Award}
          title="No POR requests yet"
          text="Held a position in a club, council or fest team? Send it here. Gymkhana and Student Affairs verify it, then you can download a certificate."
          action={
            canCreate ? (
              <button type="button" className="mk-btn mk-btn--primary" onClick={startNew}>
                <Plus size={18} /> New POR request
              </button>
            ) : null
          }
        />
      )
    }
    return (
      <ul className="mk-list">
        {shown.map((request) => {
          const bucket = bucketOf(request.status)
          const icon = bucket === "approved" ? BadgeCheck : bucket === "rejected" ? X : bucket === "changes" ? PencilLine : FileText
          return (
            <li key={request.id}>
              <Row
                lead={<Lead icon={icon} tone={BUCKET[bucket].tone} />}
                title={request.positionTitle || "POR request"}
                meta={[request.porCategoryName, request.tenure].filter(Boolean).join(" · ")}
                onClick={() => setOpenId(request.id)}
              >
                <span className="mk-row__status">
                  <Pill tone={BUCKET[bucket].tone}>{BUCKET[bucket].label}</Pill>
                  {bucket === "review" && request.currentApprovalStage && <span className="mk-sub">with {stageName(request.currentApprovalStage)}</span>}
                </span>
              </Row>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <ModalOverrideContext.Provider value={renderSheetModal}>
      <div className={`mk-page${canCreate && requests.length ? " mk-page--fab" : ""}`}>
        <h1 className="mk-title">Positions (POR)</h1>
        <p className="mk-sub mk-lede">Positions of responsibility, verified for your record and certificate.</p>
        {requests.length > 0 && (
          <div className="mk-scroll-x">
            <Segmented label="Filter by status" options={filters} value={shownFilter} onChange={setFilter} />
          </div>
        )}
        {list()}

        {canCreate && requests.length > 0 && (
          <button type="button" className="mk-fab" onClick={startNew} aria-label="New POR request">
            <Plus size={22} strokeWidth={2.5} />
            <span>New</span>
          </button>
        )}

        {open && <RequestSheet request={open} category={categoryOf(open)} onClose={() => setOpenId(null)} onEdit={() => startEdit(open)} />}

        {form && (
          <PhonePorForm
            categories={categories}
            data={form.data}
            onChange={change}
            onClose={() => setForm(null)}
            onSubmit={submit}
            onUploadingChange={setPendingDoc}
            saving={saving}
            editing={Boolean(form.editing)}
            missing={missingFor(form.data)}
          />
        )}
      </div>
    </ModalOverrideContext.Provider>
  )
}

export default PhonePor
