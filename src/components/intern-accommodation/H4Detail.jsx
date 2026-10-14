import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  DetailSection,
  EmptyState,
  Field,
  Grid,
  HStack,
  InfoRow,
  Input,
  Modal,
  Select,
  Surface,
  Text,
  Textarea,
  VStack,
  useConfirm,
  useToast,
} from "hzero"
import { BedDouble, CalendarDays, CircleCheck, CreditCard, Download, ExternalLink, Mail, Pencil, User, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import { queryKeys } from "@/lib/query"
import { h4Api, h4FileUrl } from "@/service/modules/intern-accommodation.api"
import { date, money } from "./h4.format"
import { MetaBar } from "@/components/accommodation/AccommodationKit"
import H4Timeline from "./H4Timeline"
import H4RoomCheck from "./H4RoomCheck"
import H4PaymentForm from "./H4PaymentForm"
import H4ScheduleForm from "./H4ScheduleForm"
import { h4Bills, h4BillAction } from "./h4.payments"

function OfferForm({ request, options, save, busy }) {
  const [hostelId, setHostel] = useState("")
  const [mess, setMess] = useState("without")
  const days = request.nights
  const config = options.config || {}
  const [dailyRate, setDailyRate] = useState(String(config.accommodationDailyRate || 0))
  const [priceOverride, setPriceOverride] = useState(null)
  const price = priceOverride ?? String(Math.round(Number(dailyRate || 0) * days * 100) / 100)
  const gstPercentage = Number(config.gstPercentage || 0)
  const [remarks, setRemarks] = useState("")
  const [messDailyRate, setMessDailyRate] = useState(String(config.messDailyRate || 0))
  const [messOverride, setMessOverride] = useState(null)
  const messAmount = messOverride ?? String(Math.round(Number(messDailyRate || 0) * days * 100) / 100)
  const [reason, setReason] = useState("")
  const total = Number(price || 0) * (1 + Number(gstPercentage || 0) / 100)
  return (
    <VStack gap={3}>
      <Field label="Hostel" required>
        <Select
          value={hostelId}
          placeholder="Select hostel"
          options={(options.hostels || []).map((h) => ({ value: String(h._id), label: h.name }))}
          onChange={(e) => setHostel(e.target.value)}
        />
      </Field>
      <InfoRow label="Charge days" value={`${days} days · departure day excluded`} />
      <Grid cols={{ base: 1, lg: 2 }} gap={3}>
        <Field label="Accommodation / day (₹)" required>
          <Input type="number" min="0" step="0.01" value={dailyRate} onChange={(e) => { setDailyRate(e.target.value); setPriceOverride(null) }} />
        </Field>
        <Field label="Accommodation total before GST (₹)" required>
          <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPriceOverride(e.target.value)} />
        </Field>
      </Grid>
      {priceOverride !== null && <Button variant="ghost" size="sm" onClick={() => setPriceOverride(null)}>Use calculated accommodation total</Button>}
      <InfoRow label="GST (from settings)" value={`${gstPercentage}%`} />
      <Field label="Mess">
        <Select
          value={mess}
          options={[
            { value: "without", label: "Without mess" },
            { value: "with", label: "With mess" },
          ]}
          onChange={(e) => setMess(e.target.value)}
        />
      </Field>
      <InfoRow label="Accommodation including GST" value={money(total)} strong />
      {mess === "with" && (
        <>
          <Grid cols={{ base: 1, lg: 2 }} gap={3}>
            <Field label="Mess / day (₹)" required>
              <Input type="number" min="0" step="0.01" value={messDailyRate} onChange={(e) => { setMessDailyRate(e.target.value); setMessOverride(null) }} />
            </Field>
            <Field label="Mess total — student pays (₹)" required>
              <Input type="number" min="0" step="0.01" value={messAmount} onChange={(e) => setMessOverride(e.target.value)} />
            </Field>
          </Grid>
          {messOverride !== null && <Button variant="ghost" size="sm" onClick={() => setMessOverride(null)}>Use calculated mess total</Button>}
        </>
      )}
      {price !== "" && Number(price) === 0 && (
        <Field label="Waiver reason" required>
          <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      )}
      <Field label="Note for payer">
        <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </Field>
      {!config.accommodationPaymentLink && <Text size="xs" color="muted">No accommodation payment link configured.</Text>}
      {mess === "with" && !config.messPaymentLink && <Text size="xs" color="muted">No mess payment link configured.</Text>}
      <Text size="xs" color="muted">Payment links are managed in Settings → Intern Accommodation.</Text>
      <Button
        disabled={busy || !hostelId || price === "" || dailyRate === "" || (mess === "with" && (messAmount === "" || messDailyRate === ""))}
        loading={busy}
        onClick={() => save("offer", { hostelId, mess, price, accommodationDailyRate: dailyRate, remarks, reason, messAmount, messDailyRate })}
      >
        Send charges
      </Button>
    </VStack>
  )
}

