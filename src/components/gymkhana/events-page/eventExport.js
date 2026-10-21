// The event controller sends the bundle directly; also accept the standard API envelope.
export const resolveEventExportBundle = (response) => {
  const bundle = response?.data ?? response
  if (!bundle || typeof bundle.reportPdf !== "string" || !bundle.reportPdf.trim()) {
    throw new Error("The server did not return an event PDF. Please refresh and try again.")
  }
  if (bundle.documents !== undefined && !Array.isArray(bundle.documents)) {
    throw new Error("The server returned an invalid event attachment list. Please try again.")
  }
  return bundle
}

// Export the designed report first, then every uploaded PDF in manifest order.
// Fail as a unit: a partial bundle must never look like a complete event record.
export const mergeEventDossier = async (response, fetchBytes) => {
  const { reportPdf, documents = [] } = resolveEventExportBundle(response)
  const { PDFDocument } = await import("pdf-lib")
  const reportBytes = Uint8Array.from(atob(reportPdf), (char) => char.charCodeAt(0))
  const output = await PDFDocument.load(reportBytes)
  for (const document of documents) {
    try {
      const bytes = await fetchBytes(document.url)
      let source
      const previousCount = output.getPageCount()
      try {
        source = await PDFDocument.load(bytes)
        if (!source.getPageCount()) throw new Error("PDF has no pages")
        const pages = await output.copyPages(source, source.getPageIndices())
        pages.forEach((page) => output.addPage(page))
      } catch {
        while (output.getPageCount() > previousCount) output.removePage(output.getPageCount() - 1)
        // Existing PDF rendering recovery handles malformed uploaded PDFs.
        const { renderPdfForPrinting } = await import("@/pages/common/overall-best-performer/pdfPrintFallback")
        source = await PDFDocument.load(await renderPdfForPrinting(bytes))
        if (!source.getPageCount()) throw new Error("PDF has no readable pages")
        const pages = await output.copyPages(source, source.getPageIndices())
        pages.forEach((page) => output.addPage(page))
      }
    } catch (cause) {
      throw new Error(`Could not include attachment ${document.number}: ${document.label}. ${cause.message || "Please check or replace this PDF and retry."}`, { cause })
    }
  }
  return output.save()
}

export const downloadEventDossier = async (response) => {
  const bundle = resolveEventExportBundle(response)
  const { default: api } = await import("@/service/modules/gymkhanaEvents.api")
  const bytes = await mergeEventDossier(bundle, api.fetchExportPdf)
  const slug = String(bundle.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event"
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `${slug}-complete-event.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
