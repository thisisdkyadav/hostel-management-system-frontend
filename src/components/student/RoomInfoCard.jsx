import React from "react"
import { BsDoorOpenFill } from "react-icons/bs"
import { FaUserFriends } from "react-icons/fa"
import { getMediaUrl } from "../../utils/mediaUtils"
import { Heading, HStack, IconCircle, Surface, Text } from "@/components/ui"

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
      <HStack gap="none" align="center" justify="between">
        <HStack gap="var(--gap-sm)" align="center">
          <BsDoorOpenFill style={{ fontSize: 'var(--icon-lg)', color: 'var(--color-primary)' }} />
          <Heading as="h3" color="tertiary" weight="medium" size="lg">Your Room</Heading>
        </HStack>
        <Surface as="span" bg="info" padding={`var(--spacing-0-5) var(--spacing-2)`} radius="full" color="brand" size="xs">{roomData.hostelName}</Surface>
      </HStack>

      <HStack gap="var(--gap-md)" align="center" style={{ marginTop: 'var(--spacing-3)' }}>
        <Text size="4xl" weight="medium" color="brand">{roomData.roomNumber}</Text>
        <HStack align="center" gap="none" size="xs" color="tertiary">
          <FaUserFriends style={{ color: 'var(--color-text-muted)', marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-sm)' }} />
          <span>
            {roomData.occupiedBeds}/{roomData.totalBeds} Occupied
          </span>
        </HStack>
      </HStack>

      {roomData?.roommates?.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)`, paddingTop: 'var(--spacing-2)' }}>
          <Heading as="h4" size="xs" color="tertiary" style={{ marginBottom: 'var(--spacing-1-5)' }}>Roommates:</Heading>
          <HStack gap="var(--spacing-1-5)" wrap>
            {roomData.roommates.map((roommate) => (
              <Surface bg="tertiary" padding={`var(--spacing-0-5) var(--spacing-1-5)`} radius="md" size="xs" style={{ display: 'flex', alignItems: 'center' }} key={roommate.rollNumber}>
                {roommate.avatar ? (
                  <img src={getMediaUrl(roommate.avatar)} alt={roommate.name} style={{ width: 'var(--avatar-xs)', height: 'var(--avatar-xs)', borderRadius: 'var(--radius-full)', marginRight: 'var(--spacing-1)' }} />
                ) : (
                  <IconCircle size="var(--avatar-xs)" bg="info" color="brand" style={{ fontSize: 'var(--font-size-2xs)', marginRight: 'var(--spacing-1)' }}>
                    {getOccupantInitials(roommate.name)}
                  </IconCircle>
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>{roommate.name}</span>
              </Surface>
            ))}
          </HStack>
        </div>
      )}
    </div>
  )
}

export default RoomInfoCard
