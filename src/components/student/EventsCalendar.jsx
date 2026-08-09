import React from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Clock } from "lucide-react"
import { Card, Heading, HStack, Surface, Text } from "hzero"

const EventsCalendar = ({ events = [] }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <Card padding="p-0" className="overflow-hidden">
      <div style={{ padding: `var(--spacing-3) var(--spacing-4)`, borderBottom: `var(--border-1) solid var(--color-border-light)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
          <CalendarDays size={14} style={{ marginRight: 'var(--spacing-1-5)' }} color="var(--color-primary)" />
          Upcoming Events
        </h3>
        <Link to="events" className="no-underline hover:underline" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', transition: 'var(--transition-colors)' }}>
          View All
        </Link>
      </div>

      {events.length === 0 ? (
        <Surface padding={4} color="muted" align="center">
          <CalendarDays size={32} style={{ margin: '0 auto', marginBottom: 'var(--spacing-1)' }} color="var(--color-text-placeholder)" />
          <Text size="xs">No upcoming events</Text>
        </Surface>
      ) : (
        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {events.map((event) => {
            const { day, month, time } = formatDate(event.dateAndTime)

            return (
              <div key={event._id} className="hover:bg-[var(--color-primary-bg-light)]" style={{ display: 'flex', alignItems: 'flex-start', padding: `var(--spacing-2) var(--spacing-3)`, borderBottom: `var(--border-1) solid var(--color-border-light)`, transition: 'var(--transition-colors)', cursor: 'pointer' }}>
                <div style={{ marginRight: 'var(--spacing-2)', flexShrink: 0, width: 'var(--spacing-10)', height: '48px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-bg-light)' }}>
                  <Text as="span" size="2xs" weight="medium" color="brand">{month}</Text>
                  <Text as="span" size="lg" weight="bold" color="brand">{day}</Text>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Heading as="h4" weight="medium" color="secondary" size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.eventName}</Heading>
                  <HStack align="center" gap="none" size="2xs" color="muted" style={{ marginTop: 'var(--spacing-0-5)' }}>
                    <Clock size={10} style={{ marginRight: 'var(--spacing-1)' }} /> {time}
                  </HStack>
                  <Text size="var(--text-badge)" color="tertiary" style={{ marginTop: 'var(--spacing-0-5)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{event.description}</Text>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default EventsCalendar
