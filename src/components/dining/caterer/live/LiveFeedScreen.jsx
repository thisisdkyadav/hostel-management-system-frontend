import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Maximize, Minimize, X } from "lucide-react"
import { IconButton, LoadingState } from "hzero"
import { useSocket } from "@/contexts/SocketProvider"
import { localTodayKey } from "../catererHelpers"
import { buildCatererPalette, useDiningScope } from "../diningScope"
import PulsePanel from "./PulsePanel"
import ScanStream from "./ScanStream"
import KitchenTabs from "./KitchenTabs"
import {
  FEED_LIMIT,
  FEED_REFRESH_MS,
  MAX_ENTRIES,
  OPTIONS_REFRESH_MS,
  RECORD_REFRESH_MS,
  SOCKET_DEBOUNCE_MS,
  buildRush,
  decorate,
  entriesFromRecord,
  indexStudents,
  mergeEntries,
  resolveMeals,
  sameCaterer,
  useNow,
} from "./liveHelpers"
import "./LiveFeed.css"

const requestFullscreen = () => {
  const root = document.documentElement
  if (!root.requestFullscreen || document.fullscreenElement) return
  try {
    Promise.resolve(root.requestFullscreen()).catch(() => {})
  } catch {
    // Fullscreen is a nicety; the screen works the same without it.
  }
}

const exitFullscreen = () => {
  if (!document.fullscreenElement || !document.exitFullscreen) return
  Promise.resolve(document.exitFullscreen()).catch(() => {})
}

/** Keeps the display awake while the screen is open, and takes the lock back after a tab switch. */
const useWakeLock = () => {
  useEffect(() => {
    if (!navigator.wakeLock?.request) return undefined
    let sentinel = null
    let cancelled = false
    const acquire = async () => {
      if (document.visibilityState !== "visible") return
      try {
        const lock = await navigator.wakeLock.request("screen")
        if (cancelled) lock.release().catch(() => {})
        else sentinel = lock
      } catch {
        // Denied or unsupported right now; try again next time the tab is shown.
      }
    }
    const onVisible = () => { if (document.visibilityState === "visible") acquire() }
    acquire()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisible)
      sentinel?.release().catch(() => {})
    }
  }, [])
}

const useFullscreen = () => {
  const [active, setActive] = useState(() => Boolean(document.fullscreenElement))
  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onChange)
    requestFullscreen()
    return () => {
      document.removeEventListener("fullscreenchange", onChange)
      exitFullscreen()
    }
  }, [])
  const toggle = useCallback(() => (document.fullscreenElement ? exitFullscreen() : requestFullscreen()), [])
  return [active, toggle]
}

const CATERER_FILTER_KEY = "hms.dining.liveCaterer"

/** Admin and Dining Office: which caterer the screen is narrowed to, kept for the tab session. */
const useCatererFilter = (enabled) => {
  const [value, setValue] = useState(() => {
    if (!enabled) return ""
    try {
      return window.sessionStorage.getItem(CATERER_FILTER_KEY) || ""
    } catch {
      return ""
    }
  })
  const change = useCallback((next) => {
    setValue(next)
    try {
      if (next) window.sessionStorage.setItem(CATERER_FILTER_KEY, next)
      else window.sessionStorage.removeItem(CATERER_FILTER_KEY)
    } catch {
      // Storage can be unavailable; the filter still works for this visit.
    }
  }, [])
  return [enabled ? value : "", change]
}

