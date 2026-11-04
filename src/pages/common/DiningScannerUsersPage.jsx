import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, ConfirmDialog, DataTable, Page, Pagination, SearchInput } from "hzero"
import { ImageUp, X } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import { getMediaUrl } from "@/utils/mediaUtils"
import ScannerOverview from "@/components/dining/scanner-users/ScannerOverview"
import ScannerStudentModal from "@/components/dining/scanner-users/ScannerStudentModal"
import { STATUS, isChecking } from "@/components/dining/scanner-users/scannerUsersHelpers"
import "@/components/dining/scanner-users/ScannerUsers.css"

const PAGE_SIZE = 10

/** Groups staff can open. Values are what the list endpoint filters on. */
const FILTERS = [
  {
    value: "missing",
    label: "No photo",
    empty: "Every active student has a photo.",
  },
  {
    value: "failed",
    label: "Refused",
    empty: "No machine has refused a photo.",
  },
  {
    value: "pending",
    label: "Sending",
    empty: "Nothing is on its way to the machines.",
  },
  {
    value: "mismatch",
    label: "Wrong photo on machine",
    empty: "Every machine that was checked holds the HMS photo.",
  },
  {
    value: "noFace",
    label: "No face made",
    empty: "Every machine made a face from the photos it was checked for.",
  },
  {
    value: "unchecked",
    label: "Not checked",
    empty: "Every photo has been fetched back from every machine.",
  },
  {
    value: "valid",
    label: "On every machine",
    empty: "No photo is on every machine yet.",
  },
]

/** Groups only reachable from the overview's legend. */
const OVERVIEW_ONLY = {
  match: {
    label: "Same photo, face made",
    empty: "No machine has sent back a matching photo yet.",
  },
  checking: {
    label: "Being checked",
    empty: "Nothing is being checked right now.",
  },
}

/** Small thumbnail: the scanner photo, else the profile photo. */
const Thumb = ({ row }) => {
  const url = row.photo.present ? diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version) : row.profileImage ? getMediaUrl(row.profileImage) : ""
  return (
    <span className="su-thumb" data-faded={!row.photo.present || undefined}>
      {url ? <img src={url} alt="" loading="lazy" /> : null}
    </span>
  )
}

/**
 * Scanner photos (Admin and Dining Office). The page opens on an overview of
 * where every active student's face photo stands; searching or picking a group
 * lists students 10 at a time, and a student opens in a detail view with the
 * photos and each machine's state.
 */
