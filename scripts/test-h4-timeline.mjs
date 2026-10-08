import test from "node:test"
import assert from "node:assert/strict"
import { buildH4Timeline } from "../src/components/intern-accommodation/h4.timeline.js"

const at = (seconds = 0) => new Date(Date.UTC(2026, 9, 8, 10, 0, seconds)).toISOString()
const entry = (status, note, seconds = 0, by = "creator") => ({ status, note, at: at(seconds), by })
const current = (rows) => rows.find((row) => row.state === "current")
const recorded = (rows) => rows.filter((row) => row.state === "recorded")
const request = (extra = {}) => ({
  status: "Pending FA Recommendation", requesterUserId: "creator", applicantName: "Intern One",
  h4: { creatorName: "Requester One", facultyUserId: "faculty", facultyName: "Dr. Faculty", payer: { name: "Intern One" } },
  timeline: [entry("Pending FA Recommendation", "Submitted for faculty recommendation")], ...extra,
})

test("H4 reviews follow faculty, CW Office, Chief Warden; submission is its own recorded step", () => {
  const rows = buildH4Timeline(request())
  assert.equal(rows[0].title, "Request submitted for faculty review")
  assert.equal(rows[0].actor, "Requester One")
  assert.deepEqual(rows.filter((row) => row.state !== "recorded").slice(0, 3).map((row) => row.role), ["Faculty", "CW Office", "Chief Warden"])
  assert.equal(current(rows).role, "Faculty")
  assert.equal(rows.filter((row) => row.state === "current").length, 1)
})
test("self-recommendation records submission and recommendation without inventing an outstanding faculty review", () => {
  const rows = buildH4Timeline(request({ status: "Pending CWO Capacity Check", timeline: [
    entry("Pending FA Recommendation", "Submitted for faculty recommendation"),
    entry("Pending CWO Capacity Check", "Submitted and recommended; payer confirmed", 1),
  ] }))
  assert.equal(recorded(rows).length, 2)
  assert.equal(recorded(rows)[1].role, "Faculty")
  assert.equal(current(rows).role, "CW Office")
})
test("a returned decision keeps the reviewer and reason even when the approval is written after the audit event", () => {
  const rows = buildH4Timeline(request({ status: "Returned to Student", timeline: [entry("Returned to Student", "Clarify dates", 1, "chief")],
    approvals: [{ stage: "chief", action: "request_modification", actorUserId: "chief", actorEmail: "chief@iiti.ac.in", reason: "Clarify dates", at: new Date(+new Date(at(1)) + 1).toISOString() }],
  }))
  assert.equal(rows[0].role, "Chief Warden")
  assert.equal(rows[0].actor, "chief@iiti.ac.in")
  assert.equal(rows[0].note, "Clarify dates")
  assert.equal(current(rows).title, "Correct and resubmit request")
})
test("payment events keep their identity when the booking status remains Checked In", () => {
  const rows = buildH4Timeline(request({ status: "Checked In", timeline: [
    entry("Checked In", "Checked in"),
    entry("Checked In", "Payment proof submitted by payer", 1, null),
    entry("Checked In", "Payment verified", 2, "accounts"),
    entry("Checked In", "Accounts correct: Reconciled reference", 3, "accounts"),
  ] }))
  assert.deepEqual(recorded(rows).map((row) => row.title), ["Checked in", "Payment proof submitted", "Payment verified", "Payment details corrected"])
  assert.equal(rows[1].actor, "Intern One")
  assert.equal(rows[3].note, "Reconciled reference")
})
test("uploading proof keeps the payment-request status without appearing as a second charge issue", () => {
  const rows = buildH4Timeline(request({ status: "Payment Requested", h4: { facultyUserId: "faculty", facultyName: "Dr. Faculty", payer: { type: "faculty" } },
    timeline: [entry("Payment Requested", "Payment proof uploaded", 1, "faculty")],
  }))
  assert.equal(rows[0].title, "Payment proof uploaded")
  assert.equal(rows[0].role, "Payer")
  assert.equal(rows[0].actor, "Dr. Faculty")
  assert.equal(current(rows).title, "Payment proof")
})
test("date-change reviews are distinct from the original approvals and preserve the operational stay", () => {
  const rows = buildH4Timeline(request({ status: "Rooms Assigned", h4: { amendment: { stage: "office" } }, timeline: [
    entry("Rooms Assigned", "Date change submitted for faculty, office and Chief Warden review; current reservation remains effective"),
    entry("Rooms Assigned", "Date change recommended by faculty", 1, "faculty"),
  ] }))
  assert.equal(rows[0].title, "Date change requested")
  assert.equal(rows[1].role, "Faculty")
  assert.equal(current(rows).title, "Date change · CW Office availability review")
  assert.ok(rows.some((row) => row.title === "Date change · Chief Warden approval"))
  assert.ok(rows.some((row) => row.id === "next-checkin"))
  assert.ok(!rows.some((row) => row.id === "next-room"))
})
test("rejecting a date change does not mark the original stay rejected", () => {
  const rows = buildH4Timeline(request({ status: "Rooms Assigned", timeline: [entry("Rooms Assigned", "Date change rejected: Capacity unavailable", 1, "chief")],
    approvals: [{ stage: "date-change:chief", action: "reject", actorUserId: "chief", at: at(1) }],
  }))
  assert.equal(rows[0].title, "Date change rejected")
  assert.equal(rows[0].role, "Chief Warden")
  assert.equal(current(rows).title, "Check-in")
})
test("extension history includes the requested dates and reason without using the latest stay dates", () => {
  const rows = buildH4Timeline(request({ status: "Rooms Assigned", timeline: [entry("Rooms Assigned", "Date change submitted for faculty review", 1)],
    scheduleChanges: [{ type: "extend", requestedAt: at(0), requestedFromDate: "2026-10-10", requestedToDate: "2026-10-20", reason: "Research extended" }],
  }))
  assert.equal(rows[0].title, "Stay extension requested")
  assert.match(rows[0].note, /10 Oct 2026/)
  assert.match(rows[0].note, /20 Oct 2026/)
  assert.match(rows[0].note, /Research extended/)
})
test("an approved extra charge is planned after date-change approval and before resuming check-in", () => {
  const rows = buildH4Timeline(request({ status: "Rooms Assigned", h4: { amendment: { stage: "chief", extraAmount: 100 } } }))
  assert.equal(current(rows).role, "Chief Warden")
  assert.deepEqual(rows.filter((row) => row.state !== "recorded").slice(0, 4).map((row) => row.id), ["date-change-chief", "next-payment", "next-verification", "next-checkin"])
})
test("unpaid check-out waits for payment and invoice without inventing a second room assignment or check-in", () => {
  const rows = buildH4Timeline(request({ status: "Checked Out", payment: { amount: 500, status: "Deferred" }, timeline: [entry("Checked Out", "Stay closed; H4 reservation released")] }))
  assert.equal(current(rows).title, "Outstanding payment proof")
  assert.deepEqual(rows.filter((row) => row.state !== "recorded").map((row) => row.id), ["next-payment", "next-verification", "next-invoice"])
})
test("submitted additional payments wait for Accounts, not another proof submission", () => {
  const rows = buildH4Timeline(request({ status: "Rooms Assigned", additionalPayments: [{ amount: 100, status: "Submitted" }] }))
  assert.equal(current(rows).role, "Accounts")
  assert.ok(!rows.some((row) => row.id === "next-payment"))
})
test("waived charges skip payment collection and verification", () => {
  const rows = buildH4Timeline(request({ status: "Payment Verified", payment: { amount: 0, status: "Verified" }, timeline: [entry("Payment Verified", "Accommodation charge waived: Research programme", 1, "office")] }))
  assert.equal(rows[0].role, "CW Office")
  assert.match(rows[0].title, /charge waived/)
  assert.equal(current(rows).title, "Room assignment")
})
test("room moves remain room events during a checked-in stay and include the override reason", () => {
  const rows = buildH4Timeline(request({ status: "Checked In", h4: { roomHistory: [{ at: at(0) }, { at: at(1), reason: "Resident away for summer", warnings: [{ code: "resident" }] }] },
    timeline: [entry("Checked In", "Room changed during stay", 1, "supervisor")],
  }))
  assert.equal(rows[0].title, "Room reassigned")
  assert.match(rows[0].note, /Resident away for summer/)
  assert.match(rows[0].note, /1 room conflict acknowledged/)
})
test("rejections, cancellations and invoiced stays have no fictitious future milestones", () => {
  for (const status of ["Rejected", "Cancelled", "Invoiced"]) {
    const rows = buildH4Timeline(request({ status, timeline: [entry(status, "Final event")] }))
    assert.equal(rows.length, 1)
    assert.equal(rows[0].state, "recorded")
  }
})
test("return and resubmission cycles stay in chronological order without dropping repeated reviews", () => {
  const rows = buildH4Timeline(request({ timeline: [
    entry("Pending FA Recommendation", "Submitted for faculty recommendation", 3),
    entry("Returned to Student", "Update purpose", 2, "faculty"),
    entry("Pending FA Recommendation", "Submitted for faculty recommendation", 1),
  ] }))
  assert.deepEqual(recorded(rows).map((row) => row.at), [at(1), at(2), at(3)])
  assert.equal(recorded(rows).filter((row) => row.icon === "submit").length, 2)
})
test("missing history and unknown event types retain safe fallback content", () => {
  assert.equal(current(buildH4Timeline({ status: "Draft" })).title, "Submit request")
  const rows = buildH4Timeline({ timeline: [{ status: "Legacy event", note: "Retain this information", at: "invalid" }] })
  assert.equal(rows[0].title, "Legacy event")
  assert.equal(rows[0].note, "Retain this information")
})
test("cancellation does not borrow notes from an earlier office approval with the same timestamp", () => {
  const rows = buildH4Timeline(request({ status: "Cancelled", timeline: [entry("Cancelled", "Cancelled: Research ended", 1, "office")],
    approvals: [{ stage: "office", action: "approve", actorUserId: "office", reason: "Earlier availability review", at: at(1) }],
  }))
  assert.equal(rows[0].note, "Cancelled: Research ended")
})
test("multiple date changes and room moves use event order when their timestamps are identical", () => {
  const rows = buildH4Timeline(request({ status: "Checked In", h4: { roomHistory: [
    { at: at(0), reason: "First room" }, { at: at(0), reason: "Date extension" }, { at: at(0), reason: "Moved to another room" },
  ] }, scheduleChanges: [
    { type: "extend", requestedAt: at(0), requestedToDate: "2026-10-20", reason: "First extension" },
    { type: "extend", requestedAt: at(0), requestedToDate: "2026-10-25", reason: "Second extension" },
  ], timeline: [
    entry("Rooms Assigned", "Room assigned"),
    entry("Rooms Assigned", "Date change submitted for faculty review"),
    entry("Rooms Assigned", "Date change approved: 2026-10-10 to 2026-10-20"),
    entry("Checked In", "Room changed during stay"),
    entry("Checked In", "Date change submitted for faculty review"),
  ] }))
  assert.match(rows[0].note, /First room/)
  assert.match(rows[1].note, /First extension/)
  assert.match(rows[3].note, /Moved to another room/)
  assert.match(rows[4].note, /Second extension/)
})
