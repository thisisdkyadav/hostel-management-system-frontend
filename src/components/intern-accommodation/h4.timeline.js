const steps = {
  submit: { title: "Submit request", role: "Requester", icon: "submit", note: "Complete student details and confirm the payer." },
  faculty: { title: "Faculty recommendation", role: "Faculty", icon: "faculty", note: "Verify the stay and who pays the accommodation charge." },
  office: { title: "CW Office availability review", role: "CW Office", icon: "office", note: "Check availability and recommend accommodation." },
  chief: { title: "Chief Warden approval", role: "Chief Warden", icon: "chief", note: "Approve the accommodation request." },
  charges: { title: "Hostel, mess and charges", role: "CW Office", icon: "charges", note: "Choose the hostel, mess option and accommodation charge." },
  payment: { title: "Payment proof", role: "Payer", icon: "payment", note: "Submit payment proof and the payment reference." },
  verification: { title: "Payment verification", role: "Accounts", icon: "payment", note: "Verify payment before room assignment and check-in." },
  room: { title: "Room assignment", role: "Hostel Supervisor", icon: "room", note: "Check room conflicts and record any override reason." },
  checkin: { title: "Check-in", role: "Hostel Gate / Supervisor", icon: "checkin", note: "Record the intern’s arrival." },
  checkout: { title: "Check-out", role: "Hostel Gate / Supervisor", icon: "checkout", note: "Close the stay and release the reservation." },
  invoice: { title: "Accommodation invoice", role: "System", icon: "invoice", note: "Generate the payer’s invoice after check-out and verified payment." },
}
const order = Object.keys(steps)
const nextStep = {
  Draft: "submit", Submitted: "faculty", "Pending FA Recommendation": "faculty",
  "Pending CWO Capacity Check": "office", "Pending CW Approval": "chief", "CW Approved": "charges",
  "Payment Requested": "payment", "Payment Deferred": "payment", "Payment Submitted": "verification",
  "Payment Verified": "room", "Hostel Allotted": "room", "Rooms Assigned": "checkin", "Checked In": "checkout",
  "Checked Out": "invoice", "Returned to Student": "submit",
}
const timestamp = (value) => value && Number.isFinite(+new Date(value)) ? +new Date(value) : null
const userId = (value) => String(value?._id || value || "")
const nearest = (items, entry, field, allowFuture = false) => {
  const at = timestamp(entry.at)
  if (at === null) return null
  return items.reduce((best, item) => {
    const delta = at - timestamp(item[field])
    if (timestamp(item[field]) === null || (!allowFuture && delta < 0) || Math.abs(delta) > 2000) return best
    return !best || Math.abs(delta) < Math.abs(at - timestamp(best[field])) ? item : best
  }, null)
}
const actorName = (request, entry, role, approval) => {
  if (entry.by?.name) return entry.by.name
  if (entry.by && userId(entry.by) === userId(request.h4?.facultyUserId)) return request.h4?.facultyName || ""
  if (entry.by && userId(entry.by) === userId(request.requesterUserId)) return request.h4?.creatorName || ""
  if (!entry.by && role === "Payer") return request.h4?.payer?.name || ""
  if (!entry.by && role === "Intern") return request.applicantName || ""
  return approval?.actorEmail || entry.by?.email || ""
}
const eventDetails = (entry, request, index, context) => {
  const note = String(entry.note || "").trim()
  const lower = note.toLowerCase()
  const payerRole = !entry.by || (userId(entry.by) === userId(request.h4?.facultyUserId) && request.h4?.payer?.type === "faculty") ? "Payer" : "Requester"
  const change = context.change || (request.scheduleChanges || []).filter((c) => timestamp(c.requestedAt) !== null
    && timestamp(c.requestedAt) <= timestamp(entry.at) && (!c.decidedAt || timestamp(entry.at) <= timestamp(c.decidedAt) + 2000))
    .sort((a, b) => timestamp(b.requestedAt) - timestamp(a.requestedAt))[0]
  const expectedStage = lower.startsWith("date change")
    ? lower.includes("by faculty") ? "date-change:faculty" : lower.includes("by office") ? "date-change:office" : lower.includes("approved") ? "date-change:chief" : null
    : ({ "Pending CWO Capacity Check": "faculty", "Pending CW Approval": "office", "CW Approved": "chief" })[entry.status]
  const expectedAction = entry.status === "Rejected" || lower.startsWith("date change rejected") ? "reject"
    : entry.status === "Returned to Student" || lower.startsWith("date change returned") ? "request_modification" : null
  const approvals = (request.approvals || []).filter((a) => userId(a.actorUserId) === userId(entry.by)
    && (!lower.startsWith("date change") || a.stage.startsWith("date-change:"))
    && (!expectedStage || a.stage === expectedStage) && (!expectedAction || a.action === expectedAction))
  let approval = nearest(approvals, entry, "at", true)
  let title, role, icon, tone = "success"
  if (/^date change/.test(lower)) {
    icon = "dates"
    if (lower.includes("submitted")) {
      title = change?.type === "extend" ? "Stay extension requested" : change?.type === "postpone" ? "Stay postponement requested" : "Date change requested"
      role = entry.by ? "Requester" : "Intern"
      approval = null
    } else {
      const stage = approval?.stage?.replace("date-change:", "") || (lower.includes("by faculty") ? "faculty" : lower.includes("by office") ? "office" : "chief")
      role = steps[stage]?.role || "Reviewer"
      title = lower.includes("rejected") ? "Date change rejected"
        : lower.includes("returned") ? "Date change returned"
          : stage === "chief" ? "Date change approved" : `Date change · ${steps[stage]?.title || "Review"}`
      if (/rejected|returned/.test(lower)) tone = "warning"
    }
  } else if (/^payment proof (uploaded|submitted)/.test(lower)) {
    title = lower.includes("uploaded") ? "Payment proof uploaded" : "Payment proof submitted"; role = payerRole; icon = "payment"; approval = null
  } else if (/^payment deferred/.test(lower)) {
    title = "Payment deferred"; role = payerRole; icon = "payment"; tone = "warning"; approval = null
  } else if (/^payment rejected/.test(lower)) {
    title = "Payment proof rejected"; role = "Accounts"; icon = "payment"; tone = "warning"; approval = null
  } else if (/^payment verified/.test(lower)) {
    title = "Payment verified"; role = "Accounts"; icon = "payment"; approval = null
  } else if (/^accounts /.test(lower)) {
    title = lower.includes("mark_unpaid") ? "Payment marked unpaid" : lower.includes("correct") ? "Payment details corrected" : "Payment recorded by Accounts"
    role = "Accounts"; icon = "payment"; tone = lower.includes("mark_unpaid") ? "warning" : "success"; approval = null
  } else if (/^accommodation charge waived/.test(lower)) {
    title = "Hostel allotted · charge waived"; role = "CW Office"; icon = "charges"; approval = null
  } else if (/^room (assigned|changed)/.test(lower)) {
    const room = context.room || nearest(request.h4?.roomHistory || [], entry, "at")
    const moved = lower.includes("changed") || (room && (request.h4?.roomHistory || []).indexOf(room) > 0)
    title = moved ? "Room reassigned" : "Room assigned"; role = "Hostel Supervisor"; icon = "room"; approval = null
    const details = [routineNotes.has(note) ? "" : note, room?.reason, room?.warnings?.length ? `${room.warnings.length} room conflict${room.warnings.length === 1 ? "" : "s"} acknowledged.` : ""].filter(Boolean)
    return { id: `event-${index}`, title, role, icon, tone, at: entry.at, actor: actorName(request, entry, role), note: [...new Set(details)].filter((text) => text.toLowerCase() !== title.toLowerCase()).join("\n"), state: "recorded" }
  } else {
    const descriptions = {
      Draft: [lower.includes("updated") ? "Draft updated" : "Draft saved", "Requester", "submit"],
      Submitted: ["Request submitted", "Requester", "submit"],
      "Pending FA Recommendation": ["Request submitted for faculty review", "Requester", "submit"],
      "Pending CWO Capacity Check": [lower.includes("submitted and recommended") ? "Submitted and recommended by faculty" : "Faculty recommended · payer confirmed", "Faculty", "faculty"],
      "Pending CW Approval": ["CW Office recommended · availability checked", "CW Office", "office"],
      "CW Approved": ["Chief Warden approved", "Chief Warden", "chief"],
      "Payment Requested": ["Hostel, mess and charges issued", "CW Office", "charges"],
      "Payment Submitted": ["Payment proof submitted", "Payer", "payment"],
      "Payment Deferred": ["Payment deferred", "Payer", "payment"],
      "Payment Verified": ["Payment verified", "Accounts", "payment"],
      "Hostel Allotted": ["Hostel allotted", "CW Office", "charges"],
      "Rooms Assigned": ["Room assigned", "Hostel Supervisor", "room"],
      "Checked In": ["Checked in", "Hostel Gate / Supervisor", "checkin"],
      "Checked Out": [lower.includes("scheduled stay end") ? "Stay ended · reservation released" : "Checked out · reservation released", entry.by ? "Hostel Gate / Supervisor" : "System", "checkout"],
      Invoiced: ["Accommodation invoice generated", "System", "invoice"],
      Cancelled: ["Request cancelled", "Requester / CW Office", "cancel"],
      Rejected: ["Request rejected", steps[approval?.stage]?.role || "Reviewer", "cancel"],
      "Returned to Student": ["Returned for correction", steps[approval?.stage]?.role || "Reviewer", "return"],
    }
    ;[title, role, icon] = descriptions[entry.status] || [entry.status || "Request updated", "", "submit"]
    if (["Rejected", "Cancelled"].includes(entry.status)) tone = "danger"
    if (["Returned to Student", "Payment Deferred"].includes(entry.status)) tone = "warning"
    // A submission can happen milliseconds before self-recommendation; it is not an approval.
    if (!["Pending CWO Capacity Check", "Pending CW Approval", "CW Approved", "Rejected", "Returned to Student"].includes(entry.status)) approval = null
  }
  const readableNote = routineNotes.has(note) || (change && lower.startsWith("date change approved:")) ? "" : note.replace(/^Accounts\s+(?:mark_paid|mark_unpaid|correct):\s*/i, "")
  const changedStay = lower.startsWith("date change") && change && timestamp(change.requestedToDate) !== null
    ? `${lower.includes("approved") ? "Approved" : "Requested"} stay: ${date(change.requestedFromDate)} → ${date(change.requestedToDate)}` : ""
  const details = [...new Set([readableNote, changedStay, lower.startsWith("date change") && lower.includes("submitted") ? change?.reason : "", approval?.reason].filter(Boolean))].filter((text) => text.toLowerCase() !== title.toLowerCase())
  return { id: `event-${index}`, title, role, icon, tone, at: entry.at, actor: actorName(request, entry, role, approval), note: details.join("\n"), state: "recorded" }
}

