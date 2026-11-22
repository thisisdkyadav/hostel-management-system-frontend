/**
 * Student phone mode: detect a phone, and when the browser's "Desktop site"
 * switch is on, force the phone layout anyway.
 *
 * "Desktop site" (Chrome Android, Safari iOS) sends a desktop user agent and
 * lays the page out ~980px wide, ignoring the viewport meta tag. It cannot
 * hide the hardware: the primary pointer stays coarse with no hover, and
 * `screen` keeps the phone's real CSS size. Measured on a real phone
 * (public/mobile-probe.html): screen 384x832, layout 980 wide.
 *
 * Forcing has three parts, all undone by disablePhoneMode():
 *   1. zoom the root by layoutWidth / phoneWidth, so the page lays out at the
 *      phone's width and renders at its normal size;
 *   2. rewrite every same-origin stylesheet's width media queries to answer
 *      for the phone's width, and its vh lengths to the real screen height
 *      (zoom does not scale vh: 100vh rendered 2.55x too tall);
 *   3. make window.innerWidth and window.matchMedia width queries answer for
 *      the phone's width too.
 * Normal phones (Desktop site off) get none of this, only the phone layout.
 */

const PHONE_MAX_SHORT_SIDE = 600
const FORCE_RATIO = 1.15
const TEST_FLAG_KEY = "sms_phone_test"

const root = () => document.documentElement
const nativeMatchMedia = typeof window !== "undefined" && window.matchMedia ? window.matchMedia.bind(window) : null
const mm = (query) => (nativeMatchMedia ? nativeMatchMedia(query).matches : false)

const hadOwnInnerWidth = typeof window !== "undefined" && Object.prototype.hasOwnProperty.call(window, "innerWidth")
const innerWidthDescriptor =
  typeof window !== "undefined"
    ? Object.getOwnPropertyDescriptor(hadOwnInnerWidth ? window : Object.getPrototypeOf(window), "innerWidth")
    : null
const layoutWidth = () => (innerWidthDescriptor?.get ? innerWidthDescriptor.get.call(window) : window.innerWidth)

const readTestFlag = () => {
  try {
    return window.sessionStorage.getItem(TEST_FLAG_KEY) === "1"
  } catch {
    return false
  }
}

/** A touch-only device with a phone-sized screen (tablets and touch laptops fail). */
export const isPhoneDevice = () => {
  if (typeof window === "undefined") return false
  if (readTestFlag()) return true
  return mm("(pointer: coarse)") && mm("(hover: none)") && Math.min(window.screen.width, window.screen.height) < PHONE_MAX_SHORT_SIDE
}

/** The phone's real CSS width in the current orientation. */
const phoneWidth = () => {
  const short = Math.min(window.screen.width, window.screen.height)
  const long = Math.max(window.screen.width, window.screen.height)
  return mm("(orientation: landscape)") ? long : short
}

/** True when the page is laid out much wider than the phone ("Desktop site" on). */
export const isDesktopSiteOn = () => isPhoneDevice() && layoutWidth() > phoneWidth() * FORCE_RATIO

export const canForce = () => typeof CSS !== "undefined" && CSS.supports?.("zoom", "2")

// ---------- media query + vh rewriting ----------

const toPx = (value, unit) => (unit === "px" ? value : value * 16)
const ALWAYS = "(min-width: 0px)"
const NEVER = "(max-width: 0px)"

/** Replace each width feature in a media query with a constant answer for width `w`. */
export const answerWidthQueries = (text, w) =>
  text
    .replace(/\(\s*(min|max)-width\s*:\s*([\d.]+)(px|rem|em)\s*\)/gi, (_, kind, n, unit) => {
      const px = toPx(parseFloat(n), unit.toLowerCase())
      return (kind.toLowerCase() === "min" ? w >= px : w <= px) ? ALWAYS : NEVER
    })
    .replace(/\(\s*width\s*(>=|<=|>|<)\s*([\d.]+)(px|rem|em)\s*\)/gi, (_, op, n, unit) => {
      const px = toPx(parseFloat(n), unit.toLowerCase())
      const ok = op === ">=" ? w >= px : op === "<=" ? w <= px : op === ">" ? w > px : w < px
      return ok ? ALWAYS : NEVER
    })

const VH_RE = /(-?[\d.]+)(?:d|s|l)?vh\b/g
// vw has the same problem: 100vw is the 980px "Desktop site" width, so hzero's
// modals (max-width: 100vw - gap) came out ~2.5x wider than the phone.
const VW_RE = /(-?[\d.]+)(?:d|s|l)?vw\b/g
const usesViewportUnits = (value) => {
  const hit = VH_RE.test(value) || VW_RE.test(value)
  VH_RE.lastIndex = 0
  VW_RE.lastIndex = 0
  return hit
}
const toPhoneUnits = (value) =>
  value.replace(VH_RE, (_, n) => `calc(var(--sp-vh, 1vh) * ${n})`).replace(VW_RE, (_, n) => `calc(var(--sp-vw, 1vw) * ${n})`)
