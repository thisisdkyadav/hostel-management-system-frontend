import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Download, ExternalLink, MoreVertical, PlusSquare, Share, X } from "lucide-react"
import useSheetDrag from "../kit/useSheetDrag"
import { isPhoneDevice } from "../phoneMode"
import { checkInstalled, installPrompt, isStandalone, onInstallChange, openInApp, platform, runInstall } from "./pwaInstall"
import "./install-prompt.css"

const SNOOZE_KEY = "sms_pwa_prompt_snooze"
const SEEN_KEY = "sms_pwa_prompt_seen" // sessionStorage: once per browser session
const SNOOZE_DAYS = 3
const SHOW_AFTER_MS = 2500

const read = (storage, key) => {
  try {
    return window[storage].getItem(key)
  } catch {
    return null
  }
}
const write = (storage, key, value) => {
  try {
    window[storage].setItem(key, value)
  } catch {
    /* ignore */
  }
}

const shouldOffer = () => {
  if (!isPhoneDevice() || isStandalone()) return false
  if (read("sessionStorage", SEEN_KEY) === "1") return false
  const until = Number(read("localStorage", SNOOZE_KEY) || 0)
  return !(until && Date.now() < until)
}

const appIcon = <img className="iap-icon" src="/pwa-192.png" alt="" width="56" height="56" />

/**
 * Phones only, students only (mounted from StudentLayout): after login, offer to
 * install the SMS app, or, when it's already installed, to open this in the app.
 * Shown once per browser session; "Not now" hides it for a few days.
 */
const InstallAppPrompt = () => {
  const [open, setOpen] = useState(false)
  const [installed, setInstalled] = useState(null) // true | false | null (unknown)
  const [canPrompt, setCanPrompt] = useState(() => Boolean(installPrompt()))
  const [openTried, setOpenTried] = useState(false)
  const os = platform()

  useEffect(() => {
    if (!shouldOffer()) return undefined
    let alive = true
    const timer = window.setTimeout(async () => {
      const state = await checkInstalled()
      if (!alive || !shouldOffer()) return
      setInstalled(state)
      setCanPrompt(Boolean(installPrompt()))
      setOpen(true)
      write("sessionStorage", SEEN_KEY, "1")
    }, SHOW_AFTER_MS)
    const off = onInstallChange(async () => {
      setCanPrompt(Boolean(installPrompt()))
      setInstalled(await checkInstalled())
    })
    return () => {
      alive = false
      window.clearTimeout(timer)
      off()
    }
  }, [])

  const close = () => setOpen(false)
  const snooze = () => {
    write("localStorage", SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86400000))
    close()
  }
  const { sheetRef, backdropRef } = useSheetDrag(close, open)

  if (!open) return null

  const install = async () => {
    if (await runInstall()) {
      setInstalled(true)
      close()
    }
  }

  const tryOpen = () => {
    openInApp(window.location.pathname + window.location.search)
    // If we're still here a moment later, the system didn't hand it over.
    window.setTimeout(() => {
      if (document.visibilityState === "visible") setOpenTried(true)
    }, 1500)
  }

  let body
  if (installed === true) {
    body = (
      <>
        <div className="iap-head">
          {appIcon}
          <div>
            <h2 className="iap-title">You have the SMS app</h2>
            <p className="iap-text">It opens full screen and remembers your login. Continue there?</p>
          </div>
        </div>
        {openTried && <p className="iap-note">Didn't switch? Open <b>SMS - IITI</b> from your home screen.</p>}
        <div className="iap-actions">
          {os === "android" ? (
            <button type="button" className="iap-btn iap-btn--primary" onClick={tryOpen}>
              <ExternalLink size={18} /> Open in app
            </button>
          ) : (
            <p className="iap-note">Open <b>SMS - IITI</b> from your home screen.</p>
          )}
          <button type="button" className="iap-btn" onClick={snooze}>
            Stay in browser
          </button>
        </div>
      </>
    )
  } else {
    const steps =
      os === "ios" ? (
        <ol className="iap-steps">
          <li>
            Tap <Share size={16} aria-label="Share" /> <b>Share</b> in Safari&apos;s toolbar
          </li>
          <li>
            Choose <PlusSquare size={16} aria-hidden="true" /> <b>Add to Home Screen</b>, then <b>Add</b>
          </li>
        </ol>
      ) : (
        <ol className="iap-steps">
          <li>
            Tap the browser menu <MoreVertical size={16} aria-label="menu" />
          </li>
          <li>
            Choose <b>Install app</b> or <b>Add to Home screen</b>
          </li>
        </ol>
      )
    body = (
      <>
        <div className="iap-head">
          {appIcon}
          <div>
            <h2 className="iap-title">Get the SMS app</h2>
            <p className="iap-text">One tap from your home screen, full screen, and you stay logged in. Takes a few seconds, no Play Store needed.</p>
          </div>
        </div>
        {!canPrompt && steps}
        <div className="iap-actions">
          {canPrompt && (
            <button type="button" className="iap-btn iap-btn--primary" onClick={install}>
              <Download size={18} /> Install app
            </button>
          )}
          <button type="button" className="iap-btn" onClick={snooze}>
            Not now
          </button>
          {os === "android" && installed === null && !canPrompt && (
            <button type="button" className="iap-link" onClick={tryOpen}>
              Already installed? Open in app
            </button>
          )}
        </div>
        {openTried && <p className="iap-note">Didn&apos;t switch? Open <b>SMS - IITI</b> from your home screen, or install it with the steps above.</p>}
      </>
    )
  }

  return createPortal(
    <div className="iap-layer" role="dialog" aria-modal="true" aria-label="SMS app">
      <div ref={backdropRef} className="iap-backdrop" onClick={close} />
      <div ref={sheetRef} className="iap-sheet">
        <div className="iap-grip" aria-hidden="true" />
        <button type="button" className="iap-close" onClick={close} aria-label="Close">
          <X size={20} />
        </button>
        {body}
      </div>
    </div>,
    document.body
  )
}

export default InstallAppPrompt
