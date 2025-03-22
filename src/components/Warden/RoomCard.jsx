import React from "react"
import { FaDoorOpen, FaUserPlus, FaUserGraduate } from "react-icons/fa"

const RoomCard = ({ room, onClick, onAllocate }) => {
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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
              <FaDoorOpen size={24} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</h3>
              <p className="text-sm text-gray-500">{room.type || "Standard"}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-500">
              <span>Capacity</span>
            </div>
            <span className="font-medium">{room.capacity || 0} students</span>
          </div>

          {room.status === "Inactive" ? (
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-500">
                <span>Status</span>
              </div>
              <span className="font-medium text-red-600">Inactive room</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500">
                  <FaUserGraduate className="mr-2" />
                  <span>Current Occupancy</span>
                </div>
                <span className="font-medium">{room.currentOccupancy || 0} students</span>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Occupancy</span>
                  <span className="text-sm font-medium text-gray-700">{occupancyPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${occupancyPercentage === 100 ? "bg-green-500" : occupancyPercentage > 0 ? "bg-blue-500" : "bg-gray-400"}`} style={{ width: `${occupancyPercentage}%` }}></div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex space-x-2">
          <button onClick={onClick} className="flex-1 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
            View Details
          </button>

          {room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAllocate()
              }}
              className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <FaUserPlus className="mr-1" /> Allocate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoomCard
