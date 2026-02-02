import { Button } from "czero/react"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const FaceScannersHeader = ({ onAddScanner }) => {
    return (
        <PageHeader title="Face Scanners">
            <Button variant="primary" onClick={onAddScanner}>
                <Plus size={18} /> Add Scanner
            </Button>
        </PageHeader>
    )
}

export default FaceScannersHeader
