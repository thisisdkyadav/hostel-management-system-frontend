import React from "react"
import { FaCalendarAlt, FaInfoCircle, FaBuilding, FaUserFriends, FaMapMarkerAlt } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import { HStack, Modal, Surface, Text } from "@/components/ui"
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
          <span style={{ padding: 'var(--spacing-1-5) var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)', backgroundColor: isEventUpcoming ? 'var(--color-success-bg)' : 'var(--color-purple-light-bg)', color: isEventUpcoming ? 'var(--color-success-text)' : 'var(--color-purple-text)' }}>{isEventUpcoming ? "Upcoming" : "Past"}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-6)', paddingTop: 'var(--spacing-2)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>{selectedEvent.eventName}</h2>

          <HStack gap="var(--gap-sm) var(--spacing-0)" wrap>
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
              <FaCalendarAlt style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text as="span" color="body">{date}</Text>
            </HStack>
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
              <BsClock style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text as="span" color="body">{time}</Text>
            </HStack>
            {selectedEvent.venue && (
              <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
                <FaMapMarkerAlt style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                <Text as="span" color="body">{selectedEvent.venue}</Text>
              </HStack>
            )}
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)' }}>
              <FaBuilding style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text as="span" color="body">{selectedEvent.hostel?.name || "All Hostels"}</Text>
            </HStack>
            {selectedEvent.gender && (
              <HStack gap="none" align="center">
                <FaUserFriends style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                <Text as="span" color="body">{selectedEvent.gender.charAt(0).toUpperCase() + selectedEvent.gender.slice(1) + " Only"}</Text>
              </HStack>
            )}
          </HStack>
        </div>

        {/* Description */}
        <Surface bg="tertiary" padding={6} radius="xl" style={{ marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', color: 'var(--color-primary)' }}>
            <FaInfoCircle style={{ marginRight: 'var(--spacing-2)' }} />
            <h3 style={{ fontWeight: 'var(--font-weight-semibold)' }}>Description</h3>
          </div>
          <Text color="body" leading="var(--line-height-relaxed)">{selectedEvent.description}</Text>
        </Surface>

        {/* Organizer */}
        {selectedEvent.organizer && (
          <Surface bg="tertiary" padding={6} radius="xl">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', color: 'var(--color-primary)' }}>
              <FaUserFriends style={{ marginRight: 'var(--spacing-2)' }} />
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)' }}>Organizer</h3>
            </div>
            <Text color="body">{selectedEvent.organizer}</Text>
          </Surface>
        )}
      </div>
    </Modal>
  )
}

export default EventDetailModal
