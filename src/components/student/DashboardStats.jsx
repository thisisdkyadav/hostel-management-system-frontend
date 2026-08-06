import React from "react"
import { Link } from "react-router-dom"
import { FaExclamationCircle, FaCheckCircle, FaRegCalendarAlt, FaSearch } from "react-icons/fa"
import { Surface, Text } from "@/components/ui"

const StatCard = ({ icon, title, value, linkTo, color }) => {
  return (
    <Link to={linkTo} className="flex items-center" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', border: 'var(--border-1) solid var(--color-border-light)', transition: 'var(--transition-shadow)', transitionDuration: 'var(--duration-slow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <Surface padding={3} radius="xl" style={{ marginRight: 'var(--spacing-3)' }} className={color}>{icon}</Surface>
      <div>
        <Text as="span" size="sm" color="tertiary" className="block">{title}</Text>
        <Text as="span" size="2xl" weight="bold">{value}</Text>
      </div>
    </Link>
  )
}

const DashboardStats = ({ stats }) => {
  if (!stats) return null

  const { complaints, lostAndFound, events } = stats

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--spacing-4)' }}>
      <StatCard title="Upcoming Events" value={events?.upcoming || 0} icon={<FaRegCalendarAlt style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-purple-text)' }} />} linkTo="events" color="bg-purple-50" />

      <StatCard title="Lost & Found" value={lostAndFound?.active || 0} icon={<FaSearch style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-success)' }} />} linkTo="lost-and-found" color="bg-green-50" />

      <StatCard title="In Progress Complaints" value={complaints?.inProgress || 0} icon={<FaCheckCircle style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-info)' }} />} linkTo="complaints" color="bg-blue-50" />

      <StatCard title="Pending Complaints" value={complaints?.pending || 0} icon={<FaExclamationCircle style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-orange-text)' }} />} linkTo="complaints" color="bg-orange-50" />
    </div>
  )
}

export default DashboardStats
