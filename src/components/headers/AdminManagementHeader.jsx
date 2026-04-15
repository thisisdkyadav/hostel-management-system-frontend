import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const AdminManagementHeader = ({ onAddAdmin, title = "Administrator Management", addButtonLabel = "Add Administrator" }) => {
  return (
    <PageHeader title={title}>
      <Button variant="primary" onClick={onAddAdmin}>
        <Plus size={18} /> {addButtonLabel}
      </Button>
    </PageHeader>
  )
}

export default AdminManagementHeader
