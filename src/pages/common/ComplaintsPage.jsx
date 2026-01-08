import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { useGlobal } from "../../contexts/GlobalProvider"
import { adminApi } from "../../service"
import { complaintApi } from "../../service"
import { COMPLAINT_FILTER_TABS } from "../../constants/adminConstants"
import ComplaintStats from "../../components/complaints/ComplaintStats"
import ComplaintDetailModal from "../../components/complaints/ComplaintDetailModal"
import ComplaintForm from "../../components/complaints/ComplaintForm"
import ComplaintsHeader from "../../components/headers/ComplaintsHeader"
import ComplaintsFilterPanel from "../../components/complaints/ComplaintsFilterPanel"
import ComplaintsContent from "../../components/complaints/ComplaintsContent"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"

const ComplaintsPage = () => {
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const hostels = ["Admin"].includes(user?.role) ? hostelList : []
  const categories = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other"]

  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    hostelId: "all",
    searchTerm: "",
    feedbackRating: "all",
    satisfactionStatus: "all",
    page: 1,
    limit: 10,
  })

  const [showFilters, setShowFilters] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [showCraftComplaint, setShowCraftComplaint] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [statsData, setStatsData] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

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
      category: "all",
      hostelId: "all",
      searchTerm: "",
      feedbackRating: "all",
      satisfactionStatus: "all",
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
      if (filters.category !== "all") queryParams.append("category", filters.category)
      if (filters.hostelId !== "all") queryParams.append("hostelId", filters.hostelId)
      if (filters.searchTerm) queryParams.append("search", filters.searchTerm)
      if (filters.feedbackRating !== "all") queryParams.append("feedbackRating", filters.feedbackRating)
      if (filters.satisfactionStatus !== "all") queryParams.append("satisfactionStatus", filters.satisfactionStatus)
      queryParams.append("page", filters.page)
      queryParams.append("limit", filters.limit)

      const response = await adminApi.getAllComplaints(queryParams.toString())
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

      // Only add hostelId to stats query if a specific hostel is selected
      if (filters.hostelId !== "all") {
        queryParams.hostelId = filters.hostelId
      }

      const response = await complaintApi.getStats(queryParams)
      setStatsData(response.data || response)
    } catch (error) {
      console.error("Error fetching complaint stats:", error)
      setStatsData(null)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchComplaints()
    }, 500)
    return () => clearTimeout(delay)
  }, [filters])

  useEffect(() => {
    fetchComplaintStats()
  }, [filters.hostelId])

  return (
    <div className="flex-1">
      <ComplaintsHeader showFilters={showFilters} setShowFilters={setShowFilters} viewMode={viewMode} setViewMode={setViewMode} showCraftComplaint={showCraftComplaint} setShowCraftComplaint={setShowCraftComplaint} userRole={user?.role} />

      {/* Main Content with padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <ComplaintStats statsData={statsData} loading={statsLoading} />

        {showFilters && <ComplaintsFilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} categories={categories} />}

        <ComplaintsContent loading={loading} complaints={complaints} viewMode={viewMode} filters={filters} totalPages={totalPages} COMPLAINT_FILTER_TABS={COMPLAINT_FILTER_TABS} updateFilter={updateFilter} onViewDetails={viewComplaintDetails} paginate={paginate} />
      </div>

      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} onComplaintUpdate={fetchComplaints} />}

      {showCraftComplaint && WHO_CAN_CREATE_COMPLAINT.includes(user?.role) && <ComplaintForm isOpen={showCraftComplaint} setIsOpen={setShowCraftComplaint} onSuccess={fetchComplaints} />}
    </div>
  )
}

export default ComplaintsPage
