import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, Compass, Download, ExternalLink, Loader2, Menu, MoreHorizontal, MoreVertical, PlusSquare, Share, X } from "lucide-react"
import useSheetDrag from "../kit/useSheetDrag"
import useLayer, { isLayerOpen } from "../kit/useLayer"
import { isPhoneDevice } from "../phoneMode"
import { appOnPhone, checkInstalled, installPrompt, iosBrowser, isChrome, isStandalone, onAppInstalled, onInstallChange, openInApp, openInChrome, platform, runInstall } from "./pwaInstall"
import "./install-prompt.css"

const SHOW_AFTER_MS = 2500
// Coming back to a tab left in the background this long counts as opening the site again
// (Chrome restores old tabs without reloading them).
const REOPEN_AFTER_MS = 30 * 60 * 1000
// While installing, check this often whether the app is really on the phone.
const INSTALL_POLL_MS = 2000
// Give up waiting after this and offer Open app anyway.
const INSTALL_GIVE_UP_MS = 90 * 1000
// Browsers that can't say whether it's there: offer Open app after this.
const INSTALL_BLIND_MS = 20 * 1000
// Don't drop on top of something the student is doing; check again after this.
const BUSY_RETRY_MS = 4000

const somethingOpen = () => isLayerOpen() || Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'))

// Once per page load: moving between pages inside SMS doesn't bring it back.
let shownThisLoad = false

const shouldOffer = () => isPhoneDevice() && !isStandalone()

const share = <Share size={16} aria-label="Share" />
const addStep = (
  <li>
    Scroll down, choose <PlusSquare size={16} aria-hidden="true" /> <b>Add to Home Screen</b>, then <b>Add</b>
  </li>
)

/** Add-to-home-screen steps for each iPhone browser (Share is somewhere else in each). */
const IosSteps = ({ browser }) => {
  if (browser === "inapp")
    return (
      <ol className="iap-steps">
        <li>
          Open this page in <b>Safari</b>: tap <MoreHorizontal size={16} aria-label="more" /> or <Compass size={16} aria-label="Safari" /> and choose{" "}
          <b>Open in Safari</b>
        </li>
        <li>
          In Safari, tap {share} <b>Share</b>
        </li>
        {addStep}
      </ol>
    )
  const first = {
    chrome: (
      <>
        Tap {share} <b>Share</b> at the top right, next to the address
      </>
    ),
    edge: (
      <>
        Tap <MoreHorizontal size={16} aria-label="menu" /> at the bottom, then {share} <b>Share</b>
      </>
    ),
    firefox: (
      <>
        Tap <Menu size={16} aria-label="menu" /> at the bottom, then {share} <b>Share</b>
      </>
    ),
    safari: (
      <>
        Tap {share} <b>Share</b> in the toolbar (on newer iPhones, tap <MoreHorizontal size={16} aria-label="more" /> first)
      </>
    ),
  }[browser]
  return (
    <ol className="iap-steps">
      <li>{first}</li>
      {addStep}
    </ol>
  )
}

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
  const [phase, setPhase] = useState(null) // null | "installing" | "ready"
  const phaseRef = useRef(null)
  const fallbackRef = useRef(0)
  const waitStartedRef = useRef(0)
  const toPhase = useCallback((next) => {
    phaseRef.current = next
    setPhase(next)
  }, [])
  // Show "Installing" until the app is really on the phone, then (re)open the
  // sheet with "Open app", even if the student hid it meanwhile.
  const waitUntilOnPhone = useCallback(() => {
    if (phaseRef.current === "ready" || waitStartedRef.current) return
    waitStartedRef.current = Date.now()
    toPhase("installing")
    const ready = () => {
      window.clearTimeout(fallbackRef.current)
      waitStartedRef.current = 0
      toPhase("ready")
      setOpenTried(false)
      setOpen(true)
    }
    const check = async () => {
      const there = await appOnPhone()
      if (phaseRef.current !== "installing") return
      if (there === null) {
        fallbackRef.current = window.setTimeout(ready, INSTALL_BLIND_MS)
        return
      }
      if (there || Date.now() - waitStartedRef.current > INSTALL_GIVE_UP_MS) return ready()
      fallbackRef.current = window.setTimeout(check, INSTALL_POLL_MS)
    }
    check()
  }, [toPhase])
  const os = platform()
  // Android browsers other than Chrome (Edge…) only add a shortcut that opens in
  // themselves: send students to Chrome to install, and never "Open in app" from
  // here (the system would just hand the link back to this browser).
  const otherAndroidBrowser = os === "android" && !isChrome()

  useEffect(() => {
    if (!shouldOffer()) return undefined
    let alive = true
    let timer = 0
    const offer = (delay = SHOW_AFTER_MS) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(async () => {
        if (!alive || !shouldOffer()) return
        if (somethingOpen()) return offer(BUSY_RETRY_MS)
        const state = await checkInstalled()
        if (!alive || !shouldOffer()) return
        shownThisLoad = true
        setInstalled(state)
        setCanPrompt(Boolean(installPrompt()))
        setOpenTried(false)
        setOpen(true)
      }, delay)
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
    // The browser says installed, but the app may still be being built: keep
    // showing "Installing" until it's really on the phone.
    const offInstalled = onAppInstalled(() => {
      setInstalled(true)
      waitUntilOnPhone()
    })
    return () => {
      alive = false
      window.clearTimeout(timer)
      window.clearTimeout(fallbackRef.current)
      document.removeEventListener("visibilitychange", onVisibility)
      off()
      offInstalled()
    }
  }, [waitUntilOnPhone])

  const close = useCallback(() => setOpen(false), [])
  const { sheetRef, backdropRef } = useSheetDrag(close, open)
  useLayer(close, sheetRef, open) // Back / Escape close it; focus stays inside

  if (!open) return null

  const install = async () => {
    if (!(await runInstall())) return
    waitUntilOnPhone()
  }

  const tryChrome = () => {
    openInChrome(window.location.pathname + window.location.search)
    window.setTimeout(() => {
      if (document.visibilityState === "visible") setOpenTried(true)
    }, 1500)
  }

  const tryOpen = () => {
    openInApp(window.location.pathname + window.location.search)
    // If we're still here a moment later, the system didn't hand it over.
    window.setTimeout(() => {
      if (document.visibilityState === "visible") setOpenTried(true)
    }, 1500)
  }

  let body
  if (phase === "installing") {
    body = (
      <>
        <div className="iap-head">
          {appIcon}
          <div>
            <h2 className="iap-title">Installing the SMS app…</h2>
            <p className="iap-text">Your phone is setting it up, which can take up to a minute. We&apos;ll let you open it here as soon as it&apos;s ready.</p>
          </div>
        </div>
        <div className="iap-progress" role="status">
          <Loader2 size={20} className="iap-spin" aria-hidden="true" /> Installing
        </div>
        <div className="iap-actions">
          <button type="button" className="iap-btn" onClick={close}>
            Hide
          </button>
        </div>
      </>
    )
  } else if (phase === "ready") {
    body = (
      <>
        <div className="iap-head">
          {appIcon}
          <div>
            <h2 className="iap-title">
              <CheckCircle2 size={20} className="iap-done" aria-hidden="true" /> SMS app installed
            </h2>
            <p className="iap-text">It&apos;s on your home screen as <b>SMS - IITI</b>. Open it now to carry on there.</p>
          </div>
        </div>
        {openTried && <p className="iap-note">Didn&apos;t switch? Open <b>SMS - IITI</b> from your home screen.</p>}
        <div className="iap-actions">
          {os === "ios" ? (
            <p className="iap-note">Open <b>SMS - IITI</b> from your home screen.</p>
          ) : (
            <button type="button" className="iap-btn iap-btn--primary" onClick={tryOpen}>
              <ExternalLink size={18} /> Open app
            </button>
          )}
          <button type="button" className="iap-btn" onClick={close}>
            Stay in browser
          </button>
        </div>
      </>
    )
  } else if (installed === true) {
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
          {os === "android" && !otherAndroidBrowser ? (
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
  } else if (otherAndroidBrowser) {
    // Even when this browser offers its own install, it only makes a shortcut
    // that opens back in this browser, so send students to Chrome.
    body = (
      <>
        <div className="iap-head">
          {appIcon}
          <div>
            <h2 className="iap-title">Get the SMS app</h2>
            <p className="iap-text">
              This browser can&apos;t install apps. Open SMS in <b>Chrome</b> to install it: one tap from your home screen, full screen, and you stay
              logged in.
            </p>
          </div>
        </div>
        <ol className="iap-steps">
          <li>
            Tap <b>Open in Chrome</b> and log in there
          </li>
          <li>
            Tap <b>Install app</b> when Chrome offers it
          </li>
        </ol>
        {openTried && <p className="iap-note">Didn&apos;t switch? Open Chrome and go to <b>{window.location.host}</b>.</p>}
        <div className="iap-actions">
          <button type="button" className="iap-btn iap-btn--primary" onClick={tryChrome}>
            <ExternalLink size={18} /> Open in Chrome
          </button>
          <button type="button" className="iap-btn" onClick={close}>
            Not now
          </button>
        </div>
        <p className="iap-note">Already installed? Open <b>SMS - IITI</b> from your home screen.</p>
      </>
    )
  } else {
    const steps =
      os === "ios" ? (
        <IosSteps browser={iosBrowser()} />
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
            <p className="iap-text">One tap from your home screen, full screen, and you stay logged in. Takes a few seconds.</p>
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
        {os === "ios" && <p className="iap-note">Already have it? Open <b>SMS - IITI</b> from your home screen.</p>}
      </>
    )
  }

  return createPortal(
    <div className="iap-layer" role="dialog" aria-modal="true" aria-label="SMS app">
      <div ref={backdropRef} className="iap-backdrop" onClick={close} />
      <div ref={sheetRef} tabIndex={-1} className="iap-sheet">
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
