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

  // Category card colors
  const categoryColors = {
    Maintenance: "bg-purple-100 text-purple-800",
    Security: "bg-blue-100 text-blue-800",
    Administrative: "bg-indigo-100 text-indigo-800",
    Housekeeping: "bg-green-100 text-green-800",
    Other: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">By Status</h3>
        <div className="space-y-2">
          {Object.entries(statusCounts || {}).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(status)}`}>{status}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">By Priority</h3>
        <div className="space-y-2">
          {Object.entries(priorityCounts || {}).map(([priority, count]) => (
            <div key={priority} className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColorClass(priority)}`}>{priority}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">By Category</h3>
        <div className="space-y-2">
          {Object.entries(categoryCounts || {}).map(([category, count]) => (
            <div key={category} className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category] || "bg-gray-100"}`}>{category}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Tasks</span>
            <span className="text-sm font-medium">{Object.values(statusCounts || {}).reduce((a, b) => a + b, 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Completed</span>
            <span className="text-sm font-medium text-green-600">{statusCounts?.Completed || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">In Progress</span>
            <span className="text-sm font-medium text-[#1360AB]">{statusCounts?.["In Progress"] || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Overdue</span>
            <span className="text-sm font-medium text-red-600">{overdueTasks || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedTaskStats
