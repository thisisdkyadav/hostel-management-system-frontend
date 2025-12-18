import React from "react"
import { FaRegClock, FaRegCalendarAlt, FaBell, FaUsers } from "react-icons/fa"

const NotificationStats = ({ stats }) => {
  const statItems = [
    {
      title: "Total Notifications",
      value: stats?.total || 0,
      icon: <FaBell style={{ color: 'var(--color-info)' }} />,
      bgColor: 'var(--color-info-bg-light)',
    },
    {
      title: "Active Notifications",
      value: stats?.active || 0,
      icon: <FaUsers style={{ color: 'var(--color-success)' }} />,
      bgColor: 'var(--color-success-bg-light)',
    },
    {
      title: "Expired Notifications",
      value: stats?.expired || 0,
      icon: <FaRegCalendarAlt style={{ color: 'var(--color-danger)' }} />,
      bgColor: 'var(--color-danger-bg-light)',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
      {statItems.map((item, index) => (
        <div key={index} style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', backgroundColor: item.bgColor, border: `var(--border-1) solid var(--color-border-light)`, boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-all)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-bg-primary)', marginRight: 'var(--spacing-3)', boxShadow: 'var(--shadow-sm)' }}>{item.icon}</div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{item.title}</h3>
              <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationStats
