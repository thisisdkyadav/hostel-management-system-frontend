import { useState } from "react"
import { Alert, Button, DatePicker, Field, Grid, Select, Textarea, VStack } from "hzero"
import { h4Api } from "@/service/modules/intern-accommodation.api"

export default function H4ScheduleForm({ request, token, onSaved }) {
  const [type, setType] = useState("extend")
  const [fromDate, setFrom] = useState(request.stay.fromDate.slice(0, 10))
  const [toDate, setTo] = useState(request.stay.toDate.slice(0, 10))
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const submit = async () => {
    setBusy(true)
    setError("")
    try {
      const body = {
        revision: request.h4.revision,
        type,
        fromDate: type === "extend" ? request.stay.fromDate.slice(0, 10) : fromDate,
        toDate,
        reason,
      }
      if (token) await h4Api.accessAction(token, "schedule", body)
      else await h4Api.action(request._id, "schedule", body)
      await onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <VStack gap={3}>
      {error && <Alert type="error">{error}</Alert>}
      <Field label="Date change">
        <Select
          value={type}
          options={[
            { value: "extend", label: "Extend stay" },
            ...(!request.checkInAt ? [{ value: "postpone", label: "Postpone stay" }] : []),
          ]}
          onChange={(e) => setType(e.target.value)}
        />
      </Field>
      <Grid cols={2} gap={3}>
        <Field label="New arrival">
          <DatePicker value={fromDate} disabled={type === "extend"} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="New departure">
          <DatePicker value={toDate} min={fromDate} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </Grid>
      <Field label="Reason" required>
        <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
      <Button loading={busy} disabled={!reason.trim() || busy} onClick={submit}>
        Request date change
      </Button>
    </VStack>
  )
}
