import React from "react"
import { FaDoorOpen, FaUserPlus, FaEye } from "react-icons/fa"
import RoomCard from "./RoomCard"
import BaseTable from "../common/table/BaseTable"
import { useAuth } from "../../contexts/AuthProvider"

const RoomListView = ({ rooms, viewMode, onRoomClick, onAllocateClick }) => {
  const { user } = useAuth()

  const columns = [
    {
      header: "Room Number",
      key: "roomNumber",
      render: (room) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, height: "var(--spacing-10)", width: "var(--spacing-10)", backgroundColor: "var(--color-info-bg)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", }} >
            <FaDoorOpen style={{ color: "var(--color-info)" }} />
          </div>
          <div style={{ marginLeft: "var(--spacing-4)" }}>
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{room.roomNumber}</div>
            <div className="sm:hidden" style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {room.type || "Standard"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      key: "type",
      className: "hidden sm:table-cell",
      render: (room) => (
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{room.type || "Standard"}</span>
      ),
    },
    {
      header: "Capacity",
      key: "capacity",
      className: "hidden md:table-cell",
      render: (room) => (
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>{room.capacity || 0} students</span>
      ),
    },
    {
      header: "Occupancy",
      key: "occupancy",
      render: (room) =>
        room.status === "Inactive" ? (
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Inactive room</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "var(--spacing-16)", backgroundColor: "var(--color-bg-muted)", borderRadius: "var(--radius-full)", height: "var(--spacing-2)", marginRight: "var(--spacing-2)", }} >
              <div style={{ height: "var(--spacing-2)", borderRadius: "var(--radius-full)", backgroundColor: room.currentOccupancy >= room.capacity
                      ? "var(--color-success)"
                      : room.currentOccupancy > 0
                        ? "var(--color-primary)"
                        : "var(--color-text-disabled)",
                  width: `${room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0}%`,
                }}
              ></div>
            </div>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
              {room.currentOccupancy || 0}/{room.capacity || 0}
            </span>
          </div>
        ),
    },
    {
      header: "Status",
      key: "status",
      className: "hidden lg:table-cell",
      render: (room) => (
        <span style={{ padding: "var(--badge-padding-sm)", display: "inline-flex", fontSize: "var(--font-size-xs)", lineHeight: "var(--line-height-tight)", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", backgroundColor: room.status === "Inactive" ? "var(--color-danger-bg)" : room.currentOccupancy >= room.capacity
                  ? "var(--color-success-bg)"
                  : room.currentOccupancy > 0
                    ? "var(--color-info-bg)"
                    : "var(--color-bg-muted)",
            color:
              room.status === "Inactive"
                ? "var(--color-danger-text)"
                : room.currentOccupancy >= room.capacity
                  ? "var(--color-success-text)"
                  : room.currentOccupancy > 0
                    ? "var(--color-info-text)"
                    : "var(--color-text-body)",
          }}
        >
          {room.status === "Inactive" ? "Inactive" : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partial" : "Empty"}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (room) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--gap-sm)" }}>
          <button onClick={(e) => {
              e.stopPropagation()
              onRoomClick(room)
            }}
            style={{
              color: "var(--color-primary)",
              padding: "var(--spacing-2)",
              borderRadius: "var(--radius-full)",
              transition: "var(--transition-colors)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-info-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            aria-label="View details"
          >
            <FaEye style={{ height: "var(--icon-md)", width: "var(--icon-md)" }} />
          </button>
          {["Admin"].includes(user.role) && room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
            <button onClick={(e) => {
                e.stopPropagation()
                onAllocateClick(room)
              }}
              style={{
                color: "var(--color-success)",
                padding: "var(--spacing-2)",
                borderRadius: "var(--radius-full)",
                transition: "var(--transition-colors)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-success-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              aria-label="Allocate student"
            >
              <FaUserPlus style={{ height: "var(--icon-md)", width: "var(--icon-md)" }} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      {viewMode === "table" ? (
        <BaseTable columns={columns} data={rooms} onRowClick={onRoomClick} emptyMessage="No rooms to display" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--gap-md)", }} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" >
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room)} onAllocate={() => onAllocateClick(room)} />
          ))}
          {rooms.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "var(--spacing-8) 0", color: "var(--color-text-muted)", }} >
              No rooms to display
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default RoomListView
