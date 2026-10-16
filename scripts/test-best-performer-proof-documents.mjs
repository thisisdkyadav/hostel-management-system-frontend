import assert from "node:assert/strict"
import { test } from "node:test"
import { collectApplicationPdfDocuments, formatProofLocation } from "../src/pages/common/overall-best-performer/proofDocuments.js"

const proof = (url) => ({ label: "Proof", sourceType: "upload", url })
const item = (title, url) => ({ title, proofs: [proof(url)] })

test("generic Proof labels retain the exact section, field path and order across every application section", () => {
  const application = {
    coursework: { proofs: [proof("coursework")] },
    projectThesis: {
      btpAwardProofs: [proof("btp")],
      projectGradeProofs: [proof("grade")],
      publicationItems: [item("Patent", "publication")],
      technologyTransferItems: [item("Transfer", "technology")],
    },
    responsibilityItems: [item("Captain", "responsibility")],
    awardItems: [item("Award", "award")],
    culturalItems: [item("Dance", "culture")],
    scienceTechnologyItems: [item("Robotics", "science")],
    gamesSportsItems: [item("Cricket", "sports")],
    coCurricularItems: [item("Volunteering", "other")],
  }
  const documents = collectApplicationPdfDocuments(application)
  assert.deepEqual(documents.map((document) => document.url), ["coursework", "btp", "grade", "publication", "technology", "responsibility", "award", "culture", "science", "sports", "other"])
  assert.deepEqual(documents.map((document) => document.locations[0].fieldPath), [
    "coursework.proofs[0].url", "projectThesis.btpAwardProofs[0].url", "projectThesis.projectGradeProofs[0].url",
    "projectThesis.publicationItems[0].proofs[0].url", "projectThesis.technologyTransferItems[0].proofs[0].url",
    "responsibilityItems[0].proofs[0].url", "awardItems[0].proofs[0].url", "culturalItems[0].proofs[0].url",
    "scienceTechnologyItems[0].proofs[0].url", "gamesSportsItems[0].proofs[0].url", "coCurricularItems[0].proofs[0].url",
  ])
  assert.equal(formatProofLocation(documents[0].locations[0]), "Student Academic Profile → Coursework (CGPA / CPI) → Proof 1")
  assert.equal(formatProofLocation(documents[9].locations[0]), "Games & Sports activities → Item 1: Cricket → Proof 1")
})

test("reused PDFs merge once and retain every application field that uses them", () => {
  const application = {
    coursework: { proofs: [proof("shared")] },
    culturalItems: [item("Dance", "other"), item("Music", "shared")],
    gamesSportsItems: [item("Cricket", "shared")],
  }
  const before = structuredClone(application)
  const documents = collectApplicationPdfDocuments(application)
  assert.deepEqual(documents.map((document) => document.url), ["shared", "other"])
  assert.deepEqual(documents[0].locations.map((location) => location.fieldPath), [
    "coursework.proofs[0].url", "culturalItems[1].proofs[0].url", "gamesSportsItems[0].proofs[0].url",
  ])
  assert.deepEqual(application, before)
})

test("skipped proofs and linked POR documents retain their original item and proof positions", () => {
  const documents = collectApplicationPdfDocuments({
    responsibilityItems: [
      { proofs: null },
      {
        title: "Club secretary", eventName: "Annual event", referenceCode: "R2",
        proofs: [null, { sourceType: "por", linkedPor: null }, {
          sourceType: "por", label: "Proof", porRequestId: "por-1",
          linkedPor: { positionTitle: "Secretary", supportingDocumentName: "Appointment", supportingDocumentUrl: "por-file" },
        }],
      },
    ],
  })
  assert.equal(documents.length, 1)
  const location = documents[0].locations[0]
  assert.equal(location.fieldPath, "responsibilityItems[1].proofs[2].linkedPor.supportingDocumentUrl")
  assert.equal(location.itemNumber, 2)
  assert.equal(location.proofNumber, 3)
  assert.equal(location.referenceCode, "R2")
  assert.equal(location.eventName, "Annual event")
  assert.equal(location.linkedPorTitle, "Secretary")
  assert.equal(location.porRequestId, "por-1")
  assert.equal(documents[0].label, "Appointment")
  assert.equal(formatProofLocation(location), "Responsibilities → Item 2: Club secretary → Proof 3")
})

test("missing or malformed application sections do not prevent identifying other proofs", () => {
  assert.deepEqual(collectApplicationPdfDocuments(null), [])
  assert.deepEqual(collectApplicationPdfDocuments({ coursework: { proofs: {} }, culturalItems: null }), [])
  const documents = collectApplicationPdfDocuments({ awardItems: [null, { proofs: [proof("award")] }] })
  assert.equal(formatProofLocation(documents[0].locations[0]), "Awards → Item 2 → Proof 1")
})
