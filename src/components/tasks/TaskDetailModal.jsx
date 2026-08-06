import { useState } from "react"
import { taskApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS, TASK_STATUSES, WHO_CAN_ASSIGN_TASK } from "../../constants/taskConstants"
import TaskForm from "./TaskForm"
import { Grid, Heading, HStack, IconCircle, Modal, Surface, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { FaEdit, FaTrash } from "react-icons/fa"

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

  const renderFooter = () => {
    const getStatusButtonStyle = (status) => {
      const baseStyle = {
        padding: 'var(--spacing-3) var(--spacing-3)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        borderRadius: 'var(--radius-md)',
        transition: 'var(--transition-all)',
        outline: 'none',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 'var(--opacity-disabled)' : 'var(--opacity-100)'
      };

      if (status === "In Progress" || status === "Assigned") {
        return { ...baseStyle, backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' };
      } else if (status === "Completed") {
        return { ...baseStyle, backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' };
      } else if (status === "Created") {
        return { ...baseStyle, backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)' };
      }
      return baseStyle;
    };

    const getStatusButtonHoverStyle = (status) => {
      if (status === "In Progress" || status === "Assigned") {
        return { backgroundColor: 'var(--color-primary-bg-hover)' };
      } else if (status === "Completed") {
        return { backgroundColor: 'var(--color-success-bg-light)' };
      } else if (status === "Created") {
        return { backgroundColor: 'var(--color-bg-hover)' };
      }
      return {};
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-3)' }} className="sm:flex-row sm:space-y-0">
        {/* Status Update Buttons for Users */}
        {isUserView && (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexGrow: 1, justifyContent: 'flex-start' }}>
            {allowedStatusUpdates
              .filter((status) => status !== currentStatus)
              .map((status) => (
                <button key={status} onClick={() => handleStatusChange(status)}
                  disabled={loading}
                  style={getStatusButtonStyle(status)}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      Object.assign(e.target.style, getStatusButtonHoverStyle(status));
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      Object.assign(e.target.style, getStatusButtonStyle(status));
                    }
                  }}
                >
                  {status === "In Progress" ? "Start Task" : `Mark as ${status}`}
                </button>
              ))}
          </div>
        )}

        {/* Admin Actions */}
        <HStack gap={3}>
          {canEditTask && !isUserView && (
            <>
              <Button onClick={handleEditTask} variant="primary" size="md">
                <FaEdit /> Edit Task
              </Button>
              <Button onClick={handleDeleteTask} disabled={loading} variant="danger" size="md">
                <FaTrash /> Delete
              </Button>
            </>
          )}

          <Button onClick={() => setShowDetailModal(false)} variant="secondary" size="md">
            Close
          </Button>
        </HStack>
      </div>
    );
  }

  return (
    <>
      <Modal title="Task Details" onClose={() => setShowDetailModal(false)} width={700} footer={renderFooter()}>
        <Grid cols={1} gap={5}>
          {/* Task Header */}
          <div>
            <HStack gap="none" align="start" justify="between">
              <Heading as="h2" size="2xl" weight="semibold" color="primary">{selectedTask.title}</Heading>
              <HStack gap={2}>
                {getPriorityBadge(selectedTask.priority)}
                {getStatusBadge(currentStatus)}
              </HStack>
            </HStack>
            {isPastDue && <Text as="div" size="sm" color="danger-text" weight="medium" style={{ marginTop: 'var(--spacing-2)' }}>This task is past due!</Text>}
          </div>

          {/* Task Description */}
          <div>
            <Heading as="h4" size="sm" weight="medium" color="secondary" style={{ marginBottom: 'var(--spacing-2)' }}>Description</Heading>
            <Surface bg="tertiary" padding={4} radius="lg">
              <Text color="body" style={{ whiteSpace: 'pre-line' }}>{selectedTask.description}</Text>
            </Surface>
          </div>

          {/* Task Details */}
          <Grid cols={{ base: 1, md: 2 }} gap={4}>
            <div>
              <Heading as="h4" size="sm" weight="medium" color="secondary" style={{ marginBottom: 'var(--spacing-2)' }}>Category</Heading>
              <Surface bg="brand" padding={4} radius="lg" color="brand" weight="medium">{selectedTask.category}</Surface>
            </div>
            <div>
              <Heading as="h4" size="sm" weight="medium" color="secondary" style={{ marginBottom: 'var(--spacing-2)' }}>Due Date</Heading>
              <Surface bg={isPastDue ? 'var(--color-danger-bg)' : 'var(--color-bg-tertiary)'} padding={4} radius="lg" color={isPastDue ? 'var(--color-danger-text)' : 'var(--color-text-secondary)'} weight="medium">{formatDate(selectedTask.dueDate)}</Surface>
            </div>
          </Grid>

          {/* Assigned Users */}
          <div>
            <Heading as="h4" size="sm" weight="medium" color="secondary" style={{ marginBottom: 'var(--spacing-2)' }}>Assigned To</Heading>
            {selectedTask.assignedUsers && selectedTask.assignedUsers.length > 0 ? (
              <VStack gap={2}>
                {selectedTask.assignedUsers.map((user, idx) => (
                  <div key={user._id || idx} style={{ display: 'flex', alignItems: 'center', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)' }}>
                    <IconCircle size="var(--avatar-sm)" bg="var(--color-primary-bg-hover)" color="brand" style={{ marginRight: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{user.name ? user.name.charAt(0) : "U"}</IconCircle>
                    <div>
                      <Text size="sm" weight="medium" color="primary">{user.name}</Text>
                      <Text size="xs" color="muted">
                        {user.email} - {user.role}
                      </Text>
                    </div>
                  </div>
                ))}
              </VStack>
            ) : (
              <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', color: 'var(--color-text-muted)' }}>No users assigned</div>
            )}
          </div>

          {/* Task Metadata */}
          <div style={{ borderTop: `var(--border-1) solid var(--color-border-primary)`, paddingTop: 'var(--spacing-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <p>Created by: {selectedTask.createdBy?.name || "Admin"}</p>
            <p>Created at: {formatDate(selectedTask.createdAt)}</p>
            <p>Last updated: {formatDate(selectedTask.updatedAt)}</p>
          </div>

          {/* Error Message */}
          {error && <Surface bg="danger" padding={4} radius="lg" color="danger-text" size="sm">{error}</Surface>}
        </Grid>
      </Modal>

      {/* Edit Task Modal */}
      {showEditModal && <TaskForm isOpen={showEditModal} setIsOpen={setShowEditModal} onSuccess={handleEditComplete} initialTask={selectedTask} />}
    </>
  )
}

export default TaskDetailModal
