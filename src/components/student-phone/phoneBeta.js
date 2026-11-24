import { useSyncExternalStore } from "react"

/**
 * The phone app is the default on phones. Students can switch to the classic
 * layout, but only for the current visit: the choice lives in memory, so a
 * reload or reopening SMS brings the phone app back.
 */
let on = true
const listeners = new Set()

// Devices that chose Classic before it became per-visit kept it in storage; drop it.
try {
  localStorage.removeItem("sms_phone_beta")
} catch {
  /* storage blocked: nothing stored either */
}

const read = () => on

export const setPhoneBeta = (next) => {
  on = Boolean(next)
  listeners.forEach((listener) => listener())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const usePhoneBeta = () => useSyncExternalStore(subscribe, read, () => true)
