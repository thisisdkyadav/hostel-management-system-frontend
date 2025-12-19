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
    <div style={{ backgroundColor: 'var(--color-bg-primary)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', width: '100%', border: `var(--border-1) solid var(--color-border-light)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
          <BsDoorOpenFill style={{ fontSize: 'var(--icon-lg)', color: 'var(--color-primary)' }} />
          <h3 style={{ color: 'var(--color-text-tertiary)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-lg)' }}>Your Room</h3>
        </div>
        <span style={{ fontSize: 'var(--font-size-xs)', padding: `var(--spacing-0-5) var(--spacing-2)`, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-primary)' }}>{roomData.hostelName}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginTop: 'var(--spacing-3)' }}>
        <p style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>{roomData.roomNumber}</p>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
          <FaUserFriends style={{ color: 'var(--color-text-muted)', marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-sm)' }} />
          <span>
            {roomData.occupiedBeds}/{roomData.totalBeds} Occupied
          </span>
        </div>
      </div>

      {roomData?.roommates?.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)`, paddingTop: 'var(--spacing-2)' }}>
          <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-1-5)' }}>Roommates:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1-5)' }}>
            {roomData.roommates.map((roommate) => (
              <div key={roommate.rollNumber} style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--color-bg-tertiary)', padding: `var(--spacing-0-5) var(--spacing-1-5)`, borderRadius: 'var(--radius-md)' }}>
                {roommate.avatar ? (
                  <img src={getMediaUrl(roommate.avatar)} alt={roommate.name} style={{ width: 'var(--avatar-xs)', height: 'var(--avatar-xs)', borderRadius: 'var(--radius-full)', marginRight: 'var(--spacing-1)' }} />
                ) : (
                  <div style={{ width: 'var(--avatar-xs)', height: 'var(--avatar-xs)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-2xs)', marginRight: 'var(--spacing-1)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-primary)' }}>
                    {getOccupantInitials(roommate.name)}
                  </div>
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>{roommate.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomInfoCard
