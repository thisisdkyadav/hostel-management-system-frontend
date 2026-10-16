import assert from "node:assert/strict"
import { test } from "node:test"
import { PDFDocument, PDFName, PDFRef } from "pdf-lib"
import { mergeSupportingPdfs } from "../src/pages/common/overall-best-performer/pdfMerge.js"

const createPdf = async (sizes) => {
  const pdf = await PDFDocument.create()
  for (const size of sizes) pdf.addPage(size)
  return pdf.save({ addDefaultPage: false })
}

test("all attachments and pages are merged in order with their original dimensions", async () => {
  const documents = [{ label: "Coursework" }, { label: "Award" }]
  const bytes = [await createPdf([[200, 300], [400, 500]]), await createPdf([[600, 700]])]
  const merged = await mergeSupportingPdfs(documents, async (document) => bytes[documents.indexOf(document)])
  const result = await PDFDocument.load(merged)
  assert.deepEqual(result.getPages().map((page) => [page.getWidth(), page.getHeight()]), [[200, 300], [400, 500], [600, 700]])
})

test("missing page-tree objects identify the failing attachment and preserve the parser error", async (t) => {
  const log = t.mock.method(console, "error", () => {})
  const broken = await PDFDocument.create()
  broken.addPage()
  broken.catalog.set(PDFName.of("Pages"), PDFRef.of(9999))
  const bytes = await broken.save()
  const documents = [{ label: "Coursework" }, { label: "Sports certificate" }, { label: "Publication" }]
  const fetched = []
  await assert.rejects(mergeSupportingPdfs(documents, async (document) => {
    fetched.push(document)
    return document === documents[1] ? bytes : createPdf([[200, 300]])
  }), (error) => {
    assert.match(error.message, /^PDF 2 \(Sports certificate\): Could not merge/)
    assert.match(error.message, /fresh PDF copy/)
    assert.match(error.cause.message, /Expected instance of PDFDict, but got instance of undefined/)
    assert.equal(error.document, documents[1])
    const report = error.diagnostics
    assert.equal(report.status, "failed")
    assert.equal(report.stage, "enumerate-pages")
    assert.equal(report.currentDocumentNumber, 2)
    assert.equal(report.mergedPageCount, 1)
    assert.equal(report.documents[0].stage, "complete")
    assert.equal(report.documents[1].pageTree.pagesReference, "9999 0 R")
    assert.equal(report.documents[1].pageTree.pagesObjectType, "missing")
    assert.equal(report.documents[2].stage, "pending")
    assert.match(report.error.cause.stack, /PDFContext/)
    assert.deepEqual(JSON.parse(log.mock.calls[0].arguments[0].replace(/^\[Best Performer PDF Export\] /, "")), report)
    return true
  })
  assert.deepEqual(fetched, documents.slice(0, 2))
})

test("successful reports include response metadata, page counts and redact signed URL queries", async (t) => {
  const log = t.mock.method(console, "info", () => {})
  const bytes = await createPdf([[200, 300], [300, 400]])
  const source = "https://storage.example/certificate.pdf?token=secret#fragment"
  const result = await mergeSupportingPdfs([{ label: "Certificate", url: source }], async (_, onResponse) => {
    onResponse({
      status: 200,
      headers: new Headers({ "content-type": "application/pdf", "content-length": String(bytes.byteLength) }),
      redirected: true,
      url: "https://cdn.example/certificate.pdf?signature=secret",
    })
    return bytes
  }, { applicationId: "application-123" })
  const json = log.mock.calls[0].arguments[0].replace(/^\[Best Performer PDF Export\] /, "")
  const report = JSON.parse(json)
  assert.equal(report.applicationId, "application-123")
  assert.equal(report.status, "success")
  assert.equal(report.stage, "complete")
  assert.equal(report.mergedPageCount, 2)
  assert.equal(report.outputByteLength, result.byteLength)
  assert.equal(report.documents[0].pageCount, 2)
  assert.equal(report.documents[0].byteLength, bytes.byteLength)
  assert.equal(report.documents[0].pdfHeader, "%PDF-1.7")
  assert.equal(report.documents[0].source, "https://storage.example/certificate.pdf")
  assert.equal(report.documents[0].response.status, 200)
  assert.equal(report.documents[0].response.contentType, "application/pdf")
  assert.equal(report.documents[0].response.finalUrl, "https://cdn.example/certificate.pdf")
  assert.ok(!json.includes("secret"))
})

test("serialization failures report the save stage after all attachments completed", async (t) => {
  t.mock.method(console, "error", () => {})
  const bytes = await createPdf([[200, 300]])
  const output = await PDFDocument.create()
  const cause = new Error("Serialization failed")
  t.mock.method(output, "save", async () => { throw cause })
  t.mock.method(PDFDocument, "create", async () => output)
  await assert.rejects(mergeSupportingPdfs([{ label: "Certificate" }], async () => bytes), (error) => {
    assert.equal(error, cause)
    assert.equal(error.diagnostics.stage, "save")
    assert.equal(error.diagnostics.currentDocumentNumber, null)
    assert.equal(error.diagnostics.documents[0].stage, "complete")
    assert.equal(error.diagnostics.mergedPageCount, 1)
    assert.match(error.diagnostics.error.stack, /Serialization failed/)
    return true
  })
})

test("download failures identify the document without exposing the raw network error", async () => {
  const cause = new Error("HTTP 403")
  await assert.rejects(mergeSupportingPdfs([{ label: "Transcript" }], async () => { throw cause }), (error) => {
    assert.match(error.message, /^PDF 1 \(Transcript\): Could not download/)
    assert.equal(error.cause, cause)
    return true
  })
})

test("invalid PDF responses identify the attachment and explain how to replace it", async () => {
  await assert.rejects(
    mergeSupportingPdfs([{ label: "Award" }], async () => new TextEncoder().encode("<html>Login</html>")),
    /PDF 1 \(Award\): Could not read this attachment as a PDF/
  )
})

test("empty exports and PDFs without pages do not produce a misleading blank PDF", async () => {
  await assert.rejects(mergeSupportingPdfs([], async () => {}), /No supporting PDFs/)
  await assert.rejects(
    mergeSupportingPdfs([{ label: "Empty attachment" }], async () => createPdf([])),
    /PDF 1 \(Empty attachment\): Could not merge/
  )
})

test("encrypted attachments are rejected with instructions instead of ignoring encryption", async () => {
  const bytes = await createPdf([[200, 300]])
  const pdf = await PDFDocument.load(bytes)
  // A trailer encryption entry exercises pdf-lib's encrypted-document guard.
  pdf.context.trailerInfo.Encrypt = pdf.context.register(pdf.context.obj({ Filter: "Standard" }))
  const encrypted = await pdf.save()
  await assert.rejects(
    mergeSupportingPdfs([{ label: "Protected transcript" }], async () => encrypted),
    /PDF 1 \(Protected transcript\): This attachment is encrypted/
  )
})
