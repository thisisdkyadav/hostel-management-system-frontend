import React, { useState } from "react"
import { FaTasks, FaCheckCircle, FaHourglass, FaExclamationTriangle, FaChartBar } from "react-icons/fa"
import { Button, Grid, Heading, HStack, StatCard } from "hzero"
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
      <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-4)' }}>
        <Heading as="h2" size="lg" weight="medium" color="primary">Task Overview</Heading>
        <Button onClick={() => setShowDetailed(!showDetailed)} variant="outline" size="sm">
          <FaChartBar /> {showDetailed ? "Simple View" : "Detailed View"}
        </Button>
      </HStack>

      {showDetailed ? (
        <DetailedTaskStats stats={stats} />
      ) : (
        <Grid min={200} gap={4}>
          {statsData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} />
          ))}
        </Grid>
      )}
    </div>
  )
}

export default TaskStats
