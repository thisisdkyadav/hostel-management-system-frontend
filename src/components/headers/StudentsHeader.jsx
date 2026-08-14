import { Button } from "hzero"
import PageHeader from "../common/PageHeader"
import { UserPlus, Edit, RefreshCw, Download } from "lucide-react"

/**
 * Each action is shown purely on its own `can*` flag — the page owns the role
 * and capability rules (import is Admin-only; bulk update and allocation also
 * run for Hostel Supervisors, with allocation scoped to their active hostel).
 */
const StudentsHeader = ({
  onImport,
  onBulkUpdate,
  onUpdateAllocations,
  onExport,
  canImport = false,
  canBulkUpdate = false,
  canUpdateAllocations = false,
  canExport = true,
}) => {
  return (
    <PageHeader title="Student Management">
      {canImport && (
        <Button variant="white" onClick={onImport}>
          <UserPlus size={18} /> Import New Students
        </Button>
      )}
      {canBulkUpdate && (
        <Button variant="white" onClick={onBulkUpdate}>
          <Edit size={18} /> Update Existing Students
        </Button>
      )}
      {canUpdateAllocations && (
        <Button variant="white" onClick={onUpdateAllocations}>
          <RefreshCw size={18} /> Update Allocations
        </Button>
      )}

      {canExport && (
        <Button variant="white" onClick={onExport}>
          <Download size={18} /> Export
        </Button>
      )}
    </PageHeader>
  )
}

export default StudentsHeader
