import React from "react"
import { FaDoorOpen, FaUserPlus, FaUserGraduate } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import Button from "../common/Button"

const RoomCard = ({ room, onClick, onAllocate }) => {
  const { user } = useAuth()

  const occupancyPercentage = room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0

  const getStatusBadge = () => {
    if (room.status === "Inactive") {
      return <span style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-1) var(--spacing-2)', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-weight-medium)' }}>Inactive</span>
    } else if (room.currentOccupancy >= room.capacity) {
      return <span style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-1) var(--spacing-2)', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-weight-medium)' }}>Full</span>
    } else if (room.currentOccupancy > 0) {
      return <span style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)', fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-1) var(--spacing-2)', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-weight-medium)' }}>Partial</span>
    } else {
      return <span style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-1) var(--spacing-2)', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-weight-medium)' }}>Empty</span>
    }
  }
  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-5)', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-all)', border: `var(--border-1) solid var(--color-border-light)`, cursor: 'pointer' }} onClick={onClick} onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ padding: 'var(--spacing-2-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', marginRight: 'var(--spacing-3)' }}>
            <FaDoorOpen size={20} />
          </div>
          <div>
            <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-0-5)' }} className="md:text-lg">Room {room.roomNumber}</h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{room.type || "Standard"}</span>
          </div>
        </div>
        {room.status === "Inactive" ? (
          <span style={{ padding: 'var(--spacing-1) var(--spacing-2-5)', fontSize: 'var(--font-size-xs)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', fontWeight: 'var(--font-weight-medium)' }}>Inactive</span>
        ) : room.currentOccupancy >= room.capacity ? (
          <span style={{ padding: 'var(--spacing-1) var(--spacing-2-5)', fontSize: 'var(--font-size-xs)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', fontWeight: 'var(--font-weight-medium)' }}>Full</span>
        ) : room.currentOccupancy > 0 ? (
          <span style={{ padding: 'var(--spacing-1) var(--spacing-2-5)', fontSize: 'var(--font-size-xs)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)', fontWeight: 'var(--font-weight-medium)' }}>Partial</span>
        ) : (
          <span style={{ padding: 'var(--spacing-1) var(--spacing-2-5)', fontSize: 'var(--font-size-xs)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Empty</span>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-tertiary)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Capacity</span>
          </div>
          <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{room.capacity || 0} students</span>
        </div>

        {room.status === "Inactive" ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-tertiary)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Status</span>
            </div>
            <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>Inactive room</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-tertiary)' }}>
                <FaUserGraduate style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)', opacity: 'var(--opacity-70)', fontSize: 'var(--icon-md)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)' }}>Current Occupancy</span>
              </div>
              <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                {room.currentOccupancy || 0}/{room.capacity || 0}
              </span>
            </div>

            <div style={{ paddingTop: 'var(--spacing-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-1-5)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Occupancy Rate</span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>{room.capacity ? Math.round(((room.currentOccupancy || 0) / room.capacity) * 100) : 0}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', height: 'var(--spacing-1-5)' }}>
                <div style={{
                  height: 'var(--spacing-1-5)', borderRadius: 'var(--radius-full)', backgroundColor: room.currentOccupancy >= room.capacity ? 'var(--color-success)' : room.currentOccupancy > 0 ? 'var(--color-primary)' : 'var(--color-text-disabled)',
                  width: `${room.capacity ? Math.min(100, Math.round(((room.currentOccupancy || 0) / room.capacity) * 100)) : 0}%`,
                  transition: 'var(--transition-all)'
                }}
                ></div>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-5)', display: 'flex', gap: 'var(--spacing-2)' }}>
        <Button onClick={() => onClick()} variant="outline" size="medium" style={{ flex: 1 }}>
          View Details
        </Button>

        {["Admin"].includes(user.role) && room.status !== "Inactive" && room.currentOccupancy < room.capacity && (
          <Button onClick={(e) => { e.stopPropagation(); onAllocate(); }} variant="success" size="medium" icon={<FaUserPlus />} style={{ flex: 1 }}>
            Allocate
          </Button>
        )}
      </div>
    </div>
  )
}

export default RoomCard
