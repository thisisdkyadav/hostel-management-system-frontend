import React from "react"
import { FaBuilding } from "react-icons/fa"
import { useGlobal } from "../../../../contexts/GlobalProvider"

const AccommodationDetails = ({ hostelName, allocatedRooms }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-3 flex items-center">
        <FaBuilding className="mr-2 text-[#1360AB]" /> Accommodation Details
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Hostel:</span>
          <span className="font-medium text-sm">{hostelName}</span>
        </div>
        {allocatedRooms && allocatedRooms.length > 0 ? (
          <div>
            <span className="text-gray-600 text-sm block mb-1">Allocated Rooms:</span>
            <div className="space-y-1">
              {allocatedRooms.map((room, index) => (
                <div key={index} className="text-sm font-medium">
                  {room.length > 1 ? `${room[1]}-${room[0]}` : `Room ${room[0]}`}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Room:</span>
            <span className="font-medium text-sm">Not allocated yet</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccommodationDetails
