import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bell, Megaphone } from "lucide-react"
import Segmented from "../kit/Segmented"
import PhoneSheet from "../kit/PhoneSheet"
import { EmptyCard, ErrorCard, Ghosts, Lead, Row, shortDate } from "../kit/ListBits"
import { notificationsQuery } from "../phoneQueries"
import { timeAgo } from "./complaintBits"

const FILTERS = [
  { value: "active", label: "Active" },
  { value: "all", label: "All" },
]

/** Notices from the hostel office, newest first; a tap opens the full message. */
const PhoneNotifications = () => {
  const [expiry, setExpiry] = useState("active")
  const [open, setOpen] = useState(null)
  const query = useQuery(notificationsQuery(expiry))
  const items = query.data?.data || []

  const list = () => {
    if (query.isPending) return <Ghosts />
    if (query.isError && !query.data) return <ErrorCard text="Couldn't load notifications." onRetry={() => query.refetch()} />
    if (items.length === 0)
      return expiry === "active" ? (
        <EmptyCard
          icon={Bell}
          title="No active notices"
          text="Notices from the hostel office appear here while they're current."
          action={
            <button type="button" className="mk-btn mk-btn--soft" onClick={() => setExpiry("all")}>
              Show all notices
            </button>
          }
        />
      ) : (
        <EmptyCard icon={Bell} title="No notices yet" text="Notices from the hostel office appear here." />
      )
    return (
      <ul className="mk-list">
        {items.map((item) => {
          const expired = item.expiryDate && new Date(item.expiryDate) < new Date()
          return (
            <li key={item._id}>
              <Row
                lead={<Lead icon={item.type === "announcement" ? Megaphone : Bell} tone={expired ? "muted" : "info"} />}
                title={item.title}
                meta={`${item.sender?.name ? `${item.sender.name} · ` : ""}${timeAgo(item.createdAt)}`}
                dim={expired}
                onClick={() => setOpen(item)}
              >
                <span className="mk-row__clamp">{item.message}</span>
              </Row>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="mk-page">
      <h1 className="mk-title">Notifications</h1>
      <div className="mk-scroll-x">
        <Segmented label="Which notifications" options={FILTERS} value={expiry} onChange={setExpiry} />
      </div>
      {list()}
      {open && (
        <PhoneSheet title="" label={open.title} onClose={() => setOpen(null)}>
          <div className="mc-detail">
            <div className="mc-detail__head">
              <Lead icon={open.type === "announcement" ? Megaphone : Bell} />
              <div className="mc-detail__titles">
                <h2 className="mc-detail__title">{open.title}</h2>
                <span className="mk-sub">
                  {open.sender?.name ? `${open.sender.name} · ` : ""}
                  {shortDate(open.createdAt, true)}
                </span>
              </div>
            </div>
            <p className="mc-text">{open.message}</p>
            {open.expiryDate && <p className="mk-sub">Shown until {shortDate(open.expiryDate, true)}</p>}
          </div>
        </PhoneSheet>
      )}
    </div>
  )
}

export default PhoneNotifications
