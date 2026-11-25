import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight, LogIn, LogOut, QrCode, ShieldCheck } from "lucide-react"
import PhoneSheet from "../kit/PhoneSheet"
import CampusQr from "../kit/CampusQr"
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
  const [qrOpen, setQrOpen] = useState(false)
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
      <button type="button" className="ms-qr" onClick={() => setQrOpen(true)}>
        <span className="ms-qr__icon" aria-hidden="true">
          <QrCode size={24} />
        </span>
        <span className="ms-qr__text">
          <span className="ms-qr__title">Show campus QR</span>
          <span className="mk-sub">Security scans it at the gate</span>
        </span>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
      {qrOpen && (
        <PhoneSheet title="Campus QR" onClose={() => setQrOpen(false)}>
          <CampusQr />
        </PhoneSheet>
      )}

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
