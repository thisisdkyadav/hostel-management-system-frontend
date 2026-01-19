import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Link } from "react-router-dom"
import { Building } from "lucide-react"

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
        <Button variant="outline" onClick={onBackToUnits} icon={<Building size={18} />}>
          Back to Units
        </Button>
      )}

      {showBackToHostels && ["Admin"].includes(userRole) && (
        <Link to="/admin/hostels">
          <Button variant="outline" icon={<Building size={18} />}>
            Back to Hostels
          </Button>
        </Link>
      )}
    </PageHeader>
  )
}

export default UnitsAndRoomsHeader
