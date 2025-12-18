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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 text-sm flex items-center">
          <FaCalendarAlt className="mr-1.5" style={{ color: 'var(--color-primary)' }} />
          Upcoming Events
        </h3>
        <Link to="events" className="text-xs hover:underline" style={{ color: 'var(--color-primary)' }}>
          View All
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <FaCalendarAlt className="mx-auto text-2xl text-gray-300 mb-1" />
          <p className="text-xs">No upcoming events</p>
        </div>
      ) : (
        <div className="max-h-[250px] overflow-y-auto">
          {events.map((event) => {
            const { day, month, time } = formatDate(event.dateAndTime)

            return (
              <div key={event._id} className="flex items-start px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
                <div className="mr-2 flex-shrink-0 w-10 h-12 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--color-primary)' }}>{month}</span>
                  <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>{day}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{event.eventName}</h4>
                  <div className="flex items-center text-[10px] text-gray-500 mt-0.5">
                    <BsClock className="mr-1" /> {time}
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-600 line-clamp-2">{event.description}</p>
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
