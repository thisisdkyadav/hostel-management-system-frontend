import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Link } from "react-router-dom"
import { FaBuilding } from "react-icons/fa"

const UnitsAndRoomsHeader = ({
  title,
  onBackToUnits,
  showBackToUnits,
  showBackToHostels,
  userRole
}) => {
  return (
    <PageHeader title={title}>
      {showBackToUnits && (
        <Button variant="outline" onClick={onBackToUnits} icon={<FaBuilding />}>
          Back to Units
        </Button>
      )}

      {showBackToHostels && ["Admin"].includes(userRole) && (
        <Link to="/admin/hostels">
          <Button variant="outline" icon={<FaBuilding />}>
            Back to Hostels
          </Button>
        </Link>
      )}
    </PageHeader>
  )
}

export default UnitsAndRoomsHeader
