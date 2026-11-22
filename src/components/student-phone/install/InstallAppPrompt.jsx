import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Download, ExternalLink, MoreVertical, PlusSquare, Share, X } from "lucide-react"
import useSheetDrag from "../kit/useSheetDrag"
import { isPhoneDevice } from "../phoneMode"
import { checkInstalled, installPrompt, isStandalone, onInstallChange, openInApp, platform, runInstall } from "./pwaInstall"
import "./install-prompt.css"

const SHOW_AFTER_MS = 2500
// Coming back to a tab left in the background this long counts as opening the site again
// (Chrome restores old tabs without reloading them).
const REOPEN_AFTER_MS = 30 * 60 * 1000

// Once per page load: moving between pages inside SMS doesn't bring it back.
let shownThisLoad = false

const shouldOffer = () => isPhoneDevice() && !isStandalone()

const appIcon = <img className="iap-icon" src="/pwa-192.png" alt="" width="56" height="56" />

/**
 * Phones only, students only (mounted from StudentLayout): after login, offer to
 * install the SMS app, or, when it's already installed, to open this in the app.
 * Shown each time the site is opened (a page load, or returning to a tab that sat in
 * the background for 30+ min); "Not now" only closes it for this visit.
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
    let timer = 0
    const offer = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(async () => {
        const state = await checkInstalled()
        if (!alive || !shouldOffer()) return
        shownThisLoad = true
        setInstalled(state)
        setCanPrompt(Boolean(installPrompt()))
        setOpenTried(false)
        setOpen(true)
      }, SHOW_AFTER_MS)
    }
    if (!shownThisLoad) offer()

    let hiddenAt = 0
    const onVisibility = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now()
      else if (hiddenAt && Date.now() - hiddenAt > REOPEN_AFTER_MS) offer()
    }
    document.addEventListener("visibilitychange", onVisibility)
    const off = onInstallChange(async () => {
      setCanPrompt(Boolean(installPrompt()))
      setInstalled(await checkInstalled())
    })
    return () => {
      alive = false
      window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisibility)
      off()
    }
  }, [])

  const close = () => setOpen(false)
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
          <button type="button" className="iap-btn" onClick={close}>
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
          <button type="button" className="iap-btn" onClick={close}>
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
