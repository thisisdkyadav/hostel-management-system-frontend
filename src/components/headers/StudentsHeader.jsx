import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { MdFilterAlt, MdClearAll } from "react-icons/md"
import { FaFileExport, FaFileImport, FaEdit } from "react-icons/fa"

const StudentsHeader = ({ showFilters, onToggleFilters, onImport, onBulkUpdate, onUpdateAllocations, onExport, userRole }) => {
  return (
    <PageHeader title="Student Management">
      <Button variant="white" onClick={onToggleFilters} icon={showFilters ? <MdClearAll /> : <MdFilterAlt />}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </Button>

      {["Admin"].includes(userRole) && (
        <>
          <Button variant="white" onClick={onImport} icon={<FaFileImport />}>
            Import
          </Button>
          <Button variant="white" onClick={onBulkUpdate} icon={<FaEdit />}>
            Bulk Update
          </Button>
          <Button variant="white" onClick={onUpdateAllocations} icon={<FaFileImport />}>
            Update Allocations
          </Button>
        </>
      )}

      <Button variant="white" onClick={onExport} icon={<FaFileExport />}>
        Export
      </Button>
    </PageHeader>
  )
}

export default StudentsHeader