export default function H4Detail({ request: r, options, onClose, onRefresh, onEdit }) {
  const { user } = useAuth()
  const confirm = useConfirm()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [reason, setReason] = useState("")
  const [confirmPayer, setConfirmPayer] = useState(false)
  const [confirmAvailability, setConfirmAvailability] = useState(false)
  const [roomApproval, setRoomApproval] = useState(null)
  const [extraAmount, setExtra] = useState("0")
  const [showSchedule, setShowSchedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [refundNote, setRefund] = useState("")
  const [manual, setManual] = useState(null)
  const [reference, setReference] = useState("")
  const [paidAt, setPaidAt] = useState("")

  const office = options.role === "Admin" && options.subRole === "Chief Warden Office"
  const chief = options.role === "Admin" && options.subRole === "Chief Warden"
  const accounts = options.role === "Admin" && options.subRole === "Accountant"
  const creator = String(r.requesterUserId) === String(user._id || user.id)
  const faculty = options.canRecommend && String(r.h4.facultyUserId) === String(user._id || user.id)
  const closed = ["Rejected", "Cancelled", "Checked Out", "Invoiced"].includes(r.status)
  const reviewStage = r.h4.amendment?.stage || r.currentStage

  const availability = useQuery({
    queryKey: queryKeys.h4.availability(r._id, r.h4.revision),
    queryFn: () => h4Api.availability(r._id),
    enabled: office && reviewStage === "office",
  })

  const canReview =
    !closed &&
    ((reviewStage === "faculty" && faculty) ||
      (reviewStage === "office" && office) ||
      (reviewStage === "chief" && chief))

  const amendment =
    r.h4.amendment?.stage && r.scheduleChanges.find((c) => String(c._id) === String(r.h4.amendment.changeId))

  const canSchedule =
    !closed &&
    !amendment &&
    ["Payment Requested", "Payment Deferred", "Payment Submitted", "Payment Verified", "Rooms Assigned", "Checked In"].includes(r.status) &&
    (creator || faculty || office)

  const payments = h4Bills(r)
  const proofOpen =
    payments.some((p) => p.amount > 0 && ["Pending", "Deferred", "Rejected"].includes(p.status)) &&
    !["Rejected", "Cancelled", "Invoiced"].includes(r.status)

  const readyForRooms =
    !amendment &&
    options.role === "Hostel Supervisor" &&
    ["Payment Verified", "Rooms Assigned", "Checked In"].includes(r.status) &&
    payments.every((p) => p.status === "Verified")

  const save = async (suffix, body = {}) => {
    setError("")
    setBusy(true)
    try {
      const result = await h4Api.action(r._id, suffix, { revision: r.h4.revision, ...body })
      if (["offer", "resend"].includes(suffix)) toast.success(result.message || "Payment emails queued for delivery.")
      await onRefresh()
      setReason("")
      setConfirmPayer(false)
      setConfirmAvailability(false)
      setRoomApproval(null)
      setManual(null)
    } catch (e) {
      setError(e.message)
      await onRefresh()
    } finally {
      setBusy(false)
    }
  }

  const saveConfirmed = (suffix, body, dialog) => async () => {
    const ok = await confirm(dialog)
    if (!ok) return
    await save(suffix, body)
  }

  const editAllowed =
    ((creator && ["Draft", "Returned to Student"].includes(r.status)) || (office && !r.allotment?.hostelId)) && !closed

  const hasAction = canReview || (office && r.status === "CW Approved") || (proofOpen && !amendment) ||
    accounts || readyForRooms || canSchedule

  const editAction = editAllowed ? (
    <Button size="sm" variant="ghost" onClick={() => onEdit(r)}>
      <Pencil size={14} /> Edit
    </Button>
  ) : null

  return (
    <Modal isOpen onClose={busy ? undefined : onClose} title={r.applicantName || "Intern stay"} width={900} closeButtonVariant="button">
      <VStack gap={4}>
        <MetaBar request={{ ...r, persons: 1 }} actions={editAction} />

        {error && <Alert type="error">{error}</Alert>}
        {r.h4.lastNotificationError && <Alert type="warning">{r.h4.lastNotificationError}</Alert>}
        {amendment && (
          <Alert type="info">
            Date change requested: {date(amendment.requestedFromDate)} → {date(amendment.requestedToDate)}.
          </Alert>
        )}

        <Grid cols={{ base: 1, lg: 2 }} gap={4} align="start">
          <VStack gap={4}>
            <DetailSection title="Student" icon={User}>
              <InfoRow label="Email" value={r.applicantEmail} />
              <InfoRow label="Mobile" value={r.applicantPhone} />
              <InfoRow label="Institute" value={r.h4.institute} />
              <InfoRow label="Course" value={r.h4.course} />
              <InfoRow label="Department" value={r.h4.department} />
              <InfoRow label="Faculty" value={r.h4.facultyName} />
            </DetailSection>

            <DetailSection title="Stay" icon={CalendarDays}>
              <InfoRow label="Arrival" value={date(r.stay.fromDate)} />
              <InfoRow label="Departure" value={date(r.stay.toDate)} />
              <InfoRow label="Hostel" value={r.hostelName || r.hostel?.name || "Pending"} />
              <InfoRow label="Room" value={r.roomLabel || (r.room ? [r.room.unitId?.unitNumber, r.room.roomNumber].filter(Boolean).join(" / ") : "Pending")} />
              <InfoRow label="Payer" value={r.h4.payer.name} />
              <InfoRow label="Mess" value={r.h4.mess === "with" ? "With mess" : "Without mess"} />
              <InfoRow label="Purpose" value={r.stay.purpose} />
              {r.h4.cancellation?.reason && <InfoRow label="Cancelled" value={r.h4.cancellation.reason} />}
            </DetailSection>

            <DetailSection title="Payments" icon={CreditCard}>
              <VStack gap={3}>
                {payments.map((p) => (
                  <Surface key={p._id} bg="secondary" padding={3} radius="md">
                    <VStack gap={2}>
                      <HStack justify="between" wrap>
                        <Text weight="semibold">{p.label} · {money(p.amount)}</Text>
                        <Badge>{p.status}</Badge>
                      </HStack>
                      {p.paymentType === "mess" && p.days > 0 && <Text size="xs" color="muted">{p.days} days × {money(p.dailyRate)} / day{p.amountOverridden ? " · Total adjusted" : ""}</Text>}
                      {p.utr && <Text size="xs" color="muted">{p.utr} · {date(p.paidAt)}</Text>}
                      {p.note && <Text size="xs">{p.note}</Text>}
                      {p.screenshotFileRef && (accounts || office || creator || faculty) && (
                        <a href={h4FileUrl(r._id, "proof", h4BillAction(p))} target="_blank" rel="noreferrer">
                          <HStack gap={1}><ExternalLink size={14} /><Text size="sm">Proof</Text></HStack>
                        </a>
                      )}
                      {accounts && !["Cancelled", "Invoiced"].includes(r.status) && p.amount > 0 && (
                        <HStack gap={2} wrap>
                          {p.status === "Submitted" && (
                            <>
                              <Button size="sm" disabled={busy} onClick={() => save("verify", { action: "verify", ...h4BillAction(p) })}>Verify</Button>
                              <Button size="sm" variant="secondary" disabled={busy || !reason.trim()} onClick={() => save("verify", { action: "reject", reason, ...h4BillAction(p) })}>Reject</Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => { setManual(p); setReason("") }}>Adjust</Button>
                        </HStack>
                      )}
                    </VStack>
                  </Surface>
                ))}
                {r.invoice?.generatedAt && (
                  <HStack gap={2} wrap>
                    <Text size="sm" weight="semibold">{r.invoice.number}</Text>
                    <a href={h4FileUrl(r._id)} target="_blank" rel="noreferrer">
                      <HStack gap={1}><ExternalLink size={14} /><Text size="sm">Invoice</Text></HStack>
                    </a>
                    <a href={h4FileUrl(r._id, "invoice", { disposition: "attachment" })}><Download size={16} /></a>
                  </HStack>
                )}
              </VStack>
            </DetailSection>

          </VStack>

          <VStack gap={4}>
            {!hasAction && !showCancel && (
              <EmptyState
                size="sm"
                icon={CircleCheck}
                title="No action needed"
                message="Nothing at this stage is waiting on you."
              />
            )}

            {canReview && (
              <DetailSection title={amendment ? "Date change" : "Review"} icon={User}>
                <VStack gap={3}>
                  {office && reviewStage === "office" && (
                    <VStack gap={2}>
                      {availability.isLoading && <Text size="sm">Checking…</Text>}
                      {availability.error && <Alert type="error">{availability.error.message}</Alert>}
                      {(availability.data?.data?.hostels || []).map((h) => (
                        <InfoRow key={h._id} label={h.name} value={`${h.emptyGuestRooms} free · ${h.h4Reservations} H4`} />
                      ))}
                    </VStack>
                  )}
                  {reviewStage === "faculty" && (
                    <>
                      <InfoRow label="Payer" value={`${r.h4.payer.name} · ${r.h4.payer.email}`} />
                      <Checkbox checked={confirmPayer} onChange={(e) => setConfirmPayer(e.target.checked)} label="Stay and payer verified" />
                    </>
                  )}
                  {reviewStage === "office" && (
                    <>
                      <Checkbox checked={confirmAvailability} onChange={(e) => setConfirmAvailability(e.target.checked)} label="Availability checked" />
                      {amendment && (
                        <Field label="Extra charge">
                          <Input type="number" min="0" value={extraAmount} onChange={(e) => setExtra(e.target.value)} />
                        </Field>
                      )}
                    </>
                  )}
                  {amendment && reviewStage === "chief" && r.room && (
                    <H4RoomCheck key={`${r._id}:${r.h4.revision}`} request={r} amendment onReady={setRoomApproval} />
                  )}
                  {amendment && <Text size="sm">{amendment.reason}</Text>}
                  <Field label="Note">
                    <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required to return or reject" />
                  </Field>
                  <Button
                    disabled={busy || (reviewStage === "faculty" && !confirmPayer) || (reviewStage === "office" && !confirmAvailability) || (amendment && reviewStage === "chief" && r.room && !roomApproval)}
                    loading={busy}
                    onClick={() => save(`decision/${reviewStage}`, { action: "approve", reason, confirmPayer, confirmAvailability, extraAmount, ...roomApproval })}
                  >
                    {reviewStage === "chief" ? "Approve" : "Recommend"}
                  </Button>
                  <HStack gap={2} wrap>
                    <Button variant="secondary" size="sm" disabled={busy || !reason.trim()} onClick={() => save(`decision/${reviewStage}`, { action: "request_modification", reason })}>Return</Button>
                    <Button variant="danger" size="sm" disabled={busy || !reason.trim()} onClick={() => save(`decision/${reviewStage}`, { action: "reject", reason })}>Reject</Button>
                  </HStack>
                </VStack>
              </DetailSection>
            )}

            {office && r.status === "CW Approved" && (
              <DetailSection title="Charges" icon={CreditCard}>
                <OfferForm request={r} options={options} save={save} busy={busy} />
              </DetailSection>
            )}

            {proofOpen && !amendment && (creator || (faculty && r.h4.payer.type === "faculty")) && (
              <DetailSection title="Payment" icon={CreditCard}>
                <H4PaymentForm request={r} onSaved={onRefresh} accommodationOnly={!creator} />
              </DetailSection>
            )}

            {accounts && (
              <DetailSection title="Accounts" icon={CreditCard}>
                <VStack gap={3}>
                  <Field label="Note">
                    <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                  {manual && (
                    <>
                      <Text size="sm">{manual.label} · {money(manual.amount)}</Text>
                      <Field label="Reference">
                        <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                      </Field>
                      <Field label="Date">
                        <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                      </Field>
                      <HStack gap={2} wrap>
                        <Button size="sm" disabled={busy || !reason || !reference || !paidAt} onClick={() => save("settle", { action: "mark_paid", reference, paidAt, reason, ...h4BillAction(manual) })}>Paid</Button>
                        <Button size="sm" variant="secondary" disabled={busy || !reason || !reference || !paidAt} onClick={() => save("settle", { action: "correct", reference, paidAt, reason, ...h4BillAction(manual) })}>Correct</Button>
                        <Button size="sm" variant="danger" disabled={busy || !reason} onClick={() => save("settle", { action: "mark_unpaid", reason, ...h4BillAction(manual) })}>Unpaid</Button>
                      </HStack>
                    </>
                  )}
                </VStack>
              </DetailSection>
            )}

            {readyForRooms && (
              <DetailSection title={r.room ? "Move room" : "Assign room"} icon={BedDouble}>
                <H4RoomCheck key={`${r._id}:${r.h4.revision}`} request={r} onSaved={onRefresh} />
              </DetailSection>
            )}

            {["Hostel Supervisor", "Hostel Gate"].includes(options.role) && ["Rooms Assigned", "Checked In"].includes(r.status) && (
              <DetailSection title="Stay" icon={CalendarDays}>
                <HStack gap={2} wrap>
                  {r.status === "Rooms Assigned" && <Button disabled={busy} onClick={() => save("checkin")}>Check in</Button>}
                  <Button variant="secondary" disabled={busy} onClick={() => save("checkout")}>Check out</Button>
                </HStack>
              </DetailSection>
            )}

            {canSchedule && (
              <DetailSection title="Dates" icon={CalendarDays}>
                {!showSchedule ? (
                  <Button variant="secondary" onClick={() => setShowSchedule(true)}>Extend / postpone</Button>
                ) : (
                  <H4ScheduleForm request={r} onSaved={async () => { setShowSchedule(false); await onRefresh() }} />
                )}
              </DetailSection>
            )}

            {(creator || faculty || office) && !["Draft", "Rejected", "Cancelled"].includes(r.status) && (
              <Button variant="secondary" size="sm" loading={busy} onClick={() => save("resend")}>
                <Mail size={16} /> Resend links
              </Button>
            )}

            {!closed && (office || chief || (creator && !["Payment Submitted", "Payment Verified", "Rooms Assigned", "Checked In"].includes(r.status))) && (
              <DetailSection title="Cancel" icon={XCircle}>
                {!showCancel ? (
                  <Button variant="ghost" size="sm" onClick={() => setShowCancel(true)}>Cancel request</Button>
                ) : (
                  <VStack gap={3}>
                    <Field label="Reason" required>
                      <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                    </Field>
                    {(office || chief) && (
                      <Field label="Refund note">
                        <Textarea rows={2} value={refundNote} onChange={(e) => setRefund(e.target.value)} />
                      </Field>
                    )}
                    <Button
                      variant="danger"
                      disabled={busy || !reason.trim()}
                      onClick={saveConfirmed("cancel", { reason, refundNote }, { title: "Cancel this booking?", message: "The reservation is released. Payments stay recorded.", confirmText: "Cancel booking", isDestructive: true })}
                    >
                      Confirm
                    </Button>
                  </VStack>
                )}
              </DetailSection>
            )}
          </VStack>
        </Grid>
        <DetailSection title="Timeline" icon={CalendarDays}>
          <H4Timeline request={r} />
        </DetailSection>
      </VStack>
    </Modal>
  )
}
