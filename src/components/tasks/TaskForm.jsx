import { useState, useEffect } from "react"
import { taskApi } from "../../services/taskApi"
import { useAuth } from "../../contexts/AuthProvider"
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from "../../constants/taskConstants"
import UserSelector from "../common/UserSelector"
import Modal from "../common/Modal"

const TaskForm = ({ isOpen, setIsOpen, onSuccess, initialTask = null }) => {
  const { user } = useAuth()

  const defaultTaskData = {
    title: "",
    description: "",
    priority: "Medium",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 week from now
    category: "Maintenance",
    assignedUsers: [],
  }

  const [taskData, setTaskData] = useState(defaultTaskData)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])

  useEffect(() => {
    if (initialTask) {
      // Format initial task data
      const formattedTask = {
        ...initialTask,
        dueDate: new Date(initialTask.dueDate).toISOString().split("T")[0],
        assignedUsers: initialTask.assignedUsers.map((user) => (typeof user === "object" ? user._id : user)),
      }
      setTaskData(formattedTask)

      // Set selected users for display
      const selected = initialTask.assignedUsers.filter((user) => typeof user === "object").map((user) => ({ _id: user._id, name: user.name, email: user.email, role: user.role }))
      setSelectedUsers(selected)
    }
  }, [initialTask])

  const handleChange = (e) => {
    const { name, value } = e.target
    setTaskData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!taskData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!taskData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!taskData.dueDate) {
      newErrors.dueDate = "Due date is required"
    }

    if (taskData.assignedUsers.length === 0) {
      newErrors.assignedUsers = "At least one user must be assigned"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      if (initialTask) {
        // Update existing task
        await taskApi.updateTask(initialTask._id, taskData)
      } else {
        // Create new task
        await taskApi.createTask(taskData)
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving task:", error)
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to save task. Please try again.",
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = (user) => {
    setSelectedUsers((prev) => [...prev, user])
    setTaskData((prev) => ({
      ...prev,
      assignedUsers: [...prev.assignedUsers, user._id],
    }))

    // Clear assignedUsers error if it exists
    if (errors.assignedUsers) {
      setErrors((prev) => ({ ...prev, assignedUsers: "" }))
    }
  }

  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId))
    setTaskData((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.filter((id) => id !== userId),
    }))
  }

  if (!isOpen) return null

  const renderFooter = () => (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
        Cancel
      </button>
      <button type="submit" form="task-form" disabled={loading} className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {initialTask ? "Update Task" : "Create Task"}
      </button>
    </div>
  )

  return (
    <Modal title={initialTask ? "Edit Task" : "Create New Task"} onClose={() => setIsOpen(false)} width={600} footer={renderFooter()}>
      <form id="task-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={taskData.title}
            onChange={handleChange}
            className={`block w-full p-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={taskData.description}
            onChange={handleChange}
            className={`block w-full p-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Priority and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select id="priority" name="priority" value={taskData.priority} onChange={handleChange} className="block w-full p-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all">
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select id="category" name="category" value={taskData.category} onChange={handleChange} className="block w-full p-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all">
              {TASK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date Field */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            Due Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={taskData.dueDate}
            onChange={handleChange}
            className={`block w-full p-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all ${errors.dueDate ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
        </div>

        {/* User Selector */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <UserSelector selectedUsers={selectedUsers} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} title="Assign Users" selectedUsersTitle="Assigned Users" searchPlaceholder="Search users by name or email..." required={true} error={errors.assignedUsers} disabled={loading} />
        </div>

        {/* Form Error */}
        {errors.submit && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{errors.submit}</div>}
      </form>
    </Modal>
  )
}

export default TaskForm
