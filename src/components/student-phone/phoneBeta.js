import { useSyncExternalStore } from "react"

/**
 * The phone app is the default on phones. Students can switch to the classic
 * layout; that choice is stored per device ("0"). Anything else means on.
 */
const KEY = "sms_phone_beta"
const listeners = new Set()

const read = () => {
  try {
    return localStorage.getItem(KEY) !== "0"
  } catch {
    return true
  }
}

export const setPhoneBeta = (on) => {
  try {
    if (on) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, "0")
  } catch {
    /* storage blocked: the switch just won't stick */
  }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener) => {
  listeners.add(listener)
  const onStorage = (event) => event.key === KEY && listener()
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export const usePhoneBeta = () => useSyncExternalStore(subscribe, read, () => true)
