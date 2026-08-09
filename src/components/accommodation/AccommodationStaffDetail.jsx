import { useState, useEffect, useCallback } from "react"
import { Alert, Badge, Button, DetailSection, EmptyState, Field, Grid, InfoRow, Input, Modal, RadioGroup, RadioGroupItem, Select, Text, Textarea, VStack } from "hzero"
import {
  BadgeCheck,
  BedDouble,
  Building2,
  CircleCheck,
  Clock3,
  CreditCard,
  DoorOpen,
  ExternalLink,
  Eye,
  Gavel,
  Receipt,
  User,
  UserRoundX,
  Users,
} from "lucide-react"
import { accommodationApi } from "@/service"
import { ACCOMMODATION_STATUS } from "@/constants/accommodationStatus"
import { MetaBar, PersonCard, GuestList, ChargesRows, JourneyTimeline, money, fmtDate } from "./AccommodationKit"
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

  // Resets the console the moment a different request is opened. The reset has
  // to land in the same commit the new request does — deferring it would flash
  // the previous request's half-filled form — so the synchronous setState is
  // deliberate and the rule is silenced rather than worked around. Untouched by
  // the hzero migration, which is a presentation change only.
  useEffect(() => {
    if (!open || !request) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Load room availability whenever the assignment form is visible. Wrapped in
  // an async function because react-hooks/set-state-in-effect reads any call to
  // a setState-containing function as a synchronous one; nothing is set here
  // before the fetch returns.
  useEffect(() => {
    if (!open || !showAssign) return
    const fetchRooms = async () => { await loadRooms() }
    fetchRooms()
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

  const paymentAmountOverridden = Number(payForm.amount) !== (request.quote?.total || 0)

  return (
    <Modal isOpen={open} onClose={onClose} title="Guest accommodation" width={900} closeButtonVariant="button">
      <VStack gap={4}>
        <MetaBar request={request} />

        {error && <Alert type="error">{error}</Alert>}

        {student && (
          <DetailSection
            title="Student"
            icon={User}
            actions={
              (student.id || student.userId) ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowStudentProfile(true)}>
                  View full profile <ExternalLink size={14} />
                </Button>
              ) : undefined
            }
          >
            <PersonCard person={student} fallbackName={request.applicantName} />
          </DetailSection>
        )}

        <Grid cols={{ base: 1, lg: 2 }} gap={4} align="start">
          {/* Left: details */}
          <VStack gap={4}>
            <DetailSection title="Stay details" icon={BedDouble}>
              <InfoRow label="Check-in" value={fmtDate(request.stay?.fromDate)} />
              <InfoRow label="Check-out" value={fmtDate(request.stay?.toDate)} />
              <InfoRow label="Nights" value={request.nights || 0} />
              <InfoRow label="Purpose" value={request.stay?.purpose || "—"} />
            </DetailSection>

            <DetailSection title={`Guests (${request.guests?.length || 0})`} icon={Users}>
              <GuestList guests={request.guests || []} />
            </DetailSection>

            <DetailSection title="Charges" icon={Receipt}>
              <ChargesRows quote={request.quote} />
            </DetailSection>

            {request.payment?.screenshotFileRef && (
              <DetailSection
                title="Payment proof"
                icon={CreditCard}
                actions={
                  <Button type="button" size="sm" variant="secondary" onClick={() => setShowProof(true)}>
                    <Eye size={14} /> View
                  </Button>
                }
              >
                <InfoRow label="Amount" value={money(request.payment.amount)} />
                <InfoRow label="Txn / UTR" value={request.payment.transactionId || "—"} />
                {request.payment.remarks && <InfoRow label="Remarks" value={request.payment.remarks} />}
              </DetailSection>
            )}

            <DetailSection title="Timeline" icon={Clock3}>
              <JourneyTimeline status={status} timeline={request.timeline} />
            </DetailSection>
          </VStack>

          {/* Right: action console */}
          <VStack gap={4}>
            {!hasAction && !showAssignedSummary && (
              <EmptyState
                size="sm"
                icon={CircleCheck}
                title="No action needed"
                message="Nothing at this stage is waiting on you."
              />
            )}

            {showAssignedSummary && (
              <DetailSection
                title="Rooms assigned"
                icon={DoorOpen}
                tone="success"
                actions={canReassign ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setReassigning(true)}>Reassign</Button>
                ) : undefined}
              >
                {assignedRooms.map((r, i) => (
                  <InfoRow
                    key={i}
                    label={r.guests.join(", ") || `${r.guestIndexes.length} guest(s)`}
                    value={`Room ${r.unitNumber ? `${r.unitNumber}-` : ""}${r.roomNumber || "—"}`}
                  />
                ))}
              </DetailSection>
            )}

            {showBypassFa && (
              <DetailSection title="Faculty advisor" icon={UserRoundX} tone="warning">
                <Text size="sm" color="body">
                  This request is waiting on the faculty advisor ({request.facultyAdvisorEmail || "—"}). You can bypass this step and move it to Chief Warden approval.
                </Text>
                <Button variant="secondary" onClick={submitBypassFa} loading={busy} disabled={busy}>Bypass faculty advisor</Button>
              </DetailSection>
            )}

            {showApprove && (
              <DetailSection title="Your decision" icon={Gavel} tone="primary">
                <RadioGroup name="cwdecision" value={decision.action} onChange={(e) => setDecision((d) => ({ ...d, action: e.target.value }))}>
                  <RadioGroupItem value="approve" label="Approve" />
                  <RadioGroupItem value="request_modification" label="Request modification" description="Returns the request to the student." />
                  <RadioGroupItem value="reject" label="Reject" />
                </RadioGroup>
                {decision.action !== "approve" && (
                  <Textarea value={decision.reason} onChange={(e) => setDecision((d) => ({ ...d, reason: e.target.value }))} rows={2} placeholder="Reason for the student" />
                )}
                <Button onClick={submitDecision} loading={busy} disabled={busy}>Submit decision</Button>
              </DetailSection>
            )}

            {showIssuePayment && (
              <DetailSection title="Request payment" icon={CreditCard} tone="primary">
                <Field label="Amount" help={`Calculated total is ${money(request.quote?.total)}. Override it for a custom amount.`}>
                  <Input type="number" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
                </Field>
                <Field label={<>Remarks {paymentAmountOverridden ? "(required — reason for the amount)" : "(optional)"}</>}>
                  <Textarea value={payForm.remarks} onChange={(e) => setPayForm((p) => ({ ...p, remarks: e.target.value }))} rows={2} placeholder="e.g., extra night charged, discount applied" />
                </Field>
                <Text size="xs" color="muted">The payment link and QR come from settings automatically.</Text>
                <Button onClick={submitIssuePayment} loading={busy} disabled={busy || (paymentAmountOverridden && !payForm.remarks.trim())}>Send payment request</Button>
              </DetailSection>
            )}

            {showVerify && (
              <DetailSection title="Verify payment" icon={BadgeCheck} tone="primary">
                <RadioGroup name="verify" value={verify.action} onChange={(e) => setVerify((v) => ({ ...v, action: e.target.value }))}>
                  <RadioGroupItem value="verify" label="Verify" description="The amount matches." />
                  <RadioGroupItem value="reject" label="Reject" description="Sends the request back to the student." />
                </RadioGroup>
                <Textarea value={verify.note} onChange={(e) => setVerify((v) => ({ ...v, note: e.target.value }))} rows={2} placeholder={verify.action === "reject" ? "Reason (required)" : "Note (optional)"} />
                <Button onClick={submitVerify} loading={busy} disabled={busy}>Submit</Button>
              </DetailSection>
            )}

            {showAllot && (
              <DetailSection title={`Allot a hostel · ${request.persons} bed(s)`} icon={Building2} tone="primary">
                {hostels.length === 0 ? (
                  <EmptyState variant="inline" message="No hostels with guest rooms are set up yet." />
                ) : (
                  <RadioGroup name="hostel" value={hostelChoice} onChange={(e) => setHostelChoice(e.target.value)}>
                    {hostels.map((h) => {
                      const ok = h.available >= request.persons
                      return (
                        <RadioGroupItem
                          key={h.hostelId}
                          value={h.hostelId}
                          disabled={!ok}
                          label={h.name}
                          description={
                            <Badge variant={ok ? "success" : "danger"} size="small">{h.available} of {h.totalBeds} free</Badge>
                          }
                        />
                      )
                    })}
                  </RadioGroup>
                )}
                <Button onClick={submitAllot} loading={busy} disabled={busy || !hostelChoice}>Allot hostel</Button>
              </DetailSection>
            )}

            {showAssign && (
              <DetailSection
                title={reassigning ? "Reassign rooms" : "Assign rooms"}
                icon={DoorOpen}
                tone="primary"
                actions={reassigning ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setReassigning(false)}>Cancel</Button>
                ) : undefined}
              >
                {roomOptions.length === 0 && <EmptyState variant="inline" message="No guest rooms are free for these dates." />}
                {(request.guests || []).map((g, i) => (
                  <Grid cols={2} gap={2} align="center" key={i}>
                    <Text as="span" size="sm">{g.name}</Text>
                    <Select placeholder="Select room" options={roomOptions} value={guestChoices[i] || ""} onChange={(e) => setGuestChoices((prev) => prev.map((c, idx) => (idx === i ? e.target.value : c)))} />
                  </Grid>
                ))}
                <Button onClick={submitAssign} loading={busy} disabled={busy || roomOptions.length === 0}>{reassigning ? "Update assignment" : "Assign rooms"}</Button>
              </DetailSection>
            )}
          </VStack>
        </Grid>
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
