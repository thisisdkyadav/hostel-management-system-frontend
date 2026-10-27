import { Button, Heading, HStack, Page, SearchInput, Tabs, Text, VStack } from "hzero"
import { useState, useEffect } from "react"
import { Plus, Radio } from "lucide-react"
import NoResults from "../../components/common/NoResults"
import FaceScannerCard from "../../components/admin/faceScanner/FaceScannerCard"
import FaceScannerStats from "../../components/admin/faceScanner/FaceScannerStats"
import AddFaceScannerModal from "../../components/admin/faceScanner/AddFaceScannerModal"
import ZktecoAccountsSection from "../../components/admin/faceScanner/ZktecoAccountsSection"
import LiveScanMonitorModal from "../../components/admin/faceScanner/LiveScanMonitorModal"
import PageHeader from "../../components/common/PageHeader"
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
    const [showLiveMonitor, setShowLiveMonitor] = useState(false)
    const [scanners, setScanners] = useState([])
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)

    // Scanners (all providers, for the stats) and ZKTeco accounts load together.
    const loadAll = () => Promise.all([faceScannerApi.getAllScanners(), faceScannerApi.getAccounts()])

    const fetchAll = async () => {
        try {
            const [scannerResponse, accountResponse] = await loadAll()
            setScanners(scannerResponse?.data || [])
            setAccounts(accountResponse?.data || [])
        } catch (error) {
            console.error("Error fetching scanners:", error)
        }
    }

    useEffect(() => {
        let active = true
        loadAll()
            .then(([scannerResponse, accountResponse]) => {
                if (!active) return
                setScanners(scannerResponse?.data || [])
                setAccounts(accountResponse?.data || [])
            })
            .catch((error) => console.error("Error fetching scanners:", error))
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    // ZKTeco scanners live inside their account; this list is Time Watch + legacy only
    const gridScanners = scanners.filter((scanner) => scanner.provider !== "zkteco")

    // Filter scanners based on tab and search
    const filteredScanners = gridScanners.filter((scanner) => {
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
            const matchesDeviceName = scanner.deviceName?.toLowerCase().includes(search)
            const matchesProvider = scanner.provider?.toLowerCase().includes(search)
            if (!matchesName && !matchesHostel && !matchesUsername && !matchesDeviceName && !matchesProvider) return false
        }

        return true
    })

    return (
        <>
            <Page>
                {/* Fixed Header */}
                <PageHeader title="Face Scanners">
                    <Button variant="secondary" onClick={() => setShowLiveMonitor(true)}>
                        <Radio size={18} /> Live Monitor
                    </Button>
                </PageHeader>

                {/* Scrollable Content Area */}
                <Page.Body>
                    {/* Stats Summary */}
                    <FaceScannerStats scanners={scanners} />

                    <VStack gap={8} style={{ marginTop: "var(--spacing-6)" }}>
                        <ZktecoAccountsSection accounts={accounts} loading={loading} onChanged={fetchAll} />

                        <section>
                            <HStack gap={4} align="center" justify="between" wrap>
                                <VStack gap={1}>
                                    <Heading as="h2" size="xl" weight="bold" color="secondary">Time Watch &amp; legacy scanners</Heading>
                                    <Text size="sm" color="muted">
                                        Each of these scanners has its own credentials. ZKTeco devices are added inside an account above.
                                    </Text>
                                </VStack>
                                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                    <Plus size={18} /> Add scanner
                                </Button>
                            </HStack>

                            {/* Filters */}
                            <div className="mt-[var(--spacing-4)] flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-[var(--spacing-4)] sm:space-y-[var(--spacing-0)]">
                                <div className="w-full sm:w-auto pb-[var(--spacing-2)]">
                                    <Tabs variant="pills" tabs={SCANNER_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
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
                                    <FaceScannerCard key={scanner._id} scanner={scanner} onUpdate={fetchAll} onDelete={fetchAll} />
                                ))}
                            </div>

                            {!loading && filteredScanners.length === 0 && <NoResults />}
                        </section>
                    </VStack>
                </Page.Body>
            </Page>

            {showAddModal && <AddFaceScannerModal show onClose={() => setShowAddModal(false)} onAdd={fetchAll} />}
            <LiveScanMonitorModal isOpen={showLiveMonitor} onClose={() => setShowLiveMonitor(false)} />
        </>
    )
}

export default FaceScannersPage

