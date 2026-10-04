import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  DetailSection,
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
} from "hzero"
import {
  BedDouble,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Download,
  ExternalLink,
  Mail,
  Pencil,
  User,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import { h4Api, h4FileUrl } from "@/service/modules/intern-accommodation.api"
import { H4Journey, H4Status, H4StayDetails } from "./H4Kit"
import { date, money } from "./h4.format"
import H4RoomCheck from "./H4RoomCheck"
import H4PaymentForm from "./H4PaymentForm"
import H4ScheduleForm from "./H4ScheduleForm"

function OfferForm({ request, options, save, busy }) {
  const [hostelId, setHostel] = useState("")
  const [mess, setMess] = useState("without")
  const [price, setPrice] = useState("")
  const [gstPercentage, setGst] = useState("0")
  const [remarks, setRemarks] = useState("")
  const [paymentLink, setPaymentLink] = useState("")
  const [reason, setReason] = useState("")
  const total = Number(price || 0) * (1 + Number(gstPercentage || 0) / 100)
  return (
    <VStack gap={3}>
      <Field label="Allotted hostel" required>
        <Select
          value={hostelId}
          placeholder="Select hostel"
          options={options.hostels.map((h) => ({ value: String(h._id), label: h.name }))}
          onChange={(e) => setHostel(e.target.value)}
        />
      </Field>
      <Grid columns={2} gap={3}>
        <Field label="Accommodation charge for entire stay" required>
          <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="GST %" required>
          <Input type="number" min="0" max="100" value={gstPercentage} onChange={(e) => setGst(e.target.value)} />
        </Field>
      </Grid>
      <Field label="Mess option">
        <Select
          value={mess}
          options={[
            { value: "without", label: "Without mess" },
            { value: "with", label: "With mess" },
          ]}
          onChange={(e) => setMess(e.target.value)}
        />
      </Field>
      <Text size="sm">
        Total: <strong>{money(total)}</strong> · Payer: {request.h4.payer.name}
      </Text>
      {price !== "" && Number(price) === 0 && (
        <Field label="Waiver reason" required>
          <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      )}
      <Field label="Instructions for intern / payer">
        <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </Field>
      <Field label="Payment portal URL (optional)">
        <Input
          type="url"
          value={paymentLink}
          onChange={(e) => setPaymentLink(e.target.value)}
          placeholder="https://…"
        />
      </Field>
      <Text size="xs" color="muted">
        Food charges are invoiced separately.
      </Text>
      <Button
        disabled={busy || !hostelId || price === ""}
        loading={busy}
        onClick={() => save("offer", { hostelId, mess, price, gstPercentage, remarks, reason, paymentLink })}
      >
        Issue charges & send details
      </Button>
    </VStack>
  )
}

export default function H4Detail({ request: r, options, onClose, onRefresh, onEdit }) {
  const { user } = useAuth()
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
  const [showHistory, setShowHistory] = useState(false)
  const office = options.role === "Admin" && options.subRole === "Chief Warden Office"
  const chief = options.role === "Admin" && options.subRole === "Chief Warden"
  const accounts = options.role === "Admin" && options.subRole === "Accountant"
  const creator = String(r.requesterUserId) === String(user._id || user.id)
  const faculty = options.canRecommend && String(r.h4.facultyUserId) === String(user._id || user.id)
  const closed = ["Rejected", "Cancelled", "Checked Out", "Invoiced"].includes(r.status)
  const reviewStage = r.h4.amendment?.stage || r.currentStage
  const availability = useQuery({
    queryKey: ["h4", "availability", r._id, r.h4.revision],
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
  const approvedStages = [
    "CW Approved",
    "Payment Requested",
    "Payment Deferred",
    "Payment Submitted",
    "Payment Verified",
    "Rooms Assigned",
    "Checked In",
  ]
  const canSchedule =
    !closed &&
    !amendment &&
    [
      "Payment Requested",
      "Payment Deferred",
      "Payment Submitted",
      "Payment Verified",
      "Rooms Assigned",
      "Checked In",
    ].includes(r.status) &&
    (creator || faculty || office)
  const payments = [{ ...r.payment, label: "Accommodation", _id: "main" }, ...r.additionalPayments]
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
      await h4Api.action(r._id, suffix, { revision: r.h4.revision, ...body })
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
  const editAllowed =
    ((creator && ["Draft", "Returned to Student"].includes(r.status)) || (office && !r.allotment?.hostelId)) && !closed
  return (
    <Modal
      isOpen
      onClose={busy ? undefined : onClose}
      title={r.applicantName || "Draft student"}
      width={1120}
      closeButtonVariant="button"
    >
      <VStack gap={4}>
        <HStack justify="between" wrap gap={2}>
          <H4Status request={r} />
          <Text size="xs" color="muted">
            H4 · #{r._id.slice(-6).toUpperCase()} · {r.h4.batchLabel}
          </Text>
        </HStack>
        <H4Journey request={r} />
        {error && <Alert tone="danger">{error}</Alert>}
        {r.h4.lastNotificationError && <Alert tone="warning">{r.h4.lastNotificationError}</Alert>}
        {amendment && (
          <Alert tone="info">
            Date change requested: {date(amendment.requestedFromDate)} – {date(amendment.requestedToDate)}. Current stay
            remains effective until approval.
          </Alert>
        )}
        <div className="h4-detail-grid">
          <VStack gap={4}>
            <DetailSection
              title="Student"
              icon={User}
              actions={
                editAllowed && (
                  <Button size="sm" variant="ghost" onClick={() => onEdit(r)}>
                    <Pencil size={14} /> Edit
                  </Button>
                )
              }
            >
              <Grid columns={2} gap={3}>
                <InfoRow label="Email" value={r.applicantEmail} />
                <InfoRow label="Mobile" value={r.applicantPhone} />
                <InfoRow label="Institute / organisation" value={r.h4.institute} />
                <InfoRow label="Institute address" value={r.h4.instituteAddress} />
                <InfoRow label="Course" value={r.h4.course} />
                <InfoRow label="Department" value={r.h4.department} />
                <InfoRow label="Faculty" value={r.h4.facultyName} />
                <InfoRow label="Created by" value={r.h4.creatorName} />
              </Grid>
            </DetailSection>
            <DetailSection title="Stay" icon={CalendarDays}>
              <VStack gap={3}>
                <H4StayDetails request={r} />
                <InfoRow label="Purpose" value={r.stay.purpose} />
                <Text size="xs" color="muted">
                  Food charges are handled outside this portal.
                </Text>
                {r.h4.cancellation?.reason && (
                  <Alert tone="warning">
                    Cancelled: {r.h4.cancellation.reason}
                    {r.h4.cancellation.refundNote && ` · Accounts note: ${r.h4.cancellation.refundNote}`}
                  </Alert>
                )}
              </VStack>
            </DetailSection>
            <DetailSection title="Accommodation payments" icon={CreditCard}>
              <VStack gap={3}>
                {payments.map((p) => (
                  <Surface key={p._id} bg="secondary" padding={3} radius="md">
                    <VStack gap={2}>
                      <HStack justify="between" wrap>
                        <Text weight="semibold">
                          {p.label} · {money(p.amount)}
                        </Text>
                        <Badge>{p.status}</Badge>
                      </HStack>
                      {p.utr && (
                        <Text size="xs" color="muted">
                          Reference: {p.utr} · {date(p.paidAt)}
                        </Text>
                      )}
                      {p.note && <Text size="xs">{p.note}</Text>}
                      {p.screenshotFileRef && (accounts || office || creator || faculty) && (
                        <a
                          href={h4FileUrl(r._id, "proof", p._id !== "main" ? { additionalPaymentId: p._id } : {})}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <HStack gap={1}>
                            <ExternalLink size={14} />
                            <Text size="sm">View proof</Text>
                          </HStack>
                        </a>
                      )}
                      {accounts && !["Cancelled", "Invoiced"].includes(r.status) && p.amount > 0 && (
                        <HStack gap={2} wrap>
                          {p.status === "Submitted" && (
                            <>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() =>
                                  save("verify", {
                                    action: "verify",
                                    additionalPaymentId: p._id === "main" ? undefined : p._id,
                                  })
                                }
                              >
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busy || !reason.trim()}
                                onClick={() =>
                                  save("verify", {
                                    action: "reject",
                                    reason,
                                    additionalPaymentId: p._id === "main" ? undefined : p._id,
                                  })
                                }
                              >
                                Reject proof
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setManual(p)
                              setReason("")
                            }}
                          >
                            Accounts correction
                          </Button>
                        </HStack>
                      )}
                    </VStack>
                  </Surface>
                ))}
                {r.invoice?.generatedAt && (
                  <HStack gap={2} wrap>
                    <Text size="sm" weight="semibold">
                      {r.invoice.number}
                    </Text>
                    <a href={h4FileUrl(r._id)} target="_blank" rel="noreferrer">
                      <HStack gap={1}>
                        <ExternalLink size={14} />
                        <Text size="sm">View invoice</Text>
                      </HStack>
                    </a>
                    <a href={h4FileUrl(r._id, "invoice", { disposition: "attachment" })}>
                      <Download size={16} /> Download
                    </a>
                  </HStack>
                )}
              </VStack>
            </DetailSection>
            <DetailSection title="History" icon={ClipboardCheck}>
              <VStack gap={2}>
                {(showHistory ? r.timeline : r.timeline.slice(-5))
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <div key={i}>
                      <Text size="sm">{entry.note || entry.status}</Text>
                      <Text size="xs" color="muted">
                        {new Date(entry.at).toLocaleString("en-IN")}
                      </Text>
                    </div>
                  ))}
                {r.timeline.length > 5 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? "Show recent" : `Show all ${r.timeline.length} events`}
                  </Button>
                )}
                {r.h4.roomHistory.length > 0 && (
                  <details>
                    <summary>Room override records</summary>
                    <VStack gap={2}>
                      {r.h4.roomHistory.map((h, i) => (
                        <Surface key={i} bg="secondary" padding={2} radius="md">
                          <Text size="sm">{h.reason || "No conflicts recorded"}</Text>
                          <Text size="xs" color="muted">
                            {date(h.at)} · {h.warnings.length} warning(s)
                          </Text>
                          {h.warnings.map((w, j) => (
                            <Text key={j} size="xs">
                              {w.name} · {w.message}
                            </Text>
                          ))}
                        </Surface>
                      ))}
                    </VStack>
                  </details>
                )}
              </VStack>
            </DetailSection>
          </VStack>
          <VStack gap={4}>
            {office && reviewStage === "office" && (
              <DetailSection title="Availability overview" icon={BedDouble}>
                <VStack gap={3}>
                  {availability.isLoading && <Text size="sm">Checking recorded commitments…</Text>}
                  {availability.error && <Alert tone="danger">{availability.error.message}</Alert>}
                  {(availability.data?.data?.hostels || []).map((h) => (
                    <Surface key={h._id} bg="secondary" padding={2} radius="md">
                      <Text size="sm" weight="semibold">
                        {h.name}
                      </Text>
                      <Text size="xs" color="muted">
                        {h.rooms} rooms · {h.residentAssignedRooms} resident-assigned · {h.emptyGuestRooms} free guest
                        rooms · {h.h4Reservations} H4 reservations
                      </Text>
                    </Surface>
                  ))}
                  <Text size="xs" color="muted">
                    Resident allocations do not confirm presence. H4 can use occupied rooms after a supervisor checks
                    and acknowledges conflicts.
                  </Text>
                </VStack>
              </DetailSection>
            )}
            {canReview && (
              <DetailSection title={amendment ? "Review date change" : "Review request"} icon={ClipboardCheck}>
                <VStack gap={3}>
                  {reviewStage === "faculty" && (
                    <>
                      <Surface bg="secondary" padding={3} radius="md">
                        <Text size="sm">
                          Accommodation payer: <strong>{r.h4.payer.name}</strong>
                        </Text>
                        <Text size="xs" color="muted">
                          {r.h4.payer.email}
                        </Text>
                      </Surface>
                      <Checkbox
                        checked={confirmPayer}
                        onChange={(e) => setConfirmPayer(e.target.checked)}
                        label="I recommend this stay and confirm the designated payer"
                      />
                    </>
                  )}
                  {reviewStage === "office" && (
                    <>
                      <Text size="sm" color="muted">
                        Check actual hostel space and resident absence before recommending.
                      </Text>
                      <Checkbox
                        checked={confirmAvailability}
                        onChange={(e) => setConfirmAvailability(e.target.checked)}
                        label="I have checked accommodation availability"
                      />
                      {amendment && (
                        <Field label="Additional accommodation charge">
                          <Input type="number" min="0" value={extraAmount} onChange={(e) => setExtra(e.target.value)} />
                        </Field>
                      )}
                    </>
                  )}
                  {amendment && reviewStage === "chief" && r.room && (
                    <H4RoomCheck key={`${r._id}:${r.h4.revision}`} request={r} amendment onReady={setRoomApproval} />
                  )}
                  {amendment && <Text size="sm">{amendment.reason}</Text>}
                  {amendment && reviewStage === "chief" && (
                    <Text size="sm">Additional accommodation charge: {money(r.h4.amendment.extraAmount)}</Text>
                  )}
                  <Field label="Decision note">
                    <Textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Required for return or rejection"
                    />
                  </Field>
                  <Button
                    disabled={
                      busy ||
                      (reviewStage === "faculty" && !confirmPayer) ||
                      (reviewStage === "office" && !confirmAvailability) ||
                      (amendment && reviewStage === "chief" && r.room && !roomApproval)
                    }
                    loading={busy}
                    onClick={() =>
                      save(`decision/${reviewStage}`, {
                        action: "approve",
                        reason,
                        confirmPayer,
                        confirmAvailability,
                        extraAmount,
                        ...roomApproval,
                      })
                    }
                  >
                    {reviewStage === "chief" ? "Approve" : "Recommend"}
                  </Button>
                  <HStack gap={2} wrap>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy || !reason.trim()}
                      onClick={() => save(`decision/${reviewStage}`, { action: "request_modification", reason })}
                    >
                      Return
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busy || !reason.trim()}
                      onClick={() => save(`decision/${reviewStage}`, { action: "reject", reason })}
                    >
                      Reject
                    </Button>
                  </HStack>
                </VStack>
              </DetailSection>
            )}
            {office && r.status === "CW Approved" && (
              <DetailSection title="Hostel & charges" icon={CreditCard}>
                <OfferForm request={r} options={options} save={save} busy={busy} />
              </DetailSection>
            )}
            {proofOpen && !amendment && (creator || (faculty && r.h4.payer.type === "faculty")) && (
              <DetailSection title="Submit payment" icon={CreditCard}>
                <H4PaymentForm request={r} onSaved={onRefresh} />
              </DetailSection>
            )}
            {accounts && (
              <DetailSection title="Accounts" icon={CreditCard}>
                <VStack gap={3}>
                  <Field label="Verification / correction note">
                    <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                  {manual && (
                    <>
                      <Text size="sm">
                        {manual.label} · {money(manual.amount)}
                      </Text>
                      <Field label="Bank / receipt reference">
                        <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                      </Field>
                      <Field label="Payment date">
                        <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                      </Field>
                      <HStack gap={2} wrap>
                        <Button
                          size="sm"
                          disabled={busy || !reason || !reference || !paidAt}
                          onClick={() =>
                            save("settle", {
                              action: "mark_paid",
                              reference,
                              paidAt,
                              reason,
                              additionalPaymentId: manual._id === "main" ? undefined : manual._id,
                            })
                          }
                        >
                          Record paid
                        </Button>
                        {["Submitted", "Verified"].includes(manual.status) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy || !reason || !reference || !paidAt}
                            onClick={() =>
                              save("settle", {
                                action: "correct",
                                reference,
                                paidAt,
                                reason,
                                additionalPaymentId: manual._id === "main" ? undefined : manual._id,
                              })
                            }
                          >
                            Correct details
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy || !reason}
                          onClick={() =>
                            save("settle", {
                              action: "mark_unpaid",
                              reason,
                              additionalPaymentId: manual._id === "main" ? undefined : manual._id,
                            })
                          }
                        >
                          Mark unpaid
                        </Button>
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
            {["Hostel Supervisor", "Hostel Gate"].includes(options.role) &&
              ["Rooms Assigned", "Checked In"].includes(r.status) && (
                <DetailSection title="Arrival & departure" icon={CalendarDays}>
                  <HStack gap={2} wrap>
                    {r.status === "Rooms Assigned" && (
                      <Button disabled={busy} onClick={() => save("checkin")}>
                        Check in
                      </Button>
                    )}
                    <Button variant="secondary" disabled={busy} onClick={() => save("checkout")}>
                      Close stay & release room
                    </Button>
                  </HStack>
                </DetailSection>
              )}
            {(canSchedule || showSchedule) && (
              <DetailSection title="Change dates" icon={CalendarDays}>
                <VStack gap={3}>
                  {!showSchedule ? (
                    <Button variant="secondary" onClick={() => setShowSchedule(true)}>
                      Extend / postpone
                    </Button>
                  ) : (
                    <>
                      <Text size="xs" color="muted">
                        Faculty, office and Chief Warden review the new dates. Current room remains reserved.
                      </Text>
                      <H4ScheduleForm
                        request={r}
                        onSaved={async () => {
                          setShowSchedule(false)
                          await onRefresh()
                        }}
                      />
                    </>
                  )}
                </VStack>
              </DetailSection>
            )}
            {(creator || faculty || office) && !["Draft", "Rejected", "Cancelled"].includes(r.status) && (
              <Button variant="secondary" size="sm" loading={busy} onClick={() => save("resend")}>
                <Mail size={16} /> Resend notifications & links
              </Button>
            )}
            {!closed && (office || chief || (creator && !approvedStages.slice(1).includes(r.status))) && (
              <VStack gap={3}>
                <Button variant="ghost" size="sm" onClick={() => setShowCancel(!showCancel)}>
                  <XCircle size={16} /> Cancel request
                </Button>
                {showCancel && (
                  <Surface bg="secondary" padding={3} radius="md">
                    <VStack gap={3}>
                      <Field label="Cancellation reason" required>
                        <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                      </Field>
                      {(office || chief) && (
                        <Field label="Accounts / refund note">
                          <Textarea rows={2} value={refundNote} onChange={(e) => setRefund(e.target.value)} />
                        </Field>
                      )}
                      <Text size="xs" color="muted">
                        The H4 reservation is released. Payments stay recorded; refunds are handled by accounts.
                      </Text>
                      <Button
                        variant="danger"
                        disabled={busy || !reason.trim()}
                        onClick={() => save("cancel", { reason, refundNote })}
                      >
                        Confirm cancellation
                      </Button>
                    </VStack>
                  </Surface>
                )}
              </VStack>
            )}
          </VStack>
        </div>
      </VStack>
    </Modal>
  )
}
