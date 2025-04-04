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
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 flex items-center justify-center rounded-full">
            <FaDoorOpen className="text-indigo-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{room.roomNumber}</div>
            <div className="text-xs text-gray-500 sm:hidden">{room.type || "Standard"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      key: "type",
      className: "hidden sm:table-cell",
      render: (room) => <span className="text-sm text-gray-700">{room.type || "Standard"}</span>,
    },
    {
      header: "Capacity",
      key: "capacity",
      className: "hidden md:table-cell",
      render: (room) => <span className="text-sm text-gray-700">{room.capacity || 0} students</span>,
    },
    {
      header: "Occupancy",
      key: "occupancy",
      render: (room) =>
        room.status === "Inactive" ? (
          <span className="text-sm text-gray-500">Inactive room</span>
        ) : (
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className={`h-2 rounded-full ${room.currentOccupancy >= room.capacity ? "bg-green-500" : room.currentOccupancy > 0 ? "bg-[#1360AB]" : "bg-gray-400"}`}
                style={{
                  width: `${room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0}%`,
                }}
              ></div>
            </div>
            <span className="text-sm text-gray-700">
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
        <span
          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full 
          ${room.status === "Inactive" ? "bg-red-100 text-red-800" : room.currentOccupancy >= room.capacity ? "bg-green-100 text-green-800" : room.currentOccupancy > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
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
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRoomClick(room)
            }}
            className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full transition-colors"
            aria-label="View details"
          >
            <FaEye className="h-4 w-4" />
          </button>
          {["Admin"].includes(user.role) && room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAllocateClick(room)
              }}
              className="text-green-600 hover:bg-green-50 p-2 rounded-full transition-colors"
              aria-label="Allocate student"
            >
              <FaUserPlus className="h-4 w-4" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room)} onAllocate={() => onAllocateClick(room)} />
          ))}
          {rooms.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No rooms to display</div>}
        </div>
      )}
    </>
  )
}

export default RoomListView
