import React, { useState } from "react"
import { FaBuilding, FaEdit, FaEye, FaTools, FaUserTie } from "react-icons/fa"
import { MdMeetingRoom } from "react-icons/md"
import { BsThreeDotsVertical } from "react-icons/bs"
import EditHostelModal from "./EditHostelModal"
import { FaLocationDot } from "react-icons/fa6"

const HostelCard = ({ hostel, onUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false)

  const getTypeColor = (gender) => {
    if (gender === "Boys") return "bg-blue-100 text-blue-600"
    if (gender === "Girls") return "bg-pink-100 text-pink-600"
    return "bg-purple-100 text-purple-600"
  }

  const handleSaveHostel = async (updatedHostel) => {
    if (onUpdate) {
      await onUpdate(updatedHostel)
    }
  }

  return (
    <>
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
            <div className="flex items-center">
              <FaLocationDot className="text-gray-500 mr-2 text-sm" />
              <span className="text-xs md:text-sm">{hostel.location}</span>
            </div>
            {/* maintenance issues count */}
            <div className="flex items-center">
              <FaTools className="text-gray-500 mr-2 text-sm" />
              <span className="text-xs md:text-sm">{hostel.maintenanceIssues} maintenance issues</span>
            </div>
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
          <button className="flex items-center justify-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 w-full" onClick={() => setShowEditModal(true)}>
            <FaEdit className="mr-2" /> Edit Details
          </button>
        </div>
      </div>

      {showEditModal && <EditHostelModal hostel={hostel} onClose={() => setShowEditModal(false)} onSave={handleSaveHostel} />}
    </>
  )
}

export default HostelCard
