import React from "react"
import { FaDoorOpen, FaUserPlus, FaEye, FaToggleOn } from "react-icons/fa"
import RoomCard from "./RoomCard"
import { useAuth } from "../../contexts/AuthProvider"

const RoomListView = ({ rooms, viewMode, onRoomClick, onAllocateClick }) => {
  const { user } = useAuth()

  return (
    <>
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Room Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Occupancy</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rooms.map((room, index) => (
                  <tr key={room.id || index} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 flex items-center justify-center rounded-full">
                          <FaDoorOpen className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{room.roomNumber}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{room.type || "Standard"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden sm:table-cell">{room.type || "Standard"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{room.capacity || 0} students</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {room.status === "Inactive" ? (
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
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full 
                        ${room.status === "Inactive" ? "bg-red-100 text-red-800" : room.currentOccupancy >= room.capacity ? "bg-green-100 text-green-800" : room.currentOccupancy > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {room.status === "Inactive" ? "Inactive" : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partial" : "Empty"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => onRoomClick(room)} className="text-[#1360AB] hover:bg-blue-50 p-2 rounded-full transition-colors" aria-label="View details">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rooms.length === 0 && <div className="text-center py-8 text-gray-500">No rooms to display</div>}
        </div>
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
