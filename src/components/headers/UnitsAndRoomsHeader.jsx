import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { Link } from "react-router-dom"
import { FaBuilding, FaFileImport } from "react-icons/fa"
import { MdFilterAlt, MdClearAll } from "react-icons/md"

const UnitsAndRoomsHeader = ({ 
  title, 
  showFilters, 
  onToggleFilters, 
  onBackToUnits, 
  onUpdateAllocations, 
  showBackToUnits, 
  showBackToHostels, 
  showUpdateAllocations, 
  userRole 
}) => {
  return (
    <PageHeader title={title}>
      {showBackToUnits && (
        <Button variant="white" onClick={onBackToUnits} icon={<FaBuilding />}>
          Back to Units
        </Button>
      )}

      {showBackToHostels && ["Admin"].includes(userRole) && (
        <Link to="/admin/hostels">
          <Button variant="white" icon={<FaBuilding />}>
            Back to Hostels
          </Button>
        </Link>
      )}

      {showUpdateAllocations && ["Admin"].includes(userRole) && (
        <Button variant="white" onClick={onUpdateAllocations} icon={<FaFileImport />}>
          Update Allocations
        </Button>
      )}

      <Button variant="white" onClick={onToggleFilters} icon={showFilters ? <MdClearAll /> : <MdFilterAlt />}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </Button>
    </PageHeader>
  )
}

export default UnitsAndRoomsHeader
