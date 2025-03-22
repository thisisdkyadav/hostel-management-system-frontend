import { useState, useEffect } from "react"
import { FaExchangeAlt, FaBed, FaUserGraduate } from "react-icons/fa"
import { MdFilterAlt, MdClearAll } from "react-icons/md"
import { hostelApi } from "../../services/apiService"
import { useWarden } from "../../contexts/WardenProvider"
import Pagination from "../../components/common/Pagination"
import NoResults from "../../components/common/NoResults"
import SearchBar from "../../components/common/SearchBar"
import RoomChangeRequestStats from "../../components/Warden/Room/RoomChangeRequestStats"
import RoomChangeRequestFilterSection from "../../components/Warden/Room/RoomChangeRequestFilterSection"
import RoomChangeRequestListView from "../../components/Warden/Room/RoomChangeRequestListView"
import RoomChangeRequestDetailModal from "../../components/Warden/Room/RoomChangeRequestDetailModal"

const RoomChangeRequests = () => {
  const { profile } = useWarden()

  // View state
  const [viewMode, setViewMode] = useState("table")
  const [showFilters, setShowFilters] = useState(true)

  // Data state
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    searchTerm: "",
  })

  const resetFilters = () => {
    setFilters({
      status: "",
      priority: "",
      searchTerm: "",
    })
  }

  const fetchRequests = async () => {
    try {
      if (!profile?.hostelId?._id) {
        return
      }

      setLoading(true)
      // Replace with actual API call
      const response = await hostelApi.getRoomChangeRequests(
        // {
        profile.hostelId?._id
        // page: currentPage,
        // limit: itemsPerPage,
        // ...filters,
        //   }
      )

      console.log("Room Change Requests:", response)

      setRequests(response || [])
      setTotalItems(response.length || 0)
    } catch (error) {
      console.error("Error fetching room change requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestClick = (request) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const handleRequestUpdate = async () => {
    await fetchRequests()
    setShowDetailModal(false)
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  useEffect(() => {
    fetchRequests()
  }, [currentPage, filters, profile])
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Room Change Requests</h1>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-3 py-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </header>

      <RoomChangeRequestStats requests={requests} totalCount={totalItems} />

      {showFilters && (
        <div className="mt-6">
          <SearchBar value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} placeholder="Search by student name, ID or room number..." className="w-full mb-4" />
          <RoomChangeRequestFilterSection filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{requests.length}</span> requests
        </div>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-[#1360AB] text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-200"}`} aria-label="Table view">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-[#1360AB] text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-200"}`} aria-label="Card view">
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <RoomChangeRequestListView requests={requests} viewMode={viewMode} onRequestClick={handleRequestClick} />
          </div>

          {requests.length === 0 && !loading && <NoResults icon={<FaExchangeAlt className="text-gray-300 text-4xl" />} message="No room change requests found" suggestion="Try changing your search or filter criteria" />}
        </>
      )}

      {totalItems > itemsPerPage && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {showDetailModal && selectedRequest && <RoomChangeRequestDetailModal requestId={selectedRequest.id} onClose={() => setShowDetailModal(false)} onUpdate={handleRequestUpdate} />}
    </div>
  )
}

export default RoomChangeRequests
