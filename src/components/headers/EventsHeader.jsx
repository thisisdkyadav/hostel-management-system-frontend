import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const EventsHeader = ({ onAddEvent, userRole }) => {
  return (
    <PageHeader title="Events">
      {["Admin"].includes(userRole) && (
        <Button variant="primary" onClick={onAddEvent} icon={<FaPlus />}>
          Add Event
        </Button>
      )}
    </PageHeader>
  )
}

export default EventsHeader
