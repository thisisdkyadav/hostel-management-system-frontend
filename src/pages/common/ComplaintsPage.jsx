import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { useGlobal } from "../../contexts/GlobalProvider"
import { adminApi, complaintApi } from "../../service"
import { COMPLAINT_FILTER_TABS } from "../../constants/adminConstants"
import ComplaintStats from "../../components/complaints/ComplaintStats"
import ComplaintDetailModal from "../../components/complaints/ComplaintDetailModal"
import ComplaintForm from "../../components/complaints/ComplaintForm"
import ComplaintsHeader from "../../components/headers/ComplaintsHeader"
import ComplaintsFilterPanel from "../../components/complaints/ComplaintsFilterPanel"
import ComplaintsContent from "../../components/complaints/ComplaintsContent"
import { WHO_CAN_CREATE_COMPLAINT } from "../../constants/complaintConstants"
import useAuthz from "../../hooks/useAuthz"

const ComplaintsPage = () => {
  const { user } = useAuth()
  const { can, getConstraint } = useAuthz()
  const { hostelList = [] } = useGlobal()
  const constrainedHostelIds = getConstraint("constraint.complaints.scope.hostelIds", [])
  const hostels = useMemo(() => {
    if (!["Admin"].includes(user?.role)) {
      return []
    }

    if (!Array.isArray(constrainedHostelIds) || constrainedHostelIds.length === 0) {
      return hostelList
    }

    const allowedHostelIds = new Set(
      constrainedHostelIds
        .map((hostelId) => (typeof hostelId === "string" ? hostelId.trim() : ""))
        .filter(Boolean)
    )
    return hostelList.filter((hostel) => allowedHostelIds.has(hostel._id))
  }, [constrainedHostelIds, hostelList, user?.role])
  const categories = ["Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other"]
  const canViewComplaints = can("cap.complaints.view")
  const canCreateComplaint =
    can("cap.complaints.create") &&
    WHO_CAN_CREATE_COMPLAINT.includes(user?.role)

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
  const [totalPages, setTotalPages] = useState(1)
  const [statsData, setStatsData] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const complaintFilterTabs = useMemo(() => {
    const statusCounts = {
      all: statsData?.total || 0,
      Pending: statsData?.pending || 0,
      "In Progress": statsData?.inProgress || 0,
      "Forwarded to IDO": statsData?.forwardedToIDO || 0,
      Resolved: statsData?.resolved || 0,
    }

    return COMPLAINT_FILTER_TABS.map((tab) => ({
      ...tab,
      count: statusCounts[tab.value] ?? 0,
    }))
  }, [statsData])

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

  useEffect(() => {
    if (filters.hostelId === "all") return
    const isSelectedHostelAllowed = hostels.some((hostel) => hostel._id === filters.hostelId)
    if (!isSelectedHostelAllowed) {
      setFilters((prev) => ({ ...prev, hostelId: "all", page: 1 }))
    }
  }, [filters.hostelId, hostels])

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const paginate = (pageNumber) => {
    setFilters((prev) => ({ ...prev, page: pageNumber }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const fetchComplaints = async () => {
    if (!canViewComplaints) return
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
      setTotalPages(response.meta?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComplaintStats = async () => {
    if (!canViewComplaints) return
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
    if (!canViewComplaints) return
    const delay = setTimeout(() => {
      fetchComplaints()
    }, 500)
    return () => clearTimeout(delay)
  }, [canViewComplaints, filters])

  useEffect(() => {
    if (!canViewComplaints) return
    fetchComplaintStats()
  }, [canViewComplaints, filters.hostelId])

  if (!canViewComplaints) {
    return (
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger-text)]">
          You do not have permission to view complaints.
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <ComplaintsHeader showFilters={showFilters} setShowFilters={setShowFilters} viewMode={viewMode} setViewMode={setViewMode} showCraftComplaint={showCraftComplaint} setShowCraftComplaint={setShowCraftComplaint} userRole={user?.role} canCreateComplaint={canCreateComplaint} />

      {/* Main Content with padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="hidden sm:block">
          <ComplaintStats statsData={statsData} loading={statsLoading} />
        </div>

        {showFilters && <ComplaintsFilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} hostels={hostels} categories={categories} />}

        <ComplaintsContent loading={loading} complaints={complaints} viewMode={viewMode} filters={filters} totalPages={totalPages} COMPLAINT_FILTER_TABS={complaintFilterTabs} updateFilter={updateFilter} onViewDetails={viewComplaintDetails} paginate={paginate} showFilters={showFilters} />
      </div>

      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} onComplaintUpdate={fetchComplaints} />}

      {showCraftComplaint && canCreateComplaint && <ComplaintForm isOpen={showCraftComplaint} setIsOpen={setShowCraftComplaint} onSuccess={fetchComplaints} />}
    </div>
  )
}

export default ComplaintsPage
