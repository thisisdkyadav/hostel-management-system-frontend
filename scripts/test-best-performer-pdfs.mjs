import assert from "node:assert/strict"
import { beforeEach, test } from "node:test"
import { PDFDocument, PDFName, PDFRef } from "pdf-lib"
import { checkSupportingPdfs, mergeSupportingPdfs } from "../src/pages/common/overall-best-performer/pdfMerge.js"
import { collectApplicationPdfDocuments } from "../src/pages/common/overall-best-performer/proofDocuments.js"

beforeEach((t) => {
  for (const level of ["info", "warn", "error"]) t.mock.method(console, level, () => {})
})

const createPdf = async (sizes) => {
  const pdf = await PDFDocument.create()
  for (const size of sizes) pdf.addPage(size)
  return pdf.save({ addDefaultPage: false })
}
const sizes = async (bytes) => (await PDFDocument.load(bytes)).getPages().map((page) => [page.getWidth(), page.getHeight()])
const unavailableRenderer = { renderFallback: async () => { throw new Error("Cannot print this attachment") } }
const brokenPdf = async () => {
  const pdf = await PDFDocument.create()
  pdf.addPage()
  pdf.catalog.set(PDFName.of("Pages"), PDFRef.of(9999))
  return pdf.save()
}
const encryptedPdf = async () => {
  const pdf = await PDFDocument.load(await createPdf([[200, 300]]))
  // The real encryption fixtures are exercised by the browser integration test.
  pdf.context.trailerInfo.Encrypt = pdf.context.register(pdf.context.obj({ Filter: "Standard" }))
  return pdf.save()
}

test("normal merging preserves attachment order and dimensions without invoking the renderer", async () => {
  const documents = [{ label: "Coursework" }, { label: "Award" }]
  const bytes = [await createPdf([[200, 300], [400, 500]]), await createPdf([[600, 700]])]
  let report
  const merged = await mergeSupportingPdfs(documents, async (document) => bytes[documents.indexOf(document)], {
    onReport: (value) => { report = value },
  }, { renderFallback: () => assert.fail("Normal PDFs should not need rendering") })
  assert.deepEqual(await sizes(merged), [[200, 300], [400, 500], [600, 700]])
  assert.equal(report.includedDocumentCount, 2)
  assert.equal(report.renderedDocumentCount, 0)
  assert.equal(report.skippedDocumentCount, 0)
  assert.equal(report.status, "success")
})

test("a broken attachment tries printing, skips on failure, and preserves later attachments", async (t) => {
  const log = t.mock.method(console, "warn", () => {})
  const broken = await brokenPdf()
  const valid = await createPdf([[200, 300]])
  const documents = [{ label: "Coursework" }, { label: "Sports certificate" }, { label: "Publication" }]
  const fetched = []
  let report
  const merged = await mergeSupportingPdfs(documents, async (document) => {
    fetched.push(document)
    return document === documents[1] ? broken : valid
  }, { onReport: (value) => { report = value } }, unavailableRenderer)
  assert.deepEqual(fetched, documents)
  assert.deepEqual(await sizes(merged), [[200, 300], [200, 300]])
  assert.equal(report.schemaVersion, 3)
  assert.equal(report.status, "partial")
  assert.equal(report.mergedPageCount, 2)
  assert.equal(report.skippedDocumentCount, 1)
  assert.equal(report.checkedDocumentCount, 3)
  assert.equal(report.documents[1].pageTree.pagesReference, "9999 0 R")
  assert.equal(report.documents[1].pageTree.pagesObjectType, "missing")
  assert.equal(report.documents[1].attempts[0].stage, "enumerate-pages")
  assert.match(report.documents[1].attempts[0].error.message, /Expected instance of PDFDict, but got instance of undefined/)
  assert.equal(report.documents[1].attempts[1].method, "print")
  assert.equal(report.documents[1].attempts[1].error.message, "Cannot print this attachment")
  assert.equal(report.issues[0].outcome, "skipped")
  assert.equal(report.documents[2].stage, "complete")
  assert.deepEqual(JSON.parse(log.mock.calls[0].arguments[0].replace(/^\[Best Performer PDF Export\] /, "")), report)
})

