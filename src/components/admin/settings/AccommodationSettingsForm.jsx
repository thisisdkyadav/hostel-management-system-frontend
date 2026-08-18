import { useEffect, useState } from "react"
import { Alert, Button, Field, Grid, HStack, Input, Text, VStack } from "hzero"
import { Save } from "lucide-react"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { uploadApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

const emptyForm = {
  defaultPaymentQR: "",
  pricePerPerson1: 0,
  pricePerPerson2: 0,
  pricePerPerson3: 0,
  gstPercentage1: 0,
  gstPercentage2: 0,
  gstPercentage3: 0,
  gstin: "",
}

const uploadQrImage = (file) => {
  const formData = new FormData()
  formData.append("image", file)
  return uploadApi.uploadPaymentScreenshot(formData)
}

/**
 * Accommodation settings: payment QR image (no payment link) plus price/GST presets.
 */
const AccommodationSettingsForm = ({ config, onUpdate, isLoading }) => {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!config || typeof config !== "object") return
    setForm({
      defaultPaymentQR: config.defaultPaymentQR || "",
      pricePerPerson1: Number(config.pricePerPerson1) || 0,
      pricePerPerson2: Number(config.pricePerPerson2) || 0,
      pricePerPerson3: Number(config.pricePerPerson3) || 0,
      gstPercentage1: Number(config.gstPercentage1) || 0,
      gstPercentage2: Number(config.gstPercentage2) || 0,
      gstPercentage3: Number(config.gstPercentage3) || 0,
      gstin: config.gstin || "",
    })
  }, [config])

  const setNumber = (key, raw) => {
    const n = parseFloat(raw)
    setForm((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }))
  }

  const dirty =
    Boolean(config) &&
    (form.defaultPaymentQR !== (config.defaultPaymentQR || "") ||
      Number(form.pricePerPerson1) !== Number(config.pricePerPerson1 || 0) ||
      Number(form.pricePerPerson2) !== Number(config.pricePerPerson2 || 0) ||
      Number(form.pricePerPerson3) !== Number(config.pricePerPerson3 || 0) ||
      Number(form.gstPercentage1) !== Number(config.gstPercentage1 || 0) ||
      Number(form.gstPercentage2) !== Number(config.gstPercentage2 || 0) ||
      Number(form.gstPercentage3) !== Number(config.gstPercentage3 || 0) ||
      form.gstin !== (config.gstin || ""))

  const qrUrl = form.defaultPaymentQR ? getMediaUrl(form.defaultPaymentQR) : ""

  return (
    <VStack gap={5}>
      <Alert variant="info" title="Payment QR">
        Students pay by scanning the QR shown on their request. Upload a clear QR image here — there is no payment link.
      </Alert>

      <VStack gap={2}>
        <PdfUploadField
          label="Payment QR image"
          value={form.defaultPaymentQR}
          onChange={(ref) => setForm((prev) => ({ ...prev, defaultPaymentQR: ref || "" }))}
          onUpload={uploadQrImage}
          accept="image/*"
          acceptHint="PNG or JPG"
          validateType={(file) => file.type?.startsWith("image/")}
          uploadedText="QR image uploaded"
          viewerTitle="Payment QR"
          viewerSubtitle="Shown to students when payment is requested"
          downloadFileName="payment-qr.png"
          disabled={isLoading}
        />
        {qrUrl && (
          <div
            style={{
              padding: "var(--spacing-3)",
              border: "1px solid var(--color-border-primary)",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-bg-secondary)",
              display: "inline-flex",
              flexDirection: "column",
              gap: "var(--spacing-2)",
              alignItems: "center",
              alignSelf: "flex-start",
            }}
          >
            <img
              src={qrUrl}
              alt="Payment QR preview"
              style={{
                width: 180,
                height: 180,
                objectFit: "contain",
                background: "var(--color-bg-primary)",
                borderRadius: "var(--radius-md)",
              }}
            />
            <Text size="xs" color="muted">
              Preview (as students will see it)
            </Text>
          </div>
        )}
      </VStack>

      <VStack gap={3}>
        <Text weight="semibold" size="sm">
          Price presets (₹ per person)
        </Text>
        <Text size="xs" color="muted">
          Chief Warden Office picks one of these per guest when requesting payment, or types a custom amount.
        </Text>
        <Grid cols={3} gap={3}>
          <Field label="Price 1">
            <Input type="number" min={0} step="0.01" value={form.pricePerPerson1} onChange={(e) => setNumber("pricePerPerson1", e.target.value)} disabled={isLoading} />
          </Field>
          <Field label="Price 2">
            <Input type="number" min={0} step="0.01" value={form.pricePerPerson2} onChange={(e) => setNumber("pricePerPerson2", e.target.value)} disabled={isLoading} />
          </Field>
          <Field label="Price 3">
            <Input type="number" min={0} step="0.01" value={form.pricePerPerson3} onChange={(e) => setNumber("pricePerPerson3", e.target.value)} disabled={isLoading} />
          </Field>
        </Grid>
      </VStack>

      <VStack gap={3}>
        <Text weight="semibold" size="sm">
          GST % presets
        </Text>
        <Grid cols={3} gap={3}>
          <Field label="GST 1">
            <Input type="number" min={0} step="0.01" value={form.gstPercentage1} onChange={(e) => setNumber("gstPercentage1", e.target.value)} disabled={isLoading} />
          </Field>
          <Field label="GST 2">
            <Input type="number" min={0} step="0.01" value={form.gstPercentage2} onChange={(e) => setNumber("gstPercentage2", e.target.value)} disabled={isLoading} />
          </Field>
          <Field label="GST 3">
            <Input type="number" min={0} step="0.01" value={form.gstPercentage3} onChange={(e) => setNumber("gstPercentage3", e.target.value)} disabled={isLoading} />
          </Field>
        </Grid>
      </VStack>

      <Field label="GSTIN (shown on invoices)">
        <Input value={form.gstin} onChange={(e) => setForm((prev) => ({ ...prev, gstin: e.target.value }))} placeholder="Optional GSTIN" disabled={isLoading} />
      </Field>

      <HStack justify="end" gap={3}>
        <Button
          variant="primary"
          disabled={isLoading || !dirty}
          loading={isLoading}
          onClick={() =>
            onUpdate({
              ...form,
              defaultPaymentLink: "",
            })
          }
        >
          <Save size="1em" /> Save Changes
        </Button>
      </HStack>
    </VStack>
  )
}

export default AccommodationSettingsForm