const originalMedia = new WeakMap()
const originalProps = new WeakMap()

const walkRules = (rules, w) => {
  for (const rule of rules) {
    if (typeof CSSMediaRule !== "undefined" && rule instanceof CSSMediaRule) {
      if (!originalMedia.has(rule)) originalMedia.set(rule, rule.media.mediaText)
      const next = answerWidthQueries(originalMedia.get(rule), w)
      if (next !== rule.media.mediaText) rule.media.mediaText = next
    }
    if (rule.style && /v[hw]\b/.test(rule.style.cssText) && !originalProps.has(rule)) {
      const saved = []
      for (let i = 0; i < rule.style.length; i += 1) {
        const prop = rule.style[i]
        const value = rule.style.getPropertyValue(prop)
        if (usesViewportUnits(value)) saved.push([prop, value, rule.style.getPropertyPriority(prop)])
      }
      if (saved.length) {
        originalProps.set(rule, saved)
        for (const [prop, value, priority] of saved) rule.style.setProperty(prop, toPhoneUnits(value), priority)
      }
    }
    if (rule.cssRules?.length) walkRules(rule.cssRules, w)
  }
}

const restoreRules = (rules) => {
  for (const rule of rules) {
    if (originalMedia.has(rule)) rule.media.mediaText = originalMedia.get(rule)
    const saved = originalProps.get(rule)
    if (saved) {
      for (const [prop, value, priority] of saved) rule.style.setProperty(prop, value, priority)
      originalProps.delete(rule)
    }
    if (rule.cssRules?.length) restoreRules(rule.cssRules)
  }
}

const eachSheet = (fn) => {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin (fonts); nothing of ours lives there
    }
    if (rules) fn(rules)
  }
}

// ---------- activation ----------

let forced = false
let users = 0
let observer = null
let frame = 0

const syncViewport = () => {
  const zoom = layoutWidth() / phoneWidth()
  root().style.zoom = zoom.toFixed(4)
  const height = window.innerHeight / zoom
  root().style.setProperty("--sp-h", `${height}px`)
  root().style.setProperty("--sp-vh", `${height / 100}px`)
  root().style.setProperty("--sp-vw", `${phoneWidth() / 100}px`)
}

const rewriteAll = () => {
  const w = phoneWidth()
  eachSheet((rules) => walkRules(rules, w))
}

const scheduleRewrite = () => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(rewriteAll)
}

const onResize = () => {
  syncViewport()
  scheduleRewrite()
}

const startForcing = () => {
  forced = true
  root().dataset.phoneForced = "true"
  syncViewport()
  rewriteAll()

  try {
    Object.defineProperty(window, "innerWidth", { configurable: true, get: phoneWidth })
  } catch {
    // leave it; layout code for students follows the phone flag, not innerWidth
  }
  window.matchMedia = (query) => nativeMatchMedia(answerWidthQueries(String(query), phoneWidth()))

  // Route chunks load their CSS later; rewrite it as it arrives.
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === "LINK") node.addEventListener("load", scheduleRewrite, { once: true })
        if (node.nodeName === "STYLE" || node.nodeName === "LINK") scheduleRewrite()
      }
    }
  })
  observer.observe(document.head, { childList: true })
  window.addEventListener("resize", onResize)
}

const stopForcing = () => {
  forced = false
  observer?.disconnect()
  observer = null
  cancelAnimationFrame(frame)
  window.removeEventListener("resize", onResize)
  if (nativeMatchMedia) window.matchMedia = nativeMatchMedia
  try {
    if (hadOwnInnerWidth && innerWidthDescriptor) Object.defineProperty(window, "innerWidth", innerWidthDescriptor)
    else delete window.innerWidth
  } catch {
    // ignore
  }
  eachSheet(restoreRules)
  root().style.zoom = ""
  root().style.removeProperty("--sp-h")
  root().style.removeProperty("--sp-vh")
  root().style.removeProperty("--sp-vw")
  delete root().dataset.phoneForced
}

/**
 * Turn phone mode on for this page. Returns what it found:
 *   isPhone   — render the phone layout
 *   forced    — Desktop site was on and the page is being forced
 *   blocked   — Desktop site is on but this browser can't be forced (show the notice)
 */
export const enablePhoneMode = () => {
  const isPhone = isPhoneDevice()
  if (!isPhone) return { isPhone: false, forced: false, blocked: false }
  users += 1
  root().dataset.studentPhone = "true"
  const desktopSite = layoutWidth() > phoneWidth() * FORCE_RATIO
  if (desktopSite && !canForce()) return { isPhone: true, forced: false, blocked: true }
  if (desktopSite && !forced) startForcing()
  return { isPhone: true, forced: desktopSite, blocked: false }
}

export const disablePhoneMode = () => {
  if (users === 0) return
  users -= 1
  if (users > 0) return
  if (forced) stopForcing()
  delete root().dataset.studentPhone
}
