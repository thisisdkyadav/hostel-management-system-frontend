import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { taskApi } from "../../service"
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES, TASK_FILTER_TABS, TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from "../../constants/taskConstants"
import TaskStats from "../../components/tasks/TaskStats"
import TaskForm from "../../components/tasks/TaskForm"
import TaskDetailModal from "../../components/tasks/TaskDetailModal"
import Pagination from "../../components/common/Pagination"
import TaskManagementHeader from "../../components/headers/TaskManagementHeader"
import Input from "../../components/common/ui/Input"
import Select from "../../components/common/ui/Select"

const TaskManagement = () => {
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
  const [stats, setStats] = useState(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

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

      const response = await taskApi.getAllTasks(queryParams.toString())
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
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await taskApi.getTaskStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching task statistics:", error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [filters.page])

  useEffect(() => {
    // Reset to page 1 when filters change
    if (filters.page !== 1) {
      setFilters((prev) => ({ ...prev, page: 1 }))
    } else {
      fetchTasks()
    }
  }, [activeTab, filters.priority, filters.category, filters.searchTerm])

  const handleTaskCreated = () => {
    fetchTasks()
    fetchStats()
    setShowCreateTask(false)
  }

  const handleTaskUpdate = () => {
    fetchTasks()
    fetchStats()
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
    const colorClass = TASK_STATUS_COLORS[status] || "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{status}</span>
  }

  const getTaskPriorityBadge = (priority) => {
    const colorClass = TASK_PRIORITY_COLORS[priority] || "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{priority}</span>
  }

  const isPastDue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Title and Create Button */}
      <TaskManagementHeader onCreateTask={() => setShowCreateTask(true)}
        userRole={user?.role}
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Task Statistics */}
        {stats && <TaskStats stats={stats} />}

        {/* Filter Tabs */}
        <div className="mt-4 mb-4">
          <div className="border-b border-[var(--color-border-primary)]">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {TASK_FILTER_TABS.map((tab) => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                  className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-body)] hover:border-[var(--color-border-dark)]"}
                `}
                >
                  {tab.label}
                  {stats?.statusCounts && tab.key !== "all" && <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.key ? "bg-[var(--color-primary-bg)] text-[var(--color-primary)]" : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]"}`}>{stats.statusCounts[tab.key] || 0}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-bg-primary)] p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="priorityFilter" className="block text-sm font-medium text-[var(--color-text-body)] mb-2">
                Priority
              </label>
              <Select id="priorityFilter" value={filters.priority} onChange={(e) => updateFilter("priority", e.target.value)} options={[
                { value: "all", label: "All Priorities" },
                ...TASK_PRIORITIES.map((priority) => ({ value: priority, label: priority }))
              ]} />
            </div>
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-[var(--color-text-body)] mb-2">
                Category
              </label>
              <Select id="categoryFilter" value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} options={[
                { value: "all", label: "All Categories" },
                ...TASK_CATEGORIES.map((category) => ({ value: category, label: category }))
              ]} />
            </div>
            <div>
              <label htmlFor="searchFilter" className="block text-sm font-medium text-[var(--color-text-body)] mb-2">
                Search
              </label>
              <Input type="text" id="searchFilter" value={filters.searchTerm} onChange={(e) => updateFilter("searchTerm", e.target.value)}
                placeholder="Search tasks..."
              />
            </div>
          </div>
        </div>

        {/* Task Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-border-primary)] rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-primary)] rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div key={task._id} className={`bg-[var(--color-bg-primary)] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden`} onClick={() => viewTaskDetails(task)}>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-medium text-[var(--color-text-secondary)] truncate w-3/4">{task.title}</h3>
                        <div className="flex flex-col items-end space-y-2">
                          {getTaskPriorityBadge(task.priority)}
                          {getTaskStatusBadge(task.status)}
                        </div>
                      </div>
                      <p className="text-[var(--color-text-muted)] text-sm line-clamp-2 mb-3">{task.description}</p>

                      <div className="border-t border-[var(--color-border-light)] pt-3 mt-3">
                        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                          <span>Category: {task.category}</span>
                          <span className={isPastDue(task.dueDate) && task.status !== "Completed" ? "text-[var(--color-danger)] font-medium" : ""}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center">
                        {task.assignedUsers && task.assignedUsers.length > 0 && (
                          <div className="flex -space-x-2 overflow-hidden">
                            {task.assignedUsers.slice(0, 3).map((user, idx) => (
                              <div key={user._id || idx} className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-[var(--color-primary-bg)] text-[var(--color-primary)] items-center justify-center text-xs font-medium" title={user.name || `User ${idx + 1}`}>
                                {user.name ? user.name.charAt(0) : `U${idx + 1}`}
                              </div>
                            ))}
                            {task.assignedUsers.length > 3 && (
                              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-[var(--color-primary-bg)]">
                                <span className="text-xs font-medium text-[var(--color-primary)]">+{task.assignedUsers.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="ml-auto">
                          <div className={`w-2 h-2 rounded-full ${isPastDue(task.dueDate) && task.status !== "Completed" ? "bg-[var(--color-danger)]" : task.status === "Completed" ? "bg-[var(--color-success)]" : "bg-[var(--color-primary)]"}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex justify-center items-center py-12 text-[var(--color-text-muted)]">No tasks found matching the current filters.</div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} paginate={handlePageChange} />}
          </>
        )}

        {/* Create Task Modal */}
        {showCreateTask && <TaskForm isOpen={showCreateTask} setIsOpen={setShowCreateTask} onSuccess={handleTaskCreated} />}

        {/* Task Detail Modal */}
        {showDetailModal && selectedTask && <TaskDetailModal selectedTask={selectedTask} setShowDetailModal={setShowDetailModal} onUpdate={handleTaskUpdate} />}
      </div>
    </div>
  )
}

export default TaskManagement
