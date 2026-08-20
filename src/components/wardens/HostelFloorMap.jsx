import { useEffect, useState } from "react"
import { Spinner, Text } from "hzero"
import HoverPanel from "../common/HoverPanel"
import OccupancyTile from "../common/OccupancyTile"
import { isRoomActive } from "@/constants/roomStatus"
import { hostelApi } from "../../service"
import { getMediaUrl } from "../../utils/mediaUtils"
import { groupByBand } from "../../utils/numberBand"
import RoomPeekPanel from "./RoomPeekPanel"
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
  onSaved,
  portal = true,
  size = "md",
  placement = "auto",
  align = "start",
  openDelay,
}) => (
  <HoverPanel
    placement={placement}
    align={align}
    portal={portal}
    openDelay={openDelay}
    content={
      <RoomPeekPanel
        key={`${room.id}-${room.status}-${room.capacity}-${occupancyOf(room)}`}
        room={room}
        hostelId={hostelId}
        canEdit={canEdit}
        onViewMore={onViewMore}
        onSaved={onSaved}
      />
    }
  >
    <OccupancyTile
      label={room.roomNumber}
      used={occupancyOf(room)}
      total={isRoomActive(room.status) ? bedsOf(room) : 1}
      status={room.status}
      faces={facesOf(room)}
      size={size}
    />
  </HoverPanel>
)

const UnitRoomsPanel = ({ unit, hostelId, canEdit, onViewMore, onSaved }) => {
  const provided = Array.isArray(unit.rooms) ? unit.rooms : null
  const [fetched, setFetched] = useState(null)
  const rooms = provided ?? fetched

  useEffect(() => {
    if (provided !== null || !unit.id) return undefined
    let cancelled = false
    hostelApi
      .getRoomsByUnit(unit.id)
      .then((response) => {
        if (!cancelled) setFetched(response?.data || [])
      })
      .catch(() => {
        if (!cancelled) setFetched([])
      })
    return () => {
      cancelled = true
    }
  }, [provided, unit.id])

  if (rooms === null) {
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
            onSaved={onSaved}
            size="sm"
            placement="auto"
            align="center"
            openDelay={0}
          />
        ))}
    </div>
  )
}

const UnitCell = ({ unit, hostelId, canEdit, onViewMore, onSaved }) => (
  <HoverPanel
    placement="auto"
    align="start"
    content={
      <UnitRoomsPanel
        unit={unit}
        hostelId={hostelId}
        canEdit={canEdit}
        onViewMore={onViewMore}
        onSaved={onSaved}
      />
    }
  >
    <OccupancyTile
      label={unit.unitNumber || unit.name}
      used={occupancyOf(unit)}
      total={unit.capacity || 0}
      groups={roomGroupsOf(unit)}
      size="lg"
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
}) => {
  const items = mode === "units" ? units : rooms
  const groups = groupByBand(items, (item) => (mode === "units" ? item.unitNumber : item.roomNumber))
  const noun = mode === "units" ? "unit" : "room"

  return (
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
          <header className="floor-map__band-head">
            <Text as="h3" size="sm" weight="semibold" color="primary">
              {group.label}
            </Text>
            <Text size="xs" color="muted">
              {group.items.length} {noun}
              {group.items.length === 1 ? "" : "s"}
            </Text>
          </header>
          <div className="floor-map__grid">
            {mode === "units"
              ? group.items.map((unit) => (
                  <UnitCell
                    key={unit.id}
                    unit={unit}
                    hostelId={hostelId}
                    canEdit={canEdit}
                    onViewMore={onViewRoom}
                    onSaved={onUpdated}
                  />
                ))
              : group.items.map((room) => (
                  <RoomCell
                    key={room.id}
                    room={room}
                    hostelId={hostelId}
                    canEdit={canEdit}
                    onViewMore={onViewRoom}
                    onSaved={onUpdated}
                  />
                ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default HostelFloorMap
