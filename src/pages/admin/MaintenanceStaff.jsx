import { useState, useEffect } from "react"
import { FaTools, FaPlus } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import MaintenanceCard from "../../components/admin/maintenance/MaintenanceCard"
import AddMaintenanceModal from "../../components/admin/maintenance/AddMaintenanceModal"
import MaintenanceStats from "../../components/admin/maintenance/MaintenanceStats"
import { filterMaintenanceStaff } from "../../utils/adminUtils"
import { MAINTENANCE_FILTER_TABS } from "../../constants/adminConstants"
import { adminApi } from "../../services/apiService"

const MaintenanceStaff = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [maintenanceStaff, setMaintenanceStaff] = useState([])

  const filteredStaff = filterMaintenanceStaff(maintenanceStaff, filterCategory, searchTerm)

  const fetchMaintenanceStaff = async () => {
    try {
      const response = await adminApi.getAllMaintenanceStaff()
      setMaintenanceStaff(response || [])
    } catch (error) {
      console.error("Error fetching maintenance staff:", error)
    }
  }

  useEffect(() => {
    fetchMaintenanceStaff()
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Maintenance Staff Management</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl shadow-sm hover:bg-[#0d4d8a] transition-colors">
          <FaPlus className="mr-2" /> Add Staff
        </button>
      </header>

      <MaintenanceStats maintenanceStaff={maintenanceStaff} />

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <FilterTabs tabs={MAINTENANCE_FILTER_TABS} activeTab={filterCategory} setActiveTab={setFilterCategory} />
        </div>
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search staff by name or category" className="w-full sm:w-64 md:w-80" />
      </div>

      {filteredStaff.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredStaff.map((staff) => (
            <MaintenanceCard key={staff.id} staff={staff} onUpdate={fetchMaintenanceStaff} onDelete={fetchMaintenanceStaff} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <NoResults icon={<FaTools className="text-gray-300 text-5xl" />} message="No maintenance staff found" suggestion="Try changing your search or filter criteria" />
        </div>
      )}

      <AddMaintenanceModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchMaintenanceStaff} />
    </div>
  )
}

export default MaintenanceStaff
