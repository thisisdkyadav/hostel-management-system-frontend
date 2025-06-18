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

  const statsData = [
    {
      title: "Total Tasks",
      value: totalTasks,
      subtitle: "Tasks in system",
      icon: <FaTasks />,
      color: "#1360AB",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      subtitle: "Being worked on",
      icon: <FaHourglass />,
      color: "#f97316",
    },
    {
      title: "Completed",
      value: completedTasks,
      subtitle: "Successfully finished",
      icon: <FaCheckCircle />,
      color: "#22c55e",
    },
    {
      title: "Overdue",
      value: overdueTasks || 0,
      subtitle: "Past due date",
      icon: <FaExclamationTriangle />,
      color: "#ef4444",
    },
  ]

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Task Overview</h2>
        <button onClick={() => setShowDetailed(!showDetailed)} className="flex items-center px-3 py-1.5 bg-blue-50 text-[#1360AB] rounded-md hover:bg-blue-100 transition-all text-sm font-medium">
          <FaChartBar className="mr-2" />
          {showDetailed ? "Simple View" : "Detailed View"}
        </button>
      </div>

      {showDetailed ? (
        <DetailedTaskStats stats={stats} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskStats
