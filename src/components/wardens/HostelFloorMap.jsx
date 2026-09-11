import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Spinner, Text } from "hzero"
import HoverPanel, { dismissAllHoverPanels } from "../common/HoverPanel"
import OccupancyTile from "../common/OccupancyTile"
import { isRoomActive } from "@/constants/roomStatus"
import { getMediaUrl } from "../../utils/mediaUtils"
import { groupByBand } from "../../utils/numberBand"
import { queryKeys } from "../../lib/query"
import {
  fetchUnitRooms,
  prefetchRoomPeek,
  prefetchRoomsStudents,
  prefetchUnitPeek,
  seedUnitRooms,
  unitIdOf,
} from "../../lib/query/hostelMap"
import RoomPeekPanel from "./RoomPeekPanel"
import StudentDetailModal from "../common/students/StudentDetailModal"
import "./floor-map.css"

const occupancyOf = (item) => item.occupancy ?? item.currentOccupancy ?? 0

const compareRoomNumber = (a, b) =>
  String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" })

const bedsOf = (room) => {
  const cap = Number(room.capacity) || 0
  if (cap > 0) return cap
  const original = Number(room.originalCapacity) || 0
  if (original > 0) return original
  return isRoomActive(room.status) ? 0 : 1
}

const roomGroupsOf = (unit) =>
  [...(unit.rooms || [])]
    .sort((a, b) => compareRoomNumber(a.roomNumber, b.roomNumber))
    .map((room) => {
      const inactive = !isRoomActive(room.status)
      return {
        id: room.id || room._id,
        used: occupancyOf(room),
        total: inactive ? 1 : bedsOf(room),
        inactive,
      }
    })
    .filter((group) => group.total > 0)

const facesOf = (room) =>
  [...(room.students || [])]
    .filter((student) => student && (student.name || student.profileImage))
    .sort((a, b) => (Number(a.bedNumber) || 0) - (Number(b.bedNumber) || 0))
    .map((student) => ({
      id: student.allocationId || student.id,
      name: student.name,
      src: student.profileImage ? getMediaUrl(student.profileImage) : undefined,
      student,
    }))

const LEGEND = [
  { tone: "empty", label: "Empty" },
  { tone: "partial", label: "Partial" },
  { tone: "full", label: "Full" },
  { tone: "inactive", label: "Inactive" },
]

const RoomCell = ({
  room,
  hostelId,
  canEdit,
  onViewMore,
  onViewStudent,
  onSaved,
  onPrefetch,
  portal = true,
  size = "md",
  placement = "auto",
  align = "start",
  layout = "compact",
}) => (
  <OccupancyTile
    label={room.roomNumber}
    used={occupancyOf(room)}
    total={isRoomActive(room.status) ? bedsOf(room) : 1}
    status={room.status}
    size={size}
    layout={layout}
    faces={layout === "peek" ? facesOf(room) : undefined}
    onPointerEnter={() => onPrefetch?.(room)}
    wrapHead={(hit) => (
      <HoverPanel
        placement={placement}
        align={align}
        portal={portal}
        openDelay={0}
        content={
          <RoomPeekPanel
            key={`${room.id}-${room.status}-${room.capacity}-${occupancyOf(room)}`}
            room={room}
            hostelId={hostelId}
            canEdit={canEdit}
            onViewMore={onViewMore}
            onViewStudent={onViewStudent}
            onSaved={onSaved}
          />
        }
      >
        {hit}
      </HoverPanel>
    )}
  />
)

const UnitRoomsPanel = ({ unit, hostelId, canEdit, onViewMore, onViewStudent, onSaved, onPrefetchRoom }) => {
  const unitId = unitIdOf(unit)
  const nested = Array.isArray(unit.rooms) ? unit.rooms : undefined
  const roomsQuery = useQuery({
    queryKey: queryKeys.hostels.unitRooms(unitId),
    queryFn: () => fetchUnitRooms(unitId),
    enabled: Boolean(unitId),
    placeholderData: nested,
  })
  const rooms = roomsQuery.data ?? nested ?? null
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!rooms?.length) return
    prefetchRoomsStudents(queryClient, rooms)
  }, [rooms, queryClient])

  if (rooms == null) {
    return (
      <div className="floor-map__rooms" style={{ justifyContent: "center", minHeight: "var(--spacing-16)" }}>
        <Spinner size="sm" />
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <Text size="sm" color="muted">
        No rooms in this unit
      </Text>
    )
  }

  return (
    <div className="floor-map__rooms">
      {[...rooms]
        .sort((a, b) => compareRoomNumber(a.roomNumber, b.roomNumber))
        .map((room) => (
          <RoomCell
            key={room.id}
            room={room}
            hostelId={hostelId}
            canEdit={canEdit}
            onViewMore={onViewMore}
            onViewStudent={onViewStudent}
            onSaved={onSaved}
            onPrefetch={onPrefetchRoom}
            size="md"
            layout="peek"
            placement="auto"
            align="center"
          />
        ))}
    </div>
  )
}

const UnitCell = ({ unit, hostelId, canEdit, onViewMore, onViewStudent, onSaved, onPrefetch, onPrefetchRoom, layout }) => (
  <HoverPanel
    placement="auto"
    align="start"
    openDelay={0}
    content={
      <UnitRoomsPanel
        unit={unit}
        hostelId={hostelId}
        canEdit={canEdit}
        onViewMore={onViewMore}
        onViewStudent={onViewStudent}
        onSaved={onSaved}
        onPrefetchRoom={onPrefetchRoom}
      />
    }
  >
    <OccupancyTile
      label={unit.unitNumber || unit.name}
      used={occupancyOf(unit)}
      total={unit.capacity || 0}
      groups={roomGroupsOf(unit)}
      size="lg"
      layout={layout}
      onPointerEnter={() => onPrefetch?.(unit)}
    />
  </HoverPanel>
)

const HostelFloorMap = ({
  mode = "units",
  units = [],
  rooms = [],
  hostelId,
  canEdit = false,
  onViewRoom,
  onUpdated,
  unitLayout,
}) => {
  const queryClient = useQueryClient()
  const [viewingStudent, setViewingStudent] = useState(null)
  const items = mode === "units" ? units : rooms
  const groups = groupByBand(items, (item) => (mode === "units" ? item.unitNumber : item.roomNumber))
  const noun = mode === "units" ? "unit" : "room"

  useEffect(() => {
    if (mode !== "units" || !units.length) return
    seedUnitRooms(queryClient, units)
  }, [mode, units, queryClient])

  const handleViewStudent = (student) => {
    const id = student?.id || student?._id
    if (!id) return
    dismissAllHoverPanels()
    setViewingStudent({ id, userId: student.userId })
  }

  return (
    <>
    <div className="floor-map">
      <div className="floor-map__hint">
        <Text size="sm" color="muted">
          Hover a {noun} for details{canEdit ? ". Leave without confirming to discard edits." : "."}
        </Text>
        <div className="floor-map__legend">
          {LEGEND.map((item) => (
            <span key={item.tone} className="floor-map__swatch">
              <span className="floor-map__swatch-chip" data-tone={item.tone} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.band} className="floor-map__band">
          <div className="floor-map__grid">
            {mode === "units"
              ? group.items.map((unit) => (
                  <UnitCell
                    key={unit.id}
                    unit={unit}
                    hostelId={hostelId}
                    canEdit={canEdit}
                    onViewMore={onViewRoom}
                    onViewStudent={handleViewStudent}
                    onSaved={onUpdated}
                    onPrefetch={(unit) => prefetchUnitPeek(queryClient, unit)}
                    onPrefetchRoom={(room) => prefetchRoomPeek(queryClient, room)}
                    layout={unitLayout}
                  />
                ))
              : group.items.map((room) => (
                  <RoomCell
                    key={room.id}
                    room={room}
                    hostelId={hostelId}
                    canEdit={canEdit}
                    onViewMore={onViewRoom}
                    onViewStudent={handleViewStudent}
                    onSaved={onUpdated}
                    onPrefetch={(item) => prefetchRoomPeek(queryClient, item)}
                  />
                ))}
          </div>
        </section>
      ))}
    </div>
      {viewingStudent ? (
        <StudentDetailModal
          selectedStudent={{ _id: viewingStudent.id, userId: viewingStudent.userId }}
          setShowStudentDetail={() => setViewingStudent(null)}
          onUpdate={() => {
            setViewingStudent(null)
            onUpdated?.()
          }}
        />
      ) : null}
    </>
  )
}

export default HostelFloorMap
