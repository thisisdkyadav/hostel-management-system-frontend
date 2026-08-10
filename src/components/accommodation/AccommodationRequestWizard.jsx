import { useState, useEffect, useCallback } from "react"
import { Button, DatePicker, Field, Grid, HStack, IconButton, Input, Label, Modal, Select, StepIndicator, Surface, Text, Textarea, VStack } from "hzero"
import { Plus, Trash2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthProvider"
import { accommodationApi, studentApi } from "@/service"
import { extensionHours, STANDARD_CHECK_TIME } from "@/constants/accommodationStatus"
import { ChargesRows } from "./AccommodationKit"

const MIN_LEAD_WORKING_DAYS = 2
const pad2 = (n) => String(n).padStart(2, "0")
const toYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
// Add n working days (skip Sat/Sun) to today; used for the minimum stay start.
const addWorkingDays = (start, n) => {
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  let added = 0
  while (added < n) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return d
}

const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
]

const STEPS = [
  { id: "guests", label: "Guests" },
  { id: "stay", label: "Stay & Details" },
  { id: "review", label: "Review" },
]

const emptyGuest = () => ({ name: "", gender: "", relation: "", aadharNumber: "" })

const emptyStay = () => ({
  fromDate: "",
  toDate: "",
  checkInTime: STANDARD_CHECK_TIME,
  checkOutTime: STANDARD_CHECK_TIME,
  purpose: "",
})

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

