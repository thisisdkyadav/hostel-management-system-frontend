import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const SecurityLoginsHeader = ({ onAddSecurity }) => {
  return (
    <PageHeader title="Security Staff Management">
      <Button variant="primary" onClick={onAddSecurity}>
        <Plus size={18} /> Add Security
      </Button>
    </PageHeader>
  )
}

export default SecurityLoginsHeader
