import { useState, useEffect, useCallback } from "react"
import { Button, Input } from "czero/react"
import { EmptyState, HStack, Modal, Text, VStack } from "@/components/ui"
import { Select, Textarea, RadioGroup, Label } from "@/components/ui"
import { RadioGroupItem } from "@/components/ui/form/RadioGroup"
import { User, BedDouble, Users, Receipt, Clock3, Gavel, CreditCard, BadgeCheck, Building2, DoorOpen, ExternalLink, Eye, UserRoundX } from "lucide-react"
import { accommodationApi } from "@/service"
import { ACCOMMODATION_STATUS } from "@/constants/accommodationStatus"
import { MetaBar, SectionCard, InfoRow, PersonCard, GuestList, ChargesRows, JourneyTimeline, money, fmtDate } from "./AccommodationKit"
import StudentDetailModal from "../common/students/StudentDetailModal"
import PdfViewerModal from "../common/pdf/PdfViewerModal"

const AccommodationStaffDetail = ({ open, request, user, onClose, onChanged }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [showStudentProfile, setShowStudentProfile] = useState(false)
  const [showProof, setShowProof] = useState(false)

  const [decision, setDecision] = useState({ action: "approve", reason: "" })
  const [payForm, setPayForm] = useState({ amount: 0, remarks: "" })
  const [verify, setVerify] = useState({ action: "verify", note: "" })
  const [hostels, setHostels] = useState([])
  const [hostelChoice, setHostelChoice] = useState("")
  const [roomRows, setRoomRows] = useState([])
  const [guestChoices, setGuestChoices] = useState([])
  const [reassigning, setReassigning] = useState(false)

  const status = request?.status
  const isAdmin = user?.role === "Admin"
  const isChiefWarden = isAdmin && user?.subRole === "Chief Warden"
  const isCWOffice = isAdmin && user?.subRole === "Chief Warden Office"
  const isAccountant = isAdmin && user?.subRole === "Accountant"
  const isSupervisor = user?.role === "Hostel Supervisor"

  const assignedRooms = request?.assignedRooms || []
  const isRoomsAssigned = [ACCOMMODATION_STATUS.ROOMS_ASSIGNED, ACCOMMODATION_STATUS.CHECKED_IN, ACCOMMODATION_STATUS.CHECKED_OUT].includes(status)

  const showBypassFa = (isChiefWarden || isCWOffice) && status === ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION
  const showApprove = isChiefWarden && status === ACCOMMODATION_STATUS.PENDING_CW_APPROVAL
  const showIssuePayment = isCWOffice && status === ACCOMMODATION_STATUS.CW_APPROVED
  const showAllot = isCWOffice && status === ACCOMMODATION_STATUS.PAYMENT_VERIFIED
  const showVerify = isAccountant && status === ACCOMMODATION_STATUS.PAYMENT_SUBMITTED
  // Show the assignment form on first allotment, or when explicitly reassigning.
  const showAssign = isSupervisor && (status === ACCOMMODATION_STATUS.HOSTEL_ALLOTTED || (reassigning && status === ACCOMMODATION_STATUS.ROOMS_ASSIGNED))
  const showAssignedSummary = isSupervisor && isRoomsAssigned && assignedRooms.length > 0 && !showAssign
  const canReassign = isSupervisor && status === ACCOMMODATION_STATUS.ROOMS_ASSIGNED
  const hasAction = showBypassFa || showApprove || showIssuePayment || showVerify || showAllot || showAssign

  const requestId = request?._id || request?.id
  const student = request?.student

  const loadAllotment = useCallback(async () => {
    try {
      const res = await accommodationApi.getAllotmentAvailability(requestId)
      setHostels(res?.data?.hostels || [])
    } catch {
      setHostels([])
    }
  }, [requestId])

  const loadRooms = useCallback(async () => {
    try {
      const res = await accommodationApi.getRoomAvailability(requestId)
      setRoomRows(res?.data?.rooms || [])
    } catch {
      setRoomRows([])
    }
  }, [requestId])

  useEffect(() => {
    if (!open || !request) return
    setError("")
    setReassigning(false)
    setDecision({ action: "approve", reason: "" })
    setVerify({ action: "verify", note: "" })
    setPayForm({ amount: request.quote?.total || 0, remarks: "" })
    setHostelChoice("")
    // Prefill room choices from any existing assignment (used when reassigning).
    const count = request.persons || (request.guests?.length || 0)
    const prefill = Array.from({ length: count }, () => "")
    for (const a of request.assignedRooms || []) {
      for (const i of a.guestIndexes || []) prefill[i] = a.roomId
    }
    setGuestChoices(prefill)
    if (showAllot) loadAllotment()
  }, [open, request, showAllot, loadAllotment])

  // Load room availability whenever the assignment form is visible.
  useEffect(() => {
    if (open && showAssign) loadRooms()
  }, [open, showAssign, loadRooms])

  if (!request || !open) return null

  const run = (fn) => async () => {
    setBusy(true)
    setError("")
    try {
      await fn()
      onChanged?.()
      onClose?.()
    } catch (err) {
      setError(err?.message || "That action didn’t go through. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const submitDecision = run(() => {
    if (decision.action !== "approve" && !decision.reason.trim()) throw new Error("Add a reason for the student.")
    return accommodationApi.decision(requestId, { action: decision.action, reason: decision.reason.trim() })
  })
  const submitBypassFa = run(() => accommodationApi.bypassFacultyAdvisor(requestId))
  const submitIssuePayment = run(() =>
    accommodationApi.issuePaymentRequest(requestId, {
      amount: Number(payForm.amount) || undefined,
      remarks: payForm.remarks.trim() || undefined,
    })
  )
  const submitVerify = run(() => {
    if (verify.action === "reject" && !verify.note.trim()) throw new Error("Add a reason for rejecting the payment.")
    return accommodationApi.verifyPayment(requestId, { action: verify.action, note: verify.note.trim() })
  })
  const submitAllot = run(() => {
    if (!hostelChoice) throw new Error("Pick a hostel.")
    return accommodationApi.allotHostel(requestId, { hostelId: hostelChoice })
  })
  const submitAssign = run(() => {
    if (guestChoices.some((c) => !c)) throw new Error("Assign every guest to a room.")
    const byRoom = {}
    guestChoices.forEach((roomId, idx) => { (byRoom[roomId] ||= []).push(idx) })
    const rooms = Object.entries(byRoom).map(([roomId, guestIndexes]) => ({ roomId, guestIndexes }))
    return accommodationApi.assignRooms(requestId, { rooms })
  })

  const roomOptions = roomRows.map((r) => ({
    value: r.roomId,
    label: `${r.unitNumber ? `${r.unitNumber}-` : ""}${r.roomNumber} (${r.available} free)`,
  }))

  return (
    <Modal isOpen={open} onClose={onClose} title="Guest accommodation" width={900} closeButtonVariant="button">
      <VStack gap={4}>
        <MetaBar request={request} />

        {error && (
          <div style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", padding: "var(--spacing-3)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)" }}>{error}</div>
        )}

        {student && (
          <SectionCard
            icon={User}
            title="Student"
            accentColor="var(--color-primary)"
            headerAction={
              (student.id || student.userId) ? (
                <button
                  type="button"
                  onClick={() => setShowStudentProfile(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}
                >
                  View full profile <ExternalLink size={12} />
                </button>
              ) : null
            }
          >
            <PersonCard person={student} fallbackName={request.applicantName} />
          </SectionCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
          {/* Left: details */}
          <VStack gap={4}>
            <SectionCard icon={BedDouble} title="Stay details" accentColor="var(--color-primary)">
              <VStack gap={2}>
                <InfoRow label="Check-in" value={fmtDate(request.stay?.fromDate)} />
                <InfoRow label="Check-out" value={fmtDate(request.stay?.toDate)} />
                <InfoRow label="Nights" value={request.nights || 0} />
                <InfoRow label="Purpose" value={request.stay?.purpose || "—"} />
              </VStack>
            </SectionCard>

            <SectionCard icon={Users} title={`Guests (${request.guests?.length || 0})`} accentColor="var(--color-info)">
              <GuestList guests={request.guests || []} />
            </SectionCard>

            <SectionCard icon={Receipt} title="Charges" accentColor="var(--color-success)">
              <ChargesRows quote={request.quote} />
              {request.payment?.screenshotFileRef && (
                <div style={{ marginTop: "var(--spacing-3)", paddingTop: "var(--spacing-3)", borderTop: "1px solid var(--color-border-light)", fontSize: "var(--font-size-sm)" }}>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>Payment proof</div>
                  <InfoRow label="Amount" value={money(request.payment.amount)} />
                  <InfoRow label="Txn / UTR" value={request.payment.transactionId || "—"} />
                  {request.payment.remarks && <InfoRow label="Remarks" value={request.payment.remarks} />}
                  <div style={{ marginTop: "var(--spacing-2)" }}>
                    <Button size="sm" variant="secondary" onClick={() => setShowProof(true)}>
                      <Eye size={14} /> View payment proof
                    </Button>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Clock3} title="Timeline" accentColor="var(--color-text-secondary)">
              <JourneyTimeline status={status} timeline={request.timeline} />
            </SectionCard>
          </VStack>

          {/* Right: action console */}
          <VStack gap={4}>
            {!hasAction && !showAssignedSummary && (
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", padding: "var(--spacing-4)", border: "1px dashed var(--color-border-input)", borderRadius: "var(--radius-card-sm)" }}>
                No action needed from you at this stage.
              </div>
            )}

            {showAssignedSummary && (
              <SectionCard icon={DoorOpen} title="Rooms assigned" accentColor="var(--color-success)" headerAction={canReassign ? (
                <button type="button" onClick={() => setReassigning(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary)" }}>Reassign</button>
              ) : null}>
                <VStack gap={2}>
                  {assignedRooms.map((r, i) => {
                    const roomLabel = `${r.unitNumber ? `${r.unitNumber}-` : ""}${r.roomNumber || "—"}`
                    return (
                      <HStack gap={3} align="center" justify="between" key={i}>
                        <Text as="span" size="sm" color="body">{r.guests.join(", ") || `${r.guestIndexes.length} guest(s)`}</Text>
                        <Text as="span" size="sm" weight="semibold" color="heading">Room {roomLabel}</Text>
                      </HStack>
                    )
                  })}
                </VStack>
              </SectionCard>
            )}

            {showBypassFa && (
              <SectionCard icon={UserRoundX} title="Faculty advisor" accentColor="var(--color-warning)">
                <VStack gap={3}>
                  <Text size="sm" color="muted">
                    This request is awaiting the faculty advisor ({request.facultyAdvisorEmail || "—"}). You can bypass this step and move it to Chief Warden approval.
                  </Text>
                  <Button variant="outline" onClick={submitBypassFa} loading={busy} disabled={busy}>Bypass faculty advisor</Button>
                </VStack>
              </SectionCard>
            )}

            {showApprove && (
              <SectionCard icon={Gavel} title="Your decision" accentColor="var(--color-primary)">
                <VStack gap={3}>
                  <RadioGroup name="cwdecision" value={decision.action} onChange={(e) => setDecision((d) => ({ ...d, action: e.target.value }))}>
                    <RadioGroupItem value="approve" label="Approve" />
                    <RadioGroupItem value="request_modification" label="Request modification (returns to student)" />
                    <RadioGroupItem value="reject" label="Reject" />
                  </RadioGroup>
                  {decision.action !== "approve" && (
                    <Textarea value={decision.reason} onChange={(e) => setDecision((d) => ({ ...d, reason: e.target.value }))} rows={2} placeholder="Reason for the student" />
                  )}
                  <Button onClick={submitDecision} loading={busy} disabled={busy}>Submit decision</Button>
                </VStack>
              </SectionCard>
            )}

            {showIssuePayment && (
              <SectionCard icon={CreditCard} title="Request payment" accentColor="var(--color-primary)">
                <VStack gap={3}>
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
                    <p style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>Calculated total is {money(request.quote?.total)}. Override for a custom amount.</p>
                  </div>
                  <div>
                    <Label>Remarks {Number(payForm.amount) !== (request.quote?.total || 0) ? "(required — reason for the amount)" : "(optional)"}</Label>
                    <Textarea value={payForm.remarks} onChange={(e) => setPayForm((p) => ({ ...p, remarks: e.target.value }))} rows={2} placeholder="e.g., extra night charged, discount applied" />
                  </div>
                  <Text size="10px" color="muted">The payment link and QR are taken automatically from settings.</Text>
                  <Button onClick={submitIssuePayment} loading={busy} disabled={busy || (Number(payForm.amount) !== (request.quote?.total || 0) && !payForm.remarks.trim())}>Send payment request</Button>
                </VStack>
              </SectionCard>
            )}

            {showVerify && (
              <SectionCard icon={BadgeCheck} title="Verify payment" accentColor="var(--color-primary)">
                <VStack gap={3}>
                  <RadioGroup name="verify" value={verify.action} onChange={(e) => setVerify((v) => ({ ...v, action: e.target.value }))}>
                    <RadioGroupItem value="verify" label="Verify — amount matches" />
                    <RadioGroupItem value="reject" label="Reject — back to student" />
                  </RadioGroup>
                  <Textarea value={verify.note} onChange={(e) => setVerify((v) => ({ ...v, note: e.target.value }))} rows={2} placeholder={verify.action === "reject" ? "Reason (required)" : "Note (optional)"} />
                  <Button onClick={submitVerify} loading={busy} disabled={busy}>Submit</Button>
                </VStack>
              </SectionCard>
            )}

            {showAllot && (
              <SectionCard icon={Building2} title={`Allot a hostel · ${request.persons} bed(s)`} accentColor="var(--color-primary)">
                <VStack gap={3}>
                  {hostels.length === 0 ? (
                    <EmptyState variant="inline" message="No hostels with guest rooms are set up yet." />
                  ) : (
                    <VStack gap={2}>
                      {hostels.map((h) => {
                        const ok = h.available >= request.persons
                        return (
                          <label key={h.hostelId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", padding: "var(--spacing-2) var(--spacing-3)", border: `1px solid ${hostelChoice === h.hostelId ? "var(--color-primary)" : "var(--color-border-primary)"}`, borderRadius: "var(--radius-md)", opacity: ok ? 1 : 0.5, cursor: ok ? "pointer" : "not-allowed" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                              <input type="radio" name="hostel" value={h.hostelId} disabled={!ok} checked={hostelChoice === h.hostelId} onChange={() => setHostelChoice(h.hostelId)} />
                              <Text as="span" size="sm" weight="medium">{h.name}</Text>
                            </span>
                            <Text as="span" size="xs" weight="semibold" color={ok ? "var(--color-success)" : "var(--color-danger)"}>{h.available}/{h.totalBeds} free</Text>
                          </label>
                        )
                      })}
                    </VStack>
                  )}
                  <Button onClick={submitAllot} loading={busy} disabled={busy || !hostelChoice}>Allot hostel</Button>
                </VStack>
              </SectionCard>
            )}

            {showAssign && (
              <SectionCard icon={DoorOpen} title={reassigning ? "Reassign rooms" : "Assign rooms"} accentColor="var(--color-primary)" allowOverflow headerAction={reassigning ? (
                <button type="button" onClick={() => setReassigning(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)" }}>Cancel</button>
              ) : null}>
                <VStack gap={3}>
                  {roomOptions.length === 0 && <EmptyState variant="inline" message="No guest rooms are free for these dates." />}
                  {(request.guests || []).map((g, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)", alignItems: "center" }}>
                      <Text as="span" size="sm">{g.name}</Text>
                      <Select placeholder="Select room" options={roomOptions} value={guestChoices[i] || ""} onChange={(e) => setGuestChoices((prev) => prev.map((c, idx) => (idx === i ? e.target.value : c)))} />
                    </div>
                  ))}
                  <Button onClick={submitAssign} loading={busy} disabled={busy || roomOptions.length === 0}>{reassigning ? "Update assignment" : "Assign rooms"}</Button>
                </VStack>
              </SectionCard>
            )}
          </VStack>
        </div>
      </VStack>

      {showStudentProfile && student && (
        <StudentDetailModal
          selectedStudent={{ _id: student.id, userId: student.userId }}
          setShowStudentDetail={setShowStudentProfile}
          onUpdate={() => setShowStudentProfile(false)}
        />
      )}

      <PdfViewerModal
        isOpen={showProof}
        onClose={() => setShowProof(false)}
        documentUrl={request.payment?.screenshotFileRef}
        title="Payment proof"
        subtitle={`Txn ${request.payment?.transactionId || "—"}`}
        downloadFileName="payment-proof.png"
      />
    </Modal>
  )
}

export default AccommodationStaffDetail
