import { useState } from "react"
import { Calendar, FileText, History, Pencil, Tag, Trash2, TriangleAlert, Users } from "lucide-react"
import {
  Alert, Avatar, Badge, Button, DetailSection, EmptyState, Grid, Heading,
  HStack, InfoRow, Modal, Text, VStack, useConfirm,
} from "hzero"
import { taskApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import { TASK_STATUSES, WHO_CAN_ASSIGN_TASK } from "../../constants/taskConstants"
import TaskForm from "./TaskForm"

/**
 * One task, in full.
 *
 * The status and priority pills were spans carrying Tailwind colour classes
 * straight from taskConstants; they are Badges, which is the same palette said
 * once. The status-update buttons in the footer were hand-styled and repainted
 * themselves through onMouseEnter/onMouseLeave — the design system owns hover,
 * so they are Buttons now. Delete asked with a native confirm(); it asks with
 * the app's confirm dialog.
 */

const STATUS_VARIANTS = {
  Created: "default",
  Assigned: "primary",
  "In Progress": "warning",
  Completed: "success",
}

const PRIORITY_VARIANTS = {
  Low: "default",
  Medium: "primary",
  High: "warning",
  Urgent: "danger",
}

const STATUS_BUTTON_VARIANTS = {
  Created: "secondary",
  Assigned: "primary",
  "In Progress": "primary",
  Completed: "success",
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

const TaskDetailModal = ({ selectedTask, setShowDetailModal, onUpdate, allowedStatusUpdates = TASK_STATUSES, isUserView = false }) => {
  const { user } = useAuth()
  const confirm = useConfirm()
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
      setError("Could not update the status. Check your connection and try again.")
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
    const confirmed = await confirm({
      title: "Delete this task?",
      message: "The task and its assignments are removed for everyone. This cannot be undone.",
      confirmText: "Delete task",
      isDestructive: true,
    })
    if (!confirmed) return

    try {
      setLoading(true)
      await taskApi.deleteTask(selectedTask._id)
      setShowDetailModal(false)
      onUpdate()
    } catch (error) {
      console.error("Error deleting task:", error)
      setError("Could not delete the task. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderFooter = () => (
    <HStack gap="small" justify="between" wrap style={{ width: "100%" }}>
      {/* Status Update Buttons for Users */}
      <HStack gap="small" wrap>
        {isUserView &&
          allowedStatusUpdates
            .filter((status) => status !== currentStatus)
            .map((status) => (
              <Button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={loading}
                variant={STATUS_BUTTON_VARIANTS[status] || "secondary"}
                size="md"
              >
                {status === "In Progress" ? "Start task" : `Mark as ${status}`}
              </Button>
            ))}
      </HStack>

      {/* Admin Actions */}
      <HStack gap="small">
        {canEditTask && !isUserView && (
          <>
            <Button onClick={handleEditTask} variant="primary" size="md">
              <Pencil size={16} /> Edit task
            </Button>
            <Button onClick={handleDeleteTask} disabled={loading} variant="danger" size="md">
              <Trash2 size={16} /> Delete
            </Button>
          </>
        )}

        <Button onClick={() => setShowDetailModal(false)} variant="secondary" size="md">
          Close
        </Button>
      </HStack>
    </HStack>
  )

  return (
    <>
      <Modal isOpen title="Task details" onClose={() => setShowDetailModal(false)} width={700} footer={renderFooter()}>
        <VStack gap="large">
          {/* Task Header */}
          <VStack gap="small">
            <HStack gap="medium" align="start" justify="between">
              <Heading as="h2" size="2xl" weight="semibold" color="primary">{selectedTask.title}</Heading>
              <HStack gap="xsmall">
                <Badge variant={PRIORITY_VARIANTS[selectedTask.priority] || "default"} size="small">{selectedTask.priority}</Badge>
                <Badge variant={STATUS_VARIANTS[currentStatus] || "default"} size="small">{currentStatus}</Badge>
              </HStack>
            </HStack>
            {isPastDue && (
              <HStack gap="xsmall">
                <Badge variant="danger" size="small" icon={<TriangleAlert />}>Past due</Badge>
              </HStack>
            )}
          </VStack>

          {/* Task Description */}
          <DetailSection title="Description" icon={FileText}>
            <Text color="body" style={{ whiteSpace: "pre-line" }}>{selectedTask.description}</Text>
          </DetailSection>

          {/* Task Details */}
          <Grid cols={{ base: 1, md: 2 }} gap={4}>
            <DetailSection title="Category" icon={Tag} tone="primary">
              <Text weight="medium">{selectedTask.category}</Text>
            </DetailSection>
            <DetailSection title="Due date" icon={Calendar} tone={isPastDue ? "danger" : "neutral"}>
              <Text weight="medium">{formatDate(selectedTask.dueDate)}</Text>
            </DetailSection>
          </Grid>

          {/* Assigned Users */}
          <DetailSection title="Assigned to" icon={Users}>
            {selectedTask.assignedUsers && selectedTask.assignedUsers.length > 0 ? (
              selectedTask.assignedUsers.map((assignee, idx) => (
                <HStack key={assignee._id || idx} gap="small" align="center">
                  <Avatar name={assignee.name || "U"} size="small" />
                  <VStack gap="none">
                    <Text size="sm" weight="medium" color="primary">{assignee.name}</Text>
                    <Text size="xs" color="muted">
                      {assignee.email} — {assignee.role}
                    </Text>
                  </VStack>
                </HStack>
              ))
            ) : (
              <EmptyState variant="inline" icon={Users} message="Nobody is assigned to this task yet." />
            )}
          </DetailSection>

          {/* Task Metadata */}
          <DetailSection title="Record" icon={History}>
            <InfoRow label="Created by" value={selectedTask.createdBy?.name || "Admin"} />
            <InfoRow label="Created at" value={formatDate(selectedTask.createdAt)} />
            <InfoRow label="Last updated" value={formatDate(selectedTask.updatedAt)} />
          </DetailSection>

          {/* Error Message */}
          {error && <Alert type="error">{error}</Alert>}
        </VStack>
      </Modal>

      {/* Edit Task Modal */}
      {showEditModal && <TaskForm isOpen={showEditModal} setIsOpen={setShowEditModal} onSuccess={handleEditComplete} initialTask={selectedTask} />}
    </>
  )
}

export default TaskDetailModal