export const buildH4Timeline = (request = {}) => {
  const source = request.timeline || []
  const roomEvents = []
  source.forEach((entry, index) => {
    if (/^room (assigned|changed)/i.test(entry.note || "") || (roomEvents.length && /^date change approved:/i.test(entry.note || ""))) roomEvents.push(index)
  })
  let changeIndex = -1
  const history = source.map((entry, index) => {
    if (/^date change submitted/i.test(entry.note || "")) changeIndex += 1
    // Audit and metadata arrays retain insertion order, even in imported records with equal timestamps.
    const context = {
      change: (request.scheduleChanges || [])[changeIndex],
      room: roomEvents.length === request.h4?.roomHistory?.length ? request.h4.roomHistory[roomEvents.indexOf(index)] : null,
    }
    return eventDetails(entry, request, index, context)
  })
    .sort((a, b) => (timestamp(a.at) ?? 0) - (timestamp(b.at) ?? 0))
  if (["Cancelled", "Rejected", "Invoiced"].includes(request.status)) return history

  const next = nextStep[request.status]
  let pending = next ? order.slice(order.indexOf(next)).map((key) => ({ ...steps[key], id: `next-${key}` })) : []
  if (request.status === "Returned to Student" && pending.length) {
    pending[0] = { ...pending[0], title: "Correct and resubmit request", note: "Update the returned details and submit for fresh faculty review." }
  }
  // Additional payments retain the operational status; never mistake them for check-in or room events.
  const outstanding = [request.payment, ...(request.additionalPayments || [])].filter((p) => p?.amount > 0 && p.status !== "Verified")
  if (outstanding.length && ["Payment Verified", "Hostel Allotted", "Rooms Assigned", "Checked In", "Checked Out"].includes(request.status)) {
    const proofsNeeded = outstanding.some((p) => p.status !== "Submitted")
    const financial = (proofsNeeded ? ["payment", "verification"] : ["verification"]).map((key) => ({ ...steps[key], id: `next-${key}`, title: key === "payment" ? "Outstanding payment proof" : "Outstanding payment verification" }))
    pending = [...financial, ...pending]
  }
  const stage = request.h4?.amendment?.stage
  if (["faculty", "office", "chief"].includes(stage)) {
    const reviews = ["faculty", "office", "chief"].slice(["faculty", "office", "chief"].indexOf(stage))
      .map((key) => ({ ...steps[key], id: `date-change-${key}`, icon: "dates", title: `Date change · ${steps[key].title}` }))
    if (Number(request.h4.amendment.extraAmount) > 0 && !pending.some((row) => row.id === "next-payment" || row.id === "next-verification")) {
      pending = ["payment", "verification"].map((key) => ({ ...steps[key], id: `next-${key}`, title: `Date change · ${steps[key].title}` })).concat(pending)
    }
    pending = [...reviews, ...pending]
  }
  return [...history, ...pending.map((entry, index) => ({ ...entry, state: index === 0 ? "current" : "upcoming", tone: index === 0 ? "primary" : "neutral", note: index === 0 ? entry.note : "" }))]
}
import { date } from "./h4.format.js"

const routineNotes = new Set([
  "Draft saved", "Submitted for faculty recommendation", "Submitted and recommended; payer confirmed",
  "Faculty recommended; payer confirmed", "CW Office checked availability", "Chief Warden approved",
  "Hostel, mess and accommodation charges issued to intern and payer", "Payment proof submitted by payer",
  "Payment proof submitted through an IIT requester", "Payment verified", "Room assigned", "Room changed during stay",
  "Checked in", "Stay closed; H4 reservation released", "Accommodation invoice generated",
])
