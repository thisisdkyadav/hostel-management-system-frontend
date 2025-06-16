export const getMediaUrl = (mediaPath) => {
  // if mediaPath starts with http, return it
  if (mediaPath.startsWith("http")) {
    return mediaPath
  }
  return `${import.meta.env.VITE_MEDIA_URL}${mediaPath}`
}
