import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthProvider"
import { taskApi } from "../services/taskApi"
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS, TASK_FILTER_TABS, ALLOWED_STATUS_UPDATES } from "../constants/taskConstants"
import TaskDetailModal from "../components/tasks/TaskDetailModal"
import Pagination from "../components/common/Pagination"
import MyTasksHeader from "../components/headers/MyTasksHeader"

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
    const colorClass = TASK_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{status}</span>
  }

  const getTaskPriorityBadge = (priority) => {
    const colorClass = TASK_PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-800"
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{priority}</span>
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

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Filter Tabs */}
      <div className="mt-6 mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {TASK_FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.key ? "border-[#1360AB] text-[#1360AB]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                `}
              >
                {tab.label}
                {stats.statusCounts && tab.key !== "all" && <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.key ? "bg-blue-100 text-[#1360AB]" : "bg-gray-100 text-gray-600"}`}>{stats.statusCounts[tab.key] || 0}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input type="text" value={filters.searchTerm} onChange={(e) => updateFilter("searchTerm", e.target.value)} placeholder="Search tasks..." className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" />
      </div>

      {/* Task Cards with Quick Actions */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task._id} onClick={() => viewTaskDetails(task)} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3" onClick={() => viewTaskDetails(task)}>
                      <h3 className="text-lg font-medium text-gray-800 truncate w-3/4">{task.title}</h3>
                      <div className="flex flex-col items-end space-y-2">
                        {getTaskPriorityBadge(task.priority)}
                        {getTaskStatusBadge(task.status)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{task.description}</p>

                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Category: {task.category}</span>
                        <span className={isPastDue(task.dueDate) && task.status !== "Completed" ? "text-red-600 font-medium" : ""}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    {task.status !== "Completed" && (
                      <div className="mt-4 flex justify-end space-x-2 border-t border-gray-100 pt-3">
                        {task.status !== "In Progress" && (
                          <button onClick={(e) => handleQuickUpdateStatus(e, task._id, "In Progress")} className="px-3 py-1 bg-blue-50 text-[#1360AB] text-xs font-medium rounded-md hover:bg-blue-100 focus:outline-none transition-all">
                            Start
                          </button>
                        )}
                        {task.status !== "Completed" && (
                          <button onClick={(e) => handleQuickUpdateStatus(e, task._id, "Completed")} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md hover:bg-green-100 focus:outline-none transition-all">
                            Complete
                          </button>
                        )}
                        <button onClick={() => viewTaskDetails(task)} className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-100 focus:outline-none transition-all">
                          Details
                        </button>
                      </div>
                    )}

                    <div className="mt-3 flex justify-end">
                      <div className={`w-2 h-2 rounded-full ${isPastDue(task.dueDate) && task.status !== "Completed" ? "bg-red-500" : task.status === "Completed" ? "bg-green-500" : "bg-[#1360AB]"}`}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center py-12 text-gray-500">No tasks found matching the current filters.</div>
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
