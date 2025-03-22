import { useState, useEffect } from "react"
import { FaExchangeAlt, FaBed, FaUserGraduate } from "react-icons/fa"
import { MdFilterAlt, MdClearAll } from "react-icons/md"
import { hostelApi } from "../../services/apiService"
import { useWarden } from "../../contexts/WardenProvider"
import Pagination from "../../components/common/Pagination"
import NoResults from "../../components/admin/NoResults"
import SearchBar from "../../components/admin/SearchBar"
import RoomChangeRequestStats from "../../components/warden/RoomChangeRequestStats"
import RoomChangeRequestFilterSection from "../../components/warden/RoomChangeRequestFilterSection"
import RoomChangeRequestListView from "../../components/warden/RoomChangeRequestListView"
import RoomChangeRequestDetailModal from "../../components/warden/RoomChangeRequestDetailModal"

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
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">Room Change Requests</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </header>

      <RoomChangeRequestStats requests={requests} totalCount={totalItems} />

      {showFilters && (
        <div className="mt-6">
          <SearchBar value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} placeholder="Search by student name, ID or room number..." className="w-full" />
          <RoomChangeRequestFilterSection filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg ${viewMode === "table" ? "bg-[#1360AB] text-white" : "bg-white text-gray-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg ${viewMode === "card" ? "bg-[#1360AB] text-white" : "bg-white text-gray-600"}`}>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB]"></div>
        </div>
      ) : (
        <>
          <RoomChangeRequestListView requests={requests} viewMode={viewMode} onRequestClick={handleRequestClick} />

          {requests.length === 0 && !loading && <NoResults icon={<FaExchangeAlt className="mx-auto text-gray-300 text-5xl mb-4" />} message="No room change requests found" suggestion="Try changing your search or filter criteria" />}
        </>
      )}

      {totalItems > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {showDetailModal && selectedRequest && <RoomChangeRequestDetailModal requestId={selectedRequest.id} onClose={() => setShowDetailModal(false)} onUpdate={handleRequestUpdate} />}
    </div>
  )
}

export default RoomChangeRequests
