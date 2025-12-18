import React from "react"
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from "../../constants/taskConstants"

/**
 * Displays detailed task statistics with categorization by status, priority, and category
 * @param {Object} stats - Task statistics from backend
 */
const DetailedTaskStats = ({ stats }) => {
  if (!stats) return null

  const { statusCounts, priorityCounts, categoryCounts, overdueTasks } = stats

  // Status card colors (using existing constants)
  const getStatusColorClass = (status) => {
    return TASK_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
  }

  // Priority card colors (using existing constants)
  const getPriorityColorClass = (priority) => {
    return TASK_PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-800"
  }

  // Category card colors using theme variables
  const categoryColors = {
    Maintenance: { bg: 'var(--color-purple-light-bg)', text: 'var(--color-purple-text)' },
    Security: { bg: 'var(--color-primary-bg)', text: 'var(--color-primary)' },
    Administrative: { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' },
    Housekeeping: { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
    Other: { bg: 'var(--color-bg-muted)', text: 'var(--color-text-muted)' },
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 'var(--spacing-4)'
    }}>
      {/* Status Statistics */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--spacing-4)',
        border: `var(--border-1) solid var(--color-border-primary)`
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-3)'
        }}>By Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {Object.entries(statusCounts || {}).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(status)}`}>{status}</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Statistics */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--spacing-4)',
        border: `var(--border-1) solid var(--color-border-primary)`
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-3)'
        }}>By Priority</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {Object.entries(priorityCounts || {}).map(([priority, count]) => (
            <div key={priority} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColorClass(priority)}`}>{priority}</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Statistics */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--spacing-4)',
        border: `var(--border-1) solid var(--color-border-primary)`
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-3)'
        }}>By Category</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {Object.entries(categoryCounts || {}).map(([category, count]) => (
            <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                padding: 'var(--badge-padding-sm)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                backgroundColor: categoryColors[category]?.bg || 'var(--color-bg-muted)',
                color: categoryColors[category]?.text || 'var(--color-text-muted)'
              }}>{category}</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--spacing-4)',
        border: `var(--border-1) solid var(--color-border-primary)`
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-3)'
        }}>Overview</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Total Tasks</span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{Object.values(statusCounts || {}).reduce((a, b) => a + b, 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Completed</span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-success-text)' }}>{statusCounts?.Completed || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>In Progress</span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>{statusCounts?.["In Progress"] || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Overdue</span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-danger-text)' }}>{overdueTasks || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedTaskStats
