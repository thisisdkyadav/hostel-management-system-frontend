import React from "react"
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from "../../constants/taskConstants"
import { Grid, Heading, HStack, Surface, Text, VStack } from "@/components/ui"

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
    <Grid min={250} gap={4}>
      {/* Status Statistics */}
      <Surface bg="var(--card-bg)" padding={4} radius="lg" shadow="sm" border="var(--border-1) solid var(--color-border-primary)">
        <Heading as="h3" size="sm" weight="medium" color="muted" style={{ marginBottom: 'var(--spacing-3)' }}>By Status</Heading>
        <VStack gap={2}>
          {Object.entries(statusCounts || {}).map(([status, count]) => (
            <HStack gap="none" align="center" justify="between" key={status}>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(status)}`}>{status}</span>
              <Text as="span" size="sm" weight="medium">{count}</Text>
            </HStack>
          ))}
        </VStack>
      </Surface>

      {/* Priority Statistics */}
      <Surface bg="var(--card-bg)" padding={4} radius="lg" shadow="sm" border="var(--border-1) solid var(--color-border-primary)">
        <Heading as="h3" size="sm" weight="medium" color="muted" style={{ marginBottom: 'var(--spacing-3)' }}>By Priority</Heading>
        <VStack gap={2}>
          {Object.entries(priorityCounts || {}).map(([priority, count]) => (
            <HStack gap="none" align="center" justify="between" key={priority}>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColorClass(priority)}`}>{priority}</span>
              <Text as="span" size="sm" weight="medium">{count}</Text>
            </HStack>
          ))}
        </VStack>
      </Surface>

      {/* Category Statistics */}
      <Surface bg="var(--card-bg)" padding={4} radius="lg" shadow="sm" border="var(--border-1) solid var(--color-border-primary)">
        <Heading as="h3" size="sm" weight="medium" color="muted" style={{ marginBottom: 'var(--spacing-3)' }}>By Category</Heading>
        <VStack gap={2}>
          {Object.entries(categoryCounts || {}).map(([category, count]) => (
            <HStack gap="none" align="center" justify="between" key={category}>
              <Surface as="span" bg={categoryColors[category]?.bg || 'var(--color-bg-muted)'} padding="var(--badge-padding-sm)" radius="full" color={categoryColors[category]?.text || 'var(--color-text-muted)'} size="xs" weight="medium">{category}</Surface>
              <Text as="span" size="sm" weight="medium">{count}</Text>
            </HStack>
          ))}
        </VStack>
      </Surface>

      {/* Overdue Tasks Alert */}
      <Surface bg="var(--card-bg)" padding={4} radius="lg" shadow="sm" border="var(--border-1) solid var(--color-border-primary)">
        <Heading as="h3" size="sm" weight="medium" color="muted" style={{ marginBottom: 'var(--spacing-3)' }}>Overview</Heading>
        <VStack gap={3}>
          <HStack gap="none" align="center" justify="between">
            <Text as="span" size="sm">Total Tasks</Text>
            <Text as="span" size="sm" weight="medium">{Object.values(statusCounts || {}).reduce((a, b) => a + b, 0)}</Text>
          </HStack>
          <HStack gap="none" align="center" justify="between">
            <Text as="span" size="sm">Completed</Text>
            <Text as="span" size="sm" weight="medium" color="success-text">{statusCounts?.Completed || 0}</Text>
          </HStack>
          <HStack gap="none" align="center" justify="between">
            <Text as="span" size="sm">In Progress</Text>
            <Text as="span" size="sm" weight="medium" color="brand">{statusCounts?.["In Progress"] || 0}</Text>
          </HStack>
          <HStack gap="none" align="center" justify="between">
            <Text as="span" size="sm">Overdue</Text>
            <Text as="span" size="sm" weight="medium" color="danger-text">{overdueTasks || 0}</Text>
          </HStack>
        </VStack>
      </Surface>
    </Grid>
  )
}

export default DetailedTaskStats
