import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { usePhoneBeta } from "./phoneBeta"
import { canForce, disablePhoneMode, enablePhoneMode, isDesktopSiteOn, isPhoneDevice } from "./phoneMode"

/**
 * Phone mode for the student portal. Detection reads the real layout width
 * (not the patched innerWidth), so it gives the same answer on every render.
 * It is re-checked when the screen rotates or resizes; the forcing itself
 * (zoom + rule rewrite) is applied before paint and undone when the student
 * layout unmounts (logout) or the answer changes.
 */
const useStudentPhone = (enabled) => {
  // On by default; false only if the student chose the classic layout on this device.
  const beta = usePhoneBeta()
  const [viewport, setViewport] = useState(0)

  useEffect(() => {
    let frame = 0
    const onChange = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setViewport((n) => n + 1))
    }
    window.addEventListener("resize", onChange)
    window.addEventListener("orientationchange", onChange)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", onChange)
      window.removeEventListener("orientationchange", onChange)
    }
  }, [])

  const isPhone = Boolean(enabled) && beta && isPhoneDevice()
  const desktopSite = isPhone && isDesktopSiteOn()
  const forced = desktopSite && canForce()
  const blocked = desktopSite && !canForce()
  // `viewport` only bumps the memo so a rotation re-reads the checks above.
  const state = useMemo(() => ({ isPhone, forced, blocked, viewport }), [isPhone, forced, blocked, viewport])

  useLayoutEffect(() => {
    if (!isPhone) return undefined
    enablePhoneMode()
    return () => disablePhoneMode()
  }, [isPhone, forced])

  return state
}

export default useStudentPhone