test("encrypted PDFs use a printed copy from the same bytes, in their original position", async () => {
  const encrypted = await encryptedPdf()
  const first = await createPdf([[100, 200]])
  const printed = await createPdf([[300, 400], [400, 300]])
  let report
  let calls = 0
  const merged = await mergeSupportingPdfs([{ url: "first" }, { url: "encrypted" }, { url: "last" }], async (document) => document.url === "encrypted" ? encrypted : first,
    { onReport: (value) => { report = value } }, {
      renderFallback: async (bytes, progress) => {
        calls += 1
        assert.equal(bytes, encrypted)
        progress({ pageNumber: 2, pageCount: 2 })
        return printed
      },
    })
  assert.equal(calls, 1)
  assert.deepEqual(await sizes(merged), [[100, 200], [300, 400], [400, 300], [100, 200]])
  assert.equal(report.status, "success")
  assert.equal(report.includedDocumentCount, 3)
  assert.equal(report.renderedDocumentCount, 1)
  assert.equal(report.documents[1].encrypted, true)
  assert.equal(report.documents[1].method, "print")
  assert.equal(report.documents[1].currentPageNumber, 2)
  assert.equal(report.issues[0].outcome, "recovered")
  assert.equal(report.documents[1].attempts[1].stage, "complete")
})

test("successful reports retain response metadata and redact signed URL queries", async (t) => {
  const log = t.mock.method(console, "info", () => {})
  const bytes = await createPdf([[200, 300], [300, 400]])
  const result = await mergeSupportingPdfs([{ label: "Certificate", url: "https://storage.example/certificate.pdf?token=secret#fragment" }], async (_, onResponse) => {
    onResponse({ status: 200, headers: new Headers({ "content-type": "application/pdf", "content-length": String(bytes.byteLength) }), redirected: true, url: "https://cdn.example/certificate.pdf?signature=secret" })
    return bytes
  }, { applicationId: "application-123" })
  const json = log.mock.calls[0].arguments[0].replace(/^\[Best Performer PDF Export\] /, "")
  const report = JSON.parse(json)
  assert.equal(report.applicationId, "application-123")
  assert.equal(report.outputByteLength, result.byteLength)
  assert.equal(report.mergedPageCount, 2)
  assert.equal(report.documents[0].byteLength, bytes.byteLength)
  assert.equal(report.documents[0].pdfHeader, "%PDF-1.7")
  assert.equal(report.documents[0].source, "https://storage.example/certificate.pdf")
  assert.equal(report.documents[0].response.contentType, "application/pdf")
  assert.equal(report.documents[0].response.finalUrl, "https://cdn.example/certificate.pdf")
  assert.ok(!json.includes("secret"))
})

test("combined serialization failures still report a fatal save error", async (t) => {
  const bytes = await createPdf([[200, 300]])
  const output = await PDFDocument.create()
  const originalCreate = PDFDocument.create.bind(PDFDocument)
  const cause = new Error("Serialization failed")
  t.mock.method(output, "save", async () => { throw cause })
  let creates = 0
  t.mock.method(PDFDocument, "create", async () => ++creates === 1 ? output : originalCreate())
  await assert.rejects(mergeSupportingPdfs([{ label: "Certificate" }], async () => bytes), (error) => {
    assert.equal(error, cause)
    assert.equal(error.diagnostics.stage, "save")
    assert.equal(error.diagnostics.currentDocumentNumber, null)
    assert.equal(error.diagnostics.documents[0].stage, "complete")
    assert.equal(error.diagnostics.mergedPageCount, 1)
    return true
  })
})

test("download failures skip without invoking the printing fallback", async () => {
  const valid = await createPdf([[200, 300]])
  let report
  await mergeSupportingPdfs([{ url: "missing" }, { url: "valid" }], async (document) => {
    if (document.url === "missing") throw Object.assign(new Error("HTTP 403"), { status: 403 })
    return valid
  }, { onReport: (value) => { report = value } }, { renderFallback: () => assert.fail("No downloaded PDF to print") })
  assert.equal(report.skippedDocumentCount, 1)
  assert.equal(report.documents[0].httpStatus, 403)
  assert.equal(report.documents[0].stage, "download")
  assert.match(report.documents[0].error.cause.message, /HTTP 403/)
  assert.equal(report.documents[0].attempts.length, 0)
})

test("empty inputs and entirely skipped attachments never generate a blank PDF", async () => {
  await assert.rejects(mergeSupportingPdfs([], async () => {}), /No supporting PDFs/)
  for (const bytes of [await createPdf([]), new TextEncoder().encode("<html>Login</html>")]) {
    await assert.rejects(mergeSupportingPdfs([{ label: "Unreadable" }], async () => bytes, {}, unavailableRenderer), (error) => {
      assert.match(error.message, /All attachments were skipped/)
      assert.equal(error.diagnostics.skippedDocumentCount, 1)
      assert.equal(error.diagnostics.includedDocumentCount, 0)
      assert.equal(error.diagnostics.outputByteLength, undefined)
      assert.equal(error.diagnostics.documents[0].attempts.length, 2)
      return true
    })
  }
})

