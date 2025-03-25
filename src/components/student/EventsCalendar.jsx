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
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 flex items-center">
          <FaCalendarAlt className="mr-2 text-[#1360AB]" />
          Upcoming Events
        </h3>
        <Link to="events" className="text-xs text-[#1360AB] hover:underline">
          View All
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <FaCalendarAlt className="mx-auto text-3xl text-gray-300 mb-2" />
          <p className="text-sm">No upcoming events</p>
        </div>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          {events.map((event) => {
            const { day, month, time } = formatDate(event.dateAndTime)

            return (
              <div key={event._id} className="flex items-start px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
                <div className="mr-3 flex-shrink-0 w-12 h-14 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs text-[#1360AB] font-medium">{month}</span>
                  <span className="text-lg font-bold text-[#1360AB]">{day}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 line-clamp-1">{event.eventName}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <BsClock className="mr-1" /> {time}
                  </div>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">{event.description}</p>
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
