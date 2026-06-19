import { useState, useEffect, useCallback } from "react"
import { Modal, Button, Input } from "czero/react"
import { Select, Textarea, DatePicker, Label, IconButton } from "@/components/ui"
import StepIndicator from "@/components/ui/navigation/StepIndicator"
import { Plus, Trash2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthProvider"
import { accommodationApi } from "@/service"
import { ChargesRows } from "./AccommodationKit"

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

const emptyGuest = () => ({ name: "", gender: "", relation: "", occupation: "" })

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
    stay: { fromDate: "", toDate: "", purpose: "" },
    permanentAddress: "",
    facultyAdvisorEmail: "",
  })
  const [quote, setQuote] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

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
          occupation: g.occupation || "",
        })) || [emptyGuest()],
        stay: {
          fromDate: toDateInput(existingRequest.stay?.fromDate),
          toDate: toDateInput(existingRequest.stay?.toDate),
          purpose: existingRequest.stay?.purpose || "",
        },
        permanentAddress: existingRequest.permanentAddress || "",
        facultyAdvisorEmail: existingRequest.facultyAdvisorEmail || "",
      })
    } else {
      setForm({
        applicantPhone: user?.phone || "",
        guests: [emptyGuest()],
        stay: { fromDate: "", toDate: "", purpose: "" },
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
      }
    }
    if (step === 1) {
      if (!form.stay.fromDate || !form.stay.toDate) return "Stay start and end dates are required"
      if (new Date(form.stay.toDate) <= new Date(form.stay.fromDate)) return "End date must be after start date"
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
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
        <StepIndicator steps={STEPS} currentStep={STEPS[step].id} />

        {error && (
          <div style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", padding: "var(--spacing-3)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)" }}>
            {error}
          </div>
        )}

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div>
              <Label htmlFor="applicantPhone">Your contact number</Label>
              <Input name="applicantPhone" value={form.applicantPhone} onChange={(e) => setForm((p) => ({ ...p, applicantPhone: e.target.value }))} placeholder="Phone number" />
            </div>
            {form.guests.map((g, i) => (
              <div key={i} style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>Guest {i + 1}</span>
                  {form.guests.length > 1 && (
                    <IconButton icon={<Trash2 size={16} />} variant="ghost" size="small" ariaLabel="Remove guest" onClick={() => removeGuest(i)} />
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                  <Input placeholder="Full name" value={g.name} onChange={(e) => setGuest(i, "name", e.target.value)} />
                  <Select placeholder="Gender" options={GENDERS} value={g.gender} onChange={(e) => setGuest(i, "gender", e.target.value)} />
                  <Input placeholder="Relation (optional)" value={g.relation} onChange={(e) => setGuest(i, "relation", e.target.value)} />
                  <Input placeholder="Occupation (optional)" value={g.occupation} onChange={(e) => setGuest(i, "occupation", e.target.value)} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addGuest}><Plus size={16} /> Add guest</Button>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
              <div>
                <Label required>From</Label>
                <DatePicker name="fromDate" value={form.stay.fromDate} onChange={(e) => setStay("fromDate", e.target.value)} />
              </div>
              <div>
                <Label required>To</Label>
                <DatePicker name="toDate" value={form.stay.toDate} onChange={(e) => setStay("toDate", e.target.value)} />
              </div>
            </div>
            <div>
              <Label required>Purpose of visit</Label>
              <Input value={form.stay.purpose} onChange={(e) => setStay("purpose", e.target.value)} placeholder="e.g., Convocation, personal visit" />
            </div>
            <div>
              <Label>Permanent address</Label>
              <Textarea value={form.permanentAddress} onChange={(e) => setForm((p) => ({ ...p, permanentAddress: e.target.value }))} rows={2} placeholder="Address of the guests" />
            </div>
            <div>
              <Label>Faculty advisor email (optional)</Label>
              <Input value={form.facultyAdvisorEmail} onChange={(e) => setForm((p) => ({ ...p, facultyAdvisorEmail: e.target.value }))} placeholder="Leave blank to use the one on your profile" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)", fontSize: "var(--font-size-sm)", display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
              <div><strong>{form.guests.length}</strong> guest(s) · {form.stay.fromDate || "—"} → {form.stay.toDate || "—"}</div>
              {form.stay.purpose && <div style={{ color: "var(--color-text-muted)" }}>{form.stay.purpose}</div>}
            </div>
            {loadingQuote ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Calculating estimate…</p>
            ) : quote ? (
              <div style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", padding: "var(--spacing-3)" }}>
                <ChargesRows quote={quote} />
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Estimate unavailable.</p>
            )}
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Final amount is confirmed by the Chief Warden office at approval.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AccommodationRequestWizard
