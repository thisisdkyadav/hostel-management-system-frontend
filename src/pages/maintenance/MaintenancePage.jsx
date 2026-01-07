import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { useGlobal } from "../../contexts/GlobalProvider"
import { maintenanceApi } from "../../service"
import { MAINTENANCE_FILTER_TABS } from "../../constants/adminConstants"
import ComplaintStats from "../../components/complaints/ComplaintStats"
import ComplaintDetailModal from "../../components/complaints/ComplaintDetailModal"
import ComplaintsHeader from "../../components/headers/ComplaintsHeader"
import ComplaintsFilterPanel from "../../components/complaints/ComplaintsFilterPanel"
import ComplaintsContent from "../../components/complaints/ComplaintsContent"
import PrintComplaints from "../../components/maintenance/PrintComplaints"
import { Tabs } from "@/components/ui"

const MAINTENANCE_STATUS_TABS = [
  { label: "All", value: "all", color: "primary" },
  { label: "Pending", value: "Pending", color: "warning" },
  { label: "In Progress", value: "In Progress", color: "info" },
  { label: "Resolved", value: "Resolved", color: "success" },
]

const MaintenancePage = () => {
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const hostels = ["Admin", "Maintenance Staff"].includes(user?.role) ? hostelList : []
  const categories = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other"]
  const priorities = ["Low", "Medium", "High", "Urgent"]

  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    hostelId: "all",
    searchTerm: "",
    page: 1,
    limit: 10,
  })

  const [showFilters, setShowFilters] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [statsData, setStatsData] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== "page" ? 1 : prev.page }))
  }

  const resetFilters = () => {
    setFilters({ status: "all", priority: "all", category: "all", hostelId: "all", searchTerm: "", page: 1, limit: filters.limit })
  }

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const paginate = (pageNumber) => {
    setFilters((prev) => ({ ...prev, page: pageNumber }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.status !== "all") queryParams.append("status", filters.status)
      if (filters.priority !== "all") queryParams.append("priority", filters.priority)
      if (filters.category !== "all") queryParams.append("category", filters.category)
      if (filters.hostelId !== "all") queryParams.append("hostelId", filters.hostelId)
      if (filters.searchTerm) queryParams.append("search", filters.searchTerm)
      queryParams.append("page", filters.page)
      queryParams.append("limit", filters.limit)

      const response = await maintenanceApi.getComplaints(queryParams.toString())
      setComplaints(response.data || [])
      setTotalItems(response.meta?.total || 0)
      setTotalPages(response.meta?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComplaintStats = async () => {
    try {
      setStatsLoading(true)
      const queryParams = {}
      if (filters.category !== "all") queryParams.category = filters.category
      if (filters.hostelId !== "all") queryParams.hostelId = filters.hostelId
      const queryString = new URLSearchParams(queryParams).toString()
      const response = await maintenanceApi.getStats(queryString)
      setStatsData(response || null)
    } catch (error) {
      console.error("Error fetching complaint stats:", error)
      setStatsData(null)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => fetchComplaints(), 500)
    return () => clearTimeout(delay)
  }, [filters])

  useEffect(() => {
    fetchComplaintStats()
  }, [filters.category, filters.hostelId])

  const styles = {
    container: { padding: "var(--spacing-6) var(--spacing-4)", flex: 1 },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    printButtonWrapper: { marginLeft: "var(--spacing-2)" },
    filterPanel: { marginTop: "var(--spacing-6)", backgroundColor: "var(--color-bg-primary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" },
    filterContainer: { display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--spacing-4)" },
    filterGroup: { width: "100%" },
    filterLabel: { fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" },
    tabScrollContainer: { overflowX: "auto", paddingBottom: "var(--spacing-2)" },
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <ComplaintsHeader showFilters={showFilters} setShowFilters={setShowFilters} viewMode={viewMode} setViewMode={setViewMode} showCraftComplaint={false} setShowCraftComplaint={() => { }}
          userRole={user?.role}
          title="Maintenance Dashboard"
        />
        <div style={styles.printButtonWrapper}>
          <PrintComplaints complaints={complaints} />
        </div>
      </div>

      <ComplaintStats statsData={statsData} loading={statsLoading} />

      {showFilters && (
        <ComplaintsFilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} categories={categories} priorities={priorities} />
      )}

      <div style={styles.filterPanel}>
        <div style={styles.filterContainer} className="filter-responsive">
          <div style={styles.filterGroup}>
            <p style={styles.filterLabel}>Filter by Status:</p>
            <div style={styles.tabScrollContainer}>
              <Tabs tabs={MAINTENANCE_STATUS_TABS} activeTab={filters.status} setActiveTab={(status) => updateFilter("status", status)} />
            </div>
          </div>
          <div style={styles.filterGroup}>
            <p style={styles.filterLabel}>Filter by Category:</p>
            <div style={styles.tabScrollContainer}>
              <Tabs tabs={MAINTENANCE_FILTER_TABS} activeTab={filters.category} setActiveTab={(category) => updateFilter("category", category)} />
            </div>
          </div>
        </div>
      </div>

      <ComplaintsContent loading={loading} complaints={complaints} viewMode={viewMode} filters={filters} totalPages={totalPages} COMPLAINT_FILTER_TABS={[]} updateFilter={updateFilter} onViewDetails={viewComplaintDetails} paginate={paginate} />

      {showDetailModal && selectedComplaint && (
        <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} onComplaintUpdate={fetchComplaints} />
      )}

      <style>{`
        .filter-responsive { flex-direction: column; }
        @media (min-width: 640px) { .filter-responsive { flex-direction: row; align-items: center; } .filter-responsive > div { width: auto; } }
      `}</style>
    </div>
  )
}

export default MaintenancePage
