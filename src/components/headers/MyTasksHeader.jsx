import PageHeader from "../common/PageHeader"
import { Surface } from "@/components/ui"

const MyTasksHeader = ({ totalTasks, overdueTasks }) => {
  return (
    <PageHeader title="My Tasks">
      <Surface bg="brand" radius="full" color="brand" size="sm" weight="medium" style={{ paddingLeft: 'var(--spacing-3)', paddingRight: 'var(--spacing-3)', paddingTop: 'var(--spacing-1)', paddingBottom: 'var(--spacing-1)' }}>
        Total: {totalTasks || 0}
      </Surface>
      {overdueTasks > 0 && (
        <Surface bg="danger" radius="full" color="danger-text" size="sm" weight="medium" style={{ paddingLeft: 'var(--spacing-3)', paddingRight: 'var(--spacing-3)', paddingTop: 'var(--spacing-1)', paddingBottom: 'var(--spacing-1)' }}>
          Overdue: {overdueTasks}
        </Surface>
      )}
    </PageHeader>
  )
}

export default MyTasksHeader
