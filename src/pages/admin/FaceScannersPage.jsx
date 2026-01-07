import { useState, useEffect } from "react"
import { SearchInput, Tabs } from "@/components/ui"
import NoResults from "../../components/common/NoResults"
import FaceScannerCard from "../../components/admin/faceScanner/FaceScannerCard"
import FaceScannerStats from "../../components/admin/faceScanner/FaceScannerStats"
import AddFaceScannerModal from "../../components/admin/faceScanner/AddFaceScannerModal"
import FaceScannersHeader from "../../components/headers/FaceScannersHeader"
import { faceScannerApi } from "../../service"

const SCANNER_FILTER_TABS = [
    { value: "all", label: "All" },
    { value: "in", label: "Entry" },
    { value: "out", label: "Exit" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
]

const FaceScannersPage = () => {
    const [activeTab, setActiveTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [scanners, setScanners] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchScanners = async () => {
        setLoading(true)
        try {
            const response = await faceScannerApi.getAllScanners()
            setScanners(response?.data || [])
        } catch (error) {
            console.error("Error fetching scanners:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchScanners()
    }, [])

    // Filter scanners based on tab and search
    const filteredScanners = scanners.filter((scanner) => {
        // Tab filter
        if (activeTab === "in" && scanner.direction !== "in") return false
        if (activeTab === "out" && scanner.direction !== "out") return false
        if (activeTab === "active" && !scanner.isActive) return false
        if (activeTab === "inactive" && scanner.isActive) return false

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            const matchesName = scanner.name?.toLowerCase().includes(search)
            const matchesHostel = scanner.hostelId?.name?.toLowerCase().includes(search)
            const matchesUsername = scanner.username?.toLowerCase().includes(search)
            if (!matchesName && !matchesHostel && !matchesUsername) return false
        }

        return true
    })

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Fixed Header */}
                <FaceScannersHeader onAddScanner={() => setShowAddModal(true)} />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-scroll px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
                    {/* Stats Summary */}
                    <FaceScannerStats scanners={scanners} />

                    {/* Filters */}
                    <div className="mt-[var(--spacing-4)] flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-[var(--spacing-4)] sm:space-y-[var(--spacing-0)]">
                        <div className="w-full sm:w-auto pb-[var(--spacing-2)]">
                            <Tabs tabs={SCANNER_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                        <SearchInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search scanners..."
                            className="w-full sm:w-[16rem] md:w-[18rem]"
                        />
                    </div>

                    {/* Scanner Cards Grid */}
                    <div className="mt-[var(--spacing-6)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-4)] md:gap-[var(--spacing-6)]">
                        {filteredScanners.map((scanner) => (
                            <FaceScannerCard key={scanner._id} scanner={scanner} onUpdate={fetchScanners} onDelete={fetchScanners} />
                        ))}
                    </div>

                    {!loading && filteredScanners.length === 0 && <NoResults />}
                </div>
            </div>

            <AddFaceScannerModal show={showAddModal} onClose={() => setShowAddModal(false)} onAdd={fetchScanners} />
        </>
    )
}

export default FaceScannersPage

