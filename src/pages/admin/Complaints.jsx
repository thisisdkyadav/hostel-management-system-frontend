import { useState } from "react"
import { FaClipboardList, FaSearch, FaBuilding, FaFilter, FaEye, FaEdit, FaTrash, FaExclamationCircle, FaRegCheckCircle } from "react-icons/fa"
import { MdPendingActions, MdOutlineWatchLater, MdPriorityHigh } from "react-icons/md"
import { BiSolidCategory } from "react-icons/bi"
import { TbProgressCheck } from "react-icons/tb"
import { RiUserSettingsFill } from "react-icons/ri"
import { filterComplaints, getTimeSince, getStatusColor, getPriorityColor } from "../../utils/adminUtils"
import ComplaintStats from "../../components/admin/ComplaintStats"
import FilterTabs from "../../components/admin/FilterTabs"
import { COMPLAINT_FILTER_TABS } from "../../constants/adminConstants"
import SearchBar from "../../components/admin/SearchBar"
import ComplaintDetailModal from "../../components/admin/ComplaintDetailModal"
import NoResults from "../../components/admin/NoResults"
import ComplaintListView from "../../components/admin/ComplaintListView"
import ComplaintCardView from "../../components/admin/ComplaintCardView"

const Complaints = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterHostel, setFilterHostel] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewMode, setViewMode] = useState("list")

  const hostels = ["Hostel A", "Hostel B", "Hostel C", "Hostel D", "Hostel E", "Hostel F", "Hostel G"]
  const categories = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other"]
  const priorities = ["Low", "Medium", "High", "Urgent"]

  const complaints = [
    {
      id: "CMP-2025-001",
      title: "Water leakage from ceiling",
      description: "There is a continuous water leakage from the ceiling in my room, especially when it rains. The wall is also getting damp.",
      status: "Pending",
      category: "Plumbing",
      priority: "High",
      hostel: "Hostel A",
      roomNumber: "207-A1",
      reportedBy: {
        email: "rahul.kumar@example.com",
        name: "Rahul Kumar",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        phone: "+91 9876543210",
      },
      assignedTo: null,
      createdDate: "2025-03-15T09:24:00",
      lastUpdated: "2025-03-15T09:24:00",
      resolutionNotes: "",
      images: ["https://images.unsplash.com/photo-1594761051355-bce9126f9f25?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    },
  ]

  const filteredComplaints = filterComplaints(complaints, filterStatus, filterPriority, filterCategory, filterHostel, searchTerm)

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  return (
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Complaints Management</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center px-4 py-2 rounded-[12px] ${showFilters ? "bg-[#1360AB] text-white" : "bg-white text-gray-700"}`}>
            <FaFilter className="mr-2" /> Filters
          </button>

          <div className="flex border border-gray-300 rounded-[12px] overflow-hidden">
            <button onClick={() => setViewMode("list")} className={`px-4 py-2 ${viewMode === "list" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => setViewMode("cards")} className={`px-4 py-2 ${viewMode === "cards" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <ComplaintStats complaints={complaints} />

      {/* Search and Filters */}
      <div className="mt-8 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <FilterTabs tabs={COMPLAINT_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search complaints..." className="w-1/2" />
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hostel</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg" value={filterHostel} onChange={(e) => setFilterHostel(e.target.value)}>
                  <option value="all">All Hostels</option>
                  {hostels.map((hostel, index) => (
                    <option key={index} value={hostel}>
                      {hostel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option value="all">All Priorities</option>
                  {priorities.map((priority, index) => (
                    <option key={index} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredComplaints.length > 0 ? (
        viewMode === "list" ? (
          <ComplaintListView complaints={filteredComplaints} onViewDetails={viewComplaintDetails} />
        ) : (
          <ComplaintCardView complaints={filteredComplaints} onViewDetails={viewComplaintDetails} />
        )
      ) : (
        <NoResults icon={<FaClipboardList className="mx-auto text-gray-300 text-5xl mb-4" />} message="No complaints found" suggestion="Try changing your search or filter criteria" />
      )}
      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} />}
    </div>
  )
}

export default Complaints
