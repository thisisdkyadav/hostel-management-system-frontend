import { useEffect, useState } from "react"
import { Alert, Button, Field, Grid, Input, Spinner, Text, VStack, useToast } from "hzero"
import { adminApi } from "@/service"

const defaults = { accommodationPaymentLink: "", messPaymentLink: "", gstPercentage: 0, accommodationDailyRate: 0, messDailyRate: 0 }
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
      const value = { ...defaults, ...r.value }
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
      const r = await adminApi.updateInternAccommodationSettings(form)
      setForm(r.configuration.value)
      setSaved(r.configuration.value)
      toast.success("Intern accommodation settings saved")
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  if (busy && !saved) return <Spinner />
  return (
    <VStack gap={4}>
      {error && <Alert type="error">{error}</Alert>}
      <Grid cols={{ base: 1, lg: 2 }} gap={3}>
        <Field label="Accommodation payment link">
          <Input value={form.accommodationPaymentLink} onChange={(e) => update("accommodationPaymentLink", e.target.value)} placeholder="https://…" disabled={busy} />
        </Field>
        <Field label="Mess payment link">
          <Input value={form.messPaymentLink} onChange={(e) => update("messPaymentLink", e.target.value)} placeholder="https://…" disabled={busy} />
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
      <Text size="sm" color="muted">Arrival to departure, excluding departure day. Office can change daily rates or totals when sending charges. Saved settings apply to new charges; existing bills keep their amounts.</Text>
      <Button loading={busy} disabled={busy || !saved || JSON.stringify(form) === JSON.stringify(saved)} onClick={save}>Save changes</Button>
    </VStack>
  )
}
