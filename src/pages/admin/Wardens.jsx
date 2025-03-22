import { useState, useEffect } from "react"
import { FaUserTie, FaPlus } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import WardenCard from "../../components/admin/wardens/WardenCard"
import AddWardenModal from "../../components/admin/wardens/AddWardenModal"
import WardenStats from "../../components/admin/wardens/WardenStats"
import { filterWardens } from "../../utils/adminUtils"
import { WARDEN_FILTER_TABS } from "../../constants/adminConstants"
import { adminApi } from "../../services/apiService"
import { useAdmin } from "../../contexts/AdminProvider"

const Wardens = () => {
  const { hostelList } = useAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [wardens, setWardens] = useState([])

  const filteredWardens = filterWardens(wardens, filterStatus, searchTerm)

  const fetchWardens = async () => {
    try {
      const response = await adminApi.getAllWardens()
      setWardens(response || [])
    } catch (error) {
      console.error("Error fetching wardens:", error)
    }
  }

  useEffect(() => {
    fetchWardens()
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Warden Management</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
          <FaPlus className="mr-2" /> Add Warden
        </button>
      </header>

      <WardenStats wardens={wardens} />

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <FilterTabs tabs={WARDEN_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
        </div>
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search wardens by name or hostel" className="w-full sm:w-64 md:w-72" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredWardens.map((warden) => (
          <WardenCard key={warden.id} warden={warden} onUpdate={() => fetchWardens()} onDelete={() => fetchWardens()} />
        ))}
      </div>

      {filteredWardens.length === 0 && <NoResults icon={<FaUserTie className="text-gray-300 text-3xl" />} message="No wardens found" suggestion="Try changing your search or filter criteria" />}

      <AddWardenModal show={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}

export default Wardens
