import React, { useState } from "react"
import { FaStar, FaInfoCircle, FaClipboardList } from "react-icons/fa"
import { complaintApi } from "../../service"
import { Heading, Modal, Surface, Text, VStack } from "@/components/ui"
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
      <VStack gap={4}>
        {error && (
          <Surface bg="danger" padding={3} radius="md" style={{ borderLeft: 'var(--border-4) solid var(--color-danger)' }}>
            <Text color="danger-text" size="sm">{error}</Text>
          </Surface>
        )}

        {/* Complaint Info - Compact */}
        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2-5)' }}>
          <div className="flex items-start justify-between" style={{ gap: 'var(--spacing-3)' }}>
            <div className="flex-1 min-w-0">
              <Heading as="h4" size="sm" weight="medium" color="brand" style={{ marginBottom: 'var(--spacing-1)' }} className="flex items-center">
                <FaClipboardList className="flex-shrink-0" style={{ marginRight: 'var(--spacing-1-5)', fontSize: 'var(--icon-sm)' }} /> Complaint
              </Heading>
              <Text weight="semibold" color="primary" size="base" leading="var(--line-height-tight)">{complaint.title}</Text>
            </div>
            <div className="flex flex-shrink-0" style={{ gap: 'var(--spacing-1-5)' }}>
              <Surface as="span" bg="muted" padding="var(--spacing-0-5) var(--spacing-2-5)" radius="full" color="body" size="xs" weight="medium" className="whitespace-nowrap">{complaint.category}</Surface>
              <Surface as="span" bg="success" padding="var(--spacing-0-5) var(--spacing-2-5)" radius="full" color="success-text" size="xs" weight="medium" className="whitespace-nowrap">{complaint.status}</Surface>
            </div>
          </div>

          {(complaint.description || complaint.resolutionNotes) && (
            <div className="grid grid-cols-1" style={{ gap: 'var(--spacing-2-5)', paddingTop: 'var(--spacing-1)' }}>
              {complaint.description && (
                <div>
                  <Heading as="h5" size="xs" weight="medium" color="muted" style={{ marginBottom: 'var(--spacing-0-5)' }}>Description</Heading>
                  <Text color="body" size="sm" leading="var(--line-height-snug)" className="line-clamp-2">{complaint.description}</Text>
                </div>
              )}

              {complaint.resolutionNotes && (
                <div>
                  <Heading as="h5" size="xs" weight="medium" color="brand" style={{ marginBottom: 'var(--spacing-0-5)' }} className="flex items-center">
                    <FaInfoCircle style={{ marginRight: 'var(--spacing-1)', fontSize: 'var(--icon-xs)' }} /> Resolution
                  </Heading>
                  <Text color="body" size="sm" leading="var(--line-height-snug)" className="line-clamp-2">{complaint.resolutionNotes}</Text>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating Section - Compact */}
        <div>
          <Text as="label" size="sm" weight="medium" color="body" style={{ marginBottom: 'var(--spacing-2)' }} className="block">
            Rate the resolution <Text as="span" color="danger">*</Text>
          </Text>
          <div className="flex items-center" style={{ gap: 'var(--spacing-1-5)' }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button key={rating} type="button" onClick={() => setFeedbackRating(rating)} onMouseEnter={() => setHoveredRating(rating)} onMouseLeave={() => setHoveredRating(0)}
                variant="ghost"
                size="sm"
              ><FaStar size={32} style={{ color: rating <= (hoveredRating || feedbackRating) ? 'var(--color-warning)' : 'var(--color-bg-muted)', transition: 'var(--transition-colors)' }} /></Button>
            ))}
            {feedbackRating > 0 && (
              <Text as="span" color="body" weight="medium" size="sm" style={{ marginLeft: 'var(--spacing-2)' }}>
                {feedbackRating === 1 && "Poor"}
                {feedbackRating === 2 && "Fair"}
                {feedbackRating === 3 && "Good"}
                {feedbackRating === 4 && "Very Good"}
                {feedbackRating === 5 && "Excellent"}
              </Text>
            )}
          </div>
        </div>

        {/* Satisfaction Status - Compact */}
        <div>
          <Text as="label" size="sm" weight="medium" color="body" style={{ marginBottom: 'var(--spacing-2)' }} className="block">
            Satisfaction status <Text as="span" color="danger">*</Text>
          </Text>
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
          <Text as="label" size="sm" weight="medium" color="body" style={{ marginBottom: 'var(--spacing-2)' }} htmlFor="feedback" className="block">
            Comments (Optional)
          </Text>
          <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full resize-none"
            style={{ padding: 'var(--spacing-2) var(--spacing-3)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-lg)', transition: 'var(--transition-colors)', fontSize: 'var(--font-size-sm)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--input-focus-ring)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-input)'; e.currentTarget.style.boxShadow = 'none' }}
            placeholder="Share your thoughts..."
          />
        </div>
      </VStack>
    </Modal>
  )
}

export default ComplaintFeedbackPopup
