import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { FaStar, FaInfoCircle, FaClipboardList, FaCheck, FaExclamationTriangle, FaArrowRight } from "react-icons/fa"
import { Alert, Card, Grid, Heading, HStack, IconCircle, Label, Spinner, Surface, Text } from "@/components/ui"
import { Button } from "czero/react"
import { complaintApi } from "@/service"

const ComplaintFeedbackPage = () => {
    const { token } = useParams()

    const [complaint, setComplaint] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [feedback, setFeedback] = useState("")
    const [feedbackRating, setFeedbackRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [satisfactionStatus, setSatisfactionStatus] = useState("Satisfied")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [success, setSuccess] = useState(false)

    // Fetch complaint on mount
    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const response = await complaintApi.getComplaintByFeedbackToken(token)
                setComplaint(response.data)
                setLoading(false)
            } catch (err) {
                setError(err.message || "Failed to load complaint details")
                setLoading(false)
            }
        }

        if (token) {
            fetchComplaint()
        } else {
            setError("Invalid feedback link")
            setLoading(false)
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (feedbackRating === 0) {
            setSubmitError("Please select a rating")
            return
        }

        setIsSubmitting(true)
        setSubmitError("")

        try {
            await complaintApi.submitFeedbackByToken(token, {
                feedback: feedback.trim() || undefined,
                feedbackRating,
                satisfactionStatus,
            })
            setSuccess(true)
        } catch (err) {
            setSubmitError(err.message || "Failed to submit feedback. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-page)',
            }}>
                <Card style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                    <Spinner size="large" />
                    <Text color="body" size="base" style={{ marginTop: 'var(--spacing-4)' }}>
                        Loading complaint details...
                    </Text>
                </Card>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-page)',
                padding: 'var(--spacing-4)',
            }}>
                <Card style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                    <IconCircle size="64px" bg="danger" style={{ margin: '0 auto var(--spacing-4)' }}>
                        <FaExclamationTriangle size={32} style={{ color: 'var(--color-danger)' }} />
                    </IconCircle>
                    <Heading as="h2" size="xl" weight="semibold" color="heading" style={{ marginBottom: 'var(--spacing-2)' }}>
                        Unable to Load Feedback Form
                    </Heading>
                    <Text color="body" size="base" style={{ marginBottom: 'var(--spacing-4)' }}>
                        {error}
                    </Text>
                    <Link to="/login">
                        <Button variant="primary">
                            <FaArrowRight /> Go to Login
                        </Button>
                    </Link>
                </Card>
            </div>
        )
    }

    // Success state
    if (success) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-page)',
                padding: 'var(--spacing-4)',
            }}>
                <Card style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                    <IconCircle size="64px" bg="success" style={{ margin: '0 auto var(--spacing-4)' }}>
                        <FaCheck size={32} style={{ color: 'var(--color-success)' }} />
                    </IconCircle>
                    <Heading as="h2" size="xl" weight="semibold" color="heading" style={{ marginBottom: 'var(--spacing-2)' }}>
                        Thank You for Your Feedback!
                    </Heading>
                    <Text color="body" size="base" style={{ marginBottom: 'var(--spacing-4)' }}>
                        Your feedback helps us improve our services and resolve issues more effectively.
                    </Text>
                    <Link to="/login">
                        <Button variant="primary">
                            <FaArrowRight /> Go to Login
                        </Button>
                    </Link>
                </Card>
            </div>
        )
    }

    // Main feedback form
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-page)',
            padding: 'var(--spacing-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
                {/* Header */}
                <Text as="div" align="center" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <Heading as="h1" size="2xl" weight="bold" color="heading" style={{ marginBottom: 'var(--spacing-2)' }}>
                        Rate Your Resolution
                    </Heading>
                    <Text color="body" size="base">
                        Hello {complaint.studentName}, please rate the resolution of your complaint.
                    </Text>
                </Text>

                <Card>
                    {/* Complaint Details */}
                    <Surface bg="tertiary" padding={4} radius="lg" style={{ marginBottom: 'var(--spacing-5)' }}>
                        <HStack gap="none" align="start" justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 'var(--spacing-1)'
                                }}>
                                    <FaClipboardList style={{ marginRight: 'var(--spacing-1-5)' }} /> Complaint
                                </h4>
                                <Text weight="semibold" color="primary" size="base">
                                    {complaint.title}
                                </Text>
                            </div>
                            <HStack gap="var(--spacing-1-5)">
                                <span style={{
                                    padding: 'var(--spacing-0-5) var(--spacing-2-5)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--color-bg-muted)',
                                    color: 'var(--color-text-body)'
                                }}>
                                    {complaint.category}
                                </span>
                                <span style={{
                                    padding: 'var(--spacing-0-5) var(--spacing-2-5)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--color-success-bg)',
                                    color: 'var(--color-success-text)'
                                }}>
                                    {complaint.status}
                                </span>
                            </HStack>
                        </HStack>

                        {complaint.description && (
                            <div style={{ marginBottom: 'var(--spacing-2-5)' }}>
                                <Heading as="h5" size="xs" weight="medium" color="muted" style={{ marginBottom: 'var(--spacing-0-5)' }}>
                                    Description
                                </Heading>
                                <Text color="body" size="sm">
                                    {complaint.description}
                                </Text>
                            </div>
                        )}

                        {complaint.resolutionNotes && (
                            <div>
                                <h5 style={{
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 'var(--spacing-0-5)'
                                }}>
                                    <FaInfoCircle style={{ marginRight: 'var(--spacing-1)' }} /> Resolution Notes
                                </h5>
                                <Text color="body" size="sm">
                                    {complaint.resolutionNotes}
                                </Text>
                            </div>
                        )}
                    </Surface>

                    {submitError && (
                        <Alert type="error" style={{ marginBottom: 'var(--spacing-4)' }}>
                            {submitError}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Rating */}
                        <div style={{ marginBottom: 'var(--spacing-5)' }}>
                            <Label color="body" spacing={2}>
                                Rate the resolution <Text as="span" color="danger">*</Text>
                            </Label>
                            <HStack gap="var(--spacing-1-5)" align="center">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setFeedbackRating(rating)}
                                        onMouseEnter={() => setHoveredRating(rating)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 'var(--spacing-1)',
                                        }}
                                    >
                                        <FaStar
                                            size={32}
                                            style={{
                                                color: rating <= (hoveredRating || feedbackRating) ? 'var(--color-warning)' : 'var(--color-bg-muted)',
                                                transition: 'var(--transition-colors)'
                                            }}
                                        />
                                    </button>
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
                            </HStack>
                        </div>

                        {/* Satisfaction Status */}
                        <div style={{ marginBottom: 'var(--spacing-5)' }}>
                            <Label color="body" spacing={2}>
                                Satisfaction status <Text as="span" color="danger">*</Text>
                            </Label>
                            <Grid cols={3} gap={2}>
                                <Button
                                    type="button"
                                    onClick={() => setSatisfactionStatus("Satisfied")}
                                    variant={satisfactionStatus === "Satisfied" ? "success" : "secondary"}
                                    size="sm"
                                >
                                    Satisfied
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setSatisfactionStatus("Unsatisfied")}
                                    variant={satisfactionStatus === "Unsatisfied" ? "danger" : "secondary"}
                                    size="sm"
                                >
                                    Unsatisfied
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setSatisfactionStatus("False Resolution")}
                                    variant={satisfactionStatus === "False Resolution" ? "warning" : "secondary"}
                                    size="sm"
                                >
                                    False Fix
                                </Button>
                            </Grid>
                        </div>

                        {/* Comments */}
                        <div style={{ marginBottom: 'var(--spacing-5)' }}>
                            <Label color="body" spacing={2} htmlFor="feedback">
                                Comments (Optional)
                            </Label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                                placeholder="Share your thoughts..."
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-2) var(--spacing-3)',
                                    border: '1px solid var(--color-border-input)',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-sm)',
                                    resize: 'vertical',
                                    transition: 'var(--transition-colors)',
                                    background: 'var(--color-bg-primary)',
                                    color: 'var(--color-text-body)',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow-focus)'
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border-input)'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={isSubmitting}
                            disabled={isSubmitting || feedbackRating === 0}
                        >
                            <FaStar /> {isSubmitting ? "Submitting..." : "Submit Feedback"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default ComplaintFeedbackPage
