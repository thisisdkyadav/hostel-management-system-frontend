import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { useGlobal } from "../../contexts/GlobalProvider"
import { maintenanceApi } from "../../services/apiService"
import { MAINTENANCE_FILTER_TABS } from "../../constants/adminConstants"
import ComplaintsStatsM from "../../components/maintenance/ComplaintsStatsM"
import ComplaintDetailModal from "../../components/maintenance/ComplaintDetailModal"
import ComplaintsHeader from "../../components/complaints/ComplaintsHeader"
import ComplaintsFilterPanel from "../../components/complaints/ComplaintsFilterPanel"
import ComplaintsContent from "../../components/complaints/ComplaintsContent"
import PrintComplaints from "../../components/maintenance/PrintComplaints"
import FilterTabs from "../../components/common/FilterTabs"

// Define maintenance status filter tabs
const MAINTENANCE_STATUS_TABS = [
  { label: "All", value: "all", color: "[#1360AB]" },
  { label: "Pending", value: "Pending", color: "amber-500" },
  { label: "In Progress", value: "In Progress", color: "blue-500" },
  { label: "Resolved", value: "Resolved", color: "green-500" },
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

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : prev.page,
    }))
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      category: "all",
      hostelId: "all",
      searchTerm: "",
      page: 1,
      limit: filters.limit,
    })
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

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchComplaints()
    }, 500)
    return () => clearTimeout(delay)
  }, [filters])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <div className="flex justify-between items-center">
        <ComplaintsHeader 
          showFilters={showFilters} 
          setShowFilters={setShowFilters} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
          showCraftComplaint={false}
          setShowCraftComplaint={() => {}}
          userRole={user?.role}
          title="Maintenance Dashboard"
        />
        <div className="ml-2">
          <PrintComplaints complaints={complaints} />
        </div>
      </div>

      <ComplaintsStatsM filter={filters.category !== "all" ? filters.category : null} />

      {showFilters && (
        <ComplaintsFilterPanel 
          filters={filters} 
          updateFilter={updateFilter} 
          resetFilters={resetFilters} 
          hostels={hostels} 
          categories={categories} 
          priorities={priorities} 
        />
      )}

      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <p className="text-sm text-gray-500 mb-2">Filter by Status:</p>
            <div className="overflow-x-auto pb-2">
              <FilterTabs tabs={MAINTENANCE_STATUS_TABS} activeTab={filters.status} setActiveTab={(status) => updateFilter("status", status)} />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <p className="text-sm text-gray-500 mb-2">Filter by Category:</p>
            <div className="overflow-x-auto pb-2">
              <FilterTabs tabs={MAINTENANCE_FILTER_TABS} activeTab={filters.category} setActiveTab={(category) => updateFilter("category", category)} />
            </div>
          </div>
        </div>
      </div>

      <ComplaintsContent 
        loading={loading} 
        complaints={complaints} 
        viewMode={viewMode} 
        filters={filters} 
        totalPages={totalPages}
        COMPLAINT_FILTER_TABS={[]}
        updateFilter={updateFilter} 
        onViewDetails={viewComplaintDetails} 
        paginate={paginate} 
      />

      {showDetailModal && selectedComplaint && (
        <ComplaintDetailModal 
          selectedComplaint={selectedComplaint} 
          setShowDetailModal={setShowDetailModal} 
          onUpdate={fetchComplaints}
        />
      )}
    </div>
  )
}

export default MaintenancePage 