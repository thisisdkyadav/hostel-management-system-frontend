import React from "react"
import { FaBed } from "react-icons/fa"

const BedSelectionComponent = ({ roomDetails, selectedBed, onSelectBed }) => {
  if (!roomDetails) {
    return <div>Loading room details...</div>
  }

  const calculateAvailableBeds = () => {
    if (!roomDetails || !roomDetails.capacity) return []
    const allBeds = Array.from({ length: roomDetails.capacity }, (_, i) => i + 1)
    const occupiedBeds = roomDetails.students?.map((student) => student.bedNumber) || []
    return allBeds.filter((bed) => !occupiedBeds.includes(bed))
  }

  const availableBeds = calculateAvailableBeds()

  return (
    <div>
      {availableBeds.length === 0 ? (
        <div style={{ 
          padding: 'var(--spacing-3)', 
          backgroundColor: 'var(--color-warning-bg)', 
          color: 'var(--color-warning-text)', 
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-base)'
        }}>No beds available in this room</div>
      ) : (
        <>
          <p style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--color-text-tertiary)', 
            marginBottom: 'var(--spacing-3)' 
          }}>Select a bed number for the student in the new room:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
            {availableBeds.map((bedNumber) => (
              <button
                key={bedNumber}
                onClick={() => onSelectBed(bedNumber)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: 'var(--spacing-16)', 
                  padding: 'var(--spacing-2) var(--spacing-4)', 
                  borderRadius: 'var(--radius-md)', 
                  border: `var(--border-1) solid ${selectedBed === bedNumber ? 'var(--color-primary)' : 'var(--color-border-input)'}`, 
                  transition: 'var(--transition-colors)',
                  backgroundColor: selectedBed === bedNumber ? 'var(--color-primary)' : 'var(--color-bg-primary)',
                  color: selectedBed === bedNumber ? 'var(--color-white)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
                onMouseEnter={(e) => {
                  if (selectedBed !== bedNumber) {
                    e.target.style.backgroundColor = 'var(--color-bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedBed !== bedNumber) {
                    e.target.style.backgroundColor = 'var(--color-bg-primary)';
                  }
                }}
              >
                <FaBed style={{ 
                  marginRight: 'var(--spacing-1)', 
                  color: selectedBed === bedNumber ? 'var(--color-white)' : 'var(--color-text-muted)',
                  fontSize: 'var(--icon-md)'
                }} />
                {bedNumber}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default BedSelectionComponent
