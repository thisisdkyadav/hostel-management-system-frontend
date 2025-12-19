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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${isHovered ? iconStyle.hover : iconStyle.base}`} >
              <FaBuilding />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }}>{hostel.name}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                {hostel.gender} {hostel.type && `(${hostel.type})`}
              </p>
            </div>
          </div>
        </Card.Header>

        {/* Stats and Occupancy Ring */}
        <Card.Body style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-5)' }}>
          {/* Stats List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <FaDoorClosed style={{ color: 'var(--color-text-muted)', width: 'var(--icon-md)' }} />
              <span>{hostel.totalRooms} Rooms ({hostel.totalActiveRooms} Active)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <FaUsers style={{ color: 'var(--color-text-muted)', width: 'var(--icon-md)' }} />
              <span>{hostel.activeRoomsCapacity} Capacity</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <FaDoorOpen style={{ color: 'var(--color-text-muted)', width: 'var(--icon-md)' }} />
              <span>{hostel.vacantRooms} Vacant Rooms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <FaTools style={{ color: 'var(--color-text-muted)', width: 'var(--icon-md)' }} />
              <span>{hostel.maintenanceIssues} maintenance issue{hostel.maintenanceIssues !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Occupancy Ring */}
          <div style={{ position: 'relative', width: '80px', height: '80px', minWidth: '80px', minHeight: '80px' }}>
            <svg
              style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
              viewBox="0 0 36 36"
            >
              {/* Background circle */}
              <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--occupancy-ring-bg)" strokeWidth="2.5" />
              {/* Progress circle */}
              <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--occupancy-ring-fill)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={strokeDasharray} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            </svg>
            {/* Center text */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>{hostel.occupancyRate}%</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Occupancy</span>
            </div>
          </div>
        </Card.Body>

        {/* Action Buttons */}
        <Card.Footer style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', marginTop: 0 }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <button onClick={() => setShowEditModal(true)}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2-5) var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', transition: 'var(--transition-all)', border: 'none', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary)'
                e.currentTarget.style.color = 'var(--color-white)'
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
            <Link to={`/admin/hostels/${hostel.name}`} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2-5) var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', transition: 'var(--transition-all)', border: 'none', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', textDecoration: 'none' }} onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary)'
              e.currentTarget.style.color = 'var(--color-white)'
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
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2-5) var(--spacing-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', transition: 'var(--transition-all)', border: 'none', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary)'
              e.currentTarget.style.color = 'var(--color-white)'
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
