import { useState } from "react"
import { FaUserTie, FaPlus } from "react-icons/fa"
import FilterTabs from "../../components/admin/FilterTabs"
import SearchBar from "../../components/admin/SearchBar"
import NoResults from "../../components/admin/NoResults"
import WardenCard from "../../components/admin/wardens/WardenCard"
import AddWardenModal from "../../components/admin/wardens/AddWardenModal"
import WardenStats from "../../components/admin/wardens/WardenStats"
import { filterWardens } from "../../utils/adminUtils"
import { WARDEN_FILTER_TABS } from "../../constants/adminConstants"

const Wardens = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)

  // Enhanced dummy data with more wardens
  // const wardens = []
  const wardens = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@iiti.ac.in",
      phone: "+91 9876543210",
      hostelAssigned: "CVRaman Hostel",
      joinDate: "2016-06-15",
      profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "active",
    },
    {
      id: 2,
      name: "Dr. Meena Sharma",
      email: "meena.sharma@iiti.ac.in",
      phone: "+91 9876543211",
      hostelAssigned: "Homi Bhabha Hostel",
      joinDate: "2018-07-23",
      profilePic: "https://randomuser.me/api/portraits/women/42.jpg",
      status: "active",
    },
    {
      id: 3,
      name: "Dr. Anand Patel",
      email: "anand.patel@iiti.ac.in",
      phone: "+91 9876543212",
      hostelAssigned: "",
      joinDate: "2022-01-10",
      profilePic: "https://randomuser.me/api/portraits/men/45.jpg",
      status: "unassigned",
    },
    {
      id: 4,
      name: "Dr. Priya Verma",
      email: "priya.verma@iiti.ac.in",
      phone: "+91 9876543213",
      hostelAssigned: "Vikram Sarabhai Hostel",
      joinDate: "2017-05-18",
      profilePic: "https://randomuser.me/api/portraits/women/28.jpg",
      status: "active",
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
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search wardens by name or hostel" className="w-1/2" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
