import React from "react"
import { createRoot } from "react-dom/client"
import { ToastProvider } from "hzero"
import { PDFDocument } from "pdf-lib"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import { mergeSupportingPdfs, checkSupportingPdfs } from "../src/pages/common/overall-best-performer/pdfMerge.js"
import { ReviewModal } from "../src/pages/common/overall-best-performer/components/ReviewModal.jsx"
import "../src/index.css"
import printAllowedUrl from "./fixtures/best-performer-pdfs/print-allowed.pdf?url"
import printDeniedUrl from "./fixtures/best-performer-pdfs/print-denied.pdf?url"
import passwordRequiredUrl from "./fixtures/best-performer-pdfs/password-required.pdf?url"

// Open /scripts/check-best-performer-pdfs.html with Vite running. These fixture
// PDFs are synthetic, contain two blue squares, and contain no student data.
const nativeFetch = window.fetch.bind(window)
const fixture = async (name) => new Uint8Array(await (await nativeFetch(name)).arrayBuffer())
const [printAllowed, printDenied, passwordRequired] = await Promise.all([printAllowedUrl, printDeniedUrl, passwordRequiredUrl].map(fixture))
const normalPdf = await PDFDocument.create()
normalPdf.addPage([100, 200])
const normal = await normalPdf.save()
const files = { normal, "print-allowed": printAllowed, "print-denied": printDenied, "password-required": passwordRequired }
const documents = Object.keys(files).map((url) => ({ url, label: url }))
const assert = (condition, message) => { if (!condition) throw new Error(message) }

window.runPdfBrowserChecks = async () => {
  let report
  const bytes = await mergeSupportingPdfs(documents, async (doc) => files[doc.url], { onReport: (value) => { report = value; window.latestPdfReport = value } })
  const output = await PDFDocument.load(bytes)
  assert(!output.isEncrypted, "Output must be readable without encryption")
  assert(output.getPageCount() === 3, "Only normal and print-allowed pages must be included")
  assert(JSON.stringify(output.getPages().map((page) => [page.getWidth(), page.getHeight()])) === JSON.stringify([[100, 200], [200, 300], [300, 200]]), "Page order, size and rotation must be preserved")
  assert(report.renderedDocumentCount === 1 && report.skippedDocumentCount === 2, "Recover one and skip two attachments")
  assert(report.documents[2].error.message.includes("does not allow printing"), "Respect denied printing permission")
  assert(report.documents[3].error.name === "PasswordException", "Password-required PDFs must be skipped without prompts")
  assert(report.documents[1].attempts[0].stage === "check-encryption", "Try normal merge first")
  // The renderer's module initializes the worker URL. Check the actual flattened
  // page content, rather than accepting a blank PDF with the right page count.
  assert(GlobalWorkerOptions.workerSrc, "Worker must be self-hosted")
  const task = getDocument({ data: bytes.slice() })
  try {
    const pdf = await task.promise
    const page = await pdf.getPage(2)
    const viewport = page.getViewport({ scale: 1 })
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext("2d")
    await page.render({ canvasContext: context, viewport }).promise
    const blue = context.getImageData(50, 250, 1, 1).data
    assert(blue[2] > 180 && blue[0] < 80 && blue[1] > 80, "Recovered PDF must contain the original blue square")
    const white = context.getImageData(180, 20, 1, 1).data
    assert(white[0] > 240 && white[1] > 240 && white[2] > 240, "Background must stay white")
  } finally {
    await task.destroy()
  }
  const checked = await checkSupportingPdfs(documents, async (doc) => files[doc.url])
  assert(checked.includedDocumentCount === report.includedDocumentCount && checked.skippedDocumentCount === report.skippedDocumentCount && checked.renderedDocumentCount === report.renderedDocumentCount, "Check-all must match the actual export")
  window.pdfBrowserResult = { passed: true, pageCount: output.getPageCount(), report, checked }
  return window.pdfBrowserResult
}

window.fetch = (resource, options) => {
  const url = typeof resource === "string" ? resource : resource.url
  if (url?.startsWith("https://pdf-fixture.invalid/")) {
    const name = new URL(url).pathname.slice(1)
    return Promise.resolve(new Response(files[name], { status: 200, headers: { "content-type": "application/pdf" } }))
  }
  return nativeFetch(resource, options)
}
const application = {
  id: "pdf-fixture",
  studentName: "PDF Fixture Student",
  rollNumber: "PDF-TEST",
  coursework: { proofs: [{ type: "upload", label: "Proof", url: "https://pdf-fixture.invalid/normal" }] },
  coCurricularItems: [
    { title: "Printing allowed", proofs: [{ type: "upload", label: "Proof", url: "https://pdf-fixture.invalid/print-allowed" }] },
    { title: "Printing denied", proofs: [{ type: "upload", label: "Proof", url: "https://pdf-fixture.invalid/print-denied" }] },
    { title: "Password required", proofs: [{ type: "upload", label: "Proof", url: "https://pdf-fixture.invalid/password-required" }] },
  ],
}
createRoot(document.getElementById("root")).render(
  <ToastProvider><ReviewModal application={application} open onClose={() => {}} /></ToastProvider>
)
