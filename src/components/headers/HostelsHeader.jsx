import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus, Archive } from "lucide-react"

const HostelsHeader = ({ onAddHostel, onArchiveToggle, fetchArchive }) => {
  return (
    <PageHeader title="Hostel Management">
      <Button variant="secondary" onClick={onArchiveToggle}
      >
        <Archive size={18} /> {fetchArchive ? "Show All" : "Show Archived"}
      </Button>
      <Button variant="primary" onClick={onAddHostel}
      >
        <Plus size={18} /> Add Hostel
      </Button>
    </PageHeader>
  )
}

export default HostelsHeader
