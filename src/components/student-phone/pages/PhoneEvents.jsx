import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import Segmented from "../kit/Segmented"
import PhoneSheet from "../kit/PhoneSheet"
import { EmptyCard, ErrorCard, Ghosts } from "../kit/ListBits"
import { phoneEventsQuery } from "../phoneQueries"

const FILTERS = [
  { value: "upcoming", label: "Upcoming", stat: "upcoming" },
  { value: "past", label: "Past", stat: "past" },
  { value: "all", label: "All", stat: "total" },
]

const when = (value) =>
  new Date(value).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })

const DateTile = ({ value }) => {
  const date = new Date(value)
  return (
    <span className="mh-event__date" aria-hidden="true">
      {date.toLocaleDateString("en-IN", { month: "short" })}
      <b>{date.getDate()}</b>
    </span>
  )
}

/** Campus events on a phone: upcoming first, a tap shows the details. */
const PhoneEvents = () => {
  const [filter, setFilter] = useState("upcoming")
  const [open, setOpen] = useState(null)
  const query = useInfiniteQuery(phoneEventsQuery(filter))
  const pages = query.data?.pages
  const events = useMemo(() => (pages || []).flatMap((page) => page?.events || []), [pages])
  const stats = pages?.[0]?.stats || null
  const filters = FILTERS.map((item) => ({ ...item, count: stats ? stats[item.stat] || 0 : undefined }))
  const [now] = useState(Date.now)

  const list = () => {
    if (query.isPending) return <Ghosts />
    if (query.isError && !query.data) return <ErrorCard text="Couldn't load events." onRetry={() => query.refetch()} />
    if (events.length === 0) {
      return (
        <EmptyCard
          icon={CalendarDays}
          title={filter === "upcoming" ? "Nothing coming up" : "No events"}
          text={filter === "upcoming" ? "New events show up here as soon as they're announced." : undefined}
          action={
            filter === "upcoming" && stats?.past ? (
              <button type="button" className="mk-btn mk-btn--soft" onClick={() => setFilter("past")}>
                See past events
              </button>
            ) : null
          }
        />
      )
    }
    return (
      <>
        <ul className="mk-list">
          {events.map((event) => (
            <li key={event._id || event.id}>
              <button type="button" className="mh-event" data-past={new Date(event.dateAndTime).getTime() < now || undefined} onClick={() => setOpen(event)}>
                <DateTile value={event.dateAndTime} />
                <span className="mh-event__main">
                  <span className="mh-event__name">{event.eventName}</span>
                  <span className="mk-sub">{when(event.dateAndTime)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {query.hasNextPage && (
          <button type="button" className="mk-btn mk-btn--soft mc-more" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
            {query.isFetchingNextPage ? "Loading…" : "Show more"}
          </button>
        )}
      </>
    )
  }

  return (
    <div className="mk-page">
      <h1 className="mk-title">Events</h1>
      <div className="mk-scroll-x">
        <Segmented label="Which events" options={filters} value={filter} onChange={setFilter} />
      </div>
      {list()}
      {open && (
        <PhoneSheet title="" label={open.eventName} onClose={() => setOpen(null)}>
          <div className="mc-detail">
            <div className="mc-detail__head">
              <DateTile value={open.dateAndTime} />
              <div className="mc-detail__titles">
                <h2 className="mc-detail__title">{open.eventName}</h2>
              </div>
            </div>
            <ul className="mk-list">
              <li className="mk-field">
                <Clock size={18} className="mk-field__icon" aria-hidden="true" />
                <span className="mk-field__main">
                  <span className="mk-field__label">When</span>
                  <span className="mk-field__value">{when(open.dateAndTime)}</span>
                </span>
              </li>
              {open.hostel?.name && (
                <li className="mk-field">
                  <MapPin size={18} className="mk-field__icon" aria-hidden="true" />
                  <span className="mk-field__main">
                    <span className="mk-field__label">For</span>
                    <span className="mk-field__value">{open.hostel.name}</span>
                  </span>
                </li>
              )}
            </ul>
            {open.description && <p className="mc-text">{open.description}</p>}
          </div>
        </PhoneSheet>
      )}
    </div>
  )
}

export default PhoneEvents
