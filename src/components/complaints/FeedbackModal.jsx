import React, { useState } from "react"
import { FaStar } from "react-icons/fa"
import Modal from "../common/Modal"
import { complaintApi } from "../../services/complaintApi"

const FeedbackModal = ({ complaint, onClose, onFeedback }) => {
  const [feedback, setFeedback] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(1)
  const [satisfactionStatus, setSatisfactionStatus] = useState("Satisfied")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      await complaintApi.giveFeedback(complaint.id, {
        feedback,
        feedbackRating,
        satisfactionStatus,
      })
      if (onFeedback) onFeedback()
      onClose()
    } catch (err) {
      setError("Failed to submit feedback. Please try again.")
      console.error("Error submitting feedback:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Give Feedback" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback
          </label>
          <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Share your feedback about the resolution..." />
        </div>

        <div>
          <label htmlFor="feedbackRating" className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <select id="feedbackRating" value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating} {rating === 1 ? "Star" : "Stars"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="satisfactionStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Satisfaction Status
          </label>
          <select id="satisfactionStatus" value={satisfactionStatus} onChange={(e) => setSatisfactionStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option value="Satisfied">Satisfied</option>
            <option value="Unsatisfied">Unsatisfied</option>
            <option value="False Resolution">False Resolution</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <FaStar className="mr-2" /> Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FeedbackModal
