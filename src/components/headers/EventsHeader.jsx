import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const EventsHeader = ({ onAddEvent, userRole }) => {
  return (
    <PageHeader title="Events">
      {["Admin"].includes(userRole) && (
        <Button variant="primary" onClick={onAddEvent}>
          <Plus size={18} /> Add Event
        </Button>
      )}
    </PageHeader>
  )
}

export default EventsHeader
