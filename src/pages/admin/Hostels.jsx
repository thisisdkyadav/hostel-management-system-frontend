import { useState, useEffect } from "react"
import { FaPlus } from "react-icons/fa"
import FilterTabs from "../../components/common/FilterTabs"
import SearchBar from "../../components/common/SearchBar"
import NoResults from "../../components/common/NoResults"
import HostelCard from "../../components/admin/hostel/HostelCard"
import HostelStats from "../../components/admin/hostel//HostelStats"
import AddHostelModal from "../../components/admin/hostel/AddHostelModal"
import { HOSTEL_FILTER_TABS } from "../../constants/adminConstants"
import { filterHostels } from "../../utils/adminUtils"
import { adminApi } from "../../services/apiService"

const Hostels = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [hostels, setHostels] = useState([])

  const filteredHostels = filterHostels(hostels, activeTab, searchTerm)

  const fetchHostels = async () => {
    try {
      const response = await adminApi.getAllHostels()
      console.log("Fetched hostels:", response.data)

      setHostels(response || [])
    } catch (error) {
      console.error("Error fetching hostels:", error)
    }
  }

  const handleUpdateHostel = async (updatedHostel) => {
    try {
      await adminApi.updateHostel(updatedHostel.id, updatedHostel)
      fetchHostels()
    } catch (error) {
      console.error("Error updating hostel:", error)
    }
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  return (
    <>
      <div className="px-4 md:px-6 lg:px-8 py-6 flex-1">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Hostel Management</h1>
          <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
            <FaPlus className="mr-2" /> Add Hostel
          </button>
        </header>

        <HostelStats hostels={hostels} />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto overflow-x-auto pb-2">
            <FilterTabs tabs={HOSTEL_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search hostel..." className="w-full sm:w-64 md:w-72" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredHostels.map((hostel) => (
            <HostelCard key={hostel.id} hostel={hostel} onUpdate={handleUpdateHostel} />
          ))}
        </div>

        {filteredHostels.length === 0 && <NoResults />}
      </div>

      <AddHostelModal show={showAddModal} onClose={() => setShowAddModal(false)} onAdd={fetchHostels} />
    </>
  )
}

export default Hostels
