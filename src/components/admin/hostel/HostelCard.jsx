import React, { useState } from "react"
import { Building, Pencil, DoorClosed, Users, DoorOpen, Wrench, ClipboardList } from "lucide-react"
import EditHostelModal from "./EditHostelModal"
import { Link } from "react-router-dom"
import HostelDetailsModal from "./HostelDetailsModal"
import { Card, CardHeader, CardBody, CardFooter, Button, VStack, HStack } from "@/components/ui"

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
      <Card className="group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* Header with Icon and Title */}
        <CardHeader>
          <HStack gap="medium" align="center">
            <div className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${isHovered ? iconStyle.hover : iconStyle.base}`}>
              <Building size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)' }}>{hostel.name}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                {hostel.gender} {hostel.type && `(${hostel.type})`}
              </p>
            </div>
          </HStack>
        </CardHeader>

        {/* Stats and Occupancy Ring */}
        <CardBody style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-5)' }}>
          {/* Stats List */}
          <VStack gap="xsmall">
            <HStack gap="xsmall" align="center" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <DoorClosed size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span>{hostel.totalRooms} Rooms ({hostel.totalActiveRooms} Active)</span>
            </HStack>
            <HStack gap="xsmall" align="center" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span>{hostel.activeRoomsCapacity} Capacity</span>
            </HStack>
            <HStack gap="xsmall" align="center" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <DoorOpen size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span>{hostel.vacantRooms} Vacant Rooms</span>
            </HStack>
            <HStack gap="xsmall" align="center" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
              <Wrench size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span>{hostel.maintenanceIssues} maintenance issue{hostel.maintenanceIssues !== 1 ? 's' : ''}</span>
            </HStack>
          </VStack>

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
        </CardBody>

        {/* Action Buttons */}
        <CardFooter style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', marginTop: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
            <Button
              onClick={() => setShowEditModal(true)}
              variant="secondary"
              size="medium"
              icon={<Pencil size={16} />}
              fullWidth
            >
              Edit Details
            </Button>
            <Link to={`/admin/hostels/${hostel.name}`} style={{ flex: 1, textDecoration: 'none' }}>
              <Button
                variant="secondary"
                size="medium"
                icon={<DoorOpen size={16} />}
                fullWidth
              >
                View {hostel.type === "room-only" ? "Rooms" : "Units"}
              </Button>
            </Link>
          </div>
          <Button
            onClick={() => setShowDetailsModal(true)}
            variant="secondary"
            size="medium"
            icon={<ClipboardList size={16} />}
            fullWidth
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      {showEditModal && <EditHostelModal hostel={hostel} onClose={() => setShowEditModal(false)} onSave={handleSaveHostel} refreshHostels={refreshHostels} />}
      {showDetailsModal && <HostelDetailsModal hostel={hostel} onClose={() => setShowDetailsModal(false)} />}
    </>
  )
}

export default HostelCard
