import Button from "../common/Button"
import PageHeader from "../common/PageHeader"
import { FaPlus } from "react-icons/fa"

const FaceScannersHeader = ({ onAddScanner }) => {
    return (
        <PageHeader title="Face Scanners">
            <Button variant="primary" onClick={onAddScanner} icon={<FaPlus />}>
                Add Scanner
            </Button>
        </PageHeader>
    )
}

export default FaceScannersHeader
