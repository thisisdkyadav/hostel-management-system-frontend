import React from "react"
import { FaDoorOpen, FaUserPlus, FaUserGraduate } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"

const RoomCard = ({ room, onClick, onAllocate }) => {
  const { user } = useAuth()

  const occupancyPercentage = room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0

  const getStatusBadge = () => {
    if (room.status === "Inactive") {
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Inactive</span>
    } else if (room.currentOccupancy >= room.capacity) {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Full</span>
    } else if (room.currentOccupancy > 0) {
      return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Partial</span>
    } else {
      return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Empty</span>
    }
  }
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 mr-3">
            <FaDoorOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg">Room {room.roomNumber}</h3>
            <span className="text-xs text-gray-500">{room.type || "Standard"}</span>
          </div>
        </div>
        {room.status === "Inactive" ? (
          <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Inactive</span>
        ) : room.currentOccupancy >= room.capacity ? (
          <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">Full</span>
        ) : room.currentOccupancy > 0 ? (
          <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">Partial</span>
        ) : (
          <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">Empty</span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <span className="text-sm">Capacity</span>
          </div>
          <span className="font-medium text-sm">{room.capacity || 0} students</span>
        </div>

        {room.status === "Inactive" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <span className="text-sm">Status</span>
            </div>
            <span className="font-medium text-sm text-red-600">Inactive room</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <FaUserGraduate className="mr-2 text-[#1360AB] text-opacity-70" />
                <span className="text-sm">Current Occupancy</span>
              </div>
              <span className="font-medium text-sm">
                {room.currentOccupancy || 0}/{room.capacity || 0}
              </span>
            </div>

            <div className="pt-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-gray-500">Occupancy Rate</span>
                <span className="text-xs font-medium text-gray-700">{room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${room.currentOccupancy >= room.capacity ? "bg-green-500" : room.currentOccupancy > 0 ? "bg-[#1360AB]" : "bg-gray-400"}`}
                  style={{
                    width: `${room.capacity ? Math.min(100, Math.round(((room.currentOccupancy || 0) / room.capacity) * 100)) : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex space-x-2">
        <button onClick={() => onClick()} className="flex-1 py-2.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 text-sm font-medium">
          View Details
        </button>

        {["Admin"].includes(user.role) && room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAllocate()
            }}
            className="flex-1 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 text-sm font-medium flex items-center justify-center"
          >
            <FaUserPlus className="mr-1.5" /> Allocate
          </button>
        )}
      </div>
    </div>
  )
}

export default RoomCard
