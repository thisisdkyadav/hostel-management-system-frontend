import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, FileSignature } from "lucide-react"
import { useToast } from "hzero"
import { undertakingApi } from "../../../service"
import { queryKeys } from "../../../lib/query"
import Segmented from "../kit/Segmented"
import PhoneSheet from "../kit/PhoneSheet"
import { EmptyCard, ErrorCard, Ghosts, Lead, Pill, Row, shortDate } from "../kit/ListBits"
import { undertakingListsQuery } from "../phoneQueries"

const dueLine = (deadline) => {
  if (!deadline) return ""
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  if (days < 0) return `Overdue since ${shortDate(deadline)}`
  if (days === 0) return "Due today"
  if (days === 1) return "Due tomorrow"
  return `Due ${shortDate(deadline)}`
}

/** Read an undertaking in full and accept it. */
const UndertakingSheet = ({ id, accepted, onClose }) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [agreed, setAgreed] = useState(false)
  const detail = useQuery({ queryKey: queryKeys.undertakings.detail(id), queryFn: () => undertakingApi.getUndertakingDetails(id) })
  const item = detail.data?.undertaking || null
  const accept = useMutation({
    mutationFn: () => undertakingApi.acceptUndertaking(id),
    onSuccess: async () => {
      toast.success("Undertaking accepted.")
      onClose()
      await queryClient.invalidateQueries({ queryKey: queryKeys.undertakings.all })
    },
    onError: () => toast.error("Couldn't accept it. Please try again."),
  })

  return (
    <PhoneSheet
      title=""
      label={item?.title || "Undertaking"}
      onClose={onClose}
      tall
      footer={
        !accepted && item ? (
          <button type="button" className="mk-btn mk-btn--primary" disabled={!agreed || accept.isPending} onClick={() => accept.mutate()}>
            {accept.isPending ? "Accepting…" : "Accept undertaking"}
          </button>
        ) : null
      }
    >
      {detail.isPending ? (
        <Ghosts count={2} />
      ) : !item ? (
        <ErrorCard text="Couldn't open this undertaking." onRetry={() => detail.refetch()} />
      ) : (
        <div className="mc-detail">
          <div className="mc-detail__titles">
            <h2 className="mc-detail__title">{item.title}</h2>
            <span className="mk-sub">{accepted ? "You accepted this" : dueLine(item.deadline)}</span>
          </div>
          {item.description && <p className="mc-text">{item.description}</p>}
          <section className="mc-note mu-content">
            <p className="mc-text">{item.content}</p>
          </section>
          {!accepted && (
            <label className="mk-check">
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>I have read and understood this undertaking and agree to abide by it.</span>
            </label>
          )}
        </div>
      )}
    </PhoneSheet>
  )
}

/** Undertakings to accept, and the ones you already have. */
const PhoneUndertakings = () => {
  const query = useQuery(undertakingListsQuery())
  const pending = query.data?.pendingUndertakings || []
  const accepted = query.data?.acceptedUndertakings || []
  const [tab, setTab] = useState(null)
  const shown = tab || (pending.length || !accepted.length ? "pending" : "accepted")
  const [open, setOpen] = useState(null) // { id, accepted }
  const items = shown === "pending" ? pending : accepted
  const tabs = [
    { value: "pending", label: "To accept", count: query.data ? pending.length : undefined },
    { value: "accepted", label: "Accepted", count: query.data ? accepted.length : undefined },
  ]

  const list = () => {
    if (query.isPending) return <Ghosts count={3} />
    if (query.isError && !query.data) return <ErrorCard text="Couldn't load undertakings." onRetry={() => query.refetch()} />
    if (items.length === 0) {
      return shown === "pending" ? <EmptyCard icon={Check} title="You're up to date" text="Nothing is waiting for you to accept. When the hostel office asks you to accept a rule or declaration, like the code of conduct, it shows up here." /> : <EmptyCard icon={FileSignature} title="None accepted yet" />
    }
    return (
      <ul className="mk-list">
        {items.map((item) => {
          const overdue = shown === "pending" && item.deadline && new Date(item.deadline) < new Date()
          return (
            <li key={item.id}>
              <Row
                lead={<Lead icon={FileSignature} tone={shown === "pending" ? (overdue ? "danger" : "warning") : "success"} />}
                title={item.title}
                meta={shown === "pending" ? dueLine(item.deadline) : `Accepted ${shortDate(item.acceptedAt, true)}`}
                trailing={shown === "pending" ? <Pill tone={overdue ? "danger" : "warning"}>Read</Pill> : undefined}
                onClick={() => setOpen({ id: item.id, accepted: shown === "accepted" })}
              />
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="mk-page">
      <h1 className="mk-title">Undertakings</h1>
      {(pending.length > 0 || accepted.length > 0) && (
        <div className="mk-scroll-x">
          <Segmented label="Undertakings" options={tabs} value={shown} onChange={setTab} />
        </div>
      )}
      {list()}
      {open && <UndertakingSheet id={open.id} accepted={open.accepted} onClose={() => setOpen(null)} />}
    </div>
  )
}

export default PhoneUndertakings
