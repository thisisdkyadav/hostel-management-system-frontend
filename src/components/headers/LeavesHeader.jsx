import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaFilter, FaPlus, FaList, FaTh, FaCalendarAlt } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"

const LeavesHeader = ({ showFilters, setShowFilters, viewMode, setViewMode, onCreate, title = "Leave Management", isAdmin = false, viewSelfOnly, setViewSelfOnly }) => {
  const { user } = useAuth()
  const canCreate = ["Admin", "Hostel Supervisor", "Maintenance Staff"].includes(user?.role)

  return (
    <PageHeader title={title}>
      <Button onClick={() => setShowFilters(!showFilters)} variant={showFilters ? "primary" : "white"} size="small" icon={<FaFilter className="mr-2" />} className={`transition-all duration-300 ${showFilters ? "" : ""}`}>
        Filters
      </Button>

      {isAdmin && (
        <div className="flex border border-gray-200 rounded-full overflow-hidden bg-white">
          <Button onClick={() => setViewSelfOnly(false)} variant={!viewSelfOnly ? "primary" : "white"} size="small" className={`rounded-none px-3 py-1.5 transition-colors duration-200`}>
            All
          </Button>
          <Button onClick={() => setViewSelfOnly(true)} variant={viewSelfOnly ? "primary" : "white"} size="small" className={`rounded-none px-3 py-1.5 transition-colors duration-200`}>
            Mine
          </Button>
        </div>
      )}

      <div className="flex border border-gray-200 rounded-full overflow-hidden bg-white">
        <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "primary" : "white"} size="small" className={`rounded-none px-3 py-1.5 transition-colors duration-200`} icon={<FaList className="mr-2" />}>
          List
        </Button>
        <Button onClick={() => setViewMode("cards")} variant={viewMode === "cards" ? "primary" : "white"} size="small" className={`rounded-none px-3 py-1.5 transition-colors duration-200`} icon={<FaTh className="mr-2" />}>
          Grid
        </Button>
      </div>

      {canCreate && (
        <Button onClick={onCreate} variant="primary" size="small" icon={<FaPlus className="mr-2" />} className="transition-all duration-300">
          Create Leave
        </Button>
      )}
    </PageHeader>
  )
}

export default LeavesHeader
