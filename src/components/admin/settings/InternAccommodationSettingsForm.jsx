import { useEffect, useState } from "react"
import { Alert, Button, Field, Grid, Input, Spinner, Text, Textarea, VStack, useToast } from "hzero"
import { adminApi } from "@/service"

const defaults = {
  paymentLink: "", gstPercentage: 0, accommodationDailyRate: 0, messDailyRate: 0,
  // Student letter wording. Facilities are edited one per line.
  occupancy: "double occupancy",
  roomFacilities: "One Bed\nOne Table\nOne Chair\nOne Mattress\nOne Almirah",
  contactEmail: "", contactPhone: "",
}
// Older saves kept two links; the student now pays one combined bill.
const fromSaved = (value = {}) => {
  const out = { ...defaults }
  for (const key of Object.keys(defaults)) if (value[key] != null) out[key] = value[key]
  if (value.paymentLink == null && value.accommodationPaymentLink) out.paymentLink = value.accommodationPaymentLink
  if (Array.isArray(value.roomFacilities)) out.roomFacilities = value.roomFacilities.join("\n")
  return out
}
export default function InternAccommodationSettingsForm() {
  const [form, setForm] = useState(defaults)
  const [saved, setSaved] = useState(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()
  useEffect(() => {
    let active = true
    adminApi.getInternAccommodationSettings().then((r) => {
      if (!active) return
      const value = fromSaved(r.value)
      setForm(value)
      setSaved(value)
    }).catch((e) => { if (active) setError(e.message) }).finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [])
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const save = async () => {
    setBusy(true)
    setError("")
    try {
      const r = await adminApi.updateInternAccommodationSettings({
        ...form,
        roomFacilities: form.roomFacilities.split("\n").map((f) => f.trim()).filter(Boolean),
      })
      setForm(fromSaved(r.configuration.value))
      setSaved(fromSaved(r.configuration.value))
      toast.success("Intern accommodation settings saved")
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  if (busy && !saved) return <Spinner />
  return (
    <VStack gap={4}>
      {error && <Alert type="error">{error}</Alert>}
      <Grid cols={{ base: 1, lg: 2 }} gap={3}>
        <Field label="Payment link (accommodation and mess)">
          <Input value={form.paymentLink} onChange={(e) => update("paymentLink", e.target.value)} placeholder="https://…" disabled={busy} />
        </Field>
        <Field label="Accommodation / day (₹)">
          <Input type="number" min="0" max="10000000" step="0.01" value={form.accommodationDailyRate} onChange={(e) => update("accommodationDailyRate", e.target.value)} disabled={busy} />
        </Field>
        <Field label="Mess / day (₹)">
          <Input type="number" min="0" max="10000000" step="0.01" value={form.messDailyRate} onChange={(e) => update("messDailyRate", e.target.value)} disabled={busy} />
        </Field>
        <Field label="Accommodation GST %">
          <Input type="number" min="0" max="100" step="0.01" value={form.gstPercentage} onChange={(e) => update("gstPercentage", e.target.value)} disabled={busy} />
        </Field>
      </Grid>
      <Text size="sm" weight="semibold">Student letters</Text>
      <Grid cols={{ base: 1, lg: 2 }} gap={3}>
        <Field label="Occupancy">
          <Input value={form.occupancy} onChange={(e) => update("occupancy", e.target.value)} placeholder="double occupancy" disabled={busy} />
        </Field>
        <Field label="Room facilities (one per line)">
          <Textarea rows={5} value={form.roomFacilities} onChange={(e) => update("roomFacilities", e.target.value)} disabled={busy} />
        </Field>
        <Field label="Chief Warden Office email">
          <Input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="Students' replies go here" disabled={busy} />
        </Field>
        <Field label="Chief Warden Office phone">
          <Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} disabled={busy} />
        </Field>
      </Grid>
      <Text size="sm" color="muted">The charges letter reads: accommodation approved in the hostel "on a {form.occupancy || "double occupancy"} basis", followed by the facilities list. Every student letter gives this email and phone as the contact, and replies to the letter go to the email.</Text>
      <Text size="sm" color="muted">Arrival to departure, excluding departure day. Office can change daily rates or totals when sending charges. The student pays accommodation (with GST) and mess together in one payment. Saved settings apply to new charges; existing bills keep their amounts.</Text>
      <Button loading={busy} disabled={busy || !saved || JSON.stringify(form) === JSON.stringify(saved)} onClick={save}>Save changes</Button>
    </VStack>
  )
}
