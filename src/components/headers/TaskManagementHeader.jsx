import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"
import { WHO_CAN_CREATE_TASK } from "../../constants/taskConstants"

const TaskManagementHeader = ({ onCreateTask, userRole }) => {
  return (
    <PageHeader title="Task Management">
      {WHO_CAN_CREATE_TASK.includes(userRole) && (
        <Button variant="primary" onClick={onCreateTask}>
          <Plus size={18} /> Create New Task
        </Button>
      )}
    </PageHeader>
  )
}

export default TaskManagementHeader
