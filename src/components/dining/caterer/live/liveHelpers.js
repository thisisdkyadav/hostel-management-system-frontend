// Helpers for the caterer Live Feed screen.
// Shared day-key math and vocabulary live in ../catererHelpers.js; slot/clock helpers in ../meal-records.
import { useEffect, useState } from "react"
import { ISSUE_LABELS, toDayKey } from "../catererHelpers"
import { sortSlots, timeToMinutes } from "../meal-records/mealRecordsHelpers"

export const FEED_LIMIT = 100
export const MAX_ENTRIES = 100
export const RECORD_REFRESH_MS = 20000
export const OPTIONS_REFRESH_MS = 60000
export const FEED_REFRESH_MS = 30000
export const SOCKET_DEBOUNCE_MS = 2000
export const RUSH_MINUTES = 15
export const FRESH_MS = 12000

const MINUTE = 60000

/** Wall clock in ms, re-read every `intervalMs`. */
export const useNow = (intervalMs = 15000) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/* ---------- meals ---------- */

const minutesOfDay = (ms) => {
  const date = new Date(ms)
  return date.getHours() * 60 + date.getMinutes()
}

const slotWindow = (slot) => {
  const start = timeToMinutes(slot?.startTime)
  let end = timeToMinutes(slot?.endTime)
  if (start === null || end === null) return null
  if (end <= start) end += 1440
  return { start, end }
}

export const formatWindow = (slot) => (slot ? `${slot.startTime}–${slot.endTime}` : "")

