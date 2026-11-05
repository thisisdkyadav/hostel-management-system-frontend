import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Alert, Button, DetailSection, HStack, Text, VStack } from "hzero"
import { BedDouble, CalendarDays, CreditCard, Download, RefreshCw, Utensils } from "lucide-react"
import { h4Api, h4AccessFileUrl } from "@/service/modules/intern-accommodation.api"
import { H4Status, H4Journey, H4StayDetails } from "@/components/intern-accommodation/H4Kit"
import { date, money } from "@/components/intern-accommodation/h4.format"
import H4PaymentForm from "@/components/intern-accommodation/H4PaymentForm"
import H4ScheduleForm from "@/components/intern-accommodation/H4ScheduleForm"
import { h4Bills, h4BillParts } from "@/components/intern-accommodation/h4.payments"
import "@/components/intern-accommodation/h4.css"

const PHOTO_STEP = {
  Pending: { type: "info", text: "Upload a clear photo of your face. The Chief Warden Office will check it, and then your hostel will allot your room." },
  Submitted: { type: "info", text: "Your photo is with the Chief Warden Office for review. You can replace it until it is reviewed." },
  Rejected: { type: "warning", text: "Your photo was not accepted. Upload a new one." },
  Approved: { type: "success", text: "Your photo is approved. Your hostel will allot your room." },
}

function MessPhoto({ request: r, token, onSaved }) {
  const photo = r.h4.messPhoto || { status: "Pending" }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const step = PHOTO_STEP[photo.status] || PHOTO_STEP.Pending
  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    setError("")
    try {
      const form = new FormData()
      form.append("image", file)
      form.append("revision", String(r.h4.revision))
      await h4Api.accessPhoto(token, form)
      await onSaved()
    } catch (e) {
      setError(e.message)
      await onSaved()
    } finally {
      setBusy(false)
    }
  }
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
      {photo.hasFile && (
        <img
          src={h4AccessFileUrl(token, "photo", { v: r.h4.revision })}
          alt="Your mess photo"
          style={{ width: 160, maxWidth: "100%", borderRadius: "var(--radius-md)" }}
        />
      )}
      {photo.status !== "Approved" && (
        <label>
          <VStack gap={1}>
            <Text size="sm" weight="semibold">{photo.hasFile ? "Replace photo" : "Upload photo"} · PNG / JPG, 5 MB max</Text>
            <input
              aria-label="Upload your mess photo"
              type="file"
              accept="image/png,image/jpeg"
              disabled={busy}
              onChange={(e) => upload(e.target.files[0])}
            />
            {busy && <Text size="xs" color="muted">Uploading…</Text>}
          </VStack>
        </label>
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
