import React, { useState } from "react"
import { FaEdit, FaCalendarAlt, FaBuilding, FaUserFriends } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import EventEditForm from "./EventEditForm"
import EventDetailModal from "./EventDetailModal"
import { eventsApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { formatDateTime, isUpcoming } from "../../utils/dateUtils"
import { Card, HStack, Text } from "@/components/ui"
import { Button } from "czero/react"

const EventCard = ({ event, refresh }) => {
  const { user } = useAuth()
  const canManageEvents = ["Admin"].includes(user?.role) && true

  const [isEditing, setIsEditing] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const isEventUpcoming = isUpcoming(event.dateAndTime)
  const { date, time } = formatDateTime(event.dateAndTime)

  const handleEditClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async (updatedEvent) => {
    try {
      const response = await eventsApi.updateEvent(updatedEvent._id, updatedEvent)
      if (response.success) {
        alert("Event updated successfully")
        setIsEditing(false)
        refresh()
      } else {
        alert("Failed to update event")
      }
    } catch (error) {
      alert("An error occurred while updating the event")
    }
  }

  const handleDelete = async (eventId) => {
    try {
      const response = await eventsApi.deleteEvent(eventId)
      if (response.success) {
        alert("Event deleted successfully")
        refresh()
      } else {
        alert("Failed to delete event")
      }
    } catch (error) {
      alert("An error occurred while deleting the event")
    }
  }

  const handleCardClick = () => {
    setShowDetailModal(true)
  }

  if (isEditing) {
    return <EventEditForm event={event} onCancel={handleCancelEdit} onSave={handleSaveEdit} onDelete={handleDelete} />
  }

  return (
    <>
      <Card className="cursor-pointer" onClick={handleCardClick} >
        <Card.Header style={{ marginBottom: 'var(--spacing-0)' }}>
          <HStack gap="none" align="start" justify="between">
            <HStack gap="none" align="center">
              <div style={{ padding: 'var(--spacing-2-5)', marginRight: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)', backgroundColor: isEventUpcoming ? 'var(--color-success-bg)' : 'var(--color-purple-light-bg)', color: isEventUpcoming ? 'var(--color-success-text)' : 'var(--color-purple-text)' }}>
                <FaCalendarAlt size={20} />
              </div>
              <div>
                <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height-tight)' }} className="md:text-lg line-clamp-1">{event.eventName}</h3>
                <Text as="span" size="xs" color="muted">ID: {event._id.substring(0, 8)}</Text>
              </div>
            </HStack>
            <span style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-1) var(--spacing-2-5)', borderRadius: 'var(--radius-full)', backgroundColor: isEventUpcoming ? 'var(--color-success-bg)' : 'var(--color-purple-light-bg)', color: isEventUpcoming ? 'var(--color-success-text)' : 'var(--color-purple-text)' }}>{isEventUpcoming ? "Upcoming" : "Past"}</span>
          </HStack>
        </Card.Header>

        <Card.Body className="mt-4 space-y-3">
          <HStack gap="none" align="center" wrap>
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)', marginBottom: 'var(--spacing-1)' }}>
              <FaCalendarAlt style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-70)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text as="span" size="sm" color="body">{date}</Text>
            </HStack>
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)', marginBottom: 'var(--spacing-1)' }}>
              <BsClock style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-70)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text as="span" size="sm" color="body">{time}</Text>
            </HStack>
            <HStack gap="none" align="center" style={{ marginRight: 'var(--spacing-4)', marginBottom: 'var(--spacing-1)' }}>
              <FaBuilding style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-70)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
              <Text as="span" size="sm" color="body" weight="medium">{event.hostel?.name || "All Hostels"}</Text>
            </HStack>
            {event.gender && (
              <HStack gap="none" align="center" style={{ marginBottom: 'var(--spacing-1)' }}>
                <FaUserFriends style={{ color: 'var(--color-primary)', opacity: 'var(--opacity-70)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} />
                <Text as="span" size="sm" color="body" weight="medium">{event.gender.charAt(0).toUpperCase() + event.gender.slice(1) + " Only"}</Text>
              </HStack>
            )}
          </HStack>
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)', minHeight: '80px' }}>
            <Text size="sm" color="body" className="line-clamp-3">{event.description}</Text>
          </div>
        </Card.Body>

        <Card.Footer style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: `var(--border-1) solid var(--color-border-light)`, display: 'flex', justifyContent: 'flex-end' }}>
          {canManageEvents && (
            <Button onClick={handleEditClick} variant="outline" size="sm">
              <FaEdit /> Edit
            </Button>
          )}
        </Card.Footer>
      </Card>

      {showDetailModal && <EventDetailModal selectedEvent={event} setShowDetailModal={setShowDetailModal} />}
    </>
  )
}

export default EventCard
