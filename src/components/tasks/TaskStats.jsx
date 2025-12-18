import React, { useState } from "react"
import { FaTasks, FaCheckCircle, FaHourglass, FaExclamationTriangle, FaChartBar } from "react-icons/fa"
import { StatCard } from "../common/StatCards"
import DetailedTaskStats from "./DetailedTaskStats"

const TaskStats = ({ stats }) => {
  const [showDetailed, setShowDetailed] = useState(false)

  if (!stats) return null

  const { statusCounts, overdueTasks } = stats

  // Calculate totals
  const totalTasks = Object.values(statusCounts || {}).reduce((a, b) => a + b, 0)
  const completedTasks = statusCounts?.Completed || 0
  const inProgressTasks = statusCounts?.["In Progress"] || 0

  // Using theme color variables - these will be passed to StatCard which uses them
  const statsData = [
    {
      title: "Total Tasks",
      value: totalTasks,
      subtitle: "Tasks in system",
      icon: <FaTasks />,
      color: "var(--color-primary)", // Using theme variable
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      subtitle: "Being worked on",
      icon: <FaHourglass />,
      color: "var(--color-warning)", // Using theme variable
    },
    {
      title: "Completed",
      value: completedTasks,
      subtitle: "Successfully finished",
      icon: <FaCheckCircle />,
      color: "var(--color-success)", // Using theme variable
    },
    {
      title: "Overdue",
      value: overdueTasks || 0,
      subtitle: "Past due date",
      icon: <FaExclamationTriangle />,
      color: "var(--color-danger)", // Using theme variable
    },
  ]

  return (
    <div style={{ marginBottom: 'var(--spacing-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Task Overview</h2>
        <button
          onClick={() => setShowDetailed(!showDetailed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--spacing-1-5) var(--spacing-3)',
            backgroundColor: 'var(--color-primary-bg)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            transition: 'var(--transition-all)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary-bg)'}
        >
          <FaChartBar style={{ marginRight: 'var(--spacing-2)' }} />
          {showDetailed ? "Simple View" : "Detailed View"}
        </button>
      </div>

      {showDetailed ? (
        <DetailedTaskStats stats={stats} />
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-4)' 
        }}>
          {statsData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskStats
