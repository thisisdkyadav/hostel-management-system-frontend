import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { FaBuilding, FaDoorOpen, FaFileImport } from "react-icons/fa"
import { MdFilterAlt, MdClearAll, MdMeetingRoom } from "react-icons/md"
import { hostelApi } from "../services/hostelApi"
import Pagination from "../components/common/Pagination"
import NoResults from "../components/common/NoResults"
import UnitStats from "../components/wardens/UnitStats"
import UnitListView from "../components/wardens/UnitListView"
import RoomListView from "../components/wardens/RoomListView"
import RoomDetailModal from "../components/wardens/RoomDetailModal"
import AllocateStudentModal from "../components/wardens/AllocateStudentModal"
import SearchBar from "../components/common/SearchBar"
import RoomStats from "../components/wardens/RoomStats"
import UpdateAllocationModal from "../components/common/students/UpdateAllocationModal"
import { useGlobal } from "../contexts/GlobalProvider"
import { useAuth } from "../contexts/AuthProvider"
import AccessDenied from "../components/common/AccessDenied"

const UnitsAndRooms = () => {
  const { user, getHomeRoute } = useAuth()
  const navigate = useNavigate()
  const { hostelList, fetchHostelList } = useGlobal()
  console.log("Hostel List:", hostelList)

  const { hostelName: encodedHostelName, unitNumber } = useParams()
  const hostelName = decodeURIComponent(encodedHostelName)
  // const currentHostel = hostelList?.find((hostel) => hostel.name.toLowerCase() === hostelName.toLowerCase())

  const [viewMode, setViewMode] = useState("table")
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState([])
  const [rooms, setRooms] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(true)
  const [currentHostel, setCurrentHostel] = useState(null)
  const hostelType = currentHostel?.type || "unit-based"

  const currentView = unitNumber ? "rooms" : hostelType === "room-only" ? "rooms" : "units"

  const [filters, setFilters] = useState({
    hostelId: "",
    floorNumber: "",
    occupancyStatus: "",
    roomType: "",
    searchTerm: "",
  })

  const hostelId = currentHostel?._id || null

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
      const response = await hostelApi.getUnits(hostelId)
      console.log("Units response:", response)

      let filteredUnits = response || []
      if (filters.searchTerm) {
        filteredUnits = filteredUnits.filter((unit) => unit.unitNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      }

      setUnits(filteredUnits)
      setTotalItems(filteredUnits.length || 0)

      if (unitNumber && filteredUnits.length > 0) {
        const unit = filteredUnits.find((u) => u.unitNumber === unitNumber)
        if (unit) {
          setSelectedUnit(unit)
        }
      }
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
        response = await hostelApi.getRoomsByUnit(unitId)
      } else {
        const queryParams = {
          page: currentPage,
          limit: itemsPerPage,
          hostelId: hostelId,
          ...buildRoomFilterParams(),
        }
        response = await hostelApi.getRooms(queryParams)
      }

      console.log("Rooms response:", response)

      let filteredRooms = response?.data || []

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
      fetchUnits()

      if (currentView === "rooms" && unitNumber) {
        const unitObj = units.find((u) => u.unitNumber === unitNumber)
        if (unitObj) {
          fetchRooms(unitObj.id)
        }
      }
    } else {
      fetchRooms()
    }
  }

  const handleUpdateAllocations = async (allocations, hostelId) => {
    try {
      setLoading(true)
      const response = await hostelApi.updateRoomAllocations(allocations, hostelId)
      console.log("Update allocations response:", response)
      if (response.success) {
        setShowAllocateModal(false)
        const navigateTo = `${getHomeRoute()}/hostels/${encodedHostelName}`
        navigate(navigateTo)

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
    navigate(`${getHomeRoute()}/hostels/${encodedHostelName}/units/${unit.unitNumber}`)
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
    if (unitNumber) {
      const unitObj = units.find((u) => u.unitNumber === unitNumber)
      if (unitObj) {
        fetchRooms(unitObj.id)
      }
    } else {
      fetchRooms()
    }
    setShowAllocateModal(false)
    setShowRoomDetail(false)
    setSelectedRoom(null)
  }

  const handleUpdateSuccess = () => {
    fetchData()
    setShowRoomDetail(false)
  }

  const goBackToUnits = () => {
    navigate(`${getHomeRoute()}/hostels/${encodedHostelName}`)
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  useEffect(() => {
    if (hostelId) {
      if (currentView === "units" || (currentView === "rooms" && !unitNumber)) {
        fetchUnits()
      }

      if (currentView === "rooms") {
        if (unitNumber) {
          fetchUnits().then(() => {
            const unitObj = units.find((u) => u.unitNumber === unitNumber)
            if (unitObj) {
              setSelectedUnit(unitObj)
              fetchRooms(unitObj.id)
            }
          })
        } else if (hostelType === "room-only") {
          fetchRooms()
        }
      }
    }
  }, [currentPage, unitNumber, hostelId, hostelType])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    if (units.length > 0 && unitNumber) {
      const unitObj = units.find((u) => u.unitNumber === unitNumber)
      if (unitObj) {
        setSelectedUnit(unitObj)
        fetchRooms(unitObj.id)
      }
    }
  }, [units, unitNumber])

  useEffect(() => {
    if (hostelList) {
      setCurrentHostel(hostelList?.find((hostel) => hostel.name.toLowerCase() === hostelName.toLowerCase()))
    }
  }, [hostelList])

  useEffect(() => {
    if (!currentHostel) {
      fetchHostelList()
    }
  }, [currentHostel, fetchHostelList])

  if (!currentHostel) {
    return <div className="flex justify-center items-center h-screen">Hostel not found</div>
  }

  if (user.hostel && user.hostel._id !== currentHostel?._id) {
    return <AccessDenied />
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          {currentHostel.name}: {hostelType === "unit-based" ? (currentView === "units" ? "Unit Management" : `Rooms in ${selectedUnit?.unitNumber || unitNumber || "Selected Unit"}`) : "Room Management"}
        </h1>
        <div className="flex flex-wrap gap-2">
          {hostelType === "unit-based" && currentView === "rooms" && (
            <button onClick={goBackToUnits} className="flex items-center px-3 py-2 text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
              <FaBuilding className="mr-2" /> Back to Units
            </button>
          )}

          {["Admin"].includes(user.role) && (
            <Link to="/admin/hostels" className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
              <FaBuilding className="mr-2" /> Back to Hostels
            </Link>
          )}

          {["Admin"].includes(user.role) && (
            <button className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setShowUploadModal(true)}>
              <FaFileImport className="mr-2" /> Update Allocations
            </button>
          )}

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
