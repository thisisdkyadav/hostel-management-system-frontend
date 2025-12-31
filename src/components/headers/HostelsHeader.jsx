import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { FaPlus, FaArchive } from "react-icons/fa"

const HostelsHeader = ({ onAddHostel, onArchiveToggle, fetchArchive }) => {
  return (
    <PageHeader title="Hostel Management">
      <Button variant="secondary" onClick={onArchiveToggle} icon={<FaArchive />}
      >
        {fetchArchive ? "Show All" : "Show Archived"}
      </Button>
      <Button variant="primary" onClick={onAddHostel} icon={<FaPlus />}
      >
        Add Hostel
      </Button>
    </PageHeader>
  )
}

export default HostelsHeader
