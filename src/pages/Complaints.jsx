import { useState, useEffect } from "react"
import { FaClipboardList, FaFilter, FaPlus } from "react-icons/fa"
import { filterComplaints } from "../utils/adminUtils"
import FilterTabs from "../components/common/FilterTabs"
import SearchBar from "../components/common/SearchBar"
import NoResults from "../components/common/NoResults"
import ComplaintStats from "../components/complaints/ComplaintStats"
import ComplaintDetailModal from "../components/complaints/ComplaintDetailModal"
import ComplaintListView from "../components/complaints/ComplaintListView"
import ComplaintCardView from "../components/complaints/ComplaintCardView"
import ComplaintForm from "../components/student/ComplaintForm"
import { COMPLAINT_FILTER_TABS } from "../constants/adminConstants"
import { adminApi } from "../services/apiService"
import { useGlobal } from "../contexts/GlobalProvider"
import { useAuth } from "../contexts/AuthProvider"

const Complaints = () => {
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const hostels = hostelList

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterHostel, setFilterHostel] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [showCraftComplaint, setShowCraftComplaint] = useState(false)
  const [complaints, setComplaints] = useState([])

  const categories = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other"]
  const priorities = ["Low", "Medium", "High", "Urgent"]
  const filteredComplaints = filterComplaints(complaints, filterStatus, filterPriority, filterCategory, filterHostel, searchTerm)

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const fetchComplaints = async () => {
    try {
      const response = await adminApi.getAllComplaints()
      console.log("Fetched complaints:", response)

      setComplaints(response || [])
    } catch (error) {
      console.error("Error fetching complaints:", error)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Complaints Management</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center px-3 py-2 rounded-xl ${showFilters ? "bg-[#1360AB] text-white" : "bg-white text-gray-700 border border-gray-200"}`}>
            <FaFilter className="mr-2" /> Filters
          </button>

          <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 flex items-center justify-center ${viewMode === "list" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700"}`} aria-label="List view">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => setViewMode("cards")} className={`px-3 py-2 flex items-center justify-center ${viewMode === "cards" ? "bg-[#1360AB] text-white" : "bg-white text-gray-700"}`} aria-label="Card view">
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

          {["Student"].includes(user?.role) && (
            <button onClick={() => setShowCraftComplaint(true)} className="flex items-center px-4 py-2 bg-[#1360AB] text-white rounded-xl shadow-md hover:bg-[#0d4b86] transition-colors">
              <FaPlus className="mr-2" /> Create Complaint
            </button>
          )}
        </div>
      </header>

      <ComplaintStats complaints={complaints} />

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <FilterTabs tabs={COMPLAINT_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
        </div>
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search complaints..." className="w-full sm:w-64 md:w-72" />
      </div>

      {showFilters && (
        <div className="mt-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 flex items-center mb-2 sm:mb-0">
              <FaFilter className="mr-2 text-[#1360AB]" /> Advanced Filters
            </h3>
            <button
              onClick={() => {
                setFilterHostel("all")
                setFilterCategory("all")
                setFilterPriority("all")
              }}
              className="text-sm text-gray-500 hover:text-[#1360AB] flex items-center px-2 py-1 hover:bg-gray-50 rounded-md transition-colors"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Hostel</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filterHostel} onChange={(e) => setFilterHostel(e.target.value)}>
                <option value="all">All Hostels</option>
                {hostels.map((hostel, index) => (
                  <option key={index} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Priority</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
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

      {filteredComplaints.length > 0 ? (
        viewMode === "list" ? (
          <div className="mt-6">
            <ComplaintListView complaints={filteredComplaints} onViewDetails={viewComplaintDetails} />
          </div>
        ) : (
          <div className="mt-6">
            <ComplaintCardView complaints={filteredComplaints} onViewDetails={viewComplaintDetails} />
          </div>
        )
      ) : (
        <div className="mt-12">
          <NoResults icon={<FaClipboardList className="text-gray-300 text-5xl" />} message="No complaints found" suggestion="Try changing your search or filter criteria" />
        </div>
      )}

      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} />}

      {showCraftComplaint && ["Student"].includes(user?.role) && <ComplaintForm isOpen={showCraftComplaint} setIsOpen={setShowCraftComplaint} />}
    </div>
  )
}

export default Complaints
