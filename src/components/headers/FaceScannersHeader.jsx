import { Button } from "@/components/ui"
import PageHeader from "../common/PageHeader"
import { Plus } from "lucide-react"

const FaceScannersHeader = ({ onAddScanner }) => {
    return (
        <PageHeader title="Face Scanners">
            <Button variant="primary" onClick={onAddScanner} icon={<Plus size={18} />}>
                Add Scanner
            </Button>
        </PageHeader>
    )
}

export default FaceScannersHeader
