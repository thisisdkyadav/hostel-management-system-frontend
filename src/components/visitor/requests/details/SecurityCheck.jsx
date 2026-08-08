import { format } from "date-fns"
import { ShieldCheck } from "lucide-react"
import { Badge, DetailSection, InfoRow } from "hzero"

/**
 * Whether each half of the visit has happened. The old version drew a coloured
 * dot beside the time to say so; a Badge says the same thing in the palette's
 * own words, and says it to a screen reader too.
 */
const stamp = (value) =>
  value
    ? <Badge variant="success" size="small">{format(new Date(value), "MMM d, yyyy h:mm a")}</Badge>
    : <Badge size="small">Not yet</Badge>

const SecurityCheck = ({ checkInTime, checkOutTime }) => (
  <DetailSection title="Security check" icon={ShieldCheck} columns={2}>
    <InfoRow label="Checked in" value={stamp(checkInTime)} />
    <InfoRow label="Checked out" value={stamp(checkOutTime)} />
  </DetailSection>
)

export default SecurityCheck
