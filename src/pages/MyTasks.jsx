import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthProvider"
import { taskApi } from "../service"
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS, TASK_FILTER_TABS, ALLOWED_STATUS_UPDATES } from "../constants/taskConstants"
import TaskDetailModal from "../components/tasks/TaskDetailModal"
import Pagination from "../components/common/Pagination"
import MyTasksHeader from "../components/headers/MyTasksHeader"
import Button from "../components/common/Button"
import Input from "../components/common/ui/Input"

const MyTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    searchTerm: "",
    page: 1,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 12,
  })
  const [selectedTask, setSelectedTask] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({
    statusCounts: {},
    overdueTasks: 0,
  })

  const fetchTasks = async () => {
    try {
      setLoading(true)

      // Build query params
      const queryParams = new URLSearchParams()
      queryParams.append("page", filters.page)

      if (activeTab !== "all") {
        queryParams.append("status", activeTab)
      }

      if (filters.priority !== "all") {
        queryParams.append("priority", filters.priority)
      }

      if (filters.category !== "all") {
        queryParams.append("category", filters.category)
      }

      if (filters.searchTerm) {
        queryParams.append("search", filters.searchTerm)
      }

      const response = await taskApi.getMyTasks(queryParams.toString())
      setTasks(response.tasks || [])
      setPagination(
        response.pagination || {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          perPage: 12,
        }
      )
      setFilteredTasks(response.tasks || [])
      calculateStats(response.tasks || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tasksList) => {
    const statusCounts = {}
    let overdueTasks = 0

    tasksList.forEach((task) => {
      // Count by status
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1

      // Count overdue tasks
      if (new Date(task.dueDate) < new Date() && task.status !== "Completed") {
        overdueTasks++
      }
    })

    setStats({ statusCounts, overdueTasks })
  }

  useEffect(() => {
    fetchTasks()
  }, [filters.page])

  useEffect(() => {
    // Reset to page 1 when filters change
    if (filters.page !== 1) {
      setFilters((prev) => ({ ...prev, page: 1 }))
    } else {
      fetchTasks()
    }
  }, [activeTab, filters.priority, filters.category, filters.searchTerm])

  const handleTaskUpdate = () => {
    fetchTasks()
    setShowDetailModal(false)
    setSelectedTask(null)
  }

  const viewTaskDetails = (task) => {
    setSelectedTask(task)
    setShowDetailModal(true)
  }

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page: page,
    }))
  }

  const getTaskStatusBadge = (status) => {
    const colorClass = TASK_STATUS_COLORS[status] || "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]"
    return <span className={`px-[var(--spacing-2)] py-[var(--spacing-1)] rounded-[var(--radius-full)] text-[length:var(--font-size-xs)] font-[var(--font-weight-medium)] ${colorClass}`}>{status}</span>
  }

  const getTaskPriorityBadge = (priority) => {
    const colorClass = TASK_PRIORITY_COLORS[priority] || "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]"
    return <span className={`px-[var(--spacing-2)] py-[var(--spacing-1)] rounded-[var(--radius-full)] text-[length:var(--font-size-xs)] font-[var(--font-weight-medium)] ${colorClass}`}>{priority}</span>
  }

  const isPastDue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  const getStatusUpdateOptions = () => {
    return ALLOWED_STATUS_UPDATES[user?.role] || ["In Progress", "Completed"]
  }

  const handleQuickUpdateStatus = async (e, taskId, newStatus) => {
    e.stopPropagation() // Prevent task card click event
    try {
      await taskApi.updateTaskStatus(taskId, newStatus)
      fetchTasks()
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Title and Statistics */}
      <MyTasksHeader totalTasks={pagination.total} overdueTasks={stats.overdueTasks} />

      <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--spacing-6) var(--spacing-4)', paddingLeft: 'var(--spacing-4)', paddingRight: 'var(--spacing-4)' }}>

        {/* Filter Tabs */}
        <div style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
            <nav className="-mb-px flex overflow-x-auto" style={{ gap: 'var(--spacing-6)' }} aria-label="Tabs">
              {TASK_FILTER_TABS.map((tab) => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                  className="whitespace-nowrap hover:opacity-80"
                  style={{
                    padding: 'var(--spacing-4) var(--spacing-1)',
                    borderBottomWidth: '2px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: 500,
                    fontSize: 'var(--font-size-base)',
                    transition: 'var(--transition-colors)'
                  }}
                >
                  {tab.label}
                  {stats.statusCounts && tab.key !== "all" && (
                    <span
                      style={{
                        backgroundColor: activeTab === tab.key ? 'var(--color-primary-bg)' : 'var(--color-bg-muted)',
                        color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-xs)',
                        padding: 'var(--spacing-0-5) var(--spacing-2)',
                        borderRadius: 'var(--radius-full)',
                        marginLeft: 'var(--spacing-2)'
                      }}
                    >
                      {stats.statusCounts[tab.key] || 0}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <Input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            placeholder="Search tasks..."
          />
        </div>

        {/* Task Cards with Quick Actions */}
        {loading ? (
          <div className="flex justify-center items-center" style={{ padding: 'var(--spacing-12) 0' }}>
            <div className="relative w-16 h-16">
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full"
                style={{ border: '4px solid var(--color-border-primary)' }}
              ></div>
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full animate-spin"
                style={{
                  border: '4px solid var(--color-primary)',
                  borderTopColor: 'transparent'
                }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => viewTaskDetails(task)}
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-card)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'var(--transition-all)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
                  >
                    <div style={{ padding: 'var(--spacing-5)' }}>
                      <div className="flex justify-between items-start mb-3" onClick={() => viewTaskDetails(task)}>
                        <h3
                          className="truncate w-3/4"
                          style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 500,
                            color: 'var(--color-text-secondary)'
                          }}
                        >
                          {task.title}
                        </h3>
                        <div className="flex flex-col items-end space-y-2">
                          {getTaskPriorityBadge(task.priority)}
                          {getTaskStatusBadge(task.status)}
                        </div>
                      </div>
                      <p
                        className="line-clamp-2 mb-3"
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--font-size-base)'
                        }}
                      >
                        {task.description}
                      </p>

                      <div
                        style={{
                          borderTop: '1px solid var(--color-border-light)',
                          paddingTop: 'var(--spacing-3)',
                          marginTop: 'var(--spacing-3)'
                        }}
                      >
                        <div
                          className="flex justify-between"
                          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
                        >
                          <span>Category: {task.category}</span>
                          <span
                            style={{
                              color: isPastDue(task.dueDate) && task.status !== "Completed"
                                ? 'var(--color-danger)'
                                : 'var(--color-text-muted)',
                              fontWeight: isPastDue(task.dueDate) && task.status !== "Completed" ? 500 : 400
                            }}
                          >
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      {task.status !== "Completed" && (
                        <div
                          className="mt-4 flex justify-end space-x-2"
                          style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-3)' }}
                        >
                          {task.status !== "In Progress" && (
                            <Button
                              onClick={(e) => handleQuickUpdateStatus(e, task._id, "In Progress")}
                              variant="ghost"
                              size="small"
                            >
                              Start
                            </Button>
                          )}
                          {task.status !== "Completed" && (
                            <Button
                              onClick={(e) => handleQuickUpdateStatus(e, task._id, "Completed")}
                              variant="success"
                              size="small"
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            onClick={() => viewTaskDetails(task)}
                            variant="secondary"
                            size="small"
                          >
                            Details
                          </Button>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isPastDue(task.dueDate) && task.status !== "Completed"
                              ? 'var(--color-danger)'
                              : task.status === "Completed"
                                ? 'var(--color-success)'
                                : 'var(--color-primary)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="col-span-3 flex justify-center items-center py-12"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  No tasks found matching the current filters.
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} paginate={handlePageChange} />}
          </>
        )}

        {/* Task Detail Modal */}
        {showDetailModal && selectedTask && <TaskDetailModal selectedTask={selectedTask} setShowDetailModal={setShowDetailModal} onUpdate={handleTaskUpdate} allowedStatusUpdates={getStatusUpdateOptions()} isUserView={true} />}
      </div>
    </div>
  )
}

export default MyTasks
