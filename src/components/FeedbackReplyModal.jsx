import React, { useEffect, useState } from "react"
import { Button, Modal } from "czero/react"
import { HiPaperAirplane } from "react-icons/hi"
import { FaComment, FaReply } from "react-icons/fa"

const FeedbackReplyModal = ({ isOpen, onClose, feedback, onReply }) => {
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onReply(replyText)
      setReplyText("")
      onClose()
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFooter = () => (
    <>
      <Button type="button" onClick={onClose} variant="secondary" size="md">
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitting} variant="primary" size="md" loading={isSubmitting}>
        <HiPaperAirplane className="transform rotate-90" /> {isSubmitting ? "Submitting..." : "Submit Reply"}
      </Button>
    </>
  )

  useEffect(() => {
    if (feedback) {
      setReplyText(feedback.reply || "")
    }
  }, [feedback])

  if (!isOpen) return null

  return (
    <Modal title="Reply to Feedback" onClose={onClose} width={600} footer={renderFooter()}>
      <div className="space-y-5">
        <div className="p-4 bg-[var(--color-primary-bg)] rounded-lg border border-[var(--color-primary-light)]">
          <div className="flex items-center text-[var(--color-primary-dark)] mb-2">
            <FaComment className="mr-2" />
            <h4 className="font-medium">{feedback?.title}</h4>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{feedback?.description}</p>
        </div>

        <div className="px-3 py-2 inline-block bg-[var(--color-warning-bg)] text-[var(--color-warning-dark)] rounded-full text-xs">
          <span>Note: This feedback will be marked as seen after reply</span>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="reply" className="block text-[var(--color-text-body)] text-sm font-medium mb-2">
              Your Reply (Optional)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-[var(--color-text-disabled)]">
                <FaReply />
              </div>
              <textarea id="reply" rows={4} className="w-full p-3 pl-10 border border-[var(--color-border-input)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-bg)] focus:border-[var(--color-primary)] outline-none transition-all resize-none bg-[var(--color-bg-primary)] text-[var(--color-text-body)]" placeholder="Type your response here..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  )
}

export default FeedbackReplyModal
