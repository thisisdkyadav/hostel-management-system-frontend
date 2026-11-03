import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, ConfirmDialog, DataTable, Page, Pagination, SearchInput, StatusBadge, Tabs } from "hzero"
import { ImageUp } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import "@/components/dining/scanner-users/ScannerUsers.css"

const PAGE_SIZE = 50

const STATUS = {
  valid: { label: "On all machines", tone: "success" },
  pending: { label: "Sending", tone: "warning" },
  failed: { label: "Refused", tone: "danger" },
  missing: { label: "No photo", tone: "neutral" },
}

const TABS = [
  { value: "all", label: "All" },
  { value: "valid", label: "On all machines" },
  { value: "missing", label: "No photo" },
  { value: "failed", label: "Refused" },
  { value: "pending", label: "Sending" },
]

const EMPTY = {
  all: "No active students.",
  valid: "No photo is on every machine yet.",
  missing: "Every active student has a photo.",
  failed: "No machine has refused a photo.",
  pending: "Nothing is on its way to the machines.",
}

const MACHINE = {
  ok: { mark: "✓", title: "Has this photo" },
  waiting: { mark: "…", title: "Not there yet. Machines that are switched off get it when they come back." },
  refused: { mark: "✕", title: "Refused this photo. The student needs a clearer one." },
}

const ATTEMPT = { sent: "Used", unusable: "Can't use", failed: "Failed" }

const Machines = ({ row }) => {
  if (!row.photo.present) return <span className="su-note">-</span>
  if (!row.machines.length) return <span className="su-note">No machine kept in sync</span>
  return (
    <div className="su-devices">
      {row.machines.map((machine) => {
        const look = MACHINE[machine.state] || MACHINE.waiting
        return (
          <span key={machine.alias} className="su-device" data-state={machine.state} title={look.title}>
            {machine.alias} {look.mark}
          </span>
        )
      })}
    </div>
  )
}

/**
 * Scanner photos (Admin and Dining Office): every active student's face photo
 * in HMS and whether each face machine has it. The machines hold exactly the
 * active students with a photo (the roster sync), so the only thing to do here
 * is give a student a photo: their HMS profile photo, one by one or for
 * everyone without one. Students can also send their own from the Dining page.
 */
const DiningScannerUsersPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState(null)
  const [confirmBulk, setConfirmBulk] = useState(false)
  const search = useDebouncedValue(searchInput.trim(), 300)

  const params = { status, search, page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.diningScannerUsers.list(params),
    queryFn: () => diningScannerUsersApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (current) => (current.state.data?.profileJob?.running ? 5000 : 30_000),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningScannerUsers.all })

  const useProfile = useMutation({
    mutationFn: ({ row }) => diningScannerUsersApi.useProfilePhoto(row.rollNumber, { replace: row.photoStatus === "valid" }),
    onSuccess: ({ item, outcome }) => {
      const who = item.name || item.rollNumber
      const type = outcome === "sent" ? "success" : "error"
      const message = outcome === "sent" ? "profile photo saved. The machines get it within a couple of minutes." : item.profileAttempt?.message || "the profile photo can't be used."
      setFeedback({ type, message: `${who}: ${message}` })
    },
    onError: (error, { row }) => {
      setFeedback({ type: "error", message: `${row.name || row.rollNumber}: ${getErrorMessage(error, "Couldn't use the profile photo.")}` })
    },
    onSettled: refresh,
  })
  const bulk = useMutation({
    mutationFn: () => diningScannerUsersApi.useProfilePhotos(),
    onSuccess: (result) => setFeedback({ type: "info", message: `Using profile photos for ${result.total} students. Progress shows here.` }),
    onError: (error) => setFeedback({ type: "error", message: getErrorMessage(error, "Couldn't start using profile photos.") }),
    onSettled: () => {
      setConfirmBulk(false)
      refresh()
    },
  })

  const data = query.data
  const items = data?.items || []
  const counts = data?.counts || {}
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / PAGE_SIZE))
  const job = data?.profileJob
  const busyRoll = useProfile.isPending ? useProfile.variables?.row.rollNumber : ""

  const columns = [
    {
      key: "photo",
      header: "Photo",
      width: 64,
      render: (row) =>
        row.photo.present ? (
          <a className="su-thumb" href={diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version)} target="_blank" rel="noreferrer" title="Open scanner photo">
            <img src={diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version)} alt={`Scanner photo of ${row.name || row.rollNumber}`} loading="lazy" />
          </a>
        ) : (
          <span className="su-thumb" aria-label="No scanner photo" />
        ),
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
      key: "photoStatus",
      header: "Scanner photo",
      render: (row) => {
        const badge = STATUS[row.photoStatus] || STATUS.missing
        return (
          <div className="su-who">
            <StatusBadge status={badge.label} tone={badge.tone} />
            {row.photo.present && (
              <span>
                {row.photo.sourceLabel || "Photo"}
                {row.photo.storedAt ? `, ${formatDateTime(row.photo.storedAt)}` : ""}
              </span>
            )}
          </div>
        )
      },
    },
    { key: "machines", header: "Machines", render: (row) => <Machines row={row} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => {
        if (!row.profileImage) return row.photoStatus === "valid" ? null : <span className="su-note">No HMS profile photo</span>
        const tried = row.profileAttempt && row.profileAttempt.outcome !== "sent"
        return (
          <div className="su-action">
            <Button
              variant={row.photoStatus === "valid" ? "ghost" : "secondary"}
              size="sm"
              loading={busyRoll === row.rollNumber}
              disabled={useProfile.isPending}
              onClick={() => useProfile.mutate({ row })}
              title={row.photoStatus === "valid" ? "Replace the scanner photo with the student's HMS profile photo" : "Use the student's HMS profile photo as their scanner photo"}
            >
              <ImageUp size={15} /> {row.photoStatus === "valid" ? "Replace with profile photo" : "Use profile photo"}
            </Button>
            {tried && (
              <span className="su-note" title={row.profileAttempt.message}>
                {ATTEMPT[row.profileAttempt.outcome] || "Tried"} {formatDateTime(row.profileAttempt.at)}: {row.profileAttempt.message}
              </span>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <Page>
      <PageHeader title="Scanner Photos" subtitle="Every active student's face photo, and whether each mess face machine has it.">
        <Button variant="secondary" onClick={() => setConfirmBulk(true)} disabled={job?.running || bulk.isPending || !counts.missing}>
          <ImageUp size={18} /> Use profile photos
        </Button>
      </PageHeader>

      <Page.Body>
        <p className="su-sync">
          The machines hold exactly the active students who have a photo: new and changed photos reach them within a couple of minutes, and students who leave are removed.
          {data?.machines?.length ? ` Machines: ${data.machines.join(", ")}.` : " No machine is kept in sync yet (Face Scanners page)."}
        </p>

        {job?.running && (
          <Alert type="info" icon>
            Using profile photos: {job.done} of {job.total} done ({job.sent} saved, {job.unusable} can&apos;t be used).
          </Alert>
        )}
        {job && !job.running && job.finishedAt && (
          <Alert type={job.error ? "warning" : "info"} icon dismissible>
            Profile photos {formatDateTime(job.finishedAt)}: {job.sent} saved, {job.unusable} couldn&apos;t be used{job.failed ? `, ${job.failed} failed` : ""}.
          </Alert>
        )}
        {feedback && (
          <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <div className="su-toolbar">
          <Tabs
            variant="pills"
            tabs={TABS.map((tab) => ({ ...tab, count: counts[tab.value] || undefined }))}
            activeTab={status}
            setActiveTab={(next) => {
              setStatus(next)
              setPage(1)
            }}
          />
          <SearchInput
            className="su-toolbar__search"
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

        {query.isError ? (
          <Alert type="error" icon>
            {getErrorMessage(query.error, "Couldn't load the scanner photos.")}
          </Alert>
        ) : (
          <div className="su-table" data-stale={query.isPlaceholderData || undefined}>
            <DataTable
              data={items}
              columns={columns}
              loading={query.isLoading}
              getRowId={(row) => row.rollNumber}
              emptyMessage={search ? `Nobody matches "${search}".` : EMPTY[status]}
            />
          </div>
        )}
        {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} paginate={setPage} />}
      </Page.Body>

      {confirmBulk && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmBulk(false)}
          onConfirm={() => bulk.mutate()}
          title="Use profile photos as scanner photos?"
          message={`Every active student with no scanner photo (${counts.missing || 0} now) who has an HMS profile photo and hasn't been tried yet gets it as their scanner photo. Students whose photo can't be used or is refused by a machine must send one themselves.`}
          confirmText="Use profile photos"
          cancelText="Cancel"
        />
      )}
    </Page>
  )
}

export default DiningScannerUsersPage