const toDateInput = (d) => {
  if (!d) return ""
  try {
    return new Date(d).toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

const AccommodationRequestWizard = ({ open, onClose, onSubmitted, existingRequest = null }) => {
  const { user } = useAuth()
  const isResubmit = Boolean(existingRequest)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    applicantPhone: "",
    guests: [emptyGuest()],
    stay: emptyStay(),
    permanentAddress: "",
    facultyAdvisorEmail: "",
  })
  const [quote, setQuote] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [profileFA, setProfileFA] = useState("") // faculty advisor email from the student's profile

  const earliestStart = toYmd(addWorkingDays(new Date(), MIN_LEAD_WORKING_DAYS))

  // Load the faculty advisor already on the student's profile; if present we show
  // it read-only instead of letting the student type one.
  useEffect(() => {
    if (!open) return
    let active = true
    studentApi
      .getStudent()
      .then((profile) => { if (active) setProfileFA(profile?.facultyAdvisorEmail || "") })
      .catch(() => { if (active) setProfileFA("") })
    return () => { active = false }
  }, [open])

  useEffect(() => {
    if (!open) return
    setStep(0)
    setError("")
    setQuote(null)
    if (existingRequest) {
      setForm({
        applicantPhone: existingRequest.applicantPhone || user?.phone || "",
        guests: (existingRequest.guests || []).map((g) => ({
          name: g.name || "",
          gender: g.gender || "",
          relation: g.relation || "",
          aadharNumber: g.aadharNumber || "",
        })) || [emptyGuest()],
        stay: {
          fromDate: toDateInput(existingRequest.stay?.fromDate),
          toDate: toDateInput(existingRequest.stay?.toDate),
          checkInTime: existingRequest.stay?.checkInTime || STANDARD_CHECK_TIME,
          checkOutTime: existingRequest.stay?.checkOutTime || STANDARD_CHECK_TIME,
          purpose: existingRequest.stay?.purpose || "",
        },
        permanentAddress: existingRequest.permanentAddress || "",
        facultyAdvisorEmail: existingRequest.facultyAdvisorEmail || "",
      })
    } else {
      setForm({
        applicantPhone: user?.phone || "",
        guests: [emptyGuest()],
        stay: emptyStay(),
        permanentAddress: "",
        facultyAdvisorEmail: "",
      })
    }
  }, [open, existingRequest, user])

  const setGuest = (index, field, value) => {
    setForm((prev) => {
      const guests = prev.guests.map((g, i) => (i === index ? { ...g, [field]: value } : g))
      return { ...prev, guests }
    })
  }
  const addGuest = () => setForm((prev) => ({ ...prev, guests: [...prev.guests, emptyGuest()] }))
  const removeGuest = (index) =>
    setForm((prev) => ({ ...prev, guests: prev.guests.filter((_, i) => i !== index) }))

  const setStay = (field, value) =>
    setForm((prev) => ({ ...prev, stay: { ...prev.stay, [field]: value } }))

  // Hours outside the standard 11:00 window, described for the student.
  const { earlyCheckInHours, lateCheckOutHours } = extensionHours(form.stay.checkInTime, form.stay.checkOutTime)
  const extensionSummary = [
    earlyCheckInHours > 0 ? `${earlyCheckInHours}h early check-in` : null,
    lateCheckOutHours > 0 ? `${lateCheckOutHours}h late check-out` : null,
  ].filter(Boolean).join(" · ")

  const fetchQuote = useCallback(async () => {
    setLoadingQuote(true)
    try {
      const res = await accommodationApi.previewQuote({ guests: form.guests, stay: form.stay })
      setQuote(res?.data || null)
    } catch {
      setQuote(null)
    } finally {
      setLoadingQuote(false)
    }
  }, [form.guests, form.stay])

  useEffect(() => {
    if (open && step === 2) fetchQuote()
  }, [open, step, fetchQuote])

  const validateStep = () => {
    if (step === 0) {
      if (form.guests.length === 0) return "Add at least one guest"
      for (const g of form.guests) {
        if (!g.name.trim() || !g.gender) return "Every guest needs a name and gender"
        if (!g.relation.trim()) return "Every guest needs a relation to you"
        if (!/^\d{12}$/.test(String(g.aadharNumber || "").trim())) return "Every guest needs a valid 12-digit Aadhaar number"
      }
    }
    if (step === 1) {
      if (!form.stay.fromDate || !form.stay.toDate) return "Stay start and end dates are required"
      if (form.stay.fromDate < earliestStart) return `The earliest start date is ${earliestStart} (at least ${MIN_LEAD_WORKING_DAYS} working days from today)`
      if (new Date(form.stay.toDate) <= new Date(form.stay.fromDate)) return "End date must be after start date"
      if (!TIME_RE.test(form.stay.checkInTime)) return "Enter a valid check-in time"
      if (!TIME_RE.test(form.stay.checkOutTime)) return "Enter a valid check-out time"
      if (!form.stay.purpose.trim()) return "Purpose of visit is required"
    }
    return ""
  }

  const next = () => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setError("")
    setStep((s) => Math.min(2, s + 1))
  }
  const back = () => {
    setError("")
    setStep((s) => Math.max(0, s - 1))
  }

  const submit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const body = {
        applicantPhone: form.applicantPhone,
        guests: form.guests,
        stay: form.stay,
        permanentAddress: form.permanentAddress,
        facultyAdvisorEmail: form.facultyAdvisorEmail || undefined,
      }
      if (isResubmit) {
        await accommodationApi.resubmitRequest(existingRequest._id || existingRequest.id, body)
      } else {
        await accommodationApi.submitRequest(body)
      }
      onSubmitted?.()
      onClose?.()
    } catch (err) {
      setError(err?.message || "Could not submit the request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <Button variant="ghost" onClick={step === 0 ? onClose : back} disabled={submitting}>
        {step === 0 ? "Cancel" : "Back"}
      </Button>
      {step < 2 ? (
        <Button onClick={next}>Next</Button>
      ) : (
        <Button onClick={submit} loading={submitting} disabled={submitting}>
          {isResubmit ? "Resubmit" : "Submit Request"}
        </Button>
      )}
    </div>
  )

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isResubmit ? "Resubmit Accommodation Request" : "New Accommodation Request"}
      width={680}
      footer={footer}
    >
      <VStack gap={5}>
        <StepIndicator steps={STEPS} currentStep={STEPS[step].id} />

        {error && (
          <Surface bg="danger" padding={3} radius="md" color="danger-text" size="sm">
            {error}
          </Surface>
        )}

        {step === 0 && (
          <VStack gap={4}>
            <Field label="Your contact number" htmlFor="applicantPhone">
              <Input name="applicantPhone" value={form.applicantPhone} onChange={(e) => setForm((p) => ({ ...p, applicantPhone: e.target.value }))} placeholder="Phone number" />
            </Field>
            {form.guests.map((g, i) => (
              <div key={i} style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <HStack gap="none" align="center" justify="between">
                  <Text as="span" size="sm" weight="medium">Guest {i + 1}</Text>
                  {form.guests.length > 1 && (
                    <IconButton icon={<Trash2 size={16} />} variant="ghost" size="small" ariaLabel="Remove guest" onClick={() => removeGuest(i)} />
                  )}
                </HStack>
                <Grid cols={2} gap={2}>
                  <Input placeholder="Full name *" value={g.name} onChange={(e) => setGuest(i, "name", e.target.value)} />
                  <Select placeholder="Gender *" options={GENDERS} value={g.gender} onChange={(e) => setGuest(i, "gender", e.target.value)} />
                  <Input placeholder="Relation to you *" value={g.relation} onChange={(e) => setGuest(i, "relation", e.target.value)} />
                  <Input placeholder="Aadhaar number *" inputMode="numeric" maxLength={12} value={g.aadharNumber} onChange={(e) => setGuest(i, "aadharNumber", e.target.value.replace(/\D/g, "").slice(0, 12))} />
                </Grid>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addGuest}><Plus size={16} /> Add guest</Button>
          </VStack>
        )}

        {step === 1 && (
          <VStack gap={4}>
            <Grid cols={2} gap={3}>
              <Field label="Check-in date" required>
                <DatePicker name="fromDate" value={form.stay.fromDate} min={earliestStart} onChange={(e) => setStay("fromDate", e.target.value)} />
              </Field>
              <Field label="Check-in time" required>
                <Input type="time" value={form.stay.checkInTime} onChange={(e) => setStay("checkInTime", e.target.value)} />
              </Field>
              <Field label="Check-out date" required>
                <DatePicker name="toDate" value={form.stay.toDate} min={form.stay.fromDate || earliestStart} onChange={(e) => setStay("toDate", e.target.value)} />
              </Field>
              <Field label="Check-out time" required>
                <Input type="time" value={form.stay.checkOutTime} onChange={(e) => setStay("checkOutTime", e.target.value)} />
              </Field>
            </Grid>

            <Surface bg="secondary" padding={3} radius="md" size="xs" color="muted">
              A guest day runs <strong>11:00 AM to 11:00 AM</strong>. {extensionSummary
                ? <>You are requesting <strong>{extensionSummary}</strong> — the extra hours are free, but the hostel has to hold the room, so they need approval.</>
                : <>Leave the times at 11:00 unless your guests arrive earlier or leave later.</>}
            </Surface>

            <Text size="xs" color="muted" style={{ marginTop: "calc(-1 * var(--spacing-2))" }}>
              Requests must be raised at least {MIN_LEAD_WORKING_DAYS} working days in advance — earliest start date is {earliestStart}.
            </Text>
            <Field label="Purpose of visit" required>
              <Input value={form.stay.purpose} onChange={(e) => setStay("purpose", e.target.value)} placeholder="e.g., Convocation, personal visit" />
            </Field>
            <Field label="Permanent address">
              <Textarea value={form.permanentAddress} onChange={(e) => setForm((p) => ({ ...p, permanentAddress: e.target.value }))} rows={2} placeholder="Address of the guests" />
            </Field>
            {profileFA ? (
              <Field label="Faculty advisor email">
                <Surface bg="secondary" padding="var(--spacing-2) var(--spacing-3)" radius="md" border="1px solid var(--color-border-primary)" color="body" size="sm">
                  {profileFA}
                </Surface>
                <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Taken from your profile. Contact the office to change it.</Text>
              </Field>
            ) : (
              <Field label="Faculty advisor email (optional)">
                <Input value={form.facultyAdvisorEmail} onChange={(e) => setForm((p) => ({ ...p, facultyAdvisorEmail: e.target.value }))} placeholder="Your faculty advisor's email" />
              </Field>
            )}
          </VStack>
        )}

        {step === 2 && (
          <VStack gap={4}>
            <Surface bg="tertiary" padding={4} radius="lg" size="sm" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
              <div>
                <strong>{form.guests.length}</strong> guest(s) · {form.stay.fromDate || "—"} {form.stay.checkInTime} → {form.stay.toDate || "—"} {form.stay.checkOutTime}
              </div>
              {extensionSummary && <Text as="div" color="muted">Extension requested: {extensionSummary}</Text>}
              {form.stay.purpose && <Text as="div" color="muted">{form.stay.purpose}</Text>}
            </Surface>
            {loadingQuote ? (
              <Text color="muted" size="sm">Calculating estimate…</Text>
            ) : quote ? (
              <Surface padding={3} radius="card-sm" border="1px solid var(--color-border-primary)">
                <ChargesRows quote={quote} />
              </Surface>
            ) : (
              <Text color="muted" size="sm">Estimate unavailable.</Text>
            )}
            <Text size="xs" color="muted">
              Final amount is confirmed by the Chief Warden office at approval.
            </Text>
          </VStack>
        )}
      </VStack>
    </Modal>
  )
}

export default AccommodationRequestWizard
