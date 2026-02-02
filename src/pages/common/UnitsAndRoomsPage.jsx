import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { FaBuilding, FaDoorOpen } from "react-icons/fa"
import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import NoResults from "../../components/common/NoResults"
import UnitStats from "../../components/wardens/UnitStats"
import UnitListView from "../../components/wardens/UnitListView"
import RoomListView from "../../components/wardens/RoomListView"
import RoomDetailModal from "../../components/wardens/RoomDetailModal"
import AllocateStudentModal from "../../components/wardens/AllocateStudentModal"
import RoomStats from "../../components/wardens/RoomStats"
import UnitsAndRoomsHeader from "../../components/headers/UnitsAndRoomsHeader"
import { useGlobal } from "../../contexts/GlobalProvider"
import { useAuth } from "../../contexts/AuthProvider"
import AccessDenied from "../../components/common/AccessDenied"
import { useWarden } from "../../contexts/WardenProvider"
import { hostelApi } from "../../service"
import { Input, Checkbox, Card, HStack, VStack, Label, Divider, Badge } from "@/components/ui"
import { Button } from "czero/react"
import { MdMeetingRoom } from "react-icons/md"

const UnitsAndRoomsPage = () => {
  const { user, getHomeRoute } = useAuth()
  const navigate = useNavigate()
  const { hostelList, fetchHostelList } = useGlobal()
  const wardenProfile = ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user?.role) ? useWarden()?.profile : null

  const { hostelName: encodedHostelName, unitNumber } = useParams()
  const hostelName = decodeURIComponent(encodedHostelName)
  // const currentHostel = hostelList?.find((hostel) => hostel.name.toLowerCase() === hostelName.toLowerCase())

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

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
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



  const filterRooms = () => {
    let filtered = [...allRooms]

    // For now only use searchTerm for rooms
    if (filters.searchTerm) {
      filtered = filtered.filter((room) => room.roomNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    }

    return filtered
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

  // Apply filters whenever filters or allRooms change
  useEffect(() => {
    if (currentView === "rooms") {
      const filteredRooms = filterRooms()
      setTotalItems(filteredRooms.length)
      setRooms(filteredRooms)
    }
  }, [filters, allRooms, currentView])

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



  const dynamicTitle = `${currentHostel.name}: ${hostelType === "unit-based" ? (currentView === "units" ? "Unit Management" : `Rooms in ${selectedUnit?.unitNumber || unitNumber || "Selected Unit"}`) : "Room Management"}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <UnitsAndRoomsHeader title={dynamicTitle}
        onBackToUnits={goBackToUnits}
        showBackToUnits={hostelType === "unit-based" && currentView === "rooms"}
        showBackToHostels={true}
        userRole={user.role}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-6) var(--spacing-8)' }}>

        {hostelType === "unit-based" ? <UnitStats units={units} rooms={rooms} currentView={currentView} totalCount={totalItems} /> : <RoomStats rooms={rooms} totalCount={totalItems} />}

        {/* Filter Section - StudentFilterSection style */}
        <Card style={{ marginTop: 'var(--spacing-6)', overflow: 'visible' }} padding="p-4">
          {/* Compact row: Search + More Filters + Reset */}
          <HStack gap="small" align="center">
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                placeholder={`Search ${hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"} by number...`}
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                icon={<Search size={16} />}
              />
            </div>
            {hostelType === "unit-based" && currentView === "units" && (
              <Button
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                variant="secondary"
                size="sm"
              >
                <SlidersHorizontal size={16} /> {isFiltersExpanded ? "Less" : "More"}
                {isFiltersExpanded ? <ChevronUp size={14} style={{ marginLeft: 'var(--spacing-1)' }} /> : <ChevronDown size={14} style={{ marginLeft: 'var(--spacing-1)' }} />}
              </Button>
            )}
            <Button onClick={resetFilters} variant="ghost" size="sm">
              <RotateCcw size={14} /> Reset
            </Button>
          </HStack>

          {/* Expanded filters section - only for units view */}
          {isFiltersExpanded && hostelType === "unit-based" && currentView === "units" && (
            <VStack gap="medium" style={{ marginTop: 'var(--spacing-4)' }}>
              <Divider spacing="none" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 'var(--spacing-4)', columnGap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)' }}>
                <VStack gap="xsmall">
                  <Label size="sm">Min Capacity</Label>
                  <Input id="minCapacity" type="number" min="0" value={filters.minCapacity} onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })} placeholder="Any" />
                </VStack>

                <VStack gap="xsmall">
                  <Label size="sm">Max Capacity</Label>
                  <Input id="maxCapacity" type="number" min="0" value={filters.maxCapacity} onChange={(e) => setFilters({ ...filters, maxCapacity: e.target.value })} placeholder="Any" />
                </VStack>

                <VStack gap="xsmall">
                  <Label size="sm">Min Occupancy</Label>
                  <Input id="minOccupancy" type="number" min="0" value={filters.minOccupancy} onChange={(e) => setFilters({ ...filters, minOccupancy: e.target.value })} placeholder="Any" />
                </VStack>

                <VStack gap="xsmall">
                  <Label size="sm">Max Occupancy</Label>
                  <Input id="maxOccupancy" type="number" min="0" value={filters.maxOccupancy} onChange={(e) => setFilters({ ...filters, maxOccupancy: e.target.value })} placeholder="Any" />
                </VStack>

                <VStack gap="xsmall" style={{ justifyContent: 'flex-end' }}>
                  <Checkbox id="showEmptyOnly" checked={filters.showEmptyOnly} onChange={(e) => setFilters({ ...filters, showEmptyOnly: e.target.checked })} label="Show Empty Units Only" />
                </VStack>
              </div>
            </VStack>
          )}
        </Card>

        <div style={{ marginTop: 'var(--spacing-6)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Showing <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{hostelType === "unit-based" ? (currentView === "units" ? units.length : rooms.length) : rooms.length}</span> {hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"}
            {totalItems > 0 && ` of ${totalItems} total`}
          </div>
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
            <div style={{ marginTop: 'var(--spacing-4)' }}>{hostelType === "unit-based" && currentView === "units" ? <UnitListView units={units} onUnitClick={handleUnitClick} /> : <RoomListView rooms={rooms} onRoomClick={handleRoomClick} onAllocateClick={handleAllocateStudent} />}</div>

            {((hostelType === "unit-based" && currentView === "units" && units.length === 0) || (((hostelType === "unit-based" && currentView === "rooms") || hostelType === "room-only") && rooms.length === 0)) && !loading && (
              <NoResults icon={hostelType === "unit-based" && currentView === "units" ? <FaBuilding style={{ color: 'var(--color-text-placeholder)', fontSize: 'var(--font-size-4xl)' }} /> : <MdMeetingRoom style={{ color: 'var(--color-text-placeholder)', fontSize: 'var(--font-size-4xl)' }} />}
                message={`No ${hostelType === "unit-based" && currentView === "units" ? "units" : "rooms"} found`}
                suggestion="Try changing your search or filter criteria"
              />
            )}
          </>
        )}



        {showRoomDetail && selectedRoom && <RoomDetailModal room={selectedRoom} onClose={() => setShowRoomDetail(false)} onUpdate={handleUpdateSuccess} onAllocate={() => setShowAllocateModal(true)} />}

        {showAllocateModal && selectedRoom && <AllocateStudentModal room={selectedRoom} isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} onSuccess={handleAllocationSuccess} />}

      </div>
    </div>
  )
}

export default UnitsAndRoomsPage
