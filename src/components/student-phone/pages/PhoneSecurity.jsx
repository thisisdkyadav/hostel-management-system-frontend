import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { LogIn, LogOut, ShieldCheck } from "lucide-react"
import QRCodeGenerator from "../../QRCodeGenerator"
import { EmptyCard, ErrorCard, Ghosts, Lead, Row, timeOf } from "../kit/ListBits"
import { securityEntriesQuery } from "../phoneQueries"

const dayLabel = (value) => {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
}

/** Your gate QR on top, and every time you checked in or out of the hostel below. */
const PhoneSecurity = () => {
  const query = useQuery(securityEntriesQuery())
  const entries = useMemo(() => query.data?.studentEntries || [], [query.data])
  const days = useMemo(() => {
    const groups = []
    for (const entry of entries) {
      const label = dayLabel(entry.dateAndTime)
      if (groups.at(-1)?.label !== label) groups.push({ label, entries: [] })
      groups.at(-1).entries.push(entry)
    }
    return groups
  }, [entries])

  return (
    <div className="mk-page">
      <h1 className="mk-title">Security</h1>
      <section className="ms-qr">
        <QRCodeGenerator />
      </section>

      <h2 className="mk-label ms-label">Check-ins and check-outs</h2>
      {query.isPending ? (
        <Ghosts count={3} />
      ) : query.isError && !query.data ? (
        <ErrorCard text="Couldn't load your entries." onRetry={() => query.refetch()} />
      ) : entries.length === 0 ? (
        <EmptyCard icon={ShieldCheck} title="No entries yet" text="Each time the gate scans your QR, it shows up here." />
      ) : (
        days.map((day, index) => (
          <section key={`${index}-${day.label}`} className="ms-day">
            <h3 className="mk-sub ms-day__label">{day.label}</h3>
            <ul className="mk-list">
              {day.entries.map((entry) => {
                const inside = entry.status === "Checked In"
                return (
                  <li key={entry._id}>
                    <Row lead={<Lead icon={inside ? LogIn : LogOut} tone={inside ? "success" : "info"} size={18} />} title={entry.status} meta={entry.hostel?.name || entry.hostelName} trailing={<span className="mk-row__time">{timeOf(entry.dateAndTime)}</span>} />
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

export default PhoneSecurity
