import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const MaintenanceStaffHeader = ({ onAddStaff }) => {
  return (
    <PageHeader title="Maintenance Staff Management">
      <Button variant="primary" onClick={onAddStaff}>
        <Plus size={18} /> Add Staff
      </Button>
    </PageHeader>
  )
}

export default MaintenanceStaffHeader
