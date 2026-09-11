import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2 } from "lucide-react"
import { EmptyState, ErrorState, LoadingState, Page, Text } from "hzero"
import HostelExplorerGuide from "../../components/admin/hostel/explorer/HostelExplorerGuide"
import HostelExplorerTile from "../../components/admin/hostel/explorer/HostelExplorerTile"
import "../../components/admin/hostel/explorer/HostelExplorer.css"
import { dismissAllHoverPanels } from "../../components/common/HoverPanel"
import HostelFloorMap from "../../components/wardens/HostelFloorMap"
import RoomDetailModal from "../../components/wardens/RoomDetailModal"
import AllocateStudentModal from "../../components/wardens/AllocateStudentModal"
import { useAuth } from "../../contexts/AuthProvider"
import { adminApi, hostelApi } from "../../service"
import { queryKeys } from "../../lib/query"

const asList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

const hostelIdOf = (hostel) => hostel?.id || hostel?._id || null

const HostelExplorerPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)

  const hostelsQuery = useQuery({
    queryKey: queryKeys.hostels.list(),
    queryFn: async () => asList(await adminApi.getAllHostels()),
  })

  const hostels = hostelsQuery.data || []

  useEffect(() => {
    if (!selectedId) return
    if (hostels.some((hostel) => hostelIdOf(hostel) === selectedId)) return
    setSelectedId(null)
  }, [hostels, selectedId])

  const selectedHostel = hostels.find((hostel) => hostelIdOf(hostel) === selectedId) || null
  const hostelId = hostelIdOf(selectedHostel)
  const isRoomOnly = selectedHostel?.type === "room-only"

  const mapQuery = useQuery({
    queryKey: isRoomOnly ? queryKeys.hostels.rooms(hostelId) : queryKeys.hostels.units(hostelId),
    queryFn: async () => {
      if (isRoomOnly) {
        return asList(await hostelApi.getRooms({ hostelId }))
      }
      return asList(await hostelApi.getUnits(hostelId))
    },
    enabled: Boolean(hostelId),
  })

  const items = mapQuery.data || []
  const canEdit = user?.role === "Admin"

  const selectHostel = (hostel) => {
    const nextId = hostelIdOf(hostel)
    if (!nextId || nextId === selectedId) return
    dismissAllHoverPanels()
    setSelectedId(nextId)
  }

  const handleRoomClick = (room) => {
    dismissAllHoverPanels()
    setSelectedRoom(room)
    setShowRoomDetail(true)
  }

  const refreshMap = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.hostels.all })
  }

  const handleAllocationSuccess = () => {
    refreshMap()
    setShowAllocateModal(false)
    setShowRoomDetail(false)
    setSelectedRoom(null)
  }

  const handleUpdateSuccess = () => {
    refreshMap()
    setShowRoomDetail(false)
  }

  return (
    <Page className="hostel-explorer">
      <div className="hostel-explorer__chrome">
        <section className="hostel-explorer__hostels" aria-label="Hostels">
          <div className="hostel-explorer__hostels-head">
            <Text as="h2" size="sm" weight="semibold" color="primary">
              Hostels
            </Text>
            <Text size="xs" color="muted">
              {selectedHostel
                ? `Showing ${selectedHostel.name}${isRoomOnly ? " rooms" : " units"}`
                : "Hover a hostel to view its map"}
            </Text>
          </div>
          {hostelsQuery.isError ? (
            <ErrorState message="Could not load hostels." onRetry={() => hostelsQuery.refetch()} />
          ) : hostelsQuery.isPending ? (
            <LoadingState message="Loading hostels..." description="Fetching occupancy for each hostel" />
          ) : hostels.length === 0 ? (
            <EmptyState icon={Building2} title="No hostels" message="Add a hostel before exploring units and rooms." />
          ) : (
            <div className="hostel-explorer__row">
              {hostels.map((hostel) => {
                const id = hostelIdOf(hostel)
                return (
                  <HostelExplorerTile
                    key={id}
                    hostel={hostel}
                    selected={id === selectedId}
                    onSelect={selectHostel}
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Page.Body className="hostel-explorer__map">
        {!selectedHostel ? (
          hostels.length > 0 ? <HostelExplorerGuide /> : null
        ) : mapQuery.isError ? (
          <ErrorState message="Could not load this hostel map." onRetry={() => mapQuery.refetch()} />
        ) : mapQuery.isPending ? (
          <LoadingState
            message={isRoomOnly ? "Loading rooms..." : "Loading units..."}
            description={`Fetching the map for ${selectedHostel.name}`}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={isRoomOnly ? "No rooms" : "No units"}
            message={`${selectedHostel.name} has no ${isRoomOnly ? "rooms" : "units"} to show.`}
          />
        ) : (
          <HostelFloorMap
            mode={isRoomOnly ? "rooms" : "units"}
            units={isRoomOnly ? [] : items}
            rooms={isRoomOnly ? items : []}
            hostelId={hostelId}
            canEdit={canEdit}
            onViewRoom={handleRoomClick}
            onUpdated={refreshMap}
            unitLayout="split-bottom"
          />
        )}

        {showRoomDetail && selectedRoom && (
          <RoomDetailModal
            room={selectedRoom}
            onClose={() => setShowRoomDetail(false)}
            onUpdate={handleUpdateSuccess}
            onAllocate={() => setShowAllocateModal(true)}
          />
        )}

        {showAllocateModal && selectedRoom && (
          <AllocateStudentModal
            room={selectedRoom}
            isOpen={showAllocateModal}
            onClose={() => setShowAllocateModal(false)}
            onSuccess={handleAllocationSuccess}
          />
        )}
      </Page.Body>
    </Page>
  )
}

export default HostelExplorerPage
