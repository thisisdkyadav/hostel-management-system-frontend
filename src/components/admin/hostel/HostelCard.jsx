import React, { useState } from "react"
import { FaBuilding, FaEdit, FaDoorClosed, FaUsers, FaDoorOpen, FaTools, FaClipboardList } from "react-icons/fa"
import EditHostelModal from "./EditHostelModal"
import { Link } from "react-router-dom"
import HostelDetailsModal from "./HostelDetailsModal"

const HostelCard = ({ hostel, onUpdate, refreshHostels }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Icon colors based on gender
  const getIconStyle = (gender) => {
    if (gender === "Boys") {
      return {
        base: "bg-[#e8f1fe] text-[#0b57d0]",
        hover: "bg-[#0b57d0] text-white"
      }
    }
    if (gender === "Girls") {
      return {
        base: "bg-pink-50 text-pink-600",
        hover: "bg-pink-500 text-white"
      }
    }
    // Co-ed / Other
    return {
      base: "bg-purple-50 text-purple-600",
      hover: "bg-purple-500 text-white"
    }
  }

  const iconStyle = getIconStyle(hostel.gender)

  const handleSaveHostel = async (updatedHostel) => {
    if (onUpdate) {
      await onUpdate(updatedHostel)
    }
  }

  // Calculate SVG circle properties for occupancy ring
  const radius = 15.9155
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${hostel.occupancyRate}, 100`

  return (
    <>
      <div 
        className="bg-white rounded-[20px] p-5 md:p-6 transition-all duration-300 border border-[#d4e4fd] group"
        style={{
          boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderColor: isHovered ? '#a8c9fc' : '#d4e4fd',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-4 mb-5">
          <div 
            className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${isHovered ? iconStyle.hover : iconStyle.base}`}
          >
            <FaBuilding />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1e293b]">{hostel.name}</h3>
            <p className="text-sm text-[#64748b]">
              {hostel.gender} {hostel.type && `(${hostel.type})`}
            </p>
          </div>
        </div>

        {/* Stats and Occupancy Ring */}
        <div className="flex justify-between mb-5">
          {/* Stats List */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[0.85rem] text-[#64748b]">
              <FaDoorClosed className="text-[#94a3b8] w-4" />
              <span>{hostel.totalRooms} Rooms ({hostel.totalActiveRooms} Active)</span>
            </div>
            <div className="flex items-center gap-2 text-[0.85rem] text-[#64748b]">
              <FaUsers className="text-[#94a3b8] w-4" />
              <span>{hostel.activeRoomsCapacity} Capacity</span>
            </div>
            <div className="flex items-center gap-2 text-[0.85rem] text-[#64748b]">
              <FaDoorOpen className="text-[#94a3b8] w-4" />
              <span>{hostel.vacantRooms} Vacant Rooms</span>
            </div>
            <div className="flex items-center gap-2 text-[0.85rem] text-[#64748b]">
              <FaTools className="text-[#94a3b8] w-4" />
              <span>{hostel.maintenanceIssues} maintenance issue{hostel.maintenanceIssues !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Occupancy Ring */}
          <div className="relative w-20 h-20 min-w-[80px] min-h-[80px]">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 36 36"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#d4e4fd"
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#0b57d0"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-[#0a1628]">{hostel.occupancyRate}%</span>
              <span className="text-[0.65rem] text-[#4a6085]">Occupancy</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-[#e8f1fe] text-[#0b57d0]"
              style={{ transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0b57d0, #3b7de8)'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(11, 87, 208, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e8f1fe'
                e.currentTarget.style.color = '#0b57d0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <FaEdit />
              Edit Details
            </button>
            <Link 
              to={`/admin/hostels/${hostel.name}`} 
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-[#e8f1fe] text-[#0b57d0]"
              style={{ transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0b57d0, #3b7de8)'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(11, 87, 208, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e8f1fe'
                e.currentTarget.style.color = '#0b57d0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <FaDoorOpen />
              View {hostel.type === "room-only" ? "Rooms" : "Units"}
            </Link>
          </div>
          <button 
            onClick={() => setShowDetailsModal(true)} 
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-[#e8f1fe] text-[#0b57d0]"
            style={{ transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0b57d0, #3b7de8)'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(11, 87, 208, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#e8f1fe'
              e.currentTarget.style.color = '#0b57d0'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <FaClipboardList />
            View Details
          </button>
        </div>
      </div>

      {showEditModal && <EditHostelModal hostel={hostel} onClose={() => setShowEditModal(false)} onSave={handleSaveHostel} refreshHostels={refreshHostels} />}
      {showDetailsModal && <HostelDetailsModal hostel={hostel} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default HostelCard
