import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const EventsHeader = ({ onAddEvent, userRole }) => {
  return (
    <PageHeader title="Events">
      {["Admin"].includes(userRole) && (
        <Button variant="primary" onClick={onAddEvent} icon={<FaPlus style={{ fontSize: 'var(--icon-md)' }} />}
        >
          Add Event
        </Button>
      )}
    </PageHeader>
  )
}

export default EventsHeader
