import PageHeader from "../common/PageHeader"
import { Button } from "czero/react"
import { Plus } from "lucide-react"

const FeedbackHeader = ({ userRole, onAddFeedback }) => {
  const isStudent = userRole === "Student"
  const title = isStudent ? "My Feedbacks" : "Student Feedbacks"

  return (
    <PageHeader title={title}>
      {isStudent && (
        <Button variant="primary" size="md" onClick={onAddFeedback}>
          <Plus size={18} /> Add Feedback
        </Button>
      )}
    </PageHeader>
  )
}

export default FeedbackHeader
