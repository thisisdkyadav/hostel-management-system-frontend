import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, ConfirmDialog, Page } from "hzero"
import { ChevronLeft, ChevronRight, ImageUp, Search, X } from "lucide-react"
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
    mutationFn: () => diningScannerUsersApi.useProfilePhotos(),
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

  const working = reasons.working || 0
  const notWorking = overview?.notWorking || 0
  const share = overview?.total ? (working / overview.total) * 100 : 0
  const listLabel = search ? `"${search}"` : reason ? REASONS[reason].label : group === "working" ? "Working" : "Not working yet"

  return (
    <Page>
      <Page.Body>
        <div className="sp" ref={fitRef}>
          <aside className="sp-side">
            <div className="sp-mast">
              <div className="sp-mast__title">
                <h1>Scanner photos</h1>
                {overview?.machines?.length > 0 && (
                  <ul className="sp-machines" aria-label="Machines">
                    {overview.machines.map((m) => (
                      <li key={m.sn} data-on={m.online || undefined} title={m.online ? `${m.alias} is online` : `${m.alias} last seen ${ago(m.lastSeenAt) || "never"}`}>
                        {m.alias}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="sp-gauge" role="img" aria-label={`${number(working)} of ${number(overview?.total)} students' faces work`}>
                <span style={{ width: `${share}%` }} />
              </div>
            </div>

            <div className="sp-groups" role="tablist" aria-label="Group">
              <button type="button" role="tab" aria-selected={!search && group === "notWorking"} data-tone="bad" onClick={() => choose("notWorking")}>
                <b>{overview ? number(notWorking) : "…"}</b>
                <span>not working yet</span>
              </button>
              <button type="button" role="tab" aria-selected={!search && group === "working"} data-tone="ok" onClick={() => choose("working")}>
                <b>{overview ? number(working) : "…"}</b>
                <span>working</span>
              </button>
            </div>

            {group === "notWorking" && !search && (
              <div className="sp-reasons" role="group" aria-label="Why">
                <button type="button" aria-pressed={!reason} onClick={() => choose("notWorking")}>
                  All
                </button>
                {NOT_WORKING.map((key) => (
                  <button key={key} type="button" aria-pressed={reason === key} data-tone={REASONS[key].tone} disabled={!reasons[key]} onClick={() => choose("notWorking", key)}>
                    <i aria-hidden="true" />
                    {REASONS[key].label}
                    <small>{number(reasons[key])}</small>
                  </button>
                ))}
              </div>
            )}

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

            {!search && reason === "noPhoto" && overview?.missingWithProfile > 0 && !job?.running && (
              <div className="sp-bulk">
                <span>{number(overview.missingWithProfile)} of them have an HMS profile photo.</span>
                <Button size="sm" variant="secondary" onClick={() => setConfirmBulk(true)} disabled={bulk.isPending}>
                  <ImageUp size={15} /> Use them all
                </Button>
              </div>
            )}
            {job?.running && (
              <p className="sp-bulk">
                Using profile photos: {job.done} of {job.total} done ({job.sent} saved, {job.unusable} can&apos;t be used).
              </p>
            )}
            {feedback && (
              <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)}>
                {feedback.message}
              </Alert>
            )}

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
                      <li key={row.rollNumber} role="option" aria-selected={row.rollNumber === selected?.rollNumber} onClick={() => setPicked(row.rollNumber)}>
                        <Avatar row={row} />
                        <span className="sp-row__who">
                          <strong>{row.name || "-"}</strong>
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

          <section className="sp-detail" aria-live="polite">
            {selected ? (
              <ScannerStudentCard key={selected.rollNumber} row={selected} />
            ) : (
              <p className="sp-empty sp-empty--detail">{list.isLoading ? "" : "Pick a student to see their face photo here."}</p>
            )}
          </section>
        </div>
      </Page.Body>

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
