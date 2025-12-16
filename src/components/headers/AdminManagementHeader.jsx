import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const AdminManagementHeader = ({ onAddAdmin }) => {
  return (
    <PageHeader title="Administrator Management">
      <Button variant="primary" onClick={onAddAdmin} icon={<FaPlus />}>
        Add Administrator
      </Button>
    </PageHeader>
  )
}

export default AdminManagementHeader
