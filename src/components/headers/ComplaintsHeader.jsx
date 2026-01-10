import { Button } from "@/components/ui"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import PageHeader from "../common/PageHeader"
import { Filter, Plus, List, LayoutGrid } from "lucide-react"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
import { useAuth } from "../../contexts/AuthProvider"

const ComplaintsHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, showCraftComplaint, setShowCraftComplaint, userRole, title = "Complaints Management" }) => {
  const { canAccess } = useAuth()

  const viewModeOptions = [
    { value: "list", label: "List", icon: <List size={14} /> },
    { value: "cards", label: "Grid", icon: <LayoutGrid size={14} /> },
  ]

  return (
    <PageHeader title={title} hideTitleOnMobile>
      {/* View Toggle */}
      <ToggleButtonGroup
        options={viewModeOptions}
        value={viewMode}
        onChange={setViewMode}
        shape="rounded"
        size="medium"
        variant="muted"
      />

      {/* Filter Button */}
      <Button onClick={() => setShowFilters(!showFilters)}
        variant={showFilters ? "primary" : "white"}
        size="medium"
        icon={<Filter size={14} />}
      >
        <span className="hidden sm:inline">Filters</span>
      </Button>

      {/* Create Button */}
      {canAccess("complaints", "create") && WHO_CAN_CREATE_COMPLAINT.includes(userRole) && (
        <Button onClick={() => setShowCraftComplaint(true)}
          variant="primary"
          size="medium"
          icon={<Plus size={14} />}
          animation="slideIn"
        // keepTextOnMobile
        >
          New Complaint
        </Button>
      )}
    </PageHeader>
  )
}

export default ComplaintsHeader
