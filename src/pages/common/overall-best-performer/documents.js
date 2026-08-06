import { Activity } from "lucide-react"
import { getMediaDownloadUrl } from "@/utils/mediaUtils"
import { uploadApi } from "@/service"
import { Select } from "@/components/ui"

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

export const collectPdfDocumentsFromProofs = (proofs = [], fallbackLabel = "Supporting Document") =>
  (Array.isArray(proofs) ? proofs : [])
    .map((proof) => {
      if (proof?.sourceType === "por") {
        const linkedPor = proof?.linkedPor
        if (!linkedPor?.supportingDocumentUrl) return null

        return {
          url: linkedPor.supportingDocumentUrl,
          label: linkedPor.supportingDocumentName || linkedPor.positionTitle || proof?.label || fallbackLabel,
        }
      }

      if (!proof?.url) return null

      return {
        url: proof.url,
        label: proof.label || fallbackLabel,
      }
    })
    .filter(Boolean)

export const collectApplicationPdfDocuments = (application = null) => {
  if (!application) return []

  const documents = []
  const addProofs = (proofs, label) => {
    documents.push(...collectPdfDocumentsFromProofs(proofs, label))
  }

  addProofs(application?.coursework?.proofs, "Coursework")
  addProofs(application?.projectThesis?.btpAwardProofs, "BTP Award")
  addProofs(application?.projectThesis?.projectGradeProofs, "Project Grade")

  const addItemProofs = (items = [], sectionLabel = "Supporting Document") => {
    for (const item of Array.isArray(items) ? items : []) {
      addProofs(item?.proofs, item?.title || sectionLabel)
    }
  }

  addItemProofs(application?.projectThesis?.publicationItems, "Publication")
  addItemProofs(application?.projectThesis?.technologyTransferItems, "Technology Transfer")
  addItemProofs(application?.responsibilityItems, "Responsibility")
  addItemProofs(application?.awardItems, "Award")
  addItemProofs(application?.culturalItems, "Cultural Activity")
  addItemProofs(application?.scienceTechnologyItems, "Science And Technology Activity")
  addItemProofs(application?.gamesSportsItems, "Games And Sports Activity")
  addItemProofs(application?.coCurricularItems, "Co-curricular Activity")

  const uniqueByUrl = new Map()
  for (const document of documents) {
    const key = String(document?.url || "").trim()
    if (key && !uniqueByUrl.has(key)) {
      uniqueByUrl.set(key, document)
    }
  }

  return [...uniqueByUrl.values()]
}

export const fetchPdfBytes = async (document) => {
  const response = await fetch(getMediaDownloadUrl(document.url), {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${document.label || "supporting PDF"}`)
  }

  return response.arrayBuffer()
}

export const mergePdfDocuments = async (documents = []) => {
  const { PDFDocument } = await import("pdf-lib")
  const mergedPdf = await PDFDocument.create()

  for (const document of documents) {
    const pdfBytes = await fetchPdfBytes(document)
    const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return mergedPdf.save()
}

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
