import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Maximize, Minimize, X } from "lucide-react"
import { IconButton, LoadingState } from "hzero"
import { catererApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { useSocket } from "@/contexts/SocketProvider"
import { CATERER_LAST_PATH_KEY } from "@/constants/navigationConfig"
import { localTodayKey } from "../catererHelpers"
import PulsePanel from "./PulsePanel"
import ScanStream from "./ScanStream"
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

const LiveFeedScreen = () => {
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const nowMs = useNow(15000)
  const [fullscreen, toggleFullscreen] = useFullscreen()
  useWakeLock()

  const [filter, setFilter] = useState("all")
  const [previewId, setPreviewId] = useState(null)
  const [socketEntries, setSocketEntries] = useState([])

  /* ---------- who, when, and which meal is open ---------- */
  const optionsQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecordOptions(),
    queryFn: () => catererApi.getMealRecordOptions(),
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
    queryKey: queryKeys.caterer.mealRecord(recordParams),
    queryFn: () => catererApi.getMealRecord(recordParams),
    enabled: Boolean(periodId && mealKey),
    refetchInterval: RECORD_REFRESH_MS,
  })
  const record = mealKey ? recordQuery.data : undefined

  const feedParams = { limit: FEED_LIMIT, mealSlotKey: mealKey }
  const feedQuery = useQuery({
    queryKey: queryKeys.caterer.mealFeed(feedParams),
    queryFn: async () => {
      const response = await catererApi.getMealVerificationFeed({ limit: FEED_LIMIT })
      return Array.isArray(response?.entries) ? response.entries : []
    },
    enabled: Boolean(mealKey),
    refetchInterval: FEED_REFRESH_MS,
  })

  /* ---------- the last meal, when nothing is being served ---------- */
  const last = meals.last
  const lastParams = { periodId, date: last?.date || today, mealSlotKey: last?.slot.key || "" }
  const lastQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecord(lastParams),
    queryFn: () => catererApi.getMealRecord(lastParams),
    enabled: Boolean(periodId && last && !mealKey),
    refetchInterval: OPTIONS_REFRESH_MS,
    retry: false,
  })
  const lastRecord = mealKey ? undefined : lastQuery.data

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
      debounceRef.current = setTimeout(() => refetchRecord(), SOCKET_DEBOUNCE_MS)
    }
    socket.on("dining-meal-verification:new", onScan)
    return () => {
      socket.off("dining-meal-verification:new", onScan)
      clearTimeout(debounceRef.current)
    }
  }, [socket, refetchRecord])

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
  const index = useMemo(() => indexStudents(record || lastRecord), [record, lastRecord])
  const raw = useMemo(
    () => (mealKey
      ? mergeEntries([feedQuery.data || [], socketEntries], { mealKey, today })
      : entriesFromRecord(lastRecord)),
    [mealKey, feedQuery.data, socketEntries, today, lastRecord]
  )
  const entries = useMemo(() => raw.map((entry) => decorate(entry, index, nowMs)), [raw, index, nowMs])
  const rush = useMemo(() => buildRush({ record, entries: raw, nowMs }), [record, raw, nowMs])

  const previewed = previewId ? entries.find((entry) => entry.id === previewId) : null
  const spotlight = previewed || entries[0] || null
  const issueCount = entries.filter((entry) => entry.status !== "verified").length
  const summary = record?.summary
  const todayCount = summary ? summary.verifiedCount + summary.issueCount : entries.length

  const idle = !meals.current
  const caption = idle && last ? `Last meal: ${last.slot.name}${last.yesterday ? ", yesterday" : ""}` : null
  const feedLoading = mealKey ? feedQuery.isPending : Boolean(last) && lastQuery.isPending && Boolean(periodId)
  const feedError = mealKey ? feedQuery.isError && !feedQuery.data : false

  const close = () => {
    exitFullscreen()
    let target = "/caterer"
    try {
      target = window.sessionStorage.getItem(CATERER_LAST_PATH_KEY) || target
    } catch {
      // Storage can be unavailable; the dashboard is a fine place to land.
    }
    navigate(target.startsWith("/caterer") && target !== "/caterer/live" ? target : "/caterer", { replace: true })
  }

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
          lastRecord={lastRecord}
          rush={rush}
          spotlight={spotlight}
          previewing={Boolean(previewed)}
          nowMs={nowMs}
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
        />
      </main>
    </div>
  )
}

export default LiveFeedScreen
