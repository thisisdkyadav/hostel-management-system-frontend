import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, Modal, Page, Pagination, SearchInput, Tabs, Textarea } from "hzero"
import { CheckCircle2, RefreshCw, ScanFace, XCircle } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningBioPhotosApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import "@/components/dining/bio-photos/BioPhotos.css"

const PAGE_SIZE = 24
const MAX_REASON = 300

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
]

const EMPTY = {
  pending: "No photos are waiting for approval.",
  approved: "No photos have been sent to the scanners yet.",
  rejected: "No photos have been rejected.",
  cancelled: "No requests have been cancelled.",
}

const Photo = ({ src, label, empty }) => (
  <figure className="bp-photo">
    {src ? (
      <a href={src} target="_blank" rel="noreferrer" title="Open full size">
        <img src={src} alt={label} loading="lazy" />
      </a>
    ) : (
      <div className="bp-photo__empty">{empty}</div>
    )}
    <figcaption>{label}</figcaption>
  </figure>
)

const RequestCard = ({ item, onApprove, onReject, busy }) => {
  const pending = item.status === "pending"
  const student = item.student || {}
  return (
    <article className="bp-card" data-error={item.lastError ? "" : undefined}>
      <header className="bp-card__head">
        <div className="bp-card__who">
          <strong>{student.name || item.rollNumber}</strong>
          <span>
            {item.rollNumber}
            {student.hostel ? ` · ${student.hostel}` : ""}
          </span>
        </div>
        <time className="bp-card__time">{formatDateTime(item.createdAt)}</time>
      </header>

      <div className="bp-card__photos">
        <Photo src={getMediaUrl(student.profileImage)} label="HMS profile" empty="No profile photo" />
        <Photo src={getMediaUrl(item.photo?.ref)} label={`New · ${item.photo?.width}×${item.photo?.height}`} empty="Photo missing" />
      </div>

      {item.note && <p className="bp-card__note">&ldquo;{item.note}&rdquo;</p>}

      {pending && item.lastError && (
        <Alert type="error" icon>
          Couldn&apos;t use this photo: {item.lastError}
        </Alert>
      )}
      {item.status === "approved" && (
        <p className="bp-card__meta">
          Approved {formatDateTime(item.pushedAt || item.reviewedAt)}
          {item.reviewedBy ? ` by ${item.reviewedBy}` : ""}
        </p>
      )}
      {item.status === "rejected" && (
        <p className="bp-card__meta">
          Rejected{item.reviewedBy ? ` by ${item.reviewedBy}` : ""}: {item.reviewComment}
        </p>
      )}

      {pending && (
        <footer className="bp-card__actions">
          <Button variant="secondary" size="sm" onClick={() => onReject(item)} disabled={busy}>
            <XCircle size={15} /> Reject
          </Button>
          <Button variant="primary" size="sm" onClick={() => onApprove(item)} loading={busy} disabled={busy}>
            {item.lastError ? <RefreshCw size={15} /> : <CheckCircle2 size={15} />} {item.lastError ? "Retry" : "Approve"}
          </Button>
        </footer>
      )}
    </article>
  )
}

