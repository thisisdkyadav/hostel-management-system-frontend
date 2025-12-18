import React from "react"
import { Link } from "react-router-dom"
import { FaExclamationCircle, FaCheckCircle, FaRegCalendarAlt, FaSearch } from "react-icons/fa"

const StatCard = ({ icon, title, value, linkTo, color }) => {
  return (
    <Link to={linkTo} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center hover:shadow-md transition-all duration-300">
      <div className={`p-3 rounded-xl mr-3 ${color}`}>{icon}</div>
      <div>
        <span className="block text-sm text-gray-600">{title}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
    </Link>
  )
}

const DashboardStats = ({ stats }) => {
  if (!stats) return null

  const { complaints, lostAndFound, events } = stats

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Upcoming Events" value={events?.upcoming || 0} icon={<FaRegCalendarAlt className="text-xl" style={{ color: 'var(--color-purple-text)' }} />} linkTo="events" color="bg-purple-50" />

      <StatCard title="Lost & Found" value={lostAndFound?.active || 0} icon={<FaSearch className="text-xl" style={{ color: 'var(--color-success)' }} />} linkTo="lost-and-found" color="bg-green-50" />

      <StatCard title="In Progress Complaints" value={complaints?.inProgress || 0} icon={<FaCheckCircle className="text-xl" style={{ color: 'var(--color-info)' }} />} linkTo="complaints" color="bg-blue-50" />

      <StatCard title="Pending Complaints" value={complaints?.pending || 0} icon={<FaExclamationCircle className="text-xl" style={{ color: 'var(--color-orange-text)' }} />} linkTo="complaints" color="bg-orange-50" />
    </div>
  )
}

export default DashboardStats
