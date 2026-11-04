import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Modal, Page, Switch } from "hzero"
import { ChevronLeft, ChevronRight, ImageUp, RefreshCw, ScanFace, Search, X } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningScannerUsersApi } from "@/service"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import ScannerStudentCard from "@/components/dining/scanner-users/ScannerStudentCard"
import { NOT_WORKING, REASONS, ago, initials, number } from "@/components/dining/scanner-users/scannerUsersHelpers"
import "@/components/dining/scanner-users/ScannerUsers.css"

const PAGE_SIZE = 10

/** Fill the space under the app bar exactly, so only the student list scrolls (wide screens). */
const useFitHeight = () => {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const fit = () => {
      const node = ref.current
      if (!node) return
      if (window.innerWidth < 960) {
        node.style.height = ""
        return
      }
      const top = node.getBoundingClientRect().top + window.scrollY
      node.style.height = `${Math.max(480, window.innerHeight - top - 20)}px`
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])
  return ref
}

const Avatar = ({ row }) => {
  const [broken, setBroken] = useState(false)
  const url = row.photo.present ? diningScannerUsersApi.photoUrl(row.rollNumber, row.photo.version) : ""
  return <span className="sp-avatar">{url && !broken ? <img src={url} alt="" loading="lazy" onError={() => setBroken(true)} /> : initials(row.name)}</span>
}

/**
 * Scanner Photos (Admin and Dining Office): whose face works at the mess
 * machines and whose doesn't yet. Pick a group (or search), the list shows 10
 * at a time, and the selected student's card sits beside it.
 */
