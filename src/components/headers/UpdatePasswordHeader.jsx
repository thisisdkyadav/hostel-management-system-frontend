import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Upload, Trash2 } from "lucide-react"

const UpdatePasswordHeader = ({ onBulkUpdate, onRemoveByRole }) => {
  return (
    <PageHeader title="Update User Password">
      <Button variant="danger" onClick={onRemoveByRole} icon={<Trash2 size={18} />}>
        Remove by Role
      </Button>
      <Button variant="primary" onClick={onBulkUpdate} icon={<Upload size={18} />}>
        Bulk Update
      </Button>
    </PageHeader>
  )
}

export default UpdatePasswordHeader
