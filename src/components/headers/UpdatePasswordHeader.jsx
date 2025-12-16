import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { HiUpload, HiTrash } from "react-icons/hi"

const UpdatePasswordHeader = ({ onBulkUpdate, onRemoveByRole }) => {
  return (
    <PageHeader title="Update User Password">
      <Button variant="danger" onClick={onRemoveByRole} icon={<HiTrash />}>
        Remove by Role
      </Button>
      <Button variant="primary" onClick={onBulkUpdate} icon={<HiUpload />}>
        Bulk Update
      </Button>
    </PageHeader>
  )
}

export default UpdatePasswordHeader
