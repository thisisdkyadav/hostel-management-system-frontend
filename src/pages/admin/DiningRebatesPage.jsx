import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Page } from "hzero"
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, X } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningRebateBoardApi } from "@/service"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import PeriodPicker from "@/components/dining/rebate-board/PeriodPicker"
import PeriodConsole from "@/components/dining/rebate-board/PeriodConsole"
import RebateCard, { Photo } from "@/components/dining/rebate-board/RebateCard"
import NewRebateModal from "@/components/dining/rebate-board/NewRebateModal"
import { FILTERS, STATES, dayLabel, days, keysIn, number, rangeText, stateOf, toKey, trackOf, daysBetween } from "@/components/dining/rebate-board/rebateBoardHelpers"
import "@/components/dining/rebate-board/RebateBoard.css"

const PAGE_SIZE = 50

/** Fill the space under the app bar exactly, so only the list and the card scroll (wide screens). */
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
      const body = node.closest(".hz-page-body")
      const bottom = body ? body.getBoundingClientRect().bottom - parseFloat(getComputedStyle(body).paddingBottom || "0") : window.innerHeight - 20
      node.style.height = `${Math.max(560, Math.floor(bottom - node.getBoundingClientRect().top))}px`
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])
  return ref
}

/** Where the rebate sits in the period: a bar on the period's days; arrow ends carry on into another period. */
const Track = ({ rebate, period, today }) => {
  const track = trackOf(toKey(rebate.startDate), toKey(rebate.endDate), period)
  if (!track) return null
  const todayAt = today >= period.startDate && today <= period.endDate ? ((daysBetween(period.startDate, today) + 0.5) / period.days) * 100 : null
  return (
    <span className="rb-track" aria-hidden="true">
      <span
        className="rb-track__bar"
        data-tone={STATES[stateOf(rebate)].tone}
        data-state={stateOf(rebate)}
        data-cut-start={track.cutStart || undefined}
        data-cut-end={track.cutEnd || undefined}
        style={{ left: `${track.left}%`, width: `${track.width}%` }}
      />
      {todayAt !== null && <span className="rb-track__today" style={{ left: `${todayAt}%` }} />}
    </span>
  )
}

/**
 * Dining Rebates (Admin + Dining Office): every rebate of one dining period,
 * 50 a page. A rebate running across periods shows in each, with the days
 * that count here. Pick one to see it, edit it, archive it; New rebate adds
 * one for any students.
 */