const DiningScannerUsersPage = () => {
  const queryClient = useQueryClient()
  const fitRef = useFitHeight()
  const listRef = useRef(null)
  const [group, setGroup] = useState("notWorking")
  const [reason, setReason] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [picked, setPicked] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [confirmBulk, setConfirmBulk] = useState(false)
  const [includeNotWorking, setIncludeNotWorking] = useState(false)
  const search = useDebouncedValue(searchInput.trim(), 250)

  const stats = useQuery({
    queryKey: [...queryKeys.diningScannerUsers.all, "stats"],
    queryFn: () => diningScannerUsersApi.stats(),
    refetchInterval: (current) => (current.state.data?.profileJob?.running ? 5000 : 60_000),
  })
  const params = search ? { search, page, limit: PAGE_SIZE } : { reason: reason || group, page, limit: PAGE_SIZE }
  const list = useQuery({
    queryKey: queryKeys.diningScannerUsers.list(params),
    queryFn: () => diningScannerUsersApi.list(params),
    placeholderData: keepPreviousData,
  })

  const bulk = useMutation({
    mutationFn: () => diningScannerUsersApi.useProfilePhotos({ includeNotWorking }),
    onSuccess: (result) => setFeedback({ type: "info", message: `Using profile photos for ${result.total} students. Progress shows here.` }),
    onError: (error) => setFeedback({ type: "error", message: getErrorMessage(error, "Couldn't start using profile photos.") }),
    onSettled: () => {
      setConfirmBulk(false)
      queryClient.invalidateQueries({ queryKey: queryKeys.diningScannerUsers.all })
    },
  })

  const overview = stats.data
  const reasons = overview?.reasons || {}
  const job = overview?.profileJob
  const items = list.data?.items || []
  const total = list.data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  // The selected student: the one picked, else the top of the list.
  const selected = items.find((row) => row.rollNumber === picked) || items[0] || null

  const choose = (nextGroup, nextReason = "") => {
    setGroup(nextGroup)
    setReason(nextReason)
    setSearchInput("")
    setPage(1)
    setPicked(null)
  }
  const goTo = (next) => {
    setPage(next)
    setPicked(null)
  }

  // Hovering a row shows that student (after a short pause, so sweeping the mouse across doesn't flicker).
  const hoverTimer = useRef(null)
  const hoverTo = (roll) => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setPicked(roll), 90)
  }
  useEffect(() => () => clearTimeout(hoverTimer.current), [])

  // Arrow keys move through the list.
  const onListKey = (event) => {
    if (!items.length || !["ArrowDown", "ArrowUp"].includes(event.key)) return
    event.preventDefault()
    const at = Math.max(0, items.indexOf(selected))
    const next = items[Math.min(items.length - 1, Math.max(0, at + (event.key === "ArrowDown" ? 1 : -1)))]
    setPicked(next.rollNumber)
  }
  useEffect(() => {
    listRef.current?.querySelector("[aria-selected='true']")?.scrollIntoView({ block: "nearest" })
  }, [selected?.rollNumber])

  const bulkCount = (overview?.missingWithProfile || 0) + (includeNotWorking ? overview?.notWorkingWithProfile || 0 : 0)
  const working = reasons.working || 0
  const notWorking = overview?.notWorking || 0
  const share = overview?.total ? (working / overview.total) * 100 : 0
  const listLabel = search ? `"${search}"` : reason ? REASONS[reason].label : group === "working" ? "Working" : "Not working yet"

  return (
    <Page>
      <PageHeader title="Scanner Photos" subtitle="Whose face works at the mess face machines, and why not.">
        <div className="sp-head">
          {overview?.machines?.length > 0 && (
            <ul className="sp-machines" aria-label="Machines">
              {overview.machines.map((m) => (
                <li key={m.sn} data-on={m.online || undefined} title={m.online ? `${m.alias} is online` : `${m.alias} last seen ${ago(m.lastSeenAt) || "never"}`}>
                  {m.alias}
                  {!m.online && <small>{ago(m.lastSeenAt) || "never"}</small>}
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.diningScannerUsers.all })}
            disabled={stats.isFetching}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw size={16} className={stats.isFetching ? "sp-spin" : undefined} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmBulk(true)} disabled={job?.running || bulk.isPending || !(overview?.missingWithProfile || overview?.notWorkingWithProfile)}
            title="Give students their HMS profile photo as the scanner photo"
          >
            <ImageUp size={15} /> Use profile photos
          </Button>
        </div>
      </PageHeader>
      <Page.Body>
        <div className="sp" ref={fitRef}>
          <aside className="sp-side">
            <div className="sp-filters">
              <div className="sp-groups" role="tablist" aria-label="Group">
                <button type="button" role="tab" aria-selected={!search && group === "notWorking"} data-tone="bad" onClick={() => choose("notWorking")}>
                  <i aria-hidden="true" />
                  Not working yet
                  <small>{overview ? number(notWorking) : "…"}</small>
                </button>
                <button type="button" role="tab" aria-selected={!search && group === "working"} data-tone="ok" onClick={() => choose("working")}>
                  <i aria-hidden="true" />
                  Working
                  <small>{overview ? number(working) : "…"}</small>
                </button>
              </div>
              <div className="sp-reasons" role="group" aria-label="Why it isn't working">
                <button type="button" aria-pressed={!search && group === "notWorking" && !reason} onClick={() => choose("notWorking")}>
                  All
                </button>
                {NOT_WORKING.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={!search && reason === key}
                    data-tone={REASONS[key].tone}
                    disabled={!reasons[key]}
                    onClick={() => choose("notWorking", key)}
                  >
                    <i aria-hidden="true" />
                    {REASONS[key].label}
                    <small>{number(reasons[key])}</small>
                  </button>
                ))}
              </div>
            </div>

            <label className="sp-search">
              <Search size={16} aria-hidden="true" />
              <input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value)
                  setPage(1)
                  setPicked(null)
                }}
                onKeyDown={onListKey}
                placeholder="Find anyone by roll number or name"
                aria-label="Find a student by roll number or name"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </label>
            <p className="sp-showing">
              {search ? "Search results" : listLabel}
              <span>{number(total)}</span>
            </p>

            <div className="sp-list" data-stale={list.isPlaceholderData || undefined}>
              {list.isError ? (
                <p className="sp-empty">{getErrorMessage(list.error, "Couldn't load the students.")}</p>
              ) : list.isLoading ? (
                <p className="sp-empty">Loading…</p>
              ) : items.length ? (
                <ul ref={listRef} role="listbox" aria-label={listLabel} tabIndex={0} onKeyDown={onListKey}>
                  {items.map((row) => {
                    const tag = REASONS[row.reason] || REASONS.unchecked
                    return (
                      <li
                        key={row.rollNumber}
                        role="option"
                        aria-selected={row.rollNumber === selected?.rollNumber}
                        onMouseEnter={() => hoverTo(row.rollNumber)}
                        onMouseLeave={() => clearTimeout(hoverTimer.current)}
                        onClick={() => setPicked(row.rollNumber)}
                      >
                        <Avatar row={row} />
                        <span className="sp-row__who">
                          <strong title={row.name || undefined}>{row.name || "-"}</strong>
                          <span>{row.rollNumber}</span>
                        </span>
                        {(search || !reason) && (
                          <span className="sp-row__tag" data-tone={tag.tone}>
                            {tag.label}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="sp-empty">{search ? `Nobody matches "${search}".` : group === "working" ? "Nobody's face works yet." : "Everyone's face works."}</p>
              )}
            </div>

            <div className="sp-pager">
              <span>{total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(total, page * PAGE_SIZE)} of ${number(total)}` : ""}</span>
              <button type="button" onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Previous 10">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Next 10">
                <ChevronRight size={16} />
              </button>
            </div>
          </aside>

          <section className="sp-main">
            <div className="sp-console">
              <div className="sp-cover" role="img" aria-label={`${number(working)} of ${number(overview?.total)} students' faces work`}>
                <span className="sp-label">Faces working</span>
                <b>{overview ? `${share.toFixed(1)}%` : "…"}</b>
                <span className="sp-cover__of">
                  {number(working)} of {number(overview?.total)} students
                </span>
                <span className="sp-meter" aria-hidden="true">
                  <i data-tone="ok" style={{ flexGrow: working }} />
                  {NOT_WORKING.map((key) => (reasons[key] ? <i key={key} data-tone={REASONS[key].tone} style={{ flexGrow: reasons[key] }} /> : null))}
                </span>
              </div>

              <div className="sp-tiles">
                <div className="sp-tile" data-tone="bad">
                  <span className="sp-label">Not working yet</span>
                  <b>{overview ? number(notWorking) : "…"}</b>
                </div>
                <div className="sp-tile" data-tone="ok">
                  <span className="sp-label">Working</span>
                  <b>{overview ? number(working) : "…"}</b>
                </div>
                <div className="sp-tile sp-tile--scan" title="Students whose face a machine recognised at least once since their current scanner photo was saved">
                  <span className="sp-label">
                    <ScanFace size={13} aria-hidden="true" />
                    Scanned since photo update
                  </span>
                  <b>{overview ? number(overview.scannedSinceUpdate) : "…"}</b>
                </div>
              </div>

              <ul className="sp-breakdown" aria-label="Why faces don't work yet">
                {NOT_WORKING.map((key) => (
                  <li key={key} data-tone={REASONS[key].tone}>
                    <i aria-hidden="true" />
                    {REASONS[key].label}
                    <b>{overview ? number(reasons[key]) : "…"}</b>
                  </li>
                ))}
              </ul>

              {(job?.running || feedback) && (
                <div className="sp-console__status">
                  {job?.running ? (
                    <span>
                      Using profile photos: {job.done} of {job.total} done ({job.sent} saved, {job.unusable} can&apos;t be used)
                    </span>
                  ) : (
                    <span data-tone={feedback.type === "error" ? "bad" : undefined}>{feedback.message}</span>
                  )}
                  {!job?.running && (
                    <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="sp-detail" aria-live="polite">
              {selected ? (
                <ScannerStudentCard key={selected.rollNumber} row={selected} />
              ) : (
                <p className="sp-empty sp-empty--detail">{list.isLoading ? "" : "Pick a student to see their face photo here."}</p>
              )}
            </div>
          </section>
        </div>
      </Page.Body>

      {confirmBulk && (
        <Modal
          isOpen
          onClose={() => setConfirmBulk(false)}
          title="Use profile photos as scanner photos"
          width={520}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmBulk(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={bulk.isPending} disabled={!bulkCount || bulk.isPending} onClick={() => bulk.mutate()}>
                <ImageUp size={15} /> Use profile photos for {number(bulkCount)}
              </Button>
            </>
          }
        >
          <div className="sp-bulkdlg">
            <p>
              <b>{number(overview?.missingWithProfile)}</b> students have no scanner photo but have an HMS profile photo. Each gets it as their scanner photo.
            </p>
            <div className="sp-bulkdlg__toggle">
              <Switch
                checked={includeNotWorking}
                onChange={(event) => setIncludeNotWorking(event.target.checked)}
                label={`Also students whose photo isn't working (${number(overview?.notWorkingWithProfile)})`}
              />
              <p>Replaces photos a machine refused or made no face from with the profile photo. Students already on their profile photo, or whose profile photo can&apos;t be used, are skipped.</p>
            </div>
            <p className="sp-bulkdlg__note">Photos that can&apos;t be used are skipped and shown on the student&apos;s card. The machines get the new photos within a few minutes.</p>
          </div>
        </Modal>
      )}
    </Page>
  )
}

export default DiningScannerUsersPage
