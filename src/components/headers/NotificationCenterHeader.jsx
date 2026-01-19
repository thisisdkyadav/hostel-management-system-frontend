import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Filter, Plus } from "lucide-react"

const NotificationCenterHeader = ({ showFilters, onToggleFilters, onCreateNotification, userRole }) => {
  return (
    <PageHeader title="Notification Center">
      {["Admin"].includes(userRole) && (
        <>
          <Button variant="white" onClick={onToggleFilters} icon={<Filter size={18} />}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="primary" onClick={onCreateNotification} icon={<Plus size={18} />}>
            Create Notification
          </Button>
        </>
      )}
    </PageHeader>
  )
}

export default NotificationCenterHeader
