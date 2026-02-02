import { Button } from "czero/react"
import ToggleButtonGroup from "../common/ToggleButtonGroup"
import PageHeader from "../common/PageHeader"
import { Filter, Plus, List, LayoutGrid } from "lucide-react"
import { useAuth } from "../../contexts/AuthProvider"

const LeavesHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, onCreate, title = "Leave Management", isAdmin = false, viewSelfOnly, setViewSelfOnly }) => {
  const { user } = useAuth()
  const canCreate = ["Admin", "Hostel Supervisor", "Maintenance Staff"].includes(user?.role)

  const viewModeOptions = [
    { value: "list", label: "List", icon: <List size={14} /> },
    { value: "cards", label: "Grid", icon: <LayoutGrid size={14} /> },
  ]

  const selfViewOptions = [
    { value: false, label: "All" },
    { value: true, label: "Mine" },
  ]

  return (
    <PageHeader title={title}>
      <Button onClick={() => setShowFilters(!showFilters)}
        variant={showFilters ? "primary" : "white"}
        size="md"
      >
        <Filter size={14} /> Filters
      </Button>

      {isAdmin && (
        <ToggleButtonGroup
          options={selfViewOptions}
          value={viewSelfOnly}
          onChange={setViewSelfOnly}
          shape="pill"
          size="md"
          variant="muted"
          hideLabelsOnMobile={false}
        />
      )}

      <ToggleButtonGroup
        options={viewModeOptions}
        value={viewMode}
        onChange={setViewMode}
        shape="pill"
        size="md"
        variant="muted"
      />

      {canCreate && (
        <Button onClick={onCreate} variant="primary" size="md">
          <Plus size={14} /> Create Leave
        </Button>
      )}
    </PageHeader>
  )
}

export default LeavesHeader
