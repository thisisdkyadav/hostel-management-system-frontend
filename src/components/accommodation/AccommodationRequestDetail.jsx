import { useState } from "react"
import { Button, DatePicker, Field, HStack, Input, Modal, Surface, Text, Textarea, ToggleButtonGroup, useConfirm, VStack } from "hzero"
import { BedDouble, Users, Clock3, CreditCard, RotateCcw, FileText, Building2, Wallet, Eye, Download, CalendarRange } from "lucide-react"
import { accommodationApi, uploadApi } from "@/service"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import {
  ACCOMMODATION_STATUS,
  PAYMENT_MODE,
  PAYMENT_STATUS,
  SCHEDULE_CHANGE_TYPE,
  SCHEDULE_CHANGE_STATUS,
  SCHEDULE_LIMITS,
  describeExtension,
} from "@/constants/accommodationStatus"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { MetaBar, SectionCard, InfoRow, GuestList, JourneyTimeline, money, fmtDate } from "./AccommodationKit"

const toYmdLocal = (d) => {
  if (!d) return ""
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ""
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
}

const SCHEDULE_ELIGIBLE = [
  ACCOMMODATION_STATUS.CW_APPROVED,
  ACCOMMODATION_STATUS.PAYMENT_REQUESTED,
  ACCOMMODATION_STATUS.PAYMENT_DEFERRED,
  ACCOMMODATION_STATUS.PAYMENT_SUBMITTED,
  ACCOMMODATION_STATUS.PAYMENT_VERIFIED,
  ACCOMMODATION_STATUS.HOSTEL_ALLOTTED,
  ACCOMMODATION_STATUS.ROOMS_ASSIGNED,
  ACCOMMODATION_STATUS.CHECKED_IN,
]

const uploadPaymentScreenshot = (file) => {
  const formData = new FormData()
  formData.append("image", file)
  return uploadApi.uploadPaymentScreenshot(formData)
}

const CANCELLABLE = [
  ACCOMMODATION_STATUS.DRAFT,
  ACCOMMODATION_STATUS.SUBMITTED,
  ACCOMMODATION_STATUS.PENDING_CWO_CAPACITY,
  ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION,
  ACCOMMODATION_STATUS.PENDING_CW_APPROVAL,
  ACCOMMODATION_STATUS.RETURNED_TO_STUDENT,
]

// Pay later is open at PAYMENT_DEFERRED; legacy bookings that already got rooms
// under the old rules can still settle afterwards.
const DEFERRED_PAYABLE = [
  ACCOMMODATION_STATUS.PAYMENT_DEFERRED,
  ACCOMMODATION_STATUS.ROOMS_ASSIGNED,
  ACCOMMODATION_STATUS.CHECKED_IN,
  ACCOMMODATION_STATUS.CHECKED_OUT,
  ACCOMMODATION_STATUS.INVOICED,
]

