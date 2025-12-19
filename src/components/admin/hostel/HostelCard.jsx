import React, { useState } from "react"
import { FaBuilding, FaEdit, FaDoorClosed, FaUsers, FaDoorOpen, FaTools, FaClipboardList } from "react-icons/fa"
import EditHostelModal from "./EditHostelModal"
import { Link } from "react-router-dom"
import HostelDetailsModal from "./HostelDetailsModal"
import Card from "../../common/Card"

const HostelCard = ({ hostel, onUpdate, refreshHostels }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Icon colors based on gender
  const getIconStyle = (gender) => {
    if (gender === "Boys") {
      return {
        base: "bg-[var(--color-boys-bg)] text-[var(--color-boys-text)]",
        hover: "bg-[var(--color-boys-hover-bg)] text-white"
      }
    }
    if (gender === "Girls") {
      return {
        base: "bg-[var(--color-girls-bg)] text-[var(--color-girls-text)]",
        hover: "bg-[var(--color-girls-hover-bg)] text-white"
      }
    }
    // Co-ed / Other
    return {
      base: "bg-[var(--color-coed-bg)] text-[var(--color-coed-text)]",
      hover: "bg-[var(--color-coed-hover-bg)] text-white"
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
      <Card className="group" onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header with Icon and Title */}
        <Card.Header>
          <div className="flex items-center gap-4">
            <div className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${isHovered ? iconStyle.hover : iconStyle.base}`} >
              <FaBuilding />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text-secondary)]">{hostel.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {hostel.gender} {hostel.type && `(${hostel.type})`}
              </p>
            </div>
          </div>
        </Card.Header>

        {/* Stats and Occupancy Ring */}
        <Card.Body className="flex justify-between mb-5">
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
              <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--occupancy-ring-bg)" strokeWidth="2.5" />
              {/* Progress circle */}
              <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--occupancy-ring-fill)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={strokeDasharray} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-[#0a1628]">{hostel.occupancyRate}%</span>
              <span className="text-[0.65rem] text-[#4a6085]">Occupancy</span>
            </div>
          </div>
        </Card.Body>

        {/* Action Buttons */}
        <Card.Footer className="flex flex-col gap-2 mt-0">
          <div className="flex gap-2">
            <button onClick={() => setShowEditModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
              style={{ transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary)'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.boxShadow = 'var(--shadow-button-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-bg)'
                e.currentTarget.style.color = 'var(--color-primary)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <FaEdit />
              Edit Details
            </button>
            <Link to={`/admin/hostels/${hostel.name}`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-[var(--color-primary-bg)] text-[var(--color-primary)]" style={{ transition: 'all 0.3s ease' }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary)'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.boxShadow = 'var(--shadow-button-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-bg)'
                e.currentTarget.style.color = 'var(--color-primary)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <FaDoorOpen />
              View {hostel.type === "room-only" ? "Rooms" : "Units"}
            </Link>
          </div>
          <button onClick={() => setShowDetailsModal(true)} 
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
            style={{ transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary)'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.boxShadow = 'var(--shadow-button-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-bg)'
              e.currentTarget.style.color = 'var(--color-primary)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <FaClipboardList />
            View Details
          </button>
        </Card.Footer>
      </Card>

      {showEditModal && <EditHostelModal hostel={hostel} onClose={() => setShowEditModal(false)} onSave={handleSaveHostel} refreshHostels={refreshHostels} />}
      {showDetailsModal && <HostelDetailsModal hostel={hostel} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default HostelCard
