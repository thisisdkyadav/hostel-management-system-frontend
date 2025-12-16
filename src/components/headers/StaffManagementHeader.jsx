import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const StaffManagementHeader = ({ staffTitle, onAddStaff }) => {
  return (
    <PageHeader title={`${staffTitle} Management`}>
      <Button variant="primary" onClick={onAddStaff} icon={<FaPlus />}>
        Add {staffTitle}
      </Button>
    </PageHeader>
  )
}

export default StaffManagementHeader
