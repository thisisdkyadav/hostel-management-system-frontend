import { useState } from "react"
import { Modal, Button, Input } from "czero/react"
import { Label } from "@/components/ui"
import { BedDouble, Users, Receipt, Clock3, CreditCard, RotateCcw, FileText, Building2 } from "lucide-react"
import { accommodationApi } from "@/service"
import { ACCOMMODATION_STATUS } from "@/constants/accommodationStatus"
import { MetaBar, SectionCard, InfoRow, GuestList, ChargesRows, JourneyTimeline, money, fmtDate } from "./AccommodationKit"

const CANCELLABLE = [
  ACCOMMODATION_STATUS.DRAFT,
  ACCOMMODATION_STATUS.SUBMITTED,
  ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION,
  ACCOMMODATION_STATUS.PENDING_CW_APPROVAL,
  ACCOMMODATION_STATUS.RETURNED_TO_STUDENT,
]

const AccommodationRequestDetail = ({ open, request, onClose, onChanged, onResubmit }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [pay, setPay] = useState({ transactionId: "", screenshotFileRef: "" })

  if (!request) return null
  if (!open) return null

  const requestId = request._id || request.id
  const status = request.status
  const lastReturn = [...(request.approvals || [])].reverse().find((a) => a.action === "request_modification" || a.action === "reject")
  const assignedRooms = request.assignedRooms || []
  const showAccommodation = Boolean(request.allottedHostelName) || assignedRooms.length > 0

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
      onClick={() => { if (window.confirm("Cancel this accommodation request?")) act(() => accommodationApi.cancelRequest(requestId)) }}
      style={{ color: "var(--color-danger)", borderColor: "var(--color-danger-light)" }}
    >
      Cancel request
    </Button>
  ) : null

  return (
    <Modal isOpen={open} onClose={onClose} title="Guest accommodation" width={860} closeButtonVariant="button">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <MetaBar request={request} actions={cancelAction} />

        {error && (
          <div style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", padding: "var(--spacing-3)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)" }}>{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <SectionCard icon={BedDouble} title="Stay details" accentColor="var(--color-primary)">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <InfoRow label="Check-in" value={fmtDate(request.stay?.fromDate)} />
                <InfoRow label="Check-out" value={fmtDate(request.stay?.toDate)} />
                <InfoRow label="Nights" value={request.nights || 0} />
                <InfoRow label="Purpose" value={request.stay?.purpose || "—"} />
              </div>
            </SectionCard>

            <SectionCard icon={Users} title={`Guests (${request.guests?.length || 0})`} accentColor="var(--color-info)">
              <GuestList guests={request.guests || []} />
            </SectionCard>

            <SectionCard icon={Receipt} title="Charges" accentColor="var(--color-success)">
              <ChargesRows quote={request.quote} />
            </SectionCard>

            {showAccommodation && (
              <SectionCard icon={Building2} title="Your accommodation" accentColor="var(--color-success)">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <InfoRow label="Hostel" value={request.allottedHostelName || "—"} strong />
                  {assignedRooms.length > 0 ? (
                    assignedRooms.map((r, i) => {
                      const roomLabel = `${r.unitNumber ? `${r.unitNumber}-` : ""}${r.roomNumber || "—"}`
                      return <InfoRow key={i} label={r.guests.join(", ") || `${r.guestIndexes.length} guest(s)`} value={`Room ${roomLabel}`} />
                    })
                  ) : (
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Room numbers will appear once the hostel supervisor assigns them.</p>
                  )}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <SectionCard icon={Clock3} title="Timeline" accentColor="var(--color-primary)">
              <JourneyTimeline status={status} timeline={request.timeline} />
            </SectionCard>

            {status === ACCOMMODATION_STATUS.RETURNED_TO_STUDENT && (
              <SectionCard icon={RotateCcw} title="Sent back for changes" accentColor="var(--color-warning)">
                {lastReturn?.reason && <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", marginBottom: "var(--spacing-3)" }}>{lastReturn.reason}</p>}
                <Button size="sm" onClick={() => onResubmit?.(request)}>Edit &amp; resubmit</Button>
              </SectionCard>
            )}

            {status === ACCOMMODATION_STATUS.PAYMENT_REQUESTED && (
              <SectionCard icon={CreditCard} title={`Pay ${money(request.payment?.amount)}`} accentColor="var(--color-primary)">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  {request.payment?.paymentLink && (
                    <a href={request.payment.paymentLink} target="_blank" rel="noreferrer" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", wordBreak: "break-all" }}>Open payment link / QR ↗</a>
                  )}
                  <div>
                    <Label>Transaction ID / UTR</Label>
                    <Input value={pay.transactionId} onChange={(e) => setPay((p) => ({ ...p, transactionId: e.target.value }))} placeholder="Reference number" />
                  </div>
                  <div>
                    <Label required>Payment screenshot reference</Label>
                    <Input value={pay.screenshotFileRef} onChange={(e) => setPay((p) => ({ ...p, screenshotFileRef: e.target.value }))} placeholder="Screenshot link / reference" />
                    <p style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>In-app image upload is coming soon — paste a link for now.</p>
                  </div>
                  <Button onClick={() => act(() => accommodationApi.submitPayment(requestId, pay))} loading={busy} disabled={busy || !pay.screenshotFileRef.trim()}>Submit payment</Button>
                </div>
              </SectionCard>
            )}

            {status === ACCOMMODATION_STATUS.PAYMENT_SUBMITTED && (
              <SectionCard icon={Clock3} title="Awaiting verification" accentColor="var(--color-info)">
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>The accounts office is checking your payment. You’ll be notified once it’s confirmed.</p>
              </SectionCard>
            )}

            {status === ACCOMMODATION_STATUS.INVOICED && request.invoice?.number && (
              <SectionCard icon={FileText} title={`Invoice ${request.invoice.number}`} accentColor="var(--color-success)">
                <InfoRow label="Total" value={`${money(request.quote?.total)}${request.invoice.gstApplicable ? " (incl. GST)" : ""}`} strong />
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AccommodationRequestDetail
