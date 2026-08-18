import { Button } from "hzero"
import PageHeader from "../common/PageHeader"
import { Link } from "react-router-dom"
import { Building, DoorOpen } from "lucide-react"

const UnitsAndRoomsHeader = ({
  title,
  onBackToUnits,
  showBackToUnits,
  showBackToHostels,
  userRole,
  canManageRooms = false,
  onManageRooms,
}) => {
  return (
    <PageHeader title={title}>
      {showBackToUnits && (
        <Button variant="outline" onClick={onBackToUnits}>
          <Building size={18} /> Back to Units
        </Button>
      )}

      {showBackToHostels && ["Admin"].includes(userRole) && (
        <Link to="/admin/hostels">
          <Button variant="outline">
            <Building size={18} /> Back to Hostels
          </Button>
        </Link>
      )}

      {canManageRooms && (
        <Button variant="primary" onClick={onManageRooms}>
          <DoorOpen size={18} /> Manage Rooms
        </Button>
      )}
    </PageHeader>
  )
}

export default UnitsAndRoomsHeader
