import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronRight, ClipboardCheck, Plus } from "lucide-react"
import { useToast } from "hzero"
import { complaintsListQuery, complaintStatsQuery } from "../phoneQueries"
import { queryKeys } from "../../../lib/query"
import Segmented from "../kit/Segmented"
import ComplaintSheet from "./ComplaintSheet"
import NewComplaintSheet from "./NewComplaintSheet"
import { CategoryIcon, statusMeta, StatusTrack, timeAgo } from "./complaintBits"

export const OPEN_STATUSES = "Pending,In Progress,Forwarded to IDO"
const CLOSED_STATUSES = "Resolved,Rejected"
const FILTERS = [
  { value: "all", label: "All", count: (stats) => stats.total },
  { value: OPEN_STATUSES, label: "Open", count: (stats) => (stats.pending || 0) + (stats.inProgress || 0) + (stats.forwardedToIDO || 0) },
  { value: CLOSED_STATUSES, label: "Closed", count: (stats) => Math.max(0, (stats.total || 0) - (stats.pending || 0) - (stats.inProgress || 0) - (stats.forwardedToIDO || 0)) },
]

/** Students on a phone: their complaints as one list, a filter row, and a button to raise a new one. */
const PhoneComplaints = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [status, setStatus] = useState(location.state?.complaints === "open" ? OPEN_STATUSES : "all")
  const [open, setOpen] = useState(null)
  const [creating, setCreating] = useState(false)

  const listQuery = useInfiniteQuery(complaintsListQuery(status))
  const statsQuery = useQuery(complaintStatsQuery())
  const stats = statsQuery.data?.data || statsQuery.data || null

  const items = useMemo(() => (listQuery.data?.pages || []).flatMap((page) => page?.data?.items || []), [listQuery.data])
  const openComplaint = open ? items.find((item) => item.id === open.id) || open : null
  const filters = FILTERS.map(({ count, ...filter }) => ({ ...filter, count: stats ? count(stats) || 0 : undefined }))

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard.all })
  }

  const renderList = () => {
    if (listQuery.isPending) {
      return (
        <ul className="mk-list" aria-busy="true">
          {[0, 1, 2, 3].map((n) => (
            <li key={n} className="mc-row mc-row--ghost">
              <span className="mk-shimmer mc-row__ghost-icon" />
              <span className="mc-row__ghost-lines">
                <span className="mk-shimmer" />
                <span className="mk-shimmer" />
              </span>
            </li>
          ))}
        </ul>
      )
    }
    if (listQuery.isError && !listQuery.data) {
      return (
        <div className="mk-empty">
          <p>Couldn&apos;t load your complaints.</p>
          <button type="button" className="mk-btn mk-btn--soft" onClick={() => listQuery.refetch()}>
            Try again
          </button>
        </div>
      )
    }
    if (items.length === 0) {
      return (
        <div className="mk-empty">
          <span className="mk-empty__icon">
            <ClipboardCheck size={28} />
          </span>
          <p className="mk-empty__title">{status === "all" ? "No complaints yet" : status === OPEN_STATUSES ? "Nothing open" : "Nothing closed yet"}</p>
          <p className="mk-sub">{status === "all" ? "Something broken in your room? Tap New to tell us." : status === OPEN_STATUSES ? "Every complaint you raised has been dealt with." : "Fixed or rejected complaints show here."}</p>
        </div>
      )
    }
    return (
      <>
        <ul className="mk-list">
          {items.map((complaint) => {
            const meta = statusMeta(complaint.status)
            return (
              <li key={complaint.id}>
                <button type="button" className="mc-row" onClick={() => setOpen(complaint)}>
                  <CategoryIcon category={complaint.category} />
                  <span className="mc-row__main">
                    <span className="mc-row__title">{complaint.title}</span>
                    <span className="mc-row__meta">
                      {complaint.category} · {timeAgo(complaint.createdDate)}
                    </span>
                    <span className="mc-row__status" data-tone={meta.tone}>
                      <StatusTrack status={complaint.status} />
                      {meta.label}
                      {complaint.status === "Resolved" && !complaint.feedbackRating && <span className="mc-row__ask">Rate it</span>}
                    </span>
                  </span>
                  <ChevronRight size={18} className="mc-row__chev" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
        {listQuery.hasNextPage && (
          <button type="button" className="mk-btn mk-btn--soft mc-more" disabled={listQuery.isFetchingNextPage} onClick={() => listQuery.fetchNextPage()}>
            {listQuery.isFetchingNextPage ? "Loading…" : "Show older"}
          </button>
        )}
      </>
    )
  }

  return (
    <div className="mk-page mk-page--fab">
      <h1 className="mk-title">Issues</h1>
      <p className="mk-sub mk-lede">Complaints you&apos;ve raised about your room or hostel, and where each one is.</p>
      <div className="mk-scroll-x">
        <Segmented label="Filter by status" options={filters} value={status} onChange={setStatus} />
      </div>
      {renderList()}

      <button type="button" className="mk-fab" onClick={() => setCreating(true)} aria-label="New complaint">
        <Plus size={22} strokeWidth={2.5} />
        <span>New</span>
      </button>

      {openComplaint && <ComplaintSheet complaint={openComplaint} onClose={() => setOpen(null)} onChanged={refresh} />}
      {creating && (
        <NewComplaintSheet
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            setStatus("all")
            refresh()
            toast.success("Complaint sent. We'll keep you posted here.")
          }}
        />
      )}
    </div>
  )
}

export default PhoneComplaints
