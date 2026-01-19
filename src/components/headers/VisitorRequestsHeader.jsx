import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Filter, Plus, UserPen } from "lucide-react"

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
      <Button variant={showFilters ? "primary" : "white"} onClick={onToggleFilters} icon={<Filter size={18} />}>
        {showFilters ? "Hide Filters" : "Filter Requests"}
      </Button>
      {["Student"].includes(userRole) && (
        <>
          <Button variant="white" onClick={onAddProfile} icon={<Plus size={18} />}>
            Add Visitor Profile
          </Button>
          <Button variant="white" onClick={onManageProfiles} icon={<UserPen size={18} />}>
            Manage Profiles
          </Button>
          <Button variant="primary" onClick={onNewRequest} icon={<Plus size={18} />}>
            New Request
          </Button>
        </>
      )}
    </PageHeader>
  )
}

export default VisitorRequestsHeader
