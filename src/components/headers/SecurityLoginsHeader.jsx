import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const SecurityLoginsHeader = ({ onAddSecurity }) => {
  return (
    <PageHeader title="Security Staff Management">
      <Button variant="primary" onClick={onAddSecurity} icon={<FaPlus />}>
        Add Security
      </Button>
    </PageHeader>
  )
}

export default SecurityLoginsHeader
