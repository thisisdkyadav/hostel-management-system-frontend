import React from "react"
import { BsDoorOpenFill } from "react-icons/bs"
import { FaUserFriends } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"
const RoomInfoCard = ({ roomData }) => {
  if (!roomData) return null

  const getOccupantInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
  }

  return (
    <div className="bg-white shadow-sm p-4 rounded-xl w-full border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BsDoorOpenFill className="text-[#1360AB] text-lg" />
          <h3 className="text-gray-600 font-medium">Your Room</h3>
        </div>
        <span className="text-xs bg-blue-100 text-[#1360AB] px-2 py-0.5 rounded-full">{roomData.hostelName}</span>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <p className="text-4xl font-medium text-[#1360AB]">{roomData.roomNumber}</p>
        <div className="flex items-center text-xs text-gray-600">
          <FaUserFriends className="text-gray-500 mr-1" />
          <span>
            {roomData.occupiedBeds}/{roomData.totalBeds} Occupied
          </span>
        </div>
      </div>

      {roomData?.roommates?.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <h4 className="text-xs text-gray-600 mb-1.5">Roommates:</h4>
          <div className="flex flex-wrap gap-1.5">
            {roomData.roommates.map((roommate) => (
              <div key={roommate.rollNumber} className="flex items-center text-xs bg-gray-50 px-1.5 py-0.5 rounded-md">
                {roommate.avatar ? <img src={getMediaUrl(roommate.avatar)} alt={roommate.name} className="w-4 h-4 rounded-full mr-1" /> : <div className="w-4 h-4 rounded-full bg-blue-100 text-[#1360AB] flex items-center justify-center text-[9px] mr-1">{getOccupantInitials(roommate.name)}</div>}
                <span className="truncate max-w-[80px]">{roommate.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomInfoCard
