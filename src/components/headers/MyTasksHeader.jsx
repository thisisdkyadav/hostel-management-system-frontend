import PageHeader from "../common/PageHeader"

const MyTasksHeader = ({ totalTasks, overdueTasks }) => {
  return (
    <PageHeader title="My Tasks">
      <div className="bg-blue-100 text-[#1360aa] px-3 py-1 rounded-full text-sm font-medium">Total: {totalTasks || 0}</div>
      {overdueTasks > 0 && <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Overdue: {overdueTasks}</div>}
    </PageHeader>
  )
}

export default MyTasksHeader
