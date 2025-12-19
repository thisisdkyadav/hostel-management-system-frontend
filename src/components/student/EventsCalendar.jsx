import React from "react"
import { Link } from "react-router-dom"
import { FaCalendarAlt } from "react-icons/fa"
import { BsClock } from "react-icons/bs"

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
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: `var(--border-1) solid var(--color-border-light)` }}>
      <div style={{ padding: `var(--spacing-3) var(--spacing-4)`, borderBottom: `var(--border-1) solid var(--color-border-light)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
          <FaCalendarAlt style={{ marginRight: 'var(--spacing-1-5)', color: 'var(--color-primary)', fontSize: 'var(--icon-sm)' }} />
          Upcoming Events
        </h3>
        <Link to="events" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
          View All
        </Link>
      </div>

      {events.length === 0 ? (
        <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <FaCalendarAlt style={{ margin: '0 auto', fontSize: 'var(--icon-2xl)', color: 'var(--color-text-placeholder)', marginBottom: 'var(--spacing-1)' }} />
          <p style={{ fontSize: 'var(--font-size-xs)' }}>No upcoming events</p>
        </div>
      ) : (
        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {events.map((event) => {
            const { day, month, time } = formatDate(event.dateAndTime)

            return (
              <div key={event._id} style={{ display: 'flex', alignItems: 'flex-start', padding: `var(--spacing-2) var(--spacing-3)`, borderBottom: `var(--border-1) solid var(--color-border-light)`, transition: 'var(--transition-colors)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-bg-light)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ marginRight: 'var(--spacing-2)', flexShrink: 0, width: 'var(--spacing-10)', height: '48px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-bg-light)' }}>
                  <span style={{ fontSize: 'var(--font-size-2xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>{month}</span>
                  <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{day}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.eventName}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-0-5)' }}>
                    <BsClock style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-2xs)' }} /> {time}
                  </div>
                  <p style={{ marginTop: 'var(--spacing-0-5)', fontSize: 'var(--text-badge)', color: 'var(--color-text-tertiary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{event.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EventsCalendar
