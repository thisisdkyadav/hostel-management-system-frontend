import React from "react"
import { FaBuilding, FaEdit, FaEye, FaUserTie } from "react-icons/fa"
import { MdMeetingRoom } from "react-icons/md"
import { BsThreeDotsVertical } from "react-icons/bs"

const HostelCard = ({ hostel }) => {
  const getTypeColor = (type) => {
    if (type === "Boys") return "bg-blue-100 text-blue-600"
    if (type === "Girls") return "bg-pink-100 text-pink-600"
    return "bg-purple-100 text-purple-600"
  }

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`p-3 mr-4 rounded-xl ${getTypeColor(hostel.type)}`}>
            <FaBuilding size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{hostel.name}</h3>
            <span className="text-sm text-gray-600">{hostel.type}</span>
          </div>
        </div>
        <div className="dropdown relative">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <BsThreeDotsVertical />
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <div>
          <div className="flex items-center mt-3">
            <FaUserTie className="text-gray-500 mr-2" />
            <span className="text-sm">{hostel.warden}</span>
          </div>
          <div className="flex items-center mt-2">
            <MdMeetingRoom className="text-gray-500 mr-2" />
            <span className="text-sm">
              {hostel.totalRooms} Total Rooms ({hostel.vacantRooms} vacant)
            </span>
          </div>
          <div className="flex mt-2 space-x-2">
            {hostel.blocks.map((block, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-lg">
                {block}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E4E4E7" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1360AB" strokeWidth="3" strokeDasharray={`${hostel.occupancyRate}, 100`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-bold text-lg">{hostel.occupancyRate}%</span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-1">Occupancy</span>
        </div>
      </div>

      <div className="mt-5 flex justify-between">
        <button className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-xl hover:bg-[#1360AB] hover:text-white transition-colors">
          <FaEye className="mr-2" /> View Details
        </button>
        <button className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-xl hover:bg-[#1360AB] hover:text-white transition-colors">
          <FaEdit className="mr-2" /> Edit
        </button>
      </div>
    </div>
  )
}

export default HostelCard
