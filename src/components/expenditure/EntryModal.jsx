import { useEffect, useState } from "react"
import { Alert, Button, Field, Input, Modal, Textarea, useToast, VStack } from "hzero"
import AttachmentsField from "./AttachmentsField"

// Field config per entry type. `onSubmit(payload)` (from the parent) does the API call.
const FIELDS = {
  expense: [
    { key: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Stage & sound" },
    { key: "category", label: "Category", type: "text", placeholder: "e.g. Logistics" },
    { key: "amount", label: "Amount (₹)", type: "number", required: true },
    { key: "incurredAt", label: "Date incurred", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  bill: [
    { key: "vendor", label: "Vendor", type: "text", placeholder: "e.g. SoundCo" },
    { key: "billNumber", label: "Bill / invoice no.", type: "text" },
    { key: "amount", label: "Amount (₹)", type: "number" },
    { key: "billedAt", label: "Bill date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  payment: [
    { key: "source", label: "Received from", type: "text", placeholder: "e.g. Gymkhana" },
    { key: "amount", label: "Amount (₹)", type: "number", required: true },
    { key: "method", label: "Method", type: "text", placeholder: "e.g. UPI / bank transfer" },
    { key: "receivedAt", label: "Date received", type: "date" },
    { key: "reference", label: "Reference", type: "text", placeholder: "txn / cheque no." },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
}

const LABELS = { expense: "Expense", bill: "Bill", payment: "Payment" }
const DATE_KEYS = new Set(["incurredAt", "billedAt", "receivedAt"])

const toDateInput = (iso) => {
  if (!iso) return ""
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
}

const EntryModal = ({ type, initial = null, onSubmit, onSaved, onClose }) => {
  const { toast } = useToast()
  const fields = FIELDS[type] || []
  const isEdit = Boolean(initial)
  const label = LABELS[type] || "Entry"

  const [form, setForm] = useState({})
  const [attachments, setAttachments] = useState([])
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const next = {}
    for (const f of fields) {
      const raw = initial?.[f.key]
      next[f.key] = DATE_KEYS.has(f.key) ? toDateInput(raw) : raw ?? ""
    }
    setForm(next)
    setAttachments(Array.isArray(initial?.attachments) ? initial.attachments : [])
    setError("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, initial])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    for (const f of fields) {
      if (!f.required) continue
      const val = form[f.key]
      if (val === "" || val === undefined || val === null) {
        setError("Please fill in all required fields.")
        return
      }
    }

    const payload = { attachments }
    for (const f of fields) {
      const val = form[f.key]
      if (f.type === "number") {
        payload[f.key] = Number(val) || 0
      } else if (DATE_KEYS.has(f.key)) {
        payload[f.key] = val ? new Date(val).toISOString() : null
      } else {
        payload[f.key] = typeof val === "string" ? val.trim() : val ?? ""
      }
    }

    try {
      setSubmitting(true)
      setError("")
      const result = await onSubmit(payload)
      toast.success(`${label} ${isEdit ? "updated" : "added"}`)
      onSaved?.(result)
      onClose?.()
    } catch (err) {
      setError(err?.message || `Unable to save ${label.toLowerCase()}.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${isEdit ? "Edit" : "Add"} ${label}`}
      width={560}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
            {isEdit ? "Save Changes" : `Add ${label}`}
          </Button>
        </>
      }
    >
      <VStack gap={4}>
        {error && (
          <Alert type="error" icon>
            {error}
          </Alert>
        )}

        {fields.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`entry-${f.key}`} required={f.required}>
            {f.type === "textarea" ? (
              <Textarea
                id={`entry-${f.key}`}
                value={form[f.key] ?? ""}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder || ""}
                rows={3}
              />
            ) : (
              <Input
                id={`entry-${f.key}`}
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                min={f.type === "number" ? 0 : undefined}
                value={form[f.key] ?? ""}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder || ""}
              />
            )}
          </Field>
        ))}

        <AttachmentsField label="Attachments (bills, receipts, photos)" value={attachments} onChange={setAttachments} />
      </VStack>
    </Modal>
  )
}

export default EntryModal
