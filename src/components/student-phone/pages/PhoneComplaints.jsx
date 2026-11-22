import { useMemo, useState } from "react"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronRight, ClipboardCheck, Plus } from "lucide-react"
import { useToast } from "hzero"
import { adminApi, complaintApi } from "../../../service"
import { queryKeys } from "../../../lib/query"
import Segmented from "../kit/Segmented"
import ComplaintSheet from "./ComplaintSheet"
import NewComplaintSheet from "./NewComplaintSheet"
import { CategoryIcon, statusMeta, StatusTrack, timeAgo } from "./complaintBits"

const PAGE_SIZE = 15

const FILTERS = [
  { value: "all", label: "All", stat: "total" },
  { value: "Pending", label: "Pending", stat: "pending" },
  { value: "In Progress", label: "In progress", stat: "inProgress" },
  { value: "Resolved", label: "Resolved", stat: "resolved" },
]

const fetchPage = (status, page) => {
  const params = new URLSearchParams()
  if (status !== "all") params.append("status", status)
  params.append("page", page)
  params.append("limit", PAGE_SIZE)
  return adminApi.getAllComplaints(params.toString())
}

/** Students on a phone: their complaints as one list, a filter row, and a button to raise a new one. */
const PhoneComplaints = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState("all")
  const [open, setOpen] = useState(null)
  const [creating, setCreating] = useState(false)

  const listQuery = useInfiniteQuery({
    queryKey: [...queryKeys.complaints.list({ status, phone: true })],
    queryFn: ({ pageParam }) => fetchPage(status, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => {
      const totalPages = last?.data?.pagination?.totalPages || 1
      return pages.length < totalPages ? pages.length + 1 : undefined
    },
  })
  const statsQuery = useQuery({ queryKey: queryKeys.complaints.stats(null), queryFn: () => complaintApi.getStats({}) })
  const stats = statsQuery.data?.data || statsQuery.data || null

  const items = useMemo(() => (listQuery.data?.pages || []).flatMap((page) => page?.data?.items || []), [listQuery.data])
  const filters = FILTERS.map((filter) => ({ ...filter, count: stats ? stats[filter.stat] || 0 : undefined }))

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard.all })
  }

  const renderList = () => {
    if (listQuery.isPending) {
      return (
        <ul className="mc-list" aria-busy="true">
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
    if (listQuery.isError) {
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
          <p className="mk-empty__title">{status === "all" ? "No complaints yet" : `Nothing ${statusMeta(status).label.toLowerCase()}`}</p>
          <p className="mk-sub">{status === "all" ? "Something broken in your room? Tap + to tell us." : "Try another filter."}</p>
        </div>
      )
    }
    return (
      <>
        <ul className="mc-list">
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
      <h1 className="mk-title">Complaints</h1>
      <div className="mk-scroll-x">
        <Segmented label="Filter by status" options={filters} value={status} onChange={setStatus} />
      </div>
      {renderList()}

      <button type="button" className="mk-fab" onClick={() => setCreating(true)} aria-label="New complaint">
        <Plus size={22} strokeWidth={2.5} />
        <span>New</span>
      </button>

      {open && <ComplaintSheet complaint={open} onClose={() => setOpen(null)} onChanged={refresh} />}
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
