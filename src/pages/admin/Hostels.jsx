import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import FilterTabs from "../../components/admin/FilterTabs"
import SearchBar from "../../components/admin/SearchBar"
import HostelCard from "../../components/admin/HostelCard"
import AddHostelModal from "../../components/admin/AddHostelModal"
import NoResults from "../../components/admin/NoResults"
import { HOSTEL_FILTER_TABS } from "../../constants/adminConstants"
import HostelStats from "../../components/admin/HostelStats"
import { filterHostels } from "../../utils/adminUtils"

const Hostels = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const hostels = [
    {
      id: 1,
      name: "Hostel A",
      type: "Boys",
      warden: "Dr. Rajesh Kumar",
      totalRooms: 120,
      occupiedRooms: 112,
      vacantRooms: 8,
      maintenanceIssues: 3,
      blocks: ["A1", "A2", "A3"],
      occupancyRate: 93,
    },
  ]

  const filteredHostels = filterHostels(hostels, activeTab, searchTerm)

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
