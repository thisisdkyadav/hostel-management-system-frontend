import { formatProofLocation } from "./proofDocuments.js"

const REPORT_PREFIX = "[Best Performer PDF Export]"

const safeUrl = (value) => {
  if (!value) return null
  // Signed download links can carry credentials in their query string.
  return String(value).split(/[?#]/, 1)[0]
}

const errorDetails = (error, depth = 0) => ({
  name: error?.name || "Error",
  message: String(error?.message || error),
  stack: error?.stack || null,
  ...(error?.cause && depth < 3 ? { cause: errorDetails(error.cause, depth + 1) } : {}),
})

const documentError = (message, document, index, cause) => {
  const label = document?.locations?.length
    ? formatProofLocation(document.locations[0])
    : String(document?.label || "Supporting document").trim()
  const error = new Error(`PDF ${index + 1} (${label}): ${message}`)
  error.cause = cause
  error.document = document
  error.problem = message
  return error
}

const inspectPageTree = (pdf, PDFName) => {
  // Diagnostic inspection must never interfere with the export itself.
  try {
    const pagesRef = pdf.catalog.get(PDFName.of("Pages"))
    const pages = pdf.context.lookup(pagesRef)
    return {
      catalogKeys: pdf.catalog.keys().map(String),
      pagesReference: pagesRef?.toString() || null,
      pagesObjectType: pages?.constructor?.name || "missing",
      pagesKeys: pages?.keys?.().map(String) || [],
      declaredPageCount: pages?.get?.(PDFName.of("Count"))?.toString() || null,
      indirectObjectCount: pdf.context.enumerateIndirectObjects().length,
    }
  } catch (error) {
    return { inspectionError: errorDetails(error) }
  }
}

const defaultRenderFallback = async (...args) => {
  const { renderPdfForPrinting } = await import("./pdfPrintFallback.js")
  return renderPdfForPrinting(...args)
}

const processSupportingPdfs = async (documents, fetchBytes, context, checkAll, renderFallback) => {
  const started = Date.now()
  const report = {
    schemaVersion: 3,
    operation: checkAll ? "check-all" : "merge",
    feature: "best-performer-pdf-export",
    startedAt: new Date(started).toISOString(),
    applicationId: context.applicationId || null,
    userAgent: typeof navigator === "undefined" ? null : navigator.userAgent,
    status: "running",
    stage: "initialize",
    documentCount: documents.length,
    mergedPageCount: 0,
    checkedDocumentCount: 0,
    includedDocumentCount: 0,
    renderedDocumentCount: 0,
    skippedDocumentCount: 0,
    issues: [],
    currentDocumentNumber: null,
    documents: documents.map((document, index) => ({
      number: index + 1,
      label: document?.label || "Supporting document",
      source: safeUrl(document?.url),
      locations: document?.locations || [],
      displayLocation: document?.locations?.length ? formatProofLocation(document.locations[0]) : document?.label || "Supporting document",
      stage: "pending",
      attempts: [],
    })),
  }
  const logReport = (level) => {
    report.durationMs = Date.now() - started
    console[level](`${REPORT_PREFIX} ${JSON.stringify(report, null, 2)}`)
    context.onReport?.(report)
  }

  try {
    if (!documents.length) throw new Error("No supporting PDFs are attached to this application.")
    report.stage = "load-library"
    const { PDFDocument, PDFName } = await import("pdf-lib")
    const mergedPdf = checkAll ? null : await PDFDocument.create()

    for (const [index, document] of documents.entries()) {
      const entry = report.documents[index]
      report.currentDocumentNumber = index + 1
      const stage = (value) => { report.stage = value; entry.stage = value }
      let activeAttempt
      const recordFailure = (error) => {
        activeAttempt.stage = entry.stage
        activeAttempt.error = errorDetails(error)
      }
      // Validate in a separate PDF before touching the combined output. Roll back
      // any appended pages if adding them fails, so retries never duplicate pages.
      const includePdf = async (sourcePdf) => {
        stage("enumerate-pages")
        const indices = sourcePdf.getPageIndices()
        if (!indices.length) throw new Error("The attachment has no readable pages.")
        const isolated = await PDFDocument.create()
        stage("copy-pages")
        for (const page of await isolated.copyPages(sourcePdf, indices)) isolated.addPage(page)
        stage("save-document")
        const validatedBytes = await isolated.save()
        if (!checkAll) {
          stage("append-pages")
          const validated = await PDFDocument.load(validatedBytes)
          const originalCount = mergedPdf.getPageCount()
          try {
            const pages = await mergedPdf.copyPages(validated, validated.getPageIndices())
            for (const page of pages) mergedPdf.addPage(page)
          } catch (error) {
            while (mergedPdf.getPageCount() > originalCount) mergedPdf.removePage(mergedPdf.getPageCount() - 1)
            throw error
          }
          report.mergedPageCount += indices.length
        }
        entry.pageCount = indices.length
        report.includedDocumentCount += 1
      }
      try {
        stage("download")
        let pdfBytes
        try {
          const downloaded = await fetchBytes(document, (response) => {
            entry.response = {
              status: response.status,
              contentType: response.headers.get("content-type"),
              contentLength: response.headers.get("content-length"),
              redirected: response.redirected,
              finalUrl: safeUrl(response.url),
            }
          })
          pdfBytes = downloaded instanceof Uint8Array ? downloaded : new Uint8Array(downloaded)
        } catch (cause) {
          entry.httpStatus = cause?.status ?? null
          throw documentError("Could not download this attachment.", document, index, cause)
        }
        entry.byteLength = pdfBytes.byteLength
        const header = String.fromCharCode(...pdfBytes.subarray(0, 1024))
        entry.pdfHeader = header.match(/%PDF-\d\.\d/)?.[0] || null
        activeAttempt = { method: "merge", stage: "parse" }
        entry.attempts.push(activeAttempt)
        try {
          stage("parse")
          const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
          entry.encrypted = sourcePdf.isEncrypted
          entry.pageTree = inspectPageTree(sourcePdf, PDFName)
          stage("check-encryption")
          if (sourcePdf.isEncrypted) throw new Error("This attachment is encrypted; a printable copy is required.")
          await includePdf(sourcePdf)
          activeAttempt.stage = "complete"
          entry.method = "merge"
        } catch (error) {
          recordFailure(error)
          activeAttempt = { method: "print", stage: "render-for-printing" }
          entry.attempts.push(activeAttempt)
          try {
            stage("render-for-printing")
            const printedBytes = await renderFallback(pdfBytes, ({ pageNumber, pageCount }) => {
              entry.currentPageNumber = pageNumber
              entry.printPageCount = pageCount
            })
            stage("parse-printed-copy")
            await includePdf(await PDFDocument.load(printedBytes))
            activeAttempt.stage = "complete"
            entry.method = "print"
            report.renderedDocumentCount += 1
          } catch (fallbackError) {
            recordFailure(fallbackError)
            throw fallbackError
          }
        }
        entry.stage = "complete"
        entry.status = "included"
      } catch (error) {
        entry.error = errorDetails(error)
        entry.problem = error.name === "PasswordException" ? "This PDF requires a password to open." : error.problem || error.message
        entry.status = "skipped"
        report.skippedDocumentCount += 1
      } finally {
        report.checkedDocumentCount += 1
      }
      if (entry.status === "skipped" || entry.method === "print") {
        report.issues.push({
          documentNumber: index + 1,
          displayLocation: entry.displayLocation,
          locations: entry.locations,
          stage: entry.stage,
          outcome: entry.status === "skipped" ? "skipped" : "recovered",
          message: entry.status === "skipped"
            ? `Skipped: ${entry.problem.replace(/[.!?]\s*$/, "")}. Open this PDF individually or replace it with a fresh PDF copy.`
            : "Included using a printed image copy after normal merging failed. Text in these pages is not searchable.",
        })
      }
    }

    report.currentDocumentNumber = null
    if (!checkAll && !report.includedDocumentCount) {
      throw new Error("No supporting PDFs could be exported. All attachments were skipped. See the PDF report for their application fields.")
    }
    if (!checkAll) {
      report.stage = "save"
      const result = await mergedPdf.save()
      report.outputByteLength = result.byteLength
      report.stage = "complete"
      report.status = report.skippedDocumentCount ? "partial" : "success"
      logReport(report.skippedDocumentCount ? "warn" : "info")
      return result
    }
    report.stage = "complete"
    report.status = report.skippedDocumentCount ? "issues-found" : "success"
    logReport(report.skippedDocumentCount ? "warn" : "info")
    return report
  } catch (error) {
    report.status = "failed"
    report.error = errorDetails(error)
    error.diagnostics = report
    logReport("error")
    throw error
  }
}

export const mergeSupportingPdfs = (documents, fetchBytes, context = {}, { renderFallback = defaultRenderFallback } = {}) =>
  processSupportingPdfs(documents, fetchBytes, context, false, renderFallback)

export const checkSupportingPdfs = (documents, fetchBytes, context = {}, { renderFallback = defaultRenderFallback } = {}) =>
  processSupportingPdfs(documents, fetchBytes, context, true, renderFallback)
