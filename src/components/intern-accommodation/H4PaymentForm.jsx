import { useState } from "react"
import { Alert, Button, DatePicker, Field, HStack, Input, Select, Text, VStack } from "hzero"
import { h4Api, h4FileUrl } from "@/service/modules/intern-accommodation.api"
import { money, today } from "./h4.format"

export default function H4PaymentForm({ request, token, onSaved }) {
  const bills = [
    { ...request.payment, _id: "main", label: "Accommodation" },
    ...(request.additionalPayments || []),
  ].filter((p) => p.amount > 0 && ["Pending", "Deferred", "Rejected"].includes(p.status))
  const [selected, setSelected] = useState(bills[0]?._id || "main")
  const bill = bills.find((p) => String(p._id) === String(selected)) || bills[0]
  const [utr, setUtr] = useState("")
  const [paidAt, setPaidAt] = useState("")
  const [fileRef, setRef] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [uploadedRevision, setUploadedRevision] = useState(null)
  const run = (action, body) =>
    token ? h4Api.accessAction(token, action, body) : h4Api.action(request._id, action, body)
  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    setError("")
    try {
      const form = new FormData()
      form.append("image", file)
      form.append("revision", String(request.h4.revision))
      const result = token ? await h4Api.accessUpload(token, form) : await h4Api.upload(request._id, form)
      setRef(result.data.fileRef)
      setUploadedRevision(result.data.revision)
      await onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const submit = async (defer) => {
    setBusy(true)
    setError("")
    try {
      await run(defer ? "defer" : "payment", {
        revision: uploadedRevision ?? request.h4.revision,
        additionalPaymentId: bill._id === "main" ? undefined : bill._id,
        utr,
        paidAt,
        screenshotFileRef: fileRef,
      })
      setRef("")
      setUploadedRevision(null)
      await onSaved()
    } catch (e) {
      setError(e.message)
      await onSaved()
      setUploadedRevision(null)
    } finally {
      setBusy(false)
    }
  }
  if (!bill) return null
  return (
    <VStack gap={3}>
      {error && <Alert type="error">{error}</Alert>}
      {bills.length > 1 && (
        <Field label="Payment">
          <Select
            value={selected}
            options={bills.map((p) => ({ value: String(p._id), label: `${p.label} · ${money(p.amount)}` }))}
            onChange={(e) => {
              setSelected(e.target.value)
              setRef("")
              setUploadedRevision(null)
            }}
          />
        </Field>
      )}
      <Text weight="semibold">
        {bill.label} · {money(bill.amount)}
      </Text>
      {(bill.remarks || request.payment?.remarks) && (
        <Alert type="info">{bill.remarks || request.payment.remarks}</Alert>
      )}
      {/^https?:\/\//i.test(request.payment?.paymentLink || "") && (
        <a href={request.payment.paymentLink} target="_blank" rel="noreferrer">
          Open payment portal
        </a>
      )}
      {token
        ? request.qrUrl && (
            <img
              src={request.qrUrl}
              alt="Accommodation payment QR"
              referrerPolicy="no-referrer"
              style={{ width: 180, maxWidth: "100%" }}
            />
          )
        : request.payment?.qrRef && (
            <img
              src={h4FileUrl(request._id, "qr")}
              alt="Accommodation payment QR"
              referrerPolicy="no-referrer"
              style={{ width: 180, maxWidth: "100%" }}
            />
          )}
      <Field label="UTR" required>
        <Input
          inputMode="numeric"
          placeholder="12-digit transaction number"
          maxLength={12}
          value={utr}
          onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
        />
      </Field>
      <Field label="Payment date" required>
        <DatePicker value={paidAt} max={today()} onChange={(e) => setPaidAt(e.target.value)} />
      </Field>
      <Field label="Payment proof · PNG / JPG, 5 MB max" required>
        <input
          aria-label="Upload payment proof"
          type="file"
          accept="image/png,image/jpeg"
          disabled={busy}
          onChange={(e) => upload(e.target.files[0])}
        />
        {fileRef && (
          <Text size="xs" color="success">
            Proof uploaded
          </Text>
        )}
      </Field>
      <HStack gap={2} wrap>
        <Button
          disabled={busy || !/^\d{12}$/.test(utr) || !paidAt || !fileRef}
          loading={busy}
          onClick={() => submit(false)}
        >
          Submit payment proof
        </Button>
        {bill.status !== "Deferred" && (
          <Button variant="secondary" disabled={busy} onClick={() => submit(true)}>
            Pay later
          </Button>
        )}
      </HStack>
      <Text size="xs" color="muted">
        Rooms are assigned after verification.
      </Text>
    </VStack>
  )
}
