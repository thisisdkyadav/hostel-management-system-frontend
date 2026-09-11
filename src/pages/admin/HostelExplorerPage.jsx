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
import { adminApi } from "../../service"
import { queryKeys } from "../../lib/query"
import {
  asList,
  fetchHostelRooms,
  fetchHostelUnits,
  hostelIdOf,
  prefetchHostelMap,
  prefetchHostelPeek,
  seedUnitRooms,
} from "../../lib/query/hostelMap"

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
    const list = hostelsQuery.data
    if (!list?.length) return undefined
    list.forEach((hostel) => {
      prefetchHostelMap(queryClient, hostel).catch(() => {})
    })
    return undefined
  }, [hostelsQuery.data, queryClient])

  const selectedHostel = hostels.find((hostel) => hostelIdOf(hostel) === selectedId) || null
  const hostelId = hostelIdOf(selectedHostel)
  const isRoomOnly = selectedHostel?.type === "room-only"

  const mapQuery = useQuery({
    queryKey: isRoomOnly ? queryKeys.hostels.rooms(hostelId) : queryKeys.hostels.units(hostelId),
    queryFn: () => (isRoomOnly ? fetchHostelRooms(hostelId) : fetchHostelUnits(hostelId)),
    enabled: Boolean(hostelId),
  })

  const items = mapQuery.data || []
  const canEdit = user?.role === "Admin"

  useEffect(() => {
    const list = mapQuery.data
    if (!list?.length || isRoomOnly) return
    seedUnitRooms(queryClient, list)
  }, [mapQuery.data, isRoomOnly, queryClient])

  const selectHostel = (hostel) => {
    const nextId = hostelIdOf(hostel)
    if (!nextId) return
    prefetchHostelPeek(queryClient, hostel).catch(() => {})
    if (nextId === selectedId) return
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
