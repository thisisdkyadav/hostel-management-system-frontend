import React, { useEffect, useState } from "react"
import Modal from "./common/Modal"
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

  useEffect(() => {
    if (feedback) {
      setReplyText(feedback.reply || "")
    }
  }, [feedback])

  if (!isOpen) return null

  return (
    <Modal title="Reply to Feedback" onClose={onClose} width={600}>
      <div className="space-y-5">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center text-blue-800 mb-2">
            <FaComment className="mr-2" />
            <h4 className="font-medium">{feedback?.title}</h4>
          </div>
          <p className="text-sm text-gray-600">{feedback?.description}</p>
        </div>

        <div className="px-3 py-2 inline-block bg-yellow-100 text-yellow-700 rounded-full text-xs">
          <span>Note: This feedback will be marked as seen after reply</span>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="reply" className="block text-gray-700 text-sm font-medium mb-2">
              Your Reply (Optional)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaReply />
              </div>
              <textarea id="reply" rows={4} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all resize-none" placeholder="Type your response here..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
          <button type="button" className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium" onClick={onClose}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center justify-center px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow font-medium">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <HiPaperAirplane className="mr-2 transform rotate-90" />
                Submit Reply
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default FeedbackReplyModal
