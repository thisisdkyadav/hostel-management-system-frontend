import { Calendar } from "lucide-react"
import { DetailSection, InfoRow } from "hzero"

const formatDate = (dateString) => {
  if (!dateString) return "Not set"
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

const nights = (from, to) => Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24))

const VisitInformation = ({ fromDate, toDate }) => {
  const days = nights(fromDate, toDate)
  return (
    <DetailSection title="Visit" icon={Calendar}>
      <InfoRow label="From" value={formatDate(fromDate)} />
      <InfoRow label="To" value={formatDate(toDate)} />
      <InfoRow label="Duration" value={Number.isFinite(days) ? `${days} ${days === 1 ? "day" : "days"}` : "—"} />
    </DetailSection>
  )
}

export default VisitInformation
