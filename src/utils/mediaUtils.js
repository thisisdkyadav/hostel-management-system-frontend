import { API_BACKENDS, getApiBaseUrl } from "../constants/appConstants"

const MEDIA_REF_PREFIX = "media://"

export const getMediaUrl = (mediaPath) => {
  const normalizedPath = String(mediaPath || "").trim()
  if (!normalizedPath) return ""

  if (normalizedPath.startsWith("http")) {
    return normalizedPath
  }

  if (normalizedPath.startsWith(MEDIA_REF_PREFIX)) {
    const nodeBaseUrl = getApiBaseUrl(API_BACKENDS.NODE)
    return `${nodeBaseUrl}/media/resolve?ref=${encodeURIComponent(normalizedPath)}&redirect=1`
  }

  return `${import.meta.env.VITE_MEDIA_URL}${normalizedPath}`
}
