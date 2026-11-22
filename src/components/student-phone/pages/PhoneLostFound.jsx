import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PackageSearch } from "lucide-react"
import Segmented from "../kit/Segmented"
import PhoneSheet from "../kit/PhoneSheet"
import { EmptyCard, ErrorCard, Ghosts, Pill, Row, shortDate } from "../kit/ListBits"
import { lostFoundQuery } from "../phoneQueries"
import { getMediaUrl } from "../../../utils/mediaUtils"

const FILTERS = [
  { value: "all", label: "All", stat: "total" },
  { value: "Active", label: "Unclaimed", stat: "active" },
  { value: "Claimed", label: "Claimed", stat: "claimed" },
]

const imageOf = (image) => (typeof image === "string" ? image : image?.url || image?.ref || "")

const Thumb = ({ item }) => {
  const src = imageOf(item.images?.[0])
  return src ? (
    <img className="mk-thumb" src={getMediaUrl(src)} alt="" loading="lazy" />
  ) : (
    <span className="mk-thumb mk-thumb--icon" aria-hidden="true">
      <PackageSearch size={22} />
    </span>
  )
}

/** Things handed in at the security desk; claim them there. */
const PhoneLostFound = () => {
  const [status, setStatus] = useState("all")
  const [open, setOpen] = useState(null)
  const query = useQuery(lostFoundQuery(status))
  const items = query.data?.lostAndFoundItems || []
  const stats = query.data?.stats || null
  const filters = FILTERS.map((item) => ({ ...item, count: stats ? stats[item.stat] || 0 : undefined }))

  const list = () => {
    if (query.isPending) return <Ghosts />
    if (query.isError && !query.data) return <ErrorCard text="Couldn't load lost & found." onRetry={() => query.refetch()} />
    if (items.length === 0) return <EmptyCard icon={PackageSearch} title="Nothing here" text="Items handed in to security show up here." />
    return (
      <ul className="mk-list">
        {items.map((item) => (
          <li key={item._id || item.id}>
            <Row
              lead={<Thumb item={item} />}
              title={item.itemName}
              meta={`Found ${shortDate(item.dateFound, true)}`}
              trailing={<Pill tone={item.status === "Claimed" ? "success" : "warning"}>{item.status === "Claimed" ? "Claimed" : "Unclaimed"}</Pill>}
              onClick={() => setOpen(item)}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="mk-page">
      <h1 className="mk-title">Lost & Found</h1>
      <div className="mk-scroll-x">
        <Segmented label="Filter items" options={filters} value={status} onChange={setStatus} />
      </div>
      {list()}
      {open && (
        <PhoneSheet title="" label={open.itemName} onClose={() => setOpen(null)}>
          <div className="mc-detail">
            {open.images?.length > 0 && (
              <div className="mk-gallery">
                {open.images.map((image, index) => (
                  <img key={index} src={getMediaUrl(imageOf(image))} alt={`${open.itemName}, photo ${index + 1}`} />
                ))}
              </div>
            )}
            <div className="mc-detail__titles">
              <h2 className="mc-detail__title">{open.itemName}</h2>
              <span className="mk-sub">Found {shortDate(open.dateFound, true)}</span>
            </div>
            <Pill tone={open.status === "Claimed" ? "success" : "warning"}>{open.status === "Claimed" ? "Claimed" : "Waiting to be claimed"}</Pill>
            {open.description && <p className="mc-text">{open.description}</p>}
          </div>
        </PhoneSheet>
      )}
    </div>
  )
}

export default PhoneLostFound
