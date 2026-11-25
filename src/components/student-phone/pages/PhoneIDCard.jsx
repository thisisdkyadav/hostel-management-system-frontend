import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, IdCard, ImageOff, RefreshCw } from "lucide-react"
import { useAuth } from "../../../contexts/AuthProvider"
import { getMediaUrl } from "../../../utils/mediaUtils"
import IDCardUploadModal from "../../IDCardUploadModal"
import { ErrorCard } from "../kit/ListBits"
import { idCardQuery } from "../phoneQueries"

const SIDES = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
]

/** One side's photo: a placeholder while it loads, and a clear retry if it can't (bad network, missing file). */
const CardPhoto = ({ src, label }) => {
  const [state, setState] = useState("loading") // loading | ready | failed
  const [attempt, setAttempt] = useState(0)
  if (state === "failed") {
    return (
      <div className="mi-side__img mi-side__empty mi-side__failed" role="alert">
        <ImageOff size={28} aria-hidden="true" />
        <span>Your {label.toLowerCase()} photo is saved</span>
        <span className="mk-sub">The preview didn&apos;t load, usually because of a slow connection. No need to upload it again.</span>
        <button
          type="button"
          className="mk-btn mk-btn--primary mk-btn--sm"
          onClick={() => {
            setState("loading")
            setAttempt((n) => n + 1)
          }}
        >
          <RefreshCw size={15} /> Retry preview
        </button>
      </div>
    )
  }
  const url = attempt ? `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}` : src
  return (
    <span className="mi-side__frame" data-state={state}>
      {state === "loading" && <span className="mk-shimmer mi-side__img" aria-hidden="true" />}
      <img className="mi-side__img" src={url} alt={`ID card, ${label.toLowerCase()}`} onLoad={() => setState("ready")} onError={() => setState("failed")} />
    </span>
  )
}

/** Photos of both sides of the institute ID card, with a button to (re)upload each. */
const PhoneIDCard = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const query = useQuery({ ...idCardQuery(user?._id), enabled: Boolean(user?._id) })
  const [side, setSide] = useState(null)
  const card = query.data || {}

  return (
    <div className="mk-page">
      <h1 className="mk-title">ID card</h1>
      <p className="mk-sub mk-intro">Keep clear photos of both sides of your institute ID card here.</p>
      {!user?._id || (query.isError && !query.data) ? (
        <ErrorCard text="Couldn't load your ID card." onRetry={() => query.refetch()} />
      ) : (
        SIDES.map(({ key, label }) => (
          <section key={key} className="mi-side">
            <div className="mi-side__head">
              <h2 className="mk-label">{label}</h2>
              {card[key] && (
                <button type="button" className="mk-btn mk-btn--ghost mk-btn--sm" onClick={() => setSide(key)}>
                  <Camera size={16} /> Replace
                </button>
              )}
            </div>
            {query.isPending ? (
              <span className="mk-shimmer mi-side__img" />
            ) : card[key] ? (
              <CardPhoto key={card[key]} src={getMediaUrl(card[key])} label={label} />
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
