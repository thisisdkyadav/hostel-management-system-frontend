import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, IdCard } from "lucide-react"
import { useAuth } from "../../../contexts/AuthProvider"
import { getMediaUrl } from "../../../utils/mediaUtils"
import IDCardUploadModal from "../../IDCardUploadModal"
import { ErrorCard } from "../kit/ListBits"
import { idCardQuery } from "../phoneQueries"

const SIDES = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
]

/** Photos of both sides of the institute ID card, with a button to (re)upload each. */
const PhoneIDCard = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const query = useQuery({ ...idCardQuery(user?._id), enabled: Boolean(user?._id) })
  const [side, setSide] = useState(null)
  const card = query.data || {}

  return (
    <div className="mk-page">
      <h1 className="mk-title">ID Card</h1>
      <p className="mk-sub mk-intro">Keep clear photos of both sides of your institute ID card here.</p>
      {query.isError && !query.data ? (
        <ErrorCard text="Couldn't load your ID card." onRetry={() => query.refetch()} />
      ) : (
        SIDES.map(({ key, label }) => (
          <section key={key} className="mi-side">
            <div className="mi-side__head">
              <h2 className="mk-label">{label}</h2>
              {card[key] && (
                <button type="button" className="mk-btn mk-btn--soft mk-btn--sm" onClick={() => setSide(key)}>
                  <Camera size={16} /> Replace
                </button>
              )}
            </div>
            {query.isPending ? (
              <span className="mk-shimmer mi-side__img" />
            ) : card[key] ? (
              <img className="mi-side__img" src={getMediaUrl(card[key])} alt={`ID card, ${label.toLowerCase()}`} />
            ) : (
              <button type="button" className="mi-side__img mi-side__empty" onClick={() => setSide(key)}>
                <IdCard size={30} aria-hidden="true" />
                <span>Add a photo of the {label.toLowerCase()}</span>
              </button>
            )}
          </section>
        ))
      )}
      {side && (
        <IDCardUploadModal
          isOpen
          side={side}
          userId={user._id}
          onClose={() => setSide(null)}
          onImageUpload={(url) => {
            queryClient.setQueryData(idCardQuery(user._id).queryKey, (old) => ({ ...(old || {}), [side]: url }))
            queryClient.invalidateQueries({ queryKey: idCardQuery(user._id).queryKey })
          }}
        />
      )}
    </div>
  )
}

export default PhoneIDCard
