import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const MaintenanceStaffHeader = ({ onAddStaff }) => {
  return (
    <PageHeader title="Maintenance Staff Management">
      <Button variant="primary" onClick={onAddStaff} icon={<FaPlus />}>
        Add Staff
      </Button>
    </PageHeader>
  )
}

export default MaintenanceStaffHeader
