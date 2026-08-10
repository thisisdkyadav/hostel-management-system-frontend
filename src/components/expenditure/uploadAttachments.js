import { uploadApi, resolveUploadedFileRef } from "../../service"

/**
 * Upload one or more files (PDF/image) to the shared upload endpoint and return
 * attachment descriptors ({ fileRef, originalName, contentType, size }) ready to
 * be persisted on an expenditure entry. Uploads run one file per request (the
 * backend has no batch endpoint). Throws if any upload fails.
 */
export const uploadAttachments = async (fileList) => {
  const files = Array.from(fileList || [])
  const out = []
  for (const file of files) {
    const formData = new FormData()
    formData.append("file", file)
    const res = await uploadApi.uploadCertificate(formData)
    const fileRef = resolveUploadedFileRef(res)
    if (!fileRef) throw new Error(`Upload failed for ${file.name}`)
    out.push({
      fileRef,
      originalName: res?.originalName || file.name,
      contentType: res?.contentType || file.type || "",
      size: res?.size ?? file.size ?? 0,
    })
  }
  return out
}
