import React from "react"
import { FaCalendarAlt, FaInfoCircle, FaBuilding, FaUserFriends, FaMapMarkerAlt } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import Modal from "../common/Modal"
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-sm) var(--spacing-0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 'var(--spacing-4)' }}>
              <FaCalendarAlt style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-body)' }}>{date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 'var(--spacing-4)' }}>
              <BsClock style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-body)' }}>{time}</span>
            </div>
            {selectedEvent.venue && (
              <div style={{ display: 'flex', alignItems: 'center', marginRight: 'var(--spacing-4)' }}>
                <FaMapMarkerAlt style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                <span style={{ color: 'var(--color-text-body)' }}>{selectedEvent.venue}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 'var(--spacing-4)' }}>
              <FaBuilding style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-body)' }}>{selectedEvent.hostel?.name || "All Hostels"}</span>
            </div>
            {selectedEvent.gender && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaUserFriends style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-80)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                <span style={{ color: 'var(--color-text-body)' }}>{selectedEvent.gender.charAt(0).toUpperCase() + selectedEvent.gender.slice(1) + " Only"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', color: 'var(--color-primary)' }}>
            <FaInfoCircle style={{ marginRight: 'var(--spacing-2)' }} />
            <h3 style={{ fontWeight: 'var(--font-weight-semibold)' }}>Description</h3>
          </div>
          <p style={{ color: 'var(--color-text-body)', lineHeight: 'var(--line-height-relaxed)' }}>{selectedEvent.description}</p>
        </div>

        {/* Organizer */}
        {selectedEvent.organizer && (
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)', color: 'var(--color-primary)' }}>
              <FaUserFriends style={{ marginRight: 'var(--spacing-2)' }} />
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)' }}>Organizer</h3>
            </div>
            <p style={{ color: 'var(--color-text-body)' }}>{selectedEvent.organizer}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default EventDetailModal
