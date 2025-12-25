import Button from "../common/Button"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import PageHeader from "../common/PageHeader"
import { FaFilter, FaPlus, FaList, FaTh } from "react-icons/fa"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
import { useAuth } from "../../contexts/AuthProvider"

const ComplaintsHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, showCraftComplaint, setShowCraftComplaint, userRole, title = "Complaints Management" }) => {
  const { canAccess } = useAuth()

  const viewModeOptions = [
    { value: "list", label: "List", icon: <FaList style={{ fontSize: 'var(--font-size-xs)' }} /> },
    { value: "cards", label: "Grid", icon: <FaTh style={{ fontSize: 'var(--font-size-xs)' }} /> },
  ]

  return (
    <PageHeader title={title}>
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
        icon={<FaFilter style={{ fontSize: 'var(--font-size-xs)' }} />}
        className={showFilters ? "" : ""}
        style={showFilters ? { boxShadow: 'var(--ring-primary)' } : {}}
      >
        <span className="hidden sm:inline">Filters</span>
      </Button>

      {/* Create Button */}
      {canAccess("complaints", "create") && WHO_CAN_CREATE_COMPLAINT.includes(userRole) && (
        <Button onClick={() => setShowCraftComplaint(true)}
          variant="primary"
          size="medium"
          icon={<FaPlus style={{ fontSize: 'var(--font-size-xs)' }} />}
          animation="slideIn"
        >
          <span className="hidden sm:inline">New Complaint</span>
        </Button>
      )}
    </PageHeader>
  )
}

export default ComplaintsHeader

