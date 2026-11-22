import { useSyncExternalStore } from "react"

/**
 * Opt-in for the new phone app while it's in beta. Stored per device (it only
 * matters on a phone); off by default, so students keep the classic layout
 * until they switch it on from their profile.
 */
const KEY = "sms_phone_beta"
const listeners = new Set()

const read = () => {
  try {
    return localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

export const setPhoneBeta = (on) => {
  try {
    if (on) localStorage.setItem(KEY, "1")
    else localStorage.removeItem(KEY)
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

export const usePhoneBeta = () => useSyncExternalStore(subscribe, read, () => false)
