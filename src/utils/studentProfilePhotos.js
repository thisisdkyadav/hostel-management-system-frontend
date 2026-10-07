export const PROFILE_PHOTO_MAX_BYTES = 500 * 1024
export const PROFILE_PHOTO_CONCURRENCY = 4

export const buildProfilePhotoItems = (fileList) => {
  const rolls = new Set()
  return Array.from(fileList || [], (file, index) => {
    const rollNumber = file.name.match(/^([a-z0-9_-]+)\.jpe?g$/i)?.[1]?.toUpperCase() || ""
    let error = ""
    if (!rollNumber || (file.type && !["image/jpeg", "image/jpg"].includes(file.type))) {
      error = "Use a JPEG/JPG named with the roll number, for example 230001024.jpg"
    } else if (!file.size || file.size > PROFILE_PHOTO_MAX_BYTES) {
      error = "Picture must be non-empty and 500KB or smaller"
    } else if (rolls.has(rollNumber)) {
      error = "Duplicate roll number in this selection"
    }
    if (!error) rolls.add(rollNumber)
    return { id: index, file, fileName: file.name, rollNumber, status: error ? "invalid" : "ready", message: error }
  })
}

// At most four requests/files are active. Completed batches update the UI once;
// a failed file never prevents later files from being uploaded.
export const uploadProfilePhotoBatches = async ({ items, upload, onBatch, shouldStop = () => false }) => {
  const queue = items.filter((item) => item.status === "ready")
  for (let offset = 0; offset < queue.length && !shouldStop(); offset += PROFILE_PHOTO_CONCURRENCY) {
    const results = await Promise.all(queue.slice(offset, offset + PROFILE_PHOTO_CONCURRENCY).map(async (item) => {
      try {
        const result = await upload(item.file)
        if (!["updated", "skipped"].includes(result?.status)) throw new Error("Unexpected upload response")
        return { ...item, status: result.status, message: result.message || "", rollNumber: result.rollNumber || item.rollNumber }
      } catch (error) {
        return { ...item, status: "error", message: error.message || "Profile picture upload failed" }
      }
    }))
    onBatch(results)
  }
}
