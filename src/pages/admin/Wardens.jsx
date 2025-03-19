import { useState, useEffect } from "react"
import { FaUserTie, FaPlus } from "react-icons/fa"
import FilterTabs from "../../components/admin/FilterTabs"
import SearchBar from "../../components/admin/SearchBar"
import NoResults from "../../components/admin/NoResults"
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
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Warden Management</h1>
        <div className="flex items-center space-x-6">
          <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-5 py-2 rounded-[12px]">
            <FaPlus className="mr-2" /> Add Warden
          </button>
        </div>
      </header>

      <WardenStats wardens={wardens} />

      <div className="mt-8 flex justify-between items-center">
        <FilterTabs tabs={WARDEN_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search wardens by name or hostel" className="w-1/2" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWardens.map((warden) => (
          <WardenCard key={warden.id} warden={warden} hostelList={hostelList} />
        ))}
      </div>

      {filteredWardens.length === 0 && <NoResults icon={<FaUserTie className="mx-auto text-gray-300 text-5xl mb-4" />} message="No wardens found" suggestion="Try changing your search or filter criteria" />}

      <AddWardenModal show={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}

export default Wardens
