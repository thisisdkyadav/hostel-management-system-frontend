/**
 * Is the SMS app (the PWA) installed on this phone, and can we install or open it?
 *
 * Signals, strongest first:
 *   - running standalone            → we are the app
 *   - `beforeinstallprompt` fired   → NOT installed (Chrome only offers it then)
 *   - getInstalledRelatedApps()     → installed (Chrome Android; manifest lists itself)
 *   - `appinstalled` / a past standalone launch remembered in localStorage
 * main.jsx keeps the deferred prompt on window.deferredPrompt.
 */

const INSTALLED_KEY = "sms_pwa_installed"
const CHANGE = "sms-pwa-change"

const store = {
  get: (key) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      if (value === null) window.localStorage.removeItem(key)
      else window.localStorage.setItem(key, value)
    } catch {
      /* private mode: just don't remember */
    }
  },
}

export const isStandalone = () =>
  (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches) || window.navigator.standalone === true

export const platform = () => {
  const ua = navigator.userAgent || ""
  const iOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  if (iOS) return "ios"
  if (/Android|Linux/i.test(ua) && navigator.maxTouchPoints > 0) return "android"
  return "other"
}

/**
 * Google Chrome itself (not Edge, Samsung Internet, Opera, Firefox, an in-app
 * webview…). Only Chrome makes the real app (a WebAPK) that owns our links, so
 * only there can "Open in app" hand the page over; elsewhere "Add to Home
 * screen" is just a shortcut back into that browser.
 */
export const isChrome = () => {
  const ua = navigator.userAgent || ""
  return /Chrome\/\d/.test(ua) && !/EdgA|EdgiOS|Edg\/|OPR|OPT\/|SamsungBrowser|YaBrowser|UCBrowser|MiuiBrowser|HeyTapBrowser|VivoBrowser|DuckDuckGo|Firefox|; wv\)/i.test(ua)
}

export const installPrompt = () => window.deferredPrompt || null
export const rememberedInstalled = () => store.get(INSTALLED_KEY) === "1"

const changed = () => window.dispatchEvent(new Event(CHANGE))
export const onInstallChange = (fn) => {
  window.addEventListener(CHANGE, fn)
  return () => window.removeEventListener(CHANGE, fn)
}

if (typeof window !== "undefined") {
  if (isStandalone()) store.set(INSTALLED_KEY, "1")
  window.addEventListener("beforeinstallprompt", () => {
    store.set(INSTALLED_KEY, null) // Chrome only offers install when it isn't installed
    changed()
  })
  window.addEventListener("appinstalled", () => {
    window.deferredPrompt = null
    store.set(INSTALLED_KEY, "1")
    changed()
  })
}

/** Fires when the browser finishes installing the app (from our button or its menu). */
export const onAppInstalled = (fn) => {
  window.addEventListener("appinstalled", fn)
  return () => window.removeEventListener("appinstalled", fn)
}

/** Ask the browser whether this PWA is installed (Chrome Android). null = can't tell. */
export const checkInstalled = async () => {
  if (installPrompt()) return false
  if (typeof navigator.getInstalledRelatedApps === "function") {
    try {
      const apps = await navigator.getInstalledRelatedApps()
      if (apps.length > 0) {
        store.set(INSTALLED_KEY, "1")
        return true
      }
      return rememberedInstalled() ? true : false
    } catch {
      /* fall through */
    }
  }
  return rememberedInstalled() ? true : null
}

/** Show the browser's install dialog. Resolves to true when the student accepted. */
export const runInstall = async () => {
  const prompt = installPrompt()
  if (!prompt) return false
  prompt.prompt()
  const { outcome } = await prompt.userChoice
  window.deferredPrompt = null
  // Accepting only starts the install; `appinstalled` marks it done.
  changed()
  return outcome === "accepted"
}

/**
 * Open this page in the installed app. On Android an intent:// link for our own
 * https URL is handed to the system, which gives it to the installed app (it owns
 * the site's links). There is no way to do this on iOS.
 */
export const openInApp = (path = "/student") => {
  const url = new URL(path, window.location.origin)
  window.location.href = `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;end`
}

/** Open this page in Google Chrome (Android), where the app can be installed. */
export const openInChrome = (path = "/student") => {
  const url = new URL(path, window.location.origin)
  window.location.href = `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.android.chrome;end`
}
