import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Alert, Button, DetailSection, FileInput, HStack, Text, VStack } from "hzero"
import { BedDouble, CalendarDays, CreditCard, Download, RefreshCw, Upload, Utensils } from "lucide-react"
import { h4Api, h4AccessFileUrl } from "@/service/modules/intern-accommodation.api"
import { H4Status, H4Journey, H4StayDetails } from "@/components/intern-accommodation/H4Kit"
import { date, money } from "@/components/intern-accommodation/h4.format"
import H4PaymentForm from "@/components/intern-accommodation/H4PaymentForm"
import H4ScheduleForm from "@/components/intern-accommodation/H4ScheduleForm"
import { h4Bills, h4BillParts } from "@/components/intern-accommodation/h4.payments"
import "@/components/intern-accommodation/h4.css"

const PHOTO_STEP = {
  Pending: { type: "info", text: "Upload a clear photo of your face. It is used to identify you at the mess. The Chief Warden Office will check it, and then your hostel will allot your room." },
  Submitted: { type: "info", text: "Your photo has been submitted and is with the Chief Warden Office for review. You can replace it until it is reviewed." },
  Rejected: { type: "warning", text: "Your photo was not accepted. Please choose a new photo and submit it." },
  Approved: { type: "success", text: "Your photo is approved. Your hostel will allot your room." },
}
const PHOTO_TIPS = [
  "A recent photo facing the camera, with your full face visible",
  "Good light and a plain background",
  "No sunglasses, cap or mask; only you in the photo",
  "PNG or JPG, up to 5 MB",
]

function MessPhoto({ request: r, token, onSaved }) {
  const photo = r.h4.messPhoto || { status: "Pending" }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState("")
  const fileRef = useRef(null)
  const step = PHOTO_STEP[photo.status] || PHOTO_STEP.Pending
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])
  const choose = (e) => {
    const picked = e.target.files?.[0]
    e.target.value = ""
    if (!picked) return
    setError("")
    if (!["image/png", "image/jpeg"].includes(picked.type)) return setError("Choose a PNG or JPG image.")
    if (picked.size > 5 * 1024 * 1024) return setError("The photo is larger than 5 MB. Choose a smaller one.")
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }
  const submit = async () => {
    if (!file) return
    setBusy(true)
    setError("")
    try {
      const form = new FormData()
      form.append("image", file)
      form.append("revision", String(r.h4.revision))
      await h4Api.accessPhoto(token, form)
      setFile(null)
      setPreview("")
      await onSaved()
    } catch (e) {
      setError(e.message)
      await onSaved()
    } finally {
      setBusy(false)
    }
  }
  const canUpload = photo.status !== "Approved"
  return (
    <VStack gap={3}>
      <Text size="sm">
        Your mess: <strong>{r.h4.caterer.name}</strong>
      </Text>
      <Alert type={step.type}>
        {step.text}
        {photo.status === "Rejected" && photo.note ? ` Reason: ${photo.note}` : ""}
      </Alert>
      {error && <Alert type="error">{error}</Alert>}
      {(preview || photo.hasFile) && (
        <VStack gap={1}>
          <Text size="xs" color="muted">{preview ? "Selected photo (not submitted yet)" : "Submitted photo"}</Text>
          <img
            src={preview || h4AccessFileUrl(token, "photo", { v: r.h4.revision })}
            alt={preview ? "Selected photo" : "Your mess photo"}
            style={{ width: 160, maxWidth: "100%", borderRadius: "var(--radius-md)" }}
          />
        </VStack>
      )}
      {canUpload && (
        <>
          <VStack gap={1}>
            <Text size="sm" weight="semibold">Photo guidelines</Text>
            <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc" }}>
              {PHOTO_TIPS.map((tip) => (
                <li key={tip}><Text size="sm" color="muted">{tip}</Text></li>
              ))}
            </ul>
          </VStack>
          <FileInput ref={fileRef} accept="image/png,image/jpeg" onChange={choose} disabled={busy} hidden />
          <HStack gap={2} wrap>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload size={16} />
              {file ? "Choose another photo" : photo.hasFile ? "Choose a new photo" : "Choose photo"}
            </Button>
            <Button onClick={submit} loading={busy} disabled={!file || busy}>
              Submit photo
            </Button>
          </HStack>
          {!file && <Text size="xs" color="muted">Choose a photo, check the preview, then select Submit photo.</Text>}
        </>
      )}
    </VStack>
  )
}

