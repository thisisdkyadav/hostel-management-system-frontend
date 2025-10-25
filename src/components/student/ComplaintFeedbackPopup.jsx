import React, { useState } from "react"
import { FaStar, FaInfoCircle, FaClipboardList } from "react-icons/fa"
import { complaintApi } from "../../services/complaintApi"
import Modal from "../common/Modal"

const ComplaintFeedbackPopup = ({ complaint, onClose, onFeedbackSubmitted }) => {
  const [feedback, setFeedback] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [satisfactionStatus, setSatisfactionStatus] = useState("Satisfied")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (feedbackRating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await complaintApi.giveFeedback(complaint.id, {
        feedback: feedback.trim() || undefined,
        feedbackRating,
        satisfactionStatus,
      })

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted()
      }
      onClose()
    } catch (err) {
      setError("Failed to submit feedback. Please try again.")
      console.error("Error submitting feedback:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const footerContent = (
    <div className="flex justify-end gap-3">
      <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">
        Skip for Now
      </button>
      <button type="button" onClick={handleSubmit} disabled={isSubmitting || feedbackRating === 0} className="px-6 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <FaStar /> Submit Feedback
          </>
        )}
      </button>
    </div>
  )

  return (
    <Modal title="Rate Your Resolution" onClose={onClose} width={650} footer={footerContent}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Complaint Info - Compact */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-1">
                <FaClipboardList className="mr-1.5 flex-shrink-0" size={14} /> Complaint
              </h4>
              <p className="font-semibold text-gray-800 text-base leading-tight">{complaint.title}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">{complaint.category}</span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 whitespace-nowrap">{complaint.status}</span>
            </div>
          </div>

          {(complaint.description || complaint.resolutionNotes) && (
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {complaint.description && (
                <div>
                  <h5 className="text-xs font-medium text-gray-500 mb-0.5">Description</h5>
                  <p className="text-gray-700 text-sm leading-snug line-clamp-2">{complaint.description}</p>
                </div>
              )}

              {complaint.resolutionNotes && (
                <div>
                  <h5 className="text-xs font-medium text-[#1360AB] flex items-center mb-0.5">
                    <FaInfoCircle className="mr-1" size={12} /> Resolution
                  </h5>
                  <p className="text-gray-700 text-sm leading-snug line-clamp-2">{complaint.resolutionNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating Section - Compact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate the resolution <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button key={rating} type="button" onClick={() => setFeedbackRating(rating)} onMouseEnter={() => setHoveredRating(rating)} onMouseLeave={() => setHoveredRating(0)} className="transition-transform hover:scale-110 focus:outline-none">
                <FaStar size={32} className={`${rating <= (hoveredRating || feedbackRating) ? "text-yellow-400" : "text-gray-300"} transition-colors`} />
              </button>
            ))}
            {feedbackRating > 0 && (
              <span className="ml-2 text-gray-700 font-medium text-sm">
                {feedbackRating === 1 && "Poor"}
                {feedbackRating === 2 && "Fair"}
                {feedbackRating === 3 && "Good"}
                {feedbackRating === 4 && "Very Good"}
                {feedbackRating === 5 && "Excellent"}
              </span>
            )}
          </div>
        </div>

        {/* Satisfaction Status - Compact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Satisfaction status <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSatisfactionStatus("Satisfied")}
              className={`px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm ${satisfactionStatus === "Satisfied" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}
            >
              Satisfied
            </button>
            <button
              type="button"
              onClick={() => setSatisfactionStatus("Unsatisfied")}
              className={`px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm ${satisfactionStatus === "Unsatisfied" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}
            >
              Unsatisfied
            </button>
            <button
              type="button"
              onClick={() => setSatisfactionStatus("False Resolution")}
              className={`px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm ${satisfactionStatus === "False Resolution" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}
            >
              False Fix
            </button>
          </div>
        </div>

        {/* Feedback Text - Compact */}
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1360AB] focus:border-[#1360AB] transition-colors resize-none text-sm"
            placeholder="Share your thoughts..."
          />
        </div>
      </div>
    </Modal>
  )
}

export default ComplaintFeedbackPopup
