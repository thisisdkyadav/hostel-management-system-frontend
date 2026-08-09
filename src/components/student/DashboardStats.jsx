import React from "react"
import { Link } from "react-router-dom"
import { CalendarDays, CheckCircle2, AlertCircle, Search } from "lucide-react"
import { Card, Surface, Text } from "hzero"

const StatCard = ({ icon, title, value, linkTo, color }) => {
  return (
    <Link to={linkTo} className="no-underline">
      {/* Card raises its own shadow on hover — that used to be a pair of
          handlers assigning boxShadow on every pointer crossing. */}
      <Card padding="p-4" className="flex items-center" hoverShadow="var(--shadow-md)">
        <Surface padding={3} radius="xl" style={{ marginRight: 'var(--spacing-3)' }} className={color}>{icon}</Surface>
        <div>
          <Text as="span" size="sm" color="tertiary" className="block">{title}</Text>
          <Text as="span" size="2xl" weight="bold">{value}</Text>
        </div>
      </Card>
    </Link>
  )
}

const DashboardStats = ({ stats }) => {
  if (!stats) return null

  const { complaints, lostAndFound, events } = stats

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--spacing-4)' }}>
      <StatCard title="Upcoming Events" value={events?.upcoming || 0} icon={<CalendarDays size={20} color="var(--color-purple-text)" />} linkTo="events" color="bg-[var(--color-purple-bg)]" />

      {/* -bg-light, not -bg: these four chips were green-50 and blue-50, and
          the -light tokens are those exact values. Plain -bg is one shade
          deeper. */}
      <StatCard title="Lost & Found" value={lostAndFound?.active || 0} icon={<Search size={20} color="var(--color-success)" />} linkTo="lost-and-found" color="bg-[var(--color-success-bg-light)]" />

      <StatCard title="In Progress Complaints" value={complaints?.inProgress || 0} icon={<CheckCircle2 size={20} color="var(--color-info)" />} linkTo="complaints" color="bg-[var(--color-info-bg-light)]" />

      <StatCard title="Pending Complaints" value={complaints?.pending || 0} icon={<AlertCircle size={20} color="var(--color-orange-text)" />} linkTo="complaints" color="bg-[var(--color-orange-bg)]" />
    </div>
  )
}

export default DashboardStats
