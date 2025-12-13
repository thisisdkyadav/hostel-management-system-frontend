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
  const [fetchArchive, setFetchArchive] = useState(false)

  const filteredHostels = filterHostels(hostels, activeTab, searchTerm)

  const fetchHostels = async (fetchArchive = false) => {
    try {
      const response = await adminApi.getAllHostels(fetchArchive ? "archive=true" : "")

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

  const handleArchiveToggle = () => {
    fetchHostels(!fetchArchive)
    setFetchArchive(!fetchArchive)
  }

  const refreshHostels = () => {
    fetchHostels(fetchArchive)
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  return (
    <>
      <div className="px-4 md:px-6 lg:px-8 py-6 flex-1">
      <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 md:-mx-6 lg:-mx-8 -mt-6 mb-6">
        <div className="px-4 md:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">Hostel Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleArchiveToggle} className="bg-[#0b57d0] text-white flex items-center px-4 py-2 rounded-full hover:bg-[#0e4eb5] transition-all duration-200 text-sm font-medium">
                {fetchArchive ? "Show All" : "Show Archived"}
              </button>
              <button onClick={() => setShowAddModal(true)} className="bg-[#0b57d0] text-white flex items-center px-4 py-2 rounded-full hover:bg-[#0e4eb5] transition-all duration-200 text-sm font-medium">
                <FaPlus className="mr-2" /> Add Hostel
              </button>
            </div>
          </div>
        </div>
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
            <HostelCard key={hostel.id} hostel={hostel} onUpdate={handleUpdateHostel} refreshHostels={refreshHostels} />
          ))}
        </div>

        {filteredHostels.length === 0 && <NoResults />}
      </div>

      <AddHostelModal show={showAddModal} onClose={() => setShowAddModal(false)} onAdd={fetchHostels} />
    </>
  )
}

export default Hostels
