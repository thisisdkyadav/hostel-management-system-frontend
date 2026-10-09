import { useState } from "react"
import { getMediaUrl } from "@/utils/mediaUtils"
import { initialsOf } from "./liveHelpers"

/** A student's photo, or their initials when there is none (or it fails to load). */
const ScanPhoto = ({ photo, name, alt = "" }) => {
  const src = photo ? getMediaUrl(photo) : ""
  const [failed, setFailed] = useState("")
  if (!src || failed === src) {
    return <span className="lf-photo-fallback" aria-hidden="true">{initialsOf(name)}</span>
  }
  return <img className="lf-photo-img" src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} />
}

export default ScanPhoto
