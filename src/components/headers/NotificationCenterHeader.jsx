import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaFilter, FaPlus } from "react-icons/fa"

const NotificationCenterHeader = ({ showFilters, onToggleFilters, onCreateNotification, userRole }) => {
  return (
    <PageHeader title="Notification Center">
      {["Admin"].includes(userRole) && (
        <>
          <Button variant="white" onClick={onToggleFilters} icon={<FaFilter />}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="primary" onClick={onCreateNotification} icon={<FaPlus />}>
            Create Notification
          </Button>
        </>
      )}
    </PageHeader>
  )
}

export default NotificationCenterHeader
