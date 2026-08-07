import { Button } from "hzero"
import PageHeader from "../common/PageHeader"
import { Plus, Radio } from "lucide-react"

const FaceScannersHeader = ({ onAddScanner, onOpenLiveMonitor }) => {
    return (
        <PageHeader title="Face Scanners">
            <Button variant="secondary" onClick={onOpenLiveMonitor}>
                <Radio size={18} /> Live Monitor
            </Button>
            <Button variant="primary" onClick={onAddScanner}>
                <Plus size={18} /> Add Scanner
            </Button>
        </PageHeader>
    )
}

export default FaceScannersHeader
