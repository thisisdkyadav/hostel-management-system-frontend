import { useEffect, useState } from "react"

/** True while the viewport is at most `maxWidth` px wide (phones, portrait tablets). */
const useNarrow = (maxWidth = 720) => {
  const query = `(max-width: ${maxWidth}px)`
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    if (!window.matchMedia) return undefined
    const media = window.matchMedia(query)
    const sync = () => setNarrow(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [query])
  return narrow
}

export default useNarrow
