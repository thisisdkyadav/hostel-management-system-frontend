import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { UserPlus, Edit, RefreshCw, Download } from "lucide-react"

const StudentsHeader = ({ onImport, onBulkUpdate, onUpdateAllocations, onExport, userRole }) => {
  return (
    <PageHeader title="Student Management">

      {["Admin"].includes(userRole) && (
        <>
          <Button variant="white" onClick={onImport} icon={<UserPlus size={18} />}>
            Import New Students
          </Button>
          <Button variant="white" onClick={onBulkUpdate} icon={<Edit size={18} />}>
            Update Existing Students
          </Button>
          <Button variant="white" onClick={onUpdateAllocations} icon={<RefreshCw size={18} />}>
            Update Allocations
          </Button>
        </>
      )}

      <Button variant="white" onClick={onExport} icon={<Download size={18} />}>
        Export
      </Button>
    </PageHeader>
  )
}

export default StudentsHeader
