import React from "react"
import { FaDoorOpen, FaUserPlus, FaEye, FaToggleOn } from "react-icons/fa"
import RoomCard from "./RoomCard"

const RoomListView = ({ rooms, viewMode, onRoomClick, onAllocateClick }) => {
  if (viewMode === "table") {
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 flex items-center justify-center rounded-full">
                      <FaDoorOpen className="text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{room.roomNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.type || "Standard"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.capacity || 0} students</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {room.status === "Inactive" ? (
                    <span className="text-sm text-gray-500">Inactive room</span>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">
                        {room.currentOccupancy || 0}/{room.capacity || 0}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${room.currentOccupancy >= room.capacity ? "bg-green-500" : room.currentOccupancy > 0 ? "bg-blue-500" : "bg-gray-400"}`}
                          style={{
                            width: `${room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${room.status === "Inactive" ? "bg-red-100 text-red-800" : room.currentOccupancy >= room.capacity ? "bg-green-100 text-green-800" : room.currentOccupancy > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {room.status === "Inactive" ? "Inactive" : room.currentOccupancy >= room.capacity ? "Full" : room.currentOccupancy > 0 ? "Partial" : "Empty"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onRoomClick(room)} className="text-indigo-600 hover:text-indigo-900 p-1" title="View Details">
                      <FaEye />
                    </button>
                    {room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
                      <button onClick={() => onAllocateClick(room)} className="text-green-600 hover:text-green-900 p-1" title="Allocate Student">
                        <FaUserPlus />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room)} onAllocate={() => onAllocateClick(room)} />
      ))}
    </div>
  )
}

export default RoomListView
