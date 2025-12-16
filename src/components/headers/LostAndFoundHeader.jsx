import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const LostAndFoundHeader = ({ onAddItem, canCreate, userRole }) => {
  return (
    <PageHeader title="Lost and Found">
      {canCreate && ["Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Hostel Gate"].includes(userRole) && (
        <Button variant="primary" onClick={onAddItem} icon={<FaPlus />}>
          Add Item
        </Button>
      )}
    </PageHeader>
  )
}

export default LostAndFoundHeader
