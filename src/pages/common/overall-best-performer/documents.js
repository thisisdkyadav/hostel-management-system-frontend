import { Activity } from "lucide-react"
import { getMediaDownloadUrl } from "@/utils/mediaUtils"
import { uploadApi, apiClient } from "@/service"
import { Select } from "hzero"
import { checkSupportingPdfs, mergeSupportingPdfs } from "./pdfMerge"

export const formatExportDateTime = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString()
}

export const summarizeProofsForExport = (proofs = []) =>
  (Array.isArray(proofs) ? proofs : [])
    .map((proof) => {
      if (proof?.sourceType === "por") {
        const linkedPor = proof?.linkedPor
        return [
          "POR",
          linkedPor?.positionTitle || "",
          linkedPor?.club?.name || "",
          linkedPor?.gymkhanaCategoryLabel || "",
          linkedPor?.tenure || "",
          proof?.porRequestId || "",
        ]
          .filter(Boolean)
          .join(" | ")
      }

      return ["PDF", proof?.label || "", proof?.url || ""].filter(Boolean).join(" | ")
    })
    .filter(Boolean)
    .join(" || ")

export const summarizeItemsForExport = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) =>
      [
        `#${index + 1}`,
        item?.title || "",
        item?.scoreType || "",
        item?.calculatedPoints ?? "",
        item?.year || "",
        item?.level || "",
        item?.eventName || "",
        item?.performance || "",
        item?.participationType || "",
        item?.referenceCode || "",
        item?.notes || "",
        summarizeProofsForExport(item?.proofs),
      ]
        .filter((value) => String(value ?? "").trim() !== "")
        .join(" | ")
    )
    .filter(Boolean)
    .join(" || ")

// Re-exported because OverallBestPerformerPage imports it from here.
export { escapeCsvValue } from "@/utils/csvExport"

export const downloadCsvFile = (content, filename) => {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadBlobFile = (blob, filename) => {
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const slugifyFilePart = (value, fallback = "document") => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || fallback
}

export const resolvePrimaryProof = (proofs = []) => (Array.isArray(proofs) ? proofs[0] || null : null)

export { collectPdfDocumentsFromProofs, collectApplicationPdfDocuments, formatProofLocation } from "./proofDocuments"

const MEDIA_REF_PREFIX = "media://"

const resolvePdfDownloadEndpoint = (mediaPath) => {
  const normalizedPath = String(mediaPath || "").trim()
  if (normalizedPath.startsWith(MEDIA_REF_PREFIX)) {
    return `/media/resolve?ref=${encodeURIComponent(normalizedPath)}&disposition=attachment&redirect=1`
  }
  return getMediaDownloadUrl(normalizedPath)
}

export const fetchPdfBytes = async (document, onResponse) => {
  const response = await apiClient.download(resolvePdfDownloadEndpoint(document.url), {
    credentials: "include",
  })

  onResponse?.(response)
  return response.arrayBuffer()
}

export const mergePdfDocuments = (documents = [], context = {}) => mergeSupportingPdfs(documents, fetchPdfBytes, context)

export const checkPdfDocuments = (documents = [], context = {}) => checkSupportingPdfs(documents, fetchPdfBytes, context)

export const collectLinkedPorsFromApplication = (application = null) => {
  if (!application) return []

  const proofs = []
  const pushProofs = (entries = []) => {
    for (const proof of Array.isArray(entries) ? entries : []) {
      if (proof?.linkedPor?.id) {
        proofs.push(proof.linkedPor)
      }
    }
  }

  pushProofs(application?.coursework?.proofs)
  pushProofs(application?.projectThesis?.btpAwardProofs)
  pushProofs(application?.projectThesis?.projectGradeProofs)

  for (const item of application?.projectThesis?.publicationItems || []) pushProofs(item?.proofs)
  for (const item of application?.projectThesis?.technologyTransferItems || []) pushProofs(item?.proofs)
  for (const item of application?.responsibilityItems || []) pushProofs(item?.proofs)
  for (const item of application?.awardItems || []) pushProofs(item?.proofs)
  for (const item of application?.culturalItems || []) pushProofs(item?.proofs)
  for (const item of application?.scienceTechnologyItems || []) pushProofs(item?.proofs)
  for (const item of application?.gamesSportsItems || []) pushProofs(item?.proofs)
  for (const item of application?.coCurricularItems || []) pushProofs(item?.proofs)

  const uniqueById = new Map()
  for (const por of proofs) {
    uniqueById.set(por.id, por)
  }

  return [...uniqueById.values()]
}

export const uploadBestPerformerProof = async (file) => {
  const formData = new FormData()
  formData.append("file", file)
  return uploadApi.uploadOverallBestPerformerProofPDF(formData)
}

export const getPorOptionLabel = (por) => {
  if (!por) return "Select verified POR"
  const parts = [por.positionTitle, por.club?.name, por.tenure].filter(Boolean)
  return parts.join(" · ") || por.id
}
