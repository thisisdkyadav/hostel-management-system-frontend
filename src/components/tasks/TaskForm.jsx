import { useState, useEffect } from "react"
import { taskApi } from "../../services/taskApi"
import { useAuth } from "../../contexts/AuthProvider"
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from "../../constants/taskConstants"
import UserSelector from "../common/UserSelector"
import Button from "../common/Button"
import Modal from "../common/Modal"
import Input from "../common/ui/Input"
import Select from "../common/ui/Select"
import Textarea from "../common/ui/Textarea"

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
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
      <Button type="button" onClick={() => setIsOpen(false)} variant="secondary" size="medium">
        Cancel
      </Button>
      <Button type="submit" form="task-form" disabled={loading} variant="primary" size="medium" isLoading={loading}>
        {initialTask ? "Update Task" : "Create Task"}
      </Button>
    </div>
  )

  return (
    <Modal title={initialTask ? "Edit Task" : "Create New Task"} onClose={() => setIsOpen(false)} width={600} footer={renderFooter()}>
      <form id="task-form" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--spacing-5)" }}>
        {/* Title Field */}
        <div>
          <label htmlFor="title" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }}>
            Title <span style={{ color: "var(--color-danger-text)" }}>*</span>
          </label>
          <Input type="text" id="title" name="title" value={taskData.title} onChange={handleChange} error={errors.title} />
          {errors.title && <p style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-danger-text)" }}>{errors.title}</p>}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }}>
            Description <span style={{ color: "var(--color-danger-text)" }}>*</span>
          </label>
          <Textarea id="description" name="description" rows={3} value={taskData.description} onChange={handleChange} error={errors.description} />
          {errors.description && <p style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-danger-text)" }}>{errors.description}</p>}
        </div>

        {/* Priority and Category */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--spacing-4)" }} className="md:grid-cols-2">
          <div>
            <label htmlFor="priority" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }}>
              Priority
            </label>
            <Select id="priority" name="priority" value={taskData.priority} onChange={handleChange} options={TASK_PRIORITIES.map((priority) => ({ value: priority, label: priority }))} />
          </div>

          <div>
            <label htmlFor="category" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }}>
              Category
            </label>
            <Select id="category" name="category" value={taskData.category} onChange={handleChange} options={TASK_CATEGORIES.map((category) => ({ value: category, label: category }))} />
          </div>
        </div>

        {/* Due Date Field */}
        <div>
          <label htmlFor="dueDate" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" }}>
            Due Date <span style={{ color: "var(--color-danger-text)" }}>*</span>
          </label>
          <Input type="date" id="dueDate" name="dueDate" value={taskData.dueDate} onChange={handleChange} error={errors.dueDate} />
          {errors.dueDate && <p style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-sm)", color: "var(--color-danger-text)" }}>{errors.dueDate}</p>}
        </div>

        {/* User Selector */}
        <div style={{ backgroundColor: "var(--color-primary-bg)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)" }}>
          <UserSelector selectedUsers={selectedUsers} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} title="Assign Users" selectedUsersTitle="Assigned Users" searchPlaceholder="Search users by name or email..." required={true} error={errors.assignedUsers} disabled={loading} />
        </div>

        {/* Form Error */}
        {errors.submit && <div style={{ padding: "var(--spacing-3)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", fontSize: "var(--font-size-sm)", borderRadius: "var(--radius-lg)" }}>{errors.submit}</div>}
      </form>
    </Modal>
  )
}

export default TaskForm
