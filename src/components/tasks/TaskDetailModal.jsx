import { useState } from "react"
import { taskApi } from "../../services/taskApi"
import { useAuth } from "../../contexts/AuthProvider"
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS, TASK_STATUSES, WHO_CAN_ASSIGN_TASK } from "../../constants/taskConstants"
import TaskForm from "./TaskForm"
import { FaEdit, FaTrash } from "react-icons/fa"
import Modal from "../common/Modal"

const TaskDetailModal = ({ selectedTask, setShowDetailModal, onUpdate, allowedStatusUpdates = TASK_STATUSES, isUserView = false }) => {
  const { user } = useAuth()
  const [currentStatus, setCurrentStatus] = useState(selectedTask.status)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)

  const canEditTask = WHO_CAN_ASSIGN_TASK.includes(user?.role)
  const isPastDue = new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== "Completed"

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return

    try {
      setLoading(true)
      setError("")

      await taskApi.updateTaskStatus(selectedTask._id, newStatus)
      setCurrentStatus(newStatus)

      // Notify parent component of the update
      onUpdate()
    } catch (error) {
      console.error("Error updating task status:", error)
      setError("Failed to update task status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditTask = () => {
    setShowEditModal(true)
  }

  const handleEditComplete = () => {
    setShowEditModal(false)
    onUpdate()
  }

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      await taskApi.deleteTask(selectedTask._id)
      setShowDetailModal(false)
      onUpdate()
    } catch (error) {
      console.error("Error deleting task:", error)
      setError("Failed to delete task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colorClass = TASK_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{status}</span>
  }

  const getPriorityBadge = (priority) => {
    const colorClass = TASK_PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-800"
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{priority}</span>
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderFooter = () => (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
      {/* Status Update Buttons for Users */}
      {isUserView && (
        <div className="flex space-x-2 flex-grow justify-start">
          {allowedStatusUpdates
            .filter((status) => status !== currentStatus)
            .map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={loading}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all
                  ${status === "In Progress" ? "bg-blue-50 text-[#1360AB] hover:bg-blue-100" : ""}
                  ${status === "Completed" ? "bg-green-50 text-green-700 hover:bg-green-100" : ""}
                  ${status === "Created" ? "bg-gray-50 text-gray-700 hover:bg-gray-100" : ""}
                  ${status === "Assigned" ? "bg-blue-50 text-[#1360AB] hover:bg-blue-100" : ""}
                  focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {status === "In Progress" ? "Start Task" : `Mark as ${status}`}
              </button>
            ))}
        </div>
      )}

      {/* Admin Actions */}
      <div className="flex space-x-3">
        {canEditTask && !isUserView && (
          <>
            <button onClick={handleEditTask} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow flex items-center">
              <FaEdit className="mr-2" /> Edit Task
            </button>
            <button onClick={handleDeleteTask} disabled={loading} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center disabled:opacity-50">
              <FaTrash className="mr-2" /> Delete
            </button>
          </>
        )}

        <button onClick={() => setShowDetailModal(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
          Close
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Modal title="Task Details" onClose={() => setShowDetailModal(false)} width={700} footer={renderFooter()}>
        <div className="grid grid-cols-1 gap-5">
          {/* Task Header */}
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h2>
              <div className="flex space-x-2">
                {getPriorityBadge(selectedTask.priority)}
                {getStatusBadge(currentStatus)}
              </div>
            </div>
            {isPastDue && <div className="mt-2 text-sm text-red-600 font-medium">This task is past due!</div>}
          </div>

          {/* Task Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 whitespace-pre-line">{selectedTask.description}</p>
            </div>
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
              <div className="bg-blue-50 text-[#1360AB] p-4 rounded-lg font-medium">{selectedTask.category}</div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Due Date</h4>
              <div className={`p-4 rounded-lg font-medium ${isPastDue ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>{formatDate(selectedTask.dueDate)}</div>
            </div>
          </div>

          {/* Assigned Users */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h4>
            {selectedTask.assignedUsers && selectedTask.assignedUsers.length > 0 ? (
              <div className="space-y-2">
                {selectedTask.assignedUsers.map((user, idx) => (
                  <div key={user._id || idx} className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <div className="mr-3 h-8 w-8 rounded-full bg-blue-100 text-[#1360AB] flex items-center justify-center text-sm font-medium">{user.name ? user.name.charAt(0) : "U"}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.email} - {user.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-500">No users assigned</div>
            )}
          </div>

          {/* Task Metadata */}
          <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>Created by: {selectedTask.createdBy?.name || "Admin"}</p>
            <p>Created at: {formatDate(selectedTask.createdAt)}</p>
            <p>Last updated: {formatDate(selectedTask.updatedAt)}</p>
          </div>

          {/* Error Message */}
          {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
        </div>
      </Modal>

      {/* Edit Task Modal */}
      {showEditModal && <TaskForm isOpen={showEditModal} setIsOpen={setShowEditModal} onSuccess={handleEditComplete} initialTask={selectedTask} />}
    </>
  )
}

export default TaskDetailModal
