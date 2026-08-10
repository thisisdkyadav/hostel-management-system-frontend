import { useState } from "react"
import { Button, DatePicker, Field, HStack, Input, Modal, Surface, Text, useConfirm, VStack } from "hzero"
import { BedDouble, Users, Receipt, Clock3, CreditCard, RotateCcw, FileText, Building2, Wallet, Eye, Download } from "lucide-react"
import { accommodationApi, uploadApi } from "@/service"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import {
  ACCOMMODATION_STATUS,
  PAYMENT_MODE,
  PAYMENT_STATUS,
  describeExtension,
} from "@/constants/accommodationStatus"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { MetaBar, SectionCard, InfoRow, GuestList, ChargesRows, JourneyTimeline, money, fmtDate } from "./AccommodationKit"

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

// A deferred bill can be settled from room assignment onwards.
const DEFERRED_PAYABLE = [
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

  if (!request) return null
  if (!open) return null

  const requestId = request._id || request.id
  const status = request.status
  const lastReturn = [...(request.approvals || [])].reverse().find((a) => a.action === "request_modification" || a.action === "reject")
  const assignedRooms = request.assignedRooms || []
  const showAccommodation = Boolean(request.allottedHostelName) || assignedRooms.length > 0
  const extension = describeExtension(request.stay)

  // The bill is open either right after the payment request, or later on for a
  // student who deferred it and whose rooms are now assigned.
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
        <MetaBar request={request} actions={cancelAction} />

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
              </VStack>
            </SectionCard>

            <SectionCard icon={Users} title={`Guests (${request.guests?.length || 0})`} accentColor="var(--color-info)">
              <GuestList guests={request.guests || []} />
            </SectionCard>

            <SectionCard icon={Receipt} title="Charges" accentColor="var(--color-success)">
              <ChargesRows quote={request.quote} />
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
              <JourneyTimeline status={status} timeline={request.timeline} />
            </SectionCard>

            {status === ACCOMMODATION_STATUS.RETURNED_TO_STUDENT && (
              <SectionCard icon={RotateCcw} title="Sent back for changes" accentColor="var(--color-warning)">
                {lastReturn?.reason && <Text size="sm" color="body" style={{ marginBottom: "var(--spacing-3)" }}>{lastReturn.reason}</Text>}
                <Button size="sm" onClick={() => onResubmit?.(request)}>Edit &amp; resubmit</Button>
              </SectionCard>
            )}

            {showPaymentForm && (
              <SectionCard icon={CreditCard} title={`Pay ${money(payment.amount)}`} accentColor="var(--color-primary)">
                <VStack gap={3}>
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

                  <HStack gap={2} wrap>
                    <Button onClick={() => act(() => accommodationApi.submitPayment(requestId, pay))} loading={busy} disabled={busy || !payReady}>
                      Pay now — submit proof
                    </Button>
                    {awaitingChoice && (
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={async () => {
                          if (await confirm({
                            message: "Pay later? Your booking continues, and you can settle the bill any time once your rooms are assigned.",
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

            {status === ACCOMMODATION_STATUS.PAYMENT_DEFERRED && (
              <SectionCard icon={Wallet} title={`${money(payment.amount)} due`} accentColor="var(--color-warning)">
                <Text size="sm" color="muted">
                  You chose to pay later. Once the hostel supervisor assigns your rooms, the payment form opens here —
                  your invoice is issued as soon as the accounts office verifies it.
                </Text>
              </SectionCard>
            )}

            {isDeferred && payment.status === PAYMENT_STATUS.VERIFIED && status !== ACCOMMODATION_STATUS.INVOICED && (
              <SectionCard icon={Wallet} title="Payment settled" accentColor="var(--color-success)">
                <InfoRow label="UTR" value={payment.utr || "—"} />
                <InfoRow label="Paid on" value={fmtDate(payment.paidAt)} />
              </SectionCard>
            )}

            {(status === ACCOMMODATION_STATUS.PAYMENT_SUBMITTED ||
              (isDeferred && payment.status === PAYMENT_STATUS.SUBMITTED)) && (
              <SectionCard icon={Clock3} title="Awaiting verification" accentColor="var(--color-info)">
                <Text size="sm" color="muted">The accounts office is checking your payment. You’ll be notified once it’s confirmed.</Text>
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