const RejectModal = ({ item, onClose, onSubmit, isSubmitting, error }) => {
  const [reason, setReason] = useState("")
  const trimmed = reason.trim()
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Reject photo · ${item.student?.name || item.rollNumber}`}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onSubmit(trimmed)} loading={isSubmitting} disabled={!trimmed || isSubmitting}>
            Reject
          </Button>
        </>
      }
    >
      <div className="bp-form">
        <Field label="Reason (the student sees this)" htmlFor="bp-reject-reason" required>
          <Textarea
            id="bp-reject-reason"
            rows={3}
            maxLength={MAX_REASON}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Face is partly covered. Please send a photo without a mask."
          />
        </Field>
        {error && (
          <Alert type="error" icon>
            {error}
          </Alert>
        )}
      </div>
    </Modal>
  )
}

/**
 * Students' requests to change their face-scanner photo (Admin and Dining Office).
 * Approving makes it the student's scanner photo in HMS; every face machine gets it within a couple of minutes.
 */
const DiningBioPhotosPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState("pending")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [approving, setApproving] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const search = useDebouncedValue(searchInput.trim(), 300)

  const params = { status, search, page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.diningBioPhotos.list(params),
    queryFn: () => diningBioPhotosApi.list(params),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningBioPhotos.all })
  const nameOf = (item) => item.student?.name || item.rollNumber

  const approve = useMutation({
    mutationFn: (item) => diningBioPhotosApi.approve(item.id),
    onSuccess: (_, item) => {
      setFeedback({ type: "success", message: `${nameOf(item)}'s photo was approved. The face scanners get it within a couple of minutes.` })
      setApproving(null)
    },
    onError: (error, item) => {
      setFeedback({ type: "error", message: `${nameOf(item)}: ${getErrorMessage(error, "Couldn't approve the photo.")}` })
      setApproving(null)
    },
    onSettled: refresh,
  })
  const reject = useMutation({
    mutationFn: ({ item, comment }) => diningBioPhotosApi.reject(item.id, comment),
    onSuccess: (_, { item }) => {
      setFeedback({ type: "success", message: `${nameOf(item)}'s photo was rejected.` })
      setRejecting(null)
    },
    onSettled: refresh,
  })

  const data = query.data
  const items = data?.items || []
  const counts = data?.counts || {}
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / PAGE_SIZE))

  return (
    <Page>
      <PageHeader title="Bio Photos" subtitle="Check students' new face scanner photos. Approving sends the photo to every face scanner.">
        <Button variant="secondary" onClick={refresh}>
          <RefreshCw size={18} /> Refresh
        </Button>
      </PageHeader>

      <Page.Body>
        <div className="bp-toolbar">
          <Tabs
            variant="pills"
            tabs={STATUS_TABS.map((tab) => ({ ...tab, count: counts[tab.value] || undefined }))}
            activeTab={status}
            setActiveTab={(next) => {
              setStatus(next)
              setPage(1)
            }}
          />
          <SearchInput
            className="bp-toolbar__search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value)
              setPage(1)
            }}
            placeholder="Search name or roll number"
            size="sm"
            aria-label="Search by name or roll number"
          />
        </div>

        {feedback && (
          <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        {query.isLoading ? (
          <LoadingState message="Loading photos…" />
        ) : query.isError ? (
          <ErrorState message={getErrorMessage(query.error, "Couldn't load the requests.")} onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={ScanFace} title={search ? "No matches" : "Nothing here"} message={search ? `No ${status} requests match "${search}".` : EMPTY[status]} />
        ) : (
          <>
            <div className="bp-grid" data-stale={query.isPlaceholderData || undefined}>
              {items.map((item) => (
                <RequestCard
                  key={item.id}
                  item={item}
                  busy={approve.isPending && approve.variables?.id === item.id}
                  onApprove={setApproving}
                  onReject={(row) => {
                    reject.reset()
                    setRejecting(row)
                  }}
                />
              ))}
            </div>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} paginate={setPage} />}
          </>
        )}
      </Page.Body>

      {approving && (
        <ConfirmDialog
          isOpen
          onClose={() => setApproving(null)}
          onConfirm={() => approve.mutate(approving)}
          title="Approve this photo?"
          message={`${nameOf(approving)} (${approving.rollNumber}): the new photo replaces their current one on every face scanner within a couple of minutes.`}
          confirmText={approving.lastError ? "Try again" : "Approve"}
          cancelText="Cancel"
        />
      )}
      {rejecting && (
        <RejectModal
          item={rejecting}
          onClose={() => setRejecting(null)}
          onSubmit={(comment) => reject.mutate({ item: rejecting, comment })}
          isSubmitting={reject.isPending}
          error={reject.isError ? getErrorMessage(reject.error, "Couldn't reject the request.") : ""}
        />
      )}
    </Page>
  )
}

export default DiningBioPhotosPage