const LiveFeedScreen = () => {
  const scope = useDiningScope()
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const nowMs = useNow(15000)
  const [fullscreen, toggleFullscreen] = useFullscreen()
  useWakeLock()

  const [filter, setFilter] = useState("all")
  const [previewId, setPreviewId] = useState(null)
  const [socketEntries, setSocketEntries] = useState([])
  const [catererPick, setCatererPick] = useCatererFilter(scope.oversight)

  /* ---------- who, when, and which meal is open ---------- */
  const optionsQuery = useQuery({
    queryKey: scope.optionsKey(),
    queryFn: () => scope.options(),
    refetchInterval: OPTIONS_REFRESH_MS,
  })
  const options = optionsQuery.data
  const today = options?.today || localTodayKey()
  const periodId = options?.currentPeriodId || ""
  const period = useMemo(() => options?.periods?.find((item) => item.id === periodId) || null, [options, periodId])
  const meals = useMemo(
    () => resolveMeals({ slots: period?.mealSlots, currentKey: options?.currentMealSlotKey || "", nowMs, today }),
    [period, options?.currentMealSlotKey, nowMs, today]
  )
  const mealKey = meals.current?.key || ""

  // Admin and Dining Office: the caterers serving this period, each with its own colour.
  const caterers = useMemo(() => {
    const serving = new Set(period?.catererIds || [])
    return (options?.caterers || []).filter((item) => serving.has(item.id))
  }, [options, period])
  const palette = useMemo(() => buildCatererPalette(caterers), [caterers])
  const catererId = caterers.some((item) => item.id === catererPick) ? catererPick : ""
  const showCaterer = scope.oversight && !catererId

  // The local clock moved on to another meal before the server's answer did: ask again soon.
  const { refetch: refetchOptions } = optionsQuery
  const serverKey = options?.currentMealSlotKey || ""
  useEffect(() => {
    if (!options || meals.clockKey === serverKey) return undefined
    const id = setTimeout(() => refetchOptions(), 1500)
    return () => clearTimeout(id)
  }, [options, meals.clockKey, serverKey, refetchOptions])

  /* ---------- the meal being served ---------- */
  const recordParams = { periodId, date: today, mealSlotKey: mealKey }
  const recordQuery = useQuery({
    queryKey: scope.pulseKey(recordParams),
    queryFn: () => scope.pulse(recordParams),
    enabled: Boolean(periodId && mealKey),
    refetchInterval: RECORD_REFRESH_MS,
  })
  const record = mealKey ? recordQuery.data : undefined

  const feedParams = { limit: FEED_LIMIT, mealSlotKey: mealKey, ...(scope.oversight ? { date: today, catererId } : {}) }
  const feedQuery = useQuery({
    queryKey: scope.feedKey(feedParams),
    queryFn: () => scope.feed(feedParams),
    enabled: Boolean(mealKey),
    refetchInterval: FEED_REFRESH_MS,
  })

  /* ---------- the last meal, when nothing is being served ---------- */
  const last = meals.last
  const lastParams = { periodId, date: last?.date || today, mealSlotKey: last?.slot.key || "" }
  const lastQuery = useQuery({
    queryKey: scope.pulseKey(lastParams),
    queryFn: () => scope.pulse(lastParams),
    enabled: Boolean(periodId && last && !mealKey),
    refetchInterval: OPTIONS_REFRESH_MS,
    retry: false,
  })
  const lastRecord = mealKey ? undefined : lastQuery.data
  // The caterer's record lists every scan; across all caterers the last meal's scans come from the feed.
  const lastFeedParams = { limit: FEED_LIMIT, date: last?.date || today, mealSlotKey: last?.slot.key || "", catererId }
  const lastFeedQuery = useQuery({
    queryKey: scope.feedKey(lastFeedParams),
    queryFn: () => scope.feed(lastFeedParams),
    enabled: scope.oversight && Boolean(last && !mealKey),
    refetchInterval: OPTIONS_REFRESH_MS,
    retry: false,
  })

  /* ---------- live scans over the socket, then a calm refresh of the counts ---------- */
  const { refetch: refetchRecord } = recordQuery
  const { refetch: refetchFeed } = feedQuery
  const debounceRef = useRef(null)
  useEffect(() => {
    if (!socket) return undefined
    const onScan = (payload) => {
      const verification = payload?.verification
      if (!verification?.id) return
      const entry = { ...verification, receivedAt: Date.now() }
      // Only this meal's scans are kept, so a new meal starts a fresh stream.
      setSocketEntries((prev) => [entry, ...prev.filter((item) => item.id !== entry.id && item.mealSlotKey === entry.mealSlotKey)].slice(0, MAX_ENTRIES))
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        refetchRecord()
        // Across caterers the feed is what carries rooms for brand-new scans.
        if (scope.oversight) refetchFeed()
      }, SOCKET_DEBOUNCE_MS)
    }
    socket.on("dining-meal-verification:new", onScan)
    return () => {
      socket.off("dining-meal-verification:new", onScan)
      clearTimeout(debounceRef.current)
    }
  }, [socket, refetchRecord, refetchFeed, scope.oversight])

  // Back online after a drop: catch up on whatever was missed.
  const wasConnected = useRef(isConnected)
  useEffect(() => {
    if (isConnected && !wasConnected.current) {
      refetchOptions()
      refetchRecord()
      refetchFeed()
    }
    wasConnected.current = isConnected
  }, [isConnected, refetchOptions, refetchRecord, refetchFeed])

  /* ---------- derived ---------- */
  const raw = useMemo(() => {
    if (!mealKey) return scope.oversight ? lastFeedQuery.data || [] : entriesFromRecord(lastRecord)
    const live = socketEntries.filter((entry) => sameCaterer(entry, catererId))
    return mergeEntries([feedQuery.data || [], live], { mealKey, today })
  }, [mealKey, scope.oversight, lastFeedQuery.data, lastRecord, socketEntries, catererId, feedQuery.data, today])
  const index = useMemo(() => indexStudents(record || lastRecord, raw), [record, lastRecord, raw])
  const entries = useMemo(() => raw.map((entry) => decorate(entry, index, nowMs)), [raw, index, nowMs])
  const rush = useMemo(() => buildRush({ record, entries: raw, nowMs, catererId }), [record, raw, nowMs, catererId])
  // Narrowed to one caterer, its row of the breakdown stands in for the meal's totals.
  const narrow = (source) => (catererId ? source?.caterers?.find((item) => item.id === catererId) : source?.summary)

  const previewed = previewId ? entries.find((entry) => entry.id === previewId) : null
  const spotlight = previewed || entries[0] || null
  const issueCount = entries.filter((entry) => entry.status !== "verified").length
  const summary = narrow(record)
  const todayCount = summary ? summary.verifiedCount + summary.issueCount : entries.length

  const idle = !meals.current
  const caption = idle && last ? `Last meal: ${last.slot.name}${last.yesterday ? ", yesterday" : ""}` : null
  const lastLoading = scope.oversight ? lastFeedQuery.isPending : lastQuery.isPending
  const feedLoading = mealKey ? feedQuery.isPending : Boolean(last) && lastLoading && Boolean(periodId)
  const feedError = mealKey ? feedQuery.isError && !feedQuery.data : false

  const close = () => {
    exitFullscreen()
    let target = scope.home
    try {
      target = window.sessionStorage.getItem(scope.lastPathKey) || target
    } catch {
      // Storage can be unavailable; the portal home is a fine place to land.
    }
    navigate(target.startsWith(scope.home) && target !== scope.livePath ? target : scope.home, { replace: true })
  }

  const kitchens = scope.oversight ? (
    <KitchenTabs
      caterers={caterers}
      kitchens={(record || lastRecord)?.caterers}
      totals={(record || lastRecord)?.summary}
      palette={palette}
      value={catererId}
      onChange={(next) => {
        setPreviewId(null)
        setCatererPick(next)
      }}
    />
  ) : null

  if (optionsQuery.isPending) {
    return (
      <div className="lf-screen lf-screen-center">
        <LoadingState message="Getting the live feed ready" />
      </div>
    )
  }

  return (
    <div className="lf-screen" data-idle={idle || undefined}>
      <div className="lf-gridlines" aria-hidden="true" />
      <div className="lf-controls">
        <IconButton
          variant="secondary"
          icon={fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          ariaLabel={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggleFullscreen}
        />
        <IconButton variant="secondary" icon={<X size={20} />} ariaLabel="Close live feed" title="Close" onClick={close} />
      </div>
      <main className="lf-layout">
        <PulsePanel
          meals={meals}
          connected={isConnected}
          summary={summary}
          summaryError={mealKey ? recordQuery.isError : false}
          onRetrySummary={() => refetchRecord()}
          lastSummary={narrow(lastRecord)}
          rush={rush}
          spotlight={spotlight}
          previewing={Boolean(previewed)}
          nowMs={nowMs}
          palette={palette}
          showCaterer={scope.oversight}
        />
        <ScanStream
          entries={entries}
          issueCount={issueCount}
          todayCount={todayCount}
          filter={filter}
          onFilter={setFilter}
          nowMs={nowMs}
          previewId={previewId}
          onPreview={setPreviewId}
          caption={caption}
          idle={idle}
          loading={feedLoading}
          error={feedError}
          onRetry={() => refetchFeed()}
          kitchens={kitchens}
          palette={palette}
          showCaterer={showCaterer}
        />
      </main>
    </div>
  )
}

export default LiveFeedScreen
