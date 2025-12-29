import Button from "../common/Button"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import PageHeader from "../common/PageHeader"
import { FaFilter, FaPlus, FaList, FaTh, FaCalendarAlt } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"

const LeavesHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, onCreate, title = "Leave Management", isAdmin = false, viewSelfOnly, setViewSelfOnly }) => {
  const { user } = useAuth()
  const canCreate = ["Admin", "Hostel Supervisor", "Maintenance Staff"].includes(user?.role)

  const viewModeOptions = [
    { value: "list", label: "List", icon: <FaList /> },
    { value: "cards", label: "Grid", icon: <FaTh /> },
  ]

  const selfViewOptions = [
    { value: false, label: "All" },
    { value: true, label: "Mine" },
  ]

  return (
    <PageHeader title={title}>
      <Button onClick={() => setShowFilters(!showFilters)}
        variant={showFilters ? "primary" : "white"}
        size="medium"
        icon={<FaFilter />}
      >
        Filters
      </Button>

      {isAdmin && (
        <ToggleButtonGroup
          options={selfViewOptions}
          value={viewSelfOnly}
          onChange={setViewSelfOnly}
          shape="pill"
          size="medium"
          variant="muted"
          hideLabelsOnMobile={false}
        />
      )}

      <ToggleButtonGroup
        options={viewModeOptions}
        value={viewMode}
        onChange={setViewMode}
        shape="pill"
        size="medium"
        variant="muted"
      />

      {canCreate && (
        <Button onClick={onCreate} variant="primary" size="medium" icon={<FaPlus />}>
          Create Leave
        </Button>
      )}
    </PageHeader>
  )
}

export default LeavesHeader
