import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const EventsHeader = ({ onAddEvent, userRole }) => {
  return (
    <PageHeader title="Events">
      {["Admin"].includes(userRole) && (
        <Button variant="primary" onClick={onAddEvent} icon={<Plus size={18} />}>
          Add Event
        </Button>
      )}
    </PageHeader>
  )
}

export default EventsHeader