const DiningRebatesPage = () => {
  const queryClient = useQueryClient()
  const fitRef = useFitHeight()
  const listRef = useRef(null)
  const [params, setParams] = useSearchParams()
  const periodParam = params.get("period") || ""
  const [filter, setFilter] = useState("all")
  const [type, setType] = useState("")
  const [day, setDay] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [picked, setPicked] = useState(null)
  const [status, setStatus] = useState(null)
  const [creating, setCreating] = useState(false)
  const search = useDebouncedValue(searchInput.trim(), 250)

  const overview = useQuery({
    queryKey: queryKeys.diningRebateBoard.overview(periodParam),
    queryFn: () => diningRebateBoardApi.overview(periodParam ? { periodId: periodParam } : {}),
    placeholderData: keepPreviousData,
  })
  // The period actually shown: the one asked for, else what the server picked (the running one).
  const scope = overview.data?.scope
  const periodId = periodParam || (scope === "outside" ? "outside" : overview.data?.period?.id || "")
  const period = scope === "outside" ? null : overview.data?.period || null
  const today = overview.data?.today || ""

  const listParams = { periodId, status: filter, type, search, day, page, limit: PAGE_SIZE }
  const list = useQuery({
    queryKey: queryKeys.diningRebateBoard.list(listParams),
    queryFn: () => diningRebateBoardApi.list(listParams),
    enabled: Boolean(periodId),
    placeholderData: keepPreviousData,
  })
  const items = list.data?.items || []
  const total = list.data?.total || 0
  const counts = list.data?.counts || {}
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const selected = items.find((r) => String(r.id) === String(picked)) || items[0] || null

  const reset = () => {
    setPage(1)
    setPicked(null)
  }
  const choosePeriod = (next) => {
    setParams(next ? { period: next } : {}, { replace: true })
    setDay("")
    reset()
  }
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.diningRebateBoard.all })

  const onDone = ({ message, tone, restoreId }) => {
    setStatus({
      message,
      tone,
      undo: restoreId
        ? async () => {
            try {
              await diningRebateBoardApi.restore(restoreId)
              setStatus({ message: "Restored." })
            } catch (error) {
              setStatus({ message: getErrorMessage(error, "Couldn't restore."), tone: "bad" })
            }
            refresh()
          }
        : null,
    })
    refresh()
  }

  // Hovering a row shows it after a short pause; arrow keys move through the list.
  const hoverTimer = useRef(null)
  const hoverTo = (id) => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setPicked(id), 120)
  }
  useEffect(() => () => clearTimeout(hoverTimer.current), [])
  // A click or arrow key brings the card into view; hovering never scrolls.
  const detailRef = useRef(null)
  const reveal = useRef(false)
  const choose = (id) => {
    clearTimeout(hoverTimer.current)
    reveal.current = true
    setPicked(id)
  }
  const onListKey = (event) => {
    if (!items.length || !["ArrowDown", "ArrowUp"].includes(event.key)) return
    event.preventDefault()
    const at = Math.max(0, items.indexOf(selected))
    const next = items[Math.min(items.length - 1, Math.max(0, at + (event.key === "ArrowDown" ? 1 : -1)))]
    choose(next.id)
  }
  useEffect(() => {
    listRef.current?.querySelector("[aria-selected='true']")?.scrollIntoView({ block: "nearest" })
    if (reveal.current) detailRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    reveal.current = false
  }, [selected?.id])

  const label = search ? `"${search}"` : day ? `Away on ${dayLabel(day)}` : FILTERS.find((f) => f.value === filter)?.label
  const cellTicks = period && period.days <= 45 ? { "--rb-cell": `calc(100% / ${period.days})` } : undefined

  return (
    <Page>
      <PageHeader title="Dining Rebates" subtitle="Who's away from the mess, period by period.">
        <div className="rb-head">
          <PeriodPicker periods={overview.data?.periods || []} value={periodId} onChange={choosePeriod} />
          <Button variant="ghost" size="sm" onClick={refresh} disabled={overview.isFetching} aria-label="Refresh" title="Refresh">
            <RefreshCw size={16} className={overview.isFetching || list.isFetching ? "rb-spin" : undefined} />
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} /> New rebate
          </Button>
        </div>
      </PageHeader>
      <Page.Body>
        <div className="rb" ref={fitRef}>
          <aside className="rb-side">
            <div className="rb-filters">
              <div className="rb-states" role="tablist" aria-label="Status">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.value}
                    data-tone={f.tone}
                    onClick={() => {
                      setFilter(f.value)
                      reset()
                    }}
                  >
                    <span className="rb-states__name">
                      {f.tone && <i aria-hidden="true" />}
                      {f.label}
                    </span>
                    <small>{list.data ? number(counts[f.value]) : ""}</small>
                  </button>
                ))}
              </div>
              <div className="rb-chips" role="group" aria-label="Length">
                {[
                  ["", "Any length"],
                  ["short-term", "Short-term"],
                  ["long-term", "Long-term"],
                ].map(([value, text]) => (
                  <button
                    key={value || "any"}
                    type="button"
                    aria-pressed={type === value}
                    onClick={() => {
                      setType(value)
                      reset()
                    }}
                  >
                    {text}
                  </button>
                ))}
                {day && (
                  <button
                    type="button"
                    className="rb-daychip"
                    onClick={() => {
                      setDay("")
                      reset()
                    }}
                    aria-label={`Stop showing only ${dayLabel(day)}`}
                  >
                    {dayLabel(day)} <X size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <label className="rb-search">
              <Search size={16} aria-hidden="true" />
              <input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value)
                  reset()
                }}
                onKeyDown={onListKey}
                placeholder="Roll number or name"
                aria-label="Find a rebate by roll number or name"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </label>
            <p className="rb-showing">
              {label}
              <span>{number(total)}</span>
            </p>

            <div className="rb-list" data-stale={list.isPlaceholderData || undefined} style={cellTicks}>
              {list.isError ? (
                <p className="rb-empty">{getErrorMessage(list.error, "Couldn't load the rebates.")}</p>
              ) : list.isLoading || !periodId ? (
                <p className="rb-empty">Loading…</p>
              ) : items.length ? (
                <ul ref={listRef} role="listbox" aria-label={label} tabIndex={0} onKeyDown={onListKey}>
                  {items.map((rebate) => {
                    const state = stateOf(rebate)
                    const here = period ? keysIn(rebate.dateKeys, period).length : rebate.dayCount
                    return (
                      <li
                        key={rebate.id}
                        className="rb-row"
                        role="option"
                        aria-selected={String(rebate.id) === String(selected?.id)}
                        data-state={state}
                        onMouseEnter={() => hoverTo(rebate.id)}
                        onMouseLeave={() => clearTimeout(hoverTimer.current)}
                        onClick={() => choose(rebate.id)}
                      >
                        <Photo name={rebate.student?.name} image={rebate.student?.profileImage} />
                        <span className="rb-row__who">
                          <strong title={rebate.student?.name || undefined}>{rebate.student?.name || rebate.rollNumber}</strong>
                          <span>
                            {rebate.rollNumber} · {rangeText(toKey(rebate.startDate), toKey(rebate.endDate))}
                          </span>
                        </span>
                        <span className="rb-row__days" data-tone={STATES[state].tone}>
                          <b title={period && here !== rebate.dayCount ? `${here} of ${days(rebate.dayCount)} in this period` : undefined}>
                            {period && here !== rebate.dayCount ? `${here}/${rebate.dayCount}d` : `${rebate.dayCount}d`}
                          </b>
                          <small>{STATES[state].label}</small>
                        </span>
                        <span className="rb-row__track">
                          {period ? <Track rebate={rebate} period={period} today={today} /> : <span className="rb-row__when">{rebate.type === "long-term" ? "Long-term" : "Short-term"}</span>}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="rb-empty">
                  {search
                    ? `No rebate in this period matches "${search}".`
                    : day
                      ? `Nobody is away on ${dayLabel(day)}.`
                      : filter === "archived"
                        ? "Nothing archived in this period."
                        : filter === "all"
                          ? "No rebates in this period yet."
                          : `No ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} rebates in this period.`}
                </p>
              )}
            </div>

            <div className="rb-pager">
              <span>{total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(total, page * PAGE_SIZE)} of ${number(total)}` : ""}</span>
              <button
                type="button"
                onClick={() => {
                  setPage(page - 1)
                  setPicked(null)
                }}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPage(page + 1)
                  setPicked(null)
                }}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </aside>

          <section className="rb-main">
            <PeriodConsole
              overview={overview.data}
              day={day}
              onDay={(next) => {
                setDay(next)
                reset()
              }}
              status={status}
              onDismissStatus={() => setStatus(null)}
            />
            <div className="rb-detail" ref={detailRef} aria-live="polite">
              {selected ? (
                <RebateCard key={`${selected.id}:${selected.updatedAt}`} rebate={selected} period={period} today={today} onDone={onDone} />
              ) : (
                <p className="rb-empty rb-empty--detail">{list.isLoading ? "" : "Pick a rebate to see it here."}</p>
              )}
            </div>
          </section>
        </div>
      </Page.Body>

      {creating && (
        <NewRebateModal
          period={period}
          today={today}
          onClose={() => setCreating(false)}
          onCreated={(rebates) => {
            setCreating(false)
            setPicked(rebates[0]?.id || null)
            onDone({ message: rebates.length > 1 ? `Created a rebate for ${rebates.length} students.` : `Created ${rebates[0]?.rollNumber}'s rebate.` })
          }}
        />
      )}
    </Page>
  )
}

export default DiningRebatesPage
