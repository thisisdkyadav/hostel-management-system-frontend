import { useState, useEffect } from "react"
import { FaBuilding, FaDoorOpen, FaFileImport } from "react-icons/fa"
import { MdFilterAlt, MdClearAll, MdMeetingRoom } from "react-icons/md"
import { hostelApi } from "../../services/apiService"
import Pagination from "../../components/common/Pagination"
import NoResults from "../../components/common/NoResults"
import UnitStats from "../../components/wardens/UnitStats"
import UnitListView from "../../components/wardens/UnitListView"
import RoomListView from "../../components/wardens/RoomListView"
import RoomDetailModal from "../../components/wardens/RoomDetailModal"
import AllocateStudentModal from "../../components/wardens/AllocateStudentModal"
import SearchBar from "../../components/common/SearchBar"
import { useWarden } from "../../contexts/WardenProvider"
import RoomStats from "../../components/wardens/RoomStats"
import UpdateAllocationModal from "../../components/wardens/UpdateAllocationModal"

const UnitsAndRooms = () => {
  const { profile } = useWarden()

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  const hostelType = profile.hostelId?.type || "unit-based" // "unit-based" or "room-only"

  // View state
  const [viewMode, setViewMode] = useState("table")
  const [currentView, setCurrentView] = useState(hostelType === "room-only" ? "rooms" : "units") // "units" or "rooms"
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
  const [showUploadModal, setShowUploadModal] = useState(false)

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

  const fetchRooms = async (unitId = null) => {
    try {
      setLoading(true)
      let response

      if (hostelType === "unit-based" && unitId) {
        // Fetch rooms for a specific unit
        response = await hostelApi.getRoomsByUnit(unitId)
      } else {
        // Fetch all rooms for room-only hostel with pagination
        const queryParams = {
          page: currentPage,
          limit: itemsPerPage,
          hostelId: profile.hostelId._id,
          ...buildRoomFilterParams(),
        }
        response = await hostelApi.getRooms(queryParams)
      }

      console.log("Rooms response:", response)

      let filteredRooms = response?.data || []

      // Apply client-side filtering if needed for unit-based hostels
      if (hostelType === "unit-based" && filters.searchTerm) {
        filteredRooms = filteredRooms.filter((room) => room.roomNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      }

      setRooms(filteredRooms)
      setTotalItems(response?.meta?.total || filteredRooms.length || 0)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  // Build query parameters for room filtering
  const buildRoomFilterParams = () => {
    const params = {}

    if (filters.searchTerm) {
      params.search = filters.searchTerm
    }

    if (filters.floorNumber) {
      params.floorNumber = filters.floorNumber
    }

    if (filters.roomType) {
      params.roomType = filters.roomType
    }

    if (filters.occupancyStatus) {
      params.occupancyStatus = filters.occupancyStatus
    }

    return params
  }

  const fetchData = () => {
    if (hostelType === "unit-based") {
      if (currentView === "units") {
        fetchUnits()
      } else if (currentView === "rooms" && selectedUnit) {
        fetchRooms(selectedUnit.id)
      }
    } else {
      // Room-only hostel
      fetchRooms()
    }
  }

  const handleUpdateAllocations = async (allocations) => {
    try {
      setLoading(true)
      const response = await hostelApi.updateRoomAllocations(allocations)
      console.log("Update allocations response:", response)
      if (response.success) {
        setShowAllocateModal(false)
        fetchUnits()
        setCurrentView("units")
        setSelectedUnit(null)
        const errors = response.errors || []
        if (errors.length > 0) {
          alert(`Some allocations failed: ${errors.map((error) => `${error.rollNumber}: ${error.message}`).join(", ")}`)
        } else {
          alert("Allocations updated successfully")
        }
        return true
      } else {
        alert("Failed to update allocations")
        return false
      }
    } catch (error) {
      alert("An error occurred while updating allocations")
      return false
    } finally {
      setLoading(false)
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
    if (hostelType === "unit-based" && selectedUnit) {
      fetchRooms(selectedUnit.id)
    } else {
      fetchRooms()
    }
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

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Update data when relevant states change
  useEffect(() => {
    fetchData()
  }, [currentPage, currentView, filters, profile, hostelType])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">{hostelType === "unit-based" ? (currentView === "units" ? "Unit Management" : `Rooms in ${selectedUnit?.unitNumber || "Selected Unit"}`) : "Room Management"}</h1>
        <div className="flex flex-wrap gap-2">
          {hostelType === "unit-based" && currentView === "rooms" && (
            <button onClick={goBackToUnits} className="flex items-center px-3 py-2 text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
              <FaBuilding className="mr-2" /> Back to Units
            </button>
          )}

          <button className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowUploadModal(true)}>
            <FaFileImport className="mr-2" /> Update Allocations
          </button>

          <button className="flex items-center px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </header>

      {hostelType === "unit-based" ? <UnitStats units={units} rooms={rooms} currentView={currentView} totalCount={totalItems} /> : <RoomStats rooms={rooms} totalCount={totalItems} />}

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
              <SearchBar value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} placeholder={`Search ${hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"}...`} className="w-full" />

              {(hostelType === "room-only" || (hostelType === "unit-based" && currentView === "rooms")) && (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Floor</label>
                    <select value={filters.floorNumber} onChange={(e) => setFilters({ ...filters, floorNumber: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-white">
                      <option value="">All Floors</option>
                      <option value="0">Ground Floor</option>
                      <option value="1">1st Floor</option>
                      <option value="2">2nd Floor</option>
                      <option value="3">3rd Floor</option>
                      <option value="4">4th Floor</option>
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
          Showing <span className="font-semibold">{hostelType === "unit-based" ? (currentView === "units" ? units.length : rooms.length) : rooms.length}</span> {hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"}
          {hostelType === "room-only" && totalItems > 0 && ` of ${totalItems} total`}
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
          <div className="mt-4">{hostelType === "unit-based" && currentView === "units" ? <UnitListView units={units} viewMode={viewMode} onUnitClick={handleUnitClick} /> : <RoomListView rooms={rooms} viewMode={viewMode} onRoomClick={handleRoomClick} onAllocateClick={handleAllocateStudent} />}</div>

          {((hostelType === "unit-based" && currentView === "units" && units.length === 0) || (((hostelType === "unit-based" && currentView === "rooms") || hostelType === "room-only") && rooms.length === 0)) && !loading && (
            <NoResults
              icon={hostelType === "unit-based" && currentView === "units" ? <FaBuilding className="text-gray-300 text-4xl" /> : <MdMeetingRoom className="text-gray-300 text-4xl" />}
              message={`No ${hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"} found`}
              suggestion="Try changing your search or filter criteria"
            />
          )}
        </>
      )}

      {/* Pagination - only show for room-only hostels or when total exceeds itemsPerPage */}
      {(hostelType === "room-only" || (hostelType === "unit-based" && totalItems > itemsPerPage)) && (
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
        </div>
      )}

      {showRoomDetail && selectedRoom && <RoomDetailModal room={selectedRoom} onClose={() => setShowRoomDetail(false)} onUpdate={handleUpdateSuccess} onAllocate={() => setShowAllocateModal(true)} />}

      {showAllocateModal && selectedRoom && <AllocateStudentModal room={selectedRoom} isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} onSuccess={handleAllocationSuccess} />}

      {showUploadModal && <UpdateAllocationModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onAllocate={handleUpdateAllocations} />}
    </div>
  )
}

export default UnitsAndRooms
