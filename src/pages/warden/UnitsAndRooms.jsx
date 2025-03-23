import { useState, useEffect } from "react"
import { FaBuilding } from "react-icons/fa"
import { MdFilterAlt, MdClearAll, MdMeetingRoom } from "react-icons/md"
import { useGlobal } from "../../contexts/GlobalProvider"
import { hostelApi } from "../../services/apiService"
import Pagination from "../../components/common/Pagination"
import NoResults from "../../components/common/NoResults"
import UnitStats from "../../components/warden/UnitStats"
import UnitListView from "../../components/warden/UnitListView"
import RoomListView from "../../components/warden/RoomListView"
import RoomDetailModal from "../../components/warden/RoomDetailModal"
import AllocateStudentModal from "../../components/warden/AllocateStudentModal"
import SearchBar from "../../components/common/SearchBar"
import { useWarden } from "../../contexts/WardenProvider"

const UnitsAndRooms = () => {
  const { hostelList = [] } = useGlobal()
  const { profile } = useWarden()
  // View state
  const [viewMode, setViewMode] = useState("table")
  const [currentView, setCurrentView] = useState("units") // "units" or "rooms"
  const [showFilters, setShowFilters] = useState(true)

  // Data state
  const [units, setUnits] = useState([])
  const [rooms, setRooms] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Modal state
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filters
  const [filters, setFilters] = useState({
    hostelId: "",
    floorNumber: "",
    occupancyStatus: "", // "full", "partial", "empty"
    roomType: "", // "single", "double", "triple", etc.
    searchTerm: "",
  })

  const resetFilters = () => {
    setFilters({
      hostelId: "",
      floorNumber: "",
      occupancyStatus: "",
      roomType: "",
      searchTerm: "",
    })
    fetchData()
  }
  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await hostelApi.getUnits(profile.hostelId._id)
      console.log("Units response:", response)

      let filteredUnits = response || []
      if (filters.searchTerm) {
        filteredUnits = filteredUnits.filter((unit) => unit.unitNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      }

      setUnits(filteredUnits)
      setTotalItems(filteredUnits.length || 0)
    } catch (error) {
      console.error("Error fetching units:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async (unitId) => {
    try {
      setLoading(true)
      const response = await hostelApi.getRoomsByUnit(unitId)
      console.log("Rooms response:", response)

      setRooms(response?.data || [])
      setTotalItems(response?.meta?.total || 0)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = () => {
    if (currentView === "units") {
      fetchUnits()
    } else if (currentView === "rooms" && selectedUnit) {
      fetchRooms(selectedUnit.id)
    }
  }

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit)
    setCurrentView("rooms")
    fetchRooms(unit.id)
  }

  const handleRoomClick = (room) => {
    setSelectedRoom(room)
    setShowRoomDetail(true)
  }

  const handleAllocateStudent = (room) => {
    setSelectedRoom(room)
    setShowAllocateModal(true)
  }

  const handleAllocationSuccess = () => {
    fetchRooms(selectedUnit.id)
    setShowAllocateModal(false)
  }

  const handleUpdateSuccess = () => {
    fetchData()
    setShowRoomDetail(false)
  }

  const goBackToUnits = () => {
    setCurrentView("units")
    setSelectedUnit(null)
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  useEffect(() => {
    fetchData()
  }, [currentPage, currentView, filters, profile])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">{currentView === "units" ? "Unit Management" : `Rooms in ${selectedUnit?.name || "Selected Unit"}`}</h1>
        <div className="flex flex-wrap gap-2">
          {currentView === "rooms" && (
            <button onClick={goBackToUnits} className="flex items-center px-3 py-2 text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
              <FaBuilding className="mr-2" /> Back to Units
            </button>
          )}

          <button className="flex items-center px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </header>

      <UnitStats units={units} rooms={rooms} currentView={currentView} totalCount={totalItems} />

      {showFilters && (
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-700 flex items-center mb-2 sm:mb-0">
                <MdFilterAlt className="mr-2 text-[#1360AB]" /> Advanced Filters
              </h3>
              <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-[#1360AB] flex items-center px-2 py-1 hover:bg-gray-50 rounded-md transition-colors">
                <MdClearAll className="mr-1" /> Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SearchBar value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} placeholder={`Search ${currentView === "units" ? "units" : "rooms"}...`} className="w-full" />

              {/* Additional filters can be added here */}
              {currentView === "rooms" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Occupancy Status</label>
                    <select value={filters.occupancyStatus} onChange={(e) => setFilters({ ...filters, occupancyStatus: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white">
                      <option value="">All Statuses</option>
                      <option value="full">Full</option>
                      <option value="partial">Partially Occupied</option>
                      <option value="empty">Empty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Room Type</label>
                    <select value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white">
                      <option value="">All Types</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{currentView === "units" ? units.length : rooms.length}</span> {currentView}
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
          <div className="mt-4">{currentView === "units" ? <UnitListView units={units} viewMode={viewMode} onUnitClick={handleUnitClick} /> : <RoomListView rooms={rooms} viewMode={viewMode} onRoomClick={handleRoomClick} onAllocateClick={handleAllocateStudent} />}</div>

          {((currentView === "units" && units.length === 0) || (currentView === "rooms" && rooms.length === 0)) && !loading && (
            <NoResults icon={currentView === "units" ? <FaBuilding className="text-gray-300 text-4xl" /> : <MdMeetingRoom className="text-gray-300 text-4xl" />} message={`No ${currentView} found`} suggestion="Try changing your search or filter criteria" />
          )}
        </>
      )}

      {totalItems > itemsPerPage && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {showRoomDetail && selectedRoom && <RoomDetailModal room={selectedRoom} onClose={() => setShowRoomDetail(false)} onUpdate={handleUpdateSuccess} onAllocate={() => setShowAllocateModal(true)} />}

      {showAllocateModal && selectedRoom && <AllocateStudentModal room={selectedRoom} isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} onSuccess={handleAllocationSuccess} />}
    </div>
  )
}

export default UnitsAndRooms
