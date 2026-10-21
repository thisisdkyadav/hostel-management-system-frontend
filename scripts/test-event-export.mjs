import assert from "node:assert/strict"
import { test } from "node:test"
import { PDFDocument } from "pdf-lib"
import { mergeEventDossier } from "../src/components/gymkhana/events-page/eventExport.js"

const pdf = async (count) => {
  const doc = await PDFDocument.create()
  for (let i = 0; i < count; i++) doc.addPage([200 + i, 300])
  return doc.save()
}

test("exports a report without attachments before a proposal is submitted", async () => {
  const bytes = await mergeEventDossier({ reportPdf: Buffer.from(await pdf(2)).toString("base64") }, () => assert.fail("No attachments should be fetched"))
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 2)
})

test("preserves report and attachment pages in manifest order", async () => {
  const first = await pdf(1)
  const second = await pdf(3)
  const requested = []
  const bytes = await mergeEventDossier({ reportPdf: Buffer.from(await pdf(2)).toString("base64"), documents: [{ url: "first", number: 1 }, { url: "second", number: 2 }] }, async (url) => { requested.push(url); return url === "first" ? first : second })
  const result = await PDFDocument.load(bytes)
  assert.equal(result.getPageCount(), 6)
  assert.deepEqual(requested, ["first", "second"])
  assert.deepEqual(result.getPages().map((p) => p.getWidth()), [200, 201, 200, 200, 201, 202])
})

test("rejects the complete download and identifies an unavailable attachment", async () => {
  await assert.rejects(mergeEventDossier({ reportPdf: Buffer.from(await pdf(1)).toString("base64"), documents: [{ url: "missing", number: 3, label: "Bill / Vendor invoice" }] }, async () => { throw new Error("File not found") }), /attachment 3: Bill \/ Vendor invoice.*File not found/)
})
