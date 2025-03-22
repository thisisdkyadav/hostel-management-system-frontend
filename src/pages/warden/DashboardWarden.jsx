import { useState, useEffect } from "react"
import { FaBuilding, FaDoorOpen, FaUserPlus } from "react-icons/fa"
import { MdFilterAlt, MdClearAll, MdMeetingRoom } from "react-icons/md"
import { useGlobal } from "../../contexts/GlobalProvider"
import { useAuth } from "../../contexts/AuthProvider"
import { hostelApi } from "../../services/apiService"
import Pagination from "../../components/common/Pagination"
import NoResults from "../../components/admin/NoResults"
import UnitStats from "../../components/warden/UnitStats"
import UnitFilterSection from "../../components/warden/UnitFilterSection"
import UnitListView from "../../components/warden/UnitListView"
import RoomListView from "../../components/warden/RoomListView"
import RoomDetailModal from "../../components/warden/RoomDetailModal"
import AllocateStudentModal from "../../components/warden/AllocateStudentModal"
import SearchBar from "../../components/admin/SearchBar"
import { useWarden } from "../../contexts/WardenProvider"

const DashboardWarden = () => {
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
    <div className="px-10 py-6 flex-1">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-2xl px-3 font-bold">{currentView === "units" ? "Unit Management" : `Rooms in ${selectedUnit?.name || "Selected Unit"}`}</h1>
        <div className="flex items-center space-x-4">
          {currentView === "rooms" && (
            <button onClick={goBackToUnits} className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100">
              <FaBuilding className="mr-2" /> Back to Units
            </button>
          )}

          <button className="flex items-center px-3 py-2 text-gray-600 bg-white rounded-[12px] hover:bg-gray-100" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <MdClearAll className="mr-2" /> : <MdFilterAlt className="mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </header>

      <UnitStats units={units} rooms={rooms} currentView={currentView} totalCount={totalItems} />

      {showFilters && (
        <div className="mt-6">
          <SearchBar value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} placeholder={`Search ${currentView === "units" ? "units" : "rooms"}...`} className="w-full" />
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
          {currentView === "units" ? <UnitListView units={units} viewMode={viewMode} onUnitClick={handleUnitClick} /> : <RoomListView rooms={rooms} viewMode={viewMode} onRoomClick={handleRoomClick} onAllocateClick={handleAllocateStudent} />}

          {((currentView === "units" && units.length === 0) || (currentView === "rooms" && rooms.length === 0)) && !loading && (
            <NoResults
              icon={currentView === "units" ? <FaBuilding className="mx-auto text-gray-300 text-5xl mb-4" /> : <MdMeetingRoom className="mx-auto text-gray-300 text-5xl mb-4" />}
              message={`No ${currentView === "units" ? "units" : "rooms"} found`}
              suggestion="Try changing your search or filter criteria"
            />
          )}
        </>
      )}

      {totalItems > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

      {showRoomDetail && selectedRoom && <RoomDetailModal room={selectedRoom} onClose={() => setShowRoomDetail(false)} onUpdate={handleUpdateSuccess} onAllocate={() => setShowAllocateModal(true)} />}

      {showAllocateModal && selectedRoom && <AllocateStudentModal room={selectedRoom} isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} onSuccess={handleAllocationSuccess} />}
    </div>
  )
}

export default DashboardWarden
