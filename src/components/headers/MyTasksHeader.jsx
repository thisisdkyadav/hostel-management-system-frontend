import PageHeader from "../common/PageHeader"

const MyTasksHeader = ({ totalTasks, overdueTasks }) => {
  return (
    <PageHeader title="My Tasks">
      <div 
        style={{
          backgroundColor: 'var(--color-primary-bg)',
          color: 'var(--color-primary)',
          paddingLeft: 'var(--spacing-3)',
          paddingRight: 'var(--spacing-3)',
          paddingTop: 'var(--spacing-1)',
          paddingBottom: 'var(--spacing-1)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)'
        }}
      >
        Total: {totalTasks || 0}
      </div>
      {overdueTasks > 0 && (
        <div 
          style={{
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            paddingLeft: 'var(--spacing-3)',
            paddingRight: 'var(--spacing-3)',
            paddingTop: 'var(--spacing-1)',
            paddingBottom: 'var(--spacing-1)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          Overdue: {overdueTasks}
        </div>
      )}
    </PageHeader>
  )
}

export default MyTasksHeader
