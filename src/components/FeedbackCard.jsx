import React, { useState } from "react"
import { HiAnnotation, HiUser, HiCalendar, HiClock, HiEye, HiReply, HiTrash, HiPencilAlt, HiMail } from "react-icons/hi"
import { feedbackApi } from "../service"
import FeedbackReplyModal from "./FeedbackReplyModal"
import FeedbackFormModal from "./student/feedback/FeedbackFormModal"
import { useAuth } from "../contexts/AuthProvider"
import { getMediaUrl } from "../utils/mediaUtils"
import { Card } from "@/components/ui"
import { Button } from "czero/react"

const FeedbackCard = ({ feedback, refresh, isStudentView = false }) => {
  const { canAccess } = useAuth()

  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(feedback.status)
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const isPending = status === "Pending"

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    return status === "Pending" ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-dark)]" : "bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
  }

  const handleToggleSeen = async () => {
    const newStatus = status === "Pending" ? "Seen" : "Pending"
    if (newStatus === "Pending" && feedback.reply) {
      const confirm = window.confirm("Are you sure you want to mark this feedback as Pending. This will remove the reply. Do you want to proceed?")
      if (!confirm) return
    } else {
      const confirm = window.confirm(`Are you sure you want to mark this feedback as ${newStatus}?`)
      if (!confirm) return
    }
    try {
      setIsUpdating(true)
      const response = await feedbackApi.updateFeedbackStatus(feedback._id, newStatus)
      if (response.success) {
        setStatus(newStatus)
        refresh()
      } else {
        alert("Failed to update feedback status")
      }
    } catch (error) {
      console.error("Error updating feedback status:", error)
      alert("An error occurred while updating feedback status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReply = async (replyText) => {
    try {
      setIsUpdating(true)
      const response = await feedbackApi.replyToFeedback(feedback._id, replyText)
      if (response.success) {
        setStatus("Seen")
        refresh()
      } else {
        alert("Failed to submit reply")
      }
    } catch (error) {
      console.error("Error replying to feedback:", error)
      alert("An error occurred while replying to feedback")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this feedback?")
    if (!confirm) return

    try {
      setIsUpdating(true)
      const response = await feedbackApi.deleteFeedback(feedback._id)
      if (response.success) {
        refresh()
      } else {
        alert("Failed to delete feedback")
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
      alert("An error occurred while deleting feedback")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEdit = async (updateFeedback) => {
    try {
      setIsUpdating(true)
      const response = await feedbackApi.updateFeedback(feedback._id, updateFeedback)
      if (response.success) {
        refresh()
        return true
      } else {
        alert("Failed to update feedback")
        return false
      }
    } catch (error) {
      console.error("Error updating feedback:", error)
      alert("An error occurred while updating feedback")
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <Card.Header className="mb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="p-2.5 mr-3 rounded-xl bg-[var(--color-primary-bg)] text-[var(--color-primary)]">
              <HiAnnotation size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-secondary)] text-base md:text-lg line-clamp-1">{feedback.title}</h3>
              <span className="text-xs text-[var(--color-text-muted)]">ID: {feedback._id.substring(0, 8)}</span>
            </div>
          </div>
          {!isStudentView && canAccess("feedback", "view") && (
            <div className="flex items-center">
              {feedback.userId.profileImage ? (
                <img src={getMediaUrl(feedback.userId.profileImage)} alt={feedback.userId.name} className="w-10 h-10 rounded-full object-cover mr-2 border border-[var(--color-border-primary)]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center mr-2">
                  <HiUser className="text-[var(--color-primary)]" size={20} />
                </div>
              )}
              <div className="mr-2">
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">{feedback.userId.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] flex items-center">
                  <HiMail className="mr-1" size={12} />
                  {feedback.userId.email}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>
            </div>
          )}
          {isStudentView && canAccess("feedback", "view") && <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>}
        </div>
      </Card.Header>

      <Card.Body className="mt-4 space-y-3">
        <div className="flex items-center flex-wrap">
          <div className="flex items-center mr-4 mb-1">
            <HiCalendar className="text-[var(--color-primary)] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-[var(--color-text-body)]">{formatDate(feedback.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <HiClock className="text-[var(--color-primary)] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-[var(--color-text-body)]">{formatTime(feedback.createdAt)}</span>
          </div>
        </div>
        <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg min-h-[80px]">
          <p className="text-sm text-[var(--color-text-body)]">{feedback.description}</p>
        </div>

        {feedback.reply && (
          <div className="mt-3">
            <div className="flex items-center mb-2">
              <HiReply className="text-[var(--color-primary)] mr-2" />
              <h4 className="font-medium text-[var(--color-primary)]">Staff Reply</h4>
            </div>
            <div className="bg-[var(--color-primary-bg)] p-3 rounded-lg border-l-4 border-[var(--color-primary)]">
              <p className="text-sm text-[var(--color-text-body)]">{feedback.reply}</p>
            </div>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="mt-4 pt-3 border-t border-[var(--color-border-light)] flex justify-end space-x-3">
        {!isStudentView && canAccess("feedback", "react") && status === "Pending" && !feedback.reply && (
          <>
            <Button onClick={() => setIsReplyModalOpen(true)} variant="primary" size="sm">
              <HiReply /> Reply
            </Button>
            <Button onClick={handleToggleSeen} disabled={isUpdating} variant="outline" size="sm" loading={isUpdating}>
              <HiEye /> {isUpdating ? "Updating..." : "Mark as Seen"}
            </Button>
          </>
        )}

        {!isStudentView && canAccess("feedback", "react") && status === "Seen" && (
          <>
            <Button onClick={() => setIsReplyModalOpen(true)} variant="outline" size="sm">
              <HiReply /> {feedback.reply ? "Edit Reply" : "Add Reply"}
            </Button>
            <Button onClick={handleToggleSeen} disabled={isUpdating} variant="outline" size="sm" loading={isUpdating}>
              <HiEye /> {isUpdating ? "Updating..." : "Mark as Pending"}
            </Button>
          </>
        )}

        {isStudentView && canAccess("feedback", "react") && isPending && (
          <>
            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm">
              <HiPencilAlt /> Edit
            </Button>
            <Button onClick={handleDelete} disabled={isUpdating} variant="danger" size="sm" loading={isUpdating}>
              <HiTrash /> {isUpdating ? "Deleting..." : "Delete"}
            </Button>
          </>
        )}
      </Card.Footer>

      <FeedbackReplyModal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} feedback={feedback} onReply={handleReply} />

      <FeedbackFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEdit} initialData={feedback} isEditing={true} />
    </Card>
  )
}

export default FeedbackCard
