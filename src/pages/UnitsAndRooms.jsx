import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { FaBuilding, FaDoorOpen, FaFileImport, FaTable, FaThLarge } from "react-icons/fa"
import { MdFilterAlt, MdClearAll, MdMeetingRoom } from "react-icons/md"
import { hostelApi } from "../service"
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
import UnitsAndRoomsHeader from "../components/headers/UnitsAndRoomsHeader"
import { useGlobal } from "../contexts/GlobalProvider"
import { useAuth } from "../contexts/AuthProvider"
import AccessDenied from "../components/common/AccessDenied"
import { useWarden } from "../contexts/WardenProvider"
import Input from "../components/common/ui/Input"
import Checkbox from "../components/common/ui/Checkbox"
import Button from "../components/common/Button"
import ToggleButtonGroup from "../components/common/ToggleButtonGroup"

const UnitsAndRooms = () => {
  const { user, getHomeRoute } = useAuth()
  const navigate = useNavigate()
  const { hostelList, fetchHostelList } = useGlobal()
  const wardenProfile = ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user?.role) ? useWarden()?.profile : null

  const { hostelName: encodedHostelName, unitNumber } = useParams()
  const hostelName = decodeURIComponent(encodedHostelName)
  // const currentHostel = hostelList?.find((hostel) => hostel.name.toLowerCase() === hostelName.toLowerCase())

  const [viewMode, setViewMode] = useState("table")
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState([])
  const [allUnits, setAllUnits] = useState([])
  const [rooms, setRooms] = useState([])
  const [allRooms, setAllRooms] = useState([])
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
    searchTerm: "",
    minCapacity: "",
    maxCapacity: "",
    minOccupancy: "",
    maxOccupancy: "",
    showEmptyOnly: false,
  })

  const hostelId = currentHostel?._id || null

  const resetFilters = () => {
    setFilters({
      hostelId: "",
      searchTerm: "",
      minCapacity: "",
      maxCapacity: "",
      minOccupancy: "",
      maxOccupancy: "",
      showEmptyOnly: false,
    })
  }

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await hostelApi.getUnits(hostelId)
      const fetchedUnits = response || []
      setAllUnits(fetchedUnits)

      if (unitNumber && fetchedUnits.length > 0) {
        const unit = fetchedUnits.find((u) => u.unitNumber === unitNumber)
        if (unit) {
          setSelectedUnit(unit)
        }
      }
    } catch (error) {
      console.error("Error fetching units:", error)
      setAllUnits([])
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
        // Fetch all rooms for the hostel without filters
        const queryParams = {
          hostelId: hostelId,
        }
        response = await hostelApi.getRooms(queryParams)
      }

      const fetchedRooms = response?.data || []
      setAllRooms(fetchedRooms)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setAllRooms([])
    } finally {
      setLoading(false)
    }
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
    // Reset filters when navigating from units to rooms
    setFilters({
      ...filters,
      searchTerm: "",
      minCapacity: "",
      maxCapacity: "",
      minOccupancy: "",
      maxOccupancy: "",
      showEmptyOnly: false,
    })
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

  const filterRooms = () => {
    let filtered = [...allRooms]

    // For now only use searchTerm for rooms
    if (filters.searchTerm) {
      filtered = filtered.filter((room) => room.roomNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    }

    return filtered
  }

  // Get paginated rooms
  const getPaginatedRooms = (allFilteredRooms) => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return allFilteredRooms.slice(indexOfFirstItem, indexOfLastItem)
  }

  useEffect(() => {
    if (hostelId) {
      if (currentView === "units") {
        if (allUnits.length === 0) {
          fetchUnits()
        }
      } else if (currentView === "rooms") {
        if (unitNumber) {
          const findUnitAndFetchRooms = async () => {
            let unitsToSearch = allUnits
            if (unitsToSearch.length === 0) {
              setLoading(true)
              const unitResponse = await hostelApi.getUnits(hostelId)
              unitsToSearch = unitResponse || []
              setAllUnits(unitsToSearch)
              setLoading(false)
            }

            const unitObj = unitsToSearch.find((u) => u.unitNumber === unitNumber)
            if (unitObj) {
              setSelectedUnit(unitObj)
              fetchRooms(unitObj.id)
            } else {
              console.warn(`Unit ${unitNumber} not found in hostel ${hostelName}`)
              setAllRooms([])
              setRooms([])
              setTotalItems(0)
            }
          }
          findUnitAndFetchRooms()
        } else if (hostelType === "room-only") {
          fetchRooms()
        }
      }
    }
  }, [unitNumber, hostelId, hostelType, currentView])

  // Apply filters and pagination whenever filters, currentPage, or allRooms change
  useEffect(() => {
    if (currentView === "rooms") {
      const filteredRooms = filterRooms()
      setTotalItems(filteredRooms.length)
      setRooms(getPaginatedRooms(filteredRooms))
    }
  }, [filters, currentPage, allRooms, currentView])

  // Apply filters for units
  useEffect(() => {
    if (currentView === "units") {
      let filtered = [...allUnits]

      filtered = filtered.filter((unit) => {
        const capacity = parseInt(unit.capacity) || 0
        const occupancy = parseInt(unit.occupancy) || 0

        let meetsMinCapacity = true
        let meetsMaxCapacity = true
        let meetsMinOccupancy = true
        let meetsMaxOccupancy = true
        let meetsEmptyOnly = true

        if (filters.minCapacity && !isNaN(parseInt(filters.minCapacity))) {
          meetsMinCapacity = capacity >= parseInt(filters.minCapacity)
        }

        if (filters.maxCapacity && !isNaN(parseInt(filters.maxCapacity))) {
          meetsMaxCapacity = capacity <= parseInt(filters.maxCapacity)
        }

        if (filters.minOccupancy && !isNaN(parseInt(filters.minOccupancy))) {
          meetsMinOccupancy = occupancy >= parseInt(filters.minOccupancy)
        }

        if (filters.maxOccupancy && !isNaN(parseInt(filters.maxOccupancy))) {
          meetsMaxOccupancy = occupancy <= parseInt(filters.maxOccupancy)
        }

        if (filters.showEmptyOnly) {
          meetsEmptyOnly = occupancy === 0
        }

        return meetsMinCapacity && meetsMaxCapacity && meetsMinOccupancy && meetsMaxOccupancy && meetsEmptyOnly
      })

      if (filters.searchTerm) {
        filtered = filtered.filter((unit) => unit.unitNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      }

      setUnits(filtered)
      setTotalItems(filtered.length || 0)
    }
  }, [allUnits, filters, currentView])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    if (hostelList) {
      setCurrentHostel(hostelList?.find((hostel) => hostel.name.toLowerCase() === hostelName.toLowerCase()))
    }
  }, [hostelList])

  useEffect(() => {
    if (wardenProfile) {
      const activeHostel = wardenProfile.activeHostelId?.name
      if (activeHostel && currentHostel) {
        if (activeHostel !== currentHostel) {
          const navigateTo = `${getHomeRoute()}/hostels/${activeHostel}`
          navigate(navigateTo)
        }
      }
    }
  }, [wardenProfile, currentHostel])

  useEffect(() => {
    if (!currentHostel) {
      fetchHostelList()
    }
  }, [currentHostel, fetchHostelList])

  if (!currentHostel) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Hostel not found</div>
  }

  if (wardenProfile?.hostelIds > 0 && !wardenProfile.hostelIds.includes(currentHostel._id)) {
    return <AccessDenied />
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const dynamicTitle = `${currentHostel.name}: ${hostelType === "unit-based" ? (currentView === "units" ? "Unit Management" : `Rooms in ${selectedUnit?.unitNumber || unitNumber || "Selected Unit"}`) : "Room Management"}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <UnitsAndRoomsHeader title={dynamicTitle} showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)}
        onBackToUnits={goBackToUnits}
        onUpdateAllocations={() => setShowUploadModal(true)}
        showBackToUnits={hostelType === "unit-based" && currentView === "rooms"}
        showBackToHostels={true}
        showUpdateAllocations={true}
        userRole={user.role}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-6) var(--spacing-8)' }}>

        {hostelType === "unit-based" ? <UnitStats units={units} rooms={rooms} currentView={currentView} totalCount={totalItems} /> : <RoomStats rooms={rooms} totalCount={totalItems} />}

        {showFilters && (
          <div style={{ marginTop: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-5)', border: 'var(--border-1) solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)', paddingBottom: 'var(--spacing-3)', borderBottom: 'var(--border-1) solid var(--color-border-light)' }} className="sm:flex-row sm:items-center">
                <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-body)', display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-2)' }} className="sm:mb-0">
                  <MdFilterAlt style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)' }} /> Advanced Filters
                </h3>
                <Button onClick={resetFilters} variant="ghost" size="small" icon={<MdClearAll />}>
                  Reset Filters
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--gap-md)' }} className="sm:grid-cols-2 lg:grid-cols-4">
                <SearchBar value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} placeholder={`Search ${hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"}...`} className="w-full sm:col-span-2 lg:col-span-1" />

                {/* Only show all filters for units view */}
                {hostelType === "unit-based" && currentView === "units" && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="minCapacity" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
                        Min Capacity
                      </label>
                      <Input id="minCapacity" type="number" min="0" value={filters.minCapacity} onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })} placeholder="Any" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="maxCapacity" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
                        Max Capacity
                      </label>
                      <Input id="maxCapacity" type="number" min="0" value={filters.maxCapacity} onChange={(e) => setFilters({ ...filters, maxCapacity: e.target.value })} placeholder="Any" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="minOccupancy" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
                        Min Occupancy
                      </label>
                      <Input id="minOccupancy" type="number" min="0" value={filters.minOccupancy} onChange={(e) => setFilters({ ...filters, minOccupancy: e.target.value })} placeholder="Any" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="maxOccupancy" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
                        Max Occupancy
                      </label>
                      <Input id="maxOccupancy" type="number" min="0" value={filters.maxOccupancy} onChange={(e) => setFilters({ ...filters, maxOccupancy: e.target.value })} placeholder="Any" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 'var(--spacing-4)' }} className="sm:pt-0 sm:items-end sm:pb-1">
                      <Checkbox id="showEmptyOnly" checked={filters.showEmptyOnly} onChange={(e) => setFilters({ ...filters, showEmptyOnly: e.target.checked })} label="Show Empty Units Only" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Showing <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{hostelType === "unit-based" ? (currentView === "units" ? units.length : rooms.length) : rooms.length}</span> {hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"}
            {totalItems > 0 && ` of ${totalItems} total`}
          </div>
          <ToggleButtonGroup
            options={[
              { value: "table", icon: <FaTable />, ariaLabel: "Table view" },
              { value: "card", icon: <FaThLarge />, ariaLabel: "Card view" },
            ]}
            value={viewMode}
            onChange={setViewMode}
            shape="rounded"
            size="medium"
            variant="muted"
            hideLabelsOnMobile={false}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
            <div style={{ position: 'relative', width: '4rem', height: '4rem' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'var(--border-4) solid var(--color-border-primary)', borderRadius: 'var(--radius-full)' }}></div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'var(--border-4) solid var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', borderTopColor: 'transparent' }}></div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 'var(--spacing-4)' }}>{hostelType === "unit-based" && currentView === "units" ? <UnitListView units={units} viewMode={viewMode} onUnitClick={handleUnitClick} /> : <RoomListView rooms={rooms} viewMode={viewMode} onRoomClick={handleRoomClick} onAllocateClick={handleAllocateStudent} />}</div>

            {((hostelType === "unit-based" && currentView === "units" && units.length === 0) || (((hostelType === "unit-based" && currentView === "rooms") || hostelType === "room-only") && rooms.length === 0)) && !loading && (
              <NoResults icon={hostelType === "unit-based" && currentView === "units" ? <FaBuilding style={{ color: 'var(--color-text-placeholder)', fontSize: 'var(--font-size-4xl)' }} /> : <MdMeetingRoom style={{ color: 'var(--color-text-placeholder)', fontSize: 'var(--font-size-4xl)' }} />}
                message={`No ${hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"} found`}
                suggestion="Try changing your search or filter criteria"
              />
            )}
          </>
        )}

        {totalPages > 1 && (
          <div style={{ marginTop: 'var(--spacing-6)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
          </div>
        )}

        {showRoomDetail && selectedRoom && <RoomDetailModal room={selectedRoom} onClose={() => setShowRoomDetail(false)} onUpdate={handleUpdateSuccess} onAllocate={() => setShowAllocateModal(true)} />}

        {showAllocateModal && selectedRoom && <AllocateStudentModal room={selectedRoom} isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} onSuccess={handleAllocationSuccess} />}

        {showUploadModal && <UpdateAllocationModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onAllocate={handleUpdateAllocations} />}
      </div>
    </div>
  )
}

export default UnitsAndRooms
