import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { WHO_CAN_CREATE_TASK } from "../../constants/taskConstants"

const TaskManagementHeader = ({ onCreateTask, userRole }) => {
  return (
    <PageHeader title="Task Management">
      {WHO_CAN_CREATE_TASK.includes(userRole) && (
        <Button variant="primary" onClick={onCreateTask}>
          Create New Task
        </Button>
      )}
    </PageHeader>
  )
}

export default TaskManagementHeader
