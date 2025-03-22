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

  useEffect(() => {
    fetchHostels()
  }, [])

  return (
    <>
      <div className="px-10 py-6 flex-1">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Hostel Management</h1>
          <div className="flex items-center space-x-6">
            <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-5 py-2 rounded-[12px]">
              <FaPlus className="mr-2" /> Add Hostel
            </button>
          </div>
        </header>

        <HostelStats hostels={hostels} />

        <div className="mt-8 flex justify-between items-center">
          <FilterTabs tabs={HOSTEL_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search hostel..." className="w-1/2" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          {filteredHostels.map((hostel) => (
            <HostelCard key={hostel.id} hostel={hostel} />
          ))}
        </div>

        {filteredHostels.length === 0 && <NoResults />}
      </div>

      <AddHostelModal show={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  )
}

export default Hostels
