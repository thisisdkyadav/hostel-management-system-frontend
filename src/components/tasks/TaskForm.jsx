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
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
      <button type="button" onClick={() => setIsOpen(false)}
        style={{
          padding: 'var(--button-padding-md)',
          backgroundColor: 'var(--color-bg-muted)',
          borderRadius: 'var(--radius-lg)',
          transition: 'var(--transition-all)',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
      >
        Cancel
      </button>
      <button type="submit" form="task-form" disabled={loading} style={{ padding: 'var(--button-padding-md)', backgroundColor: 'var(--button-primary-bg)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-all)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 'var(--opacity-70)' : 'var(--opacity-100)' }} onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = 'var(--button-primary-hover)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = 'var(--button-primary-bg)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }
        }}
      >
        {loading && (
          <svg style={{ animation: 'spin 1s linear infinite', marginLeft: '-0.25rem', marginRight: 'var(--spacing-2)', height: 'var(--icon-md)', width: 'var(--icon-md)', color: 'var(--color-white)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 'var(--opacity-25)' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 'var(--opacity-75)' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {initialTask ? "Update Task" : "Create Task"}
      </button>
    </div>
  )

  return (
    <Modal title={initialTask ? "Edit Task" : "Create New Task"} onClose={() => setIsOpen(false)} width={600} footer={renderFooter()}>
      <form id="task-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-5)' }}>
        {/* Title Field */}
        <div>
          <label htmlFor="title" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
            Title <span style={{ color: 'var(--color-danger-text)' }}>*</span>
          </label>
          <input type="text" id="title" name="title" value={taskData.title} onChange={handleChange} style={{ display: 'block', width: '100%', padding: 'var(--input-padding)', borderRadius: 'var(--input-radius)', border: `var(--border-1) solid ${errors.title ? 'var(--color-danger-border)' : 'var(--input-border)'}`, boxShadow: 'var(--shadow-sm)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
              e.target.style.boxShadow = errors.title ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
              e.target.style.borderColor = errors.title ? 'var(--color-danger)' : 'var(--input-border-focus)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'var(--shadow-sm)';
              e.target.style.borderColor = errors.title ? 'var(--color-danger-border)' : 'var(--input-border)';
            }}
          />
          {errors.title && <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>{errors.title}</p>}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
            Description <span style={{ color: 'var(--color-danger-text)' }}>*</span>
          </label>
          <textarea id="description" name="description" rows="3" value={taskData.description} onChange={handleChange} style={{ display: 'block', width: '100%', padding: 'var(--input-padding)', borderRadius: 'var(--input-radius)', border: `var(--border-1) solid ${errors.description ? 'var(--color-danger-border)' : 'var(--input-border)'}`, boxShadow: 'var(--shadow-sm)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
              e.target.style.boxShadow = errors.description ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
              e.target.style.borderColor = errors.description ? 'var(--color-danger)' : 'var(--input-border-focus)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'var(--shadow-sm)';
              e.target.style.borderColor = errors.description ? 'var(--color-danger-border)' : 'var(--input-border)';
            }}
          ></textarea>
          {errors.description && <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>{errors.description}</p>}
        </div>

        {/* Priority and Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-4)' }} className="md:grid-cols-2">
          <div>
            <label htmlFor="priority" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
              Priority
            </label>
            <select id="priority" name="priority" value={taskData.priority} onChange={handleChange} style={{ display: 'block', width: '100%', padding: 'var(--input-padding)', borderRadius: 'var(--input-radius)', border: `var(--border-1) solid var(--input-border)`, boxShadow: 'var(--shadow-sm)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
                e.target.style.boxShadow = 'var(--input-focus-ring)';
                e.target.style.borderColor = 'var(--input-border-focus)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'var(--shadow-sm)';
                e.target.style.borderColor = 'var(--input-border)';
              }}
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
              Category
            </label>
            <select id="category" name="category" value={taskData.category} onChange={handleChange} style={{ display: 'block', width: '100%', padding: 'var(--input-padding)', borderRadius: 'var(--input-radius)', border: `var(--border-1) solid var(--input-border)`, boxShadow: 'var(--shadow-sm)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
                e.target.style.boxShadow = 'var(--input-focus-ring)';
                e.target.style.borderColor = 'var(--input-border-focus)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'var(--shadow-sm)';
                e.target.style.borderColor = 'var(--input-border)';
              }}
            >
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
          <label htmlFor="dueDate" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>
            Due Date <span style={{ color: 'var(--color-danger-text)' }}>*</span>
          </label>
          <input type="date" id="dueDate" name="dueDate" value={taskData.dueDate} onChange={handleChange} style={{ display: 'block', width: '100%', padding: 'var(--input-padding)', borderRadius: 'var(--input-radius)', border: `var(--border-1) solid ${errors.dueDate ? 'var(--color-danger-border)' : 'var(--input-border)'}`, boxShadow: 'var(--shadow-sm)', outline: 'none', transition: 'var(--transition-all)', backgroundColor: 'var(--input-bg)' }} onFocus={(e) => {
              e.target.style.boxShadow = errors.dueDate ? 'var(--shadow-focus-danger)' : 'var(--input-focus-ring)';
              e.target.style.borderColor = errors.dueDate ? 'var(--color-danger)' : 'var(--input-border-focus)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'var(--shadow-sm)';
              e.target.style.borderColor = errors.dueDate ? 'var(--color-danger-border)' : 'var(--input-border)';
            }}
          />
          {errors.dueDate && <p style={{ marginTop: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-danger-text)' }}>{errors.dueDate}</p>}
        </div>

        {/* User Selector */}
        <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
          <UserSelector selectedUsers={selectedUsers} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} title="Assign Users" selectedUsersTitle="Assigned Users" searchPlaceholder="Search users by name or email..." required={true} error={errors.assignedUsers} disabled={loading} />
        </div>

        {/* Form Error */}
        {errors.submit && <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-lg)' }}>{errors.submit}</div>}
      </form>
    </Modal>
  )
}

export default TaskForm
