import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const LostAndFoundHeader = ({ onAddItem, canCreate, userRole }) => {
  return (
    <PageHeader title="Lost and Found">
      {canCreate && ["Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Hostel Gate"].includes(userRole) && (
        <Button variant="primary" onClick={onAddItem}>
          <Plus size={18} /> Add Item
        </Button>
      )}
    </PageHeader>
  )
}

export default LostAndFoundHeader
