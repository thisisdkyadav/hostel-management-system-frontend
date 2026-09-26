import { useEffect, useState } from "react"
import {
  Alert,
  Button,
  Field,
  Grid,
  HStack,
  IconButton,
  InfoRow,
  Input,
  Modal,
  Select,
  Text,
  Textarea,
  ToggleButtonGroup,
  VStack,
} from "hzero"
import { Plus, Trash2 } from "lucide-react"
import { accommodationApi } from "@/service"
import { PAYMENT_STATUS, STANDARD_CHECK_TIME } from "@/constants/accommodationStatus"
import { money } from "./AccommodationKit"

const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
]

const ROOM_PREFERENCE_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Double", label: "Double" },
]

const emptyGuest = () => ({ name: "", gender: "", age: "", relation: "", aadharNumber: "" })

const toYmd = (d) => {
  if (!d) return ""
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ""
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
}

const fromRequest = (request) => ({
  applicantPhone: request?.applicantPhone || "",
  applicantEmail: request?.applicantEmail || "",
  facultyAdvisorEmail: request?.facultyAdvisorEmail || "",
  permanentAddress: request?.permanentAddress || "",
  roomPreference: request?.roomPreference || "",
  stay: {
    fromDate: toYmd(request?.stay?.fromDate),
    toDate: toYmd(request?.stay?.toDate),
    checkInTime: request?.stay?.checkInTime || STANDARD_CHECK_TIME,
    checkOutTime: request?.stay?.checkOutTime || STANDARD_CHECK_TIME,
    purpose: request?.stay?.purpose || "",
  },
  guests: (request?.guests || []).map((g) => ({
    name: g.name || "",
    gender: g.gender || "",
    age: g.age === 0 || g.age ? String(g.age) : "",
    relation: g.relation || "",
    aadharNumber: g.aadharNumber || "",
  })),
  guestCharges: (request?.guests || []).map((_, i) => {
    const existing = request?.quote?.guestCharges?.find((c) => Number(c.guestIndex) === i)
    return {
      price: existing?.price != null && Number.isFinite(Number(existing.price)) ? String(existing.price) : "",
      gstPercentage: existing?.gstPercentage != null ? String(existing.gstPercentage) : "0",
    }
  }),
  extraAmount: "",
  extraLabel: "",
  remarks: "",
})

/**
 * Chief Warden Office edit form. Amount rules:
 *  - payment not yet requested: dates/info only
 *  - payment requested, student has not paid: open bill can be updated
 *  - student has paid: original bill is locked; extra amount opens a second payment
 */