/** "42m", "1h 10m". */
export const formatSpan = (minutes) => {
  const total = Math.max(0, Math.ceil(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Where we are in the day.
 *   current: the meal the server says is open (falls back to the clock if the server has not said)
 *   next:    the first meal that has not started (tomorrow's first meal after the last one)
 *   clockKey: the meal the local clock says is open, to notice when the server's answer is stale
 *   last:    the most recent meal that has finished (yesterday's last meal before the first one)
 * Minutes are fractional so a countdown can be read to the second.
 */
export const resolveMeals = ({ slots = [], currentKey = "", nowMs, today }) => {
  const ordered = sortSlots(slots)
  const nowMin = minutesOfDay(nowMs) + (new Date(nowMs).getSeconds() / 60)
  const placed = ordered.map((slot) => ({ slot, window: slotWindow(slot) })).filter((item) => item.window)

  const byKey = currentKey ? placed.find((item) => item.slot.key === currentKey) : null
  const byClock = placed.find((item) => nowMin >= item.window.start && nowMin < item.window.end)
  const current = byKey || (currentKey ? null : byClock) || null

  const upcoming = placed.find((item) => item.window.start > nowMin && item !== current)
  const next = upcoming
    ? { slot: upcoming.slot, minutes: upcoming.window.start - nowMin, tomorrow: false }
    : placed[0]
      ? { slot: placed[0].slot, minutes: placed[0].window.start + 1440 - nowMin, tomorrow: true }
      : null

  const finished = placed.filter((item) => item.window.end <= nowMin && item !== current)
  const last = finished.length
    ? { slot: finished[finished.length - 1].slot, date: today, yesterday: false }
    : placed.length
      ? { slot: placed[placed.length - 1].slot, date: shiftDay(today, -1), yesterday: true }
      : null

  const endsIn = current ? Math.max(0, slotWindow(current.slot).end - nowMin) : null
  return { current: current?.slot || null, clockKey: byClock?.slot.key || "", endsIn, next, last }
}

const shiftDay = (key, delta) => {
  const [y, m, d] = String(key).split("-").map(Number)
  if (!y || !m || !d) return key
  const date = new Date(y, m - 1, d + delta)
  const pad = (n) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/* ---------- entries ---------- */

export const ISSUE_TONES = {
  duplicate: "warning",
  "wrong-caterer": "danger",
  "not-allocated": "danger",
  "unknown-student": "danger",
  "outside-meal-time": "warning",
  "no-active-period": "warning",
  "on-rebate": "warning",
}

export const isIssue = (entry) => entry.status !== "verified"
export const issueLabel = (entry) => ISSUE_LABELS[entry.status] || entry.message || "Needs a look"
export const issueTone = (entry) => ISSUE_TONES[entry.status] || "danger"

const time = (value) => {
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

/** Newest first, de-duplicated by id (later lists win; socket entries carry receivedAt), only this meal today. */
export const mergeEntries = (lists, { mealKey, today }) => {
  const byId = new Map()
  for (const list of lists) {
    for (const entry of list) {
      if (entry?.id) byId.set(entry.id, entry)
    }
  }
  return [...byId.values()]
    .filter((entry) => entry.mealSlotKey === mealKey && toDayKey(entry.scannedAt) === today)
    .sort((a, b) => time(b.scannedAt) - time(a.scannedAt))
    .slice(0, MAX_ENTRIES)
}

/** Students on the meal record by roll number: they carry the room and hostel the scan feed lacks. */
export const indexStudents = (record) => {
  const index = new Map()
  for (const row of record?.students || []) {
    if (row.student?.rollNumber) index.set(row.student.rollNumber, row.student)
  }
  return index
}

/** Scan entry plus the room and the best photo we have, ready for rows and the spotlight. */
export const decorate = (entry, index, nowMs) => {
  const known = index.get(entry.rollNumber) || index.get(entry.student?.rollNumber) || null
  const room = known ? [known.hostel?.name, known.room?.displayRoom].filter(Boolean).join(", ") : ""
  return {
    id: entry.id,
    name: entry.student?.name || known?.name || "Unknown student",
    rollNumber: entry.rollNumber || entry.student?.rollNumber || "",
    photo: entry.student?.profileImage || known?.profileImage || "",
    room,
    status: entry.status,
    source: entry.source,
    message: entry.message || "",
    scannedAt: entry.scannedAt,
    fresh: Boolean(entry.receivedAt) && nowMs - entry.receivedAt < FRESH_MS,
  }
}

/** The scans of a finished meal, rebuilt from its record (verified students plus the issue attempts). */
export const entriesFromRecord = (record) => {
  if (!record) return []
  const key = record.mealSlot?.key
  const verified = (record.students || [])
    .filter((row) => row.verifiedAt && row.student)
    .map((row) => ({
      id: `record-${row.allocationId || row.student.id}`,
      student: row.student,
      rollNumber: row.student.rollNumber,
      mealSlotKey: key,
      scannedAt: row.verifiedAt,
      source: row.verificationSource,
      status: "verified",
    }))
  const attempts = (record.issues || []).map((issue) => ({ ...issue, mealSlotKey: key }))
  return [...verified, ...attempts].sort((a, b) => time(b.scannedAt) - time(a.scannedAt)).slice(0, MAX_ENTRIES)
}

/** "just now", "2m ago", "1h 5m ago". */
export const relativeTime = (value, nowMs) => {
  const seconds = Math.round((nowMs - time(value)) / 1000)
  if (seconds < 45) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h ago` : `${h}h ${m}m ago`
}

export const exactTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

/* ---------- rush ---------- */

/**
 * Verified students per minute over the last RUSH_MINUTES minutes, oldest first.
 * The meal record knows every student's first verified time; the feed fills in scans newer than the last refresh.
 */
export const buildRush = ({ record, entries, nowMs }) => {
  const firstSeen = new Map()
  const note = (key, at) => {
    if (!key) return
    const ms = time(at)
    if (!ms) return
    const previous = firstSeen.get(key)
    if (previous === undefined || ms < previous) firstSeen.set(key, ms)
  }
  for (const row of record?.students || []) {
    if (row.verifiedAt) note(row.student?.rollNumber || row.allocationId, row.verifiedAt)
  }
  for (const entry of entries) {
    if (entry.status === "verified") note(entry.rollNumber || entry.student?.rollNumber || entry.id, entry.scannedAt)
  }

  const buckets = new Array(RUSH_MINUTES).fill(0)
  const start = nowMs - RUSH_MINUTES * MINUTE
  for (const at of firstSeen.values()) {
    if (at < start || at > nowMs) continue
    const slot = Math.min(RUSH_MINUTES - 1, Math.floor((at - start) / MINUTE))
    buckets[slot] += 1
  }
  const recent = buckets.slice(-3)
  const rate = Math.round(recent.reduce((sum, n) => sum + n, 0) / recent.length)
  return { buckets, rate, peak: Math.max(0, ...buckets) }
}

/** Smooth path through the points (mid-point cubic), y flipped for SVG. */
export const smoothPath = (values, width, height, ceiling) => {
  const max = Math.max(1, ceiling)
  const step = values.length > 1 ? width / (values.length - 1) : width
  const points = values.map((value, i) => [i * step, height - (value / max) * height])
  if (!points.length) return { line: "", area: "" }
  let line = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const mid = (x0 + x1) / 2
    line += ` C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`
  }
  const area = `${line} L ${points[points.length - 1][0]} ${height} L ${points[0][0]} ${height} Z`
  return { line, area }
}

/* ---------- initials ---------- */

export const initialsOf = (name) =>
  String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?"