const todayYmd = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const AccommodationRequestDetail = ({ open, request, onClose, onChanged, onResubmit }) => {
  const confirm = useConfirm()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [pay, setPay] = useState({ utr: "", paidAt: "", screenshotFileRef: "" })
  const [showInvoice, setShowInvoice] = useState(false)
  const [schedType, setSchedType] = useState(SCHEDULE_CHANGE_TYPE.EXTEND)
  const [schedForm, setSchedForm] = useState({ fromDate: "", toDate: "", reason: "" })

  if (!request) return null
  if (!open) return null

  const requestId = request._id || request.id
  const status = request.status
  const lastReturn = [...(request.approvals || [])].reverse().find((a) => a.action === "request_modification" || a.action === "reject")
  const assignedRooms = request.assignedRooms || []
  const showAccommodation = Boolean(request.allottedHostelName) || assignedRooms.length > 0
  const extension = describeExtension(request.stay)

  // Bill is open after the payment request, while deferred (any time), or on a
  // legacy deferred booking that already moved past rooms.
  const payment = request.payment || {}
  const isDeferred = payment.mode === PAYMENT_MODE.LATER
  const awaitingChoice = status === ACCOMMODATION_STATUS.PAYMENT_REQUESTED
  const canSettleDeferred =
    isDeferred &&
    DEFERRED_PAYABLE.includes(status) &&
    [PAYMENT_STATUS.DEFERRED, PAYMENT_STATUS.REJECTED].includes(payment.status)
  const showPaymentForm = awaitingChoice || canSettleDeferred
  const utrValid = /^\d{12}$/.test(pay.utr)
  const payReady = utrValid && Boolean(pay.paidAt) && Boolean(pay.screenshotFileRef.trim())

  const scheduleChanges = request.scheduleChanges || []
  const pendingSchedule = scheduleChanges.find((c) => c.status === SCHEDULE_CHANGE_STATUS.PENDING)
  const postponeUsed = scheduleChanges.filter((c) => c.type === SCHEDULE_CHANGE_TYPE.POSTPONE).length
  const extendUsed = scheduleChanges.filter((c) => c.type === SCHEDULE_CHANGE_TYPE.EXTEND).length
  const canPostpone = postponeUsed < SCHEDULE_LIMITS.postpone
  const canExtend = extendUsed < SCHEDULE_LIMITS.extend
  const canRequestSchedule = SCHEDULE_ELIGIBLE.includes(status) && !pendingSchedule && (canPostpone || canExtend)
  const activeSchedType =
    (schedType === SCHEDULE_CHANGE_TYPE.POSTPONE && canPostpone) ||
    (schedType === SCHEDULE_CHANGE_TYPE.EXTEND && canExtend)
      ? schedType
      : canExtend
        ? SCHEDULE_CHANGE_TYPE.EXTEND
        : SCHEDULE_CHANGE_TYPE.POSTPONE

  const openAdditional = (request.additionalPayments || []).find((p) =>
    [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.DEFERRED, PAYMENT_STATUS.REJECTED].includes(p.status)
  )
  const submittedAdditional = (request.additionalPayments || []).find((p) => p.status === PAYMENT_STATUS.SUBMITTED)
  const showAdditionalPayForm = Boolean(openAdditional) && payment.status === PAYMENT_STATUS.VERIFIED

  const act = async (fn) => {
    setBusy(true)
    setError("")
    try {
      await fn()
      onChanged?.()
    } catch (err) {
      setError(err?.message || "That didn’t go through. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const submitScheduleChange = () => {
    if (!schedForm.toDate) throw new Error("Choose a new end date.")
    if (activeSchedType === SCHEDULE_CHANGE_TYPE.POSTPONE && !schedForm.fromDate) {
      throw new Error("Choose a new start date to postpone.")
    }
    if (!schedForm.reason.trim()) throw new Error("Please explain why you need this change.")
    return accommodationApi.requestScheduleChange(requestId, {
      type: activeSchedType,
      fromDate: activeSchedType === SCHEDULE_CHANGE_TYPE.POSTPONE ? schedForm.fromDate : undefined,
      toDate: schedForm.toDate,
      reason: schedForm.reason.trim(),
    })
  }

  const cancelAction = CANCELLABLE.includes(status) ? (
    <Button
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={async () => {
        if (await confirm({ message: "Cancel this accommodation request?", confirmText: "Cancel request", cancelText: "Keep it", isDestructive: true })) {
          act(() => accommodationApi.cancelRequest(requestId))
        }
      }}
      style={{ color: "var(--color-danger)", borderColor: "var(--color-danger-light)" }}
    >
      Cancel request
    </Button>
  ) : null

  return (
    <Modal isOpen={open} onClose={onClose} title="Guest accommodation" width={860} closeButtonVariant="button">
      <VStack gap={4}>
        <MetaBar request={request} actions={cancelAction} studentFacing />

        {error && (
          <Surface bg="danger" padding={3} radius="md" color="danger-text" size="sm">{error}</Surface>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
          {/* Left column */}
          <VStack gap={4}>
            <SectionCard icon={BedDouble} title="Stay details" accentColor="var(--color-primary)">
              <VStack gap={2}>
                <InfoRow label="Check-in" value={`${fmtDate(request.stay?.fromDate)} · ${request.stay?.checkInTime || "11:00"}`} />
                <InfoRow label="Check-out" value={`${fmtDate(request.stay?.toDate)} · ${request.stay?.checkOutTime || "11:00"}`} />
                <InfoRow label="Nights" value={request.nights || 0} />
                {extension && <InfoRow label="Extension" value={extension} />}
                <InfoRow label="Purpose" value={request.stay?.purpose || "—"} />
                <InfoRow label="Room preference" value={request.roomPreference || "—"} />
              </VStack>
            </SectionCard>

            <SectionCard icon={Users} title={`Guests (${request.guests?.length || 0})`} accentColor="var(--color-info)">
              <GuestList guests={request.guests || []} />
            </SectionCard>

            {showAccommodation && (
              <SectionCard icon={Building2} title="Your accommodation" accentColor="var(--color-success)">
                <VStack gap={2}>
                  <InfoRow label="Hostel" value={request.allottedHostelName || "—"} strong />
                  {assignedRooms.length > 0 ? (
                    assignedRooms.map((r, i) => {
                      const roomLabel = `${r.unitNumber ? `${r.unitNumber}-` : ""}${r.roomNumber || "—"}`
                      return <InfoRow key={i} label={r.guests.join(", ") || `${r.guestIndexes.length} guest(s)`} value={`Room ${roomLabel}`} />
                    })
                  ) : (
                    <Text size="xs" color="muted">Room numbers will appear once the hostel supervisor assigns them.</Text>
                  )}
                </VStack>
              </SectionCard>
            )}
          </VStack>

          {/* Right column */}
          <VStack gap={4}>
            <SectionCard icon={Clock3} title="Timeline" accentColor="var(--color-primary)">
              <JourneyTimeline status={status} timeline={request.timeline} studentFacing />
            </SectionCard>

            {status === ACCOMMODATION_STATUS.RETURNED_TO_STUDENT && (
              <SectionCard icon={RotateCcw} title="Sent back for changes" accentColor="var(--color-warning)">
                {lastReturn?.reason && <Text size="sm" color="body" style={{ marginBottom: "var(--spacing-3)" }}>{lastReturn.reason}</Text>}
                <Button size="sm" onClick={() => onResubmit?.(request)}>Edit &amp; resubmit</Button>
              </SectionCard>
            )}

            {canRequestSchedule && (
              <SectionCard icon={CalendarRange} title="Postpone or extend stay" accentColor="var(--color-warning)">
                <VStack gap={3}>
                  <Text size="sm" color="muted">
                    Current stay: {fmtDate(request.stay?.fromDate)} → {fmtDate(request.stay?.toDate)}. 
                    Allowed: {SCHEDULE_LIMITS.postpone - postponeUsed} postponement
                    {SCHEDULE_LIMITS.postpone - postponeUsed === 1 ? "" : "s"},{" "}
                    {SCHEDULE_LIMITS.extend - extendUsed} extension{SCHEDULE_LIMITS.extend - extendUsed === 1 ? "" : "s"} left.
                    Chief Warden Office will approve or reject.
                  </Text>
                  <ToggleButtonGroup
                    size="small"
                    options={[
                      ...(canPostpone ? [{ value: SCHEDULE_CHANGE_TYPE.POSTPONE, label: "Postpone" }] : []),
                      ...(canExtend ? [{ value: SCHEDULE_CHANGE_TYPE.EXTEND, label: "Extend end date" }] : []),
                    ]}
                    value={activeSchedType}
                    onChange={(val) => {
                      setSchedType(val)
                      setSchedForm((f) => ({
                        ...f,
                        fromDate: val === SCHEDULE_CHANGE_TYPE.POSTPONE ? toYmdLocal(request.stay?.fromDate) : "",
                        toDate: toYmdLocal(request.stay?.toDate),
                      }))
                    }}
                  />
                  {activeSchedType === SCHEDULE_CHANGE_TYPE.POSTPONE && (
                    <Field label="New check-in date" required>
                      <DatePicker
                        value={schedForm.fromDate}
                        onChange={(e) => setSchedForm((f) => ({ ...f, fromDate: e.target.value }))}
                      />
                    </Field>
                  )}
                  <Field
                    label="New check-out date"
                    required
                    help={
                      activeSchedType === SCHEDULE_CHANGE_TYPE.EXTEND
                        ? `Must be after ${fmtDate(request.stay?.toDate)}`
                        : "Must be after the new check-in"
                    }
                  >
                    <DatePicker
                      value={schedForm.toDate}
                      min={
                        activeSchedType === SCHEDULE_CHANGE_TYPE.EXTEND
                          ? toYmdLocal(request.stay?.toDate)
                          : schedForm.fromDate || undefined
                      }
                      onChange={(e) => setSchedForm((f) => ({ ...f, toDate: e.target.value }))}
                    />
                  </Field>
                  <Field label="Reason" required>
                    <Textarea
                      rows={2}
                      value={schedForm.reason}
                      onChange={(e) => setSchedForm((f) => ({ ...f, reason: e.target.value }))}
                      placeholder="Why do you need this change?"
                    />
                  </Field>
                  <Button
                    size="sm"
                    loading={busy}
                    disabled={
                      busy ||
                      !schedForm.toDate ||
                      !schedForm.reason.trim() ||
                      (activeSchedType === SCHEDULE_CHANGE_TYPE.POSTPONE && !schedForm.fromDate)
                    }
                    onClick={() => act(submitScheduleChange)}
                  >
                    Submit to Chief Warden Office
                  </Button>
                </VStack>
              </SectionCard>
            )}

            {pendingSchedule && (
              <SectionCard icon={CalendarRange} title="Date change pending" accentColor="var(--color-info)">
                <VStack gap={2}>
                  <InfoRow
                    label="Type"
                    value={pendingSchedule.type === SCHEDULE_CHANGE_TYPE.POSTPONE ? "Postponement" : "Extension"}
                  />
                  <InfoRow
                    label="Requested dates"
                    value={`${fmtDate(pendingSchedule.requestedFromDate)} → ${fmtDate(pendingSchedule.requestedToDate)}`}
                  />
                  {pendingSchedule.reason && <InfoRow label="Reason" value={pendingSchedule.reason} />}
                  <Text size="sm" color="muted">Waiting for Chief Warden Office.</Text>
                </VStack>
              </SectionCard>
            )}

            {scheduleChanges.filter((c) => c.status !== SCHEDULE_CHANGE_STATUS.PENDING).length > 0 && (
              <SectionCard icon={CalendarRange} title="Date-change history" accentColor="var(--color-primary)">
                <VStack gap={2}>
                  {scheduleChanges
                    .filter((c) => c.status !== SCHEDULE_CHANGE_STATUS.PENDING)
                    .map((c) => (
                      <InfoRow
                        key={c._id || `${c.type}-${c.requestedAt}`}
                        label={`${c.type === SCHEDULE_CHANGE_TYPE.POSTPONE ? "Postpone" : "Extend"} · ${c.status}`}
                        value={`${fmtDate(c.requestedFromDate)} → ${fmtDate(c.requestedToDate)}${c.extraAmount ? ` · +${money(c.extraAmount)}` : ""}`}
                      />
                    ))}
                </VStack>
              </SectionCard>
            )}

            {showPaymentForm && (
              <SectionCard icon={CreditCard} title="Payment" accentColor="var(--color-primary)">
                <VStack gap={3}>
                  {Boolean(payment.amount) && (
                    <InfoRow label="Amount payable" value={money(payment.amount)} strong />
                  )}
                  {payment.paymentLink && (
                    <Text as="a" size="sm" color="brand" style={{ wordBreak: "break-all" }} href={payment.paymentLink} target="_blank" rel="noreferrer">Open payment link / QR ↗</Text>
                  )}
                  {payment.remarks && (
                    <Surface bg="tertiary" padding="var(--spacing-2) var(--spacing-3)" radius="md" color="muted" size="xs">
                      <strong>Note:</strong> {payment.remarks}
                    </Surface>
                  )}
                  {payment.status === PAYMENT_STATUS.REJECTED && payment.note && (
                    <Surface bg="danger" padding="var(--spacing-2) var(--spacing-3)" radius="md" color="danger-text" size="xs">
                      <strong>Payment rejected:</strong> {payment.note}
                    </Surface>
                  )}

                  <Field
                    label="UTR"
                    required
                    help="The 12-digit numeric UTR / reference number of the transfer."
                    error={pay.utr && !utrValid ? "UTR must be exactly 12 digits" : undefined}
                  >
                    <Input
                      value={pay.utr}
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="12-digit number"
                      onChange={(e) => setPay((p) => ({ ...p, utr: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
                    />
                  </Field>
                  <Field label="Date of payment" required>
                    <DatePicker value={pay.paidAt} max={todayYmd()} onChange={(e) => setPay((p) => ({ ...p, paidAt: e.target.value }))} />
                  </Field>
                  <PdfUploadField
                    label="Payment screenshot"
                    required
                    value={pay.screenshotFileRef}
                    onChange={(ref) => setPay((p) => ({ ...p, screenshotFileRef: ref }))}
                    onUpload={uploadPaymentScreenshot}
                    accept="image/*"
                    acceptHint="PNG or JPG"
                    validateType={(file) => file.type?.startsWith("image/")}
                    uploadedText="Screenshot uploaded"
                    viewerTitle="Payment screenshot"
                    viewerSubtitle="Payment proof"
                    downloadFileName="payment-screenshot.png"
                  />

                  {canSettleDeferred && !awaitingChoice && (
                    <Surface bg="tertiary" padding="var(--spacing-2) var(--spacing-3)" radius="md" color="muted" size="xs">
                      You chose to pay later. Rooms will be allocated only after payment is verified.
                      You can pay any time — including when your guest arrives.
                    </Surface>
                  )}

                  <HStack gap={2} wrap>
                    <Button onClick={() => act(() => accommodationApi.submitPayment(requestId, pay))} loading={busy} disabled={busy || !payReady}>
                      {awaitingChoice ? "Pay now — submit proof" : "Submit payment proof"}
                    </Button>
                    {awaitingChoice && (
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={async () => {
                          if (await confirm({
                            message:
                              "Pay later? Rooms will be allocated only after payment. You can pay when the guest arrives.",
                            confirmText: "Pay later",
                            cancelText: "Go back",
                          })) {
                            act(() => accommodationApi.deferPayment(requestId))
                          }
                        }}
                      >
                        Pay later
                      </Button>
                    )}
                  </HStack>
                  <Text size="xs" color="muted">All three fields are required before the accounts office can verify your payment.</Text>
                </VStack>
              </SectionCard>
            )}

            {showAdditionalPayForm && (
              <SectionCard icon={CreditCard} title={openAdditional.label || "Additional payment"} accentColor="var(--color-primary)">
                <VStack gap={3}>
                  <InfoRow label="Amount payable" value={money(openAdditional.amount)} strong />
                  {openAdditional.remarks && (
                    <Surface bg="tertiary" padding="var(--spacing-2) var(--spacing-3)" radius="md" color="muted" size="xs">
                      <strong>Note:</strong> {openAdditional.remarks}
                    </Surface>
                  )}
                  {openAdditional.status === PAYMENT_STATUS.REJECTED && openAdditional.note && (
                    <Surface bg="danger" padding="var(--spacing-2) var(--spacing-3)" radius="md" color="danger-text" size="xs">
                      <strong>Rejected:</strong> {openAdditional.note}
                    </Surface>
                  )}
                  {payment.paymentLink && (
                    <Text as="a" size="sm" color="brand" style={{ wordBreak: "break-all" }} href={payment.paymentLink} target="_blank" rel="noreferrer">Open payment link / QR ↗</Text>
                  )}
                  <Field
                    label="UTR"
                    required
                    error={pay.utr && !utrValid ? "UTR must be exactly 12 digits" : undefined}
                  >
                    <Input
                      value={pay.utr}
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="12-digit number"
                      onChange={(e) => setPay((p) => ({ ...p, utr: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
                    />
                  </Field>
                  <Field label="Date of payment" required>
                    <DatePicker value={pay.paidAt} max={todayYmd()} onChange={(e) => setPay((p) => ({ ...p, paidAt: e.target.value }))} />
                  </Field>
                  <PdfUploadField
                    label="Payment screenshot"
                    required
                    value={pay.screenshotFileRef}
                    onChange={(ref) => setPay((p) => ({ ...p, screenshotFileRef: ref }))}
                    onUpload={uploadPaymentScreenshot}
                    accept="image/*"
                    acceptHint="PNG or JPG"
                    validateType={(file) => file.type?.startsWith("image/")}
                    uploadedText="Screenshot uploaded"
                    viewerTitle="Payment screenshot"
                    viewerSubtitle="Payment proof"
                    downloadFileName="payment-screenshot.png"
                  />
                  <HStack gap={2} wrap>
                    <Button
                      onClick={() =>
                        act(() =>
                          accommodationApi.submitPayment(requestId, {
                            ...pay,
                            additionalPaymentId: openAdditional._id,
                          })
                        )
                      }
                      loading={busy}
                      disabled={busy || !payReady}
                    >
                      Submit payment proof
                    </Button>
                    {openAdditional.status === PAYMENT_STATUS.PENDING && (
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={async () => {
                          if (await confirm({
                            message: "Pay this additional charge later?",
                            confirmText: "Pay later",
                            cancelText: "Go back",
                          })) {
                            act(() => accommodationApi.deferPayment(requestId))
                          }
                        }}
                      >
                        Pay later
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </SectionCard>
            )}

            {isDeferred && payment.status === PAYMENT_STATUS.VERIFIED && status !== ACCOMMODATION_STATUS.INVOICED && !showAdditionalPayForm && (
              <SectionCard icon={Wallet} title="Payment settled" accentColor="var(--color-success)">
                <InfoRow label="UTR" value={payment.utr || "—"} />
                <InfoRow label="Paid on" value={fmtDate(payment.paidAt)} />
              </SectionCard>
            )}

            {(status === ACCOMMODATION_STATUS.PAYMENT_SUBMITTED ||
              (isDeferred && payment.status === PAYMENT_STATUS.SUBMITTED && !showPaymentForm) ||
              submittedAdditional) && (
              <SectionCard icon={Clock3} title="Awaiting verification" accentColor="var(--color-info)">
                <Text size="sm" color="muted">
                  {submittedAdditional
                    ? "The accounts office is checking your additional payment."
                    : "The accounts office is checking your payment. You’ll be notified once it’s confirmed."}
                </Text>
              </SectionCard>
            )}

            {request.invoice?.number && (
              <SectionCard icon={FileText} title={`Invoice ${request.invoice.number}`} accentColor="var(--color-success)">
                <VStack gap={3}>
                  <InfoRow label="Total" value={`${money(payment.amount || request.quote?.total)}${request.invoice.gstApplicable ? " (incl. GST)" : ""}`} strong />
                  <InfoRow label="Issued" value={fmtDate(request.invoice.generatedAt)} />
                  <HStack gap={2} wrap>
                    <Button size="sm" variant="secondary" onClick={() => setShowInvoice(true)}>
                      <Eye size={14} /> View invoice
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      as="a"
                      href={accommodationApi.invoiceFileUrl(requestId, "attachment")}
                    >
                      <Download size={14} /> Download
                    </Button>
                  </HStack>
                </VStack>
              </SectionCard>
            )}
          </VStack>
        </div>
      </VStack>

      <PdfViewerModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        documentUrl={accommodationApi.invoiceFileUrl(requestId)}
        title={`Invoice ${request.invoice?.number || ""}`}
        subtitle="Accommodation invoice"
        downloadFileName={`${String(request.invoice?.number || "invoice").replace(/[^\w-]+/g, "-")}.pdf`}
      />
    </Modal>
  )
}

export default AccommodationRequestDetail
