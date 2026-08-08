import { BedDouble } from "lucide-react"
import { DetailSection, InfoRow } from "hzero"

// A room arrives as [number] or [number, unit].
const roomLabel = (room) => (room.length > 1 ? `${room[1]}-${room[0]}` : `Room ${room[0]}`)

const AccommodationDetails = ({ hostelName, allocatedRooms }) => (
  <DetailSection title="Accommodation" icon={BedDouble}>
    <InfoRow label="Hostel" value={hostelName || "Not set"} />
    <InfoRow
      label={allocatedRooms?.length > 1 ? "Rooms" : "Room"}
      value={allocatedRooms?.length > 0 ? allocatedRooms.map(roomLabel).join(", ") : "Not allocated yet"}
    />
  </DetailSection>
)

export default AccommodationDetails
