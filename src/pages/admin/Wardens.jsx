import { useState } from "react"
import { FaUserTie, FaPlus } from "react-icons/fa"
import SearchBar from "../../components/admin/SearchBar"
import WardenCard from "../../components/admin/WardenCard"
import AddWardenModal from "../../components/admin/AddWardenModal"
import NoResults from "../../components/admin/NoResults"
import { filterWardens } from "../../utils/adminUtils"
import WardenStats from "../../components/admin/WardenStats"
import FilterTabs from "../../components/admin/FilterTabs"
import { WARDEN_FILTER_TABS } from "../../constants/adminConstants"

const Wardens = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)

  const wardens = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@iiti.ac.in",
      phone: "+91 9876543210",
      department: "Computer Science",
      hostelAssigned: "Hostel A",
      status: "active",
      experience: 7,
      joinDate: "2016-06-15",
      education: "Ph.D. Computer Science",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  ]

  const filteredWardens = filterWardens(wardens, filterStatus, searchTerm)

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
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, department, or hostel" className="w-1/2" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        {filteredWardens.map((warden) => (
          <WardenCard key={warden.id} warden={warden} />
        ))}
      </div>

      {filteredWardens.length === 0 && <NoResults icon={<FaUserTie className="mx-auto text-gray-300 text-5xl mb-4" />} message="No wardens found" suggestion="Try changing your search or filter criteria" />}

      <AddWardenModal show={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}

export default Wardens
