import { Badge, Grid, InfoRow, StepIndicator, Text, VStack } from "hzero"
import { getStatusTone } from "@/constants/accommodationStatus"
import { date, labels } from "./h4.format"

export const H4Status = ({ request }) => (
  <Badge tone={getStatusTone(request.status)}>
    {request.h4?.amendment?.stage
      ? `Date change · ${request.h4.amendment.stage}`
      : labels[request.status] || request.status}
  </Badge>
)
const stages = ["Faculty", "CW Office", "Chief Warden", "Payment", "Room", "Stay", "Invoice"].map((label, i) => ({
  id: String(i),
  label,
}))
const indexes = {
  Draft: 0,
  "Pending FA Recommendation": 0,
  "Pending CWO Capacity Check": 1,
  "Pending CW Approval": 2,
  "CW Approved": 3,
  "Payment Requested": 3,
  "Payment Deferred": 3,
  "Payment Submitted": 3,
  "Payment Verified": 4,
  "Rooms Assigned": 5,
  "Checked In": 5,
  "Checked Out": 6,
  Invoiced: 6,
}
export const H4Journey = ({ request }) => (
  <div className="h4-journey">
    <StepIndicator steps={stages} currentStep={String(indexes[request.status] ?? 0)} />
  </div>
)
export const H4Stay = ({ request }) => (
  <VStack gap={1}>
    <Text size="sm">
      {date(request.stay?.fromDate)} – {date(request.stay?.toDate)}
    </Text>
    <Text size="xs" color="muted">
      {request.nights || ""} nights{request.h4?.mess === "with" ? " · With mess" : ""}
    </Text>
  </VStack>
)
export const H4StayDetails = ({ request }) => (
  <Grid columns={2} gap={3}>
    <InfoRow label="Arrival" value={`${date(request.stay.fromDate)} · ${request.stay.checkInTime || "11:00"} IST`} />
    <InfoRow label="Departure" value={`${date(request.stay.toDate)} · ${request.stay.checkOutTime || "11:00"} IST`} />
    <InfoRow label="Hostel" value={request.hostel?.name || "Pending"} />
    <InfoRow
      label="Room"
      value={
        request.room
          ? [request.room.unitId?.unitNumber, request.room.roomNumber].filter(Boolean).join(" / ")
          : "Pending"
      }
    />
    <InfoRow label="Payer" value={request.h4.payer.name} />
    <InfoRow label="Mess" value={request.h4.mess === "with" ? "With mess" : "Without mess"} />
  </Grid>
)
