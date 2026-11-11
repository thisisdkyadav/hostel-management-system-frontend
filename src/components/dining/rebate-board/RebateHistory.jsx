import { useQuery } from "@tanstack/react-query"
import { Archive, ArchiveRestore, CheckCircle2, Pencil, Plus, Send, XCircle } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningRebateBoardApi } from "@/service"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { STATES, TYPES, formatWhen, personName, shortDate, toKey } from "./rebateBoardHelpers"

const FIELDS = {
  startDate: "First day",
  endDate: "Last day",
  dayCount: "Days",
  type: "Type",
  status: "Status",
  reason: "Student's message",
  adminComment: "Office comment",
}

const show = (field, value) => {
  if (value === null || value === undefined || value === "") return "—"
  if (field === "startDate" || field === "endDate") return shortDate(toKey(value))
  if (field === "type") return TYPES[value]?.label || value
  if (field === "status") return STATES[value]?.label || value
  return String(value)
}

/** What one history entry was, in words, with an icon and a tone. */
const describe = (item) => {
  const fields = (item.changes || []).map((change) => change.field)
  if (item.action === "create") return { icon: Plus, tone: "info", title: "Added by the office" }
  if (item.action === "delete") return { icon: Archive, tone: "none", title: "Archived" }
  if (item.action === "restore") return { icon: ArchiveRestore, tone: "info", title: "Restored" }
  const status = item.changes?.find((change) => change.field === "status")
  if (status && fields.every((field) => ["status", "adminComment"].includes(field))) {
    if (status.to === "approved") return { icon: CheckCircle2, tone: "ok", title: "Approved" }
    if (status.to === "rejected") return { icon: XCircle, tone: "bad", title: "Rejected" }
  }
  return { icon: Pencil, tone: "warn", title: "Edited" }
}

/** A rebate's story: the request, then every office change, newest first. */
const RebateHistory = ({ rebate }) => {
  const history = useQuery({
    queryKey: queryKeys.diningRebateBoard.history(rebate.id),
    queryFn: () => diningRebateBoardApi.history(rebate.id),
  })
  const items = history.data?.items || []
  const hasCreate = items.some((item) => item.action === "create")

  if (history.isLoading) return <p className="rn-hint">Loading…</p>
  if (history.isError) return <p className="rc-feedback">{getErrorMessage(history.error, "Couldn't load the history.")}</p>

  return (
    <div className="rb-modal">
      <ol className="rb-history">
        {items.map((item) => {
          const what = describe(item)
          const Icon = what.icon
          const changes = (item.changes || []).filter((change) => FIELDS[change.field] && !(what.title !== "Edited" && change.field === "status"))
          return (
            <li key={item.id}>
              <span className="rb-history__dot" data-tone={what.tone}>
                <Icon size={14} aria-hidden="true" />
              </span>
              <div className="rb-history__body">
                <span>
                  <b>{what.title}</b> by {item.actor?.isSystem ? "the system" : personName(item.actor, "staff")}
                </span>
                <small>{formatWhen(item.at)}</small>
                {item.action === "update" && changes.length > 0 && (
                  <div className="rb-history__changes">
                    {changes.map((change) => (
                      <span key={change.field}>
                        {FIELDS[change.field]}: <s>{show(change.field, change.from)}</s> → {show(change.field, change.to)}
                      </span>
                    ))}
                  </div>
                )}
                {item.reason && <span className="rb-history__reason">“{item.reason}”</span>}
              </div>
            </li>
          )
        })}
        {!hasCreate && (
          <li>
            <span className="rb-history__dot" data-tone="info">
              <Send size={14} aria-hidden="true" />
            </span>
            <div className="rb-history__body">
              <span>
                <b>Requested</b> by the student
              </span>
              <small>{formatWhen(rebate.createdAt)}</small>
            </div>
          </li>
        )}
      </ol>
      {items.length === 0 && <p className="rn-hint">No office changes yet.</p>}
    </div>
  )
}

export default RebateHistory
