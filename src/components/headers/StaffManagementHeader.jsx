import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const StaffManagementHeader = ({ staffTitle, onAddStaff }) => {
  return (
    <PageHeader title={`${staffTitle} Management`}>
      <Button variant="primary" onClick={onAddStaff} icon={<Plus size={18} />}>
        Add {staffTitle}
      </Button>
    </PageHeader>
  )
}

export default StaffManagementHeader
