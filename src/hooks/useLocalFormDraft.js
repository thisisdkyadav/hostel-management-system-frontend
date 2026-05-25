import { useCallback, useEffect, useRef } from "react"

export const LOCAL_FORM_DRAFT_TTL_MS = 24 * 60 * 60 * 1000

const LOCAL_FORM_DRAFT_PREFIX = "hms:form-draft:v1"

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const resolveStorageKey = (formKey = "") => {
  const normalizedKey = String(formKey || "").trim()
  if (!normalizedKey) return ""
  return `${LOCAL_FORM_DRAFT_PREFIX}:${normalizedKey}`
}

export const buildLocalFormDraftKey = (...parts) =>
  parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(":")

export const readLocalFormDraft = (formKey, { ttlMs = LOCAL_FORM_DRAFT_TTL_MS } = {}) => {
  const storageKey = resolveStorageKey(formKey)
  if (!storageKey || !canUseLocalStorage()) return null

  try {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) return null

    const parsedValue = JSON.parse(rawValue)
    const updatedAt = Number(parsedValue?.updatedAt || 0)
    const isExpired = !updatedAt || Date.now() - updatedAt > ttlMs

    if (isExpired) {
      window.localStorage.removeItem(storageKey)
      return null
    }

    if (!Object.prototype.hasOwnProperty.call(parsedValue || {}, "data")) {
      window.localStorage.removeItem(storageKey)
      return null
    }

    return {
      updatedAt,
      data: parsedValue.data,
    }
  } catch (error) {
    console.error("Failed to read local form draft:", error)
    window.localStorage.removeItem(storageKey)
    return null
  }
}

export const saveLocalFormDraft = (formKey, data) => {
  const storageKey = resolveStorageKey(formKey)
  if (!storageKey || !canUseLocalStorage()) return false

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        updatedAt: Date.now(),
        data,
      })
    )
    return true
  } catch (error) {
    console.error("Failed to save local form draft:", error)
    return false
  }
}

export const clearLocalFormDraft = (formKey) => {
  const storageKey = resolveStorageKey(formKey)
  if (!storageKey || !canUseLocalStorage()) return false

  try {
    window.localStorage.removeItem(storageKey)
    return true
  } catch (error) {
    console.error("Failed to clear local form draft:", error)
    return false
  }
}

export const useLocalFormDraft = ({
  formKey,
  value,
  enabled = true,
  ready = true,
  debounceMs = 400,
} = {}) => {
  const skipNextPersistRef = useRef(true)

  useEffect(() => {
    skipNextPersistRef.current = true
  }, [formKey, ready])

  useEffect(() => {
    if (!enabled || !ready || !formKey) return undefined

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      saveLocalFormDraft(formKey, value)
    }, debounceMs)

    return () => window.clearTimeout(timeoutId)
  }, [debounceMs, enabled, formKey, ready, value])

  const clearDraft = useCallback(() => clearLocalFormDraft(formKey), [formKey])

  return { clearDraft }
}

export default useLocalFormDraft
