import React, { useState } from "react"
import { FaStar } from "react-icons/fa"
import { Select } from "@/components/ui"
import { Button, Modal } from "czero/react"
import { complaintApi } from "../../service"

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

  const MODAL_WIDTH = 600;
  const TEXTAREA_ROWS = 4;
  const RATING_OPTIONS = [1, 2, 3, 4, 5];

  return (
    <Modal title="Give Feedback" onClose={onClose} width={MODAL_WIDTH}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {error && (
          <div className="border-l-4" style={{ backgroundColor: 'var(--color-danger-bg)', borderColor: 'var(--color-danger)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }} >
            <p style={{ color: 'var(--color-danger-text)' }}>{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="feedback" className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }} >
            Feedback
          </label>
          <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={TEXTAREA_ROWS} className="w-full" style={{ paddingLeft: 'var(--spacing-4)', paddingRight: 'var(--spacing-4)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-primary)', outline: 'none', transition: 'var(--transition-all)' }} placeholder="Share your feedback about the resolution..." />
        </div>

        <div>
          <label htmlFor="feedbackRating" className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }} >
            Rating
          </label>
          <Select id="feedbackRating" value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} options={RATING_OPTIONS.map((rating) => ({ value: rating, label: `${rating} ${rating === 1 ? "Star" : "Stars"}` }))} />
        </div>

        <div>
          <label htmlFor="satisfactionStatus" className="block" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }} >
            Satisfaction Status
          </label>
          <Select id="satisfactionStatus" value={satisfactionStatus} onChange={(e) => setSatisfactionStatus(e.target.value)} options={[
            { value: "Satisfied", label: "Satisfied" },
            { value: "Unsatisfied", label: "Unsatisfied" },
            { value: "False Resolution", label: "False Resolution" }
          ]} />
        </div>

        <div className="flex justify-end" style={{ gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)' }}>
          <Button type="button" onClick={onClose} variant="outline" >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}
          >
            {!isSubmitting && <FaStar />} {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default FeedbackModal
