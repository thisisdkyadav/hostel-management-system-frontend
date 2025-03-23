import React from "react"
import { FaBuilding, FaEdit, FaEye, FaUserTie } from "react-icons/fa"
import { MdMeetingRoom } from "react-icons/md"
import { BsThreeDotsVertical } from "react-icons/bs"

const HostelCard = ({ hostel }) => {
  const getTypeColor = (gender) => {
    if (gender === "Boys") return "bg-blue-100 text-blue-600"
    if (gender === "Girls") return "bg-pink-100 text-pink-600"
    return "bg-purple-100 text-purple-600"
  }

  return (
    <div className="bg-white rounded-xl hover:rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`p-2.5 mr-3 rounded-xl ${getTypeColor(hostel.gender)}`}>
            <FaBuilding size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg">{hostel.name}</h3>
            <span className="text-xs md:text-sm text-gray-600">
              {hostel.gender} {hostel.type && `(${hostel.type})`}
            </span>
          </div>
        </div>
        <div className="dropdown relative">
          <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <BsThreeDotsVertical />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between">
        <div className="space-y-2">
          <div className="flex items-center">
            <FaUserTie className="text-gray-500 mr-2 text-sm" />
            <span className="text-xs md:text-sm truncate max-w-[180px]">{hostel.wardens && hostel.wardens.length > 0 ? hostel.wardens[0] : "No warden assigned"}</span>
          </div>
          <div className="flex items-center">
            <MdMeetingRoom className="text-gray-500 mr-2 text-sm" />
            <span className="text-xs md:text-sm">
              {hostel.totalRooms} Rooms ({hostel.vacantRooms} vacant)
            </span>
          </div>
          {hostel.blocks && hostel.blocks.length > 0 && (
            <div className="flex flex-wrap mt-2 gap-1.5">
              {hostel.blocks.map((block, index) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">
                  {block}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col items-center justify-center mt-4 sm:mt-0">
          <div className="relative h-14 w-14 md:h-16 md:w-16">
            <svg className="h-14 w-14 md:h-16 md:w-16" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E4E4E7" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1360AB" strokeWidth="3" strokeDasharray={`${hostel.occupancyRate}, 100`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-bold text-sm md:text-base">{hostel.occupancyRate}%</span>
            </div>
          </div>
          <span className="text-xs text-gray-600 ml-2 sm:ml-0 sm:mt-1">Occupancy</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-between">
        <button className="flex items-center justify-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 w-full">
          <FaEye className="mr-2" /> View Details
        </button>
        <button className="flex items-center justify-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 w-full">
          <FaEdit className="mr-2" /> Edit
        </button>
      </div>
    </div>
  )
}

export default HostelCard