const DiningScannerUsersPage = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [confirmBulk, setConfirmBulk] = useState(false)
  const search = useDebouncedValue(searchInput.trim(), 300)
  const listing = Boolean(search || filter)

  const stats = useQuery({
    queryKey: [...queryKeys.diningScannerUsers.all, "stats"],
    queryFn: () => diningScannerUsersApi.stats(),
    refetchInterval: (current) => (current.state.data?.profileJob?.running ? 5000 : 60_000),
  })
  const params = { status: filter || "all", search, page, limit: PAGE_SIZE }
  const list = useQuery({
    queryKey: queryKeys.diningScannerUsers.list(params),
    queryFn: () => diningScannerUsersApi.list(params),
    enabled: listing,
    placeholderData: keepPreviousData,
    refetchInterval: (current) => (current.state.data?.items?.some(isChecking) ? 5000 : false),
  })

  const bulk = useMutation({
    mutationFn: () => diningScannerUsersApi.useProfilePhotos(),
    onSuccess: (result) =>
      setFeedback({
        type: "info",
        message: `Using profile photos for ${result.total} students. Progress shows here.`,
      }),
    onError: (error) =>
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Couldn't start using profile photos."),
      }),
    onSettled: () => {
      setConfirmBulk(false)
      queryClient.invalidateQueries({
        queryKey: queryKeys.diningScannerUsers.all,
      })
    },
  })

  const pick = (next) => {
    setFilter((current) => (current === next ? "" : next))
    setPage(1)
  }
  const reset = () => {
    setFilter("")
    setSearchInput("")
    setPage(1)
  }

  const overview = stats.data
  const job = overview?.profileJob
  const data = list.data
  const items = listing ? data?.items || [] : []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const active = FILTERS.find((f) => f.value === filter) || OVERVIEW_ONLY[filter]

  const columns = [
    {
      key: "photo",
      header: "",
      width: 56,
      render: (row) => <Thumb row={row} />,
    },
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div className="su-who">
          <strong>{row.name || "-"}</strong>
          <span>{row.rollNumber}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "",
      align: "right",
      render: (row) => {
        const badge = STATUS[row.photoStatus] || STATUS.missing
        return (
          <span className="su-dot" data-tone={badge.tone}>
            {badge.label}
          </span>
        )
      },
    },
  ]

  const summary = () => {
    if (list.isLoading) return "Looking…"
    const who = `${total.toLocaleString("en-IN")} student${total === 1 ? "" : "s"}`
    if (search && active) return `${who} in "${active.label}" match "${search}"`
    if (search) return `${who} match "${search}"`
    return `${who}: ${active?.label || filter}`
  }

  return (
    <Page>
      <PageHeader title="Scanner Photos" subtitle="The face photo each active student has on the mess face machines.">
        <Button variant="secondary" onClick={() => setConfirmBulk(true)} disabled={job?.running || bulk.isPending || !overview?.missingWithProfile}>
          <ImageUp size={18} /> Use profile photos
        </Button>
      </PageHeader>

      <Page.Body>
        <div className="su-alerts">
          {job?.running && (
            <Alert type="info" icon>
              Using profile photos: {job.done} of {job.total} done ({job.sent} saved, {job.unusable} can&apos;t be used).
            </Alert>
          )}
          {job && !job.running && job.finishedAt && (
            <Alert type={job.error ? "warning" : "info"} icon dismissible>
              Profile photos {formatDateTime(job.finishedAt)}: {job.sent} saved, {job.unusable} couldn&apos;t be used
              {job.failed ? `, ${job.failed} failed` : ""}.
            </Alert>
          )}
          {feedback && (
            <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          )}
        </div>

        <div className="su-finder">
          <SearchInput
            className="su-finder__search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value)
              setPage(1)
            }}
            placeholder="Find a student by roll number or name"
            aria-label="Find a student by roll number or name"
          />
          <div className="su-chips" role="group" aria-label="Show a group">
            {FILTERS.map((option) => (
              <button key={option.value} type="button" className="su-chip" aria-pressed={filter === option.value} onClick={() => pick(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {!listing ? (
          stats.isError ? (
            <Alert type="error" icon>
              {getErrorMessage(stats.error, "Couldn't load the overview.")}
            </Alert>
          ) : (
            <ScannerOverview stats={overview} onPick={pick} />
          )
        ) : list.isError ? (
          <Alert type="error" icon>
            {getErrorMessage(list.error, "Couldn't load the students.")}
          </Alert>
        ) : (
          <section className="su-results" aria-live="polite">
            <div className="su-results__head">
              <span>{summary()}</span>
              <Button variant="ghost" size="sm" onClick={reset}>
                <X size={15} /> Back to overview
              </Button>
            </div>
            <div className="su-table" data-stale={list.isPlaceholderData || undefined}>
              <DataTable
                data={items}
                columns={columns}
                loading={list.isLoading}
                getRowId={(row) => row.rollNumber}
                onRowClick={(row) => setOpen(row)}
                emptyMessage={search ? `Nobody matches "${search}".` : active?.empty || "Nobody here."}
              />
            </div>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} paginate={setPage} />}
          </section>
        )}
      </Page.Body>

      {open && <ScannerStudentModal row={open} onClose={() => setOpen(null)} />}

      {confirmBulk && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmBulk(false)}
          onConfirm={() => bulk.mutate()}
          title="Use profile photos as scanner photos?"
          message={`${overview?.missingWithProfile || 0} active students have no scanner photo but have an HMS profile photo. Each one not tried before gets it as their scanner photo. Students whose photo can't be used or is refused by a machine must send one themselves.`}
          confirmText="Use profile photos"
          cancelText="Cancel"
        />
      )}
    </Page>
  )
}

export default DiningScannerUsersPage
