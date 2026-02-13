import React, { useState } from "react"
import { FaStar, FaInfoCircle, FaClipboardList } from "react-icons/fa"
import { complaintApi } from "../../service"
import { Modal } from "czero/react"
import { Button } from "czero/react"

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
    <div className="flex justify-end" style={{ gap: 'var(--spacing-3)' }}>
      <Button type="button" onClick={onClose} disabled={isSubmitting} variant="secondary" size="md">
        Skip for Now
      </Button>
      <Button type="button" onClick={handleSubmit} disabled={isSubmitting || feedbackRating === 0} variant="primary" size="md" loading={isSubmitting}>
        <FaStar /> {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  )

  return (
    <Modal title="Rate Your Resolution" onClose={onClose} width={650} footer={footerContent}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', borderLeft: 'var(--border-4) solid var(--color-danger)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--color-danger-text)', fontSize: 'var(--font-size-sm)' }}>{error}</p>
          </div>
        )}

        {/* Complaint Info - Compact */}
        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2-5)' }}>
          <div className="flex items-start justify-between" style={{ gap: 'var(--spacing-3)' }}>
            <div className="flex-1 min-w-0">
              <h4 className="flex items-center" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', marginBottom: 'var(--spacing-1)' }}>
                <FaClipboardList className="flex-shrink-0" style={{ marginRight: 'var(--spacing-1-5)', fontSize: 'var(--icon-sm)' }} /> Complaint
              </h4>
              <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height-tight)' }}>{complaint.title}</p>
            </div>
            <div className="flex flex-shrink-0" style={{ gap: 'var(--spacing-1-5)' }}>
              <span className="whitespace-nowrap" style={{ padding: 'var(--spacing-0-5) var(--spacing-2-5)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-body)' }}>{complaint.category}</span>
              <span className="whitespace-nowrap" style={{ padding: 'var(--spacing-0-5) var(--spacing-2-5)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>{complaint.status}</span>
            </div>
          </div>

          {(complaint.description || complaint.resolutionNotes) && (
            <div className="grid grid-cols-1" style={{ gap: 'var(--spacing-2-5)', paddingTop: 'var(--spacing-1)' }}>
              {complaint.description && (
                <div>
                  <h5 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-0-5)' }}>Description</h5>
                  <p className="line-clamp-2" style={{ color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-snug)' }}>{complaint.description}</p>
                </div>
              )}

              {complaint.resolutionNotes && (
                <div>
                  <h5 className="flex items-center" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)', marginBottom: 'var(--spacing-0-5)' }}>
                    <FaInfoCircle style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-xs)' }} /> Resolution
                  </h5>
                  <p className="line-clamp-2" style={{ color: 'var(--color-text-body)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-snug)' }}>{complaint.resolutionNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating Section - Compact */}
        <div>
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>
            Rate the resolution <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div className="flex items-center" style={{ gap: 'var(--spacing-1-5)' }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button key={rating} type="button" onClick={() => setFeedbackRating(rating)} onMouseEnter={() => setHoveredRating(rating)} onMouseLeave={() => setHoveredRating(0)}
                variant="ghost"
                size="sm"
              ><FaStar size={32} style={{ color: rating <= (hoveredRating || feedbackRating) ? 'var(--color-warning)' : 'var(--color-bg-muted)', transition: 'var(--transition-colors)' }} /></Button>
            ))}
            {feedbackRating > 0 && (
              <span style={{ marginLeft: 'var(--spacing-2)', color: 'var(--color-text-body)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
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
          <label className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>
            Satisfaction status <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-2)' }}>
            <Button type="button" onClick={() => setSatisfactionStatus("Satisfied")}
              variant={satisfactionStatus === "Satisfied" ? "success" : "secondary"}
              size="sm"
            >
              Satisfied
            </Button>
            <Button type="button" onClick={() => setSatisfactionStatus("Unsatisfied")}
              variant={satisfactionStatus === "Unsatisfied" ? "danger" : "secondary"}
              size="sm"
            >
              Unsatisfied
            </Button>
            <Button type="button" onClick={() => setSatisfactionStatus("False Resolution")}
              variant={satisfactionStatus === "False Resolution" ? "warning" : "secondary"}
              size="sm"
            >
              False Fix
            </Button>
          </div>
        </div>

        {/* Feedback Text - Compact */}
        <div>
          <label htmlFor="feedback" className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>
            Comments (Optional)
          </label>
          <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full resize-none"
            style={{ padding: 'var(--spacing-2) var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', fontSize: 'var(--font-size-sm)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--input-focus-ring)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-input)'; e.currentTarget.style.boxShadow = 'none' }}
            placeholder="Share your thoughts..."
          />
        </div>
      </div>
    </Modal>
  )
}

export default ComplaintFeedbackPopup