const AccommodationOfficeEdit = ({
  open,
  request,
  onClose,
  onSaved,
  priceOptions = [],
  gstOptions = [],
}) => {
  const [form, setForm] = useState(() => fromRequest(request))
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(fromRequest(request))
    setError("")
  }, [open, request])

  if (!open || !request) return null

  const payment = request.payment || {}
  const paymentRequested =
    Number(payment.amount) > 0 ||
    ["Payment Requested", "Payment Deferred", "Payment Submitted", "Payment Verified"].includes(request.status)
  const paidLocked = [PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.VERIFIED].includes(payment.status)
  const canUpdateOpenBill = paymentRequested && !paidLocked
  const canAddExtra = paidLocked
  const roomsAssigned = Array.isArray(request.rooms) && request.rooms.length > 0
  const canChangeGuestCount = !roomsAssigned

  const setStay = (field, value) => setForm((prev) => ({ ...prev, stay: { ...prev.stay, [field]: value } }))
  const setGuest = (index, field, value) =>
    setForm((prev) => ({
      ...prev,
      guests: prev.guests.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    }))
  const addGuest = () =>
    setForm((prev) => ({
      ...prev,
      guests: [...prev.guests, emptyGuest()],
      guestCharges: [...prev.guestCharges, { price: "", gstPercentage: "0" }],
    }))
  const removeGuest = (index) =>
    setForm((prev) => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index),
      guestCharges: prev.guestCharges.filter((_, i) => i !== index),
    }))
  const setCharge = (index, patch) =>
    setForm((prev) => ({
      ...prev,
      guestCharges: prev.guestCharges.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }))

  const chargeTotal = form.guestCharges.reduce((sum, c) => {
    const price = Number(c.price) || 0
    const gst = Number(c.gstPercentage) || 0
    return sum + price + (price * gst) / 100
  }, 0)

  const save = async () => {
    setBusy(true)
    setError("")
    try {
      if (!form.stay.fromDate || !form.stay.toDate) throw new Error("Stay dates are required.")
      if (form.guests.length === 0) throw new Error("At least one guest is required.")
      for (const g of form.guests) {
        if (!g.name.trim() || !g.gender) throw new Error("Each guest needs a name and gender.")
        if (g.age === "" || g.age == null) throw new Error("Each guest needs an age.")
        if (!g.relation.trim()) throw new Error("Each guest needs a relation.")
        if (!/^\d{12}$/.test(String(g.aadharNumber || "").replace(/\s/g, ""))) {
          throw new Error("Each guest needs a 12-digit Aadhaar number.")
        }
      }

      const body = {
        stay: form.stay,
        guests: form.guests.map((g) => ({
          ...g,
          age: Number(g.age),
          aadharNumber: String(g.aadharNumber || "").replace(/\s/g, ""),
        })),
        roomPreference: form.roomPreference || undefined,
        permanentAddress: form.permanentAddress,
        applicantPhone: form.applicantPhone,
        applicantEmail: form.applicantEmail,
        facultyAdvisorEmail: form.facultyAdvisorEmail,
        remarks: form.remarks.trim() || undefined,
      }

      if (canUpdateOpenBill) {
        if (form.guestCharges.length !== form.guests.length) {
          throw new Error("Set price and GST for every guest.")
        }
        for (let i = 0; i < form.guestCharges.length; i++) {
          const raw = form.guestCharges[i].price
          if (raw === "" || raw == null || !Number.isFinite(Number(raw)) || Number(raw) < 0) {
            throw new Error(`Enter a price (0 or more) for ${form.guests[i]?.name || `guest ${i + 1}`}.`)
          }
        }
        body.guestCharges = form.guestCharges.map((c, i) => ({
          guestIndex: i,
          price: Number(c.price),
          gstPercentage: Number(c.gstPercentage),
        }))
      }

      if (canAddExtra && form.extraAmount !== "") {
        const extra = Number(form.extraAmount)
        if (!Number.isFinite(extra) || extra < 0) throw new Error("Extra amount is invalid.")
        if (extra > 0) {
          body.extraAmount = extra
          body.extraLabel = form.extraLabel.trim() || "Additional charge"
        }
      }

      await accommodationApi.officeEdit(request._id || request.id, body)
      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(err?.message || "Could not save the changes.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit request" width={720} closeButtonVariant="button">
      <VStack gap={4}>
        {error && <Alert type="error">{error}</Alert>}

        <Field label="Stay dates">
          <Grid cols={2} gap={2}>
            <Input type="date" value={form.stay.fromDate} onChange={(e) => setStay("fromDate", e.target.value)} />
            <Input type="date" value={form.stay.toDate} onChange={(e) => setStay("toDate", e.target.value)} />
          </Grid>
        </Field>
        <Grid cols={2} gap={2}>
          <Field label="Check-in time">
            <Input type="time" value={form.stay.checkInTime} onChange={(e) => setStay("checkInTime", e.target.value)} />
          </Field>
          <Field label="Check-out time">
            <Input type="time" value={form.stay.checkOutTime} onChange={(e) => setStay("checkOutTime", e.target.value)} />
          </Field>
        </Grid>
        <Field label="Purpose">
          <Input value={form.stay.purpose} onChange={(e) => setStay("purpose", e.target.value)} />
        </Field>
        <Field label="Room preference">
          <Select
            options={ROOM_PREFERENCE_OPTIONS}
            value={form.roomPreference}
            onChange={(e) => setForm((p) => ({ ...p, roomPreference: e.target.value }))}
          />
        </Field>
        <Field label="Permanent address">
          <Textarea
            rows={2}
            value={form.permanentAddress}
            onChange={(e) => setForm((p) => ({ ...p, permanentAddress: e.target.value }))}
          />
        </Field>
        <Grid cols={2} gap={2}>
          <Field label="Applicant phone">
            <Input value={form.applicantPhone} onChange={(e) => setForm((p) => ({ ...p, applicantPhone: e.target.value }))} />
          </Field>
          <Field label="Applicant email">
            <Input value={form.applicantEmail} onChange={(e) => setForm((p) => ({ ...p, applicantEmail: e.target.value }))} />
          </Field>
        </Grid>
        <Field label="Faculty advisor email">
          <Input
            value={form.facultyAdvisorEmail}
            onChange={(e) => setForm((p) => ({ ...p, facultyAdvisorEmail: e.target.value }))}
          />
        </Field>

        <VStack gap={2}>
          <HStack justify="between" align="center">
            <Text size="sm" weight="semibold">Guests</Text>
            {canChangeGuestCount && (
              <Button type="button" size="sm" variant="outline" onClick={addGuest}>
                <Plus size={14} /> Add guest
              </Button>
            )}
          </HStack>
          {form.guests.map((g, i) => (
            <VStack key={i} gap={2} style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-md)" }}>
              <HStack justify="between" align="center">
                <Text size="sm" weight="medium">Guest {i + 1}</Text>
                {canChangeGuestCount && form.guests.length > 1 && (
                  <IconButton icon={<Trash2 size={16} />} variant="ghost" size="small" ariaLabel="Remove guest" onClick={() => removeGuest(i)} />
                )}
              </HStack>
              <Input placeholder="Full name" value={g.name} onChange={(e) => setGuest(i, "name", e.target.value)} />
              <Grid cols={2} gap={2}>
                <Select placeholder="Gender" options={GENDERS} value={g.gender} onChange={(e) => setGuest(i, "gender", e.target.value)} />
                <Input
                  placeholder="Age"
                  inputMode="numeric"
                  value={g.age}
                  onChange={(e) => setGuest(i, "age", e.target.value.replace(/\D/g, "").slice(0, 3))}
                />
              </Grid>
              <Input placeholder="Relation" value={g.relation} onChange={(e) => setGuest(i, "relation", e.target.value)} />
              <Input
                placeholder="Aadhaar"
                inputMode="numeric"
                maxLength={12}
                value={g.aadharNumber}
                onChange={(e) => setGuest(i, "aadharNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
              />
            </VStack>
          ))}
        </VStack>

        {!paymentRequested && (
          <Text size="sm" color="muted">
            Charges are set when you send the payment request. Changing dates now does not create a bill.
          </Text>
        )}

        {canUpdateOpenBill && (
          <VStack gap={2}>
            <Text size="sm" weight="semibold">Open bill</Text>
            <Text size="sm" color="muted">
              The student has not paid yet. Updating these amounts replaces the current payment request.
            </Text>
            {form.guests.map((g, i) => {
              const line = form.guestCharges[i] || { price: "", gstPercentage: "0" }
              const priceNum = Number(line.price) || 0
              const gstNum = Number(line.gstPercentage) || 0
              const lineTotal = priceNum + (priceNum * gstNum) / 100
              const priceChoices = [...priceOptions.filter((p) => Number(p) !== 0), 0]
              const pricePreset = priceChoices.some((p) => String(p) === String(line.price)) ? String(line.price) : null
              const gstPreset = gstOptions.some((p) => String(p) === String(line.gstPercentage)) ? String(line.gstPercentage) : null
              return (
                <VStack key={i} gap={2} style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-md)" }}>
                  <Text size="sm" weight="medium">{g.name || `Guest ${i + 1}`}</Text>
                  <Field label="Price">
                    {priceChoices.length > 1 && (
                      <div style={{ marginBottom: "var(--spacing-2)" }}>
                        <ToggleButtonGroup
                          size="small"
                          options={priceChoices.map((p) => ({ value: String(p), label: Number(p) === 0 ? "₹0" : money(p) }))}
                          value={pricePreset}
                          onChange={(val) => setCharge(i, { price: String(val) })}
                        />
                      </div>
                    )}
                    <Input type="number" min={0} step="0.01" value={line.price} onChange={(e) => setCharge(i, { price: e.target.value })} />
                  </Field>
                  <Field label="GST %">
                    {gstOptions.length > 0 && (
                      <div style={{ marginBottom: "var(--spacing-2)" }}>
                        <ToggleButtonGroup
                          size="small"
                          options={gstOptions.map((p) => ({ value: String(p), label: `${p}%` }))}
                          value={gstPreset}
                          onChange={(val) => setCharge(i, { gstPercentage: String(val) })}
                        />
                      </div>
                    )}
                    <Input type="number" min={0} step="0.01" value={line.gstPercentage} onChange={(e) => setCharge(i, { gstPercentage: e.target.value })} />
                  </Field>
                  <InfoRow label="Line total" value={money(lineTotal)} />
                </VStack>
              )
            })}
            <InfoRow label="Updated total" value={money(chargeTotal)} strong />
          </VStack>
        )}

        {canAddExtra && (
          <VStack gap={2}>
            <Text size="sm" weight="semibold">Additional payment</Text>
            <Text size="sm" color="muted">
              The original payment of {money(payment.amount)} is locked. Enter an extra amount to request a second payment — leave blank to only update stay details.
            </Text>
            <Field label="Extra amount">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.extraAmount}
                placeholder="0"
                onChange={(e) => setForm((p) => ({ ...p, extraAmount: e.target.value }))}
              />
            </Field>
            <Field label="Label (optional)">
              <Input
                value={form.extraLabel}
                placeholder="e.g. Extra nights"
                onChange={(e) => setForm((p) => ({ ...p, extraLabel: e.target.value }))}
              />
            </Field>
          </VStack>
        )}

        <Field label="Remarks (optional)">
          <Textarea rows={2} value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} />
        </Field>

        <HStack gap={2} justify="end">
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={save} loading={busy} disabled={busy}>Save changes</Button>
        </HStack>
      </VStack>
    </Modal>
  )
}

export default AccommodationOfficeEdit
