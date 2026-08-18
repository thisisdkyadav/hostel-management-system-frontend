import { useState, useEffect, useCallback } from "react"
import { Alert, Badge, Button, DetailSection, EmptyState, Field, Grid, HStack, InfoRow, Input, Modal, RadioGroup, RadioGroupItem, Select, Surface, Text, Textarea, ToggleButtonGroup, VStack } from "hzero"
import {
  BadgeCheck,
  Ban,
  BedDouble,
  Building2,
  CalendarRange,
  CircleCheck,
  Clock3,
  CreditCard,
  DoorOpen,
  ExternalLink,
  Download,
  Eye,
  FileText,
  Gavel,
  Receipt,
  User,
  UserRoundX,
  Users,
  Wallet,
} from "lucide-react"
import { accommodationApi } from "@/service"
import {
  ACCOMMODATION_STATUS,
  PAYMENT_MODE,
  PAYMENT_STATUS,
  SCHEDULE_CHANGE_TYPE,
  SCHEDULE_CHANGE_STATUS,
  describeExtension,
} from "@/constants/accommodationStatus"
import { MetaBar, PersonCard, GuestList, ChargesRows, JourneyTimeline, money, fmtDate } from "./AccommodationKit"
import StudentDetailModal from "../common/students/StudentDetailModal"
import PdfViewerModal from "../common/pdf/PdfViewerModal"

const toYmd = (d) => {
  if (!d) return ""
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ""
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
}

const todayYmd = () => toYmd(new Date())