test("a printing attempt that fails midway cannot leave partial pages in the export", async () => {
  const valid = await createPdf([[200, 300]])
  const encrypted = await encryptedPdf()
  let report
  const merged = await mergeSupportingPdfs([{ url: "first" }, { url: "bad" }, { url: "last" }], async (document) => document.url === "bad" ? encrypted : valid,
    { onReport: (value) => { report = value } }, {
      renderFallback: async (_, progress) => {
        progress({ pageNumber: 1, pageCount: 3 })
        await createPdf([[500, 600]])
        throw new Error("Page 2 rendering failed")
      },
    })
  assert.deepEqual(await sizes(merged), [[200, 300], [200, 300]])
  assert.equal(report.mergedPageCount, 2)
  assert.equal(report.includedDocumentCount, 2)
  assert.equal(report.documents[1].currentPageNumber, 1)
})

test("failed appends roll back already added pages before using the fallback", async (t) => {
  const valid = await createPdf([[200, 300], [300, 400]])
  const printed = await createPdf([[600, 700]])
  const output = await PDFDocument.create()
  const originalCreate = PDFDocument.create.bind(PDFDocument)
  let creates = 0
  t.mock.method(PDFDocument, "create", async () => ++creates === 1 ? output : originalCreate())
  const addPage = output.addPage.bind(output)
  let adds = 0
  t.mock.method(output, "addPage", (page) => {
    const result = addPage(page)
    if (++adds === 2) throw new Error("Adding page failed")
    return result
  })
  const merged = await mergeSupportingPdfs([{}], async () => valid, {}, { renderFallback: async () => printed })
  assert.deepEqual(await sizes(merged), [[600, 700]])
})

test("check-all runs the same recovery pipeline and reports every affected application field", async () => {
  const broken = await brokenPdf()
  const encrypted = await encryptedPdf()
  const valid = await createPdf([[200, 300]])
  const documents = collectApplicationPdfDocuments({
    awardItems: [{ title: "Academic award", proofs: [{ label: "Proof", url: "broken" }] }],
    gamesSportsItems: [
      { title: "Cricket", proofs: [{ label: "Proof", url: "encrypted" }] },
      { title: "Badminton", proofs: [{ label: "Proof", url: "unavailable" }] },
      { title: "Hockey", proofs: [{ label: "Proof", url: "valid" }] },
    ],
  })
  const fetched = []
  const report = await checkSupportingPdfs(documents, async (document) => {
    fetched.push(document.url)
    if (document.url === "unavailable") throw new Error("HTTP 404")
    return { broken, encrypted, valid }[document.url]
  }, {}, { renderFallback: async (bytes) => {
    if (bytes === encrypted) return valid
    throw new Error("Invalid PDF")
  } })
  assert.equal(report.operation, "check-all")
  assert.equal(report.status, "issues-found")
  assert.equal(report.checkedDocumentCount, 4)
  assert.equal(report.mergedPageCount, 0)
  assert.equal(report.outputByteLength, undefined)
  assert.equal(report.includedDocumentCount, 2)
  assert.equal(report.skippedDocumentCount, 2)
  assert.equal(report.renderedDocumentCount, 1)
  assert.deepEqual(fetched, ["broken", "encrypted", "unavailable", "valid"])
  assert.deepEqual(report.issues.map((issue) => issue.outcome), ["skipped", "recovered", "skipped"])
  assert.equal(report.issues[1].displayLocation, "Games & Sports activities → Item 1: Cricket → Proof 1")
  assert.equal(report.issues[1].locations[0].fieldPath, "gamesSportsItems[0].proofs[0].url")
  assert.equal(report.documents[3].stage, "complete")
})

test("all-skipped errors retain every location for attachments shared across fields", async () => {
  const documents = collectApplicationPdfDocuments({
    culturalItems: [{ title: "Dance", proofs: [{ label: "Proof", url: "file" }] }],
    gamesSportsItems: [{ title: "Cricket", proofs: [{ label: "Proof", url: "file" }] }],
  })
  await assert.rejects(mergeSupportingPdfs(documents, async () => { throw new Error("HTTP 404") }), (error) => {
    const report = error.diagnostics
    assert.equal(report.checkedDocumentCount, 1)
    assert.equal(report.documents[0].locations.length, 2)
    assert.match(report.documents[0].error.message, /Cultural activities → Item 1: Dance → Proof 1/)
    assert.equal(report.issues[0].locations[1].fieldPath, "gamesSportsItems[0].proofs[0].url")
    return true
  })
})

test("checking valid attachments verifies every page can be copied and saved", async () => {
  const valid = await createPdf([[200, 300], [300, 400]])
  const report = await checkSupportingPdfs([{ label: "First" }, { label: "Second" }], async () => valid)
  assert.equal(report.status, "success")
  assert.equal(report.checkedDocumentCount, 2)
  assert.deepEqual(report.issues, [])
  assert.deepEqual(report.documents.map((document) => document.stage), ["complete", "complete"])
  assert.deepEqual(report.documents.map((document) => document.pageCount), [2, 2])
})
