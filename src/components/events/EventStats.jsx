import React from "react"
import StatCards from "../admin/StatCards"
import { FaCalendarAlt, FaCalendarCheck, FaCalendarDay } from "react-icons/fa"
import { MdEventAvailable } from "react-icons/md"

const EventStats = ({ events }) => {
  const now = new Date()
  const totalEvents = events.length
  const upcomingEvents = events.filter((event) => new Date(event.dateAndTime) > now).length
  const pastEvents = events.filter((event) => new Date(event.dateAndTime) <= now).length

  // Get nearest upcoming event date
  const getNextEventDate = () => {
    if (events.length === 0) return "No events scheduled"

    const upcomingEvents = events.filter((event) => new Date(event.dateAndTime) > now)
    if (upcomingEvents.length === 0) return "No upcoming events"

    const sortedEvents = [...upcomingEvents].sort((a, b) => new Date(a.dateAndTime) - new Date(b.dateAndTime))

    const nextEvent = sortedEvents[0]
    const eventDate = new Date(nextEvent.dateAndTime)

    return eventDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const statsData = [
    {
      title: "Total Events",
      value: totalEvents,
      subtitle: "All scheduled events",
      icon: <FaCalendarAlt className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents,
      subtitle: "Yet to happen",
      icon: <MdEventAvailable className="text-2xl" />,
      color: "#22c55e",
    },
    {
      title: "Past Events",
      value: pastEvents,
      subtitle: "Already conducted",
      icon: <FaCalendarCheck className="text-2xl" />,
      color: "#f97316",
    },
    {
      title: "Next Event",
      value: getNextEventDate(),
      subtitle: "Mark your calendar",
      icon: <FaCalendarDay className="text-2xl" />,
      color: "#8b5cf6",
    },
  ]

  return <StatCards stats={statsData} />
}

export default EventStats
