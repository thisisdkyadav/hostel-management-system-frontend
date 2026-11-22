import { useLayoutEffect, useMemo } from "react"
import { usePhoneBeta } from "./phoneBeta"
import { canForce, disablePhoneMode, enablePhoneMode, isDesktopSiteOn, isPhoneDevice } from "./phoneMode"

/**
 * Phone mode for the student portal. Detection is pure and reads the real
 * layout width (not the patched innerWidth), so it gives the same answer on
 * every render; the forcing itself (zoom + rule rewrite) is applied before
 * paint and undone when the student layout unmounts (logout).
 */
const useStudentPhone = (enabled) => {
  // On by default; false only if the student chose the classic layout on this device.
  const beta = usePhoneBeta()
  const state = useMemo(() => {
    const isPhone = Boolean(enabled) && beta && isPhoneDevice()
    const desktopSite = isPhone && isDesktopSiteOn()
    return { isPhone, forced: desktopSite && canForce(), blocked: desktopSite && !canForce() }
  }, [enabled, beta])

  useLayoutEffect(() => {
    if (!state.isPhone) return undefined
    enablePhoneMode()
    return () => disablePhoneMode()
  }, [state.isPhone])

  return state
}

export default useStudentPhone