const AccommodationStaffDetail = ({ open, request, user, onClose, onChanged }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [showStudentProfile, setShowStudentProfile] = useState(false)
  const [showProof, setShowProof] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)

  const [decision, setDecision] = useState({ action: "approve", reason: "" })
  const [capacity, setCapacity] = useState({ action: "approve", reason: "" })
  const [payRemarks, setPayRemarks] = useState("")
  // Per-guest { price, gstPercentage } strings while editing; office picks presets or types.
  const [guestCharges, setGuestCharges] = useState([])
  const [priceOptions, setPriceOptions] = useState([])
  const [gstOptions, setGstOptions] = useState([])
  const [verify, setVerify] = useState({ action: "verify", note: "" })
  const [payEdit, setPayEdit] = useState({ utr: "", paidAt: "" })
  const [schedDecision, setSchedDecision] = useState({ action: "approve", note: "", extraAmount: "" })
  const [settle, setSettle] = useState({ action: "mark_paid", method: "Cash", reference: "", paidAt: "", note: "" })
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)
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

  const payment = request?.payment || {}
  const extension = describeExtension(request?.stay)

  // The office screens capacity first, then later sets the amount and the hostel
  // together — that combined step is the only place allotment happens.
  const showCapacity = isCWOffice && status === ACCOMMODATION_STATUS.PENDING_CWO_CAPACITY
  const showBypassFa = (isChiefWarden || isCWOffice) && status === ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION
  const showApprove = isChiefWarden && status === ACCOMMODATION_STATUS.PENDING_CW_APPROVAL
  const showIssuePayment = isCWOffice && status === ACCOMMODATION_STATUS.CW_APPROVED
  const pendingSchedule = (request?.scheduleChanges || []).find((c) => c.status === SCHEDULE_CHANGE_STATUS.PENDING)
  const showScheduleDecision = isCWOffice && Boolean(pendingSchedule)
  const paymentStepPassed =
    Number(payment.amount) > 0 ||
    [
      ACCOMMODATION_STATUS.PAYMENT_REQUESTED,
      ACCOMMODATION_STATUS.PAYMENT_DEFERRED,
      ACCOMMODATION_STATUS.PAYMENT_SUBMITTED,
      ACCOMMODATION_STATUS.PAYMENT_VERIFIED,
      ACCOMMODATION_STATUS.HOSTEL_ALLOTTED,
      ACCOMMODATION_STATUS.ROOMS_ASSIGNED,
      ACCOMMODATION_STATUS.CHECKED_IN,
      ACCOMMODATION_STATUS.CHECKED_OUT,
      ACCOMMODATION_STATUS.INVOICED,
    ].includes(status)
  const initialPaid = payment.status === PAYMENT_STATUS.VERIFIED
  const submittedAdditional = (request?.additionalPayments || []).find((p) => p.status === PAYMENT_STATUS.SUBMITTED)
  // Accountant queue keys off payment.status so deferred bills still appear.
  const showVerify =
    isAccountant && (payment.status === PAYMENT_STATUS.SUBMITTED || Boolean(submittedAdditional))
  // Rooms only after payment is verified (pay-later waits for payment too).
  const readyToAssign = [
    ACCOMMODATION_STATUS.PAYMENT_VERIFIED,
    ACCOMMODATION_STATUS.HOSTEL_ALLOTTED, // legacy in-flight requests
  ].includes(status)
  // Show the assignment form when the booking is ready, or when reassigning.
  const showAssign = isSupervisor && (readyToAssign || (reassigning && status === ACCOMMODATION_STATUS.ROOMS_ASSIGNED))
  const showAssignedSummary = isSupervisor && isRoomsAssigned && assignedRooms.length > 0 && !showAssign
  const canReassign = isSupervisor && status === ACCOMMODATION_STATUS.ROOMS_ASSIGNED
  // Money that never went through the portal (cash/DD at the counter, a bank
  // reconciliation) — available to accounts once an amount has been set.
  const showSettle = isAccountant && Boolean(payment.amount) && payment.status !== PAYMENT_STATUS.SUBMITTED
  const isPaid = payment.status === PAYMENT_STATUS.VERIFIED
  // Fix typos in UTR / payment date after proof is in, or after the bill is paid.
  const showEditPaymentDetails =
    isAccountant &&
    payment.status === PAYMENT_STATUS.VERIFIED &&
    !submittedAdditional
  // The student cannot withdraw after payment is requested, so the office holds
  // the release valve for the whole run up to invoicing.
  const canAdminCancel =
    (isChiefWarden || isCWOffice) &&
    ![ACCOMMODATION_STATUS.INVOICED, ACCOMMODATION_STATUS.REJECTED, ACCOMMODATION_STATUS.CANCELLED].includes(status)
  const hasAction =
    showCapacity ||
    showBypassFa ||
    showApprove ||
    showIssuePayment ||
    showScheduleDecision ||
    showVerify ||
    showEditPaymentDetails ||
    showAssign ||
    showSettle ||
    canAdminCancel
  const needsHostelPick = showCapacity || showIssuePayment
  const payEditUtrValid = !payEdit.utr || /^\d{12}$/.test(payEdit.utr)

  const requestId = request?._id || request?.id
  const student = request?.student

  const loadAllotment = useCallback(async () => {
    try {
      const res = await accommodationApi.getAllotmentAvailability(requestId)
      setHostels(res?.data?.hostels || [])
      setPriceOptions(res?.data?.pricing?.priceOptions || [])
      setGstOptions(res?.data?.pricing?.gstOptions || [])
    } catch {
      setHostels([])
      setPriceOptions([])
      setGstOptions([])
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
    setCapacity({ action: "approve", reason: "" })
    setVerify({ action: "verify", note: "" })
    setPayEdit({
      utr: request.payment?.utr || "",
      paidAt: toYmd(request.payment?.paidAt),
    })
    setSchedDecision({ action: "approve", note: "", extraAmount: "" })
    setSettle({ action: "mark_paid", method: "Cash", reference: "", paidAt: "", note: "" })
    setCancelReason("")
    setCancelling(false)
    setPayRemarks("")
    setGuestCharges(
      (request.guests || []).map((g, i) => {
        const existing = request.quote?.guestCharges?.find((c) => Number(c.guestIndex) === i)
        return {
          price: existing?.price != null && existing.price > 0 ? String(existing.price) : "",
          gstPercentage: existing?.gstPercentage != null ? String(existing.gstPercentage) : "0",
        }
      })
    )
    setHostelChoice("")
    // Prefill room choices from any existing assignment (used when reassigning).
    const count = request.persons || (request.guests?.length || 0)
    const prefill = Array.from({ length: count }, () => "")
    for (const a of request.assignedRooms || []) {
      for (const i of a.guestIndexes || []) prefill[i] = a.roomId
    }
    setGuestChoices(prefill)
    if (needsHostelPick) loadAllotment()
  }, [open, request, needsHostelPick, loadAllotment])

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
  const submitCapacity = run(() => {
    if (capacity.action !== "approve" && !capacity.reason.trim()) throw new Error("Add a reason for the student.")
    return accommodationApi.capacityDecision(requestId, { action: capacity.action, reason: capacity.reason.trim() })
  })
  const submitIssuePayment = run(() => {
    if (!hostelChoice) throw new Error("Pick the hostel the guests will stay in.")
    if (!guestCharges.length || guestCharges.length !== (request.guests?.length || 0)) {
      throw new Error("Set price and GST for every guest.")
    }
    for (let i = 0; i < guestCharges.length; i++) {
      const price = Number(guestCharges[i].price)
      const gst = Number(guestCharges[i].gstPercentage)
      if (!(price > 0)) throw new Error(`Enter a price for ${request.guests[i]?.name || `guest ${i + 1}`}.`)
      if (!Number.isFinite(gst) || gst < 0) throw new Error(`Enter a valid GST % for ${request.guests[i]?.name || `guest ${i + 1}`}.`)
    }
    return accommodationApi.issuePaymentRequest(requestId, {
      hostelId: hostelChoice,
      remarks: payRemarks.trim() || undefined,
      guestCharges: guestCharges.map((c, i) => ({
        guestIndex: i,
        price: Number(c.price),
        gstPercentage: Number(c.gstPercentage),
      })),
    })
  })

  const setGuestCharge = (index, patch) => {
    setGuestCharges((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  const guestChargeTotal = guestCharges.reduce((sum, c) => {
    const price = Number(c.price) || 0
    const gst = Number(c.gstPercentage) || 0
    return sum + price + (price * gst) / 100
  }, 0)
  const chargesReady =
    guestCharges.length === (request?.guests?.length || 0) &&
    guestCharges.every((c) => Number(c.price) > 0 && Number.isFinite(Number(c.gstPercentage)) && Number(c.gstPercentage) >= 0)
  const submitVerify = run(() => {
    if (verify.action === "reject" && !verify.note.trim()) throw new Error("Add a reason for rejecting the payment.")
    if (verify.action === "verify" && payment.status === PAYMENT_STATUS.SUBMITTED) {
      if (!/^\d{12}$/.test(payEdit.utr || "")) throw new Error("UTR must be exactly 12 digits.")
      if (!payEdit.paidAt) throw new Error("Payment date is required.")
    }
    const addl = (request.additionalPayments || []).find((p) => p.status === PAYMENT_STATUS.SUBMITTED)
    return accommodationApi.verifyPayment(requestId, {
      action: verify.action,
      note: verify.note.trim(),
      ...(payment.status === PAYMENT_STATUS.SUBMITTED && verify.action === "verify"
        ? { utr: payEdit.utr.trim(), paidAt: payEdit.paidAt }
        : {}),
      ...(payment.status !== PAYMENT_STATUS.SUBMITTED && addl
        ? { additionalPaymentId: addl._id }
        : {}),
    })
  })
  const submitScheduleDecision = run(() => {
    if (!pendingSchedule) throw new Error("No pending date-change request.")
    if (schedDecision.action === "reject" && !schedDecision.note.trim()) {
      throw new Error("Add a reason for rejecting.")
    }
    const extra = Number(schedDecision.extraAmount)
    if (schedDecision.action === "approve" && paymentStepPassed && schedDecision.extraAmount !== "" && (Number.isNaN(extra) || extra < 0)) {
      throw new Error("Extra amount is invalid.")
    }
    return accommodationApi.decideScheduleChange(requestId, pendingSchedule._id, {
      action: schedDecision.action,
      note: schedDecision.note.trim() || undefined,
      extraAmount:
        schedDecision.action === "approve" && paymentStepPassed && schedDecision.extraAmount !== ""
          ? Number(schedDecision.extraAmount)
          : 0,
    })
  })
  const submitPayEdit = run(() => {
    if (!payEdit.utr.trim() && !payEdit.paidAt) throw new Error("Enter a UTR and/or payment date.")
    if (payEdit.utr.trim() && !/^\d{12}$/.test(payEdit.utr.trim())) throw new Error("UTR must be exactly 12 digits.")
    return accommodationApi.updatePaymentDetails(requestId, {
      utr: payEdit.utr.trim() || undefined,
      paidAt: payEdit.paidAt || undefined,
    })
  })
  const submitSettle = run(() => {
    if (settle.action === "mark_paid" && !settle.method.trim()) throw new Error("Record how the payment was received.")
    if (settle.action === "mark_unpaid" && !settle.note.trim()) throw new Error("Add a reason for marking it unpaid.")
    return accommodationApi.settlePayment(requestId, {
      action: settle.action,
      method: settle.method.trim() || undefined,
      reference: settle.reference.trim() || undefined,
      paidAt: settle.paidAt || undefined,
      note: settle.note.trim() || undefined,
    })
  })
  const submitAdminCancel = run(() => {
    if (!cancelReason.trim()) throw new Error("Add a reason for cancelling.")
    return accommodationApi.adminCancel(requestId, { reason: cancelReason.trim() })
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

  // Rooms are booked whole. A large party may need several rooms — same rule as
  // the backend allotment check (ceil(persons / largestRoom)).
  const roomsNeededFor = (persons, largestRoom) => {
    const party = Math.max(1, Number(persons) || 0)
    const capacity = Math.max(1, Number(largestRoom) || 1)
    return Math.ceil(party / capacity)
  }
  const hostelFits = (h) => {
    const need = roomsNeededFor(request.persons, h.largestRoom)
    return (h.availableRooms ?? 0) >= need && (h.available ?? 0) >= (request.persons || 1)
  }
  const hostelCapacityLabel = (h) => {
    const need = roomsNeededFor(request.persons, h.largestRoom)
    const rooms = `${h.availableRooms ?? 0} of ${h.roomCount ?? 0} rooms free`
    const needHint = need > 1 ? ` · needs ${need}` : ""
    return `${rooms}${needHint} · ${h.available ?? 0} beds`
  }

  // Free guest rooms per hostel for these dates — read-only during the capacity
  // screening, selectable when the payment request allots the hostel.
  const hostelCapacity = (selectable) => {
    if (hostels.length === 0) {
      return <EmptyState variant="inline" message="No hostels with free guest rooms are set up yet." />
    }
    if (!selectable) {
      return (
        <VStack gap={2}>
          {hostels.map((h) => (
            <InfoRow
              key={h.hostelId}
              label={h.name}
              value={
                <Badge variant={hostelFits(h) ? "success" : "danger"} size="small">
                  {hostelCapacityLabel(h)}
                </Badge>
              }
            />
          ))}
        </VStack>
      )
    }
    return (
      <RadioGroup name="hostel" value={hostelChoice} onChange={(e) => setHostelChoice(e.target.value)}>
        {hostels.map((h) => {
          const ok = hostelFits(h)
          return (
            <RadioGroupItem
              key={h.hostelId}
              value={h.hostelId}
              disabled={!ok}
              label={h.name}
              description={
                <Badge variant={ok ? "success" : "danger"} size="small">
                  {hostelCapacityLabel(h)}
                </Badge>
              }
            />
          )
        })}
      </RadioGroup>
    )
  }

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
              <InfoRow label="Check-in" value={`${fmtDate(request.stay?.fromDate)} · ${request.stay?.checkInTime || "11:00"}`} />
              <InfoRow label="Check-out" value={`${fmtDate(request.stay?.toDate)} · ${request.stay?.checkOutTime || "11:00"}`} />
              <InfoRow label="Nights" value={request.nights || 0} />
              {extension && (
                <InfoRow
                  label="Extension requested"
                  value={<Badge variant="warning" size="small">{extension}</Badge>}
                />
              )}
              <InfoRow label="Purpose" value={request.stay?.purpose || "—"} />
              <InfoRow label="Room preference" value={request.roomPreference || "—"} />
            </DetailSection>

            <DetailSection title={`Guests (${request.guests?.length || 0})`} icon={Users}>
              <GuestList guests={request.guests || []} />
            </DetailSection>

            <DetailSection title="Charges" icon={Receipt}>
              <ChargesRows quote={request.quote} />
            </DetailSection>

            {(request.scheduleChanges || []).length > 0 && (
              <DetailSection title="Date changes" icon={CalendarRange}>
                {(request.scheduleChanges || []).map((c) => (
                  <InfoRow
                    key={c._id || `${c.type}-${c.requestedAt}`}
                    label={`${c.type === SCHEDULE_CHANGE_TYPE.POSTPONE ? "Postpone" : "Extend"} · ${c.status}`}
                    value={`${fmtDate(c.requestedFromDate)} → ${fmtDate(c.requestedToDate)}${c.extraAmount ? ` · +${money(c.extraAmount)}` : ""}`}
                  />
                ))}
              </DetailSection>
            )}

            {(request.additionalPayments || []).length > 0 && (
              <DetailSection title="Additional payments" icon={Wallet}>
                {(request.additionalPayments || []).map((p) => (
                  <InfoRow
                    key={p._id}
                    label={`${p.label || "Extra"} · ${p.status}`}
                    value={money(p.amount)}
                  />
                ))}
              </DetailSection>
            )}

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
                <InfoRow label="Amount" value={money(payment.amount)} />
                <InfoRow label="UTR" value={payment.utr || "—"} />
                <InfoRow label="Paid on" value={fmtDate(payment.paidAt)} />
                {payment.mode === PAYMENT_MODE.LATER && (
                  <InfoRow label="Mode" value={<Badge variant="warning" size="small">Deferred (pay later)</Badge>} />
                )}
                {payment.remarks && <InfoRow label="Remarks" value={payment.remarks} />}
              </DetailSection>
            )}

            {request.invoice?.number && (
              <DetailSection
                title={`Invoice ${request.invoice.number}`}
                icon={FileText}
                tone="success"
                actions={
                  <Button type="button" size="sm" variant="secondary" onClick={() => setShowInvoice(true)}>
                    <Eye size={14} /> View
                  </Button>
                }
              >
                <InfoRow label="Issued" value={fmtDate(request.invoice.generatedAt)} />
                <InfoRow label="Total" value={money(payment.amount || request.quote?.total)} />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  as="a"
                  href={accommodationApi.invoiceFileUrl(requestId, "attachment")}
                >
                  <Download size={14} /> Download invoice
                </Button>
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

            {showCapacity && (
              <DetailSection title={`Capacity check · ${request.persons} bed(s) needed`} icon={Building2} tone="primary">
                <Text size="sm" color="muted">
                  Free guest beds for {fmtDate(request.stay?.fromDate)} → {fmtDate(request.stay?.toDate)}. Approving sends
                  the request on for recommendation and approval; the hostel itself is chosen later, when you request payment.
                </Text>
                {hostelCapacity(false)}
                <RadioGroup name="capacity" value={capacity.action} onChange={(e) => setCapacity((c) => ({ ...c, action: e.target.value }))}>
                  <RadioGroupItem value="approve" label="Capacity available" description="Sends the request onward for approval." />
                  <RadioGroupItem value="request_modification" label="Request modification" description="Returns it to the student, e.g. to shift the dates." />
                  <RadioGroupItem value="reject" label="Reject" description="No capacity for these dates." />
                </RadioGroup>
                {capacity.action !== "approve" && (
                  <Textarea value={capacity.reason} onChange={(e) => setCapacity((c) => ({ ...c, reason: e.target.value }))} rows={2} placeholder="Reason for the student" />
                )}
                <Button onClick={submitCapacity} loading={busy} disabled={busy}>Submit capacity decision</Button>
              </DetailSection>
            )}

            {showBypassFa && (
              <DetailSection title="Faculty advisor / supervisor" icon={UserRoundX} tone="warning">
                <Text size="sm" color="body">
                  This request is waiting on the faculty advisor / supervisor ({request.facultyAdvisorEmail || "—"}). You can bypass this step and move it to Chief Warden approval.
                </Text>
                <Button variant="secondary" onClick={submitBypassFa} loading={busy} disabled={busy}>Bypass faculty advisor / supervisor</Button>
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

            {showScheduleDecision && pendingSchedule && (
              <DetailSection
                title={
                  pendingSchedule.type === SCHEDULE_CHANGE_TYPE.POSTPONE
                    ? "Postponement request"
                    : "Extension request"
                }
                icon={CalendarRange}
                tone="primary"
              >
                <InfoRow
                  label="Current dates"
                  value={`${fmtDate(pendingSchedule.previousFromDate)} → ${fmtDate(pendingSchedule.previousToDate)}`}
                />
                <InfoRow
                  label="Requested dates"
                  value={`${fmtDate(pendingSchedule.requestedFromDate)} → ${fmtDate(pendingSchedule.requestedToDate)}`}
                />
                {pendingSchedule.reason && <InfoRow label="Student reason" value={pendingSchedule.reason} />}
                <RadioGroup
                  name="schedDecision"
                  value={schedDecision.action}
                  onChange={(e) => setSchedDecision((s) => ({ ...s, action: e.target.value }))}
                >
                  <RadioGroupItem value="approve" label="Approve" description="Apply the new stay dates." />
                  <RadioGroupItem value="reject" label="Reject" description="Keep the current dates." />
                </RadioGroup>
                {schedDecision.action === "approve" && paymentStepPassed && (
                  <Field
                    label="Extra amount (optional)"
                    help={
                      initialPaid
                        ? "Initial bill is already paid — this opens a second payment request for the student."
                        : "Student has not finished paying yet — extra is added to the open bill so they pay once."
                    }
                  >
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={schedDecision.extraAmount}
                      placeholder="0"
                      onChange={(e) => setSchedDecision((s) => ({ ...s, extraAmount: e.target.value }))}
                    />
                  </Field>
                )}
                <Textarea
                  value={schedDecision.note}
                  onChange={(e) => setSchedDecision((s) => ({ ...s, note: e.target.value }))}
                  rows={2}
                  placeholder={schedDecision.action === "reject" ? "Reason (required)" : "Note (optional)"}
                />
                <Button onClick={submitScheduleDecision} loading={busy} disabled={busy}>
                  {schedDecision.action === "approve" ? "Approve date change" : "Reject date change"}
                </Button>
              </DetailSection>
            )}

            {showIssuePayment && (
              <DetailSection title="Request payment & allot hostel" icon={CreditCard} tone="primary">
                <Text size="sm" color="muted">
                  Set price and GST for each guest (presets from Accommodation settings, or type a custom value). Total is calculated from your selections — not auto-estimated.
                </Text>

                {(request.guests || []).map((g, i) => {
                  const line = guestCharges[i] || { price: "", gstPercentage: "0" }
                  const priceNum = Number(line.price) || 0
                  const gstNum = Number(line.gstPercentage) || 0
                  const lineTotal = priceNum + (priceNum * gstNum) / 100
                  const pricePresetValue = priceOptions.some((p) => String(p) === String(line.price)) ? String(line.price) : null
                  const gstPresetValue = gstOptions.some((p) => String(p) === String(line.gstPercentage))
                    ? String(line.gstPercentage)
                    : null
                  return (
                    <Surface key={i} padding={3} radius="md" border="1px solid var(--color-border-primary)" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                      <div>
                        <Text as="div" size="sm" weight="semibold">{g.name || `Guest ${i + 1}`}</Text>
                        <Text as="div" size="xs" color="muted">
                          {[g.gender, g.age === 0 || g.age ? `Age ${g.age}` : null, g.relation].filter(Boolean).join(" · ") || "—"}
                        </Text>
                      </div>
                      <Field label="Price per person" required>
                        {priceOptions.length > 0 && (
                          <div style={{ marginBottom: "var(--spacing-2)" }}>
                            <ToggleButtonGroup
                              size="small"
                              options={priceOptions.map((p) => ({ value: String(p), label: money(p) }))}
                              value={pricePresetValue}
                              onChange={(val) => setGuestCharge(i, { price: String(val) })}
                            />
                          </div>
                        )}
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.price}
                          placeholder={priceOptions.length ? "Or enter manually" : "Enter amount"}
                          onChange={(e) => setGuestCharge(i, { price: e.target.value })}
                        />
                      </Field>
                      <Field label="GST %" required>
                        {gstOptions.length > 0 && (
                          <div style={{ marginBottom: "var(--spacing-2)" }}>
                            <ToggleButtonGroup
                              size="small"
                              options={gstOptions.map((p) => ({ value: String(p), label: `${p}%` }))}
                              value={gstPresetValue}
                              onChange={(val) => setGuestCharge(i, { gstPercentage: String(val) })}
                            />
                          </div>
                        )}
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.gstPercentage}
                          placeholder={gstOptions.length ? "Or enter manually" : "GST %"}
                          onChange={(e) => setGuestCharge(i, { gstPercentage: e.target.value })}
                        />
                      </Field>
                      <InfoRow label="Line total" value={money(lineTotal)} />
                    </Surface>
                  )
                })}

                <InfoRow label="Grand total" value={money(guestChargeTotal)} />

                <Field label="Remarks (optional)">
                  <Textarea
                    value={payRemarks}
                    onChange={(e) => setPayRemarks(e.target.value)}
                    rows={2}
                    placeholder="e.g. different rate for child, discount applied"
                  />
                </Field>
                <Field label={`Hostel · ${request.persons} bed(s) needed`} required>
                  {hostelCapacity(true)}
                </Field>
                <Text size="xs" color="muted">
                  This is the only hostel selection — the supervisor picks rooms inside it. The payment link and QR come from settings automatically.
                </Text>
                <Button
                  onClick={submitIssuePayment}
                  loading={busy}
                  disabled={busy || !hostelChoice || !chargesReady}
                >
                  Send payment request
                </Button>
              </DetailSection>
            )}

            {showVerify && (
              <DetailSection
                title={
                  payment.status === PAYMENT_STATUS.SUBMITTED
                    ? "Verify payment"
                    : `Verify ${submittedAdditional?.label || "additional payment"}`
                }
                icon={BadgeCheck}
                tone="primary"
              >
                {payment.status === PAYMENT_STATUS.SUBMITTED ? (
                  <>
                    <Text size="sm" color="muted">
                      Confirm the UTR and payment date match the proof. You can correct them here if the student mistyped.
                    </Text>
                    <InfoRow label="Amount" value={money(payment.amount)} />
                    <Field
                      label="UTR"
                      required={verify.action === "verify"}
                      help="12-digit transfer reference."
                      error={payEdit.utr && !payEditUtrValid ? "UTR must be exactly 12 digits" : undefined}
                    >
                      <Input
                        value={payEdit.utr}
                        inputMode="numeric"
                        maxLength={12}
                        onChange={(e) => setPayEdit((p) => ({ ...p, utr: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
                        placeholder="12-digit UTR"
                      />
                    </Field>
                    <Field label="Payment date" required={verify.action === "verify"}>
                      <Input
                        type="date"
                        value={payEdit.paidAt}
                        max={todayYmd()}
                        onChange={(e) => setPayEdit((p) => ({ ...p, paidAt: e.target.value }))}
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <Text size="sm" color="muted">
                      Additional charge after a date change. Amount {money(submittedAdditional?.amount)}.
                    </Text>
                    <InfoRow label="UTR" value={submittedAdditional?.utr || "—"} />
                    <InfoRow label="Paid on" value={fmtDate(submittedAdditional?.paidAt)} />
                  </>
                )}
                <RadioGroup name="verify" value={verify.action} onChange={(e) => setVerify((v) => ({ ...v, action: e.target.value }))}>
                  <RadioGroupItem value="verify" label="Verify" description="The amount matches." />
                  <RadioGroupItem value="reject" label="Reject" description="Sends the request back to the student." />
                </RadioGroup>
                <Textarea value={verify.note} onChange={(e) => setVerify((v) => ({ ...v, note: e.target.value }))} rows={2} placeholder={verify.action === "reject" ? "Reason (required)" : "Note (optional)"} />
                <Button
                  onClick={submitVerify}
                  loading={busy}
                  disabled={
                    busy ||
                    (verify.action === "verify" &&
                      payment.status === PAYMENT_STATUS.SUBMITTED &&
                      (!payEditUtrValid || !payEdit.utr || !payEdit.paidAt))
                  }
                >
                  Submit
                </Button>
              </DetailSection>
            )}

            {showEditPaymentDetails && (
              <DetailSection title="Edit payment details" icon={CreditCard} tone="primary">
                <Text size="sm" color="muted">
                  Correct the UTR or payment date if it was entered wrong. This does not change verification status.
                </Text>
                <Field
                  label="UTR"
                  help="12-digit transfer reference."
                  error={payEdit.utr && !payEditUtrValid ? "UTR must be exactly 12 digits" : undefined}
                >
                  <Input
                    value={payEdit.utr}
                    inputMode="numeric"
                    maxLength={12}
                    onChange={(e) => setPayEdit((p) => ({ ...p, utr: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
                    placeholder="12-digit UTR"
                  />
                </Field>
                <Field label="Payment date">
                  <Input
                    type="date"
                    value={payEdit.paidAt}
                    max={todayYmd()}
                    onChange={(e) => setPayEdit((p) => ({ ...p, paidAt: e.target.value }))}
                  />
                </Field>
                <Button
                  onClick={submitPayEdit}
                  loading={busy}
                  disabled={busy || !payEditUtrValid || (!payEdit.utr.trim() && !payEdit.paidAt)}
                >
                  Save payment details
                </Button>
              </DetailSection>
            )}

            {showSettle && (
              <DetailSection title="Record a payment" icon={Wallet} tone={isPaid ? "success" : "warning"}>
                <Text size="sm" color="muted">
                  {isPaid
                    ? "This bill is settled. Only mark it unpaid if it was recorded in error."
                    : `${money(payment.amount)} outstanding. Use this for money taken at the counter or reconciled from the bank — a payment uploaded on the portal goes through Verify instead.`}
                </Text>
                <RadioGroup name="settle" value={settle.action} onChange={(e) => setSettle((s) => ({ ...s, action: e.target.value }))}>
                  <RadioGroupItem value="mark_paid" label="Mark as paid" description="Records the money and issues the invoice." disabled={isPaid} />
                  <RadioGroupItem value="mark_unpaid" label="Mark as not paid" description="Puts the bill back to outstanding." disabled={!isPaid} />
                </RadioGroup>

                {settle.action === "mark_paid" && (
                  <>
                    <Field label="Received as" required>
                      <Select
                        options={[
                          { value: "Cash", label: "Cash" },
                          { value: "Demand draft", label: "Demand draft" },
                          { value: "Bank transfer", label: "Bank transfer / NEFT" },
                          { value: "UPI", label: "UPI" },
                          { value: "Adjusted", label: "Adjusted / waived by office" },
                        ]}
                        value={settle.method}
                        onChange={(e) => setSettle((s) => ({ ...s, method: e.target.value }))}
                      />
                    </Field>
                    <Field label="UTR (optional)" help="Only for a transfer — 12 digits.">
                      <Input
                        value={settle.reference}
                        inputMode="numeric"
                        maxLength={12}
                        onChange={(e) => setSettle((s) => ({ ...s, reference: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
                      />
                    </Field>
                    <Field label="Date received (optional)">
                      <Input type="date" value={settle.paidAt} onChange={(e) => setSettle((s) => ({ ...s, paidAt: e.target.value }))} />
                    </Field>
                  </>
                )}
                <Textarea
                  value={settle.note}
                  onChange={(e) => setSettle((s) => ({ ...s, note: e.target.value }))}
                  rows={2}
                  placeholder={settle.action === "mark_unpaid" ? "Reason (required)" : "Note (optional) — receipt no., who paid…"}
                />
                <Button onClick={submitSettle} loading={busy} disabled={busy}>
                  {settle.action === "mark_paid" ? "Mark as paid" : "Mark as not paid"}
                </Button>
              </DetailSection>
            )}

            {canAdminCancel && (
              <DetailSection title="Cancel this booking" icon={Ban} tone="danger">
                {!cancelling ? (
                  <>
                    <Text size="sm" color="muted">
                      The student cannot withdraw once payment has been requested. Cancelling here frees any rooms this
                      booking is holding. Any refund is settled outside the portal.
                    </Text>
                    <Button type="button" variant="outline" size="sm" onClick={() => setCancelling(true)}>
                      Cancel booking
                    </Button>
                  </>
                ) : (
                  <>
                    <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} placeholder="Reason for the student (required)" />
                    <Grid cols={2} gap={2}>
                      <Button variant="ghost" onClick={() => setCancelling(false)} disabled={busy}>Keep it</Button>
                      <Button variant="danger" onClick={submitAdminCancel} loading={busy} disabled={busy || !cancelReason.trim()}>
                        Cancel booking
                      </Button>
                    </Grid>
                  </>
                )}
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
                    <Text as="span" size="sm">
                      {g.name}
                      {(g.age === 0 || g.age) ? ` · Age ${g.age}` : ""}
                      {g.gender ? ` · ${g.gender}` : ""}
                    </Text>
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
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        documentUrl={accommodationApi.invoiceFileUrl(requestId)}
        title={`Invoice ${request.invoice?.number || ""}`}
        subtitle="Accommodation invoice"
        downloadFileName={`${String(request.invoice?.number || "invoice").replace(/[^\w-]+/g, "-")}.pdf`}
      />

      <PdfViewerModal
        isOpen={showProof}
        onClose={() => setShowProof(false)}
        documentUrl={request.payment?.screenshotFileRef}
        title="Payment proof"
        subtitle={`UTR ${payment.utr || "—"}`}
        downloadFileName="payment-proof.png"
      />
    </Modal>
  )
}

export default AccommodationStaffDetail
