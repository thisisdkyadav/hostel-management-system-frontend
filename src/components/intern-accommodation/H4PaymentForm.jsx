import { useRef, useState } from "react"
import { CheckCircle2, ImageUp } from "lucide-react"
import { Alert, Button, DatePicker, Field, HStack, Input, Select, Text, VStack } from "hzero"
import { h4Api, h4FileUrl } from "@/service/modules/intern-accommodation.api"
import { money, today } from "./h4.format"
import { h4Bills, h4BillAction, h4BillParts } from "./h4.payments"

const MAX_MB = 5

export default function H4PaymentForm({ request, token, onSaved }) {
  const bills = h4Bills(request).filter((p) => p.amount > 0 && ["Pending", "Deferred", "Rejected"].includes(p.status))
  const [selected, setSelected] = useState(bills[0]?._id || "main")
  const bill = bills.find((p) => String(p._id) === String(selected)) || bills[0]
  const [utr, setUtr] = useState("")
  const [paidAt, setPaidAt] = useState("")
  const [fileRef, setRef] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [uploadedRevision, setUploadedRevision] = useState(null)
  const [fileName, setFileName] = useState("")
  const fileInput = useRef(null)
  const run = (action, body) =>
    token ? h4Api.accessAction(token, action, body) : h4Api.action(request._id, action, body)
  const upload = async (file) => {
    if (!file) return
    setError("")
    if (!["image/png", "image/jpeg"].includes(file.type)) return setError("The payment proof must be a PNG or JPG image.")
    if (file.size > MAX_MB * 1024 * 1024)
      return setError(`The image is ${(file.size / 1048576).toFixed(1)} MB. Upload one up to ${MAX_MB} MB.`)
    setBusy(true)
    try {
      const form = new FormData()
      form.append("image", file)
      form.append("revision", String(request.h4.revision))
      const result = token ? await h4Api.accessUpload(token, form) : await h4Api.upload(request._id, form)
      setRef(result.data.fileRef)
      setFileName(file.name)
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
        ...h4BillAction(bill),
        utr,
        paidAt,
        screenshotFileRef: fileRef,
      })
      setRef("")
      setFileName("")
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
      <VStack gap={1}>
        <Text weight="semibold">
          {bill.label} · {money(bill.amount)}
        </Text>
        {bill._id === "main" && h4BillParts(request, money) && (
          <Text size="xs" color="muted">{h4BillParts(request, money)}</Text>
        )}
      </VStack>
      {(bill.remarks || request.payment?.remarks) && (
        <Alert type="info">{bill.remarks || request.payment.remarks}</Alert>
      )}
      {/^https?:\/\//i.test(bill.paymentLink || request.payment?.paymentLink || "") && (
        <a href={bill.paymentLink || request.payment.paymentLink} target="_blank" rel="noreferrer">
          Open payment portal
        </a>
      )}
      {(token
        ? request.qrUrl && (
            <img
              src={request.qrUrl}
              alt="Payment QR"
              referrerPolicy="no-referrer"
              style={{ width: 180, maxWidth: "100%" }}
            />
          )
        : request.payment?.qrRef && (
            <img
              src={h4FileUrl(request._id, "qr")}
              alt="Payment QR"
              referrerPolicy="no-referrer"
              style={{ width: 180, maxWidth: "100%" }}
            />
          ))}
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
      <Field label="Payment proof (screenshot)" required>
        <input
          ref={fileInput}
          aria-label="Upload payment proof"
          type="file"
          accept="image/png,image/jpeg"
          disabled={busy}
          style={{ display: "none" }}
          onChange={(e) => {
            upload(e.target.files[0])
            e.target.value = ""
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-3)",
            flexWrap: "wrap",
            padding: "var(--spacing-3)",
            border: `var(--border-1) ${fileRef ? "solid" : "dashed"} var(--color-border-primary)`,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-secondary)",
          }}
        >
          {fileRef ? (
            <CheckCircle2 size={22} color="var(--color-success)" aria-hidden />
          ) : (
            <ImageUp size={22} color="var(--color-text-muted)" aria-hidden />
          )}
          <VStack gap={0} style={{ flex: "1 1 10rem", minWidth: 0 }}>
            <Text size="sm" weight="medium" style={{ overflowWrap: "anywhere" }}>
              {fileRef ? `Uploaded: ${fileName || "payment proof"}` : "No file chosen"}
            </Text>
            <Text size="xs" color="muted">PNG or JPG image · up to {MAX_MB} MB</Text>
          </VStack>
          <Button
            variant={fileRef ? "secondary" : "primary"}
            size="sm"
            loading={busy && !fileRef}
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            <ImageUp size={16} /> {fileRef ? "Change file" : "Choose file"}
          </Button>
        </div>
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
