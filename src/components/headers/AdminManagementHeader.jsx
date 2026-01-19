import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const AdminManagementHeader = ({ onAddAdmin }) => {
  return (
    <PageHeader title="Administrator Management">
      <Button variant="primary" onClick={onAddAdmin} icon={<Plus size={18} />}>
        Add Administrator
      </Button>
    </PageHeader>
  )
}

export default AdminManagementHeader
