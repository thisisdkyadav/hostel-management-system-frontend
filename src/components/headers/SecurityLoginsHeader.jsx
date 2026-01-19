import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const SecurityLoginsHeader = ({ onAddSecurity }) => {
  return (
    <PageHeader title="Security Staff Management">
      <Button variant="primary" onClick={onAddSecurity} icon={<Plus size={18} />}>
        Add Security
      </Button>
    </PageHeader>
  )
}

export default SecurityLoginsHeader
