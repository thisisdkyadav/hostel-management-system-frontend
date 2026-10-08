import { Badge, Text } from "hzero"
import { BedDouble, CalendarClock, CreditCard, FileCheck2, FileText, LogIn, LogOut, Receipt, RotateCcw, SearchCheck, ShieldCheck, UserCheck, X } from "lucide-react"
import { buildH4Timeline } from "./h4.timeline"
import "./h4.css"

const icons = { submit: FileText, faculty: UserCheck, office: SearchCheck, chief: ShieldCheck, charges: Receipt, payment: CreditCard, room: BedDouble, checkin: LogIn, checkout: LogOut, invoice: FileCheck2, dates: CalendarClock, cancel: X, return: RotateCcw }
const eventTime = (value) => {
  if (!value || !Number.isFinite(+new Date(value))) return null
  const date = new Date(value)
  return { iso: date.toISOString(), label: `${date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} IST` }
}

export default function H4Timeline({ request }) {
  const entries = buildH4Timeline(request)
  if (!entries.length) return <Text size="sm" color="muted">No timeline events recorded yet.</Text>
  return (
    <ol className="h4-timeline" aria-label="H4 accommodation timeline">
      {entries.map((entry) => {
        const Icon = icons[entry.icon] || FileText
        const time = eventTime(entry.at)
        return (
          <li key={entry.id} className={`h4-timeline-item h4-timeline-item--${entry.state} h4-timeline-item--${entry.tone}`} aria-current={entry.state === "current" ? "step" : undefined}>
            <span className="h4-timeline-marker" aria-hidden="true"><Icon size={16} /></span>
            <div className="h4-timeline-content">
              <div className="h4-timeline-heading">
                <Text as="span" size="sm" weight="semibold" color={entry.state === "upcoming" ? "muted" : "body"}>{entry.title}</Text>
                {entry.state === "current" && <Badge tone="primary" size="sm">Current step</Badge>}
                {entry.state === "upcoming" && <Text as="span" size="xs" color="muted">Upcoming</Text>}
              </div>
              <div className="h4-timeline-meta">
                {[entry.role, entry.actor].filter(Boolean).join(" · ")}
                {time && <time dateTime={time.iso}>{time.label}</time>}
              </div>
              {entry.note && <Text as="div" size="sm" color={entry.state === "current" ? "body" : "muted"} className="h4-timeline-note">{entry.note}</Text>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