export default function InternAccommodationAccessPage() {
  const { token } = useParams()
  const query = useQuery({ queryKey: ["h4", "access", token], queryFn: () => h4Api.access(token), retry: false })
  const r = query.data?.data
  const [showSchedule, setShowSchedule] = useState(false)
  const closed = r && ["Cancelled", "Rejected", "Checked Out", "Invoiced"].includes(r.status)
  return (
    <main className="h4-public">
      <div className="h4-public-card">
        <VStack gap={5}>
          <HStack justify="between" wrap gap={2}>
            <VStack gap={1}>
              <Text size="xs" color="muted">IIT Indore · Hostel accommodation</Text>
              <Text as="h1" size="xl" weight="bold">{r?.applicantName || "Accommodation"}</Text>
            </VStack>
            <Button variant="ghost" aria-label="Refresh" onClick={() => query.refetch()}>
              <RefreshCw size={16} />
            </Button>
          </HStack>
          {query.isLoading && <Text>Loading…</Text>}
          {query.error && <Alert type="error">{query.error.message}</Alert>}
          {r && (
            <>
              <H4Status request={r} studentFacing />
              <H4Journey request={r} studentFacing />
              <DetailSection title="Stay" icon={BedDouble}>
                <H4StayDetails request={r} />
              </DetailSection>
              {r.h4.amendment?.stage && (
                <Alert type="info">Date change under {r.h4.amendment.stage} review.</Alert>
              )}
              {h4Bills(r).length > 0 && (
                <DetailSection title="Payment" icon={CreditCard}>
                  <VStack gap={3}>
                    {h4Bills(r).map((p, i) => (
                      <VStack key={i} gap={1}>
                        <HStack justify="between" wrap>
                          <Text size="sm">{p.label || "Additional charge"} · {money(p.amount)}</Text>
                          <Text size="sm">{p.status}</Text>
                        </HStack>
                        {p._id === "main" && h4BillParts(r, money) && (
                          <Text size="xs" color="muted">{h4BillParts(r, money)}</Text>
                        )}
                      </VStack>
                    ))}
                    {!r.h4.amendment?.stage && (
                      <H4PaymentForm
                        request={{ ...r, qrUrl: r.hasQr ? h4AccessFileUrl(token, "qr") : undefined }}
                        token={token}
                        onSaved={() => query.refetch()}
                      />
                    )}
                    {r.invoice && (
                      <a href={h4AccessFileUrl(token)} target="_blank" rel="noreferrer">
                        <HStack gap={2}>
                          <Download size={16} />
                          <Text>Invoice {r.invoice.number}</Text>
                        </HStack>
                      </a>
                    )}
                  </VStack>
                </DetailSection>
              )}
              {r.h4.mess === "with" && (
                <DetailSection title="Mess" icon={Utensils}>
                  {r.h4.caterer ? (
                    <MessPhoto request={r} token={token} onSaved={() => query.refetch()} />
                  ) : (
                    <Text size="sm" color="muted">
                      Your mess is assigned after your payment is verified. You will then be asked for a photo.
                    </Text>
                  )}
                </DetailSection>
              )}
              {!closed && !r.h4.amendment?.stage && (
                <DetailSection title="Dates" icon={CalendarDays}>
                  {showSchedule ? (
                    <H4ScheduleForm
                      request={r}
                      token={token}
                      onSaved={async () => {
                        setShowSchedule(false)
                        await query.refetch()
                      }}
                    />
                  ) : (
                    <Button variant="secondary" onClick={() => setShowSchedule(true)}>
                      Extend / postpone
                    </Button>
                  )}
                </DetailSection>
              )}
              <Text size="xs" color="muted">
                Link valid until {date(r.expiresAt)}.
              </Text>
            </>
          )}
        </VStack>
      </div>
    </main>
  )
}
