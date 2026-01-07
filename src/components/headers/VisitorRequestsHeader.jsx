import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { FaFilter, FaPlus, FaUserEdit } from "react-icons/fa"

const VisitorRequestsHeader = ({ 
  showFilters, 
  onToggleFilters, 
  onAddProfile, 
  onManageProfiles, 
  onNewRequest, 
  userRole 
}) => {
  return (
    <PageHeader title="Visitor Requests">
      <Button variant={showFilters ? "primary" : "white"} onClick={onToggleFilters} icon={<FaFilter />}>
        {showFilters ? "Hide Filters" : "Filter Requests"}
      </Button>
      {["Student"].includes(userRole) && (
        <>
          <Button variant="white" onClick={onAddProfile} icon={<FaPlus />}>
            Add Visitor Profile
          </Button>
          <Button variant="white" onClick={onManageProfiles} icon={<FaUserEdit />}>
            Manage Profiles
          </Button>
          <Button variant="primary" onClick={onNewRequest} icon={<FaPlus />}>
            New Request
          </Button>
        </>
      )}
    </PageHeader>
  )
}

export default VisitorRequestsHeader
