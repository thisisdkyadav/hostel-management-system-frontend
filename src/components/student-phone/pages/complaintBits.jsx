import { Armchair, Droplets, Hammer, MoreHorizontal, Sparkles, Wifi, Zap } from "lucide-react"

export const CATEGORY_META = {
  Plumbing: { icon: Droplets, series: 1 },
  Electrical: { icon: Zap, series: 4 },
  Civil: { icon: Hammer, series: 3 },
  Cleanliness: { icon: Sparkles, series: 6 },
  Internet: { icon: Wifi, series: 5 },
  Carpenter: { icon: Armchair, series: 2 },
  Other: { icon: MoreHorizontal, series: 8, bg: "color-mix(in srgb, var(--color-series-8) 16%, var(--m-surface))" },
}

export const categoryMeta = (category) => CATEGORY_META[category] || CATEGORY_META.Other

/** Where a complaint is on its way: 0 submitted, 1 being worked on, 2 resolved. */
export const STATUS_META = {
  Pending: { step: 0, label: "Pending", tone: "info" },
  "In Progress": { step: 1, label: "In progress", tone: "warning" },
  "Forwarded to IDO": { step: 1, label: "Forwarded to IDO", short: "Forwarded", tone: "purple" },
  Resolved: { step: 2, label: "Resolved", tone: "success" },
  Rejected: { step: 2, label: "Rejected", tone: "danger" },
  Closed: { step: 2, label: "Closed", tone: "muted" },
}

export const statusMeta = (status) => STATUS_META[status] || { step: 0, label: status || "Pending", tone: "info" }

export const isOpenComplaint = (complaint) => statusMeta(complaint?.status).step < 2

export const CategoryIcon = ({ category, size = 20 }) => {
  const meta = categoryMeta(category)
  const Icon = meta.icon
  return (
    <span className="mc-cat" style={{ "--cat": `var(--color-series-${meta.series})`, "--cat-bg": meta.bg || `var(--color-series-${meta.series}-bg)` }} aria-hidden="true">
      <Icon size={size} strokeWidth={2} />
    </span>
  )
}

/** Three dots joined by a line: submitted → in progress → resolved. */
export const StatusTrack = ({ status }) => {
  const meta = statusMeta(status)
  return (
    <span className="mc-track" data-tone={meta.tone} data-step={meta.step} data-rejected={status === "Rejected" || undefined} aria-hidden="true">
      <i data-on />
      <b data-on={meta.step >= 1 || undefined} />
      <i data-on={meta.step >= 1 || undefined} />
      <b data-on={meta.step >= 2 || undefined} />
      <i data-on={meta.step >= 2 || undefined} />
    </span>
  )
}

export const StatusPill = ({ status }) => {
  const meta = statusMeta(status)
  return (
    <span className="mc-pill" data-tone={meta.tone}>
      {meta.label}
    </span>
  )
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago", "12 Oct". */
export const timeAgo = (value) => {
  if (!value) return ""
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  if (Number.isNaN(diff)) return ""
  if (diff < MINUTE) return "just now"
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} h ago`
  if (diff < 2 * DAY) return "yesterday"
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} days ago`
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) })
}

export const formatStamp = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""
