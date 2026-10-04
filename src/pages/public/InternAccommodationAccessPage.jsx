import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Alert, Button, DetailSection, HStack, Text, VStack } from "hzero"
import { BedDouble, CalendarDays, CreditCard, Download, RefreshCw } from "lucide-react"
import { h4Api, h4AccessFileUrl } from "@/service/modules/intern-accommodation.api"
import { H4Journey, H4Status, H4StayDetails } from "@/components/intern-accommodation/H4Kit"
import { date, money } from "@/components/intern-accommodation/h4.format"
import H4PaymentForm from "@/components/intern-accommodation/H4PaymentForm"
import H4ScheduleForm from "@/components/intern-accommodation/H4ScheduleForm"
import "@/components/intern-accommodation/h4.css"

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
              <Text size="xs" color="muted">
                IIT INDORE · HOSTEL ACCOMMODATION
              </Text>
              <Text as="h1" size="xl" weight="bold">
                {r?.applicantName || "H4 accommodation"}
              </Text>
            </VStack>
            <Button variant="ghost" aria-label="Refresh accommodation details" onClick={() => query.refetch()}>
              <RefreshCw size={16} />
            </Button>
          </HStack>
          {query.isLoading && <Text>Loading your accommodation…</Text>}
          {query.error && <Alert tone="danger">{query.error.message}</Alert>}
          {r && (
            <>
              <H4Status request={r} />
              <H4Journey request={r} />
              <DetailSection title="Stay details" icon={BedDouble}>
                <VStack gap={3}>
                  <H4StayDetails request={r} />
                  <Text size="sm">{r.stay.purpose}</Text>
                  <Text size="xs" color="muted">
                    Food charges are handled separately from accommodation.
                  </Text>
                </VStack>
              </DetailSection>
              {r.h4.amendment?.stage && (
                <Alert tone="info">
                  A date change is awaiting {r.h4.amendment.stage} review. Your current stay remains effective.
                </Alert>
              )}
              {r.purpose === "payer" && (
                <DetailSection title="Accommodation payment" icon={CreditCard}>
                  <VStack gap={3}>
                    {[r.payment, ...(r.additionalPayments || [])].map((p, i) => (
                      <HStack key={i} justify="between" wrap>
                        <Text size="sm">
                          {p.label || "Accommodation"} · {money(p.amount)}
                        </Text>
                        <Text size="sm">{p.status}</Text>
                      </HStack>
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
              {r.purpose === "intern" && !closed && !r.h4.amendment?.stage && (
                <DetailSection title="Change dates" icon={CalendarDays}>
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
                      Extend / postpone stay
                    </Button>
                  )}
                </DetailSection>
              )}
              <Text size="xs" color="muted">
                Link valid until {date(r.expiresAt)}. Contact your requester or CW Office for help.
              </Text>
            </>
          )}
        </VStack>
      </div>
    </main>
  )
}
