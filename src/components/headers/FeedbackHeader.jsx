import PageHeader from "../common/PageHeader"
import { Button } from "@/components/ui"
import { Plus } from "lucide-react"

const FeedbackHeader = ({ userRole, onAddFeedback }) => {
  const isStudent = userRole === "Student"
  const title = isStudent ? "My Feedbacks" : "Student Feedbacks"

  return (
    <PageHeader title={title}>
      {isStudent && (
        <Button variant="primary" size="medium" onClick={onAddFeedback} icon={<Plus size={18} />}>
          Add Feedback
        </Button>
      )}
    </PageHeader>
  )
}

export default FeedbackHeader
