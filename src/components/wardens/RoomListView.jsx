import React from "react"
import { FaDoorOpen, FaUserPlus, FaEye } from "react-icons/fa"
import { Button, DataTable } from "czero/react"
import { useAuth } from "../../contexts/AuthProvider"
import { isRoomActive } from "@/constants/roomStatus"
import { HStack, IconCircle, Text } from "@/components/ui"

const RoomListView = ({ rooms, onRoomClick, onAllocateClick }) => {
  const { user } = useAuth()

  const columns = [
    {
      header: "Room Number",
      key: "roomNumber",
      render: (room) => (
        <HStack gap="none" align="center">
          <IconCircle size="var(--spacing-10)" bg="info">
            <FaDoorOpen style={{ color: "var(--color-info)" }} />
          </IconCircle>
          <div style={{ marginLeft: "var(--spacing-4)" }}>
            <Text as="div" size="sm" weight="medium" color="primary">{room.roomNumber}</Text>
            <div className="sm:hidden" style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {room.type || "Standard"}
            </div>
          </div>
        </HStack>
      ),
    },
    {
      header: "Type",
      key: "type",
      className: "hidden sm:table-cell",
      render: (room) => (
        <Text as="span" size="sm" color="body">{room.type || "Standard"}</Text>
      ),
    },
    {
      header: "Capacity",
      key: "capacity",
      className: "hidden md:table-cell",
      render: (room) => (
        <Text as="span" size="sm" color="body">{room.capacity || 0} students</Text>
      ),
    },
    {
      header: "Occupancy",
      key: "occupancy",
      render: (room) =>
        !isRoomActive(room.status) ? (
          <Text as="span" size="sm" color="muted">{room.status}</Text>
        ) : (
          <HStack gap="none" align="center">
            <div style={{ width: "var(--spacing-16)", backgroundColor: "var(--color-bg-muted)", borderRadius: "var(--radius-full)", height: "var(--spacing-2)", marginRight: "var(--spacing-2)", }} >
              <div style={{
                height: "var(--spacing-2)", borderRadius: "var(--radius-full)", backgroundColor: room.currentOccupancy >= room.capacity
                  ? "var(--color-success)"
                  : room.currentOccupancy > 0
                    ? "var(--color-primary)"
                    : "var(--color-text-disabled)",
                width: `${room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0}%`,
              }}
              ></div>
            </div>
            <Text as="span" size="sm" color="body">
              {room.currentOccupancy || 0}/{room.capacity || 0}
            </Text>
          </HStack>
        ),
    },
    {
      header: "Status",
      key: "status",
      className: "hidden lg:table-cell",
      render: (room) => (
        <span style={{
          padding: "var(--badge-padding-sm)", display: "inline-flex", fontSize: "var(--font-size-xs)", lineHeight: "var(--line-height-tight)", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", backgroundColor: !isRoomActive(room.status) ? "var(--color-danger-bg)" : room.currentOccupancy >= room.capacity
            ? "var(--color-success-bg)"
            : room.currentOccupancy > 0
              ? "var(--color-info-bg)"
              : "var(--color-bg-muted)",
          color:
            !isRoomActive(room.status)
              ? "var(--color-danger-text)"
              : room.currentOccupancy >= room.capacity
                ? "var(--color-success-text)"
                : room.currentOccupancy > 0
                  ? "var(--color-info-text)"
                  : "var(--color-text-body)",
        }}
        >
          {!isRoomActive(room.status) ? room.status : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partial" : "Empty"}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (room) => (
        <HStack gap="var(--gap-sm)" align="center" justify="end">
          <Button onClick={(e) => { e.stopPropagation(); onRoomClick(room); }} variant="ghost" size="sm" aria-label="View details"><FaEye /></Button>
          {["Admin"].includes(user.role) && isRoomActive(room.status) && room.currentOccupancy < room.capacity && (
            <Button onClick={(e) => { e.stopPropagation(); onAllocateClick(room); }} variant="ghost" size="sm" aria-label="Allocate student"><FaUserPlus /></Button>
          )}
        </HStack>
      ),
    },
  ]

  return <DataTable columns={columns} data={rooms} onRowClick={onRoomClick} emptyMessage="No rooms to display" />
}

export default RoomListView
