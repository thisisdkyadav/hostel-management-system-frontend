import { API_BACKENDS, getApiBaseUrl } from "../constants/appConstants"

const MEDIA_REF_PREFIX = "media://"

const buildResolvedMediaUrl = (mediaPath, disposition = "inline") => {
  const nodeBaseUrl = getApiBaseUrl(API_BACKENDS.NODE)
  return `${nodeBaseUrl}/media/resolve?ref=${encodeURIComponent(mediaPath)}&disposition=${encodeURIComponent(disposition)}&redirect=1`
}

export const getMediaUrl = (mediaPath) => {
  const normalizedPath = String(mediaPath || "").trim()
  if (!normalizedPath) return ""

  if (normalizedPath.startsWith("http")) {
    return normalizedPath
  }

  if (normalizedPath.startsWith(MEDIA_REF_PREFIX)) {
    return buildResolvedMediaUrl(normalizedPath, "inline")
  }

  return `${import.meta.env.VITE_MEDIA_URL}${normalizedPath}`
}

export const getMediaDownloadUrl = (mediaPath) => {
  const normalizedPath = String(mediaPath || "").trim()
  if (!normalizedPath) return ""

  if (normalizedPath.startsWith("http")) {
    return normalizedPath
  }

  if (normalizedPath.startsWith(MEDIA_REF_PREFIX)) {
    return buildResolvedMediaUrl(normalizedPath, "attachment")
  }

  return `${import.meta.env.VITE_MEDIA_URL}${normalizedPath}`
}
