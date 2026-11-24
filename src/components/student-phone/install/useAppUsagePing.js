import { useEffect, useRef } from "react"
import { appUsageApi } from "../../../service"
import { browserName, checkInstalled, isStandalone, platform } from "./pwaInstall"

const DEVICE_KEY = "sms_device_id"
// Coming back to a tab left in the background this long counts as a new visit.
const REVISIT_AFTER_MS = 30 * 60 * 1000

let memoryId = ""
const deviceId = () => {
  const make = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`)
  try {
    let id = window.localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = make()
      window.localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    memoryId = memoryId || make() // private mode: one id for this page load
    return memoryId
  }
}

let sentThisLoad = false

/**
 * Students only: tell the server about this visit (which phone/browser, and
 * whether it is running as the installed SMS app), for the admin App Usage
 * page. Once per page load, and again when coming back after 30+ min.
 * Fire-and-forget: a failed report is simply dropped.
 */
const useAppUsagePing = (enabled, layout) => {
  const layoutRef = useRef(layout)
  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  useEffect(() => {
    if (!enabled) return undefined
    const send = async () => {
      const os = platform()
      const browser = browserName()
      const app = isStandalone()
      let installedHint = null
      // Only Chrome on Android can tell a tab the app is installed.
      if (os === "android" && browser === "chrome" && !app) installedHint = await checkInstalled().catch(() => null)
      appUsageApi
        .ping({
          deviceId: deviceId(),
          platform: os === "other" ? "desktop" : os,
          browser,
          mode: app ? "app" : "browser",
          layout: layoutRef.current,
          installedHint: typeof installedHint === "boolean" ? installedHint : null,
        })
        .catch(() => {})
    }
    // A moment after opening: the phone/classic choice has settled, and the
    // page's own data goes first.
    let first = 0
    if (!sentThisLoad) {
      first = window.setTimeout(() => {
        if (sentThisLoad) return
        sentThisLoad = true
        send()
      }, 1500)
    }
    let hiddenAt = 0
    const onVisibility = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now()
      else if (hiddenAt && Date.now() - hiddenAt > REVISIT_AFTER_MS) {
        hiddenAt = 0
        send()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.clearTimeout(first)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [enabled])
}

export default useAppUsagePing
