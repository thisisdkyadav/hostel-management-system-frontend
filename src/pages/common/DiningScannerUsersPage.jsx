import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, ConfirmDialog, DataTable, Input, Page, Pagination, SearchInput, StatusBadge, Tabs } from "hzero"
import { ImageUp, RefreshCw, UserPlus } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import "@/components/dining/scanner-users/ScannerUsers.css"

const PAGE_SIZE = 50

const STATUS = {
  valid: { label: "Working", tone: "success" },
  pending: { label: "Waiting", tone: "warning" },
  failed: { label: "Rejected", tone: "danger" },
  missing: { label: "No photo", tone: "neutral" },
}

const TABS = [
  { value: "all", label: "All" },
  { value: "valid", label: "Working photo" },
  { value: "missing", label: "No photo" },
  { value: "failed", label: "Rejected" },
  { value: "pending", label: "Waiting" },
  { value: "notInHms", label: "Not in HMS" },
]

const EMPTY = {
  all: "Nobody is on the face scanners yet. Run a sync to load them.",
  valid: "Nobody has a working scanner photo yet.",
  missing: "Everyone on the scanners has a photo.",
  failed: "No machine has rejected a photo.",
  pending: "No photos are waiting for the machines.",
  notInHms: "Everyone on the scanners is in HMS.",
}

const ATTEMPT = { sent: "Sent", unusable: "Can't use", failed: "Failed" }

const deviceState = (device) => (device.ok === true ? "ok" : device.ok === false ? "error" : "waiting")

const Devices = ({ row }) => {
  if (!row.devices.length) {
    return <span className="su-note">{row.bioPhoto.present ? "No recent answers" : "-"}</span>
  }
  return (
    <div className="su-devices">
      {row.devices.map((device) => (
        <span key={device.alias} className="su-device" data-state={deviceState(device)} title={device.message || (device.ok === null ? "Not answered yet" : "")}>
          {device.alias} {device.ok === true ? "✓" : device.ok === false ? "✕" : "…"}
        </span>
      ))}
    </div>
  )
}

const SyncLine = ({ sync, live }) => {
  if (!sync) return <p className="su-sync">Not checked yet. Use Sync now to load everyone from the scanners.</p>
  if (sync.running) return <p className="su-sync">Checking the scanners…</p>
  return (
    <p className="su-sync" data-error={sync.ok ? undefined : ""}>
      {sync.ok ? "Full check" : "Full check failed"} {formatDateTime(sync.lastRunAt)}
      {!sync.ok && sync.error ? `: ${sync.error}` : ""}
      {live?.lastRunAt ? `. New photos and machine answers checked every minute (last ${formatDateTime(live.lastRunAt)}).` : ". Checked again every night."}
    </p>
  )
}

/**
 * Everyone on the mess face scanners (Admin and Dining Office): whether their
 * scanner photo works on every machine, adding HMS students by roll number and
 * trying their HMS profile photo as the scanner photo.
 */
const DiningScannerUsersPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [rollInput, setRollInput] = useState("")
  const [feedback, setFeedback] = useState(null)
  const [confirmBulk, setConfirmBulk] = useState(false)
  const search = useDebouncedValue(searchInput.trim(), 300)

  const params = { status, search, page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.diningScannerUsers.list(params),
    queryFn: () => diningScannerUsersApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (current) => (current.state.data?.sync?.running || current.state.data?.profileJob?.running ? 5000 : 60_000),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningScannerUsers.all })
  const fail = (fallback) => (error) => setFeedback({ type: "error", message: getErrorMessage(error, fallback) })

  const add = useMutation({
    mutationFn: (roll) => diningScannerUsersApi.add(roll),
    onSuccess: (result) => {
      const who = `${result.item.name || result.item.rollNumber} (${result.item.rollNumber})`
      setFeedback({ type: result.alreadyOnScanner ? "info" : "success", message: result.alreadyOnScanner ? `${who} is already on the face scanners.` : `${who} was added to the face scanners.` })
      setRollInput("")
    },
    onError: fail("Couldn't add the student."),
    onSettled: refresh,
  })
  const sync = useMutation({
    mutationFn: () => diningScannerUsersApi.sync(),
    onSuccess: () => setFeedback({ type: "info", message: "Checking the scanners. This takes about a minute." }),
    onError: fail("Couldn't start the check."),
    onSettled: refresh,
  })
  const useProfile = useMutation({
    mutationFn: ({ row }) => diningScannerUsersApi.useProfilePhoto(row.rollNumber),
    onSuccess: ({ item, outcome }) => {
      const who = item.name || item.rollNumber
      const note = item.profileAttempt?.message || ""
      const type = outcome === "valid" ? "success" : outcome === "pending" ? "info" : "error"
      setFeedback({ type, message: `${who}: ${note}` })
    },
    onError: (error, { row }) => {
      setFeedback({ type: "error", message: `${row.name || row.rollNumber}: ${getErrorMessage(error, "Couldn't send the profile photo.")}` })
    },
    onSettled: refresh,
  })
  const bulk = useMutation({
    mutationFn: () => diningScannerUsersApi.useProfilePhotos(),
    onSuccess: (result) => setFeedback({ type: "info", message: `Sending profile photos for ${result.total} students. Results show here as they finish.` }),
    onError: fail("Couldn't start sending profile photos."),
    onSettled: () => {
      setConfirmBulk(false)
      refresh()
    },
  })

  const data = query.data
  const items = data?.items || []
  const counts = data?.counts || {}
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / PAGE_SIZE))
  const scannerReady = data?.scanner?.configured !== false
  const job = data?.profileJob
  const busyRoll = useProfile.isPending ? useProfile.variables?.row.rollNumber : ""

  const columns = [
    {
      key: "photo",
      header: "Photo",
      width: 64,
      render: (row) =>
        row.bioPhoto.present ? (
          <a className="su-thumb" href={diningScannerUsersApi.photoUrl(row.rollNumber, row.bioPhoto.registeredAt)} target="_blank" rel="noreferrer" title="Open scanner photo">
            <img src={diningScannerUsersApi.photoUrl(row.rollNumber, row.bioPhoto.registeredAt)} alt={`Scanner photo of ${row.name || row.rollNumber}`} loading="lazy" />
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
          <span>
            {row.rollNumber}
            {!row.inHms && " · not in HMS"}
          </span>
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
            {row.bioPhoto.registeredAt && <span>{row.bioPhoto.registeredAt.slice(0, 16)}</span>}
          </div>
        )
      },
    },
    { key: "devices", header: "Machines", render: (row) => <Devices row={row} /> },
    {
      key: "profileAttempt",
      header: "Profile photo tried",
      render: (row) =>
        row.profileAttempt ? (
          <span className="su-note" title={row.profileAttempt.message}>
            {ATTEMPT[row.profileAttempt.outcome] || "Tried"} {formatDateTime(row.profileAttempt.at)}
            {row.profileAttempt.outcome !== "sent" && row.profileAttempt.message ? ` · ${row.profileAttempt.message}` : ""}
          </span>
        ) : (
          <span className="su-note">-</span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => {
        if (!row.inHms || row.photoStatus === "valid") return null
        if (!row.profileImage) return <span className="su-note">No HMS profile photo</span>
        return (
          <Button
            variant="secondary"
            size="sm"
            loading={busyRoll === row.rollNumber}
            disabled={!scannerReady || useProfile.isPending}
            onClick={() => useProfile.mutate({ row })}
            title="Send the student's HMS profile photo to the scanners and check what each machine says"
          >
            <ImageUp size={15} /> {busyRoll === row.rollNumber ? "Checking…" : "Use profile photo"}
          </Button>
        )
      },
    },
  ]

  return (
    <Page>
      <PageHeader title="Scanner Users" subtitle="Everyone on the mess face scanners, and whether their scanner photo works on every machine.">
        <Button variant="secondary" onClick={() => setConfirmBulk(true)} disabled={!scannerReady || job?.running || bulk.isPending}>
          <ImageUp size={18} /> Use profile photos
        </Button>
        <Button variant="secondary" onClick={() => sync.mutate()} loading={sync.isPending} disabled={!scannerReady || data?.sync?.running || sync.isPending}>
          <RefreshCw size={18} /> Sync now
        </Button>
      </PageHeader>

      <Page.Body>
        <div className="su-bar">
          <form
            className="su-add"
            onSubmit={(event) => {
              event.preventDefault()
              const roll = rollInput.trim()
              if (roll) add.mutate(roll)
            }}
          >
            <Input
              label="Add a student by roll number"
              value={rollInput}
              onChange={(event) => setRollInput(event.target.value)}
              placeholder="e.g. 230001024"
              size="sm"
              maxLength={32}
              disabled={!scannerReady}
            />
            <Button type="submit" variant="primary" size="sm" loading={add.isPending} disabled={!scannerReady || !rollInput.trim() || add.isPending}>
              <UserPlus size={15} /> Add
            </Button>
          </form>
          <SyncLine sync={data?.sync} live={data?.live} />
        </div>

        {!scannerReady && (
          <Alert type="warning" icon>
            The face scanner software isn&apos;t connected yet, so nothing can be added or checked.
          </Alert>
        )}
        {job?.running && (
          <Alert type="info" icon>
            Sending profile photos: {job.done} of {job.total} done ({job.sent} sent, {job.unusable} can&apos;t be used).
          </Alert>
        )}
        {job && !job.running && job.finishedAt && (
          <Alert type={job.error ? "warning" : "info"} icon dismissible>
            Profile photos {formatDateTime(job.finishedAt)}: {job.sent} sent, {job.unusable} couldn&apos;t be used, {job.failed} failed
            {job.error ? `. Stopped early: ${job.error}` : ". The machines' answers show after the next check."}
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
            {getErrorMessage(query.error, "Couldn't load the scanner users.")}
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
          title="Try profile photos as scanner photos?"
          message={`For each student in HMS with no scanner photo (${counts.missing || 0} now) who hasn't been tried yet, their HMS profile photo is sent to the scanners. Students whose photo the machines reject must upload one themselves.`}
          confirmText="Send profile photos"
          cancelText="Cancel"
        />
      )}
    </Page>
  )
}

export default DiningScannerUsersPage
