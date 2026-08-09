import React from "react"
import { FaBed } from "react-icons/fa"
import { HStack, Surface, Text } from "hzero"

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
        <Surface bg="warning" padding={3} radius="md" color="warning-text" size="base">No beds available in this room</Surface>
      ) : (
        <>
          <Text size="sm" color="tertiary" style={{ marginBottom: 'var(--spacing-3)' }}>Select a bed number for the student in the new room:</Text>
          <HStack gap={2} wrap>
            {availableBeds.map((bedNumber) => (
              <button key={bedNumber} onClick={() => onSelectBed(bedNumber)}
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
                <FaBed style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-md)' }} color={selectedBed === bedNumber ? 'var(--color-white)' : 'var(--color-text-muted)'} />
                {bedNumber}
              </button>
            ))}
          </HStack>
        </>
      )}
    </div>
  )
}

export default BedSelectionComponent
