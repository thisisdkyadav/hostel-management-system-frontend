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

const processSupportingPdfs = async (documents, fetchBytes, context, checkAll) => {
  const started = Date.now()
  const report = {
    schemaVersion: 2,
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
    issues: [],
    currentDocumentNumber: null,
    documents: documents.map((document, index) => ({
      number: index + 1,
      label: document?.label || "Supporting document",
      source: safeUrl(document?.url),
      locations: document?.locations || [],
      displayLocation: document?.locations?.length ? formatProofLocation(document.locations[0]) : document?.label || "Supporting document",
      stage: "pending",
    })),
  }
  const logReport = (level) => {
    report.durationMs = Date.now() - started
    // A JSON string stays copyable and retains the exact state at failure time.
    console[level](`${REPORT_PREFIX} ${JSON.stringify(report, null, 2)}`)
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
      try {
        const targetPdf = checkAll ? await PDFDocument.create() : mergedPdf
        let pdfBytes
        stage("download")
        try {
          pdfBytes = await fetchBytes(document, (response) => {
            entry.response = {
              status: response.status,
              contentType: response.headers.get("content-type"),
              contentLength: response.headers.get("content-length"),
              redirected: response.redirected,
              finalUrl: safeUrl(response.url),
            }
          })
        } catch (cause) {
          entry.httpStatus = cause?.status ?? null
          throw documentError("Could not download this attachment. Try opening it individually and retry the export.", document, index, cause)
        }

        stage("parse")
        let sourcePdf
        try {
          const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes)
          entry.byteLength = bytes.byteLength
          const header = String.fromCharCode(...bytes.subarray(0, 1024))
          entry.pdfHeader = header.match(/%PDF-\d\.\d/)?.[0] || null
          sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
        } catch (cause) {
          throw documentError("Could not read this attachment as a PDF. Open it individually, print or save a fresh PDF copy, then replace the attachment and retry.", document, index, cause)
        }

        entry.encrypted = sourcePdf.isEncrypted
        entry.pageTree = inspectPageTree(sourcePdf, PDFName)
        // Ignoring encryption allows inspection; it does not decrypt the page contents.
        stage("check-encryption")
        if (sourcePdf.isEncrypted) {
          throw documentError("This attachment is encrypted and cannot be merged by this exporter. It may open normally without asking for a password. Print or save a fresh PDF copy, then replace this attachment and retry.", document, index)
        }

        try {
          stage("enumerate-pages")
          const indices = sourcePdf.getPageIndices()
          entry.pageCount = indices.length
          if (!indices.length) throw new Error("The attachment has no readable pages.")
          stage("copy-pages")
          const copiedPages = await targetPdf.copyPages(sourcePdf, indices)
          stage("add-pages")
          for (const [pageIndex, page] of copiedPages.entries()) {
            entry.currentPageNumber = pageIndex + 1
            targetPdf.addPage(page)
            if (!checkAll) report.mergedPageCount += 1
          }
          if (checkAll) {
            stage("save-document")
            await targetPdf.save()
          }
          entry.stage = "complete"
        } catch (cause) {
          throw documentError("Could not merge this attachment. Open it individually, print or save a fresh PDF copy, then replace the attachment and retry.", document, index, cause)
        }
      } catch (error) {
        entry.error = errorDetails(error)
        entry.problem = error.problem || error.message
        report.issues.push({
          documentNumber: index + 1,
          displayLocation: entry.displayLocation,
          locations: entry.locations,
          stage: entry.stage,
          message: entry.problem,
        })
        if (!checkAll) throw error
      } finally {
        report.checkedDocumentCount += 1
      }
    }

    report.currentDocumentNumber = null
    if (checkAll) {
      report.stage = "complete"
      report.status = report.issues.length ? "issues-found" : "success"
      logReport(report.issues.length ? "error" : "info")
      return report
    }
    report.stage = "save"
    const result = await mergedPdf.save()
    report.outputByteLength = result.byteLength
    report.stage = "complete"
    report.status = "success"
    logReport("info")
    return result
  } catch (error) {
    report.status = "failed"
    report.error = errorDetails(error)
    error.diagnostics = report
    logReport("error")
    throw error
  }
}

export const mergeSupportingPdfs = (documents, fetchBytes, context = {}) =>
  processSupportingPdfs(documents, fetchBytes, context, false)

export const checkSupportingPdfs = (documents, fetchBytes, context = {}) =>
  processSupportingPdfs(documents, fetchBytes, context, true)
