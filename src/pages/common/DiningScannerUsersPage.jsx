import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, ConfirmDialog, DataTable, Page, Pagination, SearchInput, StatusBadge, Tabs } from "hzero"
import { ImageUp, RefreshCw } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import { getMediaUrl } from "@/utils/mediaUtils"
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

/** What a machine sent back when HMS asked it for the student (photo check). */
const CHECK = {
  match: { text: "same photo as HMS, face made", tone: "ok" },
  noFace: { text: "has the photo but made no face from it", tone: "bad" },
  different: { text: "has a different photo than HMS", tone: "bad" },
  noPhoto: { text: "sent no photo (student not on it)", tone: "bad" },
  noAnswer: { text: "didn't answer", tone: "warn" },
  checking: { text: "checking…", tone: "warn" },
}

/** The machine whose photo to show: one that sent a photo, preferring an exact match. */
const shownMachine = (row) =>
  row.machines.find((m) => m.check?.status === "match") || row.machines.find((m) => m.check?.photo) || null

const isChecking = (row) => row.machines.some((m) => m.check?.status === "checking")

/** Profile photo next to the photo on the machine. */
const PhotoPair = ({ row }) => {
  const machine = shownMachine(row)
  const who = row.name || row.rollNumber
  const profileUrl = row.profileImage ? getMediaUrl(row.profileImage) : ""
  const machineUrl = machine ? diningScannerUsersApi.machinePhotoUrl(row.rollNumber, machine.sn, String(machine.check.at || "")) : ""
  const sentUrl = row.photo.present ? diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version) : ""
  return (
    <div className="su-pair">
      <figure className="su-pair__item">
        {profileUrl ? (
          <a className="su-thumb su-thumb--lg" href={profileUrl} target="_blank" rel="noreferrer" title="Open profile photo">
            <img src={profileUrl} alt={`Profile photo of ${who}`} loading="lazy" />
          </a>
        ) : (
          <span className="su-thumb su-thumb--lg" aria-label="No profile photo" />
        )}
        <figcaption>Profile</figcaption>
      </figure>
      <figure className="su-pair__item">
        {machineUrl ? (
          <a className="su-thumb su-thumb--lg" href={machineUrl} target="_blank" rel="noreferrer" title={`Open the photo ${machine.alias} holds`}>
            <img src={machineUrl} alt={`Photo on ${machine.alias} for ${who}`} loading="lazy" />
          </a>
        ) : sentUrl ? (
          <a className="su-thumb su-thumb--lg su-thumb--unchecked" href={sentUrl} target="_blank" rel="noreferrer" title="The photo HMS sends. Not fetched back from a machine yet.">
            <img src={sentUrl} alt={`Scanner photo of ${who}`} loading="lazy" />
          </a>
        ) : (
          <span className="su-thumb su-thumb--lg" aria-label="No scanner photo" />
        )}
        <figcaption>{machine ? `On ${machine.alias}` : sentUrl ? "Sent (not checked)" : "No photo"}</figcaption>
      </figure>
    </div>
  )
}

/** "m2, m3: same photo as HMS, face made" lines from the last check of each machine. */
const checkLines = (machines) => {
  const groups = new Map()
  for (const machine of machines) {
    const look = CHECK[machine.check?.status]
    if (!look) continue
    const entry = groups.get(machine.check.status) || { look, aliases: [], at: null }
    entry.aliases.push(machine.alias)
    if (machine.check.at && (!entry.at || machine.check.at > entry.at)) entry.at = machine.check.at
    groups.set(machine.check.status, entry)
  }
  return [...groups.values()]
}

/** The machines' own errors, grouped: "m2, m3: The machine couldn't make a face from this photo (D01E0001)". */
const refusalGroups = (machines) => {
  const groups = new Map()
  for (const machine of machines) {
    if (!machine.refusal) continue
    const text = machine.refusal.code ? `${machine.refusal.message} (${machine.refusal.code})` : machine.refusal.message
    groups.set(text, [...(groups.get(text) || []), machine.alias])
  }
  return [...groups].map(([text, aliases]) => ({ text, aliases }))
}

const Machines = ({ row }) => {
  if (!row.photo.present) return <span className="su-note">-</span>
  if (!row.machines.length) return <span className="su-note">No machine kept in sync</span>
  const refusals = refusalGroups(row.machines)
  return (
    <div className="su-machines">
      <div className="su-devices">
        {row.machines.map((machine) => {
          const look = MACHINE[machine.state] || MACHINE.waiting
          const title = machine.refusal ? `${machine.refusal.message}${machine.refusal.code ? ` (${machine.refusal.code})` : ""}` : look.title
          return (
            <span key={machine.alias} className="su-device" data-state={machine.state} title={title}>
              {machine.alias} {look.mark}
            </span>
          )
        })}
      </div>
      {checkLines(row.machines).map((line) => (
        <span key={line.look.text} className="su-check" data-tone={line.look.tone}>
          <strong>{line.aliases.join(", ")}:</strong> {line.look.text}
          {line.at && line.look.tone !== "warn" ? <span className="su-check__at"> · {formatDateTime(line.at)}</span> : null}
        </span>
      ))}
      {refusals.length > 0 && (
        <div className="su-refusal" role="note">
          {refusals.map((group) => (
            <span key={group.text}>
              <strong>{group.aliases.join(", ")}:</strong> {group.text}
            </span>
          ))}
          <span className="su-refusal__hint">Needs a new photo: clear, front-facing, one face, good light.</span>
        </div>
      )}
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
    refetchInterval: (current) => (current.state.data?.profileJob?.running || current.state.data?.items?.some(isChecking) ? 5000 : 30_000),
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
  const fetchBack = useMutation({
    mutationFn: ({ row }) => diningScannerUsersApi.checkOnMachines(row.rollNumber),
    onSuccess: (_, { row }) => setFeedback({ type: "info", message: `${row.name || row.rollNumber}: asked the machines. Their photos show here within a minute or two.` }),
    onError: (error, { row }) => setFeedback({ type: "error", message: `${row.name || row.rollNumber}: ${getErrorMessage(error, "Couldn't ask the machines.")}` }),
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
  const fetchingRoll = fetchBack.isPending ? fetchBack.variables?.row.rollNumber : ""

  const columns = [
    { key: "photos", header: "Photos", width: 132, render: (row) => <PhotoPair row={row} /> },
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
        const tried = row.profileAttempt && row.profileAttempt.outcome !== "sent"
        const canFetch = row.photo.present && row.machines.length > 0
        return (
          <div className="su-action">
            {canFetch && (
              <Button
                variant="ghost"
                size="sm"
                loading={fetchingRoll === row.rollNumber}
                disabled={fetchBack.isPending || isChecking(row)}
                onClick={() => fetchBack.mutate({ row })}
                title="Ask every machine for the photo it holds for this student"
              >
                <RefreshCw size={15} /> {isChecking(row) ? "Checking machines…" : "Fetch from machines"}
              </Button>
            )}
            {row.profileImage ? (
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
            ) : row.photoStatus === "valid" ? null : (
              <span className="su-note">No HMS profile photo</span>
            )}
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
      <PageHeader title="Scanner Photos" subtitle="Each active student's profile photo next to the photo the mess face machines actually hold.">
        <Button variant="secondary" onClick={() => setConfirmBulk(true)} disabled={job?.running || bulk.isPending || !counts.missing}>
          <ImageUp size={18} /> Use profile photos
        </Button>
      </PageHeader>

      <Page.Body>
        <p className="su-sync">
          The machines hold exactly the active students who have a photo: new and changed photos reach them within a couple of minutes, and students who leave are removed.
          Every night HMS fetches back the photos that changed (everyone on Sunday nights) and checks each machine made a face from them.
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
