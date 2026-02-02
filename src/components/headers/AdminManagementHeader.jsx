import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const AdminManagementHeader = ({ onAddAdmin }) => {
  return (
    <PageHeader title="Administrator Management">
      <Button variant="primary" onClick={onAddAdmin}>
        <Plus size={18} /> Add Administrator
      </Button>
    </PageHeader>
  )
}

export default AdminManagementHeader
