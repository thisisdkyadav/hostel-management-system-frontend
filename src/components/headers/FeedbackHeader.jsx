import PageHeader from "../common/PageHeader"
import Button from "../common/Button"
import { HiPlus } from "react-icons/hi"

const FeedbackHeader = ({ userRole, onAddFeedback }) => {
  const isStudent = userRole === "Student"
  const title = isStudent ? "My Feedbacks" : "Student Feedbacks"

  return (
    <PageHeader title={title}>
      {isStudent && (
        <Button variant="primary" size="medium" onClick={onAddFeedback} icon={<HiPlus style={{ fontSize: 'var(--icon-sm)' }} />}
        >
          Add Feedback
        </Button>
      )}
    </PageHeader>
  )
}

export default FeedbackHeader
