import React from "react"
import { BsDoorOpenFill } from "react-icons/bs"
import { FaUser, FaUserFriends } from "react-icons/fa"

const RoomInfoCard = ({ roomData }) => {
  if (!roomData) return null

  const getOccupantInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
  }

  return (
    <div className="bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-6 rounded-[20px] w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BsDoorOpenFill className="text-[#1360AB] text-xl" />
          <h3 className="text-gray-600 font-medium">Your Room</h3>
        </div>
        <span className="text-sm bg-blue-100 text-[#1360AB] px-3 py-1 rounded-full">{roomData.hostelName}</span>
      </div>

      <div className="flex items-center gap-6 mt-5">
        <div className="flex flex-col">
          <p className="text-5xl font-medium text-[#1360AB]">{roomData.roomNumber}</p>
          <div className="mt-3 flex items-center">
            <FaUserFriends className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              {roomData.occupiedBeds}/{roomData.totalBeds} Occupied
            </span>
          </div>
        </div>
      </div>

      {roomData?.roommates?.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h4 className="text-sm text-gray-600 mb-2">Roommates:</h4>
          <div className="flex flex-wrap gap-2">
            {roomData.roommates.map((roommate) => (
              <div key={roommate.rollNumber} className="flex items-center text-xs bg-gray-50 px-2 py-1 rounded-lg">
                {roommate.avatar ? <img src={roommate.avatar} alt={roommate.name} className="w-5 h-5 rounded-full mr-1" /> : <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1360AB] flex items-center justify-center text-[10px] mr-1">{getOccupantInitials(roommate.name)}</div>}
                <span className="truncate max-w-[100px]">{roommate.name}</span>
                <span className="text-gray-400 ml-1">({roommate.rollNumber})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomInfoCard
