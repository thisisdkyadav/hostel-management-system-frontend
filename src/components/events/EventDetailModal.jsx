import React from "react"
import { FaCalendarAlt, FaInfoCircle, FaBuilding, FaUserFriends, FaMapMarkerAlt } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import { Heading, HStack, Modal, Surface, Text } from "@/components/ui"
import { formatDateTime, isUpcoming } from "../../utils/dateUtils"

const EventDetailModal = ({ selectedEvent, setShowDetailModal }) => {
  if (!selectedEvent) return null

  const isEventUpcoming = isUpcoming(selectedEvent.dateAndTime)
  const { date, time } = formatDateTime(selectedEvent.dateAndTime)

  return (
    <Modal title="Event Details" onClose={() => setShowDetailModal(false)} width={700}>
      <div style={{ position: 'relative' }}>
        {/* Status Badge - Positioned at top right */}
        <div style={{ position: 'absolute', top: 'var(--spacing-0)', right: 'var(--spacing-0)' }}>
          <Surface as="span" bg={isEventUpcoming ? 'var(--color-success-bg)' : 'var(--color-purple-light-bg)'} padding="var(--spacing-1-5) var(--spacing-4)" radius="full" shadow="sm" color={isEventUpcoming ? 'var(--color-success-text)' : 'var(--color-purple-text)'} size="sm" weight="medium">{isEventUpcoming ? "Upcoming" : "Past"}</Surface>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-6)', paddingTop: 'var(--spacing-2)' }}>
          <Heading as="h2" size="2xl" weight="bold" color="primary" style={{ marginBottom: 'var(--spacing-3)' }}>{selectedEvent.eventName}</Heading>

          <HStack gap="var(--gap-sm) var(--spacing-0)" wrap>
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
              <FaCalendarAlt style={{ opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
              <Text as="span" color="body">{date}</Text>
            </HStack>
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
              <BsClock style={{ opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
              <Text as="span" color="body">{time}</Text>
            </HStack>
            {selectedEvent.venue && (
              <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
                <FaMapMarkerAlt style={{ opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
                <Text as="span" color="body">{selectedEvent.venue}</Text>
              </HStack>
            )}
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
              <FaBuilding style={{ opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
              <Text as="span" color="body">{selectedEvent.hostel?.name || "All Hostels"}</Text>
            </HStack>
            {selectedEvent.gender && (
              <HStack gap="none" align="center">
                <FaUserFriends style={{ opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
                <Text as="span" color="body">{selectedEvent.gender.charAt(0).toUpperCase() + selectedEvent.gender.slice(1) + " Only"}</Text>
              </HStack>
            )}
          </HStack>
        </div>

        {/* Description */}
        <Surface bg="tertiary" padding={6} radius="xl" style={{ marginBottom: 'var(--spacing-6)' }}>
          <HStack align="center" gap="none" color="brand" style={{ marginBottom: 'var(--spacing-3)' }}>
            <FaInfoCircle style={{ marginRight: 'var(--spacing-2)' }} />
            <Heading as="h3" weight="semibold">Description</Heading>
          </HStack>
          <Text color="body" leading="var(--line-height-relaxed)">{selectedEvent.description}</Text>
        </Surface>

        {/* Organizer */}
        {selectedEvent.organizer && (
          <Surface bg="tertiary" padding={6} radius="xl">
            <HStack align="center" gap="none" color="brand" style={{ marginBottom: 'var(--spacing-3)' }}>
              <FaUserFriends style={{ marginRight: 'var(--spacing-2)' }} />
              <Heading as="h3" weight="semibold">Organizer</Heading>
            </HStack>
            <Text color="body">{selectedEvent.organizer}</Text>
          </Surface>
        )}
      </div>
    </Modal>
  )
}

export default EventDetailModal
