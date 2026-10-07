import { StatusBadge, Text, VStack } from "hzero"
import { getStatusTone, getStudentStatusLabel, stepIndexForStatus, STUDENT_STEPS } from "@/constants/accommodationStatus"
import { JourneyTimeline, money as guestMoney, fmtDate } from "@/components/accommodation/AccommodationKit"
import { date as h4Date, money as h4Money } from "./h4.format"

export { h4Money as money, h4Date as date, guestMoney as total }
export { fmtDate }

export const H4Status = ({ request, studentFacing = false }) => {
  const label = studentFacing ? getStudentStatusLabel(request.status) : request.status
  return (
    <StatusBadge status={label} tone={getStatusTone(request.status)}>
      {request.h4?.amendment?.stage ? `Date change · ${request.h4.amendment.stage}` : label}
    </StatusBadge>
  )
}

export const H4Journey = ({ request, studentFacing = false }) => (
  <JourneyTimeline status={request.status} timeline={request.timeline} studentFacing={studentFacing} />
)

export { STUDENT_STEPS, stepIndexForStatus }

export const H4Stay = ({ request }) => (
  <VStack gap={1}>
    <Text size="sm">
      {fmtDate(request.stay?.fromDate)} → {fmtDate(request.stay?.toDate)}
    </Text>
    <Text size="xs" color="muted">
      {request.nights ? `${request.nights} night${request.nights === 1 ? "" : "s"}` : ""}
      {request.h4?.mess === "with" ? " · With mess" : ""}
    </Text>
  </VStack>
)

export const H4StayDetails = ({ request }) => (
  <VStack gap={2}>
    <Text size="sm">
      {fmtDate(request.stay?.fromDate)} → {fmtDate(request.stay?.toDate)}
    </Text>
    <Text size="xs" color="muted">
      {request.hostelName || request.hostel?.name || "Hostel pending"}
      {request.roomLabel || request.room ? ` · ${request.roomLabel || ""}` : " · Room pending"}
    </Text>
    <Text size="xs" color="muted">
      Payer: {request.h4?.payer?.name || "—"} · {request.h4?.mess === "with" ? "With mess" : "Without mess"}
    </Text>
  </VStack>
)
